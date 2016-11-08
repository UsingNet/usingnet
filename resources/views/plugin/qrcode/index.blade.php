<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>二维码</title>
    <link href="//cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">
    <script src="//cdn.bootcss.com/jquery/3.1.0/jquery.min.js"></script>
    <script src="//cdn.bootcss.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <style>
        .header {
            padding-top: 20px;;
            padding-bottom: 10px;
            overflow: hidden;
        }
        h1 {
            font-size: 24px;
            float: left;
        }
        .add {
            float: right;
        }

        .help-block {
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="wrap container">

        @if ($wechats->isEmpty())
            <div class="alert alert-warning text-center">
                请先绑定微信公众号
            </div>
        @else
            <div class="header">
                <h1>二维码</h1>
                <div class="add text-agent-right">
                    <button class="btn btn-info" data-toggle="modal" data-target="#add">添加</button>
                </div>
            </div>
            <table class="table">
                <tr>
                    <th>标题</th>
                    <th>二维码</th>
                    <th>日期</th>
                    <th>类型</th>
                    <th>关注</th>
                    <th>扫描</th>
                    <th>操作</th>
                </tr>
                @foreach ($qrcodes as $qrcode)
                    <tr>
                        <td>{{ $qrcode->title }}</td>
                        <td><img width="150" src="{{ $qrcode->url }}" /></td>
                        <td>{{ $qrcode->created_at }}</td>
                        <td>
                            {{ $qrcode->type === \App\Models\Qrcode\Qrcode::TYPE_FOREVER ? '永久' : '临时' }}
                            @if ($qrcode->type === \App\Models\Qrcode\Qrcode::TYPE_TEMP && (time() - strtotime($qrcode->created_at))/24/3600 > 30)
                                <span class="label label-warning">已过期</span>
                            @endif
                        </td>
                        <td><a href="/api/qrcode/record/{{ $qrcode->id }}?type=subscribe">{{ $qrcode->subscribes }}</a></td>
                        <td><a href="/api/qrcode/record/{{ $qrcode->id }}?type=scan">{{ $qrcode->scans }}</a></td>
                        <td>
                            <a href="javascript:;" class="edit" data-id="{{ $qrcode->id }}">修改</a>
                            <a href="javascript:;" class="delete" data-id="{{ $qrcode->id }}">删除</a>
                        </td>
                    </tr>
                @endforeach
            </table>

            <div class="text-center">
                {!! $qrcodes->render() !!}
            </div>


            <!-- 添加 二维码 -->
            <div class="modal fade" id="add" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 class="modal-title">添加二维码</h4>
                        </div>

                        <div class="modal-body">
                            <form action="" class="form-horizontal">
                                <div class="form-group">
                                    <label for="" class="col-sm-2 control-label">标题</label>
                                    <div class="col-sm-10">
                                        <input  type="text" class="form-control title" placeholder="请填写二维码的用途" required>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="" class="col-sm-2 control-label">类型</label>
                                    <div class="col-sm-10">
                                        <select name="" class="form-control type">
                                            <option value="FOREVER">永久二维码</option>
                                            <option value="TEMP">临时二维码</option>
                                        </select>

                                        <span class="help-block">
                                       1. 永久二维码最多可以生成 100000 个 <br/>
                                        2. 临时二维码生成个数不限，30 天后过期
                                    </span>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="" class="col-sm-2 control-label">公众号</label>
                                    <div class="col-sm-10">
                                        <select name="" class="form-control wechat_id">
                                            @foreach ($wechats as $wechat)
                                                <option value="{{ $wechat->id }}">{{ $wechat->nick_name }}</option>
                                            @endforeach
                                        </select>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="" class="col-sm-2 control-label">回复消息</label>
                                    <div class="col-sm-10">
                                        <select name="" class="form-control message-type" >
                                            <option value="">选择消息类型</option>
                                            <option value="TEXT">文字</option>
                                            <option value="IMAGE">图片</option>
                                            <option value="NEWS">图文</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="" class="col-sm-2 control-label"></label>
                                    <div class="col-sm-10 editor">
                                    </div>
                                </div>

                            </form>
                        </div>

                        <div class="modal-footer">
                            <button type="button" class="btn btn-info submit add">生成</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 添加二维码 -->


        <!-- 修改 二维码 -->
        <div class="modal fade" id="edit" tabindex="-1" role="dialog" aria-labelledby="">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title" >修改</h4>
                    </div>

                    <input type="hidden" name="id" class="id">

                    <div class="modal-body">
                        <form action="" class="form-horizontal">
                            <div class="form-group">
                                <label for="" class="col-sm-2 control-label">标题</label>
                                <div class="col-sm-10">
                                    <input type="text" class="form-control title" placeholder="请填写二维码的用途" required>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="" class="col-sm-2 control-label">类型</label>
                                <div class="col-sm-10">
                                    <select name=""  class="form-control type" disabled>
                                        <option value="FOREVER">永久二维码</option>
                                        <option value="TEMP">临时二维码</option>
                                    </select>

                                            <span class="help-block">
                                           1. 永久二维码最多可以生成 100000 个 <br/>
                                            2. 临时二维码生成个数不限，30 天后过期
                                        </span>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="" class="col-sm-2 control-label">公众号</label>
                                <div class="col-sm-10">
                                    <select name="" class="form-control wechat_id" disabled>
                                        @foreach ($wechats as $wechat)
                                            <option value="{{ $wechat->id }}">{{ $wechat->nick_name }}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="" class="col-sm-2 control-label">回复消息</label>
                                <div class="col-sm-10">
                                    <select name="" class="form-control message-type" >
                                        <option value="">选择消息类型</option>
                                        <option value="TEXT">文字</option>
                                        <option value="IMAGE">图片</option>
                                        <option value="NEWS">图文</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="" class="col-sm-2 control-label"></label>
                                <div class="col-sm-10 editor">
                                </div>
                            </div>

                        </form>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-info submit edit">修改</button>
                    </div>
                </div>
            </div>
        </div>
        </div>
        <!-- 修改 二维码 -->


        <script>

            $('.table .edit').on('click', function() {
                var id = $(this).data('id');
                $('.editor').html('');
                $.ajax({
                    type: 'GET',
                    url: '/api/qrcode/show/' + id,
                    success: function(resp) {
                        $('#edit .id').val(resp.data._id);
                        $('#edit .title').val(resp.data.title);
                        $('#edit .type').val(resp.data.type);
                        $('#edit .wechat_id').val(resp.data.wechat_id);
                        $('#edit .message-type').val(resp.data.message_type);

                        switch (resp.data.message_type) {
                            case 'TEXT':
                                $('.editor').html('<textarea class="form-control message">'+ resp.data.message +'</textarea>');
                                break;
                            case 'IMAGE':
                                    var html = ' <input type="file" class="file" />' +
                                            '<div class="preview"><img src="'+ resp.data.src + '" style="max-width: 320px;" /></div> ' +
                                                    '<input type="hidden" class="message" value="' + resp.data.message +  '"/>'
                                    $('.editor').html(html);
                                break;
                            case 'NEWS':
                                var mediaId = resp.data.message;
                                $.ajax({
                                    type: 'GET',
                                    url: '/api/qrcode/news/' + resp.data.wechat_id,
                                    success: function(resp) {
                                        if (resp.success) {
                                            var news = [];
                                            resp.item.forEach(function(item) {
                                                if (item.media_id == mediaId) {
                                                    news.push('<option selected value="' + item.media_id + '">' + item.content.news_item[0].title + '</option>')
                                                } else {
                                                    news.push('<option value="' + item.media_id + '">' + item.content.news_item[0].title + '</option>')
                                                }
                                            });
                                            $('.editor').html('<select class="form-control message">'+ news.join('') +'</select>')
                                        } else {
                                            alert(resp.msg);
                                        }
                                    }
                                });
                                break;
                        }

                        $('#edit').modal({show: true})
                    }
                })
            });

            $('.submit').on('click', function() {
                var parent = $('#add');
                var url = '/api/wechat/qrcode/create';
                if ($(this).hasClass('edit')) {
                    parent = $('#edit');
                    url = '/api/wechat/qrcode/edit/' + parent.find('.id').val();
                }

                var title = parent.find('.title').val();
                var type = parent.find('.type').val();
                var wechatId = parent.find('.wechat_id').val();
                var messageType = parent.find('.message-type').val();
                var message = parent.find('.message').val();

                if (!title || !type || !wechatId) {
                    return ;
                }

                if (!$(this).hasClass('disabled')) {
                    $(this).addClass('disabled');
                    $.ajax({
                        method: 'POST',
                        url: url,
                        data: {
                            title: title,
                            type: type,
                            wechat_id: wechatId,
                            message_type: messageType,
                            message: message
                        },
                        success: function(resp) {
                            if (resp.success) {
                                location.reload();
                            } else {
                                alert(resp.msg);
                            }
                        },
                        error: function() {
                            alert('生成失败');
                            $('.submit').removeClass('disabled')
                        }
                    })
                }
            });

            $('.delete').on('click', function() {
                var id =  $(this).data('id');
                $.ajax({
                    type: 'GET',
                    url: '/api/wechat/qrcode/delete/' + id,
                    success: function(resp) {
                        if (resp.success) {
                            location.reload();
                        } else {
                            alert(resp.msg);
                        }
                    }
                })
            });

            $('.message-type').on('change', function() {
                var type = $(this).val();
                var parent = $('.modal:visible');
                var wechatId = parent.find('.wechat_id').val();

                switch (type) {
                    case 'TEXT':
                        parent.find('.editor').html('<textarea class="form-control message" placeholder="请输入回复消息"></textarea>')
                        break;
                    case 'IMAGE':
                        parent.find('.editor').html('<input type="file" class="file"/><div class="preview"></div><input type="hidden" class="message"/>');
                        break;
                    case 'NEWS':
                        $.ajax({
                            type: 'GET',
                            url: '/api/qrcode/news/' + wechatId,
                            success: function(resp) {
                                if (resp.success) {
                                    var news = [];
                                    resp.item.forEach(function(item) {
                                        news.push('<option value="' + item.media_id + '">' + item.content.news_item[0].title + '</option>')
                                    });
                                    parent.find('.editor').html('<select class="message form-control">'+ news.join('') +'</select>')
                                } else {
                                    alert(resp.msg);
                                }
                            }
                        });
                        break;
                }
            });

            $('.modal').on('change', '.file', function() {
                var parent = $('.modal:visible');
                var file = new  FormData();
                file.append('file', this.files[0]);
                if (this.files.length) {
                    $.ajax({
                        type: 'POST',
                        url: '/api/upload',
                        data: file,
                        processData: false,
                        contentType: false,
                        success: function(resp) {
                            var resp = JSON.parse(resp);
                            if (resp) {
                                var img = '<img src="' + resp.data + '" style="max-width: 320px" />' ;
                                parent.find('.preview').html(img);
                                parent.find('.message').val(resp.data);
                                $('.file').val('')
                            } else {
                                alert(resp.msg);
                            }
                        }
                    })
                }
            });


        </script>
    @endif
</body>
</html>