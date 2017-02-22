"use strict";

if (window.Helper === undefined) {
    window.Helper = {};
}

Helper.State = {
    Push: function (data, title, url) {
        title = title || null;
        url = url || null;

        window.history.pushState(data, title, url);
    },
    Replace: function (data, title, url) {
        title = title || null;
        url = url || null;

        window.history.replaceState(data, title, url);
    }
};