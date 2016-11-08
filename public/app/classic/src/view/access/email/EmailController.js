/**
 * Created by jhli on 15-12-17.
 */
Ext.define('Admin.view.access.email.EmailController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.emailaccess',

    containerActivate: function(container) {
        var mailStatus = Admin.data.Permission.get('chat.mail');
        var mailData = Admin.data.Team.get('mail');

        if (mailData) {
            if (mailStatus.status) {
                container.down('form').getForm().setValues(mailData);
                container.query('toolbar').forEach(function(item) {
                    if ('top' === item.dock) {
                        item.items.getAt(1).show();
                    } else {
                        item.setDisabled(false);
                    }
                });
            } else {
                var need = mailStatus.need;
                var prompt = '';
                if (3 === need.length) {
                    prompt = '要使用邮件功能，请购买专业版或其以上的套餐，进行并通过团队认证。';
                }

                if (2 === need.length && 'PLAN' === need[0]) {
                    prompt = '要使用邮件功能，请购买专业版或其以上的套餐。';
                }

                if (2 === need.length && 'IDENTITY' === need[0]) {
                    prompt = '要使用邮件功能，请进行并通过团队认证。';
                }

                if (1 === need.length) {
                    container.query('toolbar').forEach(function(item) {
                        if ('top' === item.dock) {
                            item.items.items.forEach(function(subitem) {
                                subitem.hide();
                            });
                            if ('INIT' === mailData.status) {
                                item.items.getAt(0).show();
                            } else if ('SUCCESS' === mailData.status) {
                                item.items.getAt(1).show();
                            }
                        } else {
                            item.setDisabled(false);
                        }
                    });
                }

                if (prompt) {
                    container.query('toolbar').forEach(function(item) {
                        if ('top' === item.dock) {
                            item.items.items.forEach(function(subitem) {
                                subitem.hide();
                            });
                            item.items.getAt(2).setText(prompt);
                            item.items.getAt(2).show();
                        }
                    });
                }
            }
        }
    }
});
