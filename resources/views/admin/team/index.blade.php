@extends('admin.layouts.master')

@section('content')

    <div class="main col-md-12">
        <table class="table">
            <col width="10%">
            <col width="10%">
            <col width="40%">
            <col width="15%">
            <tr>
                <th>团队名</th>
                <th>联系方式</th>
                <th>余额</th>
                <th>套餐</th>
                <th>时间</th>
            </tr>
            @foreach ($teams as $team)
                <tr>
                    <td>{{ $team->name }}</td>
                    <td>
                        @if ($team->user)
                            {{ $team->user->email }}
                            {{ $team->user->phone }}
                        @endif
                    </td>
                    <td>{{ $team->balance }}</td>

                    <td>
                        @if ($team->plan)
                            {{ $team->plan->name }}
                        @endif
                    </td>
                    <td>
                        {{ $team->created_at }}
                    </td>
                </tr>
            @endforeach
        </table>
        {!! $teams->render() !!}
    </div>
@endsection
