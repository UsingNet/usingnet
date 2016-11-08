<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>{{ $groupbuyConfig->name }}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-size: 14px;
            font-family: Arial;
            color: #243743;
        }
        a {
            text-decoration: none;
            color: #243743;
        }
        h1 {
            text-align: center;
            margin-top: 40px;
            margin-bottom: 20px;
            font-size: 20px;
        }
        .author {
            overflow: hidden;
            text-align: center;
            margin-bottom: 20px;
        }
        .author .img {
            width: 30px;
            height: 30px;
            float: left;
        }
        .author .img img {
            width: 100%;
            height: 100%;
            border-radius: 100%;
        }
        .members {
            width: 300px;
            margin: 0 auto;
        }
        .members .title {
            margin-bottom: 15px;
            text-align: center;
            color: #666;
        }
        .members ul {
        }
        .members li {
            width: 33px;
            height: 33px;
            display: inline-block;
            margin: 3px;
        }
        .members li img {
            width: 100%;
            border-radius: 100%;
        }
        .deposit {
            text-align: center;
            margin-top: 120px;
            width: 100%;
        }
        .deposit .price {
            margin-bottom: 20px;
            font-weight: bold;
        }
        .btn {
            display: block;
            width: 80%;
            margin: 0 auto;
            height: 40px;
            line-height: 40px;
            border-radius: 3px;
            border: 1px solid;
        }
        .pay {
            color: #FFF;
            border-color: #00c07f;
            background: #00c07f;
        }
        .payed {
            border-color: #00c07f;
            color: #00c07f;
        }
        .paying {
            display: none;
            position: fixed;
            width: 200px;
            height: 100px;
            line-height: 100px;
            text-align: center;
            z-index: 3;
            background: #FFF;
            left: 0; right: 0; bottom: 0; top: 0;
            margin: auto;
        }
        .action {
            position: absolute;
            width: 100%;
            text-align: center;
            bottom: 50px;
        }
        .action a {
            display: inline-block;
            margin: 10px;
        }
        .error-tips {
            margin-top: 10px;
            text-align: center;
            color: #cd5554;
            display: none;
        }
        .layer {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, .3);
            z-index: 1;
        }
        .modal {
            display: none;
            position: absolute;
            width: 80%;
            height: 260px;
            left: 0; right: 0; top: 0; bottom: 0;
            margin: auto;
            z-index: 3;
            background: #FFF;
            padding: 15px;
            box-shadow: 0 0 8px rgba(0, 0, 0, .3);
        }
        .modal .close {
            position: absolute;
            text-align: center;
            top: -10px;
            right: -10px;
            width: 40px;
            height: 40px;
            font-size: 24px;
            line-height: 40px;
            background: #FFF;
            border-radius: 40px;
        }
        .modal .group {
            margin-top: 15px;
            margin-bottom: 15px;
        }
        .modal .title {
            font-size: 16px;
        }
        .modal label {
            display: block;
            margin-bottom: 5px;
        }
        .modal input {
            border: 1px solid #555;
            outline: none;
            width: 100%;
            padding: 8px;
        }
        .modal input:focus {
            border-color: #00c07f;
        }
        .modal .submit {
            text-align: right;
        }
        .modal button {
            border: none;
            background: #00c07f;
            color: #FFF;
            font-family: inherit;
            padding: 8px 12px;
            border-radius: 3px;
            outline: none;
        }
    </style>
</head>
<body data-id="{{ $groupbuyConfig->id }}">
    <div class="wrap">
        <div class="layer"></div>
        <div class="paying">
            支付中...
        </div>

        <h1> {{ $groupbuyConfig->name }}</h1>
        
        <div class="author">
            由 {{ $contact->name }} 发起
        </div>
        
        <div class="members">
            <div class="title">已有 {{ $members->count() }} 人参加</div>
            <ul>
                @foreach ($members as $member)
                    <li>
                        <img src="{{ $member->contact->img }}" alt="">
                    </li>
                @endforeach
            </ul>
        </div>

        <div class="deposit">
            <div class="price">
               定金：￥{{ $groupbuyConfig->deposit }}
            </div>
            @if ($groupbuy->expire < 0)
                <a href="javascript:;" class="btn expired">
                    已过期
                </a>
            @elseif  ($self->payment->status === 'SUCCESS')
                <a href="javascript:;" class="btn payed">
                    已支付
                </a>
            @else
                <a href="javascript:;" class="btn pay">
                    去付定金
                </a>


            @endif
        </div>

        <div class="action">
            <a href="javascript:;" class="profile">我的信息</a>
            @if ($self->payment->status !== 'SUCCESS')
                <a href="/appstore/groupbuy/out/{{ $groupbuyConfig->id }}/{{ $groupbuy->id }}">退出团购</a>
            @endif
        </div>

        <div class="modal">
            <div class="close">&times;</div>
            <div class="title">
                填写信息
            </div>
            <div class="error-tips">
            </div>
            <div class="group">
                <label for="">姓名</label>
                <input type="text" class="name" value="{{ $self->name }}">
            </div>
            <div class="group">
                <label for="">手机</label>
                <input type="number" class="phone" value="{{ $self->phone }}">
            </div>
            <div class="submit">
                <button>提交</button>
            </div>
        </div>

        <div class="layer">
        </div>
    </div>

    <input type="hidden" class="config-id" value="{{ $groupbuyConfig->id }}">
    <input type="hidden" class="groupbuy-id" value="{{ $groupbuy->id }}">
    <input type="hidden" class="id" value="{{ $self->id }}">


    <script src="/assets/js/zepto.min.js"></script>
    <script src="/assets/js/weixin.js"></script>
    <script>
        $(function() {
            wx.config({!! json_encode($jsConfig) !!});

            $('.profile').on('click', function() {
                $('.layer').show();
                $('.modal').show();
            });

            $('.close, .layer').on('click', function() {
                $('.layer').hide();
                $('.modal').hide();
            });

            $('.modal .submit').on('click', function() {
                if ($(this).hasClass('disabled')) return ;
                $(this).addClass('disabled');
                $('.has-error').removeClass('has-error');
                $('.error-tips').hide();

                var id = $('.groupbuy-id').val();
                var configId = $('body').data('id');
                var type = $('.modal').data('type');
                var phone = $('.modal .phone').val();
                var name = $('.modal .name').val();

                if (!phone) {
                    $('.modal .phone').parents('.group').addClass('has-error');
                }
                if (!name) {
                    $('.modal .name').parents('.group').addClass('has-error');
                }
                if ($('.has-error').length) {
                    return ;
                }

                var url = '/appstore/groupbuy/join/' + configId;
                $.ajax({
                    type: 'POST',
                    url: url,
                    data: {id: id, name: name, phone: phone},
                    success: function(resp) {
                        $('.disabled').removeClass('disabled');
                        if (resp.success) {
                            location.href = location.href + '&_r=' + Math.random()
                        } else {
                            $('.error-tips').show().text(resp.msg);
                        }
                    }
                });
            });

            $('.pay').on('click', function() {
                if ($(this).hasClass('disabled')) return ;
                $(this).addClass('disabled');
                var configId = $('.config-id').val();
                var groupbuyId = $('.groupbuy-id').val();
                var id = $('.id').val();

                $.ajax({
                    type: 'POST',
                    url: '/appstore/groupbuy/pay/' + configId,
                    data: {id: id, groupbuy_id: groupbuyId},
                    success: function(resp) {
                        $('.disabled').removeClass('disabled');
                        wx.chooseWXPay({
                            timestamp: resp.timeStamp,
                            nonceStr: resp.nonceStr,
                            package: resp.package,
                            signType: resp.signType,
                            paySign: resp.paySign,
                            success: function() {
                                checkPay(configId, id);
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
            function checkPay(configId, id) {
                var groupbuyId = $('.groupbuy-id').val();
                $('.paying').show();
                $('.layer').show();
                timer = setInterval(function() {
                    $.ajax({
                        url: '/appstore/groupbuy/test/' + id,
                        type: 'POST',
                        success: function(resp) {
                            if (resp.data == 'SUCCESS') {
                                location.href = '/appstore/groupbuy/member/' + configId + '?id=' + groupbuyId + '&_r=' + Math.random()
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