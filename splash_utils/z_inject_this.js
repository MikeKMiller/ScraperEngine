// Keep a reference to some native methods, so we use the originals if
// they are overridden by the page
var Json = JSON;
var JSONstringify = JSON.stringify;
var arraySplice = Array.prototype.splice;
var ArrayProto = Array.prototype;
var ObjectProto = Object.prototype;
var NumberProto = Number.prototype;
var StringProto = String.prototype;
var BooleanProto = Boolean.prototype;


// Note: Variables here are not leaked to the global scope because the compiler wraps it in a function

var MAX_DIALOGS = 15;  // Maximum number of dialogs (alert, confirm, prompt) before throwing an exception

var ScrapeConfigPage = function ScrapeConfigPage() {
    var that = this;
    this.mirrorClient = new TreeMirrorClient(document, {
        initialize: function(rootId, children, baseURI){
            that.sendMessage('mutation', ['initialize', rootId, children, baseURI]);
        },
        applyChanged: function(removed, addedOrMoved, attributes, text){
            that.sendMessage('mutation', ['applyChanged', removed, addedOrMoved, attributes, text]);
        }
    });
};

ScrapeConfigPage.prototype.sendMutation = function(){
    this.sendMessage('mutation', arraySplice.call(arguments, 0));
};

ScrapeConfigPage.prototype.sendMessage = function(action, message) {
    var oldAPtoJson = ArrayProto.toJSON;
    var oldOPtoJson = ObjectProto.toJSON;
    var oldNPtoJson = NumberProto.toJSON;
    var oldSPtoJson = StringProto.toJSON;
    var oldBPtoJson = BooleanProto.toJSON;
    delete ArrayProto.toJSON;
    delete ObjectProto.toJSON;
    delete NumberProto.toJSON;
    delete StringProto.toJSON;
    delete BooleanProto.toJSON;

    __scrapeconfigApi.sendMessage(JSONstringify.call(Json, [action, message]));

    if(oldAPtoJson) { ArrayProto.toJSON   = oldAPtoJson; }
    if(oldOPtoJson) { ObjectProto.toJSON  = oldOPtoJson; }
    if(oldNPtoJson) { NumberProto.toJSON  = oldNPtoJson; }
    if(oldSPtoJson) { StringProto.toJSON  = oldSPtoJson; }
    if(oldBPtoJson) { BooleanProto.toJSON = oldBPtoJson; }
};

ScrapeConfigPage.prototype.url = function() {
    return window.location;
};

ScrapeConfigPage.prototype.scrollX = function() {
    return window.scrollX;
};

ScrapeConfigPage.prototype.scrollY = function() {
    return window.scrollY;
};

ScrapeConfigPage.prototype.screenX = function() {
    return window.screenX;
};

ScrapeConfigPage.prototype.screenY = function() {
    return window.screenY;
};

ScrapeConfigPage.prototype.currentState = function() {
    return {
        url: this.url,
        scroll: {
            x: this.scrollX(),
            y: this.scrollY(),
            v: this.screenX(),
            h: this.screenY(),
            mx: window.scrollMaxX,
            my: window.scrollMaxY
        }
    };
};

ScrapeConfigPage.sendEvent = {};

ScrapeConfigPage.sendEvent.keyboard = function(element, data, type){
    var ev = document.createEvent("KeyboardEvent");
    ev.initKeyboardEvent(type, true, true, window, data.ctrlKey, data.altKey, data.shiftKey, data.metaKey, data.keyCode, data.charCode);
    element.dispatchEvent(ev);
};

ScrapeConfigPage.sendEvent.simple = function(element, data, type) {
    var ev = document.createEvent('Event');
    ev.initEvent(type, true, false);
    element.dispatchEvent(ev);
};

function _select_set_value(select, value) {
    for (var i = 0, len = select.options.length; i < len; i++) {
        var option = select.options[ i ];
        if (option.value === value) {
            option.selected = true;
            return;
        }
    }
    select.selectedIndex = -1;
}

ScrapeConfigPage.sendEvent.set= function(element, data, type) {
    var type;
    if(element.tagName === 'SELECT') {
        type = 'change';
        _select_set_value(element, data.value);
    } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        type = 'input';
        element.value = data.value;
    }
    var ev = document.createEvent('Event');
    ev.initEvent(type, true, false);
    element.dispatchEvent(ev);
};

ScrapeConfigPage.sendEvent.focus = function(element, data, type) {
    if(type in element){
        element[type](); // This will trigger the event
    }
};

ScrapeConfigPage.sendEvent.scroll = function(element, data){
    // Scroll events in the body are dispatched on the documentElement, reverse this
    if(element === document.documentElement && element.scrollHeight === document.body.scrollHeight){
        element = document.body;
    }
    // This will trigger the scroll event
    element.scrollTop = data.scrollTop;
    element.scrollLeft = data.scrollLeft;
};

ScrapeConfigPage.sendEvent.unknown = function(element, data, type) {
    console.log('Unknown event category for event ' + type);
};

ScrapeConfigPage.sendEvent.mouse = function(element, data, type) {
    var clientRect = element.getBoundingClientRect();
    var clientX = data.targetX + clientRect.left;
    var clientY = data.targetY + clientRect.top;

    var ev = document.createEvent("MouseEvent");
    ev.initMouseEvent(type, true, true, window, data.detail || 0,
                      clientX, clientY, clientX, clientY,
                      data.ctrlKey, data.altKey, data.shiftKey, data.metaKey, data.button, null);
    element.dispatchEvent(ev);
};

ScrapeConfigPage.prototype.sendEvent = function(data) {
    var element = this.getByNodeId(data.target);
    if (!element) {
        throw new Error("Event target doesn't exist.");
    }
    Object.keys(data.propsBefore || {}).forEach(function(propName){
        element[propName] = data.propsBefore[propName];
    });

    ScrapeConfigPage.sendEvent[data.category].call(this, element, data, data.type);

    Object.keys(data.propsAfter || {}).forEach(function(propName){
        element[propName] = data.propsAfter[propName];
    });
};

ScrapeConfigPage.prototype.getByNodeId = function(nodeId){
    return this.mirrorClient.knownNodes.byId[nodeId];
};

ScrapeConfigPage.prototype.pyGetByNodeId = function(nodeId){
    // Workarround to return QWebElement in python
    var res = this.getByNodeId(nodeId);
    if(res) {
        __scrapeconfigApi.returnElement(res);
    }
};

var incrementDialogCounter = function(){
    if(++incrementDialogCounter.count > MAX_DIALOGS) {
        throw new Error('Not allowed');
    }
};
incrementDialogCounter.count = 0;

window.alert = function(){};

window.prompt = function(){
    incrementDialogCounter();
    return null; // dismiss the prompt (clicking cancel or closing the window)
};
window.confirm = function(){
    incrementDialogCounter();
    return true;
};

if(!('liveScrapeConfigPage' in window)){
    window.liveScrapeConfigPage = new ScrapeConfigPage();
}
