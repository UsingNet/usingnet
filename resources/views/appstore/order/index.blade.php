<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>订单管理</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
    <style>
        .action {
            padding-top: 5px;
        }
        .action label {
            font-weight:normal;
            cursor: pointer;
            margin-right: 10px;
        }
        .scan {
            display: none;
        }
        .status-list ul {
        }
        .status-list {
            padding-left: 70px;
        }
        .header {
            padding: 20px 0;
            overflow: hidden;
        }
        .add {
            float: right;
        }
        .search {
            float: left;
            margin-top: -10px;
        }
        .empty td {
            padding: 40px !important;
            text-align: center;
        }
        .search {
            width: 400px;
            padding-top: 10px;
        }
        .search input {
            width: 70%;
        }
        .search button, .search input {
            display: inline-block;
        }

        .number-box input{
            width: 75%;
            display: inline-block;
        }

        @media (max-width: 768px) {
            .add {
            }
            .search {
                width: 230px;
            }
            .search .form-group {
                width: 80%;
                display: inline-block;
            }
            .table-number, .table-gen-date, .table-phone {
                display: none;
            }
            .status-list {
                padding: 0;
            }
            .number {
                width: 70%;
            }
            .scan {

            }
        }
    </style>
</head>
<body>
     <div class="container">
         <div class="header">
             <div class="add">
                 <button type="button" class="btn btn-info" data-toggle="modal" data-target="#modal">
                     添加
                 </button>
             </div>
             <div class="search">
                 <form method="GET" action="/appstore/order">
                     <input type="text" class="form-control" placeholder="订单号 / 名字 / 手机号码" name="q" value="{{ $q }}">
                     <button type="submit" class="btn btn-default">搜索</button>
                 </form>
             </div>
         </div>
         <div class="items">
             <table class="table">
                 <col width="13%">
                 <col width="13%">
                 <col width="20%">
                 <col width="15%">
                 <tr>
                     <th class="table-number">单号</th>
                     <th>标题</th>
                     <th>名字</th>
                     <th class="table-phone">手机</th>
                     <th>修改日期</th>
                     <th class="table-gen-date">生成日期</th>
                     <th>操作</th>
                 </tr>
                 @foreach ($orders as $order)
                     <tr>
                         <td class="table-number">{{ $order->number }}</td>
                         <td>{{ $order->title }}</td>
                         <td>{{ $order->name }}</td>
                         <td class="table-phone">{{ $order->phone }}</td>
                         <td>{{ $order->updated_at }}</td>
                         <td class="table-gen-date">{{ $order->created_at }}</td>
                         <td>
                             <a href="javascript:;" class="edit" data-id="{{ $order->_id }}">更新状态</a>
                         </td>
                     </tr>
                 @endforeach
                 @if ($orders->isEmpty())
                     <tr class="empty">
                         <td colspan="7">
                             @if ($q)
                                没有搜到订单，请尝试修改关键词
                             @else
                                暂无订单
                             @endif
                         </td>
                     </tr>
                 @endif
             </table>

             {!! $orders->render()  !!}
         </div>

         <div class="modal" id="modal">
             <div class="modal-dialog">
                 <div class="modal-content">
                     <div class="modal-header">
                         <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                         <h4 class="modal-title">添加订单</h4>
                     </div>
                     <div class="modal-body">
                         <input type="hidden" name="id" class="id">
                         <div class="form-horizontal">
                             <div class="form-group">
                                 <label class="control-label col-md-2">单号</label>
                                 <div class="col-md-8">
                                     <div class="action">
                                         <label>
                                             <input type="radio" name="action" checked value="auto"> 自动
                                         </label>
                                         <label>
                                            <input type="radio" name="action" value="manually"> 手动
                                         </label>
                                     </div>
                                     <div class="number-box">
                                         <input type="text" class="form-control number">
                                         @if (preg_match('/micromessenger/i', $_SERVER['HTTP_USER_AGENT']))
                                            <button class="btn btn-info scan">扫码</button>
                                         @endif
                                     </div>
                                 </div>
                             </div>
                             <div class="form-group">
                                 <label class="control-label col-md-2">标题</label>
                                 <div class="col-md-8">
                                     <input type="text" class="form-control title">
                                 </div>
                             </div>

                             <div class="status-list">
                                 <ul>
                                 </ul>
                             </div>

                             <div class="form-group">
                                 <label class="control-label col-md-2">状态</label>
                                 <div class="col-md-8">
                                     <textarea class="form-control status"></textarea>
                                 </div>
                             </div>
                             <div class="form-group">
                                 <label class="control-label col-md-2">客户姓名</label>
                                 <div class="col-md-8">
                                     <input type="text" class="form-control name">
                                 </div>
                             </div>
                             <div class="form-group">
                                 <label class="control-label col-md-2">客户电话</label>
                                 <div class="col-md-8">
                                     <input type="text" class="form-control phone">
                                 </div>
                             </div>
                         </div>
                     </div>
                     <div class="modal-footer">
                         <button type="button" class="btn btn-primary submit">提交</button>
                     </div>
                 </div>
             </div>
         </div>

         <div class="footer">
             @if (!preg_match('/micromessenger/i', $_SERVER['HTTP_USER_AGENT']))
                查询地址： {{ $selectUrl }}
             @endif
         </div>
     </div>

 <script src="/assets/js/jquery.min.js"></script>
 <script src="/assets/js/bootstrap.min.js"></script>
 <script src="/assets/js/weixin.js"></script>
 <script>
     $('.add').on('click', function() {
         $('.action').show();
         $('.action input:first').prop('checked', true);
         $('.number-box').hide();
         $('.status-list ul').html('');
         $('input[type=text]').val('');
         $('textarea').val('');
         $('.scan').show();
         $('.number').prop('readonly', false);
         $('input[name=id]').val('');
     });

     $('.action input').on('click', function() {
        var action = $(this).val();
         $('.number').attr('placeholder', '');
         if (action === 'auto') {
             $('.number-box').hide();
         } else if (action === 'manually') {
             $('.number-box').show();
             $('.number').val('').attr('placeholder', '请输入订单号').show().focus();
         } else {
         }
     });

     $('.submit').on('click', function() {
         var fields = ['name', 'phone', 'title'];
         var params = {};
         $('.has-error').removeClass('has-error');

         if (!$('.id').val()) {
             fields.push('status');
         }

         if ($('.action input:checked').val() !== 'auto') {
             fields.push('number');
             params['number'] = $('.number').val();
         }

         fields.forEach(function(field) {
             var elem = $('.' + field);
             if (!elem.val()) {
                 elem.parents('.form-group').addClass('has-error');
             }
             params[field] = elem.val();
         });

         if ($('.has-error').length) {
             $('.has-error:first input').focus();
             $('.has-error:first textarea').focus();
             return ;
         }

         if (!params.status && $('.status').val()) {
             params['status'] = $('.status').val();
         }

         params['action'] = $('.action input:checked').val();
         params['id'] = $('.id').val();

         $.ajax({
             type: 'POST',
             url: '/appstore/order/submit',
             data: params,
             success: function() {
                location.reload();
             }
         });
     });

     $('.edit').on('click', function() {
         $('.scan').hide();
         $('h4').text('编辑订单');
         var id = $(this).data('id');
         $.ajax({
             type: 'GET',
             url: '/appstore/order/show/' + id,
             success: function(resp) {
                 $('#modal').modal('show');
                 $('.action').hide();
                 $('.number').prop('readonly', true);
                 $('.id').val(resp._id);
                 $('.title').val(resp.title);
                 $('.name').val(resp.name);
                 $('.phone').val(resp.phone);
                 $('.number').val(resp.number);
                 // 状态
                 var status = [];
                 resp.status.forEach(function(item) {
                     status.push('<li>' +  item.time + ' ' + item.status + '</li>');
                 });
                 $('.status-list ul').html(status.join(''));
             }
         });
     });

     wx.config({!! json_encode($config) !!});
     $('.scan').on('click', function() {
         wx.scanQRCode({
             needResult: 1,
             scanType: ["qrCode","barCode"],
             success: function (res) {
                 var result = res.resultStr;
                 var code = result.replace(/^.*?,/, '');
                 $('.number').val(code);
             }
         });
     });
 </script>
</body>
</html>