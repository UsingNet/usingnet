/**
 * Created by henry on 15-12-8.
 */
define(['./class', './mode/websocket', 'app/config/app', './ajax', './event', '../module/evaluation', 'lib/cross_domain'], function(Class, Socket, appConfig, Ajax, Event, Evaluation, crossDomain) {
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
