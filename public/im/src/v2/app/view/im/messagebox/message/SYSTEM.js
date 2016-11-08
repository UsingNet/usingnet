/**
 * Created by JHLI on 16-3-8.
 */
define(['lib/class', 'lib/face'],function(Class, Face){
    return new Class().extend(function(messageRaw){



        var container = document.createElement('section');
        container.className = 'system';

        this.toHtml = function(){
            return '<span>'+Face.textToHtml(messageRaw.body)+'</span>';
        };

        this.appendTo = function(dom){
            if ('SEND' !== messageRaw.direction) {
                return;
            }
            dom.appendChild(container);
        };

        this.getContainer = function(){
            return container;
        };

        container.innerHTML = this.toHtml();
    });
});