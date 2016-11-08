<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>付款记录</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-size: 13px;
            color: #313d4b;
        }
        a {
            text-decoration: none;
            color: #666;
        }
        .wrap {
        }
        ul {
            list-style-type: none;
        }
        .back {
            position: absolute;
            top: 10px;
            left: 10px;
        }
        .back img {
            width: 13px;
            transform: rotateZ(90deg);
            position: relative;
            top: -1px
        }
        .records {
            width: 100%;
            margin: 0 auto;
            line-height: 1.5;
            margin-top: 30px;
        }
        .records li {
            margin-bottom: 10px;
            overflow: hidden;
            border-bottom: 1px solid #EEE;
            padding: 10px 15px;
        }
        .title {
            overflow: hidden;
            font-size: 16px;
        }
        .name {
            float: left;
        }
        .money {
            float: right;
            font-weight: bold;
        }
        .tips, .date {
            color: #888;
        }

    </style>
</head>
<body>
    <div class="wrap">
        <div class="back">
            <a href="/appstore/pay/{{ $appId }}">
                <img src="/assets/img/arrow.png" alt="">
                返回
            </a>
        </div>
        <ul class="records">
            @foreach ($records as $record)
                <li>
                    <div class="title">
                        <div class="name">{{ $record->config->name }}</div>
                        <div class="money">￥{{ $record->payment->fee }}</div>
                    </div>
                    <div class="tips">支付成功</div>
                    <div class="date">
                        {{ date('Y-m-d H:i:s', strtotime($record->updated_at)) }}
                    </div>
                </li>
            @endforeach
        </ul>
    </div>
</body>
</html>