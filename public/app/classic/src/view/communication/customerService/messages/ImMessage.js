Ext.define('Admin.view.communication.customerService.messages.ImMessage', {
    extend: 'Ext.panel.Panel',
    xtype: 'immessage',
    width: '100%',
    padding: '0 10 0 10',
    data: {
        time: '',
        message: '',
        name: '',
        img: '',
        displayTime: 'none',
        remote: false
    },
    userCls: 'messages',
    //tpl: '<div class="bubble" style="margin-bottom: 10px;"><div class="message">{message}</div></div>',
    //'<div class="time"><span>{time}</span></div>' +
    tpl:  new Ext.XTemplate(
        '<div class="message-time" style="display: {displayTime}">',
            '<span>{time}</span>',
        '</div>',
        '<div class="message-container">',
            //'<img class="portrait" src="{img}">' +
            '<div class="portrait" style="background: url({img}' + '-avatar' + '); background-size: 100% 100%;"></div>',
            '<div class="body-container">',
                '<div class="name">{name}</div>',
                '<div class="bubble">',
                    '<div class="arrows"></div>',
                    '<div class="message">{message}</div>',
                '</div>' +
            '</div>' +
        '</div>'
    ),

    items: [],
    listeners: {
        render: function() {
            this.addCls(Ext.getClass(this).getName().split('.').pop());
            if (this.config.data.remote) {
                this.addCls('remote');
            }
        },
        afterrender: function() {
            this.data.message = Admin.view.communication.customerService.singleton.FaceLib.textToHtml(this.data.message);
            this.setData(this.data);
        }
    },

    constructor:function(){
        var me = this;
        me.callParent(arguments);
        if(!me.data){
            me.data = {};
        }

        var data = me.metaData;
        var pkg = data['package'];
        if(!me.data.time){
            me.data.time = me.data.time || Admin.data.Tools.CustomTools.formatTime(data.created_at * 1000);
        }
        if(!me.data.img){
            if('SEND' === data.direction){
                if(pkg.agent) {
                    me.data.img = pkg.agent.img;
                }
            }else{
                if(pkg.contact) {
                    me.data.img = pkg.contact.img;
                }
            }
        }
        if(!me.data.name){
            if('SEND' === data.direction){
                if(pkg.agent) {
                    me.data.name = pkg.agent.id === Admin.data.User.get('id') ? '我' : pkg.agent.name;
                }
            }else{
                if(pkg.contact) {
                    me.data.name = pkg.contact.name;
                }
            }
        }
        if(!me.data.message){
            me.data.message = data.body;
        }
        if(!me.data.remote){
            me.data.remote = 'SEND' !== data.direction;
        }

        me.createdAt = data.created_at;
    }
});
