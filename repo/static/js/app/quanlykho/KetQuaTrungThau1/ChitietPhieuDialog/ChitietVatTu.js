define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/quanlykho/KetQuaTrungThau1/ChitietPhieuDialog/tpl/model.html'),
        schema 				= require('json!schema/KetQuaTrungThauChiTietSchema.json');
	var DonViCungUngSelectView = require('app/danhmuc/danhmuc_donvi/DonViCungUng/SelectView');

    return Gonrin.ModelDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
        collectionName: "ketquathau_chitiet",
        bindings:"data-ketqua_trungthau_chitiet",
        check_setdata: false,
        hasViewData: false,
        loadData : true,
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
                var viewData_ketqua_trungthau_id = self.viewData.ketqua_trungthau_id;
                if (viewData_ketqua_trungthau_id == null || viewData_ketqua_trungthau_id == undefined) {
                    self.getApp().notify({message: "Tham số không hợp lệ"}, {type: "danger", delay: 5000});
                    self.close();
                    return;
                }
                self.model.set({
                    "ketqua_trungthau_id": viewData_ketqua_trungthau_id,
                    "ma_goi_thau": self.viewData.ma_goi_thau,
                    "ten_goi_thau": self.viewData.ten_goi_thau,
                    "loai_goi_thau": self.viewData.loai_goi_thau,
                    "thuoc_goi_thau":self.viewData.thuoc_goi_thau,
                    "thoigian_trungthau":self.viewData.thoigian_trungthau,
                    "thoigian_batdau" : self.viewData.thoigian_batdau,
                    "thoigian_ketthuc" : self.viewData.thoigian_ketthuc,
                    "nam_ke_hoach" : self.viewData.nam_ke_hoach,
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
                                    "ten_khoa_hoc" : obj.ten_khoa_hoc,
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
            self.render_donvi_cungung();
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
                var so_luong_ke_hoach = self.model.get("so_luong_ke_hoach");
                if (!so_luong_ke_hoach || so_luong_ke_hoach == null || so_luong_ke_hoach == undefined || so_luong_ke_hoach == "") {
                    self.getApp().notify({ message: "Vui lòng nhập số lượng theo kế hoạch"}, { type: "danger", delay: 1000 });
                    return;
                }
                var so_luong_thucte = self.model.get("so_luong_thucte");
                if (!so_luong_thucte || so_luong_thucte == null || so_luong_thucte == undefined || so_luong_thucte == "") {
                    self.getApp().notify({ message: "Vui lòng nhập số lượng thực tế"}, { type: "danger", delay: 1000 });
                    return;
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
        render_donvi_cungung: function(){
			var self = this;
			var $selectize = self.$el.find('#selectize-donvi-cungung').selectize({
                valueField: 'id',
                labelField: 'ten_coso',
				searchField: ['ten_coso', 'tenkhongdau'],
				preload: true,
				maxOptions : 10,
				maxItems : 1,
                load: function(query, callback) {
                    var query_filter = {"filters": {"$and": [
                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                        { "ten_coso": { "$likeI": gonrinApp().convert_khongdau(query) } },
                        {"$or": [
                            { "loai_donvi": { "$eq": 2} },
                            { "loai_donvi": { "$eq": 5} },
                            { "loai_donvi": { "$eq": 6} },
                            { "loai_donvi": { "$eq": 7} },
                            { "loai_donvi": { "$eq": 8} },
                            { "loai_donvi": { "$eq": 9} }
                        ]}
                        ]}};
					var url = (self.getApp().serviceURL || "") + '/api/v1/donvi?' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
							callback(res.objects);
							var ma_donvi_cungung = self.model.get("ma_donvi_cungung");
							if (ma_donvi_cungung !== undefined && ma_donvi_cungung !== null){
								$selectize[0].selectize.setValue([ma_donvi_cungung]);
							}
                        }
                    });
                },
                onChange: function(value, isOnInitialize) {
					var $selectz = (self.$el.find('#selectize-donvi-cungung'))[0];
					var obj = $selectz.selectize.options[value];
					if (obj !== undefined && obj !== null){
                        delete obj.$order;
						self.model.set("donvi_cungung", obj);
						var ten_donvi_cungung = obj.ten_coso;
						if (ten_donvi_cungung !== undefined && ten_donvi_cungung !== null && ten_donvi_cungung !== ""){
							self.model.set("ten_donvi_cungung", ten_donvi_cungung);
						}
						var ma_donvi_cungung = obj.id;
						if (ma_donvi_cungung !== undefined && ma_donvi_cungung !== null && ma_donvi_cungung !== ""){
							self.model.set("ma_donvi_cungung", ma_donvi_cungung);
						}
					}
					else{
						self.model.set("donvi_cungung", null);
						self.model.set("ten_donvi_cungung", null);
						self.model.set("ma_donvi_cungung", null);
					}
                }
            });
		},
    });

});