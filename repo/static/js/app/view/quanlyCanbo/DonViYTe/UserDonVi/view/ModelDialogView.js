define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/view/quanlyCanbo/DonViYTe/UserDonVi/tpl/model.html'),
        schema = require('json!schema/ProfileUserSchema.json');

    return Gonrin.ModelDialogView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "profile_user",
        bindings: "data-user",
        tools: [{
                name: "back",
                type: "button",
                buttonClass: "btn-secondary width-sm",
                label: `<i class="fas fa-times-circle"></i> Đóng`,
                visible: function() {
                    return true;
                },
                command: function() {
                    var self = this;
                    self.close();
                }
            },
            {
                name: "save",
                type: "button",
                buttonClass: "btn-success width-sm ml-2 button_save",
                label: `<i class="far fa-save"></i> Lưu`,
                visible: function() {
                    return !gonrinApp().hasRole("admin");
                },
                command: function() {
                    var self = this;
                    var create_new = self.viewData.create_new;
                    var url = self.getApp().serviceURL + (create_new ? "/api/v1/user/create": "/api/v1/user/update");

                    var validate = self.validate();
                    if (validate === false) {
                        return;
                    }
                    
                    var password = self.$el.find("#password").val(),
                        confirm_pass = self.$el.find("#confirm_password").val();
                    var params = self.model.toJSON();
                    params.password = password;
                    params.confirm_pass = confirm_pass;
                    
                    self.getApp().showloading();
                    $.ajax({
                        url: url,
                        method: "POST",
                        data: JSON.stringify(params),
                        contentType: "application/json",
                        success: function(model, respose, options) {
                            self.getApp().hideloading();
                            self.getApp().notify("Lưu dữ liệu thành công");
                            self.trigger("saveUser", {"hoten": self.model.get("hoten")});
                            self.close();
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
                                self.getApp().notify({ message: "Lỗi truy cập dữ liệu, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
                            }
                        }
                    });
                    return;
                }
            },
        ],
        render: function() {
            var self = this;
            var currentUser = self.getApp().currentUser;
            if (!currentUser) {
                self.getApp().notify({ message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại" }, { type: "danger", delay: 1000 });
                self.getApp().getRouter().navigate('login');
                self.close();
                return;
            } 
            else {
                self.applyBindings();
                var dataview = self.viewData.data,
                    donvi = self.viewData.donvi,
                    create_new = self.viewData.create_new;
                var donvi_id = null;
                if (!!donvi) {
                    donvi_id = donvi.id;
                }
                var array_roles = ["admin_donvi", "canbo"];
                if (create_new) {
                    self.model.set("donvi_id", donvi_id);
                    self.selectizeVaiTro(array_roles);
                } 
                else if (!!dataview && !!donvi_id) {
                    var url = self.getApp().serviceURL + "/api/v1/profile_user/" + dataview.id;
                    $.ajax({
                        url: url,
                        method: "GET",
                        contentType: "application/json",
                        success: function(data) {
                            self.model.set(data);
                            if (self.model.get("id") === currentUser.id) {
                                // user được sửa thông tin của chính họ
                                self.$el.find(".button_xoa").addClass('d-none');
                                self.$el.find(".button_khoa").addClass('d-none');
                                self.$el.find(".roless").addClass('d-none');
                                self.$el.find(".el-password").remove();
                            } 
                            else if (gonrinApp().hasRole("admin") || gonrinApp().hasRole("admin_donvi") && currentUser.donvi_id == data.donvi_id) {
                                // duoc quyen sua 
                                self.button_khoa_mo_taikhoan();
                                self.selectizeVaiTro(array_roles);
                            }
                            if (self.model.get("active") == false) {
                                // tài khoản đã bị khoá trước đó
                                self.$el.find("input").attr("disabled", true);
                                self.$el.find("textarea").attr("disabled", true);
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
                        }
                    });
                } 
                else {
                    self.getApp().notify({ message: "Bạn không có quyền thực hiện hành động này" }, { type: "danger", delay: 1000 });
                    self.$el.find("input").attr("disabled", true);
                    self.close();
                }
                return this;
            }
        },
        validate: function() {
            var self = this;
            var id = self.model.get("id"),
                password = self.$el.find("#password").val(),
                hoten = self.model.get("hoten"),
                dienthoai = self.model.get("dienthoai"),
                email = self.model.get("email");

            if (hoten === null || hoten === "") {
                self.getApp().notify({ message: "Vui lòng nhập họ tên cán bộ." }, { type: 'danger', delay: 1000 });
                return false;
            }
            self.model.set("hoten", hoten.toUpperCase());

            if ((email == undefined || email == "" || email == null) && (dienthoai == undefined || dienthoai == "" || dienthoai == null)) {
                self.getApp().notify({ message: "Vui lòng nhập email hoặc số điện thoại" }, { type: "danger" });
                return false;
            }
            if (!!email && gonrinApp().validateEmail(email) == false) {
                self.getApp().notify({ message: "Vui lòng nhập đúng định dạng email." }, { type: 'danger', delay: 1000 });
                return false;
            } 
            else if (!!email) {
                self.model.set("email", email.toLowerCase());
            }

            if (!!dienthoai && gonrinApp().validatePhone(dienthoai) == false) {
                self.getApp().notify({ message: "Vui lòng nhập đúng định dạng số điện thoại." }, { type: 'danger', delay: 1000 });
                return false;
            }

            var vaitro = self.model.get("vaitro");
            if (vaitro == null || vaitro.length <= 0) {
                self.getApp().notify({ message: "Vui lòng chọn vai trò người dùng." }, { type: 'danger', delay: 1000 });
                return false;
            }
            var confirm_pass = self.$el.find("#confirm_password").val();
            if (id === null || id === "") {
                if (password === null || password === "") {
                    self.getApp().notify({ message: "Vui lòng nhập mật khẩu." }, { type: 'danger', delay: 1000 });
                    return false;
                }
                if (confirm_pass === null || confirm_pass === "") {
                    self.getApp().notify({ message: "Vui lòng nhập mật khẩu xác nhận." }, { type: 'danger', delay: 1000 });
                    return false;
                }
            }
            if (password !== null && password != "" && password !== confirm_pass) {
                self.getApp().notify({ message: "Mật khẩu không khớp." }, { type: 'danger', delay: 1000 });
                return false;
            }
            return true;
        },
        button_khoa_mo_taikhoan: function() {
            var self = this;
            var active = self.model.get("active");
            if (active == 0) {
                self.$el.find(".toolbar").append('<button type="button" btn-name="Duyet" class="btn btn-primary width-sm button_mo ml-2"><i class="fas fa-key"></i> Mở</button>');
            }
            if (active == 1) {
                self.$el.find(".toolbar").append('<button type="button" btn-name="Khoa" class="btn btn-warning width-sm button_khoa ml-2"><i class="fas fa-user-lock"></i> Khóa</button>');
            }

            self.$el.find(".button_khoa").unbind("click").bind("click", function() {
                self.changeStatus(0);
            });
            self.$el.find(".button_mo").unbind("click").bind("click", function() {
                self.changeStatus(1);
            });
        },
        changeStatus: function(status) {
            var self = this;
            var data = JSON.stringify({
                id: self.model.get("id"),
                active: status
            });
            $.ajax({
                url: (self.getApp().serviceURL || "") + '/api/v1/user/change_status',
                type: 'post',
                data: data,
                dataType: 'json',
                success: function (data) {
                    if (status == 1) {
                        gonrinApp().notify("Mở khoá tài khoản thành công.");
                    } 
                    else {
                        gonrinApp().notify("Khoá tài khoản thành công");
                    }
                    self.trigger("saveUser");
                    self.close();
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
        },
        selectizeVaiTro: function(array_roles) {
            var self = this;
            var set = false;
            var $select = self.$el.find("#vaitro").selectize({
                maxItems: 2,
                valueField: "vaitro",
                labelField: "mota",
                searchField: ["mota", "vaitro"],
                preload: true,
                placeholder: "Chọn vai trò",
                load: function(query, callback) {
                    var query_filter = {
                        "filters": 
                        {"$and": [
                            { "vaitro": { "$in": array_roles }},
                            { "deleted": { "$eq": false }},
                        ]}
                    };
                    var url = (self.getApp().serviceURL || "") + "/api/v1/role?" + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: "GET",
                        dataType: "json",
                        success: function(response) {
                            callback(response.objects);
                            if (!!self.model.get('vaitro') && set == false) {
                                set = true;
                                var vaitro = self.model.get('vaitro');
                                var ids = vaitro.map((item) => {
                                    return item;
                                });
                                self.$el.find('#vaitro')[0].selectize.setValue(ids);
                            }
                        },
                        error: function() {
                            callback();
                        },
                    });
                },
                onItemAdd: function(value, $item) {
                    var roles = self.model.get('vaitro');
                    roles = !!roles? roles: []
                    var check_exist = roles.find((item, index) => {
                        return item == value;
                    })
                    if (check_exist == undefined || check_exist == -1) {
                        roles.push(value);
                    }
                    self.model.set('vaitro', roles);
                },
                onItemRemove: function(value) {
                    var roles = self.model.get('vaitro');
                    roles = !!roles? roles: [];
                    var list_roles = roles.filter(item => item != value);
                    self.model.set('vaitro', list_roles);
                }
            });
        },
    });

});