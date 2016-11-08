@extends('admin.layouts.master')

@section('content')
    @include('admin.layouts.sidebar')
    <div class="main col-md-9">
        <table class="table">
            <col width="20%">
            <col width="40%">
            <tr>
                <th>时间</th>
                <th>团队名</th>
                <th>状态</th>
                <th>操作</th>
            </tr>
        </table>
    </div>
@endsection