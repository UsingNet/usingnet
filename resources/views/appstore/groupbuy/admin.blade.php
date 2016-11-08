<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>团购应用</title>
    <script src="/assets/js/jquery.min.js"></script>
    <script src="/assets/js/bootstrap.min.js"></script>
    <link rel="stylesheet" href="/assets/css/bootstrap.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        .add {
            padding: 10px;
            text-align: right;
        }
        .empty {
            padding: 100px;
            text-align: center;
        }
        .form-group img {
            width: 100px;
            margin-top: 20px;
        }
        .pages {
            text-align: center;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="add">
        <button class="btn btn-default" data-toggle="modal" data-target="#modal">添加应用</button>
    </div>
    @if ($groups->count())
        <table class="table">
            <tr>
                <th>团购名称</th>
                <th>二维码</th>
                <th>定金</th>
                <th>团购个数</th>
                <th>操作</th>
            </tr>
            @foreach ($groups as $group)
                <tr>
                    <td>{{ $group->name }}</td>
                    <td>
                        <div>
                            <img src="{{ $group->qrcode }}" alt="" width="100">
                        </div>
                        https://wx.usingnet.com/appstore/groupbuy/{{ $group->id }}
                    </td>
                    <td>{{ $group->name }}</td>
                    <td>
                        <a href="/appstore/groupbuy/admin/{{ $group->id }}">
                            {{ $group->count }}
                        </a>
                    </td>
                    <td>
                        <a class="edit" href="javascript:;" data-id="{{ $group->id }}" data-toggle="modal" data-target="#modal">修改</a>
                        <a href="/appstore/groupbuy/admin/{{ $group->id }}">查看</a>
                    </td>
                </tr>
            @endforeach
        </table>
        <div class="pages">
            {!! $groups->render() !!}
        </div>
    @else
        <div class="empty">
            未创建应用
        </div>
    @endif

    <div class="modal fade" id="modal">
        <form class="form" method="POST" action="" enctype="multipart/form-data">
            <input type="hidden" name="id" class="id">
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
                        <div class="form-group">
                            <label for="">团购名称</label>
                            <input type="text" class="name form-control" name="name">
                        </div>
                        <!--
                        <div class="form-group">
                            <label for="">团购介绍</label>
                            <textarea class="desc form-control" name="desc"></textarea>
                        </div>
                        -->
                        <!--
                        <div class="form-group">
                            <label for="">团购图片</label>
                            <input type="file" id="file" name="file">
                        </div>
                        -->
                        <div class="form-group">
                            <label for="">团购人数上限</label>
                            <input type="number" class="max-num form-control" name="max_num">
                        </div>
                        <div class="form-group">
                            <label for="">团购天数</label>
                            <input type="number" class="max-day form-control" name="max_day">
                        </div>
                        <div class="form-group">
                            <label for="">定金</label>
                            <input type="text" class="deposit form-control" name="deposit">
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
        $(function() {
            $('.add').on('click', function() {
                $('option:first').prop('selected', true);
                $('.name').val('');
                $('.desc').val('');
                $('.form-group img').remove();
                $('.max-num').val('');
                $('.max-day').val('');
                $('.deposit').val('');
            });

            $('.edit').on('click', function() {
                var id = $(this).data('id');
                $.ajax({
                    url: '/appstore/groupbuy/admin/' + id,
                    success: function(resp) {
                        $('.id').val(resp.data._id);
                        $('.name').val(resp.data.name);
                        $('.desc').val(resp.data.desc);
                        $('.max-num').val(resp.data.max_num);
                        $('.max-day').val(resp.data.max_day);
                        $('.deposit').val(resp.data.deposit);
                        $('option').each(function(i) {
                            if ($(this).val() == resp.data.app_id) {
                                $('option').eq(i).prop('selected', true)
                            }
                        });
                        var img = '<img src="'+ resp.data.img +'"/>';
                        $('#file').after(img);
                    }
                })
            });

            $('form').on('submit', function() {
                $('.has-error').removeClass('has-error');
                var fields = ['app-id', 'name', 'max-num', 'max-day', 'deposit'];
                var vals = {};
                fields.forEach(function(item) {
                    var className = '.' + item;
                    var val = $(className).val();
                    if (!val) {
                        $(className).parents('.form-group').addClass('has-error')
                    } else {
                        vals[item] = val;
                    }
                });
                if ($('.has-error').length) {
                    return false
                }
            });
        });
    </script>
</div>
</body>
</html>