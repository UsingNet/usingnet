/**
 * Created by henry on 15-12-17.
 */
define(['../lib/class', 'text!template/dialog_lm.html', 'lib/messager'],function(Class, dialogHtml, Messager){
    return new Class().extend(function(local, remote, user_info, team_info, page_id, config){
        var self = this;
        var container = document.createElement('div');
        var messager = new Messager(local, remote, user_info, team_info, page_id, 'LM');
        container.className = 'dialog dialog_lm';
        container.innerHTML = dialogHtml;

        var buttons = container.querySelectorAll('input[type=button]');
        //container.style.backgroundColor = '#' + config.title_bg_color;
        container.style.backgroundColor = '#fafafa';
        for (var i = 0; i < buttons.length; i++) {
            var btn = buttons[i];
            btn.style.backgroundColor = '#' + config.button_bg_color;
            btn.style.border = '1px solid #' + config.button_bg_color;
            btn.style.color = '#' + config.button_txt_color;
        }

        var form = container.querySelector('form');
        var submitButton = container.querySelector('form input[type=button]');
        var submittedAlert = container.querySelector('.submitted');
        var closeAlertButton = container.querySelector('.submitted input[type=button]');

        this.appendTo = function(dom){
            dom.appendChild(container);
        };

        if(user_info){
            container.querySelector('.contact_info').style.display='none';
        }

        (function(){
            submitButton.addEventListener('click', function(){
                var values = container.querySelectorAll('form input,textarea');
                var data = {};
                for(var i=0; i<values.length;i++){
                    if(values[i].name) {
                        data[values[i].name]=values[i].value;
                    }
                }
                if(data['body'].length) {
                    messager.send(data['body'], data['email'], data['phone']);
                }
            });

            messager.addEventListener('sent', function(){
                container.querySelector('form textarea').value = '';
                submittedAlert.style.display='block';
            });

            closeAlertButton.addEventListener('click', function(){
                submittedAlert.style.display='none';
            });

        })();
    });
});