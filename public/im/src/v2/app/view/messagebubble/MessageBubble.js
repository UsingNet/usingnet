/**
 * Created by jhli on 16-02-16.
 */
define(['lib/class'], function (Class) {
    return new (new Class().extend(function () {
        var bubble = document.createElement('div');

        bubble.style.padding = '10px';
        bubble.style.zIndex = '9999999';
        bubble.style.position = 'absolute';
        bubble.style.top = '9em';
        bubble.style.border = '1px solid #f5f5f5';
        bubble.style.boxShadow = '0 0 0 2px #f5f5f5';
        bubble.style.borderRadius = '5px';
        bubble.style.display = 'none';
        document.body.appendChild(bubble);

        this.showError = function (message, timeout) {
            if (typeof timeout == 'undefined') {
                timeout = 5;
            }
            bubble.style.display = 'block';
            bubble.innerHTML = message;
            bubble.style.background = '#000';
            bubble.style.color = '#fff';
            bubble.style.opacity = 0.6;
            bubble.style.maxWidth = document.body.offsetWidth / 3 * 2 + 'px';
            bubble.style.left = document.body.offsetWidth / 2 - bubble.offsetWidth / 2 + 'px';
            if (typeof timeout == 'number') {
                setTimeout(function () {
                    bubble.style.display = 'none';
                }, timeout * 1000);
            }
        };

        this.showSuccess = function(message, timeout) {
            if (typeof timeout == 'undefined') {
                timeout = 5;
            }
            bubble.style.display = 'block';
            bubble.innerHTML = message;
            bubble.style.background = '#FCE0BA';
            bubble.style.opacity = 1;
            bubble.style.color = '#000';
            bubble.style.maxWidth = document.body.offsetWidth / 3 * 2 + 'px';
            bubble.style.left = document.body.offsetWidth / 2 - bubble.offsetWidth / 2 + 'px';
            if (typeof timeout == 'number') {
                setTimeout(function () {
                    bubble.style.display = 'none';
                }, timeout * 1000);
            }

        };
    }));
});