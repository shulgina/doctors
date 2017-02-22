(function ($) {

    // Выпадающий список на странице врачей
    $.fn.mmt_dropdown = function ($orderChosenWrapper) {

        var m_me = this;
        // var m_doctor_list = new Controls.DoctorList($orderChosenWrapper);

        m_me.addClass('drop-down-list');

        m_me.children('.list-label').on('click', function () {
            $(this).parent().toggleClass('active');
            m_me.hide($(this).parent().siblings());
        });

        $('body').on('click', function (e) {
            var isDropdown = $(e.target).closest('.drop-down-list').length;

            if (!isDropdown) {
                m_me.hide();
            }
        });

        m_me.children('ul').children('li').on('click', function () {
            var $me = $(this).find('.item:first');

            var selected_name = $me.text().trim();

            m_me.find('.item.selected:first').removeClass('selected');

            $me.addClass('selected');

            m_me.find('.active-value')
                .text(selected_name);
            m_me.hide();

            // m_doctor_list.LoadMore();
        });

        m_me.hide = function (target) {
            target = target || m_me;

            target.removeClass('active');
        }

    };

})(jQuery);
