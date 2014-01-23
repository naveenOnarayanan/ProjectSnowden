$(function() {
    var gUserList;

    $("#settings-btn").click(function() {
        $.get("/config", function(config) {
            $.each(config.folders, function(index, folder) {
                $("#folder-list-config").append(
                    "<a class='list-group-item'>"
                        + "<div class='row'>"
                            + "<div class='col-lg-4'>" + folder.name + "</div>"
                            + "<div class='col-lg-4'>" + folder.path + "</div>"
                            + "<div class='col-lg-4'>"
                                + "<button class='btn btn-danger'>Delete</button>"
                            + "</div>"
                        + "</div>"
                    + "</a>"
                );
            });

            $("#settings").modal("show");
        });
    });


    $.get("/public/v1/uwp/userlist", function(values) {
        $.each(values.userlist, function(index, value) {
            $("#available-files").append(
                "<a class='list-group-item user-list-item' data-index='" + index + "'>"
                    + "<h4 class='list-group-item-heading'> " + value.name + "</h4>"
                    + "<p class='list-group-item-text'> Server: " + value.server + "</p>"
                + "</a>"
            );
        });

        $(".user-list-item").click(function() {
            $(".user-list-item").addClass("other-user-list");
            $(this).removeClass("other-user-list");
            $("#available-files").animate({ width: "200px"}, 500);
            $(".other-user-list").hide("slow");
            $ ("#file-explorer-wrapper").animate( {width: "80%", padding: "10px" }, 500 );
            $("#file-explorer").empty();
            $("#address-bar").empty();

            $("#address-bar").append(
                "<li><a class='breadcrumbs-groups'><span class='glyphicon glyphicon-home'></span></a></li>"
            );

            var index = parseInt($(this).attr("data-index"));
            getDownloadableGroups(values.userlist[index].server, values.userlist[index].key);
        });
    });
});

function escape(url) {
	return url.replace(/\'/g, "&#39;");
}

function getDownloadableGroups(server, key) {
    var url = "http://";
    url += server
    url += "/public/v1/uwp/filelist"
    url += "?";
    url += "key=" + key

    $.get(url, function(values) {
        $.each(values.filelist, function(index, file) {
            $("#file-explorer").append(
                "<div class='row explorer-item explorer-folder' data-name='" + file.name + "' data-path='" + file.path + "'>"
                    + "<div class='col-lg-3 explorer-item-icon'>"
                        + "<img src='images/folder.png' height='50px' width='50px'/>"
                    + "</div>"
                    + "<div class='col-lg-3 explorer-item-name'>"
                        + "<p>" + file.name + "</p>"
                    + "</div>"
                    + "<div class='col-lg-3 explorer-item-ext'>"
                        + "<p></p>"
                    + "</div>"
                    + "<div class='col-lg-3 explorer-item-size'>"
                        + "<p></p>"
                    + "</div>"
                + "</div>"
                // "<div class='explorer-item explorer-folder' data-name='" + value.name + "' data-path='" + value.path + "'>"
                //     + "<img src='images/group.png' height='100px' width='100px'/>"
                //     + "<p class='explorer-text'>" + value.name + "</p>"
                // + "</div>"
            );
        });
        registerExplorerItemClickEvent(server, key);
    });
}

function registerExplorerItemClickEvent(server, key) {
    $(".explorer-item.explorer-folder").click(function(){
        getFiles(server, key, $(this).attr("data-path"), $(this).attr("data-name"));
    });

    $.contextMenu({
        selector: '.explorer-item', 
        callback: function(contextKey, options) {
            var file_path = $(this).attr("data-path");
            var file_name = $(this).attr("data-name");
            var file_type = $(this).attr("data-type");


            var url = "http://";
            url += server;

            if (file_type == "D") {
                url += "/public/v1/uwp/download/folder/";
            } else {
                url += "/public/v1/uwp/download/"
            }

            url += "?key=";
            url += key;
            url += "&path=";
            url += file_path;
            url += "&name=";
            url += file_name;

            $.fileDownload(url);
        },
        items: {
            "download": {name: "Download", icon: "edit"}
        }
    });
    
    $('.explorer-item').mousedown(function(event){
        if (event.which == 3) {
            $(".explorer-item-hover").removeClass("explorer-item-hover");
            $(this).addClass("explorer-item-hover");
        }
    });

    $(".breadcrumbs").off().on('click', function() {
        var index = $(this).parent().index();

        $(this).parent().parent().children().slice(index).detach();
        getFiles(server, key, $(this).attr("data-path"), $(this).attr("data-name"));
    });
    $(".breadcrumbs-groups").off().on('click', function() {
        var index = $(this).parent().index();
        $("#file-explorer").empty();
        $(this).parent().parent().children().slice(index + 1).detach();
        getDownloadableGroups(server, key);
    })
}

function getFiles(server, key, dataPath, name) {
	var url = "http://" + server + "/public/v1/uwp/files" + "?key=" + key + "&path=" + dataPath;
    $.get(url, function(values) {
    var folderString = "", fileString = "";
    $("#address-bar").append(
      "<li><a class='breadcrumbs' data-path='" + dataPath + "' data-name='" + name +"'><span class='breadcrumbs-name'>" + name + "</span></a></li>"
    );
    $.each(values.files, function(index, file) {
        if (file.type == "D") {
			console.log(file.path);
            folderString +=
                "<div class='row explorer-item explorer-folder' data-name=\"" + file.name + "\" data-path=\"" + file.path + "\" data-type='" + file.type + "'>"
                    + "<div class='col-lg-3 explorer-item-icon'>"
                        + "<img src='images/folder.png' height='50px' width='50px'/>"
                    + "</div>"
                    + "<div class='col-lg-3 explorer-item-name'>"
                        + "<p>" + file.name + "</p>"
                    + "</div>"
                    + "<div class='col-lg-3 explorer-item-ext'>"
                        + "<p>" + file.ext + "</p>"
                    + "</div>"
                    + "<div class='col-lg-3 explorer-item-size'>"
                        + "<p>" + file.size + "</p>"
                    + "</div>"
                + "</div>";
                // "<div class='explorer-item explorer-folder' data-name='" + file.name + "' data-path='" + file.path + "'>"
                //     + "<img src='images/folder.png' height='100px' width='100px'/>"
                //     + "<br/>"
                //     + file.name
                // + "</div>";
        } else {
            fileString +=
                "<div class='row explorer-item explorer-file' data-name=\"" + file.name + "\" data-path=\"" + file.path.replace(/\'/g, "&#39;") + "\" data-type='" + file.type + "'>"
                    + "<div class='col-lg-3 explorer-item-icon'>"
                        + "<img src='images/" + file.ext + ".png' onerror=\"this.src='images/file.png'\" height='60px' width='60px'/>"
                    + "</div>"
                    + "<div class='col-lg-3 explorer-item-name'>"
                        + "<p>" + file.name.replace("." + file.ext, "") + "</p>"
                    + "</div>"
                    + "<div class='col-lg-3 explorer-item-ext'>"
                        + "<p>" + file.ext + "</p>"
                    + "</div>"
                    + "<div class='col-lg-3 explorer-item-size'>"
                        + "<p>" + file.size + "</p>"
                    + "</div>"
                + "</div>";
                // "<div class='explorer-item explorer-file' data-name='" + file.name + "' data-path='" + file.path + "'>"
                //     + "<img src='images/file.png' height='100px' width='100px'/>"
                //     + "<br/>"
                //     + file.name
                // + "</div>";
        }
    });
    $("#file-explorer").html(folderString + fileString);
        registerExplorerItemClickEvent(server, key);
    });
}

function encodeHTML(s) {
	return s.split('&').join('&amp;').split('<').join('&lt;').split('"').join('&quot;').split("'").join('&#39;');
}