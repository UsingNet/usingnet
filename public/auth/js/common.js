/**
 * Created by henry on 15-10-29.
 */
(function() {

    window.onload = function() {
        var ua = navigator.userAgent;
        var device = navigator.platform;
        var isPC = device.indexOf('Win') == 0 || device.indexOf('Mac') == 0 || device.indexOf('X11') == 0 || device.indexOf('Linux') == 0;
        if (ua.indexOf('Mobile') > -1) {
            isPC = false;
        }

        /*
        if (!isPC || (('/login' == location.pathname || '/register' == location.pathname) && !ua.match('Chrome'))) {
            var warn = document.createElement('div');
            var text = isPC ? '为了获得最佳的体检效果，请使用谷歌浏览器访问本系统。没有安装谷歌浏览器？<a style="text-decoration: none;" target="_blank" href="http://dlsw.baidu.com/sw-search-sp/soft/9d/14744/ChromeStandalone_49.0.2623.87_Setup.1457595239.exe">点击下载</a>' : '请使用桌面电脑访问此系统！';
            warn.style.width = (window.innerWidth || document.body.clientWidth) * 0.6 + 'px';
            warn.style.background = 'red';
            warn.style.position = 'absolute';
            warn.style.top = '0px';
            warn.style.left = (window.innerWidth || document.body.clientWidth) / 2 - parseInt(warn.style.width) / 2 + 'px';
            warn.style.zIndex = 9999999999999;
            warn.style.background = '#fff';
            warn.style.textAlign = 'center';
            warn.style.padding = '0 20px';
            warn.style.border = '5px solid #35BAF6';
            warn.innerHTML = '<p style="margin: 15px;">' + text + '</p>';
            document.body.appendChild(warn);

            var form = document.getElementById('auth-form');
            form.parentNode.removeChild(form);

            var formImg = document.createElement('img');
            if ('/login' == location.pathname) {
                formImg.setAttribute('src', '/image/loginField.png');
            } else {
                formImg.setAttribute('src', '/image/registerField.png');
            }

            // ie
            if (!document.getElementsByClassName) {
                document.getElementsByClassName = function(cls, parent) {
                    var all = (parent || document).getElementsByTagName('*');
                    var result = [];
                    for (var i = 0, l = all.length, el; el = all[i++];) {
                        if (el.nodeType == 1 && el.className &&
                            el.className.indexOf(cls) > -1) {
                            result.push(el);
                        }
                    }
                    return result;
                }
            }
            document.getElementsByClassName('container')[0].appendChild(formImg);
            formImg.style.position = 'absolute';
            formImg.style.top = '200px';
            formImg.style.left = '50%';
            formImg.style.marginLeft = '-200px';
        }
        */
    };

    var zoom = Math.max((window.innerWidth || document.body.clientWidth) / 1360, (window.innerHeight || document.body.clientHeight) / 1000, 1);
    var imgStyle = document.getElementById('background-image').style;
    imgStyle.width = parseInt(zoom * 1360).toString() + 'px';
    imgStyle.height = parseInt(zoom * 1000).toString() + 'px';
    window.onresize || (window.onresize = arguments.callee);

    var App = {
        '$': function(dom, selector) {
            return dom.querySelector(selector);
        },
        init: {}
    };
    App.init.registerInit = function() {
        var form = App.$(document, '#register_form');
        if (!form) {
            return false;
        }

        var password = App.$(form, '#password');
        var password_confirmation = App.$(form, '#password_confirmation');
        var term_check = App.$(form, '#term_check');
        var send_phone_verification = App.$(form, '.send_phone_verification');
        var verification_container = App.$(form, '.verification');
        var phone_input = App.$(form, '#phone');

        password.oninput = function() {
            if (password.value.length < 8 || password.value.length > 32) {
                password.setCustomValidity("密码长度需要在8~32个字符之间");
            } else {
                password.setCustomValidity("");
            }
        };

        password_confirmation.oninput = function() {
            if (password.value != password_confirmation.value) {
                password_confirmation.setCustomValidity("两次输入密码不一致");
            } else {
                password_confirmation.setCustomValidity("");
            }
        };

        //term_check.setCustomValidity("同意注册协议才能注册");
        term_check.onclick = function() {
            if (!term_check.checked) {
                term_check.setCustomValidity("同意注册协议才能注册");
            } else {
                term_check.setCustomValidity("");
            }
        };

        if(phone_input){
            phone_input.onkeyup = function(e){
                if(this.value.length!=11){
                    send_phone_verification.setAttribute('disabled', 'disabled');
                }else if(this.value.substr(0,1) != '1'){
                    send_phone_verification.setAttribute('disabled', 'disabled');
                }else{
                    send_phone_verification.removeAttribute('disabled');
                }
            }
            phone_input.onkeyup();
        }

        if(send_phone_verification) {
            send_phone_verification.onclick = function () {
                $.get('/geetest', {phone: phone_input.value}, function (info_params) {
                    info_params['product'] = 'embed';
                    initGeetest(info_params, function (captchaObj) {
                        verification_container.innerHTML = '';
                        verification_container.className = 'verification active';
                        captchaObj.appendTo('.verification');
                        captchaObj.onFail(function () {
                            captchaObj.refresh();
                        });
                        captchaObj.onError(function () {
                            captchaObj.refresh();
                        });
                        captchaObj.onSuccess(function () {
                            var validate = captchaObj.getValidate();
                            $.post('/sendsms', {
                                phone: phone_input.value, token: info_params['token'],
                                geetest_challenge: validate.geetest_challenge,
                                geetest_validate: validate.geetest_validate,
                                geetest_seccode: validate.geetest_seccode
                            }, function (resp) {
                                if (true || resp.success) {
                                    verification_container.className = 'verification';

                                    var seconds = 60;
                                    send_phone_verification.setAttribute('disabled', 'disabled');
                                    send_phone_verification.innerHTML = seconds + '秒后重发';
                                    var send_disable_timer = setInterval(function(){
                                        seconds--;
                                        send_phone_verification.innerHTML = seconds + '秒后重发';
                                        if(seconds<=0){
                                            clearInterval(send_disable_timer);
                                            send_phone_verification.removeAttribute('disabled');
                                            send_phone_verification.innerHTML = '发送验证码';
                                        }
                                    },1000);

                                } else {
                                    var error_msg = document.createElement('div');
                                    error_msg.className ="alert alert-danger";
                                    error_msg.innerHTML ='<p>'+ resp.msg +'</p>';
                                    verification_container.removeChild(captchaObj.dom);
                                    verification_container.className = 'verification';
                                    var form = document.getElementById('register_form');
                                    form.insertBefore(error_msg, form.children[0]);
                                    setTimeout(function(){
                                        form.removeChild(error_msg);
                                    },5000);
                                }
                            });
                        });
                        //var validate = captchaObj.getValidate();
                        //debugger;
                        //if (!validate) {
                        //    alert('请先完成验证！');
                        //    return;
                        //}
                        //console.log({
                        //    // 二次验证所需的三个值
                        //    geetest_challenge: validate.geetest_challenge,
                        //    geetest_validate: validate.geetest_validate,
                        //    geetest_seccode: validate.geetest_seccode
                        //});
                    });
                });
            }
        }
    };



    (function() {
        var ie = !!(window.attachEvent && !window.opera);
        var wk = /webkit\/(\d+)/i.test(navigator.userAgent) && (RegExp.$1 < 525);
        var fn = [];
        var run = function() {
            for (var i = 0; i < fn.length; i++) fn[i]();
        };
        var d = document;
        d.ready = function(f) {
            if (!ie && !wk && d.addEventListener)
                return d.addEventListener('DOMContentLoaded', f, false);
            if (fn.push(f) > 1) return;
            if (ie)
                (function() {
                    try {
                        d.documentElement.doScroll('left');
                        run();
                    } catch (err) { setTimeout(arguments.callee, 0); }
                })();
            else if (wk)
                var t = setInterval(function() {
                    if (/^(loaded|complete)$/.test(d.readyState))
                        clearInterval(t), run();
                }, 0);
        };
    })();
    document.ready(function() {
        for (var i in App.init) {
            App.init[i]();
        }
    });

})();
