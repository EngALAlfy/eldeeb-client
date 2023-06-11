$(function () {
    "use strict";

    checkLogin();

    var name = 'N/A';
    var id = '';

    $.post(url + "api/employees/get-profile", {
        token: getCookie("token")
    }).done(function (data) {

        if (data.success == true) {

            name = data.employee.name;
            id = data.employee.id;


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

            $('#password-hidden').val(data.employee.password);

            $('#salary').text(data.employee.salary);


            $('#paid-holidays').text(data.employee.paid_holidays);

            $('#edit-photo').click(function () {
                updatePhoto(id);
            });

            $('#change-password').click(function () {
                changePassword();
            });

            getEmployeeProjects(id);

            var today = new Date();

            $('#attendance-info-year option[value=' + today.getFullYear() + ']').attr('selected', 'selected');
            $('#attendance-info-month option[value=' + (today.getMonth() + 1) + ']').attr('selected', 'selected');

            $('#attendance-info-month').change(function () {
                var month = $(this).val() - 1;
                var year = $('#attendance-info-year').val();

                getEmployeeAttendance(id, name, month, year);

            });

            $('#attendance-info-year').change(function () {
                var year = $(this).val();
                var month = $('#attendance-info-month').val() - 1;

                getEmployeeAttendance(id, name, month, year);

            });

            getEmployeeAttendance(id, name, today.getMonth(), today.getFullYear());


            $('#salary-info-year option[value=' + today.getFullYear() + ']').attr('selected', 'selected');
            $('#salary-info-month option[value=' + (today.getMonth() + 1) + ']').attr('selected', 'selected');

            $('#salary-info-month').change(function () {
                var month = $(this).val() - 1;
                var year = $('#salary-info-year').val();

                getEmployeeSalaryInfo(id, data.employee.code, name, month, year);

            });

            $('#salary-info-year').change(function () {
                var year = $(this).val();
                var month = $('#salary-info-month').val() - 1;

                getEmployeeSalaryInfo(id, data.employee.code, name, month, year);

            });

            getEmployeeSalaryInfo(id, data.employee.code, name, today.getMonth(), today.getFullYear());

            getEmployeeSalaryAverage(id, today.getFullYear());

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

function changePassword() {

    Swal.fire({
        icon: "success",
        iconHtml: "<i class='fa fa-lock'></i>",
        title: 'تغيير كلمة السر',
        input: 'text',
        inputAttributes: {
            'type': 'password',
            'placeHolder': 'ادخل كلمة السر'
        },
        preConfirm: function (password) {
            progress();
            if (!password) {
                swal.fire({
                    icon: "error",
                    title: "خطأ",
                    text: "من فضلك ادخل كلمة السر"
                });

                return;
            }

            $.post(url + "api/employees/change-profile-password", {
                token: getCookie("token"),
                password: password
            }).done(function (data) {

                if (data.success == true) {
                    swal.fire(
                        {
                            title: "تم بنجاح",
                            icon: "success",
                            text: "تم تحديث كلمة السر بنجاح"
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

}

function updatePhoto(id) {
    Swal.fire({
        icon: "success",
        iconHtml: "<i class='fa fa-image'></i>",
        title: 'اختر صورة',
        input: 'file',
        inputAttributes: {
            'accept': 'image/*',
            'aria-label': 'ارفع صورة شخصيه'
        },
        preConfirm: function (photo) {
            progress();
            if (!photo) {
                swal.fire({
                    icon: "error",
                    title: "خطأ",
                    text: "من فضلك اختر صورة"
                });

                return;
            }

            var reader = new FileReader();
            reader.readAsDataURL(photo);

            reader.onloadend = function (ev) {
                var base64 = reader.result.split("base64,").pop();
                var ext = photo.name.split(".").pop();

                $.post(url + "api/employees/update-employee-photo/" + id, {
                    token: getCookie("token"),
                    photo_ext: ext,
                    photo: base64
                }).done(function (data) {

                    if (data.success == true) {
                        swal.fire(
                            {
                                title: "تم بنجاح",
                                icon: "success",
                                text: "تم تحديث صورة الموظف بنجاح"
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
        }
    });
}

function getEmployeeProjects(id) {
    $.post(url + "api/projects/get-employee-projects", {
        token: getCookie("token"),
        id: id
    }).done(function (data) {

        if (data.success == true) {
            if (data.projects && data.projects.length > 0) {
                for (var i = 0; i < data.projects.length; i++) {

                    $('#current-project').append('<h6>' + data.projects[i].name + '</h6>');

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
                        '                                    <td  class="d-none project-attendance"><a href="view-profile-project-attendance.html?id=' + id + '&project=' + data.projects[i].id + '" class="m-b-0 btn btn-secondary"><i class="mdi mdi-check text-white-50"></i></a></td>' +
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

function getEmployeeAttendance(id, name, month, year) {

    $.post(url + "api/employees/get-employee-attendance/" + id, {
        token: getCookie("token"),
        taker:true
    }).done(function (_data) {

        if (_data.success == true) {

            var attendanceMap = {};

            var columns = [];
            var data = [];


            var attendance = _data.employee.attendance;


            attendance.forEach(function (value) {

                if (value.month != month || value.year != year) {
                    return;
                }


                if (!attendanceMap[value.project]) {
                    attendanceMap[value.project] = []
                }

                attendanceMap[value.project].push(value);

            });

            var num_of_days = new Date(year, month + 1, 0).getDate();

            columns.push({
                title: "id",
                field: "id",
                visible: false
            });
            columns.push({
                title: "الاسم",
                field: "name"
            });
            columns.push({
                title: "المشاريع",
                field: "projects"
            });

            for (var _i in attendanceMap) {

                var obj = {id: _i, name: name, projects: attendanceMap[_i][0].name};

                for (var i = 0; i < attendanceMap[_i].length; i++) {
                    if (attendanceMap[_i][i].attendance === true) {
                        var taker = attendanceMap[_i][i].taker.split(" ")[0] + " " + attendanceMap[_i][i].taker.split(" ")[1];
                        obj[attendanceMap[_i][i].day] = "&#10003;\n" + taker;
                    } else if (attendanceMap[_i][i].attendance === false) {
                        var taker = attendanceMap[_i][i].taker.split(" ")[0] + " " + attendanceMap[_i][i].taker.split(" ")[1];
                        obj[attendanceMap[_i][i].day] = "&#10005;\n" + taker;
                    }

                }
                data.push(obj);
            }

            for (var day = 1; day <= num_of_days; day++) {

                var column = {};

                column.field = day;
                column.title = day;

                columns.push(column);
            }

            if (checkRole("employee-attendance-report") === true) {
                $('.attendance-card').removeClass('d-none');
            }


            var table = $("#attendance-table");


            table.bootstrapTable('destroy').bootstrapTable({
                columns: columns,
                data: data,
                exportDataType: 'all',
                exportTypes: ['pdf', 'excel'],
                printIgnore: true,
                exportOptions: {
                    mso: {fileFormat: 'xlsx'},
                    xslx: {rtl: true, formatId: {date: 14, numbers: 2}},
                    rtl: true,
                    escape: false, pdfmake: {
                        enabled: true,
                        docDefinition: {
                            pageOrientation: 'landscape',
                            defaultStyle: {alignment: 'right', direction: 'rtl'}
                        }
                    }
                }
            });

        } else if (_data.success == false) {
            swal.fire(
                {
                    title: "خطأ في السيرفر",
                    text: JSON.stringify(_data.err),
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

function getEmployeeSalaryAverage(id, year) {
    $.post(url + "api/employees/get-employee-salary-info/" + id, {
        token: getCookie("token")
    }).done(function (_data) {

        if (_data.success == true) {


            var data = [];

            var info = _data.employee.salary_info;

            var row = {};

            row.id = id;
            row.salary = 0;
            row.rewards = 0;

            info.forEach(function (value) {

                if (value.year != year) {
                    return;
                }


                row.attendance_salary += parseInt(value.attendance_salary);

                row.rewards += parseInt(value.rewards);

            });


            var count = info.length;


            var insurance = parseInt(_data.employee.insurance) * count;

            row.average2 = (row.salary + row.rewards + insurance) / count;

            row.average1 = parseInt(_data.employee.salary) + ( (row.rewards + insurance) / count);


            if (checkRole("employee-salary-report") === true) {
                $('.salary-card').removeClass('d-none');
            }

            data.push(row);

            var table = $("#salary-average");

            table.bootstrapTable('destroy').bootstrapTable({
                data: data,
                exportDataType: 'all',
                exportTypes: ['pdf', 'excel'],
                printIgnore: true,
                exportOptions: {
                    mso: {fileFormat: 'xlsx'},
                    xslx: {rtl: true, formatId: {date: 14, numbers: 2}},
                    rtl: true,
                    escape: false, pdfmake: {
                        enabled: true,
                        docDefinition: {
                            pageOrientation: 'landscape',
                            defaultStyle: {alignment: 'right', direction: 'rtl'}
                        }
                    }
                }
            });

            table.bootstrapTable('hideColumn', 'id');


        } else if (_data.success == false) {
            swal.fire(
                {
                    title: "خطأ في السيرفر",
                    text: JSON.stringify(_data.err),
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

function getEmployeeSalaryInfo(id, code, name, month, year) {
    $.post(url + "api/employees/get-employee-salary-info/" + id, {
        token: getCookie("token")
    }).done(function (_data) {

        if (_data.success == true) {


            var data = [];


            var info = _data.employee.salary_info;


            info.forEach(function (value) {

                if (value.month != month || value.year != year) {
                    return;
                }

                var row = {};

                row.id = id;
                row.code = code;
                row.name = name;

                row.salary = value.salary;

                //row.month_days = value.month_days;
                //row.fridays = value.fridays;

                row.formal_holidays = value.formal_holidays;
                row.paid_holidays = value.paid_holidays;
                row.work_days = value.work_days;

                row.attend_days = value.attend_days;
                row.absence_days = value.absence_days;

                row.month = value.month;

                //row.attendance_salary = value.attendance_salary;

                row.borrows = value.borrows;
                row.discounts = value.discounts;
                row.additions = value.additions;
                row.rewards = value.rewards;

                row.final_salary = value.final_salary;

                data.push(row);
            });


            if (checkRole("employee-salary-report") === true) {
                $('.salary-card').removeClass('d-none');
            }


            var table = $("#salary-table");

            table.bootstrapTable('destroy').bootstrapTable({
                data: data,
                exportDataType: 'all',
                exportTypes: ['pdf', 'excel'],
                printIgnore: true,
                exportOptions: {
                    mso: {fileFormat: 'xlsx'},
                    xslx: {rtl: true, formatId: {date: 14, numbers: 2}},
                    rtl: true,
                    escape: false, pdfmake: {
                        enabled: true,
                        docDefinition: {
                            pageOrientation: 'landscape',
                            defaultStyle: {alignment: 'right', direction: 'rtl'}
                        }
                    }
                }
            });

            table.bootstrapTable('hideColumn', 'id');


        } else if (_data.success == false) {
            swal.fire(
                {
                    title: "خطأ في السيرفر",
                    text: JSON.stringify(_data.err),
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