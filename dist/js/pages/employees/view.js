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
                $('#code').text(data.employee.code);

                $('#job-date').text(new Date(data.employee.job.date).toLocaleDateString());
                $('#qualification').text(data.employee.qualification.title);
                $('#qualification-date').text(new Date(data.employee.qualification.date).toLocaleDateString());
                $('#birthdate').text(new Date(data.employee.birth.date).toLocaleDateString());

                if (data.employee.phones) {
                    data.employee.phones.forEach(function (value) {
                        $('#phones').append('<h6>' + value + '</h6>');
                    });
                }


            }

            if (checkRole("show-employee-password") === true) {
                $('#password-hidden').val(data.employee.password);
                $('#password-row').removeClass('d-none');
            }

            if (checkRole("show-edit-salary") === true) {
                $('#salary').text(data.employee.salary);
                $('#insurance').text(data.employee.insurance);
                $('#salary-row').removeClass('d-none');

                $('#edit-salary').click(function () {
                    editSalary(id);
                });

                $('#edit-insurance').click(function () {
                    editInsurance(id);
                });
            }

            if (checkRole("show-edit-holidays") === true) {
                $('#paid-holidays').text(data.employee.paid_holidays);
                $('#holidays-row').removeClass('d-none');

                $('#edit-paid-holidays').click(function () {
                    editPaidHolidays(id);
                });
            }


            if (checkRole("change-employee-roles") === true) {
                $('#roles-btn').removeClass('d-none');
            }

            if (checkRole("edit-employee") === true) {
                $('#edit-current-project').click(function () {
                    changeProject(id);
                });

                $('#edit-code').removeClass('d-none');

                $('#edit-code').click(function () {
                    editCode(id);
                });

                $('#edit-btn').removeClass('d-none');
                $('#edit-btn').click(function () {
                    editEmployee(id, data.employee);
                });

                $('#edit-photo').removeClass('d-none');

                $('#edit-photo').click(function () {
                    updatePhoto(id);
                });
            }

            getEmployeeProjects(id);

            var today = new Date();

            if (checkRole("employee-attendance-report") === true) {

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
            }

            if (checkRole("employee-salary-report") === true) {

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

function editEmployee(id, employee) {
    Swal.fire({
        title: employee.name,
        icon: "success",
        iconHtml: "<img onerror='imgError(this)' src='" + (url + 'profiles-files/' + employee.photo) + "' class='img-fluid'>",
        html: '<form  class="text-left">\n' +
        '<div class="form-group">\n' +
        '    <label for="edited-name">الاسم</label>\n' +
        '<input type="text" value="' + employee.name + '" required class="form-control" id="edited-name"  placeholder="ادخل الاسم">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="edited-email">البريد</label>\n' +
        '    <input type="email" value="' + employee.email + '" class="form-control" id="edited-email" placeholder="ادخل البريد">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="edited-job">الوظيفه</label>\n' +
        '    <input type="text" value="' + employee.job.title + '" required class="form-control" id="edited-job" placeholder="ادخل الوظيفه">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="edited-job_date">تاريخ التوظيف</label>\n' +
        '    <input type="date" value="' + new Date(employee.job.date).toLocaleDateString('en-CA') + '" required class="form-control" id="edited-job_date" placeholder="ادخل تاريخ التوظيف">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="edited-qualification">المؤهل</label>\n' +
        '    <input type="text" value="' + employee.qualification.title + '" class="form-control" id="edited-qualification" placeholder="ادخل المؤهل">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="edited-qualification_date">تاريخ المؤهل</label>\n' +
        '    <input type="date" value="' + new Date(employee.qualification.date).toLocaleDateString('en-CA') + '" class="form-control" id="edited-qualification_date" placeholder="ادخل تاريخ المؤهل">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="edited-address">العنوان</label>\n' +
        '    <input type="text" value="' + employee.address + '" class="form-control" id="edited-address" placeholder="ادحل العنوان">\n' +
        '</div>\n' +

        '<div class="form-group">\n' +
        '    <label for="edited-birthdate">تاريخ الميلاد</label>\n' +
        '    <input type="date" value="' + new Date(employee.birth.date).toLocaleDateString('en-CA') + '" class="form-control" id="edited-birthdate" placeholder="ادخل تاريخ الميلاد">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="edited-birthaddress">عنوان الميلاد</label>\n' +
        '    <input type="text" value="' + employee.birth.address + '" class="form-control" id="edited-birthaddress" placeholder="ادخل عنوان الميلاد">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="edited-phones">ارقام الهاتف</label>\n' +
        '    <input type="text" value="' + employee.phones + '" class="form-control" id="edited-phones" placeholder="ادخل الهاتف">' +
        '    <small class="form-text text-muted">افصل بين كل رقم بعلامة ( , )</small>' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="edited-contract">العقد</label>\n' +
        '    <input type="checkbox" checked="' + employee.contract + '" class="form-control" id="edited-contract" >\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="edited-receipt">الايصال</label>\n' +
        '    <input type="checkbox" ' + (employee.receipt.receipt === true ? 'checked' : '') + ' onclick="enableReceipt();" class="form-control" id="edited-receipt" >\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="edited-receipt_value">قيمة الايصال</label>\n' +
        '    <input type="text" value="' + employee.receipt.value + '" ' + (employee.receipt.receipt === true ? '' : 'disabled') + ' class="form-control" id="edited-receipt_value" placeholder="ادخل قيمة الايصال">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="edited-code">الكود</label>\n' +
        '    <input type="number" value="' + employee.code + '" class="form-control" id="edited-code" placeholder="ادخل الكود">\n' +
        '</div>\n' +
        '    </form>\n',
        focusConfirm: false,
        confirmButtonText: "حفظ",
        preConfirm: function () {


            var name = $("#edited-name").val();
            var code = $("#edited-code").val();
            var job = $("#edited-job").val();
            var job_date = $("#edited-job_date").val();
            var qualification = $("#edited-qualification").val();
            var qualification_date = $("#edited-qualification_date").val();
            var birthdate = $("#edited-birthdate").val();
            var birthaddress = $("#edited-birthaddress").val();
            var address = $("#edited-address").val();
            var receipt = $("#edited-receipt").is(":checked");
            var receipt_value = $("#edited-receipt_value").val();
            var contract = $("#edited-contract").is(":checked");
            var phones = $("#edited-phones").val();

            var email = $("#edited-email").val();

            progress();

            $.post(url + "api/employees/update-employee/" + id, {
                token: getCookie("token"),
                name: name,
                job: job,
                job_date: job_date,
                qualification: qualification,
                qualification_date: qualification_date,
                birthdate: birthdate,
                birthaddress: birthaddress,
                address: address,
                phones: phones,
                code: code,
                email: email,
                contract: contract,
                receipt: receipt,
                receipt_value: receipt === true ? receipt_value : 0
            }).done(function (data) {

                if (data.success == true) {
                    swal.fire(
                        {
                            title: "تم بنجاح",
                            icon: "success",
                            text: "تم تحديث الموظف بنجاح"
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

function enableReceipt() {
    if ($('#edit-receipt').is(":checked")) {
        $('#edit-receipt_value').prop("disabled", false);
    } else {
        $('#edit-receipt_value').prop("disabled", true);
    }
}

function imgError(image) {
    image.onerror = "";
    image.src = url + 'images/employee.png';
    return true;
}

function editPaidHolidays(id) {
    swal.fire({
        title: "تغيير الاجازات المدفوعه",
        icon: "success",
        iconHtml: "<i class='fa fa-plus'></i>",
        input: "number",
        confirmButtonText: "حفظ",
        showLoaderOnConfirm: true,
        preConfirm: function (result) {
            $.post(url + "api/employees/add-paid-holidays/" + id, {
                token: getCookie("token"),
                holidays: result
            }).done(function (data) {
                if (data.success == true) {
                    swal.fire(
                        {
                            title: "تم بنجاح",
                            icon: "success",
                            text: "تم اضافه الاجازات بنجاح"
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

function editSalary(id) {
    swal.fire({
        title: "تغيير الراتب",
        icon: "success",
        iconHtml: "<i class='fa fa-dollar-sign'></i>",
        html: '<form class="text-left">' +
        '<div class="form-group">\n' +
        '    <label for="edited-name">اساسي</label>\n' +
        '<input type="number" step="500"  required class="form-control" id="primary-salary"  value="2500">\n' +
        '</div>\n' +
        '<div class="form-row">' +
        '<div class="form-group col-6">\n' +
        '    <label for="edited-name">سنوات الخبرة</label>\n' +
        '<input type="number"  required class="form-control" id="experience-years" >\n' +
        '</div>\n' +
        '<div class="form-group col-6">\n' +
        '    <label for="edited-name">القيمة</label>\n' +
        '<input type="number" step="50"  required class="form-control" id="experience-value"  value="150">\n' +
        '</div>\n' +
        '</div>\n' +
        '<div class="form-row">' +
        '<div class="form-group col-6">\n' +
        '    <label for="edited-name">سنوات العمل بالشركة</label>\n' +
        '<input type="number"  required class="form-control" id="work-years"  >\n' +
        '</div>\n' +
        '<div class="form-group col-6">\n' +
        '    <label for="edited-name">القمية</label>\n' +
        '<input type="number" value="150" step="50"  required class="form-control" id="work-value" >\n' +
        '</div>\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="edited-name">حافز التميز</label>\n' +
        '<input type="number" step="50" value="0"  required class="form-control" id="excellence-value">\n' +
        '</div>\n' +
        '</form>',
        confirmButtonText: "حفظ",
        showLoaderOnConfirm: true,
        preConfirm: function (result) {

            var primary = parseInt($('#primary-salary').val());
            var experience_years = parseInt($('#experience-years').val());
            var experience_val = parseInt($('#experience-value').val());
            var work_years = parseInt($('#work-years').val());
            var work_val = parseInt($('#work-value').val());
            var excellence = parseInt($('#excellence-value').val());


            var salary = primary + (experience_val * experience_years) + (work_val * work_years) + excellence;


            $.post(url + "api/employees/add-employee-salary/" + id, {
                token: getCookie("token"),
                salary: salary
            }).done(function (data) {
                if (data.success == true) {
                    swal.fire(
                        {
                            title: "تم بنجاح",
                            icon: "success",
                            text: "تم اضافه المرتب بنجاح"
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

function editInsurance(id) {
    swal.fire({
        title: "تغيير التامينات",
        icon: "success",
        iconHtml: "<i class='fa fa-dollar-sign'></i>",
        html: '<form class="text-left">' +
        '<div class="form-group">\n' +
        '    <label for="insurance-value">القيمة</label>\n' +
        '<input type="number" step="50"  required class="form-control" id="insurance-value"  value="2500">\n' +
        '</div>\n' +
        '</div>\n' +
        '</form>',
        confirmButtonText: "حفظ",
        showLoaderOnConfirm: true,
        preConfirm: function (result) {

            var insurance = parseInt($('#insurance-value').val());

            $.post(url + "api/employees/add-employee-insurance/" + id, {
                token: getCookie("token"),
                insurance: insurance
            }).done(function (data) {
                if (data.success == true) {
                    swal.fire(
                        {
                            title: "تم بنجاح",
                            icon: "success",
                            text: "تم اضافه التامينات بنجاح"
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

function editCode(id) {
    swal.fire({
        title: "تغيير لكود",
        icon: "success",
        iconHtml: "<i class='fa fa-id-badge'></i>",
        html: '<form class="text-left">' +
        '<div class="form-group">\n' +
        '    <label for="new-code">الكود</label>\n' +
        '<input type="number"  required class="form-control" id="new-code"  value="1">\n' +
        '</div>' +
        '</form>',
        confirmButtonText: "حفظ",
        showLoaderOnConfirm: true,
        preConfirm: function (result) {

            var code = parseInt($('#new-code').val());

            $.post(url + "api/employees/add-employee-code/" + id, {
                token: getCookie("token"),
                code: code
            }).done(function (data) {
                if (data.success == true) {
                    swal.fire(
                        {
                            title: "تم بنجاح",
                            icon: "success",
                            text: "تم تغيير الكود بنجاح"
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

function changeProject(id) {
    progress();

    $.post(url + "api/projects/get-all", {
        token: getCookie("token"),
        id: id
    }).done(function (data) {
        if (data.success == true) {

            var options = {};

            for (var i = 0; i < data.projects.length; i++) {
                options[data.projects[i].id] = data.projects[i].name;
            }

            swal.fire({
                title: "تغيير المشروع",
                icon: "success",
                iconHtml: "<i class='mdi mdi-plus'></i>",
                input: "select",
                inputOptions: options,
                confirmButtonText: "حفظ",
                showLoaderOnConfirm: true,
                preConfirm: function (result) {
                    $.post(url + "api/projects/add-project-employee/" + result, {
                        token: getCookie("token"),
                        id: id,
                        move: true
                    }).done(function (data) {
                        if (data.success == true) {
                            swal.fire(
                                {
                                    title: "تم بنجاح",
                                    icon: "success",
                                    text: "تم تغيير المشروع بنجاح"
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

function getEmployeeAttendance(id, name, month, year) {

    $.post(url + "api/employees/get-employee-attendance/" + id, {
        token: getCookie("token"),
        taker: true
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