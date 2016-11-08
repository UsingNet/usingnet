<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>转盘抽奖活动</title>
    <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        ul {
            list-style-type: none;
        }
        .add {
            text-align: right;
            margin-top: 20px;
        }
        .staffs li{
            margin-bottom: 10px;
        }
        .staffs .upload, .staffs input{
            display: inline-block;
        }
        .staffs .upload {
            width: 20%;
        }
        .staffs input {
            width: 70%;
        }
        .staffs .close {
            display: inline-block;
            font-size: 30px;
            color: #ff3300;
        }
        .staffs .file {
            display: none;
        }
        .add-staff {
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="add">
            <button class="btn btn-info" data-toggle="modal" data-target="#modal">添加活动</button>
        </div>

        <h1>活动列表</h1>
        <table class="table">
            <col width="20%">
            <col width="30%">
            <col width="40%">
            <tr>
                <th>公众号</th>
                <th>活动名字</th>
                <th>二维码</th>
                <th>操作</th>
            </tr>
            @foreach ($configs as $config)
                 <tr>
                    <td>{{ $config->wechat->nick_name }}</td>
                    <td>{{ $config->name }}</td>
                     <td>
                         <div>
                         <img width="100" src="{{ $config->qrcode }}" />
                         </div>
                         {{ 'https://wx.usingnet.com/appstore/turntable/show/' . $config->id }}
                     </td>
                    <td>
                        <a href="/appstore/turntable/user/{{ $config->id }}">查看</a>
                        <a href="" data-toggle="modal" data-target="#modal" class="edit" data-id="{{ $config->id }}">修改</a>
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

                            <div class="form-group">
                                <label for="">活动名称</label>
                                <input type="text" class="form-control name" name="name">
                            </div>

                            <div class="form-group">
                                <label for="">活动规则</label>
                                <textarea class="form-control desc" name="desc"></textarea>
                            </div>

                            <div class="form-group ">
                                <ul class="staffs">

                                </ul>
                                <div class="add-staff">
                                    <button class="btn btn-info" type="button">添加奖品</button>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer submit">
                            <button type="button" class="btn btn-primary">保存</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <script src="/assets/js/jquery.min.js"></script>
    <script src="/assets/js/bootstrap.min.js"></script>
    <script type="text/tpl" id="staff-tpl">
        <li>
            <input type="file" name="file" class="file">
            <div class="upload">
                <button type="button" class="btn btn-default">上传图片</button>
            </div>
            <input type="text" class="form-control name" placeholder="奖品名字">
            <div class="close">&times;</div>
        </li>
    </script>

    <script>

        $('.add').on('click', function() {
            $('.app-id option:first').prop('selected', true);
            $('.name').val('');
            $('.staffs').html('');
            $('.desc').val('');
            $(".modal-title").text('添加活动')
        });

        $('.add-staff').on('click', function() {
            $('.staffs').append($('#staff-tpl').html());
        });

        $('.staffs').on('click', '.close', function() {
            $(this).parents('li').remove();
        });

        $('.staffs').on('click', '.upload',function() {
            $(this).parents('li').find('.file').trigger('click');
        });

        $('.staffs').on('change', '.file', function() {
            var file = this.files[0];
            var data = new FormData;
            data.append('file', file);
            var parent = $(this).parents('li');
            $.ajax({
                url: "/api/upload",
                type: "POST",
                data: data,
                processData: false,  // 告诉jQuery不要去处理发送的数据
                contentType: false,  // 告诉jQuery不要去设置Content-Type请求头
                success: function (resp) {
                    resp = JSON.parse(resp);
                    var img = '<img width="80" src="' + resp.data + '"/>';
                    parent.find('.upload').html(img);
                }
            });
        });

        $('.edit').on('click', function() {
            var id = $(this).data('id');
            $('.modal-title').text('修改活动');
            $.ajax({
                type: 'GET',
                url: '/appstore/turntable/config/' + id,
                success: function(resp) {
                    $('.app-id option').each(function(i, item) {
                        if (this.value == resp.app_id) {
                            $(this).prop('selected', true);
                        }
                    })
                    $('.name').val(resp.name);
                    $('.desc').val(resp.desc);
                    var staffs = [];
                    resp.staffs.forEach(function(item) {
                        var tpl = $($('#staff-tpl').html());
                        var img = '<img width="80" src="' +item.img+ '">';
                        tpl.find('.upload').html(img);
                        tpl.find('.name').attr('value', item.name);
                        staffs.push('<li>' + tpl.html() + '</li>');
                    });

                    $('.staffs').html(staffs.join(''));
                }
            })
        });

        $('.submit').on('click', function() {
            var appid = $('.app-id').val();
            var name = $('.name').val();
            var desc = $('.desc').val();

            var staffs = [];

            $('.staffs li').each(function(i, staff) {
                var item = {};
                item.img = $(staff).find('img').attr('src');
                item.name = $(staff).find('.name').val();
                staffs.push(item);
            });

            if (!appid) {
                alert('请选择公众号');
                return false;
            }
            if (!name) {
                alert('请选择填写活动名字');
                $('.name').focus();
                return false;
            }
            if (staffs.length == 0) {
                alert('请添加奖品');
                return false;
            }

            $.ajax({
                type: 'POST',
                url: '/appstore/turntable/submit',
                data: {app_id: appid, name: name, staffs: staffs, desc: desc},
                success: function() {
                    location.reload();
                }
            });

            return false;
        });
    </script>
</body>
</html>