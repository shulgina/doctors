"use strict";

$(document).ready(function () {

    var $tabs = $('#doctorProfileTabs');
    var doctorId = $('#doctId');

    $tabs.click(function (e) {
        var $target = $(e.target).parent();

        if ($target.hasClass('active')) {
            return;
        }

        if ($target.hasClass('profile')) {
            Helper.State.Push('profilePage', null, '/doctors/?id=' + doctorId.val());
        }
        if ($target.hasClass('calendar')) {
            Helper.State.Push('profilePageCalendar', null, '/doctors/calendar/?id=' + doctorId.val());
        }
    });

    window.addEventListener('popstate', function (e) {

        var $tab_profile = $('a[href="#doctorProfileWrapper"]');
        var $tab_calendar = $('a[href="#doctorCalendar"]');
        var $active_tab = $tabs.find('.active:first');

        switch (e.state) {
            case 'profilePage':
                $tab_profile.tab('show');
                break;
            case 'profilePageCalendar':
                $tab_calendar.tab('show');
                break;
            default:
                if ($active_tab.hasClass('calendar')) {
                    $tab_profile.tab('show');
                } else {
                    $tab_calendar.tab('show');
                }
                break;
        }
    });

    $('.other-doctors-container').find('.loader')
                                 .fadeIn();

    $('#otherDoctors').slick({
        slidesToShow: 2,
        slidesToScroll: 2,
        prevArrow: $('#prev-arrow'),
        nextArrow: $('#next-arrow'),
        infinite: true
    }).ready(function () {
        $('.other-doctors-container').find('.loader').fadeOut(500).end().find('#otherDoctors').fadeIn(500);
    });
});