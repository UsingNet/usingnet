/**
 * Created by henry on 16-1-27.
 */
Ext.define('Admin.view.main.Profile', {
    extend: 'Ext.panel.Panel',
    xtype: 'menuprofile',
    bodyStyle: {
        background: 'transparent'
    },
    setMicro: function(flag) {
        this.down('#userNickName').setHidden(flag);
        var onlineswitch = this.down('onlineswitch');
        var rightPanel = this.down('#profilePanel');
        onlineswitch.up().remove(onlineswitch, false);
        if (flag) {
            this.add(onlineswitch);
            this.setHeight(70);
            onlineswitch.setMargin('3 0 0 -5');
        } else {
            onlineswitch.setMargin('2 2 2 8');
            rightPanel.add(onlineswitch);
            this.setHeight(49);
        }
    },
    items: [{
        xtype: 'panel',
        width: '100%',
        bodyStyle: {
            background: 'transparent'
        },
        //layout: {
        //    type: 'hbox',
        //    align: 'stretch'
        //},
        layout: 'hbox',
        items: [{
            xtype: 'image',
            id: 'menuAvatar',
            src: 'https://almsaeedstudio.com/themes/AdminLTE/dist/img/user2-160x160.jpg',
            height: 42,
            width: 42,
            style: {
                borderRadius: '50%',
                border: '2px solid #FFF',
                background: '#fff'
            },
            listeners: {
                afterrender: function() {
                    var me = this;
                    var avatar = Ext.getCmp('userImg');
                    avatar.addListener('change', function() {
                        me.setSrc(avatar.src);
                    });
                    me.setSrc(avatar.src);
                }
            }
        }, {
            xtype: 'panel',
            itemId: 'profilePanel',
            flex: 1,
            userCls: 'transparentBg',
            items: [{
                itemId: 'userNickName',
                xtype: 'tbtext',
                padding: '3 0 0 15',
                style: {
                    color: '#FFF',
                    'fontWeight': 'bold'
                },
                html: '用户名',
                listeners: {
                    afterrender: function() {
                        var me = this;
                        Admin.data.User.addListener('change', function(){
                            me.fireEvent('beforerender');
                        });
                    },
                    beforerender:function(){
                        if(Admin.data.User.store){
                            this.setHtml(Admin.data.User.store.name);
                            var me = this;
                            Admin.data.User.addListener('change', function() {
                                me.setHtml(Admin.data.User.store.name);
                            });
                        }
                    }
                }
            }, {
                xtype: 'onlineswitch',
                margin: '9 2 2 8'
            }]
        }]
    }]
});
