const { zip } = require('underscore');

define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/quanlykho/BaoCaoKho/tpl/model.html'),
	schema 				= require('json!schema/BaoCaoKhoSchema.json');
	var DanhMucSelectView = require('app/quanlykho/DanhMucKho/SelectView');
	var ChitietVattu = require('app/quanlykho/BaoCaoKho/ChitietItemView');
	var ChitietVattu_TG_NK = require("app/quanlykho/BaoCaoKho/ChitietItemView_tg_nk")


    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "baocaokho",
    	state: null,
    	tools : [
    	    {
    	    	name: "defaultgr",
    	    	type: "group",
    	    	groupClass: "toolbar-group",
    	    	buttons: [
					{
						name: "back",
						type: "button",
						buttonClass: "btn-secondary waves-effect width-sm",
						label: "TRANSLATE:BACK",
						command: function(){
							var self = this;
							Backbone.history.history.back();
						}
					},
					{
		    	    	name: "save",
		    	    	type: "button",
		    	    	buttonClass: "btn-success width-sm ml-2 btn-update",
		    	    	label: "TRANSLATE:SAVE",
		    	    	command: function(){
							var self = this;
							
							var bao_cao_all_kho = self.model.get("bao_cao_tat_ca_kho");
							if(bao_cao_all_kho != 1){
								var kho = self.model.get("kho");
								if (kho != null && kho != undefined) {
									self.model.set({
										"ma_kho": kho.id,
										"ten_kho" : kho.ten_kho
									});
									
								}
								self.model.set("bao_cao_tat_ca_kho",0);
							}

							var loai_ky_bao_cao = self.model.get("loai_ky_bao_cao");
							if (!loai_ky_bao_cao || loai_ky_bao_cao == null || loai_ky_bao_cao == undefined) {
								self.getApp().notify({message: "Vui lòng chọn loại kỳ báo cáo"}, {type: "danger", delay: 3000});
								return false;
							} else if (loai_ky_bao_cao == 1) {//khoang thoi gian
								var ngay_bat_dau = self.model.get("ngay_bat_dau");
								var ngay_ket_thuc = self.model.get("ngay_ket_thuc");
								if(ngay_bat_dau == null || ngay_bat_dau == undefined){
									self.getApp().notify({message: "Vui lòng chọn ngày bắt đầu"}, {type: "danger", delay: 3000});
									return false;
								}
								if(ngay_ket_thuc == null || ngay_ket_thuc == undefined){
									self.getApp().notify({message: "Vui lòng chọn ngày kết thúc"}, {type: "danger", delay: 3000});
									return false;
								}
							} else if (loai_ky_bao_cao == 2 || loai_ky_bao_cao ==3){//thang, quy
								var ky_bao_cao = self.model.get("ky_bao_cao");
								if(ky_bao_cao == null || ky_bao_cao == undefined){
									self.getApp().notify({message: "Vui lòng chọn kỳ báo cáo"}, {type: "danger", delay: 3000});
									return;
								}
								var nam_bao_cao = self.model.get("nam_bao_cao");
								if(nam_bao_cao == null || nam_bao_cao == undefined){
									self.getApp().notify({message: "Vui lòng nhập năm báo cáo"}, {type: "danger", delay: 3000});
									return;
								}
				
								if (loai_ky_bao_cao == 2){
									var firstDay = new Date(nam_bao_cao, ky_bao_cao -1, 1);
									var lastDay = new Date(nam_bao_cao, ky_bao_cao, 0);
									self.model.set("ngay_bat_dau", self.parse_date_custom(firstDay));
									self.model.set("ngay_ket_thuc",self.parse_date_custom((moment(lastDay).set({hour:23,minute:59,second:59}))));
								} else {
									var firstDay = null;
									var lastDay = null;
									if (ky_bao_cao == 1){
										firstDay = new Date(nam_bao_cao, 0, 1);
										lastDay = new Date(nam_bao_cao, 2, 31);
									}else if (ky_bao_cao == 2){
										firstDay = new Date(nam_bao_cao, 3, 1);
										lastDay = new Date(nam_bao_cao, 5, 30);
									}else if (ky_bao_cao == 3){
										firstDay = new Date(nam_bao_cao, 6, 1);
										lastDay = new Date(nam_bao_cao, 8, 30);
									}else{
										firstDay = new Date(nam_bao_cao, 9, 1);
										lastDay = new Date(nam_bao_cao, 11, 31);
									}
									self.model.set("ngay_bat_dau", self.parse_date_custom(firstDay));
									self.model.set("ngay_ket_thuc",self.parse_date_custom((moment(lastDay).set({hour:23,minute:59,second:59}))));
								}
							} else if (loai_ky_bao_cao == 4){//nam
								var nam_bao_cao = self.model.get("nam_bao_cao");
								if(nam_bao_cao == null || nam_bao_cao == undefined){
									self.getApp().notify({message: "Vui lòng nhập năm báo cáo"}, {type: "danger", delay: 3000});
									return;
								}
								var firstDay = new Date(nam_bao_cao, 0, 1);
								var lastDay = new Date(nam_bao_cao, 11, 31);
								self.model.set("ngay_bat_dau", self.parse_date_custom(firstDay));
								self.model.set("ngay_ket_thuc",self.parse_date_custom((moment(lastDay).set({hour:23,minute:59,second:59}))));
				
							}
							if(self.model.get("ngay_bat_dau") === null || self.model.get("ngay_ket_thuc") === null){
								self.getApp().notify({message: "Vui lòng nhập kỳ báo cáo"}, {type: "danger", delay: 3000});
								return;
							}
							console.log("ngay_bat_dau =====",self.model.get("ngay_bat_dau"));
							console.log("ngay_ket_thuc =====",self.model.get("ngay_ket_thuc"));
							self.model.set("ten_nguoi_bao_cao",gonrinApp().currentUser.hoten);
							self.model.set("ma_nguoi_bao_cao",gonrinApp().currentUser.id);
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
		    	    	buttonClass: "btn-danger width-sm ml-2 btn-delete",
		    	    	label: "TRANSLATE:DELETE",
		    	    	visible: function(){
							
		    	    		return this.getApp().getRouter().getParam("id") !== null;
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
					{
						name: "print",
						type: "button",
						buttonClass: "btn-secondary waves-effect width-sm  ml-2",
						label: "In Phiếu",
						command: function(){
							var self = this;
							Backbone.history.history.back();
						}
					},
    	    	],
    	    }],
    	    uiControl:{
        		fields:[
					{
						field:"active",
						uicontrol:"combobox",
						textField: "text",
						valueField: "value",
						cssClass:"form-control",
							dataSource: [
							{ value: 1, text: "Đang hoạt động" },
							{ value: 0, text: "ngừng hoạt động" },
						],
					},
					{
						field: "bao_cao_tat_ca_kho",
						uicontrol:"checkbox",
						textField: "text",
						valueField: "value",
						checkedField: "name",
						cssClassField: "cssClass",
						text:"Báo cáo cho tất cả các kho?",
						dataSource: [
							{name: true, value: 1, text: "Có" },
							{name: false, value: 0, text: "Không"},
					   ],
					   value:1
					},
					{
						field:"loai_ky_bao_cao",
						uicontrol:"combobox",
						textField: "text",
						valueField: "value",
						cssClass:"form-control",
							dataSource: [
							{ value: 1, text: "Theo khoảng thời gian" },
							{ value: 2, text: "Theo Tháng" },
							{ value: 3, text: "Theo Quý" },
							{ value: 4, text: "Theo Năm" }
						],
					},
					{
						field:"ky_bao_cao",
						uicontrol:"combobox",
						textField: "text",
						valueField: "value",
						cssClass:"form-control",
						dataSource: [
							{ value: 1, text: "Tháng 1" },
							{ value: 2, text: "Tháng 2" },
							{ value: 3, text: "Tháng 3" },
							{ value: 4, text: "Tháng 4" },
							{ value: 5, text: "Tháng 5" },
							{ value: 6, text: "Tháng 6" },
							{ value: 7, text: "Tháng 7" },
							{ value: 8, text: "Tháng 8" },
							{ value: 9, text: "Tháng 9" },
							{ value: 10, text: "Tháng 10" },
							{ value: 11, text: "Tháng 11" },
							{ value: 12, text: "Tháng 12" }
						],
					},
					{
						field:"kho",
						uicontrol:"ref",
						textField: "ten_kho",
						foreignRemoteField: "id",
						foreignField: "ma_kho",
						dataSource: DanhMucSelectView
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
						field:"ngay_bat_dau",
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
						field:"ngay_ket_thuc",
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
			var id = this.getApp().getRouter().getParam("id");
			
			
			self.model.set("bao_cao_tat_ca_kho",1);
    		if(id){
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data){

						self.applyBindings();
						self.check_option_visible();
        			},
        			error:function(){
    					self.getApp().notify(gonrinApp().traslate("TRANSLATE:error_load_data"));
					},
					complete:function(){
						
						self.renderItems();
						if(gonrinApp().currentUser.donvi_id !== self.model.get("donvi_id")){
							self.$el.find(".btn-update").addClass("d-none");
							self.$el.find(".btn-delete").addClass("d-none");
							self.$el.find(".congdon").addClass("d-none");
						}else{
							self.register_event(false);
						}
					}
        		});
    		} else {
				var currentDate = moment().utc();
				self.model.set("ngay_bao_cao", self.parse_date_custom(currentDate));
				self.model.set("nam_bao_cao",new Date().getFullYear());
				self.applyBindings();
				self.register_event(true);
				// self.$el.find('.table-vattu').hide();
				
    		}
    		
		},
		register_event: function(check_new){
			var self = this;
			
			self.model.on("change:loai_ky_bao_cao",function(){
				self.check_option_visible();
			});
			self.model.on("change:bao_cao_tat_ca_kho", function(){
				if(self.model.get("bao_cao_tat_ca_kho") == 1){
					self.model.set("kho",null);
					self.model.set("ma_kho",null);
					if(check_new === false){
						self.savePhieu(3);
					}
				}
			});
			self.model.on("change:kho",function(){
				var kho = self.model.get("kho");
				if (kho !== null && kho !== undefined) {
					if(self.model.get("bao_cao_tat_ca_kho") == 1){
						self.model.set("bao_cao_tat_ca_kho",0);
					}
					self.model.set({
						"ma_kho": kho.id,
						"ten_kho" : kho.ten_kho
					});
					if(check_new === false){
						self.savePhieu(3);
					}
				}

			});

			self.$el.find(".congdon").unbind("click").bind("click",function(e){
				e.stopPropagation();
				e.preventDefault();

				if(self.model.get("id") == undefined || self.model.get("id") == null){
					self.savePhieu(3);
				} else {
					self.congdon_solieu();
				}
				
			});
		},
		congdon_solieu: function(){
			var self = this;
			self.process_date();
			var url = (self.getApp().serviceURL || "") + '/api/v1/xuatnhapton/congdon';
			$.ajax({
				url: url,
				type: 'POST',
				data: JSON.stringify(self.model.toJSON()),
				headers: {
					'content-type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				},
				success: function(response) {
					self.model.set("chitiet_sanpham",response.data);
					self.renderItems();
					gonrinApp().notify("Cộng dồn thành công");
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
		},
		check_option_visible: function(){
			var self = this;
			var value = self.model.get("loai_ky_bao_cao");
			// { value: 1, text: "Theo khoảng thời gian" },
			// { value: 2, text: "Theo Tháng" },
			// { value: 3, text: "Theo Quý" },
			// { value: 4, text: "Theo Năm" }
			// .setDataSource(data);
			if(value === 1){
				self.$el.find(".tungay").removeClass("d-none");
				self.$el.find(".denngay").removeClass("d-none");
				self.$el.find(".nambaocao").addClass("d-none");
				self.$el.find(".kybaocao").addClass("d-none");
				
			}else if (value=== 2){
				self.$el.find(".tungay").addClass("d-none");
				self.$el.find(".denngay").addClass("d-none");
				self.$el.find(".nambaocao").removeClass("d-none");
				self.$el.find(".kybaocao").removeClass("d-none");
				var dataSource = [
					{ value: 1, text: "Tháng 1" },
					{ value: 2, text: "Tháng 2" },
					{ value: 3, text: "Tháng 3" },
					{ value: 4, text: "Tháng 4" },
					{ value: 5, text: "Tháng 5" },
					{ value: 6, text: "Tháng 6" },
					{ value: 7, text: "Tháng 7" },
					{ value: 8, text: "Tháng 8" },
					{ value: 9, text: "Tháng 9" },
					{ value: 10, text: "Tháng 10" },
					{ value: 11, text: "Tháng 11" },
					{ value: 12, text: "Tháng 12" }
				]
				self.getFieldElement("ky_bao_cao").data('gonrin').setDataSource(dataSource);
			}else if (value=== 3){
				self.$el.find(".tungay").addClass("d-none");
				self.$el.find(".denngay").addClass("d-none");
				self.$el.find(".nambaocao").removeClass("d-none");
				self.$el.find(".kybaocao").removeClass("d-none");
				var dataSource = [
					{ value: 1, text: "Quý 1" },
					{ value: 2, text: "Quý 2" },
					{ value: 3, text: "Quý 3" },
					{ value: 4, text: "Quý 4" }
				]
				self.getFieldElement("ky_bao_cao").data('gonrin').setDataSource(dataSource);
			}else if (value=== 4){
				self.$el.find(".tungay").addClass("d-none");
				self.$el.find(".denngay").addClass("d-none");
				self.$el.find(".nambaocao").removeClass("d-none");
				self.$el.find(".kybaocao").addClass("d-none");
			}
		},
		savePhieu: function (mode = 0) {
			var self = this;
			
			self.process_date();
			self.model.set("ten_nguoi_bao_cao",gonrinApp().currentUser.hoten);
			self.model.set("ma_nguoi_bao_cao",gonrinApp().currentUser.id);
 
			self.model.save(null,{
				success: function (model, respose, options) {
					if (mode == 0) {
						self.getApp().notify("Lưu thông tin thành công");
					} else  if (mode == 1) {
						self.model.set(model.attributes);
					} else if (mode == 3){
						self.congdon_solieu();
					}
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
		},
		renderItems: function(){
			var self = this;
			self.$el.find(".list-item").html("");
			var chitietVattu = new ChitietVattu({viewData: {"baocao_id": self.model.get("id")}, el:self.$el.find(".list-item")});
			chitietVattu.render();
		},
		process_date:function(){
			var self = this;
			var ngay_bao_cao = self.model.get("ngay_bao_cao");
			if (!ngay_bao_cao || ngay_bao_cao == null || ngay_bao_cao == undefined) {
				self.getApp().notify({message: "Vui lòng nhập ngày báo cáo"}, {type: "danger", delay: 3000});
				return false;
			}
			var loai_ky_bao_cao = self.model.get("loai_ky_bao_cao");
			if (!loai_ky_bao_cao || loai_ky_bao_cao == null || loai_ky_bao_cao == undefined) {
				self.getApp().notify({message: "Vui lòng chọn loại kỳ báo cáo"}, {type: "danger", delay: 3000});
				return false;
			} else if (loai_ky_bao_cao == 1) {//khoang thoi gian
				var ngay_bat_dau = self.model.get("ngay_bat_dau");
				var ngay_ket_thuc = self.model.get("ngay_ket_thuc");
				if(ngay_bat_dau == null || ngay_bat_dau == undefined){
					self.getApp().notify({message: "Vui lòng chọn ngày bắt đầu"}, {type: "danger", delay: 3000});
					return false;
				}
				if(ngay_ket_thuc == null || ngay_ket_thuc == undefined){
					self.getApp().notify({message: "Vui lòng chọn ngày kết thúc"}, {type: "danger", delay: 3000});
					return false;
				}
			} else if (loai_ky_bao_cao == 2 || loai_ky_bao_cao ==3){//thang, quy
				var ky_bao_cao = self.model.get("ky_bao_cao");
				if(ky_bao_cao == null || ky_bao_cao == undefined){
					self.getApp().notify({message: "Vui lòng chọn kỳ báo cáo"}, {type: "danger", delay: 3000});
					return;
				}
				var nam_bao_cao = self.model.get("nam_bao_cao");
				if(nam_bao_cao == null || nam_bao_cao == undefined){
					self.getApp().notify({message: "Vui lòng nhập năm báo cáo"}, {type: "danger", delay: 3000});
					return;
				}

				if (loai_ky_bao_cao == 2){
					var firstDay = new Date(nam_bao_cao, ky_bao_cao -1, 1);
					var lastDay = new Date(nam_bao_cao, ky_bao_cao, 0);
					self.model.set("ngay_bat_dau", self.parse_date_custom(firstDay));
					self.model.set("ngay_ket_thuc",self.parse_date_custom((moment(lastDay).set({hour:23,minute:59,second:59}))));
				} else {
					var firstDay = null;
					var lastDay = null;
					if (ky_bao_cao == 1){
						firstDay = new Date(nam_bao_cao, 0, 1);
						lastDay = new Date(nam_bao_cao, 2, 31);
					}else if (ky_bao_cao == 2){
						firstDay = new Date(nam_bao_cao, 3, 1);
						lastDay = new Date(nam_bao_cao, 5, 30);
					}else if (ky_bao_cao == 3){
						firstDay = new Date(nam_bao_cao, 6, 1);
						lastDay = new Date(nam_bao_cao, 8, 30);
					}else{
						firstDay = new Date(nam_bao_cao, 9, 1);
						lastDay = new Date(nam_bao_cao, 11, 31);
					}
					self.model.set("ngay_bat_dau", self.parse_date_custom(firstDay));
					self.model.set("ngay_ket_thuc",self.parse_date_custom((moment(lastDay).set({hour:23,minute:59,second:59}))));
				}
			} else if (loai_ky_bao_cao == 4){//nam
				var nam_bao_cao = self.model.get("nam_bao_cao");
				if(nam_bao_cao == null || nam_bao_cao == undefined){
					self.getApp().notify({message: "Vui lòng nhập năm báo cáo"}, {type: "danger", delay: 3000});
					return;
				}
				var firstDay = new Date(nam_bao_cao, 0, 1);
				var lastDay = new Date(nam_bao_cao, 11, 31);
				self.model.set("ngay_bat_dau", self.parse_date_custom(firstDay));
				self.model.set("ngay_ket_thuc",self.parse_date_custom((moment(lastDay).set({hour:23,minute:59,second:59}))));

			}
			if(self.model.get("ngay_bat_dau") === null || self.model.get("ngay_ket_thuc") === null){
				self.getApp().notify({message: "Vui lòng nhập kỳ báo cáo"}, {type: "danger", delay: 3000});
				return;
			}
			console.log("ngay_bat_dau =====",self.model.get("ngay_bat_dau"));
			console.log("ngay_ket_thuc =====",self.model.get("ngay_ket_thuc"));
		},

		fillStt: function () {
			var self = this;
			var stt = self.$el.find(".stt");
			$.each(stt, (index, element) => {
				$(element).text(index + 1);
			});
		},
		parse_date_custom : function(firstDay){
			var tmp = "";
			var firstDay = new Date(firstDay);
			if (isNaN(firstDay) == true){
                return "";
            }
			tmp = tmp + firstDay.getFullYear();
			if (firstDay.getMonth() < 9){
				tmp = tmp + "0" + (firstDay.getMonth() +1)
			}else{
				tmp = tmp + (firstDay.getMonth() +1)
			}
			if (firstDay.getDate() <= 9){
				tmp = tmp + "0" + firstDay.getDate();
			}
			else{
				tmp = tmp + firstDay.getDate();
			}
			if (firstDay.getHours() <=9){
				tmp = tmp + "0" + firstDay.getHours();
			}
			else{
				tmp = tmp + firstDay.getHours();
			}
			if (firstDay.getMinutes() <=9){
				tmp = tmp + "0" + firstDay.getMinutes();
			}
			else{
				tmp = tmp + firstDay.getMinutes();
			}
			if (firstDay.getSeconds() <=9){
				tmp = tmp + "0" + firstDay.getSeconds();
			}
			else{
				tmp = tmp + firstDay.getSeconds();
			}
			return tmp;
		}

    });

});