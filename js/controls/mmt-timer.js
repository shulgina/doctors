"use strict";

if (window.Controls === undefined) {
    window.Controls = {};
}

/**
 *
 * @param $counter: wrapper
 * @param seconds: timer value
 * @constructor
 */

Controls.Timer = function ($counter, seconds) {

    var me = this;

    var $m_counter = $counter;
    var m_seconds = seconds;


    var Init = function () {

        var consultation_start = me.start_time;

        var countdown = function (date_start, time_offset) {
            var c_date_end = date_start + m_seconds;
            var c_date_now = parseInt(Date.now() / 1000) + time_offset;
            var remaining_seconds = parseInt(c_date_end - c_date_now);

            if (remaining_seconds <= 0) {
                me.ClearTimer(true);
            }

            var minutes = Math.floor(remaining_seconds / 60);
            var seconds = (remaining_seconds % 60).toFixed();

            if ((minutes < 5) || (minutes == 5 && seconds == 0)) {
                $m_counter.addClass('attention');
            }

            if (seconds < 10) {
                seconds = '0' + seconds;
            }

            if (minutes < 10) {
                minutes = '0' + minutes;
            }

            $m_counter.html(minutes + ':' + seconds);
        };

        var date_start = Helper.Time.getTimestamp(consultation_start);
        var time_offset = parseInt(new Date().getTimezoneOffset() * -1 * 60);
        var date_now = parseInt(Date.now() / 1000) + time_offset;
        var time_counter = date_now - date_start;

        if (time_counter >= 0 && time_counter <= m_seconds) {

            me.ClearTimer();

            me.timerIntervalID = setInterval(function () {
                countdown(date_start, time_offset)
            }, 1000);

        } else if (time_counter > 0) {
            me.ClearTimer(true);
        }
    };

    me.ClearTimer = function (attention) {

        var has_attention = attention || false;

        clearInterval(me.timerIntervalID);
        clearInterval(me.checkIntervalID);

        $m_counter.removeClass('disabled').html('00:00');

        if (has_attention) {
            $m_counter.addClass('attention');
        } else {
            $m_counter.removeClass('attention');
        }
    };

    me.Close = function () {
        me.ClearTimer();
        me.Hide();
    };

    me.Hide = function () {
        $m_counter.addClass('disabled');
    };

    me.Show = function () {
        $m_counter.removeClass('disabled');
    };

    // @start_time: consultation start
    me.CheckTimer = function (start_time) {

        me.start_time = start_time;

        clearInterval(me.checkIntervalID);

        me.checkIntervalID = setInterval(function () {
            if ((Helper.Time.formatTime(Date.now() / 1000)) >= me.start_time) {
                clearInterval(me.checkIntervalID);

                Init();
            }
        }, 1000);
    };
};