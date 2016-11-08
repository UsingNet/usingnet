/**
 * Created by henry on 16-2-20.
 */
define(['./setting', './message-box', './order'], function(){
    var online_plane = $('.web_online');
    var me = {};

    var updatePcOnlineState = function(){
        $.getJSON('/api/online', function(resp){
            if(resp.success){
                for(var i=0;i<resp.data.length;i++){
                    if(resp.data[i].id == me.id){
                        online_plane.show();
                    }
                }
            }
        });
    };

    $.getJSON('/api/me', function(resp){
        if(resp.success){
            me = resp.data;
            setInterval(updatePcOnlineState, 600000);
            updatePcOnlineState();
        }else{
            $.toast(resp.msg);
        }
    });

    $('.popup-function-pc .content button').click(function(){
        $.post('/api/online',{action:'offline', type:'pc'}, function(resp){
            var resp = JSON.parse(resp);
            if(resp.success){
                if(resp.data.request_count) {
                    $.showPreloader("正在通知PC端离线");
                    setTimeout(function () {
                        $.hidePreloader();
                        $.getJSON('/api/online', function (resp) {
                            if (resp.success) {
                                var withOnline = false;
                                for (var i = 0; i < resp.data.length; i++) {
                                    if (resp.data[i].id == me.id) {
                                        withOnline = true;
                                    }
                                }
                                if (withOnline) {
                                    online_plane.show();
                                    $.toast("PC端未能成功离线，请稍后重试");
                                } else {
                                    online_plane.hide();
                                    $.toast("PC端已离线");
                                    $.closeModal('.popup-function-pc');
                                }
                            }
                        });
                    }, 3000);
                }else{
                    $.toast("PC端已离线");
                    $.closeModal('.popup-function-pc');
                }
            }else{
                $.toast(resp.msg);
            }
        });
    });
});