/**
 * Created by henry on 16-1-19.
 */
define(['lib/class', 'text!./UploadImage.html', 'view/page/error/Error', 'view/messagebubble/MessageBubble'],function(Class, html, Error, Bubble){
    return new Class().extend(function(textArea, messager){
        var button = document.createElement('span');
        button.style.padding = '0';
        button.style.width = '46px';
        button.style.height = '35px';
        button.className = 'pure-button tools-button';
        button.href = 'javascript:void(0)';
        button.title = '上传图片';
        button.innerHTML = html;
        button.style.overflow = 'hidden';
        var form = button.querySelector('form');
        var iframe = button.querySelector('iframe');
        var resetBtn = button.querySelector('input[type="reset"]');
        var fileBtn = button.querySelector('input[type="file"]');
        fileBtn.addEventListener('change', function(){
            var size = Math.ceil(fileBtn.files[0].size / 1024);
            if (size > 4096) {
                Bubble.showError('文件过大，只能发送10M以内的图片!');
                try {
                    resetBtn.click();
                }catch(e){
                    var eve = document.createEvent("MouseEvents");
                    eve.initEvent("click", true, true);
                    resetBtn.dispatchEvent(eve);
                }
                return;
            }
            form.submit();
        });
        form.style.marginTop = '-45px';
        form.style.marginLeft = '35px';

        iframe.addEventListener("load", function (event) {
            if ((iframe.contentWindow.location.href != 'about:blank') && (!iframe.readyState || iframe.readyState == "complete")) {
                try {
                    var response = JSON.parse(iframe.contentDocument.body.innerText || iframe.contentDocument.body.innerHTML);
                    if (response.success) {
                        messager.send(response.data);
                        try {
                            resetBtn.click();
                        }catch(e){
                            var eve = document.createEvent("MouseEvents");
                            eve.initEvent("click", true, true);
                            resetBtn.dispatchEvent(eve);
                        }
                    } else {
                        Bubble.showError(response.msg ? response.msg : '服务器错误。', 10);
                        //Error.show("错误",response.msg, response.msg);
                    }
                } catch (e) {
                    Bubble.showError("上传文件失败，请稍后重试", 5);
                    //Error.show("错误","上传文件失败，请稍后重试", iframe.contentDocument.body.innerHTML);
                }
            }
        });
        return button;
    });
});