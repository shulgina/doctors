/**
 * Created by Ticco on 12/6/2014.
 */

$(document).ready(function () {

    var $loginFormModal = $('#loginFormModal');
    var $registerFormModal = $('#registerFormModal');
    var $forgotPasswordModal = $('#forgotPasswordModal');
    var $forgotPasswordButton = $('#forgotPasswordButton');
    var $registerBirthdateView = $('#registerBirthdateView:first');

    var $registerForm = $registerFormModal.find('#registerForm:first');

    var $registerButton = $('#registerButton');

    switch (window.location.hash) {
        case '#free-consultation':
            $('body,html')
                .animate({
                    scrollTop: $('#free-consultation-banner').offset().top - $('#header-wrapper')
                        .height()
                }, 1000, "swing");
            break;
        case '#login':
        case '#startOnDuty':
            $loginFormModal.modal('show');
            break;
        case '#register':
        case '#registerFormModal':
            $registerFormModal.modal('show');
            break;

        default:
    }

    $('#feedbacks').bxSlider({
        auto: false,
        infiniteLoop: false,
        hideControlOnEnd: true,
        pager: false,
        nextText: '',
        prevText: '',
        prevSelector: '#feedback-prev',
        nextSelector: '#feedback-next',
        maxSlides: 3,
        moveSlides: 2,
        slideWidth: '320',
        slideMargin: '0'
    });

    $('.vjs-big-play-button').click(function (e) {
        $('#videoCover').fadeOut(100);
    });

    var submitButton = $('#registerSubmit');

    if ($('#agree_tos').is(':checked')) {
        submitButton.removeClass('inactive');
    } else {
        submitButton.addClass('inactive');
    }
    $('#agreeCheckbox').click(function (e) {
        if ($('#agree_tos').is(':checked')) {
            submitButton.removeClass('inactive');
        } else {
            submitButton.addClass('inactive');
        }
    });


    var oneStepSubmitButton = $('#oneStepRegisterSubmit');

    if ($('#onestep_agree_tos').is(':checked')) {
        oneStepSubmitButton.removeClass('inactive');
    } else {
        oneStepSubmitButton.addClass('inactive');
    }

    $('#oneStepAgreeCheckbox').click(function (e) {
        if ($('#onestep_agree_tos').is(':checked')) {
            oneStepSubmitButton.removeClass('inactive');
        } else {
            oneStepSubmitButton.addClass('inactive');
        }
    });

    $('#loginform').submit(function (e) {
        e.preventDefault();
        var submitButton = $('#loginSubmit');
        var redirectTo = $(this).find('input[name="redirect"]').val();

        if (submitButton.hasClass('sending')) {
            return;
        }
        submitButton.addClass('sending');
        $.ajax({
            method: "GET",
            url: "/mobile/login/",
            data: $("#loginform").serialize(),
            dataType: 'json',
            success: function (data) {
                $('#forgot-password').modal('hide');
                if (data['status'] !== 'OK') {
                    switch (data['errors']) {
                        case g_errorConstants['MISSING_ARGUMENTS']:
                            $('#loginInputContainer').addClass('error');
                            $('#loginPassword').val('').trigger('change');
                            //$('#loginform .ext-input').each(function(){
                            //    if (!$(this).hasClass('dirty')) $(this).addClass('error');
                            //    $('#loginPassword').val('').trigger('change');
                            //});
                            break;
                        case g_errorConstants['INVALID_USERNAME_OR_PASSWORD']:
                            $('#loginInputContainer').addClass('error');
                            $('#loginPassword').val('').trigger('change');
                            break;
                        case g_errorConstants['USER_DISABLED']:
                            PopupError('Пользователь заблокирован.');
                            $('#loginPassword').val('').trigger('change');
                            break;
                        default :
                            $('#loginInputContainer').addClass('error');
                            $('#loginPassword').val('').trigger('change');
                            //TODO: create all possible cases with their error-alerting popups...
                            console.log(data['errors']);
                    }
                } else {
                    DeleteCookie('showCompatibilityBar');
                    SendGALogin();
                    CloseModal('loginFormModal');
                    PopupSuccess('Вход удался, сейчас будет перенаправление.');

                    if (redirectTo) {
                        document.location.href = redirectTo;
                    } else {
                        document.location.reload(true);
                    }
                }
            },
            error: function () {
                console.log('Request error');
                PopupError('Ошибка соединения с сервером.');
            },
            complete: function () {
                submitButton.removeClass('sending');
            }
        });
    });

    $('#forgot-password').submit(function (e) {
        var submitButton = $('#submitForgotPasswordForm');
        e.preventDefault();
        if (submitButton.hasClass('sending')) {
            return;
        }
        submitButton.addClass('sending');
        $.ajax({
            method: "GET",
            url: "/mobile/user/password/send_email/",
            data: $("#forgot-password").serialize(),
            dataType: 'json',
            success: function (data) {
                $('#forgot-password').modal('hide');
                if (data['status'] !== 'OK') {
                    switch (data['errors']) {
                        case g_errorConstants['INVALID_EMAIL']:
                        case 'invalid_length_email':
                            $('#forgotPassInputContainer').addClass('error');
                            break;
                        default :
                            //TODO: create all possible cases with their error-alerting popups...
                            console.log(data['errors']);
                    }
                } else {
                    CloseModal('forgotPasswordModal');
                    PopupSuccess('Письмо выслано, проверьте почтовый ящик.');
                }
            },
            complete: function () {
                submitButton.removeClass('sending');
            }
        });
    });

    $registerForm.submit(function (e) {
        e.preventDefault();
        var submitButton = $('#registerSubmit');
        if (submitButton.hasClass('sending')) {
            return;
        }
        var emailContainer = $('#registerEmailContainer');
        var emailInput = $('#registerEmail');
        var passwordContainer = $('#registerPassContainer');
        var passwordInput = $('#registerPassword');
        var passwordConfirmContainer = $('#registerPassConfirmContainer');
        var passwordConfirmInput = $('#registerPasswordConfirm');
        var phoneContainer = $('#phoneContainer');
        var phoneInput = $('#changePhone');
        var firstnameContainer = $('#registerFirstnameContainer');
        var firstnameInput = $('#registerFirstname');
        var secondnameContainer = $('#registerSecondnameContainer');
        var secondnameInput = $('#registerSecondname');
        var middlenameContainer = $('#registerMiddlenameContainer');
        var middlenameInput = $('#registerMiddlename');
        var birthdateViewContainer = $('#registerBirthdateContainer');
        var birthdateViewInput = $('#registerBirthdateView');

        var allFilled = true;

        if (!checkInputDate()) {
            allFilled = false;
        }

        if (emailInput.val() == '') {
            submitButton.removeClass('sending');
            allFilled = false;
            emailContainer.addClass('error').find('.error-text').text('Заполните поле');
        }
        if (passwordInput.val() == '') {
            submitButton.removeClass('sending');
            allFilled = false;
            passwordContainer.addClass('error').find('.error-text').text('Заполните поле');
        }
        if (emailInput.val() != '' && passwordInput.val() !== passwordConfirmInput.val()) {
            submitButton.removeClass('sending');
            allFilled = false;
            passwordConfirmContainer.addClass('error').find('.error-text').text('Введенные пароли не совпадают');
        }
        if (phoneInput.val() == '') {
            submitButton.removeClass('sending');
            allFilled = false;
            phoneContainer.addClass('error').find('.error-text').text('Неверный номер');
        }
        if (firstnameInput.val() != '' || secondnameInput.val() != '' || middlenameInput.val() != '') {
            if (firstnameInput.val() == '') {
                allFilled = false;
                submitButton.removeClass('sending');
                firstnameContainer.addClass('error').find('.error-text').text('Заполните поле');
            }
            if (secondnameInput.val() == '') {
                allFilled = false;
                submitButton.removeClass('sending');
                secondnameContainer.addClass('error').find('.error-text').text('Заполните поле');
            }
            if (middlenameInput.val() == '') {
                allFilled = false;
                submitButton.removeClass('sending');
                middlenameContainer.addClass('error').find('.error-text').text('Заполните поле');
            }
        }

        if (allFilled) {

            submitButton.addClass('sending');
            var thisForm = $('#registerForm');
            var sendingData = thisForm.serialize();

            $.ajax({
                url: '/mobile/user/register/',
                method: 'GET',
                data: sendingData,
                dataType: 'json',
                success: function (data) {
                    if (data.status === 'error') {
                        var errorTypes = data.errors.split(';');

                        if ($.inArray('empty_email', errorTypes) > -1) {
                            emailContainer.addClass('error')
                                          .find('.error-text')
                                          .text('Заполните поле');
                        }
                        if ($.inArray(g_errorConstants['MAIL_DUPLICATED'], errorTypes) > -1) {
                            emailContainer.addClass('error')
                                          .find('.error-text')
                                          .text('Почта используется');
                        }
                        if ($.inArray(g_errorConstants['INVALID_EMAIL'], errorTypes) > -1
                            || $.inArray('invalid_length_email', errorTypes) > -1) {
                            emailContainer.addClass('error')
                                          .find('.error-text')
                                          .text('Неверный формат');
                        }
                        if ($.inArray(g_errorConstants['USER_ALREADY_REGISTRATED'], errorTypes) > -1) {
                            emailContainer.addClass('error')
                                          .find('.error-text')
                                          .text('Адрес почты занят');
                        }
                        if ($.inArray('empty_password', errorTypes) > -1) {
                            passwordContainer.addClass('error')
                                             .find('.error-text')
                                             .text('Заполните поле');
                        }
                        if ($.inArray('invalid_length_password', errorTypes) > -1) {
                            passwordContainer.addClass('error')
                                             .find('.error-text')
                                             .text('Минимум 6 символов');
                        }
                        if ($.inArray('empty_phone', errorTypes) > -1) {
                            phoneContainer.addClass('error')
                                          .find('.error-text')
                                          .text('Заполните поле');
                        }
                        if ($.inArray('empty_agree_tos', errorTypes) > -1) {
                            PopupError('Вы не приняли условия использования услуги.');
                        }
                        if ($.inArray(g_errorConstants['PHONE_DUPLICATED'], errorTypes) > -1) {
                            phoneContainer.addClass('error')
                                          .find('.error-text')
                                          .text('Номер занят');
                        }
                        if ($.inArray(g_errorConstants['WRONG_NAME'], errorTypes) > -1) {
                            firstnameContainer.addClass('error')
                                              .find('.error-text')
                                              .text('Неверный формат');
                        }

                        if ($.inArray(g_errorConstants['INVALID_LENGTH_FIRST_NAME'], errorTypes) > -1) {
                            firstnameContainer.addClass('error')
                                              .find('.error-text')
                                              .text('Недопустимая длина символов');
                        }
                        if ($.inArray(g_errorConstants['EMPTY_SECOND_NAME'], errorTypes) > -1) {
                            secondnameContainer.addClass('error')
                                               .find('.error-text')
                                               .text('Заполните поле');
                        }
                        if ($.inArray(g_errorConstants['INVALID_LENGTH_SECOND_NAME'], errorTypes) > -1) {
                            secondnameContainer.addClass('error')
                                               .find('.error-text')
                                               .text('Недопустимая длина символов');
                        }
                        if ($.inArray(g_errorConstants['WRONG_SECOND_NAME'], errorTypes) > -1) {
                            secondnameContainer.addClass('error')
                                               .find('.error-text')
                                               .text('Неверный формат');
                        }
                        if ($.inArray(g_errorConstants['EMPTY_MIDDLE_NAME'], errorTypes) > -1) {
                            middlenameContainer.addClass('error')
                                               .find('.error-text')
                                               .text('Заполните поле');
                        }
                        if ($.inArray(g_errorConstants['INVALID_LENGTH_MIDDLE_NAME'], errorTypes) > -1) {
                            middlenameContainer.addClass('error')
                                               .find('.error-text')
                                               .text('Неверная длина символов');
                        }
                        if ($.inArray(g_errorConstants['WRONG_MIDDLE_NAME'], errorTypes) > -1) {
                            middlenameContainer.addClass('error')
                                               .find('.error-text')
                                               .text('Неверный формат');
                        }
                        if ($.inArray(g_errorConstants['ERROR_WITH_MESSAGE'], errorTypes) > -1) {
                            PopupError(data.message);
                        }

                    } else {
                        $.ajax({
                            url: '/mobile/login/',
                            method: 'GET',
                            data: sendingData,
                            dataType: 'json',
                            success: function (data) {
                                var STATUS_ACTIVE_STR = 'active';

                                if (data.status !== 'error') {
                                    SendGARegister();
                                    CloseModal('registerFormModal');
                                    PopupSuccess('Регистрация удалась, сейчас будет перенаправление.');

                                    var now = new Date().getTime();
                                    var activate = data['user_status'] == STATUS_ACTIVE_STR ? '' : ('?' + now + '#notActiveUser');

                                    document.location.href = '/user_details/' + activate;
                                } else if (data.message) {
                                    PopupError(data.message);
                                } else {
                                    PopupError('Вход не удался, попробуйте войти на аккаунт вручную.');
                                }
                            }
                        });
                    }
                },
                error: function (data) {
                    PopupError('Регистрация не удалась, попробуйте снова.');
                    console.log('Request error');
                },
                complete: function () {
                    $('#registerSubmit').removeClass('sending');
                }
            });
        }
    });

    $registerButton.click(function () {
        $registerFormModal.modal('show');
        return false;
    });

    $forgotPasswordButton.click(function () {
        $loginFormModal.modal('hide').one('hidden.bs.modal', function () {
            $forgotPasswordModal.modal('show');
        });
        return false;
    });

    $registerBirthdateView.on('keydown', function (e) {
        var code = e.keyCode;
        var $this = $(this);
        var value = $this.val();
        var len = value.length;

        if (
            e.ctrlKey
            || (code >= 48 && code <= 57)
            || (code >=96 && code <= 105)
            || (code >= 37 && code <= 40)
            || code == 8 || code == 9 || code == 13
        ) {
            if (code == 8) {
                if (len == 4 || len == 7) {
                    $this.val(value.slice(0, -1));
                }
            } else {
                if (len == 2 || len == 5) {
                    $this.val(value + '.');
                }
            }
        } else {
            return false;
        }
    });

    $registerBirthdateView.on('blur', function () {
        var $this = $(this);
        if ($this.val() === '') {
            $this.parents('#registerBirthdateContainer').removeClass('dirty');
        }
    });

    function checkInputDate() {
        var $container = $('#registerBirthdateContainer');
        var $input = $('#registerBirthdateView');
        var $birthdateInput = $container.find('#registerBirthdate:last');

        var inputVal = $input.val();

        if (inputVal != '') {
            var dateNow = new Date();
            var d = dateNow.getDate();
            var m = dateNow.getMonth() + 1;
            var y = dateNow.getFullYear();
            var dateNowStr = y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d);

            var dateParts = inputVal.split('.');
            var birthdate = dateParts[2] + '-' + dateParts[1] + '-' + dateParts[0];

            if ((dateNowStr >= birthdate) && dateParts[2] > 1900 && (dateParts[1] > 0 && dateParts[1] <= 12) && (dateParts[0] > 0 && dateParts[0] <= 31)) {
                $birthdateInput.val(birthdate);

                return true;
            } else {
                $container.addClass('error').find('.error-text').text('Неверная дата');

                return false;
            }
        }

        return true;
    }

    $loginFormModal.on('show.bs.modal', function (e) {
        var $inputRedirect = $(this).find('input[name="redirect"]');
        var redirectTo = $(e.relatedTarget).data('redirect');

        $inputRedirect.val(redirectTo);
    });
});
