<!doctype html>
<html>
<head>
    <meta charset="UTF-8">
    <title>注册账号</title>
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
    <div id="header">
        用户注册
    </div>
    <div id="auth-form">
        <h4>用户注册</h4>
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
        <form id="register_form" method="post" action="register">
            <input type="hidden" name="_token" value="{{ csrf_token()  }}">
            <div class="form-group has-feedback">
                <input value="{{ Input::old('team') }}" class="form-control" name="team" maxlength="64" type="text" id="team" placeholder="团队或公司名" aria-describedby="inputSuccess2Status" required="required" />
            </div>
            @if ($type=='email')
            <div class="form-group has-feedback">
                <input value="{{ Input::old('email') }}" class="form-control" name="email" maxlength="64" type="email" id="email" placeholder="邮箱" aria-describedby="inputSuccess2Status" required="required" />
            </div>
            @else
            <div class="form-group has-feedback">
                <input value="{{ Input::old('phone') }}" class="form-control" maxlength="11" name="phone" type="text" id="phone" placeholder="手机号" aria-describedby="inputSuccess2Status" required="required" />
            </div>
            @endif
            <div class="form-group has-feedback">
                <input class="form-control"  name="password" type="password" maxlength="128" id="password" placeholder="密码" required="required" />
            </div>
            <div class="form-group has-feedback">
                <input class="form-control"  name="password_confirmation" maxlength="128" type="password" id="password_confirmation" placeholder="确认密码" required="required" />
            </div>
            @if ($type=='phone')
                <div class="form-inline">
                    <div class="form-group has-feedback phone-send-verification">
                        <input class="form-control"  name="code" type="text" id="code" maxlength="5" placeholder="手机验证码" required="required" />
                    </div>
                    <button type="button" disabled="disabled" class="btn btn-default send_phone_verification">发送验证码</button>
                </div>
                <div class="verification">

                </div>
            @endif
            <div class="form-help">
                <div class="checkbox">
                    <label>
                        <input id="term_check" name="term_check" type="checkbox" checked>
                        同意并接受《<a target="_blank" href="http://www.usingnet.com/help/contract.html">优信服务协议</a>》
                    </label>
                </div>
            </div>
            <div>
                <button class="register" type="submit"><span>注册</span></button>
            </div>
            <div class="login-entrance">
                @if ($type == 'email')
                    <a class="pull-left" href="{{ asset('register?type=phone') }}"><span>手机号码注册</span></a>
                @else
                    <a class="pull-left" href="{{ asset('register?type=email') }}"><span>邮箱注册</span></a>
                @endif
                <a class="pull-right" href="{{ asset('login') }}"><span>已有账户？马上登录</span></a>
            </div>
        </form>
    </div>
    <img id="background-image" src="/image/lock-screen-background.jpg"/>
</div>
<div id="register_term" class="dialog">
    <a class="close_btn" href="javascript:document.getElementById('register_term').style.display='none';void(0)">×</a>
    <div class="term_content">
        @include('auth.register_term')
    </div>
</div>
<script src="//static.geetest.com/static/tools/gt.js"></script>
<script src="/js/jquery-1.11.3.min.js"></script>
<script src="/js/common.js"></script>
</body>
</html>