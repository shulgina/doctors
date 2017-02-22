$(document).ready(function () {

    $('.doctors-team').slick({
        autoplay: true,
        autoplaySpeed: 5000,
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 1,
        speed: 500,
        appendArrows: $('#doctor-arrows'),
        prevArrow: '<div class="arrow prev"></div>',
        nextArrow: '<div class="arrow next"></div>'
    });

});