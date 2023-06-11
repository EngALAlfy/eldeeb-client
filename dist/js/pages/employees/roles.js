
$(function() {
    "use strict";

    checkLogin();
    checkRoleAndReturn("view-employee");
    //checkRoleAndReturn("change-employee-roles");


    var  params = new URLSearchParams(window.location.search);
    if(!params.has("id")){
        window.location.href = "employees.html";
    }

    var id = params.get("id");


    $.post(url + "api/employees/get-employee-roles/"+id , {
        token: getCookie("token")
    }).done(function(data){

        if(data.success == true){
            $('input:checkbox').prop('checked', false);
            for(var i = 0; i<data.employee.length ; i++){

                $("#"+data.employee[i].name).prop('checked', true);
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



    $('#projects').change(function () {
        $('.projects').prop('checked', this.checked);
    });

    $('#employees').change(function () {
        $('.employees').prop('checked', this.checked);
    });

    $('#reports').change(function () {
        $('.reports').prop('checked', this.checked);
    });

    $('#contractors').change(function () {
        $('.contractors').prop('checked', this.checked);
    });

    $('#suppliers').change(function () {
        $('.suppliers').prop('checked', this.checked);
    });

    $('#notifications').change(function () {
        $('.notifications').prop('checked', this.checked);
    });

    $('#todo').change(function () {
        $('.todo').prop('checked', this.checked);
    });

    $('#all').change(function () {
        $('input:checkbox').prop('checked', this.checked);
    });

    $('#save-roles').click(function () {
       saveRoles(id);
    });

});


function saveRoles(id){
    var roles = $('input:checkbox:checked').map(function (){
        var list = ["all" , "projects" , "employees" , "suppliers" , "contractors" , "notifications" , "todo"];
        if(!list.includes(this.id)){
            return this.id;
        }
    }).get();

    $.post(url + "api/employees/add-employee-roles/"+id , {
        token: getCookie("token"),
        roles:roles.toString()
    }).done(function(data){
        if(data.success == true){
            swal.fire( "تم", "تم تحديث الصلاحيات" , "success").then(function () {
                window.location.href = "view-employee.html?id="+id;
            });
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


}