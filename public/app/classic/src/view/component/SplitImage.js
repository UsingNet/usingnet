/**
 * Created by henry on 16-1-5.
 */
Ext.define('Admin.view.component.SplitImage',{
    extend:'Ext.button.Split',
    xtype:'splitimage',
    requires:[
        'Ext.button.Split'
    ],
    setSrc:function(src){
        var me = this;
        me.src = src;
        if(me.el) {
            me.el.dom.getElementsByTagName('img')[0].src = src;
        }
        me.fireEvent('change');
    },
    getSrc:function(){
        var me = this;
        return me.src;
    },
    childEls: [
        'btnEl', 'btnWrap', 'btnInnerEl', 'btnIconEl', 'arrowEl', 'btnInnerImg'
    ],
    baseCls: Ext.baseCSSPrefix + 'btn',

    defaultBindProperty: 'src',

    getTemplateArgs: function() {
        var me = this,
            ariaAttr, data;

        data = me.callParent();
        data.imgCls = me._imgCls;
        delete data.text;
        data.src = me.src;
        data.splImgCls = Ext.baseCSSPrefix + 'btn-split-image';
        data.splWrapImgCls = Ext.baseCSSPrefix + 'btn-wrap-split-image';
        return data;
    },

    _imgCls: Ext.baseCSSPrefix + 'btn-img',

    renderTpl:
    '<span id="{id}-btnWrap" data-ref="btnWrap" role="presentation" unselectable="on" style="{btnWrapStyle}" ' +
    'class="{btnWrapCls} {splWrapImgCls} {btnWrapCls}-{ui} {splitCls}{childElCls}">' +
    '<span id="{id}-btnEl" data-ref="btnEl" role="presentation" unselectable="on" style="{btnElStyle}" ' +
    'class="{btnCls} {splImgCls} {btnCls}-{ui} {textCls} {noTextCls} {hasIconCls} ' +
    '{iconAlignCls} {textAlignCls} {btnElAutoHeightCls}{childElCls}">' +
    '<tpl if="iconBeforeText">{[values.$comp.renderIcon(values)]}</tpl>' +
    '<span id="{id}-btnInnerEl" data-ref="btnInnerEl" unselectable="on" ' +
    'class="{innerCls} {innerCls}-{ui}{childElCls}">' +
    '<img id="{id}-btnInnerImg" data-ref="btnInnerImg" unselectable="on" class="{imgCls} {imgCls}-{ui}{childElCls}" src="{src}"  /></span>' +
    '<tpl if="!iconBeforeText">{[values.$comp.renderIcon(values)]}</tpl>' +
    '</span>' +
    '</span>' +
    '{[values.$comp.getAfterMarkup ? values.$comp.getAfterMarkup(values) : ""]}' +
        // if "closable" (tab) add a close element icon
    '<tpl if="closable">' +
    '<span id="{id}-closeEl" data-ref="closeEl" class="{baseCls}-close-btn">' +
    '<tpl if="closeText">' +
    ' {closeText}' +
    '</tpl>' +
    '</span>' +
    '</tpl>' +
        // Split buttons have additional tab stop for the arrow element
    '<tpl if="split">' +
    '<span id="{id}-arrowEl" class="{arrowElCls}" data-ref="arrowEl" ' +
    'role="button" hidefocus="on" unselectable="on"' +
    '<tpl if="tabIndex != null"> tabindex="{tabIndex}"</tpl>' +
    '<tpl foreach="arrowElAttributes"> {$}="{.}"</tpl>' +
    '>{arrowElText}</span>' +
    '</tpl>',

    onRender:function(){
        var me = this,
            btn,
            el,
            img,
            arrow;
        me.callParent();
        el = me.btnInnerEl;
        img = me.btnInnerImg;
        btn = me.btnEl;
        if(el){
            el.setWidth(me.imageWidth);
            el.setHeight(me.imageHeight);
            el.setPadding(0);
            el.setMargin(0);
        }
        if(btn){
            btn.setPadding('1 2 1 1');
            btn.setMargin(0);
        }
        if (img) {
            img.setWidth(me.imageWidth);
            img.setHeight(me.imageHeight);
            if(me.imageBorderRadius) {
                img.setStyle('borderRadius',parseInt(me.imageBorderRadius).toString()+'px');
            }
            img.dom.setAttribute('data-componentid', me.id);
            img.setVisibilityMode(Ext.dom.Element.DISPLAY);
            img.on({
                scope: me,
                focus: me.onArrowElFocus,
                blur: me.onArrowElBlur
            });
        }
    }
});