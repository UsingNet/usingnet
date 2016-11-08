<!doctype html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>Admin</title>
    <link rel="stylesheet" href="//cdn.bootcss.com/bootstrap/3.3.5/css/bootstrap.min.css">
    <script src="//cdn.bootcss.com/jquery/1.11.3/jquery.min.js"></script>
    <script src="//cdn.bootcss.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
    <style>
        #header {
            font-size: 30px;;
            text-align: center;
            color: #888;
            margin-top: 100px;
            margin-bottom: 20px;
        }
        #content .auth-box {
            width: 300px;
            margin: 0 auto;
        }
        #content .submit button {
            width: 100%;
        }
    </style>
</head>
<body>


<header id="header">
    UsingNet
</header>

<div id="content">
    <div class="auth-box">
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

        @section('content')

        @show
    </div>
</div>

</body>
</html>