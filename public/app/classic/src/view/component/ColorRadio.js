/**
 * Created by henry on 16-3-3.
 */
Ext.define('Admin.view.component.ColorRadio',{
    extend:'Ext.form.field.Radio',
    xtype:'colorradio',
    color:'#DDD',

    getSubTplData:function(fieldData){
        var data = this.callParent(arguments);
        data['color'] = this.config.color || ('#'+this.inputValue) || this.color;
        data['colorSrc'] = this.buildImage(data['color']);
        return data;
    },

    fieldSubTpl: [
        '<div id="{cmpId}-innerWrapEl" data-ref="innerWrapEl" role="presentation"',
        ' class="{wrapInnerCls} ColorRadio">',

        '<tpl if="labelAlignedBefore">',
            '{beforeBoxLabelTpl}',
            '<label id="{cmpId}-boxLabelEl" data-ref="boxLabelEl" {boxLabelAttrTpl} class="{boxLabelCls} ',
                '{boxLabelCls}-{ui} {boxLabelCls}-{boxLabelAlign} {noBoxLabelCls} {childElCls}" for="{id}">',
                '{beforeBoxLabelTextTpl}',
                '{boxLabel}',
                '{afterBoxLabelTextTpl}',
            '</label>',
            '{afterBoxLabelTpl}',
        '</tpl>',

        '<input type="button" id="{id}" name="{inputName}" data-ref="inputEl" {inputAttrTpl}',
            '<tpl if="tabIdx != null"> tabindex="{tabIdx}"</tpl>',
            '<tpl if="disabled"> disabled="disabled"</tpl>',
            '<tpl if="fieldStyle"> style="{fieldStyle}"</tpl>',
            ' class="{checkboxCls} {clipCls}" autocomplete="off" hidefocus="true" ',
            '<tpl foreach="inputElAriaAttributes"> {$}="{.}"</tpl>',
        '/>',
        '<div class="color-radio-display" style="background-color: {color};">',
            '<span id="{cmpId}-displayEl" data-ref="displayEl" style="width:100%;height:100%;" class="{fieldCls} {typeCls} ',
            '{typeCls}-{ui} {inputCls} {inputCls}-{ui} {childElCls} {afterLabelCls}">',
                '<span class="color-radio-check x-fa fa-check"></span>',
            '</span>',
        '</div>',


        '<tpl if="!labelAlignedBefore">',
            '{beforeBoxLabelTpl}',
            '<label id="{cmpId}-boxLabelEl" data-ref="boxLabelEl" {boxLabelAttrTpl} class="{boxLabelCls} ',
                '{boxLabelCls}-{ui} {boxLabelCls}-{boxLabelAlign} {noBoxLabelCls} {childElCls}" for="{id}">',
                '{beforeBoxLabelTextTpl}',
                '{boxLabel}',
                '{afterBoxLabelTextTpl}',
            '</label>',
            '{afterBoxLabelTpl}',
        '</tpl>',


        '</div>',
        {
            disableFormats: true,
            compiled: true
        }
    ],

    buildImage: function(color){
        if(color && color.length && color.substr(0,1) == '#'){
            color = color.substr(1);
        }

        var header = 'data:image/bmp;base64,Qk1+AAAAAAAAAHoAAABsAAAAAQAAAAEAAAABABgAAAAAAAQAAAATCwAAEwsAAAAAAAAAAAAAQkdScwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAA';
        //base64.encodestring('\x00\x00\xFF\xFF\xFF\x00')
        var seed = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+\/';

        if(color.length == 3){
            color = [color.substr(0,1).repeat(2),color.substr(1,1).repeat(2),color.substr(2,1).repeat(2)].join('');
        }else if(color.length!=6){
            return 'about:blank';
        }
        color = [color.substr(4,2),color.substr(2,2),color.substr(0,2)].join('');
        color = '0000'+color+'00';
        var num = parseInt(color, 16);
        var i = 8;
        while(i--){
            header += seed[parseInt(Math.floor(num / Math.pow(64,i)))%64]
        }
        return header;
    }
});