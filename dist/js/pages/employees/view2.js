$(function () {
    "use strict";

    checkLogin();
    checkRoleAndReturn("view-employee");

    var params = new URLSearchParams(window.location.search);
    if (!params.has("id")) {
        window.location.href = "employees.html";
    }

    var id = params.get("id");
    var name = 'N/A';

    $.post(url + "api/employees/get-employee/" + id, {
        token: getCookie("token")
    }).done(function (data) {

        if (data.success == true) {
            $('#roles-btn').attr('href', "employee-roles.html?id=" + data.employee.id);

            name = data.employee.name;

            if (data.employee.username == "admin") {
                $('#username').text(data.employee.username);
                //$('#password').text("******");
            } else {


                $('#name').text(data.employee.name);
                $('#employee-photo').attr('src', url + 'profiles-files/' + data.employee.photo);
                $('#email').text(data.employee.email);
                $('#username').text(data.employee.username);
                $('#password').text("******");

                $('#job').text(data.employee.job.title);
                $('#address').text(data.employee.address);

                $('#job-date').text(new Date(data.employee.job.date).toLocaleDateString());
                $('#qualification').text(data.employee.qualification.title);
                $('#qualification-date').text(new Date(data.employee.qualification.date).toLocaleDateString());
                $('#birthdate').text(new Date(data.employee.birth.date).toLocaleDateString());

                data.employee.phones.forEach(function (value) {
                    $('#phones').append('<h6>' + value + '</h6>');

                });

            }

            if (checkRole("show-employee-password") === true) {
                $('#password-hidden').val(data.employee.password);
                $('#password-row').removeClass('d-none');
            }

            if (checkRole("change-employee-roles") === true) {
                $('#roles-btn').removeClass('d-none');
            }

            getEmployeeProjects(id);

            if (checkRole("employee-attendance-report") === true) {
                getEmployeeAttendance(id, name);
            }

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

    $('#show-password').click(function () {
        if ($('#password').hasClass("star")) {

            $('#password').text($('#password-hidden').val());
            $('#password').removeClass("star");
        } else {
            $('#password').text("******");
            $('#password').addClass("star");
        }
    });


});


function getEmployeeProjects(id) {
    $.post(url + "api/projects/get-employee-projects", {
        token: getCookie("token"),
        id: id
    }).done(function (data) {

        if (data.success == true) {
            if (data.projects && data.projects.length > 0) {
                for (var i = 0; i < data.projects.length; i++) {

                    $("#projects-in tbody").append('<tr>' +
                        '                                    <td>' +
                        '                                        <div class="d-flex align-items-center">' +
                        '                                            <div class="m-r-10"><a class="btn btn-circle btn-orange text-white">م</a>' +
                        '                                            </div>' +
                        '                                            <div class="">' +
                        '                                                <h4 class="m-b-0 font-16">' + data.projects[i].name + '</h4>' +
                        '                                            </div>' +
                        '                                        </div>' +
                        '                                    </td>' +
                        '                                    <td>' + data.projects[i].owner + '</td>' +
                        '                                    <td  class="d-none project-attendance"><a href="view-employee-project-attendance.html?id=' + id + '&project=' + data.projects[i].id + '" class="m-b-0 btn btn-secondary"><i class="mdi mdi-check text-white-50"></i></a></td>' +
                        '                                    <td><a target="_blank" href="../projects/view-project.html?id=' + data.projects[i].id + '" class="m-b-0 btn btn-success"><i class="mdi mdi-eye text-white-50"></i></a></td>' +
                        '                                </tr>');
                }

            }

            if (checkRole("employee-attendance") === true) {
                $('.project-attendance').removeClass('d-none');
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

function getEmployeeAttendance(id, name) {
    $.post(url + "api/employees/get-employee-attendance/" + id, {
        token: getCookie("token")
    }).done(function (data) {

        if (data.success == true) {

            var attendanceMap = {};

            var columns = [];

            var attendance = data.employee.attendance;

            var today = new Date();

            attendance.forEach(function (value) {


                if (value.month != today.getMonth()) {
                    return;
                }


                if (!attendanceMap[value.project]) {
                    attendanceMap[value.project] = []
                }

                //var attendanceList = attendanceMap[value.project];
                //attendanceList.push(value);
                //attendanceMap[value.project] = attendanceList;

                attendanceMap[value.project].push(value);

            });

            var num_of_days = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

            var thead = '<th>الاسم</th><th>المشاريع</th>';

            for (var day = 1; day <= num_of_days; day++) {

                var column = {};

                column.field = day;
                column.title = day;

                columns.push(column);

                var styleth = '';
                if(new Date(today.getFullYear() , today.getMonth() , day).getDay() == 5){
                    styleth = 'rgba(236,34,12,0.6);';
                }
                thead += '<th style=\"background-color: '+styleth+'\">' + day + '</th>';
            }

            if (checkRole("employee-attendance-report") === true) {
                $('.attendance-card').removeClass('d-none');
            }

            $("#attendance-table thead tr").append(thead);

            var trMap = [];
            var tbody = '';

            for (var _i in attendanceMap) {
                var _td = '<td>' + attendanceMap[_i][0].name + '</td>';

                var daysMatch = false;
                var isAttend = 'N/A';

                for (var _day = 1; _day <= num_of_days; _day++) {
                    var style = '';

                    if(new Date(today.getFullYear() , today.getMonth() , _day).getDay() == 5){
                        style = 'rgba(236,34,12,0.6);';
                    }

                    attendanceMap[_i].forEach(function (value) {
                        if (value.day == _day) {
                            daysMatch = true;
                            isAttend = value.attendance;
                        }
                    });

                    if (daysMatch) {
                        _td += '<td style=\"background-color: '+style+'\"><i class="' + (isAttend === true ? 'event-success' : (isAttend === false ? 'event-important' : 'd-none')) + '"></i></td>';
                        daysMatch = false;
                        isAttend = 'N/A';
                    } else {
                        //_td += '<td>' + _day + '</td>';
                        _td += '<td style=\"background-color: '+style+'\"></td>';
                    }
                }

                trMap.push(_td);
            }


            var td = '<td rowspan="' + trMap.length + '">' + name + '</td>';


            for (var i = 0; i < trMap.length; i++) {

                tbody += '<tr>';

                if (i === 0) {
                    tbody += td;
                }

                tbody += trMap[i];


                tbody += '</tr>';

            }


            $("#attendance-table tbody").append(tbody);


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

}