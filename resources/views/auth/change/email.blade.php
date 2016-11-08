<!doctype html>
<html>
<head>
    <meta charset="UTF-8">
    <title>重置密码</title>
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
    <header>
        重设密码
    </header>

    <div id="auth-form">
        <h4>输入新密码</h4>
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
        <form method="post" action="reset">
            <input type="hidden" name="_token" value="{{ csrf_token()  }}">
            <input type="hidden" name="token" value="{{ $token  }}">
            <input type="hidden" name="type" value="{{ $type }}">
            <div class="form-group has-feedback">
                <div class="input-group">
                    <input class="form-control"  name="password" type="password" id="password" placeholder="密码" required="required" />
                    <span class="input-group-addon"><span class="fa fa-lock"></span></span>
                </div>
            </div>
            <div class="form-group has-feedback">
                <div class="input-group">
                    <input class="form-control"  name="password_confirmation" type="password" id="password_confirmation" placeholder="确认密码" required="required" />
                    <span class="input-group-addon"><span class="fa fa-key"></span></span>
                </div>
            </div>
            <div>
                <button class="register" type="submit"><span>重设密码</span><i class="fa fa-angle-right pull-right fa-2x"></i></button>
            </div>
        </form>
    </div>
    <img id="background-image" src="/image/lock-screen-background.jpg"/>
</div>
<script src="/js/common.js"></script>
</body>
</html>