<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>{{ $title }}</title>
    <style>
        #wapper {
            width: 50%;
            margin: 100px auto;
            text-align: center;
            padding: 30px;
        }

        img {
            -webkit-filter: grayscale(100%);
            filter: grayscale(100%);
            width: 80px;
        }

        a {
            text-decoration: none;
            color: #888;
        }
    </style>
</head>
<body>

<div id="wapper">
    <div class="logo">
        <img src="http://im.usingnet.com/build/v2/image/bad.png" alt="">
    </div>

    <div class="content">
        <h3>{{ $title }}</h3>
        @if (isset($desc))
            <p>{{ $desc }}</p>
        @endif

        <a href="https://www.usingnet.com">优信客服</a>
    </div>
</div>

</body>
</html>