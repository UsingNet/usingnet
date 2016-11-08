<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>{{ $voteConfig->name  }}</title>
    <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
</head>
<body>
    <div class="container">
        <h1>
            参与 {{ $voteConfig->name }} 活动的用户
        </h1>
        <table class="table">
            <tr>
                <th>
                    用户名
                </th>
                <th>
                    照片
                </th>
                <th>
                    投票数
                </th>
                <th>地址</th>
                <th>参与时间</th>
                <th>
                    操作
                </th>
            </tr>
            @foreach ($votes as $vote)
                <tr>
                    <td>{{ $vote->contact->name }}</td>
                    <td><img src="{{ $vote->img }}"  width="100"></td>
                    <td>{{ $vote->num }}</td>
                    <td>
                        https://wx.usingnet.com/appstore/vote/show/{{ $vote->_id }}
                    </td>
                    <td>{{ $vote->created_at }}</td>
                    <td>
                        @if ($vote->disabled)
                            <a href="/appstore/vote/disable/{{ $vote->_id }}?action=enable">启用</a>
                        @else
                            <a href="/appstore/vote/disable/{{ $vote->_id }}?action=disable">禁用</a>
                        @endif
                    </td>
                </tr>
            @endforeach
        </table>

        {!! $votes->render() !!}
    </div>
</body>
</html>