define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/quanly_tintuc/baiviet/tpl/model.html'),
        schema = require('json!schema/PostSchema.json');

    var ModelDialogView = require('app/quanly_tintuc/baiviet/ModelDialogView'),
        DialogBoxRelatedNews = require('app/quanly_tintuc/baiviet/DialogBoxRelatedNews'),
        DialogRelatedOneNews = require('app/quanly_tintuc/baiviet/DialogRelatedOneNews'),
        DialogChooseType = require('app/quanly_tintuc/baiviet/DialogChooseType'),
        DialogManageImage = require('app/quanly_file/quanly_image/ModelDialogView'),
        DialogAvatar = require('app/quanly_tintuc/baiviet/DialogAvatar/ModelDialogView'),
        HistoryDialog = require("app/quanly_tintuc/baiviet/HistoryCollectionDialogView"),
        DialogCropImage = require('app/quanly_tintuc/baiviet/DialogAvatar/crop_image/ModelDialogView'),
        DialogCrawlData = require('app/quanly_tintuc/baiviet/DialogCrawlData/ModelDialogView'),
        DialogEditImage = require("app/quanly_file/quanly_image/edit_image/ModelDialogView"),
        DialogMucLuc = require("app/quanly_tintuc/baiviet/DialogMucLuc/ModelDialogView"),
        DialogAttachFile = require("app/quanly_tintuc/baiviet/DialogAttachFile/ModelDialogView"); 
    // var DialogManageComment = require("app/quanly_tintuc/baiviet/DialogManageComment/CollectionDialogView");
    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "post",
        hasChange: false,
        uiControl: {
            fields: [
                {
                    field: "allow_send_notify",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: true, text: "Gửi thông báo" },
                        { value: false, text: "Không cho phép gửi" }
                    ],
                    value: false
                },
                {
                    field: "is_show_avatar",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: true, text: "Hiển thị" },
                        { value: false, text: "Ẩn" }
                    ],
                }, 
                {
                    field: "style_display",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: 0, text: "SIZE M" },
                        { value: 1, text: "SIZE L" },
                        { value: 2, text: "MAGAZINE" },
                        { value: 3, text: "INFOGRAPHIC" },
                        { value: 4, text: "VIDEO TỰ CHẠY" },
                        { value: 5, text: "BÀI HỎI ĐÁP" }
                    ],
                }, 
                {
                    field: "is_show_icon",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: true, text: "Hiển thị" },
                        { value: false, text: "Ẩn" }
                    ],
                }, 
                {
					field:"publish_time",
					uicontrol:"datetimepicker",
					format:"DD/MM/YYYY",
					textFormat:"DD/MM/YYYY",
					extraFormats:["DDMMYYYY"],
                    cssClass: "ml-datetimepicker",
                    parseInputDate: function(val){
						return gonrinApp().parseDate(val);
					},
					parseOutputDate: function(date){
						return date.unix();
					},
					disabledComponentButton: true
				},
                {
                    field: "is_post_video",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: true, text: "Có" },
                        { value: false, text: "Không" }
                    ],
                }, 
                {
                    field: "is_sensitive",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: true, text: "Có nhạy cảm" },
                        { value: false, text: "Không nhạy cảm" }
                    ],
                }, 
                {
                    field: "show_suggestion",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: 0, text: "Tin thông thường" },
                        { value: 1, text: "Tin tiêu điểm" }
                    ],
                }, 
                {
                    field: "is_show",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: 1, text: "Hiện" },
                        { value: 0, text: "Ẩn" }
                    ],
                },
                {
                    field: "is_highlights_home",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: true, text: "Có" },
                        { value: false, text: "Không" }
                    ],
                }, 
                {
                    field: "is_highlights_category",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: true, text: "Có" },
                        { value: false, text: "Không" }
                    ],
                }, 
                {
                    field: "is_post_pr",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: true, text: "Có" },
                        { value: false, text: "Không" }
                    ],
                }, 
                {
                    field: "is_highlights_category",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: true, text: "Có" },
                        { value: false, text: "Không" }
                    ],
                },
                {
                    field: "show_comment",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: true, text: "Có" },
                        { value: false, text: "Không" }
                    ],
                }, 
                {
                    field: "allowed_comment",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: true, text: "Có" },
                        { value: false, text: "Không" }
                    ],
                }, 
                {
                    field: "allow_show_advertisement",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: true, text: "Có" },
                        { value: false, text: "Không" }
                    ],
                }, 
                {
					field: "default_path",
					uicontrol: "checkbox",
					textField: "text",
					valueField: "value",
					checkedField: "name",
					cssClassField: "cssClass",
					text: "Đường dẫn mặc định theo tiêu đề",
					dataSource: [
						{name: true, value: true, text: "Có" },
						{name: false, value: false, text: "Không"},
				   	],
				},
            ]
        },
        tools: [{
                name: "back",
                type: "button",
                buttonClass: "btn-secondary waves-effect width-sm",
                label: "<i class='fas fa-arrow-circle-left'></i> Quay lại",
                command: function(){
                    Backbone.history.history.back();
                }
            },
            {
                name: "temp-save",
                type: "button",
                buttonClass: "waves-effect width-sm ml-2 btn-temp-save d-none",
                label: '<i class="far fa-save"></i> Lưu tạm',
                visible: function() {
					var currentUser = gonrinApp().currentUser;
					return (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
				},
                command: function() {
                    var self = this;
                    const status = 0;
                    self.saveData(status);  
                }
            },
            {
                name: "send",
                type: "button",
                buttonClass: "btn-info waves-effect width-sm ml-2 btn-send d-none",
                label: '<i class="fas fa-paper-plane"></i> Lưu & Gửi bài',
                visible: function() {
					var currentUser = gonrinApp().currentUser;
					return (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
				},
                command: function() {
                    var self = this;
                    const status = 1;
                    self.saveData(status);
                }
            },
            {
                name: "accept",
                type: "button",
                buttonClass: "btn-primary ml-2 btn-accept d-none",
                label: "<i class='fas fa-check'></i> Nhận bài",
                visible: function() {
                    if (this.getApp().hasRole('admin_donvi') || this.getApp().hasRole('canbo')) {
						var currentUser = gonrinApp().currentUser;
					    return (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
					}
                },
                command: function() {
                    var self = this;
                    self.changeStatus(2);
                }
            },
            {
                name: "save",
                type: "button",
                buttonClass: "ml-2 btn-save d-none",
                label: '<i class="far fa-save"></i> Lưu',
                visible: function() {
                    if (this.getApp().hasRole('admin_donvi') || this.getApp().hasRole('canbo')) {
						var currentUser = gonrinApp().currentUser;
					    return (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
					}
                },
                command: function() {
                    var self = this;
                    const status = 3;
                    self.saveData(status);
                }
            },
            {
                name: "return",
                type: "button",
                buttonClass: "ml-2 btn-return d-none",
                label: "<i class='fas fa-undo'></i> Trả bài",
                visible: function() {
                    if (this.getApp().hasRole('admin_donvi') || this.getApp().hasRole('canbo')) {
						var currentUser = gonrinApp().currentUser;
					    return (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
					}
                },
                command: function() {
                    var self = this;
                    self.changeStatus(4);
                }
            },
            {
                name: "publish",
                type: "button",
                buttonClass: "btn-success ml-2 btn-save-publish d-none",
                label: "<i class='fas fa-upload'></i> Lưu & Đăng bài",
                visible: function() {
                    if (this.getApp().hasRole('admin_donvi') || this.getApp().hasRole('canbo')) {
						var currentUser = gonrinApp().currentUser;
					    return (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
					}
                },
                command: function() {
                    var self = this;
                    const status = 6;
                    self.saveData(status);
                }
            },
            {
                name: "edit_post",
                type: "button",
                buttonClass: "ml-2 btn-primary btn-edit d-none",
                label: "<i class='far fa-edit'></i> Sửa bài",
                visible: function() {
                    if (this.getApp().hasRole('admin_donvi') || this.getApp().hasRole('canbo')) {
						var currentUser = gonrinApp().currentUser;
					    return (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
					}
                },
                command: function() {
                    var self = this;
                    self.changeStatus(3);
                }
            },
            {
                name: "publish",
                type: "button",
                buttonClass: "btn-success ml-2 btn-publish d-none",
                label: "<i class='fas fa-upload'></i> Đăng bài",
                visible: function() {
                    if (this.getApp().hasRole('admin_donvi') || this.getApp().hasRole('canbo')) {
						var currentUser = gonrinApp().currentUser;
					    return (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
					}
                },
                command: function() {
                    var self = this;
                    self.changeStatus(6);
                }
            },
            {
                name: "cancel",
                type: "button",
                buttonClass: "ml-2 btn-cancel d-none",
                label: "<i class='far fa-window-close'></i> Gỡ bài",
                visible: function() {
                    if (this.getApp().hasRole('admin_donvi') || this.getApp().hasRole('canbo')) {
						var currentUser = gonrinApp().currentUser;
					    return (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
					}
                },
                command: function() {
                    var self = this;
                    self.changeStatus(5);
                }
            },
            {
                name: "restore",
                type: "button",
                buttonClass: "btn-primary ml-2 btn-restore d-none",
                label: "<i class='fas fa-trash-undo'></i> Phục hồi",
                visible: function() {
					var currentUser = gonrinApp().currentUser;
					return (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
				},
                command: function() {
                    var self = this;
                    self.changeStatus(0);
                }
            },
            {
                name: "history",
                type: "button",
                buttonClass: "ml-2 btn-info",
                label: "<i class='fas fa-history'></i> Lịch sử",
                visible: function() {
                    if (this.getApp().hasRole('admin_donvi') || this.getApp().hasRole('canbo')) {
						var currentUser = gonrinApp().currentUser;
					    return (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
					}
                },
                command: function() {
                    var self = this;
                    self.viewHistory();
                }
            },
            // {
            //     name: "comment",
            //     type: "button",
            //     buttonClass: "ml-2 btn-info",
            //     label: "<i class='fas fa-comment'></i> Bình luận",
            //     visible: function() {
            //         if (this.getApp().hasRole('admin') || this.getApp().hasRole('admin_donvi') || this.getApp().hasRole('canbo')) {
			// 			return true;
			// 		}
            //     },
            //     command: function() {
            //         var self = this;
            //         self.manageComment();

            //     }
            // },
            {
                name: "delete",
                type: "button",
                buttonClass: "btn-danger btn-del ml-2 d-none",
                label: `<i class="fas fa-trash-alt"></i> Xóa`,
                visible: function() {
					var currentUser = gonrinApp().currentUser;
					return (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
				},
                command: function() {
                    var self = this;
                    self.changeStatus(7);
                }
            },
        ],
        loadcss: function(url) {
        	if (!$("link[href='"+url+"']").length){
        		var link = document.createElement("link");
                link.type = "text/css";
                link.rel = "stylesheet";
                link.href = url;
                document.getElementsByTagName("head")[0].appendChild(link);
        	}
        },
        status_post_publish: null,
        donvi_id_filter: null,
        render: function() {
            var self = this;
            self.donvi_id_filter = null;
            self.status_post_publish = null;
            var currentUser = self.getApp().currentUser;
            if (currentUser === undefined || currentUser === null) {
                self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                self.getApp().getRouter().navigate("login");
                return false;
            }
            self.loadcss(self.getApp().staticURL + "css/styles_post.css");
            var screen_width = $(window).width();
            if (screen_width < 500) {
                self.$el.find("#custom_editor").addClass("d-none");
                self.$el.find(".right-sidenav").addClass("d-none");
                self.$el.find("#closebtn_left").unbind("click").bind("click", function() {
                    self.$el.find("#closebtn_left").addClass("d-none");
                    self.$el.find("#left_nav").removeClass("d-none");
                    self.$el.find(".left-sidenav").width("12%");
                    self.$el.find("#content_left").addClass("d-none");
                    self.$el.find("#custom_editor").removeClass("d-none");
                    self.$el.find(".right-sidenav").removeClass("d-none");
                    self.$el.find(".right-sidenav").width("12%");
                    self.$el.find("#right_side_ext").addClass("d-none");
                });
                self.$el.find("#left_nav").unbind("click").bind("click", function() {
                    self.$el.find(".left-sidenav").width("100%");
                    self.$el.find("#custom_editor").addClass("d-none");
                    self.$el.find(".right-sidenav").addClass("d-none");
                    self.$el.find("#closebtn_left").removeClass("d-none");
                    self.$el.find("#left_nav").addClass("d-none");
                    self.$el.find("#content_left").removeClass("d-none");
                });
                self.$el.find("#right_nav").unbind("click").bind("click", function() {
                    var right_nav_width = self.$el.find(".right-sidenav").width();
                    if (right_nav_width < "60") {
                        self.$el.find("#right_side_ext").removeClass("d-none");
                        self.$el.find(".right-sidenav").width("93%");
                        self.$el.find("#custom_editor").addClass("d-none");
                        self.$el.find(".left-sidenav").addClass("d-none");
                    }
                    else {
                        self.$el.find("#right_side_ext").addClass("d-none");
                        self.$el.find(".right-sidenav").width("12%");
                        self.$el.find("#custom_editor").removeClass("d-none");
                        self.$el.find(".left-sidenav").removeClass("d-none");
                    }
                });
                self.$el.find(".closebtn-right").unbind("click").bind("click", function() {
                    //chinhnv_review: chuyển thành self.$el.find
                    self.$el.find("#right_side_ext").addClass("d-none");
                    self.$el.find(".right-sidenav").width("12%");
                    self.$el.find("#custom_editor").removeClass("d-none");
                    self.$el.find(".left-sidenav").removeClass("d-none");
                });
            }
            else {
                self.$el.find("#left_nav").unbind("click").bind("click", function() {
                    self.$el.find(".left-sidenav").width("420px");
                    if (screen_width < 1600 && screen_width >= 1370){
                        self.$el.find(".left-sidenav").width("340px");
                    }
                    else if (screen_width < 1370){
                        self.$el.find(".left-sidenav").width("275px");
                        self.$el.find("#custom_editor").width("640px");
                    }
                    self.$el.find("#closebtn_left").removeClass("d-none");
                    self.$el.find("#left_nav").addClass("d-none");
                    self.$el.find("#content_left").removeClass("d-none");
                });
                self.$el.find("#closebtn_left").unbind("click").bind("click", function() {
                    self.$el.find("#closebtn_left").addClass("d-none");
                    self.$el.find("#left_nav").removeClass("d-none");
                    self.$el.find(".left-sidenav").width("60px");
                    self.$el.find("#content_left").addClass("d-none");
                });
            
                self.$el.find("#right_nav").unbind("click").bind("click", function() {
                    var right_nav_width = self.$el.find(".right-sidenav").width();
                    if (right_nav_width == "60") {
                        self.$el.find("#right_side_ext").removeClass("d-none");
                        self.$el.find(".right-sidenav").width("420px");
                        if (screen_width < 1600 && screen_width >= 1370){
                            self.$el.find(".right-sidenav").width("340px");
                        }
                        else if (screen_width < 1370){
                            self.$el.find(".right-sidenav").width("275px");
                            self.$el.find("#right_side_ext").width("240px");
                            self.$el.find("#right_side").width("45px");
                            self.$el.find("#custom_editor").width("640px");
                        }
                    }
                    else {
                        self.$el.find("#right_side_ext").addClass("d-none");
                        self.$el.find(".right-sidenav").width("60px");
                    }
                });
                self.$el.find(".closebtn-right").unbind("click").bind("click", function() {
                    self.$el.find("#right_side_ext").addClass("d-none");
                    self.$el.find(".right-sidenav").width("60px");
                });
            }
            
            self.$el.find(".input-group-addon-custom").click(function(e){
                // Have to stop propagation here
                e.stopPropagation();
                self.$el.find(".clockpicker").clockpicker('show').clockpicker('toggleView', 'hours');
            });

            self.$el.find("#title_info").unbind("click").bind("click", function() {
                self.$el.find("#content_info").toggleClass("d-none");
            });

            self.$el.find("#title_setting").unbind("click").bind("click", function() {
                self.$el.find("#content_setting").toggleClass("d-none");
            });
            
            self.$el.find("#title_seo").unbind("click").bind("click", function() {
                self.$el.find("#content_seo").toggleClass("d-none");
            });
            self.$el.find("#title_notify").unbind("click").bind("click", function() {
                self.$el.find("#content_notify").toggleClass("d-none");
            });
            
            if (self.getApp().project_name == "TINTUC_SO_BMTE") {
                self.$el.find(".crawl-data").removeClass("d-none");
                self.$el.find("#avatar_vuong").removeClass("d-none");
                if (self.getApp().hasRole("btv")) {
                    self.$el.find("#allow_send_notify").prop('disabled', true);
                }
            }
            else {
                self.$el.find(".crawl-data").remove();
                self.$el.find("#avatar_vuong").remove();
                self.$el.find("#notify_post").remove();
            }

            var id = self.getApp().getRouter().getParam("id");
            
            if (id) {
                var url = (self.getApp().serviceURL || "") + '/api/v1/post/' + id;
                var mode = self.getApp().getRouter().getParam("mode");
                if (mode == "publish") {
                    url = (self.getApp().serviceURL || "") + '/api/v1/post_publish/' + id;
                }
                $.ajax({
                    url: url,
                    method: 'GET',
                    dataType: "json",
                    contentType: "application/json",
                    success: function(data, res) {
                        self.model.set(data);
                        self.applyBindings();
                        self.initEditor();
                        self.donvi_id_filter = self.model.get("donvi_id");
                        self.status_post_publish = data.status_post_publish;
                        self.renderButton();
                        var hour_time = self.model.get("hour_time");
                        if (hour_time) {
                            self.$el.find("#hour_time").val(hour_time);
                        }
                        self.previewSeoGoogle();
                        var title = self.model.get("title");
                        self.$el.find("#title").val(title);
                        var description = self.model.get("description");
                        self.$el.find("#description").val(description);
                      
                        var title_google = self.model.get("title_google");
                        self.$el.find("#title_google").val(title_google);
                       
                        var description_google = self.model.get("description_google");
                        self.$el.find("#description_google").val(description_google);
                      
                        self.eventKeyup();
                        self.renderRelatedNews();
                        
                        self.$el.find(".clockpicker").clockpicker();
                        self.selectizeTags();
                        self.selectizeTagsSearch();
                        self.render_avatar(self.model.get("image_thumbnail"), "image_thumbnail");
                        self.upload_avatar("image_thumbnail", "avatar_thuong");
                        self.remove_avatar("image_thumbnail");
                        self.selectizeCategory();
                        self.selectizeRelatedCategory(); 
                        if (self.getApp().project_name == "TINTUC_SO_BMTE") {
                            self.crawl_data();

                            self.render_avatar(self.model.get("avatar_vuong"), "avatar_vuong");
                            self.upload_avatar("avatar_vuong", "avatar_vuong");
                            self.remove_avatar("avatar_vuong");

                            self.getAgeGroup();
                            self.selectizeTinhThanh();
                            self.selectizeQuanHuyen();
                            self.selectizeXaPhuong();
                            self.controlSelectize();
                        }
                        self.selectizeAuthor();
                        self.btn_related_news();  
                        self.changeShowComment();
                        self.$el.find("#btn_copy_link").unbind('click').bind('click', function() {
                            if (self.model.get("status") == 6) {
                                var url_news = self.getApp().domain_url_news + '/detail/' + self.model.get("path");
                                var tempInput = document.createElement("input");
                                tempInput.style = "position: absolute; left: -1000px; top: -1000px";
                                tempInput.value = url_news;
                                document.body.appendChild(tempInput);
                                tempInput.select();
                                document.execCommand("copy");
                                document.body.removeChild(tempInput);
                                self.getApp().notify("Đã sao chép đường dẫn liên kết bài viết vào bảng nhớ tạm");
                            }
                        })
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
                self.applyBindings();
                self.initEditor();
                self.donvi_id_filter = currentUser.donvi_id;
                self.eventKeyup();
                self.$el.find(".btn-temp-save").removeClass('d-none');
                self.$el.find(".btn-send").removeClass('d-none');
                self.$el.find(".clockpicker").clockpicker(); 
                self.selectizeTags();
                self.selectizeTagsSearch();
                self.selectizeCategory();
                self.selectizeRelatedCategory();
                self.model.set("priority", 10);
                self.upload_avatar("image_thumbnail", "avatar_thuong");
                self.remove_avatar("image_thumbnail");
                if (self.getApp().project_name == "TINTUC_SO_BMTE") {
                    self.crawl_data();
                    self.upload_avatar("avatar_vuong", "avatar_vuong");
                    self.remove_avatar("avatar_vuong");
                    self.getAgeGroup();
                    self.selectizeTinhThanh();
                    self.selectizeQuanHuyen();
                    self.selectizeXaPhuong();
                    self.controlSelectize(); 
                }
                self.selectizeAuthor();
                self.btn_related_news();
                self.changeShowComment();
            }
        },
        renderButton: function() {
            var self = this;
            self.$el.find("#title_page").text("Chi tiết bài viết");
            self.$el.find(".btn-temp-save").addClass('d-none');
            self.$el.find(".btn-send").addClass('d-none');
            self.$el.find(".btn-accept").addClass('d-none');
            self.$el.find(".btn-save").addClass('d-none');
            self.$el.find(".btn-return").addClass('d-none');
            self.$el.find(".btn-save-publish").addClass('d-none');
            self.$el.find(".btn-edit").addClass('d-none');
            self.$el.find(".btn-publish").addClass('d-none');
            self.$el.find(".btn-cancel").addClass('d-none');
            self.$el.find(".btn-del").addClass('d-none');
            var status = self.model.get("status");
            var currentUser = self.getApp().currentUser;
            
            if (status == 0) {
                self.$el.find("#title_page").text("Bài lưu tạm");
                if (self.model.get("user_id") == currentUser.id) {
                    self.$el.find(".btn-temp-save").removeClass('d-none');
                    self.$el.find(".btn-send").removeClass('d-none');
                    if (self.status_post_publish != 6) {
                        self.$el.find(".btn-del").removeClass('d-none');
                    }
                }
            }
            else if (status == 1) {
                self.$el.find("#title_page").text("Bài chờ biên tập");
                if (self.getApp().hasRole("admin") || self.getApp().hasRole("admin_donvi") || self.getApp().hasRole("canbo")) {
                    self.$el.find(".btn-accept").removeClass('d-none');
                    if (self.model.get("user_id") == currentUser.id && self.status_post_publish != 6) {
                        self.$el.find(".btn-del").removeClass('d-none');
                    }
                }
            }
            else if (status == 2) {
                self.$el.find("#title_page").text("Bài nhận biên tập");
                if (self.getApp().hasRole("admin") || self.getApp().hasRole("admin_donvi") || self.getApp().hasRole("canbo")) {
                    self.$el.find(".btn-save").removeClass('d-none');
                    self.$el.find(".btn-return").removeClass('d-none');
                    self.$el.find(".btn-save-publish").removeClass('d-none');
                    if (self.status_post_publish != 6) {
                        self.$el.find(".btn-del").removeClass('d-none');
                    }
                }
            }
            else if (status == 3) {
                self.$el.find("#title_page").text("Bài đang xử lý");
                if (self.getApp().hasRole("admin") || self.getApp().hasRole("admin_donvi") || self.getApp().hasRole("canbo")) {
                    self.$el.find(".btn-save").removeClass('d-none');
                    self.$el.find(".btn-return").removeClass('d-none');
                    self.$el.find(".btn-save-publish").removeClass('d-none');
                    if (self.status_post_publish != 6) {
                        self.$el.find(".btn-del").removeClass('d-none');
                    }
                }
            }
            else if (status == 4) {
                self.$el.find("#title_page").text("Bài bị trả");
                if (self.model.get("user_id") == currentUser.id) {
                    self.$el.find(".btn-temp-save").removeClass('d-none');
                    self.$el.find(".btn-send").removeClass('d-none');
                    if (self.status_post_publish != 6) {
                        self.$el.find(".btn-del").removeClass('d-none');
                    }
                }  
            }
            else if (status == 5) {
                self.$el.find("#title_page").text("Bài bị gỡ");
                self.$el.find(".box-copy-link").addClass("d-none");
                self.disableClick();
                if (self.getApp().hasRole("admin") || self.getApp().hasRole("admin_donvi") || self.getApp().hasRole("canbo")) {
                    self.$el.find(".btn-edit").removeClass('d-none');
                    self.$el.find(".btn-publish").removeClass('d-none');
                    self.$el.find(".btn-del").removeClass('d-none');
                }
            }
            else if (status == 6) {
                self.$el.find("#title_page").text("Bài đang xuất bản");
                self.$el.find(".box-copy-link").removeClass("d-none");
                self.disableClick();
                if (self.getApp().hasRole("admin") || self.getApp().hasRole("admin_donvi") || self.getApp().hasRole("canbo")) {
                    self.$el.find(".btn-edit").removeClass('d-none');
                    self.$el.find(".btn-cancel").removeClass('d-none');
                }
            }
            else if (status == 7) {
                self.$el.find("#title_page").text("Bài bị xóa");
                self.disableClick();
                if (self.model.get("user_id") == currentUser.id) {
                    self.$el.find(".btn-restore").removeClass('d-none');
                }
            }
        },
        disableClick: function() {
            var self = this;
            self.$el.find("input").addClass("disable-click");
            self.$el.find("textarea").addClass("disable-click");
            self.$el.find(".selectize-input").addClass("disable-click");
            self.$el.find("#btn_crawl_data").addClass("disable-click");
        },
        saveData: function(status) {
            var self = this;
            var validate = self.validate();
            if (validate === false) {
                return;
            }
            self.getApp().showloading();
            var hour_time = self.$el.find("#hour_time").val();
            self.model.set("hour_time", hour_time);
            self.model.set("status", status);
            var msg = self.getContentPost();
            self.model.set("content", msg);
            self.model.save(null, {
                success: function(model, res, options) {
                    self.getApp().hideloading();
                    if (status == 0) {
                        self.model.set("user_id", res.user_id);
                        self.model.set("id", res.id);
                        self.getApp().notify("Lưu thông tin thành công");
                        self.renderButton();
                    }
                    else if (status == 1) {
                        self.getApp().notify("Gửi bài viết thành công");
                        self.getApp().getRouter().navigate("bai-cho-bien-tap/collection");
                    }
                    else if (status == 3) {
                        self.getApp().notify("Lưu thông tin thành công");
                        self.renderButton();
                    }
                    else if (status == 6) {
                        self.getApp().notify("Đăng bài viết thành công");
                        var id = self.model.get("id");
                        var path = 'postadmin/model?id=' + id + '&mode=publish';
                        self.getApp().getRouter().navigate(path);
                    }
                },
                error: function(model, xhr, options) {
                    self.getApp().hideloading();
                    try {
                        if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED"){
                            self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                            self.getApp().getRouter().navigate("login");
                        } else {
                        self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                        }
                    }
                    catch (err) {
                        self.getApp().notify({ message: "Lưu thông tin không thành công"}, { type: "danger", delay: 1000 });
                    }
                }
            });
        },
        changeStatus: function(status_post) {
            var self = this;
            self.getApp().showloading();
            var id = self.model.get("id");
            var params = { "post_id": id, "status": status_post };
            $.ajax({
                url: (self.getApp().serviceURL || "") + '/api/v1/post/changestatus',
                data: JSON.stringify(params),
                dataType: "json",
                method: 'POST',
                contentType: "application/json",
                success: function(res) {
                    self.getApp().hideloading();
                    if (status_post == 0) {
                        self.getApp().notify("Phục hồi bài viết thành công");
                        self.getApp().getRouter().navigate("bai-luu-tam/collection");
                    }
                    else if (status_post == 4) {
                        self.getApp().notify("Trả bài viết thành công");
                        self.getApp().getRouter().navigate("bai-da-tra/collection");
                    }
                    else if (status_post == 7) {
                        self.getApp().notify("Xóa bài viết thành công");
                        self.getApp().getRouter().navigate("bai-bi-xoa/collection");
                    }
                    else if (status_post == 3) {
                        self.getApp().notify("Mở chế độ sửa bài viết thành công");
                        var path = 'postadmin/model?id=' + id;
                        self.getApp().getRouter().navigate(path);
                    }
                    else if (status_post == 2 || status_post == 5 || status_post == 6) {
                        var msg = "";
                        if (status_post == 2) {
                            msg = "Nhận bài viết thành công";
                        }
                        else if (status_post == 5) {
                            msg = "Gỡ bài viết thành công";
                        }
                        else if (status_post == 6) {
                            msg = "Đăng bài viết thành công";
                        }
                        self.getApp().notify(msg);
                        self.model.set("status", status_post);
                        self.renderButton();
                    }
                },
                error: function(xhr, status, error) {
                    self.getApp().hideloading();
                    try {
                        if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED") {
                            self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                            self.getApp().getRouter().navigate("login");
                        } else {
                            self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                        }
                    } catch (err) {
                        self.getApp().notify({ message: "Lỗi không lấy được dữ liệu" }, { type: "danger", delay: 1000 });
                    }
                }
            });
        },
        selectizeTags: function() {
            var self = this;
            self.$el.find("#selectize-tags").val(self.model.get("tags"));

            self.$el.find('#selectize-tags').selectize({
                delimiter: ",",
                plugins: ['remove_button'],
                persist: true,
                createOnBlur: true,
                create: true,
                onChange: function(value) {
                    self.model.set("tags", value);
                },
            });
        },
        selectizeTagsSearch: function() {
            var self = this;
            self.$el.find("#selectize-tags-search").val(self.model.get("tags_display"));

            self.$el.find('#selectize-tags-search').selectize({
                delimiter: ",",
                plugins: ['remove_button'],
                persist: true,
                createOnBlur: true,
                create: true,
                onChange: function(value) {
                    self.model.set("tags_display", value);
                },
            });
        },
        upload_avatar: function(id_avatar, mode) {
            var self = this;
            self.$el.find("#" + id_avatar).unbind("click").bind("click", function() {
                var model_dialog = new DialogAvatar({"viewData": {"mode": mode}});
                model_dialog.dialog({size:"small"});
                model_dialog.on("printImg", function(file) {
                    self.model.set(id_avatar, file);
                    self.render_avatar(file, id_avatar);
                });
            });
        },
        render_avatar: function(file, id_avatar) {
            var self = this;
            var url_file = gonrinApp().check_file_minio(file)
            self.$el.find('#' + id_avatar).css('background-image', 'url(' + url_file + ')');
        },
        remove_avatar: function(id_avatar) {
            var self = this;
            self.$el.find("#remove_" + id_avatar).unbind("click").bind("click", function(event) {
                self.$el.find('#' + id_avatar).css('background-image', 'none');
                self.model.set(id_avatar, null);
                event.stopPropagation();
            });
        },
        initEditor: function() {
            var self = this;
            tinymce.remove('textarea#tinymce_editor');
            tinymce.init({
                selector: 'textarea#tinymce_editor',
                // document_base_url: url_service,
                relative_urls : false,
                remove_script_host : false,
                convert_urls : true,
                extended_valid_elements : "i",
                // custom_elements: "i",
                content_css: [
                    "static/vendor/libtemplate1/css/icons.min.css",
                    "static/css/font.css",
                    "static/vendor/tinymce/tinymce_custom.css"
                ],
                // plugins: 'contextmenu example print preview paste importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern noneditable help charmap emoticons fullpage',
                plugins: 'preview paste importcss searchreplace autolink autosave save code fullscreen link media table hr lists wordcount quickbars',
                // plugins: 'preview paste importcss searchreplace autolink autosave save code visualchars fullscreen image link media table hr lists wordcount imagetools template',
                // imagetools_cors_hosts: ['picsum.photos'],
                menubar:false,
                // menubar: 'file edit view insert format tools table help',
                // toolbar: 'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl',
                // toolbar: 'save | box_related_news | related_one_news | quote | box_highlight | image_custom | media | link | fullscreen | preview | hr | numlist | bullist',
                toolbar: 'fontselect fontsizeselect styleselect | bold italic underline | link | searchreplace | fullscreen | preview | numlist | bullist',
                toolbar_sticky: true,
                save_onsavecallback: function () { console.log('Saved'); },
                autosave_ask_before_unload: false,
                autosave_interval: "1s",
                autosave_prefix: "{path}{query}-{id}-",
                autosave_restore_when_empty: false,
                autosave_retention: "2m",
                importcss_append: true,
                automatic_uploads: true,
                font_formats: `Arial=Arial; 
                                Arialbd=Arialbd; 
                                Arialbi=Arialbi; 
                                Ariali=Ariali; 
                                Arialn=Arialn; 
                                Arialnb=Arialnb; 
                                Arialnbi=Arialnbi; 
                                Arialni=Arialni; 
                                Baloo2 Bold=Baloo2-Bold; 
                                Baloo2 ExtraBold=Baloo2-ExtraBold; 
                                Baloo2 Medium=Baloo2-Medium; 
                                Baloo2 Regular=Baloo2-Regular; 
                                Baloo2 SemiBold=Baloo2-SemiBold; 
                                BalooBhaijaan2 VariableFont=BalooBhaijaan2-VariableFont_wght; 
                                BarlowSemiCondensed Black=BarlowSemiCondensed-Black; 
                                BarlowSemiCondensed BlackItalic=BarlowSemiCondensed-BlackItalic; 
                                BarlowSemiCondensed Bold=BarlowSemiCondensed-Bold; 
                                BarlowSemiCondensed BoldItalic=BarlowSemiCondensed-BoldItalic; 
                                BarlowSemiCondensed ExtraBold=BarlowSemiCondensed-ExtraBold; 
                                BarlowSemiCondensed ExtraBoldItalic=BarlowSemiCondensed-ExtraBoldItalic; 
                                BarlowSemiCondensed ExtraLight=BarlowSemiCondensed-ExtraLight; 
                                BarlowSemiCondensed ExtraLightItalic=BarlowSemiCondensed-ExtraLightItalic; 
                                BarlowSemiCondensed Italic=BarlowSemiCondensed-Italic; 
                                BarlowSemiCondensed Light=BarlowSemiCondensed-Light; 
                                BarlowSemiCondensed LightItalic=BarlowSemiCondensed-LightItalic; 
                                BarlowSemiCondensed Medium=BarlowSemiCondensed-Medium; 
                                BarlowSemiCondensed MediumItalic=BarlowSemiCondensed-MediumItalic; 
                                BarlowSemiCondensed Regular=BarlowSemiCondensed-Regular; 
                                BarlowSemiCondensed SemiBold=BarlowSemiCondensed-SemiBold; 
                                BarlowSemiCondensed SemiBoldItalic=BarlowSemiCondensed-SemiBoldItalic; 
                                BarlowSemiCondensed BlackItalic=BarlowSemiCondensed-BlackItalic; 
                                BarlowSemiCondensed Thin=BarlowSemiCondensed-Thin; 
                                BarlowSemiCondensed ThinItalic=BarlowSemiCondensed-ThinItalic;
                                HelveticaNeue Bold=Helvetica-Neue-Bold;
                                HelveticaNeue Bold Italic=Helvetica-Neue-Bold-Italic;
                                HelveticaNeue Italic=Helvetica-Neue-Italic;
                                Lato Regular=Lato-Regular;
                                NotoSerif Bold=NotoSerif-Bold;
                                NotoSerif BoldItalic=NotoSerif-BoldItalic;
                                NotoSerif Italic=NotoSerif-Italic;
                                NotoSerif Regular=NotoSerif-Regular;
                                NunitoSans Black=NunitoSans-Black; 
                                NunitoSans BlackItalic=NunitoSans-BlackItalic; 
                                NunitoSans Bold=NunitoSans-Bold; 
                                NunitoSans BoldItalic=NunitoSans-BoldItalic; 
                                NunitoSans ExtraBold=NunitoSans-ExtraBold; 
                                NunitoSans ExtraBoldItalic=NunitoSans-ExtraBoldItalic; 
                                NunitoSans ExtraLight=NunitoSans-ExtraLight; 
                                NunitoSans ExtraLightItalic=NunitoSans-ExtraLightItalic; 
                                NunitoSans Italic=NunitoSans-Italic; 
                                NunitoSans Light=NunitoSans-Light; 
                                NunitoSans LightItalic=NunitoSans-LightItalic; 
                                NunitoSans Regular=NunitoSans-Regular;
                                NunitoSans SemiBold=NunitoSans-SemiBold;
                                NunitoSans SemiBoldItalic=NunitoSans-SemiBoldItalic;
                                Roboto Regular=Roboto-Regular;
                                RobotoCondensed Bold=RobotoCondensed-Bold;
                                Roboto Black=Roboto-Black;
                                RobotoSlab ExtraBold=RobotoSlab-ExtraBold;
                                YesevaOne Regular=YesevaOne-Regular;`,
                fontsize_formats: "8px 9px 10px 11px 12px 13px 14px 15px 16px 17px 18px 19px 20px 22px 24px 26px 28px 30px 32px 34px 36px",
                template_cdate_format: '[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]',
                template_mdate_format: '[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]',
                style_formats_merge: false,
                style_formats: [
                    { title: 'Paragraph', block: 'p', attributes: {'class':''} },
                    { title: 'Heading 1', block: 'h1', attributes: {'class':''} },
                    { title: 'Heading 2', block: 'h2', attributes: {'class':''} },
                    { title: 'Heading 3', block: 'h3', attributes: {'class':''} },
                    { title: 'Heading 4', block: 'h4', attributes: {'class':''} },
                    { title: 'Heading 5', block: 'h5', attributes: {'class':''} },
                    { title: 'Heading 6', block: 'h6', attributes: {'class':''} },
                    { title: 'Table of contents formats' },
                    { title: 'Mục lục cấp 1', block: 'div', attributes: {'class':'table-of-contents toc-level-0'} },
                    { title: 'Mục lục cấp 2', block: 'div', attributes: {'class':'table-of-contents toc-level-1'} },
                    { title: 'Mục lục cấp 3', block: 'div', attributes: {'class':'table-of-contents toc-level-2'} },
                    { title: 'Mục lục cấp 4', block: 'div', attributes: {'class':'table-of-contents toc-level-3'} },
                    { title: 'Custom formats' }
                ],
                height: 520,
                quickbars_insert_toolbar: 'image_custom media quote box_related_news related_one_news box_highlight table_of_contents attach_file hr',
                quickbars_selection_toolbar: 'fontselect fontsizeselect styleselect bold italic underline forecolor backcolor link searchreplace alignleft aligncenter alignright alignjustify numlist bullist',
                quickbars_image_toolbar: false,  //tắt toolbar căn chỉnh ảnh
                object_resizing : false,  //tắt kéo thả ở góc img thay đổi kích thước img
                noneditable_noneditable_class: "mceNonEditable",
                toolbar_mode: 'sliding',
                //Possible Values: 'floating', 'sliding', 'scrolling', or 'wrap'
                // contextmenu: "link image imagetools | copy paste",
                contextmenu: "link",
                paste_preprocess : function(pl, o) {
                    var str = o.content;
                    // o.content = `<figure class="tinybox block-image">
                    // <div>
                    //     <img src="https://suckhoedoisong.qltns.mediacdn.vn/324455921873985536/2022/2/16/tt-son-1644995316359924675402.jpg" >
                    // </div>
                    // <figcaption class="block-caption">Chú thích</figcaption></figure>`;
                    // console.log(str)
                },
                content_style: 'body { font-family: NotoSerif-Regular; font-size:17px }',
                setup:function(editor) { 
                    editor.on('init', function (e) {
                        var content_editor = self.model.get("content");
                        if (content_editor != null && content_editor != "") {
                            // content_editor = content_editor.replaceAll('src="http://0.0.0.0:6380/static', 'src="/static');
                            // console.log(content_editor)
                            editor.setContent(content_editor);
                            $('#tinymce_editor').val(content_editor);
                        }
                        var status = self.model.get("status");
                        if (status == 5 || status == 6 || status == 7) {
                            editor.mode.set('readonly');
                        }
                    })
                    self.custom_button(editor);
                    editor.on('click', function(e) {
                        tinymce.dom.DomQuery(".tox-pop").removeClass("d-none");
                    });
                    editor.on('change', function () {
                        tinymce.triggerSave();
                    });
                }
            });
        },
        custom_button: function(editor) {
            //Đính kèm file
            editor.ui.registry.addButton('attach_file', {
                icon: "unlink",
                tooltip: 'Đính kèm file',
                onAction: function () {
                    var dialog = new DialogAttachFile({"viewData": {}});
                    dialog.dialog();
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    dialog.on("attach_file", function(file_name, url_file, title_attach_file = "") {
                        tinymce.dom.DomQuery(".tox-pop").removeClass("d-none");
                        var title_html = "";
                        if (title_attach_file) {
                            title_html = `<div class='file-attach-title'><p>`+ title_attach_file +`</p></div>`;
                        }
                        var html = `
                        <div class='tinybox block-attach-file' data-title-attach-file='`+ title_attach_file +`' data-file-name='` + file_name + `' data-url-file='` + url_file + `'>
                            <div class='file-attach'>
                                `+ title_html +`
                                <div class='file-attach-content'>
                                    <div class='file-attach-icon'>
                                        <a href='`+ url_file +`' target='_blank'>
                                            <img src='static/images_template/image_file_icons/file.png'>
                                        </a>
                                    </div>
                                    <div class='file-attach-info'>
                                        <a target='_blank' href='`+ url_file +`'>` + file_name + ` &nbsp;&nbsp;<button type="button" class="btn-download"><i></i> Tải xuống</button></a>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                        editor.insertContent(html);
                    });
                }
            });
            editor.ui.registry.addButton('edit_attach_file', {
                icon: 'edit-block',
                tooltip: 'Chỉnh sửa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-attach-file');
                    var file_name = el.getAttribute("data-file-name");
                    var url_file = el.getAttribute("data-url-file");
                    var title_attach_file = el.getAttribute("data-title-attach-file");
                    var dialog = new DialogAttachFile({"viewData": {"file_name": file_name, "url_file": url_file, "title_attach_file": title_attach_file}});
                    dialog.dialog();
                    dialog.on("attach_file", function(file_name, url_file, title_attach_file) {
                        $(el).html("");
                        $(el).attr("data-file-name", file_name);
                        $(el).attr("data-url-file", url_file);
                        $(el).attr("data-title-attach-file", title_attach_file);
                        var title_html = "";
                        if (title_attach_file) {
                            title_html = `<div class='file-attach-title'><p>`+ title_attach_file +`</p></div>`;
                        }
                        var html_param = `
                        <div class='file-attach'>
                            `+ title_html +`
                            <div class='file-attach-content'>
                                <div class='file-attach-icon'>
                                    <a href='`+ url_file +`' target='_blank'>
                                        <img src='static/images_template/image_file_icons/file.png'>
                                    </a>
                                </div>
                                <div class='file-attach-info'>
                                    <a target='_blank' href='`+ url_file +`'>` + file_name + ` &nbsp;&nbsp;<button type="button" class="btn-download"><i></i> Tải xuống</button></a>
                                </div>
                            </div>
                        </div>`;
                        $(el).append(html_param);
                    });

                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                }
            });
            editor.ui.registry.addButton('remove_attach_file', {
                icon: 'remove',
                tooltip: 'Xóa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-attach-file');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    el.remove();
                }
            });
            editor.ui.registry.addButton('add_line_top_toolbar_attach_file', {
                icon: 'action-prev',
                tooltip: 'Tạo dòng bên trên',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-attach-file');
                    var p = document.createElement("p");
                    var br = document.createElement("br");
                    br.setAttribute("data-mce-bogus", "1"); 
                    p.appendChild(br);
                    el.before(p);
                }
            });
            editor.ui.registry.addButton('add_line_bottom_toolbar_attach_file', {
                icon: 'action-next',
                tooltip: 'Tạo dòng bên dưới',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-attach-file');
                    var p = document.createElement("p");
                    var br = document.createElement("br");
                    br.setAttribute("data-mce-bogus", "1"); 
                    p.appendChild(br);
                    el.after(p);
                }
            });
            editor.ui.registry.addContextToolbar('toolbar_attach_file', {
                predicate: function (node) {
                    if (node.classList.contains('block-attach-file')) {
                        tinymce.DOM.addClass(node, 'selected');
                        return true;
                    }
                    tinymce.activeEditor.dom.removeClass(tinymce.activeEditor.dom.select('.block-attach-file'), 'selected');
                    return false;
                },
                items: 'edit_attach_file | add_line_top_toolbar_attach_file | add_line_bottom_toolbar_attach_file | remove_attach_file',
                position: 'node',
                scope: 'node'
            });

            //Chèn mục lục
            editor.ui.registry.addButton('table_of_contents', {
                icon: "list-num-default",
                tooltip: 'Chèn mục lục',
                onAction: function () {
                    var array_toc = tinyMCE.activeEditor.dom.select(".table-of-contents");
                    var dialog = new DialogMucLuc({"viewData": {"array_toc": array_toc, "array_level": []}});
                    dialog.dialog();
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    dialog.on("insert_toc", function(array_level, html_param) {
                        tinymce.dom.DomQuery(".tox-pop").removeClass("d-none");
                        if (html_param != "") {
                            var data_toc_level = ``;
                            for (var i = 0; i < array_level.length; i++) {
                                if (i == (array_level.length - 1)) {
                                    data_toc_level += array_level[i];
                                }
                                else {
                                    data_toc_level = data_toc_level + array_level[i] + ",";
                                }
                                var array_el_toc = tinyMCE.activeEditor.dom.select(".table-of-contents." + array_level[i]);
                                for (var j = 0; j < array_el_toc.length; j++) {
                                    var id = array_el_toc[j].innerText.toLowerCase().replaceAll(".","").replaceAll(/ /g,"-");
                                    $(array_el_toc[j]).attr("id", id);
                                }
                            }
                            var html = `<div class="tinybox block-toc alignRight" data-toc-level="` + data_toc_level + `">` + html_param + `</div>`;
                            editor.insertContent(html);
                            var node = tinymce.activeEditor.selection.getNode();
                            var el = tinymce.activeEditor.dom.getParent(node, '.block-toc');
                            var el_parent = tinymce.activeEditor.dom.getParent(el, '.table-of-contents');
                            if (el_parent != null ) {
                                $(el_parent).removeClass("table-of-contents");
                            }
                        }
                    });
                }
            });
            editor.ui.registry.addButton('toc_align_left', {
                icon: 'align-left',
                tooltip: 'Nằm bên trái',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-toc');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    tinymce.DOM.removeClass(el, 'alignCenter');
                    tinymce.DOM.removeClass(el, 'alignRight');
                    tinymce.DOM.addClass(el, 'alignLeft');
                }
            });
            editor.ui.registry.addButton('toc_align_right', {
                icon: 'align-right',
                tooltip: 'Nằm bên phải',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-toc');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    tinymce.DOM.removeClass(el, 'alignCenter');
                    tinymce.DOM.removeClass(el, 'alignLeft');
                    tinymce.DOM.addClass(el, 'alignRight');
                }
            });
            editor.ui.registry.addButton('toc_align_center', {
                icon: 'align-center',
                tooltip: 'Nằm giữa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-toc');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    tinymce.DOM.removeClass(el, 'alignRight');
                    tinymce.DOM.removeClass(el, 'alignLeft');
                    tinymce.DOM.addClass(el, 'alignCenter');
                }
            });
            editor.ui.registry.addButton('edit_toc', {
                icon: 'edit-block',
                tooltip: 'Chỉnh sửa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-toc');
                    var data_toc_level = el.getAttribute("data-toc-level");
                    var array_level = data_toc_level.split(",");
                    var array_toc = tinyMCE.activeEditor.dom.select(".table-of-contents");
                    var dialog = new DialogMucLuc({"viewData": {"array_toc": array_toc, "array_level": array_level}});
                    dialog.dialog();
                    dialog.on("insert_toc", function(array_level, html_param) {
                        if (html_param != "") {
                            var data_toc_level = ``;
                            for (var i = 0; i < array_level.length; i++) {
                                if (i == (array_level.length - 1)) {
                                    data_toc_level += array_level[i];
                                }
                                else {
                                    data_toc_level = data_toc_level + array_level[i] + ",";
                                }

                                var array_el_toc = tinyMCE.activeEditor.dom.select(".table-of-contents." + array_level[i]);
                                for (var j = 0; j < array_el_toc.length; j++) {
                                    var id = array_el_toc[j].innerText.toLowerCase().replaceAll(".","").replaceAll(/ /g,"-");
                                    $(array_el_toc[j]).attr("id", id);
                                }
                            }
                            $(el).attr("data-toc-level", data_toc_level);
                            $(el).html("");
                            $(el).append(html_param);
                        }
                        else {
                            el.remove();
                        }
                    });

                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                }
            });
            editor.ui.registry.addButton('remove_toc', {
                icon: 'remove',
                tooltip: 'Xóa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-toc');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    el.remove();
                }
            });
            editor.ui.registry.addButton('add_line_top_toolbar_toc', {
                icon: 'action-prev',
                tooltip: 'Tạo dòng bên trên',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-toc');
                    var p = document.createElement("p");
                    var br = document.createElement("br");
                    br.setAttribute("data-mce-bogus", "1"); 
                    p.appendChild(br);
                    el.before(p);
                }
            });
            editor.ui.registry.addButton('add_line_bottom_toolbar_toc', {
                icon: 'action-next',
                tooltip: 'Tạo dòng bên dưới',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-toc');
                    var p = document.createElement("p");
                    var br = document.createElement("br");
                    br.setAttribute("data-mce-bogus", "1"); 
                    p.appendChild(br);
                    el.after(p);
                }
            });
            editor.ui.registry.addContextToolbar('toolbar_toc', {
                predicate: function (node) {
                    if (node.classList.contains('block-toc')) {
                        tinymce.DOM.addClass(node, 'selected');
                        return true;
                    }
                    tinymce.activeEditor.dom.removeClass(tinymce.activeEditor.dom.select('.block-toc'), 'selected');
                    return false;
                },
                items: 'toc_align_left | toc_align_center | toc_align_right | edit_toc | add_line_top_toolbar_toc | add_line_bottom_toolbar_toc | remove_toc',
                position: 'node',
                scope: 'node'
            });

            //Chèn ảnh 
            editor.ui.registry.addButton('image_custom', {
                icon: "image",
                tooltip: 'Chèn ảnh',
                onAction: function () {
                    var model_dialog = new DialogManageImage({"viewData": {}});
                    model_dialog.dialog({size:"large"});
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    model_dialog.on("success", function(file) {
                        var url_file = gonrinApp().check_file_minio(file);
                        var html = `<figure class="tinybox block-image">
                                <div class="box-image">
                                    <img src="`+ url_file +`" id="img_` + file.id + `">
                                </div>
                                <figcaption class="block-caption">Ảnh minh họa</figcaption></figure>`
                        tinymce.dom.DomQuery(".tox-pop").removeClass("d-none");
                        editor.insertContent(html);
                    });
                }
            });
            editor.ui.registry.addButton('img_align_left', {
                icon: 'align-left',
                tooltip: 'Nằm bên trái',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-image');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    tinymce.DOM.removeClass(el, 'alignCenter');
                    tinymce.DOM.removeClass(el, 'alignRight');
                    tinymce.DOM.addClass(el, 'alignLeft');
                }
            });
            editor.ui.registry.addButton('img_align_right', {
                icon: 'align-right',
                tooltip: 'Nằm bên phải',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-image');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    tinymce.DOM.removeClass(el, 'alignCenter');
                    tinymce.DOM.removeClass(el, 'alignLeft');
                    tinymce.DOM.addClass(el, 'alignRight');
                }
            });
            editor.ui.registry.addButton('img_align_center', {
                icon: 'align-center',
                tooltip: 'Nằm giữa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-image');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    tinymce.DOM.removeClass(el, 'alignRight');
                    tinymce.DOM.removeClass(el, 'alignLeft');
                    tinymce.DOM.addClass(el, 'alignCenter');
                }
            });
            editor.ui.registry.addButton('remove_image', {
                icon: 'remove',
                tooltip: 'Xóa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-image');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    el.remove();
                }
            });
            editor.ui.registry.addButton('add_line_top_toolbar_image', {
                icon: 'action-prev',
                tooltip: 'Tạo dòng bên trên',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-image');
                    var p = document.createElement("p");
                    var br = document.createElement("br");
                    br.setAttribute("data-mce-bogus", "1"); 
                    p.appendChild(br);
                    el.before(p);
                }
            });
            editor.ui.registry.addButton('add_line_bottom_toolbar_image', {
                icon: 'action-next',
                tooltip: 'Tạo dòng bên dưới',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-image');
                    var p = document.createElement("p");
                    var br = document.createElement("br");
                    br.setAttribute("data-mce-bogus", "1"); 
                    p.appendChild(br);
                    el.after(p);
                }
            });
            editor.ui.registry.addButton('edit_image', {
                icon: 'edit-block',
                tooltip: 'Chỉnh sửa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-image');
                    var img = $(el).find("img");
                    var url_img = img.attr('src');
                    
                    var model_dialog = new DialogEditImage({"viewData": {"url_file": url_img}});
                    model_dialog.dialog({size:"large"});
                    model_dialog.on("success", function(data) {
                        var new_url_img = gonrinApp().check_file_minio(data),
                            new_id_img = data.id;
                            img.attr('src', new_url_img);
                            img.attr('data-mce-src', new_url_img);
                            img.attr('id', 'img_' + new_id_img);
                    });
                    
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");  //ẩn thanh toolbar
                }
            });
            editor.ui.registry.addContextToolbar('toolbar_image', {
                predicate: function (node) {
                    if (node.classList.contains('block-image')) {
                        tinymce.DOM.addClass(node, 'selected');
                        return true;
                    }
                    tinymce.activeEditor.dom.removeClass(tinymce.activeEditor.dom.select('.block-image'), 'selected');
                    return false;
                },
                items: 'img_align_left | img_align_center | img_align_right | edit_image | add_line_top_toolbar_image | add_line_bottom_toolbar_image | remove_image',
                position: 'node',
                scope: 'node'
            });

            //Trích dẫn
            function chooseTypeQuote(quote_content = "", author_name = "", author_image = "", input_link = "", type = "1", old_content = null, old_author_name = "", old_author_image = "", old_link = "", old_type = "1") {
                var icon_author = "";
                if (author_image != "") {
                    icon_author += `<div class="icon-author" style="background-image: url(` + author_image + `);"></div>`;
                }
                return {
                    title: 'Chọn mẫu hiển thị trích dẫn',
                    body: {
                        type: 'panel',
                        items: [
                            {
                                type: 'selectbox',
                                name: 'choosetype',
                                label: 'Chọn kiểu hiển thị',
                                class: "sss",
                                items: [
                                    { value: "1", text: 'Mẫu 1' },
                                    { value: "2", text: 'Mẫu 2' },
                                    { value: "3", text: 'Mẫu 3' }
                                ]
                            },
                            {
                                type: 'htmlpanel',
                                html: `<div class="preview-content-block">
                                        <div class="blockquote type-` + type + `">
                                            <div class="icon icon-quote"></div>
                                            <div class="content-quote">` + quote_content + `</div>
                                            <div class="footer">
                                                <div class="author">
                                                    ` + icon_author + `
                                                    <p class="author-name">` + author_name + `</p>
                                                </div>
                                                <div class="link-view">
                                                    <p class="link">` + input_link + `</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`                                  
                            }
                        ]
                    },
                    buttons: [
                        {
                            type: 'custom',
                            name: 'edit',
                            text: 'Sửa',
                            disabled: false
                        },
                        {
                            type: 'custom',
                            name: 'done',
                            text: 'Hoàn tất',
                            primary: true,
                            disabled: false
                        }
                    ],
                    initialData: {
                        choosetype: type
                    },
                    onCancel: () => {
                        if (old_content != null) {
                            var q_avatar = "";
                            if (old_author_image != "") {
                                q_avatar += `<span class="q-avatar"><img src="` + old_author_image + `"></span>`;
                            }
                            if (old_type == "1") {
                                editor.insertContent(`<div class='tinybox block-quote' data-type='` + old_type + `' data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `' data-author-image='`+ old_author_image +`'>
                                    <div class="quote-content">` + old_content + `</div>
                                    <div class="quote-author">
                                        ` + q_avatar + `
                                        <span class="q-name">` + old_author_name + `</span>
                                        <span class="q-link">
                                            <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                        </span>
                                    </div>
                                </div>`);
                            }
                            else if (old_type == "2") {
                                editor.insertContent(`<div class='tinybox block-quote' data-type='` + old_type + `' data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `' data-author-image='`+ old_author_image +`'>
                                    <div class="icon-quote"></div>
                                    <div class="quote-content">` + old_content + `</div>
                                    <div class="quote-author">
                                        ` + q_avatar + `
                                        <span class="q-name">` + old_author_name + `</span>
                                        <span class="q-link">
                                            <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                        </span>
                                    </div>
                                </div>`);
                            }
                            else if (old_type == "3") {
                                editor.insertContent(`<div class='tinybox block-quote' data-type='` + old_type + `' data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `' data-author-image='`+ old_author_image +`'>
                                    <div class="quote-author">
                                        ` + q_avatar + `
                                        <span class="q-name">` + old_author_name + `</span>
                                    </div>
                                    <div class="quote-content">` + old_content + `</div>
                                    <span class="q-link">
                                        <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                    </span>
                                </div>`);
                            }
                        }
                    },
                    onChange: function (dialogApi, details) {
                        var data = dialogApi.getData();
                        var chooseType = data.choosetype;
                        if (chooseType == "1") {
                            tinymce.dom.DomQuery(".preview-content-block .blockquote").removeClass("type-2").removeClass("type-3").addClass("type-1");
                        }
                        else if (chooseType == "2") {
                            tinymce.dom.DomQuery(".preview-content-block .blockquote").removeClass("type-1").removeClass("type-3").addClass("type-2");
                        }
                        else if (chooseType == "3") {
                            tinymce.dom.DomQuery(".preview-content-block .blockquote").removeClass("type-1").removeClass("type-2").addClass("type-3");
                        }
                    },
                    onAction: function (dialogApi, details) {
                        var data = dialogApi.getData();
                        var chooseType = data.choosetype;
                        if (details.name === 'edit') {
                            if (quote_content != null) {
                                quote_content = quote_content.replace(/<br\s?\/?>/g,"\n");
                            }
                            if (old_content != null) {
                                old_content = old_content.replace(/<br\s?\/?>/g,"\n");
                            }
                            editor.windowManager.open(dialogEditQuote(quote_content, author_name, author_image, input_link, chooseType, old_content, old_author_name, old_author_image, old_link, old_type));
                            tinymce.dom.DomQuery(".tox-dialog").addClass("dialog-edit");
                        } 
                        else if (details.name === 'done') {
                            var q_avatar = "";
                            if (author_image != "") {
                                q_avatar += `<span class="q-avatar"><img src="` + author_image + `"></span>`;
                            }
                            if (chooseType == "1") {
                                editor.insertContent(`<div class='tinybox block-quote' data-type='` + chooseType + `' data-content='` + quote_content + `' data-link='` + input_link + `' data-name='` + author_name + `' data-author-image='`+ author_image +`'>
                                    <div class="quote-content">` + quote_content + `</div>
                                    <div class="quote-author">
                                        ` + q_avatar + `
                                        <span class="q-name">` + author_name + `</span>
                                        <span class="q-link">
                                            <a href="` + input_link + `" target="_blank">` + input_link + `</a>
                                        </span>
                                    </div>
                                </div>`);
                            }
                            else if (chooseType == "2") {
                                editor.insertContent(`<div class='tinybox block-quote' data-type='` + chooseType + `' data-content='` + quote_content + `' data-link='` + input_link + `' data-name='` + author_name + `' data-author-image='`+ author_image +`'>
                                    <div class="icon-quote"></div>
                                    <div class="quote-content">` + quote_content + `</div>
                                    <div class="quote-author">
                                        ` + q_avatar + `
                                        <span class="q-name">` + author_name + `</span>
                                        <span class="q-link">
                                            <a href="` + input_link + `" target="_blank">` + input_link + `</a>
                                        </span>
                                    </div>
                                </div>`);
                            }
                            else if (chooseType == "3") {
                                editor.insertContent(`<div class='tinybox block-quote' data-type='` + chooseType + `' data-content='` + quote_content + `' data-link='` + input_link + `' data-name='` + author_name + `' data-author-image='`+ author_image +`'>
                                    <div class="quote-author">
                                        ` + q_avatar + `
                                        <span class="q-name">` + author_name + `</span>
                                    </div>
                                    <div class="quote-content">` + quote_content + `</div>
                                    <span class="q-link">
                                        <a href="` + input_link + `" target="_blank">` + input_link + `</a>
                                    </span>
                                </div>`);
                            }
                        }
                        
                        dialogApi.close();
                    }
                };
            }
            function dialogEditQuote(quote_content = "", author_name = "", author_image = "", input_link = "", type = "1", old_content = null, old_author_name = "", old_author_image = "", old_link = "", old_type = "1")
            {
                var html_img = "";
                if (author_image != "") {
                    html_img += `
                        <img id="author_image" src="` + author_image + `" style="width:100px; height:100px;">
                        <p class="text-danger" onclick="document.getElementById('div_author_image').innerHTML=''" style="cursor: pointer;">Xóa</p>
                    `;
                }
                return {
                    title: 'Trích dẫn',
                    body: {
                        type: 'panel',
                        items: [
                            {
                                type: 'textarea',
                                name: 'quote_content'
                            },
                            {
                                type: 'input',
                                name: 'author_name',
                                label: 'Thương hiệu, tác giả'
                            },
                            {
                                type: 'grid',
                                columns: 2,
                                items: [
                                    {
                                        type: 'button',
                                        name: 'upload_image',
                                        text: 'Tải ảnh',
                                        primary: true
                                    },
                                    {
                                        type: 'htmlpanel',
                                        html: '<div style="margin-left: -270px;" id="div_author_image">' + html_img + '</div>'
                                    },
                                ]
                            },
                            {
                                type: 'input',
                                name: 'input_link',
                                label: 'Link đính kèm'
                            }
                        ]
                    },
                    initialData: {
                        quote_content: quote_content,
                        author_name: author_name,
                        input_link: input_link
                    },
                    buttons: [
                        {
                            text: 'Đóng',
                            type: 'custom',
                            name: 'close',
                            disabled: false
                        },
                        {
                            type: 'custom',
                            name: 'choose',
                            text: 'Chọn mẫu',
                            primary: true,
                            disabled: false
                        }
                    ],
                    onCancel: () => {
                        if (old_content != null) {
                            var q_avatar = "";
                            if (old_author_image != "") {
                                q_avatar += `<span class="q-avatar"><img src="` + old_author_image + `"></span>`;
                            }
                            old_content = old_content.replace(/\r\n|\r|\n/g,"<br />");
                            if (old_type == "1") {
                                editor.insertContent(`<div class='tinybox block-quote' data-type='` + old_type + `' data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `' data-author-image='`+ old_author_image +`'>
                                    <div class="quote-content">` + old_content + `</div>
                                    <div class="quote-author">
                                        ` + q_avatar + `
                                        <span class="q-name">` + old_author_name + `</span>
                                        <span class="q-link">
                                            <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                        </span>
                                    </div>
                                </div>`);
                            }
                            else if (old_type == "2") {
                                editor.insertContent(`<div class='tinybox block-quote' data-type='` + old_type + `' data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `' data-author-image='`+ old_author_image +`'>
                                    <div class="icon-quote"></div>
                                    <div class="quote-content">` + old_content + `</div>
                                    <div class="quote-author">
                                        ` + q_avatar + `
                                        <span class="q-name">` + old_author_name + `</span>
                                        <span class="q-link">
                                            <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                        </span>
                                    </div>
                                </div>`);
                            }
                            else if (old_type == "3") {
                                editor.insertContent(`<div class='tinybox block-quote' data-type='` + old_type + `' data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `' data-author-image='`+ old_author_image +`'>
                                    <div class="quote-author">
                                        ` + q_avatar + `
                                        <span class="q-name">` + old_author_name + `</span>
                                    </div>
                                    <div class="quote-content">` + old_content + `</div>
                                    <span class="q-link">
                                        <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                    </span>
                                </div>`);
                            }
                        }
                    },
                    onChange: function (dialogApi, details) {
                        var data = dialogApi.getData();
                        var toggle = data.highlight_content != "" ? dialogApi.enable : dialogApi.disable;
                        toggle('choose');
                    },
                    onAction: function (api, details) {
                        if (details.name == "upload_image") {
                            var inp = $('<input>').attr({
                                type: 'file',
                                id: 'upload_files',
                                name: 'bar',
                                class: 'd-none'
                            });
                            $(inp).click();
                            $(inp).unbind('change').bind('change', function() {
                                var file = $(inp)[0].files[0];
                                if (!!file && file.type.match('image*')) {
                                    var http = new XMLHttpRequest();
                                    var fd = new FormData();
                                    fd.append('file', file, file.name);
                                    fd.append('type_file', "1");
                                    var url = gonrinApp().serviceURL + '/api/v1/upload';
                                    http.open('POST', url);
                                    var token = !!gonrinApp().currentUser ? gonrinApp().currentUser.token : null;
                                    http.setRequestHeader("X-USER-TOKEN", token);
                                    
                                    http.addEventListener('error', function(r) {
                                        alert("Không tải được file lên hệ thống");
                                    }, false);

                                    http.onreadystatechange = function() {
                                        if (http.status === 200) {
                                            if (http.readyState === 4) {
                                                var data_file = JSON.parse(http.responseText);
                                                author_image = gonrinApp().check_file_minio(data_file);
                                                $("#div_author_image").html("");
                                                $("#div_author_image").append(`
                                                    <img id="author_image" src="` + author_image + `" style="width:100px; height:100px;">
                                                    <p class="text-danger" id="delete_image" style="cursor: pointer;">Xóa</p>
                                                `)
                                                $("#delete_image").unbind('click').bind('click', function() {
                                                    $("#div_author_image").html("");
                                                    author_image = "";
                                                });
                                            }
                                        } else {
                                            alert("Không thể tải file lên hệ thống");
                                        }
                                    };
                                    http.send(fd);
                                } 
                                else {
                                    alert("Vui lòng chọn đúng định dạng ảnh");
                                }
                            });
                        }
                        if (details.name == "close") {
                            if (old_content != null) {
                                var q_avatar = "";
                                if (old_author_image != "") {
                                    q_avatar += `<span class="q-avatar"><img src="` + old_author_image + `"></span>`;
                                }
                                old_content = old_content.replace(/\r\n|\r|\n/g,"<br />");
                                if (old_type == "1") {
                                    editor.insertContent(`<div class='tinybox block-quote' data-type='` + old_type + `' data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `' data-author-image='`+ old_author_image +`'>
                                        <div class="quote-content">` + old_content + `</div>
                                        <div class="quote-author">
                                            ` + q_avatar + `
                                            <span class="q-name">` + old_author_name + `</span>
                                            <span class="q-link">
                                                <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                            </span>
                                        </div>
                                    </div>`);
                                }
                                else if (old_type == "2") {
                                    editor.insertContent(`<div class='tinybox block-quote' data-type='` + old_type + `' data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `' data-author-image='`+ old_author_image +`'>
                                        <div class="icon-quote"></div>
                                        <div class="quote-content">` + old_content + `</div>
                                        <div class="quote-author">
                                            ` + q_avatar + `
                                            <span class="q-name">` + old_author_name + `</span>
                                            <span class="q-link">
                                                <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                            </span>
                                        </div>
                                    </div>`);
                                }
                                else if (old_type == "3") {
                                    editor.insertContent(`<div class='tinybox block-quote' data-type='` + old_type + `' data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `' data-author-image='`+ old_author_image +`'>
                                        <div class="quote-author">
                                            ` + q_avatar + `
                                            <span class="q-name">` + old_author_name + `</span>
                                        </div>
                                        <div class="quote-content">` + old_content + `</div>
                                        <span class="q-link">
                                            <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                        </span>
                                    </div>`);
                                }
                            }
                            api.close();
                        }
                        else if (details.name == "choose") {
                            var data = api.getData();
                            var quote_content = data.quote_content;
                            if (quote_content == "") {
                                alert("Vui lòng nhập nội dung trích dẫn!");
                            }
                            else {
                                var input_link = data.input_link;
                                var author_name = data.author_name;
                                author_image = $("#author_image").attr("src");
                                if (quote_content != null) {
                                    quote_content = quote_content.replace(/\r\n|\r|\n/g,"<br />");
                                }
                                if (old_content != null) {
                                    old_content = old_content.replace(/\r\n|\r|\n/g,"<br />");
                                }
                                api.close();
                                editor.windowManager.open(chooseTypeQuote(quote_content, author_name, author_image, input_link, type, old_content, old_author_name, old_author_image, old_link, old_type));
                                tinymce.dom.DomQuery(".tox-dialog").addClass("dialog-choose-type");
                            }
                        }
                    }
                };
            }
            editor.ui.registry.addButton('quote', {
                icon: "quote",
                tooltip: 'Chèn trích dẫn',
                onAction: function () {
                    editor.windowManager.open(dialogEditQuote());
                    tinymce.dom.DomQuery(".tox-dialog").addClass("dialog-edit");
                }
            });
            editor.ui.registry.addButton('quote_edit', {
                icon: 'edit-block',
                tooltip: 'Chỉnh sửa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-quote');
                    var quote_content = el.getAttribute("data-content"),
                        author_name = el.getAttribute("data-name"),
                        input_link = el.getAttribute("data-link"),
                        type = el.getAttribute("data-type"),
                        author_image = el.getAttribute("data-author-image");
                    el.remove();
                    if (quote_content != null) {
                        quote_content = quote_content.replace(/<br\s?\/?>/g,"\n");
                    }
                    editor.windowManager.open(dialogEditQuote(quote_content, author_name, author_image, input_link, type, quote_content, author_name, author_image, input_link, type));
                    tinymce.dom.DomQuery(".tox-dialog").addClass("dialog-edit");
                }
            });
            function configQuote(quote_content = "", author_name = "", author_image = "", input_link = "", type = "1", old_content = null, old_author_name = "", old_author_image = "", old_link = "", old_type = "1") {
                var icon_author = "";
                if (author_image != "") {
                    icon_author += `<div class="icon-author" style="background-image: url(` + author_image + `);"></div>`;
                }
                return {
                    title: 'Chọn mẫu hiển thị trích dẫn',
                    body: {
                        type: 'panel',
                        items: [
                            {
                                type: 'selectbox',
                                name: 'choosetype',
                                label: 'Chọn kiểu hiển thị',
                                class: "sss",
                                items: [
                                    { value: "1", text: 'Mẫu 1' },
                                    { value: "2", text: 'Mẫu 2' },
                                    { value: "3", text: 'Mẫu 3' }
                                ]
                            },
                            {
                                type: 'htmlpanel',
                                html: `<div class="preview-content-block">
                                        <div class="blockquote type-` + type + `">
                                            <div class="icon icon-quote"></div>
                                            <div class="content-quote">` + quote_content + `</div>
                                            <div class="footer">
                                                <div class="author">
                                                    ` + icon_author + `
                                                    <p class="author-name">` + author_name + `</p>
                                                </div>
                                                <div class="link-view">
                                                    <p class="link">` + input_link + `</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`                                  
                            }
                        ]
                    },
                    buttons: [
                        {
                            text: 'Đóng',
                            type: 'custom',
                            name: 'close',
                            disabled: false
                        },
                        {
                            type: 'custom',
                            name: 'done',
                            text: 'Hoàn tất',
                            primary: true,
                            disabled: false
                        }
                    ],
                    initialData: {
                        choosetype: type
                    },
                    onCancel: () => {
                        if (old_content != null) {
                            var q_avatar = "";
                            if (old_author_image != "") {
                                q_avatar += `<span class="q-avatar"><img src="` + old_author_image + `"></span>`;
                            }
                            if (old_type == "1") {
                                editor.insertContent(`<div class='tinybox block-quote' data-type='` + old_type + `' data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `' data-author-image='`+ old_author_image +`'>
                                    <div class="quote-content">` + old_content + `</div>
                                    <div class="quote-author">
                                        ` + q_avatar + `
                                        <span class="q-name">` + old_author_name + `</span>
                                        <span class="q-link">
                                            <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                        </span>
                                    </div>
                                </div>`);
                            }
                            else if (old_type == "2") {
                                editor.insertContent(`<div class='tinybox block-quote' data-type='` + old_type + `' data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `' data-author-image='`+ old_author_image +`'>
                                    <div class="icon-quote"></div>
                                    <div class="quote-content">` + old_content + `</div>
                                    <div class="quote-author">
                                        ` + q_avatar + `
                                        <span class="q-name">` + old_author_name + `</span>
                                        <span class="q-link">
                                            <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                        </span>
                                    </div>
                                </div>`);
                            }
                            else if (old_type == "3") {
                                editor.insertContent(`<div class='tinybox block-quote' data-type='` + old_type + `' data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `' data-author-image='`+ old_author_image +`'>
                                    <div class="quote-author">
                                        ` + q_avatar + `
                                        <span class="q-name">` + old_author_name + `</span>
                                    </div>
                                    <div class="quote-content">` + old_content + `</div>
                                    <span class="q-link">
                                        <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                    </span>
                                </div>`);
                            }
                        }
                    },
                    onChange: function (dialogApi, details) {
                        var data = dialogApi.getData();
                        var chooseType = data.choosetype;
                        if (chooseType == "1") {
                            tinymce.dom.DomQuery(".preview-content-block .blockquote").removeClass("type-2").removeClass("type-3").addClass("type-1");
                        }
                        else if (chooseType == "2") {
                            tinymce.dom.DomQuery(".preview-content-block .blockquote").removeClass("type-1").removeClass("type-3").addClass("type-2");
                        }
                        else if (chooseType == "3") {
                            tinymce.dom.DomQuery(".preview-content-block .blockquote").removeClass("type-1").removeClass("type-2").addClass("type-3");
                        }
                    },
                    onAction: function (dialogApi, details) {
                        var data = dialogApi.getData();
                        var chooseType = data.choosetype;
                        if (details.name === 'close') {
                            if (old_content != null) {
                                var q_avatar = "";
                                if (old_author_image != "") {
                                    q_avatar += `<span class="q-avatar"><img src="` + old_author_image + `"></span>`;
                                }
                                if (old_type == "1") {
                                    editor.insertContent(`<div class='tinybox block-quote' data-type='` + old_type + `' data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `' data-author-image='`+ old_author_image +`'>
                                        <div class="quote-content">` + old_content + `</div>
                                        <div class="quote-author">
                                            ` + q_avatar + `
                                            <span class="q-name">` + old_author_name + `</span>
                                            <span class="q-link">
                                                <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                            </span>
                                        </div>
                                    </div>`);
                                }
                                else if (old_type == "2") {
                                    editor.insertContent(`<div class='tinybox block-quote' data-type='` + old_type + `' data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `' data-author-image='`+ old_author_image +`'>
                                        <div class="icon-quote"></div>
                                        <div class="quote-content">` + old_content + `</div>
                                        <div class="quote-author">
                                            ` + q_avatar + `
                                            <span class="q-name">` + old_author_name + `</span>
                                            <span class="q-link">
                                                <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                            </span>
                                        </div>
                                    </div>`);
                                }
                                else if (old_type == "3") {
                                    editor.insertContent(`<div class='tinybox block-quote' data-type='` + old_type + `' data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `' data-author-image='`+ old_author_image +`'>
                                        <div class="quote-author">
                                            ` + q_avatar + `
                                            <span class="q-name">` + old_author_name + `</span>
                                        </div>
                                        <div class="quote-content">` + old_content + `</div>
                                        <span class="q-link">
                                            <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                        </span>
                                    </div>`);
                                }
                            }
                        } 
                        else if (details.name === 'done') {
                            var q_avatar = "";
                            if (author_image != "") {
                                q_avatar += `<span class="q-avatar"><img src="` + author_image + `"></span>`;
                            }
                            if (chooseType == "1") {
                                editor.insertContent(`<div class='tinybox block-quote' data-type='` + chooseType + `' data-content='` + quote_content + `' data-link='` + input_link + `' data-name='` + author_name + `' data-author-image='`+ author_image +`'>
                                    <div class="quote-content">` + quote_content + `</div>
                                    <div class="quote-author">
                                        ` + q_avatar + `
                                        <span class="q-name">` + author_name + `</span>
                                        <span class="q-link">
                                            <a href="` + input_link + `" target="_blank">` + input_link + `</a>
                                        </span>
                                    </div>
                                </div>`);
                            }
                            else if (chooseType == "2") {
                                editor.insertContent(`<div class='tinybox block-quote' data-type='` + chooseType + `' data-content='` + quote_content + `' data-link='` + input_link + `' data-name='` + author_name + `' data-author-image='`+ author_image +`'>
                                    <div class="icon-quote"></div>
                                    <div class="quote-content">` + quote_content + `</div>
                                    <div class="quote-author">
                                        ` + q_avatar + `
                                        <span class="q-name">` + author_name + `</span>
                                        <span class="q-link">
                                            <a href="` + input_link + `" target="_blank">` + input_link + `</a>
                                        </span>
                                    </div>
                                </div>`);
                            }
                            else if (chooseType == "3") {
                                editor.insertContent(`<div class='tinybox block-quote' data-type='` + chooseType + `' data-content='` + quote_content + `' data-link='` + input_link + `' data-name='` + author_name + `' data-author-image='`+ author_image +`'>
                                    <div class="quote-author">
                                        ` + q_avatar + `
                                        <span class="q-name">` + author_name + `</span>
                                    </div>
                                    <div class="quote-content">` + quote_content + `</div>
                                    <span class="q-link">
                                        <a href="` + input_link + `" target="_blank">` + input_link + `</a>
                                    </span>
                                </div>`);
                            }
                        }
                        
                        dialogApi.close();
                    }
                };
            }
            editor.ui.registry.addButton('quote_config', {
                icon: 'settings',
                tooltip: 'Cấu hình',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-quote');
                    var quote_content = el.getAttribute("data-content"),
                        author_name = el.getAttribute("data-name"),
                        input_link = el.getAttribute("data-link"),
                        type = el.getAttribute("data-type"),
                        author_image = el.getAttribute("data-author-image");
                    el.remove();
                    editor.windowManager.open(configQuote(quote_content, author_name, author_image, input_link, type, quote_content, author_name, author_image, input_link, type));
                    tinymce.dom.DomQuery(".tox-dialog").addClass("dialog-choose-type");
                }
            });
            editor.ui.registry.addButton('remove_quote', {
                icon: 'remove',
                tooltip: 'Xóa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-quote');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    el.remove();
                }
            });
            editor.ui.registry.addButton('add_line_top_toolbar_quote', {
                icon: 'action-prev',
                tooltip: 'Tạo dòng bên trên',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-quote');
                    var p = document.createElement("p");
                    var br = document.createElement("br");
                    br.setAttribute("data-mce-bogus", "1"); 
                    p.appendChild(br);
                    el.before(p);
                }
            });
            editor.ui.registry.addButton('add_line_bottom_toolbar_quote', {
                icon: 'action-next',
                tooltip: 'Tạo dòng bên dưới',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-quote');
                    var p = document.createElement("p");
                    var br = document.createElement("br");
                    br.setAttribute("data-mce-bogus", "1"); 
                    p.appendChild(br);
                    el.after(p);
                }
            });
            editor.ui.registry.addContextToolbar('toolbar_quote', {
                predicate: function (node) {
                    if (node.classList.contains('block-quote')) {
                        tinymce.DOM.addClass(node, 'selected');
                        return true;
                    }
                    tinymce.activeEditor.dom.removeClass(tinymce.activeEditor.dom.select('.block-quote'), 'selected');
                    return false;
                },
                items: 'quote_edit | quote_config | add_line_top_toolbar_quote | add_line_bottom_toolbar_quote | remove_quote',
                position: 'node',
                scope: 'node'
            });

            //Box tin liên quan
            editor.ui.registry.addButton('box_related_news', {
                icon: "checklist",
                tooltip: 'Chèn box tin liên quan',
                onAction: function () {
                    var model_dialog = new DialogBoxRelatedNews({"viewData": {"related_news": null, "type": "1"}});
                    model_dialog.dialog({size:"large"});
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    model_dialog.on("savePost", function(html) {
                        tinymce.dom.DomQuery(".tox-pop").removeClass("d-none");
                        editor.insertContent(html);
                    });
                }
            });
            editor.ui.registry.addButton('box_related_news_left', {
                icon: 'align-left',
                tooltip: 'Nằm bên trái',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.related-news-box');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    tinymce.DOM.removeClass(el, 'alignRight');
                    tinymce.DOM.addClass(el, 'alignLeft');
                }
            });
            editor.ui.registry.addButton('box_related_news_right', {
                icon: 'align-right',
                tooltip: 'Nằm bên phải',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.related-news-box');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    tinymce.DOM.removeClass(el, 'alignLeft');
                    tinymce.DOM.addClass(el, 'alignRight');
                }
            });
            editor.ui.registry.addButton('box_related_news_edit', {
                icon: 'edit-block',
                tooltip: 'Chỉnh sửa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.related-news-box');
                    var el_id = el.getAttribute("id");
                    var type = el.getAttribute("data-type");
                    var list_post = tinymce.activeEditor.dom.select('#' + el_id + ' .list-news li');
                    var related_news = [];
                    if (list_post instanceof Array && list_post.length > 0) {
                        for (var i = 0; i < list_post.length; i++) {
                            var el_img = $(list_post[i]).find(".link-callout img");
                            var post = {
                                "id": list_post[i].getAttribute("data-id"),
                                "title": list_post[i].getAttribute("data-title"),
                                "path": list_post[i].getAttribute("data-path"),
                                "image_thumbnail_url": el_img.attr("src"),
                                "publish_time": list_post[i].getAttribute("data-publish_time"),
                                "category_name": list_post[i].getAttribute("data-category_name")
                            };
                            related_news.push(post);
                        }
                    }
                    var model_dialog = new DialogBoxRelatedNews({"viewData": {"related_news": related_news, "box_related_news_id": el_id, "type": type}});
                    model_dialog.dialog({size:"large"});
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    model_dialog.on("savePost", function(html) {
                        tinymce.dom.DomQuery(".tox-pop").removeClass("d-none");
                        el.remove();
                        editor.insertContent(html);
                    });
                }
            });
            editor.ui.registry.addButton('box_related_news_config', {
                icon: 'settings',
                tooltip: 'Cấu hình',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.related-news-box');
                    var el_id = el.getAttribute("id");
                    var type = el.getAttribute("data-type");
                    var list_post = tinymce.activeEditor.dom.select('#' + el_id + ' .list-news li');
                    var related_news = [];
                    if (list_post instanceof Array && list_post.length > 0) {
                        for (var i = 0; i < list_post.length; i++) {
                            var el_img = $(list_post[i]).find(".link-callout img");
                            var post = {
                                "id": list_post[i].getAttribute("data-id"),
                                "title": list_post[i].getAttribute("data-title"),
                                "path": list_post[i].getAttribute("data-path"),
                                "image_thumbnail_url": el_img.attr("src"),
                                "publish_time": list_post[i].getAttribute("data-publish_time"),
                                "category_name": list_post[i].getAttribute("data-category_name")
                            };
                            related_news.push(post);
                        }
                    }
                    var model_dialog = new DialogChooseType({"viewData": {"list_post": related_news, "type": type}});
                    model_dialog.dialog({size:"small"});
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    model_dialog.on("chooseType", function(html) {
                        tinymce.dom.DomQuery(".tox-pop").removeClass("d-none");
                        el.remove();
                        editor.insertContent(html);
                    });
                }
            });
            editor.ui.registry.addButton('remove_box_related_news', {
                icon: 'remove',
                tooltip: 'Xóa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.related-news-box');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    el.remove();
                }
            });
            editor.ui.registry.addButton('add_line_top_box_related_news', {
                icon: 'action-prev',
                tooltip: 'Tạo dòng bên trên',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.related-news-box');
                    var p = document.createElement("p");
                    var br = document.createElement("br");
                    br.setAttribute("data-mce-bogus", "1"); 
                    p.appendChild(br);
                    el.before(p);
                }
            });
            editor.ui.registry.addButton('add_line_bottom_box_related_news', {
                icon: 'action-next',
                tooltip: 'Tạo dòng bên dưới',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.related-news-box');
                    var p = document.createElement("p");
                    var br = document.createElement("br");
                    br.setAttribute("data-mce-bogus", "1"); 
                    p.appendChild(br);
                    el.after(p);
                }
            });
            editor.ui.registry.addContextToolbar('toolbar_box_related_news', {
                predicate: function (node) {
                    if (node.classList.contains('related-news-box')) {
                        tinymce.DOM.addClass(node, 'selected');
                        return true;
                    }
                    tinymce.activeEditor.dom.removeClass(tinymce.activeEditor.dom.select('.related-news-box'), 'selected');
                    return false;
                },
                items: 'box_related_news_left | box_related_news_right | box_related_news_edit | box_related_news_config | add_line_top_box_related_news | add_line_bottom_box_related_news | remove_box_related_news',
                position: 'node',
                scope: 'node'
            });

            //Chèn 1 tin liên quan
            editor.ui.registry.addButton('related_one_news', {
                icon: "new-document",
                tooltip: 'Chèn 1 tin liên quan',
                onAction: function () {
                    var model_dialog = new DialogRelatedOneNews({"viewData": {"related_one_news": null}});
                    model_dialog.dialog({size:"large"});
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    model_dialog.on("savePost", function(html) {
                        editor.insertContent(html);
                    });
                }
            });
            editor.ui.registry.addButton('related_one_news_edit', {
                icon: 'edit-block',
                tooltip: 'Chỉnh sửa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.related-one-news');
                    var el_img = $(el).find(".related-one-news-img img");
                    var related_one_news = {
                        "id": el.getAttribute("data-id"),
                        "title": el.getAttribute("data-title"),
                        "description": el.getAttribute("data-description"),
                        "path": el.getAttribute("data-path"),
                        "image_thumbnail_url": el_img.attr("src")
                    };
                    var model_dialog = new DialogRelatedOneNews({"viewData": {"related_one_news": related_one_news}});
                    model_dialog.dialog({size:"large"});
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    model_dialog.on("savePost", function(html) {
                        el.remove();
                        editor.insertContent(html);
                    });
                }
            });
            editor.ui.registry.addButton('remove_related_one_news', {
                icon: 'remove',
                tooltip: 'Xóa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.related-one-news');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    el.remove();
                }
            });
            editor.ui.registry.addButton('add_line_top_related_one_news', {
                icon: 'action-prev',
                tooltip: 'Tạo dòng bên trên',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.related-one-news');
                    var p = document.createElement("p");
                    var br = document.createElement("br");
                    br.setAttribute("data-mce-bogus", "1"); 
                    p.appendChild(br);
                    el.before(p);
                }
            });
            editor.ui.registry.addButton('add_line_bottom_related_one_news', {
                icon: 'action-next',
                tooltip: 'Tạo dòng bên dưới',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.related-one-news');
                    var p = document.createElement("p");
                    var br = document.createElement("br");
                    br.setAttribute("data-mce-bogus", "1"); 
                    p.appendChild(br);
                    el.after(p);
                }
            });
            editor.ui.registry.addContextToolbar('toolbar_related_one_news', {
                predicate: function (node) {
                    if (node.classList.contains('related-one-news')) {
                        tinymce.DOM.addClass(node, 'selected');
                        return true;
                    }
                    tinymce.activeEditor.dom.removeClass(tinymce.activeEditor.dom.select('.related-one-news'), 'selected');
                    return false;
                },
                items: 'related_one_news_edit | add_line_top_related_one_news | add_line_bottom_related_one_news | remove_related_one_news',
                position: 'node',
                scope: 'node'
            });

            //Box nội dung nổi bật
            function chooseTypeBoxHighlight(highlight_content = "", input_link = "", type = "1", old_content = null, old_link = "", old_type = "1") {
                return {
                    title: 'Chọn mẫu hiển thị nội dung nổi bật',
                    body: {
                        type: 'panel',
                        items: [
                            {
                                type: 'selectbox',
                                name: 'choosetype',
                                label: 'Chọn kiểu hiển thị',
                                class: "sss",
                                items: [
                                    { value: "1", text: 'Mẫu 1' },
                                    { value: "2", text: 'Mẫu 2' },
                                    { value: "3", text: 'Mẫu 3' }
                                ]
                            },
                            {
                                type: 'htmlpanel',
                                html: `<div class="preview-content-block">
                                        <div class="boxhighlight type-` + type + `">
                                            <div class="boxhighlight-content">` + highlight_content + `</div>
                                            <div class="boxhighlight-link">` + input_link + `</div>
                                        </div>
                                    </div>`                                  
                            }
                        ]
                    },
                    buttons: [
                        {
                            type: 'custom',
                            name: 'edit',
                            text: 'Sửa',
                            disabled: false
                        },
                        {
                            type: 'custom',
                            name: 'done',
                            text: 'Hoàn tất',
                            primary: true,
                            disabled: false
                        }
                    ],
                    initialData: {
                        choosetype: type
                    },
                    onCancel: () => {
                        if (old_content != null) {
                            editor.insertContent(`<div class="tinybox box-highlight" data-type="` + old_type + `" data-content='` + old_content + `' data-link='` + old_link + `'>
                                <div class="boxhighlight-content">` + old_content + `</div>
                                <a href="` + old_link + `" class="boxhighlight-link" target="_blank">` + old_link + `</a> 
                            </div>`);
                        }
                    },
                    onChange: function (dialogApi, details) {
                        var data = dialogApi.getData();
                        var chooseType = data.choosetype;
                        //Thay đổi class màn hình preview
                        if (chooseType == "1") {
                            tinymce.dom.DomQuery(".preview-content-block .boxhighlight").removeClass("type-2").removeClass("type-3").addClass("type-1");
                        }
                        else if (chooseType == "2") {
                            tinymce.dom.DomQuery(".preview-content-block .boxhighlight").removeClass("type-1").removeClass("type-3").addClass("type-2");
                        }
                        else if (chooseType == "3") {
                            tinymce.dom.DomQuery(".preview-content-block .boxhighlight").removeClass("type-1").removeClass("type-2").addClass("type-3");
                        }
                    },
                    onAction: function (dialogApi, details) {
                        var data = dialogApi.getData();
                        var chooseType = data.choosetype;
                        if (details.name === 'edit') {
                            if (highlight_content != null) {
                                highlight_content = highlight_content.replace(/<br\s?\/?>/g,"\n");
                            }
                            if (old_content != null) {
                                old_content = old_content.replace(/<br\s?\/?>/g,"\n");
                            }
                            editor.windowManager.open(editBoxHighlight(highlight_content, input_link, chooseType, old_content, old_link, old_type));
                            tinymce.dom.DomQuery(".tox-dialog").addClass("dialog-edit");
                        } 
                        else if (details.name === 'done') {
                            editor.insertContent(`<div class="tinybox box-highlight" data-type="` + chooseType + `" data-content='` + highlight_content + `' data-link='` + input_link + `'>
                                <div class="boxhighlight-content">` + highlight_content + `</div>
                                <a href="` + input_link + `" class="boxhighlight-link" target="_blank">` + input_link + `</a> 
                            </div>`);
                        }
                        
                        dialogApi.close();
                    }
                };
            }
            function editBoxHighlight(highlight_content = "", input_link = "", type = "1", old_content = null, old_link = "", old_type = "1")
            {
                return {
                    title: 'Nội dung nổi bật',
                    body: {
                        type: 'panel',
                        items: [
                            {
                                type: 'textarea',
                                name: 'highlight_content',
                            },
                            {
                                type: 'input',
                                name: 'input_link',
                                label: 'Link đính kèm'
                            }
                        ]
                    },
                    initialData: {
                        highlight_content: highlight_content,
                        input_link: input_link
                    },
                    buttons: [
                        {
                            text: 'Đóng',
                            type: 'custom',
                            name: 'close',
                            disabled: false
                        },
                        {
                            type: 'custom',
                            name: 'choose',
                            text: 'Chọn mẫu',
                            primary: true,
                            disabled: false
                        }
                    ],
                    onCancel: () => {
                        if (old_content != null) {
                            old_content = old_content.replace(/\r\n|\r|\n/g,"<br />");
                            editor.insertContent(`<div class="tinybox box-highlight" data-type="` + old_type + `" data-content='` + old_content + `' data-link='` + old_link + `'>
                                <div class="boxhighlight-content">` + old_content + `</div>
                                <a href="` + old_link + `" class="boxhighlight-link" target="_blank">` + old_link + `</a> 
                            </div>`);
                        }
                    },
                    onChange: function (dialogApi, details) {
                        var data = dialogApi.getData();
                        var toggle = data.highlight_content != "" ? dialogApi.enable : dialogApi.disable;
                        toggle('choose');
                    },
                    onAction: function (api, details) {
                        if (details.name == "close") {
                            if (old_content != null) {
                                old_content = old_content.replace(/\r\n|\r|\n/g,"<br />");
                                editor.insertContent(`<div class="tinybox box-highlight" data-type="` + old_type + `" data-content='` + old_content + `' data-link='` + old_link + `'>
                                    <div class="boxhighlight-content">` + old_content + `</div>
                                    <a href="` + old_link + `" class="boxhighlight-link" target="_blank">` + old_link + `</a> 
                                </div>`);
                            }
                            api.close();
                        }
                        else if (details.name == "choose") {
                            var data = api.getData();
                            var highlight_content = data.highlight_content;
                            if (highlight_content == "") {
                                alert("Vui lòng nhập nội dung nổi bật!");
                            }
                            else {
                                var input_link = data.input_link;
                                if (highlight_content != null) {
                                    highlight_content = highlight_content.replace(/\r\n|\r|\n/g,"<br />");
                                }
                                if (old_content != null) {
                                    old_content = old_content.replace(/\r\n|\r|\n/g,"<br />");
                                }
                                api.close();
                                editor.windowManager.open(chooseTypeBoxHighlight(highlight_content, input_link, type, old_content, old_link, old_type));
                                tinymce.dom.DomQuery(".tox-dialog").addClass("dialog-choose-type");
                            }
                            
                        }
                    }
                };
            }
            editor.ui.registry.addButton('box_highlight', {
                icon: "comment",
                tooltip: 'Box nội dung nổi bật',
                onAction: function () {
                    editor.windowManager.open(editBoxHighlight());
                    tinymce.dom.DomQuery(".tox-dialog").addClass("dialog-edit");
                }
            });
            editor.ui.registry.addButton('box_highlight_edit', {
                icon: 'edit-block',
                tooltip: 'Chỉnh sửa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.box-highlight');
                    var highlight_content = el.getAttribute("data-content"),
                        input_link = el.getAttribute("data-link"),
                        type = el.getAttribute("data-type");
                    el.remove();
                    if (highlight_content != null) {
                        highlight_content = highlight_content.replace(/<br\s?\/?>/g,"\n");
                    }
                    editor.windowManager.open(editBoxHighlight(highlight_content, input_link, type, highlight_content, input_link, type));
                    tinymce.dom.DomQuery(".tox-dialog").addClass("dialog-edit");
                }
            });
            function configBoxHighlight(highlight_content = "", input_link = "", type = "1", old_content = null, old_link = "", old_type = "1") {
                return {
                    title: 'Chọn mẫu hiển thị nội dung nổi bật',
                    body: {
                        type: 'panel',
                        items: [
                            {
                                type: 'selectbox',
                                name: 'choosetype',
                                label: 'Chọn kiểu hiển thị',
                                class: "sss",
                                items: [
                                    { value: "1", text: 'Mẫu 1' },
                                    { value: "2", text: 'Mẫu 2' },
                                    { value: "3", text: 'Mẫu 3' },
                                ]
                            },
                            {
                                type: 'htmlpanel',
                                html: `<div class="preview-content-block">
                                        <div class="boxhighlight type-` + type + `">
                                            <div class="boxhighlight-content">` + highlight_content + `</div>
                                            <div class="boxhighlight-link">` + input_link + `</div>
                                        </div>
                                    </div>`                                  
                            }
                        ]
                    },
                    buttons: [
                        {
                            text: 'Đóng',
                            type: 'custom',
                            name: 'close',
                            disabled: false
                        },
                        {
                            type: 'custom',
                            name: 'done',
                            text: 'Hoàn tất',
                            primary: true,
                            disabled: false
                        }
                    ],
                    initialData: {
                        choosetype: type
                    },
                    onCancel: () => {
                        if (old_content != null) {
                            editor.insertContent(`<div class="tinybox box-highlight" data-type="` + old_type + `" data-content='` + old_content + `' data-link='` + old_link + `'>
                                <div class="boxhighlight-content">` + old_content + `</div>
                                <a href="` + old_link + `" class="boxhighlight-link" target="_blank">` + old_link + `</a> 
                            </div>`);
                        }
                    },
                    onChange: function (dialogApi, details) {
                        var data = dialogApi.getData();
                        var chooseType = data.choosetype;
                        //Thay đổi class màn hình preview
                        if (chooseType == "1") {
                            tinymce.dom.DomQuery(".preview-content-block .boxhighlight").removeClass("type-2").removeClass("type-3").addClass("type-1");
                        }
                        else if (chooseType == "2") {
                            tinymce.dom.DomQuery(".preview-content-block .boxhighlight").removeClass("type-1").removeClass("type-3").addClass("type-2");
                        }
                        else if (chooseType == "3") {
                            tinymce.dom.DomQuery(".preview-content-block .boxhighlight").removeClass("type-1").removeClass("type-2").addClass("type-3");
                        }
                    },
                    onAction: function (dialogApi, details) {
                        if (details.name == "close") {
                            if (old_content != null) {
                                editor.insertContent(`<div class="tinybox box-highlight" data-type="` + old_type + `" data-content='` + old_content + `' data-link='` + old_link + `'>
                                    <div class="boxhighlight-content">` + old_content + `</div>
                                    <a href="` + old_link + `" class="boxhighlight-link" target="_blank">` + old_link + `</a> 
                                </div>`);
                            }
                        }
                        else if (details.name === 'done') {
                            var data = dialogApi.getData();
                            var chooseType = data.choosetype;
                            editor.insertContent(`<div class="tinybox box-highlight" data-type="` + chooseType + `" data-content='` + highlight_content + `' data-link='` + input_link + `'>
                                <div class="boxhighlight-content">` + highlight_content + `</div>
                                <a href="` + input_link + `" class="boxhighlight-link" target="_blank">` + input_link + `</a> 
                            </div>`);
                        }
                        
                        dialogApi.close();
                    }
                };
            }
            editor.ui.registry.addButton('box_highlight_config', {
                icon: 'settings',
                tooltip: 'Cấu hình',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.box-highlight');
                    var highlight_content = el.getAttribute("data-content"),
                        input_link = el.getAttribute("data-link"),
                        type = el.getAttribute("data-type");
                    el.remove();
                    editor.windowManager.open(configBoxHighlight(highlight_content, input_link, type, highlight_content, input_link, type));
                    tinymce.dom.DomQuery(".tox-dialog").addClass("dialog-choose-type");
                }
            });
            editor.ui.registry.addButton('remove_box_highlight', {
                icon: 'remove',
                tooltip: 'Xóa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.box-highlight');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    el.remove();
                }
            });
            editor.ui.registry.addButton('add_line_top_box_highlight', {
                icon: 'action-prev',
                tooltip: 'Tạo dòng bên trên',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.box-highlight');
                    var p = document.createElement("p");
                    var br = document.createElement("br");
                    br.setAttribute("data-mce-bogus", "1"); 
                    p.appendChild(br);
                    el.before(p);
                }
            });
            editor.ui.registry.addButton('add_line_bottom_box_highlight', {
                icon: 'action-next',
                tooltip: 'Tạo dòng bên dưới',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.box-highlight');
                    var p = document.createElement("p");
                    var br = document.createElement("br");
                    br.setAttribute("data-mce-bogus", "1"); 
                    p.appendChild(br);
                    el.after(p);
                }
            });
            editor.ui.registry.addContextToolbar('toolbar_box_highlight', {
                predicate: function (node) {
                    if (node.classList.contains('box-highlight')) {
                        tinymce.DOM.addClass(node, 'selected');
                        return true;
                    }
                    tinymce.activeEditor.dom.removeClass(tinymce.activeEditor.dom.select('.box-highlight'), 'selected');
                    return false;
                },
                items: 'box_highlight_edit | box_highlight_config | add_line_top_box_highlight | add_line_bottom_box_highlight | remove_box_highlight',
                position: 'node',
                scope: 'node'
            });
        },
        selectizeCategory: function() {
            var self = this;
            var selectize_load_first = true;
            var $selectize = self.$el.find('#category_parent').selectize({
                maxItems: 1,
                valueField: 'id',
                labelField: 'name',
                searchField: ['name', 'unsigned_name'],
                preload: true,
                placeholder: "Chọn chuyên mục",
                
                load: function(query, callback) {
                    var url = (self.getApp().serviceURL || "") + '/api/v1/get-list-category?donvi_id=' + self.donvi_id_filter + (query ? "&text_filter=" + query : "");
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
                            
                            if (selectize_load_first) {
                                selectize_load_first = false;
                                var category_id = self.model.get('category_id');
                                if (category_id != "" && category_id != null && category_id != undefined) {
                                    $selectize[0].selectize.setValue(category_id);
                                }
                            }
                            
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
        selectizeRelatedCategory: function() {
            var self = this;
            var selectize_load_first = true;
            var $selectize = self.$el.find('#selectize-related_category').selectize({
                plugins: ["remove_button"],
                valueField: 'id',
                labelField: 'name',
                searchField: ['name', 'unsigned_name'],
                preload: true,
                placeholder: "Chọn chuyên mục",
                
                load: function(query, callback) {
                    var url = (self.getApp().serviceURL || "") + '/api/v1/get-list-category?donvi_id=' + self.donvi_id_filter + (query ? "&text_filter=" + query : "");
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
                            
                            if (selectize_load_first) {
                                selectize_load_first = false;
                                var related_category = self.model.get('related_category');
                                if (related_category instanceof Array && related_category.length > 0) {
                                    $selectize[0].selectize.setValue(related_category);
                                }
                            }
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
                    self.addRelatedCategory(value);
                },
                onItemRemove: function(value) {
                    self.removeRelatedCategory(value);
                }
            });
        },
        addRelatedCategory: function(data) {
            var self = this;
            var related_category = self.model.get('related_category');
            if (related_category == null || related_category == undefined || !(related_category instanceof Array)) {
                related_category = [];
			}
            if (related_category instanceof Array) {
                var array_id = [];
                if (related_category.length == 0) {
                    array_id.push(data);
                } 
                else {
                    for (var i = 0; i < related_category.length; i++) {
                        if (data == related_category[i]) {
                            continue
                        } 
                        else {
                            array_id.push(related_category[i]);
                        }
                    }
                    array_id.push(data);
				}
				self.model.set("related_category", array_id);
            }
        },
        removeRelatedCategory: function(data) {
            var self = this;
			var related_category = self.model.get('related_category');
            // chinhnv_review: có thể dùng Array.filter để gọn code hơn.
            if (related_category instanceof Array && related_category.length > 0) {
                var item = related_category.filter(e => e === data);
                item.forEach(f => related_category.splice(related_category.findIndex(e => e === f),1));
                self.model.set("related_category", related_category);
                // var array_id = [];
                // for (var i = 0; i < related_category.length; i++) {
                //     if (data == related_category[i]) {
                //         continue
                //     } else {
                //         array_id.push(related_category[i]);
                //     }
				// }
				// self.model.set("related_category", array_id);
                return;
            }
        },
        btn_related_news: function(){
            var self = this;
            self.$el.find("#btn_related_news").unbind("click").bind("click", function() {
                var related_news = self.model.get("related_news");
                var model_dialog = new ModelDialogView({"viewData": {"related_news": related_news}});
                model_dialog.dialog({size:"large"});
                model_dialog.on("savePost", function(item) {
                    self.model.set("related_news", item);
                    self.renderRelatedNews();
                });
            });
        },
        renderRelatedNews: function() {
            var self = this;
            var related_news = self.model.get("related_news");
            if (related_news instanceof Array && related_news.length > 0) {
                self.$el.find("#list_post").html("");
                var data = JSON.stringify({
                    data: related_news,
                    donvi_id: self.donvi_id_filter
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
                                self.renderImgNews(list_related_news[i]);
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
        },
        renderImgNews: function(post) {
            var self = this;
            self.$el.find("#list_post").append(`
            <li class="post" id="post_` + post.id + `">
                <div class="img_post"> 
                    <img src="`+ post.image_thumbnail + `" alt="img">
                </div>
                <div class="content_post">
                    <h5 style="margin-top: 0px !important">` + post.title + `</h5>
                    <ul class="post_details simple">
                        <li class="category">` + post.category_name + `</li>
                    </ul>
                </div>
                <span class="delete-related-new text-danger" id="delete_` + post.id + `" title="Xóa">&times;</span>
            </li>
            `);
            self.$el.find("#delete_" + post.id).unbind("click").bind("click", function() {
                self.$el.find("#post_" + post.id).remove();
                self.deletePost(post);
            });
        },
        deletePost: function(post){
            var self = this;
            var related_news = self.model.get("related_news");
            if (related_news instanceof Array && related_news.length > 0) {
                var array_related_news = [];
                for (var i = 0; i < related_news.length; i++) {
                    if (post.id == related_news[i]) {
                        continue
                    } else {
                        array_related_news.push(related_news[i]);
                    }
				}
                self.model.set("related_news", array_related_news);
                return;
            }
        },
        validate: function() {
            var self = this;
            var title = self.model.get("title"),
                category_id = self.model.get("category_id"),
                image_thumbnail = self.model.get("image_thumbnail"),
                avatar_vuong = self.model.get("avatar_vuong"),
                tac_gia = self.model.get("tac_gia"),
                description = self.model.get("description"),
                default_path = self.model.get("default_path"),
                detail_path = self.model.get("detail_path");
            
            if (title == null|| title == undefined || title.trim() == "") {
                self.getApp().notify({message: "Vui lòng nhập tiêu đề bài viết"}, {type: "danger", delay: 1000});
                return false;
            } 
            else if (!category_id || category_id == null || category_id == "") {
                self.getApp().notify({message: "Vui lòng chọn chuyên mục chính cho bài viết"}, {type: "danger", delay: 1000});
                return false;
            } 
            else if (!tac_gia || tac_gia == null || tac_gia == "") {
                self.getApp().notify({message: "Vui lòng nhập tác giả cho bài viết"}, {type: "danger", delay: 1000});
                return false;
            } 
            else if (!image_thumbnail || image_thumbnail == null || image_thumbnail == "") {
                self.getApp().notify({message: "Vui lòng chọn ảnh đại diện thường cho bài viết"}, {type: "danger", delay: 1000});
                return false;
            } 
            if (self.getApp().project_name == "TINTUC_SO_BMTE") {
                if (!avatar_vuong || avatar_vuong == null || avatar_vuong == "") {
                    self.getApp().notify({message: "Vui lòng chọn ảnh đại diện vuông cho bài viết"}, {type: "danger", delay: 1000});
                    return false;
                }
            }

            if (!!detail_path) {
                detail_path = detail_path.trim();
                self.model.set("detail_path", detail_path);
            }

            if (default_path === false && (detail_path == null || detail_path == undefined || detail_path.trim() == "")) {
                self.getApp().notify({message: "Vui lòng nhập đường dẫn bài viết"}, {type: "danger", delay: 1000});
                return false;
            }
            
            title = title.trim();
            self.model.set("title", title);
            if (!(self.model.get("title_google"))) {
                self.model.set("title_google", title);
            }
            if (!!description) {
                description = description.trim();
                self.model.set("description", description);
                if (!(self.model.get("description_google"))) {
                    self.model.set("description_google", description);
                }
            }
            
            return true;
        },
        previewSeoGoogle: function() {
            var self = this;
            
            if (!!(self.model.get("title_google"))) {
                self.$el.find(".seo-preview .title").text(self.model.get("title_google"))
            }
            else if (!!(self.model.get("title"))) {
                self.$el.find(".seo-preview .title").text(self.model.get("title"))
            }
            
            if (!!(self.model.get("description_google"))) {
                self.$el.find(".seo-preview .sapo").text(self.model.get("description_google"))
            }
            else if (!!(self.model.get("description"))) {
                self.$el.find(".seo-preview .sapo").text(self.model.get("description"))
            }
        },
        eventKeyup: function() {
            var self = this;
            self.$el.find("#title").keyup(function() {
                var title = $(this).val();
                self.model.set("title", title);
                self.previewSeoGoogle();
            });
            self.$el.find("#description").keyup(function() {
                var description = $(this).val();
                self.model.set("description", description);
                self.previewSeoGoogle();
            });
            self.$el.find("#title_google").keyup(function() {
                var title_google = $(this).val();
                self.model.set("title_google", title_google);
                self.previewSeoGoogle();
            });
            self.$el.find("#description_google").keyup(function() {
                var description_google = $(this).val();
                self.model.set("description_google", description_google);
                self.previewSeoGoogle();
            });
        },
        getAgeGroup: function() {
            var self = this;
            $.ajax({
                url: (self.getApp().serviceURL || "") + '/api/v1/get_nhomtuoi',
                type: 'GET',
                headers: {
                    'content-type': 'application/json'
                },
                dataType: 'json',
                success: function(res) {
                    if (res.objects) {
                        var obj = res.objects;
                        var array_dict = [
                            {
                                id: "mang_thai_1",
                                ten_nhom: "3 tháng đầu thai kỳ",
                                tenkhongdau: "3 thang dau thai ky"
                            },
                            {
                                id: "mang_thai_2",
                                ten_nhom: "3 tháng giữa thai kỳ",
                                tenkhongdau: "3 thang giua thai ky"
                            },
                            {
                                id: "mang_thai_3",
                                ten_nhom: "3 tháng cuối thai kỳ",
                                tenkhongdau: "3 thang cuoi thai ky"
                            }
                        ];
                        obj = array_dict.concat(obj);
                        self.selectizeAgeGroup(obj);
                    }
                },
                error: function (xhr, status, error) {
                    try {
                        if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED"){
                            self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                            self.getApp().getRouter().navigate("login");
                        } else {
                            self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                        }
                    }
                    catch (err) {
                        self.getApp().notify({ message: "Lấy dữ liệu không thành công"}, { type: "danger", delay: 1000 });
                    }
                }
            });
        },
        selectizeAgeGroup: function(danhsach) {
            var self = this;
            var $selectize = self.$el.find('#selectize-age_group').selectize({
                plugins: ["remove_button"],
                valueField: 'id',
                labelField: 'ten_nhom',
                searchField: ['ten_nhom', 'tenkhongdau'],
                preload: true,
                placeholder: "Chọn nhóm tuổi",
                options: danhsach,
                onItemAdd: function(value, $item) {
                    self.addAgeGroup(value);
                },
                onItemRemove: function(value) {
                    self.removeAgeGroup(value);
                }
            });
            var age_group = self.model.get('age_group');
            if (age_group instanceof Array && age_group.length > 0) {
                $selectize[0].selectize.setValue(age_group);
            }
        },
        addAgeGroup: function(data) {
            var self = this;
            var age_group = self.model.get('age_group');
            if (age_group == null || age_group == undefined || !(age_group instanceof Array)) {
                age_group = [];
			}
            if (age_group instanceof Array) {
                var array_id = [];
                if (age_group.length == 0) {
                    array_id.push(data);
                } 
                else {
                    for (var i = 0; i < age_group.length; i++) {
                        if (data == age_group[i]) {
                            continue
                        } 
                        else {
                            array_id.push(age_group[i]);
                        }
                    }
                    array_id.push(data);
				}
				self.model.set("age_group", array_id);
            }
        },
        removeAgeGroup: function(data) {
            var self = this;
			var age_group = self.model.get('age_group');
            if (age_group instanceof Array && age_group.length > 0) {
                var item = age_group.filter(e => e === data);
                item.forEach(f => age_group.splice(age_group.findIndex(e => e === f),1));
                self.model.set("age_group", age_group);
                return;
            }
        },
        viewHistory: function(){
            var self = this;
            var post_id = self.model.get('id');
            if (post_id == null || post_id == undefined || post_id == ""){
                self.getApp().notify("Không có lịch sử thay đổi");
                return false;
            } else {
                var history_dialog = new HistoryDialog({"viewData": {"post_id": post_id}});
                history_dialog.dialog({size:"large"});
            }
        },
        controlSelectize: function() {
            var self = this;
            if (!!self.model.get('province_id')) {
                self.$el.find("#quanhuyen")[0].selectize.enable();
            } else {
                self.$el.find("#quanhuyen")[0].selectize.disable();

            }
            if (!!self.model.get('district')) {
                self.$el.find("#xaphuong")[0].selectize.enable();
            } else {
                self.$el.find("#xaphuong")[0].selectize.disable();

            }
        },
        loadTinhThanh: function(query = '', callback) {
            var self = this;
            var query_filter = {
                "filters": {
                    "$and": [
                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } }
                    ],
                },
                "order_by": [{ "field": "ten", "direction": "asc" }]
            };
            var url = (self.getApp().serviceURL || "") + "/api/v1/tinhthanh_filter?results_per_page=100" + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: function(response) {
                    callback(response.objects);
                    if (!!self.model.get('province_id')) {
                        self.$el.find('#tinhthanh')[0].selectize.setValue(self.model.get('province_id'));
                    }
                },
                error: function() {
                    callback();
                },
            });
        },
        loadQuanHuyen: function(query = '', callback) {
            var self = this;
            if (!!self.model.get('province_id')) {
                var query_filter = {
                    "filters": {
                        "$and": [
                            { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                            { "tinhthanh_id": { "$eq": self.model.get("province_id") } }
                        ],
                    },
                    "order_by": [{ "field": "ten", "direction": "asc" }]
                };
            } else {
                var query_filter = {
                    "filters": {
                        "$and": [
                            { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } }
                        ],
                    },
                    "order_by": [{ "field": "ten", "direction": "asc" }]
                };
            }

            var url = (self.getApp().serviceURL || "") + "/api/v1/quanhuyen_filter?results_per_page=50" + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: function(response) {
                    callback(response.objects);
                    if (!!self.model.get('district')) {
                        self.$el.find('#quanhuyen')[0].selectize.setValue(self.model.get("district").id)
                    }
                },
                error: function() {
                    callback();
                },
            });
        },
        loadXaPhuong: function(query = '', callback) {
            var self = this;
            if (!!self.model.get('district')) {
                var query_filter = {
                    "filters": {
                        "$and": [
                            { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                            { "quanhuyen_id": { "$eq": self.model.get("district").id } }
                        ],
                    },
                    "order_by": [{ "field": "ten", "direction": "asc" }]
                };
            } else {
                var query_filter = {
                    "filters": {
                        "$and": [
                            { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } }
                        ],
                    },
                    "order_by": [{ "field": "ten", "direction": "asc" }]
                };
            }
            var url = (self.getApp().serviceURL || "") + "/api/v1/xaphuong_filter?results_per_page=100" + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: function(response) {
                    callback(response.objects);
                    if (!!self.model.get('ward')) {
                        self.$el.find('#xaphuong')[0].selectize.setValue(self.model.get('ward').id)
                    }
                },
                error: function() {
                    callback();
                },
            });
        },
        selectizeTinhThanh: function() {
            var self = this;
            var $select = self.$el.find("#tinhthanh").selectize({
                maxItems: 1,
                valueField: "id",
                labelField: "ten",
                searchField: ["ten", "tenkhongdau"],
                preload: true,
                placeholder: "Tỉnh thành",
                load: function(query, callback) {
                    self.loadTinhThanh(query, callback);
                },

                onItemAdd: function(value, $item) {
                    var obj = $select[0].selectize.options[value];
                    delete obj.$order;
                    self.model.set({
                        "province_id": value
                    });
                    if (!!self.model.get('district') && self.model.get('district').tinhthanh_id != value) {
                        self.model.set({
                            "district": null,
                            "ward": null
                        })
                        self.$el.find("#quanhuyen")[0].selectize.clear();
                        self.$el.find("#xaphuong")[0].selectize.clear();
                    }


                    if ((!!self.model.get('district') && self.model.get('district').tinhthanh_id != value) || !self.model.get('district')) {
                        self.$el.find("#quanhuyen")[0].selectize.clearOptions();
                        self.$el.find("#xaphuong")[0].selectize.clearOptions();
                        self.$el.find("#quanhuyen")[0].selectize.load(function(callback) {
                            self.loadQuanHuyen('', callback);
                        });
                    }

                    self.controlSelectize();
                },
                onItemRemove: function() {
                    self.model.set({
                        "province_id": null,
                        "district": null,
                        "ward": null
                    });
                    self.$el.find("#quanhuyen")[0].selectize.clear();
                    self.$el.find("#quanhuyen")[0].selectize.clearOptions();
                    self.$el.find("#xaphuong")[0].selectize.clear();
                    self.$el.find("#xaphuong")[0].selectize.clearOptions();
                    self.controlSelectize();
                }
            });
        },
        selectizeQuanHuyen: function() {
            var self = this;
            var $select = self.$el.find("#quanhuyen").selectize({
                maxItems: 1,
                valueField: "id",
                labelField: "ten",
                searchField: ["ten", "tenkhongdau"],
                preload: true,
                placeholder: "Quận huyện",
                load: function(query, callback) {
                    self.loadQuanHuyen(query, callback);
                },

                onItemAdd: function(value, $item) {
                    var obj = $select[0].selectize.options[value];
                    delete obj.$order;
                    var quanhuyen = {
                        "id": obj.id,
                        "ten": obj.ten,
                        "tinhthanh_id": obj.tinhthanh_id
                    }
                    self.model.set({
                        "district": quanhuyen
                    });
                    if (!!self.model.get('ward') && self.model.get('ward').quanhuyen_id != value) {
                        self.model.set({
                            "ward": null
                        })
                        self.$el.find("#xaphuong")[0].selectize.clear();
                    }

                    self.controlSelectize();
                    if ((!!self.model.get('ward') && self.model.get('ward').quanhuyen_id != value) || !self.model.get('ward')) {
                        self.$el.find("#xaphuong")[0].selectize.clearOptions();
                        self.$el.find("#xaphuong")[0].selectize.load(function(callback) {
                            self.loadXaPhuong('', callback);
                        });
                    }
                },
                onItemRemove: function() {
                    self.model.set({
                        "district": null,
                        "ward": null
                    });
                    self.$el.find("#xaphuong")[0].selectize.clear();
                    self.$el.find("#xaphuong")[0].selectize.clearOptions(); 
                    self.controlSelectize();
                }
            });
        },
        selectizeXaPhuong: function() {
            var self = this;
            var $select = self.$el.find("#xaphuong").selectize({
                maxItems: 1,
                valueField: "id",
                labelField: "ten",
                searchField: ["ten", "tenkhongdau"],
                preload: true,
                placeholder: "Xã Phường",
                load: function(query, callback) {
                    self.loadXaPhuong(query, callback);
                },

                onItemAdd: function(value, $item) {
                    var obj = $select[0].selectize.options[value];
                    delete obj.$order;
                    var xaphuong = {
                        "id": obj.id,
                        "ten": obj.ten,
                        "quanhuyen_id": obj.quanhuyen_id
                    }
                    self.model.set({
                        "ward": xaphuong,
                    });

                },
                onItemRemove: function() {
                    self.model.set({
                        "ward": null
                    });
                    self.controlSelectize();

                }
            });
        },
        getAuthor: function(query = '', callback) {
            var self = this;
            var query_filter = {
                "filters": {
                    "$and": [
                        { "donvi_id": self.donvi_id_filter }
                    ]
                },
                "order_by": [{ "field": "unsigned_name", "direction": "asc" }]
            };
            if (!!query) {
                query_filter['filters']['$and'].push({ "text_filter": query });
            }
            var url = (self.getApp().serviceURL || "") + "/api/v1/author?results_per_page=100" + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
            $.ajax({
                url: url,
                type: 'GET',
                headers: {
                    'content-type': 'application/json'
                },
                dataType: 'json',
                success: function(res) {
                    callback(res.objects);
                    if (!!self.model.get('author_id')) {
                        self.$el.find('#selectize_author')[0].selectize.setValue(self.model.get('author_id'));
                    }
                },
                error: function (xhr, status, error) {
                    try {
                        if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED"){
                            self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                            self.getApp().getRouter().navigate("login");
                        } else {
                            self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                        }
                    }
                    catch (err) {
                        self.getApp().notify({ message: "Lấy dữ liệu không thành công"}, { type: "danger", delay: 1000 });
                    }
                }
            });
        },
        selectizeAuthor: function(danhsach) {
            var self = this;
            var $selectize = self.$el.find('#selectize_author').selectize({
                maxItems: 1,
                valueField: 'id',
                labelField: 'name',
                searchField: ['name', 'unsigned_name'],
                preload: true,
                placeholder: "Chọn tác giả",
                load: function(query, callback) {
                    self.getAuthor(query, callback);
                },
                render: {
                    option: function (item, escape) {
                        return '<div class="px-3 border-bottom">'
                        + '<h4 style="margin-bottom: 8px;">' + item.name + '</h4>'
                        + '<p style="margin: 0;padding-bottom: 5px;">Bút danh: ' + item.alias_name + '</p>'
                        + '</div>';
                    }
                },
                onItemAdd: function(value, $item) {
                    var obj = $selectize[0].selectize.options[value];
                    var alias_name = obj.alias_name;
                    var job_title = obj.job_title;
                    self.model.set({
                        "author_id": value,
                        "tac_gia": alias_name,
                        "chuc_danh_tac_gia": job_title
                    });
                    self.$el.find("input[data-bind='value:tac_gia']").val(alias_name);
                    self.$el.find("input[data-bind='value:chuc_danh_tac_gia']").val(job_title);
                    self.$el.find("input[data-bind='value:tac_gia']").prop('disabled', true);
                    self.$el.find("input[data-bind='value:chuc_danh_tac_gia']").prop('disabled', true);
                },
                onItemRemove: function(value) {
                    self.model.set({
                        "author_id": null,
                        "tac_gia": null,
                        "chuc_danh_tac_gia": null
                    });
                    self.$el.find("input[data-bind='value:tac_gia']").val("");
                    self.$el.find("input[data-bind='value:chuc_danh_tac_gia']").val("");
                    self.$el.find("input[data-bind='value:tac_gia']").prop('disabled', false);
                    self.$el.find("input[data-bind='value:chuc_danh_tac_gia']").prop('disabled', false);
                }
            });
        },
        crawl_data: function() {
            var self = this;
            self.$el.find("#btn_crawl_data").unbind("click").bind("click", function() {
                var dialog = new DialogCrawlData({"viewData": {}});
                dialog.dialog({size:"large"});
                dialog.on("crawl_data", function(data) {
                    self.getApp().showloading();
                    var is_sava_link = data.is_sava_link;
                    var url_post = data.url_post;
                    var url = (self.getApp().serviceURL || "") + "/api/v1/crawl_news?url_post=" + url_post + "&is_sava_link=" + is_sava_link;
                    $.ajax({
                        url: url,
                        type: 'GET',
                        headers: {
                            'content-type': 'application/json'
                        },
                        dataType: 'json',
                        success: function(res) {
                            self.getApp().hideloading();
                            if (res && res.data_news) {
                                var data_news = res.data_news;
                                tinyMCE.activeEditor.setContent('');
                                tinymce.activeEditor.execCommand('mceInsertContent', false, data_news.content);
                                self.model.set("title", data_news.title);
                                self.$el.find("#title").val(data_news.title);
                                self.model.set("description", data_news.description);
                                self.$el.find("#description").val(data_news.description);
                                self.model.set("tac_gia", data_news.author);
                                self.$el.find('input[data-bind="value:tac_gia"]').val(data_news.author);

                                var link_url_image = data_news.anhdaidien;
                                if (link_url_image != null && link_url_image != undefined && link_url_image != "") {
                                    var file_name = "avatar_" + String(Math.floor(1000000 + Math.random() * 9000000)) + ".jpeg";
                                    var list_split = link_url_image.split("/");
                                    if (list_split.length >= 3 && String(list_split[list_split.length - 1]).trim() != "") {
                                        file_name = list_split[list_split.length - 1];
                                    }
                                    self.cropImage(link_url_image, file_name, "avatar_thuong");
                                }
                            }
                        },
                        error: function (xhr, status, error) {
                            self.getApp().hideloading();
                            try {
                                if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED"){
                                    self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                    self.getApp().getRouter().navigate("login");
                                } else {
                                    self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                }
                            }
                            catch (err) {
                                self.getApp().notify({ message: "Lấy dữ liệu không thành công"}, { type: "danger", delay: 1000 });
                            }
                        }
                    });
                });
            });
        },
        cropImage: function(url_img, file_name, mode) {
            var self = this;
            var dialog = new DialogCropImage({"viewData": {"url_img": url_img, "file_name": file_name, "mode": mode}});
            dialog.dialog({size:"large"});
            dialog.on("insert_success", function(data) {
                self.model.set("image_thumbnail", data);
                self.render_avatar(data, "image_thumbnail");
            });
        },
        // manageComment: function() {
        //     var self = this;
        //     var post_id = self.model.get('id');
        //     if (post_id == null || post_id == undefined || post_id == ""){
        //         self.getApp().notify("Không có bình luận");
        //         return false;
        //     } 
        //     else {
        //         var dialog = new DialogManageComment({"viewData": {"post_id": post_id}});
        //         dialog.dialog({size:"large"});
        //     }
        // },
        changeShowComment: function() {
            var self = this;
            self.$el.find('input[data-bind="value:show_comment"]').on('change.gonrin', function(e) {
                var show_comment = self.$el.find('input[data-bind="value:show_comment"]').data('gonrin').getValue();
                if (!show_comment) {
                    self.$el.find('input[data-bind="value:allowed_comment"]').data('gonrin').setValue(false);
                    self.$el.find("input[data-bind='value:allowed_comment']").data('gonrin').disable();
                }
                else {
                    self.$el.find("input[data-bind='value:allowed_comment']").data('gonrin').enable();
                }
            });
        },
        getContentPost: function() {
            var self = this;
            var results = self.$el.find('#tinymce_editor').val();
            results = results.replaceAll(self.getApp().serviceURL, "");
            return results;
        }
    });
});