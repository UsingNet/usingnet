<!doctype html>
<html>
<head>
    <meta charset="UTF-8">
    <title>重设密码</title>
    <link rel="stylesheet" href="/css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="/css/auth.css" />
    <link rel="stylesheet" type="text/css" href="/css/font-awesome.css" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="format-detection" content="telephone=yes"/>
    <meta name="msapplication-tap-highlight" content="no" />
</head>
<body>
<div class="container">
    <div id='header'>
        重设密码
    </div>

    <div id="auth-form">
        <h4>请输入邮箱或手机号</h4>
        @if (count($errors) > 0)
            <div class="alert alert-danger">
                <ul>
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif
        @if (Session::get('msg'))
            <div class="{{ Session::get('class')  }}">
                <p>{!! Session::get('msg') !!} </p>
            </div>
        @endif
        <form method="post" action="send">
            <input type="hidden" name="_token" value="{{ csrf_token()  }}">

            <div class="form-group has-feedback">
                <input class="form-control" name="username" type="text" id="username" placeholder="邮箱/手机号" aria-describedby="inputSuccess2Status" required="required" />
            </div>
            <div class="verification">

            </div>
            <div>
                <button class="reset"  type="submit"><span>发送验证码</span></button>
            </div>
            <div class="reset-entrance">
                <a class="pull-right" href="{{ asset('login') }}">返回登录</a>
            </div>
        </form>
    </div>
    <img id="background-image" src="/image/lock-screen-background.jpg"/>
</div>
<script src="//static.geetest.com/static/tools/gt.js"></script>
<script src="/js/jquery-1.11.3.min.js"></script>
<script src="/js/common.js"></script>
<script>
    $(function(){
        var geetest_params = {
            'gt': "{{$geetest['gt']}}",
            'challenge': "{{$geetest['challenge']}}",
            'offline': "{{$geetest['offline']}}"
        };
        geetest_params['product'] = 'popup';

        initGeetest(geetest_params, function (captchaObj) {
            captchaObj.appendTo('.verification');
            captchaObj.onFail(function () {
                captchaObj.refresh();
            });
            captchaObj.onError(function () {
                captchaObj.refresh();
            });
            captchaObj.bindOn('button.reset');
//            captchaObj.onSuccess(function () {
//                var validate = captchaObj.getValidate();
//                $('button.reset').attr('disabled', false);
//            });
        });
    });
</script>
</body>
</html>