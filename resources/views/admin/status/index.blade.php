@extends('admin.layouts.master')

@section('content')
    <div class="main col-md-12">
        <table class="table">
            <col width="30%">
            <col width="35%">
            <col width="30%">
            <tr>
                <th>链接名</th>
                <th>Token</th>
                <th>时间</th>
            </tr>
            @foreach ($lists['listeners'] as $list)
                <tr>
                    <td>
                        @if (isset($list['team']['name']))
                            {{ $list['team']['name'] }} -
                        @endif
                        {{ $list['name'] }}
                    </td>
                    <td>{{ $list['token'] }}</td>
                    <td>{{ $list['token_created_at'] }}</td>
                </tr>
            @endforeach
        </table>
    </div>

    <div class="main col-md-12">
        <table class="table">
            <col width="20%">
            <col width="10%">
            <col width="20%">
            <col width="15%">
            <tr>
                <th>总数</th>
                <th colspan="4">{{ count($lists['im']) }}</th>
            </tr>
            <tr>
                <th>链接名</th>
                <th>连接数</th>
                <th>索引</th>
                <th>Token</th>
                <th>时间</th>
            </tr>
            @foreach ($lists['im'] as $list)
                <tr>
                    <td>
                        @if (isset($list['me']['role']))
                            <label for="" class="label label-danger">客服</label>
                        @else
                            <label for="" class="label label-success">访客</label>
                        @endif

                        @if (isset($list['me']['team']['name']))
                            {{ $list['me']['team']['name'] }} -
                            @endif

                        {{ $list['me']['name'] }}
                    </td>
                    <td>{{ $list['count'] }}</td>
                    <td>
                        @foreach ($list['index'] as $k => $v)
                            <ul>
                            <li><h3>{{ $k }}</h3></li>
                            @foreach ($list['index'][$k] as $item)
                                <li>{{ $item }}</li>
                            @endforeach
                            </ul>
                        @endforeach
                    </td>
                    <td>{{ $list['me']['token'] }}</td>
                    <td>{{ $list['me']['token_created_at'] }}</td>
                </tr>
            @endforeach
        </table>
    </div>
@endsection
