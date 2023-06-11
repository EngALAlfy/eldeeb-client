$(function () {
    "use strict";

    checkLogin();


    var params = new URLSearchParams(window.location.search);
    if (!params.has("id")) {
        window.location.href = "projects.html";
    }

    var id = params.get("id");

    if (checkRole("add-project-files") === true) {
        $('#add').removeClass('d-none');
    }

    var tabs = $('.nav-tabs a');

    for (var i = 0; i < tabs.length; i++) {
        tabs[i].href = tabs[i].href + "?id=" + id;
    }


    $.post(url + "api/projects/get-other-files/" + id, {
        token: getCookie("token")
    }).done(function (data) {

        if (data.success == true) {
            data.project.forEach(function (value) {
                if(!value.employee)
                    value.employee = {};

                if(!value.employee.name)
                    value.employee.name = "N/A";

                $('#other-form').append(
                    '                    <section class="hero">\n' +
                    '                        <div class="col-12 offset-3">\n' +
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
                    '                                            <a class="dropdown-item" onclick="removeFile(\''+value.key+'\' , \''+value.url+'\' , \''+id+'\')" href="javascript:void(0)">حذف</a>\n' +
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
                    '                                <label class="col-md-12">' + value.key + '</label>' +
                    '                                <div class="col-md-12 input-group">' +
                    '                                    <div class=" d-none input-group-append">' +
                    '                                        <button class="btn btn-outline-secondary" onclick="edit(\'' + id + '\',\'' + value.key + '\')" type="button"><i class="fa fa-edit"></i></button>' +
                    '                                    </div>' +
                    '                                    <input type="text" value="' + value.url + '" readonly class="form-control">' +
                    '                                    <div class="input-group-prepend">' +
                    '                                        <button class="btn btn-outline-secondary" onclick="downloadfile(\'' + id + '\',\'' + value.url + '\')" type="button"><i class="fa fa-download"></i></button>' +
                    '                                    </div>' +'                                    <div class="input-group-prepend">' +
                    '                                        <button class="btn btn-outline-secondary" onclick="previewPdf(\'' + id + '\',\'' + value.url + '\')" type="button"><i class="fa fa-eye"></i></button>' +
                    '                                    </div>' +
                    '                                </div>' +
                    '                            </div>'+
                    '                                </div><!--/ cardbox-item -->\n' +
                    '\n' +
                    '                            </div><!--/ cardbox -->\n' +
                    '\n' +
                    '                        </div>\n' +
                    '                    </section>\n'
                );
            });


            if (checkRole("add-project-files") === true) {
                $('.input-group-append').removeClass('d-none');
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


    $('#add').click(function () {

        addNewFile(id);

    });

});

function addNewFile(id) {
    swal.fire(
        {
            title: "رفع ملف",
            icon: "info",
            html: '<form  class="text-left">\n' +
            '<div class="form-group">\n' +
            '    <label for="key">الاسم</label>\n' +
            '<input type="text" required class="form-control" id="key"  placeholder="ادخل الاسم">\n' +
            '</div>\n' +
            '<div class="form-group">\n' +
            '    <label for="file">الملف</label>\n' +
            '    <input type="file" class="form-control" id="file" placeholder="اختر الملف">\n' +
            '</div>\n' +
            '    </form>\n',
            focusConfirm: false,
            showLoaderOnConfirm: true,
            preConfirm: function () {

                var result = $('#file').prop('files')[0];
                var key = $('#key').val();

                if(!key){
                    swal.fire({
                        title: "خطأ",
                        icon: "error",
                        text: "من فضلك اكتب اسم (عنوان) الملف"
                    });
                    return;
                }

                var reader = new FileReader();
                reader.readAsDataURL(result);

                progress();
                reader.onloadend = function (ev) {
                    var base64 = reader.result.split("base64,").pop();
                    var ext = result.name.split(".").pop();


                    $.post(url + "api/projects/add-other-file/" + id, {
                        token: getCookie("token"),
                        ext: ext,
                        key: key,
                        file: base64
                    }).done(function (data) {

                        if (data.success == true) {

                            swal.fire({
                                icon: "success",
                                title: "تم بنجاح",
                                text: "تم رفع الملف بنجاح"
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
                };

            },
            iconHtml: "<i class='fa fa-file'></i>"
        }
    );
}

function edit(id, key) {
    swal.fire(
        {
            title: "رفع ملف",
            input: "file",
            icon: "info",
            showLoaderOnConfirm: true,
            preConfirm: function (result) {

                var reader = new FileReader();
                reader.readAsDataURL(result);

                reader.onloadend = function (ev) {
                    var base64 = reader.result.split("base64,").pop();
                    var ext = result.name.split(".").pop();


                    $.post(url + "api/projects/add-other-file/" + id, {
                        token: getCookie("token"),
                        ext: ext,
                        key: key,
                        file: base64
                    }).done(function (data) {

                        if (data.success == true) {
                            swal.fire({
                                icon: "success",
                                title: "تم بنجاح",
                                text: "تم رفع الملف بنجاح"
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
                };

            },
            iconHtml: "<i class='fa fa-file'></i>",
            "text": "اختر ملف للرفع"
        }
    );
}

function previewPdf(id , _url) {
   // new PDFObject({ url: url + "projects-files/" + id + "/" + _url }).embed("#preview");
    PDFObject.embed(url + "projects-files/" + id + "/" + _url, "#preview");
}

function downloadfile(id, _url) {
    download(url + "projects-files/" + id + "/" + _url);
}

function removeFile(key , file , id) {
    swal.fire({
        title: "حذف ملف",
        text: "هل انت متأكد من الحذف ؟",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "نعم متأكد",
        cancelButtonText: "لا تحذف"
    }).then(function (result) {
        if (result.value && result.isConfirmed) {
            $.post(url + "api/projects/delete-other-file/" + id, {
                token: getCookie("token"),
                file: file,
                key:key
            }).done(function (data) {

                if (data.success == true) {
                    swal.fire(
                        {
                            title: "تم بنجاح",
                            icon: "success",
                            text: "تم حذف الملف بنجاح"
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