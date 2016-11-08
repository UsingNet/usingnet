<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>{{ $payConfig->name }}</title>
    <link rel="stylesheet" href="/assets/css/bootstrap.min.css">
    <style>
        .title {
            font-size: 20px;
            text-align: center;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="title">
            {{ $payConfig->name }} 的账单
        </div>

        <table class="table">
            <tr>
                <th>用户</th>
                <th>金额</th>
                <th>时间</th>
            </tr>
            @foreach ($pays as $pay)
                <tr>
                    <td>{{ $pay->contact->name }}</td>
                    <td>{{ $pay->payment->fee}}</td>
                    <td>{{ $pay->created_at }}</td>
                </tr>
            @endforeach
        </table>
    </div>
</body>
</html>