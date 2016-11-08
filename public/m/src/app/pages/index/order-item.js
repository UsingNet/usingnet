/**
 * Created by henry on 16-2-20.
 */
define(['lib/class',
    'lib/template',
    'text!template/order-item.html',
    './message-box',
    'lib/useragent',
    'api/order'
], function(Class, Template, tpl, MessageBox, UserAgent, OrderApi){
    var storage = [];
    var lastOrderId = location.search.match(/order_id=(\d+)/)?location.search.match(/order_id=(\d+)/)[1]:null;

    var OrderItem = (new Class()).extend(function(orderData){
        var me = this;
        me.messageBox = new MessageBox(orderData);
        me.data = orderData;
        me.$ = $(Template(tpl, orderData));
        me.$.click(function(){
            me.select();
        });

        storage.push(me);
    });

    OrderItem.getSelection = function(){
        for(var i = 0;i<storage.length;i++){
            if(storage[i].$.hasClass('selected')){
                return storage[i];
            }
        }
    };

    OrderItem.findOrCreate = function(orderData){
        var result = storage.filter(function(o){return o.data['id'] == orderData['id'];});
        return result[0]?result[0]:(new OrderItem(orderData));
    };

    OrderItem.applyFirst = function(){
        if(lastOrderId){
            for(var i = 0;i<storage.length;i++){
                if(storage[i].data && storage[i].data.id == lastOrderId){
                    storage[i].select();
                    return true;
                }
            }
        }

        if(storage.length>0){
            storage[0].select();
            return true;
        }

        return false;
    };

    OrderItem.prototype.close = function(category){
        var me = this;
        $.ajax({
            url:'/api/order/' + me.data.id,
            type:"DELETE",
            data:JSON.stringify({category:category}),
            success:function(){
                me.messageBox.close();
                OrderApi.sync();
                location.reload();
            }
        })
    };

    OrderItem.prototype.updatePopup = function(){
        var orderData = this.data;
        // Init Customer-Basic
        var CustomerBasic = $('.popup-customer-basic');
        CustomerBasic.find('[data-id="address"]').html((orderData.contact.package && orderData.contact.package.address)?orderData.contact.package.address:'局域网');
        CustomerBasic.find('[data-id="ip"]').html((orderData.contact.package && orderData.contact.package.ip)?orderData.contact.package.ip:'未知');
        var user_agent = UserAgent.parse((orderData.contact.package && orderData.contact.package.user_agent)?orderData.contact.package.user_agent:'');
        CustomerBasic.find('[data-id="os"]').html(user_agent.os);
        CustomerBasic.find('[data-id="browser"]').html(user_agent.browser.name);
        var tags = [];
        for(var i = 0;i<orderData.contact.tags.length;i++){
            var tag = orderData.contact.tags[i];
            tags.push('<span style="background:#'+tag['color']+'">'+tag['name']+'</span>');
        }
        CustomerBasic.find('[data-id="tags"]').html(tags.join('&nbsp;'));

        // Init Customer-detail
        var CustomerDetail = $('.popup-customer-detail');
        CustomerDetail.find('[data-id="content"').html(orderData.contact.html || (orderData.contact.package && orderData.contact.package.html) || '系统未提供详细信息');

        // Init Customer-plugin
        var CustomerPlugin = $('.popup-customer-plugin');
        CustomerPlugin.find('[data-id="frame"]').attr('src', orderData.contact.iframe || (orderData.contact.package && orderData.contact.package.iframe) || 'about:blank');
    };

    OrderItem.prototype.select = function(){
        if(!this.$.hasClass('selected')){
            this.$.siblings().removeClass('selected');
            this.$.addClass('selected');
            this.messageBox.apply();
            $('.page-current header h1').html('正在与 ' + this.data.contact.name + '对话');
            lastOrderId = this.data.id;
            this.updatePopup();
        }
        // replace message-box and title, update user info
    };

    return OrderItem;
});