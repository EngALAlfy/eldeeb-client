var report = {};

$(function () {
    "use strict";

    checkLogin();
    checkRoleAndReturn("view-employee");
    checkRoleAndReturn("attendance-report");

    $.post(url + "api/employees/get-all", {
        token: getCookie("token")
    }).done(function (data) {

        if (data.success == true) {
            var today = new Date();

            var num_of_days = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            var num_of_fridays = 0;

            for (var day = 1; day <= num_of_days; day++) {
                if (new Date(today.getFullYear(), today.getMonth(), day).getDay() == 5) {
                    num_of_fridays += 1;
                }
            }

            if (data.employees && data.employees.length > 0) {

                $('#salary-info-year option[value=' + today.getFullYear() + ']').attr('selected', 'selected');
                $('#salary-info-month option[value=' + (today.getMonth() + 1) + ']').attr('selected', 'selected');

                $('#salary-info-month').change(function () {
                    var month = $(this).val() - 1;
                    var year = $('#salary-info-year').val();

                    var num_of_days = new Date(year, month + 1, 0).getDate();
                    var num_of_fridays = 0;

                    for (var day = 1; day <= num_of_days; day++) {
                        if (new Date(year, month, day).getDay() == 5) {
                            num_of_fridays += 1;
                        }
                    }

                    for (var i = 0; i < data.employees.length; i++) {

                        if (data.employees[i].username === "admin") {
                            continue;
                        }

                        getEmployeeAttendance(data.employees[i].code, data.employees[i].id, data.employees[i].name, num_of_days, num_of_fridays, month, year, (i == data.employees.length - 1));
                    }

                });

                $('#salary-info-year').change(function () {
                    var year = $(this).val();
                    var month = $('#salary-info-month').val() - 1;

                    var num_of_days = new Date(year, month + 1, 0).getDate();
                    var num_of_fridays = 0;

                    for (var day = 1; day <= num_of_days; day++) {
                        if (new Date(year, month, day).getDay() == 5) {
                            num_of_fridays += 1;
                        }
                    }

                    for (var i = 0; i < data.employees.length; i++) {

                        if (data.employees[i].username === "admin") {
                            continue;
                        }

                        getEmployeeAttendance(data.employees[i].code, data.employees[i].id, data.employees[i].name, num_of_days, num_of_fridays, month, year, (i == data.employees.length - 1));
                    }

                });


                for (var i = 0; i < data.employees.length; i++) {

                    if (data.employees[i].username === "admin") {
                        continue;
                    }

                    getEmployeeAttendance(data.employees[i].code, data.employees[i].id, data.employees[i].name, num_of_days, num_of_fridays, today.getMonth(), today.getFullYear(), (i == data.employees.length - 1));
                }
            }


        } else if (data.success == false) {
            swal.fire(
                {
                    icon: "error",
                    title: "خطأ في السيرفر",
                    text: JSON.stringify(JSON.stringify(data.err))
                }
            );
        }
    }).fail(function (err) {
        swal.fire(
            {
                icon: "error",
                title: "خطأ في الطلب",
                text: JSON.stringify(err)
            }
        );
    });


});


function buildTable() {
    var table = $("#attendance-table");

    var data = [];

    for (var i in report) {
        var row = {};

        row.id = report[i].id;
        row.code = report[i].code;
        row.name = report[i].name;

        row.salary = report[i].salary;

        row.month_days = report[i].num_of_days;
        row.fridays = report[i].num_of_fridays;

        row.formal_holidays = report[i].formal_holidays;
        row.paid_holidays = report[i].paid_holidays;
        row.work_days = report[i].work_days;

        row.attend_days = report[i].attend_days;
        row.absence_days = report[i].absence_days;

        row.attendance_salary = report[i].attendance_salary;

        row.borrows = report[i].borrows;
        row.discounts = report[i].discounts;
        row.additions = report[i].additions;
        row.rewards = report[i].rewards;

        row.final_salary = report[i].final_salary;

        data.push(row);
    }


    table.bootstrapTable('destroy').bootstrapTable({
        data: data,
        exportDataType: 'all',
        exportTypes: ['pdf', 'excel'],
        printIgnore: true,
        stickyHeader: true,
        //fixedColumns: true,
        //fixedNumber: 2,
        //fixedRightNumber: 2,
        exportOptions: {
            rtl: true,
            escape: false, pdfmake: {
                enabled: true,
                docDefinition: {pageOrientation: 'landscape', defaultStyle: {alignment: 'right', direction: 'rtl'}}
            }
        }
    });
    table.bootstrapTable('hideColumn', 'id');

    $(".doubleScroll-scroll").width(table.width());

    $(".doubleScroll-scroll-wrapper").scroll(function () {
        $(".fixed-table-body").scrollLeft($(".doubleScroll-scroll-wrapper").scrollLeft());
    });

    $(".fixed-table-body").scroll(function () {
        $(".doubleScroll-scroll-wrapper").scrollLeft($(".fixed-table-body").scrollLeft());
    });

    var right = $(window).width() - ($('.fixed-table-container').offset().left + $('.fixed-table-container').width());
    var left = $('.fixed-table-container').offset().left;


    $('.sticky-header-container').on('isVisible', function () {
        $('.sticky-header-container').attr('style', 'left: '+left+'px !important; right: '+right+'px !important;');
    });

}


function inputFormatter(value) {
    if (!value) value = 0;
    return '<input class="form-control border-0 w-100 h-100" type="number" value="' + value + '">';
}

function linkFormatter(value , row , index) {
    var  employee_url = window.location.origin + "/ar/employees/view-employee.html?id="+row.id;
    return '<a target="_blank" class="text-secondary" href="'+employee_url+'" >'+value+'</a>';
}

function inputButton(value) {
    if (!value) value = 0;
    return '<button class="btn btn-success"><i class="fa fa-save"></i></button>';
}


function noPadding(value, row, index) {
    return {
        css: {
            padding: '0 !important'
        }
    }
}

function fromAttendanceToFinal(index, row) {
    var final = (row.attendance_salary ? parseInt(row.attendance_salary) : 0) + (row.additions ? parseInt(row.additions) : 0) + (row.rewards ? parseInt(row.rewards) : 0) - (row.discounts ? parseInt(row.discounts) : 0) - (row.borrows ? parseInt(row.borrows) : 0);

    row.final_salary = (Math.ceil(final / 5) * 5);
    $("#attendance-table").bootstrapTable('updateRow', {
        index: index,
        row: row
    });
}


function fromAttendanceToFinalById(id, row) {
    var final = (row.attendance_salary ? parseInt(row.attendance_salary) : 0) + (row.additions ? parseInt(row.additions) : 0) + (row.rewards ? parseInt(row.rewards) : 0) - (row.discounts ? parseInt(row.discounts) : 0) - (row.borrows ? parseInt(row.borrows) : 0);

    row.final_salary = (Math.ceil(final / 5) * 5);
    $("#attendance-table").bootstrapTable('updateByUniqueId', {
        id: id,
        row: row
    });
}


window.inputAdditions = {
    'change :input': function (e, value, row, index) {
        var additions = ($(e.target).val() ? parseInt($(e.target).val()) : 0);
        report[row.id]["additions"] = additions;
        row.additions = additions;
        $("#attendance-table").bootstrapTable('updateRow', {
            index: index,
            row: row
        });

        fromAttendanceToFinal(index, row);
    }
};

window.inputBorrows = {
    'change :input': function (e, value, row, index) {
        var borrow = ($(e.target).val() ? parseInt($(e.target).val()) : 0);
        report[row.id]["borrows"] = borrow;
        row.borrows = borrow;
        $("#attendance-table").bootstrapTable('updateRow', {
            index: index,
            row: row
        });

        fromAttendanceToFinal(index, row);
    }
};

window.inputDiscounts = {
    'change :input': function (e, value, row, index) {
        var discounts = ($(e.target).val() ? parseInt($(e.target).val()) : 0);
        report[row.id]["discounts"] = discounts;
        row.discounts = discounts;
        $("#attendance-table").bootstrapTable('updateRow', {
            index: index,
            row: row
        });

        fromAttendanceToFinal(index, row);
    }
};

window.inputRewards = {
    'change :input': function (e, value, row, index) {
        var rewards = ($(e.target).val() ? parseInt($(e.target).val()) : 0);
        report[row.id]["rewards"] = rewards;
        row.rewards = rewards;
        $("#attendance-table").bootstrapTable('updateRow', {
            index: index,
            row: row
        });

        fromAttendanceToFinal(index, row);
    }
};

function saveSalaryInfo(row , final) {

    progress();

    $.post(url + "api/employees/save-employee-salary-info/" + row.id, {
        token: getCookie("token"),

        salary: row.salary,

        month_days: row.month_days,
        fridays: row.fridays,

        formal_holidays: row.formal_holidays,
        paid_holidays: row.paid_holidays,
        work_days: row.work_days,

        attend_days: row.attend_days,
        absence_days: row.absence_days,

        attendance_salary: isNaN(row.attendance_salary) ? 0 :row.attendance_salary,

        borrows: row.borrows,
        discounts: row.discounts,
        additions: row.additions,
        rewards: row.rewards,

        final_salary: isNaN(row.final_salary)?0:row.final_salary

    }).done(function (data) {

        if (data.success == true) {
            if(final){
                swal.fire({
                    icon: "success",
                    title: "تم بنجاح",
                    text: "تم حفظ التقارير بنجاح"
                }).then(function (value) {
                    location.reload();
                });
            }else {
                success();
                //progress();
            }

        } else if (data.success == false) {
            console.log(data);
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

window.inputSave = {
    'click :button': function (e, value, row, index) {
        saveSalaryInfo(row , false);
    }
};

window.inputFormalHolidays = {
    'change :input': function (e, value, _row, index) {

        e.preventDefault();


        var formalHolidays = ($(e.target).val() ? parseInt($(e.target).val()) : 0);

        var table = $("#attendance-table");

        var data = table.bootstrapTable('getData');

        for (var i = 0; i < data.length; i++) {
            var id = data[i].id;
            var row = table.bootstrapTable('getRowByUniqueId', id);

            report[row.id]["formal_holidays"] = formalHolidays;

            row.formal_holidays = formalHolidays;

            if (row.paid_holidays) {
                if (row.paid_holidays >= row.absence_days) {
                    row.work_days = (parseInt(row.month_days) - parseInt(row.fridays) - parseInt(row.absence_days)) - formalHolidays;
                } else {
                    row.work_days = (parseInt(row.month_days) - parseInt(row.fridays) - parseInt(row.paid_holidays)) - formalHolidays;
                }
            } else {
                row.work_days = (parseInt(row.month_days) - parseInt(row.fridays)) - formalHolidays;
            }

            row.attendance_salary = ((parseInt(row.attend_days) / row.work_days) * parseInt(row.salary)).toFixed(0);


            table.bootstrapTable('updateByUniqueId', {
                id: id,
                row: row
            });

            fromAttendanceToFinalById(id, row);

        }

        success();


    }
};


function saveAll(){

        var table = $("#attendance-table");

        var data = table.bootstrapTable('getData');

        for (var i = 0; i < data.length; i++) {
            var id = data[i].id;
            var row = table.bootstrapTable('getRowByUniqueId', id);

            saveSalaryInfo(row , (i == data.length - 1));
        }
}

function getEmployeeAttendance(code, id, name, num_of_days, num_of_fridays, month, year, final) {
    $.post(url + "api/employees/get-employee-attendance/" + id, {
        token: getCookie("token"),
        info: true
    }).done(function (data) {

        if (data.success == true) {
            report[id] = {};

            var attendanceList = [];

            var attendance = data.employee.attendance;
            var salaryInfoList = data.employee.salary_info;

            var salaryInfo = null;


            salaryInfoList.forEach(function (value) {
                if (value.month == month && value.year == year) {
                    salaryInfo = value;
                }
            });

            attendance.forEach(function (value) {

                if (value.month != month || value.year != year) {
                    return;
                }

                attendanceList.push(value);

            });

            if (salaryInfo) {
                report[id]['attend_days'] = salaryInfo.attend_days;
                report[id]['absence_days'] = salaryInfo.absence_days;
                report[id]['salary'] = parseInt(salaryInfo.salary);
                report[id]['paid_holidays'] = parseInt(salaryInfo.paid_holidays);
                report[id]['name'] = name;
                report[id]['code'] = code;
                report[id]['id'] = id;


                report[id]['num_of_days'] = parseInt(salaryInfo.month_days);
                report[id]['num_of_fridays'] = isNaN(parseInt(salaryInfo.fridays)) ? 0:parseInt(salaryInfo.fridays);

                report[id]['formal_holidays'] = isNaN(parseInt(salaryInfo.formal_holidays)) ? 0 :parseInt(salaryInfo.formal_holidays);

                report[id]['work_days'] = salaryInfo.work_days;


                report[id]['attendance_salary'] = salaryInfo.attendance_salary;

                report[id]['borrows'] = salaryInfo.borrows;
                report[id]['discounts'] = salaryInfo.discounts;
                report[id]['additions'] = salaryInfo.additions;
                report[id]['rewards'] = salaryInfo.rewards;

                report[id]['final_salary'] = salaryInfo.final_salary;

            } else {

                var attendDays = 0;
                var absenceDays = 0;

                for (var i = 0; i < attendanceList.length; i++) {
                    if (attendanceList[i].attendance === true) {
                        attendDays++;
                    } else if (attendanceList[i].attendance === false) {
                        absenceDays++;
                    }

                }

                report[id]['attend_days'] = attendDays;
                report[id]['absence_days'] = absenceDays;
                report[id]['salary'] = isNaN(parseInt(data.employee.salary)) ? 0 : parseInt(data.employee.salary);
                report[id]['paid_holidays'] = isNaN(parseInt(data.employee.paid_holidays)) ? 0 : parseInt(data.employee.paid_holidays);
                report[id]['name'] = name;
                report[id]['code'] = code;
                report[id]['id'] = id;


                report[id]['num_of_days'] = num_of_days;
                report[id]['num_of_fridays'] = num_of_fridays;

                report[id]['formal_holidays'] = 0;
                report[id]['work_days'] = (num_of_days - num_of_fridays - report[id]['formal_holidays']);

                if (report[id]['paid_holidays']) {
                    if (parseInt(report[id]['paid_holidays']) >= absenceDays) {
                        report[id]['work_days'] = (num_of_days - num_of_fridays - parseInt(report[id]['formal_holidays']) - absenceDays);
                    } else {
                        report[id]['work_days'] = (num_of_days - num_of_fridays - parseInt(report[id]['formal_holidays']) - parseInt(report[id]['paid_holidays']));
                    }
                }


                report[id]['attendance_salary'] = ((attendDays / report[id]['work_days']) * data.employee.salary).toFixed(0);

                report[id]['borrows'] = 0;
                report[id]['discounts'] = 0;
                report[id]['additions'] = 0;
                report[id]['rewards'] = 0;


                report[id]['final_salary'] = Math.ceil((report[id]['attendance_salary'] / 5) * 5);

            }

            if (final === true) {
                buildTable();
            }

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
