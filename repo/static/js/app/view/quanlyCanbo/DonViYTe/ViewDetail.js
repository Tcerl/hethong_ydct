define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/view/quanlyCanbo/DonViYTe/tpl/view_detail_model.html'),
        schema = require('json!schema/DonViSchema.json');
    var UserDonViDialogView = require('app/view/quanlyCanbo/DonViYTe/UserDonVi/view/ModelDialogView');
	var ManageFileVIew = require("app/view/AttachFile/ManageFileUploadView");

    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "donvi",
        tools: [
            {
                name: "back",
                type: "button",
                buttonClass: "btn-secondary width-sm",
                label: `<i class="fas fa-arrow-circle-left"></i> Quay lại`,
                visible: function () {
                    var self = this;
                    var uid = "id";
                    if (self.getApp().currentUser) {
                        uid = self.getApp().currentUser.donvi_id;
                    }
                    var id_donvi = this.getApp().getRouter().getParam("id");
                    if (uid === id_donvi || !id_donvi) {
                        return false;
                    } 
                    else {
                        return true;
                    }
                },
                command: function () {
                    Backbone.history.history.back();
                }
            },
        ],
        uiControl: {
            fields: [
                
            ]
        },
        render: function () {
            var self = this;
            var donvi_id = this.getApp().getRouter().getParam("id");
            var curUser = self.getApp().currentUser;
            if (curUser && !donvi_id) {
                donvi_id = curUser.donvi_id;
            }
            if (donvi_id) {
                var url = self.getApp().serviceURL + "/api/v1/donvi/" + donvi_id;
                $.ajax({
                    url: url,
                    method: "GET",
                    contentType: "application/json",
                    success: function (data) {
                        self.model.set(data);
                        var logo_url = self.model.get('thumbnail_url');
                        if (!!logo_url) {
                            if (logo_url.indexOf(gonrinApp().uploadURL) >=0 ) {
                                self.$el.find(".logo-organization").attr({"src":logo_url});
                            }
                            else {
                                logo_url = gonrinApp().uploadURL + logo_url;
                                self.$el.find(".logo-organization").attr({"src": logo_url});
                            }
                        }
                        var diachi = self.model.get("diachi");
                        self.$el.find(".diachi").html(!!diachi ? diachi : "");
                        self.getUserDonVi();
                        self.applyBindings();

                        if (gonrinApp().hasRole("admin") || gonrinApp().hasRole("admin_donvi")) {
                            self.$el.find(".btn-edit-info").unbind('click').bind('click', function() {
                                self.getApp().getRouter().navigate("canbo/DonViYTe/model?id=" + donvi_id);
                                return false;
                            });
                        }
                        else {
                            self.$el.find(".btn-edit-info").attr("style", "pointer-events:none");
                        }

                        self.$el.find('.btn-add-user').unbind('click').bind('click', function () {
                            var model_dialog = new UserDonViDialogView({ "viewData": { "donvi": self.model.toJSON(), "data": null, "create_new": true } });
                            model_dialog.dialog({size:"large"});
                            model_dialog.on("saveUser", function() {
                                self.getUserDonVi();
                            });
                        });
                        self.register_upload();
                        self.validateUser();
                    },
                    error: function (xhr, status, error) {
                        try {
                            if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                self.getApp().getRouter().navigate("login");
                            } else {
                                self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                            }
                        } catch (err) {
                            self.getApp().notify({ message: "Lỗi không lấy được dữ liệu" }, { type: "danger", delay: 1000 });
                        }
                    },
                });
            } 
            else {
                self.applyBindings();
                // self.getApp().notify("Lỗi truy cập dữ liệu. Vui lòng thử lại sau");
                if (gonrinApp().hasRole("admin")) {
                    self.getApp().getRouter().navigate("admin/donvi/collection");
                } 
                else {
                    self.getApp().getRouter().navigate("canbo/donvi/collection");
                }
            }
        },
        getUserDonVi: function () {
            var self = this;
            if (self.getApp().hasRole('admin_donvi') === false && self.getApp().hasRole('admin') === false) {
                self.$el.find(".users").hide();
            } 
            else {
                $("#grid").html("");
                var url_donvi = self.getApp().serviceURL + '/api/v1/profile_user';
                var madonvi = self.model.get("id");
                $.ajax({
                    url: url_donvi,
                    method: "GET",
                    data: { "q": JSON.stringify({ "filters": { "donvi_id": { "$eq": madonvi } }, "page": 1 }), "results_per_page": 2000 },
                    contentType: "application/json",
                    success: function (data) {
                        $("#grid").grid({
                            showSortingIndicator: true,
                            onValidateError: function (e) {
                                // console.log(e);
                            },
                            language: {
                                no_records_found: " "
                            },
                            noResultsClass: "alert alert-default no-records-found",
                            refresh: true,
                            orderByMode: "client",
                            fields: [
                                { field: "stt", label: "STT" },
                                { field: "hoten", label: "Họ và tên", sortable: { order: "asc" } },
                                { field: "dienthoai", label: "Số điện thoại" },
                                { field: "email", label: "Email" },
                                {
                                    field: "vaitro",
                                    label: "Vai trò",
                                    template: function (rowData) {
                                        var vaitro = rowData.vaitro;
                                        if (vaitro !== undefined && vaitro !== null && vaitro instanceof Array && vaitro.length > 0) {
                                            if (vaitro[0].indexOf("admin_donvi") >= 0) {
                                                return '<span>Admin</span>';
                                            } else if (vaitro[0].indexOf("canbo") >= 0) {
                                                return '<span>Cán bộ</span>';
                                            }
                                        }
                                        return "";
                                    }
                                },
                                {
                                    field: "active",
                                    label: "Trạng thái",
                                    template: function (rowData) {
                                        var active = rowData.active;
                                        if (active == 1) {
                                            return `<div class="text-primary">Đang hoạt động</span>`;
                                        }
                                        return `<div class="text-danger">Đã khóa</span>`;
                                    }
                                },
                            ],
                            dataSource: data.objects,
                            primaryField: "id",
                            selectionMode: "single",
                            pagination: {
                                page: 1,
                                pageSize: 20
                            },
                            onRowClick: function (event) {
                                if (event.rowId) {
                                    var model_dialog = new UserDonViDialogView({ "viewData": { "donvi": self.model.toJSON(), "data": event.rowData, "create_new": false } });
                                    model_dialog.dialog({size:"large"});
                                    model_dialog.on("saveUser", function() {
                                        self.getUserDonVi();
                                    });
                                }
                            },
                            datatableClass: "table table-bordered table-hover",
                        });
                    },
                    error: function (xhr, status, error) {
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

        },
        register_upload : function(){
            var self = this;
            let currentUser = gonrinApp().currentUser;
            let tuyendonvi_id = null;
            if (!!currentUser && currentUser.donvi){
                tuyendonvi_id = currentUser.donvi.tuyendonvi_id;
            }
            if (gonrinApp().hasRole("admin") || (gonrinApp().hasRole("admin_donvi") && currentUser.donvi_id == self.model.get("id")) || (gonrinApp().hasRole("admin_donvi") && tuyendonvi_id === "10")){
                var change_logo = new ManageFileVIew({ viewData: { "$el_btn_upload": self.$el.find(".logo-organization") } });
                change_logo.render();
                change_logo.on("change", (event) => {
                    var filedata = event.data;
                    var url_logo = filedata[0].link;
                    if (!!url_logo){
                        if (url_logo.indexOf(gonrinApp().uploadURL)>=0){
                            self.$el.find(".logo-organization").attr({"src":url_logo});
                        }else{
                            url_logo = gonrinApp().uploadURL + url_logo;
                            self.$el.find(".logo-organization").attr({"src": url_logo});
                        }
                        self.model.set('thumbnail_url', url_logo);
                        self.changeUrlFile(self.model.get("thumbnail_url"), 1, self.model.get("id"));
                    }
                });
            }
        },
        validateUser: function(){
            var self = this;
            if (gonrinApp().hasRole("admin") === false && gonrinApp().hasRole("admin_donvi") === false) {
                self.$el.find(".view_detail_right").remove();
                self.$el.find(".view_detail_left").removeClass("col-xl-4").removeClass("col-lg-4").addClass("col-lg-12");
                self.$el.find(".logo-organization").unbind("click");
                self.$el.find(".btn-edit-info").remove();
            }
        },
        changeUrlFile: function(data_file, type, donvi_id){
            var self = this;
            /*
            type:
            -1: logo
            -2: giayphepkinhdoanh
            -3: sodonhansu
            -4: chungnhandaotao
            -5: thuyetminh quytring
            -6: dinh kem chungnhan gacp
            -7: danh sach nhan vien
            */
            let params = {
                data_file,
                type,
                donvi_id
            }
            $.ajax({
                url: (self.getApp().serviceURL || "") + '/api/v1/update_link_file_donvi',
                type: 'post',
                data: JSON.stringify(params),
                headers: {
                     'content-type': 'application/json'
                 },
                dataType: 'json',
                success: function (data) {
                     gonrinApp().notify("Cập nhật thành công");
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
    });
});