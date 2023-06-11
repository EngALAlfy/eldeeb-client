$(function () {
    "use strict";
    checkLogin();
    checkRoleAndReturn("view-project");


    if(checkRole("add-project") === true){
        $('#add-project').removeClass('d-none');
    }

    $.post(url + "api/projects/get-all", {
        token: getCookie("token")
    }).done(function (data) {

        if (data.success == true) {
            console.log(data);
            if (data.projects && data.projects.length > 0) {
                for (var i = 0; i < data.projects.length; i++) {

                    $("#projects-table tbody").append('<tr>' +
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
                        '                                    <td>' + (data.projects[i].receive_date ? new Date(data.projects[i].receive_date).toLocaleDateString() : '---') + '</td>' +
                        '                                    <td>' + (data.projects[i].duration ? data.projects[i].duration + ' شهور ' : '--') +
                        '                                    </td>' +
                        '                                    <td>' + (data.projects[i].contract_value ? data.projects[i].contract_value : '--') + '</td>' +
                        '                                    <td><a href="view-project.html?id=' + data.projects[i].id + '" class="m-b-0 btn btn-success"><i class="mdi mdi-eye text-white-50"></i></a></td>' +
                        '                                    <td class="delete-project d-none">' +
                        '                                        <a onclick="deleteProject(\''+data.projects[i].id+'\')" class="m-b-0 btn btn-danger"><i class="mdi mdi-delete text-white-50"></i></a>' +
                        '                                    </td>' +
                        '                                </tr>');
                }
            }

            if(checkRole("delete-project") === true){
                $('.delete-project').removeClass('d-none');
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


    $('#add-project').click(function () {
        addProject();
    });


});

function addProject() {
    Swal.fire({
        title: 'مشروع جديد',
        icon: "success",
        iconHtml: "<i class='fa fa-plus'></i>",
        html: '<form  class="text-left">\n' +
        '<div class="form-group">\n' +
        '    <label for="name">الاسم</label>\n' +
        '<input type="text" required class="form-control" id="name"  placeholder="ادخل الاسم">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="owner">المالك</label>\n' +
        '    <input type="text" required class="form-control" id="owner" placeholder="ادخل المالك">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="code">الكود</label>\n' +
        '    <input type="text" required class="form-control" id="code" placeholder="ادخل الكود">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="consultant">الاستشاري</label>\n' +
        '    <input type="text" class="form-control" id="consultant" placeholder="ادخل الاستشاري">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="contract_value">قيمة العقد</label>\n' +
        '    <input type="text" class="form-control" id="contract_value" placeholder="ادخل قيمة العقد">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="contract_code">كود العقد</label>\n' +
        '    <input type="text" class="form-control" id="contract_code" placeholder="ادحل كود العقد">\n' +
        '</div>\n' +

        '<div class="form-group">\n' +
        '    <label for="conclusion_value">قمية الختامي</label>\n' +
        '    <input type="text" class="form-control" id="conclusion_value" placeholder="ادخل قيمة الختامي">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="duration">المدة</label>\n' +
        '    <input type="number" class="form-control" id="duration" placeholder="ادخل المدة بالشهر">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="general_contractor">المقاول العام</label>\n' +
        '    <input type="text" class="form-control" id="general_contractor" placeholder="ادخل المقاول العام">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="receive_date">تاربخ الاستلام</label>\n' +
        '    <input type="date" class="form-control" id="receive_date" placeholder="ادخل تاريخ الاستلام">\n' +
        '</div>\n' +
        '<div class="form-group">\n' +
        '    <label for="deadline">اخر موعد للتسليم</label>\n' +
        '    <input type="date" class="form-control" id="deadline" placeholder="ادخل اخر موعد للتسليم">\n' +
        '</div>\n' +
        '    </form>\n',
        focusConfirm: false,
        confirmButtonText: "حفظ",
        preConfirm: function () {

            var name = $("#name").val();
            var code = $("#code").val();
            var owner = $("#owner").val();
            var general_contractor = $("#general_contractor").val();
            var dead_line = $("#deadline").val();
            var receive_date = $("#receive_date").val();
            var duration = $("#duration").val();
            var conclusion_value = $("#conclusion_value").val();
            var contract_code = $("#contract_code").val();
            var contract_value = $("#contract_value").val();
            var consultant = $("#consultant").val();


            $.post(url + "api/projects/add-new-project", {
                token: getCookie("token"),
                owner: owner,
                code: code,
                consultant: consultant,
                contract_value: contract_value,
                conclusion_value: conclusion_value,
                //expected_conclusion: expected_conclusion,
                contract_code: contract_code,
                receive_date: receive_date,
                duration: duration,
                dead_line: dead_line,
                general_contractor: general_contractor,
                //location: location,
                name: name
            }).done(function (data) {

                if (data.success == true) {
                    swal.fire(
                        {
                            title:"تم بنجاح",
                            icon:"success",
                            text:"تم اضافه المشروع بنجاح"
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
    });

}

function deleteProject(id) {
   swal.fire({
       title:"حذف مشروع",
       text:"هل انت متأكد من الحذف ؟",
       icon:"warning",
       showCancelButton: true,
       confirmButtonText:"نعم متأكد",
       cancelButtonText:"لا تحذف",
   }).then(function (result) {
       if(result.value && result.isConfirmed){
           $.post(url + "api/projects/delete-project/"+id, {
               token: getCookie("token")
           }).done(function (data) {

               if (data.success == true) {
                   swal.fire(
                       {
                           title:"تم بنجاح",
                           icon:"success",
                           text:"تم حذف المشروع بنجاح"
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