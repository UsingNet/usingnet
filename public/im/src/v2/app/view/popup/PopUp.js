/**
 * Created by henry on 16-1-19.
 */
define(['lib/class', 'text!./PopUp.html', 'text!./PopUpMobile.html', 'lib/cookie', 'lib/template', 'lib/editor4screen', 'lib/browser', 'lib/ajax'], function(Class, html, htmlMobile, Cookie, Template, Editor, Browser, Ajax) {
    var container = document.createElement('div');
    var iframeSrc = null;
    var ID_KEY = 'usingnet_im_id';
    var CHATTING_KEY = 'is_chatting';
    var SOCKET_TOKEN = '_usingnet_socket';
    container.className = '__usingnetClassNameForCustom';
    container.style.position = 'fixed';
    container.style.bottom = '0';
    //container.style.boxShadow = 'rgba(0,0,0,0.5) 0 5px 10px';
    container.style.boxShadow = 'none';
    container.style.zIndex = 2147483547;
    var unreadMessageCount = 0;

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
    var initPopUp = function(src, teamInfo, clientObj, token) {
        if (teamInfo.web) {

        }
        iframeSrc = src;
        if (token) {
            iframeSrc += '&token=' + token;
        }
        if (!teamInfo.web) {
            teamInfo.web = {};
        }
        var title = null;
        var iframe = null;
        var copyright = null;
        var unreadMessageRemind = null;
        var showCopyright = !teamInfo.plan;
        var bgColor = teamInfo.web.title_bg_color;
        var directionPairs = teamInfo.web.direction.split('-');
        if (Browser.isMobile) {
            if (bgColor) {
                var rgb = 0;
                for (var i = 1; i < 7; i += 2) {
                    rgb += parseInt("0x" + bgColor.slice(i, i + 2));
                }
                if (rgb >= 450) {
                    teamInfo.web.iconSrc = '//im.usingnet.net/build/v2/image/contact4.png';
                } else {
                    teamInfo.web.iconSrc = '//im.usingnet.net/build/v2/image/contact3.png';
                }
            }
            container.innerHTML = Template(htmlMobile, teamInfo);
            container.style.bottom = (teamInfo.web.page_bottom_distance || "0") + 'px';
            container.style.boxShadow = 'none';
            iframe = container.querySelector('iframe');
            title = container.querySelector('div');
            iframe.style.zIndex = 2147483557;
            iframe.style.position = 'fixed';
            iframe.style.top = 0;
            iframe.style.left = 0;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.display = 'none';
        } else {
            container.innerHTML = Template(html, teamInfo);
            iframe = container.querySelector('iframe');
            title = container.querySelector('div') || container.querySelector('img');
            copyright = container.querySelector('.__youxinCopyright');
            unreadMessageRemind = container.querySelector('.usingnetUnreadMessageRemind');
            container.style.bottom = (teamInfo.web.page_bottom_distance || "0") + 'px';


            if (directionPairs[0] === 'middle') {
                var holder = container.querySelector('#__USINGNET_HOLDER');
                container.style.bottom = (window.innerHeight / 2) + (parseInt(holder.style.height) / 2) + parseInt(teamInfo.web.page_distance)  + 'px';
            }

            if (directionPairs[1] == 'left') {
                container.style.left = (teamInfo.web.page_distance || "20") + 'px';
            } else {
                container.style.right = (teamInfo.web.page_distance || "20") + 'px';
            }


            iframe.style.zIndex = 2147483557;
            iframe.style.width = '350px';
            iframe.style.height = '440px';
            iframe.style.display = 'none';
        }


        iframe.src = iframeSrc;
        title.style.display = 'block';

        title.addEventListener('click', function() {
            Cookie.set(CHATTING_KEY, 1);
            if (!token) {
                Ajax.jsonp('//im.usingnet.net/api/message/client', clientObj, function (response) {
                    if (response.success) {
                        Cookie.set(SOCKET_TOKEN, response.data)
                        iframeSrc += '&token=' + response.data;
                        iframe.src = iframeSrc;
                        iframe.onload = setTimeout(openPop, 300);
                    }
                });
            } else {
                openPop()
            }

            function openPop() {
                if (!Browser.isMobile) {
                    var switchStatus = function(){
                        iframe.style.display = iframe.style.display == 'none' ? 'block' : 'none';
                        title.style.display = title.style.display == 'none' ? 'block' : 'none';
                        showCopyright ? (copyright.style.display = copyright.style.display == 'none' ? 'block' : 'none') : '';

                        if ('none' === title.style.display && unreadMessageRemind) {
                            unreadMessageRemind.style.display = 'none';
                            unreadMessageCount = 0;
                        }

                        if (iframe.style.display == 'block') {
                            container.style.bottom = '0px';
                            container.style.boxShadow = 'rgba(0,0,0,0.5) 0 5px 10px';
                        } else {
                            container.style.bottom = (teamInfo.web.page_bottom_distance || "0") + 'px';
                            container.style.boxShadow = 'none';
                        }
                    };

                    switchStatus();
                    /*
                    if (iframe.src == 'about:blank') {
                        iframe.src = iframeSrc;
                        iframe.onload = setTimeout(switchStatus, 300);
                    }else{
                        switchStatus();
                    }
                    */
                } else {
                    window.open(iframeSrc);
                }
            }
        });

        // title.click();

        window.addEventListener('message', function(e) {
            if (e.data) {
                try {
                    var messageData = JSON.parse(e.data);
                    switch (messageData.action) {
                        case 'inviteDialogue':
                            if ('none' === iframe.style.display) {
                                var message = messageData.message;
                                var inviteClosed = !!message.invite_closed;
                                Cookie.get('_USINGNET_INVITE_CLOSED', function(closed) {
                                    if (!inviteClosed || (inviteClosed && !closed)) {
                                        var invite = document.createElement('div');
                                        invite.id = 'usingnet_invite_container';
                                        invite.innerHTML = '<div><img src="' + message.invite_img + '" /><p>' + message.invite_text.substr(0, 27) + '</p><i class="inviteClose"></i></div>';
                                        document.body.appendChild(invite);
                                        var inviteContent = invite.querySelector('div');
                                        inviteContent.addEventListener('click', function(e) {
                                            if (e.target.className === 'inviteClose') {
                                                this.style.display = 'none'
                                                if (inviteClosed) {
                                                    Cookie.set('_USINGNET_INVITE_CLOSED', 1);
                                                }
                                            } else {
                                                // window.usingnetCrm.show();
                                                if ('none' === iframe.style.display) {
                                                    title.click();
                                                }
                                                this.style.display = 'none';
                                            }
                                        }, false);
                                    }
                                });
                            }
                            break;
                        case 'newMessage':
                            if ('block' === title.style.display) {
                                unreadMessageCount++;
                                if (unreadMessageRemind) {
                                    unreadMessageRemind.innerText = unreadMessageCount > 99 ? 99 : unreadMessageCount;
                                    unreadMessageRemind.style.display = 'block';
                                }
                            }
                            break;
                        case 'minimize':
                            iframe.style.display = iframe.style.display == 'none' ? 'block' : 'none';
                            title.style.display = title.style.display == 'none' ? 'block' : 'none';
                            showCopyright ? (copyright.style.display = copyright.style.display == 'none' ? 'block' : 'none') : '';
                            container.style.bottom = (teamInfo.web.page_bottom_distance || "0") + 'px';
                            if (directionPairs[0] === 'middle') {
                                container.style.bottom = (window.innerHeight / 2 + parseInt(teamInfo.web.page_distance)) + 'px';
                            }
                            container.style.boxShadow = 'none';
                            Cookie.set(CHATTING_KEY, 0);
                            break;
                        case 'cutScreen':
                            Editor(document.body, function(data) {
                                iframe.contentWindow.postMessage(JSON.stringify({
                                    data: data,
                                    type: 'image/png',
                                    encode: 'base64',
                                    action: 'sendScreen'
                                }), '*');
                            });
                            break;
                        default:
                    }
                } catch (e) {}
            }
        }, false);



        return {
            show: function() {
                var showDialog = function(){
                    iframe.style.display = 'block';
                    title.style.display = 'none';
                    showCopyright ? (copyright.style.display = 'block') : '';
                    container.style.bottom = '0px';
                    Cookie.set(CHATTING_KEY, 1);
                    if (!Browser.isMobile) {
                        container.style.boxShadow = 'rgba(0,0,0,0.5) 0 5px 10px';
                    } else {
                        container.style.boxShadow = 'none';
                    }
                    if (unreadMessageRemind) {
                        unreadMessageRemind.style.display = 'none';
                        unreadMessageCount = 0;
                    }
                };
                try {
                    if (iframe.src == 'about:blank') {
                        iframe.src = iframeSrc;
                        iframe.onload = function(){
                          setTimeout(showDialog, 500);
                        };
                    }else{
                        showDialog();
                    }
                } catch (e) {}
            },
            hide: function() {
                iframe.style.display = 'none';
                title.style.display = 'block';
                showCopyright ? (copyright.style.display = 'none') : '';
                container.style.bottom = (teamInfo.web.page_bottom_distance || "0") + 'px';
                container.style.boxShadow = 'none';
                Cookie.set(CHATTING_KEY, 0);
            },
            getUrl: function() {
                return iframeSrc;
            }
        };
    };

    return new Class().extend(function(tid, user_info, teamInfo) {

        this.appendTo = function(dom) {
            dom.appendChild(container);
        };
        var popup = null;
        Cookie.get(ID_KEY, function(track_id) {
            if (!track_id) {
                track_id = generateKey();
                Cookie.set(ID_KEY, track_id);
            }
            var page_id = generateStr();
            //var popup = new PopUp(tid, track_id, user_id, page_id);
            //popup.appendTo(document.body);
            var title = document.title;
            var send_img = new Image();
            var send_times = 0;
            var send_time_list = [1000, 3000, 5000, 12000, 24000];
            var sendTrack = function() {
                send_img.src = "//im.usingnet.net/track/" + track_id + "/" + page_id + '?title=' + encodeURIComponent(title) +
                    '&referrer=' + encodeURIComponent(document.referrer) +
                    '&user_info=' + (user_info ? encodeURIComponent(JSON.stringify(user_info)) : '') +
                    '&team_token=' + tid + '&_=' + Math.random();
                setTimeout(sendTrack, send_time_list[send_times] ? send_time_list[send_times] : 60000);
                send_times++;
            };
            sendTrack();
            var clientObj = {
                to: tid,
                from: track_id,
                user_info: user_info ? encodeURIComponent(JSON.stringify(user_info)) : ''
            };

            Cookie.get(SOCKET_TOKEN, function (token) {
                var url = '//im.usingnet.net/?tid=' + tid + '&track_id=' + track_id + '&user_info=' + (user_info ? encodeURIComponent(JSON.stringify(user_info)) : '') + '&page_id=' + page_id;
                popup = initPopUp(url, teamInfo, clientObj, token);
            });
        });

        this.show = function() {
            if (popup) {
                popup.show();
                return true;
            }
            return false;
        };

        this.hide = function() {
            if (popup) {
                popup.hide();
                return true;
            }
            return false;
        };

        this.getUrl = function() {
            if (popup) {
                return popup.getUrl();
            }
            return false;
        };

        Cookie.get(CHATTING_KEY, function(isChatting) {
            var isPc = !Boolean(navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i));
            if ('1' == isChatting && isPc) {
                popup.show();
            }
        });
    });
});
