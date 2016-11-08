/**
 * Created by henry on 15-12-12.
 */
define([], function() {
    return function(html, obj) {
        for (var i in obj) {
            html = html.replace(new RegExp("\\{\\$" + i + "\\$\\}", "g"), obj[i]);
        }
        return html;
    };
});
