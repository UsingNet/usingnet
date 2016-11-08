/**
 * Created by henry on 16-2-19.
 */
'use strict';

requirejs.config({
    baseUrl: './src/app',
    paths: {
        app: '../app',
        text: '../../node_modules/requirejs-text/text',
        lib:'../app/lib',
        api:'../app/api',
        template:'../app/template'
    },
    shim:{

    }
    //, optimize:'none'
});