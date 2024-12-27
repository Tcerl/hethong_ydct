define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/view/quanlyCanbo/DonViCungUng/AdminCreateDonvi/tpl/model.html'),
		schema 				= require('json!app/view/quanlyCanbo/DonViCungUng/AdminCreateDonvi/DonViCungUngSchema.json');
	var TinhThanhSelectView 	= require("app/danhmuc/danhmuc_dungchung/TinhThanh/SelectView");
    var QuanHuyenSelectView 	= require("app/danhmuc/danhmuc_dungchung/QuanHuyen/SelectView");
	var XaPhuongSelectView 	= require("app/danhmuc/danhmuc_dungchung/XaPhuong/SelectView");
	return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "admin/donvi/create",
    	tools : [
			{
				name: "back",
				type: "button",
				buttonClass: "btn-secondary width-sm",
				label: "TRANSLATE:BACK",
				command: function(){
					var self = this;
					Backbone.history.history.back();  
				}
			},
			{
				name: "save",
				type: "button",
				buttonClass: "btn-primary width-sm ml-2 taodonvi",
				label: "TRANSLATE:SAVE",
				visible: function () {
					return (this.getApp().hasRole('admin_donvi') ===true || this.getApp().hasRole('admin') ===true);
				},
				command: function(){
					var self = this;
					var curUser = self.getApp().currentUser;
					if (curUser) {
						self.model.set("created_by",curUser.id);
					}
					var donvi_ten = self.model.get("donvi_ten"),
						email = self.model.get("email"),
						donvi_email = self.model.get("donvi_email"),
						hoten = self.model.get("hoten"),
						dienthoai = self.model.get("dienthoai"),
						pass = self.model.get("password"),
						ma_don_vi = self.model.get("donvi_ma_coso"),
						cfpass = self.model.get("cfpassword");
					if (hoten == null || hoten == "" ||hoten == undefined) {
						self.getApp().notify({ message: "Tên người dùng không được để trống!" }, { type: "danger" });
						return
					}
					
					if  (dienthoai == null || dienthoai == ""){
						self.getApp().notify({ message: "Số điện thoại người dùng không được để trống!" }, { type: "danger" });
						return
					}
					if  (email == null || email == ""){
						self.getApp().notify({ message: "Email người dùng không được để trống!" }, { type: "danger" });
						return
					} else {
						self.model.set("email",email.toLowerCase());
					}

					if (!!donvi_email) {
						self.model.set("donvi_email",donvi_email.toLowerCase());
					}
					
					if (pass == null || pass == "") {
						self.getApp().notify({ message: "Mật khẩu không được để trống!" }, { type: "danger" });
						return
					}
					if (pass == null || pass != cfpass) {
						self.getApp().notify({ message: "Xác nhận mật khẩu không đúng, vui lòng kiểm tra lại!" }, { type: "danger" });
						return
					}
					if  (donvi_ten == null || donvi_ten == ""){
						self.getApp().notify({ message: "Tên đơn vị không được để trống!" }, { type: "danger" });
						return
					}
					if (ma_don_vi === undefined || ma_don_vi === null){
						self.getApp().notify({message : "Vui lòng nhập mã đon vị."}, {"type" : "danger"});
						return false;
					}
					self.model.set("hoten",hoten.toUpperCase());
					self.model.set("donvi_ten",donvi_ten.toUpperCase());
					var tinhthanh_id = self.model.get("tinhthanh_id");
					if (tinhthanh_id === undefined || tinhthanh_id === null || tinhthanh_id ===""){
						self.getApp().notify({message : "Vui lòng chọn tỉnh thành cho đơn vị cung ứng."}, {type : "danger", delay : 3000});
						return false;
					}
					self.model.set("donvi_loai_donvi", 2);
					self.model.save(null,{
						success: function (model, respose, options) {
							self.getApp().notify("Tạo đơn vị thành công!");
							self.getApp().getRouter().navigate('admin/donvicungung/collection');
						},
						error: function (xhr, status, error) {
							self.getApp().notify({ message: status.responseJSON.error_message}, { type: "danger", delay: 1000});
						}
					});
				}
			},
 	    ],
	 	uiControl: {
			fields:[
				{
					field:"tinhthanh",
					uicontrol:"ref",
					foreignRemoteField:"id",
					foreignField:"tinhthanh_id",
					dataSource:TinhThanhSelectView
				},
				{
					field:"quanhuyen",
					uicontrol:"ref",
					foreignRemoteField:"id",
					foreignField:"quanhuyen_id",
					dataSource:QuanHuyenSelectView
				},
				{
					field:"xaphuong",
					uicontrol:"ref",
					foreignRemoteField:"id",
					foreignField:"xaphuong_id",
					dataSource:XaPhuongSelectView
				},
				{
					field: "donvi_loai_donvi", 
					uicontrol: "combobox",
					textField: "text",
					valueField: "value",
					dataSource: [
						{ value: 1, text: "Đơn vị Y tế" },
						{ value: 2, text: "Đơn vị Cung ứng" }
					],
			 	},
			]
		},
    	render:function(){
			var self = this;
			self.applyBindings();
			self.validate_password();
			var curUsr = self.getApp().currentUser;
			self.model.on("change:tinhthanh", function() {
				var filterobj = {"tinhthanh_id": {"$eq": self.model.get("tinhthanh_id")}}; 
				self.getFieldElement("quanhuyen").data("gonrin").setFilters(filterobj);
				self.model.set({"quanhuyen":null,"xaphuong":null});
			});
			self.model.on("change:quanhuyen", function() {
				var filterobj = {"quanhuyen_id": {"$eq": self.model.get("quanhuyen_id")}}; 
				self.getFieldElement("xaphuong").data("gonrin").setFilters(filterobj);
				self.model.set({"xaphuong":null});
			});
			self.model.set("donvi_loai_donvi", 2);
			
		},
		validate_password: function() {
			var self = this;
			self.model.on("change:cfpassword", function() {
				var pwd = self.model.get('password');
				var confirm_pwd = self.model.get('cfpassword');
				if (pwd !==null && pwd !== "" && pwd !== undefined && pwd !== confirm_pwd) {
					self.getApp().notify({ message: "Mật khẩu không khớp.Vui lòng nhập lại!" }, { type: "danger" });
				}
			});
            self.model.on("change:password", function() {
				var pwd = self.model.get('password');

				var confirm_pwd = self.model.get('cfpassword');
				if (confirm_pwd !== null && confirm_pwd !== "" && confirm_pwd !== undefined && pwd !== confirm_pwd) {
					self.getApp().notify({ message: "Mật khẩu không khớp.Vui lòng nhập lại!" }, { type: "danger" });
				}
			});
		},
		disabled_select_captren: function(status = 0) {
			var self = this;
			if (status == 1) {
				self.$el.find("#donvicaptren").prop('disabled', false);
			} else {
				self.$el.find("#donvicaptren").prop('disabled', true);
			}
		},
		valiedate_tuyendonvi: function() {
			var self = this;
			var tuyendonvi_id = self.model.get("donvi_tuyendonvi_id"),
				tinhthanh = self.model.get("tinhthanh"),
				quanhuyen = self.model.get("quanhuyen"),
				xaphuong = self.model.get("xaphuong");
			if ((tuyendonvi_id == "7" || tuyendonvi_id == "6" || tuyendonvi_id == "5") && (tinhthanh == null || tinhthanh == undefined)) {
				self.getApp().notify({ message: "Vui lòng chọn Tỉnh/Thành phố "}, { type: "danger" });
				return false;
			}
			else if ((tuyendonvi_id == "4" || tuyendonvi_id == "3") && (quanhuyen == null || quanhuyen == undefined) ) {
				if (tinhthanh == null || tinhthanh == undefined) {
					self.getApp().notify({ message: "Vui lòng chọn Tỉnh/Thành phố!" }, { type: "danger" });
					return false
				}
				else {
					self.getApp().notify({ message: "Vui lòng chọn Quận/Huyện!" }, { type: "danger" });
					return false
				}
			}
			else if ((tuyendonvi_id == "2" || tuyendonvi_id == "1") && (xaphuong == null || xaphuong == undefined)) {
				if (tinhthanh == null || tinhthanh == undefined) {
					self.getApp().notify({ message: "Vui lòng chọn Tỉnh/Thành phố!" }, { type: "danger" });
					return false;

				} else if (quanhuyen == null || quanhuyen == undefined) {
					self.getApp().notify({ message: "Vui lòng chọn Quận/Huyện!" }, { type: "danger" });
					return false;

				} else {
					self.getApp().notify({ message: "Vui lòng chọn  Xã/Phường!" }, { type: "danger" });
					return false;
				}
			};
			return true;
		},
		select_tuyendonvi: function (obj) {
			var self = this;
			console.log("obj=============", obj);
			if (obj.tuyendonvi_id == "1" || obj.tuyendonvi_id == "2") {
				self.getApp().notify("Bạn không có quyền tạo đơn vị!");
				self.$el.find(".taodonvi").hide();
				self.getApp().getRouter().navigate('canbo/donvi/collection');
			}
			self.model.on("change:tinhthanh", function () {
				var filterobj = { "tinhthanh_id": { "$eq": self.model.get("tinhthanh_id") } };
				self.getFieldElement("quanhuyen").data("gonrin").setFilters(filterobj);
				self.model.set({ "quanhuyen": null, "xaphuong": null });
			});
			self.model.on("change:quanhuyen", function () {
				var filterobj = { "quanhuyen_id": { "$eq": self.model.get("quanhuyen_id") } };
				self.getFieldElement("xaphuong").data("gonrin").setFilters(filterobj);
				self.model.set({ "xaphuong": null });
			});
			self.model.on("change", function () {
				var donvi_tuyendonvi_id = obj.tuyendonvi_id;
				console.log("tuyendonvi_id", donvi_tuyendonvi_id);
				if (donvi_tuyendonvi_id == "7") {
					console.log("abc=====", donvi_tuyendonvi_id);
					var filters = {
						"$or": [
							{ "id": { "$eq": "5" } },
							{ "id": { "$eq": "6" } },
						]
					};
					self.getFieldElement("donvi_tuyendonvi").data("gonrin").setFilters(filters);
				}
				else if (donvi_tuyendonvi_id == "5" || donvi_tuyendonvi_id == "6") {
					var filters = {
						"$or": [
							{ "id": { "$eq": "4" } },
							{ "id": { "$eq": "3" } }
						]
					};
					self.getFieldElement("donvi_tuyendonvi").data("gonrin").setFilters(filters);
				}
				else if (donvi_tuyendonvi_id == "4" || donvi_tuyendonvi_id == "3") {
					self.model.set("tinhthanh", obj.tinhthanh);
					self.$el.find("#matinhthanh").prop("disabled", false);
					var filters = {
						"$or": [
							{ "id": { "$eq": "1" } },
							{ "id": { "$eq": "2" } },
						]
					};
					self.getFieldElement("donvi_tuyendonvi").data("gonrin").setFilters(filters);
				} 
			});
		},
		setDonviCaptren: function (donvi_id) {
			var self = this;
			if (donvi_id == undefined || donvi_id == null || donvi_id == "") {
				return false;
			}
			var url = self.getApp().serviceURL + "/api/v1/donvi/" + donvi_id;
			$.ajax({
				url: url,
				method: "GET",
				contentType: "application/json",
				success: function (obj) {
					self.select_tuyendonvi(obj);
					self.model.set("captren", obj);
					self.$el.find("#donvicaptren").prop("disabled", true);
				},
				error: function (xhr, status, error) {
					try {
						if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED") {
							self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
							self.getApp().getRouter().navigate("login");
						} else {
							self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
						}
					}
					catch (err) {
						self.getApp().notify({ message: "Lỗi truy cập dữ liệu, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
					}
				},
			});
			self.applyBindings();
			self.validate_password();
		},
    });
});