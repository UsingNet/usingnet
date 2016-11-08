/**
 * Created by henry on 16-1-19.
 */
define(['lib/class', 'text!./MessageForm.html', './tools/CutScreen', './tools/Face', './tools/UploadImage', './tools/Evaluate', 'lib/browser', 'view/messagebubble/MessageBubble'],
    function(Class, html, CutScreen, Face, UploadImage, Evaluate, Browser, Bubble){
    var container = document.createElement('footer');
    container.className = 'pure-form';
    container.innerHTML = html;
    var messager = null;
    var sendButton = container.querySelector('.sendBtn');
    var textArea = container.querySelector('textarea');
    var toolsBar = container.querySelector('nav');


        var typing_delay = false;

        textArea.addEventListener('keyup', function(){
            if(!typing_delay){
                typing_delay = true;
                setTimeout(function(){
                    typing_delay = false;
                    if(messager){
                        messager.typing(textArea.value);
                    }
                },1000);
            }
        });

    return new Class().extend(function(){
        this.appendTo = function(dom){
            dom.appendChild(container);
        };

        this.setConfig = function(config){
            if(!config || !config.web){
                return false;
            }
            textArea.placeholder = config.web.input_placeholder || '有什么可以帮您?';
        };

        this.setMessager = function(m){
            if(!messager){
                messager = m;
                textArea.addEventListener('keypress', function(e){
                    if((e.keyCode == 13 || e.keyCode == 10) && !e.ctrlKey && !e.shiftKey){
                        try {
                            sendButton.click();
                        }catch(e){
                            var eve = document.createEvent("MouseEvents");
                            eve.initEvent("click", true, true);
                            sendButton.dispatchEvent(eve);
                        }
                        if(typeof(e.preventDefault) == 'function'){
                            e.preventDefault();
                        }
                        return false;
                    }
                });

                messager.addEventListener('error', function(e) {
                    Bubble.showError(e.data ? e.data : '服务器内部错误。', 5);
                    textArea.value = e.value;
                });

                sendButton.addEventListener('click', function(){
                    if(textArea.value){
                        messager.send(textArea.value);
                        textArea.value = '';
                    }
                    textArea.focus();
                });

                toolsBar.appendChild(new Face(textArea, messager));
                if (!Browser.isMobile) {
                    toolsBar.appendChild(new CutScreen(textArea, messager));
                }
                toolsBar.appendChild(new UploadImage(textArea, messager));
                toolsBar.appendChild(new Evaluate(textArea, messager));
            }
        };
    });
});