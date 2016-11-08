<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>支付应用</title>
    <link rel="stylesheet" href="/assets/css/bootstrap.min.css">
    <script src="/assets/js/jquery.min.js"></script>
    <script src="/assets/js/bootstrap.min.js"></script>
    <style>
        .add {
            text-align: right;
            margin: 20px;
        }
        .form-group img {
            margin-top: 10px;
            width: 100px;
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
                <th>名称</th>
                <th>二维码</th>
                <th>操作</th>
            </tr>
            @foreach ($pays as $pay)
                <tr>
                    <td>{{ $pay->name }}</td>
                    <td>
                        <div>
                            <img src="{{ $pay->qrcode }}" alt="" width="100">
                        </div>
                        https://wx.usingnet.com/appstore/wepay/{{ $pay->app_id }}
                    </td>
                    <td>
                        <a class="edit" href="javascript:;" data-id="{{ $pay->_id }}" data-toggle="modal" data-target="#modal">修改</a>
                        <a href="/appstore/wepay/admin/{{ $pay->id }}">查看</a>
                        <a href="/appstore/wepay/delete/{{ $pay->id }}">删除</a>
                    </td>
                </tr>
            @endforeach
        </table>
        <div class="modal fade" id="modal">
            <form class="form" method="POST" action="/appstore/wepay/admin" enctype="multipart/form-data">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                            <h4 class="modal-title">添加活动</h4>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label for="">公众号 APPID</label>
                                <select name="app_id" id="" class="form-control">
                                    @foreach ($wechats as $wechat)
                                        <option value="{{ $wechat->app_id }}">{{ $wechat->nick_name }}</option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="">商户号</label>
                                <input type="text" name="mchid" class="form-control name">
                            </div>
                            <div class="form-group">
                                <label for="">密匙</label>
                                <input type="text" name="key" class="form-control name">
                            </div>
                            <div class="form-group">
                                <label for="">应用名称</label>
                                <input type="text" name="name" class="form-control name">
                            </div>
                            <div class="form-group">
                                <label for="">应用 LOGO</label>
                                <input type="file" name="file" id="file">
                            </div>

                        </div>
                        <div class="modal-footer submit">
                            <button type="submit" class="btn btn-primary">保存</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <script>
        $(function() {
            $('.form').on('submit', function() {
                var appId = $('.app-id').val();
                var name = $('.name').val();
                $('.has-error').removeClass('has-error');
                if (!appId) {
                    $('.app-id').parents('.form-group').addClass('has-error')
                }
                if (!name) {
                    $('.name').parents('.form-group').addClass('has-error')
                }

                if ($('.has-error').length) {
                    return false;
                }
            });

            $('.add').on('click', function() {
                $('.modal-title').text('添加应用');
                $('.name').val('');
                $('.form-group img').remove()
                $('option:first').prop('selected', true);
            });

            $('.edit').on('click', function() {
                var id = $(this).data('id');
                $('.modal-title').text('修改应用');
                $.ajax({
                    url: '/appstore/wepay/adminshow/' + id,
                    success: function(resp) {
                        var img = '<img src="' + resp.data.img + '">';
                        $('#file').after(img);
                        for (var key in resp.data) {
                            console.log(key);
                            $('input[name="' + key +'"]').val(resp.data[key]);
                        }
                        $('option').each(function() {
                            if ($(this).val() == resp.data.app_id) {
                                $(this).prop('selected', true)
                            }
                        });
                    }
                })
            });
        });
    </script>
</body>
</html>