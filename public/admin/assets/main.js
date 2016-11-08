


$(function () {

    $.ajaxSetup({
        headers: {
            'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
        }
    });


    var url = document.location.href;
    $('#header .nav li a').each(function () {
        if (url.indexOf(this.href) !== -1) {
            this.className = 'current';
        }
    });

    if ($('#header .nav li .current').length == 0) {
        $('#header .nav li a:first').addClass('current');
    }
});
