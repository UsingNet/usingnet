/**
 * Created by jhli on 16-2-20.
 */
define([], function() {
    var $ = {
        isMobile:!!(navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)),
        Browser: (function () {
            var ua = navigator.userAgent;
            var isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]';
            return {
                IE: !!window.attachEvent && !isOpera,
                Opera: isOpera,
                WebKit: ua.indexOf('AppleWebKit/') > -1,
                Gecko: ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1,
                MobileSafari: /Apple.*Mobile/.test(ua)
            }
        })(),

        BrowserFeatures: {
            XPath: !!document.evaluate,

            SelectorsAPI: !!document.querySelector,

            ElementExtensions: (function () {
                var constructor = window.Element || window.HTMLElement;
                return !!(constructor && constructor.prototype);
            })(),
            SpecificElementExtensions: (function () {
                if (typeof window.HTMLDivElement !== 'undefined')
                    return true;

                var div = document.createElement('div'),
                    form = document.createElement('form'),
                    isSupported = false;

                if (div['__proto__'] && (div['__proto__'] !== form['__proto__'])) {
                    isSupported = true;
                }

                div = form = null;

                return isSupported;
            })()
        }
    };
    return $;
});