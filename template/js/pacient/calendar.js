$(document).ready(function () {
    var $calendar = $('#calendar');
    var calendar = null;
    if ($calendar.length) {
        calendar = new CalendarUser({
            'calendar': $calendar,
            'iddoctor': $('#doctId').val(),
            'idpatient': $('#myId').val(),
            'confirm_request_creation_modal': $('#confirmRequestCreationModal'),
            'request_success_callback': function(data) {
                SendGAConsultationCreated();
                CM.redirectToHistory(data.request.id, true);
            }
        });

        $('#payForPromo').click(function (e) {
            e.preventDefault();

            calendar.setTickPromo();
        });


        $('#payForChosen').click(function (e) {
            e.preventDefault();

            calendar.setTick();
        });
    }
});