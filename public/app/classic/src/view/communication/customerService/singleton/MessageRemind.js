/**
 * Created by jhli on 16-01-14.
 */
Ext.define('Admin.view.communication.customerService.singleton.MessageRemind', {
    singleton: true,
    title: null,
    count: {
        message: 0,
        order: 0
    },
    isFocus: true,
    constructor: function() {
        var me = this;
        window.onfocus = function() {
            me.isFocus = true;
        };
        window.onblur = function() {
            me.isFocus = false;
        };

        Admin.data.User.on('onlinetiming', function() {
            if ('1' != Ext.util.Cookies.get('online')) {
                me._cancelTitleRemind();
                me._closeBrowserRemind();

                var navigation = Ext.getCmp('navigationTreeList');
                var treeStore = navigation.getStore();
                var item = navigation.getItem(treeStore.data.getAt(1));
                var dom = item.el.dom.querySelector('div.x-treelist-item-text');
                dom.className = 'x-treelist-item-text';
            }
        });
    },
    _voiceRemind: function() {
        var me = this;
        var voiceType = Admin.data.User.get('extend.voiceType');
        var remindType = Admin.data.User.get('extend.remindType');
        var voiceRemindAudio = null;
        if ('short' === voiceType) {
            voiceRemindAudio = document.getElementById('orderRemindingAudio');
        } else if ('long' === voiceType) {
            voiceRemindAudio = document.getElementById('longRemindingAudio');
        }

        function handler() {
            clearTimeout(me.voiceTimeoutId);
            me.voiceTimeoutId = setTimeout(function() {
                if (me.count.message || me.count.order) {
                    voiceRemindAudio.play();
                } else {
                    voiceRemindAudio.removeEventListener('ended', handler);
                    clearTimeout(me.voiceTimeoutId);
                }
            }, 10000);
        }

        if ('one' === remindType) {
            voiceRemindAudio.removeEventListener('ended', handler);
            clearTimeout(me.voiceTimeoutId);
            voiceRemindAudio.play();
        } else if ('multi' === remindType) {
            voiceRemindAudio.removeEventListener('ended', handler);
            voiceRemindAudio.addEventListener('ended', handler);
            clearTimeout(me.voiceTimeoutId);
            voiceRemindAudio.play();
        }
    },
    _titleRemind: function() {
        if (!this.title) {
            this.title = {
                content: document.title
            };
            var step = 0;
            var title = document.title;
            this.title.intervalId = setInterval(function() {
                step++;
                if (3 === step) {
                    step = 1
                }
                if (1 === step) {
                    document.title = '【　　　】' + title;
                }
                if (2 === step) {
                    document.title = '【新消息】' + title;
                }
            }, 1000);
        }
    },
    _cancelTitleRemind: function() {
        if (this.title) {
            clearInterval(this.title.intervalId);
            document.title = this.title.content;
            this.title = null;
        }
    },
    _browserRemind: function() {
        var me = this;
        if (!('Notification' in window) || ('notification' in me) || me.isFocus) {
            return;
        }
        Notification.requestPermission(function(permission) {
            var config = {
                body: '你有新的工单消息！',
                icon: 'resources/images/youxinlogo.png',
                dir: 'auto'
            };
            me.notification = new Notification('有新消息！', config);
            me.notification.onclose = function(e) {
                delete me.notification;
            };
        });
    },
    _closeBrowserRemind: function() {
        if ('notification' in this) {
            this.notification.close();
        }
    },
    fireRemindHnadler: function(option) {
        if (option) {
            for (var name in option) {
                if (option.hasOwnProperty(name)) {
                    if (option[name] > this.count[name]) {
                        this._voiceRemind();
                        this._browserRemind();
                    }
                    this.count[name] = option[name];
                }
            }
            if (this.count.message || this.count.order) {
                this._titleRemind();
            } else {
                this._cancelTitleRemind();
                this._closeBrowserRemind();
            }
        }
    }
});
