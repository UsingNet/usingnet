<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>{{ $vote->contact->name }} - {{ $voteConfig->name }}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <style>
        body, html, div, img, h1, ul, li, p, img {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-size: 14px;
            font-family: sans-serif;
        }
        ul {
            list-style-type: none;
        }
        .wrap {
            width: 100%;
            overflow: auto;
            margin: 0 auto;
            height: 100%;
            overflow: hidden;
        }
        .logo {
            width: 40px;
            height: 40px;
            border-radius: 40px;
            position: absolute;
            top: 30px;
            left: 30px;
        }
        .qrcode {
            text-align: center;
            margin-bottom: 10px;
        }
        .qrcode img {
            margin-bottom: 10px;
        }
        .votes {
            text-align: center;
            margin-top: 10px;
            margin-bottom: 10px;
        }
        .records {
            list-style-type: none;
            padding: 0;
            text-align: center;
        }
        .records li {
            display: inline-block;
            width: 10%;
        }
        .records li img {
            width: 100%;
            height: 100%;
            border-radius: 40px;
        }
        .support {
            text-align: center;
            margin-bottom: 10px;
        }
        .layer {
            display: none;
            position: fixed;
            background: rgba(0, 0, 0, .5);
            top: 0;
            bottom: 0;
            right: 0;
            left: 0;
            z-index: 100;
        }
        .qrcode {
            display: none;
            color: #555;
            position: fixed;
            width: 220px;
            height: 220px;
            z-index: 10000;
            left: 50%;
            top: 50%;
            margin-left: -110px;
            margin-top: -110px;
            text-align: center;
            background: #FFF;
            padding: 30px;
        }
        .qrcode img {
            width: 140px;
            height: 140px;
        }
        .qrcode .close {
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 25px;
        }
        .header {
            margin-top: 35px;
            margin-bottom: 20px;
            text-align: center;
            position: relative;
        }
        .header .logo {
            width: 30px;
            position: absolute;
            top: -20px;
            left: 20px;
        }
        .music-wrap {
            position: absolute;
            right: 10px;
            top: 10px;
            z-index: 1000;
        }
        #music {
            border: 1px solid #ddd;
            width: 35px;
            height: 35px;
            display: block;
            border-radius: 35px;
            background-image: url(/assets/img/music.png);
            background-size: 100%;
            background-repeat: no-repeat;
        }
        .on {
            animation: musicRotata 1.2s linear infinite;
            -webkit-animation: musicRotata 1.2s linear infinite;
        }
        @keyframes musicRotata{
            0%{transform: rotateZ(-360deg);}
            100%{transform: rotateZ(0deg);}
        }
        @keyframes arrowZ {
            0%{ bottom: 10px }
            100%{bottom: 15px }
        }
        @-webkit-keyframes musicRotata{
            0%{transform: rotateZ(-360deg);}
            100%{transform: rotateZ(0deg);}
        }
        .main {
            width: 100%;
            padding-bottom: 10px;
            background: #EEE;
        }
        .main img {
            width: 100%;
            margin-bottom: 10px;
        }
        .main .btn {
            width: 80%;
        }
        .main .btn .name {
            font-size: 16px;
        }
        .photos {
            background: #dee2d1;
            position: relative;
            /* hack margin 重叠 */
            border:1px solid transparent
        }
        .photos li {
            width: 80%;
            margin: 20px auto;
            margin-bottom: 60px;
            padding: 10px;
            background: #FFF;
            box-shadow: 1px 1px 1px rgba(0, 0, 0, .3);
        }
        .photos li:nth-child(3n-1) {
            transform: rotateZ(25deg);
        }
        .photos li:nth-child(3n) {
            transform: rotateZ(10deg);
        }
        .photos li img{
            width: 100%;
        }
        .btn {
            display: inline-block;
            padding: 10px;
            border: none;
            color: #FFF;
            background: #AAA;
            border-radius: 5px;
        }
        .btn-info {
            background: #6abe83;
        }
        .footer {
            background: #a1bad0;
            color: #FFF;
            padding: 15px;
        }
        .back {
            position: absolute;
            left: 3px;
            top: 3px;
            color: #555;
            text-decoration: none;
        }
        .back img {
            width: 15px;
            transform: rotateZ(90deg);
        }
        .back a {
            text-decoration: none;
            color: #666;
        }
        .more {
            text-align: center;
            margin: 10px;
        }
        .hide {
            display: none !important;
        }
        .greetings {
            text-align: center;
        }
        .greetings ul {
            max-height: 100px;
            overflow-y: auto;
        }
        @if ($voteConfig->style)
           {!! $voteConfig->style !!}
        @endif
    </style>
</head>
<body>

@if ($vote->music)
    <div class="music-wrap">
        <div id="music" class="on">
        </div>
        <audio autoplay src="/assets/mp3/{{ $vote->music }}.mp3"></audio>
    </div>
@endif

<div class="layer"></div>
<div class="qrcode">
    <div class="close">&times;</div>
    <p>扫描二维码</p>
    <img src="{{ $vote->qrcode }}" alt="">
</div>

<div class="wrap">
    @if ($logined)
    <div class="back">
        <a href="/appstore/vote/upload/{{ $voteConfig->app_id }}?action=edit">
            <img src="/assets/img/arrow.png" alt="">
            返回修改
        </a>
    </div>
    @endif

    @if ($voteConfig->logo)
        <img class="logo" src="{{ $voteConfig->logo }}" alt="">
    @endif

    <div class="header">
        <h1 class="title" @if ($voteConfig->title_color) style="color: {{ $voteConfig->title_color }}" @endif>
            {{ $voteConfig->name }}
        </h1>
    </div>

    <div class="main">
        <div class="cover">
            <img src="{{ $vote->img }}" alt="">
        </div>
        <div class="support">
            @if ($expired)
                <button class="btn">已过期,停止投票</button>
            @else
                <button class="btn btn-info vote" @if ($voteConfig->btn_color) style="background-color: {{ $voteConfig->btn_color }}; border-color: {{ $voteConfig->btn_color }};" @endif>
                    @if ($voteConfig->btn_txt)
                        {{ $voteConfig->btn_txt }}
                    @else
                        我要投票
                    @endif
                </button>
            @endif
        </div>
    </div>

    <div class="photos">
        <ul>
            @foreach ($vote->photos as $photo)
            <li>
                <img src="{{ $photo }}" alt="">
            </li>
            @endforeach
        </ul>
    </div>



    @if ($records->count())
        <div class="footer">
            <div class="greetings">
                <h3>祝福语</h3>
                <ul>
                    @foreach ($records as $record)
                        @if ($record->message)
                            <li>{{ $record->contact->name . ': ' .$record->message }}</li>
                        @endif
                    @endforeach
                </ul>
            </div>
        </div>

        <div class="footer">
            <div class="votes">
                @if ($voteConfig->record_txt)
                    {{ str_replace(['#num#', '#name#'], [$records->count(), $vote->contact->name], $voteConfig->record_txt) }}
                @else
                    {{ $records->count() }} 位朋友支持了{{ $vote->contact->name }}
                @endif
            </div>
            <ul class="records">
                @for ($i = 0; $i < $records->count(); $i++)
                    <li @if ($i > 17) class="hide" @endif>
                        <img src="{{ $records[$i]->contact->img }}" alt="{{ $records[$i]->contact->name }}">
                    </li>
                @endfor
            </ul>
            @if ($records->count() > 18)
                <div class="more">
                    更多
                </div>
            @endif
        </div>
    @endif

    {!! $voteConfig->footer !!}
</div>

<script src="/assets/js/zepto.min.js"></script>
<script src="/assets/js/weixin.js"></script>
<script>
    $(function() {
        $('.records li').css({height: $('.records li').width()});
        $('.more').on('click', function() {
            if ($('.records .hide').length) {
                $('.more').text('隐藏');
                $('.records li').removeClass('hide');
            } else {
                $('.more').text('更多');
                $('.records li').each(function(i) {
                    if (i > 17) {
                        $(this).addClass('hide')
                    }
                })
            }
        });

        $('#music').on('click', function() {
            var audio = document.querySelector('audio');
            if ($(this).hasClass('on')) {
                $(this).removeClass('on');
                audio.pause();
            } else {
                $(this).addClass('on');
                audio.play();
            }
        });
        $('.support .vote').on('click', function() {
            $('.qrcode').show();
            $('.layer').show();
        });
        $('.qrcode .close, .layer').on('click', function() {
            $('.qrcode').hide();
            $('.layer').hide();
            location.href = location.href
        });

        wx.config({!! json_encode($config) !!});
        wx.ready(function() {
            wx.onMenuShareAppMessage({
                title: '{{ $vote->contact->name }} - {{ $voteConfig->name }}',
                desc: '{{ $vote->desc }}',
                link: location.href,
                imgUrl: '{{ $vote->img }}', // 分享图标
                type: '', // 分享类型,music、video或link，不填默认为link
                dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                success: function () {
                },
                cancel: function () {
                }
            });
        });
    });
</script>
</body>
</html>