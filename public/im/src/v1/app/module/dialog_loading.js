/**
 * Created by henry on 15-12-7.
 */
define(['../lib/class', 'text!template/dialog_loading.html', 'lib/template'], function (Class, dialogHtml, Template) {
    return new Class().extend(function () {

        var container = document.createElement('div');
        container.innerHTML = Template(dialogHtml, {});
        container.className = 'dialog';

        this.appendTo = function (dom) {
            dom.appendChild(container);
        };
        this.removeFrom = function(dom) {
            dom.removeChild(container);
        };
    });
});