
$(function() {
    "use strict";

    checkLogin();


    var  params = new URLSearchParams(window.location.search);
    if(!params.has("id")){
        window.location.href = "projects.html";
    }

    var id = params.get("id");


    var tabs = $('.nav-tabs a');

    for(var i =0;i< tabs.length;i++){
        tabs[i].href = tabs[i].href +"?id="+id;
    }

    

    $.post(url + "api/projects/get-files/"+id , {
        token: getCookie("token")
    }).done(function(data){

        if(data.success == true){

            $('#comparison_time_line').val(data.project.comparison_time_line);
            $('#current_time_line').val(data.project.current_time_line);
            $('#assay').val(data.project.assay);
            $('#planned_time_line').val(data.project.planned_time_line);




            $('#assay-upload').click(function () {
                edit(id , "assay");
            });
            $('#comparison_time_line-upload').click(function () {
                edit(id , "comparison_time_line");
            });
            $('#current_time_line-upload').click(function () {
                edit(id , "current_time_line");
            });
            $('#planned_time_line-upload').click(function () {
                edit(id , "planned_time_line");
            });

            $('#assay-download').click(function () {
                downloadfile(id , data.project.assay);
            });
            $('#comparison_time_line-download').click(function () {
                downloadfile(id , data.project.comparison_time_line);
            });
            $('#current_time_line-download').click(function () {
                downloadfile(id , data.project.current_time_line);
            });
            $('#planned_time_line-download').click(function () {
                downloadfile(id , data.project.planned_time_line);
            });

        }else if(data.success == false) {
            swal.fire(
                {
                    title:"خطأ في السيرفر",
                    text:JSON.stringify(data.err),
                    icon:"error"
                }
            );
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


});

function edit(id , key) {
    swal.fire(
        {
            title:"رفع ملف",
            input: "file",
            icon:"info",
            showLoaderOnConfirm:true,
            preConfirm:function (result) {

                var reader = new FileReader();
                reader.readAsDataURL(result);

                reader.onloadend = function (ev) {
                    var base64 = reader.result.split("base64,").pop();
                    var ext = result.name.split(".").pop();


                    $.post(url + "api/projects/add-file/"+id , {
                        token: getCookie("token"),
                        ext: ext,
                        key: key,
                       file: base64
                    }).done(function(data){

                        if(data.success == true){
                            swal.fire({
                                icon:"success",
                                title:"تم بنجاح",
                                text:"تم رفع الملف بنجاح"
                            }).then(function (value) {
                                location.reload();
                            });

                        }else if(data.success == false) {
                            swal.fire(
                                {
                                    title:"خطأ في السيرفر",
                                    text:JSON.stringify(data.err),
                                    icon:"error"
                                }
                            );
                        }
                    })
                        .fail(function(err){
                        swal.fire(
                            {
                                title:"خطأ في الطلب",
                                text:err.status,
                                icon:"error"
                            }
                        );
                    });


                    swal.fire({
                        icon:"success",
                        title:"تم بنجاح",
                        text:"تم رفع الملف بنجاح"
                    });


                    //console.log(base);

                };

            },
            iconHtml:"<i class='fa fa-file'></i>",
            "text":"اختر ملف للرفع"
        }
    );
}

function downloadfile(id , url) {
    download(url + "projects-files/"+id+"/"+url);
}