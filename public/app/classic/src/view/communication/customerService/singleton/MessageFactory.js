Ext.define('Admin.view.communication.customerService.singleton.MessageFactory', {
    singleton: true,
    onMessageEmit: function(message, chatPanel) {
        if (message.xtype != "checkmoremessage" && message.metaData.direction == "RECEIVE" &&  (!message.metaData['package'] || !message.metaData['package']['read'])) {
            chatPanel.unreadCountInc();
        }

        var itemLength = chatPanel.items.items.length;
        while (itemLength--) {
            if (chatPanel.items.getAt(itemLength).createdAt < message.metaData.created_at) {
                break;
            }else if(chatPanel.items.getAt(itemLength).createdAt == message.metaData.created_at){
                if(chatPanel.items.getAt(itemLength).metaData &&  chatPanel.items.getAt(itemLength).metaData._id && chatPanel.items.getAt(itemLength).metaData._id < message.metaData._id){
                    break;
                }
            }
        }

        if (!message.metaData.action && !message.metaData.isTail) {
            chatPanel.clickTailBtn = false;
        }
        chatPanel.insert(itemLength + 1, message);

        this.refreshDom(chatPanel);
    },
    refreshDom: function(chatPanel){
        var panelDom = chatPanel.el.dom;
        var imgs = panelDom.querySelectorAll('img');
        var videos = panelDom.querySelectorAll('video');

        for (var i = 0; i < imgs.length; i++) {
            imgs[i].style.cursor = 'pointer';
            if (imgs[i].complete) {
                imgs[i].setAttribute('onclick', "Ext.create('Admin.view.communication.customerService.editor.widgets.ImgZoomWin', { metadata: { src: '" + imgs[i].src + "', width: " + imgs[i].width + ", height: " + imgs[i].height + " } });");
            } else {
                imgs[i].addEventListener('load', function() {
                    var me = this;
                    this.setAttribute('onclick', "Ext.create('Admin.view.communication.customerService.editor.widgets.ImgZoomWin', { metadata: { src: '" + me.src + "', width: " + me.width + ", height: " + me.height + " } });");
                    var height = chatPanel.getHeight();
                    chatPanel.setHeight(height - 1);
                    chatPanel.setHeight(height);
                });
            }
        }

        for (var j = 0; j < videos.length; j++) {
            if (!(videos[j].readyState > 1)) {
                videos[j].addEventListener('canplay', function() {
                    var height = chatPanel.getHeight();
                    chatPanel.setHeight(height - 1);
                    chatPanel.setHeight(height);
                });
            }
        }

    },
    emit: function(data, chatPanel) {
        if ('message' === data.type) {
            var me = this;
            me.appendMessage(chatPanel, data.data);
        } else if ('event' === data.type) {
            if (this.listeners.events[data.data.action]) {
                this.listeners.events[data.data.action](data.data, chatPanel, this);
            }
        }
        chatPanel.showLastMessage();
    },
    appendMessage:function(chatPanel, data){
        var me = this;
        if(me.listeners.messages[data.type]){
            me.listeners.messages[data.type](data, chatPanel, me);
        }
        if(me.messageXtype[data.type]){
            me.onMessageEmit({
                xtype: me.messageXtype[data.type],
                metaData: data
            }, chatPanel);
        }
    },
    messageXtype:{
        'IM':'immessage',
        'MAIL':'mailmessage',
        'SYSTEM':'systemmessage',
        'NOTE':'notemessage',
        'WECHAT':'wechatmessage',
        'SMS':'smsmessage'
    },
    listeners: {
        messages: {
            SYSTEM: function(data, chatPanel, factory) {
                if (!data.isTail && data.notice && 'voip' === data.notice.type) {
                    var tree = Ext.getCmp('treelist');
                    tree.items.each(function(node) {
                        if (node.workOrderChatPanel.id === chatPanel.id) {
                            tree.select(node);
                            Admin.data.AgentPhone.setOrder(node);
                            var voiceEditor = chatPanel.up('customerservice').down('voiceeditor');
                            if (voiceEditor) {
                                voiceEditor.fireEvent('talking');
                            } else {
                                var menu = Ext.getCmp('sendTypeCombo').getMenu();
                                menu.items.each(function(menuitem) {
                                    if ('VOICE' === menuitem.metaData.type) {
                                        menuitem.handler();
                                    }
                                });
                                voiceEditor = chatPanel.up('customerservice').down('voiceeditor');
                                voiceEditor.fireEvent('talking');
                            }

                        }
                    });
                }
            },
            SMS: function(data, chatPanel, factory) {
                if (!data.isTail) {
                    var sending = chatPanel.items.items.filter(function(item) {
                        return item.metaData._id === data._id;
                    });
                    if (sending.length) {
                        sending[0].el.dom.getElementsByClassName('smsSending')[0].setAttribute('class', 'fa fa-check-circle smsSent');
                        return;
                    }
                }
            }
        },
        events: {
            remote_offline: function(data, chatPanel, factory) {
                chatPanel.workOrderComponent.fireEvent('remoteoffline');
            },
            remote_online: function(data, chatPanel, factory) {
                chatPanel.workOrderComponent.fireEvent('remoteonline');
            },
            read: function(data, chatPanel, factory) {
                var items = chatPanel.items.items;
                for (var i = 0; i < items.length; i++) {
                    if (data.message._id === items[i].metaData._id) {
                        if (!items[i].metaData['package']) {
                            items[i].metaData['package'] = {};
                        }
                        if (!items[i].metaData['package'].read) {
                            chatPanel.unreadCountDes();
                        }
                        items[i].metaData['package'].read = true;
                    }
                }
            },
            online: function(data, chatPanel, factory) {
                if (chatPanel.items.items.length) {
                    return;
                }

                chatPanel.WebSocket.send({
                    action: 'tail',
                    limit: 20+1,
                    read: true
                    //order_id: chatPanel.workOrder.id
                });
                var message = {
                    xtype: 'checkmoremessage',
                    createdAt: 0,
                    hidden: false,
                    chatPanel: chatPanel,
                    metaData: data,
                    click: function() {
                        var lastMessage = this.chatPanel.items.getAt(1);
                        var lastId = lastMessage?lastMessage.metaData._id:null;
                        this.chatPanel.clickTailBtn = true;
                        this.chatPanel.WebSocket.send({
                            action: 'tail',
                            last_id: lastId,
                            limit: 20+1,
                            read: true
                        });
                    }
                };
                factory.onMessageEmit(message, chatPanel);
            },
            tail: function(data, chatPanel, factory) {
                var messages = data.messages;
                if (messages.length < 20+1) {
                    //chatPanel.remove(chatPanel.items.getAt(0), true);
                    chatPanel.items.getAt(0).hide();
                } else {
                    chatPanel.items.getAt(0).show();
                }

                // i > 0 , 忽略最后一条，最后一条用作标记是否有更多消息
                for (var i = messages.length - 1, k = 0; i >= 0; i--) {
                    if(messages.length == 20+1 && i==0){
                        break;
                    }
                    var msgType = messages[i]['type'];
                    messages[i].isTail = true;
                    if (messages[i].body.match(/<(img|audio|video)/) && (i != (messages.length - 1))) {
                        k++;
                        (function(factory, msgType, messages, i, chatPanel) {
                            setTimeout(function() {
                                factory.appendMessage(chatPanel, messages[i]);
                                //factory.listeners.messages[msgType](messages[i], chatPanel, factory);
                                if (!--k) {
                                    setTimeout(function() {
                                        chatPanel.updateLayout(true);
                                        chatPanel.showLastMessage();
                                    }, 100);
                                }
                            }, 100 * k);
                        })(factory, msgType, messages, i, chatPanel);
                    } else {
                        factory.appendMessage(chatPanel, messages[i]);
                        //factory.listeners.messages[msgType](messages[i], chatPanel, factory);
                    }
                }
                //self.scrollBy(0, 0);
            },
            notice: function(data, chatPanel, factory) {
                if ('typing' === data.data.action) {
                    chatPanel.fireEvent('customertyping', data.data.message);
                }
            }
        }
    }
});
