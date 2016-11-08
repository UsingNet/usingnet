<!doctype html>
<html lang="zh-cm">
<head>
    <meta charset="UTF-8">
    <title>{{ $album->name }} - {{ $wechat->nick_name }}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        html, body {
            height: 100%;
            width: 100%;
            color: #313d4b;
            font-family: Arial;
            font-size: 13px;
            overflow: hidden;
            position: relative;
        }
        a {
            text-decoration: none;
            color: inherit;
        }
        ul {
            list-style-type: none;
        }
        .back {
            position: absolute;
            top: 10px;
            left: 10px;
            z-index: 20;
            vertical-align: middle;
            color: #888;
        }
        .back img{
            width: 13px;
            position: relative;
            top: -1px;
            transform: rotateZ(90deg);
        }
        .nav {
            position: absolute;
            z-index: 111;
            right: 10px;
            height: 18px;
            top: 0; bottom: 0;
            margin: auto;
        }
        .nav li {
            width: 8px;
            height: 8px;
            border-radius: 10px;
            margin-bottom: 5px;
            margin-top: 5px;
            border: 1px solid #ccc;
            background: #eee;
        }
        .nav li.current {
            background: #cd5554;
        }
        .music-wrap {
            position: absolute;
            right: 20px;
            top: 20px;
            z-index: 1000;
        }
        #music {
            width: 30px;
            height: 30px;
            display: block;
            border-radius: 30px;
            background-image: url(/assets/img/music.png);
            background-size: 30px;
            background-position: 0 0;
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
        @-webkit-keyframes arrowZ {
            0%{ bottom: 10px }
            100%{bottom: 15px }
        }
        .arrow {
            position: absolute;
            width: 20px;
            height: 20px;
            background-image: url(/assets/img/arrow.png);
            background-size: 100%;
            bottom: 10px;
            left: 0; right: 0;
            margin: auto;
            background-repeat: no-repeat;
            animation: arrowZ .9s ease infinite;
            -webkit-animation: arrowZ .9s ease infinite;
            z-index: 100;
        }

        .up {
            transform: rotateZ(180deg);
            -webkit-transform: rotateZ(180deg);
        }

        .pages {
            width: 100%;
            position: absolute;
            z-index: 1;
            top: 0;
            left: 0;
            transition: top .8s ease;
            -webkit-transition: top .8s ease;
        }
        /* ------------ Style ---------*/
        .style-1 {
            width: 100%;
            height: 100%;
            position: relative;
        }
        
        .style-1 .title {
            position: absolute;
            width: 80%;
            top: 50px;
            left: -1000px;
            text-align: center;
            transition: left .8s ease;
            -webkit-transition: left .8s ease;
        }
        .style-1 .desc {
            position: absolute;
            bottom: 70px;
            width: 80%;
            right: -1000px;
            text-align: center;
            transition: right .8s ease;
            -webkit-transition: right .8s ease;
        }
        .style-1 .img {
            position: absolute;
            width: 100%;
            left: 0;
            top: 80px;
            bottom: 120px;
            overflow: hidden;
            opacity: 0;
            transition: opacity 1.8s ease;
            -webkit-transition: opacity 1.8s ease;
        }
        .style-1 .img img {
            position: absolute;
            width: 100%;
            position: absolute;
            top: 0;
            bottom: 0;
            right: 0;
            left: 0;
            margin: auto;
        }
        .style-2 {
            width: 100%;
            height: 100%;
            position: relative;
        }
        .style-2 .img {
            position: absolute;
            width: 100%;
            left: -100px;
            top: 0px;
            bottom: 120px;
            overflow: hidden;
            transform: rotateZ(-70deg);
            -webkit-transform: rotateZ(-70deg);
            -webkit-transition: transform 1.0s ease, left 1.0s ease;
        }
        .style-2 .img img {
            position: absolute;
            height: 100%;
            top: 0;
            bottom: 0;
            right: 0;
            left: 0;
            margin: auto;
        }
        .style-2 .title {
            position: absolute;
            width: 90%;
            right: -1000px;
            bottom: 100px;
            text-align: right;
            transition: right .8s ease;
        }
        .style-2 .desc {
            position: absolute;
            bottom: 40px;
            width: 90%;
            left: -1000px;
            text-align: left;
            transition: left .8s ease;
        }
        /* ------------ Style --------- */

        /* ---------- Loading Start -------- */
        .loading-wrap {
            position: absolute;
            width: 100%;
            height: 100%;
            left: 0;
            top: 0;
            background: #FFF;
            z-index: 10000;
        }
        .loading {
            position: absolute;
            top: 0;left: 0; right: 0; bottom: 0;
            margin: auto;
            width: 60px;
            height: 60px;
        }
        .bounce-1, .bounce-2 {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #6abe83;
            opacity: .6;
            position: absolute;
            top: 0;
            left: 0;
            animation: bounce 2.0s infinite ease-in-out;
            -webkit-animation: bounce 2.0s infinite ease-in-out;
        }
        .bounce-2 {
            animation-delay: -1.0s;
            -webkit-animation-delay: -1.0s;
        }
        @keyframes bounce {
            0%, 100% { transform: scale(0.0) }
            50% { transform: scale(1.0) }
        }
        @-webkit-keyframes bounce {
            0%, 100% { transform: scale(0.0) }
            50% { transform: scale(1.0) }
        }
        /* ---------- Loading End -------- */
    </style>
</head>
<body>
    <div class="loading-wrap">
        <div class="loading">
            <div class="bounce-1"></div>
            <div class="bounce-2"></div>
        </div>
    </div>

    @if ($album->music)
        <div class="music-wrap">
            <div id="music" class="on">
            </div>
        </div>
        <audio autoplay src="/assets/mp3/{{ $album->music }}.mp3"></audio>
    @endif

    @if ($album->contact_id == $contactId)
    <div class="back">
        <a href="/appstore/photo/{{ $album->app_id }}">
            <img src="/assets/img/arrow.png" alt="">
            返回相册
        </a>
    </div>
    @endif

    <ul class="nav">
    </ul>


    <div class="pages">
        @foreach ($photos as $i => $photo)
            <div class="page {{ !empty($photo['style']['style']) ? 'style-'  . $photo['style']['style'] : 'style-1' }}">
                @if (isset($photo['style']['title']))
                    <div class="title">{{ $photo['style']['title'] }}</div>
                @endif

                @if (isset($photo['style']['desc']))
                    <div class="desc">{!! nl2br($photo['style']['desc']) !!}</div>
                    @endif
                <div class="img">
                    <img src="{{ $photo->img }}" alt="">
                </div>
            </div>
        @endforeach
    </div>

    <div class="arrow down"></div>

    <script src="/assets/js/zepto.min.js"></script>
    <script>
        $(function() {
            $('.loading-wrap').hide();
            execAnimation($('.page').eq(0));
            // 生成导航
            var navs = [];
            $('.page').each(function(i) {
                var nav = i === 0 ? '<li class="current"></li>' : '<li></li>';
                navs.push(nav)
            });
            $('.nav').html(navs.join(''));


            $('body').on('touchstart', function() {
                var audio = document.querySelector('audio');
                if (audio) {
                    $('#music').addClass('played');
                    if (!$('#music').hasClass('played')) {
                        audio.play();
                    }
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

            if ($('.page').length == 1) {
                $('.arrow').hide();
            }
            var w = $('body').width();
            var h = $('body').height();
            $('.page').css({width: w, height: h})
            $('.pages').css({height: h * $('.page').length});

            var index = 0;
            $('.arrow').on('click', function() {
                if ($(this).hasClass('down')) {
                    ++index;
                } else {
                    --index;
                }
                scrolled();
            });

            var startY = 0;
            $('.page').on('touchstart', function(e) {
                startY = e.touches[0].pageY;
                e.preventDefault();
            });
            $('.page').on('touchend', function(e) {
                if (e.changedTouches[0].pageY > startY) {
                    --index;
                } else {
                    ++index;
                }
                scrolled()
            });

            function scrolled() {
                if (index === -1) index = 0;
                if (index === $('.page').length) index = $('.page').length - 1;
                $('.pages').css({top: -(index * h)});
                if (index >= ($('.page').length - 1)) {
                    $('.arrow').addClass('up').removeClass('down');
                } else {
                    $('.arrow').addClass('down').removeClass('up');
                }
                $('.nav li').eq(index).addClass('current').siblings().removeClass('current');

                if (!$('.page').eq(index).hasClass('animated')) {
                    execAnimation($('.page').eq(index));
                }
            }

            function execAnimation(page) {
                page.addClass('animated');
                if (page.hasClass('style-1')) {
                    animationStyle1(page.index());
                } else if (page.hasClass('style-2')) {
                    animationStyle2(page.index());
                }
            }


            // style 1 图片渐显 文字从左右
            function animationStyle1(pageIndex) {
                var page = $('.page').eq(pageIndex);
                var title = page.find('.title');
                var titleWidth = title.width();
                var clientWidth = document.documentElement.clientWidth;
                title.css({left: clientWidth / 2 - (titleWidth / 2)})
                page.find('.img').css({opacity: 1});
                var desc = page.find('.desc');
                var descWidth = desc.width();
                desc.css({right: clientWidth / 2 - (descWidth / 2)})
            }

            // style 2 图片从小到大 文字左右
            function animationStyle2(pageIndex) {
                var page = $('.page').eq(pageIndex);
                page.find('.img').css({transform: 'rotateZ(0deg)', left: 0})
                page.find('.title').css({right: 20})
                page.find('.desc').css({left: 20})
            }

            // style 3 图片旋转 文字上下
            function animationStyle3(pageIndex) {

            }
        });
    </script>
</body>
</html>