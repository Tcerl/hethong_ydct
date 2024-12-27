define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/danhmuc/danhmuc_dungchung/CosoYte/tpl/model.html'),
		schema 				= require('json!schema/CoSoYTeSchema.json');
	// var TinhThanhSelectView = require('app/view/DanhMuc/TinhThanh/SelectView');
	var TinhThanhSelectView 	= require("app/danhmuc/danhmuc_dungchung/TinhThanh/SelectView");
    var QuanHuyenSelectView 	= require("app/danhmuc/danhmuc_dungchung/QuanHuyen/SelectView");
    var XaPhuongSelectView 	= require("app/danhmuc/danhmuc_dungchung/XaPhuong/SelectView");
    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
		collectionName: "cosoyte",
		uiControl: {
			fields: [
				{
					field: "xaphuong",
					uicontrol: "ref",
					textField: "ten",
					foreignRemoteField: "id",
					foreignField: "xaphuong_id",
					dataSource: XaPhuongSelectView
				},
				{
					field: "quanhuyen",
					uicontrol: "ref",
					textField: "ten",
					foreignRemoteField: "id",
					foreignField: "quanhuyen_id",
					dataSource: QuanHuyenSelectView
				},
				{
					field: "tinhthanh",
					uicontrol: "ref",
					textField: "ten",
					foreignRemoteField: "id",
					foreignField: "tinhthanh_id",
					dataSource: TinhThanhSelectView
				},
			]
		},
    	tools : [
			{
				name: "back",
				type: "button",
				buttonClass: "btn-secondary width-sm ml-2",
				label: "TRANSLATE:BACK",
				command: function(){
					var self = this;
					
					Backbone.history.history.back();
				}
			},
			{
				name: "save",
				type: "button",
				buttonClass: "btn-success width-sm ml-2",
				label: "TRANSLATE:SAVE",
				visible: function(){
					return this.getApp().hasRole("admin");
				},
				command: function(){
					var self = this;
					var ten = self.model.get("ten");
					if (!ten || ten == null || ten == undefined || ten == "") {
						self.getApp().notify({ message: "Tên cơ sở y tế không được để trống." }, { type: "danger", delay: 5000 });
						return;
					} else {
						self.model.set("tenkhongdau", gonrinApp().convert_khongdau(ten));
					}
					var ma_coso = self.model.get("ma_coso");
					if (!ma_coso || ma_coso == null || ma_coso == undefined || ma_coso == "") {
						self.getApp().notify({ message: "Vui nhập mã cơ sở khám chữa bệnh." }, { type: "danger", delay: 5000 });
						return;
					}
					self.model.save(null,{
						success: function (model, respose, options) {
							self.getApp().notify("Lưu thông tin thành công");
							self.getApp().getRouter().navigate(self.collectionName + "/collection");
							
						},
						error: function (xhr, status, error) {
							try {
								if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
									self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
									self.getApp().getRouter().navigate("login");
								} else {
								self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
								}
							}
							catch (err) {
								self.getApp().notify({ message: "Lưu thông tin không thành công"}, { type: "danger", delay: 1000 });
							}
						}
					});
				}
			},
			{
				name: "delete",
				type: "button",
				buttonClass: "btn-danger width-sm ml-2",
				label: "TRANSLATE:DELETE",
				visible: function(){
					return (this.getApp().getRouter().getParam("id") !== null && this.getApp().hasRole("admin"));
				},
				command: function(){
					var self = this;
					self.model.destroy({
						success: function(model, response) {
							self.getApp().notify('Xoá dữ liệu thành công');
							self.getApp().getRouter().navigate(self.collectionName + "/collection");
						},
						error: function (xhr, status, error) {
							try {
								if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
									self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
									self.getApp().getRouter().navigate("login");
								} else {
								self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
								}
							}
							catch (err) {
								self.getApp().notify({ message: "Lưu thông tin không thành công"}, { type: "danger", delay: 1000 });
							}
						}
					});
				}
			},
		],
		// uiControl: {
		// 	fields: [
		// 		{
		// 			field: "donvitinh",
		// 			uicontrol: "combobox",
		// 			textField: "text",
		// 			valueField: "value",
		// 			cssClass: "form-control",
		// 			dataSource: danhmuc_donvitinh
		// 		},
		// 		{
		// 			field: "loai_vattu",
		// 			uicontrol: "combobox",
		// 			textField: "text",
		// 			valueField: "value",
		// 			cssClass: "form-control",
		// 			dataSource: [
		// 				{"value": 1, "text": "Tân dược"},
		// 				{"value": 2, "text": "Chế phẩm YHCT"},
		// 				{"value": 3, "text": "Vị thuốc YHCT"},
		// 				{"value": 4, "text": "Phóng xạ"},
		// 				{"value": 5, "text": "Tân dược tự bào chế"},
		// 				{"value": 6, "text": "Chế phẩm YHCT tự bào chế"},
		// 			]
		// 		},
		// 	]
		// },
    	render:function() {
    		var self = this;
    		var id = this.getApp().getRouter().getParam("id");
    		if(id){
    			//progresbar quay quay
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data){
						self.applyBindings();
						self.model.set("diachi", self.getApp().convert_diachi(self.model.get("diachi"), self.model.get("tinhthanh"), self.model.get("quanhuyen"), self.model.get("xaphuong")));
        			},
        			error:function() {
    					self.getApp().notify("Get data Eror");
    				},
        		});
    		}else{
    			self.applyBindings();
    		}
		},
	});

});