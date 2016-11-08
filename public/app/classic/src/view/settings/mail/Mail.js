/**
 * Created by henry on 15-12-28.
 */
Ext.define('Admin.view.settings.mail.Mail', {
    extend: 'Ext.container.Container',
    xtype: 'setupmail',
    scrollable: true,
    requires: [

    ],
    items:[
        {
            xtype: 'panel',
            cls: 'shadow',
            title: '邮件接入',
            margin: 20,
            bodyPadding: 10,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items:[
                {
                    xtype: 'maildomain',
                    flex: 3
                },
                {
                    xtype: 'panel',
                    flex: 1,
                    margin:10,
                    items:[
                        {html:'<p style="float:right">需要帮助<span class="x-fa fa-question"></span></p>'},
                        {html:'1、为什么要绑定域名?', margin:10},
                        {html:'我们将使用此域名为您提供企业邮箱服务。绑定域名后，将会大大降低回访邮件和客服邮件进入垃圾箱的概率。'},
                        {html:'2、如何解析域名?', margin:10},
                        {html:'请选择您的DNS服务商，若没有DNS服务商，请选择域名服务商：'},
                        {
                            xtype:'form',
                            items:[
                                {
                                    xtype: 'radiogroup',
                                    // Arrange radio buttons into two columns, distributed vertically
                                    columns: 3,
                                    vertical: true,
                                    allowBlank: true,
                                    name: 'icp',
                                    id: 'icp',
                                    items: [
                                        {
                                            boxLabel  : '万网(阿里云)',
                                            name      : 'icp',
                                            inputValue: 'aliyun'
                                        }, {
                                            boxLabel  : 'DNSPod',
                                            name      : 'icp',
                                            inputValue: 'dnspod'
                                        }, {
                                            boxLabel  : 'Godaddy',
                                            name      : 'icp',
                                            inputValue: 'godaddy'
                                        }
                                    ],
                                    listeners:{
                                        change:function(group,to,from,listener){
                                            if(from.icp) {
                                                Ext.getCmp(from.icp).setHidden(true);
                                            }
                                            if(to.icp) {
                                                //Ext.Array.each(Ext.getCmp('xmail').items.items,function(item){item.setValue(false);});
                                                Ext.getCmp('xmail').reset();
                                                Ext.getCmp(to.icp).setHidden(false);
                                            }
                                        }
                                    }
                                },
                                {html:'3、如何登录企业邮箱？'},
                                {html:'即将推出', margin:10},
                                {
                                    hidden:true,
                                    xtype: 'radiogroup',
                                    // Arrange radio buttons into two columns, distributed vertically
                                    columns: 3,
                                    vertical: true,
                                    allowBlank: true,
                                    name: 'xmail',
                                    id: 'xmail',
                                    items: [
                                        {
                                            boxLabel  : 'Foxmail',
                                            name      : 'xmail',
                                            inputValue: 'foxmail'
                                        }, {
                                            boxLabel  : 'Thunderbird',
                                            name      : 'xmail',
                                            inputValue: 'thunderbird'
                                        }
                                    ],
                                    listeners:{
                                        change:function(group,to,from,listener){
                                            if(from.xmail) {
                                                Ext.getCmp(from.xmail).setHidden(true);
                                            }
                                            if(to.xmail) {
                                                //Ext.Array.each(Ext.getCmp('icp').items.items,function(item){item.setValue(false);});
                                                Ext.getCmp('icp').reset();
                                                Ext.getCmp(to.xmail).setHidden(false);
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            margin: 20,
            cls: 'shadow',
            bodyPadding: 10,
            items:[
                {
                    id:"aliyun",
                    hidden:true,
                    items:[
                        {html:'<h3>万网(阿里云)解析步骤:</h3>'},
                        {html:'<p style="font-size:16px;">点击<a href="http://netcn.console.aliyun.com/core/domain/list" target="_blank">这里</a>进入阿里云域名控制面板:</p>', margin:10},
                        {xtype:'image', src:'resources/images/dns/aliyun/1.png', width: '100%'},
                        {html:'<p style="font-size:16px;">如上图所示，找到需要绑定的域名，点击对应行的“解析”连接</p>', margin:10},
                        {xtype:'image', src:'resources/images/dns/aliyun/2.png', width: '100%'},
                        {html:'<p style="font-size:16px;">如上图所示，点击“立即设置”</p>', margin:10},
                        {xtype:'image', src:'resources/images/dns/aliyun/3.png', width: '100%'},
                        {html:'<p style="font-size:16px;">如上图所示，点击“高级设置”</p>', margin:10},
                        {xtype:'image', src:'resources/images/dns/aliyun/4.png', width: '100%'},
                        {html:'<p style="font-size:16px;">点击“添加解析”，根据您的 <b>记录列表</b> 完成上图所示的表单，并保存</p>', margin:10}
                    ]
                },
                {
                    id:"dnspod",
                    hidden:true,
                    items:[
                        {html:'<h3>DNSPOD解析步骤:</h3>'},
                        {html:'<p style="font-size:16px;">点击<a href="https://www.dnspod.cn/Domain" target="_blank">这里</a>进入DNSPOD域名控制面板:</p>', margin:10},
                        {xtype:'image', src:'resources/images/dns/dnspod/1.png', width: '100%'},
                        {html:'<p style="font-size:16px;">如上图所示，点击该域名</p>', margin:10},
                        {xtype:'image', src:'resources/images/dns/dnspod/2.png', width: '100%'},
                        {html:'<p style="font-size:16px;">点击“添加记录”，根据您的 <b>记录列表</b> 完成上图所示的表单，并保存</p>', margin:10}
                    ]
                },
                {
                    id:"godaddy",
                    hidden:true,
                    items:[
                        {html:'<h3>Godaddy解析步骤:</h3>'},
                        {html:'<p style="font-size:16px;">登录Godaddy，进入需要绑定域名的解析列表:</p>', margin:10},
                        {xtype:'image', src:'resources/images/dns/godaddy/1.png', width: '100%'},
                        {html:'<p style="font-size:16px;">点击“Add Record”，根据您的 <b>记录列表</b> 完成上图所示的表单，并保存</p>', margin:10}
                    ]
                },
                {
                    id:"foxmail",
                    hidden:true,
                    items:[
                        {html:'<h3>Foxmail:</h3>'},
                        {html:'<p style="font-size:16px;">Foxmail</p>', margin:10}
                    ]
                },
                {
                    id:"thunderbird",
                    hidden:true,
                    items:[
                        {html:'<h3>Thunderbird:</h3>'},
                        {html:'<p style="font-size:16px;">Thunderbird</p>', margin:10}
                    ]
                }
            ]
        }
    ]
});