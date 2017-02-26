$(document).ready(function () {
    var $orderChosenWrapper = $('.order-chosen-wrapper');

    var doctor_list = new Controls.DoctorList($orderChosenWrapper, '/doctors/list/', true);
    doctor_list.AddData('short_info_show', 1);
});