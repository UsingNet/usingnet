/**
 * Created by henry on 16-1-20.
 */
define(['lib/ajax', 'lib/class', 'text!./Order.html', 'view/common/header/Header', 'lib/messager', 'view/page/message/Message', 'view/messagebubble/MessageBubble', 'lib/template'], function (Ajax, Class, html, Header, Messager, Message, Bubble, Template) {
    var container = document.createElement('div');
    var header = new Header();
    container.innerHTML = '';

    return new Class().extend(function (tid, track_id, page_id, user_info, teamInfo) {
        container.innerHTML = Template(html, teamInfo);
        // container.innerHTML = html;

        var form = container.querySelector('form');
        var messager = null;

        container.addEventListener('change', function(e){
           if(e.target.name == 'order_type'){
               teamInfo['current_title'] = e.target.value;
               container.innerHTML = Template(html, teamInfo);
           }
        });

        container.addEventListener('click', function(e){
            if(e.target.name =='submit'){
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

        header.setConfig(teamInfo);

        this.appendTo = function (dom) {
            header.appendTo(dom);
            container.style.overflowY='scroll';
            container.style.marginTop = header.getHeight() + 'px';
            container.style.height = (document.body.scrollHeight - header.getHeight())+'px';
            dom.appendChild(container);
        };

        messager = new Messager(track_id, tid, user_info, page_id, 'LM');
        messager.addEventListener('sent', function () {
            Bubble.showSuccess('工单已成功提交，请耐心等待。', 5);
            setTimeout(function(){
                location.reload();
            },3000)
        });

        messager.addEventListener('error', function(e){
            Bubble.showError(e.data, 5);
        });
    });
});