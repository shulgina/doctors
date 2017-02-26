$(document).ready(function () {

    var mobile = new window.Controls.CheckMobile();

    if (mobile.isMobile()) {

        $('header').addClass('mobile-ver');

    } else {
        $(window).on('scroll', function () {
            $('.enable-scrollable-header').css({
                'left': -$(this).scrollLeft()
            });
        });
    }
});
