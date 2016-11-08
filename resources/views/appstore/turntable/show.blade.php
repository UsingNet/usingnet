<!DOCTYPE html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no">
    <title>{{ $config->name }}</title>
    <style type="text/css">
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        html, body {
            width: 100%;
            height: 100%;
            position: relative;
            overflow: hidden;
        }

        #container {
            position: absolute;
            top: 0;
            right: 0;
            left: 0;
            bottom: 0;
            background-image: url(/assets/img/turntable/background.jpg);
            /*background-image: url(/assets/img/turntable/sheji.jpg);*/
            background-size: 100%;
        }

        #count {
            color: #fee902;
            font-weight: bolder;
            position: absolute;
            transform: rotate(-11deg);
            top: 19.1%;
            left: 29.5%;
            width: 20px;
            display: inline-block;
            text-align: center;
            font-family: Georgia, serif;
        }

        #info {
            text-decoration: none;
            font-weight: bolder;
            position: absolute;
            transform: rotate(-11deg);
            color: #FFF;
            top: 13.8%;
            left: 66%;
            font-family: "SimHei", "Microsoft YaHei", "微软雅黑", "MicrosoftJhengHei", "华文细黑", "STHeiti", "MingLiu", "sans-serif";
        }

        #board {
            border: 3px solid #000;
            width: 85%;
            height: 85px;
            margin: 0 7% 7% 7%;
            bottom: 0;
            position: absolute;
            padding: 0;
            background: #fdeb01;
            line-height: 1.6;
            overflow-y: auto;
        }

        #board h4 {
            color: #99459a;
            font-family: "SimHei", "Microsoft YaHei", "微软雅黑", "MicrosoftJhengHei", "华文细黑", "STHeiti", "MingLiu", "sans-serif";
            padding: 0;
            text-align: center;
            font-size: 1.2em;
            margin: 8px 0 0 0;
        }

        #board dl {
            font-size: 10px;
            font-weight: bolder;
            font-family: "SimHei", "Microsoft YaHei", "微软雅黑", "MicrosoftJhengHei", "华文细黑", "STHeiti", "MingLiu", "sans-serif";
            padding-left: 5%;
            margin-top: 1%;
            position: relative;
        }

        #board dl dd {
            margin: 0;
        }

        #board dl dd span {
            display: inline-block;
        }

        #board dl dd span.info-nickname {
            width: 20%;
        }

        #board dl dd span.info-award {
            width: 40%;
        }

        #board dl dd span.info-phone {
            width: 25%;
        }

        #start {
            position: absolute;
            display: block;
            width: 24%;
            top: 40%;
            left: 38%;
            z-index: 11;
        }

        #pointer {
            position: absolute;
            display: block;
            width: 30%;
            top: 37.4%;
            left: 35%;
            transform: rotate(0deg);
            z-index: 12;
        }

        #pointer-shadow {
            position: absolute;
            display: block;
            width: 30%;
            top: 37.4%;
            left: 36.5%;
            transform: rotate(0deg);
            -webkit-filter: grayscale(100%);
            opacity: 0.5;
            z-index: 10;
        }

        #awards div {
            width: 16%;
            position: absolute;
            left: 42%;
            top: 26.4%;
            height: 41%;
        }

        #awards img {
            width: 100%;
        }

        #awards div:nth-child(1) {
            transform: rotate(22.5deg);
        }

        #awards div:nth-child(2) {
            transform: rotate(67.5deg);
        }

        #awards div:nth-child(3) {
            transform: rotate(112.5deg);
        }

        #awards div:nth-child(4) {
            transform: rotate(157.5deg);
        }

        #awards div:nth-child(5) {
            transform: rotate(202.5deg);
        }

        #awards div:nth-child(6) {
            transform: rotate(247.5deg);
        }

        #awards div:nth-child(7) {
            transform: rotate(292.5deg);
        }

        #awards div:nth-child(8) {
            transform: rotate(337.5deg);
        }

        .animate {
            transition: all 4s;
        }

        .desc {
            width: 300px;
            padding: 30px;
            background: #FFF;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            margin: auto;
            z-index: 1000;
            color: #333;
            font-size: 13px;
        }

        .alert {
            display: none;
            width: 300px;
            height: 100px;;
            position: absolute;
            background: #FFF;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            margin: auto;
            z-index: 1000;
            color: #333;
            font-size: 13px;
            text-align: center;
        }

        .alert .body {
            padding: 20px;
            height: 100px;
            line-height: 60px;
        }

        .layer {
            display: none;
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            background: rgba(0, 0, 0, .5);
            z-index: 999;
        }

        .phone {
            width: 300px;
            height: 160px;
            padding: 30px;
            background: #FFF;
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            margin: auto;
            z-index: 1000;
            color: #333;
            font-size: 13px;
        }

        .phone p {
            margin-bottom: 20px;
        }

        .phone input {
            border: none;
            border-bottom: 1px solid #DDD;
            padding: 4px 10px;
            outline: none;
            display: block;
            width: 100%;
        }

        .phone .submit {
            margin-top: 10px;
            text-align: right;
        }

        .phone .btn {
            text-align: right;
        }

        .desc .close, .phone .close, .alert .close {
            position: absolute;
            font-size: 30px;
            right: 8px;
            top: 0px;
            color: #555;
        }
    </style>
</head>
<body>
<div id="container" data-id="{{ $config->id }}">
    <span id="count">{{ 3-$lotteryCount }}</span>
    <a href="javascript:;" id="info">游戏规则</a>
    <img src="/assets/img/turntable/start.png" id="start"/>
    <img src="/assets/img/turntable/pointer.png" id="pointer" />
    <img src="/assets/img/turntable/pointer.png" id="pointer-shadow" />
    <div id="awards" class="staffs">
        @foreach ($config->staffs as $staff)
            <div data-name="{{ $staff->name }}"><img src="{{ $staff->img }}"/></div>
        @endforeach
    </div>

    <div class="desc">
        <div class="close">&times;</div>
        {!! nl2br($config->desc) !!}
    </div>
    <div class="layer"></div>

    @if (!$contact->phone)
        <div class="phone">
            <p>请填写您的手机号码，以便中奖后联系您</p>
            <input type="text" placeholder="填写您的手机号码" name="phone"/>
            <div class="submit">
                <button class="btn">提交</button>
            </div>
        </div>
    @endif

    <div class="alert">
        <div class="close">&times;</div>
        <div class="body"></div>
    </div>
</div>

<div id="board">
    <h4>中奖公告</h4>
    <dl>
        @foreach ($lotters as $lottery)
            @if ($lottery->staff)
                <dd>
                    <span class="info-nickname">{{ $lottery->name }}</span>
                    <span class="info-award">抽得 {{ $lottery->staff->name }}</span>
                    <span class="info-phone">{{ $lottery->phone }}</span>
                </dd>
            @endif
        @endforeach
        @if ($lotters->count() === 0)
            <dd>暂无人中奖</dd>
        @endif
    </dl>
</div>


<script src="/assets/js/zepto.min.js"></script>
<script src="/assets/js/weixin.js"></script>

<script type="text/javascript">
    wx.config({!! json_encode($jsConfig) !!});
    wx.ready(function() {
        wx.onMenuShareTimeline({
            title: '{{ $config->name }}', // 分享标题
            link: location.href, // 分享链接
            imgUrl: 'http://wx.usingnet.com/assets/img/turntable/start.png', // 分享图标
            success: function () {
                // 用户确认分享后执行的回调函数
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });

        wx.onMenuShareAppMessage({
            title: '{{ $config->name }}',
            desc: '{{ str_replace("\n", '', $config->desc) }}',
            link: location.href,
            imgUrl: 'http://wx.usingnet.com/assets/img/turntable/start.png', // 分享图标
            type: '', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function () {
            },
            cancel: function () {
            }
        });
    });

    $(function () {
        var $container = $('#container');
        $container.height($container.width() / 1080 * 1920);

        if ($('.phone').length) {
            $('.layer').show();
        }

        var h = $('.desc').height();
        $('.desc').css({
            height: h,
            position: 'absolute',
            display: 'none'
        });

        $('#info').on('click', function () {
            $('.layer').show();
            $('.desc').show();
        });

        $('.close').on('click', function () {
            $('.layer').hide();
            $('.desc').hide();
            $('.alert').hide();
        });

        $('.submit .btn').on('click', function () {
            var id = $container.data('id');
            var phone = $('input[name=phone]').val();
            $.ajax({
                type: 'POST',
                url: '/appstore/turntable/profile/' + id,
                data: {phone: phone},
                success: function (resp) {
                    if (!resp.success) {
                        $('.alert').show();
                        $('.layer').show();
                        $('.alert .body').text(resp.data);
                    } else {
                        location.href = location.href + '?_r=' + Math.random();
                    }
                }
            })
        });

        $('#pointer').on('click', function () {
            var id = $container.data('id');
            if ($(this).hasClass('disabled')) return;
            $(this).addClass('disabled');
            if ($('#count').text() == 0) {
                $('.layer').show();
                $('.alert').show();
                $('.alert .body').text('您已经抽三次了，请关注下次活动');
                $('.disabled').removeClass('disabled');
                return;
            }

            var self = $(this);
            var shadow = $('#pointer-shadow');

            $.ajax({
                type: 'POST',
                url: '/appstore/turntable/lottery/' + id,
                success: function (resp) {

                    var index = 0;
                    $('.staffs div').each(function () {
                        if ($(this).data('name') == resp.data) {
                            index = $(this).index();
                        }
                    });

                    var count = parseInt($('#count').text(), 10);
                    $('#count').text(--count);

                    var deg = 23;
                    var stop = (index * 45) + deg + (360 * 5);
                    self.addClass('animate').css({transform: 'rotate('+ stop + 'deg)'});
                    shadow.addClass('animate').css({transform: 'rotate('+ stop + 'deg)'});

                    setTimeout(function() {
                        $('.disabled').removeClass('disabled');
                        $('.layer').show();
                        var msg = resp.data;
                        if (resp.data != '谢谢参与') {
                            msg = '恭喜您抽中了 ' + resp.data
                        }
                        $('.alert .body').text(msg);
                        $('.alert').show();

                        self.removeClass('animate').css({transform: 'rotate('+(stop%360)+'deg)'});
                        shadow.removeClass('animate').css({transform: 'rotate('+(stop%360)+'deg)'});
                        if (resp.data !== '谢谢参与') {
                            $.ajax({
                                url: '/appstore/turntable/recent/' + id,
                                success: function(resp) {
                                    var dds = [];
                                    resp.data.forEach(function(recent) {
                                        var item = ['<dd>',
                                            '<span class="info-nickname">' + recent.name+  '</span>',
                                            '<span class="info-award">抽得' + recent.staff.name + '</span>',
                                            '<span class="info-phone">' + recent.phone + '</span>',
                                            '</dd>'
                                        ]
                                        dds.push(item.join(''));
                                        $('#board dl').html(dds.join(''));
                                    });
                                }
                            });
                        }
                    }, 4000);
                }
            });
        });
    });
</script>
</body>
</html>