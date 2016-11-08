@extends('admin.layouts.master')

@section('content')
    @include('admin.layouts.sidebar')

    <div class="main col-md-8">
        <div class="add text-right">
            <button class="btn btn-primary" data-toggle="modal" data-target="#myModal" data-toggle="modal" data-target="#myModal">添加</button>
        </div>
        <br/>
        <table class="table">
            <tr>
                <th>
                    名字
                </th>
                <th>
                    手机
                </th>
                <th>
                    销售员
                </th>
                <th>
                    地址
                </th>
                <th>
                    操作
                </th>
            </tr>
            <tr>

            </tr>

        </table>
    </div>


    <!-- Modal -->
    <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
        <div class="modal-dialog" role="document">
            <form class="form-horizontal" action="/asles/addcustomer" method="post">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title" id="myModalLabel">添加客户</h4>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" name="id" >
                        <div class="form-group">
                            <label class="col-sm-2 control-label" for="">名字</label>
                            <div class="col-sm-6">
                                <input class="form-control" name="name" type="text">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="col-sm-2 control-label" for="">手机</label>
                            <div class="col-sm-6">
                                <input class="form-control" name="mobile" type="text">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label" for="">地址</label>
                            <div class="col-sm-6">
                                <input class="form-control" name="userid" type="text">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label" for="">业务员</label>
                            <div class="col-sm-6">
                                <select class="form-control" name="seller_id">
                                    @foreach ($sellers as $seller)
                                        <option value="{{ $seller->id }}">{{ $seller->name }}</option>
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



