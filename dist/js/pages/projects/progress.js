$(function () {
    "use strict";

    checkLogin();


    var params = new URLSearchParams(window.location.search);
    if (!params.has("id")) {
        window.location.href = "projects.html";
    }

    var id = params.get("id");


    var tabs = $('.nav-tabs a');

    for (var i = 0; i < tabs.length; i++) {
        tabs[i].href = tabs[i].href + "?id=" + id;
    }


    $.post(url + "api/projects/get-project-progress/" + id, {
        token: getCookie("token")
    }).done(function (data) {

        if (data.success == true) {
            data.project.forEach(function (value) {
                if(!value.employee)
                    value.employee = {};

                if(!value.employee.name)
                    value.employee.name = "N/A";

                $('#progress-form').append(

                    '                    <section class="hero">\n' +
                    '                        <div class="col-6 offset-3">\n' +
                    '\n' +
                    '                            <div class="cardbox bg-light">\n' +
                    '\n' +
                    '                                <div class="cardbox-heading">\n' +
                    '                                    <!-- START dropdown-->\n' +
                    '                                    <div class="dropdown float-right">\n' +
                    '                                        <button class="btn btn-flat btn-flat-icon" type="button" data-toggle="dropdown"\n' +
                    '                                                aria-expanded="false">\n' +
                    '                                            <em class="fa fa-ellipsis-h"></em>\n' +
                    '                                        </button>\n' +
                    '                                        <div class="dropdown-menu dropdown-scale dropdown-menu-right" role="menu"\n' +
                    '                                             style="position: absolute; transform: translate3d(-136px, 28px, 0px); top: 0px; left: 0px; will-change: transform;">\n' +
                    '                                            <a class="dropdown-item" onclick="removeProgress(\''+value.key+'\' , \''+value.progress+'\' , \''+id+'\')" href="javascript:void(0)">حذف</a>\n' +
                    '                                        </div>\n' +
                    '                                    </div><!--/ dropdown -->\n' +
                    '                                    <div class="media m-t-10 m-b-10">\n' +
                    '                                        <div class="d-flex mr-3">\n' +
                    '                                            <img class="m-t-10 rounded-circle" width="70" height="70"\n' +
                    '                                                 src="'+url + 'profiles-files/' + value.employee.photo +'" onerror="this.src=\''+url+ "images/employee.png" +'\'"\n' +
                    '                                                 alt="User">\n' +
                    '                                        </div>\n' +
                    '                                        <div class="media-body align-self-center m-l-15">\n' +
                    '                                            <p class="m-0">'+value.employee.name+'</p>\n' +
                    '                                            <small><span><i class="icon ion-md-time"></i>'+new Date(value.date).toLocaleString()+'</span></small>\n' +
                    '                                        </div>\n' +
                    '                                    </div><!--/ media -->\n' +
                    '                                </div>\n' +
                    '\n' +
                    '                                <div class="cardbox-item">\n' +
                    '<div class="form-group">' +
                    '                                                   <label class="col-md-12">' + value.key + '</label>' +
                    '                                                   <p class="text-secondary">' + value.progress + '</p>' +
                    '                                                   <small><span><i class="icon ion-md-time"></i>'+new Date(value.date).toLocaleString()+'</span></small>'+
                    '                                               </div>'+
                    '                                </div><!--/ cardbox-item -->\n' +
                    '\n' +
                    '                            </div><!--/ cardbox -->\n' +
                    '\n' +
                    '                        </div>\n' +
                    '                    </section>\n'

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

    $('#add').click(function () {

        addNewProgress(id);

    });

});

function addNewProgress(id) {
    swal.fire(
        {
            title: "اضافه تقدم للمشروع",
            icon: "info",
            html: '<form  class="text-left">\n' +
            '<div class="form-group">\n' +
            '    <label for="key">الاسم</label>\n' +
            '<input type="text" required class="form-control" id="key"  placeholder="ادخل الاسم">\n' +
            '</div>\n' +
            '<div class="form-group">\n' +
            '    <label for="progress">التقدم</label>\n' +
            '    <input type="text" class="form-control" id="progress" placeholder="ادخل التقدم">\n' +
            '</div>\n' +
            '    </form>\n',
            focusConfirm: false,
            showLoaderOnConfirm: true,
            preConfirm: function () {

                var progressVal = $('#progress').val();
                var key = $('#key').val();


                progress();

                $.post(url + "api/projects/add-project-progress/" + id, {
                    token: getCookie("token"),
                    key: key,
                    progress: progressVal
                }).done(function (data) {

                    if (data.success == true) {

                        swal.fire({
                            icon: "success",
                            title: "تم بنجاح",
                            text: "تم اضافه التقدم بنجاح"
                        }).then(function (value) {
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
                })
                    .fail(function (err) {
                        swal.fire(
                            {
                                title: "خطأ في الطلب",
                                text: err.status,
                                icon: "error"
                            }
                        );
                    });


            },
            iconHtml: "<i class='fa fa-chart-line'></i>"
        }
    );
}

function removeProgress(key , progress , id) {
    swal.fire({
        title: "حذف الخطوة",
        text: "هل انت متأكد من الحذف ؟",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "نعم متأكد",
        cancelButtonText: "لا تحذف"
    }).then(function (result) {
        if (result.value && result.isConfirmed) {
            $.post(url + "api/projects/delete-project-progress/" + id, {
                token: getCookie("token"),
                progress: progress,
                key:key
            }).done(function (data) {

                if (data.success == true) {
                    swal.fire(
                        {
                            title: "تم بنجاح",
                            icon: "success",
                            text: "تم حذف الخطوة بنجاح"
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



