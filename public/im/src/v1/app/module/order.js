/**
 * Created by henry on 16-1-20.
 */
define(['lib/ajax', 'lib/class', 'text!template/order.html', 'lib/messager','lib/xTemplate'], function (Ajax, Class, html, Messager, Template) {
    var container = document.createElement('div');
    container.innerHTML = '';

    return new Class().extend(function (tid, track_id, page_id, user_info, teamInfo) {
        container.innerHTML = Template(html, teamInfo);
        // container.innerHTML = html;

        var form = container.querySelector('form');
        var messager = null;

        var lastValue = '';

        container.addEventListener('click', function(e){
            var node = (e.target || e.srcElement);
           if(node.name == 'order_type'){
                if(node.value != lastValue){
                    lastValue = node.value;
                   teamInfo['current_title'] = node.value;
                   container.innerHTML = Template(html, teamInfo);
                }
           }
        });

        container.addEventListener('click', function(e){
            if((e.target || e.srcElement).name =='submit'){
                if (!messager) {
                    return false;
                }
                var title = container.querySelector('select').value;
                if(!title){
                    return false;
                }
                var values = container.querySelectorAll('form input,textarea');
                var data = {};
                for (var i = 0; i < values.length; i++) {
                    if (values[i].placeholder) {
                        data[values[i].placeholder] = values[i].value;
                        if(!data[values[i].placeholder]){
                            return false;
                        }
                    }
                }
                messager.sendOrder(title, data);
            }
        });

        this.appendTo = function (dom) {
            container.style.overflowY='scroll';
            container.style.paddingTop = '48px';
            container.style.height = '100%';
            dom.appendChild(container);
        };

        messager = new Messager(track_id, tid, user_info, page_id, 'LM');
        messager.addEventListener('sent', function () {
            location.reload();
            // Bubble.showSuccess('工单已成功提交，请耐心等待。', 5);
            // setTimeout(function(){
            //     location.reload();
            // },3000)
        });

        messager.addEventListener('error', function(e){
            alert(e.data);
        });
    });
});