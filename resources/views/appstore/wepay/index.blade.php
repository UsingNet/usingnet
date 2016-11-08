<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>{{ $payConfig->name }}</title>
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
        a {
            text-decoration: none;
            color: inherit;
        }
        body {
            color: #313d4b;
            font-family: Arial;
            font-size: 14px;
            background: #F3F3F3;
        }
        .wrap {
            width: 90%;
            height: 100%;
            margin: 0 auto;
            position: relative;
            overflow: hidden;
        }
        .submit {
            text-align: center;
            width: 100%;
            text-align: center;
            background: #1AAD19;
            color: #FFF;
            border-radius: 3px;
            height: 40px;
            line-height:40px;
            margin-top: 80px;
        }
        .paying {
            position: fixed;
            width: 200px;
            height: 100px;
            line-height: 100px;
            text-align: center;
            z-index: 3;
            background: #FFF;
            left: 0; right: 0; bottom: 0; top: 0;
            margin: auto;
            display: none;
        }
        .layer {
            display: none;
            position: fixed;
            background: rgba(0, 0, 0, .5);
            z-index: 1;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        .error {
            border-color: #cd5554 !important;
        }
        .copyright {
            position: absolute;
            width: 100%;
            bottom: 225px;
            text-align: center;
            color: #888;
        }

        .header {
            width: 80%;
            margin: 0 auto;
            margin-top: 20px;
            overflow: hidden;
        }
        .header .img {
            width: 30px;;
            height: 30px;;
            margin-top: 0px;
            display: inline-block;
            float: left;
            margin-right: 10px;
        }
        .header .img img {
            width: 100%;
            height: 100%;
            border-radius: 100%;
        }
        .header .name {
            float: left;
            font-size: 16px;
        }
        .input-wrap {
            width: 100%;
            margin: 0 auto;
            height: 60px;
            border: 1px solid #CCC;
            margin-top: 30px;;
            border-radius: 3px;
            overflow: hidden;
            position: relative;
            background: #FFF;
        }
        .input-wrap label {
            display: block;
            width: 40px;;
            height: 60px;
            line-height: 60px;
            text-align: center;
            text-align: center;
            color: #888;
        }

        .input-wrap .input {
            position: absolute;
            right: 10px;
            top: 10px;
        }
        @keyframes bounce {
            0%{ opacity: 1 }
            100% { opacity: 0 }
        }
        .focus {
            position: absolute;
            top: 9px;
            right: 2px;
            height: 25px;
            width: 1px;
            background: #333;;
            animation: bounce 1.2s infinite ease;
        }

        .input-wrap .unit {
            font-size: 18px;
            float: left;
            margin-top: 10px;
            margin-right: 5px;
        }

        .input-wrap .input .money {
            float: left;
            outline: none;
            margin-top: 8px;
            height: 40px;
            font-size: 18px;
            color: #666;
            padding: 2px;
            width: 0px;
            border: none;
            background: #FFF;
        }

        .score {
            font-size: 10px;
            color: #888;
        }
        .desc {
            margin-top: 10px;
            overflow: hidden;
            font-size: 13px;
            color: #888;;
        }
        .record {
            float: left;
        }
        .record a {
            color: inherit;
        }
        .tips {
            float: right;
        }
        .keyboard {
            position: absolute;
            width: 100%;
            height: 220px;
            background: red;
            bottom: 0;
            border-collapse: collapse;
            background: #fff;
            font-size: 22px;
        }
        .keyboard td {
            border: 1px solid #DDD;
            width: 25%;
            text-align: center;
            height: 55px;
        }
        .keyboard .confirm {
            background: #50AE55;
            color: #FFF;
        }
        .del {
            font-weight: bold;
            font-size: 30px;
            text-align: center;
        }
        .del img {
            position: relative;
            top: 3px;
            width: 50px;
        }
    </style>
</head>
<body data-app-id="{{ $payConfig->app_id }}">

    <div class="wrap">
        <div class="layer"></div>
        <div class="paying">
            支付中...
        </div>

        <div class="header">
            <div class="img">
                @if ($payConfig->img)
                    <img src="{{ $payConfig->img }}" alt="">
                @else
                    <img src="{{ $payConfig->wechat->head_img }}" alt="">
                @endif
            </div>
            <div class="name">
                {{ $payConfig->name }}
                <div class="score">
                    评分 4.9 分
                </div>
            </div>
        </div>

        <div class="input-wrap">
            <label for="">金额</label>
            <div class="input">
                <div class="unit">¥</div>
                <div class="money"></div>
                <div class="focus"></div>
            </div>
        </div>
        <div class="desc">
            <div class="record">
                <a href="/appstore/wepay/record/{{ $payConfig->app_id }}">支付记录</a>
            </div>
            <div class="tips">请询问店员后输入金额</div>
        </div>
        <!--
        <div class="submit">
            去支付
        </div>
        -->



        <div class="copyright">
            &copy; 优信互联提供技术支持
        </div>
    </div>

    <table class="keyboard">
        <tr>
            <td class="key">1</td>
            <td class="key">2</td>
            <td class="key">3</td>
            <td class="del">
                <img src="/assets/img/del.png" alt="">
            </td>
        </tr>
        <tr>
            <td class="key">4</td>
            <td class="key">5</td>
            <td class="key">6</td>
            <td rowspan="3" class="confirm">确认<br/>支付</td>
        </tr>
        <tr>
            <td class="key">7</td>
            <td class="key">8</td>
            <td class="key">9</td>
        </tr>
        <tr>
            <td colspan="2" class="key">0</td>
            <td class="key">.</td>
        </tr>
    </table>

    <script src="/assets/js/zepto.min.js"></script>
    <script src="/assets/js/weixin.js"></script>
    <script>
        $(function() {
            wx.config({!! json_encode($jsConfig) !!});

//            $('.key').tap(function(e) {
//                console.log(e);
//            });

            $('.keyboard .key').on('touchstart', function() {
                var key = $(this).text().trim();
                var val = $('.money').text().trim();
                if (key === '.' && val.indexOf('.') !== -1) return ;
                if (val.indexOf('.') !== -1 && /\.\d{2}/.test(val)) return ;

                $('.money').text(val + key)

                var len = $('.money').text().length + 1;
                if (len > 15) return ;
                $('.money').css({width: len * 9 });
            });

            $('.keyboard .del').on('touchstart', function() {
                var val =  $('.money').text();
                var newVal = val.substring(0, val.length - 1);
                $('.money').text(newVal);
                var len = newVal.length + 1;
                if (len > 15) return ;
                $('.money').css({width: len * 9 });
            });


            $('.confirm').on('touchstart', function() {
                var money = $('.money').text();
                var appId = $('body').data('app-id');
                if (!money) {
                    $('.input-wrap').addClass('error');
                    return ;
                }

                if ($(this).hasClass('disabled')) {
                    return ;
                }
                $(this).addClass('disabled');

                $('.layer').show();
                $('.paying').show();

                $.ajax({
                    type: 'POST',
                    url: '/appstore/wepay/pay/' + appId,
                    data: {money: money},
                    success: function(resp) {
                        $('.disabled').removeClass('disabled');
                        var id = resp.id;
                        wx.chooseWXPay({
                            timestamp: resp.timeStamp,
                            nonceStr: resp.nonceStr,
                            package: resp.package,
                            signType: resp.signType,
                            paySign: resp.paySign,
                            success: function() {
                                checkPay(id);
                            },
                            cancel:function(){
                                $('.layer').hide();
                                $('.paying').hide();
                            },
                            fail: function() {
                                $('.paying').text('支付失败-_-').addClass('error');
                            }
                        });
                    }
                });
            });

            var times = 0;
            var appId = $('body').data('app-id');
            function checkPay(id) {
                $('.paying').show();
                $('.layer').show();
                timer = setInterval(function() {
                    $.ajax({
                        url: '/appstore/wepay/test/' + id,
                        type: 'POST',
                        success: function(resp) {
                            if (resp.data == 'SUCCESS') {
                                location.href = '/appstore/wepay/success/' + appId +  '/' + id
                            }
                            if (times >= 8) {
                                $('.paying').text('支付失败-_-').addClass('error');
                                clearInterval(timer)
                            }
                            times++;
                        }
                    });
                }, 700);
            };
        });
    </script>
</body>
</html>