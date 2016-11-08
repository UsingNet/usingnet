/**
 * Created by henry on 16-1-20.
 */
define(['lib/ajax', 'lib/class', 'text!./Lm.html', 'view/common/header/Header', 'lib/messager', 'view/page/message/Message', 'view/messagebubble/MessageBubble'], function (Ajax, Class, html, Header, Messager, Message, Bubble) {
    var container = document.createElement('div');
    var header = new Header();
    container.innerHTML = html;
    var submitBtn = container.querySelector('input[type="button"]');
    var textArea = container.querySelector('textarea');
    var form = container.querySelector('form');
    var messager = null;

    submitBtn.addEventListener('click', function () {
        if (!messager) {
            return false;
        }
        var values = container.querySelectorAll('form input,textarea');
        var data = {};
        for (var i = 0; i < values.length; i++) {
            if (values[i].name) {
                data[values[i].name] = values[i].value;
            }
        }
        if (data['body'].length) {
            messager.send(data['body'], data['email'], data['phone'], true);
        }
    });

    return new Class().extend(function (tid, track_id, page_id, user_info, teamInfo) {
        header.setConfig(teamInfo);
        if (teamInfo && teamInfo.web && teamInfo.web.input_placeholder) {
            textArea.placeholder = teamInfo.web.input_placeholder;
        }

        this.appendTo = function (dom) {
            header.appendTo(dom);
            dom.appendChild(container);
        };

        messager = new Messager(track_id, tid, user_info, teamInfo, page_id, 'LM');
        messager.addEventListener('sent', function () {
            Bubble.showSuccess('我们已经记录了您的留言, 客服上线后我们将与您联系。', 5);
            //Message.show("发送成功", "我们已经记录了您的留言", "客服上线后我们将与您联系");
            var fields = container.querySelectorAll('form input,textarea');
            for (var i = 0; i < 3; i++) {
                fields[i].value = '';
            }
        });
        messager.addEventListener('error', function (e) {
            Bubble.showError(e.data || '服务器错误', 5);
        });
    });
});