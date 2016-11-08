<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>{{ $voteConfig->name }}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-size: 14px;
            font-family: sans-serif;
        }
        .wrap {
            padding: 20px;
            width: 100%;
        }
        .header {
            text-align: center;
        }
        .content {
            width: 100%;
        }
        .cover {
            width: 150px;
            min-height: 150px;
            margin: 30px auto;
            text-align: center;
        }
        .cover img {
            max-width: 100%;
        }
        .photos {
            width: 100%;
            margin-bottom: 20px;
        }
        .photos ul {
            list-style-type: none;
            width: 100%;
        }
        .photos li {
            width: 20%;
            margin: 2.5%;
            float: left;
            position: relative;
            border: 1px solid #eee;
        }
        .photos .close {
            width: 25px;
            height: 25px;
            font-size: 16px;
            line-height: 25px;
            border-radius: 25px;
            text-align: center;
            color: #FFF;
            background: #ff3300;
            position: absolute;
            right: -10px;
            top: -10px;
            z-index: 2;
            font-size: 20px;
        }
        .photos .photo img {
            position: absolute;
            max-height: 100%;
            max-width: 100%;
            top: 0; left: 0; right: 0; bottom: 0;
            margin: auto;
        }
        .photos .add {
            text-align: center;
            color: #666;
            font-size: 10px;
        }
        .photos .add img {
            margin-top: 10px;
        }

        .music {
            margin-bottom: 20px;
        }

        .music select {
            width: 100%;
            padding: 5px;
        }
        .title {
            margin-bottom: 5px;
            font-size: 16px;
        }
        .clear {
            clear: both
        }
        .btn {
            width: 100%;
            padding: 10px;
            background: #6abe83;
            border: none;
            color: #FFF;
        }

        @if ($voteConfig->style)
              {!! $voteConfig->style !!}
        @endif
    </style>
</head>
<body data-config-id="{{ $voteConfig->_id }}">

    <div class="wrap">
        <form action="/appstore/vote/submit" method="POST">
            <div class="header">
                <h1 @if ($voteConfig->title_color) style="color: {{ $voteConfig->title_color }}" @endif>{{ $voteConfig->name }}</h1>
            </div>

            <input type="hidden" name="img" value="{{ $vote->img }}">
            <input type="hidden" name="id" value="{{ $vote->_id }}">

            <div class="content">
                <div class="cover">
                    @if (!$vote->img)
                        <div class="upload">
                            <img src="/assets/img/upload.png" width="130" alt="" style="opacity: .6">
                            <div class="text">
                                添加封面
                            </div>
                        </div>
                    @else
                        <div class="upload">
                            <img src="{{ $vote->img }}" >
                            <div class="text">点击修改封面</div>
                        </div>
                    @endif
                </div>
                <div class="photos">
                    <div class="title">添加照片</div>
                   <ul>
                       @foreach ($vote->photos as $photo)
                           <li class="photo">
                               <div class="close">&times;</div>
                               <img src="{{ $photo }}" alt="">
                           </li>
                       @endforeach

                       <li class="add">
                           <img src="/assets/img/upload.png" alt="" width="25" style="opacity: .6">
                           <div class="text">添加照片</div>
                       </li>
                   </ul>
                    <div class="clear"></div>
                </div>

                <div class="music">
                   <div class="title">选择背景音乐</div>
                    <select name="music" id="">
                        <option value="">不使用背景音乐</option>
                        <option @if ($vote->music === 'kanong') selected @endif value="kanong">卡农</option>
                        <option @if ($vote->music === 'qiurisiyu') selected @endif value="qiurisiyu">秋日私语</option>
                        <option @if ($vote->music === 'yueguang') selected @endif value="yueguang">月光</option>
                    </select>
                </div>
            </div>

            <div class="footer">
                <!--
                <div class="desc">
                    <textarea class="form-control" placeholder="填写你的简介" name="desc">{{ $vote->desc }}</textarea>
                </div>
                -->
                <div class="submit">
                    <button class="btn btn-info" @if ($voteConfig->btn_color) style="background-color: {{ $voteConfig->btn_color }}; border-color: {{ $voteConfig->btn_color }}" @endif>提交</button>
                </div>
            </div>

        </form>
    </div>

    <script src="/assets/js/zepto.min.js"></script>
    <script src="/assets/js/weixin.js"></script>
    <script>
        $(function() {
            $('.photos li').css({height: $('.photos li').width()})

            $('.photos').on('click', '.close', function() {
                $(this).parents('li').remove();
            });

            $('.submit .btn').on('click', function() {
                var img = $('input[name=img]').val();
                if (!img) {
                    alert('请上传封面');
                    return false;
                }

                var photos = [];
                $('.photos li').each(function() {
                    if (this.className !== 'add') {
                        photos.push('<input type="hidden" name="photos[]" value="' + $(this).find('img').attr('src') + '"/>');
                    }
                });
                $('.photos').append(photos);
            });

            wx.config({!! json_encode($config) !!});
            $('.upload, .add').on('click', function() {
                var className = this.className;
                wx.chooseImage({
                    sizeType: ['compressed'],
                    sourceType: ['album', 'camera'],
                    success: function (res) {
                        var localIds = res.localIds;
                        if (className === 'upload') {
                            localIds = localIds.splice(0, 1);
                        }
                        localIds.forEach(function(id, i) {
                            setTimeout(function() {
                                wx.uploadImage({
                                    localId: id,
                                    isShowProgressTips: 1,
                                    success: function (res) {
                                        var serverId = res.serverId;
                                        $.ajax({
                                            type: 'POST',
                                            url: '/appstore/vote/upload',
                                            data: {local_id: id, media_id: serverId, vote_config_id: $('body').data('config-id')},
                                            success: function(resp) {
                                                if (className === 'upload') {
                                                    $('.cover img').attr('src', resp.data);
                                                    $('[name=img]').val(resp.data);
                                                } else {
                                                    var li = [
                                                        '<li class="photo">',
                                                            '<div class="close">&times;</div>',
                                                            '<img src="' + resp.data + '"/>',
                                                        '</li>',
                                                    ];
                                                    $('.photos .add').before(li.join(''));
                                                    $('.photos li').css({height: $('.photos .add').height()});
                                                }
                                            }
                                        });
                                    }
                                });
                            }, 1000 * (i+1));
                        });
                    }
                });
            });
        })
    </script>
</body>
</html>