define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/view/quanlyCanbo/DonViYTe/UserDonVi/tpl/model.html'),
        schema = require('json!schema/UserSchema.json');

    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "user",
        tools: [
            {
                name: "back",
                type: "button",
                buttonClass: "btn-secondary width-sm",
                label: `<i class="fas fa-arrow-circle-left"></i> Quay lại`,
                visible: function() {
                    return true;
                },
                command: function() {
                    var self = this;
                    Backbone.history.history.back();
                }
            },
            {
                name: "save",
                type: "button",
                buttonClass: "btn-success width-sm ml-2 button_save",
                label: `<i class="far fa-save"></i> Lưu`,
                command: function() {
                    var self = this;
                    var validate = self.validate();
                    if (validate === false) {
                        return;
                    }
                    var hoten = self.model.get("hoten");
                    self.model.set("hoten", hoten.toUpperCase());

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
                label:  `<i class="fas fa-trash-alt"></i> Xóa`,
                visible: function() {
                    // return false;
                    var self = this;
                    return (((this.getApp().hasRole('admin_donvi') === true)) || this.getApp().hasRole('admin') === true);
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
                            Backbone.history.history.back();
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
            if (gonrinApp().hasRole('admin_donvi') === true || gonrinApp().hasRole('admin') === true) {
                self.$el.find(".roless").show();
            } else {
                self.$el.find(".roless").hide();
            }

            let id = self.getApp().getRouter().getParam("id");
            if (!!id){
                this.model.set('id', id);
                this.model.fetch({
                    success: function(data) {
                        self.applyBindings();
                        self.selectizeVaiTro();
                        self.valiateUser();
                    },
                    error: function() {
                        self.getApp().notify(self.getApp().translate("TRANSLATE:error_load_data"));
                    },
                    complete: function() {

                    }
                });
            }
            else{
                self.applyBindings();
                self.selectizeVaiTro();
                self.valiateUser();
            }
            return this;
            
        },
        validate: function() {
            var self = this;
            var id = self.model.get("id");
            var matkhau = self.model.get("matkhau");
            var hoten = self.model.get("hoten");
            var dienthoai = self.model.get("dienthoai");
            var email = self.model.get("email");
            var taikhoan = self.model.get('taikhoan');
            if (hoten === null || hoten === "") {
                self.getApp().notify({ message: "Vui lòng nhập họ và tên cán bộ." }, { type: 'danger', delay: 1000 });
                return false;
            }
            if ((email == undefined || email == "" || email == null) && (dienthoai == undefined || dienthoai == "" || dienthoai == null) && (taikhoan == undefined || taikhoan == "" || taikhoan == null)) {
                self.getApp().notify({ message: "Vui lòng nhập email hoặc số điện thoại hoặc tên đăng nhập." }, { type: "danger" });
                return false;
            }
            if (!!email && gonrinApp().validateEmail(email) == false) {
                self.getApp().notify({ message: "Vui lòng nhập đúng định dạng email." }, { type: 'danger', delay: 1000 });
                return false;
            } else if (!!email) {
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
                if (matkhau === null || confirm_pass === null || matkhau === "" || confirm_pass === "") {
                    self.getApp().notify({ message: "Vui lòng nhập mật khẩu." }, { type: 'danger', delay: 1000 });
                    return false;
                }
            }
            if (matkhau !== null && matkhau != "" && matkhau !== confirm_pass) {
                self.getApp().notify({ message: "Mật khẩu không khớp." }, { type: 'danger', delay: 1000 });
                return false;
            }
            return true;
        },  
        button_khoa_mo_taikhoan: function() {
            var self = this;
            var active = self.model.get("active");
            if (active == 0 || active == false) {
                self.$el.find(".toolbar").append('<button type="button" btn-name="Duyet" class="btn btn-primary width-sm ml-2 button_mo"><i class="far fa-check-circle"></i> Mở</button>');
            }
            if (active == 1 || active == true) {
                self.$el.find(".toolbar").append('<button type="button" btn-name="Khoa" class="btn btn-primary width-sm ml-2 button_khoa"><i class="fas fa-user-lock"></i> Khóa</button>');
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
            
        },
        selectizeVaiTro: function() {
            var self = this;
            var $select = self.$el.find("#vaitro").selectize({
                maxItems: 1,
                valueField: "id",
                labelField: "mota",
                searchField: ["mota", "vaitro"],
                preload: true,
                placeholder: "Chọn vai trò",
                load: function(query, callback) {
                    let query_filter = "";
                    if (self.getApp().hasRole('admin')) {
                        query_filter = {};
                    }
                    else if(gonrinApp().hasRole("admin_donvi")) {
                        let currentUser = gonrinApp().currentUser;
                        let tuyendonvi_id = null;
                        if (!!currentUser && !!currentUser.donvi){
                            tuyendonvi_id = currentUser.donvi.tuyendonvi_id;
                        }  
                        if (tuyendonvi_id === "10"){
                            query_filter = {
                                "filters": { "vaitro": { "$neq": "admin" } }
    
                            };
                        }
                        else
                        {
                            query_filter = {
                                "filters": {
                                    "$and": [
                                        { "vaitro": { "$neq": "admin" } },
                                        { "vaitro": { "$neq": "lanhdao" } }
                                    ]
                                }
                            }
                        }
                    }
                    else if (gonrinApp().hasRole("canbo")){
                        query_filter = {
                            "filters": {
                                "$and": [
                                    { "vaitro": { "$neq": "admin" } },
                                    { "vaitro": { "$neq": "lanhdao" } },
                                    { "vaitro": { "$neq": "admin_donvi" }}
                                ]
                            }
                        }
                    }
                    else{
                        query_filter = {
                            "filters": {
                                "$and": [
                                    { "vaitro": { "$neq": "admin" } },
                                    { "vaitro": { "$neq": "canbo" } },
                                    { "vaitro": { "$neq": "admin_donvi"}}
                                ]
                            }
                        }
                    }
                    var url =
                        (self.getApp().serviceURL || "") + "/api/v1/role?" + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: "GET",
                        dataType: "json",
                        success: function(response) {
                            callback(response.objects);
                            if (!!self.model.get('vaitro')) {
                                var vaitro = self.model.get('vaitro');
                                var ids = vaitro.map((item, index) => {
                                    return item.id;
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
                    var obj = $select[0].selectize.options[value];
                    var vaitro = self.model.get('vaitro');
                    if (!vaitro) {
                        vaitro = [];
                    }
                    var pos = vaitro.find((item, index) => {
                        return item.id == value;
                    })
                    if (pos == undefined || pos == -1) {
                        vaitro.push(obj);
                    }
                    self.model.set('vaitro', vaitro);

                },
                onItemRemove: function(value) {
                    var vaitro = self.model.get('vaitro');
                    var list_vaitro = []
                    if (!vaitro) {
                        vaitro = [];
                    }
                    for(var i= 0 ; i< vaitro.length;i++){
                        if(value == vaitro[i].id){
                            continue;
                        }
                        else{
                            list_vaitro.push(vaitro[i]);
                        }
                    }
                    self.model.set('vaitro', list_vaitro);
                }
            });
        },
        valiateUser: function(){
            var self = this;
            let currentUser = gonrinApp().currentUser;
            let tuyendonvi_id = null;
            if (!!currentUser && !!currentUser.donvi){
                tuyendonvi_id = currentUser.donvi.tuyendonvi_id;
            }
            if (gonrinApp().hasRole("admin") || (gonrinApp().hasRole("admin_donvi")) && (currentUser.id != self.model.get("id"))){
                self.button_khoa_mo_taikhoan();
            }
            else{
                self.$el.find(".button_xoa").remove();
            }
        }
    });

});