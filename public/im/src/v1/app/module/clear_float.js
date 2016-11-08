/**
 * Created by henry on 16-02-17.
 */
define(['../lib/class'], function (Class) {
    return new Class().extend(function () {
        var container = document.createElement('div');
        container.style.clear = 'both';
        this.appendTo = function (dom) {
            dom.appendChild(container);
        };
    });
});
