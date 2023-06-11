
$(function() {
    "use strict";

    checkLogin();
    checkRoleAndReturn("view-project");


    var  params = new URLSearchParams(window.location.search);
    if(!params.has("id")){
        window.location.href = "projects.html";
    }

    var id = params.get("id");


    if(checkRole("add-project-employees") === true){
        $('#add-manager').removeClass('d-none');
    }

    var tabs = $('.nav-tabs a');

    for(var i =0;i< tabs.length;i++){
        tabs[i].href = tabs[i].href +"?id="+id;
    }

    var tabs2 = $('#sidebarnav1').find('a');

    for(var e =0;e< tabs2.length;e++){
        tabs2[e].href = tabs2[e].href +"?id="+id;
    }


    $.post(url + "api/projects/get-project-manager/"+id , {
        token: getCookie("token")
    }).done(function(data){
        if(data.success == true){

            var value = data.project_manager;

            console.log(data);


            $('#manager-card').append('<div class="card">\n' +
                '                    <div class=" card-body">\n ' +
                '<div class="cardbox-heading">\n' +
                '                                                    <!-- START dropdown-->\n' +
                '                                                    <div class="media">\n' +
                '                                                        <div class="d-flex mr-3">\n' +
                '                                                           <img class="m-t-10 img-fluid rounded-circle" width="70" height="70" src="'+url + 'profiles-files/' + value.photo +'" onerror="this.src=\''+url+ "images/employee.png" +'\'" alt="User">\n' +
                '                                                        </div>\n' +
                '                                                        <div class="media-body align-self-center m-l-15">\n' +
                '                                                            <p class="m-0">'+value.name+'</p>\n' +
                '                                                            <small><span><i class="icon ion-md-time"></i>'+(value.job ? value.job.title : "--")+'</span></small>\n' +
                '                                                        </div>\n' +
                '                                                    </div><!--/ media -->\n' +
                '                                                </div>' +
                '                    </div>\n' +
                '                </div>');

        }else if(data.success == false) {
            if(data.err == "no_project"){
                toastr.error(data.err);
            }else {
                swal.fire(
                    {
                        title: "خطأ في السيرفر",
                        text: JSON.stringify(data.err),
                        icon: "error"
                    }
                );
            }
        }
    }).fail(function(err){
        swal.fire(
            {
                title:"خطأ في الطلب",
                text:err.status,
                icon:"error"
            }
        );
    });


    $('#add-manager').click(function () {
        addProjectManager(id);
    });

});


function addProjectManager(id) {

    $.post(url + "api/projects/get-project-employees/"+id, {
        token: getCookie("token")
    }).done(function (data) {
        if (data.success == true) {
            data.employees.forEach(function (value) {
                if(value.username === "admin"){
                    return;
                }
                $('.select-employee').append('<option value="' + value.id + '">' + value.name + '</option>');
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


    Swal.fire({
        title: 'اختر الموظف',
        input: 'select',
        inputAttributes: {
            size: 12
        },
        customClass: {
            input: "select-employee col-12"
        },
        showCancelButton: true
    }).then(function (value) {
        if (value.isConfirmed) {
            $.post(url + "api/projects/add-manager/" + id, {
                token: getCookie("token"),
                id: value.value
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
            }).fail(function (err) {
                swal.fire(
                    {
                        title: "خطأ في الطلب",
                        text: JSON.stringify(err),
                        icon: "error"
                    }
                );
            });

        }
    });


}
