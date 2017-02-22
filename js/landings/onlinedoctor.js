$(document).ready(function () {

    $('.reviews').slick({
        autoplay: true,
        autoplaySpeed: 5000,
        infinite: true,
        slidesToShow: 2,
        slidesToScroll: 2,
        prevArrow: '<div class="arrow prev"></div>',
        nextArrow: '<div class="arrow next"></div>'
    });

    $('.doctors-info').slick({
        autoplay: false,
        autoplaySpeed: 5000,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        speed: 800,
        appendArrows: $('#doctor-arrows'),
        prevArrow: '<div class="arrow prev"></div>',
        nextArrow: '<div class="arrow next"></div>'
    });

    // Заполняем звездочки в отзывах
    $('#slide-6').find('.stars').each(function () {
        var count = $(this).data('count');

        for (var i = 1; i <= count; i++) {
            $(this).append('<span class="fill"></span>');
        }
        for (var i = 1; i <= 5 - count; i++) {
            $(this).append('<span></span>');
        }
    });

    $('.show-questions').on('click', function () {
        window.location.href = '/help';
    });

    $('.logout').on('click', function () {
        DeleteCookie('showCompatibilityBar');
    });
});