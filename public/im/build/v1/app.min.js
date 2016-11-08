/**
 * @license almond 0.3.2 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/almond/LICENSE
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part, normalizedBaseParts,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name) {
            name = name.split('/');
            lastIndex = name.length - 1;

            // If wanting node ID compatibility, strip .js from end
            // of IDs. Have to do this here, and not in nameToUrl
            // because node allows either .js or non .js to map
            // to same file.
            if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
            }

            // Starts with a '.' so need the baseName
            if (name[0].charAt(0) === '.' && baseParts) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that 'directory' and not name of the baseName's
                //module. For instance, baseName of 'one/two/three', maps to
                //'one/two/three.js', but we want the directory, 'one/two' for
                //this normalization.
                normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                name = normalizedBaseParts.concat(name);
            }

            //start trimDots
            for (i = 0; i < name.length; i++) {
                part = name[i];
                if (part === '.') {
                    name.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    // If at the start, or previous value is still ..,
                    // keep them so that when converted to a path it may
                    // still work when converted to a path, even though
                    // as an ID it is less than ideal. In larger point
                    // releases, may be better to just kick out an error.
                    if (i === 0 || (i === 1 && name[2] === '..') || name[i - 1] === '..') {
                        continue;
                    } else if (i > 0) {
                        name.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
            //end trimDots

            name = name.join('/');
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../../../node_modules/almond/almond", function(){});

/**
 * Created by henry on 15-12-8.
 */
define('lib/class',[],function(){
    return function(){
        var eventListeners = {};

        this.triggerEvent = function(event){
            var self = this;
            var type = event.type;
            event.target = self;
            if(eventListeners[type]){
                eventListeners[type].map(function(callback){
                    callback.call(self, event);
                });
            }
        };

        this.addEventListener = function(type, listener){
            if(!eventListeners[type]){
                eventListeners[type] = [];
            }
            eventListeners[type].push(listener);
            return true;
        };

        this.removeEventListener = function(type, listener){
            if(eventListeners[type]){
                eventListeners[type].remove(listener);
                return true;
            }else{
                return false;
            }
        };

        this.extend = function(subClass){
            subClass.prototype = this;
            return subClass;
        };
    };
});




/**
 * Created by henry on 15-12-13.
 */
define('lib/event',[],function(){
    return function(type){
        if(typeof(Event) == 'undefined'){
            this.prototype = {};
        }else if(Event.constructor){
            this.prototype = Event.constructor();
        }else{
            this.prototype = Event.create(type);
        }
        this.type = type;
    };
});

/*	SWFObject v2.2 <http://code.google.com/p/swfobject/> 
	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/
var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O.ActiveXObject!=D){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?"ActiveX":"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();

define("swfobject", function(){});

/**
 * Created by henry on 15-12-13.
 */
define('lib/mode/websocket-plugin',['swfobject'],function(){
    return {
        init:function(){

            if (window.WEB_SOCKET_FORCE_FLASH) {
                // Keeps going.
            } else if (window.WebSocket) {
                return;
            } else if (window.MozWebSocket) {
                // Firefox.
                window.WebSocket = MozWebSocket;
                return;
            }

            window.WEB_SOCKET_SWF_LOCATION = '/resources/websocket/WebSocketMain.swf';

            var logger;
            if (window.WEB_SOCKET_LOGGER) {
                logger = WEB_SOCKET_LOGGER;
            } else if (window.console && window.console.log && window.console.error) {
                // In some environment, console is defined but console.log or console.error is missing.
                logger = window.console;
            } else {
                logger = {log: function(){ }, error: function(){ }};
            }

            // swfobject.hasFlashPlayerVersion("10.0.0") doesn't work with Gnash.
            if (swfobject.getFlashPlayerVersion().major < 10) {
                logger.error("Flash Player >= 10.0.0 is required.");
                if(confirm('您的Internet Explorer浏览器安装的Flash Player版本过低或未安装Flash Player，无法查看本网页。请使用Chrome浏览器访问，或更新Flash Player。点击“是”前往安装Flash Player，点击“否”关闭此网页。')){
                    location.href="https://get.adobe.com/flashplayer/";
                }else{
                    window.close();
                }
                return;
            }
            if (location.protocol == "file:") {
                logger.error(
                    "WARNING: web-socket-js doesn't work in file:///... URL " +
                    "unless you set Flash Security Settings properly. " +
                    "Open the page via Web server i.e. http://...");
            }

            /**
             * Our own implementation of WebSocket class using Flash.
             * @param {string} url
             * @param {array or string} protocols
             * @param {string} proxyHost
             * @param {int} proxyPort
             * @param {string} headers
             */
            window.WebSocket = function(url, protocols, proxyHost, proxyPort, headers) {
                var self = this;
                self.__id = WebSocket.__nextId++;
                WebSocket.__instances[self.__id] = self;
                self.readyState = WebSocket.CONNECTING;
                self.bufferedAmount = 0;
                self.__events = {};
                if (!protocols) {
                    protocols = [];
                } else if (typeof protocols == "string") {
                    protocols = [protocols];
                }
                // Uses setTimeout() to make sure __createFlash() runs after the caller sets ws.onopen etc.
                // Otherwise, when onopen fires immediately, onopen is called before it is set.
                self.__createTask = setTimeout(function() {
                    //WebSocket.
                    WebSocket.__addTask(function() {
                        self.__createTask = null;
                        WebSocket.__flash.create(
                            self.__id, url, protocols, proxyHost || null, proxyPort || 0, headers || null);
                    });
                }, 0);
            };

            /**
             * Send data to the web socket.
             * @param {string} data  The data to send to the socket.
             * @return {boolean}  True for success, false for failure.
             */
            WebSocket.prototype.send = function(data) {
                if (this.readyState == WebSocket.CONNECTING) {
                    throw "INVALID_STATE_ERR: Web Socket connection has not been established";
                }
                // We use encodeURIComponent() here, because FABridge doesn't work if
                // the argument includes some characters. We don't use escape() here
                // because of this:
                // https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Functions#escape_and_unescape_Functions
                // But it looks decodeURIComponent(encodeURIComponent(s)) doesn't
                // preserve all Unicode characters either e.g. "\uffff" in Firefox.
                // Note by wtritch: Hopefully this will not be necessary using ExternalInterface.  Will require
                // additional testing.
                var result = WebSocket.__flash.send(this.__id, encodeURIComponent(data));
                if (result < 0) { // success
                    return true;
                } else {
                    this.bufferedAmount += result;
                    return false;
                }
            };

            /**
             * Close this web socket gracefully.
             */
            WebSocket.prototype.close = function() {
                if (this.__createTask) {
                    clearTimeout(this.__createTask);
                    this.__createTask = null;
                    this.readyState = WebSocket.CLOSED;
                    return;
                }
                if (this.readyState == WebSocket.CLOSED || this.readyState == WebSocket.CLOSING) {
                    return;
                }
                this.readyState = WebSocket.CLOSING;
                WebSocket.__flash.close(this.__id);
            };

            /**
             * Implementation of {@link <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-registration">DOM 2 EventTarget Interface</a>}
             *
             * @param {string} type
             * @param {function} listener
             * @param {boolean} useCapture
             * @return void
             */
            WebSocket.prototype.addEventListener = function(type, listener, useCapture) {
                if (!(type in this.__events)) {
                    this.__events[type] = [];
                }
                this.__events[type].push(listener);
            };

            /**
             * Implementation of {@link <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-registration">DOM 2 EventTarget Interface</a>}
             *
             * @param {string} type
             * @param {function} listener
             * @param {boolean} useCapture
             * @return void
             */
            WebSocket.prototype.removeEventListener = function(type, listener, useCapture) {
                if (!(type in this.__events)) return;
                var events = this.__events[type];
                for (var i = events.length - 1; i >= 0; --i) {
                    if (events[i] === listener) {
                        events.splice(i, 1);
                        break;
                    }
                }
            };

            /**
             * Implementation of {@link <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-registration">DOM 2 EventTarget Interface</a>}
             *
             * @param {Event} event
             * @return void
             */
            WebSocket.prototype.dispatchEvent = function(event) {
                var events = this.__events[event.type] || [];
                for (var i = 0; i < events.length; ++i) {
                    events[i](event);
                }
                var handler = this["on" + event.type];
                if (handler) handler.apply(this, [event]);
            };

            /**
             * Handles an event from Flash.
             * @param {Object} flashEvent
             */
            WebSocket.prototype.__handleEvent = function(flashEvent) {

                if ("readyState" in flashEvent) {
                    this.readyState = flashEvent.readyState;
                }
                if ("protocol" in flashEvent) {
                    this.protocol = flashEvent.protocol;
                }

                var jsEvent;
                if (flashEvent.type == "open" || flashEvent.type == "error") {
                    jsEvent = this.__createSimpleEvent(flashEvent.type);
                } else if (flashEvent.type == "close") {
                    jsEvent = this.__createSimpleEvent("close");
                    jsEvent.wasClean = flashEvent.wasClean ? true : false;
                    jsEvent.code = flashEvent.code;
                    jsEvent.reason = flashEvent.reason;
                } else if (flashEvent.type == "message") {
                    var data = decodeURIComponent(flashEvent.message);
                    jsEvent = this.__createMessageEvent("message", data);
                } else {
                    throw "unknown event type: " + flashEvent.type;
                }

                this.dispatchEvent(jsEvent);

            };

            WebSocket.prototype.__createSimpleEvent = function(type) {
                if (document.createEvent && window.Event) {
                    var event = document.createEvent("Event");
                    event.initEvent(type, false, false);
                    return event;
                } else {
                    return {type: type, bubbles: false, cancelable: false};
                }
            };

            WebSocket.prototype.__createMessageEvent = function(type, data) {
                if (window.MessageEvent && typeof(MessageEvent) == "function" && !window.opera) {
                    return new MessageEvent("message", {
                        "view": window,
                        "bubbles": false,
                        "cancelable": false,
                        "data": data
                    });
                } else if (document.createEvent && window.MessageEvent && !window.opera) {
                    var event = document.createEvent("MessageEvent");
                    event.initMessageEvent("message", false, false, data, null, null, window, null);
                    return event;
                } else {
                    // Old IE and Opera, the latter one truncates the data parameter after any 0x00 bytes.
                    return {type: type, data: data, bubbles: false, cancelable: false};
                }
            };

            /**
             * Define the WebSocket readyState enumeration.
             */
            WebSocket.CONNECTING = 0;
            WebSocket.OPEN = 1;
            WebSocket.CLOSING = 2;
            WebSocket.CLOSED = 3;

            // Field to check implementation of WebSocket.
            WebSocket.__isFlashImplementation = true;
            WebSocket.__initialized = false;
            WebSocket.__flash = null;
            WebSocket.__instances = {};
            WebSocket.__tasks = [];
            WebSocket.__nextId = 0;

            /**
             * Load a new flash security policy file.
             * @param {string} url
             */
            WebSocket.loadFlashPolicyFile = function(url){
                WebSocket.__addTask(function() {
                    WebSocket.__flash.loadManualPolicyFile(url);
                });
            };

            /**
             * Loads WebSocketMain.swf and creates WebSocketMain object in Flash.
             */
            WebSocket.__initialize = function() {

                if (WebSocket.__initialized) return;
                WebSocket.__initialized = true;

                if (WebSocket.__swfLocation) {
                    // For backword compatibility.
                    window.WEB_SOCKET_SWF_LOCATION = WebSocket.__swfLocation;
                }
                if (!window.WEB_SOCKET_SWF_LOCATION) {
                    logger.error("[WebSocket] set WEB_SOCKET_SWF_LOCATION to location of WebSocketMain.swf");
                    return;
                }
                if (!window.WEB_SOCKET_SUPPRESS_CROSS_DOMAIN_SWF_ERROR &&
                    !WEB_SOCKET_SWF_LOCATION.match(/(^|\/)WebSocketMainInsecure\.swf(\?.*)?$/) &&
                    WEB_SOCKET_SWF_LOCATION.match(/^\w+:\/\/([^\/]+)/)) {
                    var swfHost = RegExp.$1;
                    if (location.host != swfHost) {
                        logger.error(
                            "[WebSocket] You must host HTML and WebSocketMain.swf in the same host " +
                            "('" + location.host + "' != '" + swfHost + "'). " +
                            "See also 'How to host HTML file and SWF file in different domains' section " +
                            "in README.md. If you use WebSocketMainInsecure.swf, you can suppress this message " +
                            "by WEB_SOCKET_SUPPRESS_CROSS_DOMAIN_SWF_ERROR = true;");
                    }
                }
                var container = document.createElement("div");
                container.id = "webSocketContainer";
                // Hides Flash box. We cannot use display: none or visibility: hidden because it prevents
                // Flash from loading at least in IE. So we move it out of the screen at (-100, -100).
                // But this even doesn't work with Flash Lite (e.g. in Droid Incredible). So with Flash
                // Lite, we put it at (0, 0). This shows 1x1 box visible at left-top corner but this is
                // the best we can do as far as we know now.
                container.style.position = "absolute";
                if (WebSocket.__isFlashLite()) {
                    container.style.left = "0px";
                    container.style.top = "0px";
                } else {
                    container.style.left = "-100px";
                    container.style.top = "-100px";
                }
                var holder = document.createElement("div");
                holder.id = "webSocketFlash";
                container.appendChild(holder);
                document.body.appendChild(container);
                // See this article for hasPriority:
                // http://help.adobe.com/en_US/as3/mobile/WS4bebcd66a74275c36cfb8137124318eebc6-7ffd.html
                swfobject.embedSWF(
                    WEB_SOCKET_SWF_LOCATION,
                    "webSocketFlash",
                    "1" /* width */,
                    "1" /* height */,
                    "10.0.0" /* SWF version */,
                    null,
                    null,
                    {hasPriority: true, swliveconnect : true, allowScriptAccess: "always"},
                    null,
                    function(e) {
                        if (!e.success) {
                            logger.error("[WebSocket] swfobject.embedSWF failed");
                        }
                    }
                );

            };

            /**
             * Called by Flash to notify JS that it's fully loaded and ready
             * for communication.
             */
            WebSocket.__onFlashInitialized = function() {
                // We need to set a timeout here to avoid round-trip calls
                // to flash during the initialization process.
                setTimeout(function() {
                    WebSocket.__flash = document.getElementById("webSocketFlash");
                    WebSocket.__flash.setCallerUrl(location.href);
                    WebSocket.__flash.setDebug(!!window.WEB_SOCKET_DEBUG);
                    for (var i = 0; i < WebSocket.__tasks.length; ++i) {
                        WebSocket.__tasks[i]();
                    }
                    WebSocket.__tasks = [];
                }, 0);
            };

            /**
             * Called by Flash to notify WebSockets events are fired.
             */
            WebSocket.__onFlashEvent = function() {
                setTimeout(function() {
                    try {
                        // Gets events using receiveEvents() instead of getting it from event object
                        // of Flash event. This is to make sure to keep message order.
                        // It seems sometimes Flash events don't arrive in the same order as they are sent.
                        var events = WebSocket.__flash.receiveEvents();
                        for (var i = 0; i < events.length; ++i) {
                            WebSocket.__instances[events[i].webSocketId].__handleEvent(events[i]);
                        }
                    } catch (e) {
                        logger.error(e);
                    }
                }, 0);
                return true;
            };

            // Called by Flash.
            WebSocket.__log = function(message) {
                logger.log(decodeURIComponent(message));
            };

            // Called by Flash.
            WebSocket.__error = function(message) {
                logger.error(decodeURIComponent(message));
            };

            WebSocket.__addTask = function(task) {
                if (WebSocket.__flash) {
                    task();
                } else {
                    WebSocket.__tasks.push(task);
                }
            };

            /**
             * Test if the browser is running flash lite.
             * @return {boolean} True if flash lite is running, false otherwise.
             */
            WebSocket.__isFlashLite = function() {
                if (!window.navigator || !window.navigator.mimeTypes) {
                    return false;
                }
                var mimeType = window.navigator.mimeTypes["application/x-shockwave-flash"];
                if (!mimeType || !mimeType.enabledPlugin || !mimeType.enabledPlugin.filename) {
                    return false;
                }
                return mimeType.enabledPlugin.filename.match(/flashlite/i) ? true : false;
            };

            if (!window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION) {
                // NOTE:
                //   This fires immediately if web_socket.js is dynamically loaded after
                //   the document is loaded.
                swfobject.addDomLoadEvent(function() {
                    WebSocket.__initialize();
                });
            }
        }
    }
});
/**
 * Created by henry on 15-12-7.
 */
define('lib/mode/websocket',['../class', '../event', './websocket-plugin'],function(Class, Event, WebSocketPlugin){
    return new Class().extend(function(url){
        WebSocketPlugin.init();
        var self = this;
        var heartBeatPackage = {"action":"heartbeat"};
        var defaultUrl = url || null;

        var connector = null;
        var heartBeatTrigger = null;
        var sendCallbackStore = {};
        var sendDelayStore = [];
        var reconnectTimes = 0;

        var log = function(message){
            if(console && typeof console.log == 'function'){
                console.log("WebSocket Log: ", message);
                var event = new Event("log");
                event.data = message;
                self.triggerEvent(event);
            }
        };

        var clearTimeoutSendCallback = function(){
            var now = (new Date()).getTime();
            for(var i in sendCallbackStore){
                if(sendCallbackStore[i]['timeout'] < now){
                    var event = new Event('timeout');
                    sendCallbackStore[i]['callback'].call(self, null, event);
                }
            }
        };

        this.connect = function(url){
            if(connector){
                return false;
            }

            connector = new WebSocket((url || defaultUrl) + ('&_='+Math.random()));

            connector.addEventListener("open", function(){
                sendCallbackStore = {};
                heartBeatTrigger = setInterval(function(){
                    self.send(heartBeatPackage, function(data, event){
                        if(event.type=='timeout'){
                            self.close(true);
                        }else{
                            reconnectTimes = 0;
                        }
                    },5000);
                    clearTimeoutSendCallback();
                },20000);
                var event = new Event("open");
                self.triggerEvent(event);
                if(sendDelayStore.length){
                    while(sendDelayStore.length){
                        self.send.apply(self, sendDelayStore.shift());
                    }
                }
            });

            connector.addEventListener("close", function(){
                if(heartBeatTrigger){
                    clearInterval(heartBeatTrigger);
                }
                var event = new Event("close");
                event.reconnect = !!connector;
                self.triggerEvent(event);
                if(connector){
                    connector = null;
                    reconnectTimes++;
                    setTimeout(function(){
                        self.connect();
                    },Math.pow(2,reconnectTimes)*1000);
                }
            });

            connector.addEventListener("error", function(event){
                log(event);
            });

            connector.addEventListener("message", function(event) {
                var message = JSON.parse(event.data);
                if(message && message['message_id'] && sendCallbackStore[message['message_id']]){
                    sendCallbackStore[message['message_id']]['callback'].call(self, message, event);
                    delete sendCallbackStore[message['message_id']];
                }
                var subEvent = new Event("message");
                subEvent.data = message;
                self.triggerEvent(subEvent);
            });

            return true;
        };

        this.send = function(obj, callback, timeout){
            var data = Object.clone(obj);
            var message_id = (new Date()).getTime() + Math.random();
            if(callback && typeof(callback) == 'function'){
                sendCallbackStore[message_id] = {
                  'callback': callback,
                  'timeout': (Math.max(timeout,0) || 20000) + ((new Date()).getTime())
                };
            }
            data['message_id'] = message_id;
            if(connector.readyState == WebSocket.OPEN){
                connector.send(JSON.stringify(data));
            }else{
                sendDelayStore.push([obj, callback, timeout]);
            }
            return true;
        };

        this.close = function(reconnect){
            if(typeof reconnect == 'undefined'){
                reconnect = false;
            }
            if(reconnect){
                connector.close();
            }else{
                var needToClose = connector;
                connector = null;
                needToClose.close();
            }
            return true;
        };
    });
});
/**
 * Created by henry on 15-12-10.
 */
define('app/config/app',[],function(){
    return {
        IM_HOST:'im.usingnet.net',
        IM_BASE_URL:'http://im.usingnet.net',
        WEBSOCKET_BASE_URL:'ws://ws.usingnet.net:80/ws',
        TRACK_URL:'http://im.usingnet.net/track/',
        COOKIE_FOREVER: false
    };
});
/**
 * Created by henry on 15-12-10.
 */
define('lib/ajax',[], function() {
    var Ajax = {};
    var jsonpRootKey = '__using_root_key_' + ((new Date()).getTime()).toString() + (parseInt(Math.random() * 10000).toString());
    window[jsonpRootKey] = {};
    Ajax.get = function(url, params, cb) {
        Ajax.send(url, 'GET', params, cb);
    };

    Ajax.post = function(url, params, cb) {
        Ajax.send(url, 'POST', params, cb);
    };

    Ajax.send = function(url, method, params, cb) {
        var xhr = typeof(XMLHttpRequest) != 'undefined' ? (new XMLHttpRequest()) : (new ActiveXObject("Microsoft.XMLHTTP"));
        var body;
        if (params) {
            var bodies = [];
            for (var name in params) {
                bodies.push(name + '=' + encodeURIComponent(params[name]));
            }
            body = bodies.join('&');
        }

        if (method == "GET") {
            xhr.open(method, url + "?" + body, true);
            xhr.send();
        } else {
            xhr.open(method, url, true);
            if (body.length) {
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            }
            xhr.send(body);
        }

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var data = xhr.responseText;
                try {
                    data = JSON.parse(data);
                } catch (exc) {}
                if (cb) {
                    cb(data);
                }
            }
        };
    };

    Ajax.jsonp = function(url, params, callback) {
        var jsonpKey = 'using_json_key_' + ((new Date()).getTime()).toString() + (parseInt(Math.random() * 10000).toString());
        params['callback'] = jsonpRootKey+'.'+jsonpKey;
        if (params) {
            var bodies = [];
            for (var name in params) {
                bodies.push(name + '=' + encodeURIComponent(params[name]));
            }
            url = url + "?" + bodies.join('&');
        }

        var jsonpScript = document.createElement('script');
        jsonpScript.src = url;

        window[jsonpRootKey][jsonpKey] = function(obj) {
            try {
                if (callback && typeof(callback) == 'function') {
                    callback(obj);
                }
            } catch (e) {;}
            delete window[jsonpRootKey][jsonpKey];
            document.body.removeChild(jsonpScript);
        };
        document.body.appendChild(jsonpScript);
    };

    return Ajax;
});

/**
 * @license RequireJS text 2.0.12 Copyright (c) 2010-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/text for details
 */
/*jslint regexp: true */
/*global require, XMLHttpRequest, ActiveXObject,
  define, window, process, Packages,
  java, location, Components, FileUtils */

define('text',['module'], function (module) {
    'use strict';

    var text, fs, Cc, Ci, xpcIsWindows,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = {},
        masterConfig = (module.config && module.config()) || {};

    text = {
        version: '2.0.12',

        strip: function (content) {
            //Strips <?xml ...?> declarations so that external SVG and XML
            //documents can be added to a document without worry. Also, if the string
            //is an HTML document, only the part inside the body tag is returned.
            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            } else {
                content = "";
            }
            return content;
        },

        jsEscape: function (content) {
            return content.replace(/(['\\])/g, '\\$1')
                .replace(/[\f]/g, "\\f")
                .replace(/[\b]/g, "\\b")
                .replace(/[\n]/g, "\\n")
                .replace(/[\t]/g, "\\t")
                .replace(/[\r]/g, "\\r")
                .replace(/[\u2028]/g, "\\u2028")
                .replace(/[\u2029]/g, "\\u2029");
        },

        createXhr: masterConfig.createXhr || function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== "undefined") {
                for (i = 0; i < 3; i += 1) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {}

                    if (xhr) {
                        progIds = [progId];  // so faster next time
                        break;
                    }
                }
            }

            return xhr;
        },

        /**
         * Parses a resource name into its component parts. Resource names
         * look like: module/name.ext!strip, where the !strip part is
         * optional.
         * @param {String} name the resource name
         * @returns {Object} with properties "moduleName", "ext" and "strip"
         * where strip is a boolean.
         */
        parseName: function (name) {
            var modName, ext, temp,
                strip = false,
                index = name.indexOf("."),
                isRelative = name.indexOf('./') === 0 ||
                             name.indexOf('../') === 0;

            if (index !== -1 && (!isRelative || index > 1)) {
                modName = name.substring(0, index);
                ext = name.substring(index + 1, name.length);
            } else {
                modName = name;
            }

            temp = ext || modName;
            index = temp.indexOf("!");
            if (index !== -1) {
                //Pull off the strip arg.
                strip = temp.substring(index + 1) === "strip";
                temp = temp.substring(0, index);
                if (ext) {
                    ext = temp;
                } else {
                    modName = temp;
                }
            }

            return {
                moduleName: modName,
                ext: ext,
                strip: strip
            };
        },

        xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

        /**
         * Is an URL on another domain. Only works for browser use, returns
         * false in non-browser environments. Only used to know if an
         * optimized .js version of a text resource should be loaded
         * instead.
         * @param {String} url
         * @returns Boolean
         */
        useXhr: function (url, protocol, hostname, port) {
            var uProtocol, uHostName, uPort,
                match = text.xdRegExp.exec(url);
            if (!match) {
                return true;
            }
            uProtocol = match[2];
            uHostName = match[3];

            uHostName = uHostName.split(':');
            uPort = uHostName[1];
            uHostName = uHostName[0];

            return (!uProtocol || uProtocol === protocol) &&
                   (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) &&
                   ((!uPort && !uHostName) || uPort === port);
        },

        finishLoad: function (name, strip, content, onLoad) {
            content = strip ? text.strip(content) : content;
            if (masterConfig.isBuild) {
                buildMap[name] = content;
            }
            onLoad(content);
        },

        load: function (name, req, onLoad, config) {
            //Name has format: some.module.filext!strip
            //The strip part is optional.
            //if strip is present, then that means only get the string contents
            //inside a body tag in an HTML string. For XML/SVG content it means
            //removing the <?xml ...?> declarations so the content can be inserted
            //into the current doc without problems.

            // Do not bother with the work if a build and text will
            // not be inlined.
            if (config && config.isBuild && !config.inlineText) {
                onLoad();
                return;
            }

            masterConfig.isBuild = config && config.isBuild;

            var parsed = text.parseName(name),
                nonStripName = parsed.moduleName +
                    (parsed.ext ? '.' + parsed.ext : ''),
                url = req.toUrl(nonStripName),
                useXhr = (masterConfig.useXhr) ||
                         text.useXhr;

            // Do not load if it is an empty: url
            if (url.indexOf('empty:') === 0) {
                onLoad();
                return;
            }

            //Load the text. Use XHR if possible and in a browser.
            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                text.get(url, function (content) {
                    text.finishLoad(name, parsed.strip, content, onLoad);
                }, function (err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            } else {
                //Need to fetch the resource across domains. Assume
                //the resource has been optimized into a JS module. Fetch
                //by the module name + extension, but do not include the
                //!strip part to avoid file system issues.
                req([nonStripName], function (content) {
                    text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                                    parsed.strip, content, onLoad);
                });
            }
        },

        write: function (pluginName, moduleName, write, config) {
            if (buildMap.hasOwnProperty(moduleName)) {
                var content = text.jsEscape(buildMap[moduleName]);
                write.asModule(pluginName + "!" + moduleName,
                               "define(function () { return '" +
                                   content +
                               "';});\n");
            }
        },

        writeFile: function (pluginName, moduleName, req, write, config) {
            var parsed = text.parseName(moduleName),
                extPart = parsed.ext ? '.' + parsed.ext : '',
                nonStripName = parsed.moduleName + extPart,
                //Use a '.js' file name so that it indicates it is a
                //script that can be loaded across domains.
                fileName = req.toUrl(parsed.moduleName + extPart) + '.js';

            //Leverage own load() method to load plugin value, but only
            //write out values that do not have the strip argument,
            //to avoid any potential issues with ! in file names.
            text.load(nonStripName, req, function (value) {
                //Use own write() method to construct full module value.
                //But need to create shell that translates writeFile's
                //write() to the right interface.
                var textWrite = function (contents) {
                    return write(fileName, contents);
                };
                textWrite.asModule = function (moduleName, contents) {
                    return write.asModule(moduleName, fileName, contents);
                };

                text.write(pluginName, nonStripName, textWrite, config);
            }, config);
        }
    };

    if (masterConfig.env === 'node' || (!masterConfig.env &&
            typeof process !== "undefined" &&
            process.versions &&
            !!process.versions.node &&
            !process.versions['node-webkit'])) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');

        text.get = function (url, callback, errback) {
            try {
                var file = fs.readFileSync(url, 'utf8');
                //Remove BOM (Byte Mark Order) from utf8 files if it is there.
                if (file.indexOf('\uFEFF') === 0) {
                    file = file.substring(1);
                }
                callback(file);
            } catch (e) {
                if (errback) {
                    errback(e);
                }
            }
        };
    } else if (masterConfig.env === 'xhr' || (!masterConfig.env &&
            text.createXhr())) {
        text.get = function (url, callback, errback, headers) {
            var xhr = text.createXhr(), header;
            xhr.open('GET', url, true);

            //Allow plugins direct access to xhr headers
            if (headers) {
                for (header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header.toLowerCase(), headers[header]);
                    }
                }
            }

            //Allow overrides specified in config
            if (masterConfig.onXhr) {
                masterConfig.onXhr(xhr, url);
            }

            xhr.onreadystatechange = function (evt) {
                var status, err;
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    status = xhr.status || 0;
                    if (status > 399 && status < 600) {
                        //An http 4xx or 5xx error. Signal an error.
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        if (errback) {
                            errback(err);
                        }
                    } else {
                        callback(xhr.responseText);
                    }

                    if (masterConfig.onXhrComplete) {
                        masterConfig.onXhrComplete(xhr, url);
                    }
                }
            };
            xhr.send(null);
        };
    } else if (masterConfig.env === 'rhino' || (!masterConfig.env &&
            typeof Packages !== 'undefined' && typeof java !== 'undefined')) {
        //Why Java, why is this so awkward?
        text.get = function (url, callback) {
            var stringBuffer, line,
                encoding = "utf-8",
                file = new java.io.File(url),
                lineSeparator = java.lang.System.getProperty("line.separator"),
                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                content = '';
            try {
                stringBuffer = new java.lang.StringBuffer();
                line = input.readLine();

                // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                // http://www.unicode.org/faq/utf_bom.html

                // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                if (line && line.length() && line.charAt(0) === 0xfeff) {
                    // Eat the BOM, since we've already found the encoding on this file,
                    // and we plan to concatenating this buffer with others; the BOM should
                    // only appear at the top of a file.
                    line = line.substring(1);
                }

                if (line !== null) {
                    stringBuffer.append(line);
                }

                while ((line = input.readLine()) !== null) {
                    stringBuffer.append(lineSeparator);
                    stringBuffer.append(line);
                }
                //Make sure we return a JavaScript string and not a Java string.
                content = String(stringBuffer.toString()); //String
            } finally {
                input.close();
            }
            callback(content);
        };
    } else if (masterConfig.env === 'xpconnect' || (!masterConfig.env &&
            typeof Components !== 'undefined' && Components.classes &&
            Components.interfaces)) {
        //Avert your gaze!
        Cc = Components.classes;
        Ci = Components.interfaces;
        Components.utils['import']('resource://gre/modules/FileUtils.jsm');
        xpcIsWindows = ('@mozilla.org/windows-registry-key;1' in Cc);

        text.get = function (url, callback) {
            var inStream, convertStream, fileObj,
                readData = {};

            if (xpcIsWindows) {
                url = url.replace(/\//g, '\\');
            }

            fileObj = new FileUtils.File(url);

            //XPCOM, you so crazy
            try {
                inStream = Cc['@mozilla.org/network/file-input-stream;1']
                           .createInstance(Ci.nsIFileInputStream);
                inStream.init(fileObj, 1, 0, false);

                convertStream = Cc['@mozilla.org/intl/converter-input-stream;1']
                                .createInstance(Ci.nsIConverterInputStream);
                convertStream.init(inStream, "utf-8", inStream.available(),
                Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);

                convertStream.readString(inStream.available(), readData);
                convertStream.close();
                inStream.close();
                callback(readData.value);
            } catch (e) {
                throw new Error((fileObj && fileObj.path || '') + ': ' + e);
            }
        };
    }
    return text;
});


define('text!template/evaluation.html',[],function () { return '<div class="evaluation-header">\n    <div>欢迎对我的服务进行评价：</div>\n    <!--<span>关闭</span>-->\n    <div class="close-evaluation-icon"></div>\n</div>\n<div class="evaluation-body">\n    <div class="evaluation-btn">\n        <input id="evaluationLevel" type="hidden">\n        <!-- <input type="radio" name="evaluate" value="GOOD" style="background: url(\'../image/close.png\') no-repeat center center;">好评\n        <input type="radio" name="evaluate" value="GENERAL">中评\n        <input type="radio" name="evaluate" value="BAD">差评 -->\n\n        <div class="good">\n            <i class="icon icon-good"></i>\n            <span>好评</span>\n        </div>\n        <div class="general">\n            <i class="icon icon-general"></i>\n            <span>中评</span>\n        </div>\n        <div class="bad">\n            <i class="icon icon-bad"></i>\n            <span>差评</span>\n        </div>\n    </div>\n    <textarea id="evaluationContent" placeholder="请填写评价内容（选填）"></textarea>\n    <div>\n        <button class="evaluation-submit" style="background: {$buttonBackground$}">提交</button>\n        <!-- <button class="evaluation-close">关闭</button> -->\n    </div>\n\n</div>\n';});

/**
 * Created by henry on 15-12-12.
 */
define('lib/template',[], function() {
    return function(html, obj) {
        for (var i in obj) {
            html = html.replace(new RegExp("\\{\\$" + i + "\\$\\}", "g"), obj[i]);
        }
        return html;
    };
});

/**
 * Created by jhli on 16-02-17.
 */
define('module/evaluation',['../lib/class', 'text!template/evaluation.html', 'lib/ajax', 'lib/template'], function(Class, html, Ajax, Template) {
    return new Class().extend(function() {
        var me = this;
        var evaluate = document.createElement('<div id="evaluatePanel"></div>');
        // evaluate.id = 'evaluatePanel';
        evaluate.style.height = window.innerHeight || document.documentElement.clientHeight - 48 + 'px';
        evaluate.style.position = 'absolute';
        evaluate.style.top = '48px';
        evaluate.style.width = window.innerWidth || document.documentElement.clientWidth + 'px';
        evaluate.style.bottom = '0';
        evaluate.style.left = '0';
        evaluate.style.right = '0';
        evaluate.style.zIndex = 9999;
        evaluate.style.background = '#FAFAFA';

        evaluate.innerHTML = Template(html, {
            buttonBackground: document.querySelector('.header').style.backgroundColor
        });

        var levels = evaluate.querySelectorAll('.evaluation-btn div');
        var evaluationLevel = evaluate.querySelector('#evaluationLevel');
        var submitButton = evaluate.querySelector('.evaluation-submit');
        var closeEvaluateIcon = evaluate.querySelector('.close-evaluation-icon');

        for (var i = 0; i < levels.length; i++) {
            (function(i) {
                levels[i].addEventListener('click', function() {
                    for (var j = 0; j < levels.length; j++) {
                        levels[j].style.backgroundColor = '#FAFAFA';
                    }
                    evaluationLevel.value = levels[i].className.toUpperCase();
                    levels[i].style.backgroundColor = '#fff';
                });
            })(i);
        }

        submitButton.addEventListener('click', function() {
            Ajax.post('api/evaluation', {
                order_id: document.querySelector('#evaluationOrderIdValue').value,
                level: evaluationLevel.value,
                content: document.querySelector('#evaluationContent').value
            }, function(data) {
                if (data.success) {
                    alert('评价成功！');
                    me.hideDialog();
                } else {
                    alert(data.msg);
                }
            });
        });

        closeEvaluateIcon.addEventListener('click', function() {
            me.hideDialog();
        });


        me.appendTo = function(dom) {
            if (document.querySelector('#evaluatePanel')) {
                me.showDialog();
            } else {
                dom.appendChild(evaluate);
            }
        };

        me.hideDialog = function() {
            var panel = document.querySelector('#evaluatePanel');
            panel.style.display = 'none';
        };

        me.showDialog = function() {
            var panel = document.querySelector('#evaluatePanel');
            panel.style.display = 'block';
        };
    });
});

/**
 * Created by henry on 15-12-13.
 */
define('lib/sizzle',[],function(){
        var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
            expando = "sizcache" + (Math.random() + '').replace('.', ''),
            done = 0,
            toString = Object.prototype.toString,
            hasDuplicate = false,
            baseHasDuplicate = true,
            rBackslash = /\\/g,
            rReturn = /\r\n/g,
            rNonWord = /\W/;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
        [0, 0].sort(function() {
            baseHasDuplicate = false;
            return 0;
        });

        var Sizzle = function( selector, context, results, seed ) {
            results = results || [];
            context = context || document;

            var origContext = context;

            if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
                return [];
            }

            if ( !selector || typeof selector !== "string" ) {
                return results;
            }

            var m, set, checkSet, extra, ret, cur, pop, i,
                prune = true,
                contextXML = Sizzle.isXML( context ),
                parts = [],
                soFar = selector;

            // Reset the position of the chunker regexp (start from head)
            do {
                chunker.exec( "" );
                m = chunker.exec( soFar );

                if ( m ) {
                    soFar = m[3];

                    parts.push( m[1] );

                    if ( m[2] ) {
                        extra = m[3];
                        break;
                    }
                }
            } while ( m );

            if ( parts.length > 1 && origPOS.exec( selector ) ) {

                if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
                    set = posProcess( parts[0] + parts[1], context, seed );

                } else {
                    set = Expr.relative[ parts[0] ] ?
                        [ context ] :
                        Sizzle( parts.shift(), context );

                    while ( parts.length ) {
                        selector = parts.shift();

                        if ( Expr.relative[ selector ] ) {
                            selector += parts.shift();
                        }

                        set = posProcess( selector, set, seed );
                    }
                }

            } else {
                // Take a shortcut and set the context if the root selector is an ID
                // (but not if it'll be faster if the inner selector is an ID)
                if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
                    Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {

                    ret = Sizzle.find( parts.shift(), context, contextXML );
                    context = ret.expr ?
                        Sizzle.filter( ret.expr, ret.set )[0] :
                        ret.set[0];
                }

                if ( context ) {
                    ret = seed ?
                    { expr: parts.pop(), set: makeArray(seed) } :
                        Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );

                    set = ret.expr ?
                        Sizzle.filter( ret.expr, ret.set ) :
                        ret.set;

                    if ( parts.length > 0 ) {
                        checkSet = makeArray( set );

                    } else {
                        prune = false;
                    }

                    while ( parts.length ) {
                        cur = parts.pop();
                        pop = cur;

                        if ( !Expr.relative[ cur ] ) {
                            cur = "";
                        } else {
                            pop = parts.pop();
                        }

                        if ( pop == null ) {
                            pop = context;
                        }

                        Expr.relative[ cur ]( checkSet, pop, contextXML );
                    }

                } else {
                    checkSet = parts = [];
                }
            }

            if ( !checkSet ) {
                checkSet = set;
            }

            if ( !checkSet ) {
                Sizzle.error( cur || selector );
            }

            if ( toString.call(checkSet) === "[object Array]" ) {
                if ( !prune ) {
                    results.push.apply( results, checkSet );

                } else if ( context && context.nodeType === 1 ) {
                    for ( i = 0; checkSet[i] != null; i++ ) {
                        if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
                            results.push( set[i] );
                        }
                    }

                } else {
                    for ( i = 0; checkSet[i] != null; i++ ) {
                        if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
                            results.push( set[i] );
                        }
                    }
                }

            } else {
                makeArray( checkSet, results );
            }

            if ( extra ) {
                Sizzle( extra, origContext, results, seed );
                Sizzle.uniqueSort( results );
            }


            /**Add Listener**/
            for(var i = 0;i<results.length;i++){
                var dom = results[i];
                if(!dom.addEventListener){
                    dom.addEventListener = function(type, callback){
                        return this.attachEvent("on"+type, callback);
                    };
                }
                if(!dom.querySelectorAll){
                    dom.querySelectorAll = function(selectors){
                        return sizzle(selectors, dom);
                    }
                }
                if(!dom.querySelector){
                    dom.querySelector = function(selectors){
                        return sizzle(selectors, dom)[0];
                    }
                }
            }
            /**Add Listener**/
            return results;
        };

        Sizzle.uniqueSort = function( results ) {
            if ( sortOrder ) {
                hasDuplicate = baseHasDuplicate;
                results.sort( sortOrder );

                if ( hasDuplicate ) {
                    for ( var i = 1; i < results.length; i++ ) {
                        if ( results[i] === results[ i - 1 ] ) {
                            results.splice( i--, 1 );
                        }
                    }
                }
            }

            return results;
        };

        Sizzle.matches = function( expr, set ) {
            return Sizzle( expr, null, null, set );
        };

        Sizzle.matchesSelector = function( node, expr ) {
            return Sizzle( expr, null, null, [node] ).length > 0;
        };

        Sizzle.find = function( expr, context, isXML ) {
            var set, i, len, match, type, left;

            if ( !expr ) {
                return [];
            }

            for ( i = 0, len = Expr.order.length; i < len; i++ ) {
                type = Expr.order[i];

                if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
                    left = match[1];
                    match.splice( 1, 1 );

                    if ( left.substr( left.length - 1 ) !== "\\" ) {
                        match[1] = (match[1] || "").replace( rBackslash, "" );
                        set = Expr.find[ type ]( match, context, isXML );

                        if ( set != null ) {
                            expr = expr.replace( Expr.match[ type ], "" );
                            break;
                        }
                    }
                }
            }

            if ( !set ) {
                set = typeof context.getElementsByTagName !== "undefined" ?
                    context.getElementsByTagName( "*" ) :
                    [];
            }

            return { set: set, expr: expr };
        };

        Sizzle.filter = function( expr, set, inplace, not ) {
            var match, anyFound,
                type, found, item, filter, left,
                i, pass,
                old = expr,
                result = [],
                curLoop = set,
                isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );

            while ( expr && set.length ) {
                for ( type in Expr.filter ) {
                    if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
                        filter = Expr.filter[ type ];
                        left = match[1];

                        anyFound = false;

                        match.splice(1,1);

                        if ( left.substr( left.length - 1 ) === "\\" ) {
                            continue;
                        }

                        if ( curLoop === result ) {
                            result = [];
                        }

                        if ( Expr.preFilter[ type ] ) {
                            match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

                            if ( !match ) {
                                anyFound = found = true;

                            } else if ( match === true ) {
                                continue;
                            }
                        }

                        if ( match ) {
                            for ( i = 0; (item = curLoop[i]) != null; i++ ) {
                                if ( item ) {
                                    found = filter( item, match, i, curLoop );
                                    pass = not ^ found;

                                    if ( inplace && found != null ) {
                                        if ( pass ) {
                                            anyFound = true;

                                        } else {
                                            curLoop[i] = false;
                                        }

                                    } else if ( pass ) {
                                        result.push( item );
                                        anyFound = true;
                                    }
                                }
                            }
                        }

                        if ( found !== undefined ) {
                            if ( !inplace ) {
                                curLoop = result;
                            }

                            expr = expr.replace( Expr.match[ type ], "" );

                            if ( !anyFound ) {
                                return [];
                            }

                            break;
                        }
                    }
                }

                // Improper expression
                if ( expr === old ) {
                    if ( anyFound == null ) {
                        Sizzle.error( expr );

                    } else {
                        break;
                    }
                }

                old = expr;
            }

            return curLoop;
        };

        Sizzle.error = function( msg ) {
            throw new Error( "Syntax error, unrecognized expression: " + msg );
        };

        /**
         * Utility function for retreiving the text value of an array of DOM nodes
         * @param {Array|Element} elem
         */
        var getText = Sizzle.getText = function( elem ) {
            var i, node,
                nodeType = elem.nodeType,
                ret = "";

            if ( nodeType ) {
                if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
                    // Use textContent || innerText for elements
                    if ( typeof elem.textContent === 'string' ) {
                        return elem.textContent;
                    } else if ( typeof elem.innerText === 'string' ) {
                        // Replace IE's carriage returns
                        return elem.innerText.replace( rReturn, '' );
                    } else {
                        // Traverse it's children
                        for ( elem = elem.firstChild; elem; elem = elem.nextSibling) {
                            ret += getText( elem );
                        }
                    }
                } else if ( nodeType === 3 || nodeType === 4 ) {
                    return elem.nodeValue;
                }
            } else {

                // If no nodeType, this is expected to be an array
                for ( i = 0; (node = elem[i]); i++ ) {
                    // Do not traverse comment nodes
                    if ( node.nodeType !== 8 ) {
                        ret += getText( node );
                    }
                }
            }
            return ret;
        };

        var Expr = Sizzle.selectors = {
            order: [ "ID", "NAME", "TAG" ],

            match: {
                ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
                ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
                TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
                CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
                POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
                PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
            },

            leftMatch: {},

            attrMap: {
                "class": "className",
                "for": "htmlFor"
            },

            attrHandle: {
                href: function( elem ) {
                    return elem.getAttribute( "href" );
                },
                type: function( elem ) {
                    return elem.getAttribute( "type" );
                }
            },

            relative: {
                "+": function(checkSet, part){
                    var isPartStr = typeof part === "string",
                        isTag = isPartStr && !rNonWord.test( part ),
                        isPartStrNotTag = isPartStr && !isTag;

                    if ( isTag ) {
                        part = part.toLowerCase();
                    }

                    for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
                        if ( (elem = checkSet[i]) ) {
                            while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

                            checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
                            elem || false :
                            elem === part;
                        }
                    }

                    if ( isPartStrNotTag ) {
                        Sizzle.filter( part, checkSet, true );
                    }
                },

                ">": function( checkSet, part ) {
                    var elem,
                        isPartStr = typeof part === "string",
                        i = 0,
                        l = checkSet.length;

                    if ( isPartStr && !rNonWord.test( part ) ) {
                        part = part.toLowerCase();

                        for ( ; i < l; i++ ) {
                            elem = checkSet[i];

                            if ( elem ) {
                                var parent = elem.parentNode;
                                checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
                            }
                        }

                    } else {
                        for ( ; i < l; i++ ) {
                            elem = checkSet[i];

                            if ( elem ) {
                                checkSet[i] = isPartStr ?
                                    elem.parentNode :
                                elem.parentNode === part;
                            }
                        }

                        if ( isPartStr ) {
                            Sizzle.filter( part, checkSet, true );
                        }
                    }
                },

                "": function(checkSet, part, isXML){
                    var nodeCheck,
                        doneName = done++,
                        checkFn = dirCheck;

                    if ( typeof part === "string" && !rNonWord.test( part ) ) {
                        part = part.toLowerCase();
                        nodeCheck = part;
                        checkFn = dirNodeCheck;
                    }

                    checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
                },

                "~": function( checkSet, part, isXML ) {
                    var nodeCheck,
                        doneName = done++,
                        checkFn = dirCheck;

                    if ( typeof part === "string" && !rNonWord.test( part ) ) {
                        part = part.toLowerCase();
                        nodeCheck = part;
                        checkFn = dirNodeCheck;
                    }

                    checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
                }
            },

            find: {
                ID: function( match, context, isXML ) {
                    if ( typeof context.getElementById !== "undefined" && !isXML ) {
                        var m = context.getElementById(match[1]);
                        // Check parentNode to catch when Blackberry 4.6 returns
                        // nodes that are no longer in the document #6963
                        return m && m.parentNode ? [m] : [];
                    }
                },

                NAME: function( match, context ) {
                    if ( typeof context.getElementsByName !== "undefined" ) {
                        var ret = [],
                            results = context.getElementsByName( match[1] );

                        for ( var i = 0, l = results.length; i < l; i++ ) {
                            if ( results[i].getAttribute("name") === match[1] ) {
                                ret.push( results[i] );
                            }
                        }

                        return ret.length === 0 ? null : ret;
                    }
                },

                TAG: function( match, context ) {
                    if ( typeof context.getElementsByTagName !== "undefined" ) {
                        return context.getElementsByTagName( match[1] );
                    }
                }
            },
            preFilter: {
                CLASS: function( match, curLoop, inplace, result, not, isXML ) {
                    match = " " + match[1].replace( rBackslash, "" ) + " ";

                    if ( isXML ) {
                        return match;
                    }

                    for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
                        if ( elem ) {
                            if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
                                if ( !inplace ) {
                                    result.push( elem );
                                }

                            } else if ( inplace ) {
                                curLoop[i] = false;
                            }
                        }
                    }

                    return false;
                },

                ID: function( match ) {
                    return match[1].replace( rBackslash, "" );
                },

                TAG: function( match, curLoop ) {
                    return match[1].replace( rBackslash, "" ).toLowerCase();
                },

                CHILD: function( match ) {
                    if ( match[1] === "nth" ) {
                        if ( !match[2] ) {
                            Sizzle.error( match[0] );
                        }

                        match[2] = match[2].replace(/^\+|\s*/g, '');

                        // parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
                        var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
                            match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
                            !/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

                        // calculate the numbers (first)n+(last) including if they are negative
                        match[2] = (test[1] + (test[2] || 1)) - 0;
                        match[3] = test[3] - 0;
                    }
                    else if ( match[2] ) {
                        Sizzle.error( match[0] );
                    }

                    // TODO: Move to normal caching system
                    match[0] = done++;

                    return match;
                },

                ATTR: function( match, curLoop, inplace, result, not, isXML ) {
                    var name = match[1] = match[1].replace( rBackslash, "" );

                    if ( !isXML && Expr.attrMap[name] ) {
                        match[1] = Expr.attrMap[name];
                    }

                    // Handle if an un-quoted value was used
                    match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );

                    if ( match[2] === "~=" ) {
                        match[4] = " " + match[4] + " ";
                    }

                    return match;
                },

                PSEUDO: function( match, curLoop, inplace, result, not ) {
                    if ( match[1] === "not" ) {
                        // If we're dealing with a complex expression, or a simple one
                        if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
                            match[3] = Sizzle(match[3], null, null, curLoop);

                        } else {
                            var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

                            if ( !inplace ) {
                                result.push.apply( result, ret );
                            }

                            return false;
                        }

                    } else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
                        return true;
                    }

                    return match;
                },

                POS: function( match ) {
                    match.unshift( true );

                    return match;
                }
            },

            filters: {
                enabled: function( elem ) {
                    return elem.disabled === false && elem.type !== "hidden";
                },

                disabled: function( elem ) {
                    return elem.disabled === true;
                },

                checked: function( elem ) {
                    return elem.checked === true;
                },

                selected: function( elem ) {
                    // Accessing this property makes selected-by-default
                    // options in Safari work properly
                    if ( elem.parentNode ) {
                        elem.parentNode.selectedIndex;
                    }

                    return elem.selected === true;
                },

                parent: function( elem ) {
                    return !!elem.firstChild;
                },

                empty: function( elem ) {
                    return !elem.firstChild;
                },

                has: function( elem, i, match ) {
                    return !!Sizzle( match[3], elem ).length;
                },

                header: function( elem ) {
                    return (/h\d/i).test( elem.nodeName );
                },

                text: function( elem ) {
                    var attr = elem.getAttribute( "type" ), type = elem.type;
                    // IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
                    // use getAttribute instead to test this case
                    return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
                },

                radio: function( elem ) {
                    return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
                },

                checkbox: function( elem ) {
                    return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
                },

                file: function( elem ) {
                    return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
                },

                password: function( elem ) {
                    return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
                },

                submit: function( elem ) {
                    var name = elem.nodeName.toLowerCase();
                    return (name === "input" || name === "button") && "submit" === elem.type;
                },

                image: function( elem ) {
                    return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
                },

                reset: function( elem ) {
                    var name = elem.nodeName.toLowerCase();
                    return (name === "input" || name === "button") && "reset" === elem.type;
                },

                button: function( elem ) {
                    var name = elem.nodeName.toLowerCase();
                    return name === "input" && "button" === elem.type || name === "button";
                },

                input: function( elem ) {
                    return (/input|select|textarea|button/i).test( elem.nodeName );
                },

                focus: function( elem ) {
                    return elem === elem.ownerDocument.activeElement;
                }
            },
            setFilters: {
                first: function( elem, i ) {
                    return i === 0;
                },

                last: function( elem, i, match, array ) {
                    return i === array.length - 1;
                },

                even: function( elem, i ) {
                    return i % 2 === 0;
                },

                odd: function( elem, i ) {
                    return i % 2 === 1;
                },

                lt: function( elem, i, match ) {
                    return i < match[3] - 0;
                },

                gt: function( elem, i, match ) {
                    return i > match[3] - 0;
                },

                nth: function( elem, i, match ) {
                    return match[3] - 0 === i;
                },

                eq: function( elem, i, match ) {
                    return match[3] - 0 === i;
                }
            },
            filter: {
                PSEUDO: function( elem, match, i, array ) {
                    var name = match[1],
                        filter = Expr.filters[ name ];

                    if ( filter ) {
                        return filter( elem, i, match, array );

                    } else if ( name === "contains" ) {
                        return (elem.textContent || elem.innerText || getText([ elem ]) || "").indexOf(match[3]) >= 0;

                    } else if ( name === "not" ) {
                        var not = match[3];

                        for ( var j = 0, l = not.length; j < l; j++ ) {
                            if ( not[j] === elem ) {
                                return false;
                            }
                        }

                        return true;

                    } else {
                        Sizzle.error( name );
                    }
                },

                CHILD: function( elem, match ) {
                    var first, last,
                        doneName, parent, cache,
                        count, diff,
                        type = match[1],
                        node = elem;

                    switch ( type ) {
                        case "only":
                        case "first":
                            while ( (node = node.previousSibling) ) {
                                if ( node.nodeType === 1 ) {
                                    return false;
                                }
                            }

                            if ( type === "first" ) {
                                return true;
                            }

                            node = elem;

                        /* falls through */
                        case "last":
                            while ( (node = node.nextSibling) ) {
                                if ( node.nodeType === 1 ) {
                                    return false;
                                }
                            }

                            return true;

                        case "nth":
                            first = match[2];
                            last = match[3];

                            if ( first === 1 && last === 0 ) {
                                return true;
                            }

                            doneName = match[0];
                            parent = elem.parentNode;

                            if ( parent && (parent[ expando ] !== doneName || !elem.nodeIndex) ) {
                                count = 0;

                                for ( node = parent.firstChild; node; node = node.nextSibling ) {
                                    if ( node.nodeType === 1 ) {
                                        node.nodeIndex = ++count;
                                    }
                                }

                                parent[ expando ] = doneName;
                            }

                            diff = elem.nodeIndex - last;

                            if ( first === 0 ) {
                                return diff === 0;

                            } else {
                                return ( diff % first === 0 && diff / first >= 0 );
                            }
                    }
                },

                ID: function( elem, match ) {
                    return elem.nodeType === 1 && elem.getAttribute("id") === match;
                },

                TAG: function( elem, match ) {
                    return (match === "*" && elem.nodeType === 1) || !!elem.nodeName && elem.nodeName.toLowerCase() === match;
                },

                CLASS: function( elem, match ) {
                    return (" " + (elem.className || elem.getAttribute("class")) + " ")
                            .indexOf( match ) > -1;
                },

                ATTR: function( elem, match ) {
                    var name = match[1],
                        result = Sizzle.attr ?
                            Sizzle.attr( elem, name ) :
                            Expr.attrHandle[ name ] ?
                                Expr.attrHandle[ name ]( elem ) :
                                elem[ name ] != null ?
                                    elem[ name ] :
                                    elem.getAttribute( name ),
                        value = result + "",
                        type = match[2],
                        check = match[4];

                    return result == null ?
                    type === "!=" :
                        !type && Sizzle.attr ?
                        result != null :
                            type === "=" ?
                            value === check :
                                type === "*=" ?
                                value.indexOf(check) >= 0 :
                                    type === "~=" ?
                                    (" " + value + " ").indexOf(check) >= 0 :
                                        !check ?
                                        value && result !== false :
                                            type === "!=" ?
                                            value !== check :
                                                type === "^=" ?
                                                value.indexOf(check) === 0 :
                                                    type === "$=" ?
                                                    value.substr(value.length - check.length) === check :
                                                        type === "|=" ?
                                                        value === check || value.substr(0, check.length + 1) === check + "-" :
                                                            false;
                },

                POS: function( elem, match, i, array ) {
                    var name = match[2],
                        filter = Expr.setFilters[ name ];

                    if ( filter ) {
                        return filter( elem, i, match, array );
                    }
                }
            }
        };

        var origPOS = Expr.match.POS,
            fescape = function(all, num){
                return "\\" + (num - 0 + 1);
            };

        for ( var type in Expr.match ) {
            Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
            Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
        }
// Expose origPOS
// "global" as in regardless of relation to brackets/parens
        Expr.match.globalPOS = origPOS;

        var makeArray = function( array, results ) {
            array = Array.prototype.slice.call( array, 0 );

            if ( results ) {
                results.push.apply( results, array );
                return results;
            }

            return array;
        };

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
        try {
            Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
        } catch( e ) {
            makeArray = function( array, results ) {
                var i = 0,
                    ret = results || [];

                if ( toString.call(array) === "[object Array]" ) {
                    Array.prototype.push.apply( ret, array );

                } else {
                    if ( typeof array.length === "number" ) {
                        for ( var l = array.length; i < l; i++ ) {
                            ret.push( array[i] );
                        }

                    } else {
                        for ( ; array[i]; i++ ) {
                            ret.push( array[i] );
                        }
                    }
                }

                return ret;
            };
        }

        var sortOrder, siblingCheck;

        if ( document.documentElement.compareDocumentPosition ) {
            sortOrder = function( a, b ) {
                if ( a === b ) {
                    hasDuplicate = true;
                    return 0;
                }

                if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
                    return a.compareDocumentPosition ? -1 : 1;
                }

                return a.compareDocumentPosition(b) & 4 ? -1 : 1;
            };

        } else {
            sortOrder = function( a, b ) {
                // The nodes are identical, we can exit early
                if ( a === b ) {
                    hasDuplicate = true;
                    return 0;

                    // Fallback to using sourceIndex (in IE) if it's available on both nodes
                } else if ( a.sourceIndex && b.sourceIndex ) {
                    return a.sourceIndex - b.sourceIndex;
                }

                var al, bl,
                    ap = [],
                    bp = [],
                    aup = a.parentNode,
                    bup = b.parentNode,
                    cur = aup;

                // If the nodes are siblings (or identical) we can do a quick check
                if ( aup === bup ) {
                    return siblingCheck( a, b );

                    // If no parents were found then the nodes are disconnected
                } else if ( !aup ) {
                    return -1;

                } else if ( !bup ) {
                    return 1;
                }

                // Otherwise they're somewhere else in the tree so we need
                // to build up a full list of the parentNodes for comparison
                while ( cur ) {
                    ap.unshift( cur );
                    cur = cur.parentNode;
                }

                cur = bup;

                while ( cur ) {
                    bp.unshift( cur );
                    cur = cur.parentNode;
                }

                al = ap.length;
                bl = bp.length;

                // Start walking down the tree looking for a discrepancy
                for ( var i = 0; i < al && i < bl; i++ ) {
                    if ( ap[i] !== bp[i] ) {
                        return siblingCheck( ap[i], bp[i] );
                    }
                }

                // We ended someplace up the tree so do a sibling check
                return i === al ?
                    siblingCheck( a, bp[i], -1 ) :
                    siblingCheck( ap[i], b, 1 );
            };

            siblingCheck = function( a, b, ret ) {
                if ( a === b ) {
                    return ret;
                }

                var cur = a.nextSibling;

                while ( cur ) {
                    if ( cur === b ) {
                        return -1;
                    }

                    cur = cur.nextSibling;
                }

                return 1;
            };
        }

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
        (function(){
            // We're going to inject a fake input element with a specified name
            var form = document.createElement("div"),
                id = "script" + (new Date()).getTime(),
                root = document.documentElement;

            form.innerHTML = "<a name='" + id + "'/>";

            // Inject it into the root element, check its status, and remove it quickly
            root.insertBefore( form, root.firstChild );

            // The workaround has to do additional checks after a getElementById
            // Which slows things down for other browsers (hence the branching)
            if ( document.getElementById( id ) ) {
                Expr.find.ID = function( match, context, isXML ) {
                    if ( typeof context.getElementById !== "undefined" && !isXML ) {
                        var m = context.getElementById(match[1]);

                        return m ?
                            m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
                                [m] :
                                undefined :
                            [];
                    }
                };

                Expr.filter.ID = function( elem, match ) {
                    var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

                    return elem.nodeType === 1 && node && node.nodeValue === match;
                };
            }

            root.removeChild( form );

            // release memory in IE
            root = form = null;
        })();

        (function(){
            // Check to see if the browser returns only elements
            // when doing getElementsByTagName("*")

            // Create a fake element
            var div = document.createElement("div");
            div.appendChild( document.createComment("") );

            // Make sure no comments are found
            if ( div.getElementsByTagName("*").length > 0 ) {
                Expr.find.TAG = function( match, context ) {
                    var results = context.getElementsByTagName( match[1] );

                    // Filter out possible comments
                    if ( match[1] === "*" ) {
                        var tmp = [];

                        for ( var i = 0; results[i]; i++ ) {
                            if ( results[i].nodeType === 1 ) {
                                tmp.push( results[i] );
                            }
                        }

                        results = tmp;
                    }

                    return results;
                };
            }

            // Check to see if an attribute returns normalized href attributes
            div.innerHTML = "<a href='#'></a>";

            if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
                div.firstChild.getAttribute("href") !== "#" ) {

                Expr.attrHandle.href = function( elem ) {
                    return elem.getAttribute( "href", 2 );
                };
            }

            // release memory in IE
            div = null;
        })();

        if ( document.querySelectorAll ) {
            (function(){
                var oldSizzle = Sizzle,
                    div = document.createElement("div"),
                    id = "__sizzle__";

                div.innerHTML = "<p class='TEST'></p>";

                // Safari can't handle uppercase or unicode characters when
                // in quirks mode.
                if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
                    return;
                }

                Sizzle = function( query, context, extra, seed ) {
                    context = context || document;

                    // Only use querySelectorAll on non-XML documents
                    // (ID selectors don't work in non-HTML documents)
                    if ( !seed && !Sizzle.isXML(context) ) {
                        // See if we find a selector to speed up
                        var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query );

                        if ( match && (context.nodeType === 1 || context.nodeType === 9) ) {
                            // Speed-up: Sizzle("TAG")
                            if ( match[1] ) {
                                return makeArray( context.getElementsByTagName( query ), extra );

                                // Speed-up: Sizzle(".CLASS")
                            } else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
                                return makeArray( context.getElementsByClassName( match[2] ), extra );
                            }
                        }

                        if ( context.nodeType === 9 ) {
                            // Speed-up: Sizzle("body")
                            // The body element only exists once, optimize finding it
                            if ( query === "body" && context.body ) {
                                return makeArray( [ context.body ], extra );

                                // Speed-up: Sizzle("#ID")
                            } else if ( match && match[3] ) {
                                var elem = context.getElementById( match[3] );

                                // Check parentNode to catch when Blackberry 4.6 returns
                                // nodes that are no longer in the document #6963
                                if ( elem && elem.parentNode ) {
                                    // Handle the case where IE and Opera return items
                                    // by name instead of ID
                                    if ( elem.id === match[3] ) {
                                        return makeArray( [ elem ], extra );
                                    }

                                } else {
                                    return makeArray( [], extra );
                                }
                            }

                            try {
                                return makeArray( context.querySelectorAll(query), extra );
                            } catch(qsaError) {}

                            // qSA works strangely on Element-rooted queries
                            // We can work around this by specifying an extra ID on the root
                            // and working up from there (Thanks to Andrew Dupont for the technique)
                            // IE 8 doesn't work on object elements
                        } else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
                            var oldContext = context,
                                old = context.getAttribute( "id" ),
                                nid = old || id,
                                hasParent = context.parentNode,
                                relativeHierarchySelector = /^\s*[+~]/.test( query );

                            if ( !old ) {
                                context.setAttribute( "id", nid );
                            } else {
                                nid = nid.replace( /'/g, "\\$&" );
                            }
                            if ( relativeHierarchySelector && hasParent ) {
                                context = context.parentNode;
                            }

                            try {
                                if ( !relativeHierarchySelector || hasParent ) {
                                    return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra );
                                }

                            } catch(pseudoError) {
                            } finally {
                                if ( !old ) {
                                    oldContext.removeAttribute( "id" );
                                }
                            }
                        }
                    }

                    return oldSizzle(query, context, extra, seed);
                };

                for ( var prop in oldSizzle ) {
                    Sizzle[ prop ] = oldSizzle[ prop ];
                }

                // release memory in IE
                div = null;
            })();
        }

        (function(){
            var html = document.documentElement,
                matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;

            if ( matches ) {
                // Check to see if it's possible to do matchesSelector
                // on a disconnected node (IE 9 fails this)
                var disconnectedMatch = !matches.call( document.createElement( "div" ), "div" ),
                    pseudoWorks = false;

                try {
                    // This should fail with an exception
                    // Gecko does not error, returns false instead
                    matches.call( document.documentElement, "[test!='']:sizzle" );

                } catch( pseudoError ) {
                    pseudoWorks = true;
                }

                Sizzle.matchesSelector = function( node, expr ) {
                    // Make sure that attribute selectors are quoted
                    expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

                    if ( !Sizzle.isXML( node ) ) {
                        try {
                            if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) {
                                var ret = matches.call( node, expr );

                                // IE 9's matchesSelector returns false on disconnected nodes
                                if ( ret || !disconnectedMatch ||
                                        // As well, disconnected nodes are said to be in a document
                                        // fragment in IE 9, so check for that
                                    node.document && node.document.nodeType !== 11 ) {
                                    return ret;
                                }
                            }
                        } catch(e) {}
                    }

                    return Sizzle(expr, null, null, [node]).length > 0;
                };
            }
        })();

        (function(){
            var div = document.createElement("div");

            div.innerHTML = "<div class='test e'></div><div class='test'></div>";

            // Opera can't find a second classname (in 9.6)
            // Also, make sure that getElementsByClassName actually exists
            if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
                return;
            }

            // Safari caches class attributes, doesn't catch changes (in 3.2)
            div.lastChild.className = "e";

            if ( div.getElementsByClassName("e").length === 1 ) {
                return;
            }

            Expr.order.splice(1, 0, "CLASS");
            Expr.find.CLASS = function( match, context, isXML ) {
                if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
                    return context.getElementsByClassName(match[1]);
                }
            };

            // release memory in IE
            div = null;
        })();

        function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
            for ( var i = 0, l = checkSet.length; i < l; i++ ) {
                var elem = checkSet[i];

                if ( elem ) {
                    var match = false;

                    elem = elem[dir];

                    while ( elem ) {
                        if ( elem[ expando ] === doneName ) {
                            match = checkSet[elem.sizset];
                            break;
                        }

                        if ( elem.nodeType === 1 && !isXML ){
                            elem[ expando ] = doneName;
                            elem.sizset = i;
                        }

                        if ( elem.nodeName.toLowerCase() === cur ) {
                            match = elem;
                            break;
                        }

                        elem = elem[dir];
                    }

                    checkSet[i] = match;
                }
            }
        }

        function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
            for ( var i = 0, l = checkSet.length; i < l; i++ ) {
                var elem = checkSet[i];

                if ( elem ) {
                    var match = false;

                    elem = elem[dir];

                    while ( elem ) {
                        if ( elem[ expando ] === doneName ) {
                            match = checkSet[elem.sizset];
                            break;
                        }

                        if ( elem.nodeType === 1 ) {
                            if ( !isXML ) {
                                elem[ expando ] = doneName;
                                elem.sizset = i;
                            }

                            if ( typeof cur !== "string" ) {
                                if ( elem === cur ) {
                                    match = true;
                                    break;
                                }

                            } else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
                                match = elem;
                                break;
                            }
                        }

                        elem = elem[dir];
                    }

                    checkSet[i] = match;
                }
            }
        }

        if ( document.documentElement.contains ) {
            Sizzle.contains = function( a, b ) {
                return a !== b && (a.contains ? a.contains(b) : true);
            };

        } else if ( document.documentElement.compareDocumentPosition ) {
            Sizzle.contains = function( a, b ) {
                return !!(a.compareDocumentPosition(b) & 16);
            };

        } else {
            Sizzle.contains = function() {
                return false;
            };
        }

        Sizzle.isXML = function( elem ) {
            // documentElement is verified for cases where it doesn't yet exist
            // (such as loading iframes in IE - #4833)
            var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

            return documentElement ? documentElement.nodeName !== "HTML" : false;
        };

        var posProcess = function( selector, context, seed ) {
            var match,
                tmpSet = [],
                later = "",
                root = context.nodeType ? [context] : context;

            // Position selectors must be done after the filter
            // And so must :not(positional) so we move all PSEUDOs to the end
            while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
                later += match[0];
                selector = selector.replace( Expr.match.PSEUDO, "" );
            }

            selector = Expr.relative[selector] ? selector + "*" : selector;

            for ( var i = 0, l = root.length; i < l; i++ ) {
                Sizzle( selector, root[i], tmpSet, seed );
            }

            return Sizzle.filter( later, tmpSet );
        };

// EXPOSE

        return Sizzle;
});
/**
 * Created by henry on 15-12-7.
 */
define('lib/extend',['./sizzle'],function(sizzle){
    Array.prototype.remove = function(b) {
        var a = this.indexOf(b);
        if (a >= 0) {
            this.splice(a, 1);
            return true;
        }
        return false;
    };

    Array.prototype.each = function(callback){
        for(var i = 0;i<this.length;i++){
            callback(this[i], i);
        }
    };

    if(!Array.prototype.filter) {
        Array.prototype.filter = function (filter) {
            var newArray = [];
            this.each(function (item, index) {
                if (filter(item, index)) {
                    newArray.push(item);
                }
            });
            return newArray;
        }
    }

    if(!Array.prototype.map){
        Array.prototype.map = function(map){
            var newArray = [];
            this.each(function(item, index){
                newArray.push(map(item, index));
            });
            return newArray;
        }
    }

    if(!Array.prototype.indexOf){
        Array.prototype.indexOf = function(item){
            for(var i = 0;i<this.length;i++){
                if(item == this[i]){
                    return i;
                }
            }
            return -1;
        }
    }

    Array.prototype.has = function(b){
        return this.indexOf(b)>=0;
    };


    Object.clone = function(obj) {
        if ("object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    };

    if (!document.querySelectorAll) {
        if(typeof(document.__createElement) == 'undefined'){
            document.__createElement = document.createElement;
            document.createElement = function(type){
                var dom = document.__createElement(type);
                if(!dom.addEventListener){
                    dom.addEventListener = function(type, callback){
                        return this.attachEvent("on"+type, callback);
                    };
                }
                if(!dom.querySelectorAll){
                    dom.querySelectorAll = function(selectors){
                        return sizzle(selectors, dom);
                    }
                }
                if(!dom.querySelector){
                    dom.querySelector = function(selectors){
                        return sizzle(selectors, dom)[0];
                    }
                }
                return dom;
            };
        }

        document.querySelectorAll = function (selectors) {
            return sizzle(selectors, document);
        };
    }

    if (!document.querySelector) {
        document.querySelector = function (selectors) {
            var elements = document.querySelectorAll(selectors);
            return (elements.length) ? elements[0] : null;
        };
    }


    if(typeof(HTMLInputElement) != 'undefined' && HTMLInputElement && !HTMLInputElement.prototype.addEventListener){
        HTMLPhraseElement.prototype.addEventListener = HTMLButtonElement.prototype.addEventListener = HTMLSpanElement.prototype.addEventListener = HTMLImageElement.prototype.addEventListener = HTMLDivElement.prototype.addEventListener = HTMLTextAreaElement.prototype.addEventListener = HTMLIFrameElement.prototype.addEventListener = HTMLInputElement.prototype.addEventListener = HTMLBodyElement.prototype.addEventListener = function(type, callback){
            return this.attachEvent("on"+type, callback);
        };
    }

    if(!window.JSON) {
        window.JSON = {
            parse: function (data) {
                return ( new Function("return " + data) )();
            },
            stringify: function (value) {
                var response = 'null';
                switch(typeof value){
                    case 'object':
                        if( value instanceof Array){
                            var pieces = [];
                            for(var i = 0;i<value.length;i++){
                                pieces.push(window.JSON.stringify(value[i]));
                            }
                            response = '['+pieces.join(',')+']';
                        }else{
                            var pieces = [];
                            for(var i in value){
                                pieces.push('"'+i.replace(/'/g,'\\\'').replace(/"/g,'\\\"')+'":'+window.JSON.stringify(value[i]));
                            }
                            response = '{'+pieces.join(',')+'}';
                        }
                        break;
                    case 'number':
                        response = isNaN(value)?null:value.toString();
                        break;
                    case 'string':
                        response = '"'+value.replace(/'/g,'\\\'').replace(/"/g,'\\\"')+'"';
                        break;
                }
                return response;
            }
        };
    }
});
/**
 * Created by henry on 16-1-18.
 */
define('lib/cross_domain',['lib/extend'],function(){

    // A few vars used in non-awesome browsers.

    var receive_interval_id,
        send_interval_id,

        targets = [],
        message_queue = {},

    // A var used in awesome browsers.
        rm_callback,

    // A few convenient shortcuts.
        window = this,
        FALSE = !1,

    // Reused internal strings.
        postMessage = 'postMessage',
        addEventListener = 'addEventListener',

        p_receiveMessage,

        $ = {},
    // I couldn't get window.postMessage to actually work in Opera 9.64!
        has_postMessage = !navigator.userAgent.match(/MSIE\s(6|7)/);

    // Method: jQuery.postMessage
    //
    // This method will call window.postMessage if available, setting the
    // targetOrigin parameter to the base of the target_url parameter for maximum
    // security in browsers that support it. If window.postMessage is not available,
    // the target window's location.hash will be used to pass the message. If an
    // object is passed as the message param, it will be serialized into a string
    // using the jQuery.param method.
    //
    // Usage:
    //
    // > jQuery.postMessage( message, target_url [, target ] );
    //
    // Arguments:
    //
    //  message - (String) A message to be passed to the other frame.
    //  message - (Object) An object to be serialized into a params string, using
    //    the jQuery.param method.
    //  target_url - (String) The URL of the other frame this window is
    //    attempting to communicate with. This must be the exact URL (including
    //    any query string) of the other window for this script to work in
    //    browsers that don't support window.postMessage.
    //  target - (Object) A reference to the other frame this window is
    //    attempting to communicate with. If omitted, defaults to `parent`.
    //
    // Returns:
    //
    //  Nothing.

    $[postMessage] = function( message, target_origin, target, delay ) {
        if ( !target_origin ) { return; }

        // Default to parent if unspecified.
        target = target || parent;

        if ( has_postMessage ) {
            // The browser supports window.postMessage, so call it with a targetOrigin
            // set appropriately, based on the target_url parameter.
            target[postMessage]( JSON.stringify(message), target_origin );

        } else {

            message = JSON.stringify(message);
            // The browser does not support window.postMessage, so set the location
            // of the target to target_url#message. A bit ugly, but it works! A cache
            // bust parameter is added to ensure that repeat messages trigger the
            // callback.
            var index = -1;
            for(var j=0, k=targets.length; j<k; j++) {
                if(targets[j] == target) {
                    index = j;
                    break;
                }
            }
            if(index === -1) {
                index = targets.length;
                targets.push(target);
            }

            if(!message_queue[index]) {
                message_queue[index] = [];
            }
            message_queue[index].push({source: location.href, message: message});

            send_interval_id && clearInterval( send_interval_id );
            send_interval_id = null;

            send_interval_id = setInterval(function(){
                for(var index in message_queue) {
                    targets[index].name = JSON.stringify(message_queue[index]);
                }
                // reset
                targets = [];
                message_queue = {};
            }, delay );
        }
    };

    // Method: jQuery.receiveMessage
    //
    // Register a single callback for either a window.postMessage call, if
    // supported, or if unsupported, for any change in the current window
    // location.hash. If window.postMessage is supported and source_origin is
    // specified, the source window will be checked against this for maximum
    // security. If window.postMessage is unsupported, a polling loop will be
    // started to watch for changes to the location.hash.
    //
    // Note that for simplicity's sake, only a single callback can be registered
    // at one time. Passing no params will unbind this event (or stop the polling
    // loop), and calling this method a second time with another callback will
    // unbind the event (or stop the polling loop) first, before binding the new
    // callback.
    //
    // Also note that if window.postMessage is available, the optional
    // source_origin param will be used to test the event.origin property. From
    // the MDC window.postMessage docs: This string is the concatenation of the
    // protocol and "://", the host name if one exists, and ":" followed by a port
    // number if a port is present and differs from the default port for the given
    // protocol. Examples of typical origins are https://example.org (implying
    // port 443), http://example.net (implying port 80), and http://example.com:8080.
    //
    // Usage:
    //
    // > jQuery.receiveMessage( callback [, source_origin ] [, delay ] );
    //
    // Arguments:
    //
    //  callback - (Function) This callback will execute whenever a <jQuery.postMessage>
    //    message is received, provided the source_origin matches. If callback is
    //    omitted, any existing receiveMessage event bind or polling loop will be
    //    canceled.
    //  source_origin - (String) If window.postMessage is available and this value
    //    is not equal to the event.origin property, the callback will not be
    //    called.
    //  source_origin - (Function) If window.postMessage is available and this
    //    function returns false when passed the event.origin property, the
    //    callback will not be called.
    //  delay - (Number) An optional zero-or-greater delay in milliseconds at
    //    which the polling loop will execute (for browser that don't support
    //    window.postMessage). If omitted, defaults to 100.
    //
    // Returns:
    //
    //  Nothing!

    $.receiveMessage = p_receiveMessage = function( callback, source_origin, delay, retrieve_window) {
        if ( has_postMessage ) {
            // Since the browser supports window.postMessage, the callback will be
            // bound to the actual event associated with window.postMessage.

            if ( callback ) {
                // Unbind an existing callback if it exists.
                rm_callback && p_receiveMessage();

                // Bind the callback. A reference to the callback is stored for ease of
                // unbinding.
                rm_callback = function(e) {
                    if ( ( typeof source_origin === 'string' && e.origin !== source_origin )
                        || ( (typeof source_origin == 'function') && source_origin( e.origin ) === FALSE ) ) {
                        return FALSE;
                    }
                    var n_e = {
                        origin: e.origin,
                        data:    JSON.parse(e.data)
                    }
                    callback( n_e );
                };
            }

            if ( window[addEventListener] ) {
                window[ callback ? addEventListener : 'removeEventListener' ]( 'message', rm_callback, FALSE );
            } else {
                window[ callback ? 'attachEvent' : 'detachEvent' ]( 'onmessage', rm_callback );
            }

        } else {
            // Since the browser sucks, a polling loop will be started, and the
            // callback will be called whenever window.name changes.

            receive_interval_id && clearInterval( receive_interval_id );
            receive_interval_id = null;

            if ( callback ) {
                delay = delay || 100;

                receive_interval_id = setInterval(function(){
                    var raw_messages = window.name;
                    if ( raw_messages && window) {
                        window.name = '';
                        var messages = JSON.parse(raw_messages),
                            source;
                        for(var j=0, k=messages.length; j<k; j++) {
                            if(retrieve_window) {
                                source = retrieve_window(messages[j].source);
                            }
                            if(source !== false) {
                                callback({ source: source, data: JSON.parse(messages[j].message) });
                            }
                        }
                    }
                }, delay );
            }
        }
    };
    return $;

});
/**
 * Created by henry on 15-12-8.
 */
define('lib/messager',['./class', './mode/websocket', 'app/config/app', './ajax', './event', '../module/evaluation', 'lib/cross_domain'], function(Class, Socket, appConfig, Ajax, Event, Evaluation, crossDomain) {
    return new Class().extend(function(local, remote, user_info, team_info, page_id, type) {
        var self = this;
        var mode = null;

        if (typeof(type) == 'undefined') {
            type = 'IM';
        }
        if (typeof(page_id) == 'undefined') {
            page_id = null;
        }

        this.sendOrder = function(title, order) {
            Ajax.post('/api/message/client', {
                type: type,
                title: title,
                from: local,
                to: remote,
                body: JSON.stringify(order),
                user_info: user_info
            }, function(response) {
                if (!response.success) {
                    var nextEvent = new Event("error");
                    nextEvent.data = response.msg;
                    self.triggerEvent(nextEvent);

                } else {
                    var nextEvent = new Event("sent");
                    nextEvent.data = response.data;
                    self.triggerEvent(nextEvent);
                }
            });
        };


        this.send = function(message, email, phone) {
            if (typeof(email) == 'undefined') {
                email = null;
            }
            if (typeof(phone) == 'undefined') {
                phone = null;
            }


            var data = {
                body: message,
                from: local,
                to: remote,
                type: type,
                user_info: user_info ? JSON.stringify(user_info) : '',
                page_id: page_id,
                email: email,
                phone: phone
            };
            Ajax.post('/api/message/client', data, function(response) {
                if (!response.success) {
                    var nextEvent = new Event("error");
                    nextEvent.data = response.msg;
                    self.triggerEvent(nextEvent);
                } else {
                    var nextEvent = new Event("sent");
                    nextEvent.data = response.data;
                    self.triggerEvent(nextEvent);
                }
            });
        };

        if (type == 'IM') {
            var init_websocket = function(response) {
                if (response.data) {
                    mode = new Socket(appConfig['WEBSOCKET_BASE_URL'] + "?_token=" + response.data);
                    mode.connect();
                    mode.send({ "action": "tail" });
                    mode.addEventListener('message', function(event) {
                        if (event.data) {
                            if ('message' === event.data.type && event.data.data['package']['order_id'] && "SEND" === event.data.data.direction) {
                                var evaluationOrderId = document.querySelector('#evaluationOrderIdValue');
                                if (evaluationOrderId) {
                                    evaluationOrderId.value = event.data.data['package']['order_id'];
                                }
                            }
                            var nextEvent = new Event(event.data.type);
                            nextEvent.data = event.data;
                            self.triggerEvent(nextEvent);
                        }

                        //结束对话后弹出评论窗口
                        if (event.data && 'message' === event.data.type && event.data.data && event.data.data['package'] && 'closed' === event.data.data['package'].action) {
                            var evaluationButton = document.querySelector('.evaluateBtn');
                            setTimeout(function() {
                                evaluationButton.click();
                            }, 2500);
                        }

                        if(event.data && 'event' === event.data.type && 'notice' === event.data.data.action && event.data.data.data) {
                            // 判断是否后台发来的typing action
                            if ('typing' === event.data.data.data.action) {
                                clearTimeout(self.timeoutId);
                                var typingMessage = event.data.data.data.message;
                                var remindTextField = document.querySelector('.header small');
                                remindTextField.innerText = '客服正在输入中...';
                                self.timeoutId = setTimeout(function () {
                                    remindTextField.innerText = '正在为您服务';
                                }, 800);
                            }

                            if(event.data.data.data.action == 'undo'){
                                var message = document.getElementById('message-'+event.data.data.data._id);
                                if(message){
                                    message.style.display = 'none';
                                }
                            }
                        }

                        if (event.data && 'message' === event.data.type) {
                            var postData = {
                                action: 'newMessage',
                                message: event.data.data.body
                            };
                            usingnetCrossDomain.postMessage(postData, document.referrer, window.parent);
                        }
                    });
                } else {
                    var nextEvent = new Event("error");
                    nextEvent.data = response.msg;
                    self.triggerEvent(nextEvent);
                }
            };
            if(team_info.im_token){
                init_websocket({success:true, data: team_info.im_token});
            }else{
                Ajax.get("/api/message/client", { "from": local, "to": remote, "type": "IM", user_info: user_info, "_": Math.random() }, init_websocket);
            }
        }
    });
});


define('text!template/dialog_im.html',[],function () { return '<!-- <div class="home-menu pure-menu pure-menu-horizontal" class="siteTitle" id="siteTitle">\n    <img class="logo" src="" /><a class="pure-menu-heading title" href="javascript:void(0)">Your Site</a>\n</div> -->\n<div class="message-container">\n</div>\n<iframe id="form_submit" name="form_submit"></iframe>\n<div class="message-sender">\n    <form class="pure-form pure-g" target="form_submit" action="/api/upload" method="post" enctype="multipart/form-data" style="width: 100%; height: 100%; position: relative;">\n        <textarea class="inputArea pure-u-1" placeholder={$PLACE_HOLDER$}></textarea>\n        <span class="uploadHover"></span>\n        <input class="uploadBtn pure-button" name="file" type="file" accept="image/jpeg, image/png, image/bmp, image/gif, audio/wav" />\n        <input class="sendBtn pure-button pure-button-primary" type="button" value="发送" style="border: 1px solid #{$BTN_BG_COLOR$};" />\n        <input class="faceBtn pure-button pure-button-primary" type="button" value="" />\n        <input class="evaluateBtn pure-button pure-button-primary" type="button" value="" />\n        <input id="evaluationOrderIdValue" type="text" value="" style="display: none;" />\n    </form>\n</div>\n<style>\n    .sendBtn {\n        background-color: #{$BTN_BG_COLOR$};\n        color: #{$BTN_TEXT_COLOR$};\n    }\n    /*#siteTitle {\n        background-color: #{$TITLE_BG_COLOR$};\n    }\n    #siteTitle a {\n        color: #{$TITLE_TEXT_COLOR$};\n    }*/\n    .message.receive {\n        background-color: #{$RECEIVE_MSG_BG_COLOR$};\n        color: #{$RECEIVE_MSG_TEXT_COLOR$};\n    }\n    .message.send {\n        background-color: #{$SEND_MSG_BG_COLOR$};\n        color: #{$SEND_MSG_TEXT_COLOR$};\n    }\n    .dialog .message-container {\n        background-color: #{$CHATWIN_BG_COLOR$};\n    }\n</style>';});

/**
 * Created by henry on 15-12-22.
 */
define('lib/face',[], function () {
    var QQFaceList = ["微笑", "撇嘴", "色", "发呆", "得意", "流泪", "害羞", "闭嘴", "睡", "大哭", "尴尬", "发怒", "调皮", "呲牙", "惊讶", "难过", "酷", "冷汗", "抓狂", "吐", "偷笑", "愉快", "白眼", "傲慢", "饥饿", "困", "惊恐", "流汗", "憨笑", "悠闲", "奋斗", "咒骂", "疑问", "嘘", "晕", "疯了", "衰", "骷髅", "敲打", "再见", "擦汗", "抠鼻", "鼓掌", "糗大了", "坏笑", "左哼哼", "右哼哼", "哈欠", "鄙视", "委屈", "快哭了", "阴险", "亲亲", "吓", "可怜", "菜刀", "西瓜", "啤酒", "篮球", "乒乓", "咖啡", "饭", "猪头", "玫瑰", "凋谢", "嘴唇", "爱心", "心碎", "蛋糕", "闪电", "炸弹", "刀", "足球", "瓢虫", "便便", "月亮", "太阳", "礼物", "拥抱", "强", "弱", "握手", "胜利", "抱拳", "勾引", "拳头", "差劲", "爱你", "NO", "OK", "爱情", "飞吻", "跳跳", "发抖", "怄火", "转圈", "磕头", "回头", "跳绳", "投降", "激动", "乱舞", "献吻", "左太极", "右太极"];
    var EmojiList = ["笑脸", "开心", "大笑", "热情", "眨眼", "色", "接吻", "亲吻", "脸红", "露齿笑", "满意", "戏弄", "吐舌", "无语", "得意", "汗", "失望", "低落", "呸", "焦虑", "担心", "震惊", "悔恨", "眼泪", "哭", "破涕为笑", "晕", "恐惧", "心烦", "生气", "睡觉", "生病", "恶魔", "外星人", "心", "心碎", "丘比特", "闪烁", "星星", "叹号", "问号", "睡着", "水滴", "音乐", "火", "便便", "强", "弱", "拳头", "胜利", "上", "下", "右", "左", "第一", "强壮", "吻", "热恋", "男孩", "女孩", "女士", "男士", "天使", "骷髅", "红唇", "太阳", "下雨", "多云", "雪人", "月亮", "闪电", "海浪", "猫", "小狗", "老鼠", "仓鼠", "兔子", "狗", "青蛙", "老虎", "考拉", "熊", "猪", "牛", "野猪", "猴子", "马", "蛇", "鸽子", "鸡", "企鹅", "毛虫", "章鱼", "鱼", "鲸鱼", "海豚", "玫瑰", "花", "棕榈树", "仙人掌", "礼盒", "南瓜灯", "鬼魂", "圣诞老人", "圣诞树", "礼物", "铃", "庆祝", "气球", "CD", "相机", "录像机", "电脑", "电视", "电话", "解锁", "锁", "钥匙", "成交", "灯泡", "邮箱", "浴缸", "钱", "炸弹", "手枪", "药丸", "橄榄球", "篮球", "足球", "棒球", "高尔夫", "奖杯", "入侵者", "唱歌", "吉他", "比基尼", "皇冠", "雨伞", "手提包", "口红", "戒指", "钻石", "咖啡", "啤酒", "干杯", "鸡尾酒", "汉堡", "薯条", "意面", "寿司", "面条", "煎蛋", "冰激凌", "蛋糕", "苹果", "飞机", "火箭", "自行车", "高铁", "警告", "旗", "男人", "女人", "O", "X", "版权", "注册商标", "商标"];
    var QQFaceMap = {"微笑": "0","撇嘴": "1","色": "2","发呆": "3","得意": "4","流泪": "5","害羞": "6","闭嘴": "7","睡": "8","大哭": "9","尴尬": "10","发怒": "11","调皮": "12","呲牙": "13","惊讶": "14","难过": "15","酷": "16","冷汗": "17","抓狂": "18","吐": "19","偷笑": "20","可爱": "21","愉快": "21","白眼": "22","傲慢": "23","饥饿": "24","困": "25","惊恐": "26","流汗": "27","憨笑": "28","悠闲": "29","大兵": "29","奋斗": "30","咒骂": "31","疑问": "32","嘘": "33","晕": "34","疯了": "35","折磨": "35","衰": "36","骷髅": "37","敲打": "38","再见": "39","擦汗": "40","抠鼻": "41","鼓掌": "42","糗大了": "43","坏笑": "44","左哼哼": "45","右哼哼": "46","哈欠": "47","鄙视": "48","委屈": "49","快哭了": "50","阴险": "51","亲亲": "52","吓": "53","可怜": "54","菜刀": "55","西瓜": "56","啤酒": "57","篮球": "58","乒乓": "59","咖啡": "60","饭": "61","猪头": "62","玫瑰": "63","凋谢": "64","嘴唇": "65","示爱": "65","爱心": "66","心碎": "67","蛋糕": "68","闪电": "69","炸弹": "70","刀": "71","足球": "72","瓢虫": "73","便便": "74","月亮": "75","太阳": "76","礼物": "77","拥抱": "78","强": "79","弱": "80","握手": "81","胜利": "82","抱拳": "83","勾引": "84","拳头": "85","差劲": "86","爱你": "87",NO: "88",OK: "89","爱情": "90","飞吻": "91","跳跳": "92","发抖": "93","怄火": "94","转圈": "95","磕头": "96","回头": "97","跳绳": "98","投降": "99","激动": "100","乱舞": "101","献吻": "102","左太极": "103","右太极": "104",Smile: "0",Grimace: "1",Drool: "2",Scowl: "3",Chill: "4",CoolGuy: "4",Sob: "5",Shy: "6",Shutup: "7",Silent: "7",Sleep: "8",Cry: "9",Awkward: "10",Pout: "11",Angry: "11",Wink: "12",Tongue: "12",Grin: "13",Surprised: "14",Surprise: "14",Frown: "15",Cool: "16",Ruthless: "16",Tension: "17",Blush: "17",Scream: "18",Crazy: "18",Puke: "19",Chuckle: "20",Joyful: "21",Slight: "22",Smug: "23",Hungry: "24",Drowsy: "25",Panic: "26",Sweat: "27",Laugh: "28",Loafer: "29",Commando: "29",Strive: "30",Determined: "30",Scold: "31",Doubt: "32",Shocked: "32",Shhh: "33",Dizzy: "34",Tormented: "35",BadLuck: "36",Toasted: "36",Skull: "37",Hammer: "38",Wave: "39",Relief: "40",Speechless: "40",DigNose: "41",NosePick: "41",Clap: "42",Shame: "43",Trick: "44","Bah！L": "45","Bah！R": "46",Yawn: "47",Lookdown: "48","Pooh-pooh": "48",Wronged: "49",Shrunken: "49",Puling: "50",TearingUp: "50",Sly: "51",Kiss: "52","Uh-oh": "53",Wrath: "53",Whimper: "54",Cleaver: "55",Melon: "56",Watermelon: "56",Beer: "57",Basketball: "58",PingPong: "59",Coffee: "60",Rice: "61",Pig: "62",Rose: "63",Wilt: "64",Lip: "65",Lips: "65",Heart: "66",BrokenHeart: "67",Cake: "68",Lightning: "69",Bomb: "70",Dagger: "71",Soccer: "72",Ladybug: "73",Poop: "74",Moon: "75",Sun: "76",Gift: "77",Hug: "78",Strong: "79",ThumbsUp: "79",Weak: "80",ThumbsDown: "80",Shake: "81",Victory: "82",Peace: "82",Admire: "83",Fight: "83",Beckon: "84",Fist: "85",Pinky: "86",Love: "2",RockOn: "87",No: "88","Nuh-uh": "88",InLove: "90",Blowkiss: "91",Waddle: "92",Tremble: "93","Aaagh!": "94",Twirl: "95",Kotow: "96",Lookback: "97",Dramatic: "97",Jump: "98",JumpRope: "98","Give-in": "99",Surrender: "99",Hooray: "100",HeyHey: "101",Meditate: "101",Smooch: "102","TaiJi L": "103","TaiChi L": "103","TaiJi R": "104","TaiChi R": "104","發呆": "3","流淚": "5","閉嘴": "7","尷尬": "10","發怒": "11","調皮": "12","驚訝": "14","難過": "15","饑餓": "24","累": "25","驚恐": "26","悠閑": "29","奮鬥": "30","咒罵": "31","疑問": "32","噓": "33","暈": "34","瘋了": "35","骷髏頭": "37","再見": "39","摳鼻": "41","羞辱": "43","壞笑": "44","鄙視": "48","陰險": "51","親親": "52","嚇": "53","可憐": "54","籃球": "58","飯": "61","豬頭": "62","枯萎": "64","愛心": "66","閃電": "69","炸彈": "70","甲蟲": "73","太陽": "76","禮物": "77","擁抱": "78","強": "79","勝利": "82","拳頭": "85","差勁": "86","愛你": "88","愛情": "90","飛吻": "91","發抖": "93","噴火": "94","轉圈": "95","磕頭": "96","回頭": "97","跳繩": "98","激動": "100","亂舞": "101","獻吻": "102","左太極": "103","右太極": "104"};
    var QQFaceMapExtend = {"<笑脸>": "1f604","<笑臉>": "1f604","<Laugh>": "1f604","<开心>": "1f60a","<開心>": "1f60a","<Happy>": "1f60a","<大笑>": "1f603","<Big Smile>": "1f603","<热情>": "263a","<熱情>": "263a","<Glowing>": "263a","<眨眼>": "1f609","<Wink>": "1f609","<色>": "1f60d","<Love>": "1f60d","<Drool>": "1f60d","<接吻>": "1f618","<Smooch>": "1f618","<亲吻>": "1f61a","<親吻>": "1f61a","<Kiss>": "1f61a","<脸红>": "1f633","<臉紅>": "1f633","<Blush>": "1f633","<露齿笑>": "1f63c","<露齒笑>": "1f63c","<Grin>": "1f63c","<满意>": "1f60c","<滿意>": "1f60c","<Satisfied>": "1f60c","<戏弄>": "1f61c","<戲弄>": "1f61c","<Tease>": "1f61c","<吐舌>": "1f445","<Tongue>": "1f445","<无语>": "1f612","<無語>": "1f612","<Speechless>": "1f612","<得意>": "1f60f","<Smirk>": "1f60f","<CoolGuy>": "1f60f","<汗>": "1f613","<Sweat>": "1f613","<失望>": "1f640","<Let Down>": "1f640","<低落>": "1f61e","<Low>": "1f61e","<呸>": "1f616","<Ugh>": "1f616","<焦虑>": "1f625","<焦慮>": "1f625","<Anxious>": "1f625","<担心>": "1f630","<擔心>": "1f630","<Worried>": "1f630","<震惊>": "1f628","<震驚>": "1f628","<Shocked>": "1f628","<悔恨>": "1f62b","<D’oh!>": "1f62b","<眼泪>": "1f622","<眼淚>": "1f622","<Tear>": "1f622","<哭>": "1f62d","<Cry>": "1f62d","<破涕为笑>": "1f602","<破涕為笑>": "1f602","<Lol>": "1f602","<晕>": "1f632","<Dead>": "1f632","<Dizzy>": "1f632","<恐惧>": "1f631","<恐懼>": "1f631","<Terror>": "1f631","<心烦>": "1f620","<心煩>": "1f620","<Upset>": "1f620","<生气>": "1f63e","<生氣>": "1f63e","<Angry>": "1f63e","<睡觉>": "1f62a","<睡覺>": "1f62a","<Zzz>": "1f62a","<生病>": "1f637","<Sick>": "1f637","<恶魔>": "1f47f","<惡魔>": "1f47f","<Demon>": "1f47f","<外星人>": "1f47d","<Alien>": "1f47d","<心>": "2764","<Heart>": "2764","<心碎>": "1f494","<Heartbroken>": "1f494","<BrokenHeart>": "1f494","<丘比特>": "1f498","<Cupid>": "1f498","<闪烁>": "2728","<閃爍>": "2728","<Twinkle>": "2728","<星星>": "1f31f","<Star>": "1f31f","<叹号>": "2755","<嘆號>": "2755","<!>": "2755","<问号>": "2754","<問號>": "2754","<?>": "2754","<睡着>": "1f4a4","<睡著>": "1f4a4","<Asleep>": "1f4a4","<水滴>": "1f4a6","<Drops>": "1f4a6","<音乐>": "1f3b5","<音樂>": "1f3b5","<Music>": "1f3b5","<火>": "1f525","<Fire>": "1f525","<便便>": "1f4a9","<Poop>": "1f4a9","<强>": "1f44d","<強>": "1f44d","<ThumbsUp>": "1f44d","<弱>": "1f44e","<ThumbsDown>": "1f44e","<拳头>": "1f44a","<拳頭>": "1f44a","<Punch>": "1f44a","<Fist>": "1f44a","<胜利>": "270c","<勝利>": "270c","<Peace>": "270c","<上>": "1f446","<Up>": "1f446","<下>": "1f447","<Down>": "1f447","<右>": "1f449","<Right>": "1f449","<左>": "1f448","<Left>": "1f448","<第一>": "261d","<#1>": "261d","<强壮>": "1f4aa","<強壯>": "1f4aa","<Strong>": "1f4aa","<吻>": "1f48f","<Kissing>": "1f48f","<热恋>": "1f491","<熱戀>": "1f491","<Couple>": "1f491","<男孩>": "1f466","<Boy>": "1f466","<女孩>": "1f467","<Girl>": "1f467","<女士>": "1f469","<Lady>": "1f469","<男士>": "1f468","<Man>": "1f468","<天使>": "1f47c","<Angel>": "1f47c","<骷髅>": "1f480","<骷髏>": "1f480","<Skull>": "1f480","<红唇>": "1f48b","<紅唇>": "1f48b","<Lips>": "1f48b","<太阳>": "2600","<太陽>": "2600","<Sun>": "2600","<下雨>": "2614","<Rain>": "2614","<多云>": "2601","<多雲>": "2601","<Cloud>": "2601","<雪人>": "26c4","<Snowman>": "26c4","<月亮>": "1f319","<Moon>": "1f319","<闪电>": "26a1","<閃電>": "26a1","<Lightning>": "26a1","<海浪>": "1f30a","<Waves>": "1f30a","<猫>": "1f431","<貓>": "1f431","<Cat>": "1f431","<小狗>": "1f429","<Doggy>": "1f429","<老鼠>": "1f42d","<Mouse>": "1f42d","<仓鼠>": "1f439","<倉鼠>": "1f439","<Hamster>": "1f439","<兔子>": "1f430","<Rabbit>": "1f430","<狗>": "1f43a","<Dog>": "1f43a","<青蛙>": "1f438","<Frog>": "1f438","<老虎>": "1f42f","<Tiger>": "1f42f","<考拉>": "1f428","<Koala>": "1f428","<熊>": "1f43b","<Bear>": "1f43b","<猪>": "1f437","<豬>": "1f437","<Pig>": "1f437","<牛>": "1f42e","<Cow>": "1f42e","<野猪>": "1f417","<野豬>": "1f417","<Boar>": "1f417","<猴子>": "1f435","<Monkey>": "1f435","<马>": "1f434","<馬>": "1f434","<Horse>": "1f434","<蛇>": "1f40d","<Snake>": "1f40d","<鸽子>": "1f426","<鴿子>": "1f426","<Pigeon>": "1f426","<鸡>": "1f414","<雞>": "1f414","<Chicken>": "1f414","<企鹅>": "1f427","<企鵝>": "1f427","<Penguin>": "1f427","<毛虫>": "1f41b","<毛蟲>": "1f41b","<Caterpillar>": "1f41b","<章鱼>": "1f419","<八爪魚>": "1f419","<Octopus>": "1f419","<鱼>": "1f420","<魚>": "1f420","<Fish>": "1f420","<鲸鱼>": "1f433","<鯨魚>": "1f433","<Whale>": "1f433","<海豚>": "1f42c","<Dolphin>": "1f42c","<玫瑰>": "1f339","<Rose>": "1f339","<花>": "1f33a","<Flower>": "1f33a","<棕榈树>": "1f334","<棕櫚樹>": "1f334","<Palm>": "1f334","<仙人掌>": "1f335","<Cactus>": "1f335","<礼盒>": "1f49d","<禮盒>": "1f49d","<Candy Box>": "1f49d","<南瓜灯>": "1f383","<南瓜燈>": "1f383","<Jack-o-lantern>": "1f383","<鬼魂>": "1f47b","<Ghost>": "1f47b","<圣诞老人>": "1f385","<聖誕老人>": "1f385","<Santa>": "1f385","<圣诞树>": "1f384","<聖誕樹>": "1f384","<Xmas Tree>": "1f384","<礼物>": "1f381","<禮物>": "1f381","<Gift>": "1f381","<铃>": "1f514","<鈴鐺>": "1f514","<Bell>": "1f514","<庆祝>": "1f389","<慶祝>": "1f389","<Party>": "1f389","<气球>": "1f388","<氣球>": "1f388","<Balloon>": "1f388","<CD>": "1f4bf","<相机>": "1f4f7","<相機>": "1f4f7","<Camera>": "1f4f7","<录像机>": "1f3a5","<錄影機>": "1f3a5","<Film Camera>": "1f3a5","<电脑>": "1f4bb","<電腦>": "1f4bb","<Computer>": "1f4bb","<电视>": "1f4fa","<電視>": "1f4fa","<TV>": "1f4fa","<电话>": "1f4de","<電話>": "1f4de","<Phone>": "1f4de","<解锁>": "1f513","<解鎖>": "1f513","<Unlocked>": "1f513","<锁>": "1f512","<鎖>": "1f512","<Locked>": "1f512","<钥匙>": "1f511","<鑰匙>": "1f511","<Key>": "1f511","<成交>": "1f528","<Judgement>": "1f528","<灯泡>": "1f4a1","<燈泡>": "1f4a1","<Light bulb>": "1f4a1","<邮箱>": "1f4eb","<郵箱>": "1f4eb","<Mail>": "1f4eb","<浴缸>": "1f6c0","<Wash>": "1f6c0","<钱>": "1f4b2","<錢>": "1f4b2","<Money>": "1f4b2","<炸弹>": "1f4a3","<炸彈>": "1f4a3","<Bomb>": "1f4a3","<手枪>": "1f52b","<手槍>": "1f52b","<Pistol>": "1f52b","<药丸>": "1f48a","<藥丸>": "1f48a","<Pill>": "1f48a","<橄榄球>": "1f3c8","<橄欖球>": "1f3c8","<Football>": "1f3c8","<篮球>": "1f3c0","<籃球>": "1f3c0","<Basketball>": "1f3c0","<足球>": "26bd","<Soccer Ball>": "26bd","<Soccer>": "26bd","<棒球>": "26be","<Baseball>": "26be","<高尔夫>": "26f3","<高爾夫>": "26f3","<Golf>": "26f3","<奖杯>": "1f3c6","<獎盃>": "1f3c6","<Trophy>": "1f3c6","<入侵者>": "1f47e","<Invader>": "1f47e","<唱歌>": "1f3a4","<Singing>": "1f3a4","<吉他>": "1f3b8","<Guitar>": "1f3b8","<比基尼>": "1f459","<Bikini>": "1f459","<皇冠>": "1f451","<Crown>": "1f451","<雨伞>": "1f302","<雨傘>": "1f302","<Umbrella>": "1f302","<手提包>": "1f45c","<Purse>": "1f45c","<口红>": "1f484","<Lipstick>": "1f484","<戒指>": "1f48d","<Ring>": "1f48d","<钻石>": "1f48e","<鑽石>": "1f48e","<Gem>": "1f48e","<咖啡>": "2615","<Coffee>": "2615","<啤酒>": "1f37a","<Beer>": "1f37a","<干杯>": "1f37b","<乾杯>": "1f37b","<Toast>": "1f37b","<鸡尾酒>": "1f377","<雞尾酒>": "1f377","<Martini>": "1f377","<汉堡>": "1f354","<漢堡>": "1f354","<Burger>": "1f354","<薯条>": "1f35f","<薯條>": "1f35f","<Fries>": "1f35f","<意面>": "1f35d","<意粉>": "1f35d","<Sphaghetti>": "1f35d","<寿司>": "1f363","<壽司>": "1f363","<Sushi>": "1f363","<面条>": "1f35c","<麵條>": "1f35c","<Noodles>": "1f35c","<煎蛋>": "1f373","<Eggs>": "1f373","<冰激凌>": "1f366","<雪糕>": "1f366","<Ice Cream>": "1f366","<蛋糕>": "1f382","<Cake>": "1f382","<苹果>": "1f34f","<蘋果>": "1f34f","<Apple>": "1f34f","<飞机>": "2708","<飛機>": "2708","<Plane>": "2708","<火箭>": "1f680","<Rocket ship>": "1f680","<自行车>": "1f6b2","<單車>": "1f6b2","<Bike>": "1f6b2","<高铁>": "1f684","<高鐵>": "1f684","<Bullet Train>": "1f684","<警告>": "26a0","<Warning>": "26a0","<旗>": "1f3c1","<Flag>": "1f3c1","<男人>": "1f6b9","<男>": "1f6b9","<Men>": "1f6b9","<女人>": "1f6ba","<女>": "1f6ba","<Women>": "1f6ba","<O>": "2b55","<X>": "274e","<版权>": "a9","<版權>": "a9","<Copyright>": "a9","<注册商标>": "ae","<注冊商標>": "ae","<Registered TM>": "ae","<商标>": "2122","<商標>": "2122","<Trademark>": "2122"};
    var QQCodeFaceMap = {"/::)":"0","/::~":"1","/::B":"2","/::|":"3","/:8-)":"4","/::<":"5","/::$":"6","/::X":"7","/::Z":"8","/::'(":"9","/::-|":"10","/::@":"11","/::P":"12","/::D":"13","/::O":"14","/::(":"15","/::+":"16","/:--b":"17","/::Q":"18","/::T":"19","/:,@P":"20","/:,@-D":"21","/::d":"22","/:,@o":"23","/::g":"24","/:|-)":"25","/::!":"26","/::L":"27","/::>":"28","/::,@":"29","/:,@f":"30","/::-S":"31","/:?":"32","/:,@x":"33","/:,@@":"34","/::8":"35","/:,@!":"36","/:!!!":"37","/:xx":"38","/:bye":"39","/:wipe":"40","/:dig":"41","/:handclap":"42","/:&-(":"43","/:B-)":"44","/:<@":"45","/:@>":"46","/::-O":"47","/:>-|":"48","/:P-(":"49","/::'|":"50","/:X-)":"51","/::*":"52","/:@x":"53","/:8*":"54","/:pd":"55","/:<W>":"56","/:beer":"57","/:basketb":"58","/:oo":"59","/:coffee":"60","/:eat":"61","/:pig":"62","/:rose":"63","/:fade":"64","/:showlove":"65","/:heart":"66","/:break":"67","/:cake":"68","/:li":"69","/:bome":"70","/:kn":"71","/:footb":"72","/:ladybug":"73","/:shit":"74","/:moon":"75","/:sun":"76","/:gift":"77","/:hug":"78","/:strong":"79","/:weak":"80","/:share":"81","/:v":"82","/:@)":"83","/:jj":"84","/:@@":"85","/:bad":"86","/:lvu":"87","/:no":"88","/:ok":"89","/:love":"90","/:<L>":"91","/:jump":"92","/:shake":"93","/:<O>":"94","/:circle":"95","/:kotow":"96","/:turn":"97","/:skip":"98","/:oY":"99","/:#-0":"100","/:hiphot":"101","/:kiss":"102","/:<&":"103","/:&>":"104"};
    var EmojiCodeMap = {"1f604": "","1f60a": "","1f603": "","263a": "","1f609": "","1f60d": "","1f618": "","1f61a": "","1f633": "","1f63c": "","1f60c": "","1f61c": "","1f445": "","1f612": "","1f60f": "","1f613": "","1f640": "","1f61e": "","1f616": "","1f625": "","1f630": "","1f628": "","1f62b": "","1f622": "","1f62d": "","1f602": "","1f632": "","1f631": "","1f620": "","1f63e": "","1f62a": "","1f637": "","1f47f": "","1f47d": "",2764: "","1f494": "","1f498": "",2728: "","1f31f": "",2755: "",2754: "","1f4a4": "","1f4a6": "","1f3b5": "","1f525": "","1f4a9": "","1f44d": "","1f44e": "","1f44a": "","270c": "","1f446": "","1f447": "","1f449": "","1f448": "","261d": "","1f4aa": "","1f48f": "","1f491": "","1f466": "","1f467": "","1f469": "","1f468": "","1f47c": "","1f480": "","1f48b": "",2600: "",2614: "",2601: "","26c4": "","1f319": "","26a1": "","1f30a": "","1f431": "","1f429": "","1f42d": "","1f439": "","1f430": "","1f43a": "","1f438": "","1f42f": "","1f428": "","1f43b": "","1f437": "","1f42e": "","1f417": "","1f435": "","1f434": "","1f40d": "","1f426": "","1f414": "","1f427": "","1f41b": "","1f419": "","1f420": "","1f433": "","1f42c": "","1f339": "","1f33a": "","1f334": "","1f335": "","1f49d": "","1f383": "","1f47b": "","1f385": "","1f384": "","1f381": "","1f514": "","1f389": "","1f388": "","1f4bf": "","1f4f7": "","1f3a5": "","1f4bb": "","1f4fa": "","1f4de": "","1f513": "","1f512": "","1f511": "","1f528": "","1f4a1": "","1f4eb": "","1f6c0": "","1f4b2": "","1f4a3": "","1f52b": "","1f48a": "","1f3c8": "","1f3c0": "","26bd": "","26be": "","26f3": "","1f3c6": "","1f47e": "","1f3a4": "","1f3b8": "","1f459": "","1f451": "","1f302": "","1f45c": "","1f484": "","1f48d": "","1f48e": "",2615: "","1f37a": "","1f37b": "","1f377": "","1f354": "","1f35f": "","1f35d": "","1f363": "","1f35c": "","1f373": "","1f366": "","1f382": "","1f34f": "",2708: "","1f680": "","1f6b2": "","1f684": "","26a0": "","1f3c1": "","1f6b9": "","1f6ba": "","2b55": "","274e": "",a9: "",ae: "",2122: ""};

    //<span class="qqemoji qqface0"></span>
    //<span class="emoji emoji1f1e81f1f3"></span>
    return {
        faceListMap : {
            qq:QQFaceList,
            emoji: EmojiList
        },
        textToHtml:function(text){
            // [Face]
            var html = text;

            for(var i in QQCodeFaceMap){
                while(html.indexOf(i) != -1) {
                    html = html.replace(i, function (match) {
                        return '<span class="qqemoji qqemoji' + QQCodeFaceMap[match] + '"></span>';
                    });
                }
            }

            html = html.replace(/\[([^\]]*)\]/g,function(all,match){
                var index = QQFaceList.indexOf(match);
                if(index==-1){
                    return all;
                }else{
                    return '<span class="qqemoji qqemoji' + QQFaceMap[match] + '"></span>';
                }
            });

            html = html.replace(/\<([^\>\s\\\/]*)\>/g,function(all,match){
                var code = QQFaceMapExtend[match];
                if(!code){
                    return all;
                }else{
                    return '<span class="emoji emoji' + code + '"></span>';
                }
            });

            // /: Face

            return html;
        }
    };
});
/**
 * Created by henry on 15-12-8.
 */
define('module/message',['../lib/class', 'lib/event', 'lib/face'], function (Class, Event, Face) {
    return new Class().extend(function (messageData) {
        var self = this;
        var container = document.createElement('div');
        container.setAttribute('id', 'message-'+messageData._id);
        if (messageData.body.indexOf('<img') == 0) {
            messageData.body = messageData.body.replace('https:', '');
        }

        container.innerHTML = Face.textToHtml(messageData.body);
        container.className = "message " + messageData.direction.toLowerCase();
        if(messageData.package && messageData.package.undo){
            container.innerHTML = '[已撤销]';
            container.style.display = 'none';
        }

        this.appendTo = function (dom) {
            dom.appendChild(container);
        };
        var imageList = container.querySelectorAll('img');
        for (var i = 0; i < imageList.length; i++) {
            imageList[i].addEventListener('load', function () {
                var event = new Event('load');
                self.triggerEvent(event);
            });
        }
    });
});

/**
 * Created by henry on 16-02-17.
 */
define('module/clear_float',['../lib/class'], function (Class) {
    return new Class().extend(function () {
        var container = document.createElement('div');
        container.style.clear = 'both';
        this.appendTo = function (dom) {
            dom.appendChild(container);
        };
    });
});

/**
 * Created by henry on 15-12-8.
 */
define('module/messagebox',['../lib/class', './message', './clear_float'],function(Class, messageModel, clearFloat){
    return new Class().extend(function(){
        var container = document.createElement('div');
        container.className='messageBox';

        this.insertMessage = function(messageData){
            var message = new messageModel(messageData);
            message.appendTo(container);
            (new clearFloat()).appendTo(container);
            container.parentNode.scrollTop = container.parentNode.scrollHeight;

            message.addEventListener('load',function(){
                container.parentNode.scrollTop = container.parentNode.scrollHeight;
            });
        };

        this.appendTo = function(dom){
            dom.appendChild(container);
        };
    });
});

define('text!template/face.html',[],function () { return '<table class="face-table">\n    <tbody>\n    <# for($i=0;$i<8;$i++){ #>\n    <tr>\n        <# for($j=0;$j<13;$j++){ #>\n        <td data="<# echo \'[\'+$faceListMap.qq[$i*8+$j]+\']\'; #>"> <# echo $textToHtml(\'[\'+$faceListMap.qq[$i*8+$j]+\']\'); #></td>\n        <# } #>\n    </tr>\n    <# } #>\n    </tbody>\n</table>\n\n<style>\n    table.face-table td{\n        width: 27px;\n        height: 27px;\n        border: 1px solid #DDD;\n        text-align: center;\n        vertical-align: middle;\n        cursor: pointer;\n    }\n</style>\n';});

/************************************************
 *                  JTemplate                   *
 *                  CMSPP.NET                   *
 *                 JTemplate.js                 *
 *      2012-9-2 5:23:37$   ZengOhm@gmail.com   *
 ************************************************/
define('lib/xTemplate',[],function(){
    return new function (){
        var _dataList = null;
        var _scanTemplateName = 0;
        var _scanCode = '';
        var _scanCodeIndex = 0;
        var _scanCodeChar = '';
        var _scanCodeLength = 0;
        var _scanCodeLine = 0;
        var _scanCodeCol = 0;
        var _codeConditionNested = 0;
        var _codeBlockNested = 0;
        /*
         * 0    Free                        -   When start
         * 1    HTML Block                  -   Start with 'First HTML Char' end with '<'
         * 2    HTML to JTemplate border    -   When read '#' after '<'
         * 3    JTemplate Block             -   Start with 'First JTemplate Char' end before '#'
         * 4    JTemplate to HTML border    -   When read '#' and '>' after '#'
         */
        var _codeState = 0;

        var _run = function(){
            _scanCodeIndex = 0;
            _scanCodeLength = _scanCode.length;
            _scanCodeLine = 0;
            _scanCodeCol = 0;
            _codeState = 0;
            var rString = 'var codeString = "";try{';

            while(_readChar()){
                switch(_codeState)  {
                    case 1:
                        rString+= 'codeString += "' + _jsStringEncode(_readHTMLBlock()) + '";';
                        break;
                    case 3:
                        rString+=_readJTemplate()+';';
                        break;
                }
            }
            rString += '}catch(e){console.log(e);}';
            return eval(rString);
        };

        var _readJTemplate = function(){
            if(_codeState==2)_readChar();
            var rString = '';
            do{
                if(_codeState==4)return _decodeVar(rString).replace(/echo/g,'codeString += ');
                rString += _scanCodeChar;
            }while(_readChar());
            throw ('JTemplate code should be end with "#>".');
        };

        var _readHTMLBlock = function(){
            if(_codeState==4)_readChar();
            var rString = '';
            var lastWord = '';
            do{
                if(lastWord=='<' && _scanCodeChar=='#')return rString;
                rString+=lastWord;
                lastWord = _scanCodeChar;
            }while(_readChar());
            rString+=lastWord;
            return rString;
        };

        var _jsStringEncode = function(str){
            return str.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'\\"').replace(/\r/ig,'').replace(/\n/ig,"\\\n");
        };

        var _readChar = function(){
            if(_scanCodeIndex<_scanCodeLength){
                var lastChar = _scanCodeChar;
                _scanCodeChar = _scanCode.substr(_scanCodeIndex,1);

                if(_codeState==0)
                    _codeState = 1;
                else if(_codeState==1 && lastChar=='<' && _scanCodeChar=='#')
                    _codeState = 2;
                else if(_codeState==2)
                    _codeState = 3;
                else if(_codeState==3 && _scanCodeChar=='#')
                    _codeState = 4;
                else if(_codeState==4 && lastChar=='>')
                    _codeState = 1;

                if(_scanCodeChar == "\n"){
                    _scanCodeLine++;
                    _scanCodeCol=0;
                }
                else if(_scanCodeChar == "(")_codeConditionNested++;
                else if(_scanCodeChar == ")")_codeConditionNested--;
                else if(_scanCodeChar == "{")_codeBlockNested++;
                else if(_scanCodeChar == "}")_codeBlockNested--;
                _scanCodeIndex++;
                _scanCodeCol++;

                if(_codeBlockNested<0)
                    _codeError('Code Block Nested Error');
                if(_codeConditionNested<0)
                    _codeError('Code Condition Nested Error');

                return true;
            }else{
                _scanCodeChar = '';
                return false;
            }
        };

        var _codeError = function (info){
            throw ('JTemplate Code Error in Template[' + _scanTemplateName + '] line ' + _scanCodeLine + ' char ' + _scanCodeCol + ': ' + info + '.');
        };

        var _decodeVar = function(varCode){
            return varCode.replace(/\$([a-zA-Z_]+[a-zA-Z_])*?/g,'_dataList._$1');
        };

        return function(template, dataList){
            _scanCode = template;
            _dataList = {};
            if(dataList != null){
                for(var i in dataList){
                    _dataList['_'+i]=dataList[i];
                }
            }
            return _run();
        };
    };
});
define('module/face',['lib/class', 'lib/face', 'text!template/face.html', 'lib/xTemplate'], function(Class, faceLib, html, xTemplate) {
    return new Class().extend(function(textArea) {
        var menu = document.createElement('div');
        menu.style.position = 'absolute';
        menu.style.zIndex = 999999;
        menu.style.backgroundColor = '#FFF';
        menu.style.left = '3px';
        menu.style.bottom = '40px';
        menu.style.display = 'none';
        document.body.appendChild(menu);

        menu.innerHTML = xTemplate(html, faceLib);

        menu.addEventListener('click', function(e) {
            var node = e.target || e.srcElement;
            if (node.tagName != 'TD') {
                node = node.parentElement;
            }
            if (node && node.getAttribute('data')) {
                textArea.value += node.getAttribute('data');
                textArea.focus();
            }
        });

        // document.body.addEventListener('click', function() {
        //     menu.style.display = 'none';
        // });

        this.clickFaceTool = function() {
            menu.style.display = menu.style.display == 'none' ? 'block' : 'none';
        };
    });
});

/**
 * Created by henry on 15-12-7.
 */
define('module/dialog_im',['lib/class', 'lib/messager', 'text!template/dialog_im.html', './messagebox', 'lib/ajax', 'lib/template', 'lib/cross_domain', './evaluation', './face'], function(Class, Messager, dialogHtml, MessageBox, Ajax, Template, CrossDomain, Evaluation, Face) {
    return new Class().extend(function(local, remote, user_id, team_info, page_id, config) {
        var self = this;
        var messager = new Messager(local, remote, user_id, team_info, page_id);
        var container = document.createElement('div');
        var obj = {};
        if (config) {
            obj = {
                BTN_BG_COLOR: config.button_bg_color,
                BTN_TEXT_COLOR: config.button_txt_color,
                TITLE_BG_COLOR: config.title_bg_color,
                TITLE_TEXT_COLOR: config.title_txt_color,
                RECEIVE_MSG_BG_COLOR: config.message_right_bg_color,
                RECEIVE_MSG_TEXT_COLOR: config.message_right_font_color,
                SEND_MSG_BG_COLOR: config.message_left_bg_color,
                SEND_MSG_TEXT_COLOR: config.message_left_font_color,
                PLACE_HOLDER: config.input_placeholder,
                CHATWIN_BG_COLOR: config.chatWin_bg_color
            };
        }
        container.innerHTML = Template(dialogHtml, obj);
        container.className = 'dialog';

        var messageForm = container.querySelector('form');
        // var titleContainer = container.querySelector('.title');
        // var logoContainer = container.querySelector('.logo');
        var sendButton = container.querySelector('.sendBtn');
        var uploadButton = container.querySelector('.uploadBtn');
        var faceButton = container.querySelector('.faceBtn');
        var evaluateButton = container.querySelector('.evaluateBtn');
        var inputArea = container.querySelector('.inputArea');
        var uploadTarget = container.querySelector('iframe');
        var messageBox = new MessageBox();

        // if ((window.innerHeight || document.documentElement.clientHeight) < 350) {
        //     titleContainer.style.display = 'none';
        //     titleContainer.parentElement.style.display = 'none';
        //     with (container.querySelector('.message-container').style) {
        //         var top = 0;
        //     }
        // }

        messageBox.appendTo(container.querySelector('.message-container'));

        //Init
        (function() {
            sendButton.addEventListener('click', function() {
                self.sendMessage();
                inputArea.focus();
            });

            var face = new Face(inputArea);
            faceButton.addEventListener('click', function(e) {
                face.clickFaceTool();
                e.cancelBubble = true;
                return false;
            });

            var evaluate = new Evaluation();
            evaluateButton.addEventListener('click', function() {

                evaluate.appendTo(document.body);
            });

            uploadButton.addEventListener('change', function() {
                messageForm.submit();
            });

            uploadButton.addEventListener('focus', function() {
                setTimeout(function() {
                    if (uploadButton.blur) {
                        uploadButton.blur()
                    }
                }, 1000);
            });

            messager.addEventListener("message", function(event) {
                messageBox.insertMessage(event.data.data);

            });

            messager.addEventListener("event", function(event) {
                if (event.data.data.action == "tail") {
                    while (event.data.data.messages.length) {
                        messageBox.insertMessage(event.data.data.messages.shift());
                    }
                }
            });
            uploadTarget.addEventListener("load", function(event) {
                if ((uploadTarget.contentWindow.location.href != 'about:blank') && (!uploadTarget.readyState || uploadTarget.readyState == "complete")) {
                    self.uploadImageResponse();
                }
            });

            inputArea.addEventListener("keypress", function(event) {
                if (event.keyCode == "\r".charCodeAt(0) || event.keyCode == 10 || event.keyCode == 13) {
                    self.sendMessage();
                    if (event.preventDefault) {
                        event.preventDefault();
                    }
                    return false;
                }
            });


        })();

        this.uploadImageResponse = function() {
            try {
                var response = JSON.parse(uploadTarget.contentDocument.body.innerText);
                if (response.success) {
                    self.send(response.data);
                } else {
                    alert(response.msg);
                }
            } catch (e) {
                alert("上传文件失败，请稍后重试");
            }
        };

        this.sendMessage = function() {
            var message = self.getMessage();
            if (message && message.length) {
                self.send(self.getMessage());
            }
            inputArea.value = '';
        };

        this.send = function(message) {
            messager.send(message);
        };

        this.getMessage = function() {
            return inputArea.value;
        };

        // this.setTitle = function (title) {
        //     titleContainer.innerHTML = title;
        // };

        // this.setLogo = function (src) {
        //     logoContainer.src = src;
        // };

        this.appendTo = function(dom) {

            dom.appendChild(container);
        };
    });
});


define('text!template/dialog_lm.html',[],function () { return '<form class="pure-form pure-form-stacked">\n    <fieldset>\n        <legend>当前暂无客服在线，请留言：</legend>\n        <div class="contact_info">\n            <div class="pure-control-group">\n                <label for="lm_email">电子邮件</label>\n                <input required="required" type="email" name="email" id="lm_email" placeholder="name@example.com"/>\n            </div>\n            <div class="pure-control-group">\n                <label for="lm_phone">联系电话</label>\n                <input required="required" type="text" name="phone" id="lm_phone" placeholder="13800000000" />\n            </div>\n        </div>\n        <label for="lm_message">留言</label>\n        <textarea class="pure-input-1" name="body" id="lm_message" placeholder="有什么可以帮助您?"></textarea>\n\n        <input type="button" class="pure-button pure-button-primary" value="提交" />\n    </fieldset>\n</form>\n<div class="submitted" style="display: none">\n    <div class="alert-dialog">\n        <div class="content">\n            <p>留言提交成功。</p>\n            <p>客服稍后将联系您,请耐心等待。</p>\n            <input type="button" class="pure-button pure-button-primary" value="确定" />\n        </div>\n    </div>\n</div>';});

/**
 * Created by henry on 15-12-17.
 */
define('module/dialog_lm',['../lib/class', 'text!template/dialog_lm.html', 'lib/messager'],function(Class, dialogHtml, Messager){
    return new Class().extend(function(local, remote, user_info, team_info, page_id, config){
        var self = this;
        var container = document.createElement('div');
        var messager = new Messager(local, remote, user_info, team_info, page_id, 'LM');
        container.className = 'dialog dialog_lm';
        container.innerHTML = dialogHtml;

        var buttons = container.querySelectorAll('input[type=button]');
        //container.style.backgroundColor = '#' + config.title_bg_color;
        container.style.backgroundColor = '#fafafa';
        for (var i = 0; i < buttons.length; i++) {
            var btn = buttons[i];
            btn.style.backgroundColor = '#' + config.button_bg_color;
            btn.style.border = '1px solid #' + config.button_bg_color;
            btn.style.color = '#' + config.button_txt_color;
        }

        var form = container.querySelector('form');
        var submitButton = container.querySelector('form input[type=button]');
        var submittedAlert = container.querySelector('.submitted');
        var closeAlertButton = container.querySelector('.submitted input[type=button]');

        this.appendTo = function(dom){
            dom.appendChild(container);
        };

        if(user_info){
            container.querySelector('.contact_info').style.display='none';
        }

        (function(){
            submitButton.addEventListener('click', function(){
                var values = container.querySelectorAll('form input,textarea');
                var data = {};
                for(var i=0; i<values.length;i++){
                    if(values[i].name) {
                        data[values[i].name]=values[i].value;
                    }
                }
                if(data['body'].length) {
                    messager.send(data['body'], data['email'], data['phone']);
                }
            });

            messager.addEventListener('sent', function(){
                container.querySelector('form textarea').value = '';
                submittedAlert.style.display='block';
            });

            closeAlertButton.addEventListener('click', function(){
                submittedAlert.style.display='none';
            });

        })();
    });
});
/**
 * Created by jiahonglee on 2016/7/21.
 */
define('module/serviceGroup',[
    'lib/class'
], function(Class) {
    return new Class().extend(function(teamInfo) {
        var container = document.createElement('<div id="displayAgentGroup"></div>');
        container.style.left = 0;
        container.style.right = 0;
        container.style.top = '48px';
        container.style.bottom = '82px';
        container.style.background = '#fff';
        container.style.position = 'absolute';
        container.style.padding = '20px';

        var groups = teamInfo.groups;
        var groupsDom = '<h5>请先选择咨询内容</h5>';
        for (var i = 0; i < groups.length; i++) {
            groupsDom += '<a href="javascript: void(0);" data-id="' + groups[i].id + '" style="display: block; text-decoration: none; font-size: 14px; color: #2db7f5;">' + groups[i].name + '</a>'
        }

        container.innerHTML = groupsDom;

        var items = container.querySelectorAll('a');
        for (var j = 0; j < items.length; j++) {
            items[j].addEventListener('click', function() {
                var id = this.getAttribute('data-id');
                container.setAttribute('data-id', id);
                container.style.zIndex = '-10000';
            }, false);
        }


        this.appendTo = function(dom) {
            dom.appendChild(container);
        };
    });
});

define('text!template/dialog_loading.html',[],function () { return '<div class="sk-fading-circle">\n    <div class="sk-circle1 sk-circle"></div>\n    <div class="sk-circle2 sk-circle"></div>\n    <div class="sk-circle3 sk-circle"></div>\n    <div class="sk-circle4 sk-circle"></div>\n    <div class="sk-circle5 sk-circle"></div>\n    <div class="sk-circle6 sk-circle"></div>\n    <div class="sk-circle7 sk-circle"></div>\n    <div class="sk-circle8 sk-circle"></div>\n    <div class="sk-circle9 sk-circle"></div>\n    <div class="sk-circle10 sk-circle"></div>\n    <div class="sk-circle11 sk-circle"></div>\n    <div class="sk-circle12 sk-circle"></div>\n</div>';});

/**
 * Created by henry on 15-12-7.
 */
define('module/dialog_loading',['../lib/class', 'text!template/dialog_loading.html', 'lib/template'], function (Class, dialogHtml, Template) {
    return new Class().extend(function () {

        var container = document.createElement('div');
        container.innerHTML = Template(dialogHtml, {});
        container.className = 'dialog';

        this.appendTo = function (dom) {
            dom.appendChild(container);
        };
        this.removeFrom = function(dom) {
            dom.removeChild(container);
        };
    });
});
/**
 * Created by henry on 15-12-8.
 */
define('lib/location',['lib/extend'],function(){
    var search = {};
    location.search.substr(1).split('&').filter(function(i){return i;}).map(function(value){
        var split = value.split('=');
        search[split[0]] = decodeURIComponent(split[1]);
    });
    return {
        search : function(key){
            return search[key];
        }
    };
});

define('text!template/header.html',[],function () { return '<img src="{$teamLogo$}" style="width: 38px; height: 38px; margin: 5px; float: left;">\n<div style="height: 38px; line-height: 19px; float: left; color: #fff; margin: 5px;">\n    <span>{$teamName$}</span>\n    <br>\n    <small>正在为您服务</small>\n</div>\n<a title="最小化" href="javascript:usingnetCrossDomain.postMessage({action: \'minimize\'}, document.referrer, window.parent);" style="width: 25px; height: 20px; display: block; float: right; margin-left: 10px; cursor: pointer; text-decoration: none; display: {$iconDisplay$};"><span style="color: #fff; font-size: 18px;">－</span></a>\n<a title="最大化" href="{$url$}" target="_blank" style="width: 15px; height: 20px; display: block; float: right; cursor: pointer; text-decoration: none; display: {$iconDisplay$};"><span style="color: #fff; font-size: 18px;">ㅁ</span></a>\n\n<!-- <img src="//im.usingnet.net/build/v1/image/minimize.png" style="width: 25px; height: 20px; display: block; float: right; margin-left: 10px; cursor: pointer;">\n<img src="//im.usingnet.net/build/v1/image/maximize.png" style="width: 15px; height: 20px; display: block; float: right; cursor: pointer;"> -->\n';});

/**
 * Created by jhli on 16-5-4.
 */
define('module/header',['lib/class', 'text!template/header.html', 'lib/template', 'lib/cross_domain'], function(Class, headerHtml, Template, crossDomain) {
    return new Class().extend(function(teaminfo) {
        var header = document.createElement('div');
        header.className = 'header';
        window.usingnetCrossDomain = crossDomain;
        header.innerHTML = Template(headerHtml, {
            teamLogo: (teaminfo.logo ? teaminfo.logo.replace('https:', '') + '-avatar' : ''),
            teamName: teaminfo.name,
            url: location.href,
            iconDisplay: (window.innerWidth || document.documentElement.clientWidth) < 380 ? 'block' : 'none'
        });
        header.style.height = '48px';
        header.style.backgroundColor = '#' + teaminfo.web.title_bg_color;

        this.appendTo = function(dom) {
            dom.appendChild(header);
        };

    });
});


define('text!template/order.html',[],function () { return '<div class="lm" style="padding:10px 20px;">\n    <form class="pure-form pure-form-stacked" onsubmit="return false;">\n        <fieldset>\n            <div class="pure-control-group">\n                <label for="lm_message">问题类型</label>\n                <select name="order_type" class="pure-input-1-2"  required="required">\n                    <option value="" <# if(!$current_title){ #> selected="selected" <# } #>>-- 请选择 --</option>\n                <# for($i=0;$i<($order||[]).length;$i++){$type = $order[$i]; #>\n                    <option value="<# echo $type.title #>" <# if($current_title==$type.title){ #> selected="selected" <# } #> ><# echo $type.title #></option>\n                <# } #>\n                </select>\n            </div>\n            <# for($i=0;$i<($order||[]).length;$i++){$type = $order[$i]; if($type.title != $current_title){continue;} for($j=0;$j < ($type.items || []).length;$j++){$field = $type.items[$j]; #>\n                <# switch($field.type){ case \'textarea\': #>\n                    <div class="pure-control-group">\n                        <label for="lm_message"><# echo $field[\'placeholder\'] #></label>\n                        <textarea class="pure-input-1" name="body" id="lm_message" placeholder="<# echo $field[\'placeholder\'] #>" required="required"></textarea>\n                    </div>\n                <# break;case \'input\':default: #>\n                    <div class="pure-control-group">\n                        <label for="lm_phone"><# echo $field[\'placeholder\'] #></label>\n                        <input required="required" type="text" name="phone" id="lm_phone" placeholder="<# echo $field[\'placeholder\'] #>" required="required" />\n                    </div>\n                <# break; } #>\n            <# }} #>\n            <button type="submit" class="pure-button pure-button-primary" name="submit">提交</button>\n        </fieldset>\n    </form>\n    <div class="submitted" style="display: none">\n        <div class="alert-dialog">\n            <div class="content">\n                <p>留言提交成功。</p>\n                <p>客服稍后将联系您,请耐心等待。</p>\n                <input type="button" class="pure-button pure-button-primary" value="确定" />\n            </div>\n        </div>\n    </div>\n</div>';});

/**
 * Created by henry on 16-1-20.
 */
define('module/order',['lib/ajax', 'lib/class', 'text!template/order.html', 'lib/messager','lib/xTemplate'], function (Ajax, Class, html, Messager, Template) {
    var container = document.createElement('div');
    container.innerHTML = '';

    return new Class().extend(function (tid, track_id, page_id, user_info, teamInfo) {
        container.innerHTML = Template(html, teamInfo);
        // container.innerHTML = html;

        var form = container.querySelector('form');
        var messager = null;

        var lastValue = '';

        container.addEventListener('click', function(e){
            var node = (e.target || e.srcElement);
           if(node.name == 'order_type'){
                if(node.value != lastValue){
                    lastValue = node.value;
                   teamInfo['current_title'] = node.value;
                   container.innerHTML = Template(html, teamInfo);
                }
           }
        });

        container.addEventListener('click', function(e){
            if((e.target || e.srcElement).name =='submit'){
                if (!messager) {
                    return false;
                }
                var title = container.querySelector('select').value;
                if(!title){
                    return false;
                }
                var values = container.querySelectorAll('form input,textarea');
                var data = {};
                for (var i = 0; i < values.length; i++) {
                    if (values[i].placeholder) {
                        data[values[i].placeholder] = values[i].value;
                        if(!data[values[i].placeholder]){
                            return false;
                        }
                    }
                }
                messager.sendOrder(title, data);
            }
        });

        this.appendTo = function (dom) {
            container.style.overflowY='scroll';
            container.style.paddingTop = '48px';
            container.style.height = '100%';
            dom.appendChild(container);
        };

        messager = new Messager(track_id, tid, user_info, page_id, 'LM');
        messager.addEventListener('sent', function () {
            location.reload();
            // Bubble.showSuccess('工单已成功提交，请耐心等待。', 5);
            // setTimeout(function(){
            //     location.reload();
            // },3000)
        });

        messager.addEventListener('error', function(e){
            alert(e.data);
        });
    });
});
/**
 * Created by henry on 15-12-9.
 */
define('window',['module/dialog_im', 'module/dialog_lm', 'module/serviceGroup', 'module/dialog_loading', 'lib/location', 'lib/ajax', 'module/header', 'module/order'], function(ImDialog, LmDialog, ServiceGroup, loadingDialog, Location, Ajax, Header, Order) {
    return function() {
        if (Location.search('track_id') && Location.search('tid')) {
            var dialog = null;
            // var loading = new loadingDialog();
            // loading.appendTo(document.body);

            Ajax.get('/api/teaminfo/' + Location.search('tid'), { track_id:Location.search('track_id'), user_info:Location.search('user_info'), _: Math.random() }, function(response) {
                var header = new Header(response.data);
                var team_info = response.data;
                header.appendTo(document.body);


                if (response.data.web.type == 'ORDER' && !response.data.current_order) {
                    dialog = new Order(Location.search('tid'), Location.search('track_id'), Location.search('page_id'), Location.search('user_info'), response.data);
                } else {
                    if (response.data.online) {
                        dialog = new ImDialog(Location.search('track_id'), Location.search('tid'), Location.search('user_info'), team_info, Location.search('page_id'), response.data.web);
                        // dialog.setTitle(response.data.name);
                        // dialog.setLogo(response.data.logo);

                        if (team_info.web.display_agent_group) {
                            var serviceGroup = new ServiceGroup(team_info);
                            serviceGroup.appendTo(document.body);
                        }
                    } else {
                        dialog = new LmDialog(Location.search('track_id'), Location.search('tid'), Location.search('user_info'), team_info, Location.search('page_id'), response.data.web);
                    }
                }

                // loading.removeFrom(document.body);
                dialog.appendTo(document.body);
            });
            //Ajax.get('/api/online/'+Location.search('tid'),{},function(response){});
        } else {
            document.write("错误, track_id, tid 为空");
        }
    };
});

/*jslint browser: true, nomen: false, plusplus: false, bitwise: false, maxerr: 50, indent: 2 */
/**
 * @depends swfobject-2.2.min.js
 *
 * evercookie 0.4 (10/13/2010) -- extremely persistent cookies
 *
 *  by samy kamkar : code@samy.pl : http://samy.pl
 *
 * this api attempts to produce several types of persistent data
 * to essentially make a cookie virtually irrevocable from a system
 *
 * specifically it uses:
 *  - standard http cookies
 *  - flash cookies (local shared objects)
 *  - silverlight isolated storage
 *  - png generation w/forced cache and html5 canvas pixel reading
 *  - http etags
 *  - http cache
 *  - window.name
 *  - IE userData
 *  - html5 session cookies
 *  - html5 local storage
 *  - html5 global storage
 *  - html5 database storage via sqlite
 *  - css history scanning
 *  - Java JNLP PersistenceService
 *  - Java exploit
 *
 *  if any cookie is found, it's then reset to all the other locations
 *  for example, if someone deletes all but one type of cookie, once
 *  that cookie is re-discovered, all of the other cookie types get reset
 *
 *  !!! SOME OF THESE ARE CROSS-DOMAIN COOKIES, THIS MEANS
 *  OTHER SITES WILL BE ABLE TO READ SOME OF THESE COOKIES !!!
 *
 * USAGE:

  var ec = new evercookie();

  // set a cookie "id" to "12345"
  // usage: ec.set(key, value)
  ec.set("id", "12345");

  // retrieve a cookie called "id" (simply)
  ec.get("id", function(value) { alert("Cookie value is " + value) });

  // or use a more advanced callback function for getting our cookie
  // the cookie value is the first param
  // an object containing the different storage methods
  // and returned cookie values is the second parameter
  function getCookie(best_candidate, all_candidates)
  {
    alert("The retrieved cookie is: " + best_candidate + "\n" +
      "You can see what each storage mechanism returned " +
      "by looping through the all_candidates object.");

    for (var item in all_candidates)
      document.write("Storage mechanism " + item +
        " returned " + all_candidates[item] + " votes<br>");
    }
    ec.get("id", getCookie);

  // we look for "candidates" based off the number of "cookies" that
  // come back matching since it's possible for mismatching cookies.
  // the best candidate is very-very-likely the correct one

*/
try{
(function (window) {
  'use strict';
  var document = window.document,
    Image = window.Image,
    globalStorage = window.globalStorage,
    swfobject = window.swfobject;

  try{
    var localStore = window.localStorage
  }catch(ex){}
  
  try {
    var sessionStorage = window.sessionStorage;
  } catch (e) { }

  function newImage(src) {
    var img = new Image();
    img.style.visibility = "hidden";
    img.style.position = "absolute";
    img.src = src;
  }
  function _ec_replace(str, key, value) {
    if (str.indexOf("&" + key + "=") > -1 || str.indexOf(key + "=") === 0) {
      // find start
      var idx = str.indexOf("&" + key + "="),
        end, newstr;
      if (idx === -1) {
        idx = str.indexOf(key + "=");
      }
      // find end
      end = str.indexOf("&", idx + 1);
      if (end !== -1) {
        newstr = str.substr(0, idx) + str.substr(end + (idx ? 0 : 1)) + "&" + key + "=" + value;
      } else {
        newstr = str.substr(0, idx) + "&" + key + "=" + value;
      }
      return newstr;
    } else {
      return str + "&" + key + "=" + value;
    }
  }

 function idb() {
    if ('indexedDB' in window) {
        return true
    } else if (window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB) {
        return true
    } else {
        return false
    }
  } 

  // necessary for flash to communicate with js...
  // please implement a better way
  var _global_lso;
  function _evercookie_flash_var(cookie) {
    _global_lso = cookie;

    // remove the flash object now
    var swf = document.getElementById("myswf");
    if (swf && swf.parentNode) {
      swf.parentNode.removeChild(swf);
    }
  }

  /*
   * Again, ugly workaround....same problem as flash.
   */
  var _global_isolated;
  function onSilverlightLoad(sender, args) {
    var control = sender.getHost();
    _global_isolated = control.Content.App.getIsolatedStorage();
  }

  function onSilverlightError(sender, args) {
    _global_isolated = "";
  }

  var defaultOptionMap = {
    history: true, // CSS history knocking or not .. can be network intensive
    java: true, // Java applet on/off... may prompt users for permission to run.
    tests: 10,  // 1000 what is it, actually?
    silverlight: true, // you might want to turn it off https://github.com/samyk/evercookie/issues/45
    domain: '.' + window.location.host.replace(/:\d+/, ''), // Get current domain
    baseurl: '', // base url for php, flash and silverlight assets
    asseturi: '/assets', // assets = .fla, .jar, etc
    phpuri: '/php', // php file path or route
    authPath: false, //'/evercookie_auth.php', // set to false to disable Basic Authentication cache
    pngCookieName: 'evercookie_png',
    pngPath: '/evercookie_png.php',
    etagCookieName: 'evercookie_etag',
    etagPath: '/evercookie_etag.php',
    cacheCookieName: 'evercookie_cache',
    cachePath: '/evercookie_cache.php'
  };
  
  var _baseKeyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  /**
   * @class Evercookie
   * @param {Object} options
   * @param {Boolean} options.history CSS history knocking or not .. can be network intensive
   * @param {Boolean} options.java Java applet on/off... may prompt users for permission to run.
   * @param {Number} options.tests
   * @param {Boolean} options.silverlight you might want to turn it off https://github.com/samyk/evercookie/issues/45
   * @param {String} options.domain (eg: www.sitename.com use .sitename.com)
   * @param {String} options.baseurl base url (eg: www.sitename.com/demo use /demo)
   * @param {String} options.asseturi asset path (eg: www.sitename.com/assets use /assets)
   * @param {String} options.phpuri php path/route (eg: www.sitename.com/php use /php)
   * @param {String|Function} options.domain as a string, domain for cookie, as a function, accept window object and return domain string
   * @param {String} options.pngCookieName
   * @param {String} options.pngPath
   * @param {String} options.etagCookieName:
   * @param {String} options.etagPath
   * @param {String} options.cacheCookieName
   * @param {String} options.cachePath
   */
  function Evercookie(options) {
    options = options || {};
    var opts = {};
    for (var key in defaultOptionMap) {
      var optValue = options[key];
      if(typeof optValue !== 'undefined') {
        opts[key] = optValue
      } else {
        opts[key] = defaultOptionMap[key];
      }
    }
    if(typeof opts.domain === 'function'){
      opts.domain = opts.domain(window);
    }
    var _ec_history = opts.history,
      _ec_java =  opts.java,
      _ec_tests = opts.tests,
      _ec_baseurl = opts.baseurl,
      _ec_asseturi = opts.asseturi,
      _ec_phpuri = opts.phpuri,
      _ec_domain = opts.domain;

    // private property
    var self = this;
    this._ec = {};

    this.get = function (name, cb, dont_reset) {
      self._evercookie(name, cb, undefined, undefined, dont_reset);
    };

    this.set = function (name, value) {
      self._evercookie(name, function () {}, value);
    };

    this._evercookie = function (name, cb, value, i, dont_reset) {
      if (self._evercookie === undefined) {
        self = this;
      }
      if (i === undefined) {
        i = 0;
      }
      // first run
      if (i === 0) {
        self.evercookie_database_storage(name, value);
        self.evercookie_indexdb_storage(name, value);
        self.evercookie_png(name, value);
        self.evercookie_etag(name, value);
        self.evercookie_cache(name, value);
        self.evercookie_lso(name, value);
        if (opts.silverlight) {
          self.evercookie_silverlight(name, value);
        }
        if (opts.authPath) {
          self.evercookie_auth(name, value);
        }
        if (_ec_java) {
          self.evercookie_java(name, value);
        }
        
        self._ec.userData      = self.evercookie_userdata(name, value);
        self._ec.cookieData    = self.evercookie_cookie(name, value);
        self._ec.localData     = self.evercookie_local_storage(name, value);
        self._ec.globalData    = self.evercookie_global_storage(name, value);
        self._ec.sessionData   = self.evercookie_session_storage(name, value);
        self._ec.windowData    = self.evercookie_window(name, value);

        if (_ec_history) {
          self._ec.historyData = self.evercookie_history(name, value);
        }
      }

      // when writing data, we need to make sure lso and silverlight object is there
      if (value !== undefined) {
        if ((typeof _global_lso === "undefined" ||
          typeof _global_isolated === "undefined") &&
          i++ < _ec_tests) {
          setTimeout(function () {
            self._evercookie(name, cb, value, i, dont_reset);
          }, 300);
        }
      }

      // when reading data, we need to wait for swf, db, silverlight, java and png
      else
      {
        if (
          (
            // we support local db and haven't read data in yet
            (window.openDatabase && typeof self._ec.dbData === "undefined") ||
            (idb() && (typeof self._ec.idbData === "undefined" || self._ec.idbData === "")) ||
            (typeof _global_lso === "undefined") ||
            (typeof self._ec.etagData === "undefined") ||
            (typeof self._ec.cacheData === "undefined") ||
            (typeof self._ec.javaData === "undefined") ||
            (document.createElement("canvas").getContext && (typeof self._ec.pngData === "undefined" || self._ec.pngData === "")) ||
            (typeof _global_isolated === "undefined")
          ) &&
          i++ < _ec_tests
        )
        {
          setTimeout(function () {
            self._evercookie(name, cb, value, i, dont_reset);
          }, 300);
        }

        // we hit our max wait time or got all our data
        else
        {
          // get just the piece of data we need from swf
          self._ec.lsoData = self.getFromStr(name, _global_lso);
          _global_lso = undefined;

          // get just the piece of data we need from silverlight
          self._ec.slData = self.getFromStr(name, _global_isolated);
          _global_isolated = undefined;

          var tmpec = self._ec,
            candidates = [],
            bestnum = 0,
            candidate,
            item;
          self._ec = {};

          // figure out which is the best candidate
          for (item in tmpec) {
            if (tmpec[item] && tmpec[item] !== "null" && tmpec[item] !== "undefined") {
              candidates[tmpec[item]] = candidates[tmpec[item]] === undefined ? 1 : candidates[tmpec[item]] + 1;
            }
          }

          for (item in candidates) {
            if (candidates[item] > bestnum) {
              bestnum = candidates[item];
              candidate = item;
            }
          }

          // reset cookie everywhere
          if (candidate !== undefined && (dont_reset === undefined || dont_reset !== 1)) {
            self.set(name, candidate);
          }
          if (typeof cb === "function") {
            cb(candidate, tmpec);
          }
        }
      }
    };

    this.evercookie_window = function (name, value) {
      try {
        if (value !== undefined) {
          window.name = _ec_replace(window.name, name, value);
        } else {
          return this.getFromStr(name, window.name);
        }
      } catch (e) { }
    };

    this.evercookie_userdata = function (name, value) {
      try {
        var elm = this.createElem("div", "userdata_el", 1);
        if (elm.addBehavior) {
          elm.style.behavior = "url(#default#userData)";

          if (value !== undefined) {
            elm.setAttribute(name, value);
            elm.save(name);
          } else {
            elm.load(name);
            return elm.getAttribute(name);
          }
        }
      } catch (e) {}
    };

    this.ajax = function (settings) {
      var headers, name, transports, transport, i, length;

      headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
      };

      transports = [
        function () { return new XMLHttpRequest(); },
        function () { return new ActiveXObject('Msxml2.XMLHTTP'); },
        function () { return new ActiveXObject('Microsoft.XMLHTTP'); }
      ];

      for (i = 0, length = transports.length; i < length; i++) {
        transport = transports[i];
        try {
          transport = transport();
          break;
        } catch (e) {
        }
      }

      transport.onreadystatechange = function () {
        if (transport.readyState !== 4) {
          return;
        }
        settings.success(transport.responseText);
      };
      transport.open('get', settings.url, true);
      for (name in headers) {
        transport.setRequestHeader(name, headers[name]);
      }
      transport.send();
    };

    this.evercookie_cache = function (name, value) {
      if (value !== undefined) {
        // make sure we have evercookie session defined first
        document.cookie = opts.cacheCookieName + "=" + value + "; path=/; domain=" + _ec_domain;
        // {{ajax request to opts.cachePath}} handles caching
        self.ajax({
          url: _ec_baseurl + _ec_phpuri + opts.cachePath + "?name=" + name + "&cookie=" + opts.cacheCookieName,
          success: function (data) {}
        });
      } else {
        // interestingly enough, we want to erase our evercookie
        // http cookie so the php will force a cached response
        var origvalue = this.getFromStr(opts.cacheCookieName, document.cookie);
        self._ec.cacheData = undefined;
        document.cookie = opts.cacheCookieName + "=; expires=Mon, 20 Sep 2010 00:00:00 UTC; path=/; domain=" + _ec_domain;

        self.ajax({
          url: _ec_baseurl + _ec_phpuri + opts.cachePath + "?name=" + name + "&cookie=" + opts.cacheCookieName,
          success: function (data) {
            // put our cookie back
            document.cookie = opts.cacheCookieName + "=" + origvalue + "; expires=Tue, 31 Dec 2030 00:00:00 UTC; path=/; domain=" + _ec_domain;

            self._ec.cacheData = data;
          }
        });
      }
    };
    this.evercookie_auth = function (name, value) {
      if (value !== undefined) {
        // {{opts.authPath}} handles Basic Access Authentication
        newImage('//' + value + '@' + location.host + _ec_baseurl + _ec_phpuri + opts.authPath + "?name=" + name);
      }
      else {
        self.ajax({
          url: _ec_baseurl + _ec_phpuri + opts.authPath + "?name=" + name,
          success: function (data) {
            self._ec.authData = data;
          }
        });
      }
    };

    this.evercookie_etag = function (name, value) {
      if (value !== undefined) {
        // make sure we have evercookie session defined first
        document.cookie = opts.etagCookieName + "=" + value + "; path=/; domain=" + _ec_domain;
        // {{ajax request to opts.etagPath}} handles etagging
        self.ajax({
          url: _ec_baseurl + _ec_phpuri + opts.etagPath + "?name=" + name + "&cookie=" + opts.etagCookieName,
          success: function (data) {}
        });
      } else {
        // interestingly enough, we want to erase our evercookie
        // http cookie so the php will force a cached response
        var origvalue = this.getFromStr(opts.etagCookieName, document.cookie);
        self._ec.etagData = undefined;
        document.cookie = opts.etagCookieName + "=; expires=Mon, 20 Sep 2010 00:00:00 UTC; path=/; domain=" + _ec_domain;

        self.ajax({
          url: _ec_baseurl + _ec_phpuri + opts.etagPath + "?name=" + name + "&cookie=" + opts.etagCookieName,
          success: function (data) {
            // put our cookie back
            document.cookie = opts.etagCookieName + "=" + origvalue + "; expires=Tue, 31 Dec 2030 00:00:00 UTC; path=/; domain=" + _ec_domain;

            self._ec.etagData = data;
          }
        });
      }
    };
    
    this.evercookie_java = function (name, value) {
      var div = document.getElementById("ecAppletContainer");

      // Exit if dtjava.js was not included in the page header.
      if (typeof dtjava === "undefined") {
	return;
      }
      
      // Create the container div if none exists.
      if (div===null || div === undefined || !div.length) {
        div = document.createElement("div");
        div.setAttribute("id", "ecAppletContainer");
        div.style.position = "absolute";
        div.style.top = "-3000px";
        div.style.left = "-3000px";
        div.style.width = "1px";
        div.style.height = "1px";
        document.body.appendChild(div);
      }

      // If the Java applet is not yet defined, embed it.
      if (typeof ecApplet === "undefined") {
        dtjava.embed({ 
        	id: "ecApplet",
        	url: _ec_baseurl + _ec_asseturi + "/evercookie.jnlp", 
        	width: "1px", 
        	height: "1px", 
        	placeholder: "ecAppletContainer"
          }, {},{ onJavascriptReady: doSetOrGet });
        // When the applet is loaded we will continue in doSetOrGet() 
      }
      else {
	// applet already running... call doGetOrSet() directly.
	doSetOrGet("ecApplet");
      }
      
      function doSetOrGet(appletId) {
	var applet = document.getElementById(appletId);	
        if (value !== undefined) {
          applet.set(name,value);
        }
        else {
          self._ec.javaData = applet.get(name);
        }
      }
      
      // The result of a get() is now in self._ec._javaData
    };

    this.evercookie_lso = function (name, value) {
      var div = document.getElementById("swfcontainer"),
        flashvars = {},
        params = {},
        attributes = {};
      if (div===null || div === undefined || !div.length) {
        div = document.createElement("div");
        div.setAttribute("id", "swfcontainer");
        document.body.appendChild(div);
      }

      if (value !== undefined) {
        flashvars.everdata = name + "=" + value;
      }
      params.swliveconnect = "true";
      attributes.id        = "myswf";
      attributes.name      = "myswf";
      swfobject.embedSWF(_ec_baseurl + _ec_asseturi + "/evercookie.swf", "swfcontainer", "1", "1", "9.0.0", false, flashvars, params, attributes);
    };

    this.evercookie_png = function (name, value) {
      var canvas = document.createElement("canvas"),
       img, ctx, origvalue;
      canvas.style.visibility = "hidden";
      canvas.style.position = "absolute";
      canvas.width = 200;
      canvas.height = 1;
      if (canvas && canvas.getContext) {
        // {{opts.pngPath}} handles the hard part of generating the image
        // based off of the http cookie and returning it cached
        img = new Image();
        img.style.visibility = "hidden";
        img.style.position = "absolute";
        if (value !== undefined) {
          // make sure we have evercookie session defined first
          document.cookie = opts.pngCookieName + "=" + value + "; path=/; domain=" + _ec_domain;
        } else {
          self._ec.pngData = undefined;
          ctx = canvas.getContext("2d");

          // interestingly enough, we want to erase our evercookie
          // http cookie so the php will force a cached response
          origvalue = this.getFromStr(opts.pngCookieName, document.cookie);
          document.cookie = opts.pngCookieName + "=; expires=Mon, 20 Sep 2010 00:00:00 UTC; path=/; domain=" + _ec_domain;

          img.onload = function () {
            // put our cookie back
            document.cookie = opts.pngCookieName + "=" + origvalue + "; expires=Tue, 31 Dec 2030 00:00:00 UTC; path=/; domain=" + _ec_domain;

            self._ec.pngData = "";
            ctx.drawImage(img, 0, 0);

            // get CanvasPixelArray from  given coordinates and dimensions
            var imgd = ctx.getImageData(0, 0, 200, 1),
              pix = imgd.data, i, n;

            // loop over each pixel to get the "RGB" values (ignore alpha)
            for (i = 0, n = pix.length; i < n; i += 4) {
              if (pix[i] === 0) {
                break;
              }
              self._ec.pngData += String.fromCharCode(pix[i]);
              if (pix[i + 1] === 0) {
                break;
              }
              self._ec.pngData += String.fromCharCode(pix[i + 1]);
              if (pix[i + 2] === 0) {
                break;
              }
              self._ec.pngData += String.fromCharCode(pix[i + 2]);
            }
          };
        }
        img.src = _ec_baseurl + _ec_phpuri + opts.pngPath + "?name=" + name + "&cookie=" + opts.pngCookieName;
      }
    };

    this.evercookie_local_storage = function (name, value) {
      try {
        if (localStore) {
          if (value !== undefined) {
            localStore.setItem(name, value);
          } else {
            return localStore.getItem(name);
          }
        }
      } catch (e) { }
    };

    this.evercookie_database_storage = function (name, value) {
      try {
        if (window.openDatabase) {
          var database = window.openDatabase("sqlite_evercookie", "", "evercookie", 1024 * 1024);

          if (value !== undefined) {
            database.transaction(function (tx) {
              tx.executeSql("CREATE TABLE IF NOT EXISTS cache(" +
                "id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, " +
                "name TEXT NOT NULL, " +
                "value TEXT NOT NULL, " +
                "UNIQUE (name)" +
                ")", [], function (tx, rs) {}, function (tx, err) {});
              tx.executeSql("INSERT OR REPLACE INTO cache(name, value) " +
                "VALUES(?, ?)",
                [name, value], function (tx, rs) {}, function (tx, err) {});
            });
          } else {
            database.transaction(function (tx) {
              tx.executeSql("SELECT value FROM cache WHERE name=?", [name],
                function (tx, result1) {
                  if (result1.rows.length >= 1) {
                    self._ec.dbData = result1.rows.item(0).value;
                  } else {
                    self._ec.dbData = "";
                  }
                }, function (tx, err) {});
            });
          }
        }
      } catch (e) { }
    };
 
    this.evercookie_indexdb_storage = function(name, value) {
    try {
    if (!('indexedDB' in window)) {

        indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
        IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    }

    if (indexedDB) {
        var ver = 1;
        //FF incognito mode restricts indexedb access
        var request = indexedDB.open("idb_evercookie", ver);


        request.onerror = function(e) { ;
        }

        request.onupgradeneeded = function(event) {
            var db = event.target.result;

            var store = db.createObjectStore("evercookie", {
                keyPath: "name",
                unique: false
            })

        }

        if (value !== undefined) {


            request.onsuccess = function(event) {
                var idb = event.target.result;
                if (idb.objectStoreNames.contains("evercookie")) {
                    var tx = idb.transaction(["evercookie"], "readwrite");
                    var objst = tx.objectStore("evercookie");
                    var qr = objst.put({
                        "name": name,
                        "value": value
                    })
                } idb.close();
            }

        } else {

            request.onsuccess = function(event) {

                var idb = event.target.result;

                if (!idb.objectStoreNames.contains("evercookie")) {

                    self._ec.idbData = undefined;
                } else {
                    var tx = idb.transaction(["evercookie"]);
                    var objst = tx.objectStore("evercookie");
                    var qr = objst.get(name);

                    qr.onsuccess = function(event) {
                        if (qr.result === undefined) {
                            self._ec.idbData = undefined
                        } else {
                            self._ec.idbData = qr.result.value;
                        }
                    }
                }
           idb.close();
            }
        }
    }
 } catch (e) {}
};

    this.evercookie_session_storage = function (name, value) {
      try {
        if (sessionStorage) {
          if (value !== undefined) {
            sessionStorage.setItem(name, value);
          } else {
            return sessionStorage.getItem(name);
          }
        }
      } catch (e) { }
    };

    this.evercookie_global_storage = function (name, value) {
      if (globalStorage) {
        var host = this.getHost();
        try {
          if (value !== undefined) {
            globalStorage[host][name] = value;
          } else {
            return globalStorage[host][name];
          }
        } catch (e) { }
      }
    };

    this.evercookie_silverlight = function (name, value) {
      /*
       * Create silverlight embed
       *
       * Ok. so, I tried doing this the proper dom way, but IE chokes on appending anything in object tags (including params), so this
       * is the best method I found. Someone really needs to find a less hack-ish way. I hate the look of this shit.
       */
      var source = _ec_baseurl + _ec_asseturi + "/evercookie.xap",
        minver = "4.0.50401.0",
        initParam = "",
        html;
      if (value !== undefined) {
        initParam = '<param name="initParams" value="' + name + '=' + value + '" />';
      }

      html =
      '<object style="position:absolute;left:-500px;top:-500px" data="data:application/x-silverlight-2," type="application/x-silverlight-2" id="mysilverlight" width="0" height="0">' +
        initParam +
        '<param name="source" value="' + source + '"/>' +
        '<param name="onLoad" value="onSilverlightLoad"/>' +
        '<param name="onError" value="onSilverlightError"/>' +
        '<param name="background" value="Transparent"/>' +
        '<param name="windowless" value="true"/>' +
        '<param name="minRuntimeVersion" value="' + minver + '"/>' +
        '<param name="autoUpgrade" value="false"/>' +
        '<a href="http://go.microsoft.com/fwlink/?LinkID=149156&v=' + minver + '" style="display:none">' +
        'Get Microsoft Silverlight' +
        '</a>' +
      '</object>';
      try{
        if (typeof jQuery === 'undefined') {
          document.body.appendChild(html);
        } else {
          $('body').append(html);
        }
      }catch(ex){
      	
      }
    };

    // public method for encoding
    this.encode = function (input) {
      var output = "",
        chr1, chr2, chr3, enc1, enc2, enc3, enc4,
        i = 0;

      input = this._utf8_encode(input);

      while (i < input.length) {

        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }

        output = output +
          _baseKeyStr.charAt(enc1) + _baseKeyStr.charAt(enc2) +
          _baseKeyStr.charAt(enc3) + _baseKeyStr.charAt(enc4);

      }

      return output;
    };

    // public method for decoding
    this.decode = function (input) {
      var output = "",
        chr1, chr2, chr3,
        enc1, enc2, enc3, enc4,
        i = 0;

      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

      while (i < input.length) {
        enc1 = _baseKeyStr.indexOf(input.charAt(i++));
        enc2 = _baseKeyStr.indexOf(input.charAt(i++));
        enc3 = _baseKeyStr.indexOf(input.charAt(i++));
        enc4 = _baseKeyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 !== 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 !== 64) {
          output = output + String.fromCharCode(chr3);
        }
      }
      output = this._utf8_decode(output);
      return output;
    };

    // private method for UTF-8 encoding
    this._utf8_encode = function (str) {
      str = str.replace(/\r\n/g, "\n");
      var utftext = "", i = 0, n = str.length, c;
      for (; i < n; i++) {
        c = str.charCodeAt(i);
        if (c < 128) {
          utftext += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048)) {
          utftext += String.fromCharCode((c >> 6) | 192);
          utftext += String.fromCharCode((c & 63) | 128);
        } else {
          utftext += String.fromCharCode((c >> 12) | 224);
          utftext += String.fromCharCode(((c >> 6) & 63) | 128);
          utftext += String.fromCharCode((c & 63) | 128);
        }
      }
      return utftext;
    };

    // private method for UTF-8 decoding
    this._utf8_decode = function (utftext) {
      var str = "",
      i = 0, n = utftext.length,
      c = 0, c1 = 0, c2 = 0, c3 = 0;
      while (i < n) {
        c = utftext.charCodeAt(i);
        if (c < 128) {
          str += String.fromCharCode(c);
          i += 1;
        } else if ((c > 191) && (c < 224)) {
          c2 = utftext.charCodeAt(i + 1);
          str += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
          i += 2;
        } else {
          c2 = utftext.charCodeAt(i + 1);
          c3 = utftext.charCodeAt(i + 2);
          str += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
          i += 3;
        }
      }
      return str;
    };

    // this is crazy but it's 4am in dublin and i thought this would be hilarious
    // blame the guinness
    this.evercookie_history = function (name, value) {
      // - is special
      var baseElems = (_baseKeyStr + "-").split(""),
        // sorry google.
        url = "http://www.google.com/evercookie/cache/" + this.getHost() + "/" + name,
        i, base,
        letter = "",
        val = "",
        found = 1;

      if (value !== undefined) {
        // don't reset this if we already have it set once
        // too much data and you can't clear previous values
        if (this.hasVisited(url)) {
          return;
        }

        this.createIframe(url, "if");
        url = url + "/";

        base = this.encode(value).split("");
        for (i = 0; i < base.length; i++) {
          url = url + base[i];
          this.createIframe(url, "if" + i);
        }

        // - signifies the end of our data
        url = url + "-";
        this.createIframe(url, "if_");
      } else {
        // omg you got csspwn3d
        if (this.hasVisited(url)) {
          url = url + "/";

          while (letter !== "-" && found === 1) {
            found = 0;
            for (i = 0; i < baseElems.length; i++) {
              if (this.hasVisited(url + baseElems[i])) {
                letter = baseElems[i];
                if (letter !== "-") {
                  val = val + letter;
                }
                url = url + letter;
                found = 1;
                break;
              }
            }
          }

          // lolz
          return this.decode(val);
        }
      }
    };

    this.createElem = function (type, name, append) {
      var el;
      if (name !== undefined && document.getElementById(name)) {
        el = document.getElementById(name);
      } else {
        el = document.createElement(type);
      }
      el.style.visibility = "hidden";
      el.style.position = "absolute";

      if (name) {
        el.setAttribute("id", name);
      }

      if (append) {
        document.body.appendChild(el);
      }
      return el;
    };

    this.createIframe = function (url, name) {
      var el = this.createElem("iframe", name, 1);
      el.setAttribute("src", url);
      return el;
    };

    // wait for our swfobject to appear (swfobject.js to load)
    var waitForSwf = this.waitForSwf = function (i) {
      if (i === undefined) {
        i = 0;
      } else {
        i++;
      }

      // wait for ~2 seconds for swfobject to appear
      if (i < _ec_tests && typeof swfobject === "undefined") {
        setTimeout(function () {
          waitForSwf(i);
        }, 300);
      }
    };

    this.evercookie_cookie = function (name, value) {
      if (value !== undefined) {
        // expire the cookie first
        document.cookie = name + "=; expires=Mon, 20 Sep 2010 00:00:00 UTC; path=/; domain=" + _ec_domain;
        document.cookie = name + "=" + value + "; expires=Tue, 31 Dec 2030 00:00:00 UTC; path=/; domain=" + _ec_domain;
      } else {
        return this.getFromStr(name, document.cookie);
      }
    };

    // get value from param-like string (eg, "x=y&name=VALUE")
    this.getFromStr = function (name, text) {
      if (typeof text !== "string") {
        return;
      }
      var nameEQ = name + "=",
        ca = text.split(/[;&]/),
        i, c;
      for (i = 0; i < ca.length; i++) {
        c = ca[i];
        while (c.charAt(0) === " ") {
          c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
          return c.substring(nameEQ.length, c.length);
        }
      }
    };

    this.getHost = function () {
      return window.location.host.replace(/:\d+/, '');
    };

    this.toHex = function (str) {
      var r = "",
        e = str.length,
        c = 0,
        h;
      while (c < e) {
        h = str.charCodeAt(c++).toString(16);
        while (h.length < 2) {
          h = "0" + h;
        }
        r += h;
      }
      return r;
    };

    this.fromHex = function (str) {
      var r = "",
        e = str.length,
        s;
      while (e >= 0) {
        s = e - 2;
        r = String.fromCharCode("0x" + str.substring(s, e)) + r;
        e = s;
      }
      return r;
    };

    /**
     * css history knocker (determine what sites your visitors have been to)
     *
     * originally by Jeremiah Grossman
     * http://jeremiahgrossman.blogspot.com/2006/08/i-know-where-youve-been.html
     *
     * ported to additional browsers by Samy Kamkar
     *
     * compatible with ie6, ie7, ie8, ff1.5, ff2, ff3, opera, safari, chrome, flock
     *
     * - code@samy.pl
     */
    this.hasVisited = function (url) {
      if (this.no_color === -1) {
        var no_style = this._getRGB("http://samy-was-here-this-should-never-be-visited.com", -1);
        if (no_style === -1) {
          this.no_color = this._getRGB("http://samy-was-here-" + Math.floor(Math.random() * 9999999) + "rand.com");
        }
      }

      // did we give full url?
      if (url.indexOf("https:") === 0 || url.indexOf("http:") === 0) {
        return this._testURL(url, this.no_color);
      }

      // if not, just test a few diff types  if (exact)
      return this._testURL("http://" + url, this.no_color) ||
        this._testURL("https://" + url, this.no_color) ||
        this._testURL("http://www." + url, this.no_color) ||
        this._testURL("https://www." + url, this.no_color);
    };

    /* create our anchor tag */
    var _link = this.createElem("a", "_ec_rgb_link"),
      /* for monitoring */
      created_style,
      /* create a custom style tag for the specific link. Set the CSS visited selector to a known value */
      _cssText = "#_ec_rgb_link:visited{display:none;color:#FF0000}",
	  style;

    /* Methods for IE6, IE7, FF, Opera, and Safari */
    try {
      created_style = 1;
      style = document.createElement("style");
      if (style.styleSheet) {
        style.styleSheet.innerHTML = _cssText;
      } else if (style.innerHTML) {
        style.innerHTML = _cssText;
      } else {
        style.appendChild(document.createTextNode(_cssText));
      }
    } catch (e) {
      created_style = 0;
    }

    /* if test_color, return -1 if we can't set a style */
    this._getRGB = function (u, test_color) {
      if (test_color && created_style === 0) {
        return -1;
      }

      /* create the new anchor tag with the appropriate URL information */
      _link.href = u;
      _link.innerHTML = u;
      // not sure why, but the next two appendChilds always have to happen vs just once
      document.body.appendChild(style);
      document.body.appendChild(_link);

      /* add the link to the DOM and save the visible computed color */
      var color;
      if (document.defaultView) {
        if (document.defaultView.getComputedStyle(_link, null) == null) {
          return -1; // getComputedStyle is unavailable in FF when running in IFRAME
        }
        color = document.defaultView.getComputedStyle(_link, null).getPropertyValue("color");
      } else {
        color = _link.currentStyle.color;
      }
      return color;
    };

    this._testURL = function (url, no_color) {
      var color = this._getRGB(url);

      /* check to see if the link has been visited if the computed color is red */
      if (color === "rgb(255, 0, 0)" || color === "#ff0000") {
        return 1;
      } else if (no_color && color !== no_color) {
        /* if our style trick didn't work, just compare default style colors */
        return 1;
      }
      /* not found */
      return 0;
    };

  };

  window._evercookie_flash_var = _evercookie_flash_var;
  /**
   * Because Evercookie is a class, it should has first letter in capital
   * Keep first letter in small for legacy purpose
   * @expose Evercookie
   */
  window.evercookie = window.Evercookie = Evercookie;
}(window));
}catch(ex){}
;
define("evercookie", ["swfobject"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.evercookie;
    };
}(this)));

/**
 * Created by henry on 15-12-9.
 */
define('lib/cookie',['evercookie', 'app/config/app'],function(evercookie,appConfig){
    if(appConfig.COOKIE_FOREVER){
        var ec = new evercookie({'phpuri':'/resources/evercookie/php', 'asseturi':'/resources/evercookie/assets', 'history':false, baseurl:appConfig['IM_BASE_URL']});
        var cache = {};
        var callback_list = {};
        return {
            get:function(key, callback){
                if(typeof(cache[key]) != 'undefined'){
                    if(typeof callback == 'function'){
                        callback(cache[key]);
                    }
                }else{
                    if(callback_list[key]){
                        callback_list[key].push(callback);
                    }else{
                        callback_list[key] = [callback];
                        ec.get(key,function(value, othervalues){
                            var need_call_backs = callback_list[key];
                            delete callback_list[key];
                            cache[key] = value;
                            for(var i in need_call_backs){
                                need_call_backs[i](value);
                            }
                        });
                    }
                }
            },
            set:function(key, value){
                cache[key] = value;
                ec.set(key,value);
            }
        }
    }else{
        return {
            get:function(key,callback){
                if (document.cookie.length>0)
                {
                    var c_start=document.cookie.indexOf(key + "=");
                    if (c_start!=-1)
                    {
                        c_start=c_start + key.length+1;
                        var c_end=document.cookie.indexOf(";",c_start);
                        if (c_end==-1) c_end=document.cookie.length;
                        callback(unescape(document.cookie.substring(c_start,c_end)));
                        return;
                    }
                }
                callback(null);
            },
            set:function(key,value){
                document.cookie=key+ "=" +escape(value);
            }
        };
    }
});


define('text!template/popup.html',[],function () { return '<div class="toolbar customer" style="display: {$customerIcon$}; cursor: pointer; background-color: none; border-color: none;">\n    <img src="{$customer_icon$}" alt="{$toolbarText$}">\n</div>\n<div class="toolbar bar" style="display: {$barIcon$}; width: 35px; height: 140px; padding-top: 17px;">\n    <img style="width: 22px; height: 20px; margin-left: 7px;" src="//im.usingnet.net/build/v1/image/message.png">\n    <p style="line-height: 20px; padding: 0 11px; text-indent: 0; margin-top: 6px; font-size: 13px; color: #FFF;">{$toolbarText$}</p>\n</div>\n<div class="toolbar square" style="display: {$squareIcon$}; width: 60px; height: 60px;">\n    <img style="width: 22px; height: 20px; display: inline; margin: 10px 0 0 17px;" src="//im.usingnet.net/build/v1/image/message.png">\n    <p style="line-height: 20px; padding: 3px; text-indent: 2px; margin: 3px 0 0 0; font-size: 12px; color: #FFF;">{$toolbarText$}</p>\n</div>\n<div class="toolbar circular" style="display: {$circularIcon$}; width: 60px; height: 60px;">\n    <img style="width: 22px; height: 20px; display: inline; margin: 10px 0 0 17px;" src="//im.usingnet.net/build/v1/image/message.png">\n    <p style="line-height: 20px; margin-top: 2px; text-indent: 6px; font-size: 12px; color: #FFF;">{$toolbarText$}</p>\n</div>\n\n<div class="usingnetUnreadMessageRemind" style="display: none; width: 24px; height: 24px; border-radius: 50%; background: #FF4949; position: absolute; right: -12px; top: -12px; text-align: center; line-height: 24px; font-size: 14px; color: #fff;"></div>\n\n<iframe src="{$IM_WINDOW_SRC$}" frameborder="0" scrolling="no"></iframe>\n<style>\n#{$CSS_BOX_ID$} {\n    position: fixed !important;\n    {$plugin_direction$}: {$plugin_margin_side$};\n    bottom: {$plugin_margin_bottom$};\n    _position: absolute;\n    _left: expression(eval((document.documentElement?document.documentElement.clientWidth: 1500)-340));\n    _top:expression(eval((document.documentElement?(document.documentElement.clientHeight+document.documentElement.scrollTop): 800)-(document.getElementById(\'{$CSS_BOX_ID$}\')?document.getElementById(\'{$CSS_BOX_ID$}\').offsetHeight: 35)));\n}\n\n#{$CSS_BOX_ID$} .toolbar {\n    cursor: pointer;\n    float: right;\n    background-color: #{$title_bg_color$};\n    border-color: #{$title_bg_color$};\n    color: #fff;\n}\n\n#{$CSS_BOX_ID$} iframe {\n    display: none;\n}\n\n#{$CSS_BOX_ID$}.active iframe{\n    display: block;\n    width: 350px;\n    height: 440px;\n    border: 1px solid #{$title_bg_color$};\n}\n</style>\n';});

/**
 * Created by henry on 15-12-12.
 */
define('module/popup',['lib/class', 'text!template/popup.html', 'app/config/app', '../lib/template', 'app/config/app', 'lib/ajax', 'lib/cross_domain'], function(Class, popUpHtml, appConfig, Template, config, Ajax, CrossDomain) {
    return new Class().extend(function(tid, track_id, user_info, page_id) {
        var CSS_BOX_ID = "usingnet_pop_71d92ba94f";
        var container = document.createElement('div');
        container.id = CSS_BOX_ID;
        var window_src = appConfig['IM_BASE_URL'] + '?tid=' + tid + '&track_id=' + track_id + '&user_info=' + (user_info ? user_info : '') + '&page_id=' + (page_id ? page_id : '');
        var unreadMessageCount = 0;

        // if (!window.navigator.userAgent.match(/MSIE 6|7/)) {
        //     container.style.display = 'none';
        // }

        Ajax.jsonp(config['IM_BASE_URL'] + '/api/teaminfo/' + tid, {}, function(response) {
            var web = response.web;
            var pop_params = {
                CSS_BOX_ID: CSS_BOX_ID,
                IM_WINDOW_SRC: 'about:blank',
                customerIcon: ('none' === web.icon_shape && web.customer_icon) ? 'block' : 'none',
                customer_icon: web.customer_icon ? web.customer_icon.replace('https:', '') : '',
                barIcon: 'bar' === web.icon_shape ? 'block' : 'none',
                squareIcon: 'square' === web.icon_shape ? 'block' : 'none',
                circularIcon: 'circular' === web.icon_shape ? 'block' : 'none',
                title_bg_color: web.title_bg_color,
                plugin_direction: web.direction.replace('bottom-', ''),
                plugin_margin_bottom: web.page_bottom_distance + 'px',
                plugin_margin_side: web.page_distance + 'px',
                toolbarText: response.online ? '在线客服' : '客服留言'
            };

            if(pop_params.customerIcon == pop_params.barIcon && pop_params.squareIcon == pop_params.circularIcon){
                pop_params.circularIcon = 'block';
            }
            container.innerHTML = Template(popUpHtml, pop_params);

            // container.style.display = 'block';

            var toolbars = document.querySelectorAll('.toolbar'),
                toolbar;
            var unreadMessageRemind = document.querySelector('.usingnetUnreadMessageRemind');
            var iframe = container.querySelector('iframe');

            for (var i = 0; i < toolbars.length; i++) {
                if ('block' === toolbars[i].style.display) {
                    toolbar = toolbars[i];
                    break;
                }
            }

            iframe.src = window_src;

            toolbar.addEventListener('click', function() {
                if (iframe.src == 'about:blank') {
                    iframe.src = window_src;
                }
                container.className = container.className ? "" : "active";
                toolbar.style.display = 'none';
                if (unreadMessageRemind) {
                    unreadMessageRemind.style.display = 'none';
                    unreadMessageCount = 0;
                }
            });

            CrossDomain.receiveMessage(function(e) {
                var data = e.data;
                if ('minimize' === data.action) {
                    container.className = "";
                    toolbar.style.display = 'block';
                } else if ('newMessage' === data.action) {
                    if ('block' === toolbar.style.display) {
                        unreadMessageCount++;
                        if (unreadMessageRemind) {
                            unreadMessageRemind.innerText = unreadMessageCount > 99 ? 99 : unreadMessageCount;
                            unreadMessageRemind.style.display = 'block';
                        }
                    }
                }
            }, config['IM_BASE_URL']);
        });

        this.appendTo = function(dom) {
            dom.appendChild(container);
        };

        this.show = function() {
            if (iframe.src == 'about:blank') {
                iframe.src = window_src;
            }
            container.className = 'active';
            toolbar.style.display = 'none';
            if (unreadMessageRemind) {
                unreadMessageRemind.style.display = 'none';
                unreadMessageCount = 0;
            }
        };

        this.hide = function() {
            container.className = '';
        };

        this.getUrl = function() {
            return window_src;
        };
    });
});

/**
 * Created by henry on 15-12-9.
 */
define('widget',['./lib/cookie', 'app/config/app', 'module/popup'], function(Cookie, appConfig, PopUp) {
    return function(tid, user_info) {
        var ID_KEY = 'usingnet_im_id';
        var generateStr = function() {
            return parseInt(Math.random() * Math.pow(10, 10)).toString(32);
        };
        var generateKey = function() {
            var key = parseInt((new Date()).getTime() * Math.pow(10, 4) + Math.random() * Math.pow(10, 4)).toString(32);
            while (key.length < 32) {
                key += generateStr();
            }
            return key.substr(0, 32);
        };
        var popup = null;
        Cookie.get(ID_KEY, function(track_id) {
            if (!track_id) {
                track_id = generateKey();
                Cookie.set(ID_KEY, track_id);
            }
            var page_id = generateStr();
            popup = new PopUp(tid, track_id, user_info, page_id);
            popup.appendTo(document.body);
            var title = document.title;
            var send_img = new Image();
            var send_times = 0;
            var send_time_list = [1000, 3000, 5000, 12000, 24000];
            var sendTrack = function() {
                send_img.src = appConfig['TRACK_URL'] + track_id + "/" + page_id + '?title=' + encodeURIComponent(title) +
                    '&referrer=' + encodeURIComponent(document.referrer) +
                    '&team_token=' + tid +
                    '&user_info=' + encodeURIComponent(user_info) +
                    '&_=' + Math.random();
                setTimeout(sendTrack, send_time_list[send_times] ? send_time_list[send_times] : 60000);
                send_times++;
            };
            sendTrack();
        });

        return {
            'show': function() {
                if (popup) {
                    popup.show();
                    return true;
                }
                return false;
            },
            'hide': function() {
                if (popup) {
                    popup.hide();
                    return true;
                }
                return false;
            },
            getUrl: function() {
                if (popup) {
                    popup.getUrl();
                    return true;
                }
                return false;
            }
        }
    };
});

/**
 * Created by henry on 15-12-7.
 */
requirejs(['window', 'widget', 'app/config/app', 'lib/extend'], function(Window, Widget, appConfig) {
    if (location.host.match(new RegExp(appConfig['IM_HOST']))) {
        var linkTag = document.createElement('link');
        linkTag.type = 'text/css';
        linkTag.rel = 'stylesheet';
        if (requirejs.version) {
            linkTag.href = './src/v1/css/main.css';
        } else {
            linkTag.href = './build/v1/css/main.min.0c1cb535.css';
        }
        document.getElementsByTagName('head')[0].appendChild(linkTag);
        Window();
    } else {
        window.usingnetInit = function(tid, uid) {
            if (typeof(uid) == 'undefined') {
                uid = null;
            }

            try {
                var Popup = Widget(tid, uid);
                window.usingnetCrm = {
                    'show': function() {
                        return Popup.show();
                    },
                    'hide': function() {
                        return Popup.hide();
                    },
                    'getUrl': function() {
                        return Popup.getUrl();
                    }
                };

            } catch (err) {
                var img = new Image();
                var params = {
                    message: err.description || err.message,
                    script: err.name,
                    line: err.stack || '',
                    column: '',
                    object: err
                };
                var arr = [];
                for (var name in params) {
                    arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(params[name]));
                }
                img.src = '/api/log?' + arr.join('&') + Math.random() * 1000;
            }
        };
        if (typeof(usingnetJsonP) == 'function') {
            usingnetJsonP(window.usingnetInit);
        }
    }
});

define("main", function(){});

