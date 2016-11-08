$(function() {
    // 修改相册
    $('.albums .edit').on('click', function() {
        var modal = $('.modal');
        var layer = $('.layer');
        var id = $(this).data('id');
        modal.find('.step-1 .title').text('修改相册');
        modal.css({height: document.documentElement.clientHeight })

        $.ajax({
            method: 'GET',
            url: '/appstore/photo/album/' + id,
            success: function(resp) {
                modal.find('.id').val(resp.data._id);
                modal.find('.name').val(resp.data.name);
                modal.find('.desc').val(resp.data.desc);
                modal.find('.sub li').each(function() {
                    if ($(this).data('id') == resp.data.music) {
                        modal.find('.music').val(resp.data.music);
                        modal.find('.select').text($(this).text());
                    }
                });
            }
        });
        modal.show();
        layer.show();
    });

    $('.select').on('click', function() {
        $('.sub').toggle();
    });

    $('.sub li').on('click', function() {
        $('.select').text($(this).text());
        $('.music').val($(this).data('id'));
        $('.sub').hide();
    });


    $('.next .btn').on('click', function() {
        var parent = $(this).parents('.step');
        var index = parent.index();

        // step1 - step2
        if (index === 0) {
            var id = $('.id').val();
            var appId = $('body').data('app-id');
            var name = $('.step-1 .name').val();
            var music = $('.step-1 .music').val();
            var height = $('.choose').height();

            if (!name) return ;

            $.ajax({
                type: 'POST',
                url: '/appstore/photo/create',
                data: {name: name, music: music, app_id: appId, id: id},
                success: function(resp) {
                    var items = [];
                    $('.step-2 .album-id').val(resp.data._id);
                    resp.data.photos.forEach(function(item) {
                        var style = item.style ? JSON.stringify(item.style) : 1;
                        var item = ['<li data-id="' + item._id + '" data-style=\'' + style + '\' class="item" style="height: ' + height + 'px">',
                            '<img src="' + item.img + '"/><div class="close">&times;</div>',
                        '</li>'];
                        items.push(item.join(''));
                    });
                    if (items.length) {
                        $('.step-2 .choose').before(items.join(''));
                    }
                    $('.step-2 .item').height($('.step-2 .item').width());
                }
            });
        }

        // step2 - step-3
        if (index === 1) {
            if ($('.step-2 .item').length === 1) {
                $('.step-2 .tips').text('请选择图片').show();
                return ;
            }

            var pages = [];
            $('.step-2 .item').each(function(index) {
                if (!$(this).hasClass('choose')) {
                    var img = $(this).find('img').attr('src');
                    var style = $(this).data('style') || {};
                    var id = $(this).data('id');
                    var page = [
                        '<div data-id="' + id + '" class="page style-' + (style.style || 1) + '" data-style="' + (style.style || 1) + '" style="z-index:' + (index === 0 ? '1' : '-1') + '">',
                            '<div class="title editable" contenteditable="true">' + (style.title || '') + '</div>',
                            '<div class="desc editable" contenteditable="true">' + (style.desc || '') + '</div>',
                            '<div class="close">&times;</div>',
                            '<div class="img">',
                            '<img src="' + img + '" alt="">',
                            '</div>',
                        '</div>'
                    ];
                    pages.push(page.join(''));
                }
            });



            if (pages.length) {
                var nav = '<span style="display:none" class="nav prev"></span><span class="nav next"></span>';
                if (pages.length === 1) {
                    var nav = '<span style="display:none" class="nav prev"></span><span style="display:none" class="nav next"></span>';
                }

                var page = nav + pages.join('');

                $('.step-3 .photos').html(page);

                var count = pages.length;
                var lis = [];
                for (var i = 1; i <= count; i++) {
                    if (i === 1) {
                        lis.push('<li class="current"></li>');
                    } else {
                        lis.push('<li></li>');
                    }
                }

                var paginate = lis.join('')
                $('.paginate ul').html(paginate);
            }
        }

        $('.step').eq(index).hide();
        $('.step').eq(index+1).show();
    });

    // ---------- Step 1 Start ---------- //
    $('.create a').on('click', function() {
        var modal = $('.modal');
        modal.find('.title').text('创建相册');
        modal.find('.id').val('');
        modal.find('.name').val('');
        modal.find('.music').val('');
        modal.find('.desc').val('');
        modal.find('.select').text('选择背景音乐');
        modal.css({height: document.documentElement.clientHeight })
        $('.modal').show();
        $('.layer').show();
    });

    $('.layer, .modal > .close').on('click', function () {
        location.href = location.href + '?_r=' + Math.random()
    });

    $('.submit a').on('click', function() {
        $('this').addClass('disabled');
        if ($(this).hasClass('disabled')) return false;
        var modal = $('.modal');
        var id = modal.find('.id').val();
        var name = modal.find('.name').val();
        var desc = modal.find('.desc').val();
        var appid = modal.find('.appid').val();
        var music = modal.find('.music').val();
        if (!name) {
            modal.find('.name').addClass('has-error');
            modal.find('.name').focus();
            $(this).removeClass('disabled');
            return false;
        }
        $.ajax({
            type: 'POST',
            url: '/appstore/photo/create',
            data: {app_id: appid, name: name, desc: desc, music: music, id: id},
            success: function (resp) {
                if (resp.success) {
                    location.href = location.href + '?_r=' + Math.random();
                } else {
                    $('.disabled').removeClass('disabled');
                }
            }
        });
    });

    $('.g-tips .cancel, .g-layer').on('click', function() {
        $('.g-tips').hide();
        $('.g-layer').hide();
    });

    function confirm(e, cb) {
        $('.g-tips').css({top: e.clientY - 90}).show();
        $('.g-layer').show();
        $('.confirm').unbind('click');
        $('.confirm').bind('click', cb);
    }

    $('.albums .item .delete').on('click', function(e) {
        var self = $(this);
        confirm(e, function() {
            var appId = self.data('appid');
            var id = self.data('id');
            $.ajax({
                type: 'DELETE',
                url: '/appstore/photo/album/' + appId,
                data: {id: id},
                success: function(resp) {
                    self.parents('li').remove();
                    $('.g-layer').trigger('click');
                }
            })
        });
    });
    // ----------- Step 2 End -------------- //


    // -------------- Step 2 Start --------- //
    $('.step-2').on('click', '.item .close', function() {
        $('.step-2 .tips').hide();
        var parent = $(this).parents('.item');
        var id = parent.data('id');
        parent.remove();
    });
    $('.step-2 .choose img').on('click', function() {
        $('.step-2 .tips').hide()
        var len = $('.step-2 .item').length -1;
        if (len == 9) {
            $('.step-2 .tips').text('已上传 9 张照片');
            $('.step-2 .tips').show();
            return ;
        }
        $('#file').data('type', 'uploadPhoto');
        $('#file').trigger('click');
    });

    // -------------- Step 2 End ----------- //

    // ------------- step-3 ---------------//

    var index = 0;
    $('.step-3').on('click', '.nav', function() {
        index = $('.paginate .current').index();
        if ($(this).hasClass('prev')) {
            --index;
        } else {
            ++index;
        }
        paginated();
    });

    var startX = 0;
    $('.step-3').on('touchstart', '.page', function(e) {
        console.log(11);
        index = $('.paginate .current').index();
        startX = e.touches[0].pageX;
    });

    $('.step-3').on('touchend', '.page', function(e) {
        if (e.changedTouches[0].pageX > startX) {
            --index;
        } else {
            ++index;
        }
        paginated();
    });

    function paginated() {
        var count = $('.step-3 .page').length;
        if (index < 0) index = 0;
        if (index >= count) index = count - 1;

        $('.step-3 .page').css({zIndex: -1});
        $('.step-3 .page').eq(index).css({zIndex: 1});
        $('.paginate li').removeClass('current');
        $('.paginate li').eq(index).addClass('current');

        $('.step-3 .nav').show();
        if (index == 0) {
            $('.step-3 .prev').hide();
        }
        if (index == (count-1)) {
            $('.step-3 .next').hide();
        }
    }


    $('.step-3 .actions .show-style').on('click', function() {
        $('.step-3 .page').each(function(i) {
            $(this).css({height: $(this).height()});
        });
        $('.step-3 .style').show();
    });

    $('.step-3 .action-bar .close').on('click', function() {
        $('.step-3 .action-bar').hide();
    });

    $('.step-3 .actions .show-add').on('click', function() {
        $('.step-3 .add').show();
    });

    $('.step-3 .add-page').on('click', function() {
        if ($('.paginate li').length == 9) {
            $('.step-3 .tips').text('已上传 9 张照片').show();
            return ;
        }
        $('#file').data('type', 'addPage');
        $('#file').trigger('click');
    });

    // 删除一页
    $('.step-3').on('click', '.page .close', function() {
        var parent = $(this).parents('.page');
        if ($('.step-3 .page').length == 1) {
            return ;
        }

        parent.remove();
        var index = parent.index();
        if (index > 1) {
            index -= 1;
        }

        var pages = [];
        $('.step-3 .page').each(function() {
            pages.push('<li></li>');
        });
        $('.paginate ul').html(pages.join(''));
        $('.step-3 .page').eq(index).css({zIndex: 1})
        $('.paginate li').eq(index).addClass('current');

        if (index === 0) {
            $('.step-3 .prev').hide();
        }
        if ($('.step-3 .page').length === 1) {
            $('.step-3 .nav').hide();
        }
    });


    // 完成编辑
    $('.finsh').on('click', function () {
        var pages = [];
        var appId = $('body').data('app-id');
        var albumId = $('.album-id').val();
        $('.step-3 .page').each(function() {
            var page = {};
            page.id = $(this).data('id');
            page.style = $(this).data('style');
            page.title = $(this).find('.title').text();
            page.desc = $(this).find('.desc').text();
            pages.push(page);
        });

        $.ajax({
            type: 'POST',
            url: '/appstore/photo/style/' + appId,
            data: {styles: JSON.stringify(pages), album_id: albumId},
            success: function() {
               location.href = '/appstore/photo/show/' + albumId;
            }
        })
    });

    /* ----------- 文本编辑 ------------- */
    $('.step-3').on('click', '.editable', function() {
        $(this).addClass('focus');
    });
    $('.step-3').on('blur', '.editable', function() {
        $(this).removeClass('focus');
    });
    /* ----------- 文本编辑 ------------ */


    /* ------------ 切换板式 ---------------*/
    $('.action-bar li').on('click', function() {
        var index = $(this).index();
        var pageIndex = $('.paginate .current').index();
        var currentPage = $('.page').eq(pageIndex);
        var img = currentPage.find('.img img').attr('src');
        currentPage.className = 'page';
        currentPage.removeClass('style-' + currentPage.data('style'));
        currentPage.addClass('style-' + (index + 1));
        currentPage.data('style', (index+1));

        if (index === 0) {
            var html = ['<div class="close">&times;</div><div class="img">',
                        '<img src="' + img +'" alt="">',
                    '</div>',
                    '<div class="title editable" contenteditable="true">DECEMBER.06.2015</div>',
                    '<div class="desc editable" contenteditable="true">',
                        '其实一直陪伴着你的<br/>',
                        '是那个了不起的自己',
                    '</div>'
                ];
        } else if (index === 1) {
            var html = ['<div class="close">&times;</div><div class="img">',
                        '<img src="' + img + '">',
                    '</div>',
                    '<div class="title editable" contenteditable="true">DECEMBER.06.2015</div>',
                    '<div class="desc editable" contenteditable="true">',
                        '其实一直陪伴着你的<br/>',
                        '是那个了不起的自己',
                    '</div>'];
        }

        currentPage.html(html.join(''));
    });
    /* ------------ 切换板式 ---------------*/


    $('#file').on('click', function() {
        var type = $(this).data('type');
        var appId = $('body').data('app-id');
        var height = $('.choose').height();
        if ($('#file').hasClass('disabled')) return ;
        $('#file').addClass('disabled');
        wx.chooseImage({
            count: 9 ,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: function (res) {
                var localIds = res.localIds;
                if (type === 'uploadPhoto') {
                    var count = $('.step-2 .item').length - 1;
                    localIds = localIds.splice(0, (9 - count))
                } else {
                    localIds = localIds.splice(0, 1);
                }

                localIds.forEach(function(localId, index) {
                    setTimeout(function () {
                        wx.uploadImage({
                            localId: localId,
                            isShowProgressTips: 1,
                            success: function (res) {
                                var serverId = res.serverId;
                                $.ajax({
                                    type: 'POST',
                                    url: '/appstore/photo/upload/' + appId,
                                    data: {
                                        local_id: localId,
                                        media_id: serverId,
                                    },
                                    success: function (resp) {
                                        // 添加照片
                                        if (type === 'uploadPhoto' || type === 'addPage') {
                                            var albumId = $('.album-id').val();
                                            var img = resp.data;
                                            var appId = $('body').data('app-id');
                                            $.ajax({
                                                url: '/appstore/photo/photo/' + appId,
                                                type: 'POST',
                                                data: {
                                                    album_id: albumId,
                                                    img: img
                                                },
                                                success: function(resp) {
                                                    $('#file').removeClass('disabled');
                                                    if (type === 'addPage') {
                                                        var page = [
                                                            '<div class="page style-1">',
                                                            '<div class="close">&times;</div>',
                                                            '<div class="img"><img src="' + img + '"/></div>',
                                                            '</div>'
                                                        ];

                                                        var pageIndex = $('.paginate .current').index();
                                                        $('.step-3 .page').eq(pageIndex).css({zIndex: -1});

                                                        $('.step-3 .page').eq(pageIndex).after(page.join(''));

                                                        var pages = [];

                                                        $('.step-3 .page').each(function() {
                                                            pages.push('<li></li>');
                                                        });
                                                        $('.paginate ul').html(pages.join(''));
                                                        $('.paginate ul li').eq(pageIndex +1).addClass('current');

                                                        $('.step-3 .nav').show();
                                                        if (pageIndex == pages.length - 2) {
                                                            $('.step-3 .next').hide();
                                                        }
                                                    } else {
                                                        var item = '<li data-id="' + resp.data._id +'" class="item" style="height: ' + height + 'px"><img src="' + img +'"/><div class="close">&times;</div></li>';
                                                        $('.step-2 .photos .choose').before(item);
                                                    }
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }, 100 * (index+1));
                });
            }
        })
    });


    $('#file').on('change', function() {
        var height = $('.choose').height();
        var data = new FormData;
        var type = $(this).data('type');
        for (var i = 0; i < this.files.length; i++)  {
            data.append('file', this.files[i]);
        }

        $.ajax({
            type: 'POST',
            url: '/api/upload',
            processData: false,
            contentType: false,
            data: data,
            success: function(_resp) {
                // 添加照片
                if (type === 'uploadPhoto' || type === 'addPage') {
                    var albumId = $('.album-id').val();
                    var resp = JSON.parse(_resp);
                    var img = resp.data;
                    var appId = $('body').data('app-id');
                    $.ajax({
                        url: '/appstore/photo/photo/' + appId,
                        type: 'POST',
                        data: {
                            album_id: albumId,
                            img: img
                        },
                        success: function(resp) {
                            if (type === 'addPage') {
                                var page = [
                                    '<div class="page style-1">',
                                        '<div class="close">&times;</div>',
                                        '<div class="img"><img src="' + img + '"/></div>',
                                    '</div>'
                                ];

                                var pageIndex = $('.paginate .current').index();
                                $('.step-3 .page').eq(pageIndex).css({zIndex: -1});

                                $('.step-3 .page').eq(pageIndex).after(page.join(''));

                                var pages = [];

                                $('.step-3 .page').each(function() {
                                    pages.push('<li></li>');
                                });
                                $('.paginate ul').html(pages.join(''));
                                $('.paginate ul li').eq(pageIndex +1).addClass('current');

                                $('.step-3 .nav').show();
                                if (pageIndex == pages.length - 2) {
                                    $('.step-3 .next').hide();
                                }

                            } else {
                                var item = '<li data-id="' + resp.data._id +'" class="item" style="height: ' + height + 'px"><img src="' + img +'"/><div class="close">&times;</div></li>';
                                $('.step-2 .photos .choose').before(item);
                            }
                        }
                    });
                }
            }
        });
    });
});