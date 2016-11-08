/**
 * Created by henry on 16-1-19.
 */
define(['lib/class', 'lib/editor4screen', 'lib/ajax', 'view/page/error/Error', 'view/messagebubble/MessageBubble'],function(Class, Editor, Ajax, Error, Bubble){
    return new Class().extend(function(textArea, messager){
        var button = document.createElement('a');
        button.className = 'pure-button tools-button';
        button.href = 'javascript:void(0)';
        button.title = '截屏';
        button.innerHTML = '<span class="fa fa-crop"></span>';

        button.addEventListener('click', function(){
            if (self != top) {
                window.parent.postMessage(JSON.stringify({action:'cutScreen'}), '*');
            }else{
                Editor(document.body, function (data) {
                    window.postMessage(JSON.stringify({data:data, type:'image/png', encode:'base64', action:'sendScreen'}), '*');
                });
            }
        });

        window.addEventListener('message', function(e){
            try{
                var messageData = JSON.parse(e.data);
                if(messageData && messageData.action == 'sendScreen' && messageData.data){
                    var size = Math.ceil(messageData.data.length / 1024);
                    if (size > 10240) {
                        Bubble.showError('截图过大，只能发送10M以内的截图!');
                        return;
                    }
                    Ajax.post('/api/upload', {file:messageData.data, type:messageData.type, encode:messageData.encode}, function(response){
                        if(!response.success){
                            Bubble.showError(response.msg ? response.msg : '上传截图时发生错误。', 5);
                            //Error.show('错误', '上传截图时发生错误', response.msg);
                        }else{
                            messager.send(response.data);
                        }
                    });
                }
            }catch(e){}
        });

        return button;
    });
});