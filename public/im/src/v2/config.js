/**
 * Created by henry on 15-12-7.
 */
'use strict';

requirejs.config({
    baseUrl: './src/v2/app',
    paths: {
        view: './app/../view',
        text: '../../../node_modules/requirejs-text/text',
        lib:'../lib',
        swfobject:'../../../node_modules/evercookie-dist-only/js/swfobject-2.2.min',
        promise: '../../../node_modules/es6-promise/dist/es6-promise'
    },
    shim:{
    }
    //,optimize:'none'
});
