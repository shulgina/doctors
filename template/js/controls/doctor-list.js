"use strict";

if (window.Controls === undefined) {
    window.Controls = {};
}

/**
 * Конструктор списка врачей
 */
Controls.DoctorList = function ($orderChosenWrapper, url, enable_history) {
    var m_me = this;
    var m_url = url;

    /** * Обёртка списка врачей без фильтров */
    var $m_order_chosen_wrapper = $orderChosenWrapper;
    m_me.$filter = $m_order_chosen_wrapper.find('.filters-wrapper:first');
    m_me.$list = $m_order_chosen_wrapper.find('.doctors-list:first');
    var $m_show_more_doctors = m_me.$list.find('.show-more-doctors');
    var $m_show_more_doctors_wrapper = $m_show_more_doctors.parents('.show-more-wrapper');
    var m_filter_default = {};
    var m_filter = {};
    var m_data = {};
    var m_item_by_page = m_me.$list.data('item-by-page');
    var m_is_full_list = false;
    var m_xhr = null;
    var m_enable_history = enable_history || false;
    var m_prefix_get_param = 'doctor_list_';

    var Init = function () {
        var $professions_list = m_me.$filter.find('.professions-list li');
        $professions_list.click(function (e) {
            e.preventDefault();

            m_me.AddCondition('profession', $(this).data('id'));
            m_me.Reload();
        });

        var $tab_filters = m_me.$filter.find('.tab-filter li');
        $tab_filters.find('a').click(function (e) {
            e.preventDefault();

            $tab_filters.removeClass('selected');
            $(this).parents('li:first').addClass('selected');

            m_me.AddCondition('filter', $(this).data('filter'));
            m_me.Reload();
        });

        m_me.$list.on('click', '.button-container', function (e) {
            var $row = $(this).parents('.doctor-row');
            $(m_me)
                .trigger('button-container-click', {
                    event: e,
                    button: this,
                    data_row: $row.data()
                });
        });

        $m_show_more_doctors.click(function (e) {
            e.preventDefault();
            m_me.LoadMore();
        });

        var $default_profession = $professions_list.find('.default');
        if ($default_profession.length) {
            m_me.DefaultCondition('profession', $default_profession.parents('li').data('id'));
        }

        var $default_filter = $tab_filters.filter('.default');
        if ($default_filter.length) {
            m_me.DefaultCondition('filter', $default_filter.find('a').data('filter'));
        }
        
        var $selected_profession = $professions_list.find('.selected');
        if ($selected_profession.length) {
            m_me.AddCondition('profession', $selected_profession.parents('li').data('id'), true);
        }

        var $selected_filter = $tab_filters.filter('.selected');
        if ($selected_filter.length) {
            m_me.AddCondition('filter', $selected_filter.find('a').data('filter'), true);
        }

        if (m_enable_history) {
            window.addEventListener('popstate', function (e) {
                m_filter = e.state;
                m_me.RenderFilters();
                m_me.Reload();
            });

            if (!$.isEmptyObject(m_filter)) {
                m_me.UpdateUrl();
            }
        }
    };

    var RenderData = function (data) {
        $.each(data, function (i, html) {
            m_me.$list.find('.doctors-list-container').append(html);
        });

        m_me.$list.find('.doctor-row:not(:last)').removeClass('last-child');
        m_me.$list.find('.doctor-row:last').addClass('last-child');
    };

    var LoadList = function (send_data) {
        if (m_xhr) {
            m_xhr.abort();
        }

        var $none = m_me.$list.find('.none');
        $none.removeClass('show');

        $m_show_more_doctors_wrapper.hide();
        m_me.$list.find('.helpLoader:first').addClass('visible');

        send_data.filter = m_filter;
        send_data.count = m_item_by_page;
        $.extend(send_data, m_data);

        m_xhr = $.ajax({
            url: m_url,
            method: 'POST',
            dataType: 'json',
            data: send_data,
            success: function (data) {
                if (data.status === 'OK') {

                    RenderData(data.list);

                    if (send_data.start == 0 && !data.list.length) {
                        $none.addClass('show');
                    }

                    m_is_full_list = !data.list.length || data.list.length < send_data.count;
                    if (!m_is_full_list) {
                        $m_show_more_doctors_wrapper.show();
                    }
                } else {
                    PopupError(data.message, 'Возникла ошибка при загрузке врачей.');
                }
            },
            error: function (xhr, status) {
                if (status == 'abort' || xhr.status == 0) {
                    return;
                }
                PopupError('Во время загрузки данных произошла ошибка.');
            },
            complete: function (xhr) {
                m_me.$list.find('.helpLoader:first').removeClass('visible');
                m_xhr = null;
            }
        });
    };

    m_me.Show = function () {
        $m_order_chosen_wrapper.show();
    };

    m_me.Hide = function () {
        $m_order_chosen_wrapper.hide();
    };

    m_me.LoadMore = function () {
        var $last = m_me.$list.find('.doctor-row:last');

        var send_data = {
            start: $last.length ? $last.data('index') : 0
        };

        LoadList(send_data);
    };

    m_me.AddData = function (property, value) {
        m_data[property] = value;
    };

    m_me.AddCondition = function (property, value, without_url_updating) {
        if (typeof m_filter[property] == 'undefined' && m_filter_default[property] == value || m_filter[property] == value) {
            return;
        }

        m_filter[property] = value;

        if (m_enable_history && !without_url_updating) {
            m_me.UpdateUrl();
        }
    };

    m_me.UpdateUrl = function () {
        var params = {};
        var another_params = {};
        $.each(Helper.Url.getParams(), function(key, value) {
            if (key.indexOf(m_prefix_get_param) === 0) {
                key = key.replace(m_prefix_get_param, '');
                if (key) {
                    params[key] = value;
                }
            } else {
                another_params[key] = value;
            }
        });
        var isEqual = Helper.Object.Compare(params, m_filter);

        if (!isEqual) {
            var url = window.location.href.split('?')[0];
            $.each(another_params, function (name, val) {
                url = Helper.Url.addParam(name, val, url);
            });
            $.each(m_filter, function (name, val) {
                if (m_filter_default[name] !== val) {
                    url = Helper.Url.addParam(m_prefix_get_param + name, val, url);
                }
            });

            Helper.State.Push(m_filter, 'filters', url);
        }
    };

    m_me.DefaultCondition = function (property, value) {
        m_filter_default[property] = value;
    };

    m_me.Reload = function () {
        m_me.$list.find('.doctor-row').remove();
        LoadList({start: 0});
    };

    /**
     * Устанавливаем фильтры в зависимости от фильтров
     */
    m_me.RenderFilters = function () {

        var prof_name = '';
        if (m_filter && typeof m_filter['profession'] !== 'undefined') {
            m_me.$filter.find('.professions-list .selected').removeClass('selected');

            prof_name = m_me.$filter.find('li[data-id="' + m_filter['profession'] + '"]')
                            .children('.item')
                            .addClass('selected')
                            .find('.prof-name')
                            .text();

            m_me.$filter.find('.profession-name').text(prof_name);
        } else {
            m_me.$filter.find('.professions-list .selected').removeClass('selected');
            prof_name = m_me.$filter.find('li[data-id="0"]')
                            .children('.item')
                            .addClass('selected')
                            .find('.prof-name')
                            .text();
            m_me.$filter.find('.profession-name').text(prof_name);
        }

        if (m_filter && typeof m_filter['filter'] !== 'undefined') {
            m_me.$filter.find('a[data-filter="' + m_filter['filter'] + '"]')
                .parents('li')
                .addClass('selected')
                .siblings()
                .removeClass('selected');
        } else {
            m_me.$filter.find('a[data-filter="all"]')
                .parents('li')
                .addClass('selected')
                .siblings()
                .removeClass('selected');
        }
    };

    Init();
};