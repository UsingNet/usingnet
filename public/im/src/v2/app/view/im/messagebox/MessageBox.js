/**
 * Created by henry on 16-1-19.
 */
define(['lib/class', 'text!./MessageBox.html', './message/Message', 'lib/ajax', '../messageform/tools/Wiki'],function(Class, html, Message, Ajax, Wiki){
    var container = document.createElement('article');
    container.innerHTML = html;
    var messager = null;
    var lastTimeStamp = 0;

    var timeStampToHumanString = function(timeStamp){
        var time = new Date(timeStamp*1000);
        var now = Math.round((new Date()).getTime()/1000);
        var today = Math.floor(now/(3600*24))*(3600*24) + ((new Date()).getTimezoneOffset()*60);
        if(timeStamp>today){
            return time.toString().match(/\s(\d+\:\d+)/)[1];
        }
        var beforeDays = Math.floor((timeStamp - today)/3600/24);
        if(beforeDays==1){
            return '昨天 '+ time.toString().match(/\s(\d+\:\d+)/)[1];
        }else if(beforeDays == 2){
            return '前天 '+ time.toString().match(/\s(\d+\:\d+)/)[1];
        }else{
            return (time.getMonth()+1) + '-' + time.getDate() + ' '+time.getHours()+':'+time.getMinutes();
        }
    };

    return new Class().extend(function(){
        var me = this;

        this.appendTo = function(dom){
            dom.appendChild(container);
        };

        this.insertTimeSection = function(timeStamp){
            var section = document.createElement('section');
            section.className = 'time';
            var time = document.createElement('time');
            time.setAttribute('datetime', (new Date(timeStamp*1000)).toISOString());
            time.innerHTML = timeStampToHumanString(timeStamp);
            section.appendChild(time);
            container.appendChild(section);
        };

        this.insertMessage = function(messageRaw){
            if(!messageRaw) {
                return false;
            }

            var message = Message.create(messageRaw);
            if(message){
                // console.log(messageRaw.body);
                // console.log(message.getContainer());
                // 判断并处理知识库消息
                if (!!messageRaw.body.match('<span class="wiki-title">')) {
                    var wiki = message.getContainer().querySelector('a');
                    wiki.setAttribute('href', 'javascript:void(0);');
                    wiki.setAttribute('onclick', 'javascript:void(0);');
                    wiki.addEventListener('click', function() {
                        Ajax.jsonp('/api/knowledge/' + this.getAttribute('data-wikiId'), {}, function(knowledge) {
                            new Wiki(knowledge);
                        });
                    });

                    // wiki.setAttribute('target', '_blank');
                    // wiki.setAttribute('href', location.href + '&wikiId=' + wiki.getAttribute('data-wikiId') + '#wiki');
                }

                if(messageRaw.created_at - lastTimeStamp > 600){
                    this.insertTimeSection(messageRaw.created_at);
                }
                lastTimeStamp = messageRaw.created_at;

                message.appendTo(container);

                var needLoads = message.getContainer().querySelectorAll('img, voice, radio');
                for(var i = 0;i<needLoads.length;i++){
                    needLoads[i].addEventListener('load',function(){
                        container.scrollTop = container.scrollHeight;
                    });
                }
            }
            container.scrollTop = container.scrollHeight;
        };

        this.setMessager = function(m){
            if(!messager){
                messager = m;

                var after_tail = false;
                var new_message_store = [];

                messager.addEventListener("message", function (event) {
                    var msg = event.data.data;
                    if(after_tail) {
                        me.insertMessage(msg);
                    }else{
                        new_message_store.push(msg);
                    }
                });
                messager.addEventListener("event", function (event) {
                    if (event.data.data.action == "tail") {
                        after_tail = true;
                        while (event.data.data.messages.length) {
                            var msg = event.data.data.messages.shift();
                            if (msg.type === 'SYSTEM' && msg.direction === 'RECEIVE') {
                                continue;
                            }
                            me.insertMessage(msg);
                        }
                        if(new_message_store.length){
                            while(msg = new_message_store.shift()){
                                me.insertMessage(msg);
                            }
                        }
                    }
                });

                setTimeout(function(){
                    if(!after_tail){
                        after_tail = true;
                        if(new_message_store.length){
                            while(msg = new_message_store.shift()){
                                me.insertMessage(msg);
                            }
                        }
                    }
                },2000);
            }
        };
    });
});