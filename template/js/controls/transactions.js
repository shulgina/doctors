"use strict";

if (window.Controls === undefined) {
    window.Controls = {};
}

window.Controls.Transactions = function (params) {
    
    var $m_modal = params['modal'];
    var $m_transactions_list = $m_modal.find('.transactions');

    var m_transactions_types = {
        ID_REFILL: 1,
        ID_CONSULTATION_ON_DUTY: 2,
        ID_CONSULTATION_CHOSEN_DOCTOR: 3,
        ID_CANCEL_TO_BALANCE: 4,
        ID_CANCEL_TO_CARD: 5
    };
    
    var me = this;
    me.Update = function () {
        $.post('/mobile/user/transactions/list/', {}, function (data) {
            $m_transactions_list.empty();
            if (data.status === 'OK') {
                var $transactions = [];

                if (data.count > 0) {
                    $.each(data.transactions, function (i, el) {
                        var $transaction = $(
                            '<div class="transaction row">' +
                            '<div class="cell-icon col-xs-1"><i class="icon-transaction"></i></div>' +
                            '<div class="cell-date col-xs-2 text-nowrap"></div>' +
                            '<div class="cell-amount col-xs-2"></div>' +
                            '<div class="cell-description col-xs-6"></div>' +
                            '</div>');

                        var logoClass = ($.inArray(parseInt(el.idtransaction_type), [m_transactions_types.ID_REFILL, m_transactions_types.ID_CANCEL_TO_BALANCE]) == -1) ? 'outgoing' : 'incoming';

                        $transaction.addClass(logoClass);
                        $transaction.find('.cell-date').text(el.date);
                        $transaction.find('.cell-amount').text(el.sum + ' руб.');
                        $transaction.find('.cell-description').text(el.comment);

                        $transactions.push($transaction);
                    });
                } else {
                    $transactions = $('<div class="transaction row text-center">Нет совершенных транзакций</div>');
                }

                $m_transactions_list.append($transactions);
                $m_modal.modal('show');
            } else {

            }
        }).fail(function () {

        });
    };
};
