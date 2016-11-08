<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>{{ $config->name }}</title>
    <link rel="stylesheet" href="/assets/css/bootstrap.min.css">
    <style>
        h1 {
            font-size: 22px;
            text-align: center;
            margin: 30px;
        }
        li {
            line-height: 2;
        }

    </style>
</head>
<body>
    <h1>{{ $config->name }}</h1>
    <div class="container">
        <table class="table">
            <tr>
                <th>团长</th>
                <th>团员</th>
            </tr>
            @foreach ($groupbuys as $groupbuy)
                <tr>
                    <td>
                        {{ $groupbuy->contact->name }}
                    </td>
                    <td>
                        <ul>
                            @foreach ($groupbuy->members as $member)
                                <li>
                                    {{ $member->contact->name }}
                                    @if ($member->payment->status === 'SUCCESS')
                                        <span class="label label-success">已支付</span>
                                    @else
                                        <span class="label label-default">未支付</span>
                                    @endif
                                </li>
                            @endforeach
                        </ul>
                    </td>
                </tr>
            @endforeach
        </table>
    </div>
</body>
</html>