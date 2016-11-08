<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>有赞插件</title>
    <link rel="stylesheet" href="//libs.cdnjs.net/pure/0.4.2/pure-min.css">
    <script src="//libs.cdnjs.net/zepto/1.1.3/zepto.min.js"></script>
    <style>
        * {
            margin: 0;padding:0;
        }
        html, body {
            font-size: 12px;
            font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;;
        }
        a {
            text-decoration: none;
            color: #2db7f5;
        }
        ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        #wapper {
            width: 280px;
            position: relative;
            height: 500px;
        }

        #order-list .item {
            overflow: hidden;
            padding: 10px 0px;
            border-bottom: 1px solid #f3f3f3;
        }
        #order-list img {
            width: 60px;
            float: left;
            margin-right: 10px;;
        }
        #order-list .hd , #order-list .md, #order-list .fd{
            position: relative;
        }
        #order-list .md {
            overflow: hidden;
        }
        h3 {
            margin-bottom: 5px;;
        }
        .desc {
            color: #555;
        }
        .price {
            color: #ff3300;
        }
        .action {
            position: absolute;
            right: 0;
            bottom: 0;
            z-index: 1000;
            background: #FFF;
        }
        .button-list li{
            display: inline-block;
        }
        .dialog{
            position: absolute;
            width: 260px;
            box-sizing: border-box;
            padding: 10px;
            margin: 5px;
            border: 1px solid #f1f1f1;
            box-shadow: .5px .5px .5px 1px rgba(0, 0, 0, .1);
            background: #fff;
            z-index: 100000;
            top: 30%;
            display: none;
        }
        .dialog textarea {
            width: 100%;
            min-height: 80px;
        }
        .dialog .close {
            font-size: 20px;
            position: absolute;
            right: 10px;
            cursor: pointer;
        }

        #memo .button {
            text-align: center;
        }
        .layer {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(255, 255, 255, .3);
            z-index: 10000;
            display: none;
        }

    </style>
</head>
<body>

<div id="wapper">
        <ul id="order-list">
            <div class="layer"></div>
            @foreach ($orders as $order)
            <li class="item">
                <div class="hd">
                    <label for="">订单号</label>
                    {{ $order['tid'] }}

                </div>
                <div class="md">
                    <div class="img">
                        <img src="{{ $order['pic_thumb_path'] }}" alt="">
                    </div>
                    <div class="info">
                        <h3>{{ $order['title'] }}</h3>
                        <div class="desc">
                            <div class="price">
                                ￥<span>{{ $order['price'] }}</span>
                                ({{ $order['status_str'] }})
                            </div>

                            <div class="address">
                                {{ $order['receiver_state'] }}
                                {{ $order['receiver_city'] }}
                                {{ $order['receiver_district'] }}
                                {{ $order['receiver_address'] }}
                                {{ $order['receiver_mobile'] }}
                            </div>

                            <div class="action">
                                <ul class="button-list">
                                    @foreach ($order['button_list'] as $button)
                                        @if (in_array($button['tool_type'], ['goto_native:trade_memo', 'goto_native:trade_close']))
                                            <li>
                                                @if ($button['tool_type'] === 'goto_native:trade_close')
                                                    <a data-id="{{ $order['tid'] }}" href="/api/plugin/youzan/close/{{ $contact['id'] }}?tid={{ $order['tid'] }}" class="{{ $button['tool_type'] }}">
                                                        {{ $button['tool_title'] }}
                                                    </a>
                                                @else
                                                    <a data-id="{{ $order['tid'] }}" href="javascript:;" class="{{ $button['tool_type'] }}">
                                                        {{ $button['tool_title'] }}
                                                    </a>
                                                @endif
                                            </li>
                                        @endif
                                    @endforeach
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>
                <div class="fd">
                    <ul class="meno">
                    @if (!empty($order['trade_memo']))
                        <li>
                            <label for="">卖家备注: </label>
                            <span class="memo-text">
                                {{ $order['trade_memo'] }}
                            </span>
                        </li>
                    @endif
                    @if (!empty($order['buyer_message']))
                        <li>
                            <label for="">买家留言: </label>
                            {{ $order['buyer_message'] }}
                        </li>
                    @endif
                    </ul>
                </div>
            </li>
            @endforeach
        </ul>

        <div id="memo" class="dialog">
            <div class="main">
                <div class="hd">
                    卖家备注
                    <span class="close">×</span>
                </div>
                <div class="md">
                    <form class="pure-form" action="/api/plugin/youzan/memo" method="post">
                        <input class="id" type="hidden" name="id" value="">
                        <input type="hidden" name="contact_id" value="{{ $contact['id'] }}">
                        <fieldset class="pure-group">
                            <textarea class="" name="content" placeholder="添加备注..."></textarea>
                        </fieldset>
                        <div class="button">
                        <button type="submit" class="pure-button pure-input-1-2 pure-button-primary">保存</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
</div>

        <script>
            var dialog = $('.dialog');
            var layer = $('.layer');

            // 备注
            var memos = document.getElementsByClassName('goto_native:trade_memo');
            for (var i = 0; i < memos.length; i++) {
                memos[i].onclick = function () {
                    var top = $(this).offset().top;
                    dialog.css({top: top});
                    var memoText = $(this).parents('.item').find('.memo-text').text();
                    dialog.show();
                    dialog.find('textarea').val($.trim(memoText)).focus();
                    dialog.find('.id').val($(this).data('id'));
                    layer.show();
                }
            }
            $('.close').on('click', function () {
                dialog.hide();
                layer.hide();
            })
        </script>
</body>
</html>