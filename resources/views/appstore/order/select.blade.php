<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>订单查询</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
    <style>
        html, body, div, ul, li, .container, h1 {
            padding: 0;
            margin: 0;
        }
        .container {
            max-width: 640px;
            margin: 0 auto;
        }
        .search {
            padding: 40px 20px;
            background: #FFF;
            border-bottom: 1px solid #EEE;
        }
        .submit {
            text-align: center;
            margin-top: 20px;
        }
        .submit .btn {
            margin-top: 10px;
            width: 100%;
        }
        .empty {
            text-align: center;
            font-size: 18px;
            color: #888;
            margin-top: 50px;
        }
        .items {
            padding: 20px;
        }
        .items .view {
            float: right;
            line-height: 2;
        }
        .items li {
            overflow: hidden;
        }
        .status h1 {
            font-size: 20px;
            margin-bottom: 20px;
        }
        .result {
            background-color: #FFF;
            padding: 20px;
        }
        .result li {
            line-height: 2;
        }
        .timeline {
            list-style-type: none;
            padding: 0;
            position: relative;
            overflow: hidden;
            width: 100%;
        }
        .timeline li {
            display: block;
            overflow: hidden;
        }
        .timeline .date, .timeline .point, .timeline .content {
            float: left;
            line-height: 1.5;
            color: #666;
        }
        .timeline .date {
            margin-right: 10px;
            font-size: 13px;
        }
        .timeline .point {
            width: 12px;
            height: 12px;;
            border: 2px solid #CCC;
            border-radius: 12px;
            margin-top: 4px;
            position: relative;
            z-index: 2;
            background: #FFF;
        }
        .timeline .content {
            width: 90%;
            padding-bottom: 10px;
            margin-bottom: 10px;
            margin-left: 20px;
            border-bottom: 1px solid #CCC;
        }
        @media (max-width: 768px) {
            .timeline .content {
                width: 60%;
            }
        }
        .active .date {
            color: #333;
        }
        .active .point {
            border-color: #5bc0de;
        }
        .active .content {
            color: #5bc0de;
        }
        .active .content .time {
            color: #666;
        }
        .timeline .line {
            position: absolute;
            width: 1px;
            background-color: #CCC;
            left: 82.4px;
            top: 4px;
            bottom: 10px;
        }

        .form-group .q {
            width: 78%;
            display: inline-block;
        }
        .form-group .scan {
            width: 20%;
            display: inline-block;
        }
        .margin {
            background: #f3f3f3;
            height: 12px;
        }

        .init .margin{
           display: none;
        }

        .init .search {
            margin-top: 25%;
            border-bottom: none;
        }

        .records {
            padding: 30px;
            display: none;
        }
        .records ul {
            margin-top: 10px;
            list-style-type: none;
            padding-left: 20px;
            line-height: 2;
        }
    </style>
</head>
<body>
    <div class="container @if (!$q) init @endif">
        <div class="search">
            <form action="" method="GET">
                <div class="form-group">
                    <input type="text" class="form-control q"  name="q" placeholder="订单号 / 手机号码" value="{{ $q }}">
                    <button class="btn btn-default scan" type="button">扫码</button>
                </div>
                <div class="submit">
                    <button class="btn btn-info">搜索</button>
                </div>
            </form>
        </div>
        @if (!$q)
            <div class="records">
                查询历史
                <ul>
                </ul>
            </div>
        @endif

        <div class="margin">
        </div>
        @if ($q)
            <div class="result">
                @if ($orders->isEmpty())
                    <p class="empty">未查到任何订单</p>
                @else
                     @if ($orders->count() > 1)
                        <ol class="items">
                        @foreach($orders as $order)
                            <li>
                                {{ $order->title }}
                                <a class="view" href="?q={{ $order->number }}">查看</a>
                            </li>
                            @endforeach
                        </ol>
                    @else
                        <div class="status">
                            <h1>{{ $orders[0]->title }}</h1>
                            <ul class="timeline">
                                <li class="line"></li>
                                @foreach ($orders[0]->status as $i => $status)
                                    <li @if ($i === 0) class="active" @endif>
                                        <div class="date">
                                            {{ date('Y-m-d', $status['time']) }}
                                        </div>
                                        <div class="point"></div>
                                        <div class="content">
                                            {{ $status['status'] }}
                                            <div class="time">{{ date('H:i:s', $status['time']) }}</div>
                                        </div>
                                    </li>
                                @endforeach
                            </ul>
                        </div>
                    @endif
                @endif
            </div>
        @endif
    </div>

    <script src="/assets/js/jquery.min.js"></script>
    <script src="/assets/js/bootstrap.min.js"></script>
    <script src="/assets/js/jweixin-1.0.js"></script>
    <script>
        if ($('.records').length) {
            var localStorageKey = 'usingnet_plugin_select_records';
            var records = localStorage.getItem(localStorageKey);
            if (!records) {
                records = [];
            } else {
                records = JSON.parse(records);
            }
            if (records.length) {
                $('.records').show();
                var lis = [];
                records.forEach(function(h) {
                    lis.push('<li><a href="?q='+ h +'">' + h + '</li>');
                });
                $('.records ul').html(lis.join(''));
            }
        }

        $('.search .btn').on('click', function () {
            var q = $('.search .q').val()
            if (!q) {
                $('.search .q').focus();
                return false;
            }
            records.unshift(q);
            console.log(records)
            var res = records.splice(0, 10);
            localStorage.setItem(localStorageKey, JSON.stringify(res));
        });
        wx.config({!! json_encode($config) !!});
        $('.scan').on('click', function() {
            wx.scanQRCode({
                needResult: 1,
                scanType: ["qrCode","barCode"],
                success: function (res) {
                    var result = res.resultStr;
                    var code = result.replace(/^.*?,/, '');
                    location.href = '?q=' + code + '&tid={{ $tid }}';
                }
            });
        });
    </script>
</body>
</html>
