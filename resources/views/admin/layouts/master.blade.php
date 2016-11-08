<!doctype html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>优信后台</title>
    <link rel="stylesheet" href="//cdn.bootcss.com/bootstrap/3.3.5/css/bootstrap.min.css">
    <script src="//cdn.bootcss.com/jquery/1.11.3/jquery.min.js"></script>
    <script src="//cdn.bootcss.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
    <link rel="stylesheet" href="/assets/main.css">
    <script src="/assets/main.js"></script>
</head>
<body>
    <header id="header">
        <div class="container">
            <div class="logo">
                <a href="/">优信后台</a>
            </div>
            <ul class="nav navbar-nav">
                <li><a href="/team">用户</a></li>
                <li><a href="/log">日志</a></li>
                <li><a href="/setting">设置</a></li>
                <li><a href="/notice">通知</a></li>
                <li><a href="/status">状态</a></li>
                <li><a href="/appstore">应用</a></li>
                <li><a href="/checking">审核</a></li>
                <li><a href="/customer">客户</a></li>
            </ul>
            <div class="user-info">
                <img class="dropdown-toggle" src="{{ $admin->img }}" alt="" id="drop-user-info"  data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                <ul class="dropdown-menu" aria-labelledby="drop-user-info">
                    <li>
                        <a href="/auth/logout">退出</a>
                    </li>
                </ul>
            </div>
        </div>
    </header>

    <div class="main container">
        <div class="content">
            @if (count($errors) > 0)
                <div class="alert alert-danger">
                    <ul>
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            @if (session('success'))
                 <div class="alert alert-success">
                     {{ session('success') }}
                 </div>
                @endif

            @if (session('error'))
                    <div class="alert alert-danger">
                        {{ session('error') }}
                    </div>

                @endif
            @section('content')

            @show
        </div>
    </div>

</body>
</html>