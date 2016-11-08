<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>短信发送</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <link rel="stylesheet" href="/assets/css/bootstrap.min.css">

    <style>
        * {
            margin: 0;
            padding: 0;
        }
        ul {
            list-style-type: none;
        }
        .section {
            width: 980px;
            margin: 20px auto;
        }
        input[type=checkbox] {
            float: left;
            position: relative;
            top: 8px;
            margin-right: 10px;;
        }

        .search {
            position: relative;
        }

        .contacts {
            position: absolute;
            top: 70px;
            width: 100%;
            background:#FFF;
            padding: 10px;
            box-shadow: 0 7px 21px rgba(0, 0, 0, .1);
            display: none;
            z-index: 8000;
        }

        .contacts .name {
            float: left;
            margin-top: 3px;
            width: 90px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .empty {
            text-align: center;
            height: 80px;
            line-height:80px;
        }

        .contacts li img {
            float: left;
            width: 30px;
            vertical-align: middle;
        }
        .contacts li {
            overflow: hidden;
            line-height: 2;
        }

        .send {
            text-align: center;
            margin-top: 20px;
        }
        select {
            width: 300px;
            display: block;
            margin: 0 auto;
        }
        .send button {
            width: 100%;
        }
        .contacts li {
            display: inline-block;
            height: 50px;
            line-height: 1.5;
            width: 188px;
        }
        .contacts li img {
            margin-right: 3px;
            vertical-align: middle;
        }
        .selected {
            width: 100%;
            min-height: 80px;
            border: 3px dotted #F3F3F3
        }
        .selected .item {
            padding: 5px;
            width: 60px;
            height: 90px;
            font-size: 12px;
            position: relative;
            text-align: center;
            display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .selected img {
            width: 50px;
            border-radius: 50px;
        }
        .selected .close {
            position: absolute;
            top: 0px;;
            right: 0px;
            color: #ff3300;
            z-index: 1000;
            opacity: 1;
        }
        .selected .name {
            width: 50px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .alert {
            display: none;
        }

        .template-dist {
            padding: 5px;
        }

        .template-dist input {
            border: none;
            border-bottom: 1px solid #ddd;
            outline: none;
            padding: 2px;
        }
    </style>
</head>
<body>
    <div class="section">
        <div class="alert alert-success">
        </div>
        <div class="alert alert-danger">

        </div>

        <div class="form">

            <div class="form-group search">
                <label for="">选择联系人</label>
                <input type="text" class="form-control" placeholder="搜索">
                <ul class="contacts">

                </ul>
            </div>

            <div class="form-group">
                <label for="">联系人</label>
                <div class="selected">

                </div>
            </div>

            <div class="form-group">
                <label for="">选择模板</label>
                <select class="form-control template-src" name="media_id" id="">
                    <option value="">请选择模板</option>
                    @foreach ($templates as $template)
                        <option value="{{ $template->id }}">{{ $template->content }}</option>
                    @endforeach
                </select>

            </div>

            <div class="form-group">
                <div class="template-dist">
                </div>
            </div>

            <div class="send">
                <button type="submit" class="btn btn-primary">发送</button>
            </div>
        </div>
    </div>

    <script src="/assets/js/jquery.min.js"></script>
    <script>

        $('.search input').on('focus', function() {
            $('.contacts').slideDown('fast');
        });

        $('.search').on('mouseleave', function() {
            if (!$('.search input:first').is(':focus')) {
                $('.contacts').slideUp('fast');
            }
        });

        $('body').on('click', function(e) {
            if (!$('.search input').is(':focus') && e.target.tagName === 'BODY') {
                $('.contacts').slideUp('fast');
            }
        });

        var timer;
        $('.search input').on('keyup', function() {
           var k = $(this).val();
            if (k) {
                clearTimeout(timer);
                timer  = setTimeout(function() {
                    search(k);
                }, 200);
            }
        });

        search();

        function search(k) {
            k = k || '';
            var api = '/api/contact?limit=40&filter=phone&query=' + encodeURIComponent(k);
            $.ajax({
                type: 'GET',
                url: api,
                success: function(resp) {
                    var li = [];
                    resp.data.forEach(function(contact) {
                       li.push(`<li class="contact" data-id="${contact.id}"><label>
                                   <input type="checkbox" name="" value="${contact.id}">
                                    <img src="${contact.img && contact.img.indexOf('qnssl') !== -1 ? contact.img + '-avatar' : contact.img}"/>
                                    <div class="name">${contact.name}</div>
                               </label></li>`);
                    });

                    var html = li.join('');
                    html = html ? html : '<div class="empty">没有复合条件的联系人，请重新搜索</div>';
                    $('.contacts').html(html);
                }
            });
        }
        $('.contacts').on('click', '.contact', function(e) {
            if (e.target.nodeName === 'INPUT') {
                var img = $(this).find('img').attr('src');
                var id = $(this).data('id');
                var name = $(this).find('.name').text().trim();
                var selected = $(this).find('input:checked').length;
                var item = `<div class="item" data-id="${id}">
                        <div class="close">&times;</div>
                        <img src="${img}" />
                        <div class="name">${name}</div>
                    </div>`;

                var exists = null
                $('.selected .item').each(function() {
                    if ($(this).data('id') === id) {
                        exists = true;

                        if (!selected) {
                            $(this).remove();
                        }
                    }
                });

                if (!exists) {
                    $('.selected').append(item);
                }
            }
        });

        $('.send button').on('click', function(e) {
            e.preventDefault();
            $('.alert').hide();
            var contactIds = [];
            var tplId = $('.template-src option:selected').val();
            var tpl = $('.template-src option:selected').text();
            var keywords = [];
            $('input[name=keywords]').each(function() {
                var key = $(this).val();
                tpl =  tpl.replace(/\#(.*?)\#/, key);
            });

            $('.selected .item').each(function() {
              contactIds.push($(this).data('id'));
            });
            if (!tplId) {
                $('.alert-danger').text('请选择模板').show();
                return ;
            }
            if (!contactIds.length) {
                $('.alert-danger').text('请选择联系人').show();
                return ;
            }

            $.ajax({
                type: 'POST',
                url: '/api/sms/send',
                data: {contact_ids: contactIds, media_id: tplId, tpl: tpl},
                success: function(resp) {
                    if (resp.success) {
                        $('.alert-success').text('发送成功').show();
                        $('.selected').html('');
                        $('.template-dist').html('');
                    } else {
                        $('.alert-danger').text(resp.msg).show();
                    }
                }
            })
        });

        $('.selected').on('click', '.close', function() {
            var item = $(this).parent('.item');
            var id = item.data('id');
            item.remove();
            $('.contacts li').each(function() {
                if ($(this).data('id') === id) {
                    $(this).find('input').prop('checked', false);
                }
            });
        });
        $('.template-src').on('change', function() {
            if (this.value) {
                var tpl = $(this).find('option:selected').text().trim();
                tpl = tpl.replace(/\#(.*?)\#/g, '<input name="keywords" placeholder="$1"/>')
                $('.template-dist').html(tpl);
            }
        });
    </script>
</body>
</html>
