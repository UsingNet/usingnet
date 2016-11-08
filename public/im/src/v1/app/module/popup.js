/**
 * Created by henry on 15-12-12.
 */
define(['lib/class', 'text!template/popup.html', 'app/config/app', '../lib/template', 'app/config/app', 'lib/ajax', 'lib/cross_domain'], function(Class, popUpHtml, appConfig, Template, config, Ajax, CrossDomain) {
    return new Class().extend(function(tid, track_id, user_info, page_id) {
        var CSS_BOX_ID = "usingnet_pop_71d92ba94f";
        var container = document.createElement('div');
        container.id = CSS_BOX_ID;
        var window_src = appConfig['IM_BASE_URL'] + '?tid=' + tid + '&track_id=' + track_id + '&user_info=' + (user_info ? user_info : '') + '&page_id=' + (page_id ? page_id : '');
        var unreadMessageCount = 0;

        // if (!window.navigator.userAgent.match(/MSIE 6|7/)) {
        //     container.style.display = 'none';
        // }

        Ajax.jsonp(config['IM_BASE_URL'] + '/api/teaminfo/' + tid, {}, function(response) {
            var web = response.web;
            var pop_params = {
                CSS_BOX_ID: CSS_BOX_ID,
                IM_WINDOW_SRC: 'about:blank',
                customerIcon: ('none' === web.icon_shape && web.customer_icon) ? 'block' : 'none',
                customer_icon: web.customer_icon ? web.customer_icon.replace('https:', '') : '',
                barIcon: 'bar' === web.icon_shape ? 'block' : 'none',
                squareIcon: 'square' === web.icon_shape ? 'block' : 'none',
                circularIcon: 'circular' === web.icon_shape ? 'block' : 'none',
                title_bg_color: web.title_bg_color,
                plugin_direction: web.direction.replace('bottom-', ''),
                plugin_margin_bottom: web.page_bottom_distance + 'px',
                plugin_margin_side: web.page_distance + 'px',
                toolbarText: response.online ? '在线客服' : '客服留言'
            };

            if(pop_params.customerIcon == pop_params.barIcon && pop_params.squareIcon == pop_params.circularIcon){
                pop_params.circularIcon = 'block';
            }
            container.innerHTML = Template(popUpHtml, pop_params);

            // container.style.display = 'block';

            var toolbars = document.querySelectorAll('.toolbar'),
                toolbar;
            var unreadMessageRemind = document.querySelector('.usingnetUnreadMessageRemind');
            var iframe = container.querySelector('iframe');

            for (var i = 0; i < toolbars.length; i++) {
                if ('block' === toolbars[i].style.display) {
                    toolbar = toolbars[i];
                    break;
                }
            }

            iframe.src = window_src;

            toolbar.addEventListener('click', function() {
                if (iframe.src == 'about:blank') {
                    iframe.src = window_src;
                }
                container.className = container.className ? "" : "active";
                toolbar.style.display = 'none';
                if (unreadMessageRemind) {
                    unreadMessageRemind.style.display = 'none';
                    unreadMessageCount = 0;
                }
            });

            CrossDomain.receiveMessage(function(e) {
                var data = e.data;
                if ('minimize' === data.action) {
                    container.className = "";
                    toolbar.style.display = 'block';
                } else if ('newMessage' === data.action) {
                    if ('block' === toolbar.style.display) {
                        unreadMessageCount++;
                        if (unreadMessageRemind) {
                            unreadMessageRemind.innerText = unreadMessageCount > 99 ? 99 : unreadMessageCount;
                            unreadMessageRemind.style.display = 'block';
                        }
                    }
                }
            }, config['IM_BASE_URL']);
        });

        this.appendTo = function(dom) {
            dom.appendChild(container);
        };

        this.show = function() {
            if (iframe.src == 'about:blank') {
                iframe.src = window_src;
            }
            container.className = 'active';
            toolbar.style.display = 'none';
            if (unreadMessageRemind) {
                unreadMessageRemind.style.display = 'none';
                unreadMessageCount = 0;
            }
        };

        this.hide = function() {
            container.className = '';
        };

        this.getUrl = function() {
            return window_src;
        };
    });
});
