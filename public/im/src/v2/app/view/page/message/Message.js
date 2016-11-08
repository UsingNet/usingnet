/**
 * Created by henry on 16-1-19.
 */
define(['lib/class', 'lib/template', 'text!./Message.html'],function(Class, Template, html){
    var container = document.createElement('dialog');
    return new (new Class().extend(function(){
        this.show = function(title, summary, detail){
            container.innerHTML = Template(html, {
                title: title,
                summary: summary,
                detail: detail
            });
            document.body.appendChild(container);
            if(typeof(container.show) == 'function') {
                container.show();
            }
        };

        this.hide = function(){
            if(typeof(container.close) == 'function'){
                container.close();
            }
            document.body.removeChild(container);
        };
    }));
});