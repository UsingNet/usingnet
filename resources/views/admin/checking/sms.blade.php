@extends('admin.layouts.master')

@section('content')
    @include('admin.layouts.sidebar')
    <div class="main col-md-8">
        <table class="table">
            <col width="60%">
            <col />
            <tr>
                <th>团队</th>
                <th>签名</th>
                <th>操作</th>
            </tr>
            @foreach ($sms as $item)
                <tr>
                    <td>
                        {{ $item->team->name }}
                    </td>
                    <td>
                        {{ $item->signature }}
                    </td>
                    <td>
                        @if ($item->status == 'CHECKING')
                            <a href="/checking/sms?id={{ $item->id }}">通过审核</a>
                            @endif

                        @if ($item->status == 'SUCCESS')
                                已审核
                            @endif
                    </td>
                </tr>
            @endforeach
        </table>

        {!! $sms->render() !!}
    </div>


@endsection