import Ember from 'ember';

export const ICON_CLASSES = {
    action: 'fa fa-file-video-o',
    add: 'structure-list-add fa fa-plus-circle',
    'add-dropdown': 'structure-list-add fa fa-play-circle fa-rotate-90',
    close: 'fa fa-times',
    code: 'fa fa-code',
    click: 'fa fa-hand-pointer-o',
    copy: 'fa fa-copy',
    'data-annotation': 'fa fa-hand-pointer-o',
    date: 'fa fa-calendar',
    'default-add': 'fa fa-check-circle structure-list-publish',
    'default-remove': 'fa fa-times-circle structure-list-discard',
    download: 'fa fa-download',
    publish: 'structure-list-publish fa fa-cloud-upload',
    edit: 'fa fa-pencil',
    error: 'structure-list-error fa fa-exclamation-circle',
    'error-triangle': 'structure-list-error fa fa-exclamation-triangle',
    file: 'fa fa-file',
    geopoint: 'fa fa-map-marker',
    help: 'icon-button-help fa fa-question-circle',
    image: 'fa fa-picture-o',
    input: 'fa fa-pencil-square-o',
    link: 'fa fa-link',
    list: 'fa fa-list',
    navigation: 'fa fa-eye',
    number: 'scrapeconfig-icon scrapeconfig-icon-number',
    options: 'structure-list-details fa fa-cog',
    ok: 'structure-list-publish fa fa-check-circle',
    play: 'structure-list-play fa fa-play-circle',
    playback : 'fa fa-play',
    price: 'fa fa-dollar',
    project: 'fa fa-folder',
    'raw html': 'fa fa-code',
    'regular expression': 'scrapeconfig-icon scrapeconfig-icon-regex',
    record : 'fa fa-video-camera',
    remove: 'structure-list-remove fa fa-minus-circle',
    rollback: 'structure-list-discard fa fa-history',
    'safe html': 'scrapeconfig-icon scrapeconfig-icon-safe-html',
    sample: 'fa fa-file',
    schema: 'fa fa-database',
    spider: 'scrapeconfig-icon scrapeconfig-icon-spider',
    'stop-record' : 'fa fa-stop',
    'stop-playback': 'fa fa-stop',
    structure: 'fa fa-sitemap',
    text: 'scrapeconfig-icon scrapeconfig-icon-text',
    'tool-css': 'fa fa-file-code-o',
    'tool-magic': 'fa fa-magic fa-flip-horizontal',
    'tool-select': 'fa fa-mouse-pointer',
    'tool-add': 'fa fa-plus',
    'tool-remove': 'fa fa-minus',
    'tool-multiple': 'fa fa-th-large',
    url: 'fa fa-globe',
    'url-generated': 'scrapeconfig-icon scrapeconfig-icon-generated-url',
    'url-feed': 'scrapeconfig-icon scrapeconfig-icon-feed-url',
    'vertical-ellipsis': 'fa fa-ellipsis-v',
    'warning-triangle': 'structure-list-warning fa fa-exclamation-triangle'
};

export default Ember.Component.extend({
    attributeBindings: ['tabindex'],
    classNames: ['icon-button'],
    classNameBindings: ['iconClasses', 'disabled', 'hasAction', 'modifyClasses'],
    tagName: 'i',

    bubbles: true,
    disabled: false,
    modifyClasses: '',

    hasAction: Ember.computed.bool('action'),

    beforeClick() {},

    click() {
        this.beforeClick();
        if (this.attrs.action && !this.get('disabled')) {
            this.attrs.action();
            if (!this.get('bubbles')) {
                return false;
            }
        }
    },

    iconClasses: Ember.computed('icon', function() {
        var icon = this.get('icon');
        return ICON_CLASSES[icon] || 'fa';
    })
});
