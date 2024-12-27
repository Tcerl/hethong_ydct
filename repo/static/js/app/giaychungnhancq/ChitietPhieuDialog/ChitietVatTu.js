define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/giaychungnhancq/ChitietPhieuDialog/tpl/model.html'),
        schema 				= require('json!schema/PhieuKiemNghiemSchema.json');
    var DialogKetQua = require('app/giaychungnhancq/ChitietPhieuDialog/DialogKetQua');
    return Gonrin.ModelDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
        collectionName: "giay_chungnhan_chatluong_cq_chitiet",
        bindings:"data-cq_chitiet",
        check_setdata: false,
        hasViewData: false,
        uiControl:{
            fields:[
                {
                    field:"ngay_kiem_nghiem",
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
                    field:"ngay_bao_cao",
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
                    field:"ngay_san_xuat",
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
                    field:"han_su_dung",
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
                }
            ]
        },
        render:function(){
            var self = this;
            self.check_setdata = false;
            self.hasViewData = false;
            self.eventClickButton();
            var viewData_data = self.viewData.data;
            if (!!viewData_data && viewData_data !== undefined && viewData_data !== null) {
                self.hasViewData = true;
                self.model.set(viewData_data);
                var ketqua = self.model.get("ket_qua");
                if (ketqua !== undefined && ketqua !== null && ketqua instanceof Array && ketqua.length >0){
                    for(var i=0; i<ketqua.length;i++){
                        var ketluan = "";
                        if (ketqua[i].ketluan == 1){
                            ketluan = "Đạt";
                        }else{
                            ketluan = "Không Đạt";
                        }
                        var tr_html = `<tr>
                        <td>` + ketqua[i].chitieukiemtra + `</td> 
                        <td>` + ketqua[i].noidung + `</td>
                        <td>` + ketluan + `</td>`;
                    self.$el.find(".table-ket-qua-kiem-nghiem tbody").append(tr_html);
                    }
                }
                self.applyBindings();                
            } else {
                var viewData_chungnhan_id= self.viewData.chungnhan_id;
                if (viewData_chungnhan_id == null || viewData_chungnhan_id == undefined) {
                    self.getApp().notify({message: "Tham số không hợp lệ"}, {type: "danger", delay: 5000});
                    self.close();
                    return;
                }
                self.model.set({
                    "chungnhan_id": viewData_chungnhan_id,
                    "ngay_kiem_nghiem": self.viewData.ngay_kiem_nghiem,
                    "ma_kiem_nghiem" : self.viewData.ma_kiem_nghiem
                });
                self.applyBindings();
            }
            var $selectize = self.$el.find('#selectize-programmatic').selectize({
                    valueField: 'id_sanpham',
                    labelField: 'ten_sanpham',
                    searchField: ['ten_sanpham', 'ten_khoa_hoc', 'ten_trung_quoc', 'tenkhongdau'],
                    preload: true,
                    load: function(query, callback) {
    
                        var query_filter = {"filters": {"$or": [
                            { "ten_sanpham": { "$likeI": gonrinApp().convert_khongdau(query) } },
                            { "ten_khoa_hoc": { "$likeI": (query) } },
                            { "ten_trung_quoc": { "$likeI": (query) } },
                            { "tenkhongdau": { "$likeI": (query) } },
                            { "ma_sanpham" : { "$likeI" : gonrinApp().convert_khongdau(query)}}
                            ]}};
                        var url = (self.getApp().serviceURL || "") + '/api/v1/sanpham_donvi_filter?' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
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
                                    "id_sanpham":obj.id_sanpham,
                                    "sanpham": obj,
                                    "nuoc_sanxuat": obj.nuoc_sanxuat,
                                    "loai_sanpham":obj.loai_sanpham
                                });
                            } else {
                                // sự kiện khi update phiếu, set data vật tư lần đầu
                                self.check_setdata = true;
                            }
                        }
                    }
                });
            
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
                var sanpham = self.model.get("sanpham");
                if (!sanpham || sanpham == null || sanpham == undefined || sanpham == "") {
                    self.getApp().notify({ message: "Vui lòng chọn dược liệu"}, { type: "danger", delay: 1000 });
                    return;
                }
                var so_lo = self.model.get("so_lo");
                if (so_lo === undefined || so_lo === null || so_lo ===""){
                    self.getApp().notify({message: "Vui lòng nhập số lô."}, {type : "danger", delay : 2000});
                    return;
                }
                var ngay_kiem_nghiem = self.model.get("ngay_kiem_nghiem");
                if (!ngay_kiem_nghiem || ngay_kiem_nghiem == null || ngay_kiem_nghiem == undefined || ngay_kiem_nghiem == "") {
                    self.getApp().notify({ message: "Vui lòng nhập ngày kiểm nghiệm"}, { type: "danger", delay: 1000 });
                    return;
                }
                var ngay_bao_cao = self.model.get("ngay_bao_cao");
                if (!ngay_bao_cao || ngay_bao_cao == null || ngay_bao_cao == undefined || ngay_bao_cao == "") {
                    self.getApp().notify({ message: "Vui lòng nhập ngày báo cáo"}, { type: "danger", delay: 1000 });
                    return;
                }
                var ngay_san_xuat = self.model.get("ngay_san_xuat");
                if (!ngay_san_xuat || ngay_san_xuat == null || ngay_san_xuat == undefined || ngay_san_xuat == "") {
                    self.getApp().notify({ message: "Vui lòng nhập ngày sản xuất"}, { type: "danger", delay: 1000 });
                    return;
                }
                var han_su_dung = self.model.get("han_su_dung");
                if (!han_su_dung || han_su_dung == null || han_su_dung == undefined || han_su_dung == "") {
                    self.getApp().notify({ message: "Vui lòng nhập hạn sử dụng"}, { type: "danger", delay: 1000 });
                    return;
                }
                var ma_kiem_nghiem = self.model.get("ma_kiem_nghiem");
                if (ma_kiem_nghiem == null || ma_kiem_nghiem == undefined || ma_kiem_nghiem === "") {
                    self.getApp().notify({ message: "Vui lòng nhập mã kiểm nghiệm"}, { type: "danger", delay: 1000 });
                    return;
                }
                var ten_donvi_cap = self.model.get("ten_donvi_cap");
                if (ten_donvi_cap === undefined || ten_donvi_cap === null || ten_donvi_cap === ""){
                    self.getApp().notify({message : "Vui lòng nhập tên đơn vị cấp"}, {type : "dagner", delay : 1000});
                    return false;
                }
                var currentUser = gonrinApp().currentUser;
                if(currentUser && currentUser.donvi_id !== null){
                    self.model.set("donvi_id", currentUser.donvi_id);
                    self.model.set("donvi", currentUser.donvi);
                }
                self.model.save(null,{
                    success: function (model, respose, options) {
                        self.model.set(model.attributes);
                        self.getApp().notify("Lưu thông tin thành công");
                        self.trigger("saveVattu", {"data": self.model.toJSON()});
                    },
                    error: function (xhr, status, error) {
                        try {
                            if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
                                self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                self.getApp().getRouter().navigate("login");
                            } else {
                            self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 3000 });
                            }
                        }
                        catch (err) {
                            self.getApp().notify({ message: "Lưu thông tin không thành công"}, { type: "danger", delay: 3000 });
                        }
                    },
                    complete:function(){
                        
                        self.close();
                    }
                });
                
            });
            self.$el.find(".btn-add-ketqua").unbind("click").bind("click", function(e){
                e.stopPropagation();
                var ketquakiemnghiem = new DialogKetQua();
                    ketquakiemnghiem.dialog();
				    ketquakiemnghiem.on("saveData", function (event) {
					var data = event.data;
					var ketqua = self.model.get('ket_qua');
					if (ketqua == null || ketqua == undefined || ketqua == "") {
						ketqua = [];
					}
                        ketqua.push(data);
                        self.model.set("ket_qua", ketqua);
                        var ketluan = "";
                        if (data.ketluan == 1){
                            ketluan = "Đạt";
                        }else{
                            ketluan = "Không Đạt";
                        }
                        var tr_html = `<tr>
                            <td>` + data.chitieukiemtra + `</td> 
                            <td>` + data.noidung + `</td>
                            <td>` + ketluan + `</td>
                        `
                        self.$el.find(".table-ket-qua-kiem-nghiem tbody").append(tr_html);
				});
            });
        },
    });

});