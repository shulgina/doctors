$(document).ready(function() {

    var $modal_video = $('#about-video-modal');

    $('#urgently-consult').viewportChecker({
        callbackFunction: function() {showInstructions('#urgently-consult')}
    });

    $('#aboutWrapper .service-conditions').viewportChecker({
        callbackFunction: function() {showServiceConditions()}
    });

    $('.nav-tabs li a').on('click', function() {
        var block_id = $(this).attr('href'),
            second_block_id = $(this).parent().siblings().children('a').attr('href');

        $(second_block_id).find('li').removeClass('visible');
        showInstructions(block_id);
    });

    $('#play-video').on('click', function () {
        $modal_video.find('.modal-body').html('<iframe src="https://player.vimeo.com/video/172885263?title=0&byline=0&portrait=0" width="880" height="495" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
        $modal_video.modal('show');
    });

    $modal_video.on('hidden.bs.modal', function () {
        $modal_video.find('.modal-body').empty();
    });

    // Анимация для блока с инструкциями
    function showInstructions(id) {
        var i = 1;
        var animate = setInterval(function() {

            $(id).find('li:nth-child('+i+')').addClass('visible');
            i++;
            if(i == 8) {
                clearInterval(animate);
            }
        }, 100);
    }

    // Анимация блока с качествами сервиса
    function showServiceConditions() {
        $('#aboutWrapper .service-conditions').addClass('fade-in');
    }
});