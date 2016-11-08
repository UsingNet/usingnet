/**
 * Created by henry on 16-3-3.
 */
Ext.define('Admin.view.access.plugin.editor.Preview', {
    extend: 'Ext.panel.Panel',
    xtype: 'editor_preview',
    requires: [
        'Ext.ux.IFrame'
    ],
    bodyPadding: 10,
    dialogStyle: {
        title_bg_color: '808080'
    },
    items: [{
        xtype: 'uxiframe',
        bottom: 0,
        height: 500,
        style: {
            width: '350px',
            height: '440px',
            border: '0px',
            'box-shadow': 'rgba(0, 0, 0, 0.498039) 0px 5px 10px'
        }
    }, {
        xtype: 'uxiframe',
        height: 160,
        scrollable: false,
        style: {
            margin: '20px 20px 0 -10px',
            width: '480px',
            height: '180px',
            border: '0px'
        }
    }],

    updateStyle: function(style) {
        var me = this;
        if (style) {
            this.dialogStyle = style;
            // this.dialogStyle = Ext.Object.merge({}, Admin.data.Team.store);
            // Ext.Object.merge(this.dialogStyle, style);
        } else {
            this.dialogStyle = {
                name: '',
                title_bg_color: 'f96868',
                input_placeholder: '您好，有什么可以帮您？'
            };
        }

        var styleHtml = '<style type="text/css">body, textarea, header, footer, article{background-color: #FFF;} header{background-color:#{$title_bg_color$};color:#ffffff;} header a{ background-color:#{$title_bg_color$} !important; color:#ffffff !important; } time{ color:#FFF; background-color: #CCC; font-size:0.9em; }section.send{ color:#000000; background-color: #f5f5f5;} section.receive{ color:#ffffff; background-color: #{$title_bg_color$};}footer a{background-color:#{$title_bg_color$} !important; color:#ffffff !important;} footer nav .tools-button{ background-color:#FFF !important; color:#AAA !important;} div.lm{ background-color:#FFF !important;} div.lm form input[type=button]{ background-color:#{$title_bg_color$} !important; color:#ffffff !important;} dialog{border-top: 5px solid #{$title_bg_color$};}.evaluation-submit {background-color:#{$title_bg_color$};color:#ffffff;}</style>';

        styleHtml = styleHtml.replace(/\{\$(\w+)\$\}/g, function(match, key) {
            return me.dialogStyle[key];
        });

        var bodyHtml = ['<div style="position: fixed; width: 440px; height: 350px; opacity: 0.9; z-index: 998; top: 0px; left: 0px; display: none; background-color: rgb(170, 170, 170);"><div style="text-align: center;margin-top:50%;">正在截图, 请稍后...</div></div><iframe src="about:blank" style="display: none; position: fixed; left: 0px; right: 0px; margin: 0px auto; z-index: 999999; top: 5%; border: 0px;"></iframe>\
                <header>',
            me.dialogStyle['logo'] ? '<img class="logo" src="{$logo$}-avatar" />' : '<img class="logo" />',
            '    <address>        <span>{$name$}</span><br><em></em><i>正在为您服务</i>    </address>    <nav class="pull-right">        <a class="pure-button button-xsmall" title="全屏打开" style="display: inline"><span class="fa fa-share"></span></a>        <a class="pure-button button-xsmall" title="最小化"><span class="fa fa-angle-double-down"></span></a>    </nav></header><article>\
            <section class="send"><p>您好，请问有什么需要帮助的？</p></section>\
            <section class="receive"><p>我想要开通会员，谢谢。</p></section>\
            </article><footer class="pure-form">\
            <textarea class="pure-input-1" placeholder="{$input_placeholder$}"></textarea>\
            <nav>\
            <a href="javascript:void(0)" title="发送" class="pure-button pull-right sendBtn"><span class="fa fa-send"></span>发送</a>\
            <a class="pure-button tools-button" href="javascript:void(0)" title="表情"><span class="fa fa-smile-o"></span></a><a class="pure-button tools-button" href="javascript:void(0)" title="截屏"><span class="fa fa-crop"></span></a><span class="pure-button tools-button" title="上传图片" style="padding: 0px; width: 46px; height: 35px; overflow: hidden;"><iframe name="im_plugin_upload_iframe" src="about:blank" style="display: none"></iframe>\
            <span style="height: 35px; line-height: 35px; " class="fa fa-image"></span>\
            <form action="/api/upload" method="post" enctype="multipart/form-data" target="im_plugin_upload_iframe" style="margin-top: -45px; margin-left: 35px;">\
            <input type="reset" name="reset" style="display: none;">\
            </form></span><a class="pure-button tools-button" href="javascript:void(0)" title="评价"><span class="fa fa-thumbs-up"></span><input id="evaluationAgent" type="hidden"></a></nav>\
            </footer><div style="position: fixed; z-index: 999999; left: 3px; bottom: 40px; display: none; background-color: rgb(255, 255, 255);"><table class="face-table">    <tbody>        <tr>                <td data="[微笑]"><span class="qqemoji qqemoji0"></span></td>                <td data="[撇嘴]"><span class="qqemoji qqemoji1"></span></td>                <td data="[色]"><span class="qqemoji qqemoji2"></span></td>                <td data="[发呆]"><span class="qqemoji qqemoji3"></span></td>                <td data="[得意]"><span class="qqemoji qqemoji4"></span></td>                <td data="[流泪]"><span class="qqemoji qqemoji5"></span></td>                <td data="[害羞]"><span class="qqemoji qqemoji6"></span></td>                <td data="[闭嘴]"><span class="qqemoji qqemoji7"></span></td>                <td data="[睡]"><span class="qqemoji qqemoji8"></span></td>                <td data="[大哭]"><span class="qqemoji qqemoji9"></span></td>                <td data="[尴尬]"><span class="qqemoji qqemoji10"></span></td>                <td data="[发怒]"><span class="qqemoji qqemoji11"></span></td>                <td data="[调皮]"><span class="qqemoji qqemoji12"></span></td>            </tr>        <tr>                <td data="[睡]"><span class="qqemoji qqemoji8"></span></td>                <td data="[大哭]"><span class="qqemoji qqemoji9"></span></td>                <td data="[尴尬]"><span class="qqemoji qqemoji10"></span></td>                <td data="[发怒]"><span class="qqemoji qqemoji11"></span></td>                <td data="[调皮]"><span class="qqemoji qqemoji12"></span></td>                <td data="[呲牙]"><span class="qqemoji qqemoji13"></span></td>                <td data="[惊讶]"><span class="qqemoji qqemoji14"></span></td>                <td data="[难过]"><span class="qqemoji qqemoji15"></span></td>                <td data="[酷]"><span class="qqemoji qqemoji16"></span></td>                <td data="[冷汗]"><span class="qqemoji qqemoji17"></span></td>                <td data="[抓狂]"><span class="qqemoji qqemoji18"></span></td>                <td data="[吐]"><span class="qqemoji qqemoji19"></span></td>                <td data="[偷笑]"><span class="qqemoji qqemoji20"></span></td>            </tr>        <tr>                <td data="[酷]"><span class="qqemoji qqemoji16"></span></td>                <td data="[冷汗]"><span class="qqemoji qqemoji17"></span></td>                <td data="[抓狂]"><span class="qqemoji qqemoji18"></span></td>                <td data="[吐]"><span class="qqemoji qqemoji19"></span></td>                <td data="[偷笑]"><span class="qqemoji qqemoji20"></span></td>                <td data="[愉快]"><span class="qqemoji qqemoji21"></span></td>                <td data="[白眼]"><span class="qqemoji qqemoji22"></span></td>                <td data="[傲慢]"><span class="qqemoji qqemoji23"></span></td>                <td data="[饥饿]"><span class="qqemoji qqemoji24"></span></td>                <td data="[困]"><span class="qqemoji qqemoji25"></span></td>                <td data="[惊恐]"><span class="qqemoji qqemoji26"></span></td>                <td data="[流汗]"><span class="qqemoji qqemoji27"></span></td>                <td data="[憨笑]"><span class="qqemoji qqemoji28"></span></td>            </tr>        <tr>                <td data="[饥饿]"><span class="qqemoji qqemoji24"></span></td>                <td data="[困]"><span class="qqemoji qqemoji25"></span></td>                <td data="[惊恐]"><span class="qqemoji qqemoji26"></span></td>                <td data="[流汗]"><span class="qqemoji qqemoji27"></span></td>                <td data="[憨笑]"><span class="qqemoji qqemoji28"></span></td>                <td data="[悠闲]"><span class="qqemoji qqemoji29"></span></td>                <td data="[奋斗]"><span class="qqemoji qqemoji30"></span></td>                <td data="[咒骂]"><span class="qqemoji qqemoji31"></span></td>                <td data="[疑问]"><span class="qqemoji qqemoji32"></span></td>                <td data="[嘘]"><span class="qqemoji qqemoji33"></span></td>                <td data="[晕]"><span class="qqemoji qqemoji34"></span></td>                <td data="[疯了]"><span class="qqemoji qqemoji35"></span></td>                <td data="[衰]"><span class="qqemoji qqemoji36"></span></td>            </tr>        <tr>                <td data="[疑问]"><span class="qqemoji qqemoji32"></span></td>                <td data="[嘘]"><span class="qqemoji qqemoji33"></span></td>                <td data="[晕]"><span class="qqemoji qqemoji34"></span></td>                <td data="[疯了]"><span class="qqemoji qqemoji35"></span></td>                <td data="[衰]"><span class="qqemoji qqemoji36"></span></td>                <td data="[骷髅]"><span class="qqemoji qqemoji37"></span></td>                <td data="[敲打]"><span class="qqemoji qqemoji38"></span></td>                <td data="[再见]"><span class="qqemoji qqemoji39"></span></td>                <td data="[擦汗]"><span class="qqemoji qqemoji40"></span></td>                <td data="[抠鼻]"><span class="qqemoji qqemoji41"></span></td>                <td data="[鼓掌]"><span class="qqemoji qqemoji42"></span></td>                <td data="[糗大了]"><span class="qqemoji qqemoji43"></span></td>                <td data="[坏笑]"><span class="qqemoji qqemoji44"></span></td>            </tr>        <tr>                <td data="[擦汗]"><span class="qqemoji qqemoji40"></span></td>                <td data="[抠鼻]"><span class="qqemoji qqemoji41"></span></td>                <td data="[鼓掌]"><span class="qqemoji qqemoji42"></span></td>                <td data="[糗大了]"><span class="qqemoji qqemoji43"></span></td>                <td data="[坏笑]"><span class="qqemoji qqemoji44"></span></td>                <td data="[左哼哼]"><span class="qqemoji qqemoji45"></span></td>                <td data="[右哼哼]"><span class="qqemoji qqemoji46"></span></td>                <td data="[哈欠]"><span class="qqemoji qqemoji47"></span></td>                <td data="[鄙视]"><span class="qqemoji qqemoji48"></span></td>                <td data="[委屈]"><span class="qqemoji qqemoji49"></span></td>                <td data="[快哭了]"><span class="qqemoji qqemoji50"></span></td>                <td data="[阴险]"><span class="qqemoji qqemoji51"></span></td>                <td data="[亲亲]"><span class="qqemoji qqemoji52"></span></td>            </tr>        <tr>                <td data="[鄙视]"><span class="qqemoji qqemoji48"></span></td>                <td data="[委屈]"><span class="qqemoji qqemoji49"></span></td>                <td data="[快哭了]"><span class="qqemoji qqemoji50"></span></td>                <td data="[阴险]"><span class="qqemoji qqemoji51"></span></td>                <td data="[亲亲]"><span class="qqemoji qqemoji52"></span></td>                <td data="[吓]"><span class="qqemoji qqemoji53"></span></td>                <td data="[可怜]"><span class="qqemoji qqemoji54"></span></td>                <td data="[菜刀]"><span class="qqemoji qqemoji55"></span></td>                <td data="[西瓜]"><span class="qqemoji qqemoji56"></span></td>                <td data="[啤酒]"><span class="qqemoji qqemoji57"></span></td>                <td data="[篮球]"><span class="qqemoji qqemoji58"></span></td>                <td data="[乒乓]"><span class="qqemoji qqemoji59"></span></td>                <td data="[咖啡]"><span class="qqemoji qqemoji60"></span></td>            </tr>        <tr>                <td data="[西瓜]"><span class="qqemoji qqemoji56"></span></td>                <td data="[啤酒]"><span class="qqemoji qqemoji57"></span></td>                <td data="[篮球]"><span class="qqemoji qqemoji58"></span></td>                <td data="[乒乓]"><span class="qqemoji qqemoji59"></span></td>                <td data="[咖啡]"><span class="qqemoji qqemoji60"></span></td>                <td data="[饭]"><span class="qqemoji qqemoji61"></span></td>                <td data="[猪头]"><span class="qqemoji qqemoji62"></span></td>                <td data="[玫瑰]"><span class="qqemoji qqemoji63"></span></td>                <td data="[凋谢]"><span class="qqemoji qqemoji64"></span></td>                <td data="[嘴唇]"><span class="qqemoji qqemoji65"></span></td>                <td data="[爱心]"><span class="qqemoji qqemoji66"></span></td>                <td data="[心碎]"><span class="qqemoji qqemoji67"></span></td>                <td data="[蛋糕]"><span class="qqemoji qqemoji68"></span></td>            </tr>        </tbody></table>\
            <style>table.face-table td{width: 27px;height: 27px;border: 1px solid #DDD;text-align: center;vertical-align: middle;cursor: pointer;}</style>\
            </div>'
        ].join('');

        bodyHtml = bodyHtml.replace(/\{\$(\w+)\$\}/g, function(match, key) {
            return me.dialogStyle[key];
        });

        var headHtml = '<meta charset="UTF-8">\
                <meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1">\
                <meta name="renderer" content="webkit">\
                <title>联系客服</title>';
        headHtml += '<link type="text/css" rel="stylesheet" href="//' + location.host.replace('app.', 'im.') + '/build/v2/css/main.min.css">';

        var baseHtml = '<html lang="zh-cn"><head>' + headHtml + '</head><body>' + bodyHtml + '<\/body></html>';

        var v2_iframe = this.items.getAt(0).el.dom.querySelector('iframe');
        v2_iframe.contentDocument.head.innerHTML = headHtml + styleHtml;
        v2_iframe.contentDocument.body.innerHTML = bodyHtml;


        var icon_iframe = this.items.getAt(1).el.dom.querySelector('iframe');

        if (this.dialogStyle['icon_shape'] == 'none' && this.dialogStyle['customer_icon']) {
            icon_iframe.contentDocument.body.innerHTML = '<img src="' + this.dialogStyle['customer_icon'] + '" />';
        } else {
            switch (this.dialogStyle['icon_shape']) {
                case 'bar':
                    icon_iframe.contentDocument.body.innerHTML = '<div style="box-shadow: rgba(0, 0, 0, 0.498039) 0 5px 10px;background: #' + this.dialogStyle['title_bg_color'] + '; width:35px; height:123px;border-radius: 17px; padding-top: 17px;">' +
                        '<img style="width:22px; margin-left: 7px;" src="//' + location.hostname.replace('app.', 'im.') + '/build/v2/image/message.png" />' +
                        '<p style="padding: 0 11px;text-indent: 0;margin-top: 6px;font-size: 13px; color:#FFF;">在线客服</p>' +
                        '</div>';
                    break;
                case 'square':
                    icon_iframe.contentDocument.body.innerHTML = '<div style="box-shadow: rgba(0, 0, 0, 0.498039) 0 5px 10px;background: #' + this.dialogStyle['title_bg_color'] + '; width:58px; height:60px; ">' +
                        '<img style="width:22px;margin: 10px 0 0 17px;" src="//' + location.hostname.replace('app.', 'im.') + '/build/v2/image/message.png" />' +
                        '<p style="padding: 3px;text-indent: 2px;margin: 3px 0 0 0; font-size: 12px; color:#FFF;">在线客服</p>' +
                        '</div>';
                    break;
                case 'circular':
                default:
                    icon_iframe.contentDocument.body.innerHTML = '<div style="box-shadow: rgba(0, 0, 0, 0.498039) 0 5px 10px;background: #' + this.dialogStyle['title_bg_color'] + '; width:60px; height:60px; border-radius: 30px;">' +
                        '<img style="width:22px;margin: 10px 0 0 17px;" src="//' + location.hostname.replace('app.', 'im.') + '/build/v2/image/message.png" />' +
                        '<p style="margin-top: 2px;text-indent: 6px; font-size: 12px; color:#FFF;">在线客服</p>' +
                        '</div>';
                    break;
            }
        }
    },

    listeners: {
        afterrender: function() {
            this.updateStyle();
        }
    }
});
