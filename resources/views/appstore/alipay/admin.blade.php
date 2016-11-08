<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>支付宝应用</title>
    <link rel="stylesheet" href="/assets/css/bootstrap.min.css">
    <script src="/assets/js/jquery.min.js"></script>
    <script src="/assets/js/bootstrap.min.js"></script>
    <style>
        .add {
            text-align: right;
            margin: 20px;
        }
        .empty {
            padding: 100px;
            text-align: center;
            color: #888;
        }
        .form-group img {
            width:100px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="add">
        <button class="btn btn-default" data-toggle="modal" data-target="#modal">
            添加应用
        </button>
    </div>

    @if ($alipays->count())
        <table class="table">
            <tr>
                <th>名字</th>
                <th>Logo</th>
                <th>二维码</th>
                <th>操作</th>
            </tr>
            @foreach ($alipays as $pay)
                <tr>
                    <td>{{ $pay->name }}</td>
                    <td><img src="{{ $pay->img }}" alt="" width="100"></td>
                    <td>
                        <div>
                            <img src="{{ $pay->qrcode }}" alt="" width="100">
                        </div>
                        https://wx.usingnet.com/appstore/alipay/{{ $pay->id }}
                    </td>
                    <td>
                        <a class="edit" data-id="{{ $pay->_id }}" href="javascript:;" data-toggle="modal" data-target="#modal">修改</a>
                        <a href="/appstore/alipay/admin/{{ $pay->id }}">查看</a>
                    </td>
                </tr>
            @endforeach
        </table>
    @else
         <div class="empty">
            未创建应用
        </div>
    @endif

    <div class="modal fade" id="modal">
        <form class="form" method="POST" action="/appstore/alipay/admin" enctype="multipart/form-data">
            <input class="id" type="hidden" name="id">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                        <h4 class="modal-title">添加应用</h4>
                    </div>
                    <div class="modal-body">
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

    <script>
        $('.add').on('click', function() {
            $('.modal-title').text('添加应用')
            $('.name').val('')
            $('.id').val('');
            $('.form-group img').remove();
        });
        $('.edit').on('click', function() {
            $('.modal-title').text('修改应用');
            var id = $(this).data('id');
            $.ajax({
                method: 'GET',
                url: '/appstore/alipay/admin/' + id,
                success: function(resp) {
                    $('.id').val(resp.data._id);
                    $('.name').val(resp.data.name);
                    var img = '<img src="'+ resp.data.img + '" />';
                    $('#file').after(img);
                }
            })
        });
    </script>
</div>
</body>
</html>