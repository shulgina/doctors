"use strict";

if (window.Controls === undefined) {
    window.Controls = {};
}

// Определяем мобильное устройство
window.Controls.CheckMobile = function () {

    var me = this;

    me.Android = function () {
        return navigator.userAgent.match(/Android/i);
    };
    me.BlackBerry = function () {
        return navigator.userAgent.match(/BlackBerry/i);
    };
    me.iOS = function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    };
    me.Opera = function () {
        return navigator.userAgent.match(/Opera Mini/i);
    };
    me.Windows = function () {
        return navigator.userAgent.match(/IEMobile/i);
    };
    me.isMobile = function () {
        return (me.Android() || me.BlackBerry() || me.iOS() || me.Opera() || me.Windows());
    };
};