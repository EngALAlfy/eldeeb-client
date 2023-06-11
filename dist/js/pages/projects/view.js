$(function () {
    "use strict";

    checkLogin();
    checkRoleAndReturn("view-project");


    var params = new URLSearchParams(window.location.search);
    if (!params.has("id")) {
        window.location.href = "projects.html";
    }

    var id = params.get("id");


    var tabs = $('.nav-tabs a');

    for (var i = 0; i < tabs.length; i++) {
        tabs[i].href = tabs[i].href + "?id=" + id;
    }


    $.post(url + "api/projects/get-info/" + id, {
        token: getCookie("token")
    }).done(function (data) {
        if (data.success == true) {
            $('#name').val(data.project.name);
            $('#code').val(data.project.code);
            $('#contract_code').val(data.project.contract_code);
            $('#contract_value').val(data.project.contract_value);
            $('#general_contractor').val(data.project.general_contractor);
            $('#receive_date').val(new Date(data.project.receive_date).toLocaleDateString('en-CA'));
            $('#dead_line').val(new Date(data.project.dead_line).toLocaleDateString('en-CA'));
            $('#consultant').val(data.project.consultant);
            $('#duration').val(data.project.duration);
            $('#owner').val(data.project.owner);

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


    if (checkRole("edit-project") === true) {
        $('#edit-project').removeClass('d-none');
        $('#edit-project').click(function () {
            $('input').prop('readonly', false);
            $('#update-project').removeClass('d-none');
        });

        $('#update-project').click(function () {
             updateProject(id);
        });
    }

});


function updateProject(id) {
    var name = $('#name').val();
    var code = $('#code').val();
    var contract_code = $('#contract_code').val();
    var contract_value = $('#contract_value').val();
    var general_contractor = $('#general_contractor').val();
    var receive_date = $('#receive_date').val();
    var dead_line = $('#dead_line').val();
    var consultant = $('#consultant').val();
    var duration = $('#duration').val();
    var owner = $('#owner').val();

    $.post(url + "api/projects/update-project/" + id, {
        token: getCookie("token"),
        name:name,
        code:code,
        contract_code:contract_code,
        contract_value:contract_value,
        general_contractor:general_contractor,
        receive_date:receive_date,
        dead_line:dead_line,
        consultant:consultant,
        duration:duration,
        owner:owner
    }).done(function (data) {
        if (data.success == true) {
            swal.fire(
                {
                    title: "تم بنجاح",
                    icon: "success",
                    text: "تم تحديث المشروع بنجاح"
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