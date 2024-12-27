define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/view/quanlyCanbo/DonViYTe/UserDonVi/tpl/model.html'),
        schema = require('json!app/view/quanlyCanbo/DonViYTe/UserDonVi/schema/UserSchema.json');
    // var TinhThanhSelectView = require("app/danhmuc/danhmuc_dungchung/TinhThanh/SelectView");
    // var QuanHuyenSelectView = require("app/danhmuc/danhmuc_dungchung/QuanHuyen/SelectView");
    // var XaPhuongSelectView = require("app/danhmuc/danhmuc_dungchung/XaPhuong/SelectView");
    var RoleSelectView = require('app/view/HeThong/Role/SelectView');

    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "user",
        uiControl: {
            fields: [{
                    field: "roles",
                    label: "Vai trò",
                    uicontrol: "ref",
                    textField: "name",
                    selectionMode: "multiple",
                    dataSource: RoleSelectView
                },
                // {
                //     field: "tinhthanh",
                //     uicontrol: "ref",
                //     textField: "ten",
                //     foreignRemoteField: "id",
                //     foreignField: "tinhthanh_id",
                //     dataSource: TinhThanhSelectView
                // },
                // {
                //     field: "quanhuyen",
                //     uicontrol: "ref",
                //     textField: "ten",
                //     foreignRemoteField: "id",
                //     foreignField: "quanhuyen_id",
                //     dataSource: QuanHuyenSelectView
                // },
                // {
                //     field: "xaphuong",
                //     uicontrol: "ref",
                //     textField: "ten",
                //     foreignRemoteField: "id",
                //     foreignField: "xaphuong_id",
                //     dataSource: XaPhuongSelectView
                // }
            ]
        },
        tools: [
            {
                name: "back",
                type: "button",
                buttonClass: "btn-secondary width-sm",
                label: "TRANSLATE:BACK",
                visible: function() {
                    return true;
                },
                command: function() {
                    var self = this;
                    self.getApp().getRouter().refresh();
                }
            },
            {
                name: "save",
                type: "button",
                buttonClass: "btn-success width-sm ml-2 button_save",
                label: "TRANSLATE:SAVE",
                command: function() {
                    var self = this;
                    var validate = self.validate();
                    if (validate === false) {
                        return;
                    }
                    var name = self.model.get("fullname");
                    self.model.set("fullname", name.toUpperCase());

                    var email = self.model.get("email");
                    if (!!email) {
                        self.model.set("email", email.toLowerCase());
                    }
                    self.getApp().showloading();
                    self.model.save(null, {
                        success: function(model, respose, options) {
                            self.getApp().hideloading();
                            self.getApp().notify("Lưu dữ liệu thành công!");

                            self.getApp().getRouter().refresh();
                        },
                        error: function(xhr, status, error) {
                            self.getApp().hideloading();
                            try {
                                if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                    self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                    // self.getApp().getRouter().navigate("login");
                                } else {
                                    self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                }
                            } catch (err) {
                                self.getApp().notify({ message: "Lưu dữ liệu không thành công" }, { type: "danger", delay: 1000 });
                            }
                        }
                    });
                }
            },
            {
                name: "delete",
                type: "button",
                buttonClass: "btn-danger width-sm ml-2 button_xoa",
                label: "TRANSLATE:DELETE",
                visible: function() {
                    // return false;
                    var self = this;
                    var dataview;
                    if (!!self.viewData) {
                        var dataview = self.viewData.data;
                    }
                    var currentUser = self.getApp().currentUser;

                    if (dataview !== undefined && dataview !== null) {
                        return (((this.getApp().hasRole('admin_donvi') === true) && dataview.donvi_id == currentUser.donvi_id) || this.getApp().hasRole('admin') === true);
                    } else {
                        return false;
                    }
                },
                command: function() {
                    var self = this;
                    self.getApp().showloading();
                    var currentUser = self.getApp().currentUser;
                    self.model.set({ "deleted": true, "deleted_by": currentUser.id });
                    self.model.save(null, {
                        success: function(model, respose, options) {
                            self.getApp().hideloading();
                            self.getApp().notify("Lưu dữ liệu thành công!");

                            self.getApp().getRouter().refresh();
                        },
                        error: function(xhr, status, error) {
                            self.getApp().hideloading();
                            try {
                                if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                    self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                    // self.getApp().getRouter().navigate("login");
                                } else {
                                    self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                }
                            } catch (err) {
                                self.getApp().notify({ message: "Lưu dữ liệu không thành công" }, { type: "danger", delay: 1000 });
                            }
                        }
                    });
                }
            },
        ],
        render: function() {
            var self = this;
            var curUser = self.getApp().currentUser;
            self.button_khoa_mo_taikhoan();
            if (curUser) {
                self.applyBindings();
                var dataview = self.viewData.data;
                if (gonrinApp().hasRole('admin_donvi') === true || gonrinApp().hasRole('admin') === true) {
                    self.$el.find(".roless").show();
                } else {
                    self.$el.find(".roless").hide();
                }
                if (dataview !== undefined && dataview !== null) {
                    //khong phai tao moi
                    self.model.set(dataview);
                    var active = self.model.get("active");
                    if (dataview.id === curUser.id) {
                        self.$el.find(".button_xoa").hide();
                        self.$el.find(".button_khoa").hide();
                        self.$el.find(".roless").hide();
                        if (active == 0 || active == false) {
                            self.$el.find("input").attr("readonly", true);
                        }
                    }
                } else {
                    var id = self.getApp().getRouter().getParam("id");
                    self.$el.find(".button_xoa").hide();
                    var donvi_id = self.viewData.donvi_id;
                    if (donvi_id !== undefined || donvi_id !== null || donvi_id !== "") {
                        self.model.set("donvi_id", donvi_id);
                    } else {
                        self.getApp().getRouter().refresh();
                    }
                }
                var filters = {
                    "$or": [
                        { "name": { "$eq": "canbo" } },
                        { "name": { "$eq": "admin_donvi" } },
                    ]
                };
                self.getFieldElement("roles").data("gonrin").setFilters(filters);
                return this;
            }
        },
        validate: function() {
            var self = this;
            var id = self.model.get("id");
            var password = self.model.get("password");
            var name = self.model.get("fullname");
            var phone = self.model.get("phone");
            var email = self.model.get("email");
            var accountName = self.model.get('accountName');
            if (name === null || name === "") {
                self.getApp().notify({message: "Vui lòng nhập họ và tên cán bộ."}, {type: 'danger', delay: 1000});
                return false;
            }
            if ((email == undefined || email == "" || email == null) && (phone == undefined || phone == "" || phone == null) && (accountName == undefined || accountName == "" || accountName == null)) {
                self.getApp().notify({ message: "Vui lòng nhập email hoặc số điện thoại hoặc tên đăng nhập." }, { type: "danger" });
                return false;
            }
            if (!!email && gonrinApp().validateEmail(email) == false) {
                self.getApp().notify({message: "Vui lòng nhập đúng định dạng email."}, {type: 'danger', delay: 1000});
                return false;
            } else if (!!email) {
                self.model.set("email", email.toLowerCase());
            }
            if(!!phone && gonrinApp().validatePhone(phone) == false) {
                self.getApp().notify({message: "Vui lòng nhập đúng định dạng số điện thoại."}, {type: 'danger', delay: 1000});
                return false;
            } 
            var roles = self.model.get("roles");
            if (roles == null || roles.length <= 0) {
                self.getApp().notify({message: "Vui lòng chọn vai trò người dùng."}, {type: 'danger', delay: 1000});
                return false;
            }
            var confirm_pass = self.$el.find("#confirm_password").val();
            if (id === null || id === "") {
                if (password === null || confirm_pass === null || password === "" || confirm_pass === "") {
                    self.getApp().notify({message: "Vui lòng nhập mật khẩu."}, {type: 'danger', delay: 1000});
                    return false;
                }
            }
            if (password !== null && password != "" && password !== confirm_pass) {
                self.getApp().notify({message: "Mật khẩu không khớp."}, {type: 'danger', delay: 1000});
                return false;
            }
            return true;
        },
        button_khoa_mo_taikhoan: function() {
            var self = this;
            var viewData = self.viewData;
            if (viewData && viewData.data && viewData.data !== "" && viewData.data !== null) {
                var active = viewData.data.active;
                if (active == 0 || active == false) {
                    self.$el.find(".toolbar").append('<button type="button" btn-name="Duyet" class="btn btn-primary width-sm ml-2 button_mo">Mở</button>');
                }
                if (active == 1 || active == true) {
                    self.$el.find(".toolbar").append('<button type="button" btn-name="Khoa" class="btn btn-warning width-sm ml-2 button_khoa">Khóa</button>');
                }
                self.$el.find(".button_khoa").unbind("click").bind("click", function() {
                    self.model.set("active", 0);
                    var validate = self.validate();

                    if (validate === false) {
                        return false;
                    }
                    var email = self.model.get("email");
                    if (!!email) {
                        self.model.set("email", email.toLowerCase());
                    }
                    self.model.save(null, {
                        success: function(data, respose, options) {
                            self.getApp().notify("Khóa tài khoản cán bộ thành công");
                            self.getApp().getRouter().refresh();
                        },
                        error: function(xhr, status, error) {
                            self.getApp().hideloading();
                            self.getApp().notify({ message: "Khóa cán bộ không thành công. Vui lòng thử lại sau!" }, { type: "danger", delay: 1000 });
                        }
                    });
                });
                self.$el.find(".button_mo").unbind("click").bind("click", function() {
                    self.model.set("active", 1);

                    var email = self.model.get("email");
                    if (!!email) {
                        self.model.set("email", email.toLowerCase());
                    }

                    var validate = self.validate();
                    if (validate === false) {
                        return false;
                    }
                    self.model.save(null, {
                        success: function(data, respose, options) {
                            self.getApp().notify("Mở tài khoản cán bộ thành công");
                            self.getApp().getRouter().refresh();
                        },
                        error: function(xhr, status, error) {
                            self.getApp().hideloading();
                            self.getApp().notify({ message: "Mở cán bộ không thành công. Vui lòng thử lại sau!" }, { type: "danger", delay: 1000 });
                        }
                    });
                });
            }
        },
    });

});