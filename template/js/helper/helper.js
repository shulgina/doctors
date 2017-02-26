$(document).ready(function () {
    var typing_start_interval = null;
    var typing_finish_timeout = null;

    setTimeZone();

    $('ul.selectors li').click(function () {
        if (!$(this).hasClass('active')) {
            $('ul.selectors li').removeClass('active');
            $(this).addClass('active');

            $('ul.steps.visible').removeClass('visible');
            $('ul.steps.steps-' + $(this).data('type')).addClass('visible');
        }
    });

    InitPerfectScrollbar();

    $('.ext-checkbox').click(function (e) {
        if (e.target.nodeName === 'A') {
            return;
        }
        e.preventDefault();
        $(this).parent()
               .find('.hiddenCheckbox')
               .trigger('click');
        if ($(this).parent()
                   .find('.hiddenCheckbox')
                   .is(':checked')) {
            $(this).addClass('selected');
        } else {
            $(this).removeClass('selected');
        }
    });

    $('.ext-input input[type=text], .ext-input input[type=password], .ext-input textarea')
        .on('change keyup paste click', function () {
            var inputWrapper = $(this).parents('.ext-input');
            inputWrapper.removeClass('error');
            if ($(this).val() != '') {
                inputWrapper.addClass('dirty');
            } else {
                inputWrapper.removeClass('dirty');
            }
        });

    var stopTyping = function () {
        clearInterval(typing_start_interval);

        typing_finish_timeout = typing_start_interval = null;

        CM.sendTypingStatus(false);
    };

    $('.input-msg').on('keypress paste', function (e) {
        if (CM.IsSendingMessage()) {
            e.preventDefault();
        }

        if (CM.request.currentRequest.unread > 0) {
            CM.markRequestAsRead(CM.request.currentRequest.requestId);
        }

        if (e.keyCode == 13) {
            if (e.ctrlKey || e.shiftKey) {

            } else {
                e.preventDefault();

                stopTyping();

                $(this).parents('form').submit();
            }
        }
        CM.autoResizeHeight(this);
    }).on('keydown', function () {

        //Запуск обновления статуса ввода текста
        if (!typing_start_interval) {
            CM.sendTypingStatus(true);

            typing_start_interval = setInterval(function () {
                CM.sendTypingStatus(true);
            }, 4000);
        }

        //Перезапуск счетчика времени, отвечающего за остановку обновления статуса ввода
        if (typing_finish_timeout) {
            clearTimeout(typing_finish_timeout);
        }

        typing_finish_timeout = setTimeout(stopTyping, 5000);

    });

    $('#certificateModal').on('hidden.bs.modal', function () {
        $(this).find('.modal-dialog')
               .removeAttr('style')
               .end()
               .find('#zoomedCertificate')
               .attr('src', '');
    });

    $('.dropdown-menu.selectable .item').click(function (e) {
        e.preventDefault();

        var $dropdown_menu = $(this).parents('.dropdown-menu.selectable:first');
        var $ext_select_wrapper = $(this).parents('.ext-select-wrapper:first');

        $dropdown_menu.find('.item').removeClass('selected');
        $(this).addClass('selected');

        $ext_select_wrapper.find('.ext-select-label')
                           .text($(this).text());
        $ext_select_wrapper.find('.ext-select-value')
                           .val($(this).find('.prof-name').data('id'));
    });

    var $phoneControl = $('.phone-control');
    if ($phoneControl.data('state') === 'loaded') {
        if (typeof $phoneControl.data('set') !== 'undefined'
            && $phoneControl.data('set') != '') {
            setActiveCode($phoneControl, $phoneControl.data('set'));
        } else {
            setActiveCode($phoneControl, 'ru');
        }
    }

    $(".phone-control .list-container li").click(function () {
        var $phone_control = $(this).parents('.phone-control:first');

        setActiveCode($phone_control, $(this).data("flag"));

        $phone_control.find('#tmp-phone')
                      .val('')
                      .trigger('change');
    });

    $('#feedback-contact-form').submit(function (e) {
        e.preventDefault();
        var submitButton = $('#sendContact');
        if (submitButton.hasClass('sending')) {
            return;
        }
        var nameContainer = $('#feedbackNameContainer');
        var nameInput = $('#feedbackName');
        var emailContainer = $('#feedbackEmailContainer');
        var emailInput = $('#feedbackEmail');
        var subjectContainer = $('#feedbackSubjectContainer');
        var subjectInput = $('#feedbackSubject');
        var textContainer = $('#feedbackTextContainer');
        var textInput = $('#feedbackText');

        var allFilled = true;

        if (emailInput.val() == '') {
            $('#submitButton').removeClass('sending');
            allFilled = false;
            emailContainer.addClass('error')
                          .find('.error-text')
                          .text('Заполните поле');
        }

        if (nameInput.val() == '') {
            $('#submitButton').removeClass('sending');
            allFilled = false;
            nameContainer.addClass('error')
                         .find('.error-text')
                         .text('Заполните поле');
        }

        if (subjectInput.val() == '') {
            $('#submitButton').removeClass('sending');
            allFilled = false;
            subjectContainer.addClass('error')
                            .find('.error-text')
                            .text('Заполните поле');
        }

        if (textInput.val() == '') {
            $('#submitButton').removeClass('sending');
            allFilled = false;
            textContainer.addClass('error')
                         .find('.error-text')
                         .text('Заполните поле');
        }

        if (allFilled) {
            submitButton.addClass('sending');
            var thisForm = $('#feedback-contact-form');
            var sendingData = thisForm.serialize();

            $.ajax({
                url: '/mobile/enquiry/',
                method: "POST",
                data: sendingData,
                dataType: 'json',
                success: function (data) {
                    if (data.status === 'error') {
                        var errorTypes = data.errors.split(';');
                        console.log(errorTypes);

                        if ($.inArray('no_first_name', errorTypes) > -1) {
                            nameContainer.addClass('error')
                                         .find('.error-text')
                                         .text('Заполните поле');
                        }
                        if ($.inArray('no_email', errorTypes) > -1) {
                            emailContainer.addClass('error')
                                          .find('.error-text')
                                          .text('Заполните поле');
                        }
                        if ($.inArray('empty_email', errorTypes) > -1) {
                            emailContainer.addClass('error')
                                          .find('.error-text')
                                          .text('Заполните поле');
                        }
                        if ($.inArray(g_errorConstants['INVALID_EMAIL'], errorTypes) > -1
                            || $.inArray('invalid_length_email', errorTypes) > -1) {
                            emailContainer.addClass('error')
                                          .find('.error-text')
                                          .text('Неверный формат');
                        }
                        if ($.inArray('no_subject', errorTypes) > -1) {
                            subjectContainer.addClass('error')
                                            .find('.error-text')
                                            .text('Заполните поле');
                        }
                        if ($.inArray('no_text', errorTypes) > -1) {
                            textContainer.addClass('error')
                                         .find('.error-text')
                                         .text('Заполните поле');
                        }
                    } else {
                        PopupSuccess('Сообщение отправлено администрации проекта.');

                        nameInput.val('');
                        emailInput.val('');
                        subjectInput.val('');
                        textInput.val('');
                        nameContainer.removeClass('dirty error');
                        emailContainer.removeClass('dirty error');
                        subjectContainer.removeClass('dirty error');
                        textContainer.removeClass('dirty error');

                    }
                },
                error: function (data) {
                    PopupError('Отправка не удалась, попробуйте снова.');
                    console.log('Request error');
                },
                complete: function () {
                    submitButton.removeClass('sending');
                }
            });
        }

    });

    if ($('body').hasScrollBar()) {
        $('#header-wrapper').addClass('scroll');
    }

    $('.navigation .teaser').click(function () {
        if ($('#free-consultation-banner').length > 0) {
            $('body,html')
                .animate({
                    scrollTop: $('#free-consultation-banner').offset().top - $('#header-wrapper')
                        .height()
                }, 1000, "swing");
        } else {
            document.location.href = '/#free-consultation';
        }
    });

    $('#goToCalendar').click(function () {
        $('#openCalendar').trigger('click');
        $('#doctorProfileTabs .profile').removeClass('active');
        $('#doctorProfileTabs .calendar').addClass('active');
    });

    $('#tmp-phone').on('change keyup paste click', function () {
        var phone = '' + $("#code").val() + $(this).val();
        var arr = phone.match(/^\d{10,12}$/);
        if (arr != null
            && arr[0]) {
            $("#changePhone").val(phone)
                             .trigger('change');
        } else {
            $("#changePhone").val('')
                             .trigger('change');
        }
    });

    $(this).scroll(function () {
        var $elem = $('.auto-click-button:visible');

        if ($elem.length) {
            var $window = $(window);

            var docViewTop = $window.scrollTop();
            var docViewBottom = docViewTop + $window.height();

            var elemTop = $elem.offset().top;
            var elemBottom = elemTop + $elem.height();

            if ((elemBottom <= docViewBottom) && (elemTop >= docViewTop)) {
                $elem.trigger('click');
            }
        }
    });

    $('body').popover({
        selector: '[data-toggle="popover"]:not([class~="codeword-info"])',
        'html': true,
        'trigger': 'hover',
        'placement': 'auto',
        'container': 'body',
        'delay': 100
    });
});
