@extends('admin.layouts.master')

@section('content')
    @include('admin.layouts.sidebar')

    <div class="main col-md-8">
        <div class="add text-right">
            <button class="btn btn-primary" data-toggle="modal" data-target="#myModal" data-toggle="modal" data-target="#myModal">添加</button>
        </div>
        <br/>
        <table class="table">
            <col width="40%">
            <col width="30%">
            <tr>
                <th>套餐名</th>
                <th>费用</th>
                <th>别名</th>
                <th>操作</th>
            </tr>
            @foreach ($plans as $plan)
                <tr>
                    <td>{{ $plan->name }}</td>
                    <td>{{ $plan->price }}</td>
                    <td>{{ $plan->slug }}</td>
                    <td>
                        <a href="javascript:;" class="btn btn-default btn-sm edit" data-id="{{ $plan->id }}">修改</a>
                    </td>
                </tr>
            @endforeach
        </table>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
        <div class="modal-dialog" role="document">
            <form class="form-horizontal" action="/setting/submit" method="post">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title" id="myModalLabel">添加套餐</h4>
                </div>
                <div class="modal-body">
                        <input type="hidden" name="id" >
                        <div class="form-group">
                            <label class="col-sm-2 control-label" for="">套餐名</label>
                            <div class="col-sm-6">
                                <input class="form-control" name="name" type="text">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label" for="">别名</label>
                            <div class="col-sm-6">
                                <input class="form-control" name="slug" type="text">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label" for="">简介</label>
                            <div class="col-sm-6">
                                <input class="form-control" name="desc" type="text">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label" for="">适用</label>
                            <div class="col-sm-6">
                                <input class="form-control" name="fit_for" type="text">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="col-sm-2 control-label" for="">颜色</label>
                            <div class="col-sm-3">
                                <input class="form-control" name="color" type="text">
                            </div>
                         </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label" for="">资费</label>
                            <div class="col-sm-3">
                                <input class="form-control" name="price" type="text">
                            </div>
                            <div class="help-block col-sm-4">
                                每座席 1 年
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label" for="">座席数</label>
                            <div class="col-sm-3">
                                <input class="form-control" name="agent_num" type="text">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label" for="">用户数</label>
                            <div class="col-sm-3">
                                <input class="form-control" name="user_num" type="text">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label" for="">排序</label>
                            <div class="col-sm-3">
                                <input class="form-control" type="text" name="order">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="" class="col-sm-2  control-label">说明</label>
                            <div class="col-sm-7 ">
                                <textarea class="form-control desc" name="desc"></textarea>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="col-sm-2 control-label">功能</label>
                            <div class="col-sm-7">
                                <textarea class="form-control allows" rows="10" name="allows"></textarea>
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
        $('.edit').on('click', function () {
            var id = $(this).data('id')
            $.ajax({
                type: 'GET',
                url: '/setting/show/' + id,
                success: function (response) {
                    if (response.code == 200) {
                        var data = response.data;
                        console.log(data)
                        $('#myModal .modal-title').text('修改套餐')
                        $('#myModal input').each(function () {
                            this.value = data[this.name]
                        });
                        $('#myModal .desc').val(data['desc']);
                        $('#myModal .allows').val(data['allows']);
                        $('.add button').trigger('click')
                    } else {
                        alert(response.msg)
                    }
                }
            })
        });

        $('.delete').on('click', function () {
            var id = $(this).data('id')
            $.ajax({
                type: 'POST',
                url: '/setting/delete/' + id,
                success: function (response) {
                    if (response.code == 200) {
                        window.location.reload()
                    } else {
                        alert(response.msg)
                    }
                }
            })
        });

        $('#myModal').on('hide.bs.modal', function () {
            window.location.reload();
        });

    </script>

@endsection