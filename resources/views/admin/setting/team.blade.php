@extends('admin.layouts.master')

@section('content')

    @include('admin.layouts.sidebar')

    <div class="main col-md-8">
        <table class="table">
            <tr>
                <th>团队名</th>
                <th>注册时间</th>
                <th>账户余额</th>
                <th>套餐</th>
                <th>操作</th>
            </tr>
            @foreach ($teams as $team)
                <tr>
                    <td>{{ $team->name }}</td>
                    <td>{{ $team->created_at }}</td>
                    <td>{{ $team->balance }}</td>
                    <td>
                        <select name="" class="form-control">
                            @foreach ($plans as $plan)
                                <option @if ($plan->id == $team->plan_id) selected @endif  value="{{ $plan->id }}">{{ $plan->name  }}</option>
                            @endforeach
                        </select>
                    </td>
                    <td>
                        <button class="btn btn-primary btn-sm" data-id="{{ $team->id }}">保存</button>
                    </td>
                </tr>

            @endforeach
        </table>
    </div>

    <script>
        $('button').on('click', function () {
            var id = $(this).data('id');
            var planId = $(this).parents('tr').find('select').val();

            $.ajax({
                type: 'POST',
                url: '/setting/team/' + id,
                data: {plan_id: planId},
                success: function (response) {
                    if (response.code == 200) {
                        window.locatin.reload();
                    } else {
                        alert(response.msg);
                    }
                }
            });
        });
    </script>
@endsection