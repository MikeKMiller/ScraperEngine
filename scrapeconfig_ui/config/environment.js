/* jshint node: true */
var path = require('path'),
    envModule;

module.exports = function(environment) {
    var ENV = {
        modulePrefix: 'scrapeconfig-ui',
        environment: environment,
        baseURL: '/',
        locationType: 'hash',

        contentSecurityPolicy: {
            'default-src': "'none'",
            'script-src': "* 'unsafe-inline' 'unsafe-eval'",
            'style-src': "* 'unsafe-inline'",
            'img-src': "* data:",
            'connect-src': "*",
            'font-src': "*",
            'object-src': "*",
            'media-src': "*",
            'frame-src': "'none'"
        },

        EmberENV: {
            FEATURES: {
                // Here you can enable experimental features on an ember canary build
                // e.g. 'with-controller': true
            }
        },

        APP: {
            // Here you can pass flags/options to your application instance
            // when it is created
            allow_nesting: true
        }
    };
    try {
        envModule = require(path.join(process.cwd(), 'config/environment-' + environment));
    } catch (e) {
        console.log('Config module for "' + environment + '" not found.');
    }
    if (typeof envModule === 'function') {
        ENV = envModule(ENV);
    }

    return ENV;
};
