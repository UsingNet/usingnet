<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>支付成功</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        html, body {
            width: 100%;
            height: 100%;
        }
        body {
            font-size: 13px;
            color: #313d4b;
            font-family: Arial;
        }
        .wrap {
            width: 100%;
            height: 100%;
            text-align: center;
            padding-top: 30px;
        }
        .wrap .img {
            width: 60px;
            height: 60px;
            margin: 20px auto;
        }
        .wrap .img img {
            width: 100%;
            height: 100%;
        }
        .success {
            font-size: 25px;
            margin-bottom: 10px;
            color: #0ae;
        }
        .name {
            color: #777;;
        }
        .money {
            font-size: 20px;
            font-weight: bold;
            margin-top: 10px;;
            margin-bottom: 10px;
        }
        .finish {
            width: 80%;
            height: 40px;;
            line-height: 40px;
            border-radius: 3px;
            background: #0ae;
            margin: 30px auto;
            color: #FFF;
        }
    </style>
</head>
<body>
<div class="wrap">
    <div class="img">
        <img src="/assets/img/alipay.png" alt="">
    </div>
    @if ($pay->payment->status == 'SUCCESS')
        <div class="success">支付成功</div>
        <div class="name">
            您已向 {{ $payConfig->name }} 支付
        </div>
    @else
        <div class="success">支付失败</div>
    @endif
    <div class="money">
        ￥ {{ $pay->payment->fee}}
    </div>

    <div class="finish">
        请关闭窗口
    </div>
</div>

</body>
</html>