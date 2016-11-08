<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>微信相册</title>
    <script src="/assets/js/jquery.min.js"></script>
    <script src="/assets/js/bootstrap.min.js"></script>
    <link rel="stylesheet" href="/assets/css/bootstrap.min.css">
    <style>
        .add {
            margin-bottom: 10px;
            margin-top: 10px;
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="add">
            <button class="btn btn-default" data-toggle="modal" data-target="#modal">添加应用</button>
        </div>
        <table class="table">
            <tr>
                <th>公众号</th>
                <th>相册数</th>
                <th>二维码</th>
                <th>查看</th>
            </tr>
            @foreach ($albums as $album)
                <tr>
                    <td>{{ $album->wechat->nick_name }}</td>
                    <td>{{ $album->nums }}</td>
                    <td>
                        <div>
                            <img src="{{ $album->qrcode }}" alt="" width="100">
                        </div>

                        https://wx.usingnet.com/appstore/photo/{{ $album->app_id }}
                    </td>
                    <td>
                        <a href="/appstore/photo/admin/{{ $album->app_id }}">查看</a>
                    </td>
                </tr>
            @endforeach
        </table>

        <div class="modal fade" id="modal">
            <form class="form" method="POST" action="/appstore/vote" enctype="multipart/form-data">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                            <h4 class="modal-title">添加活动</h4>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label for="">公众号</label>
                                <select class="form-control app-id" name="app_id">
                                    <option value="">选择公众号</option>
                                    @foreach($wechats as $wechat)
                                        <option value="{{ $wechat->app_id }}">{{ $wechat->nick_name }}</option>
                                    @endforeach
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer submit">
                            <button type="button" class="btn btn-primary">保存</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>

        <script>
            $(function() {
                $('.submit .btn').on('click', function() {
                    var appId = $('.app-id').val();
                    if (appId) {
                        $.ajax({
                            type: 'POST',
                            url: '/appstore/photo/admin',
                            data: {app_id: appId},
                            success: function() {
                                location.reload();
                            }
                        });
                    }
                });
            });
        </script>

    </div>
</body>
</html>