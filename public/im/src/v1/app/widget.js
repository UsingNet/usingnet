/**
 * Created by henry on 15-12-9.
 */
define(['./lib/cookie', 'app/config/app', 'module/popup'], function(Cookie, appConfig, PopUp) {
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
