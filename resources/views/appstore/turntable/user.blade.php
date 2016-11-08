<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>中奖用户</title>
    <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
</head>
<body>
    <div class="container">
        <h1>中奖用户</h1>
        <table class="table">
            <tr>
                <th>昵称</th>
                <th>手机</th>
                <th>奖品</th>
            </tr>
            @foreach($users as $user)
                @if ($user->staff)
                <tr>
                    <td>{{ $user->contact->name }}</td>
                    <td>{{ $user->contact->phone }}</td>
                    <td>{{ $user->staff->name }}</td>
                </tr>
                @endif
            @endforeach
        </table>

    </div>
</body>
</html>