/**
 * Created by jiahonglee on 2016/7/21.
 */
define([
    'lib/class'
], function(Class) {
    return new Class().extend(function(teamInfo) {
        var container = document.createElement('<div id="displayAgentGroup"></div>');
        container.style.left = 0;
        container.style.right = 0;
        container.style.top = '48px';
        container.style.bottom = '82px';
        container.style.background = '#fff';
        container.style.position = 'absolute';
        container.style.padding = '20px';

        var groups = teamInfo.groups;
        var groupsDom = '<h5>请先选择咨询内容</h5>';
        for (var i = 0; i < groups.length; i++) {
            groupsDom += '<a href="javascript: void(0);" data-id="' + groups[i].id + '" style="display: block; text-decoration: none; font-size: 14px; color: #2db7f5;">' + groups[i].name + '</a>'
        }

        container.innerHTML = groupsDom;

        var items = container.querySelectorAll('a');
        for (var j = 0; j < items.length; j++) {
            items[j].addEventListener('click', function() {
                var id = this.getAttribute('data-id');
                container.setAttribute('data-id', id);
                container.style.zIndex = '-10000';
            }, false);
        }


        this.appendTo = function(dom) {
            dom.appendChild(container);
        };
    });
});