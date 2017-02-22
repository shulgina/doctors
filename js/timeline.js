$(document).ready(function() {
    $('.checkbox').change(function() {
        $(".consultation-block").css('display', 'none');
        var check = false;
        $('.checkbox').each(function(index) {
            if ($(this).is(':checked'))
            {
                check = true;
                $(".enc_category" + $(this).val()).css('display', 'block');
            }
        });
        if (check == false)
        {
            $(".consultation-block").css('display', '');
        }
    });

    $('.similar-articles').slick({
        slidesToShow: 3,
        slidesToScroll: 3,
        prevArrow: '<div class="arrow prev"></div>',
        nextArrow: '<div class="arrow next"></div>'
    });
});