@extends('admin.layouts.master')

@section('content')
    <div class="main col-md-12">
        <div class="add text-right">
            <button class="btn btn-primary" data-toggle="modal" data-target="#myModal" data-toggle="modal" data-target="#myModal">添加</button>
        </div>
        <br/>

        <table class="table">
            <col width="20%">
            <col width="20%">
            <col width="30%">
            <col width="15%">
            <col />
            <tr>
                <th>标题</th>
                <th>内容</th>
                <th>分配</th>
                <th>日期</th>
                <th class="text-center">操作</th>
            </tr>
            @foreach ($notices as $notice)
            <tr>
                <td>{{ $notice->title }}</td>
                <td>{{ $notice->content }}</td>
                <td>
                    @foreach ($notice->assign as $assign)
                        @if ($assign === 'all')
                                全部
                        @else
                            {{ $assign->name }} &nbsp;
                        @endif
                    @endforeach
                </td>
                <td>
                    {{ $notice->created_at }}
                </td>
                <td class="text-center">
                    @if ($notice->status === \App\Models\Admin\Notice::STATUS_INIT)
                        <a href="/notice/delete/{{ $notice->id }}">删除</a>
                    @else
                        已完成
                    @endif
                </td>
            </tr>
            @endforeach
        </table>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
        <div class="modal-dialog" role="document">
            <form class="form-horizontal" action="/notice" method="post">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title" id="myModalLabel">添加通知</h4>
                    </div>
                    <div class="modal-body">
                         <div class="form-group">
                             <label class="col-md-2 control-label">标题</label>
                             <div class="col-md-6">
                                 <input class="form-control" name="title" type="text">
                             </div>
                         </div>
                        <div class="form-group">
                            <label class="col-md-2 control-label">内容</label>
                            <div class="col-md-6">
                                <textarea class="form-control" name="content"></textarea>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-md-2 control-label">分配</label>
                            <div class="col-md-6">
                                <select class="form-control" multiple name="assign[]">
                                    <option value="all">全部</option>
                                    @foreach ($teams as $team)
                                        <option value="{{ $team->id  }}">{{ $team->name }}</option>
                                    @endforeach
                                </select>
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

@endsection
