define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/danhmuc/danhmuc_sanpham/CuaKhau/tpl/model.html'),
        schema = require('json!schema/DanhMucCuaKhauSchema.json');
    var loaicuakhau = require("json!app/constant/loaicuakhau.json");
    var RejectDialogView = require('app/bases/RejectDialogView');

    return Gonrin.ModelDialogView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "cuakhau",
        flagReset: true,
        uiControl: {
            fields: [
                {
                    field: "phanloai",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: loaicuakhau,
                    readonly: true,
                    enable: false
                }
            ]
        },
        tools: [
            {
                name: "back",
                type: "button",
                buttonClass: "btn-secondary waves-effect width-sm",
                label: `<i class="fas fa-times-circle"></i> Đóng`,
                command: function () {
                    var self = this;
                    self.close();
                }
            },
            {
                name: "save",
                type: "button",
                buttonClass: "btn-success width-sm ml-2",
                label: `<i class="far fa-save"></i> Lưu`,
                visible: function() {
                    var tuyendonvi_id = gonrinApp().getTuyenDonVi();
                    return gonrinApp().hasRole("admin") ||  tuyendonvi_id=='1';
                },
                command: function () {
                    var self = this;
                    var isValidData = self.validateData();
                    if (!isValidData) {
                        return;
                    }
                    self.getApp().showloading();
                    self.model.save(null, {
                        success: function (model, respose, options) {
                            self.getApp().hideloading();
                            self.getApp().notify("Lưu thông tin thành công");
                            self.trigger("saveData");
                            self.close();
                        },
                        error: function (xhr, status, error) {
                            self.getApp().hideloading();
                            try {
                                if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                    self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                    self.getApp().getRouter().navigate("login");
                                } 
                                else {
                                    self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                }
                            }
                            catch (err) {
                                self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
                            }
                        }
                    });
                }
            },
            {
                name: "delete",
                type: "button",
                buttonClass: "btn-danger width-sm ml-2",
                label: `<i class="fas fa-trash-alt"></i> Xóa`,
                visible: function() {
                    var tuyendonvi_id = gonrinApp().getTuyenDonVi();
                    return gonrinApp().hasRole("admin") ||  tuyendonvi_id=='1';
                },
                visible: function () {
                    var self = this;
                    return (!!self.viewData && self.viewData.id) ? true : false;
                },
                command: function () {
                    var self = this;
                    var view = new RejectDialogView({ viewData: { "text": "Bạn có chắc chắn muốn xóa bản ghi này không?" } });
                    view.dialog();
                    view.on("confirm", (e) => {
                        self.getApp().showloading();
                        self.model.destroy({
                            success: function (model, response) {
                                self.getApp().hideloading();
                                self.getApp().notify('Xoá dữ liệu thành công');
                                self.trigger("saveData");
                                self.close();
                            },
                            error: function (xhr, status, error) {
                                self.getApp().hideloading();
                                try {
                                    if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                        self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                        self.getApp().getRouter().navigate("login");
                                    } 
                                    else {
                                        self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                    }
                                }
                                catch (err) {
                                    self.getApp().notify({ message: "Xóa thông tin không thành công" }, { type: "danger", delay: 1000 });
                                }
                            }
                        });
                    });

                }
            },
        ],
        render: function () {
            var self = this;
            var id = !!self.viewData ? self.viewData.id : null;
            if (id) {
                //progresbar quay quay
                this.model.set('id', id);
                this.model.fetch({
                    success: function (data) {
                        self.applyBindings();
                        var tuyendonvi_id = gonrinApp().getTuyenDonVi();
						if(!gonrinApp().hasRole("admin") && tuyendonvi_id != '1'){
							self.$el.find("input").css("pointer-events","none");
                            self.$el.find("#pointer-selectize").css("pointer-events","none");
						}
                        gonrinApp().selectizeTinhThanhQuanHuyenXaPhuong(self);
                    },
                    error: function () {
                        self.getApp().notify("Get data Eror");
                    },
                });
            } else {
                self.applyBindings();
                gonrinApp().selectizeTinhThanhQuanHuyenXaPhuong(self);
            }

        },
        validateData: function () {
            var self = this;
            if (!self.model.get('phanloai')) {
                self.getApp().notify({ message: "Chưa chọn loại cửa khẩu" }, { type: "danger", delay: 1000 });
                return false;
            }
            if (!self.model.get('ten_cuakhau')) {
                self.getApp().notify({ message: "Chưa nhập tên cửa khẩu" }, { type: "danger", delay: 1000 });
                return false;
            }
            if (!!self.model.get('xaphuong_id') && !self.model.get('quanhuyen_id')) {
                self.getApp().notify({ message: "Xã phường không hợp lệ" }, { type: "danger", delay: 1000 });
                return false;
            }
            if (!!self.model.get('quanhuyen_id') && !self.model.get('tinhthanh_id')) {
                self.getApp().notify({ message: "Quận huyện không hợp lệ" }, { type: "danger", delay: 1000 });
                return false;
            }
            return true;
        },
    });

});