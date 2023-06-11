
$(function() {
    "use strict";

    checkLogin();


    $.post(url + "api/suppliers/get-all" , {
        token: getCookie("token")
    }).done(function(data){

        if(data.success == true){
            if(data.suppliers && data.suppliers.length > 0){
                for(var i=0;i < data.suppliers.length;i++){
                    console.log(data.suppliers[i]);
                    $("#suppliers-table tbody").append('<tr>' +
                        '                                    <td>' +
                        '                                        <div class="d-flex align-items-center">' +
                        '                                            <div class="m-r-10"><a class="btn btn-circle btn-orange text-white">م</a>' +
                        '                                            </div>' +
                        '                                            <div class="">' +
                        '                                                <h4 class="m-b-0 font-16">'+data.suppliers[i].name+'</h4>' +
                        '                                            </div>' +
                        '                                        </div>' +
                        '                                    </td>' +
                        '                                    <td>'+data.suppliers[i].field+'</td>' +
                        '                                    <td><a class="m-b-0 btn btn-success"><i class="mdi mdi-eye text-white-50"></i></a></td>' +
                        '                                    <td>' +
                        '                                        <a class="m-b-0 btn btn-warning"><i class="mdi mdi-pen text-white-50"></i></a>' +
                        '                                    </td>' +
                        '                                    <td>' +
                        '                                        <a class="m-b-0 btn btn-danger"><i class="mdi mdi-delete text-white-50"></i></a>' +
                        '                                    </td>' +
                        '                                </tr>');
                }
            }
        }else if(data.success == false) {
            bootbox.alert(
                {
                    title:"خطأ في السيرفر",
                    message:JSON.stringify(data.err)
                }
            );
        }
    }).fail(function(err){
        bootbox.alert(
            {
                title:"خطأ في الطلب",
                message:err.status
            }
        );
    });


});