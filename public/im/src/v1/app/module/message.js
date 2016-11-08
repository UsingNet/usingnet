/**
 * Created by henry on 15-12-8.
 */
define(['../lib/class', 'lib/event', 'lib/face'], function (Class, Event, Face) {
    return new Class().extend(function (messageData) {
        var self = this;
        var container = document.createElement('div');
        container.setAttribute('id', 'message-'+messageData._id);
        if (messageData.body.indexOf('<img') == 0) {
            messageData.body = messageData.body.replace('https:', '');
        }

        container.innerHTML = Face.textToHtml(messageData.body);
        container.className = "message " + messageData.direction.toLowerCase();
        if(messageData.package && messageData.package.undo){
            container.innerHTML = '[已撤销]';
            container.style.display = 'none';
        }

        this.appendTo = function (dom) {
            dom.appendChild(container);
        };
        var imageList = container.querySelectorAll('img');
        for (var i = 0; i < imageList.length; i++) {
            imageList[i].addEventListener('load', function () {
                var event = new Event('load');
                self.triggerEvent(event);
            });
        }
    });
});
