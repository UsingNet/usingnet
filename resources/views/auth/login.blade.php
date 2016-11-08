<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>用户登录</title>
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
        用户登录
    </div>

    <div id="auth-form">
        <h4>用户登录</h4>
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
        <form method="post" action="login">
            <input type="hidden" name="_token" value="{{ csrf_token()  }}">

            <div class="form-group has-feedback">
                <input value="{{ Input::old('username')  }}" class="form-control" name="username" type="text" id="username" placeholder="邮箱/手机" aria-describedby="inputSuccess2Status" required="required" />
            </div>
            <div class="form-group has-feedback">
                <input class="form-control"  name="password" type="password" id="password" placeholder="密码" required="required" />
            </div>
            <div class="form-help">
                <div class="checkbox">
                    <label>
                        <input type="checkbox" name="remember"> 记住我
                    </label>
                    <a style="float:right;font-size:16px;" href="{{ asset('reset') }}">密码忘了？</a>
                </div>
            </div>
            <div>
                <button class="login" type="submit"><span>登录</span></button>
            </div>
            <div class="register-entrance">
                <a href="{{ asset('register') }}"><span>还没有账户，马上注册</span></a>
            </div>
        </form>
    </div>
    <img id="background-image" src="/image/lock-screen-background.jpg"/>
</div>
<script src="/js/common.js"></script>
</body>
</html>
