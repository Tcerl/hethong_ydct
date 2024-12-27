define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/quanlykho/PhieuDuTru1/ChitietPhieuDialog/tpl/model.html'),
        schema 				= require('json!schema/PhieuDuTruChiTietSchema.json');
    return Gonrin.ModelDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
        collectionName: "phieudutru_chitiet",
        bindings:"data-phieudutru_chitiet",
        check_setdata: false,
        hasViewData: false,
        loadData : false,
        uiControl:{
            fields:[
            ]
        },
        render:function(){
            var self = this;
            self.check_setdata = false;
            self.hasViewData = false;
            self.loadData = true;
            self.eventClickButton();
            var viewData_data = self.viewData.data;
            if (!!viewData_data && viewData_data !== undefined && viewData_data !== null) {
                self.hasViewData = true;
                self.model.set(viewData_data);
                self.applyBindings();
                
            } else {
                var viewData_phieudutru_id = self.viewData.phieudutru_id;
                if (viewData_phieudutru_id == null || viewData_phieudutru_id == undefined) {
                    self.getApp().notify({message: "Tham số không hợp lệ"}, {type: "danger", delay: 5000});
                    self.close();
                    return;
                }
                self.model.set({
                    "phieudutru_id": viewData_phieudutru_id,
                    "ngay_du_tru": self.viewData.ngay_du_tru,
                    "loai_ky_du_tru": self.viewData.loai_ky_du_tru,
                    "ky_du_tru": self.viewData.ky_du_tru,
                    "nam_du_tru":self.viewData.nam_du_tru,
                    "ngay_bat_dau":self.viewData.ngay_bat_dau,
                    "ngay_ket_thuc" : self.viewData.ngay_ket_thuc,
                    "loai_du_tru" : self.viewData.loai_du_tru,
                    "hinhthuc_dutru" : self.viewData.hinhthuc_dutru,
                    "du_tru_tat_ca_kho" : self.viewData.du_tru_tat_ca_kho,
                    "ma_kho" : self.viewData.ma_kho,
                    "ten_kho" : self.viewData.ten_kho
                });
                self.applyBindings();
            }

            var $selectize = self.$el.find('#selectize-programmatic').selectize({
                valueField: 'id_sanpham',
                labelField: 'ten_sanpham',
                searchField: 'ten_sanpham',
                preload: true,
                load: function(query, callback) {

                    var query_filter = {"filters": {"$or": [
                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                        { "ma_sanpham": { "$likeI": gonrinApp().convert_khongdau(query) } },
                        { "ten_sanpham": { "$likeI": (query) } },
                        { "ten_khoa_hoc": { "$likeI": (query) } },
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
                            if (self.loadData === true && self.model.get("sanpham")){
                                callback([self.model.get("sanpham")]);
                                callback(res.objects);
                            }
                            else{
                                self.loadData = false;
                                callback(res.objects);
                            }
                            var id_sanpham = self.model.get("id_sanpham");
                            if (self.check_setdata == false && self.hasViewData == true && !!id_sanpham) {
                                // self.check_setdata = true;
                                var $selectz = (self.$el.find('#selectize-programmatic'))[0]
                                $selectz.selectize.setValue([id_sanpham]);
                            }
                        }
                    });  

                },
                render: {
                    option: function (item, escape) {
                        return `<div class="option">${item.ten_sanpham} - ${item.ten_khoa_hoc} - ${item.ma_viettat}</div>`;
                    }
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
                    self.getApp().notify({ message: "Vui lòng chọn sản phẩm"}, { type: "danger", delay: 1000 });
                    return false;
                }
                var so_luong_du_tru = self.model.get("so_luong_du_tru");
                if (so_luong_du_tru === undefined || so_luong_du_tru === null || so_luong_du_tru ===""){
                    self.getApp().notify({message: "Vui lòng nhập số lượng dự trù."}, {type : "danger", delay : 2000});
                    return false;
                }
                var so_luong_duyet_du_tru = self.model.get("so_luong_duyet_du_tru");
                if (!so_luong_duyet_du_tru || so_luong_duyet_du_tru == null || so_luong_duyet_du_tru == undefined || so_luong_duyet_du_tru == "") {
                    self.getApp().notify({ message: "Vui lòng nhập số lượng duyệt dự trù"}, { type: "danger", delay: 1000 });
                    return false;
                }
                var currentUser = gonrinApp().currentUser;
                if(currentUser && currentUser.donvi_id !== null){
                    self.model.set("donvi_id", currentUser.donvi_id);
                    // self.model.set("donvi", currentUser.donvi);
                }
				self.getApp().showloading();
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
                        self.getApp().hideloading();  
                        self.close();
                    }
                });
                
            });
        },
        check_tonkho_dutru : function(){
            var self = this;
            var params = JSON.stringify(self.model.toJSON());
            var url = (self.getApp().serviceURL || "") + '/api/v1/check_tonkho_dutru_custom';
			self.getApp().showloading();
            $.ajax({
                url: url,
                type: 'POST',
                dataType:"json",
                data: params,
                headers: {
                    'content-type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                success: function(response) {
                    self.getApp().hideloading();
                    if (!!response && !! response.objects){
                        self.$el.find(".number-disabled").removeClass("d-none");
                        self.model.set({
                            "ton_ky_truoc" : response.objects.ton_ky_truoc,
                            "nhap_trong_ky" : response.objects.nhap_trong_ky,
                            "xuat_trong_ky" : response.objects.xuat_trong_ky,
                            "tong_cuoi_ky" : response.objects.tong_cuoi_ky
                        })
                    }
                    else{
                        self.$el.find(".number-disabled").addClass("d-none");
                    }
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
                        self.getApp().notify({ message: "Có lỗi xảy ra, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
                    }
                },

            });
        }
    });

});