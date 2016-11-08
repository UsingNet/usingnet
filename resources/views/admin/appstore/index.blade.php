@extends('admin.layouts.master')
@section('content')
    <div class="main col-md-12">
        <div class="add text-right">
            <button class="btn btn-primary" data-toggle="modal" data-target="#myModal" data-toggle="modal" data-target="#myModal">添加</button>
        </div>
        <br/>
        <table class="table">
            <col width="80%" />
            <col />
            <tr>
                <th>名字</th>
                <th>操作</th>
            </tr>
            @foreach ($appstores as $appstore)
                <tr>
                    <td>{{ $appstore->name }}</td>
                    <td>
                        <a href="#" data-id="{{ $appstore->id }}" class="edit"  data-toggle="modal" data-target="#myModal" data-toggle="modal" data-target="#myModal">编辑</a>
                        <a href="/appstore/delete/{{ $appstore->id }}">删除</a>
                    </td>
                </tr>
                @endforeach
        </table>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
        <div class="modal-dialog" role="document">
            <form class="form-horizontal" action="/appstore" method="post" enctype="multipart/form-data">
                <input type="hidden" name="id">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title" id="myModalLabel">添加应用</h4>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="col-md-3 control-label">应用名称</label>
                            <div class="col-md-8">
                                <input class="form-control" name="name" type="text">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-md-3 control-label">介绍</label>
                            <div class="col-md-8">
                                <textarea class="form-control" name="desc"></textarea>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-md-3 control-label">图片</label>
                            <div class="col-md-8">
                                <input type="file" name="img">
                                <br/>
                                <img width="100" src="" alt="">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-md-3 control-label">URL</label>
                            <div class="col-md-8">
                                <input class="form-control" name="url" type="text">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-md-3 control-label">MOBILE URL</label>
                            <div class="col-md-8">
                                <input class="form-control" name="mobile_url" type="text">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-md-3 control-label">Token</label>
                            <div class="col-md-8">
                                <input class="form-control" name="token" type="text">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-md-3 control-label">Key</label>
                            <div class="col-md-8">
                                <input class="form-control" name="key" type="text">
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
    <!-- Modal -->

    <script>
        $('.add').on('click', function () {
            $('.modal input').val('');
            $('.modal textarea').val('');
            $('.modal img').attr('src', '')
        });
        $('.edit').on('click', function () {
            var id = $(this).data('id');
            $.ajax({
                type: 'GET',
                url: '/appstore/show/' + id,
                success: function (response) {
                    if (response.success) {
                        var data = response.data;
                        for (var name in data) {
                            if (name == 'img') {
                                $('img').attr('src', data[name]);
                            }
                            var el = $('[name='+name+']');
                            if (el.attr('name') && el.attr('name') != 'img') {
                                el.val(data[name])
                            }
                        }
                    }
                }
            })
        });
    </script>

@endsection