$(function () {
    "use strict";

    checkLogin();


    $.post(url + "api/notifications/get-all", {
        token: getCookie("token")
    }).done(function (data) {

        if (data.success == true) {
            if (data.notifications && data.notifications.length > 0) {
                for (var i = 0; i < data.notifications.length; i++) {
                    console.log(data.notifications[i]);
                    $("#notifications-table tbody").append('<tr>' +
                        '                                    <td>' +
                        '                                        <div class="d-flex align-items-center">' +
                        '                                            <div class="m-r-10"><a class="btn btn-circle btn-orange text-white">م</a>' +
                        '                                            </div>' +
                        '                                            <div class="">' +
                        '                                                <h4 class="m-b-0 font-16">' + data.notifications[i].title + '</h4>' +
                        '                                            </div>' +
                        '                                        </div>' +
                        '                                    </td>' +
                        '                                    <td>' + data.notifications[i].message + '</td>' +
                        '                                    <td><a class="m-b-0 btn btn-success"><i class="mdi mdi-eye text-white-50"></i></a></td>' +
                        '                                    <td>' +
                        '                                        <a class="m-b-0 btn btn-warning"><i class="mdi mdi-pen text-white-50"></i></a>' +
                        '                                    </td>' +
                        '                                    <td>' +
                        '                                        <a onclick="deleteNotification(\''+data.notifications[i].id+'\')" class="m-b-0 btn btn-danger"><i class="mdi mdi-delete text-white-50"></i></a>' +
                        '                                    </td>' +
                        '                                </tr>');
                }
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
            {
                icon: "error",
                title: "خطأ في الطلب",
                text: err.status
            }
        );
    });

    $('#add-notification').click(function () {
        addNotification();
    });

});

function addNotification() {
    $.post(url + "api/employees/get-all", {
        token: getCookie("token")
    }).done(function (data) {

        if (data.success == true) {
            if (data.employees && data.employees.length > 0) {
                Swal.fire({
                    title: 'اشعار جديد',
                    icon: "success",
                    iconHtml: "<i class='fa fa-plus'></i>",
                    html: '<form  class="text-left">\n' +
                    '<div class="form-group">\n' +
                    '    <label for="title">العنوان</label>\n' +
                    '<input type="text" required class="form-control" id="title"  placeholder="ادخل العنوان">\n' +
                    '</div>\n' +
                    '<div class="form-group">\n' +
                    '    <label for="message">الرسالة</label>\n' +
                    '    <input type="text" class="form-control" id="message" placeholder="ادخل الرسالة">\n' +
                    '</div>\n' +
                    '<select class="custom-select" size="3" multiple>\n' +
                    '  <option selected>Open this select menu</option>\n' +
                    '</select>' +
                    '    </form>\n',
                    focusConfirm: false,
                    confirmButtonText: "حفظ",
                    preConfirm: function () {

                        var title = $("#title").val();
                        var message = $("#message").val();
                        var employees = $('.custom-select').val().toString();


                        $.post(url + "api/notifications/add-new-notification", {
                            token: getCookie("token"),
                            title: title,
                            message: message,
                            employees: employees
                        }).done(function (data) {

                            if (data.success == true) {
                                swal.fire(
                                    {
                                        title: "تم بنجاح",
                                        icon: "success",
                                        text: "تم اضافه الاشعار بنجاح"
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
                                        text: JSON.stringify(data.err).toString()
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


                for (var i = 0; i < data.employees.length; i++) {
                    $('.custom-select').append('<option value="'+data.employees[i].id+'">'+data.employees[i].name+'</option>');
                }
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
            {
                icon: "error",
                title: "خطأ في الطلب",
                text: err.status
            }
        );
    });





}


function deleteNotification(id) {
    swal.fire({
        title: "حذف اشعار",
        text: "هل انت متأكد من الحذف ؟",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "نعم متأكد",
        cancelButtonText: "لا تحذف",
    }).then(function (result) {
        if (result.value && result.isConfirmed) {
            $.post(url + "api/notifications/delete-notification/" + id, {
                token: getCookie("token")
            }).done(function (data) {

                if (data.success == true) {
                    swal.fire(
                        {
                            title: "تم بنجاح",
                            icon: "success",
                            text: "تم حذف الاشعار بنجاح"
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