define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/giaychungnhanco/tpl/model_dialog.html'),
        schema = require('json!schema/GiayChungNhanCOSchema.json');
    var ChitietVattu = require('app/giaychungnhanco/ChitietPhieuDialog/ChitietVatTu');
    var ManageFileVIew = require("app/view/AttachFile/ManageFileUploadView");
    var AttachFileVIew = require("app/view/AttachFile/AttachFileVIew");
    var ResultImportExcel = require('app/giaychungnhanco/ResultImportExcel');
    var WarningView = require('app/giaychungnhanco/WarningView');
    var ResultSaveCO = require('app/giaychungnhanco/ResultSaveCO');
    var DonViChungNhanCO = require('app/giaychungnhanco/DonViCapCO');
    var ChonKho = require('app/giaychungnhanco/ChonKho');

    return Gonrin.ModelDialogView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "giaychungnhanco",
        checkId: false,
        setObjTiepNhan: false,
        setIdTiepNhan: false,
        viewTiepNhan: false,
        checkCreateButton: false,
        firstViewCuaKhau: false,
        isSetObjCuaKhau: false,
        isSetIdCuaKhau: false,
        setObjQuocGiaSanXuat: false,
        setObjQuocGiaTiepnhan: false,
        setObjQuocGiaPhanPhoi: false,
        changeInfo: false,
        addNew: false,
        changeChiTiet: false,
        oldSoCo: null,
        listAddNew: [],
        listChange: [],
        clickSave: false,
        seted_giayphep: false,
        setIdGiayPhep: false,
        isSetIdDonViCap: false,
        isSetDonViCap: false,
        isViewDonViCap: false,
        listChiTiet: [],
        ma_kho: null,
        tao_phieu_nhap: null,
        tools: [{
            name: "defaultgr",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [{
                    name: "back",
                    type: "button",
                    buttonClass: "btn-secondary waves-effect btn",
                    label: `<i class="fas fa-arrow-circle-left"></i> Đóng`,
                    command: function() {
                        var self = this;
                        self.close();
                    }
                },
                {
                    name: "save",
                    type: "button",
                    buttonClass: "btn-success btn width-sm ml-1",
                    label: `<i class="far fa-save"></i> Lưu`,
                    command: function() {
                        var self = this;
                        var isValid = self.validateData();
                        if (!isValid) {
                            return;
                        }
                        if (self.listChiTiet === null || self.listChiTiet === undefined){
                            self.getApp().notify({message: "Vui lòng thêm thông tin dược liệu"}, {type : "danger", delay : 1000});
                            return false;
                        }
                        else{
                            if (Array.isArray(self.listChiTiet) === true && self.listChiTiet.length ==0){
                                self.getApp().notify({message: "Vui lòng thêm thông tin dược liệu"}, {type : "danger", delay : 1000});
                                return false;
                            }
                        }

                        let chungtu_dinhkem = self.model.get("chungtu_dinhkem");
                        if (!chungtu_dinhkem || (Array.isArray(chungtu_dinhkem) === true && chungtu_dinhkem.length ===0)){
                            self.getApp().notify({message: "Vui lòng tải lên bản Scan giấy chứng nhận để cơ quan quản lý đối soát"}, {type: "danger", delay : 1000});
                            return false;
                        }

                        if (self.oldSoCo !== self.model.get("so_co")){
                            self.changeInfo = true;
                        }

                        if (self.clickSave === true){
                            return false;
                        }
                        self.clickSave = true;

                        if (self.model.get("loai_co") ===1){

                            if (!self.tao_phieu_nhap){
                                let chonKho = new ChonKho();
                                chonKho.dialog({size:'large'});
                                chonKho.on("saveData", (event)=>{
                                    self.ma_kho = event.data;
                                    self.saveCoNew();
                                })
                            }
                            else{
                                self.saveCoNew();
                                return;
                            }
                        } 
                        else{
                            self.getApp().showloading();
                            self.model.save(null, {
                                success: function(model, respose, options) {
                                    self.getApp().notify("Lưu thông tin thành công");
                                    self.trigger('saveCO', self.model.toJSON());
                                    self.close();
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
                                },
                                complete: function(){
                                    self.getApp().hideloading();
                                    self.clickSave = false;
                                    self.changeChiTiet = false;
                                    self.addNew = false;
                                }
                            });

                        }
                    }
                }
            ],
        }],
        uiControl: {
            fields: [
                {
                    field: "loaihinh_vanchuyen",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: "1", text: "Đường bộ" },
                        { value: "2", text: "Đường biển" },
                        { value: "3", text: "Đường hàng không" },
                        { value: "4", text: "Đường sắt" },
                    ],
                },
                {
                    field: "loai_co",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: 1, text: "Ngoài nước" },
                        { value: 2, text: "Trong nước" }
                    ],
                },
                {
                    field: "thoigian_cap_co",
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
                    field: "ngay_khoi_hanh",
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
                    field: "ngay_nhap_canh",
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
                }

            ]
        },
        render: function() {
            var self = this;
            self.setIdTiepNhan = false;
            self.viewTiepNhan = false;
            self.checkId = false;
            self.seted_giayphep = false;
            self.setIdGiayPhep = false;
            self.checkCreateButton = false;
            self.setObjQuocGiaPhanPhoi = false;
            self.setObjQuocGiaSanXuat = false;
            self.setObjQuocGiaTiepnhan = false;
            self.firstViewCuaKhau= false;
            self.isSetObjCuaKhau= false;
            self.isSetIdCuaKhau= false;
            self.oldSoCo = null;
            self.listAddNew = [];
            self.listChange = [];
            self.addNew = false;
            self.changeChiTiet = false;
            self.changeInfo = false;
            self.clickSave = false;
            self.setObjTiepNhan = false;
            self.isSetIdDonViCap = false;
            self.isSetDonViCap = false;
            self.isViewDonViCap = false;
            self.listChiTiet =[];
            self.ma_kho = null;
            self.tao_phieu_nhap = null;
            self.$el.find('.btn-add-vattu').unbind("click").bind("click", function(e) {
                e.stopPropagation();
                self.DialogChitietVattu();
            });

            self.$el.find(`.btn-download`).unbind("click").bind("click", (event)=>{
                event.stopPropagation();
                let url = self.getApp().serviceURL + `/static/template_import_excel/Template_ImportCO.xlsx`;
                window.open(url, '_blank');
            })
            var viewData = self.viewData;
            if (!!viewData){
                var id = viewData.id;
                self.id_sanpham = viewData.id_sanpham;
                // console.log(self.id_sanpham);
            }
            self.register_loai_co();

            if (id) {
                this.model.set('id', id);
                this.model.fetch({
                    success: function(data) {
                        self.applyBindings();
                        self.selectizeSoGiayPhep();
                        self.selectizeDonVi();
                        self.selectizeCuaKhau();
                        self.selectizeQuocGiaDonViSanXuat();
                        self.selectizeQuocGiaDonViTiepNhan();
                        self.selectizeQuocGiaDonViPhanPhoi();
                        self.initButton();
                        self.selectDonViCapCO();
                        self.checkId = true;
                        self.$el.find("#loai_co").attr("style", "pointer-events:none");
                        self.oldSoCo = self.model.get("so_co");
                        self.getDanhSachDuocLieu(id);
                    },
                    error: function() {
                        self.getApp().notify(self.getApp().translate("TRANSLATE:error_load_data"));
                    },
                    complete: function() {
                        var fileView = new ManageFileVIew({ viewData: { "listFile": self.model.get('chungtu_dinhkem'), "$el_btn_upload": self.$el.find(".btn-add-file") }, el: self.$el.find(".list-attachment") });
                        fileView.render();
                        fileView.on("change", (event) => {
                            var listfile = event.data;
                            self.model.set('chungtu_dinhkem', listfile);
                        });
                        self.importExcel(self, '/api/v1/import_excel_chungnhan_co');


                        self.$el.find(`.btn-import`).unbind("click").bind("click", (event)=>{
                            event.stopPropagation();
                            self.$el.find("#upload_files_import").unbind("click").click();
                        })
                    }
                });
            } else {
                self.applyBindings();
                self.selectizeSoGiayPhep();
                self.selectizeCuaKhau();
                self.selectizeQuocGiaDonViSanXuat();
                self.selectizeQuocGiaDonViTiepNhan();
                self.selectizeQuocGiaDonViPhanPhoi();
                self.initButton();
                self.selectDonViCapCO();
                self.importExcel(self, '/api/v1/import_excel_chungnhan_co');
                var currentUser = self.getApp().currentUser;
                if (!!currentUser.hoten) {
                    self.model.set('ten_nguoiky_xacnhan', currentUser.hoten);
                }
                if (!!currentUser.donvi && !!currentUser.donvi.diachi) {
                    self.model.set('diachi_donvi_tiepnhan', currentUser.donvi.diachi);
                }
                if (!!currentUser && !!currentUser.donvi_id){
                    self.model.set("id_donvi_tiepnhan", currentUser.donvi_id);
                    self.model.set("donvi_tiepnhan", currentUser.donvi);
                }
                self.selectizeDonVi();
                self.$el.find(".btn-xacnhan,.btn-huy-duyet,.btn-duyet").remove();
                self.$el.find(".btn-delete").addClass("d-none");
                self.$el.find(".btn-save").removeClass("d-none");
                self.$el.find('.table-vattu').hide();
                var fileView = new ManageFileVIew({ viewData: { "listFile": self.model.get('chungtu_dinhkem'), "$el_btn_upload": self.$el.find(".btn-add-file") }, el: self.$el.find(".list-attachment") });
                fileView.render();
                fileView.on("change", (event) => {
                    var listfile = event.data;
                    self.model.set('chungtu_dinhkem', listfile);
                });

                self.$el.find(`.btn-import`).unbind("click").bind("click", (event)=>{
                    event.stopPropagation();
                    let id = self.model.get("id");
                    if (!id){
                        self.savePhieu(2);
                    }
                    else{
                        self.$el.find("#upload_files_import").unbind("click").click();
                    }
                })
            }
        },
        validateData: function() {
            var self = this;
            if (!self.model.get('so_co')) {
                self.getApp().notify({ message: "Chưa nhập số CO" }, { type: "danger", delay: 1000 });
                return false;
            }
            if (!self.model.get('thoigian_cap_co')) {
                self.getApp().notify({ message: "Chưa nhập thời gian cấp CO" }, { type: "danger", delay: 1000 });
                return false;
            }
            if (!self.model.get("loai_co")){
                self.getApp().notify({message : "Vui lòng chọn loại giấy chứng nhận CO"}, {type : "danger", delay : 1000});
                return false;
            }
            else{
                var loai_co = self.model.get("loai_co");
                if (loai_co == 1){
                    let cuakhau_id = self.model.get("cuakhau_id");
                    let cuakhau = self.model.get("cuakhau");
                    if (!cuakhau_id || !cuakhau){
                        self.getApp().notify({message:"Vui lòng nhập thông tin cửa khẩu"}, {type:'danger', delay : 1000});
                        return false;
                    }

                    let id_donvi_sanxuat = self.model.get("id_donvi_sanxuat");
                    let donvi_sanxuat = self.model.get("donvi_sanxuat");
                    if (!id_donvi_sanxuat || !donvi_sanxuat){
                        self.getApp().notify({message:"Vui lòng chọn đơn vị sản xuất trong danh mục đã có sẵn"}, {type:'danger', delay : 1000});
                        return false;
                    }
                }
            }
            return true;
        },
        savePhieu: function(mode = 0, dataView = null) {
            var self = this;
            var isValid = self.validateData();
            if (!isValid) {
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
                        var chitietVattu = new ChitietVattu({ viewData: { "data": dataView, "chungnhan_id": chungnhan_id, "loai_co" : self.model.get("loai_co"), "so_co" : self.model.get("so_co"), thoigian_cap_co : self.model.get("thoigian_cap_co"),                    giayphep_nhapkhau_id: self.model.get("giayphep_nhapkhau_id"), 
                        so_giay_phep: self.model.get("so_giay_phep") } });

                        chitietVattu.dialog({ size: "large" });
                        chitietVattu.on("saveVattu", function(event) {
                            self.$el.find('.table-vattu').removeClass("d-none");
                            self.$el.find('.search').removeClass("d-none");
                            var data_sanpham = event.data;
                            let addNew = event.addNew;
                            if (addNew){
                                self.addNew = true;
                                self.listAddNew.push(event.data.id);
                            }
                            let changeChiTiet = event.changeChiTiet;
                            if (changeChiTiet){
                                self.changeChiTiet = true;
                                self.listChange.push(event.data.id);
                            }
                            self.onSaveDataVatTu(data_sanpham);
                        });
                    }
                    else if (mode ==2){
                        self.$el.find("#upload_files_import").unbind("click").click();
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
                var chitietVattu = new ChitietVattu({ viewData: {
                    "data": dataView, "chungnhan_id": chungnhan_id,
                    "so_co": self.model.get("so_co"),
                    "loai_co" : self.model.get("loai_co"),
                    thoigian_cap_co : self.model.get("thoigian_cap_co"),
                    giayphep_nhapkhau_id: self.model.get("giayphep_nhapkhau_id"), 
                    so_giay_phep: self.model.get("so_giay_phep")
                }});

                chitietVattu.dialog({ size: "large" });
                chitietVattu.on("saveVattu", function(event) {
                    self.$el.find('.table-vattu').removeClass("d-none");
                    self.$el.find('.search').removeClass("d-none");
                    var data_sanpham = event.data;
                    let addNew = event.addNew;
                    if (addNew){
                        self.addNew = true;
                        self.listAddNew.push(event.data.id);
                    }
                    let changeChiTiet = event.changeChiTiet;
                    if (changeChiTiet){
                        self.changeChiTiet = true;
                        self.listChange.push(event.data.id);
                    }
                    self.onSaveDataVatTu(data_sanpham);
                });
            }
        },
        appendHtmlChitietVatTu: function(data) {
            var self = this;

            self.$el.find('.table-vattu').removeClass("d-none");
            self.$el.find('.search').removeClass("d-none");

            self.$el.find('.table-vattu tbody').append(`
                <tr id="${data.id}">
                    <td class="stt text-center">${1}</td>
                    <td class="ten_sanpham">${data.ten_sanpham? data.ten_sanpham: ""}</td>
                    <td class="ma_HS ma_hs">${data.ma_HS? data.ma_HS: ""}</td>
                    <td class="so_hoadon">${data.so_hoadon? data.so_hoadon:""}</td>
                    <td class="soluong text-right">${data.soluong? Number(data.soluong).toLocaleString("de-DE"): 0}</td>
                    <td class="donvitinh text-center">Kg</td>
                    <td class="text-center">
                        <a href="javascript:;" class="demo-delete-row btn btn-danger btn-xs btn-icon mr-1" title="Xóa"><i class="fa fa-times"></i></a>
                        <a  href="javascript:;"  class="demo-edit-row btn btn-success btn-xs btn-icon" title="Sửa"><i class="mdi mdi-pencil"></i></a>
                    </td>
                </tr>
            `)
            
            self.$el.find(`#${data.id} .demo-delete-row`).unbind("click").bind("click", { obj: data }, function(e) {
                e.stopPropagation();
                var data_sanpham = e.data.obj;

				let deleteItem = null;
			
                self.$el.find("#exampleModalCenter1").modal("show");
                self.$el.find(".btn-item-deleted-continue").unbind("click").bind("click", function () {
                    deleteItem = true;
                });
                
                self.$el.find("#exampleModalCenter1").on("hidden.bs.modal", function (e) {
                    if (!!deleteItem){
                        var url = (self.getApp().serviceURL || "") + '/api/v2/giaychungnhanco_chitiet/' + data_sanpham.id;
                        $.ajax({
                            url: url,
                            type: 'DELETE',
                            headers: {
                                'content-type': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            },
                            success: function(response) {
                                deleteItem = null;
                                if (!!response && response.error_code == "UPDATE_ERROR"){
                                    let listPhieuNhap = response.listPhieuNhap;
                                    if (Array.isArray(listPhieuNhap) === false){
                                        listPhieuNhap = [];
                                    }
                                    let warnningView = new WarningView({viewData: listPhieuNhap});
                                    warnningView.dialog({size:'large'});
                                    return;
                                    
                                }
                                if (Array.isArray(self.listChiTiet) === false){
                                    self.listChiTiet = [];
                                }
                                self.listChiTiet = self.listChiTiet.filter((value)=>{
                                    return value.id != data_sanpham.id;
                                })
                                if (self.listChiTiet.length == 0) {
                                    self.$el.find('.table-vattu').addClass("d-none");
                                    self.$el.find('.search').addClass("d-none");
                                }
                                self.$el.find(`.table-vattu #${data_sanpham.id}`).remove();
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
            self.$el.find(`#${data.id} .demo-edit-row`).unbind("click").bind("click", { obj: data }, function(e) {
                e.stopPropagation();
                var obj_data = e.data.obj;
                self.DialogChitietVattu(obj_data);
            });
        },
        onSaveDataVatTu: function(data_sanpham) {
            var self = this;
            if (Array.isArray(self.listChiTiet) === false){
                self.listChiTiet = [];
            }

            var exits = self.listChiTiet.some((value)=>{
                return value.id === data_sanpham.id;
            })

            if (exits == false) {
                self.listChiTiet.push(data_sanpham);
                self.$el.find('.table-vattu').removeClass("d-none");
                self.$el.find('.search').removeClass("d-none");
                self.appendHtmlChitietVatTu(data_sanpham);
                self.fillStt();
            } else {
                var elt = self.$el.find(".table-vattu #" + data_sanpham.id);
                elt.find('.ten_sanpham').text(data_sanpham.ten_sanpham);
                elt.find('.ma_hs').text(data_sanpham.ma_HS);
                elt.find('.so_hoadon').text(data_sanpham.so_hoadon);
                elt.find('.soluong').text((data_sanpham.soluong ? Number(data_sanpham.soluong).toLocaleString("de-DE") : 0));
                elt.find(".demo-edit-row").unbind("click").bind("click", { obj: data_sanpham }, function(e) {
                    e.stopPropagation();
                    var obj_data = e.data.obj;
                    self.DialogChitietVattu(obj_data);
                });

                elt.find(`.demo-delete-row`).unbind("click").bind("click", { obj: data_sanpham }, function(e) {
                    e.stopPropagation();
                    var data_sanpham = e.data.obj;
    
                    let deleteItem = null;
                
                    self.$el.find("#exampleModalCenter1").modal("show");
                    self.$el.find(".btn-item-deleted-continue").unbind("click").bind("click", function () {
                        deleteItem = true;
                    });
                    
                    self.$el.find("#exampleModalCenter1").on("hidden.bs.modal", function (e) {
                        if (!!deleteItem){
                            var url = (self.getApp().serviceURL || "") + '/api/v2/giaychungnhanco_chitiet/' + data_sanpham.id;
                            $.ajax({
                                url: url,
                                type: 'DELETE',
                                headers: {
                                    'content-type': 'application/json',
                                    'Access-Control-Allow-Origin': '*'
                                },
                                success: function(response) {
                                    deleteItem = null;
                                    if (!!response && response.error_code == "UPDATE_ERROR"){
                                        let listPhieuNhap = response.listPhieuNhap;
                                        if (Array.isArray(listPhieuNhap) === false){
                                            listPhieuNhap = [];
                                        }
                                        let warnningView = new WarningView({viewData: listPhieuNhap});
                                        warnningView.dialog({size:'large'});
                                        return;
                                        
                                    }
                                    if (Array.isArray(self.listChiTiet) === false){
                                        self.listChiTiet = [];
                                    }
                                    self.listChiTiet = self.listChiTiet.filter((value)=>{
                                        return value.id != data_sanpham.id;
                                    })
                                    if (self.listChiTiet.length == 0) {
                                        self.$el.find('.table-vattu').addClass("d-none");
                                        self.$el.find('.search').addClass("d-none");
                                    }
                                    self.$el.find(`.table-vattu #${data_sanpham.id}`).remove();
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

                let arr = self.listChiTiet.filter((value) =>{
                    return value.id != data_sanpham.id;
                })

                arr.push(data_sanpham);
                self.listChiTiet = arr;
            }
        },
        fillStt: function() {
            var self = this;
            var stt = self.$el.find(".stt");
            $.each(stt, (index, element) => {
                $(element).text(index + 1);
            });
        },
        selectizeCuaKhau: function() {
            var self = this;
            var $selectize = self.$el.find('#cuakhau').selectize({
                valueField: 'id',
                labelField: 'ten_cuakhau',
                searchField: ['ten_cuakhau', 'tenkhongdau'],
                preload: true,

                load: function(query, callback) {

                    var query_filter = {
                        "filters": {
                            "$or": [
                                { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                { "ten_cuakhau": { "$likeI": (query) } },
                            ]
                        }
                    };
                    let objs = self.model.get("cuakhau");
                    if (!!objs && self.isSetObjCuaKhau === false){
                        callback([objs]);
                        self.isSetObjCuaKhau = true;
                    }
                    var url = (self.getApp().serviceURL || "") + '/api/v1/cuakhau_filter?' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                            var id_cuakhau = self.model.get("cuakhau_id");
                            if (!!id_cuakhau && self.isSetIdCuaKhau === false) {
                                var $selectz = (self.$el.find('#cuakhau'))[0]
                                $selectz.selectize.setValue([id_cuakhau]);
                                self.isSetIdCuaKhau = true;
                            }
                        }
                    });

                },
                onChange: function(value, isOnInitialize) {
                    var $selectz = (self.$el.find('#cuakhau'))[0]
                    var obj = $selectz.selectize.options[value];

                    if (obj !== null && obj !== undefined) {
                        let id = self.getApp().getRouter().getParam("id");
                        if (!id || self.firstViewCuaKhau === true){
                            delete obj.$order;
                            self.model.set({
                                "cuakhau_id": obj.id,
                                "tencuakhau": obj.ten_cuakhau,
                                "cuakhau": obj
                            });
                        }
                        else {
                            if (!self.model.get("cuakhau")){
                                self.model.set({
                                    "cuakhau_id": obj.id,
                                    "tencuakhau": obj.ten_cuakhau,
                                    "cuakhau": obj
                                });
                            }
                            self.firstViewCuaKhau = true;
                        }
                    } else {
                        self.model.set({
                            "cuakhau_id": null,
                            "tencuakhau": null,
                            "cuakhau": null
                        });
                    }
                }
            });
        },
        selectizeSoGiayPhep: function() {
            var self = this;
            var $selectize = self.$el.find('#selectize-sogiayphep').selectize({
                valueField: 'id',
                labelField: 'so_giay_phep',
                searchField: ['so_giay_phep'],
                preload: true,
                load: function(query, callback) {

                    let giayphep_nhapkhau_id = self.model.get("giayphep_nhapkhau_id");
                    let so_giay_phep = self.model.get("so_giay_phep");

                    if (!!giayphep_nhapkhau_id && !!so_giay_phep && self.seted_giayphep === false){
                        let objs = {
                            id:  giayphep_nhapkhau_id,
                            so_giay_phep
                        }
                        callback([objs]);
						self.seted_giayphep = true;
                    }

                    var query_filter = {
                        "filters": {
                            "$and" : [
                                {
                                    "$or": [
                                    { "so_giay_phep": { "$likeI": gonrinApp().convert_khongdau(query) } }
                                    ]
                                }
                            ]
                            
                        }
                    };
                    var url = (self.getApp().serviceURL || "") + '/api/v1/giayphep_nhapkhau_filter?' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                            if (!!self.model.get('giayphep_nhapkhau_id') && self.setIdGiayPhep === false){
                                $selectize[0].selectize.setValue(self.model.get('giayphep_nhapkhau_id'));
                                self.setIdGiayPhep = true;
                            }
                        }
                    });

                },
                onChange: function(value, isOnInitialize) {
                    var $selectz = (self.$el.find('#selectize-sogiayphep'))[0]
                    var obj = $selectz.selectize.options[value];

                    let selectDL = (self.$el.find('#selectize-programmatic'))[0]
                    if (!!selectDL && !!selectDL.selectize){
                        selectDL.selectize.destroy();
                    }

                    if (obj !== null && obj !== undefined) {
                        if (self.model.get("giayphep_nhapkhau_id") !== value){
                            delete obj.$order;
                            self.model.set({
                                "so_giay_phep": obj.so_giay_phep,
                                "giayphep_nhapkhau_id": obj.id
                            });
                        }
                    } 
                    else {
                        self.model.set({
                            "so_giay_phep": null,
                            "giayphep_nhapkhau_id": null
                        });
                    }
                }
            });
        },
        selectizeDonViSanXuat: function() {
            var self = this;
            var $selectize = self.$el.find('#donvi_sanxuat').selectize({
                valueField: 'id',
                labelField: 'ten_donvi',
                searchField: ['ten_donvi', 'tenkhongdau', 'ma_donvi'],
                preload: true,

                load: function(query, callback) {
                    var query_filter = "";
                    var loai_co = self.model.get("loai_co");
                    if (loai_co == 1){
                        query_filter = {
                            "filters": {
                                "$and" : [
                                    {
                                        "$or": [
                                            { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                            { "ten_donvi": { "$likeI": (query) } },
                                            { "ma_donvi": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                        ]
                                    },
                                    {"loai_donvi" : {"$eq" : 1}}
                                ]
                            }
                        };
                    }
                    else if (loai_co == 2){
                        query_filter = {
                            "filters": {
                                "$and" : [
                                    {
                                        "$or": [
                                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                        { "ten_donvi": { "$likeI": (query) } },
                                        { "ma_donvi": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                    ]},
                                    {"loai_donvi" : {"$eq" : 2}}
                                ]
                            }
                        };
                    }
                    var url = (self.getApp().serviceURL || "") + '/api/v1/donvisanxuat_nhapkhau?' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                            // var id_donvi_sanxuat = self.model.get("id_donvi_sanxuat");
                            // if (!!id_donvi_sanxuat) {
                            //     var $selectz = (self.$el.find('#donvi_sanxuat'))[0]
                            //     $selectz.selectize.setValue([id_donvi_sanxuat]);
                            // }
                        }
                    });

                },
                onChange: function(value, isOnInitialize) {
                    var $selectz = (self.$el.find('#donvi_sanxuat'))[0]
                    var obj = $selectz.selectize.options[value];

                    if (obj !== null && obj !== undefined) {
                        delete obj.$order;
                        self.model.set({
                            "id_donvi_sanxuat": obj.id,
                            "ten_donvi_sanxuat": obj.ten_donvi,
                            "donvi_sanxuat": obj,
                            "diachi_donvi_sanxuat": obj.diachi,
                            "quocgia_donvi_sanxuat": obj.quocgia,
                            "quocgia_donvi_sanxuat_id": obj.quocgia_id
                        });
                        if (!!obj.quocgia_id){
                            self.$el.find('#quocgia_donvi_sanxuat')[0].selectize.setValue(obj.quocgia_id);
                        }
                    } else {
                        self.model.set({
                            "id_donvi_sanxuat": null,
                            "ten_donvi_sanxuat": null,
                            "donvi_sanxuat": null,
                            "diachi_donvi_sanxuat": null,
                            "quocgia_donvi_sanxuat": null,
                            "quocgia_donvi_sanxuat_id": null
                        });
                    }
                }
            });
        },
        selectizeDonViPhanPhoi: function() {
            var self = this;
            var loai_co = self.model.get("loai_co");
            if (loai_co ==2){
                var $selectize0 = self.$el.find('#donvi_phanphoi').selectize({
                    maxItems: 1,
                    valueField: 'id',
                    labelField: 'ten_coso',
                    searchField: ['ma_coso', 'tenkhongdau', 'ten_coso'],
                    preload: true,
                    load: function(query, callback) {
                        var query_filter = {
                            "filters": {
                                "$and": [{
                                        "$or": [
                                            { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                            { "ten_coso": { "$likeI": (query) } },
                                            { "ma_coso": { "$eq": query } }
                                        ],
                                        "order_by": [{ "field": "ten_coso", "direction": "asc" }]
                                    },
                                    {"$or": [
                                        { "loai_donvi": { "$eq": 2} },
                                        { "loai_donvi": { "$eq": 5} },
                                        { "loai_donvi": { "$eq": 6} },
                                        { "loai_donvi": { "$eq": 7} },
                                        { "loai_donvi": { "$eq": 8} },
                                        { "loai_donvi": { "$eq": 9} }
                                    ]},
                                ]
                            }
    
                        };
    
                        var url = (self.getApp().serviceURL || "") + '/api/v1/donvi_filter?page=1&results_per_page=300' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                        $.ajax({
                            url: url,
                            type: 'GET',
                            dataType: 'json',
                            error: function() {
                                callback();
                            },
                            success: function(res) {
                                callback(res.objects);
                            }
                        });
                    },
                    onChange: function(value) {
                        var $selectz = (self.$el.find('#donvi_phanphoi'))[0];
                        var obj = $selectz.selectize.options[value];
                        if (obj !== null && obj !== undefined) {
                            delete obj.$order;
                            self.model.set({
                                "id_donvi_phanphoi": obj.id,
                                "ten_donvi_phanphoi": obj.ten_coso,
                                "donvi_phanphoi": obj,
                                "diachi_donvi_phanphoi": obj.diachi,
                                "quocgia_donvi_phanphoi" : obj.quocgia,
                                "quocgia_donvi_sanxuat_id" : obj.quocgia_id
                            });

                            self.$el.find('#quocgia_donvi_phanphoi')[0].selectize.setValue(obj.quocgia_id);
                            
                        } else {
                            self.model.set({
                                "id_donvi_phanphoi": null,
                                "ten_donvi_phanphoi": null,
                                "donvi_phanphoi": null,
                                "diachi_donvi_phanphoi": null,
                                "quocgia_donvi_phanphoi" :null,
                                "quocgia_donvi_sanxuat_id" : null
                            });
                        }
                    }
                });
            }
            else{
                var $selectize0 = self.$el.find('#donvi_phanphoi').selectize({
                    maxItems: 1,
                    valueField: 'id',
                    labelField: 'ten_donvi',
                    searchField: ['ten_donvi', 'tenkhongdau', 'ma_donvi'],
                    preload: true,
                    load: function(query, callback) {
                        var query_filter = {
                            "filters": {
                                "$or": [
                                    { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                    { "ten_donvi": { "$likeI": (query) } },
                                ]
                            }
                        };
                        var url = (self.getApp().serviceURL || "") + '/api/v1/danhmuc_cungung_nuoc_ngoai?' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                        $.ajax({
                            url: url,
                            type: 'GET',
                            dataType: 'json',
                            error: function() {
                                callback();
                            },
                            success: function(res) {
                                callback(res.objects);
                            }
                        });
                    },
                    onChange: function(value) {
                        var $selectz = (self.$el.find('#donvi_phanphoi'))[0];
                        var obj = $selectz.selectize.options[value];
                        if (obj !== null && obj !== undefined) {
                            self.model.set({
                                "id_donvi_phanphoi": obj.id,
                                "ten_donvi_phanphoi": obj.ten_donvi,
                                "donvi_phanphoi": obj,
                                "diachi_donvi_phanphoi": obj.diachi,
                                "quocgia_donvi_phanphoi": obj.quocgia,
                                "quocgia_donvi_phanphoi_id": obj.quocgia_id
                            });

                            self.$el.find('#quocgia_donvi_phanphoi')[0].selectize.setValue(obj.quocgia_id);
                            
                        } else {
                            self.model.set({
                                "id_donvi_phanphoi": null,
                                "ten_donvi_phanphoi": null,
                                "donvi_phanphoi": null,
                                "diachi_donvi_phanphoi": null,
                                "quocgia_donvi_phanphoi": null,
                                "quocgia_donvi_phanphoi_id": null
                            });
                        }
                    }
                });
            }
        },
        selectizeQuocGiaDonViSanXuat: function() {
            var self = this;
            var $selectize0 = self.$el.find('#quocgia_donvi_sanxuat').selectize({
                maxItems: 1,
                valueField: 'id',
                labelField: 'ten',
                searchField: ['ten', 'ma'],
                preload: true,
                load: function(query, callback) {
                    var query_filter = {
                        "filters": {
                            "$or": [
                                { "ten": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                { "ma": { "$eq": query } }
                            ],
                        },
                        "order_by": [{ "field": "douutien", "direction": "desc" }, { "field": "ten", "direction": "asc" }]

                    };
                    let objs = self.model.get("quocgia_donvi_sanxuat");
                    if(!!objs && self.setObjQuocGiaSanXuat === false){
                        callback([objs]);
                        self.setObjQuocGiaSanXuat = true;
                    }

                    var url = (self.getApp().serviceURL || "") + '/api/v1/quocgia_filter?page=1&results_per_page=20' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                            var vietnam = res.objects.find((value, index) => {
                                return value.ma == 'VN';
                            })
                            if (!!self.model.get("quocgia_donvi_sanxuat_id")) {
                                $selectize0[0].selectize.setValue(self.model.get('quocgia_donvi_sanxuat_id'));
                            } else {
                                if (!!vietnam) {
                                    $selectize0[0].selectize.setValue(vietnam.id);
                                }
                            }
                        }
                    });
                },
                onChange: function(value) {
                    var obj = $selectize0[0].selectize.options[value];

                    if (obj != null && obj != undefined) {
                        delete obj.$order;
                        self.model.set({
                            'quocgia_donvi_sanxuat_id': value,
                            'quocgia_donvi_sanxuat': obj
                        })
                    } else {
                        self.model.set({
                            'quocgia_donvi_sanxuat_id': null,
                            'quocgia_donvi_sanxuat': null
                        })
                    }
                }
            });
        },
        selectizeQuocGiaDonViTiepNhan: function() {
            var self = this;
            var $selectize0 = self.$el.find('#quocgia_donvi_tiepnhan').selectize({
                maxItems: 1,
                valueField: 'id',
                labelField: 'ten',
                searchField: ['ten', 'ma'],
                preload: true,
                load: function(query, callback) {
                    var query_filter = {
                        "filters": {
                            "$or": [
                                { "ten": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                { "ma": { "$eq": query } }
                            ],
                        },
                        "order_by": [{ "field": "douutien", "direction": "desc" }, { "field": "ten", "direction": "asc" }]

                    };
                    let objs = self.model.get("quocgia_donvi_tiepnhan");
                    if(!!objs && self.setObjQuocGiaTiepnhan === false){
                        callback([objs]);
                        self.setObjQuocGiaTiepnhan = true;
                    }
                    var url = (self.getApp().serviceURL || "") + '/api/v1/quocgia_filter?page=1&results_per_page=20' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                            var vietnam = res.objects.find((value, index) => {
                                return value.ma == 'VN';
                            })
                            if (!!self.model.get("quocgia_donvi_tiepnhan_id")) {
                                $selectize0[0].selectize.setValue(self.model.get('quocgia_donvi_tiepnhan_id'));
                            } else {
                                if (!!vietnam) {
                                    $selectize0[0].selectize.setValue(vietnam.id);
                                }
                            }
                        }
                    });
                },
                onChange: function(value) {
                    var obj = $selectize0[0].selectize.options[value];
                    if (obj != null && obj != undefined) {
                        delete obj.$order;
                        self.model.set({
                            'quocgia_donvi_tiepnhan_id': value,
                            'quocgia_donvi_tiepnhan': obj
                        })
                    } else {
                        self.model.set({
                            'quocgia_donvi_tiepnhan_id': null,
                            'quocgia_donvi_tiepnhan': null
                        })
                    }
                }
            });
        },
        selectizeQuocGiaDonViPhanPhoi: function() {
            var self = this;
            var $selectize0 = self.$el.find('#quocgia_donvi_phanphoi').selectize({
                maxItems: 1,
                valueField: 'id',
                labelField: 'ten',
                searchField: ['ten', 'ma'],
                preload: true,
                load: function(query, callback) {
                    var query_filter = {
                        "filters": {
                            "$or": [
                                { "ten": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                { "ma": { "$eq": query } }
                            ],
                        },
                        "order_by": [{ "field": "douutien", "direction": "desc" }, { "field": "ten", "direction": "asc" }]

                    };
                    let objs = self.model.get("quocgia_donvi_phanphoi");
                    if(!!objs && self.setObjQuocGiaPhanPhoi === false){
                        callback([objs]);
                        self.setObjQuocGiaPhanPhoi = true;
                    }
                    var url = (self.getApp().serviceURL || "") + '/api/v1/quocgia_filter?page=1&results_per_page=20' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                            var vietnam = res.objects.find((value, index) => {
                                return value.ma == 'VN';
                            })
                            if (!!self.model.get("quocgia_donvi_phanphoi")) {
                                $selectize0[0].selectize.setValue(self.model.get('quocgia_donvi_phanphoi_id'));
                            } else {
                                if (!!vietnam) {
                                    $selectize0[0].selectize.setValue(vietnam.id);
                                }
                            }
                        }
                    });
                },
                onChange: function(value) {
                    var obj = $selectize0[0].selectize.options[value];
                    if (obj != null && obj != undefined) {
                        delete obj.$order;
                        self.model.set({
                            'quocgia_donvi_phanphoi_id': value,
                            'quocgia_donvi_phanphoi': obj
                        })
                    } else {
                        self.model.set({
                            'quocgia_donvi_phanphoi_id': null,
                            'quocgia_donvi_phanphoi': null
                        })
                    }
                }
            });
        },
        selectizeDonVi: function(id) {
            var self = this;
            var $selectize0 = self.$el.find('#ten_donvi_tiepnhan').selectize({
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
                                    { "loai_donvi": { "$eq": 4 } },
                                    { "loai_donvi": { "$eq": 5 } },
                                    { "loai_donvi": { "$eq": 6} },
                                    { "loai_donvi": { "$eq": 7 } },
                                    { "loai_donvi": { "$eq": 8} },
                                    { "loai_donvi": { "$eq": 9 } },
                                ]}
                            ]
                        }

                    };
                    let objs = self.model.get("donvi_tiepnhan");
                    if (!!objs && self.setObjTiepNhan === false){
                        callback([objs]);
                        self.setObjTiepNhan = true;
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
                            var id_donvi_tiepnhan = self.model.get("id_donvi_tiepnhan");
                            if (!!id_donvi_tiepnhan && self.setIdTiepNhan === false) {
                                var $selectz = self.$el.find('#ten_donvi_tiepnhan')[0]
                                $selectz.selectize.setValue([id_donvi_tiepnhan]);
                                $selectz.selectize.disable();
                                self.setIdTiepNhan = true;
                            }
                        }
                    });
                },
                onChange: function(value) {
                    var obj = $selectize0[0].selectize.options[value];
                    let id = self.model.get("id");
                    if (obj !== null && obj !== undefined) {
                        delete obj.$order;
                        if (!id || self.viewTiepNhan === true){
                            self.model.set({
                                "ten_donvi_tiepnhan": obj.ten_coso,
                                "donvi_tiepnhan": obj,
                                "diachi_donvi_tiepnhan": obj.diachi,
                                "id_donvi_tiepnhan": obj.id
                            })
                        }
                        else{
                            self.viewTiepNhan = true;
                        }
                    } else {
                        self.model.set({
                            "ten_donvi_tiepnhan": null,
                            "donvi_tiepnhan": null,
                            "diachi_donvi_tiepnhan": null,
                            "id_donvi_tiepnhan": null
                        })
                    }
                }
            });
        },
        register_loai_co : function(){
            var self = this;
            self.model.on("change:loai_co", function(){
                var loai_co = self.model.get("loai_co");
                if (loai_co !== undefined && loai_co !== null){
                    var $selectz = (self.$el.find('#donvi_phanphoi'))[0];
                    if (!!$selectz && !!$selectz.selectize){
                        $selectz.selectize.destroy();
                    }
                    self.selectizeDonViPhanPhoi();
                    var $selectz1 = (self.$el.find('#donvi_sanxuat'))[0];
                    if (!!$selectz1 && !!$selectz1.selectize){
                        $selectz1.selectize.destroy();
                    }
                    self.selectizeDonViSanXuat();
                    if (loai_co == 2){
                        if (!!self.$el.find("#selectize-sogiayphep")[0] && !! self.$el.find("#selectize-sogiayphep")[0].selectize){
                            self.$el.find("#selectize-sogiayphep")[0].selectize.disable();
                        }
                        if (!!self.$el.find("#cuakhau")[0] && !! self.$el.find("#cuakhau")[0].selectize){
                            self.$el.find("#cuakhau")[0].selectize.disable();
                        }
                    }
                    else if (loai_co == 1){
                        if (!!self.$el.find("#selectize-sogiayphep")[0] && !! self.$el.find("#selectize-sogiayphep")[0].selectize){
                            self.$el.find("#selectize-sogiayphep")[0].selectize.enable();
                        }
                        if (!!self.$el.find("#cuakhau")[0] && !! self.$el.find("#cuakhau")[0].selectize){
                            self.$el.find("#cuakhau")[0].selectize.enable();
                        }
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
				url: (self.getApp().serviceURL || "") + '/api/v1/change_status_chungnhan_co',
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
				url: (self.getApp().serviceURL || "") + '/api/v1/xacnhan_co',
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
				url: (self.getApp().serviceURL || "") + '/api/v1/duyet_co',
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
				url: (self.getApp().serviceURL || "") + '/api/v1/huy_co',
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
                self.$el.find(".btn-delete").remove();
                self.$el.find(".btn-xacnhan").remove();
                self.$el.find("button#itemRemove").unbind("click");
                self.$el.find("button#itemRemove").prop("disabled", true);
                self.$el.find("#selectize-sogiayphep").prop("disabled", true);
                self.$el.find('.btn-add-donvi_chungnhan_co').prop("disabled", true);
                self.$el.find("#cuakhau").attr("disabled", true);
                self.$el.find(".form-control").attr("disabled", true);
                self.$el.find("a.demo-edit-row").unbind("click");
                self.$el.find("a.demo-delete-row").unbind("click");
                self.$el.find("a.demo-delete-row").prop("disabled", true);
                self.$el.find("a.demo-edit-row").prop("disabled", true);
                self.$el.find(".form-control.selectize-control").attr("style", "pointer-events:none");
                self.$el.find(".btn-add-vattu").remove();
                self.$el.find(".btn-add-file").remove();
                self.$el.find(".btn-download").remove();
                self.$el.find(".btn-import").remove();
                self.$el.find('.search').remove();
                self.$el.find(".demo-delete-row").remove();
                self.$el.find(".demo-edit-row").remove();
                self.$el.find(".table-vattu thead tr th").last().addClass("d-none");
                let xml_tr = self.$el.find(".table-vattu tbody tr");
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
				url: (self.getApp().serviceURL || "") + '/api/v1/mo_co',
				dataType: "json",
				contentType: "application/json",
				method: 'POST',
				data: JSON.stringify(params),
				success: function(response) {
					self.getApp().hideloading();
					self.getApp().notify({message : "Cho phép doanh nghiệp chỉnh sửa giấy phép thành công"});
					let path = "giaychungnhanco_cuc/collection";
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
        saveCoNew: function(){
			var self = this;
			let params = {
                ...self.model.toJSON(),
                addNew: self.addNew,
                changeInfo: self.changeInfo,
                changeChiTiet: self.changeChiTiet,
                listAddNew: self.listAddNew,
                listChange: self.listChange,
                ma_kho: self.ma_kho
			}
			self.getApp().showloading();
			$.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/giaychungnhanco_save',
				dataType: "json",
				contentType: "application/json",
				method: 'POST',
				data: JSON.stringify(params),
				success: function(response) {
                    self.getApp().hideloading();
                    self.clickSave = false;
                    self.oldSoCo = self.model.get("so_co");
                    self.listAddNew = [];
                    self.listChange= [];
                    self.addNew = false;
                    self.changeChiTiet = false;
                    self.changeInfo = false;
                    self.tao_phieu_nhap = true;
                    if (!!response && !!response.warnchange){

                        let warningList = response.warningList;
                        let resultSave = new ResultSaveCO({viewData: warningList});
                        resultSave.dialog({size:'large'});
                        // self.$el.find("#exampleModalCenter2").modal("show");
                    }
                    else{
                        self.getApp().notify("Lưu thông tin thành công");
                        self.trigger('saveCO', self.model.toJSON());
                        self.close();
                    }
				},
				error:function(xhr,status,error){
					self.getApp().hideloading();
					try {
						if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED"){
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
        importExcel: function (model, url) {
			var self = this;
            model.$el.append(`<input type="file" class="form-control d-none" id="upload_files_import" lang="vi" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .csv, application/vnd.ms-excel">`);
            model.$el.find("#upload_files_import").on("change", function(e) {
                var result = model.$el.find("#upload_files_import")[0].files[0];
                model.getApp().showloading();
                if (!!result) {
                    var http = new XMLHttpRequest();
                    var fd = new FormData();
                    fd.append('file', result, result.name);
                    http.open('POST', gonrinApp().serviceURL + url);
                    var token = !!gonrinApp().currentUser ? gonrinApp().currentUser.token : null;
                    http.setRequestHeader("X-USER-TOKEN", token);
                    http.setRequestHeader("X-ID", self.model.get("id"))
                    http.setRequestHeader("type_file", 1);
                    http.upload.addEventListener('progress', function(evt) {
                        if (evt.lengthComputable) {
                            var percent = evt.loaded / evt.total;
                            percent = parseInt(percent * 100);

                        }
                    }, false);
                    http.addEventListener('error', function(error) {
                        model.getApp().hideloading();
                        model.getApp().notify({ message: "Lỗi: Không thể tải được file lên hệ thống" }, { type: "danger", delay: 1000 });
                        return;
                    }, false);
                    http.onreadystatechange = function() {
                        model.getApp().hideloading();
                        if (http.readyState === 4) {
                            if (http.status === 200) {
                                self.getApp().notify({ message: "Import dữ liệu thành công" });
                                let res = JSON.parse(http.responseText);
                                let listSuccess = res.listSuccess;
                                if (Array.isArray(listSuccess) === false){
                                    listSuccess = [];
                                }
    
                                let length = listSuccess.length;
                                if (length >0){
                                    self.addNew = true;
                                }
    
                                for (let i = 0; i<listSuccess.length; i++){
                                    self.onSaveDataVatTu(listSuccess[i]);
                                    self.listAddNew.push(listSuccess[i].id);
                                }
    
                                var resultView = new ResultImportExcel({ viewData: { "listFailed": res.listFailed, "countCreate": res.countCreate, "countUpdate": res.countUpdate } });
                                resultView.dialog({ "size": "large" });
    
                            } else {
                                model.getApp().notify({ message: "Lỗi: Không thể tải được file lên hệ thống" }, { type: "danger", delay: 1000 });
                                return;
                            }
                        }

                    };
                    http.send(fd);
                } else {
                    model.getApp().hideloading();
                    model.getApp().notify({ message: "Lỗi: Vui lòng chọn đúng định dạng tệp" }, { type: "danger", delay: 1000 });
                    return;
                }
            });
		},
        importExcelOld: function () {
			var self = this;
            var attachImage = new AttachFileVIew();
            attachImage.render();
            attachImage.on("success", (event) => {
                var file = event.data;
                var file_type = file.type;
                if (!!file && !!file_type && (file_type.toLowerCase().includes("xlsx"))) {
                    var file_link = file.link;
                    var url = (self.getApp().serviceURL || "") + '/api/v1/import_excel_chungnhan_co';
                    $.ajax({
                        url: url,
                        type: 'POST',
                        dataType: 'json',
                        data: JSON.stringify({
                            "link": file_link,
                            "donvi_id" : gonrinApp().currentUser.donvi_id,
                            'id': self.model.get("id")
                        }),
                        error: function (error) {
                            self.getApp().notify({ message: "Có lỗi xảy ra" }, { type: "danger", delay: 1000 });
                        },
                        success: function (res) {
                            self.getApp().notify({ message: "Import dữ liệu thành công" });

                            let listSuccess = res.listSuccess;
                            if (Array.isArray(listSuccess) === false){
                                listSuccess = [];
                            }

                            let length = listSuccess.length;
                            if (length >0){
                                self.addNew = true;
                            }

                            for (let i = 0; i<listSuccess.length; i++){
                                self.onSaveDataVatTu(listSuccess[i]);
                                self.listAddNew.push(listSuccess[i].id);
                            }

                            var resultView = new ResultImportExcel({ viewData: { "listFailed": res.listFailed, "countCreate": res.countCreate, "countUpdate": res.countUpdate } });
                            resultView.dialog({ "size": "large" });

                        }
                    });
                } else {
                    self.getApp().notify({ message: "Vui lòng chọn file đúng định dạng .xlsx" }, { type: "danger", delay: 1000 });
                }
            });

		},
        selectDonViCapCO: function(){
            var self = this;
            var $selectize = self.$el.find('#donvi_chungnhan_co').selectize({
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

                    let donvi_chungnhan_co = self.model.get("donvi_chungnhan_co");
                    let donvi_chungnhan_co_id = self.model.get("donvi_chungnhan_co_id");
                    if (!!donvi_chungnhan_co && !!donvi_chungnhan_co_id && self.isSetDonViCap == false){
                        let objs = {
                            id: donvi_chungnhan_co_id,
                            ten: donvi_chungnhan_co
                        }
                        callback([objs]);
                        self.isSetDonViCap = false;
                    }

                    var url = (self.getApp().serviceURL || "") + '/api/v1/donvicapco_filter?results_per_page=20' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                            if (!!donvi_chungnhan_co_id && self.isSetIdDonViCap == false){
                                self.$el.find('#donvi_chungnhan_co')[0].selectize.setValue(donvi_chungnhan_co_id);
                                self.isSetIdDonViCap = true;
                            }
                        }   
                    });

                },
                onChange: function(value, isOnInitialize) {
                    var $selectz = (self.$el.find('#donvi_chungnhan_co'))[0]
                    var obj = $selectz.selectize.options[value];
                    if (obj !== null && obj !== undefined) {
                        let id = self.model.get("id");
                        if (!id || self.isViewDonViCap == true){
                            self.model.set({
                                donvi_chungnhan_co: obj.ten,
                                donvi_chungnhan_co_id: obj.id
                            })
                        }
                        else{
                            if (!self.model.get("donvi_chungnhan_co_id")){
                                self.model.set({
                                    donvi_chungnhan_co: obj.ten,
                                    donvi_chungnhan_co_id: obj.id
                                })
                            }
                            self.isViewDonViCap = true;
                        }
                    } 
                    else {
                        self.model.set({
                            donvi_chungnhan_co: null,
                            donvi_chungnhan_co_id: null
                        })
                    }
                }
            });
        },
        initButton: function(){
            var self = this;
            self.$el.find(`.btn-add-donvi_chungnhan_co`).unbind("click").bind("click", (event)=>{
                event.stopPropagation();
                let donviChungNhanCO = new DonViChungNhanCO();
                donviChungNhanCO.dialog({size:'medium'});
                donviChungNhanCO.on("saveData", (event)=>{
                    let data = event.data;
                    if (!!data){
                        let ten = data.ten;
                        let id = data.id;
                        self.model.set({
                            donvi_chungnhan_co: ten,
                            donvi_chungnhan_co_id: id
                        })
                    }
                    let selectDVC = (self.$el.find(`#donvi_chungnhan_co`))[0];
                    if (!!selectDVC && !!selectDVC.selectize){
                        selectDVC.selectize.destroy();
                        self.isSetDonViCap = false;
                        self.isSetIdDonViCap = false;
                        self.selectDonViCapCO();
                    }
                })
            })
            self.$el.find(`.search`).on("keyup", self.delay((event) =>{
                let keySearch = $(event.target).val();
                self.searchDuocLieu(keySearch);
            }, 700))
        },
        getDanhSachDuocLieu: function(chungnhan_id){
            var self = this;
            let query_filter ={
                filters: {
                    "$and": [
                        {chungnhan_id: {"$eq": chungnhan_id}},
                        {deleted: {"$eq": false}}
                    ]
                }
            }
            let url = (self.getApp().serviceURL || "") + '/api/v1/giaychungnhanco_chitiet_grid?results_per_page=1000' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
            $.ajax({
                url: url,
                type:'GET',
                dataType: 'json',
                success: function(response){
                    self.listChiTiet = response?.objects;
                    if (Array.isArray(self.listChiTiet) === false){
                        self.listChiTiet = [];
                    }

                    let length = self.listChiTiet.length;
                    if (length >0){
                        self.$el.find('.table-vattu').removeClass("d-none");
                        self.$el.find('.search').removeClass("d-none");
                    }
                    else{
                        self.$el.find('.table-vattu').addClass("d-none");
                        self.$el.find('.search').addClass("d-none");
                    }
                    for (let i=0; i< length; i++){
                        self.appendHtmlChitietVatTu(self.listChiTiet[i]);
                        self.fillStt();
                    }
                    self.checkTrangThai();

                },
				error:function(xhr,status,error){
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
						self.getApp().notify({ message: "Có lỗi xảy ra vui lòng thử lại sau"}, { type: "danger", delay: 1000 });
					}
				},
            }
            )
        },
        searchDuocLieu: function(search = ""){
            var self = this;
            if (Array.isArray(self.listChiTiet) === false){
                self.listChiTiet = [];
            }

            let arr = self.listChiTiet.filter((value, index) =>{
                return (
                    value.ma_sanpham.includes(search) || 
                    value.ten_sanpham.includes(search)
                )
            })

            self.$el.find(`.table-vattu tbody`).html("");
            let length = arr.length;
            for (let i=0; i<length;i++){
                self.appendHtmlChitietVatTu(arr[i]);
                self.fillStt();
            }
        },
        delay: function (callback, ms) {
            var timer = 0;
            return function () {
                var context = this,
                    args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function () {
                    callback.apply(context, args);
                }, ms || 0);
            };
        }
    });

});