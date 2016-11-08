Ext.define('Admin.view.communication.customerService.messages.MailMessage', {
    extend: 'Admin.view.communication.customerService.messages.ImMessage',
    xtype: 'mailmessage',
    data: {
        time: '',
        message: '',
        title: '',
        remote: false
    },
    tpl: '<div class="message-time" style="display: {displayTime}">' +
        '<span>{time}</span>' +
        '</div>' +
        '<div class="message-container">' +
        //'<img class="portrait" src="{img}">' +
        '<div class="portrait" style="background: url({img}' + '-avatar' + '); background-size: 100% 100%;"></div>' +
        '<div class="body-container">' +
        '<div class="name">{name}</div>' +
        '<div class="bubble">' +
        '<div class="arrows"></div>' +
        '<div class="mail">' +
        '<h4 class="title">{title}</h4>' +
        '<div class="body">{message}</div>' +
        '<input type="button" value="阅读邮件" />' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>',
    //tpl: '<div class="time">' +
    //'<span>{time}</span>' +
    //'</div>' +
    //'<div class="bubble">' +
    //    '<div class="mail">' +
    //        '<h4 class="title">{title}</h4>' +
    //        '<div class="body">{message}</div>' +
    //        '<input type="button" value="阅读邮件" />' +
    //    '</div>' +
    //'</div>',

    listeners: {
        render: function(panel) {
            panel.body.on('click', function(e) {
                var target = e.getTarget();
                if ('button' === target.type) {
                    var src = 'https://' + location.host + '/api/message/mail/' + panel.metaData._id;
                    Ext.create('Ext.window.Window', {
                        title: panel.metaData['package'].subject || '无主题',
                        padding: 20,
                        autoDestroy: true,
                        closable: true,
                        modal: true,
                        autoShow: true,
                        maximizable: true,
                        width: '80%',
                        height: '80%',
                        listeners: {
                            afterrender: function(win) {
                                var data = panel.metaData;
                                var attachments = data['package'].attachments;
                                if (attachments && attachments.length) {
                                    var list = document.getElementById('__attachmentsList');
                                    var listItems = ['<li>附件：</li>'];

                                    Ext.Array.each(attachments, function(item, index, arr) {
                                        listItems.push('<li><a target="_blank" style="color: #004FF2; text-decoration: none;" href=' + item.url + '>' + item.name + '</a></li>');
                                    });
                                    list.innerHTML = listItems.join('');
                                    list.style.display = 'block';
                                }
                            },
                            resize: function(win, width, height, eOpts) {
                                win.child().nextNode().setHeight(height);
                                var iframe = document.getElementById('mailiframe');
                                iframe.width = width - 40;
                                iframe.height = height - 40 - win.child().getHeight() - 50 - document.getElementById('__attachmentsList').offsetHeight;
                            }
                        },
                        items: [{
                            xtype: 'panel',
                            html: "<div>" +
                            "<iframe seamless id='mailiframe' src=" + src + "></iframe>" +
                            "<ul id='__attachmentsList' style='list-style: none; padding: 0; display: none;'></ul>" +
                            "</div>"
                        }],
                        bbar: [
                            '->', {
                                xtype: 'button',
                                ui: 'soft-green',
                                text: '关闭',
                                handler: function(button) {
                                    button.ownerCt.up().close();
                                }
                            }
                        ]
                    });
                }
            });

        }
    },

    constructor:function() {
        var me = this;
        me.callParent(arguments);

        var data = me.metaData;
        me.data.message = data.body.replace(/<.*?>/ig, "").substr(0, 25);
        me.data.title = data['package'].subject;
    }
});
