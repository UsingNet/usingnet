/**
 * Created by henry on 16-3-3.
 */
Ext.define('Admin.view.component.HtmlRadio',{
    extend:'Ext.form.field.Radio',
    xtype:'htmlradio',
    backgroundColor:'#DDD',
    color:'#FFF',
    innerHtml: '<em>Click</em>',

    getSubTplData:function(fieldData){
        var data = this.callParent(arguments);
        data['backgroundColor'] = this.config.backgroundColor || this.backgroundColor;
        data['color'] = this.config.color || this.color;
        data['innerHtml'] = this.config.innerHtml || this.innerHtml;
        return data;
    },

    fieldSubTpl: [
        '<div id="{cmpId}-innerWrapEl" data-ref="innerWrapEl" role="presentation"',
        ' class="{wrapInnerCls} HtmlRadio">',

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
        '<span class="html-radio-check"><em class="x-fa fa-check"></em></span>',
        '<div class="html-radio-display" style="background-color: {backgroundColor}; color: {color};">',
            '<span id="{cmpId}-displayEl" data-ref="displayEl" style="width:100%;height:100%;" class="{fieldCls} {typeCls} ',
            '{typeCls}-{ui} {inputCls} {inputCls}-{ui} {childElCls} {afterLabelCls}">',
                '{innerHtml}',
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
    ]
});