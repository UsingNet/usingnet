/**
 * Created by henry on 16-3-11.
 */
var App = {};

App.keywordHeightLight = function(keyword){
    var keywords = document.querySelectorAll('.search-result .title a em.keyword, .search-result .description p em.keyword');
    for(var i = 0;i<keywords.length; i++){
        keywords[i].parentElement.replaceChild(document.createTextNode(keywords[i].innerHTML), keywords[i]);
    }

    var contains = document.querySelectorAll('.search-result .title a, .search-result .description p');
    for(var j = 0;j<contains.length; j++){
        contains[j].innerHTML = contains[j].innerHTML.replace(new RegExp(keyword,'g'), function(match){
            return '<em class="keyword">' + match + '</em>';
        });
    }
};