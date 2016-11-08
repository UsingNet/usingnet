define(['lib/class', 'text!./Wiki.html', 'lib/template', 'lib/ajax'], function(Class, html, Template, Ajax) {
    var $ = new Class().extend(function(knowledge, hideClose) {

        var article = document.querySelector('article');
        var foorer = document.querySelector('footer');
        var wiki = document.createElement('div');
        wiki.setAttribute('class', 'wiki-container');
        wiki.style.background = '#FAFAFA';
        wiki.style.position = 'absolute';
        wiki.style.top = '3em';
        wiki.style.zIndex = 999999;
        wiki.innerHTML = Template(html, {
            title: knowledge.title,
            message: knowledge.message
        });
        wiki.querySelector('.wikiView').style.height = article.offsetHeight + foorer.offsetHeight + 'px';
        wiki.style.width = article.offsetWidth + 'px';
        wiki.style.height = article.offsetHeight + foorer.offsetHeight + 'px';
        var children = knowledge.next_notes;
        var childContainer = wiki.querySelector('.children');
        var li = null;

        if (children.length) {
            for (var i = 0; i < children.length; i++) {
                // child = document.createElement('a');
                // child.innerHTML = children[i].title;
                // child.setAttribute('data-wikiId', children[i]._id);


                li = document.createElement('li');
                li.innerHTML = '<a>' + children[i].title + '</a>';
                li.setAttribute('data-wikiId', children[i]._id);
                li.addEventListener('click', function() {
                    var wikiContainer = document.querySelector('.wiki-container');

                    Ajax.jsonp('/api/knowledge/' + this.getAttribute('data-wikiId'), {}, function(knowledge) {
                        new $(knowledge, hideClose);
                        document.body.removeChild(wikiContainer);
                    });
                });
                childContainer.appendChild(li);
            }
        } else {
            childContainer.style.display = 'none';
        }
        var hideBtn = wiki.querySelector('.wiki-hide');
        hideBtn.addEventListener('click', function(e) {
            document.body.removeChild(wiki);
        });
        if (hideClose) {
            hideBtn.style.display = 'none';
        }

        document.body.appendChild(wiki);
    });

    return $;
});
