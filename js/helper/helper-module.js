"use strict";

if ($.fn.datepicker && $.fn.datepicker.noConflict) {
    var bs_datepicker = $.fn.datepicker.noConflict(); // return $.fn.datepicker to previously assigned value
    $.fn.bootstrapDP = bs_datepicker;
}

(function ($) {
    $.fn.hasScrollBar = function () {
        return this.get(0).scrollHeight > this.height();
    };

//Замена функции создания HTML для календаря.
//Добавлена возможность вставлять произвольный текст в ячейки дат
//Произвольный текст передается в datepicker коммандой $('#datepickerId').data('custom-html', customTexts);,
//где customTexts - объект вида {key1:value1, ..., keyN:valueN}.
//В качестве ключей выступают строки даты в формате YYYYMMDD
//В качестве значений - произвольный текст
//Что б заработало в $(document).ready нужно добавит это
//$.datepicker._generateHTML = function (inst) {
//        return this._generateHTMLNew(inst);
//    };

    $.extend(true, $.datepicker, {
        _generateHTMLNew: function (inst) {

            //Пользовательский текст в ячейках дней
            var customHTMLs = inst['custom-html'];
            if (!customHTMLs) {
                customHTMLs = {};
            }
            var customHTML, year_str, month_str, day_str, date_str;

            var maxDraw, prevText, prev, nextText, next, currentText, gotoDate,
                controls, buttonPanel, firstDay, showWeek, dayNames, dayNamesMin,
                monthNames, monthNamesShort, beforeShowDay, showOtherMonths,
                selectOtherMonths, defaultDate, html, dow, row, group, col, selectedDate,
                cornerClass, calender, thead, day, daysInMonth, leadDays, curRows, numRows,
                printDate, dRow, tbody, daySettings, otherMonth, unselectable,
                tempDate = new Date(),
                today = this._daylightSavingAdjust(
                    new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate())), // clear time
                isRTL = this._get(inst, "isRTL"),
                showButtonPanel = this._get(inst, "showButtonPanel"),
                hideIfNoPrevNext = this._get(inst, "hideIfNoPrevNext"),
                navigationAsDateFormat = this._get(inst, "navigationAsDateFormat"),
                numMonths = this._getNumberOfMonths(inst),
                showCurrentAtPos = this._get(inst, "showCurrentAtPos"),
                stepMonths = this._get(inst, "stepMonths"),
                isMultiMonth = (numMonths[0] !== 1 || numMonths[1] !== 1),
                currentDate = this._daylightSavingAdjust((!inst.currentDay ? new Date(9999, 9, 9) :
                    new Date(inst.currentYear, inst.currentMonth, inst.currentDay))),
                minDate = this._getMinMaxDate(inst, "min"),
                maxDate = this._getMinMaxDate(inst, "max"),
                drawMonth = inst.drawMonth - showCurrentAtPos,
                drawYear = inst.drawYear;

            if (drawMonth < 0) {
                drawMonth += 12;
                drawYear--;
            }
            if (maxDate) {
                maxDraw = this._daylightSavingAdjust(new Date(maxDate.getFullYear(),
                    maxDate.getMonth() - (numMonths[0] * numMonths[1]) + 1, maxDate.getDate()));
                maxDraw = (minDate && maxDraw < minDate ? minDate : maxDraw);
                while (this._daylightSavingAdjust(new Date(drawYear, drawMonth, 1)) > maxDraw) {
                    drawMonth--;
                    if (drawMonth < 0) {
                        drawMonth = 11;
                        drawYear--;
                    }
                }
            }
            inst.drawMonth = drawMonth;
            inst.drawYear = drawYear;

            prevText = this._get(inst, "prevText");
            prevText = (!navigationAsDateFormat ? prevText : this.formatDate(prevText,
                this._daylightSavingAdjust(new Date(drawYear, drawMonth - stepMonths, 1)),
                this._getFormatConfig(inst)));

            prev = (this._canAdjustMonth(inst, -1, drawYear, drawMonth) ?
            "<a class='ui-datepicker-prev ui-corner-all' data-handler='prev' data-event='click'" +
            " title='" + prevText + "'><span class='ui-icon ui-icon-circle-triangle-" + (isRTL ? "e" : "w") + "'>" + prevText + "</span></a>" :
                (hideIfNoPrevNext ? "" : "<a class='ui-datepicker-prev ui-corner-all ui-state-disabled' title='" + prevText + "'><span class='ui-icon ui-icon-circle-triangle-" + (isRTL ? "e" : "w") + "'>" + prevText + "</span></a>"));

            nextText = this._get(inst, "nextText");
            nextText = (!navigationAsDateFormat ? nextText : this.formatDate(nextText,
                this._daylightSavingAdjust(new Date(drawYear, drawMonth + stepMonths, 1)),
                this._getFormatConfig(inst)));

            next = (this._canAdjustMonth(inst, +1, drawYear, drawMonth) ?
            "<a class='ui-datepicker-next ui-corner-all' data-handler='next' data-event='click'" +
            " title='" + nextText + "'><span class='ui-icon ui-icon-circle-triangle-" + (isRTL ? "w" : "e") + "'>" + nextText + "</span></a>" :
                (hideIfNoPrevNext ? "" : "<a class='ui-datepicker-next ui-corner-all ui-state-disabled' title='" + nextText + "'><span class='ui-icon ui-icon-circle-triangle-" + (isRTL ? "w" : "e") + "'>" + nextText + "</span></a>"));

            currentText = this._get(inst, "currentText");
            gotoDate = (this._get(inst, "gotoCurrent") && inst.currentDay ? currentDate : today);
            currentText = (!navigationAsDateFormat ? currentText :
                this.formatDate(currentText, gotoDate, this._getFormatConfig(inst)));

            controls = (!inst.inline ? "<button type='button' class='ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all' data-handler='hide' data-event='click'>" +
                                       this._get(inst, "closeText") + "</button>" : "");

            buttonPanel = (showButtonPanel) ? "<div class='ui-datepicker-buttonpane ui-widget-content'>" + (isRTL ? controls : "") +
                                              (this._isInRange(inst, gotoDate) ? "<button type='button' class='ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all' data-handler='today' data-event='click'" +
                                              ">" + currentText + "</button>" : "") + (isRTL ? "" : controls) + "</div>" : "";

            firstDay = parseInt(this._get(inst, "firstDay"), 10);
            firstDay = (isNaN(firstDay) ? 0 : firstDay);

            showWeek = this._get(inst, "showWeek");
            dayNames = this._get(inst, "dayNames");
            dayNamesMin = this._get(inst, "dayNamesMin");
            monthNames = this._get(inst, "monthNames");
            monthNamesShort = this._get(inst, "monthNamesShort");
            beforeShowDay = this._get(inst, "beforeShowDay");
            showOtherMonths = this._get(inst, "showOtherMonths");
            selectOtherMonths = this._get(inst, "selectOtherMonths");
            defaultDate = this._getDefaultDate(inst);
            html = "";
            dow;
            for (row = 0; row < numMonths[0]; row++) {
                group = "";
                this.maxRows = 4;
                for (col = 0; col < numMonths[1]; col++) {
                    selectedDate = this._daylightSavingAdjust(new Date(drawYear, drawMonth, inst.selectedDay));
                    cornerClass = " ui-corner-all";
                    calender = "";
                    if (isMultiMonth) {
                        calender += "<div class='ui-datepicker-group";
                        if (numMonths[1] > 1) {
                            switch (col) {
                                case 0:
                                    calender += " ui-datepicker-group-first";
                                    cornerClass = " ui-corner-" + (isRTL ? "right" : "left");
                                    break;
                                case numMonths[1] - 1:
                                    calender += " ui-datepicker-group-last";
                                    cornerClass = " ui-corner-" + (isRTL ? "left" : "right");
                                    break;
                                default:
                                    calender += " ui-datepicker-group-middle";
                                    cornerClass = "";
                                    break;
                            }
                        }
                        calender += "'>";
                    }
                    calender += "<div class='ui-datepicker-header ui-widget-header ui-helper-clearfix" + cornerClass + "'>" +
                                (/all|left/.test(cornerClass) && row === 0 ? (isRTL ? next : prev) : "") +
                                (/all|right/.test(cornerClass) && row === 0 ? (isRTL ? prev : next) : "") +
                                this._generateMonthYearHeader(inst, drawMonth, drawYear, minDate, maxDate,
                                    row > 0 || col > 0, monthNames, monthNamesShort) + // draw month headers
                                "</div><table class='ui-datepicker-calendar'><thead>" +
                                "<tr>";
                    thead = (showWeek ? "<th class='ui-datepicker-week-col'>" + this._get(inst, "weekHeader") + "</th>" : "");
                    for (dow = 0; dow < 7; dow++) { // days of the week
                        day = (dow + firstDay) % 7;
                        thead += "<th scope='col'" + ((dow + firstDay + 6) % 7 >= 5 ? " class='ui-datepicker-week-end'" : "") + ">" +
                                 "<span title='" + dayNames[day] + "'>" + dayNamesMin[day] + "</span></th>";
                    }
                    calender += thead + "</tr></thead><tbody>";
                    daysInMonth = this._getDaysInMonth(drawYear, drawMonth);
                    if (drawYear === inst.selectedYear && drawMonth === inst.selectedMonth) {
                        inst.selectedDay = Math.min(inst.selectedDay, daysInMonth);
                    }
                    leadDays = (this._getFirstDayOfMonth(drawYear, drawMonth) - firstDay + 7) % 7;
                    curRows = Math.ceil((leadDays + daysInMonth) / 7); // calculate the number of rows to generate
                    numRows = (isMultiMonth ? this.maxRows > curRows ? this.maxRows : curRows : curRows); //If multiple months, use the higher number of rows (see #7043)
                    this.maxRows = numRows;
                    printDate = this._daylightSavingAdjust(new Date(drawYear, drawMonth, 1 - leadDays));
                    for (dRow = 0; dRow < numRows; dRow++) { // create date picker rows
                        calender += "<tr>";
                        tbody = (!showWeek ? "" : "<td class='ui-datepicker-week-col'>" +
                                                  this._get(inst, "calculateWeek")(printDate) + "</td>");
                        for (dow = 0; dow < 7; dow++) { // create date picker days
                            //Поиск пользовательского текста для ячейки дня
                            year_str = printDate.getFullYear();
                            month_str = ('0' + (printDate.getMonth() + 1)).slice(-2);
                            day_str = ('0' + printDate.getDate()).slice(-2);
                            date_str = year_str + month_str + day_str;
                            if (customHTMLs[date_str]) {
                                customHTML = customHTMLs[date_str];
                            } else {
                                customHTML = '';
                            }

                            daySettings = (beforeShowDay ?
                                beforeShowDay.apply((inst.input ? inst.input[0] : null), [printDate]) : [true, ""]);
                            otherMonth = (printDate.getMonth() !== drawMonth);
                            unselectable = (otherMonth && !selectOtherMonths) || !daySettings[0] ||
                                           (minDate && printDate < minDate) || (maxDate && printDate > maxDate);
                            tbody += "<td class='" +
                                     ((dow + firstDay + 6) % 7 >= 5 ? " ui-datepicker-week-end" : "") + // highlight weekends
                                     (otherMonth ? " ui-datepicker-other-month" : "") + // highlight days from other months
                                     ((printDate.getTime() === selectedDate.getTime() && drawMonth === inst.selectedMonth && inst._keyEvent) || // user pressed key
                                      (defaultDate.getTime() === printDate.getTime() && defaultDate.getTime() === selectedDate.getTime()) ?
                                         // or defaultDate is current printedDate and defaultDate is selectedDate
                                     " " + this._dayOverClass : "") + // highlight selected day
                                     (unselectable ? " " + this._unselectableClass + " ui-state-disabled" : "") + // highlight unselectable days
                                     (otherMonth && !showOtherMonths ? "" : " " + daySettings[1] + // highlight custom dates
                                     (printDate.getTime() === currentDate.getTime() ? " " + this._currentClass : "") + // highlight selected day
                                     (printDate.getTime() === today.getTime() ? " ui-datepicker-today" : "")) + "'" + // highlight today (if different)
                                     ((!otherMonth || showOtherMonths) && daySettings[2] ? " title='" + daySettings[2].replace(/'/g, "&#39;") + "'" : "") + // cell title
                                     (unselectable ? "" : " data-handler='selectDay' data-event='click' data-month='" + printDate.getMonth() + "' data-year='" + printDate.getFullYear() + "'") + ">" + // actions
                                     (otherMonth && !showOtherMonths ? "&#xa0;" : // display for other months
                                         (unselectable ? "<span class='ui-state-default'>" + printDate.getDate() + "</span>" : "<a class='ui-state-default" +
                                     (printDate.getTime() === today.getTime() ? " ui-state-highlight" : "") +
                                     (printDate.getTime() === currentDate.getTime() ? " ui-state-active" : "") + // highlight selected day
                                     (otherMonth ? " ui-priority-secondary" : "") + // distinguish dates from other months
                                     "' href='#'>" + printDate.getDate() + "</a>" + customHTML)) + "</td>"; // display selectable date
                            printDate.setDate(printDate.getDate() + 1);
                            printDate = this._daylightSavingAdjust(printDate);
                        }
                        calender += tbody + "</tr>";
                    }
                    drawMonth++;
                    if (drawMonth > 11) {
                        drawMonth = 0;
                        drawYear++;
                    }
                    calender += "</tbody></table>" + (isMultiMonth ? "</div>" +
                                ((numMonths[0] > 0 && col === numMonths[1] - 1) ? "<div class='ui-datepicker-row-break'></div>" : "") : "");
                    group += calender;
                }
                html += group;
            }
            html += buttonPanel;
            inst._keyEvent = false;
            return html;
        }
    });
})(jQuery);

//Убирает глюк с появлением полос прокрутки после закрытия верхнего диалогового окна
$(document).on('hidden.bs.modal', '.modal', function () {
    $('.modal:visible').length && $(document.body).addClass('modal-open');
});

var monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
var monthNamesAlt = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
var askingToAllow = false;

function InitPerfectScrollbar() {
    $('.custom-scrollbar').perfectScrollbar({
        wheelSpeed: 1,
        wheelPropagation: true,
        suppressScrollX: true
    });
}

function PopupSuccess(message, title, reload) {
    var modal = $('#success_message');
    if (typeof title !== 'undefined') {
        modal.find('.modal-title').html(title);
    }
    if (typeof message !== 'undefined') {
        modal.find('.modal-text').html(message);
    }
    modal.modal('show');

    modal.on('hidden.bs.modal', function () {
        if (typeof message !== 'undefined'
            && reload) {
            window.location.reload(true);
        }
    });
}

function PopupError(message, title, reload) {
    var modal = $('#error_message');
    if (typeof title !== 'undefined') {
        modal.find('.modal-title').html(title);
    }
    if (typeof message !== 'undefined') {
        modal.find('.modal-text').html(message);
    }
    modal.modal('show');

    modal.on('hidden.bs.modal', function () {
        if (typeof message !== 'undefined'
            && reload) {
            window.location.reload(true);
        }
    });
}

function CloseModal(id) {
    $('#' + id).modal('hide');
}

function ShowModal(id) {
    $('#' + id).modal('show');
}

function initializeWebSockets() {
    WebSocketLocal.RequestCommand('/mobile/user/online_status/', null);
}

function readURL(files, id, callback) {
    if (files.length) {
        var reader = new FileReader();
        reader.onload = function (e) {
            if (id) {
                $(id).css('background-image', 'url(' + e.target.result + ')');
                $(id).css('background-repeat', 'no-repeat');
                $(id).css('background-size', 'contain');
            }

            if (callback) {
                callback(e.target.result);
            }
        };
        reader.readAsDataURL(files[0]);
    }
}

function GetCookie(c_name) {
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start == -1) {
        c_start = c_value.indexOf(c_name + "=");
    }
    if (c_start == -1) {
        c_value = null;
    } else {
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);
        if (c_end == -1) {
            c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start, c_end));
    }
    return c_value;
}

function SetCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value + ";  path=/";
//    window.location.href = "/";
}

function DeleteCookie(c_name) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() - 1);
    var c_value = '' + "; expires=" + exdate.toUTCString();
    document.cookie = c_name + "=" + c_value + ";  path=/";
}

function updateScrollbar(element, toTop) {
    if (typeof toTop === 'undefined') {
        toTop = false;
    }
    element.scrollTop(0);
    element.perfectScrollbar('update');
    if (!toTop) {
        element.scrollTop(element.prop("scrollHeight"));
        element.perfectScrollbar('update');
    }
}

function replaceAll(string, find, replace) {
    return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function strpos(haystack, needle, offset) {
    var i = (haystack + '')
        .indexOf(needle, (offset || 0));
    return i === -1 ? -1 : i;
}

function getLiteralDate(date) {
    if (typeof date === 'undefined') {
        date = '';
    }
    if (date == '') {
        return '...';
    }
    var tmp = date.split(" ");
    if (tmp.length == 2) {
        var tmp_d = tmp[0].split('-');
        var tmp_t = tmp[1].split(':');
        var year = '';
        var this_year = new Date().getFullYear();

        if (this_year > tmp_d[0]) {
            year = " " + tmp_d[0];
        }

        if (tmp_d.length == 3 && tmp_t.length == 3) {
            return tmp_d[2] + " " + monthNamesAlt[parseFloat(tmp_d[1]) - 1] + year + ", " + tmp_t[0] + ":" + tmp_t[1];
        }
    }
    return 'date_format_error';
}

function setTimeZone() {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + 30);
    var tzOffset = new Date().getTimezoneOffset();
    var tZone = TZoneOffsetToGMT(tzOffset);
    document.cookie = 'timeZone' + "=" + tZone + "; expires=" + exdate.toUTCString() + ";  path=/";
}

function TZoneOffsetToGMT(offset) {
    var hours = offset / (-60);
    var minutes = Math.abs(offset % 60);
    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    var sign = '+';
    if (hours < 0) {
        sign = '-';
    }

    hours = Math.floor(Math.abs(hours));
    if (hours < 10) {
        hours = '0' + hours;
    }

    var GMTtZone = sign + hours + ':' + minutes;
    return GMTtZone;
}

function FormatDate(date) {
    var curr_date = date.getDate();
    if (curr_date < 10) {
        curr_date = '0' + curr_date;
    }

    var curr_month = date.getMonth() + 1;
    if (curr_month < 10) {
        curr_month = '0' + curr_month;
    }

    var curr_year = date.getFullYear();

    var time = curr_year + "-" + curr_month + "-" + curr_date;

    return time;
}

function getFormattedDateTime(datetime) {

    var d = (typeof datetime === 'undefined' ? new Date() : new Date(datetime));

    var curr_date = d.getDate();
    if (curr_date < 10) {
        curr_date = '0' + curr_date;
    }

    var curr_month = d.getMonth() + 1;
    if (curr_month < 10) {
        curr_month = '0' + curr_month;
    }

    var curr_year = d.getFullYear();

    var curr_hour = d.getHours();
    if (curr_hour < 10) {
        curr_hour = '0' + curr_hour;
    }

    var curr_min = d.getMinutes();
    if (curr_min < 10) {
        curr_min = '0' + curr_min;
    }

    var curr_sec = d.getSeconds();
    if (curr_sec < 10) {
        curr_sec = '0' + curr_sec;
    }

    var time = curr_year + "-" + curr_month + "-" + curr_date + ' ' + curr_hour + ':' + curr_min + ':' + curr_sec;

    return time;
}

function pad(num, size) {
    var s = num + "";
    while (s.length < size) {
        s = "0" + s;
    }

    return s;
}

function secondsToTime(sec) {
    var hour = 0;
    var min = 0;
    if (sec >= 3600) {
        hour = Math.floor(sec / 3600);
        sec = sec - hour * 3600;
    }
    if (sec >= 60) {
        min = Math.floor(sec / 60);
        sec = sec - min * 60;
    }
    if (sec <= 9) {
        sec = "0" + sec;
    }
    return ((hour <= 9) ? "0" + hour : hour) + " : " + ((min <= 9) ? "0" + min : min) + " : " + sec;
}

function setActiveCode($phoneControl, flag) {
    var _this = $phoneControl.find(".list-container li[data-flag='" + flag + "']");
    var name = (_this.data("flag") === '__' ? '' : _this.data("flag"));
    var code = '' + _this.data("code");

    $phoneControl.find('#country_id')
                 .val(_this.data('id'));
    $phoneControl.find(".code-container")
                 .html('')
                 .append('<i class="arrow-down"></i><span class="code">+'
                         + code
                         + '</span><span class="country">'
                         + name.toUpperCase()
                         + '</span>');

    $phoneControl.find(".list-container li")
                 .removeClass("active");
    $(_this).addClass("active");

    $phoneControl.find("#code")
                 .val(code);

    var oldPhone = $phoneControl.find('#changePhone')
                                .data('value');

    oldPhone = (typeof oldPhone === 'undefined' ? '' : '' + oldPhone);

    $phoneControl.find('#tmp-phone')
                 .val(oldPhone);
}

function ShowAttachment(id) {
    $('#attachmentImage').removeAttr('src');
    $('#attachmentPicture').find('.modal-dialog')
                           .css('width', 320);
    $('#attachmentImage').attr('src', '/mobile/user/get_request_attachment/?size=original&id=' + id + '')
                         .load(function () {
                             $('#attachmentPicture').find('.modal-dialog')
                                                    .css('width', document.getElementById('attachmentImage').naturalWidth);
                         });

    $('#attachmentPicture').modal('show');
}

function DeleteAttachment(id) {

    var $modal_dialog = $('.confirmation-modal.empty').addClass('delete-document-modal');

    var confirmation_message = new Modals.ConfirmationMessage($modal_dialog, {
        title: 'Удалить файл',
        description: 'Уверены, что хотите удалить этот файл?',
        reset: {
            text: 'Отменить'
        },
        submit: {
            text: 'Подтвердить'
        },
        callback: {
            submit: function () {
                $.ajax({
                    url: "/mobile/user/remove_request_attachment/",
                    data: {
                        idfile: id
                    },
                    type: 'POST',
                    dataType: 'json',
                    success: function (data) {
                        if (data.status !== 'OK') {

                            PopupError(data.message, 'Ошибка');

                        } else {
                            window.location.reload(true);
                        }
                    },
                    error: function () {
                        PopupError('Ошибка соединения с сервером.');
                    }
                });
            }
        }
    });

    confirmation_message.Show();
}

function OpenCertificate(id, filename) {
    $('#certificateModal').one('shown.bs.modal', function () {
                              $('#zoomedCertificate').attr('src', '/mobile/doctor/show_cert/?id=' + id + '&name=' + filename + '')
                                                     .load(function () {
                                                         resizeModalWhenCertLoaded();
                                                     });
                          })
                          .modal('show')
                          .find('.loading')
                          .fadeIn(500);
}

function resizeModalWhenCertLoaded() {
    var certificate = $('#certificateModal');
    var image = $('#zoomedCertificate');
    var imageModal = certificate.find('.modal-dialog');
    imageModal.css('max-width', image[0].naturalWidth);
    certificate.find('.loading')
               .fadeOut(300);
    image.addClass('visible');
    image.fadeIn(500);
}

function NameShortener(longName) {
    var arr = longName.trim().replace(/( )\1/gi, '').split(' ');

    if (arr.length != 3) {
        return longName;
    }

    return arr[0]
           + (typeof arr[1] !== 'undefined' ? ' ' + arr[1][0] + '.' : '')
           + (typeof arr[2][0] !== 'undefined' ? ' ' + arr[2][0] + '.' : '');
}

function animateDisabledDeviceNotification(customPopups) {

    if (typeof customPopups === 'undefined') {
        customPopups = false;
    }

    askingToAllow = false;
    var achtungWrapper = $('#allowDevicesNotification-cont');
    achtungWrapper.removeClass('asking-to-allow').addClass('notify-access-denied');
    var showPopup = true;
    switch (browser) {
        case 'chrome':
            achtungWrapper.addClass('chrome');
            break;
        case 'opera':
            achtungWrapper.addClass('opera');
            break;
        case 'firefox':
            //showPopup = false;
            achtungWrapper.addClass('firefox');
            break;
        case 'ie':
            //showPopup = false;
            achtungWrapper.addClass('msie');
            break;
        case 'msie':
            //showPopup = false;
            achtungWrapper.addClass('msie');
            break;
        default :
            achtungWrapper.addClass('chrome');
    }
    if (showPopup && customPopups) {
        achtungWrapper.fadeIn(500);
    }
}

function animateAllowStreamNotification(customPopups) {
    if (!askingToAllow) {
        return;
    }
    if (typeof customPopups === 'undefined') {
        customPopups = false;
    }
    var achtungWrapper = $('#allowDevicesNotification-cont');
    achtungWrapper.removeClass('notify-access-denied').addClass('asking-to-allow');

    var showPopup = true;
    switch (browser) {
        case 'chrome':
            achtungWrapper.addClass('chrome');
            break;
        case 'opera':
            //    showPopup = false;
            achtungWrapper.addClass('opera');
            break;
        case 'firefox':
            //  showPopup = false;
            achtungWrapper.addClass('firefox');
            break;
        case 'safari':
            //showPopup = false;
            break;
        case 'ie':
            achtungWrapper.addClass('msie');
            //showPopup = false;
            break;
        case 'msie':
            achtungWrapper.addClass('msie');
            //showPopup = false;
            break;
        default :
            achtungWrapper.addClass('chrome');
    }
    if (showPopup && customPopups) {
        achtungWrapper.fadeIn(500);
    }
}

function animateClosingAllowStreamNotification() {
    askingToAllow = false;
    $('#allowDevicesNotification-cont').fadeOut(500);
}

function setAchtungText(string) {
    $('#allowDevicesNotification-cont .achtungText').html(string);
}

function closeAchtung() {
    animateClosingAllowStreamNotification();
}


function PopupRequestCreated() {

    var message_base = 'Обращение было создано. Закрыв это сообщение, вы будете перенаправлены на страницу консультации.';
    var message = message_base + '<br><b>Для проведения видеоконсультации, необходимо предоставить доступ к камере и микрофону!</b>';
    var modal = $('#request_created_modal');
    modal.find('.modal-title').html('Хорошие новости');
    if (typeof message !== 'undefined') {
        modal.find('.modal-text').html(message);
    }

    navigator.getMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia
    );
    if (typeof navigator.getMedia == 'undefined') {
        modal.find('.modal-image').attr('src', '/images/default/Browser.png');
        message = message_base
                  + '<br>Ваш браузер не поддерживает технологию WebRTC. Для возможности проведения видеоконсультации, <br>cкачайте и установите один из предложенных браузеров:';
        modal.find('.modal-text').html(message);
        setTimeout(function () {
            modal.modal('show');
        }, 500);

        return;
    }
    switch (GetCookie('browser').toLowerCase()) {
        case 'chrome':
            modal.find('.modal-image')
                 .attr('src', '/images/default/chrome.gif');

            break;

        case 'firefox':
            modal.find('.modal-image')
                 .attr('src', '/images/default/ff.gif');

            break;

        case 'opera':
            modal.find('.modal-image')
                 .attr('src', '/images/default/opera.gif');

            break;

        default:
            modal.find('.modal-image')
                 .attr('src', '/images/default/Pediatr_browser_illustration.png');

            break;
    }
    modal.modal('show');
    navigator.getMedia({
            "video": true,
            "audio": true
        },
        function (stream) {
            $.each(stream.getTracks(), function (i, track) {
                track.stop();
            });
            modal.find('.modal-image')
                 .attr('src', '/images/default/pediatr_illustration.jpg');
            message = message_base;
            modal.find('.modal-text')
                 .html(message);
        }, function () {
            switch (GetCookie('browser').toLowerCase()) {
                case 'chrome':
                    modal.find('.modal-image')
                         .attr('src', '/images/default/chrome.gif');
                    break;
                case 'firefox':
                    modal.find('.modal-image')
                         .attr('src', '/images/default/ff.gif');
                    break;
                case 'opera':
                    modal.find('.modal-image')
                         .attr('src', '/images/default/opera.gif');
                    break;
                default:
                    modal.find('.modal-image')
                         .attr('src', '/images/default/Pediatr_browser_illustration.png');
                    break;
            }
        });
}

function RemoveNotification() {
    $('.notification_sound').remove();
}

// Определяем местоположение пользователя
function getPositionInfo() {

    if (navigator.geolocation) {
        var showPos = function (position) {
            var api_key = 'RPHTGOBWSY53';
            var user_time = new Date(position.timestamp);
            var pos = position.coords;
            $.get(
                'https://api.timezonedb.com/?format=json&lat=' + pos.latitude + '&lng=' + pos.longitude + '&key=' + api_key,
                function (resp) {
                    if (resp.status == "OK") {
                        var real_time = new Date(resp.timestamp * 1000);
                        var real_offset = resp.gmtOffset / 60;
                        var user_offset = user_time.getTimezoneOffset() * -1;
                        if (user_offset != real_offset) {
                            PopupError('Проверьте правильность часового пояса на устройстве');
                        } else if (user_time.getHours() != real_time.getUTCHours()) {
                            PopupError('Ваше время на устройстве не соответствует реальному');
                        } else if (user_time.getDate() + user_time.getMonth() + user_time.getFullYear() != real_time.getUTCDate() + real_time.getUTCMonth() + real_time.getUTCFullYear()) {
                            PopupError('Ваша дата на устройстве не соответствует реальной');
                        }
                    }
                }
            ).error(function () {
                PopupError('На вашем устройстве установлены неверные настройки даты и времени');
            });
        };

        navigator.geolocation.getCurrentPosition(showPos);
    }
}
