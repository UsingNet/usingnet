<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>中奖结果</title>
    <link href="//cdn.bootcss.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet">
    <script src="//cdn.bootcss.com/jquery/1.12.2/jquery.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
        }
        #wrap {
            width: 320px;
            margin: 0 auto;
        }
        h1 {
            font-size: 20px;
            margin-bottom: 10px;
        }
        .send button{
            width: 100%;
        }
        .info {
            padding-top: 50px;;
            padding-bottom: 50px;
            text-align: center;
        }
        .name {
            font-size: 16px;
        }
        .name, .level {
            display: inline-block;
        }
    </style>
</head>
<body>
    <div id="wrap">

        <div class="header">
            <h1>{{ $winning->title }}</h1>
            <div class="info">
                <span class="name">{{ $winning->people['name'] }}</span>
                获得第 {{ $winning->people['level'] }} 名
            </div>
        </div>
        <div class="send">
            @if ($winning->status === \App\Models\Plugin\Winning::STATUS_INIT)
                <button class="btn btn-info submit">确认领奖</button>
            @else
                <button class="btn btn-default disabled">已领取</button>
            @endif
        </div>
    </div>
    <script>
        $('.submit').on('click', function() {
            $.ajax({
                url: '/api/winning/{{$_token}}',
                method: 'POST',
                success: function() {
                    location.reload();
                }
            });
        });
    </script>
</body>
</html>