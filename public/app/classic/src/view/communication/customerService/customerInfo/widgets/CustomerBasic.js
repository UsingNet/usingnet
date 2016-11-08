Ext.define('Admin.view.communication.customerService.customerInfo.widgets.CustomerBasic', {
    extend: 'Ext.panel.Panel',
    xtype: 'customerbasic',
    scrollable: 'y',
    requires: [
        'Ext.data.JsonP'
    ],
    title: '客户基本信息',
    tbar: [{
        xtype: 'displayfield',
        width: '100%',
        value: '从左侧列表选择客户',
        fieldStyle: 'color: #818181;',
        style: {
            textAlign: 'center',
            marginTop: '390px'
        }
    }],
    tpl: '<div class="customerInfo">' +
        '<img class="imgInfo" src="{imgSrc}' + '-avatar' + '">' +
        '<h3>{name}</h3>' +
        '<p>对话开始于：{time}</p>' +

        '<div id="typeCombobox" style="margin: 10px 15px;"></div>' +

        '<div class="customerInfoEditor">' +
        '<form>' +
        '<label for="name"><i class="x-fa fa-pencil-square"></i>姓名</label>' +
        '<input type="text" name="name" value="{contact.name}" />' +
        '<br />' +
        '<label for="remark"><i class="x-fa fa-map"></i>备注</label>' +
        '<input id="lijiahong" type="text" name="remark" value="{contact.remark}" />' +
        '<br />' +
        '<label for="phone"><i class="x-fa fa-phone-square"></i>手机</label>' +
        '<input type="phone" name="phone" value="{contact.phone}" />' +
        '<br />' +
        '<label for="email"><i class="x-fa fa-envelope"></i>邮箱</label>' +
        '<input type="email" name="email" value="{contact.email}" />' +
        '<br />' +
        '</form>' +
        '</div>' +

        '<div class="tags">' +
        '<strong>' +
        '<i class="x-fa fa-tags"></i>' +
        '标签' +
        '</strong>' +
        '<div style="margin: 10px 0;">' +
        '{tagshtml}' +
        '</div>' +
        '<button id="addTagsBtn" type="button" style="border-radius: 4px; cursor: pointer;">添加标签</button>' +
        '</div>' +


        '<ul>' +
        '<li><b>地址</b><span>{address}</span></li>' +
        '<li><b>操作系统</b><span>{system}</span></li>' +
        '<li><b>IP</b><span>{ip}</span></li>' +
        '<li><b>浏览器</b><span style="cursor: pointer" title="{browser_full}">{browser}</span></li>' +
        '<li style="display: {displaySourceURL};"><b>访客来源</b><a target="_blank" href="{sourceName}">{sourceURL}</a></li>' +
        '<li style="display: {displaySite};"><b>站点来源</b><span>{siteName}</span></li>' +
        '{extendData}' +
        '</ul>' +


        '</div>',
    padding: 10,
    listeners: {
        workordernodechange: function(me, tabFather, workorderpanel, newNode, oldNode) {
            var order = newNode.workOrder;
            var userAgentInfo = Admin.view.communication.customerService.singleton.UserAgentLib.parse(order.contact['package'].user_agent);
            var tagshtml = '';
            order.contact.tags.forEach(function(tag, index, length) {
                tagshtml += '<span style=" background-color: #' + tag.color + ' !important;">' + tag.name + '</span>';
            });

            var extendData = '';
            order.contact.extend.forEach(function(keyValue, index, length) {
                extendData += '<li><b>' + keyValue.key + '</b><span>' + keyValue.value + '</span></li>';
            });

            var data = {
                workOrderId: order.id,
                imgSrc: order.contact.img,
                name: order.contact.remark ? order.contact.remark + '（' + order.contact.name + '）' : order.contact.name,
                ip: order.contact.ip || '未知IP',
                address: order.contact['package'].address || '未知地区',
                system: userAgentInfo.os || '未知系统',
                browser: userAgentInfo.browser.family || '未知浏览器',
                browser_full: userAgentInfo.browser.name || '未知浏览器',
                time: order.created_at,
                displaySourceURL: Boolean(order.contact['package'].referrer) ? 'block' : 'none',
                sourceURL: order.contact['package'].referrer && order.contact['package'].referrer.url,
                sourceName: order.contact['package'].referrer && order.contact['package'].referrer.name,
                tagshtml: tagshtml || '',
                contact: order.contact,
                extendData: extendData,
                displaySite: order.contact['package'].from ? 'block' : 'none',
                siteName: order.contact['package'].from
            };

            if (location.protocol == 'http:' && data['address'].indexOf('中国') < 0) {
                var script = document.createElement('script');
                script.src = 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js&ip=' + order.contact.ip;
                script.onload = function() {
                    if (typeof(remote_ip_info) != 'undefined') {
                        if (remote_ip_info['country'] && remote_ip_info['province']) {
                            data['address'] = remote_ip_info['country'] + '&nbsp;' + remote_ip_info['province'];
                            if (!me.data || data.workOrderId == me.data.workOrderId) {
                                me.setData(data);
                            }
                        }
                        document.body.removeChild(script);
                    } else {
                        setTimeout(function() {
                            if (typeof(remote_ip_info) != 'undefined' && remote_ip_info['country'] && remote_ip_info['province']) {
                                data['address'] = remote_ip_info['country'] + '&nbsp;' + remote_ip_info['province'];
                                if (!me.data || data.workOrderId == me.data.workOrderId) {
                                    me.setData(data);
                                }
                            }
                            document.body.removeChild(script);
                        }, 10);
                    }
                };
                document.body.appendChild(script);
            }

            me.setData(data);

            // 编辑客户信息并且提交
            var inputs = me.el.dom.querySelector('.customerInfo').querySelectorAll('input');
            var formData = {};
            for (var i = 0; i < inputs.length; i++) {
                (function(i) {
                    inputs[i].onchange = function() {
                        formData[inputs[i].name] = inputs[i].value;
                    };
                    inputs[i].onblur = function() {
                        var self = this;
                        if (self.value === self.defaultValue) {
                            return;
                        }
                        Ext.Ajax.request({
                            url: '/api/contact/' + newNode.workOrder.contact.id,
                            method: 'PUT',
                            jsonData: Ext.encode(formData),
                            success: function(response) {
                                formData = {};
                                var res = Ext.decode(response.responseText);
                                if (res.success) {
                                    self.defaultValue = self.value;
                                    me.newContactData = res.data;
                                    me.data.contact = res.data;
                                    me.fireEvent('customerbasicchange', me);
                                } else {
                                    self.value = self.defaultValue;
                                    Ext.Msg.alert('错误', res.msg);
                                }
                            },
                            failure: function(response) {
                                formData = {};
                                self.value = self.defaultValue;
                                Ext.Msg.alert('错误', '服务器错误！');
                            }
                        });
                    };
                })(i)
            }
            var addTagsBtn = me.el.dom.querySelector('#addTagsBtn');
            addTagsBtn.onclick = function(e) {
                var value = Ext.Array.pluck(me.data.contact.tags, 'name');
                Ext.create('Ext.window.Window', {
                    title: '添加标签',
                    autoShow: true,
                    modal: true,
                    width: 300,
                    height: 150,
                    viewModel: {
                        type: 'members'
                    },
                    layout: 'fit',
                    items: [{
                        xtype: 'tagfield',
                        margin: 15,
                        fieldLabel: '标签',
                        labelWidth: 30,
                        displayField: 'name',
                        valueField: 'name',
                        bind: {
                            store: '{tags}'
                        },
                        value: value,
                        allowBlank: true,
                        createNewOnBlur: true,
                        createNewOnEnter: true,
                        filterPickList: true,
                        forceSelection: false
                    }],
                    bbar: ['->', {
                        text: '重置',
                        ui: 'soft-blue',
                        handler: function() {
                            this.up('window').down('tagfield').setValue(value);
                        }
                    }, {
                        text: '提交',
                        ui: 'soft-green',
                        handler: function() {
                            var self = this;
                            Ext.Ajax.request({
                                url: '/api/contact/' + me.data.contact.id,
                                method: 'PUT',
                                jsonData: Ext.encode({
                                    tags: self.up('window').down('tagfield').getValue()
                                }),
                                success: function(response) {
                                    var res = Ext.decode(response.responseText);
                                    if (res.success) {
                                        self.up('window').close();
                                        me.newContactData = res.data;
                                        me.data.contact = res.data;
                                        me.fireEvent('customerbasicchange', me);
                                    } else {
                                        Ext.Msg.alert('错误', res.msg);
                                    }
                                },
                                failure: function(response) {
                                    Ext.Msg.alert('错误', '服务器错误！');
                                }
                            });
                        }
                    }]
                });
            };

            Ext.create('Ext.form.field.ComboBox', {
                renderTo: document.querySelector('#typeCombobox'),
                fieldLabel: '工单分类',
                labelWidth: 60,
                width: '100%',
                viewModel: 'workordermodel',
                bind: {
                    store: '{category}'
                },
                displayField: 'title',
                valueField: 'title',
                enableKeyEvents: true,
                emptyText: '请选择或输入',
                value: order.category ? order.category.title : '',
                listeners: {
                    expand: function() {
                        this.store.load();
                    },
                    blur: function() {
                        var value = this.getValue();
                        if (value) {
                            Ext.Ajax.request({
                                url: '/api/order/' + Ext.getCmp('treelist').getSelection().workOrder.id,
                                method: 'PUT',
                                jsonData: Ext.encode({
                                    category: value
                                }),
                                success: function(response) {
                                    var res = Ext.decode(response.responseText);
                                    if (res.success) {
                                        Ext.getCmp('treelist').getSelection().workOrder.category = res.data.category;
                                    } else {
                                        Ext.Msg.alert('错误', res.msg);
                                    }
                                },
                                failure: function() {
                                    Ext.Msg.alert('错误', '服务器错误。');
                                }
                            });
                        }
                    }
                }
            });
        },
        customerbasicchange: function(me) {
            var newContactData = me.newContactData;
            var tagshtml = '';
            newContactData.tags.forEach(function(tag, index, length) {
                if (index < 2) {
                    tagshtml += '<span style="background-color: #' + tag.color + ' !important;">' + tag.name + '</span>';
                } else if (2 === index) {
                    tagshtml += '...'
                }
            });
            var name = newContactData.remark ? newContactData.remark + '（' + newContactData.name + '）' : newContactData.name;
            var workOrderNode = Ext.getCmp('treelist').getSelection();
            var orderNodeData = workOrderNode.data;
            orderNodeData.contact = name;
            orderNodeData.tagshtml = tagshtml;
            orderNodeData.showTags = tagshtml ? 'block' : 'none';
            workOrderNode.setData(orderNodeData);

            workOrderNode.workOrder.contact = newContactData;
            workOrderNode.up().fireEvent('change', workOrderNode.up(), workOrderNode);

            if (Ext.getCmp('contactGrid')) {
                Ext.getCmp('contactGrid').getStore().reload();
            }
        }
    }
});
