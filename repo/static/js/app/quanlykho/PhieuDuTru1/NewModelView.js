define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/quanlykho/PhieuDuTru1/tpl/newmodel.html'),
	schema 				= require('json!schema/PhieuDuTruSchema.json');
	var DanhMucSelectView = require('app/quanlykho/DanhMucKho/SelectView'),
		ChitietVattu = require('app/quanlykho/PhieuDuTru1/ChitietPhieuDialog/NewChitietVattu');
	
	var ManageFileVIew = require("app/view/AttachFile/ManageFileUploadView");

    var danhmuc_donvitinh = require('json!app/constant/donvitinh.json');

    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "phieudutru",
        state: null,
        listItem : [],
        listItemId : [],
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
							var id = self.model.get("id");
							if (!!id){
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
							else{
								self.savePhieu();
							}
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
					// {
					// 	name: "print",
					// 	type: "button",
					// 	buttonClass: "btn-primary waves-effect width-sm ml-2",
					// 	label: "<i class='fa fa-file-pdf'></i> In Phiếu",
					// 	visible: function(){
		    	    // 		return this.getApp().getRouter().getParam("id") !== null;
		    	    // 	},
					// 	command: function(){
					// 		var self = this;
					// 		self.getApp().showloading();
					// 		var params = JSON.stringify({
					// 			"id": self.model.get("id"),
					// 			"type": "phieunhap_kho"
					// 		});
					// 		$.ajax({
					// 			url: (self.getApp().serviceURL || "") + '/api/v1/export_pdf_kho',
					// 			dataType: "json",
					// 			contentType: "application/json",
					// 			method: 'POST',
					// 			data: params,
					// 			success: function(response) {
					// 				self.getApp().hideloading();
					// 				window.open(response, "_blank");
					// 			},
					// 			error:function(xhr,status,error){
					// 				self.getApp().hideloading();
					// 				try {
					// 					if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
					// 						self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
					// 						self.getApp().getRouter().navigate("login");
					// 					} else {
					// 					self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
					// 					}
					// 				}
					// 				catch (err) {
					// 					self.getApp().notify({ message: "Lưu thông tin không thành công"}, { type: "danger", delay: 1000 });
					// 				}
					// 			},
					// 		});
					// 	}
					// },
    	    	],
    	    }],
    	    uiControl:{
        		fields:[
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
							// { value: 1, text: "Theo khoảng thời gian" },
							// { value: 2, text: "Theo Tháng" },
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
		tongtien_vattu: 0,
    	render:function(){
			var self = this;
            self.tongtien_vattu = 0;
            self.listItemId = [];
            self.listItem = [];
			var id = this.getApp().getRouter().getParam("id");
			self.$el.find('.btn-add-vattu').unbind("click").bind("click", function (e) {
				e.stopPropagation();
				self.DialogChitietVattu();
            });
    		if(id){
				this.model.set('id',id);
				self.$el.find(".newversion").remove();
				self.getApp().showloading();
        		this.model.fetch({
        			success: function(data){
						self.applyBindings();
						self.check_option_visible();
        			},
        			error:function(){
    					self.getApp().notify(self.getApp().traslate("TRANSLATE:error_load_data"));
					},
					complete:function(){
						var fileView = new ManageFileVIew({viewData:{"listFile":self.model.get('chungtu_dinhkem'), "el_btn_upload":".btn-add-file"}, el:self.$el.find(".list-attachment")});
						fileView.render();
						fileView.on("change", (event) => {
							var listfile = event.data;
							self.model.set('chungtu_dinhkem', listfile);
						});
						self.getApp().hideloading();
						var chitiet_vattu = self.model.get("chitiet_vattu");
						if (!!chitiet_vattu && chitiet_vattu !== undefined && chitiet_vattu !== null && chitiet_vattu instanceof Array && chitiet_vattu.length > 0) {
							self.$el.find('.table-vattu').show();
							chitiet_vattu.forEach( (value, index) => {
								self.appendHtmlChitietVatTu(value);
								self.fillStt();
								var giatien = gonrinApp().convert_string_to_number(value.dongia);
								var soluong = gonrinApp().convert_string_to_number(value.soluong_thucte);
								self.tongtien_vattu = self.tongtien_vattu + giatien * soluong;
							});
							self.$el.find('.tongtien-vattu').text(Number(self.tongtien_vattu).toLocaleString('de-DE'));
						} else {
							self.$el.find('.table-vattu').hide();
						}
					}
				});
				self.register_event();
				
    		} else {
				self.applyBindings();
				self.$el.find(".getinfo").remove();
				self.get_vattu_donvi();
				self.$el.find('.table-vattu').hide();
				self.register_event();
				self.check_option_visible();
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
				self.register_ky_dutru();

				var fileView = new ManageFileVIew({viewData:{"listFile":self.model.get('chungtu_dinhkem'), "el_btn_upload":".btn-add-file"}, el:self.$el.find(".list-attachment")});
				fileView.render();
				fileView.on("change", (event) => {
					var listfile = event.data;
					self.model.set('chungtu_dinhkem', listfile);
				});
			}

		},
		savePhieu1: function (mode = 0, dataView=null) {
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
					self.model.set("ngay_bat_dau", firstDay.getTime()/1000);
					self.model.set("ngay_ket_thuc", (lastDay.getTime()/1000 + 86399));
				}
			} else if (loai_ky_du_tru == 4){//nam
				var nam_du_tru = self.model.get("nam_du_tru");
				if(nam_du_tru == null || nam_du_tru == undefined){
					self.getApp().notify({message: "Vui lòng nhập năm dự trù"}, {type: "danger", delay: 3000});
					return;
				}
				var firstDay = new Date(nam_du_tru, 0, 1);
				var lastDay = new Date(nam_du_tru, 11, 31);
				self.model.set("ngay_bat_dau", firstDay.getTime()/1000);
				self.model.set("ngay_ket_thuc", (lastDay.getTime()/1000 + 86399));
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

			console.log("ngay_bat_dau =====",self.model.get("ngay_bat_dau"));
			console.log("ngay_ket_thuc =====",self.model.get("ngay_ket_thuc"));

			self.model.save(null,{
				success: function (model, respose, options) {
					if (mode == 0) {
						self.getApp().notify("Lưu thông tin thành công");
						self.getApp().getRouter().navigate(self.collectionName + "/collection");
					} else  if (mode == 1) {
						self.model.set(model.attributes);
						var phieudutru_id = self.model.get("id");
						var ngay_du_tru = self.model.get("ngay_du_tru");
						if (ngay_du_tru === null || ngay_du_tru === undefined){
							ngay_du_tru = moment().unix();
							self.model.set("ngay_du_tru", ngay_du_tru);
						}
						var chitietVattu = new ChitietVattu({viewData: {"data": dataView, "phieudutru_id": phieudutru_id, "ngay_du_tru": self.model.get("ngay_du_tru"), "loai_ky_du_tru": self.model.get("loai_ky_du_tru"), "ky_du_tru": self.model.get("ky_du_tru"), "nam_du_tru":self.model.get("nam_du_tru"), "ngay_bat_dau":self.model.get("ngay_bat_dau"), "ngay_ket_thuc" : self.model.get("ngay_ket_thuc"), "loai_du_tru" : self.model.get("loai_du_tru"), "hinhthuc_dutru" : self.model.get("hinhthuc_dutru"), "du_tru_tat_ca_kho" : self.model.get("du_tru_tat_ca_kho"), "ma_kho" : self.model.get("ma_kho"), "ten_kho" : self.model.get("ten_kho") }});

						chitietVattu.dialog();
						chitietVattu.on("saveVattu", function (event) {
							self.$el.find('.table-vattu').show();
							// var data = event.data;
							var data_vattu = event.data;
							self.onSaveDataVatTu(data_vattu);
						});
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
		DialogChitietVattu: function (dataView = null) {
			var self = this;
			var id = self.model.get("id");
			if (!id || id == null || id == undefined || id == "") {
				self.savePhieu(1, dataView);
			} else {
				var phieudutru_id = self.model.get("id");
				var ngay_du_tru = self.model.get("ngay_du_tru");
				if (ngay_du_tru === null || ngay_du_tru === undefined){
					ngay_du_tru = moment().unix();
					self.model.set("ngay_du_tru", ngay_du_tru);
				}
				var chitietVattu = new ChitietVattu({viewData: {"data": dataView, "phieudutru_id": phieudutru_id, "ngay_du_tru": self.model.get("ngay_du_tru"), "loai_ky_du_tru": self.model.get("loai_ky_du_tru"), "ky_du_tru": self.model.get("ky_du_tru"), "nam_du_tru":self.model.get("nam_du_tru"), "ngay_bat_dau":self.model.get("ngay_bat_dau"), "ngay_ket_thuc" : self.model.get("ngay_ket_thuc"), "loai_du_tru" : self.model.get("loai_du_tru"), "hinhthuc_dutru" : self.model.get("hinhthuc_dutru"), "du_tru_tat_ca_kho" : self.model.get("du_tru_tat_ca_kho"), "ma_kho" : self.model.get("ma_kho"), "ten_kho" : self.model.get("ten_kho") }});

				chitietVattu.dialog();
				chitietVattu.on("saveVattu", function (event) {
					self.$el.find('.table-vattu').show();
					var data_vattu = event.data;
					self.onSaveDataVatTu(data_vattu);
				});
			}
		},
		appendHtmlChitietVatTu: function (data) {
			var self = this;
			var tr_el = $("<tr>").attr({"id":data.id});
			tr_el.html(`<td class="stt text-center">` + 1 + `</td>
				<td class="ma_vattu">${data.ma_vattu}</td>
				<td class="ten_vattu">${data.ten_vattu}</td>
				<td class="donvitinh">${self.fillDonvitinh(data.donvitinh)}</td>
				<td class=""><input type="number" class="form-control so_luong_du_tru" value="${data.so_luong_du_tru}" /></td>
				<td class=""><input type="number" class="form-control so_luong_duyet_du_tru" value ="${data.so_luong_duyet_du_tru}"/></td>
				<td class="text-center"><a href="javascript:;" class="demo-delete-row btn btn-danger btn-xs btn-icon" title="Xóa"><i class="fa fa-times"></i></a>
				<a  href="javascript:;"  class="demo-edit-row btn btn-success btn-xs btn-icon" title="Sửa"><i class="mdi mdi-pencil"></i></a></td>`);
			self.$el.find('.table-vattu tbody').append(tr_el);
			tr_el.find(".demo-delete-row").unbind("click").bind("click",{obj:data},function(e){
				e.stopPropagation();
				var data_vattu = e.data.obj;
				var url = (self.getApp().serviceURL || "") + '/api/v1/phieudutru_chitiet/' + data_vattu.id;
				$.ajax({
					url: url,
					type: 'DELETE',
					headers: {
						'content-type': 'application/json',
						'Access-Control-Allow-Origin': '*'
					},
					success: function(response) {
						var listVattu = self.model.get("chitiet_vattu");
						if (listVattu instanceof Array && listVattu.length > 0) {
							var arrayvattu = [];
							for (var i = 0; i < listVattu.length; i++) {
								if (data_vattu.id == listVattu[i].id) {
									self.$el.find(".table-vattu #" + data_vattu.id).remove();
									self.fillStt();
									continue
								} else {
									arrayvattu.push(listVattu[i]);
								}
							}
							self.model.set("chitiet_vattu", arrayvattu);
							return;
						}
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
				
			});
			tr_el.find(".demo-edit-row").unbind("click").bind("click",{obj:data},function(e){
				e.stopPropagation();
				var obj_data = e.data.obj;
				self.DialogChitietVattu(obj_data);
			});
			tr_el.find(".so_luong_du_tru").on("change",{data : data}, function(e){
				var data_vattu = e.data.data;
				data_vattu.so_luong_du_tru = Number($(this).val());
				var url = (self.getApp().serviceURL || "") + '/api/v1/phieudutru_chitiet/' + data_vattu.id;
				$.ajax({
					url: url,
					type: 'PUT',
					data : JSON.stringify(data_vattu),
					headers: {
						'content-type': 'application/json',
						'Access-Control-Allow-Origin': '*'
					},
					success: function(response) {
						self.onSaveDataVatTu(response);
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
			})
			tr_el.find(".so_luong_duyet_du_tru").on("change",{data : data}, function(e){
				var data_vattu = e.data.data;
				data_vattu.so_luong_duyet_du_tru = Number($(this).val());
				var url = (self.getApp().serviceURL || "") + '/api/v1/phieudutru_chitiet/' + data_vattu.id;
				$.ajax({
					url: url,
					type: 'PUT',
					data : JSON.stringify(data_vattu),
					headers: {
						'content-type': 'application/json',
						'Access-Control-Allow-Origin': '*'
					},
					success: function(response) {
						self.onSaveDataVatTu(response);
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
			})
		},
		onSaveDataVatTu: function (data_vattu) {
            var self = this;
            var listVattu = self.model.get("chitiet_vattu");
            if (listVattu == null || listVattu == undefined) {
                listVattu = [];
			}
			var exits = false;
            if (listVattu instanceof Array) {
                var arrayvattu = [];
                if (listVattu.length == 0) {
                    arrayvattu.push(data_vattu);
                } else {
                    for (var i = 0; i < listVattu.length; i++) {
                        if (data_vattu.id == listVattu[i].id) {
							exits = true;
                            continue;
                        } else {
                            arrayvattu.push(listVattu[i]);
                        }
                    }
                    arrayvattu.push(data_vattu);
				}
				self.model.set("chitiet_vattu", arrayvattu);
				if (arrayvattu.length > 0) {
					self.$el.find('.table-vattu').show();
				}
				if (exits == false) {
					self.$el.find('.table-vattu').show();
					self.appendHtmlChitietVatTu(data_vattu);
					self.fillStt();
				} else {
					var elt = self.$el.find(".table-vattu #" + data_vattu.id);
					elt.find('.donvitinh').text( self.fillDonvitinh(data_vattu.donvitinh));
					elt.find('.ten_vattu').text(data_vattu.ten_vattu);
					elt.find('.ma_vattu').text(data_vattu.ma_vattu);
					elt.find('.dongia').text(Number(data_vattu.dongia).toLocaleString('de-DE'));
					elt.find('.so_luong_du_tru').val(Number(data_vattu.so_luong_du_tru));
					elt.find('.so_luong_duyet_du_tru').val(Number(data_vattu.so_luong_duyet_du_tru));
					elt.find(".demo-edit-row").unbind("click").bind("click",{obj:data_vattu},function(e){
						e.stopPropagation();
						var obj_data = e.data.obj;
						self.DialogChitietVattu(obj_data);
					});
				}
            }
		},
		fillStt: function () {
			var self = this;
			var stt = self.$el.find(".stt");
			$.each(stt, (index, element) => {
				$(element).text(index + 1);
			});
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
			self.$el.find(".btn-search").unbind("click").bind("click", function(){
				var text = self.$el.find(".search-vattu").val();
				var listChitiet = self.listItem.filter(function(value){
					return (value.ten_vattu.includes(text) || value.tenkhongdau.includes(gonrinApp().convert_khongdau(text)) || value.ma_vattu.includes(text));
				});
				self.render_chitiet(listChitiet);
			});
			self.$el.find(".btn-xoa").unbind("click").bind("click", function(){
				self.$el.find(".search-vattu").val("");
				self.$el.find(".btn-search").click();
			})
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
				if (!!self.getFieldElement("ky_du_tru") && !!self.getFieldElement("ky_du_tru").data('gonrin') ){
					self.getFieldElement("ky_du_tru").data('gonrin').setDataSource(dataSource);
				}
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
				if (!!self.getFieldElement("ky_du_tru") && !!self.getFieldElement("ky_du_tru").data('gonrin') ){
					self.getFieldElement("ky_du_tru").data('gonrin').setDataSource(dataSource);
				}
			}else if (value=== 4){
				self.$el.find(".tungay").addClass("d-none");
				self.$el.find(".denngay").addClass("d-none");
				self.$el.find(".namdutru").removeClass("d-none");
				self.$el.find(".kydutru").addClass("d-none");
			}
		},
		fillDonvitinh : function(donvitinh){
			var self = this;
			var result = "";          
			for(var i=0; i< danhmuc_donvitinh.length; i++){
				if(danhmuc_donvitinh[i].value === donvitinh){
					result = danhmuc_donvitinh[i].text;
					break;
				}
			}
			return result;
		},
		register_ky_dutru : function(){
			var self = this;
			self.model.on("change:loai_ky_du_tru", function(){
				var loai_ky_du_tru = self.model.get("loai_ky_du_tru");
				if (loai_ky_du_tru == 3){// dự trù theo quý
					var firstDay = null;
					var lastDay = null;
					var nam_du_tru = self.model.get("nam_du_tru");
					if (nam_du_tru === undefined || nam_du_tru === null){
						self.model.set("nam_du_tru",new Date().getFullYear());
					}
					var ky_du_tru = self.model.get("ky_du_tru");
					if (ky_du_tru == 1){
						firstDay = new Date(nam_du_tru, 0, 1);
						lastDay = new Date(nam_du_tru, 2, 31);
					}else if (ky_du_tru == 2){
						firstDay = new Date(nam_du_tru, 3, 1);
						lastDay = new Date(nam_du_tru, 5, 30);
					}else if (ky_du_tru == 3){
						firstDay = new Date(nam_du_tru, 6, 1);
						lastDay = new Date(nam_du_tru, 8, 30);
					}else if (ky_du_tru == 4){
						firstDay = new Date(nam_du_tru, 9, 1);
						lastDay = new Date(nam_du_tru, 11, 31);
					}
					else{
						self.model.set("ky_du_tru", 1);
						firstDay = new Date(nam_du_tru, 0, 1);
						lastDay = new Date(nam_du_tru, 2, 31);
					}
					self.model.set("ngay_bat_dau", firstDay.getTime()/1000);
					self.model.set("ngay_ket_thuc", (lastDay.getTime()/1000 + 86399));
				}
				else if(loai_ky_du_tru ==4){// dự trù năm
					var nam_du_tru = self.model.get("nam_du_tru");
					if(nam_du_tru == null || nam_du_tru == undefined){
						self.model.set("nam_du_tru",new Date().getFullYear());
					}
					var firstDay = new Date(nam_du_tru, 0, 1);
					var lastDay = new Date(nam_du_tru, 11, 31);
					self.model.set("ngay_bat_dau", firstDay.getTime()/1000);
					self.model.set("ngay_ket_thuc", (lastDay.getTime()/1000 + 86399));
				}
				else{
					self.model.set("loai_ky_du_tru",4);
					var nam_du_tru = self.model.get("nam_du_tru");
					if(nam_du_tru == null || nam_du_tru == undefined){
						self.model.set("nam_du_tru",new Date().getFullYear());
					}
					var firstDay = new Date(nam_du_tru, 0, 1);
					var lastDay = new Date(nam_du_tru, 11, 31);
					self.model.set("ngay_bat_dau", firstDay.getTime()/1000);
					self.model.set("ngay_ket_thuc", (lastDay.getTime()/1000 + 86399));
				}
			})
        },
        get_vattu_donvi : function(){
            var self = this;
            var currentUser = self.getApp().currentUser;
            if (!!currentUser && !!currentUser.donvi_id){
				var url_login = self.getApp().serviceURL + '/api/v1/danhmuc_vattu_donvi?results_per_page=10000';
                $.ajax({
                    url: url_login,
                    type: 'GET',
                    headers: {
                        'content-type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    dataType: 'json',
                    success: function(response) {
                        if(!!response){
							var listVattu = response.objects;
							self.render_chitiet(listVattu);                         
                        }
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
                    },
                    complete: function() {
                        self.getApp().hideloading();
                        return false;
                    }
                });
            }
        },
        savePhieu : function(){
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
					self.model.set("ngay_bat_dau", firstDay.getTime()/1000);
					self.model.set("ngay_ket_thuc", (lastDay.getTime()/1000 + 86399));
				}
			} else if (loai_ky_du_tru == 4){//nam
				var nam_du_tru = self.model.get("nam_du_tru");
				if(nam_du_tru == null || nam_du_tru == undefined){
					self.getApp().notify({message: "Vui lòng nhập năm dự trù"}, {type: "danger", delay: 3000});
					return;
				}
				var firstDay = new Date(nam_du_tru, 0, 1);
				var lastDay = new Date(nam_du_tru, 11, 31);
				self.model.set("ngay_bat_dau", firstDay.getTime()/1000);
				self.model.set("ngay_ket_thuc", (lastDay.getTime()/1000 + 86399));
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
            
            var listChitiet = self.listItem.filter(function(value, index){
                return ((value.soluong !== 0 && value.soluong !== "") || (value.soluongduyet !== 0 && value.soluongduyet !== ""))
			});
			var params = JSON.stringify({
				ngay_du_tru :  ngay_du_tru,
				ngay_bat_dau : self.model.get("ngay_bat_dau"),
				ngay_ket_thuc : self.model.get("ngay_ket_thuc"),
				loai_du_tru : loai_du_tru,
				ky_du_tru : self.model.get("ky_du_tru"),
				loai_ky_du_tru : loai_ky_du_tru,
				nam_du_tru : self.model.get("nam_du_tru"),
				ten_kho : self.model.get("ten_kho"),
				ma_kho : self.model.get("ma_kho"),
				kho : self.model.get("kho"),
				du_tru_tat_ca_kho : self.model.get("du_tru_tat_ca_kho"),
				listChitiet : listChitiet,
				hinhthuc_dutru : self.model.get("hinhthuc_dutru"),
				id : self.model.get("id")
			})
			$.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/phieudutru/create',
				dataType: "json",
				contentType: "application/json",
				method: 'POST',
				data: params,
				success: function(response) {
					self.getApp().hideloading();
					self.getApp().notify({message : "Lưu thông tin thành công"});
					self.getApp().getRouter().navigate('phieudutru/collection');
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
						self.getApp().notify({ message: "Lưu thông tin không thành công"}, { type: "danger", delay: 1000 });
					}
				},
			});
		},
		render_chitiet : function(listVattu){
			var self = this;
			if (listVattu === undefined || listVattu === null){
				listVattu = [];
			}
			var length = listVattu.length;
			self.$el.find(".body-data").html("");
			for (var i = 0; i< length; i++){
				var item = {
					id :  listVattu[i].id,
					ma_vattu : listVattu[i].ma_vattu,
					ten_vattu : listVattu[i].ten_vattu,
					tenkhongdau : listVattu[i].tenkhongdau,
					donvitinh : listVattu[i].donvitinh,
					soluong : 0,
					soluongduyet : 0
				}
				if (self.listItemId.indexOf(item.id) == -1){
					self.listItem.push(item);
					self.listItemId.push(item.id);
				}
				self.$el.find(".body-data").append(`
				<tr id="${item.id}">
					<td>${i +1}</td>
					<td>${item.ma_vattu}</td>
					<td >${item.ten_vattu}</td>
					<td>${self.fillDonvitinh(item.donvitinh)}</td>
					<td><input type="number" class="form-control sl-dutru" /></td>
					<td><input type="number" class="form-control sl-duyet-dutru" /></td>
				</tr>`);
				self.$el.find(`#${item.id} .sl-dutru`).unbind("change").bind("change", {data : item}, function(event){
					var id_vattu = "";
					if (!!event.data){
						id_vattu = event.data.data["id"];
					}
					var index = self.listItemId.indexOf(id_vattu);
					if (index != -1){
						var soluong = Number($(this).val());
						self.listItem[index].soluong = soluong;
					}
				});
				self.$el.find(`#${item.id} .sl-duyet-dutru`).unbind("change").bind("change", {data : item}, function(event){
					var id_vattu = "";
					if (!!event.data){
						id_vattu = event.data.data["id"];
					}
					var index = self.listItemId.indexOf(id_vattu);
					if (index != -1){
						var soluong = Number($(this).val());
						self.listItem[index].soluongduyet = soluong;
					}
				})
			} 
		}
    });

});