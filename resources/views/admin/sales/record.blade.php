@extends('admin.layouts.master')

@section('content')
    @include('admin.layouts.sidebar')

    <div class="main col-md-8">
        <table class="table">
            <tr>
                <th>销售员</th>
                <th>客户</th>
                <th>费用</th>
            </tr>

            @foreach ($recods as $recod)
            <tr>
                <td>{{ $recod->seller->name }}</td>
                <td>{{ $recod->user->team->name }}</td>
                <td>{{ $recod->meony }}</td>
            </tr>
            @endforeach
        </table>
    </div>

@endsection