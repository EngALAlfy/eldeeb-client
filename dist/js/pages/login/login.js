
$(function() {
    "use strict";

    var token = getCookie("token");
    if(token && token != null && token != 'undefined' && token != ""){
        window.location.href = window.location.origin + "/ar/profile/profile.html";
        return;
    }

    $('#username').on('keyup' , function (event) {
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            login();
        }
    });

    $('#password').on('keyup' , function (event) {
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            login();
        }
    });

    $("#login").click(function(){
        login();
    });

});

function login (){
    $.post(url + "api/login/username" , {
        username: $('#username').val(),
        password: $('#password').val()
    }).done(function(data){
        if(data.success == true){
            if(data.token && data.token != ""){
                setCookie("roles", JSON.stringify(data.roles), 1);
                setCookie("token" , data.token , 1);
                setCookie("name", data.name, 1);
                window.location.href = window.location.origin + "/ar/profile/profile.html";
            }else {
                swal.fire(
                    {
                        icon:"error",
                        title:"خطأ في السيرفر",
                        text:"رمز امان فارغ \n الرمز : "+ data.token
                    }
                );
            }

        }else if(data.success == false) {
            console.log(JSON.stringify(data.err));
            swal.fire(
                {
                    icon:"error",
                    title:"خطأ في السيرفر",
                    text:JSON.stringify(data.err)
                }
            );
        }
    }).fail(function(err){
        swal.fire(
            {
                icon:"error",
                title:"خطأ في الطلب",
                text:err.status
            }
        );
    });
}