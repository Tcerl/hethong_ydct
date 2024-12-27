define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/quanlykho/PhieuNhap/ChitietPhieuDialog/tpl/model.html'),
        schema 				= require('json!schema/PhieuNhapChiTietSchema.json');
    var   WarningDialog 	 	=	require('app/quanlykho/PhieuNhap/WarningDialog');
    var ThemDuocLieu = require('app/view/quanlynuoitrong/ThemDuocLieuDialog');
    var ChungNhanCQDialogView = require('app/giaychungnhancq/ModelDialogView');
    var ChungNhanCODialogView = require('app/giaychungnhanco/ModelDialog');
    var ChungNhanCo = require('app/giaychungnhanco/ModelDialogThongke');
    var ChungNhanCq = require('app/giaychungnhancq/ModelDialogView');
    


    return Gonrin.ModelDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v2/",
        collectionName: "phieunhapkho_chitiet",
        bindings:"data-phieunhapkho_chitiet",
        check_setdata: false,
        hasViewData: false,
        check_data_valid : true,
        isViewSanPham: false,
        isSetIdSanPham: false,
        isSetObjSanPham: false,
        isViewCq: false,
        setCqId : false,
        isSetObjCq: false,
        isSetObjCo: false,
        setIdCoId: false,
        clickSave: false,
        setIdDuocLieuCo: false,
        isViewDuocLieuCo: false,
        uiControl:{
            fields:[
                {
                    field:"loai_nguon_duoc_lieu",
                    uicontrol:"combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass:"form-control",
                        dataSource: [
                        { value: 1, text: "Thu gom từ tự nhiên" },
                        { value: 2, text: "Thu gom từ cơ sở nuôi trồng" },
                        ],
                    },
                {
                    field:"thoigian_nhap",
                    uicontrol:"datetimepicker",
                    format:"DD/MM/YYYY",
                    textFormat:"DD/MM/YYYY",
                    extraFormats:["DDMMYYYY"],
                    parseInputDate: function(val){
                        return gonrinApp().parseInputDateString(val);
                    },
                    parseOutputDate: function(date){
                        return gonrinApp().parseOutputDateString(date);
                    },
                    disabledComponentButton: true
                },
                {
                    field:"hansudung",
                    uicontrol:"datetimepicker",
                    format:"DD/MM/YYYY",
                    textFormat:"DD/MM/YYYY",
                    extraFormats:["DDMMYYYY"],
                    parseInputDate: function(val){
                        return gonrinApp().parseInputDateString(val);
                    },
                    parseOutputDate: function(date){
                        return gonrinApp().parseOutputDateString(date);
                    },
                    disabledComponentButton: true
                },
            ]
        },
        render:function(){
            var self = this;
            self.check_setdata = false;
            self.hasViewData = false;
            self.check_data_valid = true;
            self.isViewSanPham = false;
            self.isSetIdSanPham = false;
            self.isSetObjSanPham = false;
            self.isViewCq = false;
            self.setCqId = false;
            self.isSetObjCo = false;
            self.setIdCoId = false;
            self.isSetObjCq = false;
            self.clickSave = false;
            self.setIdDuocLieuCo = false;
            self.isViewDuocLieuCo = false;
            self.eventClickButton();
            var viewData_data = self.viewData.data;
            if (!!viewData_data && viewData_data !== undefined && viewData_data !== null) {
                self.hasViewData = true;
                self.model.set(viewData_data);
                self.xemLichSu();
                if (self.model.get("hansudung") === ""){
                    self.model.set("hansudung", null);
                }
                self.applyBindings();
            } else {
                var viewData_phieunhap_id = self.viewData.phieunhap_id;
                if (viewData_phieunhap_id == null || viewData_phieunhap_id == undefined) {
                    self.getApp().notify({message: "Tham số không hợp lệ"}, {type: "danger", delay: 5000});
                    self.close();
                    return;
                }
                self.model.set({
                    "phieunhap_id": viewData_phieunhap_id,
                    "so_phieu": self.viewData.so_phieu_chungtu,
                    "thoigian_taophieu": self.viewData.thoigian_taophieu,
                    "ma_kho":self.viewData.ma_kho,
                    "ten_kho":self.viewData.ten_kho,
                    "thoigian_nhap" : self.viewData.thoigian_nhap,
                    "nguon_cungcap" : self.viewData.nguon_cungcap,
                    "so_chungnhan_co" : self.viewData.so_chungnhan_co,
                    "chungnhan_co_id" : self.viewData.chungnhan_co_id
                });
                let data_thuhoach = self.viewData.data_thuhoach;
                if (!!data_thuhoach){
                    self.model.set({
                        "id_sanpham": data_thuhoach.id_sanpham,
                        "sanpham": data_thuhoach.sanpham
                    });
                    self.hasViewData = true;
                    if (self.viewData.nguon_cungcap ==4){
                        self.model.set("thuhoach_nuoitrong_id", data_thuhoach.id);
                    }
                    else if (self.viewData.nguon_cungcap ==5){
                        self.model.set("thuhoach_khaithac_id", data_thuhoach.id);
                    }
                }
                self.applyBindings();
            }
            self.selectizeCQ();

            var nguon_cungcap = self.model.get("nguon_cungcap");
            if (nguon_cungcap === 3){
                self.$el.find(".thongtincungung").removeClass("d-none");
            }
            else{
                self.$el.find("#so_lo").append(`<span class="text-danger"> *</span>`);
                self.$el.find(".thongtincungung").addClass("d-none");
            }

            if (nguon_cungcap == 4 || nguon_cungcap ==5){
                let data_thuhoach = self.viewData.data_thuhoach;
                if (!!data_thuhoach){
                    self.selectizeDuoclieu(data_thuhoach);
                }
                else{
                    self.selectizeDuoclieu();
                }
            }

            var chungnhan_co_id = self.viewData.chungnhan_co_id;
            if (chungnhan_co_id !== undefined && chungnhan_co_id !== null && chungnhan_co_id !== ""){
                self.$el.find(".chungnhanco").addClass("d-none");
                self.selectizeDuoclieuCo(chungnhan_co_id);
            }
            else{
                self.$el.find(".chungnhanco").removeClass("d-none");
                self.selectizeCO();
                self.selectizeDuoclieu();
                self.addDuoclieu();
            }




            return this;
        },
        eventClickButton: function () {
            var self = this;
            self.$el.find('.btn-close').unbind("click").bind("click", function (e) {
                e.stopPropagation();
                self.close();
            });
            self.$el.find('.btn-save').unbind("click").bind("click", function (e) {
                e.stopPropagation();
                if (self.clickSave === true){
                    return false
                }
                var sanpham = self.model.get("sanpham");
                if (!sanpham || sanpham == null || sanpham == undefined || sanpham == "") {
                    self.getApp().notify({ message: "Vui lòng chọn dược liệu"}, { type: "danger", delay: 1000 });
                    return;
                }
                var nguon_cungcap = self.model.get("nguon_cungcap");
                if (nguon_cungcap !== 3){
                    var so_lo = self.model.get("so_lo");
                    if (so_lo === undefined || so_lo === null || so_lo ===""){
                        self.getApp().notify({message: "Vui lòng nhập số lô."}, {type : "danger", delay : 2000});
                        return;
                    }
                }
                if (nguon_cungcap == 1){
                    var phieu_kiem_nghiem_id = self.model.get("phieu_kiem_nghiem_id");
                    if (phieu_kiem_nghiem_id === undefined || phieu_kiem_nghiem_id === null || phieu_kiem_nghiem_id === ""){
                        self.getApp().notify({message : "Vui lòng nhập đủ thông tin giấy chứng nhạn chất lượng CQ"}, {type : "danger", delay : 1000});
                        return false;
                    }
                }
                var soluong_thucte = self.model.get("soluong_thucte");
                if (!soluong_thucte || soluong_thucte == null || soluong_thucte == undefined || soluong_thucte == "") {
                    self.getApp().notify({ message: "Vui lòng nhập số lượng vật tư thực tế"}, { type: "danger", delay: 1000 });
                    return;
                }
                if (soluong_thucte === ""){
                    self.model.set("soluong_thucte", 0);
                }

                if (self.model.get("soluong_chungtu") ===""){
                    self.model.set("soluong_chungtu", 0);
                }

                var dongia = self.model.get("dongia");
                if (dongia == undefined || dongia === null || dongia === ""){
                    self.getApp().notify({message : "Vui lòng nhập đơn giá"}, {type : "danger", delay : 1000});
                    return;
                }
                var so_phieu = self.model.get("so_phieu");
                if (so_phieu == null || so_phieu == undefined) {
                    so_phieu = "";
                }
                self.model.set("so_phieu", so_phieu);
                var currentUser = gonrinApp().currentUser;
                if(currentUser && currentUser.donvi_id !== null){
                    self.model.set("donvi_id", currentUser.donvi_id);
                    // self.model.set("donvi", currentUser.donvi);
                }
                self.clickSave = true;
                self.getApp().showloading();

                self.model.save(null,{
                    success: function (model, respose, options) {
                        if (!!respose && !!respose.error_code && respose.error_code == "UPDATE_ERROR") {
                            respose.type = 'UPDATE';
                            var warningDialog = new WarningDialog({"viewData": respose});
                            warningDialog.dialog({size: "large"});
                        } else {
                            self.model.set(model.attributes);
                            self.getApp().notify("Lưu thông tin thành công");
                            self.trigger("saveVattu", {"data": respose});
                        }
                    },
                    error: function (xhr, status, error) {
                        try {
                            if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
                                self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                self.getApp().getRouter().navigate("login");
                            } 
                            else {
                                self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 3000 });
                            }
                        }
                        catch (err) {
                            self.getApp().notify({ message: "Lưu thông tin không thành công"}, { type: "danger", delay: 3000 });
                        }
                    },
                    complete:function(){
                        self.getApp().hideloading();
                        self.clickSave = false;
                        self.close();
                    }
                });
                
            });

            self.$el.find(".btn-new-cq").unbind("click").bind("click", ()=>{
                let so_lo = self.model.get("so_lo");
                let id_sanpham = self.model.get("id_sanpham");
                let params = {
                    id_sanpham,
                    so_lo
                }
                var chungNhanCQDialogView = new ChungNhanCQDialogView({ viewData: params });
                chungNhanCQDialogView.dialog({ size: "large" });
                chungNhanCQDialogView.on('saveDataCQDialog', function(e, data) {
                    if (!!self.$el.find('#selectize-cq')[0].selectize) {
                        self.$el.find('#selectize-cq')[0].selectize.destroy();
                    }
                    if (!!e && e.id_sanpham == self.model.get('id_sanpham')) {
                        self.model.set({
                            "ma_kiem_nghiem": e.ma_kiem_nghiem,
                            "phieu_kiem_nghiem_id": e.id,
                            "so_lo": e.so_lo
                        })
                    }
                    self.selectizeCQ();
                })
            });

            self.$el.find(".btn-new-co").unbind("click").bind("click", ()=>{
                var chungNhanCO = new ChungNhanCODialogView();
                chungNhanCO.dialog({size: "large"});
                chungNhanCO.on("saveCO", function(e){
                    if (!!self.$el.find('#selectize-co')[0].selectize) {
                        self.$el.find('#selectize-co')[0].selectize.destroy();
                    }
                    if (!!e){
                        self.model.set({
                            "so_chungnhan_co": e.so_co,
                            "chungnhan_co_id": e.id
                        })
                    }
                    self.selectizeCO();
                })
            })
        },
        selectizeDuoclieuCo : function(chungnhan_co_id){
            var self = this;
            var $selectize = self.$el.find('#selectize-programmatic').selectize({
                valueField: 'id',
                labelField: 'ten_sanpham',
                searchField: ['ten_sanpham','ma_sanpham'],
                preload: true,
                load: function(query, callback) {
                    var query_filter = {
                        "filters": {
                            "chungnhan_id": {"$eq": chungnhan_co_id}
                        }
                    };
					var url = (self.getApp().serviceURL || "") + '/api/v1/giaychungnhanco_chitiet_filter?' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "") ;
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                            var chungnhan_co_chitiet_id = self.model.get("chungnhan_co_chitiet_id");
                            if (self.setIdDuocLieuCo == false  && !!chungnhan_co_chitiet_id) {
                                var $selectz = (self.$el.find('#selectize-programmatic'))[0]
                                $selectz.selectize.setValue([chungnhan_co_chitiet_id]);
                                self.setIdDuocLieuCo = true;
                            }
                        }
                    });  

                },
                render: {
                    option: function(item, escape) {
                        return `<div class="option">
                        <div>Tên dược liệu: <span class="font-weight-bold">${item.ten_sanpham?item.ten_sanpham: ""}</span></div>
                        <div>Số giấy phép nhập khẩu: <span class="font-weight-bold">${item.so_giay_phep?item.so_giay_phep : ""}</span></div>
                        </div>`;
                    }
                },
                onChange: function(value, isOnInitialize) {
                    var $selectz = (self.$el.find('#selectize-programmatic'))[0]
                    var obj = $selectz.selectize.options[value];
                    if (obj !== null && obj !== undefined) {
                        var id = self.model.get("id");
                        if (self.isViewDuocLieuCo == true || !id) {
                            // logic: nếu phiếu đó chưa có id - phiếu tạo mới thì set data vật tư
                            // k tính sự kiện onchange khi set data vật tư lần đầu
                            self.model.set({
                                "ten_sanpham": obj.ten_sanpham,
                                "ma_sanpham": obj.ma_sanpham,
                                "id_sanpham":obj.id_sanpham,
                                "sanpham": obj.sanpham,
                                "chungnhan_co_chitiet_id": obj.id,
                                "so_chungnhan_co": obj.so_co,
                                "chungnhan_co_id": obj.chungnhan_id
                            });
                            if (obj.giatien == null) {
                                self.$el.find('.giatien').html(0);
                            } else {
                                self.$el.find('.giatien').html(Number(obj.giatien).toLocaleString());
                            }
                            var id_sanpham = self.model.get("id_sanpham");
                            if (!!id_sanpham){
                                var $selectz1 = (self.$el.find('#selectize-cq'))[0];
                                if ($selectz1 !== undefined && $selectz1 !== null && $selectz1.selectize){
                                    self.model.set({
                                        "ma_kiem_nghiem": null,
                                        "phieu_kiem_nghiem_id": null
                                    });
                                    $selectz1.selectize.destroy();	
                                }
                                self.selectizeCQ();
                            }
                        } else {
                            // sự kiện khi update phiếu, set data vật tư lần đầu
                            self.isViewDuocLieuCo = true;
                        }

                        var soluong = gonrinApp().convert_string_to_number(self.model.get("soluong_thucte"));
                        var giatien = gonrinApp().convert_string_to_number(self.model.get('dongia'))
                        var tong_gia = soluong * giatien;
                        self.$el.find('.gia_thanhtoan').text(Number(tong_gia).toLocaleString());
                        self.model.on("change:soluong_thucte change:dongia", function () {
                            var soluong = gonrinApp().convert_string_to_number(self.model.get("soluong_thucte"));
                            var giatien = gonrinApp().convert_string_to_number(self.model.get('dongia'))
                            var tong_gia = soluong * giatien;
                            self.model.set("thanhtien", tong_gia);
                            self.$el.find('.gia_thanhtoan').text(Number(tong_gia).toLocaleString());
                        });
                    }
                    else{
                        self.model.set({
                            "ten_sanpham": null,
                            "ma_sanpham": null,
                            "id_sanpham":null,
                            "sanpham": null,
                            "chungnhan_co_chitiet_id": null,
                            "so_chungnhan_co": null,
                            "chungnhan_co_id": null
                        });
                    }

                }
            });
        },
        selectizeCO : function(){
			var self = this;
			var currentUser = self.getApp().currentUser;
			var donvi_id = "";
			if (!!currentUser && !!currentUser.donvi_id){
				donvi_id = currentUser.donvi_id;
			}
			var $selectize = self.$el.find('#selectize-co').selectize({
                valueField: 'id',
                labelField: 'so_co',
				searchField: ['so_co', 'ten_sanpham', 'ma_sanpham'],
				preload: true,
				maxOptions : 10,
                maxItems : 1,
                render: {
                    option: function(item, escape) {
                        
                        return `<div class="option">${item.so_co?item.so_co:""}
                        <div>Tên dược liệu: ${item.ten_sanpham?item.ten_sanpham:""}</div>
                        <div>Số giấy phép nhập khẩu: ${item.so_giay_phep?item.so_giay_phep:""}</div>
                        </div>`;
                    }
                },
                load: function(query, callback) {
                    var query_filter = "";
                    var id_sanpham = self.model.get("id_sanpham");
                    var nguon_cungcap = self.model.get("nguon_cungcap");
                    if (!!id_sanpham){
                        if (nguon_cungcap ===1){
                            query_filter = {
                                "filters": {
                                    "$and":[
                                        {"$or": [
                                            { "so_co": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                            { "ten_sanpham": { "$likeI": (query) } },
                                            { "ma_sanpham": { "$likeI": gonrinApp().convert_khongdau(query) } },
    
                                        ]},
                                        { "donvi_id": { "$eq": donvi_id} },
                                        { "id_sanpham": { "$eq": id_sanpham } },
                                        {"loai_co": {"$eq": 1}}
                                    ]
                                    
                                }
                            };
                        }
                        else{
                            query_filter = {
                                "filters": {
                                    "$and":[
                                        {"$or": [
                                            { "so_co": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                            { "ten_sanpham": { "$likeI": (query) } },
                                            { "ma_sanpham": { "$likeI": gonrinApp().convert_khongdau(query) } },
    
                                        ]},
                                        { "donvi_id": { "$eq": donvi_id} },
                                        { "id_sanpham": { "$eq": id_sanpham } },
                                        {"loai_co": {"$eq": 2}}
                                    ]
                                    
                                }
                            };
                        }

                    }
                    else{
                        if (nguon_cungcap ===1){
                            query_filter = {
                                "filters": {
                                    "$and":[
                                        {"$or": [
                                            { "so_co": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                            { "ten_sanpham": { "$likeI": (query) } },
                                            { "ma_sanpham": { "$likeI": gonrinApp().convert_khongdau(query) } },
    
                                        ]},
                                        { "donvi_id": { "$eq": donvi_id} },
                                        {"loai_co": {"$eq": 1}}
                                    ]
                                    
                                }
                            };
                        }
                        else{
                            query_filter = {
                                "filters": {
                                    "$and":[
                                        {"$or": [
                                            { "so_co": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                            { "ten_sanpham": { "$likeI": (query) } },
                                            { "ma_sanpham": { "$likeI": gonrinApp().convert_khongdau(query) } },
    
                                        ]},
                                        { "donvi_id": { "$eq": donvi_id} },
                                        {"loai_co": {"$eq": 2}}
                                    ]
                                    
                                }
                            };
                        }

                    }
                    let so_chungnhan_co = self.model.get("so_chungnhan_co");
                    let chungnhan_co_id = self.model.get("chungnhan_co_id");
                    let chungnhan_co_chitiet_id = self.model.get("chungnhan_co_chitiet_id");
                    let ten_sanpham = self.model.get("ten_sanpham");
                    if (!!chungnhan_co_id && !!so_chungnhan_co && self.isSetObjCo === false) {
                        let objs = {
                            chungnhan_id: chungnhan_co_id,
                            so_co: so_chungnhan_co,
                            id: chungnhan_co_chitiet_id,
                            ten_sanpham
                        }
                        callback([objs]);
                        self.isSetObjCo = true;
                    }
					var url = (self.getApp().serviceURL || "") + '/api/v1/giaychungnhanco_chitiet_filter?' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
							var chungnhan_co_chitiet_id = self.model.get("chungnhan_co_chitiet_id");
							if (chungnhan_co_chitiet_id !== undefined && chungnhan_co_chitiet_id !== null && self.setIdCoId === false){
                                $selectize[0].selectize.setValue([chungnhan_co_chitiet_id]);
                                self.setIdCoId = true;
							}
                        }
                    });
                },
                onChange: function(value, isOnInitialize) {
					var $selectz = (self.$el.find('#selectize-co'))[0];
					var obj = $selectz.selectize.options[value];
					if (obj !== undefined && obj !== null){
						var so_chungnhan_co = obj.so_co;
						var chungnhan_co_id = obj.chungnhan_id;
                        var chungnhan_co_chitiet_id = obj.id;
						self.model.set({
							"so_chungnhan_co" : so_chungnhan_co,
							"chungnhan_co_id" : chungnhan_co_id,
                            "chungnhan_co_chitiet_id": chungnhan_co_chitiet_id
						});
						var ten_donvi_cungcap = obj.ten_donvi_cungcap;
						var diachi_donvi_cungcap = obj.diachi_donvi_cungcap;
						self.model.set({
							"ten_donvi_cungung" : ten_donvi_cungcap,
							"diachi_donvi_cungung" : diachi_donvi_cungcap
                        });
                        self.$el.find("#view-co").removeClass("d-none");
                        self.$el.find("#view-co").unbind("click").bind("click", (e)=>{
                            e.stopPropagation();
                            let co = new ChungNhanCo({viewData: {"id" :  self.model.get("chungnhan_co_id")}});
                            co.dialog({size: "large"});
                        })
					}
					else{
                        self.$el.find("#view-co").addClass("d-none");
						self.model.set({
							"so_chungnhan_co" : null,
							"chungnhan_co_id" : null,
                            "chungnhan_co_chitiet_id": null,
							"ten_donvi_cungung" : null,
							"diachi_donvi_cungung" : null
						})
					}
                }
            });
        },
        selectizeCQ: function () {
            var self = this;
            var currentUser = self.getApp().currentUser;
			var donvi_id = "";
			if (!!currentUser && !!currentUser.donvi_id){
				donvi_id = currentUser.donvi_id;
			}
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

                load: function (query, callback) {
                    var query_filter = "";
                    var id_sanpham = self.model.get("id_sanpham");
                    if (!!id_sanpham){
                        let so_lo = self.model.get("so_lo");
                        if (!!so_lo){
                            query_filter = {
                                "filters": {
                                    "$and":[
                                        {"$or": [
                                            { "ma_kiem_nghiem": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                            { "ten_sanpham": { "$likeI": (query) } }
                                            
                                        ]},
                                        { "id_sanpham": { "$eq": self.model.get('id_sanpham') } },
                                        {"so_lo" : {"$eq" : so_lo}},
                                        { "donvi_id": { "$eq": donvi_id} },
                                    ]
                                    
                                }
                            };
                        }
                        else{
                            query_filter = {
                                "filters": {
                                    "$and":[
                                        {"$or": [
                                            { "ma_kiem_nghiem": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                            { "ten_sanpham": { "$likeI": (query) } }
                                            
                                        ]},
                                        { "id_sanpham": { "$eq": self.model.get('id_sanpham') } },
                                        { "donvi_id": { "$eq": donvi_id} },
                                    ]
                                    
                                }
                            };
                        }

                    }
                    else{
                        query_filter = {
                            "filters": {
                                "$and":[
                                    {"$or": [
                                        { "ma_kiem_nghiem": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                        { "ten_sanpham": { "$likeI": (query) } }
                                        
                                    ]},
                                    { "donvi_id": { "$eq": donvi_id} },

                                ]
                                
                            }
                        };
                    }
                    let phieu_kiem_nghiem_id = self.model.get("phieu_kiem_nghiem_id");
                    let ma_kiem_nghiem = self.model.get("ma_kiem_nghiem");
                    let ten_sanpham = self.model.get("ten_sanpham");
                    let so_lo = self.model.get("so_lo");
                    if (!!phieu_kiem_nghiem_id && !!ma_kiem_nghiem && self.isSetObjCq === false){
                        let objs = {
                            id: phieu_kiem_nghiem_id,
                            ma_kiem_nghiem: ma_kiem_nghiem,
                            ten_sanpham,
                            so_lo
                        }
                        callback([objs]);
                        self.isSetObjCq = true;
                    }
                    var url = (self.getApp().serviceURL || "") + '/api/v1/phieu_kiem_nghiem_filter?' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function () {
                            callback();
                        },
                        success: function (res) {
                            callback(res.objects);
                            var phieu_kiem_nghiem_id = self.model.get("phieu_kiem_nghiem_id");
                            if (!!phieu_kiem_nghiem_id && self.setCqId === false) {
                                self.$el.find('#selectize-cq')[0].selectize.setValue(phieu_kiem_nghiem_id);
                                self.setCqId = true;
                            }
                        }
                    });

                },
                onChange: function (value, isOnInitialize) {
                    var $selectz = (self.$el.find('#selectize-cq'))[0]
                    var obj = $selectz.selectize.options[value];
                    if (!!obj) {
                        let id = self.model.get("id");
                        if (!id || self.isViewCq === true){
                            self.model.set({
                                "ma_kiem_nghiem": obj.ma_kiem_nghiem,
                                "phieu_kiem_nghiem_id": obj.id,
                            });
                            let so_lo = self.model.get("so_lo");
                            if (so_lo === undefined || so_lo === null || so_lo===""){
                                if (!!obj.so_lo){
                                    self.model.set("so_lo", obj.so_lo);
                                }
                            }
                        }
                        else{
                            let phieu_kiem_nghiem_id = self.model.get("phieu_kiem_nghiem_id");
                            if (phieu_kiem_nghiem_id ===null || phieu_kiem_nghiem_id === undefined || phieu_kiem_nghiem_id === ""){
                                self.model.set({
                                    "ma_kiem_nghiem": obj.ma_kiem_nghiem,
                                    "phieu_kiem_nghiem_id": obj.id
                                });
                            }
                            else{
                                self.isViewCq = true;
                            }
                        }
                        self.$el.find("#view-cq").removeClass("d-none");
                        self.$el.find("#view-cq").unbind("click").bind("click", (e)=>{
                            e.stopPropagation();
                            let cq = new ChungNhanCq({viewData: {"id" :  self.model.get("phieu_kiem_nghiem_id")}});
                            cq.dialog({size: "large"});
                        })
                    }
                    else{
                        self.$el.find("#view-cq").addClass("d-none");
                        self.model.set({
                            "ma_kiem_nghiem": null,
                            "phieu_kiem_nghiem_id": null
                        });
                        let id = self.model.get("id");
                        if (!id){
                            self.model.set("so_lo", null);
                        }
                    }
                }
            });
        },
        selectizeDuoclieu : function(data_thuhoach = null){
            var self = this;
            var $selectize = self.$el.find('#selectize-programmatic').selectize({
                valueField: 'id_sanpham',
                labelField: 'ten_sanpham',
                searchField: ['ten_sanpham', 'ten_khoa_hoc','tenkhongdau'],
                preload: true,
                load: function(query, callback) {
                    let sanpham = self.model.get("sanpham");
                    if (!!sanpham && self.isSetObjSanPham === false){
                        callback([sanpham]);
                        self.isSetObjSanPham = true;
                    }
                    var query_filter = {"filters": {"$or": [
                        { "ten_sanpham": { "$likeI": (query) } },
                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                        { "ten_khoa_hoc": { "$likeI": (query) } }

                        ]}
                    };
                    var url = (self.getApp().serviceURL || "") + '/api/v1/sanpham_donvi_filter?results_per_page=100000' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
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
                                var $selectz = (self.$el.find('#selectize-programmatic'))[0]
                                $selectz.selectize.setValue([id_sanpham]);
                                if (!!data_thuhoach){
                                    $selectz.selectize.disable();
                                }
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
                                "id_sanpham":obj.id_sanpham,
                                "sanpham": obj
                            });
                            if (obj.giatien == null) {
                                self.$el.find('.giatien').html(0);
                            } else {
                                self.$el.find('.giatien').html(Number(obj.giatien).toLocaleString());
                            }
                            var id_sanpham = self.model.get("id_sanpham");
                            if (!!id_sanpham){
                                var $selectz1 = (self.$el.find('#selectize-cq'))[0];
                                if ($selectz1 !== undefined && $selectz1 !== null && $selectz1.selectize){
                                    self.model.set({
                                        "ma_kiem_nghiem": null,
                                        "phieu_kiem_nghiem_id": null
                                    });
                                    $selectz1.selectize.destroy();	
                                }
                                var $selectz2 = (self.$el.find('#selectize-co'))[0];
                                if ($selectz2 !== undefined && $selectz2 !== null && $selectz2.selectize){
                                    self.model.set({
                                        "so_chungnhan_co" : null,
                                        "chungnhan_co_id" : null,
                                        "chungnhan_co_chitiet_id": null
                                    })
                                    $selectz2.selectize.destroy();	
                                }
                                self.selectizeCQ();
                                self.selectizeCO();
                            }
                        } else {
                            // sự kiện khi update phiếu, set data vật tư lần đầu
                            self.check_setdata = true;
                        }

                        var soluong = gonrinApp().convert_string_to_number(self.model.get("soluong_thucte"));
                        var giatien = gonrinApp().convert_string_to_number(self.model.get('dongia'))
                        var tong_gia = soluong * giatien;
                        self.$el.find('.gia_thanhtoan').text(Number(tong_gia).toLocaleString());
                        self.model.on("change:soluong_thucte change:dongia", function () {
                            var soluong = gonrinApp().convert_string_to_number(self.model.get("soluong_thucte"));
                            var giatien = gonrinApp().convert_string_to_number(self.model.get('dongia'))
                            var tong_gia = soluong * giatien;
                            self.model.set("thanhtien", tong_gia);
                            self.$el.find('.gia_thanhtoan').text(Number(tong_gia).toLocaleString());
                        });
                    }
                    else{
                        self.model.set({
                            "ten_sanpham": null,
                            "ma_sanpham": null,
                            "id_sanpham":null,
                            "sanpham": null
                        });
                    }

                }
            });
        },
        addDuoclieu: function(){
			var self = this;
			self.$el.find(".btn-add-duoclieu").unbind("click").bind("click", ()=>{
				let themDuocLieu = new ThemDuocLieu();
				themDuocLieu.dialog();
				themDuocLieu.on("saveData", (e)=>{
					let data = e.data;
					if (!!data){
						self.model.set({
							"ten_sanpham": data.ten_sanpham,
							"ma_sanpham": data.ma_sanpham,
							"id_sanpham":data.id_sanpham,
							"sanpham": data.sanpham
						});
						let select = (self.$el.find("#selectize-programmatic"))[0];
						if (!!select && !!select.selectize){
							select.selectize.destroy();
							self.isSetObjSanPham = false;
                            self.check_setdata = false;
                            self.hasViewData = true;
							self.selectizeDuoclieu();
						}
					}
				});
			});
        },
        xemLichSu: function(){
            var self = this;
            self.$el.find(".button-chitiet").append(`
                <a class="btn ml-1 btn-primary btn-lichsu href="javascript:void(0)"">Nguồn gốc</a>
            `)
            self.$el.find(".btn-lichsu").unbind("click").bind("click", (e)=>{
                e.stopPropagation;
                let id_sanpham =self.model.get("id_sanpham");
                let so_lo = self.model.get("so_lo");
                let donvi_id = self.model.get("donvi_id");
                if (!!id_sanpham && !!so_lo && !!donvi_id){
                    let url = gonrinApp().serviceURL + `/api/v1/access/history?donvi_id=${donvi_id}&so_lo=${so_lo}&id_sp=${id_sanpham}`
                    window.open(url); 
                }
            });
        }
    });

});