@extends('admin.layouts.master')

@section('content')
    @include('admin.layouts.sidebar')

    <div class="main col-md-8">
        <table class="table">
            <col width="15%">
            <col width="25%">
            <col width="40%">
            <tr>
                <th>管理员</th>
                <th>操作</th>
                <th>备注</th>
                <th>时间</th>
            </tr>
            @foreach ($adminLogs as $log)
                <tr>
                    <td>{{ $log->admin->name }}</td>
                    <td>{{ $log->action }}</td>
                    <td>{{ $log->remark }}</td>
                    <td>{{ $log->created_at }}</td>
                </tr>
            @endforeach
        </table>

        {!! $adminLogs->render() !!}
    </div>
@endsection
