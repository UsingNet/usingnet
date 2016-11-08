/**
 * Created by jhli on 16-5-4.
 */
define(['lib/class', 'text!template/header.html', 'lib/template', 'lib/cross_domain'], function(Class, headerHtml, Template, crossDomain) {
    return new Class().extend(function(teaminfo) {
        var header = document.createElement('div');
        header.className = 'header';
        window.usingnetCrossDomain = crossDomain;
        header.innerHTML = Template(headerHtml, {
            teamLogo: (teaminfo.logo ? teaminfo.logo.replace('https:', '') + '-avatar' : ''),
            teamName: teaminfo.name,
            url: location.href,
            iconDisplay: (window.innerWidth || document.documentElement.clientWidth) < 380 ? 'block' : 'none'
        });
        header.style.height = '48px';
        header.style.backgroundColor = '#' + teaminfo.web.title_bg_color;

        this.appendTo = function(dom) {
            dom.appendChild(header);
        };

    });
});
