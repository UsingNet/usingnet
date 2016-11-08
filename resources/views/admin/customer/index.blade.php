@extends('admin.layouts.master')

@section('content')
    <style>
        .data-list{
            list-style-type: none;
            padding: 0;
            background: #FFF;
            box-shadow: 0 0 20px 0 rgba(0, 0, 0, .15);
            border-bottom-left-radius: 5px;
            border-bottom-right-radius: 5px;
            position: absolute;
            z-index: 1000;
            width: 468.33px;
        }
        .data-list li {
            padding: 5px 8px;
            cursor: pointer;
        }
        .data-list li:hover {
            background: #f3f3f3;
        }
        textarea.info {
            height: 200px;
        }
    </style>


    <div class="main col-md-12">
        <div class="add text-right">
            <button class="btn btn-primary" data-toggle="modal" data-target="#myModal">添加</button>
        </div>
        <br/>
        <table class="table">
            <col width="20%">
            <col width="40%">
            <tr>
                <th>团队名</th>
                <th>开始时间</th>
                <th>结束时间</th>
                <th>操作</th>
            </tr>
            @foreach ($customers as $custom)
                <tr>
                    <td>{{ $custom->team->name }}</td>
                    <td>{{ $custom->start_at }}</td>
                    <td>{{ $custom->end_at }}</td>
                    <td>
                        <a class="edit" href="javascript:;" data-id="{{ $custom->_id }}" data-toggle="modal" data-target="#myModal">
                            编辑
                        </a>
                        <a href="/customer/delete/{{ $custom->_id }}">删除</a>
                    </td>
                </tr>
            @endforeach
        </table>
    </div>


    <!-- Modal -->
    <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
        <div class="modal-dialog" role="document">
            <form class="form-horizontal" action="/customer/add" method="post">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title" id="myModalLabel">添加客户</h4>
                    </div>
                    <div class="modal-body">
                        <form action="" class="form">
                            <input type="hidden" name="id" >
                            <div class="form-group">
                                <label class="col-sm-2 control-label" for="">团队</label>
                                <div class="col-sm-10">
                                    <input type="hidden" name="team_id">
                                    <input class="form-control search-team" placeholder="输入名字搜索团队"/>
                                    <ul class="data-list">
                                    </ul>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="col-sm-2 control-label" for="">信息</label>
                                <div class="col-sm-10">
                                    <textarea name="info" class="form-control info" placeholder="支持 Markdown"></textarea>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="col-sm-2 control-label" for="">开始时间</label>
                                <div class="col-sm-10">
                                    <input  class="form-control start" value="{{ date('Y-m-d') }}"  name="start_at" type="text">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="col-sm-2 control-label" for="">结束时间</label>
                                <div class="col-sm-10">
                                    <input  class="form-control end" value="{{ date('Y-m-d') }}"  name="end_at" type="text">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">保存</button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <script src="//cdn.bootcss.com/smalot-bootstrap-datetimepicker/2.3.11/js/bootstrap-datetimepicker.min.js"></script>
    <link href="//cdn.bootcss.com/smalot-bootstrap-datetimepicker/2.3.11/css/bootstrap-datetimepicker.min.css" rel="stylesheet">
    <script type="text/javascript">
        $('.start').datetimepicker({
            format: 'yyyy-mm-dd',
            minView: 2
        });
        $('.end').datetimepicker({
            format: 'yyyy-mm-dd',
            minView: 2
        });
        $('.edit').on('click', function() {
            var id = $(this).data('id');
            $.ajax({
                url: '/customer/edit/' + id,
                success: function(resp) {
                    $('.search-team').val(resp.data.team.name);
                    $('input[name=team_id]').val(resp.data.team_id);
                    $('.info').val(resp.data.info);
                    $('.start').val(resp.data.start_at);
                    $('.end').val(resp.data.end_at);
                }
            });
        });

        $('.search-team').on('keyup', function() {
            $('.data-list').show();
            var key = $(this).val();
            if (!key) {
                $('.data-list').hide();
                return ;
            }
            $.ajax({
                type: 'GET',
                url: '/customer/team?key=' + key,
                success: function(resp) {
                    var datalist = [];
                    resp.data.forEach(function(team) {
                        var list = '<li data-id="' + team.id + '">' +  team.name + '</li>';
                        datalist.push(list);
                    });

                    $('.data-list').html(datalist.join(''));
                }
            });
        });

        $('.data-list').on('click', 'li', function() {
            var name = $(this).text().trim();
            var id = $(this).data('id');
            $('.search-team').val(name);
            $('input[name=team_id]').val(id);
            $('.data-list').hide();
        });
    </script>
@endsection