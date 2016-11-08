/**
 * Created by henry on 15-12-30.
 */
Ext.define('Admin.view.settings.team.widgets.ContactApi', {
    xtype:'contactapi',
    extend:'Ext.panel.Panel',
    margin: 20,
    width:'100%',
    cls: 'shadow',
    title:'客服插件',
    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    items:[{
        xtype: 'form',
        id:'contactapifrom',
        margin: 20,
        flex:2,
        items: [{
            fieldLabel: '回调地址',
            xtype: 'textfield',
            width:'100%',
            name: 'callback',
            allowBlank: true,
            emptyText: '为了您的数据安全，请尽量使用HTTPS'
        },{
            xtype: 'textfield',
            fieldLabel: '插件地址',
            width:'100%',
            name: 'plugin',
            allowBlank: true,
            emptyText: '为了您的数据安全，请尽量使用HTTPS'
        },{
            width:'100%',
            xtype: 'textfield',
            name: 'secret',
            fieldLabel: '请求密钥',
            allowBlank: true
        },{
            xtype:'panel',
            items:[
                {html:'<h4>接入方式:</h4>'},
                {html:'请在需要接入的系统中实现如下功能，并将地址填写到上面的表单中', margin:10},
                {html:'<b>请求方式GET</b>', margin:10},
                {
                    html:'<table width="600px" border="1" cellspacing="0" cellpadding="5px">' +
                    '<thead><tr><th>参数</th><th>必选</th><th>类型及范围</th><th>说明</th></tr></thead>' +
                    '<tbody>' +
                    '<tr><td>id</td><td>false</td><td>string</td><td>用户ID</td></tr>' +
                    '<tr><td>name</td><td>false</td><td>string</td><td>用户名</td></tr>' +
                    '<tr><td>email</td><td>false</td><td>string</td><td>用户邮箱地址</td></tr>' +
                    '<tr><td>phone</td><td>false</td><td>string</td><td>用户电话号码</td></tr>' +
                    '<tr><td>img</td><td>false</td><td>string</td><td>用户头像url</td></tr>' +
                    '</tbody>'+
                    '</table>'
                },
                {html:'<b>签名认证</b>', margin:10},
                {userCls: 'code-highlight', padding:'0 10 0 10', width:600, style:{border:'1px solid #AAA'}, html:'<pre class="code highlight white php"><code><span class="cp">&lt;?php</span>\n<span class="nv">$secret</span> <span class="o">=</span> <span class="s1">\'nh5916yupojas34rpjw3vg\'</span><span class="p">;</span>\n<span class="nv">$url</span> <span class="o">=</span> <span class="s1">\'http://\'</span><span class="o">.</span><span class="nv">$_SERVER</span><span class="p">[</span><span class="s1">\'HTTP_HOST\'</span><span class="p">]</span><span class="o">.</span><span class="nv">$_SERVER</span><span class="p">[</span><span class="s1">\'REQUEST_URI\'</span><span class="p">];</span>\n<span class="nv">$baseString</span> <span class="o">=</span> <span class="nv">$url</span><span class="o">.</span><span class="s1">\'$\'</span><span class="o">.</span><span class="nv">$secret</span><span class="p">;</span>\n<span class="nv">$signature</span> <span class="o">=</span> <span class="nb">md5</span><span class="p">(</span><span class="nv">$baseString</span><span class="p">);</span>\n<span class="k">if</span><span class="p">(</span><span class="nv">$_SERVER</span><span class="p">[</span><span class="s1">\'HTTP_SIGNATURE\'</span><span class="p">]</span> <span class="o">!=</span> <span class="nv">$signature</span><span class="p">){</span>\n<span class="k">&nbsp;&nbsp;&nbsp;&nbsp;exit</span><span class="p">(</span><span class="s1">\'{"ok":false, "msg":"Signature Error"}\'</span><span class="p">);</span>\n<span class="p">}</span>\n<span class="c1">// TODO: 查询用户信息后，返回正确的JSON内容</span></code></pre>'},
                {html:'<b>验证正确后返回JSON格式</b>', margin:10},
                {userCls: 'code-highlight', padding:'0 10 0 10', width:600, style:{border:'1px solid #AAA'}, html:'<pre class="code highlight white json"><code><span class="p">{</span><span class="w"></span>\n<span class="w">    </span><span class="nt">"ok"</span><span class="p">:</span><span class="w"> </span><span class="kc">true</span><span class="p">,</span><span class="w"></span>\n<span class="w">    </span><span class="nt">"data"</span><span class="p">:</span><span class="w"> </span><span class="p">{</span><span class="w"></span>\n<span class="w">        </span><span class="nt">"id"</span><span class="p">:</span><span class="w"> </span><span class="s2">"1"</span><span class="p">,</span><span class="w"></span>\n<span class="w">        </span><span class="nt">"name"</span><span class="p">:</span><span class="w"> </span><span class="s2">"admin"</span><span class="p">,</span><span class="w"></span>\n<span class="w">        </span><span class="nt">"email"</span><span class="p">:</span><span class="w"> </span><span class="s2">"admin@getumessage.com"</span><span class="p">,</span><span class="w"></span>\n<span class="w">        </span><span class="nt">"phone"</span><span class="p">:</span><span class="w"> </span><span class="s2">"12345678900"</span><span class="p">,</span><span class="w"></span>\n<span class="w">        </span><span class="nt">"html"</span><span class="p">:</span><span class="w"> </span><span class="s2">"自定义信息"</span><span class="p">,</span><span class="w"></span>\n<span class="w">        </span><span class="nt">"tags"</span><span class="p">:</span><span class="w"> </span><span class="p">[</span><span class="s2">"高级会员"</span><span class="p">,</span><span class="w"> </span><span class="s2">"企业版"</span><span class="p">],</span><span class="w"></span>\n<span class="w">        </span><span class="nt">"img"</span><span class="p">:</span><span class="w"> </span><span class="s2">"http://discuz.usingnet.com/uc_server/avatar.php?uid=4&amp;size=small"</span><span class="p">,</span><span class="w"></span>\n<span class="w">    </span><span class="p">}</span><span class="w"></span>\n<span class="p">}</span><span class="w"></span></code></pre>'}
            ]
        }]
    },{
        flex:1,
        margin:20,
        items:[
            {html:'<h4>1、为什么要接入客户信息?</h4>'},
            {html:'接入客户信息可以让客服在回复客户问题时更加便捷的了解当前客户情况'},
            {html:'<h4>2、接入客户信息后会导致客户信息泄露吗?</h4>'},
            {html:'接入的客户信息，仅有<b>所有者</b>可以看到完整信息，其他角色用户无法看到客户信息。'},
            {html:'<h4>3、为什么要使用HTTPS?</h4>'},
            {html:'使用HTTPS可以大幅增加中间人攻击成本。'},
            {html:'<h4>4、插件地址是做什么用的?</h4>'},
            {html:'插件地址是客服界面中嵌入的iframe地址，方便客服操作当前客户的信息。'}
        ]
    }],
    bbar:[
        '->',
        {
            xtype: 'button',
            ui: 'soft-blue',
            text: '重置',
            handler: function(){
                this.up('contactapi').fireEvent('beforerender');
            }
        }, {
            xtype: 'button',
            ui: 'soft-green',
            text: '保存',
            handler: function(self, eOpts) {
                var form = Ext.getCmp('contactapifrom').getForm(),
                    fieldValues = form.getFieldValues();
                if (form.isValid()) {
                    Admin.data.Team.set('plugin', form.getValues());
                    Admin.data.Team.sync();
                }
            }
        }
    ],
    listeners: {
        afterrender: function() {
            var self = this;
            Admin.data.Team.addListener('sync', function(){
                self.fireEvent('beforerender');
            });
        },
        beforerender:function(){
            var items = Ext.getCmp('contactapifrom').items.items;
            var values = Admin.data.Team.get('plugin');
            if(values){
                Ext.Array.forEach(items, function(field) {
                    if(field.name && values[field.name]){
                        field.setValue(values[field.name]);
                    }
                });
            }
        }
    }
});