/**
 * Created by henry on 16-1-19.
 */
define(['lib/ajax',
        'lib/class',
        '../common/header/Header',
        './messagebox/MessageBox',
        './messageform/MessageForm',
        'view/page/error/Error',
        'lib/messager'
    ],
    function(Ajax, Class, Header, MessageBox, MessageForm, Error, Messager) {
        var header = new Header();
        var messageBox = new MessageBox();
        var messageForm = new MessageForm();

        return new Class().extend(function(tid, track_id, page_id, user_info, teamInfo, token) {
            header.setConfig(teamInfo);
            messageForm.setConfig(teamInfo);

            var messager = new Messager(track_id, tid, user_info, teamInfo, page_id, 'IM', token);


            messageBox.setMessager(messager);
            messageForm.setMessager(messager);
            this.appendTo = function(dom) {
                header.appendTo(dom);
                messageBox.appendTo(dom);
                messageForm.appendTo(dom);
            };
        });
    }
);
