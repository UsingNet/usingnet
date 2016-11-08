<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="A layout example that shows off a responsive product landing page.">
    <link rel="stylesheet" type="text/css" href="//cdn.bootcss.com/font-awesome/4.5.0/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/main.css') }}" />
    <link rel="stylesheet" type="text/css" href="{{ asset('css/theme/clear.css') }}" />
    <title> @yield('title') - {{ $team->name }}</title>
</head>
<body>
<div id="header">
    <div id="logo">
        <a href="/" title="{{ $team->name }}">
            <img src="{{ $team->logo }}" alt="{{ $team->name }}">
        </a>
    </div>
    <!--
    <div id="submit">
        <a href="{{ asset('submit') }}">提交问题</a>
    </div>
    -->
</div>
<div class="clear"></div>

@section('content')
@show

<div class="clear"></div>

<div id="footer">
    <div class="md">
        &copy; {{ $team->name }} {{ date('Y') }}  改变的不止是客服
    </div>
</div>

<script type="text/javascript" src="{{ asset('js/app.js') }}"></script>

<script>
    /*
    (function() {
        var a = document.createElement("script");
        a.setAttribute("charset", "UTF-8");
        a.src = "//im.usingnet.net/build/app.min.js";
        document.body.appendChild(a);
        window.usingnetJsonP = function(usingnetInit) {
            usingnetInit("{{ $team->token }}"); // 用户登陆后，第二个参数传入包含用户各种信息的对象
        };
    })();
    */
</script>
</body>
</html>
