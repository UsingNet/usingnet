@extends('admin.layouts.master')

@section('content')
    @include('admin.layouts.sidebar')

    <div class="main col-md-8">
        <div class="add text-right">
            <button class="btn btn-primary" data-toggle="modal" data-target="#myModal" data-toggle="modal" data-target="#myModal">添加</button>
        </div>
        <br/>
        <table class="table">
            <col width="50%">
            <col />
            <tr>
                <th>名字</th>
                <th>折扣</th>
                <th>使用次数</th>
            </tr>
            @foreach ($promos as $promo)
                <tr>
                    <th>{{ $promo->name }}</th>
                    <th>{{ $promo->discount }}</th>
                    <th>{{ $promo->used }}</th>
                </tr>
            @endforeach

        </table>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
        <div class="modal-dialog" role="document">
            <form class="form-horizontal" action="/sales/promo" method="post">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title" id="myModalLabel">添加优惠码</h4>
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
                            <label class="col-sm-2 control-label" for="">折扣</label>
                            <div class="col-sm-6">
                                <input class="form-control" name="discount" type="text">
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