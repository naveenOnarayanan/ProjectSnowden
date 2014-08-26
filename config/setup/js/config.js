var config = {
    folders: [],
    users: [],
    whitelist: [],
    key: ""
};

function resetActive(event, percent, step) {
    $(".progress-bar").css("width", percent + "%").attr("aria-valuenow", percent);
    $(".progress-completed").text(percent + "%");

    $("div").each(function () {
        if ($(this).hasClass("activestep")) {
            $(this).removeClass("activestep");
        }
    });

    if (event.target.className == "col-md-15") {
        $(event.target).addClass("activestep");
    }
    else {
        $(event.target.parentNode).addClass("activestep");
    }

    hideSteps();
    showCurrentStepInfo(step);
}

function hideSteps() {
    $("div").each(function () {
        if ($(this).hasClass("activeStepInfo")) {
            $(this).removeClass("activeStepInfo");
            $(this).addClass("hiddenStepInfo");
        }
    });
}

function showCurrentStepInfo(step) {
    var id = "#" + step;
    $(id).addClass("activeStepInfo");
}

function removeFromArrayAndHTML(arr, id, prefix_id) {
    arr.splice(id, 1);
    $("#" + prefix_id + "-" + id).remove();
}

function removeFolder(id) {
    removeFromArrayAndHTML(config.folders, id, "folder");
}

function removeUser(id) {
    removeFromArrayAndHTML(config.users, id, "user");
}

function removeWhitelist(id) {
    removeFromArrayAndHTML(config.whitelist, id, "whitelist");
}

$(function() {
    $("#generated-md5").hide();
    $("#final-confirmation").hide();
    $("#add-folder").click(function() {
        var row_id = config.folders.length;
        config.folders.push({
            name: $("#folder-name").val(),
            path: $("#folder-path").val()
        });
        $("#folders-body").append(
            "<tr data-id='" + row_id + "' id='folder-" + row_id + "'>" +
                "<td>" + config.folders[row_id].name + "</td>" +
                "<td>" + config.folders[row_id].path + "</td>" +
                "<td><button style='border-radius:50px;' class='btn btn-danger btn-xs remove-folder' onclick='removeFolder(" + row_id + ");'>Delete</button></td>" +
            "</tr>"
        );
        $("#folder-name").val("");
        $("#folder-path").val("");
    });

    $("#add-user").click(function() {
        var row_id = config.users.length;
        config.users.push({
            name: $("#user-name").val(),
            server: $("#user-server").val(),
            port: $("#user-port").val(),
            key: $("#user-key").val()
        });
        $("#users-body").append(
            "<tr data-id='" + row_id + "' id='user-" + row_id + "'>" +
                "<td>" + config.users[row_id].name + "</td>" +
                "<td>" + config.users[row_id].server + "</td>" +
                "<td>" + config.users[row_id].port + "</td>" +
                "<td>" + config.users[row_id].key + "</td>" +
                "<td><button style='border-radius:50px;' class='btn btn-danger btn-xs remove-user' onclick='removeUser(" + row_id + ");'>Delete</button></td>" +
            "</tr>"
        );

        $("#user-name").val("");
        $("#user-server").val(""),
        $("#user-port").val(""),
        $("#user-key").val("")
    });

    $("#add-whitelist").click(function() {
        var row_id = config.whitelist.length;
        config.whitelist.push($("#whitelist-ip").val());
        $("#whitelist-body").append(
            "<tr data-id='" + row_id + "' id='whitelist-" + row_id + "'>" +
                "<td>" + config.whitelist[row_id] + "</td>" +
                "<td><button style='border-radius:50px;' class='btn btn-danger btn-xs remove-whitelist' onclick='removeWhitelist(" + row_id + ");'>Delete</button></td>" +
            "</tr>"
        );
        $("#whitelist-ip").val("");
    });

    $("#add-key").click(function() {
        var user_str = $("#key").val();
        var generated_md5 = hex_md5(user_str);
        $("#generated-md5").text(generated_md5);
        config.key = generated_md5;
        $("#generated-md5").show();
        $("#key").val("");
    });

    $("#save-config").click(function() {
        console.log(JSON.stringify(config));

        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: "http://localhost:3000/config/setup",
            data: JSON.stringify(config),
            success: function(data) {
                console.log("done");
                $("#final-confirmation").show();
                window.setTimeout(function() {
                    window.location.href = "http://localhost:3000";
                }, 2000);
            },
            error: function(err) {
                console.log(err);
            }
        }).done(function() {
            console.log("done");
        });
    });
});