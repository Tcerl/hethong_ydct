define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/giaychungnhanco/ChitietPhieuDialog/tpl/model.html'),
        schema = require('json!schema/GiayChungNhanCOChitietSchema.json');
    var danhmuc_donvitinh = require("json!app/constant/donvitinh.json");
    var ChungNhanCQDialogView = require('app/giaychungnhancq/ModelDialogView');
    return Gonrin.ModelDialogView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v2/",
        collectionName: "giaychungnhanco_chitiet",
        check_setdata: false,
        hasViewData: false,
        clickSave: false,
        setObjDuoclieu: false,
        addNew: false,
        changeChiTiet: false,
        oldIdSanpham: null,
        oldSoluong: null,
        oldCq: null,
        seted_giayphep: null,
        setIdGiayPhep: null,
        uiControl: {
            fields: [{
                    field: "donvitinh",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    dataSource: danhmuc_donvitinh,
                    value: "Kg"
                },
                {
                    field: "tieuchi_xuatxu",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: "WO", text: "WO-Wholly Obtained" },
                        { value: "PEP", text: "PE-Produced Entirely" },
                        { value: "RVC", text: "RVC-Regional Value Content" },
                        { value: "CTC", text: "CTC-Change in Tariff" },
                        { value: "PSRs", text: "PSRs-Product Specific Rules" },
                        { value: "GR", text: "GR-General Rule" },
                        { value: "SP", text: "SP-Specific Process" },
                        { value: "PED", text: "PE-De Minimis" },
                        { value: "Cumulation", text: "Cumulation" },
                    ],
                },
            ]
        },
        render: function() {
            var self = this;
            self.clickSave = false;
            self.check_setdata = false;
            self.hasViewData = false;
            self.setObjDuoclieu = false;
            self.addNew = false;
            self.changeChiTiet = false;
            self.oldIdSanpham = null;
            self.oldSoluong = null;
            self.oldCq = null;
            self.seted_giayphep = false;
            self.setIdGiayPhep = false;
            self.eventClickButton();
            var viewData_data = self.viewData.data;

            if (!!viewData_data && viewData_data !== undefined && viewData_data !== null) {
                self.hasViewData = true;
                self.model.set(viewData_data);

                self.oldIdSanpham = self.model.get("id_sanpham");
                self.oldSoluong = self.model.get("soluong");
                self.oldCq = self.model.get("phieu_kiem_nghiem_id");

                var so_co = self.viewData.so_co;
                self.model.set("so_co", so_co);
                self.model.set({"loai_co" : self.viewData.loai_co});
                self.applyBindings();
            } else {
                var viewData_chungnhan_id = self.viewData.chungnhan_id;
                if (viewData_chungnhan_id == null || viewData_chungnhan_id == undefined) {
                    self.getApp().notify({ message: "Tham số không hợp lệ" }, { type: "danger", delay: 5000 });
                    self.close();
                    return;
                }
                self.model.set({
                    "chungnhan_id": viewData_chungnhan_id,
                    "so_co": self.viewData.so_co,
                    "tieuchi_xuatxu": "WO",
                    "giayphep_nhapkhau_id" : self.viewData.giayphep_nhapkhau_id,
                    "so_giay_phep": self.viewData.so_giay_phep,
                    "loai_co" : self.viewData.loai_co,
                    "thoigian_cap_co": self.viewData.thoigian_cap_co
                });
                if (!!self.viewData.id_sanpham){
                    self.model.set("id_sanpham", self.viewData.id_sanpham);
                    self.hasViewData = true;
                }
                self.addNew = true;
                self.applyBindings();
            }
            if (!self.model.get('donvitinh')) {
                self.model.set('donvitinh', 'Kg');
            }


            let loai_co = self.model.get("loai_co");
            self.initLoaiCo(loai_co);


            self.$el.find('.btn-add-cq').unbind('click').bind('click', function() {
                var data = {};
                if (self.model.get('id_sanpham')) {
                    data.id_sanpham = self.model.get('id_sanpham');
                    data.ten_sanpham = self.model.get("ten_sanpham");
                    data.sanpham = self.model.get("sanpham");
                }
                var chungNhanCQDialogView = new ChungNhanCQDialogView({ viewData: data });
                chungNhanCQDialogView.dialog({ size: "large" });
                chungNhanCQDialogView.on('saveDataCQDialog', function(e, data) {
                    if (!!self.$el.find('#selectize-cq')[0].selectize) {
                        self.$el.find('#selectize-cq')[0].selectize.destroy();
                    }
                    if (!!e && e.id_sanpham == self.model.get('id_sanpham')) {

                        self.model.set({
                            "ma_kiem_nghiem": e.ma_kiem_nghiem,
                            "phieu_kiem_nghiem_id": e.id,
                            "phieu_kiem_nghiem": e
                        })
                    }
                    self.selectizeCQ();
                })
            })

            return this;
        },
        eventClickButton: function() {
            var self = this;
            self.$el.find('.btn-close').unbind("click").bind("click", function(e) {
                e.stopPropagation();
                self.close();
            });
            self.$el.find('.btn-save').unbind("click").bind("click", function(e) {
                e.stopPropagation();
                if (self.clickSave === true){
                    return false;
                }

                if (self.model.get("loai_co") ===1){
                    var giayphep_nhapkhau_id = self.model.get("giayphep_nhapkhau_id");
                    if (!giayphep_nhapkhau_id){
                        self.getApp().notify({ message: "Vui lòng nhập số giấy phép nhập khẩu" }, { type: "danger", delay: 1000 });
                        return;
                    }
                }


                var sanpham = self.model.get("sanpham");
                if (!sanpham || sanpham == null || sanpham == undefined || sanpham == "") {
                    self.getApp().notify({ message: "Vui lòng chọn dược liệu" }, { type: "danger", delay: 1000 });
                    return;
                }
                if (!self.model.get('ma_HS')) {
                    self.getApp().notify({ message: "Chưa nhập mã hàng hóa" }, { type: "danger", delay: 1000 });
                    return;
                }
                if (!self.model.get('tieuchi_xuatxu')) {
                    self.getApp().notify({ message: "Chưa nhập tiêu chí xuất xứ" }, { type: "danger", delay: 1000 });
                    return;
                }
                if (self.model.get('soluong') == null || self.model.get('soluong') == undefined || self.model.get('soluong') == '') {
                    self.getApp().notify({ message: "Chưa nhập số lượng" }, { type: "danger", delay: 1000 });
                    return;
                }
                else{
                    if (Number(self.model.get("soluong")) <=0){
                        self.getApp().notify({message:"Vui lòng nhập số lượng lớn hơn 0"}, {type:"danger", delay: 1000});
                        return false;
                    }
                }

                if (self.model.get("loai_co") ===1){
                    if (!self.model.get("phieu_kiem_nghiem_id")){
                        self.getApp().notify({message:"Vui lòng nhập thông tin giấy chứng nhận chất lượng"}, {type:'danger', delay:1000});
                        return false;
                    }
                }

                if (!!self.model.get("tongsoluong")){
                    if (isNaN(Number(self.model.get("tongsoluong")))){
                        self.getApp().notify({message:"Vui lòng nhập tổng số lượng bao bì đúng định dạng số"}, {type:'danger', delay:1000});
                        return false;
                    }
                }
                else{
                    self.model.set("tongsoluong", 0);
                }

                if (!self.model.get('donvitinh')) {
                    self.getApp().notify({ message: "Chưa nhập đơn vị tính" }, { type: "danger", delay: 1000 });
                    return;
                }
                var currentUser = gonrinApp().currentUser;
                if (currentUser && currentUser.donvi_id !== null) {
                    self.model.set("donvi_id", currentUser.donvi_id);
                }
                self.clickSave = true;
                self.getApp().showloading();
                self.model.save(null, {
                    success: function(model, respose, options) {
                        self.model.set(model.attributes);
                        self.getApp().notify("Lưu thông tin thành công");
                        if ((self.oldCq !== self.model.get("phieu_kiem_nghiem_id") || self.oldIdSanpham !== self.model.get("id_sanpham") || self.oldSoluong !== self.model.get("soluong")) && !self.addNew){
                            self.changeChiTiet = true;
                        }
                        self.trigger("saveVattu", { "data": self.model.toJSON(), addNew: self.addNew, changeChiTiet: self.changeChiTiet });
                    },
                    error: function(xhr, status, error) {
                        try {
                            if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                self.getApp().getRouter().navigate("login");
                            } else {
                                self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 3000 });
                            }
                        } catch (err) {
                            self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 3000 });
                        }
                    },
                    complete: function() {
                        self.getApp().hideloading();
                        self.clickSave = false;
                        self.close();
                    }
                });

            });
        },
        selectizeCQ: function() {
            var self = this;
            var $selectize = self.$el.find('#selectize-cq').selectize({
                valueField: 'id',
                labelField: 'ma_kiem_nghiem',
                searchField: ['ma_kiem_nghiem'],
                preload: true,
                render: {
                    option: function(item, escape) {

                        return `<div class="option">${item.ma_kiem_nghiem}
                        <div>Tên dược liệu: ${item.ten_sanpham}</div>
                        <div>Số lô: ${item.so_lo}</div>
                        </div>`;
                    }
                },

                load: function(query, callback) {
                    var query_filter = "";
                    var id_sanpham = self.model.get("id_sanpham");
                    if (!!id_sanpham) {
                        query_filter = {
                            "filters": {
                                "$and": [{
                                        "$or": [
                                            { "ma_kiem_nghiem": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                            { "ten_sanpham": { "$likeI": (query) } }

                                        ]
                                    },
                                    { "id_sanpham": { "$eq": self.model.get('id_sanpham') } }
                                ]

                            }
                        };
                    } else {
                        query_filter = {
                            "filters": {
                                "$and": [{
                                    "$or": [
                                        { "ma_kiem_nghiem": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                        { "ten_sanpham": { "$likeI": (query) } }

                                    ]
                                }]

                            }
                        };
                    }
                    var url = (self.getApp().serviceURL || "") + '/api/v1/phieu_kiem_nghiem_filter?' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                            var phieu_kiem_nghiem_id = self.model.get("phieu_kiem_nghiem_id");
                            if (!!phieu_kiem_nghiem_id) {
                                self.$el.find('#selectize-cq')[0].selectize.setValue(phieu_kiem_nghiem_id);
                            }
                        }
                    });

                },
                onChange: function(value, isOnInitialize) {
                    var $selectz = (self.$el.find('#selectize-cq'))[0]
                    var obj = $selectz.selectize.options[value];


                    // <a href="/#baocaokho/model?id=`+item.baocao_id+`"><b class=" tablesaw-cell-label">`+item.donvi_ten+`</b></a><br> 
                    // <a href="/#giaychungnhanco/model?id=`+item.chungnhan_co_id+`"><b class=" tablesaw-cell-label">`+(item.so_co? item.so_co : "")+`</span><br> 

                    if (!!obj) {
                        self.$el.find('#info_cq').html(`
                        <small style ="display:block">Mã kiểm nghiệm: <span id ="cq_id" class="text-primary">${obj.ma_kiem_nghiem}</span> - Tên sản phẩm: ${obj.ten_sanpham}</small>
                        <small>Ngày kiểm nghiệm: ` + gonrinApp().parseInputDateString(obj.ngay_kiem_nghiem).format("DD/MM/YYYY") + ` - Đơn vị yêu cầu: ${obj.ten_donvi_yeucau? obj.ten_donvi_yeucau:""} </small>
                    `);
                        self.$el.find("#info_cq #cq_id").css("cursor", "pointer");
                        self.$el.find("#info_cq #cq_id").unbind("click").bind("click", function() {
                            self.close();
                            self.getApp().getRouter().navigate("phieu_kiem_nghiem/model?id=" + obj.id);
                        })
                        self.model.set({
                            "ma_kiem_nghiem": obj.ma_kiem_nghiem,
                            "phieu_kiem_nghiem_id": obj.id,
                            "phieu_kiem_nghiem": obj
                        })
                    } else {
                        self.$el.find('#info_cq').html('');
                        self.model.set({
                            "ma_kiem_nghiem": null,
                            "phieu_kiem_nghiem_id": null,
                            "phieu_kiem_nghiem": null
                        })
                    }
                }
            });
        },
        render_duoclieu_nhapkhau : function(giayphep_nhapkhau_id){
            var self = this;
            var $selectize = self.$el.find('#selectize-programmatic').selectize({
                valueField: 'id_sanpham',
                labelField: 'ten_sanpham',
                searchField: ['ten_sanpham', 'ten_khoa_hoc', 'ten_trung_quoc', 'tenkhongdau', 'ma_sanpham'],
                preload: true,
                render: {
                    option: function(item, escape) {
                        return `<div class="option">${item.ten_sanpham} - ${item.ten_khoa_hoc} - ${item.ma_sanpham}</div>`;
                    }
                },
                load: function(query, callback) {
                    var url = (self.getApp().serviceURL || "") + '/api/v1/getds_duoclieu_giayphep_nhapkhau';
                    $.ajax({
                        url: url,
                        type: 'POST',
                        data : JSON.stringify({"giayphep_nhapkhau_id" : giayphep_nhapkhau_id}),
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                            var id_sanpham = self.model.get("id_sanpham");
                            if (self.check_setdata == false && self.hasViewData == true && !!id_sanpham) {
                                self.check_setdata = true;
                                var $selectz = (self.$el.find('#selectize-programmatic'))[0]
                                $selectz.selectize.setValue([id_sanpham]);
                            }
                        }
                    });

                },
                onChange: function(value, isOnInitialize) {
                    var $selectz = (self.$el.find('#selectize-programmatic'))[0]
                    var obj = $selectz.selectize.options[value];
                    if (obj !== null && obj !== undefined) {
                        var id = self.model.get("id");
                        if (self.check_setdata == true || !id) {
                            // logic: nếu phiếu đó chưa có id - phiếu tạo mới thì set data vật tư
                            // k tính sự kiện onchange khi set data vật tư lần đầu
                            self.model.set({
                                "ten_sanpham": obj.ten_sanpham,
                                "ma_sanpham": obj.ma_sanpham,
                                "id_sanpham": obj.id_sanpham,
                                "sanpham": obj,
                                "loai_sanpham": obj.loai_sanpham
                            });
                        } else {
                            // sự kiện khi update phiếu, set data vật tư lần đầu
                            self.check_setdata = true;
                        }
                        self.$el.find('.info_duoclieu').html(`
                            <small><b>Chi tiết:</b> ${obj.ten_sanpham} - ${obj.ten_khoa_hoc}</small>
                        `);
                        if (!!self.$el.find('#selectize-cq')[0].selectize) {
                            self.$el.find('#selectize-cq')[0].selectize.destroy();
                        }
                        self.$el.find('#info_cq').html('');
                        self.selectizeCQ();
                    } else {
                        self.model.set({
                            "ten_sanpham": null,
                            "ma_sanpham": null,
                            "id_sanpham": null,
                            "sanpham": null,
                            "loai_sanpham": null
                        });
                        self.$el.find('.info_duoclieu').html(``);
                        self.$el.find('#info_cq').html('');
                        self.model.set({
                            "ma_kiem_nghiem": null,
                            "phieu_kiem_nghiem_id": null,
                            "phieu_kiem_nghiem": null
                        })
                    }
                    if (!!self.model.get('id_sanpham')) {
                        self.$el.find('.container-cq').removeClass('d-none');
                    } else {
                        self.$el.find('.container-cq').addClass('d-none');
                    }

                }
            });

        },
        selectizeDuoclieu : function(){
            var self = this;
            var $selectize = self.$el.find('#selectize-programmatic').selectize({
                valueField: 'id_sanpham',
                labelField: 'ten_sanpham',
                searchField: ['ten_sanpham', 'ten_khoa_hoc', 'ten_trung_quoc', 'tenkhongdau'],
                preload: true,
                render: {
                    option: function(item, escape) {
                        return `<div class="option">${item.ten_sanpham} - ${item.ten_khoa_hoc} - ${item.ma_viettat}</div>`;
                    }
                },
                load: function(query, callback) {
                    let objs = self.model.get("sanpham");
                    if (!!objs && self.setObjDuoclieu === false){
                        callback([objs]);
                        self.setObjDuoclieu = true;
                    }
                    var query_filter = {
                        "filters": {
                            "$or": [
                                { "ten_sanpham": { "$likeI": (query) } },
                                { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                { "ten_khoa_hoc": { "$likeI": (query) } },
                                { "ten_trung_quoc": { "$likeI": (query) } },
                                { "ma_sanpham": { "$likeI": gonrinApp().convert_khongdau(query) } }
                            ]
                        }
                    };
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
                            if (self.check_setdata == false && self.hasViewData == true && !!id_sanpham) {
                                // self.check_setdata = true;
                                var $selectz = (self.$el.find('#selectize-programmatic'))[0]
                                $selectz.selectize.setValue([id_sanpham]);
                            }
                        }
                    });

                },
                onChange: function(value, isOnInitialize) {
                    var $selectz = (self.$el.find('#selectize-programmatic'))[0]
                    var obj = $selectz.selectize.options[value];
                    if (obj !== null && obj !== undefined) {
                        var id = self.model.get("id");
                        if (self.check_setdata == true || !id) {
                            // logic: nếu phiếu đó chưa có id - phiếu tạo mới thì set data vật tư
                            // k tính sự kiện onchange khi set data vật tư lần đầu
                            self.model.set({
                                "ten_sanpham": obj.ten_sanpham,
                                "ma_sanpham": obj.ma_sanpham,
                                "id_sanpham": obj.id_sanpham,
                                "sanpham": obj
                            });
                        } else {
                            // sự kiện khi update phiếu, set data vật tư lần đầu
                            self.check_setdata = true;
                        }
                        self.$el.find('.info_duoclieu').html(`
                            <small><b>Chi tiết:</b> ${obj.ten_sanpham} - ${obj.ten_khoa_hoc}</small>
                        `);
                        if (!!self.$el.find('#selectize-cq')[0].selectize) {
                            self.$el.find('#selectize-cq')[0].selectize.destroy();
                        }
                        self.$el.find('#info_cq').html('');
                        self.selectizeCQ();
                    } else {
                        self.model.set({
                            "ten_sanpham": null,
                            "ma_sanpham": null,
                            "id_sanpham": null,
                            "sanpham": null
                        });
                        self.$el.find('.info_duoclieu').html(``);
                        self.$el.find('#info_cq').html('');
                        self.model.set({
                            "ma_kiem_nghiem": null,
                            "phieu_kiem_nghiem_id": null,
                            "phieu_kiem_nghiem": null
                        })
                    }
                    if (!!self.model.get('id_sanpham')) {
                        self.$el.find('.container-cq').removeClass('d-none');
                    } else {
                        self.$el.find('.container-cq').addClass('d-none');
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
                        self.render_duoclieu_nhapkhau(value);
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
        initLoaiCo: function(loai_co){
            var self = this;
            //nhập khẩu
            if (loai_co ===1){
                self.$el.find('.giayphepinfor').removeClass("d-none");
                self.selectizeSoGiayPhep();
            }
            //trong nước
            else{
                self.$el.find('.giayphepinfor').addClass("d-none");
                self.selectizeDuoclieu();
            }
        }
    });

});