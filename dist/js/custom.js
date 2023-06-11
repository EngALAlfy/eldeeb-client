$(function () {
    "use strict";

    $(".preloader").fadeOut();
    // this is for close icon when navigation open in mobile view
    $(".nav-toggler").on('click', function () {
        $("#main-wrapper").toggleClass("show-sidebar");
        $(".nav-toggler i").toggleClass("ti-menu");
    });

    $(".search-box a, .search-box .app-search .srh-btn").on('click', function () {
        $(".app-search").toggle(200);
        $(".app-search input").focus();
    });

    // ============================================================== 
    // Resize all elements
    // ============================================================== 
    $("body, .page-wrapper").trigger("resize");
    $(".page-wrapper").delay(20).show();

    //****************************
    /* This is for the mini-sidebar if width is less then 1170*/
    //**************************** 
    var setsidebartype = function () {
        var width = (window.innerWidth > 0) ? window.innerWidth : this.screen.width;
        if (width < 1000) {
            $("#main-wrapper").attr("data-sidebartype", "iconbar");
        } else if (width < 700) {
            $("#main-wrapper").attr("data-sidebartype", "overlay");
        } else {
            $("#main-wrapper").attr("data-sidebartype", "full");
        }
    };

    $(window).ready(setsidebartype);
    $(window).on("resize", setsidebartype);

    $('#logout').click(function () {
        clearCookies();
        window.location.href = window.location.origin + "/ar/login.html";
    });


    setViewAsRoles();

});


function setViewAsRoles() {
    if(checkRole("view-employee") === false){
        $("#employees-nav").hide();
    }

    if(checkRole("all-notifications") === false){
        $("#all-notifications-nav").hide();
    }

    if(checkRole("view-notification") === false){
        $("#your-notifications-nav").hide();
    }

    if(checkRole("view-contractor") === false){
        $("#contractors-nav").hide();
    }

    if(checkRole("view-supplier") === false){
        $("#suppliers-nav").hide();
    }

    if(checkRole("view-reports") === false){
        $("#reports-nav").hide();
    }

    if(checkRole("view-project") === false){
        $("#projects-nav").hide();
    }


}

function success() {
    var Toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            onOpen: function (toast) {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });

    Toast.fire({
        icon: 'success',
        title: 'تمت بنجاح'
    });
}

function progress() {
    Swal.fire({
        imageUrl:"/assets/images/ajax-loader.gif",
        showConfirmButton: false,
        allowOutsideClick: false,
        title: 'جاري التحميل ..'
    });
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkRole(role) {
    var roles = JSON.parse(getCookie("roles"));
    for (var i = 0; i < roles.length; i++) {
        if (roles[i].name == role) {
            return true;
        }
    }
    return false;
}

function checkRoleAndReturn(role) {
    if (checkRole(role) !== true) {
        swal.fire("غير مسموح", "غير مسموح لك بصلاحيه : " + role, "error").then(function (value) {
            window.location.href = window.location.origin + "/ar/profile/profile.html";
        });

        return;
    }
}

function checkLogin() {


    var token = getCookie("token");


    if (token && token != null && token != 'undefined' && token != "") {
        $.post(url + "api/login/token", {
            token: token
        }).done(function (data) {

            if (data.success == true) {
                setCookie("roles", JSON.stringify(data.roles), 1);
                setCookie("name", data.name, 1);
                $('#user-name').html('<i class="ti-user"></i> '+data.name);
                $('#current-user-image').attr('src' , url + 'profiles-files/' + data.photo);
            } else if (data.success == false) {
                swal.fire(
                    {
                        icon: "error",
                        title: "خطأ في السيرفر",
                        text: data.err
                    }
                ).then(function (v) {
                    window.location.href = window.location.origin + "/ar/login.html";
                    return;
                });
            }
        }).fail(function (err) {
            swal.fire(
                {
                    icon: "error",
                    title: "خطأ في الطلب",
                    text: err.status
                },
                function () {
                    window.location.href = window.location.origin + "/ar/login.html";
                    return;
                }
            );
        });
    } else {
        window.location.href = window.location.origin + "/ar/login.html";
        return;
    }
}

function clearCookies() {


    var cookies = document.cookie.split("; ");

    for (var c = 0; c < cookies.length; c++) {
        var d = window.location.hostname.split(".");
        while (d.length > 0) {
            var cookieBase = encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT;path=/';
            var p = location.pathname.split('/');
            document.cookie = cookieBase + '/';
            while (p.length > 0) {
                document.cookie = cookieBase + p.join('/');
                p.pop();
            }
            d.shift();
        }
    }

}



