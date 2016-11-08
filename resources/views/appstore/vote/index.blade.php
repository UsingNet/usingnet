<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>评选活动管理</title>
    <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
    <style>
        .add {
            margin-top: 10px;
            text-align: right;
        }
        .end {
            display: inline;
            width: 60px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="add">
            <button class="btn btn-info" data-toggle="modal" data-target="#modal">添加评选</button>
        </div>

        <h1>活动列表</h1>
        <table class="table">
            <col width="10%">
            <col width="10%">
            <col width="10%">
            <col width="10%">
            <tr>
                <th>公众号</th>
                <th>活动名称</th>
                <th>参与人数</th>
                <th>投票数</th>
                <th>二维码</th>
                <th>操作</th>
            </tr>
            @foreach ($voteConfigs as $vote)
                <tr>
                    <td>{{ $vote->wechat->nick_name }}</td>
                    <td>{{ $vote->name }}</td>
                    <td>{{ $vote->users }}</td>
                    <td>{{ $vote->records }}</td>
                    <td>
                        <div>
                            <img width="120" src="{{ $vote->qrcode }}" alt="">
                        </div>
                        {{ 'https://wx.usingnet.com/appstore/vote/upload/' . $vote->app_id }}
                    </td>
                    <td>
                        <a href="/appstore/vote/setting/{{ $vote->_id }}">查看</a>
                        <a class="edit" href="javascript:;" data-id="{{ $vote->_id }}">修改</a>
                    </td>
                </tr>
            @endforeach
        </table>
    </div>

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
                            <label for="">标题颜色</label>
                            <input type="text" class="form-control title-color" name="title_color">
                        </div>
                        <div class="form-group">
                            <label for="">按钮颜色</label>
                            <input type="text" class="form-control btn-color" name="btn_color">
                        </div>

                        <div class="form-group">
                            <label for="">结束时间</label>
                            <div>
                                <input type="text" name="end" class="end form-control"> 天后停止投票
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="">扫码后推送文字 (默认为 “您成功的投了#name#一票”)</label>
                            <input type="text" name="success_txt" class="form-control success-txt"/>
                        </div>
                        <div class="form-group">
                            <label for="">按钮文字 (默认为 “我要投票”)</label>
                            <input type="text" name="btn_txt" class="form-control btn-txt">
                        </div>
                        <div class="form-group">
                            <label for="">记录文字 (默认为 “#num#位朋友支持了#name#”)</label>
                            <input type="text" name="record_txt" class="form-control record-txt"/>
                        </div>
                        <div class="form-group">
                            <label for="">公司Logo(可以为空)</label>
                            <input type="file" name="logo" id="">
                            <br/>
                            <div class="logo">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="">背景图片(可以为空)</label>
                            <input type="file" name="img" id="">
                            <br/>
                            <div class="img">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="">报名消息</label>
                            <textarea name="signup_msg" class="form-control signup-msg"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="">样式</label>
                            <textarea name="style" class="form-control style"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="">底部</label>
                            <textarea name="footer" class="form-control style"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">保存</button>
                    </div>
                </div>
            </div>
        </form>
    </div>

    <script src="/assets/js/jquery.min.js"></script>
    <script src="/assets/js/bootstrap.min.js"></script>
    <script>
        // reset
        $('.add').on('click', function() {
            $('select option:first').prop('selected', true);
            $('input').val('');
            $('textarea').val('');
            $('.modal-title').text('添加活动')
        });

        $('.form').on('submit', function() {
            $('.has-error').removeClass('has-error');
            var appId = $('.app-id').val();
            var name = $('.name').val();
            if (!appId) {
                $('.app-id').parents('.form-group').addClass('has-error');
            }
            if (!name) {
                $('.name').parents('.form-group').addClass('has-error');
            }
            if ($('.has-error').length) {
                return false;
            }
        });

        $('.edit').on('click', function() {
            var id = $(this).data('id');
            $('.modal-title').text('修改活动');
            $.ajax({
                type: 'GET',
                url: '/appstore/vote/detail/' + id,
                success: function(resp) {
                    $('.modal').modal('show');
                    $('select option[value='+ resp.app_id +']').prop('selected', true);
                    $('.name').val(resp.name);
                    $('.end').val(resp.end);
                    $('.success-txt').val(resp.success_txt);
                    $('.btn-txt').val(resp.btn_txt);
                    $('.record-txt').val(resp.record_txt);
                    $('.title-color').val(resp.title_color);
                    $('.btn-color').val(resp.btn_color);
                    $('.style').val(resp.style);
                    $('.footer').val(resp.footer);
                    $('.signup-msg').val(resp.signup_msg);

                    if (resp.img) {
                        var img = '<img width="100" src="' + resp.img +  '" />';
                        $('.img').html(img);
                    }

                    if (resp.logo) {
                        var logo = '<img width="100" src="' + resp.logo +  '" />';
                        $('.logo').html(logo);
                    }
                }
            })
        });
    </script>

</body>
</html>