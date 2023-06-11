$(function () {

    "use strict";

    checkLogin();

    var params = new URLSearchParams(window.location.search);
    if (!params.has("id") || !params.has("project")) {
        window.location.href = "employees.html";
    }

    var id = params.get("id");
    var project = params.get("project");



    $.post(url + "api/employees/get-employee-attendance/" + id, {
        token: getCookie("token"),
        project: project,
        taker: true
    }).done(function (data) {

        if (data.success == true) {

            var events = [];

            var attendance = data.employee.attendance;


            attendance.forEach(function (value) {

                var date = new Date(value.year, value.month, value.day).getTime();

                var taker = value.taker.split(" ")[0] + " " + value.taker.split(" ")[1];

                events.push({
                    "id": value._id,
                    "title": taker,
                    "class": value.attendance == true ? "event-success" : "event-important",
                    "start": date + 100,
                    "end": date + 100
                });


            });


            var options = {
                events_source: events,
                view: 'month',
                tmpl_path: '../../assets/tmpls/',
                tmpl_cache: false,
                day: "now",
                onAfterViewLoad: function (view) {
                    $('#calender-title').text(this.getTitle());
                    $('.btn-group button').removeClass('active');
                    $('button[data-calendar-view="' + view + '"]').addClass('active');
                },
                classes: {
                    months: {
                        general: 'label'
                    }
                }
            };

            var calendar = $('#calendar').calendar(options);

            $('.btn-group button[data-calendar-nav]').each(function () {
                var $this = $(this);
                $this.click(function () {
                    calendar.navigate($this.data('calendar-nav'));

                });
            });

        } else if (data.success == false) {
            swal.fire(
                {
                    title: "خطأ في السيرفر",
                    text: JSON.stringify(data.err),
                    icon: "error"
                }
            );
        }
    }).fail(function (err) {
        swal.fire(
            {
                title: "خطأ في الطلب",
                text: err.status,
                icon: "error"
            }
        );
    });

});