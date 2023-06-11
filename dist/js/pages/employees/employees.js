$(function () {
    "use strict";

    checkLogin();
    checkRoleAndReturn("view-employee");


    if(checkRole("add-employee") === true){
        $('#add-employee').removeClass('d-none');
    }

    $.post(url + "api/employees/get-all", {
        token: getCookie("token")
    }).done(function (data) {

        if (data.success == true) {
            if (data.employees && data.employees.length > 0) {
                for (var i = 0; i < data.employees.length; i++) {

                    if(data.employees[i].username === "admin"){
                        continue;
                    }

                    $("#employees-table tbody").append('<tr>' +
                        '                                    <td>' +
                        '                                        <div class="d-flex align-items-center">' +
                        '                                            <div class="m-r-10"><img width="70" height="70" src="'+url + 'profiles-files/' + data.employees[i].photo +'" class="rounded-circle" onerror="this.src=\''+url+ "images/employee.png" +'\'">' +
                        '                                            </div>' +
                        '                                            <div class="">' +
                        '                                                <h4 class="m-b-0 font-16">' + data.employees[i].name + '</h4>' +
                        '                                            </div>' +
                        '                                        </div>' +
                        '                                    </td>' +
                        '                                    <td>' + (data.employees[i].job ? data.employees[i].job.title : '--') + '</td>' +
                        '                                    <td>' + (data.employees[i].qualification ? data.employees[i].qualification.title : '--') + '</td>' +
                        '                                    <td>' + (data.employees[i].qualification ? new Date(data.employees[i].qualification.date).toLocaleDateString() : '--') +
                        '                                    </td>' +
                        '                                    <td>' + (data.employees[i].birth ? new Date(data.employees[i].birth.date).toLocaleDateString() : '--') + '</td>' +
                        '                                    <td><a href="view-employee.html?id=' + data.employees[i].id + '" role="button" class="m-b-0 btn btn-success"><i class="mdi mdi-eye text-white-50"></i></a></td>' +
                        '                                    <td class="delete-employee d-none">' +
                        '                                        <a role="button" onclick="deleteEmployee(\'' + data.employees[i].id + '\')" class="m-b-0 btn btn-danger"><i class="mdi mdi-delete text-white-50"></i></a>' +
                        '                                    </td>' +
                        '                                </tr>');
                }
            }

            if(checkRole("delete-employee") === true){
                $('.delete-employee').removeClass('d-none');
            }

        } else if (data.success == false) {
            swal.fire(
                {
                    icon: "error",
                    title: "خطأ في السيرفر",
                    text: JSON.stringify(JSON.stringify(data.err))
                }
            );
        }
    }).fail(function (err) {
        swal.fire(
            {
                icon: "error",
                title: "خطأ في الطلب",
                text: JSON.stringify(err)
            }
        );
    });

    $('#add-employee').click(function () {
        addEmployee();
    });


});

function addEmployee() {
    Swal.fire({
        title: 'موظف جديد',
        icon: "success",
        iconHtml: "<i class='fa fa-plus'></i>",
        html: '<form  class="text-left">\n' +
        '<div class="form-group">\n' +
        '    <label for="name">الاسم</label>\n' +
        '<input type="text" required class="form-control" id="name"  placeholder="ادخل الاسم">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="email">البريد</label>\n' +
        '    <input type="email" class="form-control" id="email" placeholder="ادخل البريد">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="username">اسم المستخدم</label>\n' +
        '    <input type="text"  required class="form-control" id="username" placeholder="ادخل اسم المستخدم">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="photo">الصورة الشخصية</label>\n' +
        '    <input type="file" class="form-control" id="photo" placeholder="الصورة الشخصيه">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="job">الوظيفه</label>\n' +
        '    <input type="text" required class="form-control" id="job" placeholder="ادخل الوظيفه">\n' +
        '</div>\n' +'<div class="form-group">\n' +
        '    <label for="job">الراتب</label>\n' +
        '    <input type="number" required class="form-control" id="salary" placeholder="ادخل الراتب">\n' +
        '</div>\n' +
        '</div>\n' +'<div class="form-group">\n' +
        '    <label for="job">الاجازات المدفوعه</label>\n' +
        '    <input type="number" required class="form-control" id="paid_holidays" placeholder="ادخل الاجازات">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="job_date">تاريخ التوظيف</label>\n' +
        '    <input type="date" required class="form-control" id="job_date" placeholder="ادخل تاريخ التوظيف">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="qualification">المؤهل</label>\n' +
        '    <input type="text" class="form-control" id="qualification" placeholder="ادخل المؤهل">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="qualification_date">تاريخ المؤهل</label>\n' +
        '    <input type="date" class="form-control" id="qualification_date" placeholder="ادخل تاريخ المؤهل">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="address">العنوان</label>\n' +
        '    <input type="text" class="form-control" id="address" placeholder="ادحل العنوان">\n' +
        '</div>\n' +

        '<div class="form-group">\n' +
        '    <label for="birthdate">تاريخ الميلاد</label>\n' +
        '    <input type="date" class="form-control" id="birthdate" placeholder="ادخل تاريخ الميلاد">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="birthaddress">عنوان الميلاد</label>\n' +
        '    <input type="text" class="form-control" id="birthaddress" placeholder="ادخل عنوان الميلاد">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="phones">ارقام الهاتف</label>\n' +
        '    <input type="text" class="form-control" id="phones" placeholder="ادخل الهاتف">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="contract">العقد</label>\n' +
        '    <input type="checkbox" class="form-control" id="contract" >\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="receipt">الايصال</label>\n' +
        '    <input type="checkbox" onclick="enableReceipt();" class="form-control" id="receipt" >\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="receipt_value">قيمة الايصال</label>\n' +
        '    <input type="text" disabled class="form-control" id="receipt_value" placeholder="ادخل قيمة الايصال">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="code">الكود</label>\n' +
        '    <input type="number" class="form-control" id="code" placeholder="ادخل الكود">\n' +
        '</div>\n' +
        '    </form>\n',
        focusConfirm: false,
        confirmButtonText: "حفظ",
        preConfirm: function () {

            var name = $("#name").val();
            var code = $("#code").val();
            var job = $("#job").val();
            var job_date = $("#job_date").val();
            var qualification = $("#qualification").val();
            var qualification_date = $("#qualification_date").val();
            var birthdate = $("#birthdate").val();
            var birthaddress = $("#birthaddress").val();
            var address = $("#address").val();
            var receipt = $("#receipt").is(":checked");
            var receipt_value = $("#receipt_value").val();
            var contract = $("#contract").is(":checked");
            var phones = $("#phones").val();
            var salary = $("#salary").val();

            var username = $("#username").val();
            var email = $("#email").val();

            var paid_holidays = $("#paid_holidays").val();

            var photo = $("#photo").prop('files')[0];



            if(photo){
                var reader = new FileReader();
                reader.readAsDataURL(photo);

                reader.onloadend = function (ev) {
                    var base64 = reader.result.split("base64,").pop();
                    var ext = photo.name.split(".").pop();


                    $.post(url + "api/employees/add-new-employee", {
                        token: getCookie("token"),
                        username: username,
                        name: name,
                        job: job,
                        salary: salary,
                        job_date: job_date,
                        qualification: qualification,
                        qualification_date: qualification_date,
                        birthdate: birthdate,
                        birthaddress: birthaddress,
                        address: address,
                        phones: phones,
                        code: code,
                        paid_holidays: paid_holidays,
                        email: email,
                        photo: base64,
                        photo_ext:ext,
                        contract: contract,
                        receipt: receipt,
                        receipt_value: receipt===true? receipt_value:0
                    }).done(function (data) {

                        if (data.success == true) {
                            swal.fire(
                                {
                                    title: "تم بنجاح",
                                    icon: "success",
                                    text: "تم اضافه الموظف بنجاح"
                                }
                            ).then(function (value) {
                                location.reload();
                            });
                        } else if (data.success == false) {
                            console.log(JSON.stringify(data.err));
                            swal.fire(
                                {
                                    icon: "error",
                                    title: "خطأ في السيرفر",
                                    text: JSON.stringify(JSON.stringify(data.err))
                                }
                            );
                        }
                    }).fail(function (err) {
                        swal.fire(
                            "خطأ في الطلب", err.status.toString(), "error"
                        );
                    });

                };

            }else {
                $.post(url + "api/employees/add-new-employee", {
                    token: getCookie("token"),
                    username: username,
                    name: name,
                    job: job,
                    salary: salary,
                    paid_holidays: paid_holidays,
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
                    receipt_value: receipt===true? receipt_value:0
                }).done(function (data) {

                    if (data.success == true) {
                        swal.fire(
                            {
                                title: "تم بنجاح",
                                icon: "success",
                                text: "تم اضافه الموظف بنجاح"
                            }
                        ).then(function (value) {
                            location.reload();
                        });
                    } else if (data.success == false) {
                        console.log(JSON.stringify(data.err));
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

function enableReceipt() {
    if ($('#receipt').is(":checked")) {
        $('#receipt_value').prop("disabled", false);
    } else {
        $('#receipt_value').prop("disabled", true);
    }
}

function deleteEmployee(id) {
    swal.fire({
        title: "حذف موظف",
        text: "هل انت متأكد من الحذف ؟",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "نعم متأكد",
        cancelButtonText: "لا تحذف",
    }).then(function (result) {
        if (result.value && result.isConfirmed) {
            $.post(url + "api/employees/delete-employee/" + id, {
                token: getCookie("token")
            }).done(function (data) {

                if (data.success == true) {
                    swal.fire(
                        {
                            title: "تم بنجاح",
                            icon: "success",
                            text: "تم حذف الموظف بنجاح"
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