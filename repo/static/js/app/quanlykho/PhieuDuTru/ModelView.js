define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/quanlykho/PhieuDuTru/tpl/model.html'),
	schema 				= require('json!schema/PhieuDuTruSchema.json');
	var DanhMucSelectView = require('app/quanlykho/DanhMucKho/SelectView');
	var ChitietVattu = require('app/quanlykho/PhieuDuTru/ChitietItemView');


    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "phieudutru",
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
		    	    	buttonClass: "btn-success width-sm ml-2",
		    	    	label: "TRANSLATE:SAVE",
		    	    	command: function(){
							var self = this;
							
							var du_tru_all_kho = self.model.get("du_tru_tat_ca_kho");
							if(du_tru_all_kho != 1){
								var kho = self.model.get("kho");
								if (kho != null && kho != undefined) {
									self.model.set({
										"ma_kho": kho.ma_kho,
										"ten_kho" : kho.ten_kho
									});
									
								}
								self.model.set("du_tru_tat_ca_kho",0);
							}
							
							var loai_ky_du_tru = self.model.get("loai_ky_du_tru");
							if(loai_ky_du_tru === 1){//tu ngay, den ngay
								var value_ky_du_tru_start = self.model.get("ngay_bat_dau");
								if(value_ky_du_tru_start == null || value_ky_du_tru_start== undefined){
									gonrinApp().notify("Vui lòng chọn ngày bắt đầu");
									return;
								}
								var value_ky_du_tru_end = self.model.get("ngay_ket_thuc");
								if(value_ky_du_tru_end == null || value_ky_du_tru_end== undefined){
									gonrinApp().notify("Vui lòng chọn ngày kết thúc");
									return;
								}

							}
							self.model.set("ten_nguoi_lap_phieu",gonrinApp().currentUser.fullname);
							self.model.set("ma_nguoi_lap_phieu",gonrinApp().currentUser.id);
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
						field: "du_tru_tat_ca_kho",
						uicontrol:"checkbox",
						textField: "text",
						valueField: "value",
						checkedField: "name",
						cssClassField: "cssClass",
						text:"Dự trù cho tất cả các kho?",
						dataSource: [
							{name: true, value: 1, text: "Có" },
							{name: false, value: 0, text: "Không"},
					   ],
					   value:1
					},
					{
						field:"loai_ky_du_tru",
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
						value:4
					},
					{
						field:"ky_du_tru",
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
						field:"loai_du_tru",
						uicontrol:"combobox",
						textField: "text",
						valueField: "value",
						cssClass:"form-control",
							dataSource: [
							{ value: 1, text: "Dự trù mới" },
							{ value: 2, text: "Dự trù bổ sung" }
						],
						value:1
					},
					{
						field:"hinhthuc_dutru",
						uicontrol:"combobox",
						textField: "text",
						valueField: "value",
						cssClass:"form-control",
							dataSource: [
							{ value: 1, text: "Dự trù Nhập" },
							{ value: 2, text: "Dự trù Xuất" }
						],
						value:1
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
						field:"ngay_du_tru",
						uicontrol:"datetimepicker",
						format:"DD/MM/YYYY",
							textFormat:"DD/MM/YYYY",
							extraFormats:["DDMMYYYY"],
							parseInputDate: function(val){
								return gonrinApp().parseDate(val);
						},
						parseOutputDate: function(date){
							return date.unix();
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
								return gonrinApp().parseDate(val);
						},
						parseOutputDate: function(date){
							return date.unix();
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
								return gonrinApp().parseDate(val);
						},
						parseOutputDate: function(date){
							return date.unix();
						},
						disabledComponentButton: true
					}
            	]
			},
    	render:function(){
			var self = this;
			var id = this.getApp().getRouter().getParam("id");
			
			
			
    		if(id){
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data){

						self.applyBindings();
						self.check_option_visible();
        			},
        			error:function(){
    					self.getApp().notify(self.getApp().translate("TRANSLATE:error_load_data"));
					},
					complete:function(){
						
						
						var chitiet_vattu = self.model.get("chitiet_vattu");
						if (!!chitiet_vattu && chitiet_vattu !== undefined && chitiet_vattu !== null && chitiet_vattu instanceof Array && chitiet_vattu.length > 0) {
							self.$el.find('.table-vattu').show();
							chitiet_vattu.forEach( (value, index) => {
								var chitietVattu = new ChitietVattu({viewData: {"data": value, "check_ton": false}});
								chitietVattu.render();
								var id_vattu = value.id;
								if(id_vattu !=null && self.$el.find("tr#"+id_vattu).length>0){
									self.$el.find("tr#"+id_vattu).replaceWith(chitietVattu.$el);
								}else{
									self.$el.find('.table-vattu tbody').append(chitietVattu.$el);
								}
								chitietVattu.on("saveVattu", function (event) {
									self.$el.find('.table-vattu').show();
									var data_vattu = event.data;
									self.onSaveDataVatTu(data_vattu);
									self.fillStt();
								});
								chitietVattu.on("removeVattu", function (event) {
									self.$el.find('.table-vattu').show();
									var data_vattu = event.data;
									self.removeVattu(data_vattu);
									self.fillStt();
								});
								
							});
							self.fillStt();
						} else {
							// self.$el.find('.table-vattu').hide();
						}
						self.register_event();
					}
        		});
    		} else {
				self.applyBindings();
				self.register_event();
				self.check_option_visible();
				// self.$el.find('.table-vattu').hide();
				var currentDate = moment().unix();
				self.model.set("ngay_du_tru", currentDate);
				self.model.set("nam_du_tru",new Date().getFullYear());
				self.model.set("du_tru_tat_ca_kho",1);
				self.model.set("loai_du_tru",1);
				self.model.set("loai_ky_du_tru",4);
				self.model.set("hinhthuc_dutru",1);
				var now = new Date(new Date().getFullYear(), 0,1,0,0,0,0);
				var end = new Date(new Date().getFullYear(), 11,31,23,59,59,0);
				self.model.set("ngay_bat_dau", now.getTime()/1000);
				self.model.set("ngay_ket_thuc", end.getTime()/1000);
    		}
    		
		},
		register_event: function(){
			var self = this;
			
			self.model.on("change:loai_ky_du_tru",function(){
				self.check_option_visible();
			});
			self.model.on("change:du_tru_tat_ca_kho", function(){
				if(self.model.get("du_tru_tat_ca_kho") == 1){
					self.model.set("kho",null);
					self.model.set("ma_kho",null);
					self.model.set("ten_kho",null);
				}
			});
			self.model.on("change:kho",function(){
				if(self.model.get("du_tru_tat_ca_kho") == 1){
					self.model.set("du_tru_tat_ca_kho",0);
				}
				var kho = self.model.get("kho");
				if (kho !== null && kho !== undefined) {
					self.model.set({
						"ma_kho": kho.id,
						"ten_kho" : kho.ten_kho
					});
				}
			});
			var $selectize = self.$el.find('#selectize-programmatic').selectize({
                valueField: 'id',
                labelField: 'ten_vattu',
				searchField: ['ten_vattu'],
				// placeholder: "Tìm kiếm vật tư, thuốc...",
                preload: true,
                load: function(query, callback) {
                    var query_filter = {"filters": {"$or": [
                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                        { "ma_vattu": { "$likeI": gonrinApp().convert_khongdau(query) } }
                        ]}};
					var url = (self.getApp().serviceURL || "") + '/api/v1/danhmuc_vattu_donvi?' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                        }
                    });
                },
                onChange: function(value, isOnInitialize) {
                    var $selectz = (self.$el.find('#selectize-programmatic'))[0]
					var obj = $selectz.selectize.options[value];
                    if (obj !== null && obj !== undefined) {
						var id = self.model.get("id");
                        if (id !== null && id !== undefined) {
                            // logic: nếu phiếu đó chưa có id - phiếu tạo mới thì set data vật tư
							// k tính sự kiện onchange khi set data vật tư lần đầu
							self.renderItem(obj);                            
                        } else {
                            // sự kiện khi update phiếu, set data vật tư lần đầu
                            self.savePhieu(1, obj);
                        }

                    }
                }
            });
		},
		check_option_visible: function(){
			var self = this;
			var value = self.model.get("loai_ky_du_tru");
			// { value: 1, text: "Theo khoảng thời gian" },
			// { value: 2, text: "Theo Tháng" },
			// { value: 3, text: "Theo Quý" },
			// { value: 4, text: "Theo Năm" }
			// .setDataSource(data);
			if(value === 1){
				self.$el.find(".tungay").removeClass("d-none");
				self.$el.find(".denngay").removeClass("d-none");
				self.$el.find(".namdutru").addClass("d-none");
				self.$el.find(".kydutru").addClass("d-none");
				
			}else if (value=== 2){
				self.$el.find(".tungay").addClass("d-none");
				self.$el.find(".denngay").addClass("d-none");
				self.$el.find(".namdutru").removeClass("d-none");
				self.$el.find(".kydutru").removeClass("d-none");
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
				self.getFieldElement("ky_du_tru").data('gonrin').setDataSource(dataSource);
			}else if (value=== 3){
				self.$el.find(".tungay").addClass("d-none");
				self.$el.find(".denngay").addClass("d-none");
				self.$el.find(".namdutru").removeClass("d-none");
				self.$el.find(".kydutru").removeClass("d-none");
				var dataSource = [
					{ value: 1, text: "Quý 1" },
					{ value: 2, text: "Quý 2" },
					{ value: 3, text: "Quý 3" },
					{ value: 4, text: "Quý 4" }
				]
				self.getFieldElement("ky_du_tru").data('gonrin').setDataSource(dataSource);
			}else if (value=== 4){
				self.$el.find(".tungay").addClass("d-none");
				self.$el.find(".denngay").addClass("d-none");
				self.$el.find(".namdutru").removeClass("d-none");
				self.$el.find(".kydutru").addClass("d-none");
			}
		},
		renderItem: function(obj){
			var self = this;
			var obj_chitiet_new = {
				"ten_vattu": obj.ten_vattu + (obj.hamluong!=null ? " " + obj.hamluong: ""),
				"ma_vattu": obj.ma_vattu,
				"id_vattu":obj.id,
				"vattu": obj,
				"loai_vattu":obj.loai_vattu,
				"phieudutru_id":self.model.get("id"),
				"donvitinh":obj.donvitinh,
				"ngay_bat_dau": self.model.get("ngay_bat_dau"),
				"ngay_ket_thuc": self.model.get("ngay_ket_thuc"),
				"ngay_du_tru": self.model.get("ngay_du_tru"),
				"loai_ky_du_tru":self.model.get("loai_ky_du_tru"),
				"ky_du_tru": self.model.get("ky_du_tru"),
				"nam_du_tru": self.model.get("nam_du_tru"),
				"loai_du_tru": self.model.get("loai_du_tru"),
				"du_tru_tat_ca_kho": self.model.get("du_tru_tat_ca_kho"),
				"ma_kho": self.model.get("ma_kho"),
				"ten_kho": self.model.get("ten_kho"),
				"donvi_id":self.model.get("donvi_id"),
				"dongia":obj.giatien
			};
			var chitietVattu = new ChitietVattu({viewData: {"data": obj_chitiet_new, "check_ton":true}});
			chitietVattu.render();
			var item_id = chitietVattu.model.get("id");
			if(item_id !=null && self.$el.find("tr#"+item_id).length>0){
				self.$el.find("tr#"+item_id).replaceWith(chitietVattu.$el);
			}else{
				self.$el.find('.table-vattu tbody').append(chitietVattu.$el);
			}
			chitietVattu.on("saveVattu", function (event) {
				var data_vattu = event.data;
				self.onSaveDataVatTu(data_vattu);
				self.fillStt();
			});
			chitietVattu.on("removeVattu", function (event) {
				self.$el.find('.table-vattu').show();
				var data_vattu = event.data;
				self.removeVattu(data_vattu);
				self.fillStt();
			});
			self.fillStt();
		},
		savePhieu: function (mode = 0, objDataVattu) {
			var self = this;
			var ngay_du_tru = self.model.get("ngay_du_tru");
			if (!ngay_du_tru || ngay_du_tru == null || ngay_du_tru == undefined) {
				self.getApp().notify({message: "Vui lòng nhập ngày dự trù"}, {type: "danger", delay: 3000});
				return;
			} 
			var loai_du_tru = self.model.get("loai_du_tru");
			if (!loai_du_tru || loai_du_tru == null || loai_du_tru == undefined) {
				self.getApp().notify({message: "Vui lòng chọn loại dự trù"}, {type: "danger", delay: 3000});
				return;
			} 
			var loai_ky_du_tru = self.model.get("loai_ky_du_tru");
			if (!loai_ky_du_tru || loai_ky_du_tru == null || loai_ky_du_tru == undefined) {
				self.getApp().notify({message: "Vui lòng chọn loại kỳ dự trù"}, {type: "danger", delay: 3000});
				return;
			} else if (loai_ky_du_tru == 1) {//khoang thoi gian
				var ngay_bat_dau = self.model.get("ngay_bat_dau");
				var ngay_ket_thuc = self.model.get("ngay_ket_thuc");
				if(ngay_bat_dau == null || ngay_bat_dau == undefined){
					self.getApp().notify({message: "Vui lòng chọn ngày bắt đầu"}, {type: "danger", delay: 3000});
					return;
				}
				if(ngay_ket_thuc == null || ngay_ket_thuc == undefined){
					self.getApp().notify({message: "Vui lòng chọn ngày kết thúc"}, {type: "danger", delay: 3000});
					return;
				}
			} else if (loai_ky_du_tru == 2 || loai_ky_du_tru ==3){//thang, quy
				var ky_du_tru = self.model.get("ky_du_tru");
				if(ky_du_tru == null || ky_du_tru == undefined){
					self.getApp().notify({message: "Vui lòng chọn kỳ dự trù"}, {type: "danger", delay: 3000});
					return;
				}
				var nam_du_tru = self.model.get("nam_du_tru");
				if(nam_du_tru == null || nam_du_tru == undefined){
					self.getApp().notify({message: "Vui lòng nhập năm dự trù"}, {type: "danger", delay: 3000});
					return;
				}
				if (loai_ky_du_tru == 2){
					var firstDay = new Date(nam_du_tru, ky_du_tru -1, 1);
					var lastDay = new Date(nam_du_tru, ky_du_tru, 0);
					firstDay = moment(firstDay).format("DD/MM/YYYY");
					lastDay = moment(lastDay).format("DD/MM/YYYY");
					self.model.set("ngay_bat_dau",moment(firstDay).unix());
					self.model.set("ngay_ket_thuc",moment(lastDay).set({hour:23,minute:59,second:59}).unix());
				}else{
					var firstDay = null;
					var lastDay = null;
					if (ky_du_tru == 1){
						firstDay = new Date(nam_du_tru, 0, 1);
						lastDay = new Date(nam_du_tru, 2, 31);
					}else if (ky_du_tru == 2){
						firstDay = new Date(nam_du_tru, 3, 1);
						lastDay = new Date(nam_du_tru, 5, 30);
					}else if (ky_du_tru == 3){
						firstDay = new Date(nam_du_tru, 6, 1);
						lastDay = new Date(nam_du_tru, 8, 30);
					}else{
						firstDay = new Date(nam_du_tru, 9, 1);
						lastDay = new Date(nam_du_tru, 11, 31);
					}
					self.model.set("ngay_bat_dau",moment(firstDay).unix());
					self.model.set("ngay_ket_thuc",moment(lastDay).set({hour:23,minute:59,second:59}).unix());
				}
			} else if (loai_ky_du_tru == 4){//nam
				var nam_du_tru = self.model.get("nam_du_tru");
				if(nam_du_tru == null || nam_du_tru == undefined){
					self.getApp().notify({message: "Vui lòng nhập năm dự trù"}, {type: "danger", delay: 3000});
					return;
				}
				var firstDay = new Date(nam_du_tru, 0, 1);
				var lastDay = new Date(nam_du_tru, 11, 31);
				self.model.set("ngay_bat_dau",moment(firstDay).unix());
				self.model.set("ngay_ket_thuc",moment(lastDay).set({hour:23,minute:59,second:59}).unix());
			}


			var kho = self.model.get("kho");
			if (kho !== null && kho !== undefined) {
				self.model.set({
					"ma_kho": kho.ma_kho,
					"ten_kho" : kho.ten_kho
				});
			}
			self.model.set("ten_nguoi_lap_phieu",gonrinApp().currentUser.fullname);
			self.model.set("ma_nguoi_lap_phieu",gonrinApp().currentUser.id);

			self.model.save(null,{
				success: function (model, respose, options) {
					if (mode == 0) {
						self.getApp().notify("Lưu thông tin thành công");
						
						// self.getApp().getRouter().navigate(self.collectionName + "/collection");
					} else  if (mode == 1) {
						self.model.set(model.attributes);
						console.log(objDataVattu);
						self.renderItem(objDataVattu);
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
		onSaveDataVatTu: function (data_vattu) {
            var self = this;
            var listVattu = self.model.get("chitiet_vattu");
            if (listVattu == null || listVattu == undefined) {
                listVattu = [];
			}
            if (listVattu instanceof Array) {
                var arrayvattu = [];
                if (listVattu.length == 0) {
                    arrayvattu.push(data_vattu);
                } else {
					var check_existed = false;
                    for (var i = 0; i < listVattu.length; i++) {
                        if (data_vattu.id == listVattu[i].id) {
							arrayvattu.push(data_vattu);
							check_existed = true;
                        } else {
                            arrayvattu.push(listVattu[i]);
                        }
					}
					if (check_existed == false){
						arrayvattu.push(data_vattu);
					}
				}
				self.model.set("chitiet_vattu", arrayvattu);
				// console.log("onSaveDataVattu=======",self.model.get("chitiet_vattu"));
            }
		},
		removeVattu: function (data_vattu) {
            var self = this;
            var listVattu = self.model.get("chitiet_vattu");
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
				self.model.set("chitiet_vattu", arrayvattu);
            }
		},
		fillStt: function () {
			var self = this;
			var stt = self.$el.find(".stt");
			$.each(stt, (index, element) => {
				$(element).text(index + 1);
			});
		}

    });

});