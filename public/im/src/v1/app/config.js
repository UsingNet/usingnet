/**
 * Created by henry on 15-12-7.
 */
'use strict';

requirejs.config({
    baseUrl: './src/v1/app',
    paths: {
        app: '../app',
        template: '../template',
        text: '../../../node_modules/requirejs-text/text',
        swfobject:'../../../node_modules/evercookie-dist-only/js/swfobject-2.2.min',
        evercookie:'../../../node_modules/evercookie-dist-only/js/evercookie',
        extend:'../app/extend',
        location:'../app/lib/location',
        lib:'../app/lib'
    },
    shim:{
        evercookie:{
            deps: ['swfobject'],
            exports: 'evercookie'
        },
        location:{
            deps: ['extend']
        }
    }
    , optimize:'none'
});
