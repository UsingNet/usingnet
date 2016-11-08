/**
 * Created by henry on 16-1-19.
 */
(function(){
    var isSupportHtml5 = !!window.addEventListener;
    var script = document.createElement('script');
    if (isSupportHtml5) {
        script.src = '//im.usingnet.net/build/v2/app.min.js';
    }else{
        script.src = '//im.usingnet.net/build/v1/app.min.js';
    }
    document.getElementsByTagName('head')[0].appendChild(script);
})();