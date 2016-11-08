/**
 * Created by henry on 16-2-20.
 */
define(['lib/class', 'lib/template', 'text!template/message.html', 'lib/websocket'], function(Class, Template, tpl, Connection){

    var storage = [];

    var MessageBox = (new Class()).extend(function(orderData){
        var me = this;
        storage.push(me);
        me.orderData = orderData;
        me.$ = $('<div class="message-box"></div>');

        $.getJSON('/api/message/agent', {
            type:'IM',
            remote:orderData['contact']['token'],
            _:Math.random()
        }, function(response){
            if(navigator && navigator.appVersion && navigator.appVersion.match('MQQBrowser')) {
                me.conn = new Connection('ws://'+location.hostname.replace(/^m\./,'ws.')+'/ws?_token='+response.data);
            }else{
                me.conn = new Connection('ws'+(location.protocol=='https:'?'s':'')+'://'+location.hostname.replace(/^m\./,'ws.')+'/ws?_token='+response.data);
            }
            me.conn.addEventListener('message', function(e){
                var message = e.data;
                if(message.type == 'event'){
                    switch(message.data.action){
                        case 'online':
                            me.tail(true);
                            break;
                        case 'heartbeat':case 'tail':case 'offline':case 'read':case 'remote_online':case 'remote_offline':
                            break;
                        default:
                            debugger;
                    }
                }else{
                    if(message.data.direction != 'SEND') {
                        me.conn.send({"action": "read", "_id": message.data._id});
                    }
                    me.appendMessage(message.data)
                }
            });
            me.conn.connect();
        });
    });

    MessageBox.prototype.appendMessage = function(messageData){
        this.$.append(Template(tpl,messageData));
        $('.content')[0].scrollTop = this.$[0].scrollHeight;
    };

    MessageBox.prototype.close = function(){
        this.conn.close();
        this.$.parent().hide();
        $('#index').find('header h1').html('请选择工单');
        this.$.replaceWith('<div class="message-box"></div>')
    };

    MessageBox.prototype.prependHistoryMessage = function(messagesData){
        if(messagesData.length) {
            var html = '';
            for (var i in messagesData) {
                html += Template(tpl, messagesData[i]);
            }
            this.$.prepend(html);
        }else{
            $.toast('已无更早的消息');
        }
    };

    MessageBox.prototype.apply = function(){
        var messageBoxDom = $('.message-box');
        messageBoxDom.parent().show();
        messageBoxDom.replaceWith(this.$[0]);
        $('.content')[0].scrollTop = this.$[0].scrollHeight;
    };

    MessageBox.prototype.sendMessage = function(message){
        if(this.orderData.contact) {
            $.post('/api/message/agent', {type: this.orderData.type, to: this.orderData.contact.id, body: message});
        }else{
            $.toast('联系人不存在');
        }
    };

    MessageBox.prototype.tail = function(isInit){
        var me = this;
        this.conn.send({
            "action":"tail",
            "last_id":$('.message-box .message').attr('data-id'),
            "limit":20,
            "read": true
        },function(message){
            me.prependHistoryMessage(message.data.messages);
            if(isInit){
                $('.content')[0].scrollTop = me.$[0].scrollHeight;
            }else{
                $.pullToRefreshDone('.pull-to-refresh-content');
            }
        });
    };

    var getCurrentMessageBox = function(){
        var nowMessageBox = $('.message-box');
        for(var i = 0;i<storage.length;i++){
            if(nowMessageBox[0] == storage[i].$[0]){
                return storage[i];
            }
        }
    };

    $(document).on('refresh', '.pull-to-refresh-content',function(e) {
        var messageBox = getCurrentMessageBox();
        messageBox.tail();
    });

    $(document).on('click', '.message-box .message img', function(){
        var photos = [];
        $('.message-box .message img').each(function(i, obj){
            photos.push(obj.src);
        });
        var photoBrowser = $.photoBrowser({
            photos : photos
        });
        photoBrowser.open();
    });

    var messageInput = $('[data-action="message-input"]');

    var sendButton = $('[data-action="send-message"]');
    var sendInputText = function(){
        var text = messageInput.val();
        var messageBox = getCurrentMessageBox();
        if(messageBox){
            messageBox.sendMessage(text);
            messageInput.val('');
            messageInput.focus();
        }else{
            $.alert('请选择工单');
        }
    };
    sendButton.click(function(){
        sendInputText();
        return false;
    });
    messageInput.keypress(function(e){
       if(e.keyCode == 13 || e.keyCode == 10){
           sendInputText();
       }
    });

    return MessageBox;

});