/**
 * Created by henry on 15-12-7.
 */
define(['lib/class', 'lib/messager', 'text!template/dialog_im.html', './messagebox', 'lib/ajax', 'lib/template', 'lib/cross_domain', './evaluation', './face'], function(Class, Messager, dialogHtml, MessageBox, Ajax, Template, CrossDomain, Evaluation, Face) {
    return new Class().extend(function(local, remote, user_id, team_info, page_id, config) {
        var self = this;
        var messager = new Messager(local, remote, user_id, team_info, page_id);
        var container = document.createElement('div');
        var obj = {};
        if (config) {
            obj = {
                BTN_BG_COLOR: config.button_bg_color,
                BTN_TEXT_COLOR: config.button_txt_color,
                TITLE_BG_COLOR: config.title_bg_color,
                TITLE_TEXT_COLOR: config.title_txt_color,
                RECEIVE_MSG_BG_COLOR: config.message_right_bg_color,
                RECEIVE_MSG_TEXT_COLOR: config.message_right_font_color,
                SEND_MSG_BG_COLOR: config.message_left_bg_color,
                SEND_MSG_TEXT_COLOR: config.message_left_font_color,
                PLACE_HOLDER: config.input_placeholder,
                CHATWIN_BG_COLOR: config.chatWin_bg_color
            };
        }
        container.innerHTML = Template(dialogHtml, obj);
        container.className = 'dialog';

        var messageForm = container.querySelector('form');
        // var titleContainer = container.querySelector('.title');
        // var logoContainer = container.querySelector('.logo');
        var sendButton = container.querySelector('.sendBtn');
        var uploadButton = container.querySelector('.uploadBtn');
        var faceButton = container.querySelector('.faceBtn');
        var evaluateButton = container.querySelector('.evaluateBtn');
        var inputArea = container.querySelector('.inputArea');
        var uploadTarget = container.querySelector('iframe');
        var messageBox = new MessageBox();

        // if ((window.innerHeight || document.documentElement.clientHeight) < 350) {
        //     titleContainer.style.display = 'none';
        //     titleContainer.parentElement.style.display = 'none';
        //     with (container.querySelector('.message-container').style) {
        //         var top = 0;
        //     }
        // }

        messageBox.appendTo(container.querySelector('.message-container'));

        //Init
        (function() {
            sendButton.addEventListener('click', function() {
                self.sendMessage();
                inputArea.focus();
            });

            var face = new Face(inputArea);
            faceButton.addEventListener('click', function(e) {
                face.clickFaceTool();
                e.cancelBubble = true;
                return false;
            });

            var evaluate = new Evaluation();
            evaluateButton.addEventListener('click', function() {

                evaluate.appendTo(document.body);
            });

            uploadButton.addEventListener('change', function() {
                messageForm.submit();
            });

            uploadButton.addEventListener('focus', function() {
                setTimeout(function() {
                    if (uploadButton.blur) {
                        uploadButton.blur()
                    }
                }, 1000);
            });

            messager.addEventListener("message", function(event) {
                messageBox.insertMessage(event.data.data);

            });

            messager.addEventListener("event", function(event) {
                if (event.data.data.action == "tail") {
                    while (event.data.data.messages.length) {
                        messageBox.insertMessage(event.data.data.messages.shift());
                    }
                }
            });
            uploadTarget.addEventListener("load", function(event) {
                if ((uploadTarget.contentWindow.location.href != 'about:blank') && (!uploadTarget.readyState || uploadTarget.readyState == "complete")) {
                    self.uploadImageResponse();
                }
            });

            inputArea.addEventListener("keypress", function(event) {
                if (event.keyCode == "\r".charCodeAt(0) || event.keyCode == 10 || event.keyCode == 13) {
                    self.sendMessage();
                    if (event.preventDefault) {
                        event.preventDefault();
                    }
                    return false;
                }
            });


        })();

        this.uploadImageResponse = function() {
            try {
                var response = JSON.parse(uploadTarget.contentDocument.body.innerText);
                if (response.success) {
                    self.send(response.data);
                } else {
                    alert(response.msg);
                }
            } catch (e) {
                alert("上传文件失败，请稍后重试");
            }
        };

        this.sendMessage = function() {
            var message = self.getMessage();
            if (message && message.length) {
                self.send(self.getMessage());
            }
            inputArea.value = '';
        };

        this.send = function(message) {
            messager.send(message);
        };

        this.getMessage = function() {
            return inputArea.value;
        };

        // this.setTitle = function (title) {
        //     titleContainer.innerHTML = title;
        // };

        // this.setLogo = function (src) {
        //     logoContainer.src = src;
        // };

        this.appendTo = function(dom) {

            dom.appendChild(container);
        };
    });
});
