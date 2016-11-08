/**
 * Created by jhli on 15-12-21.
 */
Ext.define('Admin.view.settings.weixin.Weixin', {
    extend: 'Ext.container.Container',
    scrollable: true,
    requires: [
        'Admin.view.settings.weixin.WeixinModel',
        'Admin.view.settings.weixin.WeixinController',
        'Ext.window.Window',
        'Ext.grid.Panel'
    ],
    xtype: 'weixin',
    cls: 'shadow',
    viewModel: {
        type: 'weixin'
    },
    layout: 'vbox',
    controller: 'weixin',
    items: [{
        xtype: 'grid',
        title: '微信接入',
        flex: 1,
        margin: 20,
        cls: 'shadow',
        width: '100%',
        bind: {
            store: '{weixin}'
        },
        columns: [{
            xtype: 'rownumberer'
        }, {
            text: '昵称',
            dataIndex: 'nick_name',
            width: '15%'
        }, {
            text: '服务器URL',
            dataIndex: 'url',
            flex: 3
        }, {
            text: '认证状态',
            dataIndex: 'verify_type_info',
            renderer: function(value) {
                return value ? '未认证' : '已认证';
            }
        }, {
            text: '传输方式',
            dataIndex: 'mode',
            flex: 1,
            renderer: function(value) {
                return 'EXPRESS' == value ? '明文' : '加密';
            }
        }, {
            text: '操作',
            align: 'center',
            xtype: 'actioncolumn',
            items: [{
                iconCls: 'x-fa fa-cog',
                tooltip: '设置',
                handler: function(grid, rowIndex, colIndex, eOpts, el, record) {
                    Ext.create('Admin.view.settings.weixin.widgets.WechatSetting', {
                        grid: grid,
                        record: record
                    });
                }
            }, {
                iconCls: 'x-fa fa-times-circle',
                tooltip: '删除',
                handler: function(grid, rowIndex, colIndex) {
                    Ext.Msg.confirm('删除', '确定要删除这个微信接入吗?', function(btnId) {
                        if ('yes' === btnId) {
                            var store = grid.getStore();
                            var rec = grid.getStore().getAt(rowIndex);
                            Ext.Ajax.request({
                                url: '/api/setting/wechat/' + rec.id,
                                method: 'DELETE',
                                success: function() {
                                    Ext.data.StoreManager.lookup('storeWeixin').reload();
                                }
                            });
                        }
                    });
                }
            }]
        }],
        tools: [{
                xtype: 'button',
                text: '一键接入',
                ui: 'soft-green',
                handler: function() {
                    window.open('/api/wechat/auth');
                }
            }
            //, {
            //    text: '开发者接入',
            //    width: 100,
            //    ui: 'soft-green',
            //    handler: function() {
            //        var dialog = Ext.create('Admin.view.settings.weixin.widgets.DeveloperAccessDialog');
            //        dialog.show();
            //    }
            //}
        ],
        listeners: {
            afterrender: function() {
                Admin.data.Team.addListener('sync', function() {
                    Ext.data.StoreManager.lookup('storeWeixin').load();
                });
            }
        }
    }, {
        xtype: 'panel',
        title: '接入说明',
        flex: 1,
        width: '100%',
        margin: '0 20 20 20',
        cls: 'shadow',
        scrollable: true,
        userCls: 'code-highlight',
        html: '<div style="padding: 20px;">' +
            // '<h3>一键接入:</h3>' +
            '<ol>' +
            '<li>公众号必须是认证的订阅号或服务号，</li>' +
            '<li>公众号原有的菜单和事件不再有效，</li>' +
            '<li>如果公众号开启了开发者模式，请将微信后台的服务器信息添加到接入设置。优信会将微信的消息转发到开发者服务器中。当需要客服接入时， 请直接输出如下 XML。</li>' +
            '</ol>' +
            // '<h3>其他说明:</h3>' +
            // '<ol>' +
            // '<li>公众帐号必须是认证的订阅号或服务号。</li>' +
            // '<li>公众帐号接入后，之前的自定义菜单和自动回复功能将会失效。</li>' +
            // '<li>需要保留之前功能，请在接入设置中加入服务器 URL，优信将消息原封不动的转发到你的服务器。</li>' +
            // '<li>需要客服介入时，直接输出 ***transfer_customer_service*** 优信将接管当前用户的所有消息直到对话结束。</li>' +
            // '</ol>' +
            //'<h3>开发者接入:</h3>' +
            //'<ol>' +
            //    '<li>适用于有开发能力的用户。</li>' +
            //    '<li>您的公众账号必须为认证的订阅号或服务号</li>' +
            //    '<li>授权接入后，自定义菜单和自动回复等仍在原后台处理</li>' +
            //    '<li>设置接入需要您将消息转发至优信 API</li>' +
            //'</ol>' +
            //'<h4>消息转发示例:</h4>' +
            //'<p>开发者只用转发需要客服处理的消息</p>' +
            //'<p>请求方法: POST<br>请求URL: <a target="_blank" href="http://' + location.hostname + '/api/wechat/callback" rel="nofollow">http://' + location.hostname + '/api/wechat/callback</a><br>发送内容:</p>' +
            // '<pre class="code highlight white xml"><code><span class="nt">&lt;xml&gt;</span>\n   <span class="nt">&lt;ToUserName&gt;</span><span class="cp">&lt;![CDATA[toUser]]&gt;</span><span class="nt">&lt;/ToUserName&gt;</span>\n   <span class="nt">&lt;FromUserName&gt;</span><span class="cp">&lt;![CDATA[fromUser]]&gt;</span><span class="nt">&lt;/FromUserName&gt;</span> \n   <span class="nt">&lt;CreateTime&gt;</span>1348831860<span class="nt">&lt;/CreateTime&gt;</span>\n   <span class="nt">&lt;MsgType&gt;</span><span class="cp">&lt;![CDATA[text]]&gt;</span><span class="nt">&lt;/MsgType&gt;</span>\n   <span class="nt">&lt;Content&gt;</span><span class="cp">&lt;![CDATA[this is a test]]&gt;</span><span class="nt">&lt;/Content&gt;</span>\n   <span class="nt">&lt;MsgId&gt;</span>1234567890123456<span class="nt">&lt;/MsgId&gt;</span>\n<span class="nt">&lt;/xml&gt;</span></code></pre>' +
            '<pre class="code highlight white xml"><code><span class="nt">&lt;xml&gt;</span>\n    <span class="nt">&lt;ToUserName&gt;</span><span class="cp">&lt;![CDATA[touser]]&gt;</span><span class="nt">&lt;/ToUserName&gt;</span>\n    <span class="nt">&lt;FromUserName&gt;</span><span class="cp">&lt;![CDATA[fromuser]]&gt;</span><span class="nt">&lt;/FromUserName&gt;</span>\n    <span class="nt">&lt;CreateTime&gt;</span>1399197672<span class="nt">&lt;/CreateTime&gt;</span>\n    <span class="nt">&lt;MsgType&gt;</span><span class="cp">&lt;![CDATA[transfer_customer_service]]&gt;</span><span class="nt">&lt;/MsgType&gt;</span>\n<span class="nt">&lt;/xml&gt;</span></code></pre>' +
            '</div>'
    }]
});
