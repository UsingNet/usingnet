@extends('admin.layouts.master')

@section('content')
    @include('admin.layouts.sidebar')
    <div class="main col-md-8">
        <table class="table">
            <col width="60%">
            <col />
            <tr>
                <th>团队</th>
                <th>号码</th>
            </tr>
            @foreach ($voips as $voip)
                <tr>
                    <td>{{ $voip->team->name }}</td>
                    <td>
                        @if ($voip->number)
                            {{ $voip->number }}
                        @else
                            <a class="add-voip btn btn-primary" data-id="{{ $voip->team_id }}" href="javascript:;" data-toggle="modal" data-target="#myModal">添加号码</a>
                        @endif
                    </td>
                </tr>
            @endforeach
        </table>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
        <div class="modal-dialog" role="document">
            <form class="form-horizontal" action="/checking/voip" method="post">
                <input type="hidden" name="id" value="">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title" id="myModalLabel">添加号码</h4>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" name="id" class="id">
                        <div class="form-group">
                            <label class="col-sm-2 control-label" for="">号码</label>
                            <div class="col-sm-6">
                                <input class="form-control" name="number" type="text">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">保存</button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <script>
        $('.add-voip').on('click', function () {
            console.log($(this).data('id'))
            $('.modal .id').val($(this).data('id'))
        });
    </script>


@endsection