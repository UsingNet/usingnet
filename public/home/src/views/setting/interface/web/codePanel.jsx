import React from 'react';

export default class CodePanel extends React.Component {

    state = {
        markup: `<pre class="code highlight white html"><code><span class="nt">&lt;script&gt;</span>\n<span class="p">(</span><span class="kd">function</span><span class="p">()</span> <span class="p">{</span>\n    <span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="nb">document</span><span class="p">.</span><span class="nx">createElement</span><span class="p">(</span><span class="s2">"script"</span><span class="p">);</span>\n    <span class="nx">a</span><span class="p">.</span><span class="nx">setAttribute</span><span class="p">(</span><span class="s2">"charset"</span><span class="p">,</span> <span class="s2">"UTF-8"</span><span class="p">);</span>\n    <span class="nx">a</span><span class="p">.</span><span class="nx">src</span> <span class="o">=</span> <span class="s2">"${'//' + location.host.replace('home.', 'im.') + '/build/app.min.js'}"</span><span class="p">;</span>\n    <span class="nb">document</span><span class="p">.</span><span class="nx">body</span><span class="p">.</span><span class="nx">appendChild</span><span class="p">(</span><span class="nx">a</span><span class="p">);</span>\n    <span class="nb">window</span><span class="p">.</span><span class="nx">usingnetJsonP</span> <span class="o">=</span> <span class="kd">function</span><span class="p">(</span><span class="nx">usingnetInit</span><span class="p">)</span> <span class="p">{</span>\n        <span class="nx">usingnetInit</span><span class="p">(</span><span class="s2">"${this.props.tid}"</span><span class="p">,</span> <span class="s2">{}</span><span class="p">);</span> <span class="c1">// 用户登陆后，第二个参数传入包含用户各种信息的对象 </span>\n    <span class="p">};</span>\n<span class="p">})();</span>\n<span class="nt">&lt;/script&gt;</span></code></pre>`,
    };


    render() {
        return (
            <div
                className="code-highlight"
                style={{
                    padding: 10,
                    border: '1px solid #D9D9D9',
                    borderRadius: 4,
                }}
            >
                <span>请将以下代码添加到你网站的 HTML 源代码中，放在&lt;/body&gt;标签之前</span>
                <div dangerouslySetInnerHTML={{ __html: this.state.markup }}></div>
            </div>
        );
    }
}
