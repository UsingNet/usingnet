/**
 * Created by jhli on 16-2-26.
 */
Ext.define('Admin.view.widgets.BubbleMessage', {
    singleton: true,

    alert: function(message) {
        var bubble = document.createElement('div');
        document.body.appendChild(bubble);
        bubble.style.padding = '10px';
        bubble.style.zIndex = '9999999';
        bubble.style.background = '#555';
        bubble.style.position = 'absolute';
        bubble.style.maxWidth = document.body.offsetWidth / 3 * 2 + 'px';
        bubble.style.minWidth = '200px';
        bubble.style.top = '40%';
        bubble.style.opacity = '0.8';

        bubble.innerHTML = message;
        bubble.style.left = (document.body.offsetWidth / 2) - (bubble.offsetWidth / 2) + 'px';
        //bubble.style.border = '1px solid #f5f5f5';
        //bubble.style.boxShadow = '0 0 0 2px #f5f5f5';
        bubble.style.borderRadius = '5px';
        bubble.style.textAlign = 'center';
        bubble.style.color = '#FFF';

        //bubble.style.top = document.body.offsetHeight / 2 - bubble.offsetHeight / 2 - 200 + 'px';
        setTimeout(function(){
            bubble.style.opacity = 0;
            bubble.style.transition = 'opacity 0.5s ease-in 1s';
        },100);
        setTimeout(function() {
            document.body.removeChild(bubble);
        }, 1500);

    }
});