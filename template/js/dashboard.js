"use strict";

/**
 * Created by Ticco on 12/6/2014.
 */

function OpenCreateOndutyPopup(price, balance, type) {
    if ($('.needsWS').hasClass('inactive')) {
        return;
    }

    var $order_wrapper = $('#confirmCreation').find('.order-wrapper'),
        $description = $order_wrapper.find('.description .price'),
        $current_balance = $order_wrapper.find('.current-balance .balance'),
        $will_charge = $order_wrapper.find('.will-charge .price'),
        $createOnDuty = $('#createOnDuty');

    $description.text(price);
    $current_balance.text(balance);

    if (price > balance) {
        $will_charge.text(price - balance);
    }

    if (price <= balance) {
        $createOnDuty.text('Начать');
    }

    if (type == 'therapist') {
        $('#confirmCreation').attr('data-type', 'therapist');
        $('#inputPromoModal').find('input[name="idst"]').val(4);
    } else if (type == 'pediatr') {
        $('#confirmCreation').attr('data-type', 'pediatr');
        $('#inputPromoModal').find('input[name="idst"]').val(1);
    } else {
        return false;
    }

    if (!testManager.testingWS) {
        if (!testManager.testModuleResults.ws) {
            $('#browserNotSupportedModal').modal('show');
            return;
        }
        $('#confirmCreation').modal('show');
    } else {
        setTimeout(function () {
            OpenCreateOndutyPopup();
        }, 200);
    }
}

$(document).ready(function () {
    var $orderChosenWrapper = $('.order-chosen-wrapper');

    var doctor_list = new Controls.DoctorList($orderChosenWrapper, '/doctors/list/', true);

    // Консультация дежурного педиатра. Обработка соглашения с условиями.
    $('#confirmCreation #agree_terms').on('change', function () {

        var submitOndutyBut = $('#confirmCreation').find('#createOnDuty');
        if ($(this).is(':checked')) {
            submitOndutyBut.removeClass('inactive');
        } else {
            submitOndutyBut.addClass('inactive');
        }
    });

    $('#confirmCreation #openPromoFields').click(function (e) {
        e.preventDefault();

        var $inputPromoModal = $('#inputPromoModal');

        CloseModal('confirmCreation');

        $inputPromoModal.modal('show');
    });

    $('#openPaymentFields').click(function (e) {
        e.preventDefault();

        CloseModal('inputPromoModal');

        ShowModal('confirmCreation');
    });


    $('#payForPromo').click(function (e) {
        e.preventDefault();

        var submitButton = $(this);
        var thisForm = submitButton.parents('.modal-content:first');

        if (submitButton.hasClass('inactive')
            || submitButton.hasClass('sending')) {
            return;
        }

        submitButton.addClass('sending');

        thisForm.find('.ext-input')
                .removeClass('error')
                .find('.error-text')
                .text('');

        var idInput = thisForm.find('input[name="cw"]');
        var idoInput = thisForm.find('input[name="ido"]');
        var idstInput = thisForm.find('input[name="idst"]');

        var allFilled = true;

        if ($.trim(idInput.val()) == '') {
            allFilled = false;
            idInput.parents('.ext-input:first')
                   .addClass('error')
                   .find('.error-text')
                   .text('Заполните поле');
        }

        if (allFilled) {

            var sendingData = {
                cw: idInput.mask(),
                ido: idoInput.val(),
                idst: idstInput.val(),
                iddoctor: 0
            };

            $.ajax({
                url: '/mobile/user/subscribe_to_polis/',
                method: 'POST',
                data: sendingData,
                dataType: 'json',
                success: function (data) {
                    var $modals = $('#confirmCreation');

                    if (data.status === 'error') {
                        if (data.err_c == g_errorConstants['ERROR_CODEWORD']) {
                            idInput.parents('.ext-input:first')
                                   .addClass('error')
                                   .find('.error-text')
                                   .text('Заполните поле');
                        } else {
                            PopupError(data.message, 'Ошибка');
                        }
                    } else {
                        var balance = data['balance'];

                        var sum = data.price - balance;

                        $modals.find('span.description span.price')
                               .text(data.price);
                        $modals.find('span.will-charge span.price')
                               .text(sum > 0 ? sum : 0);
                        $modals.find('div.modal-footer #createOnDuty')
                               .text(sum > 0 ? 'Оплатить' : 'Начать');

                        $('#openPaymentFields').trigger('click');
                    }
                },
                error: function (error) {
                    PopupError('Подключение не удалось, связь с сервером прервана.', 'Ошибка');
                },
                complete: function () {
                    submitButton.removeClass('sending');
                }
            });
        }
    });

    $('#confirmCreation #createOnDuty').click(function () {
        if ($(this).hasClass('inactive')) {
            return;
        }
        var submitButton = $(this),
            url = '',
            uniteller_url = '';

        if (submitButton.hasClass('sending')) {
            return;
        }

        if ($('#confirmCreation').attr('data-type') == 'therapist') {
            url = '/mobile/user/create_on_duty_request_therapist/';
            uniteller_url = '/mobile/user/get_uniteller_links/?type=on_duty_therapist';
        } else if ($('#confirmCreation').attr('data-type') == 'pediatr') {
            url = '/mobile/user/create_on_duty_request/';
            uniteller_url = '/mobile/user/get_uniteller_links/?type=on_duty';
        } else {
            return;
        }

        submitButton.addClass('sending');

        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                if (data['status'] !== 'OK') {
                    switch (data['errors']) {
                        case g_errorConstants['ERROR_WITH_MESSAGE']:
                        case g_errorConstants['NO_DOCTOR_WORKING']:
                        case g_errorConstants['SLOT_ALREADY_TAKEN']:
                        case g_errorConstants['MUST_BE_LOGGED_IN']:
                        case g_errorConstants['DOCTOR_DOES_NOT_WORK']:
                            PopupError(data.message);

                            break;

                        case g_errorConstants['NOT_ENOUGH_CREDITS']:
                            SendGAConsultationCreated();
                            $.ajax({
                                url: uniteller_url,
                                dataType: 'json',
                                success: function (e) {
                                    if (e.status === 'OK') {
                                        if (e.data.shop_id) {
                                            $('#uniteller_form input[name="Shop_IDP"]').val(e.data.shop_id);
                                            $('#uniteller_form input[name="Order_IDP"]').val(e.data.order_id);
                                            $('#uniteller_form input[name="Subtotal_P"]').val(e.data.price);
                                            $('#uniteller_form input[name="Signature"]').val(e.data.signature);
                                            $('#uniteller_form input[name="Phone"]').val(e.data.phone);
                                            $('#uniteller_form input[name="Email"]').val(e.data.email);
                                            $('#uniteller_form').submit();
                                        } else {
                                            document.location.reload(true);
                                        }
                                    }
                                }
                            });
                            break;
                        case g_errorConstants['USER_NOT_ACTIVATED']:
                            $('#activateProfileFormModal').modal('show');
                            break;
                        case g_errorConstants['INTERNAL_ERROR']:
                            PopupError('Неизвестная ошибка.');
                            break;

                        default :
                            //TODO: create all possible cases with their error-alerting popups...
                            PopupError('Неизвестная ошибка.');
                            console.log(data['errors']);
                    }
                } else {
                    SendGAConsultationCreated();
                    $('#confirmCreation').modal('hide');
                    CM.redirectToHistory(data.request.id, true);
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

});