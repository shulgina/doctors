"use strict";

if (window.Helper === undefined) {
    window.Helper = {};
}

Helper.Url = {
    getParameterByName: function (name, url) {
        if (!url) {
            url = window.location.href;
        }
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) {
            return null;
        }
        if (!results[2]) {
            return '';
        }
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    },
    removeParam: function (key, sourceURL) {
        var rtn = sourceURL.split("?")[0],
            param,
            params_arr = [],
            queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
        if (queryString !== "") {
            params_arr = queryString.split("&");
            for (var i = params_arr.length - 1; i >= 0; i -= 1) {
                param = params_arr[i].split("=")[0];
                if (param === key) {
                    params_arr.splice(i, 1);
                }
            }

            if (params_arr.length > 0) {
                rtn = rtn + "?" + params_arr.join("&");
            }
        }

        return rtn;
    },
    addParam: function (key, value, sourceURL) {
        var rtn = sourceURL.split("?")[0],
            param,
            params_arr = [],
            queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
        if (queryString !== "") {
            params_arr = queryString.split("&");

            var hasParam = false;

            for (var i = params_arr.length - 1; i >= 0; i -= 1) {
                param = params_arr[i].split("=")[0];

                if (param === key) {
                    params_arr.splice(i, 1, key + '=' + value);
                    hasParam = true;
                    break;
                }
            }

            if (!hasParam) {
                params_arr.splice(params_arr.length, 0, key + '=' + value);
            }

            rtn = rtn + "?" + params_arr.join("&");
        } else {
            rtn = rtn + "?" + key + "=" + value;
        }

        return rtn;
    },
    getParams: function () {
        var url = (window.location.search).slice(1);
        var params_arr = [];
        var params = {};

        if (url != '') {
            params_arr = url.split('&');

            var item;

            for (var i in params_arr) {
                item = params_arr[i].split('=');
                params[item[0]] = item[1];
            }
        }

        return params;
    }
};
