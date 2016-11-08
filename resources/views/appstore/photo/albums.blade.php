<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>{{ $wechat->nick_name }}微相册</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <link rel="stylesheet" href="/assets/css/photo.css">
    <link rel="stylesheet" href="/assets/font-awesome/css/font-awesome.min.css">
</head>
<body data-app-id="{{ $appId }}">
<div class="container" >
    <div class="g-layer">
    </div>
    <div class="modal">
        <div class="back">
            <a href="/appstore/photo/{{ $appId }}">
                <img src="/assets/img/arrow.png" alt="">
                返回相册
            </a>
        </div>
        <div class="step-wrap">
            <div class="step step-1" data-index="1">
                <input type="hidden" name="id" class="id">
                <div class="title">创建相册</div>
                <form action="/appstore/photo/create"  method="POST">
                    <div class="group">
                        <label for="">相册名字</label>
                        <input type="text" name="name" class="name">
                    </div>
                    <div class="group">
                        <input type="hidden" name="music" class="music">
                        <div class="select">选择背景音乐</div>
                        <ul class="sub">
                            <li data-id="kanong">卡农</li>
                            <li data-id="yueguang">月光</li>
                            <li data-id="qiurisiyu">秋日私语</li>
                        </ul>
                    </div>
                    <div class="next">
                        <a class="btn" href="javascript:;">下一步</a>
                    </div>
                </form>
            </div>

            <div class="step step-2">
                <input type="hidden" name="album_id" class="album-id" />
                <div class="title">选择照片</div>
                <ul class="photos">
                    <li class="item choose">
                        <img src="/assets/img/photo.png" alt="">
                    </li>
                </ul>
                <div class="desc">
                    请选择 1 - 9 张照片
                </div>
                <div class="tips">
                </div>
                <div class="next">
                    <a href="javascript:;" class="btn">开始制作</a>
                </div>
            </div>

            <div class="step step-3">
                <div class="title">制作相册</div>
                <div class="tips"></div>
                <div class="photos">
                    <span class="nav prev"></span>
                    <span class="nav next"></span>
                    <!--
                    <div class="page style-1" style="z-index: 1">
                        <div class="close">&times</div>
                        <div class="title editable" contenteditable="true">平淡的生活</div>
                        <div class="desc editable" contenteditable="true">
                            我想和你虚度时光/比如吧茶杯留在桌子上
                        </div>
                        <div class="img">
                            <img src="/assets/img/test.png" alt="">
                        </div>
                    </div>
                    <div class="page style-2 editable" style="z-index: -1">
                        <div class="close">&times</div>
                        <div class="img">
                            <img src="/assets/img/test.png" alt="">
                        </div>
                        <div class="date">DECEMBER.06.2015</div>
                        <div class="desc">
                            其实一直陪伴着你的<br/>
                            是那个了不起的自己
                        </div>
                    </div>
                    -->
                </div>

                <div class="paginate">
                    <ul>
                        <!-- 分页 -->
                    </ul>
                </div>

                <div class="actions">
                    <a class="show-style" href="javascript:;">换板式
                    </a><a class="add-page" href="javascript:;">添加一页
                    </a><a class="finsh" href="javascript:;">完成</a>
                </div>

                <div class="style action-bar">
                    <div class="close">&times;</div>
                    <ul>
                        <li>
                            <img src="/assets/img/photo/style/1/thumb.jpg" alt="">
                        </li><li>
                            <img src="/assets/img/photo/style/2/thumb.jpg" alt="">
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <h1>我的相册</h1>
    <ul class="albums">
        @foreach ($albums as $album)
            <li class="item">
                <div class="img">
                    @if ($album->photo)
                        <img src="{{ $album->photo->img }}" alt="">
                    @else
                        <img src="/assets/img/nopic.gif" alt="">
                    @endif
                </div>
                <div class="con">
                    <div class="name">
                        {{ $album->name }}
                    </div>
                    <div class="actions">
                        <a class="edit" href="javascript:;" data-id="{{ $album->_id }}">修改</a>
                        <a data-appid="{{ $album->app_id }}" data-id="{{ $album->_id }}" class="delete" href="javascript:;">删除</a>
                        <a class="view" href="/appstore/photo/show/{{ $album->_id }}">查看</a>
                    </div>
                </div>
            </li>
        @endforeach
    </ul>
    <div class="create">
        <a class="btn" href="javascript:;">创建相册</a>
    </div>
    <div class="g-tips">
        <div class="con">
            确认删除
        </div>
        <div class="actions">
            <a class="cancel">取消</a>
            <a class="confirm">确认</a>
        </div>
    </div>
    <!-- 上传图片 -->
    <div id="file"></div>
</div>

<script src="/assets/js/zepto.min.js"></script>
<script src="/assets/js/photo.js"></script>
<script src="/assets/js/weixin.js"></script>
<script>
    wx.config({!! json_encode($jsConfig) !!});
</script>
</body>
</html>