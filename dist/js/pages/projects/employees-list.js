$(function () {
    "use strict";

    checkLogin();
    checkRoleAndReturn("view-project");

    var params = new URLSearchParams(window.location.search);
    if (!params.has("id")) {
        window.location.href = "projects.html";
    }

    var id = params.get("id");


    if (checkRole("add-project-employees") === true) {
        $('#add-project-employee').removeClass('d-none');
    }

    var tabs = $('.nav-tabs a');

    for (var i = 0; i < tabs.length; i++) {
        tabs[i].href = tabs[i].href + "?id=" + id;
    }

    var tabs2 = $('#sidebarnav1').find('a');

    for (var e = 0; e < tabs2.length; e++) {
        tabs2[e].href = tabs2[e].href + "?id=" + id;
    }

    $.post(url + "api/projects/get-project-employees/" + id, {
        token: getCookie("token")
    }).done(function (data) {
        if (data.success == true) {
            data.employees.forEach(function (value) {


                var attendance = null;

                if (checkRole("employee-attendance") === true) {


                    value.attendance.forEach(function (value2) {
                        if (value2.project == id) {
                            var todayDate = new Date();

                            if (value2.day == todayDate.getDate() && value2.month == todayDate.getMonth() && value2.year == todayDate.getFullYear()) {
                                attendance = value2;
                            }
                        }
                    });

                }

                var  employee_url = window.location.origin + "/ar/employees/view-employee.html?id="+value.id;

                var html = ' <div  class=" card">' +
                    '<div  class=" card-body">' +
                    '<div class="cardbox-heading row">\n' +
                    '                                                    <!-- START dropdown-->\n' +
                    '                                                    <div class="media col-8">\n' +
                    '                                                        <div class="d-flex mr-3">\n' +
                    '                                                           <img class="m-t-8  rounded-circle" width="70" height="70" src="' + url + 'profiles-files/' + value.photo + '" onerror="this.src=\'' + url + "images/employee.png" + '\'" alt="User">\n' +
                    '                                                        </div>\n' +
                    '                                                        <div class="media-body align-self-center m-l-15">\n' +
                    '                                                            <a target="_blank" class="text-secondary" href="'+employee_url+'"><p class="m-0">' + value.name + '</p></a>\n' +
                    '                                                            <small><span><i class="icon ion-md-time"></i>' + (value.job ? value.job.title : "--") + '</span></small>\n' +
                    '                                                        </div>\n' +
                    '                                                    </div><!--/ media -->\n' +
                    '<div class="attend-col d-none col-2">' +
                    '<div class="custom-control custom-radio">\n' +
                    '  <input onchange="attendanceSelect(\'' + value.id + '\',\'' + id + '\' , this)" type="radio" id="attend_' + value.id + '" name="attendance_' + value.id + '" class="custom-control-input custom-control-input-green">\n' +
                    '  <label   class="custom-control-label custom-control-label-green" for="attend_' + value.id + '">حضور</label>\n' +
                    '</div>\n' +
                    '<div class="custom-control custom-radio">\n' +
                    '  <input onchange="attendanceSelect(\'' + value.id + '\',\'' + id + '\' , this)" type="radio" id="absence_' + value.id + '" name="attendance_' + value.id + '" class="custom-control-input custom-control-input-red">\n' +
                    '  <label class="custom-control-label custom-control-label-red" for="absence_' + value.id + '">غياب</label>\n' +
                    '</div>' +
                    '</div>' +

                    '                                    <div class="dropdown delete-col d-none col-2 float-right">\n' +
                    '                                        <button class="btn btn-flat btn-flat-icon" type="button" data-toggle="dropdown"\n' +
                    '                                                aria-expanded="false">\n' +
                    '                                            <em class="fa fa-ellipsis-h"></em>\n' +
                    '                                        </button>\n' +
                    '                                        <div class="dropdown-menu dropdown-scale dropdown-menu-right" role="menu"\n' +
                    '                                             style="position: absolute; transform: translate3d(-136px, 28px, 0px); top: 0px; left: 0px; will-change: transform;">\n' +
                    '                                            <a class="dropdown-item" onclick="removeEmployee(\''+value.id+'\' , \''+id+'\')" href="javascript:void(0)">حذف</a>\n' +
                    '                                        </div>\n' +
                    '                                    </div><!--/ dropdown -->\n' +
                    '                                     </div>' +
                    '                    </div>\n' +
                    '                </div>';

                $('#employees-card').append(html);

                if (checkRole("employee-attendance") === true) {
                    $('.attend-col').removeClass('d-none');
                }


                if (checkRole("remove-project-employees") === true) {
                    $('.delete-col').removeClass('d-none');
                }

                if (attendance) {
                    $('#attend_' + value.id).prop('checked', attendance.attendance);
                    $('#absence_' + value.id).prop('checked', !attendance.attendance);
                }
            });
        } else if (data.success == false) {

            if (data.err == "no_project") {
                toastr.error(data.err);
            } else {
                swal.fire(
                    {
                        title: "خطأ في السيرفر",
                        text: JSON.stringify(data.err),
                        icon: "error"
                    }
                );
            }
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

    $('#add-project-employee').click(function () {
        addProjectEmployee(id);
    });


});


function attendanceSelect(id, project, input) {
    if (input.checked) {
        postAttendance(id, project, input.id.split("_")[0]);
    }
}

function postAttendance(id, project, attend) {
    var attendance = "N/A";

    if (attend == "attend") {
        attendance = true;
    } else if (attend == "absence") {
        attendance = false;
    }

    if (attendance != "N/A") {
        var date = new Date();
        $.post(url + "api/employees/add-employee-attendance/" + id, {
            token: getCookie("token"),
            date: date.getTime(),
            project: project,
            day: date.getDate(),
            month: date.getMonth(),
            year: date.getFullYear(),
            attendance: attendance
        }).done(function (data) {
            if (data.success == true) {
                console.log(true);
                success();
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
}

function addProjectEmployee(id) {
    progress();
    $.post(url + "api/employees/get-all", {
        token: getCookie("token")
    }).done(function (data) {
        if (data.success == true) {
            var options = {};
            data.employees.forEach(function (value) {
                if (value.username === "admin") {
                    return;
                }

                options[value.id] = value.name;
            });

            Swal.fire({
                title: 'اختر الموظف',
                icon: "success",
                iconHtml: "<i class='mdi mdi-plus'></i>",
                input: "select",
                inputOptions: options,
                confirmButtonText: "حفظ",
                showLoaderOnConfirm: true,
                preConfirm: function (value) {
                    $.post(url + "api/projects/add-project-employee/" + id, {
                        token: getCookie("token"),
                        id: value
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
                            if (data.err == "exists_in_projects") {

                                var projectsHtml = '<p>الموظف موجود في مشروع حالي هل تود نقله ؟</p>';
                                projectsHtml += '<hr>';
                                if (data.projects) {
                                    data.projects.forEach(function (val) {
                                        projectsHtml += '<h6>' + val.name + '</h6>';
                                    });
                                }

                                swal.fire(
                                    {
                                        title: "تحذير",
                                        icon: "warning",
                                        html: projectsHtml,
                                        showCancelButton: true,
                                        confirmButtonText: 'نقل الموظف',
                                        cancelButtonText: 'لا'
                                    }
                                ).then(function (value2) {
                                    if (value2.isConfirmed === true) {
                                        $.post(url + "api/projects/add-project-employee/" + id, {
                                            token: getCookie("token"),
                                            id: value,
                                            move: true
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

                                                swal.fire(
                                                    {
                                                        title: "خطأ في السيرفر",
                                                        text: JSON.stringify(data.err),
                                                        icon: "error"
                                                    }
                                                );

                                            }
                                        });
                                    }
                                });
                            } else {
                                swal.fire(
                                    {
                                        title: "خطأ في السيرفر",
                                        text: JSON.stringify(data.err),
                                        icon: "error"
                                    }
                                );
                            }
                        }
                    });
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

function removeEmployee(employee , id) {
    swal.fire({
        title: "حذف موظف",
        text: "هل انت متأكد من الحذف ؟",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "نعم متأكد",
        cancelButtonText: "لا تحذف"
    }).then(function (result) {
        if (result.value && result.isConfirmed) {
            $.post(url + "api/projects/delete-project-employee/" + id, {
                token: getCookie("token"),
                id: employee
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
                    "خطأ في الطلب",  JSON.stringify(err), "error"
                );
            });
        }
    });
}


