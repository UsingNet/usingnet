/**
 * Created by henry on 15-12-8.
 */
define(['../lib/class', './message', './clear_float'],function(Class, messageModel, clearFloat){
    return new Class().extend(function(){
        var container = document.createElement('div');
        container.className='messageBox';

        this.insertMessage = function(messageData){
            var message = new messageModel(messageData);
            message.appendTo(container);
            (new clearFloat()).appendTo(container);
            container.parentNode.scrollTop = container.parentNode.scrollHeight;

            message.addEventListener('load',function(){
                container.parentNode.scrollTop = container.parentNode.scrollHeight;
            });
        };

        this.appendTo = function(dom){
            dom.appendChild(container);
        };
    });
});