/**
 * Обрезает контент до нужной длины и добавляет в конце любую строку пользователя.
 * @size: длина обрезанной строки
 * @afterString: строка, добавляемая в конце
 */

"use strict";

(function($) {

    $.fn.mmt_cutstring = function (params) {

        var m_me = this;

        var m_defaults = {
            size: 180,
            afterString: '... '
        };

        // Проверяем спец. символ
        m_me.check_symbol = function (symbol) {

            var symbols_stack = [' ', '.', '_', '?', '!'];

            for(var i in symbols_stack) {
                if(symbol == symbols_stack[i]) {
                    return true;
                }
            }

            return false;
        };

        var m_params = $.extend(true, m_defaults, params);
        var m_text = m_me.find('p:first').html();

        if(m_text) {

            var str_length = m_text.length;

            if(str_length > m_params.size) {

                for(var i = m_params.size - 1; i <= str_length - 1; i++) {

                    if(m_me.check_symbol(m_text[i])) {

                        m_params.size = i;
                        break;
                    }
                }

                m_text = m_text.substring(0, m_params.size) + m_params.afterString;

                m_me.html('<p>' + m_text + '</p>');
            }
        }
    }

})(jQuery);