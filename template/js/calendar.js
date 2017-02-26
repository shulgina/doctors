"use strict";

//Конструктор для создания объектов, работающих с календарем
//пациента
function CalendarUser(params) {
//    calendar, iddoctor, idpatient, confirmRequestModal, messageTitle, urlSchedule, urlCreateRequest, idrequest

    var m_params = params || {
            'calendar': null,
            'iddoctor': null,
            'idpatient': null,
            'confirm_request_creation_modal': null,
            'message_title': null,
            'url_get_schedule': null,
            'url_request_create': null,
            'idrequest': null
        };

    var me = this;
    var scheduleAjax = null;
    var schedule = [];
    var schedule_count = {};
    var user_appointments = [];
    var doctor_appointments = [];
    var doctor_reserves = [];
    var m_message_title = m_params['message_title'] ? m_params['message_title'] : undefined;
    var m_calendar = m_params['calendar'] ? m_params['calendar'] : undefined;
    var $m_calendar_wrapper = m_params['calendar'].parents('.calendar-wrapper:first');
    var m_url_schedule = m_params['url_get_schedule'] ? m_params['url_get_schedule'] : '/mobile/user/get_schedule/';
    var m_url_get_user_appointments = m_params['url_get_user_appointments'] ? m_params['url_get_user_appointments'] : '/mobile/user/get_user_appointments_with_doctor/';
    var m_url_create_request = m_params['url_request_create'] ? m_params['url_request_create'] : '/mobile/user/create_request/';
    var m_request_success_callback = m_params['request_success_callback'] ? m_params['request_success_callback'] : function () {
    };

    me.iddoctor = m_params['iddoctor'];
    me.idpatient = m_params['idpatient'];
    me.idrequest = m_params['idrequest'];
    me.confirm_request_modal = m_params['confirm_request_creation_modal'];
    me.m_new_appointment = null;

    me.getSchedules = function (now) {
        var calendar_date = m_calendar.datepicker('getDate');

        var year = calendar_date.getFullYear();
        var month = calendar_date.getMonth() + 1;
        //
        //if (now
        //    || !year
        //    || !month) {
        //    var d = new Date();
        //
        //    month = d.getMonth() + 1;
        //    year = d.getFullYear();
        //}

        schedule = [];

        me.Loading();

        return $.ajax({
            url: m_url_schedule,
            data: {
                id: me.iddoctor,
                month: month,
                year: year
            },
            dataType: 'json',
            success: function (data) {
                if (data.status === 'error') {

                } else {
                    var start_time, start_timeArr, start_hour, start_min,
                        end_hour, end_min, date_arr, date_compnents, year_str,
                        month_str, day_str, date_str;

                    schedule_count = 0;

                    var chtml = {};

                    for (var i = 0; i < data.schedule.length; i++) {
                        date_compnents = data.schedule[i].schedule_date_time.split(' ');

                        start_time = date_compnents[1];
                        start_timeArr = start_time.split(':');
                        start_hour = start_timeArr[0];
                        start_min = start_timeArr[1];

                        if (start_min == 30) {
                            end_hour = parseInt(start_hour) + 1;
                            if (end_hour < 10) {
                                end_hour = '0' + end_hour;
                            }
                            end_min = '00';
                        } else {
                            end_hour = start_hour;
                            end_min = '30';
                        }
                        data.schedule[i].working_time_period_start = start_hour
                                                                     + ':'
                                                                     + start_min;
                        data.schedule[i].working_time_period_finish = end_hour
                                                                      + ':'
                                                                      + end_min;

                        date_arr = date_compnents[0].split('-');

                        year_str = date_arr[0];
                        month_str = ('0' + date_arr[1]).slice(-2);
                        day_str = ('0' + date_arr[2]).slice(-2);
                        date_str = year_str + month_str + day_str;

                        chtml[date_str] = '<div class="hasScheduled visible"></div>';
                    }

                    schedule = data.schedule;
                    m_calendar.data('datepicker')['custom-html'] = chtml;
                }

                scheduleAjax = me.getAppointments(now, month, year);
            }
        });
    };

    me.ClearHours = function () {
        var hours_div = $m_calendar_wrapper.find('.hoursDiv:first');
        hours_div.html('');
    };

    me.Loading = function () {
        var hours_div = $m_calendar_wrapper.find('.hoursDiv:first');

        hours_div.html('<span class="no-periods">Загружается...</span>');
    };

    me.SetSelectedDate = function () {
        var hours_div = $m_calendar_wrapper.find('.hoursDiv:first');
        var day_detailed = $m_calendar_wrapper.find('.dayDetailed:first');

        day_detailed.scrollTop(0);

        me.ClearHours();

        hours_div.append('<div class="column-1"></div>');
        hours_div.append('<div class="column-2"></div>');

        var column1 = hours_div.find('.column-1');
        var column2 = hours_div.find('.column-2');

        var selDate = m_calendar.datepicker('getDate');
        var selMonth = selDate.getMonth();
        var selDay = selDate.getDate();
        var selYear = selDate.getFullYear();
        var thisYear = (new Date()).getFullYear();

        var userApp = null;
        for (var i = 0; i < user_appointments.length && !userApp; ++i) {
            var ua_date = user_appointments[i].appointment_time.split(' ')[0];
            var ua_date_components = ua_date.split('-');
            if (ua_date_components[0] == selYear
                && ua_date_components[1] == selMonth + 1
                && ua_date_components[2] == selDay) {
                userApp = user_appointments[i];
            }
        }

        var firstClass = ' first';

        var currentSchedule = []; // Массив расписания текущего дня

        // Собираем расписание выбранного дня
        for (var i = 0; i < schedule.length; i++) {

            var ua_date = schedule[i].schedule_date_time.split(' ')[0];
            var ua_date_components = ua_date.split('-');

            if (ua_date_components[0] == selYear
                && ua_date_components[1] == selMonth + 1
                && ua_date_components[2] == selDay) {

                currentSchedule.push(schedule[i]);
            }
        }

        // Делим кол-во слотов на 2, чтобы разделить на две колонки
        var halfScheduleCount = Math.ceil(currentSchedule.length / 2);
        var hours_wrapper = column1;

        for (var i in currentSchedule) {

            if (i == halfScheduleCount) {
                hours_wrapper = column2;
            }

            var timePeriodStartStr = currentSchedule[i].working_time_period_start;
            var timePeriodFinishStr = currentSchedule[i].working_time_period_finish;
            var addClassB = '';
            var addClassH = '';
            var infoText = '';
            var doctBusy = false;
            var hasConsult = false;
            var hasConsultCurrent = false;

            var reserve = '';

            $.each(user_appointments, function (key, userApp) {
                if (userApp.appointment_time == currentSchedule[i].schedule_date_time) {
                    hasConsult = true;
                    if (userApp.doctor_id == me.iddoctor) {
                        hasConsultCurrent = true;
                    }
                }
            });

            if (currentSchedule[i].status == '2') {
                doctBusy = true;
            }

            $.each(doctor_reserves, function (doctReserve) {
                if (currentSchedule[i].id == doctReserve.schedule_id) {
                    if (doctReserve.id == me.idpatient) {
                        reserve = ' myReserve';
                    } else {
                        reserve = ' notMyReserve';
                    }
                }
            });

            var actionText = 'Назначить';

            if (doctBusy) {
                addClassB = ' doctBusy';
                infoText = 'на эту дату у доктора уже назначена консультация';
                actionText = 'Занято';
            }
            if (hasConsult) {
                addClassH = ' hasConsultUser';
                infoText = 'у вас уже назначена консультация на этот слот у другого врача';
                actionText = 'Назначено';
                if (hasConsultCurrent) {
                    addClassH = ' hasConsult';
                    infoText = 'у вас уже назначена консультация на эту дату';
                }
            }

            var periodDiv = $($('#schedule').html());
            periodDiv.addClass(addClassB + ' ' + addClassH + ' ' + firstClass + ' ' + reserve);
            periodDiv.attr('data-period', currentSchedule[i].schedule_id);
            periodDiv.find('.tick').attr('title', infoText).html(actionText);
            periodDiv.find('.time.start').html(timePeriodStartStr);
            periodDiv.find('.time.finish').html(timePeriodFinishStr);

            firstClass = '';
            hours_wrapper.append(periodDiv);
        }

        hours_div.find('.tick.needsWS')
                 .click(function (e) {
                     me.setApp(this);

                     me.confirm_request_modal
                       .find('.date')
                       .text(selDay + ' ' + monthNamesAlt[selMonth]);

                     var selTime = $(this).parents('.period')
                                          .find('.time:first')
                                          .html()
                                          .substring(-1, 5);
                     me.confirm_request_modal.find('.date').text(function () {
                         return $(this).text() + (selYear != thisYear ? ' ' + selYear : '') + ', ' + selTime;
                     });
                 });
        if (hours_div.text() == '') {
            hours_div.html('<span class="no-periods">Нет рабочих часов.</span>');
        }

        day_detailed.find('.date')
                    .text(selDay + ' ' + monthNamesAlt[selMonth]);

        me.confirm_request_modal
          .find('.date')
          .text(selDay + ' ' + monthNamesAlt[selMonth]);
    };

    me.getAppointments = function (now, month, year) {

        return $.ajax({
            url: m_url_get_user_appointments,
            data: {
                user_id: me.idpatient,
                doctor_id: me.iddoctor,
                month: month,
                year: year
            },
            dataType: 'json',
            success: function (data) {
                if (data.status === 'error') {

                } else {
                    user_appointments = data.user_appointments;
                    doctor_appointments = data.doctor_appointments;
                    doctor_reserves = data.doctor_reserves;
                }

                m_calendar.datepicker("refresh");

                var $wd = m_calendar.find('td:not(.not-working-day):first a');
                //if (now) {
                //    m_calendar.find('.ui-datepicker-today a')
                //            .trigger('click');
                //} else if ($wd.length) {
                //    $wd.trigger('click');
                //}

                me.SetSelectedDate();

                $('.custom-scrollbar').perfectScrollbar('update');
            }
        });
    };

    me.setApp = function (_tick) {
        var day_detailed = $m_calendar_wrapper.find('.dayDetailed:first');
        if (day_detailed.data('action') === 'create') {
            var tick = $(_tick);
            if (tick.parents('.period').hasClass('hasConsult')
                || tick.parents('.period').hasClass('hasConsultUser')
                || tick.parents('.period').hasClass('doctBusy')) {
                return;
            }

            me.m_new_appointment = tick.parents('.period');

            me.OpenCreateChosenPopup();
        } else {
            $('#loginFormModal').modal('show');
        }
    };

    me.setTick = function () {

        var submitButton = $('#payForChosen');
        if (submitButton.hasClass('sending')
            || submitButton.hasClass('inactive')) {
            return;
        }

        submitButton.addClass('sending');

        if (!me.m_new_appointment.hasClass('hasConsult')
            && !me.m_new_appointment.hasClass('doctBusy')) {
            var timePeriodCode = me.m_new_appointment.data('period');
            $.ajax({
                url: m_url_create_request,
                data: {
                    user_id: me.idpatient,
                    doctor_id: me.iddoctor,
                    request_id: me.idrequest,
                    schedule_id: timePeriodCode
                },
                dataType: 'json',
                success: function (data) {
                    if (data.status === 'error') {

                        switch (data['errors']) {
                            case g_errorConstants['NOT_ENOUGH_CREDITS']:
                                //   $('#refillBalanceModal').modal('show');
                                me.confirm_request_modal.modal('hide');
                                SendGAConsultationCreated();
                                me.ReserveSlot();

                                break;

                            case g_errorConstants['SLOT_ALREADY_TAKEN']:
                                me.confirm_request_modal.modal('hide');
                                PopupError(data['message'], m_message_title);

                                break;

                            case g_errorConstants['USER_NOT_ACTIVATED']:
                                $('#activateProfileFormModal').modal('show');

                                break;

                            case g_errorConstants['YOU_ALREADY_HAVE_APPOINTMENT_AT_THAT_TIME']:
                            case g_errorConstants['CANNOT_PLAN_APPOINTMENT_IN_PAST']:
                            case g_errorConstants['ERROR_WITH_MESSAGE']:
                                PopupError(data['message'], m_message_title);

                                break;

                            default :
                                me.confirm_request_modal.modal('hide');

                                var msg = data['message'] ? data['message'] : 'Неизвестная ошибка.';

                                PopupError(msg);
                                //TODO: create all possible cases with their error-alerting popups...
                                console.log(data['errors']);
                        }
                    } else {
                        me.confirm_request_modal.modal('hide');

                        me.getSchedules(false);

                        me.m_new_appointment.addClass('doctBusy hasConsult')
                          .find('tick')
                          .text('Назначено');

                        m_request_success_callback(data);
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
        } else {
            submitButton.removeClass('sending');
        }
    };

    me.setTickPromo = function () {
        var submitButton = $('#payForPromo');
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
                iduser: me.idpatient,
                iddoctor: me.iddoctor,
                cw: idInput.mask(),
                ido: idoInput.val(),
                idst: idstInput.val()
            };

            $.ajax({
                url: '/mobile/user/subscribe_to_polis/',
                method: 'POST',
                data: sendingData,
                dataType: 'json',
                success: function (data) {
                    if (data.status === 'error') {
                        if (data.err_c == g_errorConstants['ERROR_CODEWORD']) {
                            idInput.parents('.ext-input:first')
                                   .addClass('error')
                                   .find('.error-text')
                                   .text('Заполните поле');
                        } else {
                            PopupError(data.message, m_message_title);
                        }
                    } else {
                        var balance = data['balance'];

                        var sum = data.price - balance;

                        $('#confirmRequestCreationModal').find('span.description span.price')
                                                         .text(data.price);
                        $('#confirmRequestCreationModal').find('span.will-charge span.price')
                                                         .text(sum > 0 ? sum : 0);
                        $('#confirmRequestCreationModal').find('div.modal-footer span#payForChosen')
                                                         .text(sum > 0 ? 'Оплатить' : 'Записаться');

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
    };

    me.ReserveSlot = function () {
        if (!me.m_new_appointment.hasClass('hasConsult')
            && !me.m_new_appointment.hasClass('doctBusy')) {

            var timePeriodCode = me.m_new_appointment.data('period');
            $.ajax({
                url: '/mobile/user/reserve_slot/',
                data: {
                    user_id: me.idpatient,
                    doctor_id: me.iddoctor,
                    schedule_id: timePeriodCode
                },
                dataType: 'json',
                success: function (data) {
                    $('#refillBalanceModal').modal('hide');
                    if (data.status === 'error') {
                        switch (data['errors']) {
                            case g_errorConstants['YOU_ALREADY_HAVE_ACTIVE_RESERVE']:
                                PopupError('Резервация не удалась. На ваше имя уже зарезервирован слот.', m_message_title);
                                break;
                            case g_errorConstants['SLOT_ALREADY_TAKEN']:
                                PopupError(data['message'], m_message_title);
                                break;
                            default :
                                PopupError('Вы не успели оплатить консультацию за выделенное время. Внесенные средства находятся на вашем балансе. Попробуйте зарезервировать время консультации снова.', m_message_title);
                                console.log(data['errors']);
                        }
                    } else {
                        $.ajax({
                                url: '/mobile/user/get_uniteller_links/',
                                data: {
                                    //user_id: me.idpatient,
                                    doctor_id: $('#doctId').val(),
                                    type: 'chosen'
                                },
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
                            }
                        );
                    }
                    return false;
                }
            });
        }
    };

    $.datepicker._generateHTML = function (inst) {
        return this._generateHTMLNew(inst);
    };

    if (m_calendar.data('datepicker')) {
        m_calendar.datepicker('destroy');
    }

    m_calendar.datepicker({
        inline: true,
        showOtherMonths: true,
        dateFormat: 'yy-mm-dd',
        dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        monthNames: monthNames,
        firstDay: 1,
        onChangeMonthYear: function (year, month, widget) {
            if (scheduleAjax) {
                scheduleAjax.abort();
            }

            var day;

            var curDate = new Date();
            if (curDate.getFullYear() == year
                && curDate.getMonth() == month - 1) {
                day = curDate.getDate();
            } else {
                day = 1;
            }
            m_calendar.datepicker('setDate', new Date(year, month - 1, day));

            //shown_year = year;
            //shown_month = month;
            //
            me.getSchedules(false);
        },
        beforeShowDay: function (date) {
            var year = date.getFullYear();
            var month = ('0' + (date.getMonth() + 1)).slice(-2);
            var day = ('0' + date.getDate()).slice(-2);

            var month_str = ('0' + (date.getMonth() + 1)).slice(-2);
            var day_str = ('0' + date.getDate()).slice(-2);

            var now_date = new Date();
            var now_year = now_date.getFullYear();
            var now_month = now_date.getMonth() + 1;
            var now_day = now_date.getDate();

            var classes = '';
            if (day < now_day
                && month == now_month
                && year == now_year
                || month < now_month && year == now_year
                || year < now_year) {
                classes += 'passed-day ';
            }

            var matchingSh = $.grep(schedule, function (sched) {
                return sched.schedule_date_time.split(' ')[0] == year + '-' + month_str + '-' + day_str;
            });
            if (!matchingSh.length) {
                classes += 'ui-datepicker-unselectable not-working-day ';
            }

            var matchingUsAp = $.grep(user_appointments, function (usap) {
                return (usap.appointment_time.split(' ')[0] == year + '-' + month_str + '-' + day_str
                        && usap.doctor_id == me.iddoctor);
            });
            if (matchingUsAp.length) {
                classes += 'user-has-consult ';
            }

            var matchingDoctAp = $.grep(doctor_appointments, function (doctap) {
                return doctap.appointment_time.split(' ')[0] == year + '-' + month_str + '-' + day_str;
            });
            if (matchingDoctAp.length) {
                classes += 'doctor-has-consult ';
            }

            return [true, classes];
        },
        onSelect: function () {
            me.SetSelectedDate();
        }
    }).ready(function () {
        if (scheduleAjax) {
            scheduleAjax.abort();
        }

        m_calendar.datepicker('setDate', new Date());

        scheduleAjax = me.getSchedules(false);
    }).data('calendar', this);

    me.OpenCreateChosenPopup = function () {
        if ($('.needsWS').hasClass('inactive')) {
            return;
        }
        if (!testManager.testingWS) {
            if (!testManager.testModuleResults.ws) {
                $('#browserNotSupportedModal').modal('show');
                return;
            }
            me.confirm_request_modal.modal('show');
        } else {
            setTimeout(function () {
                me.OpenCreateChosenPopup();
            }, 200);
        }
    };
}

function SetPromoState() {
    var submitPromoBut = $('#payForPromo');
    if (submitPromoBut.data("promook") == 1
        && submitPromoBut.data("agree") == 1) {
        submitPromoBut.removeClass('inactive');
    } else {
        submitPromoBut.addClass('inactive');
    }
}

$(document).ready(function () {
    $('.ui-datepicker-today a').trigger('click');

    $('#confirmRequestCreationModal #openPromoFields').click(function (e) {
        e.preventDefault();

        $('#confirmRequestCreationModal').modal('hide');
        $('#inputPromoModal').modal('show');
    });

    $('#openPaymentFields').click(function (e) {
        e.preventDefault();

        $('#inputPromoModal').modal('hide');
        $('#confirmRequestCreationModal').modal('show');
    });

    $.mask.definitions['~'] = '[a-zA-Zа-яА-ЯёЁ0-9]';
    $('#promokod').mask('~~~?~~~~~~~~~~~~', {placeholder: ""})
                  .on('change keyup paste click', function () {
                      if ($(this).mask().length >= 3) {
                          $('#payForPromo').data("promook", 1);
                      } else {
                          $('#payForPromo').data("promook", 0);
                      }

                      SetPromoState();
                  })
                  .click(function () {
                      $(this).select();
                  });

    $('#agree_terms').change(function () {
        var submitChosenBut = $('#payForChosen');
        if ($(this).is(':checked')) {
            submitChosenBut.removeClass('inactive');
        } else {
            submitChosenBut.addClass('inactive');
        }
    });
});