$(function () {

    "use strict";

    checkLogin();
    checkRoleAndReturn("view-employee");
    checkRoleAndReturn("employee-attendance");

    var params = new URLSearchParams(window.location.search);
    if (!params.has("id") || !params.has("project")) {
        window.location.href = "employees.html";
    }

    var id = params.get("id");
    var project = params.get("project");


    var fast = false;


    $('#fast').change(function () {
        fast = this.checked;
    });


    $.post(url + "api/employees/get-employee-attendance/" + id, {
        token: getCookie("token"),
        project: project,
        taker: true
    }).done(function (data) {

        if (data.success == true) {

            var events = [];

            var attendance = data.employee.attendance;



            console.log(attendance);

            attendance.forEach(function (value) {

                if(value.project != project){
                    return;
                }

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

                    $('.cal-cell').click(function () {
                        fastAttendance(fast, id, project , this);
                    });

                });
            });

            $('.cal-cell').click(function () {
                fastAttendance(fast, id, project , this);
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


    $('#add-attendance').click(function () {
        Swal.fire({
            title: 'تسجيل حضور جديد',
            icon: "success",
            iconHtml: "<i class='fa fa-plus'></i>",
            html: '<form  class="text-left">\n' +
            '<div class="form-group">\n' +
            '    <label for="notes">ملاحظات</label>\n' +
            '<input type="text" class="form-control" id="notes"  placeholder="ادخل ملاحظة">\n' +
            '</div>\n' +
            '<div class="form-group">\n' +
            '    <label for="date">التاريخ</label>\n' +
            '    <input type="date" required class="form-control" id="date" placeholder="ادخل تاريخ الحضور">\n' +
            '</div>\n' +
            '<div class="form-group">\n' +
            '    <label for="attendance">حضور</label>\n' +
            '    <input checked type="checkbox" class="form-control" id="attendance" >\n' +
            '</div>\n' +
            '    </form>\n',
            focusConfirm: false,
            confirmButtonText: "حفظ",
            preConfirm: function () {

                var dateVal = $("#date").val();
                var notes = $("#notes").val();
                var attendance = $("#attendance").is(":checked");


                if (!dateVal) {
                    swal.fire({
                            icon: "error",
                            title: "خطأ",
                            text: "ادخل التاريخ"
                        }
                    );
                    return;
                }

                var date = new Date(dateVal);

                $.post(url + "api/employees/add-employee-attendance/" + id, {
                    token: getCookie("token"),
                    notes: notes,
                    date: new Date().getTime(),
                    project: project,
                    day: date.getDate(),
                    month: date.getMonth(),
                    year: date.getFullYear(),
                    attendance: attendance

                }).done(function (data) {

                    if (data.success == true) {
                        swal.fire(
                            {
                                title: "تم بنجاح",
                                icon: "success",
                                text: "تم اضافه الحضور بنجاح"
                            }
                        ).then(function (value) {
                            location.reload();
                        });
                    } else if (data.success == false) {
                        swal.fire(
                            {
                                icon: "error",
                                title: "خطأ في السيرفر",
                                text: JSON.stringify(data.err)
                            }
                        );
                    }
                }).fail(function (err) {
                    swal.fire(
                        "خطأ في الطلب", err.status.toString(), "error"
                    );
                });

            }
        });
    });

});


function fastAttendance(fast, id, project , $this) {

    var date = new Date($('[data-cal-date]', $this).data('cal-date').toString());

    var attendance = true;

    if ($($this).find('a').data('event-class') == 'event-success') {
        attendance = false;
    }

    $.post(url + "api/employees/add-employee-attendance/" + id, {
        token: getCookie("token"),
        date: new Date().getTime(),
        project: project,
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        attendance: attendance

    }).done(function (data) {

        if (data.success == true) {
            if (fast === true) {
                success();
            } else {
                swal.fire(
                    {
                        title: "تم بنجاح",
                        icon: "success",
                        text: "تم اضافه الحضور بنجاح"
                    }
                ).then(function (value) {
                    location.reload();
                });
            }
        } else if (data.success == false) {
            swal.fire(
                {
                    icon: "error",
                    title: "خطأ في السيرفر",
                    text: JSON.stringify(data.err)
                }
            );
        }
    }).fail(function (err) {
        swal.fire(
            "خطأ في الطلب", err.status.toString(), "error"
        );
    });
}
