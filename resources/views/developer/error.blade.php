<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Error Detail</title>
    <link rel="stylesheet" href="//cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <style>
        .content {
            padding-top: 30px;
        }
        .container {
            padding: 0;
            width: 320px;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <divl>
                <label class="label label-info">{{ $error->type }}</label>
            </divl>
            <h3> {{ $error->desc }}</h3>
        </div>

        @if ($error->user)
            <div class="user">
                <span>{{ $error->user->name }}</span>
                &nbsp;
                @if ($error->status == \App\Models\Developer\Error::STATUS_FINISH)
                    已完成
                @else
                    正在处理
                @endif
            </div>
        @endif

        <div class="content">
            {!! nl2br($error->content) !!}
        </div>
    </div>
</body>
</html>