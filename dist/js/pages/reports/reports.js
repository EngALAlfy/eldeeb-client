
$(function () {
    "use strict";

    checkLogin();
    checkRoleAndReturn("view-reports");


    if(checkRole("attendance-report") === false){
        $('#attendance-report').hide();
    }

});

