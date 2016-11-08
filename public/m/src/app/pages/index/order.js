/**
 * Created by henry on 16-2-20.
 */
define(['api/order','./order-item'], function(OrderApi, Item){
    var list = $('[data-action="order-list"]');
    OrderApi.addEventListener('load', function(e){
        list.empty();
        if(e.data.length==0){
            $.toast('暂无工单');
        }else{
            for(var i = 0; i<e.data.length;i++){
                var item = Item.findOrCreate(e.data[i]);
                list.append(item.$);
            }
            $.toast('工单已刷新');
        }
        Item.applyFirst();
    });

    $(document).on('click', '[data-action="order-refresh"]', function(){
       OrderApi.sync();
    });

    $.getJSON('/api/order/category',{_:Math.random()}, function(response){
        var OrderClosePop = $('.popup-order-close');
        var category = OrderClosePop.find('[data-id="category"]');
        category.empty();
        category.append('<option selected="selected">请选择...</option>');
        for(var i = 0;i<response.data.length;i++){
            var option = response.data[i];
            category.append('<option name="'+option['title']+'">'+option['title']+'</option>');
        }

        OrderClosePop.find('[data-action="close-order"]').click(function(){
            var item = Item.getSelection();
            if(item){
                item.close(category.val());
            }
        });
    });
    OrderApi.sync();
});