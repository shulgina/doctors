"use strict";

if (window.Helper === undefined) {
    window.Helper = {};
}

Helper.Time = {
    formatInterval: function (ts) {
        if (ts == 0) {
            return '0 мин';
        }

        var d = Math.floor(ts / (3600 * 24));
        ts = ts - (d * 3600 * 24);
        var h = Math.floor(ts / 3600);
        ts = ts - (h * 3600);
        var m = Math.floor(ts / 60);
        var r = '';

        if (d) {
            r += d + 'д ';
        }

        if (h) {
            r += h + 'ч ';
        }

        if (m) {
            if (d == 0
                && h == 0) {
                r += m + ' мин';
            }
            else {
                r += m + 'м ';
            }
        }

        if (r == '') {
            r = '< 1 мин';
        }

        return r;
    },
    formatTime: function (ts) {

        var date = this.getDateParts(ts);

        return date.d + '.' + date.m + '.' + date.Y + ' ' + date.H + ':' + date.i + ':' + date.s;
    },
    formatBirthdate: function (date) {
        var day = ("0" + date.getUTCDate()).substr(-2);
        var month = ("0" + (date.getUTCMonth() + 1)).substr(-2);
        var year = date.getUTCFullYear();

        return day + '.' + month + '.' + year
    },
    formatBirthdateSend: function (date) {
        var day = ("0" + date.getDate()).substr(-2);
        var month = ("0" + (date.getMonth() + 1)).substr(-2);
        var year = date.getFullYear();

        return year + '-' + month + '-' + day
    },
    formatApiTime: function(ts) {
        var date = this.getDateParts(ts);

        return date.Y + '-' + date.m + '-' + date.d + ' ' + date.H + ':' + date.i + ':' + date.s;       
    },
    getDateParts: function (ts) {
        var date = new Date(ts * 1000);
        var year = date.getFullYear();
        var month = ("0" + (date.getMonth() + 1)).substr(-2);
        var day = ("0" + date.getDate()).substr(-2);
        var hour = ("0" + date.getHours()).substr(-2);
        var minutes = ("0" + date.getMinutes()).substr(-2);
        var seconds = ("0" + date.getSeconds()).substr(-2);

        return {
            Y: year,
            m: month,
            d: day,
            H: hour,
            i: minutes,
            s: seconds
        };
    },
    getTimestamp: function (time_str) {
        var t_arr = time_str.split(' ');
        var t_arr_date = t_arr[0].split('-');
        var t_arr_time = t_arr[1].split(':');

        // Getting timestamp
        return parseInt(Date.parse(t_arr_date[0] + '-' +
                                   t_arr_date[1] + '-' +
                                   t_arr_date[2] + 'T' +
                                   t_arr_time[0] + ':' +
                                   t_arr_time[1] + ':' +
                                   t_arr_time[2] + '.000Z') / 1000);
    }
};