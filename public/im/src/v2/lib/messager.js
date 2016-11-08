/**
 * Created by henry on 15-12-8.
 */
define(['lib/class', 'lib/mode/websocket', 'lib/ajax', 'lib/event', 'view/messagebubble/MessageBubble', 'lib/cookie'], function(Class, Socket, Ajax, Event, Bubble, Cookie) {
    return new Class().extend(function(local, remote, user_info, teamInfo, page_id, type, token) {
        var self = this;
        var mode = null;
        var SOCKET_TOKEN = '_usingnet_socket'

        if (typeof(type) == 'undefined') {
            type = 'IM';
        }
        if (typeof(page_id) == 'undefined') {
            page_id = null;
        }

        this.typing = function(message) {
            if (mode) {
                mode.send({ "action": "typing", "message": message });
            }
        };

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

        this.send = function(message, email, phone, isLm) {
            if (typeof(email) == 'undefined') {
                email = null;
            }
            if (typeof(phone) == 'undefined') {
                phone = null;
            }

            var group = document.querySelector('#displayAgentGroup');
            var group_id = group && group.getAttribute('data-id');

            var data = {
                body: message,
                from: local,
                to: remote,
                type: type,
                user_info: user_info,
                page_id: page_id,
                email: email,
                phone: phone
            };

            if (group_id) {
                data.group_id = group_id;
            }

            if (isLm) {
                Ajax.post('/api/message/lm', data, function(response) {
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
                return;
            }

            Ajax.post('/api/message/client', data, function(response) {
                if (!response.success) {
                    var nextEvent = new Event("error");
                    nextEvent.data = response.msg;
                    nextEvent.value = data.body;
                    self.triggerEvent(nextEvent);
                } else {
                    var nextEvent = new Event("sent");
                    nextEvent.data = response.data;
                    self.triggerEvent(nextEvent);

                    var serviceGroup = document.querySelector('#displayAgentGroup');
                    if (serviceGroup) {
                        serviceGroup.style.zIndex = '-10000';
                    }
                }
            });
        };


        var afterTokenApply = function(response) {
            if (response.success) {
                if (navigator && navigator.appVersion && navigator.appVersion.match('MQQBrowser')) {
                    mode = new Socket("ws://ws.usingnet.net/ws?_token=" + response.data);
                } else {
                    mode = new Socket("wss://ws.usingnet.net/ws?_token=" + response.data);
                }
                mode.connect();
                mode.send({ "action": "tail", "read": true });
                mode.addEventListener('message', function(event) {
                    if (mode.isClose) {
                        return;
                    }

                    if (event.data && 'message' === event.data.type && event.data.data && event.data.data['package']) {
                        //结束对话后弹出评论窗口
                        if (event.data.data['package'].action === 'closed') {
                            var evaluationButton = document.querySelector('#evaluationButton');
                            setTimeout(function() {
                                if (evaluationButton) {
                                    evaluationButton.click();
                                }
                            }, 2500);
                        }

                        // 客服邀请进入对话
                        if (event.data.data['package'].action === 'invite') {
                            //mode.close();
                            if (!token) {
                                Ajax.get('/api/message/client', {
                                    from: local,
                                    to: remote,
                                    type: 'IM',
                                    user_info: user_info,
                                    _: Math.random()
                                }, function (response) {
                                    if (response.success) {
                                        Cookie.set(SOCKET_TOKEN, response.data);
                                        //afterTokenApply(response);
                                        mode.send({
                                            action: 'add_token',
                                            token: [response.data]
                                        })
                                    }
                                });
                            }
                        }
                    }

                    if (event.data && 'message' === event.data.type) {
                        var postData = {
                            action: 'newMessage',
                            message: event.data.data.body
                        };
                        if (document.referrer) {

                            window.parent.postMessage(JSON.stringify(postData), document.referrer);
                        }
                    }

                    // 判断是否后台发来的typing action
                    if(event.data && 'event' === event.data.type && 'notice' === event.data.data.action && event.data.data.data){
                        if ('typing' === event.data.data.data.action) {
                            clearTimeout(self.timeoutId);
                            var typingMessage = event.data.data.data.message;
                            var remindTextField = document.querySelector('header address i');
                            remindTextField.innerText = '客服正在输入中...';
                            self.timeoutId = setTimeout(function() {
                                remindTextField.innerText = '正在为您服务';
                            }, 800);
                        }
                        if (event.data.data.data.action == 'undo'){
                            var message = document.getElementById('message-'+event.data.data.data._id);
                            if(message){
                                message.className = (message.className?(message.className+' '):'') + 'gray';
                                message.innerHTML = '<div>[已撤销]</div>';
                                setTimeout(function(){
                                    message.style.display = 'none';
                                },1000);
                            }
                        }
                    }

                    var data = event.data.data;

                    if (data.direction && 'SEND' === data.direction) {
                        mode.send({
                            action: 'read',
                            _id: data._id
                        });
                    }

                    if (event.data) {
                        if ('message' === event.data.type && event.data.data['package']['order_id']) {
                            var evaluationAgent = document.getElementById('evaluationAgent');
                            if (evaluationAgent) {
                                evaluationAgent.value = event.data.data['package']['order_id'];
                            }
                        }
                        var nextEvent = new Event(event.data.type);
                        nextEvent.data = event.data;
                        self.triggerEvent(nextEvent);
                    }
                });


                mode.addEventListener('tokenerror', function() {
                    Ajax.get('/api/message/client', {
                        from: local,
                        to: remote,
                        type: 'IM',
                        user_info: user_info,
                        _: Math.random()
                    }, function(response) {
                        if (response.success) {
                            if (navigator && navigator.appVersion && navigator.appVersion.match('MQQBrowser')) {
                                mode.setUrl("ws://ws.usingnet.net/ws?_token=" + response.data);
                            } else {
                                mode.setUrl("wss://ws.usingnet.net/ws?_token=" + response.data);
                            }
                        }
                    });
                });
            } else {
                Bubble.showError(response.msg ? response.msg : '服务器内部错误。', 5);
                //Error.show("错误", "服务器内部错误", response.msg, 360000);
                //setTimeout(getToken, Math.pow(2, requestTokenCount) * 1000);
            }
        };

        if (type == 'IM') {
            if (window == parent && !token) {
                Cookie.get(SOCKET_TOKEN, function (token) {
                    if (!token) {
                        Ajax.get('/api/message/client', {
                            from: local,
                            to: remote,
                            type: 'IM',
                            user_info: user_info,
                            _: Math.random()
                        }, function (response) {
                            afterTokenApply(response)
                        });
                    }
                })
            } else {
                if (token) {
                    afterTokenApply({
                        success: true,
                        data: token
                    });
                }  else {
                    Cookie.get(SOCKET_TOKEN, function (token) {
                        afterTokenApply({
                            success: true,
                            data: token ? token : teamInfo.im_token
                        });
                    });
                }
            }

            /*
            if(teamInfo.im_token){
                afterTokenApply({
                    success: true,
                    data: teamInfo.im_token
                });
            }else{
                Ajax.get('/api/message/client', {
                    from: local,
                    to: remote,
                    type: 'IM',
                    user_info: user_info,
                    _: Math.random()
                }, afterTokenApply);
            }
            */
        }
    });
});
