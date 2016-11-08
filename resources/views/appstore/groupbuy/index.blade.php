<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>团购</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial;
            font-size: 14px;
            color: #243743;
        }
        h1 {
            padding: 20px;
            text-align: center;
            font-size: 20px;
        }
        ul {
            list-style-type: none;
        }
        a {
            text-decoration: none;
            color: #00c07f;
        }
        .add {
            width: 70%;
            margin: 50px auto;
            text-align: center;
        }
        .add a {
            display: inline-block;
            text-decoration: none;
            background: #00c07f;
            color: #FFF;
            width: 100%;
            padding: 10px 0px;
            border-radius: 3px;
        }
        .lists {
            width: 90%;
            margin: 0 auto;
        }
        .lists .item {
            margin-top: 20px;
            margin-bottom: 20px;
            padding-bottom: 20px;
            position: relative;
            overflow: hidden;
            border-bottom: 1px dotted #eee;
        }
        .lists .item .img {
            width: 50px;
            height: 50px;
            float: left;
            margin-right: 10px;
        }
        .lists .item .img img {
            width: 100%;
            height: 100%;
            border-radius: 100%;
        }
        .lists .item .title {
            margin-bottom: 10px;
        }
        .lists .item .name {
            font-size: 16px;
        }
        .lists .item .info {
            float: left;
        }
        .lists .item .member {
            margin-bottom: 5px;
        }
        .lists .item .btn {
            position: absolute;
            width: 80px;
            height: 30px;
            line-height: 30px;
            right: 0;
            bottom: 20px;
            text-align: center;
            border-radius: 3px;
            border: 1px solid;
        }
        .join {
            color: #FFF;
            background-color: #00c07f;
        }
        .expired {
            color: #666;
            border-color: #888;
        }
        .layer {
            display: none;
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            rigth: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, .3);
            z-index: 1;
        }
        .modal {
            display: none;
            position: absolute;
            width: 80%;
            height: 260px;
            left: 0; right: 0; top: 0; bottom: 0;
            margin: auto;
            z-index: 3;
            background: #FFF;
            padding: 15px;
            box-shadow: 0 0 8px rgba(0, 0, 0, .3);
        }
        .modal .close {
            position: absolute;
            text-align: center;
            top: -10px;
            right: -10px;
            width: 40px;
            height: 40px;
            font-size: 24px;
            line-height: 40px;
            background: #FFF;
            border-radius: 40px;
        }
        .modal .group {
            margin-top: 15px;
            margin-bottom: 15px;
        }
        .modal .title {
            font-size: 16px;
        }
        .modal label {
            display: block;
            margin-bottom: 5px;
        }
        .modal input {
            border: 1px solid #555;
            outline: none;
            width: 100%;
            padding: 8px;
        }
        .modal input:focus {
            border-color: #00c07f;
        }
        .modal .submit {
            text-align: right;
        }
        .modal button {
            border: none;
            background: #00c07f;
            color: #FFF;
            font-family: inherit;
            padding: 8px 12px;
            border-radius: 3px;
            outline: none;
        }
        .error-tips {
            margin-top: 10px;
            text-align: center;
            color: #cd5554;
            display: none;
        }
        .has-error input {
            border-color: #cd5554;
        }
    </style>
</head>
<body data-id="{{ $groupbuyConfig->_id }}">
    <div class="wrap">
        <h1>
            {{ $groupbuyConfig->name }}
        </h1>

        <div class="add">
            <a href="javascript:;">发起团购</a>
        </div>

        <ul class="lists">
            @foreach ($groups as $group)
                <li class="item">
                    <div class="img">
                        <img src="{{ $group->contact->img }}" alt="">
                    </div>

                    <div class="info">
                        <div class="title">
                            <span class="user">{{ $group->contact->name }}</span>
                            发起的
                        <span class="name">
                        </span>
                        </div>
                        <div class="member">
                            @if ($group->member)
                            {{ $group->member }} 人参与
                            @else
                                还没有人加入
                            @endif
                        </div>
                        <div class="date">
                            @if ($group->expire > 0)
                                剩余 {{ ceil($group->expire / 24 / 3600) }} 天
                            @else
                                已过期
                            @endif
                        </div>
                    </div>
                    @if ($group->expire > 0)
                        @if ($group->joined)
                            <a class="btn" href="/appstore/groupbuy/member/{{ $groupbuyConfig->id }}?id={{ $group->id }}">点击进入</a>
                        @else
                        <div class="btn join" data-id="{{ $group->_id }}">
                            我要参加
                        </div>
                        @endif
                    @else
                        <div class="btn expired">
                            已过期
                        </div>
                    @endif
                </li>
            @endforeach
        </ul>


        <div class="modal">
            <input type="hidden" name="id" class="id">
            <div class="close">&times;</div>
            <div class="title">
                填写信息
            </div>
            <div class="error-tips">
            </div>
            <div class="group">
                <label for="">姓名</label>
                <input type="text" class="name">
            </div>
            <div class="group">
                <label for="">手机</label>
                <input type="number" class="phone">
            </div>
            <div class="submit">
                <button>提交</button>
            </div>
        </div>

        <div class="layer">
        </div>
    </div>

    <script src="/assets/js/zepto.min.js"></script>
    <script>
        $(function() {
            $('.modal .close, .layer').on('click', function() {
                $('.layer').hide();
                $('.modal').hide();
            });

            $('.add, .join').on('click', function() {
                var id = $(this).data('id');
                $('.modal .id').val(id);
                $('.layer').show();
                $('.modal').show();
                $('.modal').data('type', this.className);
            });

            $('.modal .submit').on('click', function() {
                if ($(this).hasClass('disabled')) return ;
                $(this).addClass('disabled');
                $('.has-error').removeClass('has-error');
                $('.error-tips').hide();

                var id = $('.id').val();
                var configId = $('body').data('id');
                var type = $('.modal').data('type');
                var phone = $('.modal .phone').val();
                var name = $('.modal .name').val();

                if (!phone) {
                    $('.modal .phone').parents('.group').addClass('has-error');
                }
                if (!name) {
                    $('.modal .name').parents('.group').addClass('has-error');
                }
                if ($('.has-error').length) {
                   return ;
                }

                if (type === 'add') {
                    var url = '/appstore/groupbuy/add/' + configId;
                } else {
                    var url = '/appstore/groupbuy/join/' + configId;
                }

                $.ajax({
                    type: 'POST',
                    url: url,
                    data: {id: id, name: name, phone: phone},
                    success: function(resp) {
                        $('.disabled').removeClass('disabled');
                        if (resp.success) {
                            if (type == 'add') {
                                id = resp.data._id
                            }
                            location.href = '/appstore/groupbuy/member/' + configId + '?id=' + id;
                        } else {
                            $('.error-tips').show().text(resp.msg);
                        }
                    }
                });
            });
        });
    </script>
</body>
</html>