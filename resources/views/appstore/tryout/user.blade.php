<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>试用活动数据</title>
    <link rel="stylesheet" href="/assets/css/bootstrap.min.css">
</head>
<body>
    <div class="container">
    <h1>试用活动</h1>
    <table class="table">
        <tr>
            <th>商户</th>
            <th>姓名</th>
            <th>手机</th>
            <th>支付</th>
        </tr>
        @foreach ($tryouts as $tryout)
            <tr>
                <td>{{ $tryout->business }}</td>
                <td>{{ $tryout->name }}</td>
                <td>{{ $tryout->phone }}</td>
                <td>{{ $tryout->payed ? '已支付' : '未支付'}}</td>
            </tr>
        @endforeach
    </table>

    {!! $tryouts->render() !!}
    </div>
</body>
</html>