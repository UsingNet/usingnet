@extends('admin.layouts.master')

@section('content')
    <div class="main">
        <table class="table">
            <col width="100">
            <tr>
                <td>团队名</td>
                <td>{{ $identity->team->name }}</td>
            </tr>
            <tr>
                <td>公司名称</td>
                <td>{{ $identity->company_name }}</td>
            </tr>
            <tr>
                <td>公司地址</td>
                <td>{{ $identity->company_address }}</td>
            </tr>
            <tr>
                <td>行业</td>
                <td>{{ $identity->industry }}</td>
            </tr>
            <tr>
                <td>组织机构号</td>
                <td>{{ $identity->organization_number }}</td>
            </tr>

            <tr>
                <td>组织机构证</td>
                <td><img src="{{ $identity->organization_certificate }}" width="500"></td>
            </tr>

            <tr>
                <td>税务登录号</td>
                <td>{{ $identity->tax_number }}</td>
            </tr>

            <tr>
                <td>税务登录证</td>
                <td><img src="{{ $identity->tax_certificate }}" width="500"></td>
            </tr>

            <tr>
                <td>营业执照号</td>
                <td>{{ $identity->license_number }}</td>
            </tr>

            <tr>
                <td>营业执照</td>
                <td><img src="{{ $identity->license_certificate }}" width="500"></td>
            </tr>
            <tr>
                <td>法定代表</td>
                <td>{{ $identity->legal_person }}</td>
            </tr>

            <tr>
                <td>手机号码</td>
                <td>{{ $identity->phone }}</td>
            </tr>

            <tr>
                <td>公司电话</td>
                <td>{{ $identity->phone }}</td>
            </tr>

            <tr>
                <td>公司网站</td>
                <td>{{ $identity->website }}</td>
            </tr>

            <tr>
                <td colspan="2" class="text-center">
                    @if ($identity->status == \App\Models\Identity::STATUS_SUCCESS)
                        <button class="btn btn-block btn-default" disabled>已审核</button>
                    @elseif ($identity->status == \App\Models\Identity::STATUS_FAIL)
                        <button class="btn btn-block btn-default" disabled>已拒绝</button>
                    @else
                        <a href="javascript:;" data-id="{{ $identity->id }}" class="btn btn-default btn-block pass">通过</a>
                        <a href="javascript:;" data-id="{{ $identity->id }}" class="btn btn-danger btn-block refuse" data-toggle="modal" data-target="#myModal">拒绝</a>
                    @endif

                </td>
            </tr>
        </table>
    </div>

    <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title" id="myModalLabel">填写拒绝原因</h4>
                </div>
                <div class="modal-body">
                    <textarea class="form-control"></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary">提交</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        $('.pass').on('click', function () {
            var id = $(this).data('id')
            if (confirm('确定通过审核')) {
                $.ajax({
                    type: 'POST',
                    url: '/checking/pass/' + id,
                    success: function (response) {
                        if (response.code == 200) {
                            window.location.reload()
                        } else {
                            alert(response.msg)
                        }
                    }
                })
            }
        })

        $('#myModal button').on('click', function () {
            var id = $('.refuse').data('id')
            var msg = $('#myModal textarea').val()

            if (!msg) {
                alert('请填写拒绝原因')
                return
            }

            $.ajax({
                type: 'POST',
                url: '/checking/refuse/' + id,
                data: {msg: msg},
                success: function (response) {
                    if (response.code == 200) {
                        window.location.reload()
                    } else {
                        alert(response.msg)
                    }
                }
            })
        })
    </script>
@endsection
