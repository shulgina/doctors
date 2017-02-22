"use strict";

if (window.Modals === undefined) {
    window.Modals = {};
}

window.Modals.ConfirmationMessage = function ($confirmTemplate, options) {
    var $m_confirmation_modal = $confirmTemplate;

    var m_me = this;

    var Init = function () {
        var $header = $m_confirmation_modal.find('.modal-header');
        var $body = $m_confirmation_modal.find('.modal-body');

        var $title = $header.find('.modal-title');
        var $description = $body.find('.description');
        var $close = $header.find('.close');
        var $reset = $body.find('.reset');
        var $submit = $body.find('.submit');

        $close.off();
        $reset.off();
        $submit.off();

        if (options['title']) {
            $title.html(options['title']);
        }

        if (options['description']) {
            $description.html(options['description']);
        }

        if (options['reset']['text']) {
            $reset.text(options['reset']['text']);
        }

        if (options['submit']['text']) {
            $submit.text(options['submit']['text']);
        }

        $close.click(function (e) {
            e.preventDefault();

            m_me.Hide();

            if (options['callback']['close']) {
                options['callback']['close']();
            }
        });

        $reset.click(function (e) {
            e.preventDefault();

            m_me.Hide();

            if (options['callback']['reset']) {
                options['callback']['reset']();
            }
        });

        $submit.click(function (e) {
            e.preventDefault();

            m_me.Hide();

            if (options['callback']['submit']) {
                options['callback']['submit']();
            }
        });
    };

    m_me.Show = function () {
        $m_confirmation_modal.modal('show');
    };

    m_me.Hide = function () {
        $m_confirmation_modal.modal('hide');
    };

    Init();
};