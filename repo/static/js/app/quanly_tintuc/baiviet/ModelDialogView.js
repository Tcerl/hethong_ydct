define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template = require('text!app/quanly_tintuc/baiviet/tpl/model_dialog.html');    
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
							this.close()
						}
					},
    	    	]
    	    },
            {
                name: "save",
                type: "button",
                buttonClass: "btn-success width-sm ml-2",
                label: `<i class="far fa-save"></i> Lưu`,
                command: function() {
                    var self = this;
                    var list_post = self.model.get("related_news");
                    if (list_post instanceof Array && list_post.length > 0) {
                        self.getApp().notify("Chọn tin liên quan thành công!");
                    }
                    else {
                        self.getApp().notify({ message: "Chưa chọn tin liên quan" }, { type: "danger", delay: 1000 });
                    }
                    self.trigger("savePost", list_post);
                    self.close();
                }
            },
        ],
        current_page: 1,
        current_list_page: [],
    	render: function() {
            var self = this;
            self.current_page = 1;
            self.current_list_page = [];
            var curUser = self.getApp().currentUser;
            if (curUser) {
                self.applyBindings();
                var related_news = self.viewData.related_news;
                if (related_news instanceof Array && related_news.length > 0) {
                    self.$el.find("#text_selected").text(related_news.length);
                    self.model.set("related_news", related_news);
                    var data = JSON.stringify({
                        data: related_news,
                        donvi_id: curUser.donvi_id
                    });
                    var url = self.getApp().serviceURL + '/api/v1/related-news';
                    $.ajax({
                        url: url,
                        type: 'POST',
                        data: data,
                        headers: {
                            'content-type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        dataType: 'json',
                        success: function(data) {
                            var list_related_news = data.related_news;
                            if (list_related_news instanceof Array && list_related_news.length > 0) {
                                for (var i = 0; i < list_related_news.length; i++) {
                                    self.renderPostAdded(list_related_news[i]);
                                }
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
                                self.getApp().notify({ message: "Có lỗi xảy ra, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
                            }
                        }
                    });
                }
                self.selectizeCategory();
                self.search();
                var id = self.getApp().getRouter().getParam("id");
                var query_filter = {
                    "filters": {
                        "$and": [
                            {"status": {"$eq": 6}},
                            {"deleted": {"$eq": false}}
                        ]
                    },
                    "order_by": [{ "field": "publish_time", "direction": "desc" }]
                };
                if (id) {
                    query_filter["filters"]["$and"].push({"id": {"$neq": id}});
                }
                self.model.set("query_filter", query_filter);
                self.get_list_post(query_filter);
                return this;
            }
        },
        selectizeCategory: function() {
            var self = this;
            var $selectize = self.$el.find('#selectize_category').selectize({
                maxItems: 1,
                valueField: 'id',
                labelField: 'name',
                searchField: ['name', 'unsigned_name'],
                preload: true,
                placeholder: "Chọn chuyên mục",
                load: function(query, callback) {
                    var url = (self.getApp().serviceURL || "") + '/api/v1/get-list-category?donvi_id=' + gonrinApp().currentUser.donvi_id + (query ? "&text_filter=" + query : "");
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
                render: {
                    option: function (item, escape) {
						if (!!item && !!item.cate_parent_id) {
							return '<div class=" px-2 border-bottom">'
                            + '<h5 class="px-3 ">' + item.name + '</h5>'
                            + '</div>';
						}
						else {
                            return '<div class=" px-2 border-bottom">'
                            + '<h5 class="py-0 font-weight-400 ">'  + item.name + '</h5>'
                            + '</div>';
                        }
                    }
                },
                onItemAdd: function(value, $item) {
                    self.model.set({
                        "category_id": value
                    })
                },
                onItemRemove: function(value) {
                    self.model.set({
                        "category_id": null
                    })
                }
            });
        },
        search: function(){
            var self = this;
            self.$el.find("#btn_search").unbind("click").bind("click", function() { 
                var text = self.$el.find("#search").val().trim();
                var category_id = self.model.get("category_id");
                var id = self.getApp().getRouter().getParam("id");
                var query_filter = {
                    "filters": {
                        "$and": [
                            {"status": {"$eq": 6}},
                            {"deleted": {"$eq": false}}
                        ]
                    },
                    "order_by": [{ "field": "publish_time", "direction": "desc" }]
                };
               
                if (id) {
                    query_filter["filters"]["$and"].push({"id": {"$neq": id}});
                }
                if (category_id != "" && category_id != null && category_id != undefined) {
                    query_filter["filters"]["$and"].push({"category_id": {"$eq": category_id}});
                }
                if (text != "" && text != null && text != undefined) {
                    query_filter["filters"]["$and"].push({"unsigned_title": { "$likeI": gonrinApp().removeVietnameseTones(text) } });
                }
                self.model.set("query_filter", query_filter);
                self.get_list_post(query_filter);
            });
        },
        renderHtmlPost: function(post){
            var self = this;
            self.$el.find("#list_post").append(`
            <li class="post">
                <div class="post_img">
                    <input type="checkbox" id="checkbox_` + post.id + `">
                    <img src="`+ post.image_thumbnail_url + `" alt="img">
                </div>
                <div class="post_content">
                    <h5 id="post_` + post.id + `">` + post.title + `</h5>
                    <ul class="post_details simple">
                        <li class="category">` + post.category_name + `</li>
                        <li class="date">` + post.publish_time + `</li>
                    </ul>
                </div>
            </li>
            `);
            var related_news = self.model.get("related_news");
            if (related_news instanceof Array && related_news.length > 0) {
                if(related_news.some(checkPost)){
                    self.$el.find('#checkbox_' + post.id).prop('checked', true);
                }
                function checkPost(item) {
                    return item == post.id;
                }
            }
            self.insertPost(post);
        },
        insertPost: function(post) {
            var self = this;
            self.$el.find("#checkbox_" + post.id).unbind("click").bind("click", function(){
                if(self.$el.find("#checkbox_" + post.id).is(":checked")) {
                    var related_news = self.model.get("related_news");
                    if (related_news == null || related_news == undefined || !(related_news instanceof Array)) {
                        related_news = [];
                    }
                    related_news.push(post.id);
                    self.$el.find("#text_selected").text(related_news.length);
                    self.model.set("related_news", related_news);
                    self.renderPostAdded(post);
                }
                else {
                    self.$el.find("#insert_" + post.id).remove();
                    self.deletePost(post);
                }
            });

            self.$el.find("#post_" + post.id).unbind("click").bind("click", function(){
                if(self.$el.find("#checkbox_" + post.id).is(":checked")) {
                    self.$el.find('#checkbox_' + post.id).prop('checked', false);
                    self.$el.find("#insert_" + post.id).remove();
                    self.deletePost(post);
                }
                else {
                    self.$el.find('#checkbox_' + post.id).prop('checked', true);
                    var related_news = self.model.get("related_news");
                    if (related_news == null || related_news == undefined || !(related_news instanceof Array)) {
                        related_news = [];
                    }
                    related_news.push(post.id);
                    self.$el.find("#text_selected").text(related_news.length);
                    self.model.set("related_news", related_news);
                    self.renderPostAdded(post);
                }
            });
        },
        renderPostAdded: function(post) {
            var self = this;
            self.$el.find("#div_post_added").append(`<div class="list_post_added" id="insert_` + post.id + `"><p style="margin-bottom:5px;">` + post.title + `</p><span class="custom_close text-danger" id="delete_` + post.id + `" title="Xóa">&times;</span></div>`);
            self.$el.find("#delete_" + post.id).unbind("click").bind("click", function(){
                self.$el.find("#insert_" + post.id).remove();
                self.$el.find('#checkbox_' + post.id).prop('checked', false);
                self.deletePost(post);
            });
        },
        deletePost: function(post) {
            var self = this;
            self.$el.find("#check_all").prop('checked', false);
            var related_news = self.model.get("related_news");
            if (related_news instanceof Array && related_news.length > 0) {
                var array_related_news = related_news.filter(function(post_id) {
                    if (post_id != post.id) {
                        return post_id;
                    }
                })
                self.$el.find("#text_selected").text(array_related_news.length);
                self.model.set("related_news", array_related_news);
                return;
            }
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
                self.get_list_post(query_filter, page, false);
            } 
        },
        get_list_post: function(query_filter, page = 1, load_first = true) {
            var self =this;
            var url = (self.getApp().serviceURL || "") + '/api/v1/get-related-news?page=' + String(page) + '&results_per_page=5' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
            $.ajax({
                url: url,
                method: "GET",
                contentType: "application/json",
                success: function(obj) {
                    self.$el.find("#list_post").html("");
                    var list_post = obj.objects;
                    self.current_list_page = list_post;
                    self.current_page = obj.page;
                    if (list_post instanceof Array && list_post.length > 0) {
                        for (var i = 0; i < list_post.length; i++) {
                            self.renderHtmlPost(list_post[i]);
                        }
                        if (load_first) {
                            self.pagination(obj.page, obj.total_pages);
                        }
                    }
                    else {
                        self.$el.find("#list_post").html("Không có dữ liệu");
                    }
                    self.eventSelectAll();
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
        },
        eventSelectAll: function() {
            var self = this;
            self.$el.find("#check_all").unbind("click").bind("click", function(e) {
                var related_news = self.model.get("related_news"),
                    current_list_page = self.current_list_page;
                if (related_news == null || related_news == undefined || !(related_news instanceof Array)) {
                    related_news = [];
                }
                if (self.$el.find("#check_all").is(":checked")) {
                    current_list_page.forEach((post, index) => {
                        self.$el.find('#checkbox_' + post.id).prop('checked', true);
                        if (related_news.includes(post.id) == false) {
                            related_news.push(post.id);
                            self.renderPostAdded(post);
                        }
                    });
                    self.$el.find("#text_selected").text(related_news.length);
                    self.model.set("related_news", related_news);
                } else {
                    current_list_page.forEach((post, index) => {
                        self.$el.find('#checkbox_' + post.id).prop('checked', true);
                        if (related_news.includes(post.id)) {
                            self.$el.find('#checkbox_' + post.id).prop('checked', false);
                            self.$el.find("#insert_" + post.id).remove();
                            self.deletePost(post);
                        }
                    });
                }
            });
            self.$el.find("#check_all").prop('checked', false);
        }
    });

});