<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>查看相册</title>
    <link rel="stylesheet" href="/assets/css/bootstrap.min.css">
    <style>
        .title {
            font-size: 20px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="title">
            查看相册
        </div>
        <table class="table">
            <col width="30%">
            <tr>
                <th>用户</th>
                <th>二维码</th>
            </tr>
            @foreach ($albums as $album)
                <tr>
                    <td>
                        {{ $album->contact->name }}
                    </td>
                    <td>
                        <div>
                            <img src="{{ $album->qrcode }}" width="100"/>
                        </div>
                        https://wx.usingnet.com/appstore/photo/show/{{ $album->_id }}

                    </td>
                </tr>
            @endforeach
        </table>

        {!! $albums->render() !!}
    </div>
</body>
</html>