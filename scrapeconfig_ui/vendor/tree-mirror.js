///<reference path='../src/mutation-summary.ts'/>

var TreeMirror = (function () {
    function TreeMirror(root, delegate) {
        this.root = root;
        this.delegate = delegate;
        this.idMap = {};
    }
    TreeMirror.prototype.initialize = function (rootId, children, baseURI) {
        this.baseURI = baseURI;
        this.idMap[rootId] = this.root;

        for (var i = 0; i < children.length; i++)
            this.deserializeNode(children[i], this.root);
    };

    TreeMirror.prototype.applyChanged = function (removed, addedOrMoved, attributes, text) {
        var _this = this;
        // NOTE: Applying the changes can result in an attempting to add a child
        // to a parent which is presently an ancestor of the parent. This can occur
        // based on random ordering of moves. The way we handle this is to first
        // remove all changed nodes from their parents, then apply.
        addedOrMoved.forEach(function (data) {
            var node = _this.deserializeNode(data);
            var parent = _this.deserializeNode(data.parentNode);
            var previous = _this.deserializeNode(data.previousSibling);
            if (node.parentNode)
                node.parentNode.removeChild(node);
        });

        removed.forEach(function (data) {
            var node = _this.deserializeNode(data);
            if (node.parentNode)
                node.parentNode.removeChild(node);
        });

        addedOrMoved.forEach(function (data) {
            var node = _this.deserializeNode(data);
            var parent = _this.deserializeNode(data.parentNode);
            var previous = _this.deserializeNode(data.previousSibling);
            parent.insertBefore(node, previous ? previous.nextSibling : parent.firstChild);
        });

        attributes.forEach(function (data) {
            var node = _this.deserializeNode(data);
            Object.keys(data.attributes).forEach(function (attrName) {
                var newVal = data.attributes[attrName];
                if (newVal === null) {
                    node.removeAttribute(attrName);
                } else {
                    if (!_this.delegate || !_this.delegate.setAttribute || !_this.delegate.setAttribute(node, attrName, newVal)) {
                        node.setAttribute(attrName, newVal);
                    }
                }
            });
        });

        text.forEach(function (data) {
            var node = _this.deserializeNode(data);
            node.textContent = data.textContent;
        });

        removed.forEach(function (node) {
            delete _this.idMap[node.id];
        });
    };

    TreeMirror.prototype.deserializeNode = function (nodeData, parent) {
        var _this = this;
        if (nodeData === null)
            return null;

        var node = this.idMap[nodeData.id];
        if (node)
            return node;

        var doc = this.root.ownerDocument;
        if (doc === null)
            doc = this.root;

        switch (nodeData.nodeType) {
            case Node.COMMENT_NODE:
                node = doc.createComment(nodeData.textContent);
                break;

            case Node.TEXT_NODE:
                node = doc.createTextNode(nodeData.textContent);
                break;

            case Node.DOCUMENT_TYPE_NODE:
                try {
                    node = doc.implementation.createDocumentType(nodeData.name, nodeData.publicId, nodeData.systemId);
                } catch (e) {
                    // Ignore error from incorrect document type
                }
                break;

            case Node.ELEMENT_NODE:
                if (this.delegate && this.delegate.createElement)
                    node = this.delegate.createElement(nodeData.tagName);
                if (!node)
                    node = doc.createElement(nodeData.tagName);
                node.setAttribute('data-tagid', nodeData.id);

                Object.keys(nodeData.attributes).forEach(function (name) {
                    if (!_this.delegate || !_this.delegate.setAttribute || !_this.delegate.setAttribute(node, name, nodeData.attributes[name])) {
                        node.setAttribute(name, nodeData.attributes[name]);
                    }
                });

                break;
        }

        if (!node) {
            throw new Error("No node with that id.");
        }

        this.idMap[nodeData.id] = node;
        node.nodeid = nodeData.id;

        if (parent)
            parent.appendChild(node);

        if (nodeData.childNodes) {
            for (var i = 0; i < nodeData.childNodes.length; i++)
                this.deserializeNode(nodeData.childNodes[i], node);
        }

        return node;
    };
    return TreeMirror;
})();

var URL_ATTRIBUTES = {
    img_src: true,
    link_href: true,
    input_src: true,
    body_background: true,
    table_background: true,
    td_background: true,
    tr_background: true,
    th_background: true,
    tbody_background: true,
    thead_background: true,
    tfoot_background: true,
    col_background: true,
    colgroup_background: true,
    section_background: true,
    head_profile: true,
    html_manifest: true,
    command_icon: true,
    embed_src: true,
    object_data: true,
    video_poster: true,
    form_action: true,
    iframe_src: true
};
function isUrlAttribute(tagName, attribute) {
    var key = tagName.toLowerCase() + '_' + attribute.toLowerCase();
    return URL_ATTRIBUTES[key] || false;
}

var TreeMirrorClient = (function () {
    function TreeMirrorClient(target, mirror, testingQueries) {
        var _this = this;
        this.target = target;
        this.mirror = mirror;
        this.nextId = 1;
        this.knownNodes = new MutationSummary.NodeIdMap();
        //this.knownNodes = new MutationSummary.NodeMap();

        var rootId = this.serializeNode(target).id;
        var children = [];
        for (var child = target.firstChild; child; child = child.nextSibling)
            children.push(this.serializeNode(child, true));

        this.mirror.initialize(rootId, children, target.baseURI);

        var self = this;

        var queries = [{ all: true }];

        if (testingQueries)
            queries = queries.concat(testingQueries);

        this.mutationSummary = new MutationSummary({
            rootNode: target,
            callback: function (summaries) {
                try {
                    _this.applyChanged(summaries);
                } catch (e) {
                    if (e.message !== 'No node with that id') {
                        throw e;
                    }
                }
            },
            queries: queries
        });
    }
    TreeMirrorClient.prototype.disconnect = function () {
        if (this.mutationSummary) {
            this.mutationSummary.disconnect();
            this.mutationSummary = undefined;
        }
    };

    TreeMirrorClient.prototype.rememberNode = function (node) {
        var id = this.nextId++;
        this.knownNodes.set(node, id);
        return id;
    };

    TreeMirrorClient.prototype.forgetNode = function (node) {
        this.knownNodes.delete(node);
    };

    TreeMirrorClient.prototype.serializeAttribute = function (node, attr, obj) {
        var value = node.getAttribute(attr);
        var tagName = node.tagName;

        if(value === null) {
            obj[attr] = null; // Attribute was removed
            obj['data-scrapeconfig-' + attr] = null;
        } else if(attr === "style"){
            obj[attr] = __scrapeconfigApi.processCss(value, node.baseURI);
            obj['data-scrapeconfig-' + attr] = value;
        } else if (attr === 'srcset' && tagName === 'IMG') {
            var split_attr = value.split(',')
            for (var i=0; i < split_attr.length; i++) {
                split_attr[i] = __scrapeconfigApi.wrapUrl(
                    split_attr[i].trim(),
                    node.baseURI);
            }
            obj[attr] = split_attr.join(', ')
            obj['data-scrapeconfig-' + attr] = value;
        } else if (isUrlAttribute(tagName, attr)){
            obj[attr] = __scrapeconfigApi.wrapUrl(value, node.baseURI);
            obj['data-scrapeconfig-' + attr] = value;
        } else if (tagName === 'A' && attr === 'href') {
            value = node.href;
            if(!value || /^\s*javascript:/i.test(value)){
                obj[attr] = 'javascript:void(0)';
                obj['data-scrapeconfig-' + attr] = value;
            } else {
                obj[attr] = value;
            }
        } else {
            obj[attr] = value;
        }
    };

    TreeMirrorClient.prototype.serializeNode = function (node, recursive) {
        if (node === null)
            return null;

        var id = this.knownNodes.get(node);
        if (id !== undefined) {
            return { id: id };
        }

        var data = {
            nodeType: node.nodeType,
            id: this.rememberNode(node)
        };


        switch (data.nodeType) {
            case Node.DOCUMENT_TYPE_NODE:
                var docType = node;
                data.name = docType.name;
                data.publicId = docType.publicId;
                data.systemId = docType.systemId;
                break;

            case Node.COMMENT_NODE:
            case Node.TEXT_NODE:
                data.textContent = node.textContent;
                if(node.parentNode && node.parentNode.tagName == "STYLE"){
                    data.textContent = __scrapeconfigApi.processCss(data.textContent, node.baseURI);
                }
                break;

            case Node.ELEMENT_NODE:
                var elm = node;
                data.tagName = elm.tagName;
                data.attributes = {};
                for (var i = 0; i < elm.attributes.length; i++) {
                    var attr = elm.attributes[i];
                    this.serializeAttribute(node, attr.name, data.attributes);
                }

                if (recursive && elm.childNodes.length) {
                    data.childNodes = [];

                    for (var child = elm.firstChild; child; child = child.nextSibling)
                        data.childNodes.push(this.serializeNode(child, true));
                }
                break;
        }

        return data;
    };

    TreeMirrorClient.prototype.serializeAddedAndMoved = function (added, reparented, reordered) {
        var _this = this;
        var all = added.concat(reparented).concat(reordered);

        var parentMap = new MutationSummary.NodeMap();

        all.forEach(function (node) {
            var parent = node.parentNode;
            var children = parentMap.get(parent);
            if (!children) {
                children = new MutationSummary.NodeMap();
                parentMap.set(parent, children);
            }

            children.set(node, true);
        });

        var moved = [];

        parentMap.keys().forEach(function (parent) {
            var children = parentMap.get(parent);

            var keys = children.keys();
            while (keys.length) {
                var node = keys[0];
                while (node.previousSibling && children.has(node.previousSibling))
                    node = node.previousSibling;

                while (node && children.has(node)) {
                    var data = _this.serializeNode(node);
                    data.previousSibling = _this.serializeNode(node.previousSibling);
                    data.parentNode = _this.serializeNode(node.parentNode);
                    moved.push(data);
                    children.delete(node);
                    node = node.nextSibling;
                }

                var keys = children.keys();
            }
        });

        return moved;
    };

    TreeMirrorClient.prototype.serializeAttributeChanges = function (attributeChanged) {
        var _this = this;
        var map = new MutationSummary.NodeMap();

        Object.keys(attributeChanged).forEach(function (attrName) {
            (attributeChanged[attrName] || []).forEach(function (element) {
                var record = map.get(element);
                if (!record) {
                    record = _this.serializeNode(element);
                    record.attributes = {};
                    map.set(element, record);
                }

                _this.serializeAttribute(element, attrName, record.attributes);
            });
        });

        return map.keys().map(function (node) {
            return map.get(node);
        });
    };

    TreeMirrorClient.prototype.applyChanged = function (summaries) {
        var _this = this;
        var summary = summaries[0];

        var removed = summary.removed.map(function (node) {
            return _this.serializeNode(node);
        });

        var moved = this.serializeAddedAndMoved(summary.added, summary.reparented, summary.reordered);

        var attributes = this.serializeAttributeChanges(summary.attributeChanged);

        var text = summary.characterDataChanged.map(function (node) {
            var data = _this.serializeNode(node);
            data.textContent = node.textContent;
            return data;
        });

        this.mirror.applyChanged(removed, moved, attributes, text);

        summary.removed.forEach(function (node) {
            _this.forgetNode(node);
        });
    };
    return TreeMirrorClient;
})();
