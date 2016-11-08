/**
 * Created by henry on 16-1-19.
 */
requirejs(['lib/ajax', 'lib/url', 'lib/template', 'text!./theme.html','./view/im/serviceGroup/ServiceGroup', './view/im/Im', './view/messagebubble/MessageBubble', './view/popup/PopUp', './view/lm/Lm', './view/order/Order', './view/im/messageform/tools/Wiki'], function (Ajax, Url, Template, themeTemplate, ServiceGroup, Im, Bubble, PopUp, Lm, Order, Wiki) {
    if (location.host.match(/im.usingnet.net/)) {
        var linkTag = document.createElement('link');
        linkTag.type = 'text/css';
        linkTag.rel = 'stylesheet';
        if (requirejs.version) {
            linkTag.href = './src/v2/css/main.css';
        } else {
            linkTag.href = './build/v2/css/main.min.css';
        }
        document.getElementsByTagName('head')[0].appendChild(linkTag);
        if (Url.search('tid') && Url.search('track_id') && Url.search('page_id')) {
            Ajax.jsonp('/api/teaminfo/' + Url.search('tid'), {track_id:Url.search('track_id'), user_info:Url.search('user_info')}, function (teamInfo) {

                if (teamInfo.web.invite) {
                    setTimeout(function() {
                        var postData = {
                            action: 'inviteDialogue',
                            message: teamInfo.web
                        };
                        if (document.referrer) {
                            window.parent.postMessage(JSON.stringify(postData), document.referrer);
                        }
                    }, teamInfo.web.invite_wait_time * 1000);
                }


                var themeContainer = document.createElement('div');
                themeContainer.innerHTML = Template(themeTemplate, teamInfo.web || {});
                if (themeContainer.children.length) {
                    document.body.appendChild(themeContainer.children[0]);
                }

                if (location.href.match(/#wiki/g)) {
                    var im = new Im(Url.search('tid'), Url.search('track_id'), Url.search('page_id'), Url.search('user_info'), teamInfo);
                    im.appendTo(document.body);

                    Ajax.jsonp('/api/knowledge/' + Url.search('wikiId'), {}, function (knowledge) {
                        new Wiki(knowledge, true);
                    });
                    return;
                }

                if(teamInfo.web.type=='ORDER' && !teamInfo.current_order){
                    var order = new Order(Url.search('tid'), Url.search('track_id'), Url.search('page_id'), Url.search('user_info'), teamInfo);
                    order.appendTo(document.body);
                }else{
                    if (teamInfo.online || teamInfo.web.type == 'IM') {
                        var im = new Im(Url.search('tid'), Url.search('track_id'), Url.search('page_id'), Url.search('user_info'), teamInfo, Url.search('token'));
                        im.appendTo(document.body);

                        if (teamInfo.web.display_agent_group) {
                            var serviceGroup = new ServiceGroup(teamInfo);
                            serviceGroup.appendTo(document.body);
                        }
                    } else {
                        var lm = new Lm(Url.search('tid'), Url.search('track_id'), Url.search('page_id'), Url.search('user_info'), teamInfo);
                        lm.appendTo(document.body);
                    }
                }
            });
        } else {
            Bubble.showError('初始化失败：缺少参数。', 5);
            //Error.show("错误", "初始化失败", "缺少参数， 请确保含有参数tid, track_id, page_id");
        }
    } else {
        window.usingnetInit = function (tid, user_info) {
            if (typeof(user_info) == 'undefined') {
                user_info = null;
            }
            if (!tid) {
                return false;
            }

            try {
                Ajax.jsonp('//im.usingnet.net/api/teaminfo/' + tid, {}, function (teamInfo) {
                    var popup = new PopUp(tid, user_info, teamInfo);
                    popup.appendTo(document.body);

                    window.usingnetCrm = {
                        'show': function () {
                            return popup.show();
                        },
                        'hide': function () {
                            return popup.hide();
                        },
                        'getUrl': function () {
                            return popup.getUrl();
                        }
                    };
                });
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
