<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>试用</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

    <style>
        html, body, h1 {
            margin: 0;
            padding: 0;
            font-size: 14px;
        }
        input {
            box-sizing: border-box;
        }
        .container {
            padding: 40px;
        }
        .title {
            font-size: 24px;
            text-align: center;
            color: #555;
        }
        .form {
            margin-top: 60px;
        }
        .form label {
            display: inline-block;
        }
        .form .form-group {
            margin-bottom: 20px;
        }
        .form input {
            padding: 8px;
            outline: none;
            border: 1px solid #DDD;
            width: 100%;
        }
        .form input:focus {
            border-color: #44b549
        }
        .submit {
            text-align: center;
        }
        .submit button {
            margin-top: 20px;
            width: 100%;
            padding: 10px 0;
            border: none;
            color: #FFF;
            border-radius: 3px;
            background: #44b549;
            cursor: pointer;
        }
        .payed {
            width: 100%;
            padding: 0;
            list-style: none;
            line-height: 2;
            width: 200px;
            margin: 80px auto;
        }
        .payed span {
            display: inline-block;
            width: 100px
        }
        .payed .money {
            margin-top: 20px;
            color: red;
            font-weight: bold;
        }
        .has-error input, .has-error input:focus {
           border-color: #F33;
        }
        .paying {
            background: #f3f3f3;;
            position: fixed;
            width: 200px;
            height: 100px;
            line-height: 100px;
            text-align: center;
            top: 0; left: 0; bottom: 0; right: 0;
            margin: auto;
            display: none;
        }
        .error {
            color: #ff3300;
        }
        .layer {
            display: none;
            position: fixed;
            top: 0; left: 0; bottom: 0; right: 0;
            background: rgba(0, 0, 0, .4);
        }
    </style>
</head>
<body>
<div class="container">
    <div class="layer"></div>
    <div class="paying">
        支付中...
    </div>
    <h1 class="title">iPhone 7 试用</h1>
    @if ($tryout->payed)
        <ul class="payed">
            <li>
                <span>商户:</span>
                {{ $tryout->business }}
            </li>
            <li>
                <span>联系人:</span>
                {{ $tryout->name }}
            </li>
            <li>
                <span>手机号码:</span>
                {{ $tryout->phone }}
            </li>
            <li class="money">已支付 <span>{{ $price }}</span></li>
        </ul>
    @else
        <form method="POST" class="form">
            <div class="form-group">
                <label>价格:</label>
                <storng>{{ $price }}</storng>
            </div>
            <div class="form-group">
                <input class="business" type="text" placeholder="商户名" name="business" value="{{ $tryout->business }}">
            </div>
            <div class="form-group">
                <input class="name" type="text" placeholder="联系人" name="name" value="{{ $tryout->name }}">
            </div>
            <div class="form-group">
                <input class="phone" type="number" placeholder="手机号码" name="phone" value="{{ $tryout->phone }}">
            </div>
            <div class="submit">
                <button type="button">微信支付</button>
            </div>
        </form>
    @endif

    <script src="/assets/js/jquery.min.js"></script>
    <script src="/assets/js/weixin.js"></script>
    <script>
        wx.config({!! json_encode($config) !!});

        var times = 0;
        function checkPay() {
            $('.paying').show();
            $('.layer').show();
            timer = setInterval(function() {
                $.ajax({
                    url: '/appstore/tryout/success',
                    method: 'POST',
                    data: {id: {{ $tryout->id }} },
                    success: function(resp) {
                        if (resp.data == 'ok') {
                            location.href = location.href + '?_r' + Math.random
                        }
                        if (times >= 5) {
                            $('.paying').text('支付失败-_-').addClass('error');
                            clearInterval(timer)
                        }
                        times++;
                    }
                });
            }, 300);
        };


        $('.submit button').on('click', function() {
            if ($(this).hasClass('disabled')) {
                return ;
            }
            $(this).addClass('disabled');

            $('.has-error').removeClass('has-error');
            var classes = ['business', 'name', 'phone'];
            var params = {}
            classes.forEach(function(className) {
                var elm = $('.' + className );
                if (!elm.val()) {
                    elm.parents('.form-group').addClass('has-error');
                }
                params[className] = elm.val();
            });
            if ($('.has-error').length) {
                return false
            }

            $.ajax({
                method: 'POST',
                url: '/appstore/tryout',
                data: params,
                success: function(resp) {
                    $('.disabled').removeClass('disabled');
                    wx.chooseWXPay({
                        timestamp: resp.timeStamp,
                        nonceStr: resp.nonceStr,
                        package: resp.package,
                        signType: resp.signType,
                        paySign: resp.paySign,
                        success: function(res) {
                            checkPay();
                        },
                        fail: function() {
                            $('.paying').text('支付失败-_-').addClass('error');
                        }
                    });
                }
            });
        });
    </script>
</div>
</body>
</html>