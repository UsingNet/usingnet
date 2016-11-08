/**
 * Created by henry on 16-1-18.
 */
define(['lib/extend'],function(){

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