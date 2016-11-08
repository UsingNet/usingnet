<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>客户插件</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            font-size: 14px;
        }
        td {
            padding: 5px;
        }
        h1, h2, h3, h4, h5 {
            margin-bottom: 10px;
        }
        li {
            line-height: 1.5;
        }


        a {
            text-decoration: none;
        }

    </style>
</head>
<body>
    @if ($customer)
        {!! \GrahamCampbell\Markdown\Facades\Markdown::convertToHtml($customer->info) !!}

        <a href="/api/user/customer?team_id={{ $customer->team->id }}">登录{{ $customer->team->name }}</a>
    @endif
</body>
</html>