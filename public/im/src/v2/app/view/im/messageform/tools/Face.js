/**
 * Created by henry on 16-1-19.
 */
define(['lib/class', 'lib/face', 'text!./Face.html', 'lib/template'],function(Class,faceLib, html, Template){
    return new Class().extend(function(textArea, messager){
        var button = document.createElement('a');
        var menu = document.createElement('div');
        menu.style.position = 'fixed';
        menu.style.zIndex = 999999;
        menu.style.backgroundColor = '#FFF';
        menu.style.left = '3px';
        menu.style.bottom = '40px';
        menu.style.display = 'none';
        document.body.appendChild(menu);

        button.className = 'pure-button tools-button';
        button.href = 'javascript:void(0)';
        button.title = '表情';
        button.innerHTML = '<span class="fa fa-smile-o"></span>';
        menu.innerHTML = Template(html, faceLib);

        menu.addEventListener('click', function(e){
            var node = e.target;
            if(node.tagName != 'TD'){
                node = node.parentElement;
            }
            if(node && node.getAttribute('data')){
                textArea.value += node.getAttribute('data');
                textArea.focus();
            }
        });

        button.addEventListener('click', function(e){
            menu.style.display = menu.style.display == 'none'?'block':'none';
            if(e.stopPropagation) {
                e.stopPropagation();
            } else {
                e.cancelBubble = true;
            }
        });

        document.body.addEventListener('click', function(){
            menu.style.display = 'none';
        });

        return button;
    });
});