/**
 * Created by jhli on 16-2-24.
 */
Ext.define('Admin.view.communication.historyDialogue.widgets.HistoryCustomerInfo', {
    extend: 'Ext.tab.Panel',
    xtype: 'historycustomerinfo',
    activeTab: 0,
    tabPosition: 'right',
    items: [{
        title: '客户信息',
        itemId: 'customerbasic',
        padding: 10,
        tpl: '<div class="customerInfo">' +
        '<img class="imgInfo" src="{imgSrc}">' +
        '<h3>{name}</h3>' +
        '<p>对话开始于：{time}</p>' +
        '<ul>' +
        '<li><b>地址</b><span>{address}</span></li>' +
        '<li><b>操作系统</b><span>{system}</span></li>' +
        '<li><b>IP</b><span>{ip}</span></li>' +
        '<li><b>浏览器</b><span>{browser}</span></li>' +
        '</ul>' +
        '<div class="tags">' +
        '<strong>' +
        '<i class="x-fa fa-tags"></i>' +
        '标签' +
        '</strong>' +
        '<div>' +
        '{tagshtml}' +
        '</div>' +
        '</div>' +
        '</div>'
    }, {
        title: '客户自定义信息',
        itemId: 'customerinfo',
        padding: 10
    }, {
        title: '客服插件',
        itemId: 'customeriframe',
        padding: 10
    }],
    listeners: {
        afterrender: function() {
            var me = this;
            var metaData = this.up('window').config.customData.metaData;
            var contact = metaData.contact;
            var userAgentInfo = Admin.view.communication.customerService.singleton.UserAgentLib.parse(contact['package'].user_agent);
            var tagshtml = '';
            Ext.each(contact.tags, function(tag) {
                tagshtml += '<span style=" background-color: #' + tag.color + ' !important;">' + tag.name + '</span>';
            });
            var data = {
                imgSrc: contact.img,
                name: contact.name,
                ip: contact.ip || '未知IP',
                address: contact['package'].address || '未知地区',
                system: userAgentInfo.os || '未知系统',
                browser: userAgentInfo.browser.name || '未知浏览器',
                time: metaData.created_at,
                tagshtml: tagshtml || ''
            };
            me.down('#customerbasic').setData(data);

            var customerinfo = me.down('#customerinfo');
            var html = contact['package'].html;
            if (html) {
                customerinfo.setHtml(html);
                customerinfo.setDisabled(false);
            } else {
                customerinfo.setDisabled(true);
            }
            var customeriframe = me.down('#customeriframe');
            var iframe = contact.iframe;
            if (iframe) {
                customeriframe.setDisabled(false);
                customeriframe.setHtml('<iframe src="http://' + location.hostname + '/api/proxy?url=' + encodeURIComponent(iframe) + '" style="width: 100%; height: 100%;"></iframe>');
            } else {
                customeriframe.setDisabled(true);
            }
        }
    }
});