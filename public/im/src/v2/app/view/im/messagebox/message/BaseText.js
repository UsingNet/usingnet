/**
 * Created by henry on 16-1-19.
 */
define(['lib/class', 'lib/face'],function(Class, Face){
    return new Class().extend(function(messageRaw){
        var container = document.createElement('section');
        container.className = messageRaw.direction.toLowerCase();
        container.id = 'message-'+messageRaw._id;
        this.toHtml = function(){
            if(messageRaw.package && messageRaw.package.undo){
                container.className = container.className + ' ' + 'gray';
                container.style.display = 'none';
                return '<div>[已撤销]</div>';
            }else{
                return '<div>'+Face.textToHtml(messageRaw.body)+'</div>';
            }
        };

        this.appendTo = function(dom){
            dom.appendChild(container);
        };

        this.getContainer = function(){
            return container;
        };

        container.innerHTML = this.toHtml();
        var images = container.querySelectorAll('img');
        for(var i = 0;images && i<images.length;i++){
            images[i].className += ' pure-img';
            images[i].style.cursor = 'pointer';
            images[i].addEventListener('click', function(){
                var img = new Image();
                img.src = this.src;
                var top = (window.screen.availHeight - 30 - img.height) / 2;
                var left = (window.screen.availWidth - 10 - img.width) / 2;
                window.open (this.src, 'newwindow', 'top=' + top + ', left='+left+', height=' + img.height + ', width=' + img.width + ', toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no');
            });
        }
    });
});