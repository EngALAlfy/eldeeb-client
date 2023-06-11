
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

    

    $.post(url + "api/projects/get-unsolved-problems/"+id , {
        token: getCookie("token")
    }).done(function(data){

        if(data.success == true){
            data.problems.forEach(function (value) {
               $('#problems-form').append(

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
                   '                                                   <label class="col-md-12">' + value.title + '</label>' +
                   '                                                   <p class="text-secondary">' + value.des + '</p>' +
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


                    $.post(url + "api/projects/add-extract-file/"+id , {
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