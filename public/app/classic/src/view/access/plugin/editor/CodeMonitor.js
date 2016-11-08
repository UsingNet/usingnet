/**
 * Created by henry on 16-3-3.
 */
Ext.define('Admin.view.access.plugin.editor.CodeMonitor', {
    extend: 'Ext.panel.Panel',
    xtype: 'editor_code',
    title: '接入代码',
    margin: 20,
    bodyPadding: 20,
    cls: 'shadow',
    items: [{
        html: '请将以下代码添加到你网站的 HTML 源代码中，放在&lt;\/body&gt;标签之前'
    }, {
        xtype: 'panel',
        itemId: 'codePanel',
        width: '68%',
        padding: '0 20 0 20',
        style: {
            border: '1px solid #cfcfcf'
        },
        data: {
            // 'tid': Admin.data.Team.get('token'),
            // 'src': '//' + location.host.replace('app.', 'im.') + '/build/app.min.js'
        },
        userCls: 'code-highlight',
        tpl: '<pre class="code highlight white html"><code><span class="nt">&lt;script&gt;</span>\n<span class="p">(</span><span class="kd">function</span><span class="p">()</span> <span class="p">{</span>\n    <span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="nb">document</span><span class="p">.</span><span class="nx">createElement</span><span class="p">(</span><span class="s2">"script"</span><span class="p">);</span>\n    <span class="nx">a</span><span class="p">.</span><span class="nx">setAttribute</span><span class="p">(</span><span class="s2">"charset"</span><span class="p">,</span> <span class="s2">"UTF-8"</span><span class="p">);</span>\n    <span class="nx">a</span><span class="p">.</span><span class="nx">src</span> <span class="o">=</span> <span class="s2">"{src}"</span><span class="p">;</span>\n    <span class="nb">document</span><span class="p">.</span><span class="nx">body</span><span class="p">.</span><span class="nx">appendChild</span><span class="p">(</span><span class="nx">a</span><span class="p">);</span>\n    <span class="nb">window</span><span class="p">.</span><span class="nx">usingnetJsonP</span> <span class="o">=</span> <span class="kd">function</span><span class="p">(</span><span class="nx">usingnetInit</span><span class="p">)</span> <span class="p">{</span>\n        <span class="nx">usingnetInit</span><span class="p">(</span><span class="s2">"{tid}"</span><span class="p">,</span> <span class="s2">"{}"</span><span class="p">);</span> <span class="c1">// 用户登陆后，第二个参数传入包含用户各种信息的对象 </span>\n    <span class="p">};</span>\n<span class="p">})();</span>\n<span class="nt">&lt;/script&gt;</span></code></pre>'
    }],
    listeners: {
        afterrender: function() {
            var win = this.up('im_editor');
            if (!win.record) {
                this.hide();
            } else {
                this.show();
                this.down('#codePanel').setData({
                    'tid': win.record.data.id,
                    'src': '//' + location.host.replace('app.', 'im.') + '/build/app.min.js'
                });
            }
        }
    }
});
