/**
 * Created by henry on 16-1-19.
 */
define(['lib/class', 'lib/template', 'text!./Error.html'],function(Class, Template, html){
    var container = document.createElement('dialog');
    return new (new Class().extend(function(){
        this.show = function(title, summary, detail, timeout){
            if(typeof(timeout) == 'undefined'){
                timeout = 3000;
            }

            container.innerHTML = Template(html, {
                title: title,
                summary: summary,
                detail: detail
            });
            document.body.appendChild(container);
            if(typeof(container.show) == 'function') {
                container.show();
            }

            if(timeout>0){
                var me = this;
                setTimeout(function(){
                    me.hide();
                }, timeout);
            }
        };

        this.hide = function(){
            if(typeof(container.close) == 'function'){
                container.close();
            }
            if (container) {
                document.body.removeChild(container);
            }

        };
    }));
});