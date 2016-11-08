/**
 * Created by jhli on 15-12-17.
 */
Ext.define('Admin.view.settings.voiceService.VoiceServiceController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.voiceService',

    containerActivate: function(container) {
        var voipStatus = Admin.data.Permission.get('chat.voip');
        var voipData = Admin.data.Team.get('voip');

        if (voipData) {
            if (voipStatus.status) {
                container.down('form').getForm().setValues(voipData);
                container.query('toolbar').forEach(function(item) {
                    if ('top' === item.dock) {
                        item.items.getAt(2).setText('申请成功，请设置您的团队电话，有电话呼入时会转发到您申请的IVR号码：' + voipData.number);
                        item.items.getAt(2).show();
                    } else {
                        item.setDisabled(false);
                    }
                });
            } else {
                var need = voipStatus.need;
                var prompt = '';
                if (3 === need.length) {
                    prompt = '要使用电话功能，请购买专业版或其以上的套餐，进行并通过团队认证。';
                }

                if (2 === need.length && 'PLAN' === need[0]) {
                    prompt = '要使用电话功能，请购买专业版或其以上的套餐。';
                }

                if (2 === need.length && 'IDENTITY' === need[0]) {
                    prompt = '要使用电话功能，请进行并通过团队认证。';
                }

                if (1 === need.length) {
                    container.query('toolbar').forEach(function(item) {
                        if ('top' === item.dock) {
                            item.items.items.forEach(function(subitem) {
                                subitem.hide();
                            });
                            if ('INIT' === voipData.status) {
                                item.items.getAt(0).show();
                            } else if ('CHECKING' === voipData.status) {
                                item.items.getAt(1).show();
                            } else if ('SUCCESS' === voipData.status) {
                                item.items.getAt(2).setText('申请成功，请设置您的团队电话，有电话呼入时会转发到您申请的IVR号码：' + voipData.number);
                                item.items.getAt(2).show();
                            }
                        }
                    });
                }

                if (prompt) {
                    container.query('toolbar').forEach(function(item) {
                        if ('top' === item.dock) {
                            item.items.items.forEach(function(subitem) {
                                subitem.hide();
                            });
                            item.items.getAt(3).setText(prompt);
                            item.items.getAt(3).show();
                        }
                    });
                }
            }
        }
    }
});