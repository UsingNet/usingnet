<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>应用中心</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <style>
        html, body, div, ul, li, img {
            margin: 0;
            padding: 0
        }
        * {
            box-sizing: border-box;
        }
        .header {
            text-align: center;
        }
        .header h1 {
            font-size: 20px;
            margin-bottom: 20px;
            color: #555;
        }
        .items {
            padding: 20px;
        }
        ul {
            list-style-type: none;
        }
        li {
            width: 49%;
            display: inline-block;
            padding: 20px;
            text-align: center;
        }
        li a {
            font-size: 14px;;
            color: #555;
            text-decoration: none;
        }
        li img{
            width: 100%;
            height: 100%;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ $team->name }}的应用</h1>
        </div>
        <div class="items">
            <ul>
            @foreach ($apps as $app)
                <li>
                    <a href="{{ $app->mobile_url }}">
                        <div class="hd">
                            <img src="{{ $app->img }}" alt="{{ $app->name }}">
                        </div>
                        <div class="md">
                            <h3>{{ $app->name }}</h3>
                        </div>
                    </a>
                </li>
                @endforeach
            </ul>
        </div>
    </div>
</body>
</html>