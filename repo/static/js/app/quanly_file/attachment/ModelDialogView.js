define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template = require('text!app/quanly_file/attachment/tpl/model_dialog.html'); 
    var UploadFile = require("app/view/AttachFile/UploadFile");
    var DialogImportImage = require("app/quanly_file/quanly_image/DialogImportLink");
    return Gonrin.ModelDialogView.extend({
    	template: template,
        modelSchema: {},
        urlPrefix: "",
        collectionName: "",
        uiControl: {
            fields: [
        
            ]
        },
		tools: [
            {
    	    	name: "defaultgr",
    	    	type: "group",
    	    	groupClass: "toolbar-group",
    	    	buttons: [
					{
						name: "close",
						type: "button",
						buttonClass: "btn-secondary waves-effect width-sm",
						label: "<i class='fas fa-times'></i> Đóng",
						command: function(){
							var self = this;
							self.close()
						}
					},
    	    	]
    	    },
        ],
        objectFile: {},
    	render: function() {
            var self = this;
            self.objectFile = {};
            var curUser = self.getApp().currentUser;
            if (curUser) {
                self.applyBindings();
                var query_filter = {
                    "user_id": curUser.id
                };
                self.model.set("query_filter", query_filter);
                self.get_image(query_filter);
                self.image_me();
                self.attach_file();
                self.selectizePeople();
                self.search_image();
                return this;
            }
        },
        render_media_info: function(file) {
            var self = this;
            var url_file = gonrinApp().check_file_minio(file);
            var file_type = file.extname.substring(1).toLowerCase();
            var file_size = Math.round(file.size/1024);
            var file_name = file.name;
            var time_upload = gonrinApp().convert_time_to_string(file.created_at);
            self.$el.find(".media-info .m_info-container").append(`
                <div class="m_info-body">
                    <h4 class="text-center text-uppercase">Thông tin file</h4>
                    <div class="col-12 file-detail-info pb-1 mt-1"><button type="button" class="btn btn-primary" id="copy_url_file" title="`+ url_file +`"><i class="fas fa-copy"></i> Copy link</button></div>
                    <div class="col-12 file-detail-info pb-1 mt-1">Thời gian tải lên: `+ time_upload +`</div>
                    <div class="col-12 file-detail-info pb-1 mt-1">Định dạng: `+ file_type +`</div>
                    <div class="col-12 file-detail-info pb-1 mt-1">Dung lượng: `+ file_size +` KB</div>
                    <div class="col-12 file-detail-info pb-1 mt-1">
                        <label for="simpleinput">Tên file</label>
                        <textarea rows="3" class="form-control" id="file_name" placeholder="Nhập tên file">`+ file_name +`</textarea>
                    </div>
                </div>
                <div class="m_info-footer">
                    <button type="button" class="btn btn-success" id="update_file"><i class="fas fa-save"></i> Lưu thông tin</button>
                    <button type="button" class="btn btn-primary ml-2" id="insert_file"><i class="fas fa-plus"></i> Chọn file</button>
                </div>
            `);
            self.$el.find("#copy_url_file").unbind("click").bind("click", function() {
                var $temp = $("<input>");
                self.$el.find(".m_info-body").append($temp);
                $temp.val(url_file).select();
                document.execCommand("copy");
                self.getApp().notify("Đã sao chép vào bảng nhớ tạm");
                $temp.remove();
            });
            self.insert_file(file);
            self.update_file(file);
        },
        insert_file: function(file) {
            var self = this;
            self.$el.find("#insert_file").unbind("click").bind("click", function() {
                self.trigger("success", self.objectFile[file.id]);
                self.close();
            });
        },
        update_file: function(file) {
            var self = this;
            self.$el.find("#update_file").unbind("click").bind("click", function() {
                var file_name = self.$el.find("#file_name").val();
                if (file_name) {
                    var domain = gonrinApp().serviceURL,
                        path_api = "/api/v1/current_user";
                    var url = gonrinApp().serviceURL + '/api/v1/change-file-name';
                    var params = { 
                        // "domain": domain, 
                        // "path_api": path_api,
                        "file_id": file.id,
                        "file_name": file_name,
                        // "type_file": "2"
                    };
                    $.ajax({
                        url: url,
                        data: JSON.stringify(params),
                        dataType: "json",
                        method: 'POST',
                        contentType: "application/json",
                        success: function(response) {
                            if (response && response.data) {
                                var file = response.data;
                                self.getApp().notify("Cập nhật thông tin file thành công");
                                self.objectFile[file.id] = file;
                                self.$el.find("#item_" + file.id + " .file-item-name").text(file.name);
                            }
                            else {
                                self.getApp().notify({ message: "Có lỗi xảy ra. Vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
                            }
                        },
                        error: function(xhr, status, error) {
                            try {
                                if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                    self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                    self.getApp().getRouter().navigate("login");
                                } else {
                                    self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                }
                            } catch (err) {
                                self.getApp().notify({ message: "Lỗi truy cập dữ liệu, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
                            }
                        },
                    });
                }
                else {
                    self.getApp().notify({ message: "Có lỗi xảy ra. Vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
                }
            });
        },
        image_me: function() {
            var self = this;
            var curUser = self.getApp().currentUser;
            self.$el.find("#img_me").unbind("click").bind("click", function() {
                self.$el.find("#selectize_people")[0].selectize.clear();
                if(self.$el.find("#img_me").is(":checked")) {
                    var query_filter = {
                        "user_id": curUser.id
                    };
                    self.model.set("query_filter", query_filter);
                    self.get_image(query_filter);
                }
                else {
                    var query_filter = {
                        "user_id": null
                    };
                    self.model.set("query_filter", query_filter);
                    self.get_image(query_filter);
                }
            });
        },
        attach_file: function() {
            var self = this;
            self.$el.find("#btn_add_file").unbind("click").bind("click", function() {
                var attachFile = new UploadFile({"viewData": {"type_upload": "all", "type_file": "2"}});
                attachFile.render();
                attachFile.on("success", function() {
                    var query_filter = self.model.get("query_filter");
                    self.get_image(query_filter);
                });
            });
            // self.$el.find("#btn_add_img_from_link").unbind("click").bind("click", function() {
            //     var dialogImportlink = new DialogImportImage();
            //     dialogImportlink.dialog();
            //     dialogImportlink.on("success", function() {
            //         var query_filter = self.model.get("query_filter");
            //         self.get_image(query_filter);
            //     });
            // });
        },
        render_media_body: function(file) {
            var self = this;
            var file_type = file.extname.substring(1).toLowerCase();
            var src_img = "file";
            if (file_type.includes("avi")) {
                src_img = "avi";
            }
            else if (file_type.includes("css")) {
                src_img = "css";
            }
            else if (file_type.includes("csv")) {
                src_img = "csv";
            }
            else if (file_type.includes("doc")) {
                src_img = "doc";
            }
            else if (file_type.includes("eml")) {
                src_img = "eml";
            }
            else if (file_type.includes("esp")) {
                src_img = "esp";
            }
            else if (file_type.includes("gif")) {
                src_img = "gif";
            }
            else if (file_type.includes("html")) {
                src_img = "html";
            }
            else if (file_type.includes("jpeg")) {
                src_img = "jpeg";
            }
            else if (file_type.includes("jpg")) {
                src_img = "jpg";
            }
            else if (file_type.includes("js")) {
                src_img = "js";
            }
            else if (file_type.includes("json")) {
                src_img = "json";
            }
            else if (file_type.includes("mov")) {
                src_img = "mov";
            }
            else if (file_type.includes("mp3")) {
                src_img = "mp3";
            }
            else if (file_type.includes("mp4")) {
                src_img = "mp4";
            }
            else if (file_type.includes("pdf")) {
                src_img = "pdf";
            }
            else if (file_type.includes("png")) {
                src_img = "png";
            }
            else if (file_type.includes("ppt")) {
                src_img = "ppt";
            }
            else if (file_type.includes("rar")) {
                src_img = "rar";
            }
            else if (file_type.includes("raw")) {
                src_img = "raw";
            }
            else if (file_type.includes("svg")) {
                src_img = "svg";
            }
            else if (file_type.includes("txt")) {
                src_img = "txt";
            }
            else if (file_type.includes("wav")) {
                src_img = "wav";
            }
            else if (file_type.includes("xls")) {
                src_img = "xls";
            }
            else if (file_type.includes("zip")) {
                src_img = "zip";
            }
            var time_upload = gonrinApp().convert_time_to_string(file.created_at);
            var file_name = file.name;
            self.$el.find(".list-item-media").append(`
                <div class="file-item" id="item_` + file.id + `">
                    <div class="file-item-ext">
                        <a href="javascript:;"><img style="width:50px;height:50px" src="static/images_template/image_file_icons/`+ src_img +`.png"></a>
                    </div>
                    <div class="file-item-info">
                        <h3 class="file-item-name">`+ file_name +`</h3>
                        <span class="meta-data">`+ time_upload +`</span>
                    </div>
                </div>
            `);
            self.$el.find("#item_" + file.id).unbind("click").bind("click", {file_id: file.id }, function(e) {
                var file_id = e.data.file_id;
                var file_data = self.objectFile[file_id];
                self.$el.find(".file-item").removeClass("m_selected");
                self.$el.find("#item_" + file_id).addClass("m_selected");
                self.$el.find(".m_info-container").html("");
                self.render_media_info(file_data);
            });
        },
        search_image: function() {
            var self = this;
            self.$el.find("#btn_search").unbind("click").bind("click", function() {
                var text_filter = self.$el.find("#search").val();
                if (text_filter !== null) {
                    var query_filter = self.model.get("query_filter");
                    query_filter["text_filter"] = text_filter;
                    self.model.set("query_filter", query_filter);
                    self.get_image(query_filter);
                }
            });
        },
        selectizePeople: function() {
            var self = this;
            var $selectize = self.$el.find('#selectize_people').selectize({
                maxItems: 1,
                valueField: 'id',
                labelField: 'hoten',
                searchField: ['hoten', 'tenkhongdau'],
                preload: true,
                placeholder: "Chọn người tải lên",
                
                load: function(query, callback) {
                    var url = (self.getApp().serviceURL || "") + '/api/v1/list-user' + (query ? "?text_filter=" + query : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            var obj = res.objects;
                            callback(obj);
                        }
                    });
                },
                
                onItemAdd: function(value, $item) {
                    var query_filter = {
                        "user_id": value
                    };
                    self.model.set("query_filter", query_filter);
                    self.get_image(query_filter);
                    self.$el.find("#img_me").prop( "checked", false );
                },
                onItemRemove: function(value) {
                    var query_filter = {
                        "user_id": null
                    };
                    self.model.set("query_filter", query_filter);
                    self.get_image(query_filter);
                    self.$el.find("#img_me").prop( "checked", false );
                }
            });
        },
        pagination: function(page, totalPages){
            var self = this;
            var element = self.$el.find(".pagination-container");
            var createId = function (prefix, pluginContainerId) {
                return prefix + pluginContainerId;
            };
            var containerId = element.attr("id"),
                nav_list_id = createId("nav_list_", containerId),
                nav_top_id = createId("top_", containerId),
                nav_prev_id = createId("prev_", containerId),
                navItemIdPrefix = createId("nav_item_", containerId) + "_",
                nav_next_id = createId("next_", containerId),
                nav_last_id = createId("last_", containerId),
                html = "",
                previousSelection, 
                currentSelection = page,
                selectorNavTop, selectorNavPrev, selectorNavPages, selectorNavNext, selectorNavLast,
                navListClass = "pagination justify-content-end";

            html += '<ul id="' + nav_list_id + '" class="' + navListClass + '">';
            html += '</ul>';

            element.html(html);
            previousSelection = null;
            currentSelection = page;
            self.changePage(containerId, previousSelection, currentSelection, true, false, page, totalPages);

            // click on go to top
            selectorNavTop = "#" + nav_top_id;
            element.off("click", selectorNavTop).on("click", selectorNavTop, function () {
                var previousSelection = page;
                page = 1;
                var currentSelection = page;
                self.changePage(containerId, previousSelection, currentSelection, true, true, page, totalPages);
            });

            // click on go to prev
            selectorNavPrev = "#" + nav_prev_id;
            element.off("click", selectorNavPrev).on("click", selectorNavPrev, function () {
                if (page > 1) {
                    var previousSelection = page;
                    page = parseInt(page) - 1;
                    var currentSelection = page;
                    var recreateNav = (element.data("nav_start") == previousSelection);
                    self.changePage(containerId, previousSelection, currentSelection, recreateNav, true, page, totalPages);
                }
            });

            // click on go to next
            selectorNavNext = "#" + nav_next_id;
            element.off("click", selectorNavNext).on("click", selectorNavNext, function () {
                if (page < totalPages) {
                    var previousSelection = page;
                    page = parseInt(page) + 1;
                    var currentSelection = page;
                    var recreateNav = (element.data("nav_end") == previousSelection);
                    self.changePage(containerId, previousSelection, currentSelection, recreateNav, true, page, totalPages);
                }
            });

            // click on go to last
            selectorNavLast = "#" + nav_last_id;
            element.off("click", selectorNavLast).on("click", selectorNavLast, function () {
                var previousSelection = page;
                page = parseInt(totalPages);
                var currentSelection = page;
                self.changePage(containerId, previousSelection, currentSelection, true, true, page, totalPages);
            });

            // click on nav page item
            selectorNavPages = '[id^="' + navItemIdPrefix + '"]';
            element.off("click", selectorNavPages).on("click", selectorNavPages, function (event) {
                var previousSelection = page;
                var len = navItemIdPrefix.length;
                page = parseInt($(event.target).attr("id").substr(len));
                var currentSelection = page;
                self.changePage(containerId, previousSelection, currentSelection, false, true, page, totalPages);
            });
        },
        changePage: function(containerId, previousSelection, currentSelection, updateNavItems, triggerChangePage, page, totalPages){
            var self = this;
            var element = self.$el.find(".pagination-container");
            var createId = function (prefix, pluginContainerId) {
                return prefix + pluginContainerId;
            };
            var navItemIdPrefix = createId("nav_item_", containerId) + "_",
                navListActiveItemClass = "active";

            if (updateNavItems) {
                var nav_list_id = createId("nav_list_", containerId),
                    nav_top_id = createId("top_", containerId),
                    nav_prev_id = createId("prev_", containerId),
                    nav_next_id = createId("next_", containerId),
                    nav_last_id = createId("last_", containerId),
                    pageLinks = 3,
                    go_top_text = '&laquo;',
                    go_prev_text ='&larr;',
                    go_next_text ='&rarr;',
                    go_last_text = '&raquo;',
                    pageClass = "page-item",
                    linkClass = "page-link",
                    elem_nav_list = element.find("#" + nav_list_id),
                    nav_html = "",
                    nav_start = parseInt(page),
                    nav_end,
                    mod, offset, totalSections,
                    nav_url = "javascript:void(0);";

                // navigation pages numbers
                if (totalPages < pageLinks) {
                    nav_start = 1;
                    nav_end = totalPages;
                } 
                else {
                    totalSections = Math.ceil(totalPages / pageLinks);
                    if (nav_start > pageLinks * (totalSections - 1)) {
                        nav_start = totalPages - pageLinks + 1;
                    } 
                    else {
                        mod = nav_start % pageLinks;
                        offset = mod == 0 ? - pageLinks + 1 : -mod + 1;
                        nav_start += offset;
                    }
                    nav_end = nav_start + pageLinks - 1;
                }

                // store nav_start nav_end
                element.data("nav_start", nav_start);
                element.data("nav_end", nav_end);

                // create nav pages html -----------------------------------------------
                // show - hide backward nav controls
                if (nav_start > 1) {
                    nav_html += '<li class="' + pageClass + '"><a class="' + linkClass + '" id="' + nav_top_id + '" href="' + nav_url + '">' + go_top_text + '</a></li>';
                    nav_html += '<li class="' + pageClass + '"><a class="' + linkClass + '" id="' + nav_prev_id + '" href="' + nav_url + '">' + go_prev_text + '</a></li>';
                }
                  // show nav pages
                for (var i = nav_start; i <= nav_end; i++) {
                    nav_html += '<li class="' + pageClass + '"><a class="' + linkClass + '" id="' + navItemIdPrefix + i + '" href="' + nav_url + '">' + i + '</a></li>';
                }
                  // show - hide forward nav controls
                if (nav_end < totalPages) {
                    nav_html += '<li class="' + pageClass + '"><a class="' + linkClass + '" id="' + nav_next_id + '" href="' + nav_url + '">' + go_next_text + '</a></li>';
                    nav_html += '<li class="' + pageClass + '"><a class="' + linkClass + '" id="' + nav_last_id + '" href="' + nav_url + '">' + go_last_text + '</a></li>';
                }
                elem_nav_list.html(nav_html);
                // elem_nav_list.attr("unselectable", "on").css("user-select", "none").on("selectstart", false);
            }

            // retrieve options
            var prev_elem = element.find("#" + navItemIdPrefix + previousSelection),
            current_elem = element.find("#" + navItemIdPrefix + currentSelection);

            // change selected page, applying appropriate styles
            prev_elem.closest("li").removeClass(navListActiveItemClass);
            current_elem.closest("li").addClass(navListActiveItemClass);


            // update title
            var active_title = "Page " + currentSelection + " of " + totalPages;
            prev_elem.prop("title", "");
            current_elem.prop("title", active_title);

            // trigger event onChangePage (only after some link pressed, not on plugin load)
            if (triggerChangePage) {
                var query_filter = self.model.get("query_filter");
                self.get_image(query_filter, page, false);
            } 
        },
        get_image: function(query_filter, page = 1, load_first = true) {
            var self = this;
            var user_id = query_filter.user_id,
                text_filter = query_filter.text_filter;
            var domain = gonrinApp().serviceURL,
                path_api = "/api/v1/current_user";
            var url = gonrinApp().serviceURL + '/api/v1/get-list-file' + '?page=' + page + '&results_per_page=18' + (!!user_id? "&user_id=" + user_id: "") + (!!text_filter? "&text_filter=" + text_filter: "") + "&type_file=2";
            $.ajax({
                url: url,
                method: "GET",
                contentType: "application/json",
                success: function(obj) {
                    self.$el.find(".list-item-media").html("");
                    self.$el.find(".m_info-container").html("");
                    var list_img = obj.objects;
                    self.objectFile = {};
                    if (list_img instanceof Array && list_img.length > 0) {
                        self.$el.find(".m_notify").addClass("d-none");
                        self.$el.find(".m_info-container").removeClass("d-none");
                        for (var i = 0; i < list_img.length; i++) {
                            self.objectFile[list_img[i].id] = list_img[i];
                        }
                        for (var key in self.objectFile) {
                            if (self.objectFile.hasOwnProperty(key)) {
                                self.render_media_body(self.objectFile[key]);
                            }
                        }
                        self.$el.find("#item_" + list_img[0].id).addClass("m_selected");
                        self.render_media_info(list_img[0]);
                        if (load_first) {
                            self.pagination(obj.page, obj.total_pages);
                        }
                    }
                    else {
                        if (load_first) {
                            self.$el.find(".pagination-container").html("");
                        }
                        self.$el.find(".m_notify").removeClass("d-none");
                        self.$el.find(".m_info-container").addClass("d-none");
                    }
                },
                error: function(xhr, status, error) {
                    try {
                        if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED") {
                            self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                            self.getApp().getRouter().navigate("login");
                        } else {
                            self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                        }
                    } catch (err) {
                        self.getApp().notify({ message: "Lỗi truy cập dữ liệu, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
                    }
                },
            });
        }
    });
});