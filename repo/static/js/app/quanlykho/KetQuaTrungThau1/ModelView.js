define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/quanlykho/KetQuaTrungThau1/tpl/model.html'),
	schema 				= require('json!schema/KetQuaTrungThauSchema.json');
	var	ChitietVattu = require('app/quanlykho/KetQuaTrungThau1/ChitietPhieuDialog/ChitietVatTu');
	
	var ManageFileVIew = require("app/view/AttachFile/ManageFileUploadView");

    var danhmuc_donvitinh = require('json!app/constant/donvitinh.json');


    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "ketquathau",
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
						label: `<i class="fas fa-arrow-circle-left"></i> Quay lại`,
						command: function(){
							var self = this;
							Backbone.history.history.back();
						}
					},
					{
		    	    	name: "save",
		    	    	type: "button",
		    	    	buttonClass: "btn-success width-sm ml-2",
		    	    	label:  `<i class="far fa-save"></i> Lưu`,
		    	    	command: function(){
		    	    		var self = this;
		    	    		self.savePhieu();
		    	    	}
		    	    },
					{
		    	    	name: "delete",
		    	    	type: "button",
		    	    	buttonClass: "btn-danger width-sm ml-2",
		    	    	label: `<i class="fas fa-trash-alt"></i> Xóa`,
		    	    	visible: function(){
		    	    		return this.getApp().getRouter().getParam("id") !== null;
		    	    	},
		    	    	command: function(){
							var self = this;
							var delete_success = null;
							self.$el.find("#exampleModalCenter").modal("show");
							self.$el.find(".btn-deleted-continue").unbind("click").bind("click", function () {
								delete_success = true;
							});
		
							self.$el.find("#exampleModalCenter").on("hidden.bs.modal", function (e) {
								if (delete_success == true) {
									self.getApp().showloading();
									self.model.destroy({
										success: function(model, response) {
											self.getApp().hideloading();
											self.getApp().notify('Xoá dữ liệu thành công');
											self.getApp().getRouter().navigate(self.collectionName + "/collection");
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
						field:"loai_goi_thau",
						uicontrol:"combobox",
						textField: "text",
						valueField: "value",
						cssClass:"form-control",
							dataSource: [
							{ value: "generic1", text: "Generic 1" },
							{ value: "generic2", text: "Generic 2" },
							{ value: "generic3", text: "Generic 3" },
							{ value: "generic4", text: "Generic 4" },
							{ value: "generic5", text: "Generic 5" },
							{ value: "dongy1", text: "Đông Y 1" },
							{ value: "dongy2", text: "Đông Y 2" },
							{ value: "dongy3", text: "Đông Y 3" },
						],
					},
					{
						field: "thoigian_batdau",
						uicontrol: "datetimepicker",
						format: "DD/MM/YYYY",
						textFormat: "DD/MM/YYYY",
						extraFormats: ["DDMMYYYY"],
						parseInputDate: function(val) {
							return gonrinApp().parseInputDateString(val);
						},
						parseOutputDate: function(date) {
							return gonrinApp().parseOutputDateString(date);
						},
						disabledComponentButton: true
					},
					{
						field: "thoigian_ketthuc",
						uicontrol: "datetimepicker",
						format: "DD/MM/YYYY",
						textFormat: "DD/MM/YYYY",
						extraFormats: ["DDMMYYYY"],
						parseInputDate: function(val) {
							return gonrinApp().parseInputDateString(val);
						},
						parseOutputDate: function(date) {
							return gonrinApp().parseOutputDateString(date);
						},
						disabledComponentButton: true
					},
					{
						field: "thoigian_trungthau",
						uicontrol: "datetimepicker",
						format: "DD/MM/YYYY",
						textFormat: "DD/MM/YYYY",
						extraFormats: ["DDMMYYYY"],
						parseInputDate: function(val) {
							return gonrinApp().parseInputDateString(val);
						},
						parseOutputDate: function(date) {
							return gonrinApp().parseOutputDateString(date);
						},
						disabledComponentButton: true
					}
            	]
			},
    	render:function(){
			var self = this;
			var id = this.getApp().getRouter().getParam("id");
			self.$el.find('.btn-add-vattu').unbind("click").bind("click", function (e) {
				e.stopPropagation();
				self.DialogChitietVattu();
			});
    		if(id){
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data){
						self.applyBindings();
						var thoigian_trungthau = self.model.get("thoigian_trungthau");
						if (thoigian_trungthau === undefined || thoigian_trungthau === null){
							self.$el.find(".thoigian_trungthau").addClass("d-none");
						}
						else{
							self.$el.find(".thoigian_trungthau").removeClass("d-none");
							self.$el.find(".thoigian_trungthau").html(gonrinApp().timestampFormat(self.model.get("thoigian_trungthau")*1000, "DD/MM/YYYY"));
						}
        			},
        			error:function(){
    					self.getApp().notify(self.getApp().traslate("TRANSLATE:error_load_data"));
					},
					complete:function(){
						// var fileView = new ManageFileVIew({viewData:{"listFile":self.model.get('chungtu_dinhkem'), "el_btn_upload":".btn-add-file"}, el:self.$el.find(".list-attachment")});
						// fileView.render();
						// fileView.on("change", (event) => {
						// 	var listfile = event.data;
						// 	self.model.set('chungtu_dinhkem', listfile);
						// });
						var chitiet_sanpham = self.model.get("chitiet_sanpham");
						if (!!chitiet_sanpham && chitiet_sanpham !== undefined && chitiet_sanpham !== null && chitiet_sanpham instanceof Array && chitiet_sanpham.length > 0) {
							self.$el.find('.table-vattu').show();
							chitiet_sanpham.forEach( (value, index) => {
								self.appendHtmlChitietVatTu(value);
								self.fillStt();
							});
						} else {
							self.$el.find('.table-vattu').hide();
						}
					}
        		});
    		} else {
				self.applyBindings();
				self.$el.find('.table-vattu').hide();
				// var fileView = new ManageFileVIew({viewData:{"listFile":self.model.get('chungtu_dinhkem'), "el_btn_upload":".btn-add-file"}, el:self.$el.find(".list-attachment")});
				// fileView.render();
				// fileView.on("change", (event) => {
				// 	var listfile = event.data;
				// 	self.model.set('chungtu_dinhkem', listfile);
				// });
			}			
    		
		},
		savePhieu: function (mode = 0, dataView=null) {
			var self = this;
			var ma_goi_thau = self.model.get("ma_goi_thau");
			if (ma_goi_thau === undefined || ma_goi_thau === null || ma_goi_thau === ""){
				self.getApp().notify({message: "Vui lòng nhập mã gói thầu"}, {type: "danger", delay: 3000});
				return false;
			}
			var ten_goi_thau = self.model.get("ten_goi_thau");
			if (ten_goi_thau === undefined || ten_goi_thau === null || ten_goi_thau === ""){
				self.getApp().notify({message: "Vui lòng nhập tên gói thầu"}, {type: "danger", delay: 3000});
				return false;
			}
			var thoigian_trungthau = self.model.get("thoigian_trungthau");
			if (!thoigian_trungthau || thoigian_trungthau == null || thoigian_trungthau == undefined) {
				self.getApp().notify({message: "Vui lòng nhập ngày trúng gói thầu"}, {type: "danger", delay: 3000});
				return false;
			} 
			var thoigian_batdau = self.model.get("thoigian_batdau");
			if (!thoigian_batdau || thoigian_batdau == null || thoigian_batdau == undefined) {
				self.getApp().notify({message: "Vui lòng nhập thời gian thực hiện gói thầu"}, {type: "danger", delay: 3000});
				return false;
			}
			var thoigian_ketthuc = self.model.get("thoigian_ketthuc");
			if (thoigian_ketthuc === undefined || thoigian_ketthuc === null ){
				self.getApp().notify({message: "Vui lòng nhập thời gian kết thúc thực hiện gói thầu"}, {type: "danger", delay: 3000});
				return false;
			}
			self.model.set("ten_nguoi_lap_phieu",gonrinApp().currentUser.hoten);
			self.model.set("ma_nguoi_lap_phieu",gonrinApp().currentUser.id);

			self.model.save(null,{
				success: function (model, respose, options) {
					if (mode == 0) {
						self.getApp().notify("Lưu thông tin thành công");
						self.getApp().getRouter().navigate(self.collectionName + "/collection");
					} else  if (mode == 1) {
						self.model.set(model.attributes);
						var ketqua_trungthau_id = self.model.get("id");
						var thoigian_trungthau = self.model.get("thoigian_trungthau");
						if (thoigian_trungthau === null || thoigian_trungthau === undefined){
							thoigian_trungthau = moment().unix();
							self.model.set("thoigian_trungthau", thoigian_trungthau);
						}
						var nam_ke_hoach = self.model.get("nam_ke_hoach");
						if (nam_ke_hoach === undefined || nam_ke_hoach === null){
							var currentYear = new Date().getFullYear();
							self.model.set("nam_ke_hoach",currentYear);
						}
						var chitietVattu = new ChitietVattu({viewData: {"data": dataView, "ketqua_trungthau_id": ketqua_trungthau_id, "ma_goi_thau": self.model.get("ma_goi_thau"), "ten_goi_thau": self.model.get("ten_goi_thau"), "loai_goi_thau": self.model.get("loai_goi_thau"), "thuoc_goi_thau":self.model.get("thuoc_goi_thau"), "thoigian_trungthau":self.model.get("thoigian_trungthau"), "thoigian_batdau" : self.model.get("thoigian_batdau"), "thoigian_ketthuc" : self.model.get("thoigian_ketthuc"), "nam_ke_hoach" : self.model.get("nam_ke_hoach") }});

						chitietVattu.dialog();
						chitietVattu.on("saveVattu", function (event) {
							self.$el.find('.table-vattu').show();
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
				var ketqua_trungthau_id = self.model.get("id");
				var thoigian_trungthau = self.model.get("thoigian_trungthau");
				if (thoigian_trungthau === null || thoigian_trungthau === undefined){
					thoigian_trungthau = moment().unix();
					self.model.set("thoigian_trungthau", thoigian_trungthau);
				}
				var nam_ke_hoach = self.model.get("nam_ke_hoach");
				if (nam_ke_hoach === undefined || nam_ke_hoach === null){
					var currentYear = new Date().getFullYear();
					self.model.set("nam_ke_hoach",currentYear);
				}
				var chitietVattu = new ChitietVattu({viewData: {"data": dataView, "ketqua_trungthau_id": ketqua_trungthau_id, "ma_goi_thau": self.model.get("ma_goi_thau"), "ten_goi_thau": self.model.get("ten_goi_thau"), "loai_goi_thau": self.model.get("loai_goi_thau"), "thuoc_goi_thau":self.model.get("thuoc_goi_thau"), "thoigian_trungthau":self.model.get("thoigian_trungthau"), "thoigian_batdau" : self.model.get("thoigian_batdau"), "thoigian_ketthuc" : self.model.get("thoigian_ketthuc"), "nam_ke_hoach" : self.model.get("nam_ke_hoach") }});

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
			var thanhtien = (data.soluong_thucte ? data.soluong_thucte : 0)* (data.dongia? data.dongia:0);
			var tr_el = $("<tr>").attr({"id":data.id});
			tr_el.html(`<td class="stt text-center">` + 1 + `</td>
				<td class="ten_sanpham">${data.ten_sanpham}</td>
				<td class="donvitinh text-center">Kg</td>
				<td class="dongia text-center">` + Number(data.dongia).toLocaleString('de-DE')+ `</td>
				<td class="so_luong_ke_hoach text-center">` + (data.so_luong_ke_hoach ? data.so_luong_ke_hoach : "0") + `</td>
				<td class="so_luong_thucte text-center">` + (data.so_luong_thucte ? data.so_luong_thucte : "0") + `</td>
				<td class="text-center"><a href="javascript:;" class="demo-delete-row btn btn-danger btn-xs btn-icon" title="Xóa"><i class="fa fa-times"></i></a>
				<a  href="javascript:;"  class="demo-edit-row btn btn-success btn-xs btn-icon" title="Sửa"><i class="mdi mdi-pencil"></i></a></td>`);
			self.$el.find('.table-vattu tbody').append(tr_el);
			tr_el.find(".demo-delete-row").unbind("click").bind("click",{obj:data},function(e){
				e.stopPropagation();
				var data_vattu = e.data.obj;

				let deleteItem = null;
			
                self.$el.find("#exampleModalCenter1").modal("show");
                self.$el.find(".btn-item-deleted-continue").unbind("click").bind("click", function () {
                    deleteItem = true;
				});
				
				self.$el.find("#exampleModalCenter1").on("hidden.bs.modal", function (e) {
                    if (!!deleteItem){
						var url = (self.getApp().serviceURL || "") + '/api/v1/ketquathau_chitiet/' + data_vattu.id;
						$.ajax({
							url: url,
							type: 'DELETE',
							headers: {
								'content-type': 'application/json',
								'Access-Control-Allow-Origin': '*'
							},
							success: function(response) {
								deleteItem = null;
								var listVattu = self.model.get("chitiet_sanpham");
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
									if (arrayvattu.length == 0) {
										self.$el.find('.table-vattu').hide();
									}
									self.model.set("chitiet_sanpham", arrayvattu);
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
        
                    }
				});


				
			});
			tr_el.find(".demo-edit-row").unbind("click").bind("click",{obj:data},function(e){
				e.stopPropagation();
				var obj_data = e.data.obj;
				self.DialogChitietVattu(obj_data);
			});
		},
		onSaveDataVatTu: function (data_vattu) {
            var self = this;
            var listVattu = self.model.get("chitiet_sanpham");
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
                            continue
                        } else {
                            arrayvattu.push(listVattu[i]);
                        }
                    }
                    arrayvattu.push(data_vattu);
				}
				self.model.set("chitiet_sanpham", arrayvattu);
				if (arrayvattu.length > 0) {
					self.$el.find('.table-vattu').show();
				}
				if (exits == false) {
					self.$el.find('.table-vattu').show();
					self.appendHtmlChitietVatTu(data_vattu);
					self.fillStt();
				} else {
					var elt = self.$el.find(".table-vattu #" + data_vattu.id);
					elt.find('.donvitinh').text(self.fillDonvitinh(data_vattu.donvitinh));
					elt.find('.ten_sanpham').text(data_vattu.ten_vattu);
					elt.find('.so_luong_ke_hoach').text(data_vattu.so_luong_ke_hoach);
					elt.find('.so_luong_thucte').text(data_vattu.so_luong_thucte);
					elt.find('.dongia').text(Number(data_vattu.dongia).toLocaleString('de-DE'));
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
		fillDonvitinh : function(donvitinh){
			var self = this;
			var result = "";     
			console.log("donvitinh===========: ", donvitinh)     
			for(var i=0; i< danhmuc_donvitinh.length; i++){
				if(danhmuc_donvitinh[i].value === donvitinh){
					result = danhmuc_donvitinh[i].text;
					break;
				}
			}
			if (result !== "" && result !== undefined && result !== null){
				return result;
			}
			return "Kg";
		}
    });

});