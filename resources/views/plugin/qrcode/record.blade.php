<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>{{ $qrcode->title }} 的数据</title>
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
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>{{ $qrcode->title }} 的数据</h1>
    </div>
    <table class="table">
        <tr>
            <th>用户</th>
            <th>类型</th>
            <th>日期</th>
        </tr>
        @foreach ($records as $record)
            <tr>
                <td>{{ $record->contact->name }}</td>
                <td>{{ $record->type === \App\Models\Qrcode\Record::TYPE_SCAN ? '扫描' : '关注' }}</td>
                <td>{{ $record->created_at }}</td>
            </tr>
        @endforeach
    </table>

    <div class="text-center">
        {!! $records->appends(['type' => $type])->render() !!}
    </div>
</div>

</body>
</html>