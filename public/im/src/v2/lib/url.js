/**
 * Created by henry on 15-12-8.
 */
define([], function() {
    var search = {};
    location.search.substr(1).split('&').filter(function(i) {
        return i; }).map(function(value) {
        var split = value.split('=');
        search[split[0]] = decodeURIComponent(split[1]);
    });
    return {
        search: function(key) {
            return search[key];
        }
    };
});
