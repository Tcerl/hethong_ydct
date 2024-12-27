define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/giayphepnhapkhau/tpl/model_dialog.html'),
        schema = require('json!schema/GiayPhepNhapKhauSchema.json');
    var ChitietVattu = require('app/giayphepnhapkhau/ChitietPhieuDialog/ChitietVatTu');


    return Gonrin.ModelDialogView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "giayphep_nhapkhau",
        checkId: false,
        checkCreateButton: false,
        listChiTiet: [],
        tools: [{
            name: "defaultgr",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [{
                    name: "back",
                    type: "button",
                    buttonClass: "btn-secondary waves-effect width-sm",
                    label: `<i class="fas fa-arrow-circle-left"></i> Đóng`,
                    command: function() {
                        var self = this;
                        // Backbone.history.history.back();
                        self.close();
                    }
                },
                {
                    name: "save",
                    type: "button",
                    buttonClass: "btn-success width-sm ml-2 btn-save d-none",
                    label: "TRANSLATE:SAVE",
                    command: function() {
                        var self = this;
                        var so_giay_phep = self.model.get("so_giay_phep");
                        if (so_giay_phep === undefined || so_giay_phep === null || so_giay_phep.trim() === "") {
                            self.getApp().notify({ message: "Vui lòng nhập số giấy phép nhập khẩu" }, { type: "danger", delay: 1000 });
                            return false;
                        }
                        var thoigian_capphep = self.model.get("thoigian_capphep");
                        if (thoigian_capphep === undefined || thoigian_capphep === null ){
                            self.getApp().notify({message : "Vui lòng nhập thời gian cấp phép"}, {type : "danger", delay : 1000});
                            return false;
                        }
                        var thoigian_hieuluc_batdau = self.model.get("thoigian_hieuluc_batdau");
                        if (thoigian_hieuluc_batdau === undefined || thoigian_hieuluc_batdau === null){
                            self.getApp().notify({message : "Vui lòng nhập thời gian hiệu lực bắt đầu"}, {type : "danger", delay : 1000});
                            return false;
                        }
                        var thoigian_hieuluc_ketthuc = self.model.get("thoigian_hieuluc_ketthuc");
                        if (thoigian_hieuluc_ketthuc === undefined || thoigian_hieuluc_ketthuc === null){
                            self.getApp().notify({message : "Vui lòng nhập thời gian hiệu lực kết thúc"}, {type : "danger", delay : 1000});
                            return false;
                        }
                        let chitiet_giayphep = self.model.get("chitiet_giayphep");
                        if (chitiet_giayphep === null || chitiet_giayphep === undefined){
                            self.getApp().notify({message: "Vui lòng thêm thông tin dược liệu"}, {type : "danger", delay : 1000});
                            return false;
                        }
                        else{
                            if (Array.isArray(chitiet_giayphep) === true && chitiet_giayphep.length ==0){
                                self.getApp().notify({message: "Vui lòng thêm thông tin dược liệu"}, {type : "danger", delay : 1000});
                                return false;
                            }
                        }

                        let chungtu_dinhkem = self.model.get("chungtu_dinhkem");
                        if (!chungtu_dinhkem || (Array.isArray(chungtu_dinhkem) === true && chungtu_dinhkem.length ===0)){
                            self.getApp().notify({message: "Vui lòng tải lên bản Scan giấy chứng nhận để cơ quan quản lý đối soát"}, {type: "danger", delay : 1000});
                            return false;
                        }

                        self.model.save(null, {
                            success: function(model, respose, options) {
                                self.getApp().notify("Lưu thông tin thành công");
                                // self.getApp().getRouter().navigate(self.collectionName + "/collection");
                                if (self.checkId === false && self.checkCreateButton === false){
                                    self.model.set(respose);
                                    self.checkCreateButton = true;
                                    self.$el.find(".toolbar").append(`<button type="button" btn-name="xacnhan" class="btn btn-info width-sm btn-xacnhan ml-2">Gửi duyệt</button>`);
                                    self.$el.find(".btn-xacnhan").unbind("click").bind("click", ()=>{
                                        self.xacNhan();
                                    });
                                    self.$el.find(".btn-delete").removeClass("d-none");
                                }
                                else{
                                    self.model.set(respose);
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
                    }
                },
                {
                    name: "delete",
                    type: "button",
                    buttonClass: "btn-danger width-sm ml-2 btn-delete d-none",
                    label: "TRANSLATE:DELETE",
                    command: function() {
                        var self = this;
                        self.model.destroy({
                            success: function(model, response) {
                                self.getApp().notify('Xoá dữ liệu thành công');
                                self.getApp().getRouter().navigate(self.collectionName + "/collection");
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
                    }
                },
                {
                    name: "xacnhan",
                    type: "button",
                    buttonClass: "btn-primary waves-effect width-sm  ml-2 btn-xacnhan d-none",
                    label: "Gửi duyệt",
                    visible: function() {
                        return this.getApp().getRouter().getParam("id") !== null;
                    },
                    command: function() {
                        var self = this;
                        self.xacNhan();
                    }
                },
                {
                    name: "duyet",
                    type: "button",
                    buttonClass: "btn-primary waves-effect width-sm  ml-2 btn-duyet d-none",
                    label: "Duyệt",
                    visible: function() {
                        return this.getApp().getRouter().getParam("id") !== null;
                    },
                    command: function() {
                        var self = this;
                        self.duyet();
                    }
                },
                {
                    name: "huy-duyet",
                    type: "button",
                    buttonClass: "btn-primary btn-huy-duyet ml-1 d-none",
                    label: "Hủy duyệt",
                    visible: function(){
                        return (this.getApp().getRouter().getParam("id") !== null && (this.getApp().hasRole("admin_donvi") || this.getApp().hasRole("canbo")));
                    },
                    command: function(){
                        var self = this;
                        self.huyDuyet();
                    }
                },
                {
                    name: "mo-khoa",
                    type: "button",
                    buttonClass: "btn-success btn-mokhoa ml-1 d-none",
                    label: "Mở khóa",
                    visible: function(){
                        return (this.getApp().getRouter().getParam("id") !== null && (this.getApp().hasRole("admin_donvi") || this.getApp().hasRole("canbo")));
                    },
                    command: function(){
                        var self = this;
                        self.moKhoa();
                    }
                }
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
                    field: "thoigian_capphep",
                    uicontrol: "datetimepicker",
                    format: "DD/MM/YYYY",
                    textFormat: "DD/MM/YYYY",
                    extraFormats: ["DDMMYYYY"],
                    viewMode: "years",
                    language: 'vi',
                    parseInputDate: function(val) {
                        return gonrinApp().parseInputDateString(val);
                    },
                    parseOutputDate: function(date) {
                        return gonrinApp().parseOutputDateString(date);
                    },
                    disabledComponentButton: true
                },
                {
                    field: "thoigian_hieuluc_batdau",
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
                    field: "thoigian_hieuluc_ketthuc",
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
            self.checkId = false;
            self.checkCreateButton = false;
            var viewData = self.viewData;
            self.listChiTiet =[];
            if (!!viewData){
                var id = viewData.id;
                self.$el.find('.btn-add-vattu').unbind("click").bind("click", function(e) {
                    e.stopPropagation();
                    self.DialogChitietVattu();
                });
                if (id) {
                    this.model.set('id', id);
                    this.model.fetch({
                        success: function(data) {
                            self.applyBindings();
                            self.checkId = true;
                            self.getDanhSachDuocLieu(id);
                        },
                        error: function() {
                            self.getApp().notify(self.getApp().translate("TRANSLATE:error_load_data"));
                        },
                        complete: function() {
                            self.checkTrangThai();
                        }
                    });
                } else {
                    self.$el.find(".btn-xacnhan,.btn-huy-duyet,.btn-duyet").remove();
                    self.$el.find(".btn-delete").addClass("d-none");
                    self.$el.find(".btn-save").removeClass("d-none");
                    self.applyBindings();
                    self.register_event();
                }
            }
        },
        DialogChitietVattu: function(dataView = null) {
            var self = this;
            var id = self.model.get("id");
            if (!id || id == null || id == undefined || id == "") {
                self.savePhieu(1, dataView);
            } else {

                var chitietVattu = new ChitietVattu({ viewData: { "data": dataView, 'so_giay_phep': self.model.get('so_giay_phep'), 'thoigian_capphep': self.model.get('thoigian_capphep'), 'thoigian_hieuluc_batdau': self.model.get('thoigian_hieuluc_batdau'), 'thoigian_hieuluc_ketthuc': self.model.get('thoigian_hieuluc_ketthuc') } });

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

            self.$el.find('.table-vattu').removeClass("d-none");
            self.$el.find('.search').removeClass("d-none");
            var sl_conlai = 0;
            if (!!data.soluong_capphep){
                if (!!data.soluong_danhap){
                    sl_conlai = Number(data.soluong_capphep) - Number(data.soluong_danhap);
                }else{
                    sl_conlai = Number(data.soluong_capphep).toLocaleString("de-DE")
                }
                
            }
            self.$el.find('.table-vattu tbody').append(`
                <tr id="${data.id}">
                    <td class="stt text-center">${1}</td>
                    <td class="ten_sanpham">${data.ten_sanpham? data.ten_sanpham: ""}</td>
                    <td class="ten_khoahoc">${data.ten_khoahoc? data.ten_khoahoc: ""}</td>
                    <td class="bophan_sudung">${data.bophan_sudung? data.bophan_sudung:""}</td>
                    <td class="donvitinh text-center">${data.donvitinh? data.donvitinh: "Kg"}</td>
                    <td class="soluong_capphep text-right">${data.soluong_capphep? Number(data.soluong_capphep).toLocaleString("de-DE"): 0}</td>
                    <td class="soluong_danhap text-right">${data.soluong_danhap? Number(data.soluong_danhap).toLocaleString("de-DE"): 0}</td>
                    <td class="soluong_conlai text-right">${sl_conlai}</td>
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
                    if (deleteItem) {
                        var url = (self.getApp().serviceURL || "") + '/api/v1/giayphep_nhapkhau_chitiet/' + data_sanpham.id;
                        $.ajax({
                            url: url,
                            type: 'DELETE',
                            headers: {
                                'content-type': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            },
                            success: function(response) {
                                deleteItem = null;
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
                                deleteItem = null;
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
        savePhieu: function(mode = 0, objDataVattu) {
            var self = this;
            var so_giay_phep = self.model.get("so_giay_phep");

            if (so_giay_phep === undefined || so_giay_phep === null || so_giay_phep.trim() === "") {
                self.getApp().notify({ message: "Vui lòng nhập số giấy phép nhập khẩu" }, { type: "danger", delay: 1000 });
                return;
            }
            var thoigian_capphep = self.model.get("thoigian_capphep");
            if (thoigian_capphep === undefined || thoigian_capphep === null ){
                self.getApp().notify({message : "Vui lòng nhập thời gian cấp phép"}, {type : "danger", delay : 1000});
                return false;
            }
            var thoigian_hieuluc_batdau = self.model.get("thoigian_hieuluc_batdau");
            if (thoigian_hieuluc_batdau === undefined || thoigian_hieuluc_batdau === null){
                self.getApp().notify({message : "Vui lòng nhập thời gian hiệu lực bắt đầu"}, {type : "danger", delay : 1000});
                return false;
            }
            var thoigian_hieuluc_ketthuc = self.model.get("thoigian_hieuluc_ketthuc");
            if (thoigian_hieuluc_ketthuc === undefined || thoigian_hieuluc_ketthuc === null){
                self.getApp().notify({message : "Vui lòng nhập thời gian hiệu lực kết thúc"}, {type : "danger", delay : 1000});
                return false;
            }

            self.model.save(null, {
                success: function(model, respose, options) {
                    if (mode == 0) {
                        self.getApp().notify("Lưu thông tin thành công");

                        // self.getApp().getRouter().navigate(self.collectionName + "/collection");
                    } else if (mode == 1) {
                        self.model.set(model.attributes);
                        // self.renderItem(objDataVattu);
                        var chitietVattu = new ChitietVattu({ viewData: { 'giayphep': self.model.toJSON(), 'giayphep_id': self.model.get('id'), 'so_giay_phep': self.model.get('so_giay_phep'), 'thoigian_capphep': self.model.get('thoigian_capphep'), 'thoigian_hieuluc_batdau': self.model.get('thoigian_hieuluc_batdau'), 'thoigian_hieuluc_ketthuc': self.model.get('thoigian_hieuluc_ketthuc'), "check_ton": false } });
                        chitietVattu.dialog({ size: "large" });
                        chitietVattu.on("saveVattu", function(event) {
                            self.$el.find('.table-vattu').show();
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
                elt.find('.ten_khoahoc').text(data_sanpham.ten_khoahoc);
                elt.find('.bophan_sudung').text(data_sanpham.bophan_sudung);
                elt.find('.donvitinh').text((data_sanpham.donvitinh));
                elt.find('.soluong_capphep').text(Number(data_sanpham.soluong_capphep).toLocaleString("de-DE"));
                elt.find('.soluong_danhap').text(Number(data_sanpham.soluong_danhap).toLocaleString("de-DE"));

        
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
                        if (deleteItem) {
                            var url = (self.getApp().serviceURL || "") + '/api/v1/giayphep_nhapkhau_chitiet/' + data_sanpham.id;
                            $.ajax({
                                url: url,
                                type: 'DELETE',
                                headers: {
                                    'content-type': 'application/json',
                                    'Access-Control-Allow-Origin': '*'
                                },
                                success: function(response) {
                                    deleteItem = null;
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
                                    deleteItem = null;
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
        removeVattu: function(data_vattu) {
            var self = this;
            var listVattu = self.model.get("chitiet_giayphep");
            if (listVattu == null || listVattu == undefined) {
                listVattu = [];
                return;
            }
            if (listVattu instanceof Array) {
                var arrayvattu = [];
                for (var i = 0; i < listVattu.length; i++) {
                    if (data_vattu.id != listVattu[i].id) {
                        arrayvattu.push(listVattu[i]);
                    }
                }
                self.model.set("chitiet_giayphep", arrayvattu);
            }
        },
        fillStt: function() {
            var self = this;
            var stt = self.$el.find(".stt");
            $.each(stt, (index, element) => {
                $(element).text(index + 1);
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
				url: (self.getApp().serviceURL || "") + '/api/v1/change_status_giayphep_nhapkhau',
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
				url: (self.getApp().serviceURL || "") + '/api/v1/xacnhan_giayphep',
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
				url: (self.getApp().serviceURL || "") + '/api/v1/duyet_giayphep',
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
				url: (self.getApp().serviceURL || "") + '/api/v1/huy_giayphep',
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
                self.$el.find("a").prop("disabled", true);
                self.$el.find("#selectize-sogiayphep").prop("disabled", true);
                self.$el.find("#cuakhau").attr("disabled", true);
                self.$el.find(".form-control").attr("disabled", true);
                self.$el.find("a").unbind("click");
                self.$el.find(".form-control.selectize-control").attr("style", "pointer-events:none");
                self.$el.find(".btn-add-vattu").remove();
                self.$el.find("a.demo-delete-row").remove();
                self.$el.find("a.demo-edit-row").remove();
                self.$el.find(".table-vattu thead tr th").last().addClass("d-none");
                let xml_tr = self.$el.find(".table-vattu tbody tr");
                for (let i=0; i<xml_tr.length; i++){
                    $(xml_tr[i]).find("td:last").addClass("d-none");
                }
            }
            if (self.model.get("trangthai") == 3){
                self.$el.find("#nguoiduyet").parent().removeClass("d-none");
                var tmp = `Được duyệt bởi Cục Y Dược Cổ Truyền vào ngày ` + gonrinApp().parseInputDateString(self.model.get("thoigian_duyet")).format("DD/MM/YYYY hh:mm");
                self.$el.find("#nguoiduyet").text(tmp);
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
				url: (self.getApp().serviceURL || "") + '/api/v1/mo_giayphep',
				dataType: "json",
				contentType: "application/json",
				method: 'POST',
				data: JSON.stringify(params),
				success: function(response) {
					self.getApp().hideloading();
					self.getApp().notify({message : "Cho phép doanh nghiệp chỉnh sửa giấy phép thành công"});
					let path = "giaychungnhanco/collection";
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
        getDanhSachDuocLieu: function(giayphep_id){
            var self = this;
            let query_filter ={
                filters: {
                    "$and": [
                        {giayphep_id: {"$eq": giayphep_id}},
                        {deleted: {"$eq": false}}
                    ]
                }
            }
            let url = (self.getApp().serviceURL || "") + '/api/v1/giayphep_nhapkhau_chitiet_grid?results_per_page=1000' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
            $.ajax({
                url: url,
                type:'GET',
                dataType: 'json',
                success: function(response){
                    self.listChiTiet = response?.objects;
                    if (Array.isArray(self.listChiTiet) === false){
                        self.listChiTiet = [];
                    }
                    
                    self.initButton();

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
                    value.ten_sanpham.includes(search) ||
                    value.ten_khoahoc.includes(search) 
                )
            })

            self.$el.find(`.table-vattu tbody`).html("");
            let length = arr.length;
            for (let i=0; i<length;i++){
                self.appendHtmlChitietVatTu(arr[i]);
                self.fillStt();
            }
        },
        initButton: function(){
            var self = this;
            self.$el.find(`.search`).on("keyup", self.delay((event) =>{
                let keySearch = $(event.target).val();
                self.searchDuocLieu(keySearch);
            }, 700))
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