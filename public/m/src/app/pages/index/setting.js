/**
 * Created by henry on 16-2-20.
 */
define([],function(){
    $(document).on('click', '[data-action="info-menu"]', function(){
        if($('#index').find('header h1').html() == '请选择工单'){
            $.toast('请先选择工单');
            return false;
        }

        var buttons1 = [
            {
                text: '客户基本信息',
                onClick: function() {
                    $.popup('.popup-customer-basic');
                }
            },
            {
                text: '客户自定义信息',
                onClick: function() {
                    $.popup('.popup-customer-detail');
                }
            },
            {
                text: '客服插件',
                onClick: function() {
                    $.popup('.popup-customer-plugin');
                }
            },
            {
                text: '关闭工单',
                color: 'danger',
                onClick: function() {
                    $.popup('.popup-order-close');
                }
            }
        ];
        var buttons2 = [
            {
                text: '取消',
                bg: 'danger'
            }
        ];
        var groups = [buttons1, buttons2];
        $.actions(groups);
    });
});