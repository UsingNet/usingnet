$(function () {

    var HOST = location.host.replace('app.', '');
    var URL_CREATE = 'http://app.' + HOST + '/api/message/agent';
    var URL_MESSAGE = 'http://app.' + HOST + '/api/message';
    var URL_WS = 'ws://ws.' + HOST + '/ws?_token=';

    var request = function (val) {
        var uri = window.location.search;
        var re = new RegExp("" +val+ "=([^&?]*)", "ig");
        return ((uri.match(re))?(uri.match(re)[0].substr(val.length+1)):null);
    };

    var tid = request('tid');
    var uid = request('uid');


    if (!tid && !uid) {
        return ;
    }

    $.ajax({
        url: URL_CREATE,
        type: 'GET',
        data: {remote: uid, type: 'IM'},
        error: function () {
            alert('链接失败') ;
        },
        beforeSend: function () {
            $('.header').append('<div class="loading">链接中...</div>')
        },
        success: function (data) {
            $('.loading').remove();
            $('.submit').prop('disabled', false);
            var ws = new WebSocket(URL_WS + data.data);
            ws.onmessage = function (e) {
                var data = $.parseJSON(e.data);
                if (data.ok) {
                    var data = data.data;
                    if (data.direction == 'SEND') {
                        $('.items').append('<li><div class="msg-con fl from">'+ data.body +'</div></li>')
                    } else if (data.direction == 'RECEIVE') {
                        $('.items').append('<li><div class="msg-con fr to">'+ data.body +'</div></li>')
                    }

                    if (data.action == 'tail') {
                        data.messages.forEach(function (message) {
                             if (message.direction == 'SEND') {
                                $('.items').append('<li><div class="msg-con fl from">'+ message.body +'</div></li>')
                             } else if (message.direction == 'RECEIVE') {
                                 $('.items').append('<li><div class="msg-con fr to">'+ message.body +'</div></li>')
                             }
                        });

                    }

                    $('.main').scrollTop($('.main').height());
                }

            };

            ws.onclose = function (data) {
            };

            ws.onopen = function () {
                ws.send('{"action": "tail"}');
            };

            setInterval(function () {
                ws.send('{"action": "heartbeat"}');
            }, 20000);
        }
    });

    $('.submit').on('click', function () {
        var msg = $('textarea').val();
        if (!msg) {
            return
        }
        $.ajax({
            type: 'POST',
            url: URL_MESSAGE,
            data: {body: msg, from: uid, to: tid, type: 'IM'},
            error: function () {
                alert('发送错误');
            },
            success: function (data) {
                $('textarea').val('');
            }
        })
    });

    $(document).on('keyup', function (e) {
        if (e.keyCode == 13) {
            $('.submit').trigger('click');
        }
    });

});