/**
 * Created by henry on 16-1-19.
 */
define(['lib/class', 'text!./Header.html', 'lib/template', 'lib/browser'],function(Class, html, Template, Browser){
    var container = document.createElement('header');
    container.innerHTML = Template(html,{
        isMobile: Browser.isMobile ? 'none' : 'inline'
    });
    var teamName = container.querySelector('address span');
    var logo = container.querySelector('img.logo');
    var nav = container.querySelector('nav');
    if(window.self == window.top){
        nav.style.display = 'none';
    }

    return new Class().extend(function(){
        this.appendTo = function(dom){
            dom.appendChild(container);
        };

        this.setConfig = function(config){
            if(!config || !config.web){
                return false;
            }
            teamName.innerHTML = config.web.name;
            this.updateLogo(config.web.logo);
        };

        this.updateLogo = function(logoSrc){
            if(logoSrc){
                logo.src = logoSrc + '-avatar';
            }
        };

        this.getHeight = function(){
            return container.offsetHeight;
        };
    });
});