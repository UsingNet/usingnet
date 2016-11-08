Ext.define('Admin.view.component.ComboHtmlRadio', {
    extend: 'Ext.form.field.Radio',
    xtype: 'combohtmlradio',

    getSubTplData:function(fieldData){
        var data = this.callParent(arguments);
        Ext.merge(data, this.config.mData);
        return data;
    },
    fieldSubTpl: [
        '<div id="{cmpId}-innerWrapEl" data-ref="innerWrapEl" role="presentation"',
            // 添加combohtmlradio class
            ' class="{wrapInnerCls} combohtmlradio">',

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

            // span添加innerSpan class和innerHTML
            '<span id="{cmpId}-displayEl" data-ref="displayEl" class="innerSpan {fieldCls} {typeCls} {typeCls}-{ui} {inputCls} {inputCls}-{ui} {childElCls} {afterLabelCls}">',
                '<em class="icon x-fa fa-check"></em>',
                '<div class="radioHead">',
                    '<h3 style="color: {color};" class="name">{comboname}</h3>',
                    '<p class="fitsTo">{fitsTo}</p>',
                '</div>',
                '<div class="radioBody">',
                    '<h4 style="color: {color};" class="price">',
                        '<span style="font-size: 14px;">￥</span>',
                        '{price}',
                        '<smail style="font-size: 14px;">/坐席/年</smail>',
                    '</h4>',
                '</div>',
                '<div class="radioFoot">',
                    '{desc}',
                '</div>',
            '</span>',


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