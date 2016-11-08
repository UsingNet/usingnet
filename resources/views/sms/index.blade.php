<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>短信模板审核</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
    <style>
        html, body, a, div, ul, li, h1, p {
            margin: 0;
            padding: 0;
        }
        body {
            font-size: 14px;
            font-family: Arial;
        }
        h1 {
            font-size: 20px;
            text-align: center;
            padding: 20px;
        }
        a {
            text-decoration: none;
        }
        .medias {
            margin: 0;
            padding: 0;
            list-style-type: none;
        }
        .medias .media {
            margin-bottom: 15px;
            width: 90%;
            margin: 10px auto;
            background: #fafafa;
            padding: 10px;
        }
        .content {
            font-size: 16px;
            margin-top: 10px;
            margin-bottom: 10px;
        }

        .action {
            width: 80%;
            margin: 10px auto;
        }

        .action a{
            color: #FFF;
            float: left;
            line-height: 30px;
            display: block;
            height: 100%;
            width: 40%;
            text-align: center;
        }
        .resolve {
            background: #5cb85c;
            margin-right: 20%;
        }
        .reject {
            background: #d9534f;
        }
        .tips {
            position: absolute;
            left: 0;
            right: 0;
            margin: 0 auto;
            width: 200px;
            color: #fff;
            text-align: center;
            font-size: 12px;;
            background: #5cb85c;
            padding: 3px;
            top: -100px;
        }
        .empty {
            text-align: center;
            font-size: 18px;;
            margin-top: 100px;
            padding: 10px;
            color: #555;
        }
    </style>
</head>
<body>
    <section>
        <h1>youxin123</h1>
        <div class="tips">
            操作成功
        </div>

        <div class="modal" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
            <div class="modal-dialog" role="document">
                <input type="hidden" name="id" value="">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title" id="myModalLabel">填写拒绝原因</h4>
                    </div>
                    <div class="modal-body">
                        <textarea class="form-control" name="content"></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary submit">提交</button>
                    </div>
                </div>
            </div>
        </div>

        @if ($medias->isEmpty())
            <div class="empty">
                没有要审核的模板了
            </div>
        @endif

        <ul class="medias">
            @foreach($medias as $media)
                <li class="media">
                    <div class="hd">
                        <div class="content">
                            {{ $media->content  }}
                            <span class="td hide">回复TD退订</span>
                        </div>
                        <div class="type">
                            <label>
                                <input type="radio" name="remark-{{ $media->id }}" value="notice" checked="checked"> 通知短信
                            </label>
                            <label>
                                <input type="radio" name="remark-{{ $media->id }}" value="market"> 营销短信
                            </label>
                        </div>
                    </div>

                    <div class="action">
                        <a href="javascript:;" class="resolve action" data-id="{{ $media->id }}">通过</a>
                        <a href="javascript:;" class="reject action" data-toggle="modal" data-target="#myModal" data-id="{{ $media->id }}">拒绝</a>
                    </div>
                </li>
            @endforeach
        </ul>
    </section>


    <script src="/assets/js/jquery.min.js"></script>
    <script src="/assets/js/bootstrap.min.js"></script>
    <script>
        var api = '//' + location.host + '/api/sms/check?_rand=' + Math.random();

        $('input[type=radio]').on('click', function() {
            var parent = $(this).parents('li');
            var remark = parent.find('input:checked').val();
            if (remark == 'market') {
                parent.find('.td').removeClass('hide')
            } else {
                parent.find('.td').addClass('hide')
            }
        });

        $('.resolve').on('click', function () {
            var id = $(this).data('id');
            var remark = $(this).parents('li').find('input:checked').val();
            $.ajax({
                url: api,
                data: {id: id, action: 'resolve', remark: remark},
                method: 'post',
                success: function() {
                    $('.tips').animate({
                        top: 50
                    }, 500, function () {
                        location.href = api;
                    });
                }
            });
        });

        $('.modal .submit').on('click', function () {
            var id = $('.modal [name=id]').val();
            var content = $('.modal textarea').val();
            if (!content) {
                return ;
            }
            $.ajax({
                url: api,
                data: {id: id, action: 'reject', fail_message: content},
                method: 'post',
                success: function () {
                    location.href = api;
                }
            });
        });

        $('.reject').on('click', function () {
            $('.modal [name=id]').val($(this).data('id'));
        });
    </script>
</body>
</html>