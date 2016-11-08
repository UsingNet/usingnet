define(['lib/class', 'lib/face', 'text!template/face.html', 'lib/xTemplate'], function(Class, faceLib, html, xTemplate) {
    return new Class().extend(function(textArea) {
        var menu = document.createElement('div');
        menu.style.position = 'absolute';
        menu.style.zIndex = 999999;
        menu.style.backgroundColor = '#FFF';
        menu.style.left = '3px';
        menu.style.bottom = '40px';
        menu.style.display = 'none';
        document.body.appendChild(menu);

        menu.innerHTML = xTemplate(html, faceLib);

        menu.addEventListener('click', function(e) {
            var node = e.target || e.srcElement;
            if (node.tagName != 'TD') {
                node = node.parentElement;
            }
            if (node && node.getAttribute('data')) {
                textArea.value += node.getAttribute('data');
                textArea.focus();
            }
        });

        // document.body.addEventListener('click', function() {
        //     menu.style.display = 'none';
        // });

        this.clickFaceTool = function() {
            menu.style.display = menu.style.display == 'none' ? 'block' : 'none';
        };
    });
});
