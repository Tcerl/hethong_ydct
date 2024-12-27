define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
	var template 				= require('text!app/view/quanlykhaithac/tpl/newmodel.html'),
	schema 				= require('json!schema/ChiTieuDanhGiaDuocLieuGACPSchema.json');

    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
		collectionName: "chitieu_gacp",
		checkId: false,
		checkCreateButton: false,
    	tools : [
			{
				name: "back",
				type: "button",
				buttonClass: "btn-primary width-sm ml-2",
				label: "Quản lý quá trình khai thác",
				command: function(){
					var self = this;
					let nuoitrong_khaithac_id = self.getApp().getRouter().getParam("id");
					if (!nuoitrong_khaithac_id){
						nuoitrong_khaithac_id = self.model.get("nuoitrong_khaithac_id");
						if (!!nuoitrong_khaithac_id){
							let path = "khaithac_tunhien/model??id=" + nuoitrong_khaithac_id;
							self.getApp().getRouter().navigate(path);
						}
					}
					else{
						self.getApp().getRouter().refresh();					
					}							
				}
			},
			{
				name: "save",
				type: "button",
				buttonClass: "btn-success btn-save width-sm ml-2 d-none",
				label: "TRANSLATE:SAVE",
				visible: function(){
					return (this.getApp().hasRole("admin_donvi") || this.getApp().hasRole("canbo"));
				},
				command: function(){
					var self = this;
					self.setNullModel();
					self.register();
					self.model.set("loai_nuoitrong_khaithac",2);
					self.getApp().showloading();
					self.model.save(null,{
						success: function (model, respose, options) {
							self.getApp().hideloading();
							self.getApp().notify("Lưu thông tin thành công");
							// self.getApp().getRouter().refresh();	
							if (self.checkId === false  && self.checkCreateButton === false){
								self.checkCreateButton = true;
								self.model.set(respose);
								self.$el.find(".toolbar").append(`<button type="button" btn-name="xacnhan" class="btn btn-info width-sm btn-xacnhan ml-2">Gửi duyệt</button>`);
								self.$el.find(".toolbar").append(`<button type="button" btn-name="print" class="btn btn-primary width-sm btn-print ml-2">In phiếu</button>`);
								self.$el.find(".btn-xacnhan").unbind("click").bind("click", ()=>{
									self.xacNhan();
								});
								self.$el.find(".btn-print").unbind("click").bind("click", ()=>{
									self.inPhieu();
								});
								self.$el.find(".btn-delete").removeClass("d-none");
							}
							else{
								self.model.set(respose);
							}						
						},
						error: function (xhr, status, error) {
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
								self.getApp().notify({ message: "Lưu thông tin không thành công"}, { type: "danger", delay: 1000 });
							}
						}
					});
				}
			},
			{
				name: "delete",
				type: "button",
				buttonClass: "btn-danger btn-delete width-sm ml-2 d-none",
				label: "TRANSLATE:DELETE",
				visible: function(){
					return (this.getApp().getRouter().getParam("id") !== null && (this.getApp().hasRole("admin_donvi") || this.getApp().hasRole("canbo")));
				},
				command: function(){
					var self = this;
					self.getApp().showloading();
					self.model.destroy({
						success: function(model, response) {
							self.getApp().hideloading();
							self.getApp().notify('Xoá dữ liệu thành công');
							let nuoitrong_khaithac_id = self.getApp().getRouter().getParam("id");
							if (!nuoitrong_khaithac_id){
								nuoitrong_khaithac_id = self.model.get("nuoitrong_khaithac_id");
								if (!!nuoitrong_khaithac_id){
									let path = "khaithac_tunhien/model??id=" + nuoitrong_khaithac_id;
									self.getApp().getRouter().navigate(path);
								}
							}
							else{
								self.getApp().getRouter().refresh();					
							}							
						},
						error: function (xhr, status, error) {
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
								self.getApp().notify({ message: "Lưu thông tin không thành công"}, { type: "danger", delay: 1000 });
							}
						}
					});
				}
			},
			{
				name: "xacnhan",
				type: "button",
				buttonClass: "btn-info btn-xacnhan width-sm ml-2 d-none",
				label: "Gửi duyệt",
				visible: function(){
					return (this.getApp().getRouter().getParam("id") !== null && (this.getApp().hasRole("admin_donvi") || this.getApp().hasRole("canbo")));
				},
				command: function(){
					var self = this;
					self.xacNhan();
				}
			},
			{
				name: "print",
				type: "button",
				buttonClass: "btn-primary btn-print ml-1",
				label: "In phiếu",
				visible: function(){
					return (this.getApp().getRouter().getParam("id") !== null && (this.getApp().hasRole("admin_donvi") || this.getApp().hasRole("canbo")));
				},
				command: function(){
					var self = this;
					self.inPhieu();
				}
			},
		],
		uiControl: {
			fields: [
			]
		},
    	render:function() {
			var self = this;
			self.checkId = false;
			self.checkCreateButton = false;
			let viewData = self.viewData;
			if (!!viewData){
				self.renderSanpham(viewData.sanpham);
				let nuoitrong_khaithac_id = viewData.nuoitrong_khaithac_id;
				let id_sanpham = viewData.id_sanpham;
				if (!!nuoitrong_khaithac_id && !! id_sanpham){
					self.getData(nuoitrong_khaithac_id, id_sanpham);
				}
			}
    		self.applyBindings();

		},
		register : function(){
			var self = this;
			let element = self.$el.find("input[type='radio']:checked");
			let length = element.length;
			for (let i=0; i<length; i++){
				let elt = element[i];
				let item =  $(elt).attr("name");
				let val = $(elt).val();
				if (val === "1" || val === "0"){
					self.model.set(item, Number(val));
				}
			}
		},
		loadData : function(object){
			var self = this;
			if (!!object && typeof(object) === "object"){
				let listKey = Object.keys(object);
				let length = listKey.length;
				for (let i=0; i<length; i++){
					let key = listKey[i];
					let val = self.model.get(key);
					if (val===0 || val === 1){
						val = Number(val).toString();
					}
					self.$el.find(`input[name="${key}"][value="${val}"]`).prop("checked", true);
				}
			}
		},
		getData : function(nuoitrong_khaithac_id, id_sanpham){
			var self = this;
			let query_filter ={"filters" : {"$and":[
				{"nuoitrong_khaithac_id" : {"$eq" : nuoitrong_khaithac_id}},
				{"deleted": {"$eq": false}}
			]} }  
			self.getApp().showloading();
			$.ajax({
				url: (self.getApp().serviceURL || "") + `/api/v1/chitieu_gacp?results_per_page=20` + (query_filter? "&q=" + JSON.stringify(query_filter): ""),
				dataType: "json",
				contentType: "application/json",
				method: 'GET',
				success: function(response) {
					self.getApp().hideloading();
					let objs = response.objects;
					if (Array.isArray(objs) === true && objs.length >0){
						self.checkId = true;
						self.model.set(objs[0]);
						self.applyBindings();
						let obj = self.model.toJSON();
						self.loadData(obj);
						self.setHeightTextarea();
						self.registerElementTd();
						self.checkTrangThai();
					}
					else{
						self.model.set({
							"nuoitrong_khaithac_id": nuoitrong_khaithac_id,
							"id_sanpham":id_sanpham,
							"loai_nuoitrong_khaithac":2 // nuôi trồng
						});
						self.$el.find(".btn-xacnhan,.btn-print").remove();
						self.$el.find(".btn-delete").addClass("d-none");
						self.$el.find(".btn-save").removeClass("d-none");
						self.applyBindings();
						self.registerElementTd();
						self.setHeightTextarea();
					}
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
			});
		},
		setHeightTextarea: function(){
			var self = this;
			let element = self.$el.find("td textarea");
			let length = element.length;
			for (let i=0; i<length; i++){
				let elt = element[i];
				let height = $(elt).parent().height();
				elt.style.height = height + "px";
			}
		},
		registerElementTd: function(){
			var self = this;
			let element = self.$el.find("input[type='radio']");
			let length = element.length;
			for (let i=0; i<length; i++){
				let elt = element[i];
				$(elt).unbind("click").bind("click", (event)=>{
					event.stopPropagation();
				})
				let elt_td = $(elt).parent();
				$(elt_td).unbind("click").bind("click", {data : elt}, (event)=>{
					event.stopPropagation();
					if (!!event.data.data){
						let tmp = event.data.data;
						let check = $(tmp).prop("checked");
						$(tmp).prop("checked", !check);
					}
				})
			}
		},
		setNullModel : function(){
			var self = this;
			let element = self.$el.find("input[type='radio'][value='1']");
			let length = element.length;
			for (let i=0; i<length; i++){
				let elt = element[i];
				let elt_name = $(elt).attr("name");
				self.model.set(elt_name, null);
			}
		},
		renderSanpham: function(sanpham){
			var self = this;
			if (!!sanpham){
				let ten_sanpham = sanpham.ten_sanpham;
				let ten_khoa_hoc = sanpham.ten_khoa_hoc;
				let ma_viettat = sanpham.ma_viettat;
				let bophan_sudung = sanpham.bophan_sudung;
				self.$el.find(".ten_sanpham").text(ten_sanpham);
				self.$el.find(".ten_khoa_hoc").text(ten_khoa_hoc);
				self.$el.find(".ma_viettat").text(ma_viettat);
				self.$el.find(".bophan_sudung").text(bophan_sudung);
			}
		},
		xacNhan : function(){
			var self = this;
			let params = {
				id : self.model.get("id")
			}
			self.getApp().showloading();
			$.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/xacnhan_gacp',
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
		checkTrangThai : function(){
			var self = this;
			let trangthai = self.model.get("trangthai");
			if (trangthai === 2 || trangthai === 3){
				self.$el.find("input").prop("disabled", true);
				self.$el.find("textarea,td").attr("style", "pointer-events:none");
				self.$el.find(".btn-delete,.btn-save,.btn-xacnhan").remove();
			}
			else{
				self.$el.find(".btn-delete,.btn-save,.btn-xacnhan").removeClass("d-none");
			}
		},
		inPhieu: function(){
			var self = this;
			var params = JSON.stringify({
				"id": self.model.get("id"),
				"loai_nuoitrong_khaithac": self.model.get("loai_nuoitrong_khaithac")
			});
			self.getApp().showloading();
			$.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/export_pdf_gacp',
				dataType: "json",
				contentType: "application/json",
				method: 'POST',
				data: params,
				success: function(response) {
					self.getApp().hideloading();
					window.open(response, "_blank");
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
						self.getApp().notify({ message: "In không thành công, vui lòng thử lại."}, { type: "danger", delay: 1000 });
					}
				},
			});
		}
	});
});