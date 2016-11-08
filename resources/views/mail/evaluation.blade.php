<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>邮件评价 - 优信科技</title>
    <link rel="stylesheet" href="//cdn.bootcss.com/bootstrap/3.3.5/css/bootstrap.min.css">
    <script src="//cdn.bootcss.com/jquery/1.10.2/jquery.min.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <style>
        body {
            background: #F3F3F3;
        }
        #wapper {
            width: 320px;
            margin: 0 auto;
            padding: 20px;
            font-size: 14px;
            color: #333;
        }

        .hd {
            text-align: center;
            margin-bottom: 30px;;
        }

        .faces ul{
            padding: 0;
            list-style-type: none;
            width: 246px;
            margin: 0 auto;
            margin-bottom: 30px;
        }
        .faces li {
            display: inline-block;
            padding: 5px;
            margin: 5px;
            background-repeat: no-repeat;
            text-align: center;
            vertical-align: text-bottom;
            font-size: 12px;
            cursor: pointer;
            border: 1px solid #F3F3F3;
        }
        .faces li:hover {
            border: 1px solid #F2F2F2;
            border-radius: 3px;;
            background: #fff;
        }

        .faces .current {
            border: 1px solid #F2F2F2;
            border-radius: 3px;;
            background: #fff;
        }
        .faces i {
            width: 60px;
            height: 60px;
            display: block;
            background-size: 60px;
        }
        .faces i.good {
            background-image:  url('//im.usingnet.com/build/v2/image/good.png');
        }

        .faces i.general {
            background-image:  url('//im.usingnet.com/build/v2/image/normal.png');
        }

        .faces i.bad {
            background-image:  url('//im.usingnet.com/build/v2/image/bad.png');
        }

        .fd {
            text-align: center;
        }

        .bd {
            margin-bottom: 20px;
        }
        textarea {
            height: 80px !important;
            resize: none;
        }
        .submit {
            text-align: center;
            margin-bottom: 50px;;
        }
        button {
            width: 100%
        }
        .alert {
            text-align: center;
        }
    </style>
</head>
<body>
    <div id="wapper">
        @if (session()->get('evaluation') == $key)
            <div class="alert alert-success">
                感谢您的评价
            </div>
        @else
            <form action="/api/mail/evaluation" method="post">
                <input type="hidden" name="level" class="level">
                <input type="hidden" name="key" value="{{ $key }}">
                <div class="hd">
                    <p>欢迎您对我们的服务进行评价</p>
                </div>
                <div class="bd">
                    <div class="faces">
                       <ul>
                           <li class="good current"><i class="good"></i>
                               好评</li><li class="general"><i class="general"></i>
                               中评</li><li class="bad"><i class="bad"></i>差评
                           </li>
                       </ul>
                    </div>
                    <textarea class="form-control" name="content" placeholder="请填写评价内容 (选填)"></textarea>
                </div>
                <div class="submit">
                    <button class="btn btn-info">提交</button>
                </div>
            </form>
            <div class="fd">
                &copy; 2016 <a href="">优信科技</a>
            </div>
            <script>
                $('.faces li').on('click', function () {
                    $(this).siblings().removeClass('current');
                    $(this).addClass('current');
                    var level = $(this).attr('class').replace(/current/, '').trim();
                    $('.level').val(level)
                })
            </script>
        @endif
    </div>
</body>
</html>