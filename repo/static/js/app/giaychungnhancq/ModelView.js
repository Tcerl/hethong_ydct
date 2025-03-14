define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/giaychungnhancq/tpl/model.html'),
        schema = require('json!schema/PhieuKiemNghiemSchema.json');
    var ChitietVattu = require('app/giaychungnhancq/ChitietPhieuDialog/ChitietVatTu');
    var DialogKetQua = require('app/giaychungnhancq/ChitietPhieuDialog/DialogKetQua');

    var ManageFileVIew = require("app/view/AttachFile/ManageFileUploadView");

    var NoiSanXuat = require('app/giaychungnhancq/NoiSanXuatDialog');
    var DonViCap = require('app/giaychungnhancq/DonViCapDialog');
    var CopyView = require('app/giaychungnhancq/CopyView');

    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "phieu_kiem_nghiem",
        checkId: false,
        checkCreateButton: false,
        isView: false,
        isSetId: false,
        isSetObject : false,
        setObjDonvi: false,
        isSetIDNoiSanXuat: false,
        isSetNoiSanXuat: false,
        isViewNoiSanXuat: false,
        isSetIdDonViCap: false,
        isSetDonViCap: false,
        isViewDonViCap: false,
        isCreateButtonCopy: false,
        clickSave: false,
        tools: [{
            name: "defaultgr",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [{
                    name: "back",
                    type: "button",
                    buttonClass: "btn-secondary btn",
                    label: `<i class="fas fa-arrow-circle-left"></i> Quay lại`,
                    command: function() {
                        var self = this;
                         
                        let backCollection = gonrinApp().getRouter().getParam("backCollection");
                        if (backCollection){
                            gonrinApp().getRouter().navigate(`phieu_kiem_nghiem/collection`);
                        }
                        else{
                            Backbone.history.history.back();

                        }

                    }
                },
                {
                    name: "save",
                    type: "button",
                    buttonClass: "btn-success width-sm btn ml-2 btn-save d-none",
                    label: `<i class="far fa-save"></i> Lưu`,
                    command: function() {
                        var self = this;
                        var tmp = self.validate_save_cq();
                        if (tmp == false) {
                            return;
                        }

                        let chungtu_dinhkem = self.model.get("chungtu_dinhkem");
                        if (!chungtu_dinhkem || (Array.isArray(chungtu_dinhkem) === true && chungtu_dinhkem.length ===0)){
                            self.getApp().notify({message: "Vui lòng tải lên bản Scan giấy chứng nhận để cơ quan quản lý đối soát"}, {type: "danger", delay : 1000});
                            return false;
                        }

                        if (self.clickSave === true){
                            return;
                        }

                        self.clickSave = true;

                        self.getApp().showloading();
                        self.model.save(null, {
                            success: function(model, respose, options) {
                                self.getApp().notify("Lưu thông tin thành công");
                                self.clickSave = false;
                                self.$el.find("#ma_kiem_nghiem").attr("style", "pointer-events: all");
                                self.$el.find("#auto_ma_kiem_nghiem").attr("style", "pointer-events: none");

                                if (self.isCreateButtonCopy === false){
                                    self.model.set(respose);
                                    self.isCreateButtonCopy = true;
                                    self.$el.find(".toolbar").append(`<button type="button" btn-name="copy" class="btn btn-primary btn-copy width-sm ml-2">Copy COA</button>`);
                                    self.$el.find(".btn-copy").unbind("click").bind("click", ()=>{
                                        self.copyPhieu();
                                    });

                                }
                                else{
                                    self.model.set(respose);
                                }

                                // self.getApp().getRouter().navigate(self.collectionName + "/collection");
                                // if (self.checkId === false && self.checkCreateButton === false){
                                //     self.model.set(respose);
                                //     self.checkCreateButton = true;
                                //     self.$el.find(".toolbar").append(`<button type="button" btn-name="xacnhan" class="btn btn-info width-sm btn-xacnhan ml-2">Gửi duyệt</button>`);
                                //     self.$el.find(".btn-xacnhan").unbind("click").bind("click", ()=>{
                                //         self.xacNhan();
                                //     });
                                //     self.$el.find(".btn-delete").removeClass("d-none");
                                // }
                                // else{
                                //     self.model.set(respose);
                                // }
                            },
                            error: function(xhr, status, error) {
                                self.clickSave = false;
                                try {
                                    if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                        self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                        self.getApp().getRouter().navigate("login");
                                    } else {
                                        self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                    }
                                } catch (err) {
                                    self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
                                }
                            },
                            complete: function(){
                                self.clickSave = false;
                                self.getApp().hideloading();
                            }
                        });

                        // let chungtu_dinhkem = self.model.get("chungtu_dinhkem");
                        // if (!chungtu_dinhkem || (Array.isArray(chungtu_dinhkem) === true && chungtu_dinhkem.length ===0) ){
                        //     let checkAction = null;
                        //     self.$el.find("#exampleModalCenter").modal("show");
                        //     self.$el.find("#exampleModalCenter .btn-upload").unbind("click").bind("click", function () {
                        //         checkAction = 1;
                        //     });
                        //     self.$el.find("#exampleModalCenter .btn-continue").unbind("click").bind("click", function () {
                        //         checkAction = 2;
                        //     });
                        //     self.$el.find("#exampleModalCenter").on("hidden.bs.modal", function (e) {
                        //         if (checkAction === 1) {
                        //             self.$el.find(".btn-add-file").trigger("click");
                        //             checkAction = null;
                        //         }
                        //         else if (checkAction ===2){
                        //             self.getApp().showloading();
                        //             self.model.save(null, {
                        //                 success: function(model, respose, options) {
                        //                     self.getApp().notify("Lưu thông tin thành công");
                        //                     // self.getApp().getRouter().navigate(self.collectionName + "/collection");
                        //                     // if (self.checkId === false && self.checkCreateButton === false){
                        //                     //     self.model.set(respose);
                        //                     //     self.checkCreateButton = true;
                        //                     //     self.$el.find(".toolbar").append(`<button type="button" btn-name="xacnhan" class="btn btn-info width-sm btn-xacnhan ml-2">Gửi duyệt</button>`);
                        //                     //     self.$el.find(".btn-xacnhan").unbind("click").bind("click", ()=>{
                        //                     //         self.xacNhan();
                        //                     //     });
                        //                     //     self.$el.find(".btn-delete").removeClass("d-none");
                        //                     // }
                        //                     // else{
                        //                     //     self.model.set(respose);
                        //                     // }
                        //                 },
                        //                 error: function(xhr, status, error) {
                        //                     try {
                        //                         if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                        //                             self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                        //                             self.getApp().getRouter().navigate("login");
                        //                         } else {
                        //                             self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                        //                         }
                        //                     } catch (err) {
                        //                         self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
                        //                     }
                        //                 },
                        //                 complete: function(){
                        //                     self.getApp().hideloading();
                        //                     checkAction = null;
                        //                 }
                        //             });
                        //         }
                        //         else{
                        //             checkAction = null;
                        //         }
                        //     });
                        // }
                        // else{
                        //     self.getApp().showloading();
                        //     self.model.save(null, {
                        //         success: function(model, respose, options) {
                        //             self.getApp().notify("Lưu thông tin thành công");
                        //             // self.getApp().getRouter().navigate(self.collectionName + "/collection");
                        //             // if (self.checkId === false && self.checkCreateButton === false){
                        //             //     self.model.set(respose);
                        //             //     self.checkCreateButton = true;
                        //             //     self.$el.find(".toolbar").append(`<button type="button" btn-name="xacnhan" class="btn btn-info width-sm btn-xacnhan ml-2">Gửi duyệt</button>`);
                        //             //     self.$el.find(".btn-xacnhan").unbind("click").bind("click", ()=>{
                        //             //         self.xacNhan();
                        //             //     });
                        //             //     self.$el.find(".btn-delete").removeClass("d-none");
                        //             // }
                        //             // else{
                        //             //     self.model.set(respose);
                        //             // }
                        //         },
                        //         error: function(xhr, status, error) {
                        //             try {
                        //                 if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                        //                     self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                        //                     self.getApp().getRouter().navigate("login");
                        //                 } else {
                        //                     self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                        //                 }
                        //             } catch (err) {
                        //                 self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
                        //             }
                        //         },
                        //         complete: function(){
                        //             self.getApp().hideloading();
                        //         }
                        //     });
                        // }
                    }
                },
                {
                    name: "delete",
                    type: "button",
                    buttonClass: "btn-danger width-sm btn ml-2 btn-delete d-none",
                    label: `<i class="fas fa-trash-alt"></i> Xóa`,
                    command: function() {
                        var self = this;
                        var delete_success = null;
                        self.$el.find("#exampleModalCenter").modal("show");
                        self.$el.find(".btn-deleted-continue").unbind("click").bind("click", function () {
                            delete_success = true;
                        });
    
                        self.$el.find("#exampleModalCenter").on("hidden.bs.modal", function (e) {
                            if (delete_success == true) {
                                self.getApp().showloading();
                                self.model.destroy({
                                    success: function(model, response) {
                                        self.getApp().hideloading();
                                        delete_success = null;
                                        self.getApp().notify('Xoá dữ liệu thành công');
                                        self.getApp().getRouter().navigate(self.collectionName + "/collection");
                                    },
                                    error: function(xhr, status, error) {
                                        self.getApp().hideloading();
                                        delete_success = null;
                                        try {
                                            if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                                self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                                self.getApp().getRouter().navigate("login");
                                            } else {
                                                self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                            }
                                        } catch (err) {
                                            self.getApp().notify({ message: "Xóa thông tin không thành công" }, { type: "danger", delay: 1000 });
                                        }
                                    }
                                });
                            }
                        });
                    }
                },
                {
                    name: "copy",
                    type: "button",
                    buttonClass: "btn-primary btn ml-2 btn-copy",
                    label: `<i class="far fa-copy"></i> Copy COA`,
                    visible: function() {
                        return this.getApp().getRouter().getParam("id") !== null;
                    },
                    command: function() {
                        var self = this;
                        self.copyPhieu();
                    }
                },
                // {
                //     name: "xacnhan",
                //     type: "button",
                //     buttonClass: "btn-primary waves-effect width-sm  ml-2 btn-xacnhan d-none",
                //     label: "Gửi duyệt",
                //     visible: function() {
                //         return this.getApp().getRouter().getParam("id") !== null;
                //     },
                //     command: function() {
                //         var self = this;
                //         self.xacNhan();
                //     }
                // },
                // {
                //     name: "duyet",
                //     type: "button",
                //     buttonClass: "btn-primary waves-effect width-sm  ml-2 btn-duyet d-none",
                //     label: "Duyệt",
                //     visible: function() {
                //         return this.getApp().getRouter().getParam("id") !== null;
                //     },
                //     command: function() {
                //         var self = this;
                //         self.duyet();
                //     }
                // },
                // {
                //     name: "huy-duyet",
                //     type: "button",
                //     buttonClass: "btn-primary btn-huy-duyet ml-1 d-none",
                //     label: "Hủy duyệt",
                //     visible: function(){
                //         return (this.getApp().getRouter().getParam("id") !== null && (this.getApp().hasRole("admin_donvi") || this.getApp().hasRole("canbo")));
                //     },
                //     command: function(){
                //         var self = this;
                //         self.huyDuyet();
                //     }
                // },
                // {
                //     name: "mo-khoa",
                //     type: "button",
                //     buttonClass: "btn-success btn-mokhoa ml-1 d-none",
                //     label: "Mở khóa",
                //     visible: function(){
                //         return (this.getApp().getRouter().getParam("id") !== null && (this.getApp().hasRole("admin_donvi") || this.getApp().hasRole("canbo")));
                //     },
                //     command: function(){
                //         var self = this;
                //         self.moKhoa();
                //     }
                // }
            ],
        }],
        uiControl: {
            fields: [{
                    field: "active",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: 1, text: "Đang hoạt động" },
                        { value: 0, text: "ngừng hoạt động" },
                    ],
                },
                {
                    field: "ngay_kiem_nghiem",
                    uicontrol: "datetimepicker",
                    format: "DD/MM/YYYY",
                    textFormat: "DD/MM/YYYY",
                    extraFormats: ["DDMMYYYY"],
                    parseInputDate: function(val) {
                        return gonrinApp().parseInputDateString(val);
                    },
                    parseOutputDate: function(date) {
                        return gonrinApp().parseOutputDateString(date);
                    },
                    disabledComponentButton: true
                },
                {
                    field: "ngay_nhan_mau",
                    uicontrol: "datetimepicker",
                    format: "DD/MM/YYYY",
                    textFormat: "DD/MM/YYYY",
                    extraFormats: ["DDMMYYYY"],
                    parseInputDate: function(val) {
                        return gonrinApp().parseInputDateString(val);
                    },
                    parseOutputDate: function(date) {
                        return gonrinApp().parseOutputDateString(date);
                    },
                    disabledComponentButton: true
                },
                {
                    field: "ngay_bao_cao",
                    uicontrol: "datetimepicker",
                    format: "DD/MM/YYYY",
                    textFormat: "DD/MM/YYYY",
                    extraFormats: ["DDMMYYYY"],
                    parseInputDate: function(val) {
                        return gonrinApp().parseInputDateString(val);
                    },
                    parseOutputDate: function(date) {
                        return gonrinApp().parseOutputDateString(date);
                    },
                    disabledComponentButton: true
                },
                {
                    field: "ngay_san_xuat",
                    uicontrol: "datetimepicker",
                    format: "DD/MM/YYYY",
                    textFormat: "DD/MM/YYYY",
                    extraFormats: ["DDMMYYYY"],
                    parseInputDate: function(val) {
                        return gonrinApp().parseInputDateString(val);
                    },
                    parseOutputDate: function(date) {
                        return gonrinApp().parseOutputDateString(date);
                    },
                    disabledComponentButton: true
                },
                {
                    field: "han_su_dung",
                    uicontrol: "datetimepicker",
                    format: "DD/MM/YYYY",
                    textFormat: "DD/MM/YYYY",
                    extraFormats: ["DDMMYYYY"],
                    parseInputDate: function(val) {
                        return gonrinApp().parseInputDateString(val);
                    },
                    parseOutputDate: function(date) {
                        return gonrinApp().parseOutputDateString(date);
                    },
                    disabledComponentButton: true
                },
                // {
                //     field: "tieu_chuan_kiem_nghiem",
                //     uicontrol: "combobox",
                //     textField: "text",
                //     valueField: "value",
                //     cssClass: "form-control",
                //     dataSource: [
                //         { value: "WO", text: "WO-Wholly Obtained" },
                //         { value: "PE", text: "PE-Produced Entirely" },
                //         { value: "RVC", text: "RVC-Regional Value Content" },
                //         { value: "CTC", text: "CTC-Change in Tariff" },
                //         { value: "PSRs", text: "PSRs-Product Specific Rules" },
                //         { value: "GR", text: "GR-General Rule" },
                //         { value: "SP", text: "SP-Specific Process" },
                //         { value: "PE", text: "PE-De Minimis" },
                //         { value: "Cumulation", text: "Cumulation" },
                //     ],
                // },
            ]
        },
        render: function() {
            var self = this;
            self.isView = false;
            self.isSetId = false;
            self.isSetObject = false;
            self.checkId = false;
            self.checkCreateButton = false;
            self.setObjDonvi = false;
            self.isSetIDNoiSanXuat = false;
            self.isSetNoiSanXuat = false;
            self.isViewNoiSanXuat = false;
            self.isSetIdDonViCap = false;
            self.isSetDonViCap = false;
            self.isViewDonViCap = false;
            self.isCreateButtonCopy = false;
            self.clickSave = false;
            var id = this.getApp().getRouter().getParam("id");
            self.regester_add_ketqua();
            if (id) {
                this.model.set('id', id);
                this.model.fetch({
                    success: function(data) {
                        self.applyBindings();
                        self.checkId = true;
                        self.isCreateButtonCopy = true;
                        self.selectizeDuoclieu();
                        if (self.model.get("auto_ma_kiem_nghiem")){
                            self.$el.find(".auto_ma_kiem_nghiem").prop("checked", true);
                        }

                        self.$el.find("#auto_ma_kiem_nghiem").attr("style", "pointer-events: none");
                        self.selectizeNoiSanXuat();
                        self.selectizeDonViCap();
                        self.initButton();
                    },
                    error: function() {
                        self.getApp().notify(self.getApp().traslate("TRANSLATE:error_load_data"));
                    },
                    complete: function() {
                        var fileView = new ManageFileVIew({ viewData: { "listFile": self.model.get('chungtu_dinhkem'), "$el_btn_upload": self.$el.find(".btn-add-file") }, el: self.$el.find(".list-attachment") });
                        fileView.render();
                        fileView.on("change", (event) => {
                            var listfile = event.data;
                            self.model.set('chungtu_dinhkem', listfile);
                        });
                        var ketqua = self.model.get("ket_qua");
                        if (ketqua === undefined || ketqua === null) {
                            ketqua = [];
                        }
                        ketqua.forEach((value, index) => {
                            self.render_ketqua(value);
                        })
                        self.checkTrangThai();
                    }

                });
            } else {
                self.applyBindings();
                self.selectizeDuoclieu();
                self.initAutoMa();
                self.selectizeNoiSanXuat();
                self.selectizeDonViCap();
                self.initButton();
                self.$el.find(".btn-xacnhan,.btn-huy-duyet,.btn-duyet").remove();
                self.$el.find(".btn-delete").addClass("d-none");
                self.$el.find(".btn-save").removeClass("d-none");
                var fileView = new ManageFileVIew({ viewData: { "listFile": self.model.get('chungtu_dinhkem'), "$el_btn_upload": self.$el.find(".btn-add-file") }, el: self.$el.find(".list-attachment") });
                fileView.render();
                fileView.on("change", (event) => {
                    var listfile = event.data;
                    self.model.set('chungtu_dinhkem', listfile);
                });

                let currentUser = self.getApp().currentUser;
                if (!!currentUser){
                    self.model.set({
                        donvi_yeucau: currentUser.donvi,
                        ma_donvi_yeucau: currentUser.donvi_id,
                        ten_donvi_yeucau: currentUser?.donvi.ten_coso,
                        diachi_donvi_yeucau: currentUser?.donvi.diachi
                    })
                }
            }
            // self.selectizeDonVi();
        },
        savePhieu: function(mode = 0, dataView = null) {
            var self = this;
            var ma_kiem_nghiem = self.model.get("ma_kiem_nghiem");
            if (!ma_kiem_nghiem || ma_kiem_nghiem == null || ma_kiem_nghiem == undefined) {
                self.getApp().notify({ message: "Vui lòng nhập mã kiểm nghiệm." }, { type: "danger", delay: 5000 });
                return;
            }
            var ngay_kiem_nghiem = self.model.get("ngay_kiem_nghiem");
            if (!ngay_kiem_nghiem || ngay_kiem_nghiem == null || ngay_kiem_nghiem == undefined) {
                self.getApp().notify({ message: "Vui lòng nhập ngày kiểm nghiệm." }, { type: "danger", delay: 5000 });
                return;
            }

            var ten_donvi_cap = self.model.get("ten_donvi_cap");
            if (ten_donvi_cap === undefined || ten_donvi_cap === null || ten_donvi_cap.trim() === "") {
                self.getApp().notify({ message: "Vui lòng nhập tên đơn vị cấp" }, { type: "danger", delay: 5000 });
                return false;
            }

            var ma_donvi_yeucau = self.model.get("ma_donvi_yeucau");
            if (ma_donvi_yeucau === undefined || ma_donvi_yeucau === null || ma_donvi_yeucau.trim() === "") {
                self.getApp().notify({ message: "Vui lòng nhập mã đơn vị yêu cầu" }, { type: "danger", delay: 5000 });
                return
            }

            var ten_donvi_yeucau = self.model.get("ten_donvi_yeucau");
            if (ten_donvi_yeucau === undefined || ten_donvi_yeucau === null || ten_donvi_yeucau.trim() === "") {
                self.getApp().notify({ message: "Vui lòng nhập têm đơn vị yêu cầu" }, { type: "danger", delay: 5000 });
                return;
            }

            self.model.save(null, {
                success: function(model, respose, options) {
                    if (mode == 0) {
                        self.getApp().notify("Lưu thông tin thành công");
                        self.getApp().getRouter().navigate(self.collectionName + "/collection");
                    } else if (mode == 1) {
                        self.model.set(model.attributes);
                        var chungnhan_id = self.model.get("id");
                        var chitietVattu = new ChitietVattu({ viewData: { "data": dataView, "chungnhan_id": chungnhan_id, "ma_kiem_nghiem": self.model.get("ma_kiem_nghiem"), "ngay_kiem_nghiem": self.model.get("ngay_kiem_nghiem") } });

                        chitietVattu.dialog({ size: "large" });
                        chitietVattu.on("saveVattu", function(event) {
                            self.$el.find('.table-vattu').show();
                            // var data = event.data;
                            var data_vattu = event.data;
                            self.onSaveDataVatTu(data_vattu);
                        });
                    }
                },
                error: function(xhr, status, error) {
                    try {
                        if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                            self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                            self.getApp().getRouter().navigate("login");
                        } else {
                            self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                        }
                    } catch (err) {
                        self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
                    }
                }
            });
        },
        DialogChitietVattu: function(dataView = null) {
            var self = this;
            var id = self.model.get("id");
            if (!id || id == null || id == undefined || id == "") {
                self.savePhieu(1, dataView);
            } else {
                var chungnhan_id = self.model.get("id");
                var chitietVattu = new ChitietVattu({ viewData: { "data": dataView, "chungnhan_id": chungnhan_id, "ma_kiem_nghiem": self.model.get("ma_kiem_nghiem"), "ngay_kiem_nghiem": self.model.get("ngay_kiem_nghiem") } });

                chitietVattu.dialog({ size: "large" });
                chitietVattu.on("saveVattu", function(event) {
                    self.$el.find('.table-vattu').show();
                    var data_vattu = event.data;
                    self.onSaveDataVatTu(data_vattu);
                });
            }
        },
        appendHtmlChitietVatTu: function(data) {
            var self = this;
            var tr_el = $("<tr>").attr({ "id": data.id });
            tr_el.html(`<td class="stt text-center">` + 1 + `</td>
				<td class="so_lo text-center">` + (data.so_lo ? data.so_lo : "") + `</td>
				<td class="ten_sanpham text-center">` + data.ten_sanpham + `</td>
				<td class="quy_cach text-center">` + (data.quy_cach) + `</td>
				<td class="luong_lay_mau text-center">` + (data.luong_lay_mau ? data.luong_lay_mau : "0") + `</td>
				<td class="nuoc_sanxuat text-center">` + (data.nuoc_sanxuat ? data.nuoc_sanxuat : "") + `</td>
				<td class="text-center"><a href="javascript:;" class="demo-delete-row btn btn-danger btn-xs btn-icon" title="Xóa"><i class="fa fa-times"></i></a></td>
				<td class="text-center">
					<a  href="javascript:;"  class="demo-edit-row btn btn-success btn-xs btn-icon" title="Sửa"><i class="mdi mdi-pencil"></i></a>
				</td>`);
            self.$el.find('.table-vattu tbody').append(tr_el);
            tr_el.find(".demo-delete-row").unbind("click").bind("click", { obj: data }, function(e) {
                e.stopPropagation();
                var data_vattu = e.data.obj;
                var url = (self.getApp().serviceURL || "") + '/api/v1/phieu_kiem_nghiem_chitiet/' + data_vattu.id;
                $.ajax({
                    url: url,
                    type: 'DELETE',
                    headers: {
                        'content-type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    success: function(response) {
                        var listSanpham = self.model.get("chitiet_giayphep");
                        if (listSanpham instanceof Array && listSanpham.length > 0) {
                            var arrayvattu = [];
                            for (var i = 0; i < listSanpham.length; i++) {
                                if (data_vattu.id == listSanpham[i].id) {
                                    self.$el.find(".table-vattu #" + data_vattu.id).remove();
                                    self.fillStt();
                                    continue
                                } else {
                                    arrayvattu.push(listSanpham[i]);
                                }
                            }
                            if (arrayvattu.length == 0) {
                                self.$el.find('.table-vattu').hide();
                            }
                            self.model.set("chitiet_giayphep", arrayvattu);
                            return;
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

            });
            tr_el.find(".demo-edit-row").unbind("click").bind("click", { obj: data }, function(e) {
                e.stopPropagation();
                var obj_data = e.data.obj;
                self.DialogChitietVattu(obj_data);
            });
        },
        onSaveDataVatTu: function(data_vattu) {
            var self = this;
            var listSanpham = self.model.get("chitiet_giayphep");
            if (listSanpham == null || listSanpham == undefined) {
                listSanpham = [];
            }
            var exits = false;
            if (listSanpham instanceof Array) {
                var arrayvattu = [];
                if (listSanpham.length == 0) {
                    arrayvattu.push(data_vattu);
                } else {
                    for (var i = 0; i < listSanpham.length; i++) {
                        if (data_vattu.id == listSanpham[i].id) {
                            exits = true;
                            continue
                        } else {
                            arrayvattu.push(listSanpham[i]);
                        }
                    }
                    arrayvattu.push(data_vattu);
                }
                self.model.set("chitiet_giayphep", arrayvattu);
                if (arrayvattu.length > 0) {
                    self.$el.find('.table-vattu').show();
                }
                if (exits == false) {
                    self.$el.find('.table-vattu').show();
                    self.appendHtmlChitietVatTu(data_vattu);
                    self.fillStt();
                } else {
                    var elt = self.$el.find(".table-vattu #" + data_vattu.id);
                    elt.find('.so_lo').text(data_vattu.so_lo);
                    elt.find('.ten_sanpham').text(data_vattu.ten_sanpham);
                    elt.find('.quy_cach').text(data_vattu.quy_cach);
                    elt.find('.luong_lay_mau').text(data_vattu.luong_lay_mau);
                    elt.find('.nuoc_sanxuat').text((data_vattu.nuoc_sanxuat).toLocaleString());
                    elt.find(".demo-edit-row").unbind("click").bind("click", { obj: data_vattu }, function(e) {
                        e.stopPropagation();
                        var obj_data = e.data.obj;
                        self.DialogChitietVattu(obj_data);
                    });
                }
            }
        },
        fillStt: function() {
            var self = this;
            var stt = self.$el.find(".stt");
            $.each(stt, (index, element) => {
                $(element).text(index + 1);
            });
        },
        selectizeDuoclieu: function() {
            var self = this;
            var $selectize = self.$el.find('#selectize-programmatic').selectize({
                valueField: 'id_sanpham',
                labelField: 'ten_sanpham',
                searchField: ['ten_sanpham', 'ten_khoa_hoc', 'tenkhongdau'],
                preload: true,
                render: {
                    option: function(item, escape) {
                        return `<div class="option">${item.ten_sanpham} - ${item.ten_khoa_hoc} - ${item.ma_viettat}</div>`;
                    }
                },
                load: function(query, callback) {
                    var query_filter = {
                        "filters": {
                            "$or": [
                                { "ten_sanpham": { "$likeI": (query) } },
                                { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                { "ten_khoa_hoc": { "$likeI": gonrinApp().convert_khongdau(query) } },
                            ]
                        },
                    };
                    let sanpham = self.model.get("sanpham");
					if (!!sanpham && self.isSetObject === false){
                        callback([sanpham]);
						self.isSetObject = true;
					}
                    var url = (self.getApp().serviceURL || "") + '/api/v1/sanpham_donvi_filter?results_per_page=20' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                            var id_sanpham = self.model.get("id_sanpham");
                            if (!!id_sanpham && self.isSetId === false) {
                                var $selectz = (self.$el.find('#selectize-programmatic'))[0]
                                $selectz.selectize.setValue([id_sanpham]);
                                self.isSetId = true;
                                // $selectz.selectize.disable();
                            }
                        }
                    });

                },
                onChange: function(value, isOnInitialize) {
                    var $selectz = (self.$el.find('#selectize-programmatic'))[0]
                    var obj = $selectz.selectize.options[value];
                    if (obj !== null && obj !== undefined) {
                        self.$el.find('.info_duoclieu').html(`<small><b>Chi tiết:</b> ${obj.ten_sanpham} - ${obj.ten_khoa_hoc}</small>`);
                        let id = self.model.get("id");
                        if (!id || self.isView === true){
                            self.model.set({
                                "ten_sanpham": obj.ten_sanpham,
                                "ma_sanpham": obj.ma_sanpham,
                                "id_sanpham": obj.id_sanpham,
                                "sanpham": obj,
                                "loai_sanpham": obj.loai_sanpham
                            });
                        }
                        else{
                            self.isView = true;
                        }
                    } else {
                        self.$el.find('.info_duoclieu').html(``);
                        self.model.set({
                            "ten_sanpham": null,
                            "ma_sanpham": null,
                            "id_sanpham": null,
                            "sanpham": null,
                            "loai_sanpham": null
                        });
                    }
                }
            });
        },
        validate_save_cq: function() {
            var self = this;
            var sanpham = self.model.get("sanpham");
            if (!sanpham || sanpham == null || sanpham == undefined || sanpham == "") {
                self.getApp().notify({ message: "Vui lòng chọn dược liệu"}, { type: "danger", delay: 1000 });
                return false;
            }

            var noi_san_suat = self.model.get("noi_san_suat");
            if (noi_san_suat === undefined || noi_san_suat === null || noi_san_suat === ""){
                self.getApp().notify({ message: "Vui lòng nhập nơi sản xuất"}, { type: "danger", delay: 1000 });
                return false;
            }

            var so_lo = self.model.get("so_lo");
            if (so_lo === undefined || so_lo === null || so_lo ===""){
                self.getApp().notify({message: "Vui lòng nhập số lô."}, {type : "danger", delay : 2000});
                return false;
            }


            var ngay_san_xuat = self.model.get("ngay_san_xuat");
            if (!ngay_san_xuat || ngay_san_xuat == null || ngay_san_xuat == undefined || ngay_san_xuat == "") {
                self.getApp().notify({ message: "Vui lòng nhập ngày sản xuất"}, { type: "danger", delay: 1000 });
                return false;
            }
            var han_su_dung = self.model.get("han_su_dung");
            if (!han_su_dung || han_su_dung == null || han_su_dung == undefined || han_su_dung == "") {
                self.getApp().notify({ message: "Vui lòng nhập hạn sử dụng"}, { type: "danger", delay: 1000 });
                return false;
            }

            var tieu_chuan_kiem_nghiem = self.model.get("tieu_chuan_kiem_nghiem");
            if (!tieu_chuan_kiem_nghiem){
                self.getApp().notify({message:"Vui lòng nhập tiêu chuẩn kiểm nghiệm"}, {type:'danger', delay : 1000});
                return false;
            }
            if (!self.model.get("auto_ma_kiem_nghiem")){
                var ma_kiem_nghiem = self.model.get("ma_kiem_nghiem");
                if (!ma_kiem_nghiem || ma_kiem_nghiem == null || ma_kiem_nghiem == undefined) {
                    self.getApp().notify({ message: "Vui lòng nhập mã kiểm nghiệm." }, { type: "danger", delay: 5000 });
                    return false;
                }
            }


            var ngay_kiem_nghiem = self.model.get("ngay_kiem_nghiem");
            if (!ngay_kiem_nghiem || ngay_kiem_nghiem == null || ngay_kiem_nghiem == undefined) {
                self.getApp().notify({ message: "Vui lòng nhập ngày kiểm nghiệm." }, { type: "danger", delay: 5000 });
                return false;
            }
            var ngay_bao_cao = self.model.get("ngay_bao_cao");
            if (!ngay_bao_cao || ngay_bao_cao == null || ngay_bao_cao == undefined || ngay_bao_cao == "") {
                self.getApp().notify({ message: "Vui lòng nhập ngày báo cáo"}, { type: "danger", delay: 1000 });
                return false;
            }

            let luong_lay_mau = self.model.get("luong_lay_mau");
            if (!luong_lay_mau){
                self.getApp().notify({ message: "Vui lòng nhập lượng lấy mẫu" }, { type: "danger", delay: 5000 });
                return false;
            }

            var ma_donvi_yeucau = self.model.get("ma_donvi_yeucau");
            if (ma_donvi_yeucau === undefined || ma_donvi_yeucau === null || ma_donvi_yeucau.trim() === "") {
                self.getApp().notify({ message: "Vui lòng nhập mã đơn vị yêu cầu" }, { type: "danger", delay: 5000 });
                return false;
            }

            var ten_donvi_cap = self.model.get("ten_donvi_cap");
            if (ten_donvi_cap === undefined || ten_donvi_cap === null || ten_donvi_cap === ""){
                self.getApp().notify({message : "Vui lòng nhập tên đơn vị cấp"}, {type : "danger", delay : 1000});
                return false;
            }
            return true;
        },
        regester_add_ketqua: function() {
            var self = this;
            self.$el.find(".btn-add-ketqua").unbind("click").bind("click", function(e) {
                e.stopPropagation();
                var ketquakiemnghiem = new DialogKetQua();
                ketquakiemnghiem.dialog();
                ketquakiemnghiem.on("saveData", function(event) {
                    var data = event.data;
                    var ketqua = self.model.get('ket_qua');
                    if (ketqua == null || ketqua == undefined || ketqua == "") {
                        ketqua = [];
                    }
                    if (ketqua instanceof Array) {
                        var list_ketqua = [];
                        var exist = false;
                        ketqua.forEach((value, index) => {
                            if (value.id == data.id) {
                                exist = true;
                            } else {
                                list_ketqua.push(value);
                            }
                        });
                        list_ketqua.push(data);
                        self.model.set("ket_qua", list_ketqua);
                        if (exist == false) {
                            self.render_ketqua(data);
                        }
                    }
                });
            });
        },
        render_ketqua: function(data) {
            var self = this;
            var id = data.id;
            var chitieukiemtra = data.chitieukiemtra;
            var noidung = data.noidung;
            var ketqua = data.ketqua;
            var ketluan = data.ketluan;
            self.$el.find(".table-ket-qua-kiem-nghiem tbody").append(`<tr id = "` + id + `">
			<td class ="chitieukiemtra">` + (chitieukiemtra? chitieukiemtra : "") + `</td> 
            <td class="noidung">` + (noidung? noidung : "") + `</td>
            <td class="ketqua">` + (ketqua? ketqua : "") + `</td>
			<td class="ketluan">` + ((ketluan == "1") ? "Đạt" : "Không Đạt") + `</td>
            <td class="text-center"><a href="javascript:;" class="demo-delete-row btn btn-danger btn-xs btn-icon" 
            title="Xóa"><i class="fa fa-times"></i></a>
            <a href="javascript:;"  class="demo-edit-row btn btn-success btn-xs btn-icon" title="Sửa"><i class="mdi mdi-pencil"></i></a>
            </td>
			</tr>`)
            self.$el.find("#" + id + " .demo-delete-row").unbind("click").bind("click", function() {
                var ketqua = self.model.get('ket_qua');
                if (ketqua == null || ketqua == undefined || ketqua == "") {
                    ketqua = [];
                }
                if (ketqua instanceof Array) {
                    var list_ketqua = [];
                    ketqua.forEach((value, index) => {
                        if (value.id == data.id) {} else {
                            list_ketqua.push(value);
                        }
                    });
                    self.model.set("ket_qua", list_ketqua);
                }
                self.$el.find("#" + id).remove();
            });
            self.$el.find("#" + id + " .demo-edit-row").unbind("click").bind("click", { obj: data } ,function(e){
                e.stopPropagation();
                var obj_data = e.data.obj;
                var ketquakiemnghiem = new DialogKetQua({viewData : obj_data});
                ketquakiemnghiem.dialog();
                ketquakiemnghiem.on("saveData", function(event){
                    var data = event.data;

                    var ketqua = self.model.get('ket_qua');
                    if (ketqua == null || ketqua == undefined || ketqua == "") {
                        ketqua = [];
                    }
                    if (ketqua instanceof Array) {
                        var list_ketqua = [];
                        var exist = false;
                        ketqua.forEach((value, index) => {
                            if (value.id == data.id) {
                                exist = true;
                            } else {
                                list_ketqua.push(value);
                            }
                        });
                        list_ketqua.push(data);
                        self.model.set("ket_qua", list_ketqua);
                        if (exist == false) {
                            self.render_ketqua(data);
                        }
                        else{
                            self.$el.find('tr#' + data.id + " .chitieukiemtra").html(data.chitieukiemtra);
                            self.$el.find('tr#' + data.id + " .noidung").html(data.noidung);
                            self.$el.find('tr#' + data.id + " .ketqua").html(data.ketqua);
                            var ketluan = data.ketluan;
                            self.$el.find('tr#' + data.id + " .ketluan").html(((ketluan == "1") ? "Đạt" : "Không Đạt"));
                        }
                    }
                })
            });
        },
        selectizeDonVi: function(id) {
            var self = this;
            var currentUser = self.getApp().currentUser;
            var $selectize0 = self.$el.find('#donvi_yeucau').selectize({
                maxItems: 1,
                valueField: 'id',
                labelField: 'ten_coso',
                searchField: ['ma_coso', 'tenkhongdau'],
                preload: true,
                load: function(query, callback) {
                    var query_filter = {
                        "filters": {
                            "$and": [{
                                    "$or": [
                                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                        { "ma_coso": { "$eq": query } }
                                    ],
                                    "order_by": [{ "field": "ten_coso", "direction": "asc" }]
                                },
                                {"$or" : [  
                                        { "loai_donvi": { "$eq": 2 } },
                                        { "loai_donvi": { "$eq": 3 } },
                                        { "loai_donvi": { "$eq": 4 } },
                                        { "loai_donvi": { "$eq": 5 } },
                                        { "loai_donvi": { "$eq": 6 } },
                                        { "loai_donvi": { "$eq": 7 } },
                                        { "loai_donvi": { "$eq": 8 } },
                                        { "loai_donvi": { "$eq": 9 } },
                                ]}
                            ]
                        }

                    };
                    
                    let id = self.model.get("id");
                    if (!id){
                        let objs = currentUser.donvi;
                        if (!!objs && self.setObjDonvi === false){
                            callback([objs]);
                            self.setObjDonvi = true;
                        }
                    }
                    else{

                        let objs = self.model.get("donvi_yeucau");
                        if (!!objs && self.setObjDonvi === false ){
                            callback([objs]);
                            self.setObjDonvi = true;
                            console.log("x")
                        }
                        else{
                            let objsTmp = currentUser.donvi;
                            if (!!objsTmp && self.setObjDonvi === false){
                                callback([objsTmp]);
                                self.setObjDonvi = true;
                            }
                        }


                    }


                    var url = (self.getApp().serviceURL || "") + '/api/v1/donvi_filter?page=1&results_per_page=20' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);

                            let id = self.model.get("id");
                            if (!id){
                                if (!!currentUser.donvi_id) {
                                    var $selectz = self.$el.find('#donvi_yeucau')[0]
                                    $selectz.selectize.setValue([currentUser.donvi_id]);
                                }
                            }
                            else{
                                let ma_donvi_yeucau = self.model.get("ma_donvi_yeucau");
                                if (!!ma_donvi_yeucau){
                                    var $selectz = self.$el.find('#donvi_yeucau')[0]
                                    $selectz.selectize.setValue([ma_donvi_yeucau]);
                                }
                                else{
                                    if (!!currentUser.donvi_id) {
                                        var $selectz = self.$el.find('#donvi_yeucau')[0]
                                        $selectz.selectize.setValue([currentUser.donvi_id]);
                                    }
                                }
                            }


                        }
                    });
                },
                onChange: function(value) {
                    var obj = $selectize0[0].selectize.options[value];
                    if (obj !== null && obj !== undefined) {
                        self.model.set({
                            "donvi_yeucau": obj,
                            "ma_donvi_yeucau": obj.id,
                            "ten_donvi_yeucau": obj.ten_coso,
                        });
                        var diachi_donvi_yeucau = obj.diachi;
                        if (!!diachi_donvi_yeucau && diachi_donvi_yeucau != ""){
                            self.model.set("diachi_donvi_yeucau", diachi_donvi_yeucau);
                        }
                    } else {
                        self.model.set({
                            "donvi_yeucau": null,
                            "ma_donvi_yeucau": null,
                            "ten_donvi_yeucau": null,
                        });
                    }
                }
            });
        },
        btn_duyet : function(){
            var self = this;
            var chungnhan_id = this.getApp().getRouter().getParam("id");
            var currentUser = self.getApp().currentUser;
            var tuyendonvi_id = "";
            if (!!currentUser && !!currentUser.donvi){
                tuyendonvi_id = currentUser.donvi.tuyendonvi_id;
            }
            var trangthai = self.model.get("trangthai");
            if (!!chungnhan_id && tuyendonvi_id == "10"){
                if(trangthai == 1){
                    self.$el.find(".toolbar .toolbar-group").append('<button type="button" btn-name="Duyet" class="btn btn-primary width-sm button_duyet ml-1">Duyệt</button>');
                }
                else{
                    if (gonrinApp().hasRole("admin_donvi")){
                        self.$el.find(".toolbar .toolbar-group").append('<button type="button" btn-name="Huy" class="btn btn-danger width-sm button_huy_duyet ml-1">Hủy Duyệt</button>');
                    }
                }
                self.$el.find(".button_duyet").unbind("click").bind("click", function(){
					self.getApp().showloading();
                    self.change_trangthai(2);
                })
                self.$el.find(".button_huy_duyet").unbind("click").bind("click", function(){
                    self.getApp().showloading();
                    self.change_trangthai(1);
                })
            }
        },
        change_trangthai : function(trangthai){
			var self = this;
			var params = JSON.stringify({
                "chungnhan_id": self.model.get("id"),
                "trangthai" : trangthai
			});
			$.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/change_status_chungnhan_cq',
				dataType: "json",
				contentType: "application/json",
				method: 'POST',
				data: params,
				success: function(response) {
                    self.getApp().hideloading();
                    if (trangthai == 1){
                        self.getApp().notify({message : "Hủy duyệt thành công"});
                        self.getApp().getRouter().refresh();
                    }
                    else if (trangthai == 2){
                        self.getApp().notify({message : "Duyệt thành công"});
                        self.getApp().getRouter().refresh();
                    }
				},
				error:function(xhr,status,error){
					self.getApp().hideloading();
					try {
						if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
							self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
							self.getApp().getRouter().navigate("login");
						} else {
						self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
						}
					}
					catch (err) {
						self.getApp().notify({ message: "Có lỗi xảy ra vui lòng thử lại sau"}, { type: "danger", delay: 1000 });
					}
				},
			});
        },
        xacNhan : function(){
			var self = this;
			let params = {
				id : self.model.get("id")
			}
			self.getApp().showloading();
			$.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/xacnhan_cq',
				dataType: "json",
				contentType: "application/json",
				method: 'POST',
				data: JSON.stringify(params),
				success: function(response) {
					self.getApp().hideloading();
					self.getApp().notify({message : "Gửi duyệt thành công"});
					self.$el.find(".btn-delete,.btn-save,.btn-xacnhan").remove();
				},
				error:function(xhr,status,error){
					self.getApp().hideloading();
					try {
						if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
							self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
							self.getApp().getRouter().navigate("login");
						} else {
						self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
						}
					}
					catch (err) {
						self.getApp().notify({ message: "Có lỗi xảy ra vui lòng thử lại sau"}, { type: "danger", delay: 1000 });
					}
				},
			});
        },
        duyet : function(){
            var self = this;
			let params = {
				id : self.model.get("id")
			}
			self.getApp().showloading();
			$.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/duyet_cq',
				dataType: "json",
				contentType: "application/json",
				method: 'POST',
				data: JSON.stringify(params),
				success: function(response) {
					self.getApp().hideloading();
					self.getApp().notify({message : "Duyệt thành công"});
					self.getApp().getRouter().refresh();
				},
				error:function(xhr,status,error){
					self.getApp().hideloading();
					try {
						if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
							self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
							self.getApp().getRouter().navigate("login");
						} else {
						self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
						}
					}
					catch (err) {
						self.getApp().notify({ message: "Có lỗi xảy ra vui lòng thử lại sau"}, { type: "danger", delay: 1000 });
					}
				},
			});
        },
        huyDuyet: function(){
            var self = this;
			let params = {
				id : self.model.get("id")
			}
			self.getApp().showloading();
			$.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/huy_cq',
				dataType: "json",
				contentType: "application/json",
				method: 'POST',
				data: JSON.stringify(params),
				success: function(response) {
					self.getApp().hideloading();
					self.getApp().notify({message : "Hủy duyệt thành công"});
					self.getApp().getRouter().refresh();
				},
				error:function(xhr,status,error){
					self.getApp().hideloading();
					try {
						if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
							self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
							self.getApp().getRouter().navigate("login");
						} else {
						self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
						}
					}
					catch (err) {
						self.getApp().notify({ message: "Có lỗi xảy ra vui lòng thử lại sau"}, { type: "danger", delay: 1000 });
					}
				},
			});
        },
        checkTrangThai: function(){
            var self = this;
            var donvi_id_owner = self.model.get("donvi_id");
            var donvi_id = "";
            var currentUser = self.getApp().currentUser;
            if (!!currentUser && !!currentUser.donvi_id) {
                donvi_id = currentUser.donvi_id;
            }
            var trangthai = self.model.get("trangthai");
            if (donvi_id != donvi_id_owner) {
                self.$el.find("input,textarea").prop("disabled", true);
                self.$el.find(".btn-save").remove();
                self.$el.find('.btn-copy').remove();
                self.$el.find(".btn-delete").remove();
                self.$el.find(".btn-xacnhan").remove();
                self.$el.find("button#itemRemove").unbind("click");
                self.$el.find("button#itemRemove").prop("disabled", true);
                self.$el.find("button.btn-add-noi_san_suat").unbind("click");
                self.$el.find("button.btn-add-noi_san_suat").prop("disabled", true);
                self.$el.find("button.btn-add-ten_donvi_cap").unbind("click");
                self.$el.find("button.btn-add-ten_donvi_cap").prop("disabled", true);
                self.$el.find("#selectize-sogiayphep").prop("disabled", true);
                self.$el.find("#cuakhau").attr("disabled", true);
                self.$el.find(".form-control").attr("disabled", true);
                self.$el.find("a.demo-edit-row").unbind("click");
                self.$el.find("a.demo-delete-row").unbind("click");
                self.$el.find("a.demo-delete-row").prop("disabled", true);
                self.$el.find("a.demo-edit-row").prop("disabled", true);
                self.$el.find(".form-control.selectize-control").attr("style", "pointer-events:none");
                self.$el.find(".btn-add-ketqua").remove();
                self.$el.find(".btn-add-file").remove();
                self.$el.find("a.demo-delete-row").remove();
                self.$el.find("a.demo-edit-row").remove();
                self.$el.find(".table-ket-qua-kiem-nghiem thead tr th").last().addClass("d-none");
                let xml_tr = self.$el.find(".table-ket-qua-kiem-nghiem tbody tr");
                for (let i=0; i<xml_tr.length; i++){
                    $(xml_tr[i]).find("td:last").addClass("d-none");
                }
            }
            else if (trangthai == 1){
                self.$el.find(".btn-save,.btn-delete,.btn-xacnhan").removeClass("d-none");
            }
            let tuyendonvi_id = "";
            if (!!currentUser && !!currentUser.donvi){
                tuyendonvi_id = currentUser.donvi.tuyendonvi_id;
            }
            if (tuyendonvi_id == "10" && trangthai === 3){
                self.$el.find(".btn-huy-duyet").removeClass("d-none");
            }
            else if (tuyendonvi_id == "10" && trangthai == 2){
                self.$el.find(".btn-duyet").removeClass("d-none");
                self.$el.find(".btn-mokhoa").removeClass("d-none");
            }
            else{
                self.$el.find(".btn-huy-duyet,.btn-duyet,.btn-mokhoa").remove();
            } 
        },
        moKhoa : function(){
            var self = this;
			let params = {
				id : self.model.get("id")
			}
			self.getApp().showloading();
			$.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/mo_cq',
				dataType: "json",
				contentType: "application/json",
				method: 'POST',
				data: JSON.stringify(params),
				success: function(response) {
					self.getApp().hideloading();
					self.getApp().notify({message : "Cho phép doanh nghiệp chỉnh sửa giấy phép thành công"});
					let path = "phieu_kiem_nghiem_cuc/collection";
					self.getApp().getRouter().navigate(path);
				},
				error:function(xhr,status,error){
					self.getApp().hideloading();
					try {
						if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
							self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
							self.getApp().getRouter().navigate("login");
						} else {
						self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
						}
					}
					catch (err) {
						self.getApp().notify({ message: "Có lỗi xảy ra vui lòng thử lại sau"}, { type: "danger", delay: 1000 });
					}
				},
			});
		},
        initAutoMa: function(){
            var self = this;
            self.$el.find(".auto_ma_kiem_nghiem").on("change", ()=>{
                let checked = self.$el.find(".auto_ma_kiem_nghiem").prop("checked");
                if(checked){
                    self.model.set("auto_ma_kiem_nghiem", true);

                    self.$el.find("#ma_kiem_nghiem").attr("style", "pointer-events: none");
                }
                else{
                    self.model.set("auto_ma_kiem_nghiem", false);
                    self.$el.find("#ma_kiem_nghiem").attr("style", "pointer-events: all");
                }
            })
        },
        selectizeNoiSanXuat: function(){
            var self = this;
            var $selectize = self.$el.find('#noi_san_suat').selectize({
                valueField: 'id',
                labelField: 'ten',
                searchField: ['ten', 'tenkhongdau', 'ma_viettat'],
                preload: true,
                render: {
                    option: function(item, escape) {
                        return `<div class="option">${item.ten}</div>`;
                    }
                },
                load: function(query, callback) {
                    var query_filter = {
                        "filters": {
                            "$or": [
                                { "ten": { "$likeI": (query) } },
                                { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                { "ma_viettat": { "$likeI": gonrinApp().convert_khongdau(query) } }
                            ]
                        },
                    };

                    let noi_san_suat = self.model.get("noi_san_suat");
                    let noi_san_suat_id = self.model.get("noi_san_suat_id");
                    if (!!noi_san_suat && !!noi_san_suat_id && self.isSetNoiSanXuat == false){
                        let objs = {
                            id: noi_san_suat_id,
                            ten: noi_san_suat
                        }
                        callback([objs]);
                        self.isSetNoiSanXuat = false;
                    }

                    var url = (self.getApp().serviceURL || "") + '/api/v1/noisanxuat_filter?results_per_page=20' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                            if (!!noi_san_suat_id && self.isSetIDNoiSanXuat == false){
                                self.$el.find('#noi_san_suat')[0].selectize.setValue(noi_san_suat_id);
                                self.isSetIDNoiSanXuat = true;
                            }
                        }   
                    });

                },
                onChange: function(value, isOnInitialize) {
                    var $selectz = (self.$el.find('#noi_san_suat'))[0]
                    var obj = $selectz.selectize.options[value];
                    if (obj !== null && obj !== undefined) {
                        let id = self.model.get("id");
                        if (!id || self.isViewNoiSanXuat == true){
                            self.model.set({
                                noi_san_suat: obj.ten,
                                noi_san_suat_id: obj.id
                            })
                        }
                        else{
                            if (!self.model.get("noi_san_suat_id")){
                                self.model.set({
                                    noi_san_suat: obj.ten,
                                    noi_san_suat_id: obj.id
                                })
                            }
                            self.isViewNoiSanXuat = true;
                        }
                    } 
                    else {
                        self.model.set({
                            noi_san_suat: null,
                            noi_san_suat_id: null
                        })
                    }
                }
            });
        },
        selectizeDonViCap: function(){
            var self = this;
            var $selectize = self.$el.find('#ten_donvi_cap').selectize({
                valueField: 'id',
                labelField: 'ten',
                searchField: ['ten', 'tenkhongdau', "ma_viettat"],
                preload: true,
                render: {
                    option: function(item, escape) {
                        return `<div class="option">${item.ten}</div>`;
                    }
                },
                load: function(query, callback) {
                    var query_filter = {
                        "filters": {
                            "$or": [
                                { "ten": { "$likeI": (query) } },
                                { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                { "ma_viettat": { "$likeI": gonrinApp().convert_khongdau(query) } }
                            ]
                        },
                    };

                    let ten_donvi_cap = self.model.get("ten_donvi_cap");
                    let donvi_cap_id = self.model.get("donvi_cap_id");
                    if (!!ten_donvi_cap && !!donvi_cap_id && self.isSetDonViCap == false){
                        let objs = {
                            id: donvi_cap_id,
                            ten: ten_donvi_cap
                        }
                        callback([objs]);
                        self.isSetDonViCap = false;
                    }

                    var url = (self.getApp().serviceURL || "") + '/api/v1/donvicap_filter?results_per_page=20' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                            if (!!donvi_cap_id && self.isSetIdDonViCap == false){
                                self.$el.find('#ten_donvi_cap')[0].selectize.setValue(donvi_cap_id);
                                self.isSetIdDonViCap = true;
                            }
                        }   
                    });

                },
                onChange: function(value, isOnInitialize) {
                    var $selectz = (self.$el.find('#ten_donvi_cap'))[0]
                    var obj = $selectz.selectize.options[value];
                    if (obj !== null && obj !== undefined) {
                        let id = self.model.get("id");
                        if (!id || self.isViewDonViCap == true){
                            self.model.set({
                                ten_donvi_cap: obj.ten,
                                donvi_cap_id: obj.id
                            })
                        }
                        else{
                            if (!self.model.get("donvi_cap_id")){
                                self.model.set({
                                    ten_donvi_cap: obj.ten,
                                    donvi_cap_id: obj.id
                                })
                            }
                            self.isViewDonViCap = true;
                        }
                    } 
                    else {
                        self.model.set({
                            ten_donvi_cap: null,
                            donvi_cap_id: null
                        })
                    }
                }
            });
        },
        initButton: function(){
            var self = this;
            self.$el.find(`.btn-add-noi_san_suat`).unbind("click").bind("click", (event) =>{
                event.stopPropagation();
                let noiSanXuat = new NoiSanXuat();
                noiSanXuat.dialog({size:'medium'});
                noiSanXuat.on("saveData", (event)=>{
                    let data = event.data;
                    if (!!data){
                        let ten = data.ten;
                        let id = data.id;
                        self.model.set({
                            noi_san_suat: ten,
                            noi_san_suat_id: id
                        })
                    }
                    let selectNSX = (self.$el.find(`#noi_san_suat`))[0];
                    if (!!selectNSX && !!selectNSX.selectize){
                        selectNSX.selectize.destroy();
                        self.isSetNoiSanXuat = false;
                        self.isSetIDNoiSanXuat = false;
                        self.selectizeNoiSanXuat();
                    }
                })
            })


            self.$el.find(`.btn-add-ten_donvi_cap`).unbind("click").bind("click", (event) =>{
                event.stopPropagation();
                let donviCap = new DonViCap();
                donviCap.dialog({size:'medium'});
                donviCap.on("saveData", (event)=>{
                    let data = event.data;
                    if (!!data){
                        let ten = data.ten;
                        let id = data.id;
                        self.model.set({
                            ten_donvi_cap: ten,
                            donvi_cap_id: id
                        })
                    }
                    let selectDVC = (self.$el.find(`#ten_donvi_cap`))[0];
                    if (!!selectDVC && !!selectDVC.selectize){
                        selectDVC.selectize.destroy();
                        self.isSetDonViCap = false;
                        self.isSetIdDonViCap = false;
                        self.selectizeDonViCap();
                    }
                })
            })
        },
        copyPhieu: function(){
            var self = this;
            let copyPhieu = new CopyView({viewData: self.model.toJSON()});
            copyPhieu.dialog({size:'large'});
            copyPhieu.on("saveData", (event)=>{
                let id = event.data;
                if (!!id){
                    let path = `phieu_kiem_nghiem/model?id=${id}&backCollection=true`;
                    this.getApp().getRouter().navigate(path);
                }
            })
        }
    });

});