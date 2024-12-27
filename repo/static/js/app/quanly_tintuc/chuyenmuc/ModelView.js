define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/quanly_tintuc/chuyenmuc/tpl/model.html'),
        schema = require('json!schema/CategorySchema.json');
    var UploadFile = require("app/view/AttachFile/UploadFile");
    var RejectDialogView = require('app/bases/RejectDialogView');
    return Gonrin.ModelDialogView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "category",
        uiControl: {
            fields: [
                // {
                //     field: "status",
                //     uicontrol: "combobox",
                //     textField: "text",
                //     valueField: "value",
                //     cssClass: "form-control",
                //     dataSource: [
                //         { value: 1, text: "Hiện" },
                //         { value: 0, text: "Ẩn" }
                //     ],
                // }, 
                {
                    field: "show_top_menu",
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
                    field: "show_in_home",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: true, text: "Có" },
                        { value: false, text: "Không" }
                    ],
                }, 
            ]
        },
        tools: [{
            name: "defaultgr",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [{
                    name: "back",
                    type: "button",
                    buttonClass: "btn-secondary waves-effect width-sm",
                    label: "<i class='fas fa-times'></i> Đóng",
                    command: function() {
                        var self = this;
                        self.close();
                    }
                },
                {
                    name: "save",
                    type: "button",
                    buttonClass: "btn-success waves-effect width-sm ml-2",
                    label: '<i class="far fa-save"></i> Lưu',
                    visible: function() {
                        var currentUser = gonrinApp().currentUser;
                        return (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
                    },
                    command: function() {
                        var self = this;
                        var name = self.model.get("name");
                        if (!name || name == null || name == "") {
                            self.getApp().notify({message: "Vui lòng nhập tên chuyên mục"}, {type: "danger", delay: 1000});
                            return false;
                        }
                        self.getApp().showloading();
                        self.model.save(null, {
                            success: function(model, respose, options) {
                                self.getApp().hideloading();
                                self.getApp().notify("Lưu dữ liệu thành công");
                                self.trigger("saveChuyenmuc");
                                self.close();
                            },
                            error: function(model, xhr, options) {
                                self.getApp().hideloading();
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
                            }
                        });
                    }
                },
                {
                    name: "delete",
                    type: "button",
                    buttonClass: "btn-danger waves-effect width-sm ml-2",
                    label: "<i class='fas fa-trash-alt'></i> Xóa",
                    visible: function() {
                        var currentUser = gonrinApp().currentUser;
                        return (!!this.viewData && this.viewData.id && !!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
                    },
                    command: function() {
                        var self = this;
                        var view = new RejectDialogView({ viewData: { "text": "Bạn có chắc chắn muốn xóa bản ghi này không?" } });
                            view.dialog();
                            view.on("confirm", (e) => {
                                self.getApp().showloading();
                                self.model.destroy({
                                    success: function(model, response) {
                                        self.getApp().hideloading();
                                        self.getApp().notify("Xóa dữ liệu thành công");
                                        self.trigger("saveChuyenmuc");
                                        self.close();
                                    },
                                    error: function(model, xhr, options) {
                                        self.getApp().hideloading();
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
                                    }
                                });
                            })
                    }
                },
            ]
        }, ],
        render: function() {
            var self = this;
            var id = (!!self.viewData && !!self.viewData.id)? self.viewData.id : null;
            if (id) {
                this.model.set('id', id);
                this.model.fetch({
                    success: function(data) {
                        self.applyBindings();
                        self.selectizeTags();
                        self.selectizeCategory();
                        self.register_attach_file("image_thumbnail");
                        var image_thumbnail = self.model.get("image_thumbnail");
                        if (image_thumbnail) {
                            self.view_file_attach(image_thumbnail, "image_thumbnail");
                        }
                    },
                    error: function(model, xhr, options) {
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
            } else {
                self.applyBindings();
                self.selectizeTags();
                self.selectizeCategory();
                self.model.set("priority", 10);
                self.register_attach_file("image_thumbnail");
            }
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
        register_attach_file: function(class_file = null) {
            var self = this;
            self.$el.find("." + class_file).unbind("click").bind("click", function() {
                var attachFile = new UploadFile({"viewData": {"type_upload": "image"}});
                attachFile.render();
                attachFile.on("success", (event) => {
                    var file = event.data;
                    var file_type = file.type;
                    if (!!file && !!file_type && (file_type.toLowerCase().includes("jpeg") || file_type.toLowerCase().includes("jpg") || file_type.toLowerCase().includes("png"))) {
                        self.getApp().notify("Tải file thành công!");
                        self.model.set(class_file, file);
                        self.view_file_attach(file, class_file);
                    }
                });
            });
        },
        view_file_attach: function(file, class_file) {
            var self = this;
            var url_file = gonrinApp().check_image(file),
                viewfile = self.$el.find("#" + class_file);
            var file_type = file.type;
            if (!!file.type && (file_type.toLowerCase().includes("jpeg") || file_type.toLowerCase().includes("jpg") || file_type.toLowerCase().includes("png"))) {
                viewfile.empty();
                viewfile.append('<div class="mt-2 cursor-pointer"><img class="d-none list-image" src="' + url_file + '"><a src="' + url_file + '" class="' + file.id + '"><u>' + file.name + file.type + '</u></a></div>');
                $("." + file.id).unbind("click").bind("click", { obj: { "url": url_file, "class_file": class_file } }, function(e) {
                    var object = e.data.obj;
                    var img = document.createElement('img');
                    img.src = object.url;
                    img.onload = function(e) {
                        gonrinApp().openPhotoSwipe(0, $("#" + object.class_file));
                    };
                    img.onerror = function(e) {};
                });
            }
        },
        selectizeCategory: function() {
            var self = this;
            var seted = false;
            var $selectize = self.$el.find('#category_parent').selectize({
                maxItems: 1,
                valueField: 'id',
                labelField: 'name',
                searchField: ['name', 'unsigned_name'],
                preload: true,
                maxOptions: 25,
                placeholder: "Chọn chuyên mục",
                load: function(query, callback) {
                    if (seted == false && !!self.model.get('cate_parent_id')) {
                        self.$el.find('#category_parent')[0].selectize.addOption(self.model.get("category_parent"));
                        self.$el.find('#category_parent')[0].selectize.setValue(self.model.get('cate_parent_id'));
                        seted = true;
                    }

                    var id = self.model.get("id");
                    var url = (self.getApp().serviceURL || "") + '/api/v1/get-list-category?id=' + id + '&donvi_id=' + gonrinApp().currentUser.donvi_id + (query ? "&text_filter=" + query : "");
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
                        "cate_parent_id": value
                    })
                },
                onItemRemove: function(value) {
                    self.model.set({
                        "cate_parent_id": null
                    })
                }
            });
        },
    });
});