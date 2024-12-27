define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/quanlykho/PhieuXuat/tpl/model.html'),
	schema 				= require('json!schema/PhieuXuatKhoSchema.json');
	var DanhMucSelectView = require('app/quanlykho/DanhMucKho/SelectView');
	var ChitietVattu = require('app/quanlykho/PhieuXuat/ChitietPhieuDialog/ChitietVatTu');
	var ManageFileVIew = require("app/view/AttachFile/ManageFileUploadView");
	var KhachHangDonVi = require('app/quanlykho/PhieuXuat/KhachHangDialog');
	var QRCodeDialog =require('app/quanlykho/PhieuXuat/QRcodeDialog');
    var AttachFileVIew = require("app/view/AttachFile/AttachFileVIew");
    var ResultImportExcel = require('app/quanlykho/PhieuXuat/ResultImportExcel');


    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "phieuxuatkho",
		setIdDonvi: false,
		setObjectDonvi: false,
		hasView: false,
		setKho : false,
		checkCreateQr: false,
		checkId: false,
		listChiTiet: [],
		isSetKho: null,
		isSetIdKho: false,
		isViewKho: false,
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
		    	    	buttonClass: "btn-success width-sm btn-save ml-2",
		    	    	label: `<i class="far fa-save"></i> Lưu`,
		    	    	command: function(){
		    	    		var self = this;
							self.model.set("ten_nguoi_lap_phieu",gonrinApp().currentUser.hoten);
							self.model.set("ma_nguoi_lap_phieu",gonrinApp().currentUser.id);
							var thoigian_xuat = self.model.get("thoigian_xuat");
							if (thoigian_xuat === undefined || thoigian_xuat === null){
								self.getApp().notify({message: "Vui lòng chọn thời gian xuất."}, {type: "danger", delay : 1000 });
								return;
							}
							var kho = self.model.get("kho");
							if (!kho || kho == null || kho == undefined) {
								self.getApp().notify({message: "Vui lòng chọn kho xuất hàng."}, {type: "danger", delay: 5000});
								return;
							} else {
								self.model.set({
									"ma_kho": kho.id,
									"ten_kho" : kho.ten_kho
								})
							}
							var tmp = self.validate_loai_xuatban();
							if (tmp == false){
								return;
							}
		                    self.model.save(null,{
		                        success: function (model, respose, options) {
		                            self.getApp().notify("Lưu thông tin thành công");
									self.$el.find(".btn-xacnhan").removeClass("d-none");
									if (self.checkCreateQr === false && self.checkId === false){
										self.genQR();
										self.checkCreateQr = true;
									}
									else{
										self.model.set(respose);
									}
		                        },
		                        error: function (xhr, status, error) {
									try {
										if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED"){
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
		    	    	buttonClass: "btn-danger width-sm btn-delete ml-2",
		    	    	label:  `<i class="fas fa-trash-alt"></i> Xóa`,
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
											delete_success = null;
											self.getApp().hideloading();
											self.getApp().notify('Xoá dữ liệu thành công');
											self.getApp().getRouter().navigate(self.collectionName + "/collection");
										},
										error: function (xhr, status, error) {
											self.getApp().hideloading();
											delete_success = null;
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
					{
						name : "xacnhan",
						type : "button",
						buttonClass: "btn-primary waves-effect btn-xacnhan width-sm ml-2 d-none",
						label: `<i class="far fa-check-circle"></i> Xác nhận`,
						// visible: function(){
		    	    	// 	return this.getApp().getRouter().getParam("id") !== null;
						// },
						command: function(){
							var self = this;
							self.xacNhan();
						}
					},
					{
						name : "huyxacnhan",
						type : "button",
						buttonClass: "btn-danger waves-effect btn-huyxacnhan width-sm ml-2 d-none",
						label: `<i class="far fa-check-circle"></i> Hủy xác nhận`,
						// visible: function(){
		    	    	// 	return this.getApp().getRouter().getParam("id") !== null;
						// },
						command: function(){
							var self = this;
							self.huyXacNhan();
						}
					},
					{
						name: "print",
						type: "button",
						buttonClass: "btn-primary waves-effect btn-print width-sm ml-2",
						label: "<i class='fa fa-file-pdf'></i> In Phiếu",
						visible: function(){
		    	    		return this.getApp().getRouter().getParam("id") !== null;
		    	    	},
						command: function(){
							var self = this;
							self.getApp().showloading();
							var params = JSON.stringify({
								"id": self.model.get("id"),
								"type": "phieuxuat_kho"
							});
							$.ajax({
								url: (self.getApp().serviceURL || "") + '/api/v1/export_pdf_kho',
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
										self.getApp().notify({ message: "Lưu thông tin không thành công"}, { type: "danger", delay: 1000 });
									}
								},
							});
						}
					}
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
						field:"loai_xuat",
						uicontrol:"combobox",
						textField: "text",
						valueField: "value",
						cssClass:"form-control",
							dataSource: [
							{ value: "sudung", text: "Xuất sử dụng" },
							{ value: "taitro", text: "Xuất tài trợ" },
							{ value: "ban", text: "Xuất bán" },
							{ value: "tra", text: "Xuất trả" },
							{ value: "huy", text: "Xuất hủy" }
						],
					},
					{
						field:"hinhthuc_giaodich",
						uicontrol:"combobox",
						textField: "text",
						valueField: "value",
						cssClass:"form-control",
							dataSource: [
								{ value: 1, text: "Liên doanh, liên kết" },
								{ value: 2, text: "Mua thương mại" },
								{ value: 3, text: "Mua sử dụng" },
								{ value: 4, text: "Khác" },
						],
					},
					{
						field:"loai_xuat_ban",
						uicontrol:"combobox",
						textField: "text",
						valueField: "value",
						cssClass:"form-control",
							dataSource: [
							{ value: 1, text: "Xuất bán cho đơn vị" },
							{ value: 2, text: "Xuất bán lẻ" },
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
						field:"thoigian_xuat",
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
						field:"thoigian_batdau_vanchuyen",
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
						field:"thoigian_ketthuc_vanchuyen",
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
		tongtien_vattu: 0,
    	render:function(){
			var self = this;
			self.setIdDonvi = false;
			self.setObjectDonvi = false;
			self.hasView = false;
			self.setKho = false;
			self.checkCreateQr = false;
			self.checkId = false;
			self.listChiTiet = [];
			self.isSetKho = false;
			self.isSetIdKho = false;
			self.isViewKho = false;
			var id = this.getApp().getRouter().getParam("id");
			self.tongtien_vattu = 0;

            self.$el.find(`.btn-download`).unbind("click").bind("click", (event)=>{
                event.stopPropagation();
                let url = self.getApp().serviceURL + `/static/template_import_excel/Template_ImportXuatKho.xlsx`;
                window.open(url, '_blank');
            })


			self.$el.find('.btn-add-vattu').unbind("click").bind("click", function (e) {
				e.stopPropagation();
				self.DialogChitietVattu();
			});
			if ($(window).width() < 768) {
				self.$el.find(".border-left").removeClass('border-left');
			}
    		if(id){
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data){
						self.applyBindings();
						self.selectizeKho();
						self.checkId == true;
						self.genQR(id);
						self.$el.find(".btn-xacnhan").removeClass("d-none");
						self.getDanhSachDuocLieu(id);
        			},
        			error:function(){
    					self.getApp().notify(self.getApp().traslate("TRANSLATE:error_load_data"));
					},
					complete:function(){
                        var fileView = new ManageFileVIew({ viewData: { "listFile": self.model.get('chungtu_dinhkem'), "$el_btn_upload": self.$el.find(".btn-add-file") }, el: self.$el.find(".list-attachment") });
						fileView.render();
						fileView.on("change", (event) => {
							var listfile = event.data;
							self.model.set('chungtu_dinhkem', listfile);
						});
						self.render_loai_xuatban();
						self.register_loai_xuatban();
						self.selectizeDonViTiepNhan();
						self.appendKhachHang();
						self.check_trangthai();
						self.importExcel(self, '/api/v1/import_excel_xuatkho');

						self.$el.find(`.btn-import`).unbind("click").bind("click", (event)=>{
							event.stopPropagation();
							self.$el.find("#upload_files_import").unbind("click").click();
						})
					}
        		});
    		} else {
				self.applyBindings();
				self.selectizeKho();
				self.selectizeDonViTiepNhan();
				self.appendKhachHang();
				self.initButton();
				self.importExcel(self, '/api/v1/import_excel_xuatkho');
				self.$el.find('.table-vattu').addClass("d-none");
				self.register_loai_xuatban();
				var currentDate = moment().unix();
				self.model.set("thoigian_taophieu", currentDate);
				var fileView = new ManageFileVIew({ viewData: { "listFile": self.model.get('chungtu_dinhkem'), "$el_btn_upload": self.$el.find(".btn-add-file") }, el: self.$el.find(".list-attachment") });
				fileView.render();
				fileView.on("change", (event) => {
					var listfile = event.data;
					self.model.set('chungtu_dinhkem', listfile);
				});
				self.$el.find(`.btn-import`).unbind("click").bind("click", (event)=>{
                    event.stopPropagation();
                    let id = self.model.get("id");
                    if (!id){
                        self.savePhieu(2);
                    }
                    else{
                        self.$el.find("#upload_files_import").unbind("click").click();
                    }
                })
    		}
    		
		},
		savePhieu: function (mode = 0) {
			var self = this;
			var loai_xuat_ban = self.model.get("loai_xuat_ban");
			if (loai_xuat_ban === undefined || loai_xuat_ban === null){
				self.getApp().notify({message : "Vui lòng chọn hình thức xuất"}, {type : "danger", delay : 2000});
				return;
			}
			// var ten_donvi_cungung = self.model.get("ten_donvi_cungung");
			// if (!ten_donvi_cungung || ten_donvi_cungung == null || ten_donvi_cungung == undefined) {
			// 	self.getApp().notify({message: "Vui lòng nhập tên đơn vị cung ứng."}, {type: "danger", delay: 5000});
			// 	return;
			// } 
			var kho = self.model.get("kho");
			if (!kho || kho == null || kho == undefined) {
				self.getApp().notify({message: "Vui lòng chọn kho xuất hàng."}, {type: "danger", delay: 5000});
				return;
			} else {
				self.model.set({
					"ma_kho": kho.id,
					"ten_kho" : kho.ten_kho
				})
			}
			self.model.set("ten_nguoi_lap_phieu",gonrinApp().currentUser.fullname);
			self.model.set("ma_nguoi_lap_phieu",gonrinApp().currentUser.id);

			var tmp = self.validate_loai_xuatban();
			if (tmp == false){
				return;
			}
			self.model.save(null,{
				success: function (model, respose, options) {
					if (mode == 0) {
						self.getApp().notify("Lưu thông tin thành công");
						self.getApp().getRouter().navigate(self.collectionName + "/collection");
					} else  if (mode == 1) {
						self.model.set(model.attributes);
						self.DialogChitietVattu();
					}
					else if (mode ==2){
                        self.$el.find("#upload_files_import").unbind("click").click();
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
				self.savePhieu(1);
			} else {
				var phieuxuat_id = self.model.get("id");
				var thoigian_taophieu = self.model.get("thoigian_taophieu");
				if (thoigian_taophieu == null || thoigian_taophieu == undefined) {
					thoigian_taophieu = moment().unix();
					self.model.set("thoigian_taophieu", thoigian_taophieu);
				}
				var thoigian_xuat = self.model.get("thoigian_xuat");
				if (thoigian_xuat === undefined || thoigian_xuat === null){
					thoigian_xuat = moment().unix();
					self.model.set("thoigian_xuat", thoigian_xuat);
				}
				var chitietVattu = new ChitietVattu({viewData: {"data": dataView, "phieuxuat_id": phieuxuat_id, "so_phieu_chungtu": self.model.get("so_phieu_chungtu"),"thoigian_taophieu": thoigian_taophieu, "ma_kho":self.model.get("ma_kho"), "ten_kho":self.model.get("ten_kho"), "thoigian_xuat" : self.model.get("thoigian_xuat"), "ma_donvi_tiepnhan" : self.model.get("ma_donvi_tiepnhan"), "ten_donvi_tiepnhan" : self.model.get("ten_donvi_tiepnhan"), "donvi_tiepnhan" : self.model.get("donvi_tiepnhan"), "ten_nguoinhan" : self.model.get("ten_nguoinhan"), "diachi_nguoinhan" : self.model.get("diachi_nguoinhan"), "dienthoai_nguoinhan" : self.model.get("dienthoai_nguoinhan"), "loai_xuat_ban" : self.model.get("loai_xuat_ban")}});

				chitietVattu.dialog({size:'large'});
				chitietVattu.on("saveVattu", function (event) {
					self.$el.find('.table-vattu').removeClass("d-none");
					self.$el.find('.search').removeClass("d-none");
					var data_sanpham = event.data;
					self.onSaveDataVatTu(data_sanpham);

				});
			}
		},
		appendHtmlChitietVatTu: function (data) {
			var self = this;
			var thanhtien = (data.soluong_thucte ? data.soluong_thucte : 0)* (data.dongia? data.dongia:0);

			self.$el.find('.table-vattu').removeClass("d-none");
            self.$el.find('.search').removeClass("d-none");

			self.$el.find('.table-vattu tbody').append(`
				<tr id="${data.id}">
					<td class="stt text-center">${1}</td>
					<td class="so_lo">${data.so_lo? data.so_lo: ""}</td>
					<td class="ten_sanpham">${data.ten_sanpham? data.ten_sanpham: ""}</td>
					<td class="soluong_chungtu text-right">${data.soluong_chungtu? Number(data.soluong_chungtu).toLocaleString("de-DE"):0}</td>
					<td class="soluong_thucte text-right">${data.soluong_thucte? Number(data.soluong_thucte).toLocaleString("de-DE"): 0}</td>
					<td class="dongia text-right">${data.dongia? Number(data.dongia).toLocaleString("de-DE"): 0}</td>
					<td class="thanhtien text-right">${thanhtien? Number(thanhtien).toLocaleString("de-DE"): 0}</td>
					<td class="text-center">
						<a href="javascript:;" class="demo-delete-row btn btn-danger btn-xs btn-icon mr-1" title="Xóa"><i class="fa fa-times"></i></a>
					</td>
					<td>
						<a  href="javascript:;"  class="demo-edit-row btn btn-success btn-xs btn-icon" title="Sửa"><i class="mdi mdi-pencil"></i></a>
					</td>
				</tr>
			`)

			self.$el.find(`#${data.id} .demo-delete-row`).unbind("click").bind("click",{obj:data},function(e){
				e.stopPropagation();
				var data_sanpham = e.data.obj;

				let deleteItem = null;
			
                self.$el.find("#exampleModalCenter1").modal("show");
                self.$el.find(".btn-item-deleted-continue").unbind("click").bind("click", function () {
                    deleteItem = true;
				});
				
				self.$el.find("#exampleModalCenter1").on("hidden.bs.modal", function (e) {
					if (deleteItem){
						var url = (self.getApp().serviceURL || "") + '/api/v2/phieuxuatkho_chitiet/' + data_sanpham.id;
						$.ajax({
							url: url,
							type: 'DELETE',
							headers: {
								'content-type': 'application/json',
								'Access-Control-Allow-Origin': '*'
							},
							success: function(response) {
								deleteItem = null;
								if (Array.isArray(self.listChiTiet) === false){
									self.listChiTiet = [];
								}
								self.listChiTiet = self.listChiTiet.filter((value)=>{
									return value.id != data_sanpham.id;
								})
								if (self.listChiTiet.length == 0) {
									self.$el.find('.table-vattu').addClass("d-none");
									self.$el.find('.search').addClass("d-none");
								}
								self.$el.find(`.table-vattu #${data_sanpham.id}`).remove();
								var giatien = gonrinApp().convert_string_to_number(data_sanpham.dongia);
								var soluong = gonrinApp().convert_string_to_number(data_sanpham.soluong_thucte);
								self.tongtien_vattu = self.tongtien_vattu - giatien * soluong;
								self.$el.find('.tongtien-vattu').text(Number(self.tongtien_vattu).toLocaleString());
							},
							error: function(xhr, status, error) {
								deleteItem = null;
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
			self.$el.find(`#${data.id} .demo-edit-row`).unbind("click").bind("click",{obj:data},function(e){
				e.stopPropagation();
				var obj_data = e.data.obj;
				self.DialogChitietVattu(obj_data);
			});
		},
		onSaveDataVatTu: function (data_sanpham) {
            var self = this;
			if (Array.isArray(self.listChiTiet) === false){
                self.listChiTiet = [];
            }
            var exits = self.listChiTiet.some((value)=>{
                return value.id === data_sanpham.id;
            })
			var oldData = self.listChiTiet.find((value)=>{
				return value.id === data_sanpham.id;
			})
			if (!!oldData){
				var giatien = gonrinApp().convert_string_to_number(oldData.dongia);
				var soluong = gonrinApp().convert_string_to_number(oldData.soluong_thucte);
				self.tongtien_vattu = self.tongtien_vattu - giatien * soluong;
				self.$el.find('.tongtien-vattu').text(Number(self.tongtien_vattu).toLocaleString());
			}

			var giatien = gonrinApp().convert_string_to_number(data_sanpham.dongia);
			var soluong = gonrinApp().convert_string_to_number(data_sanpham.soluong_thucte);
			self.tongtien_vattu = self.tongtien_vattu + giatien * soluong;
			self.$el.find('.tongtien-vattu').text(Number(self.tongtien_vattu).toLocaleString());


			if (exits == false) {
                self.$el.find('.table-vattu').removeClass("d-none");
                self.$el.find('.search').removeClass("d-none");
				self.listChiTiet.push(data_sanpham);
				self.appendHtmlChitietVatTu(data_sanpham);
				self.fillStt();
			} else {
				var thanhtien = (data_sanpham.soluong_thucte ? data_sanpham.soluong_thucte : 0)* (data_sanpham.dongia? data_sanpham.dongia:0);
				var elt = self.$el.find(".table-vattu #" + data_sanpham.id);
				elt.find('.so_lo').text(data_sanpham.so_lo);
				elt.find('.ten_sanpham').text(data_sanpham.ten_sanpham);
				elt.find('.soluong_chungtu').text(data_sanpham.soluong_chungtu);
				elt.find('.soluong_thucte').text(data_sanpham.soluong_thucte);
				elt.find('.dongia').text(Number(data_sanpham.dongia).toLocaleString());
				elt.find('.thanhtien').text(Number(thanhtien).toLocaleString());
				elt.find(".demo-edit-row").unbind("click").bind("click",{obj:data_sanpham},function(e){
					e.stopPropagation();
					var obj_data = e.data.obj;
					self.DialogChitietVattu(obj_data);
				});


				elt.find(`.demo-delete-row`).unbind("click").bind("click",{obj:data_sanpham},function(e){
					e.stopPropagation();
					var data_sanpham = e.data.obj;
	
					let deleteItem = null;
				
					self.$el.find("#exampleModalCenter1").modal("show");
					self.$el.find(".btn-item-deleted-continue").unbind("click").bind("click", function () {
						deleteItem = true;
					});
					
					self.$el.find("#exampleModalCenter1").on("hidden.bs.modal", function (e) {
						if (deleteItem){
							var url = (self.getApp().serviceURL || "") + '/api/v1/phieuxuatkho_chitiet/' + data_sanpham.id;
							$.ajax({
								url: url,
								type: 'DELETE',
								headers: {
									'content-type': 'application/json',
									'Access-Control-Allow-Origin': '*'
								},
								success: function(response) {
									deleteItem = null;
									if (Array.isArray(self.listChiTiet) === false){
										self.listChiTiet = [];
									}
									self.listChiTiet = self.listChiTiet.filter((value)=>{
										return value.id != data_sanpham.id;
									})
									if (self.listChiTiet.length == 0) {
										self.$el.find('.table-vattu').addClass("d-none");
										self.$el.find('.search').addClass("d-none");
									}
									self.$el.find(`.table-vattu #${data_sanpham.id}`).remove();
									var giatien = gonrinApp().convert_string_to_number(data_sanpham.dongia);
									var soluong = gonrinApp().convert_string_to_number(data_sanpham.soluong_thucte);
									self.tongtien_vattu = self.tongtien_vattu - giatien * soluong;
									self.$el.find('.tongtien-vattu').text(Number(self.tongtien_vattu).toLocaleString());
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


                let arr = self.listChiTiet.filter((value) =>{
                    return value.id != data_sanpham.id;
                })

                arr.push(data_sanpham);
                self.listChiTiet = arr;
			}
		},
		fillStt: function () {
			var self = this;
			var stt = self.$el.find(".stt");
			$.each(stt, (index, element) => {
				$(element).text(index + 1);
			});
		},
		validate_loai_xuatban : function(){
			var self = this;
			var loai_xuat_ban = self.model.get("loai_xuat_ban");
			if (loai_xuat_ban === undefined || loai_xuat_ban === null){
				self.getApp().notify({message : "Vui lòng chọn loại xuất bán"}, {type : "danger", delay : 2000});
				return false;
			}
			else{
				if (loai_xuat_ban == 1){
					var donvi_tiepnhan = self.model.get("donvi_tiepnhan");
					if (donvi_tiepnhan === undefined || donvi_tiepnhan === null){
						self.getApp().notify({message : "Vui lòng chọn đơn vị tiếp nhận"}, {type : "danger", delay : 2000});
						return false;
					}
				}
				else if (loai_xuat_ban ==2){
					var ten_nguoinhan = self.model.get("ten_nguoinhan");
					if (ten_nguoinhan === undefined || ten_nguoinhan === null || ten_nguoinhan === ""){
						self.getApp().notify({message : "Vui lòng nhập tên người tiếp nhận"}, {type : "danger" , delay : 2000});
						return false;
					}
					var dienthoai_nguoinhan = self.model.get("dienthoai_nguoinhan");
					if (dienthoai_nguoinhan === undefined || dienthoai_nguoinhan === null || dienthoai_nguoinhan === ""){
						self.getApp().notify({message : "Vui lòng nhập số điện thoại người tiếp nhận"}, {type : "danger", delay : 2000});
						return false;
					}
				}
				return true;
			}
		},
		selectizeDonViTiepNhan: function(){
			var self = this;
			let loai_xuat_ban = self.model.get("loai_xuat_ban");
			if (loai_xuat_ban === 1){
				var $selectize = self.$el.find('#selectize-donvi_tiepnhan').selectize({
					valueField: 'id',
					labelField: 'ten_coso',
					searchField: ['ten_coso', 'tenkhongdau'],
					preload: true,
					maxOptions : 50,
					maxItems : 1,
					load: function(query, callback) {
						let donvi_tiepnhan = self.model.get("donvi_tiepnhan");
						if (!!donvi_tiepnhan && self.setObjectDonvi === false){
							callback([donvi_tiepnhan]);
							self.setObjectDonvi = true;	
						}
						var url = (self.getApp().serviceURL || "") + '/api/v1/get_ds_donvi_khachhang';
						$.ajax({
							url: url,
							type: 'POST',
							data: JSON.stringify({
								query,
								type: 1,
								donvi_id: gonrinApp().currentUser.donvi_id
							}),
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
						var $selectz = (self.$el.find('#selectize-donvi_tiepnhan'))[0];
						var obj = $selectz.selectize.options[value];
						if (obj !== undefined && obj !== null){
							self.model.set("donvi_tiepnhan", obj);
							var ten_donvi_tiepnhan = obj.ten_coso;
							if (ten_donvi_tiepnhan !== undefined && ten_donvi_tiepnhan !== null && ten_donvi_tiepnhan !== ""){
								self.model.set("ten_donvi_tiepnhan", ten_donvi_tiepnhan);
							}
							var ma_donvi_tiepnhan = obj.id;
							if (ma_donvi_tiepnhan !== undefined && ma_donvi_tiepnhan !== null && ma_donvi_tiepnhan !== ""){
								self.model.set("ma_donvi_tiepnhan", ma_donvi_tiepnhan);
							}
							let dienthoai = obj.dienthoai;
							self.model.set("dienthoai_nguoinhan", dienthoai);
							let diachi = obj.diachi;
							self.model.set("diachi_nguoinhan", diachi);
						}
						else{
							self.model.set("donvi_tiepnhan", null);
							self.model.set("ten_donvi_tiepnhan", null);
							self.model.set("ma_donvi_tiepnhan", null);
							self.model.set("dienthoai_nguoinhan", null);
							self.model.set("diachi_nguoinhan", null);
						}
					}
				});
			}
			else if (loai_xuat_ban ===2){
				var $selectize = self.$el.find('#selectize-donvi_tiepnhan').selectize({
					valueField: 'id',
					labelField: 'hoten',
					searchField: ['hoten', 'tenkhongdau'],
					preload: true,
					maxOptions : 50,
					maxItems : 1,
					load: function(query, callback) {
						var url = (self.getApp().serviceURL || "") + '/api/v1/get_ds_donvi_khachhang';
						$.ajax({
							url: url,
							type: 'POST',
							data: JSON.stringify({
								query,
								type: 2,
								donvi_id: gonrinApp().currentUser.donvi_id
							}),
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
						var $selectz = (self.$el.find('#selectize-donvi_tiepnhan'))[0];
						var obj = $selectz.selectize.options[value];
						if (obj !== undefined && obj !== null){
							let hoten = obj.hoten;
							self.model.set("ten_nguoinhan", hoten);
							let dienthoai = obj.dienthoai;
							self.model.set("dienthoai_nguoinhan", dienthoai);
							let diachi = obj.diachi;
							self.model.set("diachi_nguoinhan", diachi);
						}
						else{

						}
					}
				});
			}
		},
		register_loai_xuatban : function(){
			var self = this;
			self.model.on("change:loai_xuat_ban", function(){
				var loai_xuat_ban = self.model.get("loai_xuat_ban");
				if (loai_xuat_ban ==1){
					self.$el.find(".donvi_tiepnhan").removeClass("d-none");
					self.$el.find(".ten_donvi_tiepnhan").removeClass("d-none");
					self.$el.find(".sogiayphep").removeClass("d-none");
					self.$el.find(".text-donvi_tiepnhan").text("Tìm kiếm đơn vị");
					let select = (self.$el.find("#selectize-donvi_tiepnhan"))[0];
					self.model.set("donvi_tiepnhan", null);
					self.model.set("ten_donvi_tiepnhan", null);
					self.model.set("ma_donvi_tiepnhan", null);
					self.model.set("dienthoai_nguoinhan", null);
					self.model.set("diachi_nguoinhan", null);
					if (!!select && !!select.selectize){
						select.selectize.destroy();
					}
					self.selectizeDonViTiepNhan();
				}
				else{
					self.$el.find(".donvi_tiepnhan").removeClass("d-none");
					self.$el.find(".ten_donvi_tiepnhan").addClass("d-none");
					self.$el.find(".sogiayphep").addClass("d-none");
					self.$el.find(".text-donvi_tiepnhan").text("Tìm kiếm khách hàng");
					let select = (self.$el.find("#selectize-donvi_tiepnhan"))[0];
					self.model.set("donvi_tiepnhan", null);
					self.model.set("ten_donvi_tiepnhan", null);
					self.model.set("ma_donvi_tiepnhan", null);
					self.model.set("dienthoai_nguoinhan", null);
					self.model.set("diachi_nguoinhan", null);
					if (!!select && !!select.selectize){
						select.selectize.destroy();
					}
					self.selectizeDonViTiepNhan();
				}
			})
		},
		render_loai_xuatban : function(){
			var self = this;
			var loai_xuat_ban = self.model.get("loai_xuat_ban");
			if (loai_xuat_ban ==1){
				self.$el.find(".donvi_tiepnhan").removeClass("d-none");
				self.$el.find(".text-donvi_tiepnhan").text("Tìm kiếm đơn vị");
				self.$el.find(".ten_donvi_tiepnhan").removeClass("d-none");
				self.$el.find(".sogiayphep").removeClass("d-none");
			}
			else{
				self.$el.find(".donvi_tiepnhan").removeClass("d-none");
				self.$el.find(".ten_donvi_tiepnhan").addClass("d-none");
				self.$el.find(".sogiayphep").addClass("d-none");
				self.$el.find(".text-donvi_tiepnhan").text("Tìm kiếm khách hàng");
			}
		},
		xacNhan : function(){
			var self = this;
			var params = JSON.stringify({
				"id_phieuxuat": self.model.get("id"),
			});
			self.getApp().showloading();
			$.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/xacnhan_phieuxuat',
				dataType: "json",
				contentType: "application/json",
				method: 'POST',
				data: params,
				success: function(response) {
					self.getApp().hideloading();

					if (gonrinApp().hasRole("admin_donvi")){
						self.$el.find(".btn-huyxacnhan").removeClass("d-none");
					}

					var phieuxuat = response.phieuxuat;
					if (!!phieuxuat && phieuxuat.loai_xuat_ban == 1){
						self.getApp().notify({message : "Xác nhận thành công, thông tin xuất hàng của đơn vị đã được thông báo tới đơn vị tiếp nhận"});
						self.getApp().getRouter().navigate(self.collectionName + "/collection");
					}
					else if (!!phieuxuat && phieuxuat.loai_xuat_ban == 2){
						self.getApp().notify({message : "Xác nhận thành công"});
						self.getApp().getRouter().navigate(self.collectionName + "/collection");
					}
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
		huyXacNhan : function(){
			var self = this;
			var params = JSON.stringify({
				"id_phieuxuat": self.model.get("id"),
			});
			self.getApp().showloading();
			$.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/huy_xacnhan_phieuxuat',
				dataType: "json",
				contentType: "application/json",
				method: 'POST',
				data: params,
				success: function(response) {
					self.getApp().hideloading();
					self.getApp().notify({message : "Hủy xác nhận thành công"});
					self.getApp().getRouter().refresh();
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
		selectizeKho: function () {
			var self = this;
			var currentUser = self.getApp().currentUser;
			var donvi_id = "";
			if (!!currentUser && !!currentUser.donvi) {
				donvi_id = currentUser.donvi.id;
			}
			var $selectize0 = self.$el.find('#chonkho').selectize({
				maxItems: 1,
				valueField: 'id',
				labelField: 'ten_kho',
				searchField: ['ten_kho'],
				preload: true,
				load: function (query, callback) {
					var query_filter = {
						"filters": {
							"$and": [{
								"$or": [
									{ "ten_kho": { "$likeI": (query) } },
								]
							},
							{ "donvi_id": { "$eq": donvi_id } },
							{"active": {"$eq": 1}}
							]
						},
						"order_by": [{ "field": "loai_uu_tien", "direction": "asc" }]
					};
					let objs = self.model.get("kho");
					if (!!objs && self.isSetKho === false){
						callback([objs]);
						self.isSetKho = true;
					}
					var url = (self.getApp().serviceURL || "") + '/api/v1/danhmuc_kho?page=1&results_per_page=20' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
					$.ajax({
						url: url,
						type: 'GET',
						dataType: 'json',
						error: function () {
							callback();
						},
						success: function (res) {
							callback(res.objects);
							var id = self.model.get("id");
							if (!id) {
								var khoChinh = res.objects.filter((value, index) => {
									return value.kho_mac_dinh === true;
								})
								if (khoChinh.length === 0) {
									if (res.objects.length > 0) {
										let tmp = res.objects[0];
										$selectize0[0].selectize.setValue([tmp.id]);
									}
								}
								else {
									let tmp = khoChinh[0];
									$selectize0[0].selectize.setValue([tmp.id]);
								}
							}
							else {
								var khoId = self.model.get('ma_kho');
								if (!!khoId && self.isSetIdKho === false) {
									$selectize0[0].selectize.setValue(khoId);
									self.isSetIdKho = true;
								}
								$selectize0[0].selectize.disable();
							}
						}
					});
				},
				onChange: function (value) {
					var obj = $selectize0[0].selectize.options[value];
					if (obj !== null && obj !== undefined) {
						let id = self.model.get("id");
						if (!id || self.setKho == true) {
							self.model.set({
								"ma_kho": value,
								"ten_kho": obj.ten_kho,
								"kho": obj
							})
						}
						else {
							self.setKho = true;
						}
					} else {
						self.model.set({
							"ma_kho": null,
							"ten_kho": null,
							"kho": null
						})
					}
				}
			});
		},
		appendKhachHang: function(){
			var self = this;
			self.$el.find(".btn-add-donvi").unbind("click").bind("click", (e)=>{
				e.stopPropagation();
				let loai_xuat_ban = self.model.get("loai_xuat_ban");
				if (!loai_xuat_ban){
					self.getApp().notify({message: "Vui lòng chọn loại xuất bán"}, {type:"danger", delay : 1000});
					return false;
				}
				else{
					let khachHang = new KhachHangDonVi({viewData:{donvi_id: gonrinApp().currentUser.donvi_id, loai_xuat_ban}});
					khachHang.dialog({size:'large'});
					khachHang.on("saveData", (e)=>{
						if (!!e && e.data){
							let data = e.data;
							let type = data.type;
							if (type ===1){
								self.model.set({
									'donvi_tiepnhan': data,
									'ma_donvi_tiepnhan': data.id,
									'ten_donvi_tiepnhan': data.ten_coso,
									'dienthoai_nguoinhan': data.dienthoai,
									'diachi_nguoinhan': data.diachi,
									'ten_nguoinhan': data.hoten
								})
								self.$el.find('#sogiayphep').text(data.sogiayphep);
							}
							else{
								self.model.set({
									'ten_nguoinhan': data.hoten,
									'dienthoai_nguoinhan': data.dienthoai,
									'diachi_nguoinhan': data.diachi
								})
							}
						}
					})
				}
			})
		},
		check_trangthai: function(){
			var self = this;
			let xacnhan = self.model.get("xacnhan");
			if (xacnhan ===1 || xacnhan ===2){
				self.$el.find("input,textarea").prop("disabled", true);
				self.$el.find(".btn-add-file,.btn-add-donvi,.btn-add-vattu,.btn-save,.btn-delete,.btn-xacnhan,.demo-delete-row,.demo-edit-row,.btn-download,.btn-import").remove();
				let select = (self.$el.find('#selectize-donvi_tiepnhan')[0]);
				if (!!select && !!select.selectize){
					select.selectize.disable();
				}

				if (gonrinApp().hasRole("admin_donvi")){
					self.$el.find('.btn-huyxacnhan').removeClass("d-none");
				}
			}
		},
		genQR: function(id){
			var self = this;
			self.$el.find('.div_qr').removeClass('d-none');
			let url = self.getApp().serviceURL + `/api/v1/phieuxuat?id=${id}`
			var qrcode = new QRCode(document.getElementById("qrcode"), {
				width: 50,
				height: 50,
				colorDark: "#000000",
				colorLight: "#ffffff",
				text: url,
				logoWidth: undefined,
				logoHeight: undefined,
				logoBackgroundColor: '#ffffff',
				logoBackgroundTransparent: false,
				quietZone: 5
			});
			self.$el.find("#qrcode").unbind('click').bind('click', function() {
				let qrcodeDialog = new QRCodeDialog({viewData: self.model.get("id")});
				qrcodeDialog.dialog();
			});
		},
		importExcel: function (model, url) {
			var self = this;
            model.$el.append(`<input type="file" class="form-control d-none" id="upload_files_import" lang="vi" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .csv, application/vnd.ms-excel">`);
            model.$el.find("#upload_files_import").on("change", function(e) {
                var result = model.$el.find("#upload_files_import")[0].files[0];
                model.getApp().showloading();
                if (!!result) {
                    var http = new XMLHttpRequest();
                    var fd = new FormData();
                    fd.append('file', result, result.name);
                    http.open('POST', gonrinApp().serviceURL + url);
                    var token = !!gonrinApp().currentUser ? gonrinApp().currentUser.token : null;
                    http.setRequestHeader("X-USER-TOKEN", token);
                    http.setRequestHeader("X-ID", self.model.get("id"))
                    http.setRequestHeader("type_file", 1);
                    http.upload.addEventListener('progress', function(evt) {
                        if (evt.lengthComputable) {
                            var percent = evt.loaded / evt.total;
                            percent = parseInt(percent * 100);

                        }
                    }, false);
                    http.addEventListener('error', function(error) {
                        model.getApp().hideloading();
                        model.getApp().notify({ message: "Lỗi: Không thể tải được file lên hệ thống" }, { type: "danger", delay: 1000 });
                        return;
                    }, false);
                    http.onreadystatechange = function() {
                        model.getApp().hideloading();
                        if (http.readyState === 4) {
                            if (http.status === 200) {
                                self.getApp().notify({ message: "Import dữ liệu thành công" });
                                let res = JSON.parse(http.responseText);
								let listSuccess = res.listSuccess;
								if (Array.isArray(listSuccess) === false){
									listSuccess = [];
								}
	
	
								for (let i = 0; i<listSuccess.length; i++){
									self.onSaveDataVatTu(listSuccess[i]);
								}
	
								var resultView = new ResultImportExcel({ viewData: { "listFailed": res.listFailed, "countCreate": res.countCreate, "countUpdate": res.countUpdate } });
								resultView.dialog({ "size": "large" });
    
                            } else {
                                model.getApp().notify({ message: "Lỗi: Không thể tải được file lên hệ thống" }, { type: "danger", delay: 1000 });
                                return;
                            }
                        }

                    };
                    http.send(fd);
                } else {
                    model.getApp().hideloading();
                    model.getApp().notify({ message: "Lỗi: Vui lòng chọn đúng định dạng tệp" }, { type: "danger", delay: 1000 });
                    return;
                }
            });
		},
		importExcelOld: function () {
			var self = this;
            var attachImage = new AttachFileVIew();
            attachImage.render();
            attachImage.on("success", (event) => {
                var file = event.data;
                var file_type = file.type;
                if (!!file && !!file_type && (file_type.toLowerCase().includes("xlsx"))) {
                    var file_link = file.link;
                    var url = (self.getApp().serviceURL || "") + '/api/v1/import_excel_xuatkho';
                    $.ajax({
                        url: url,
                        type: 'POST',
                        dataType: 'json',
                        data: JSON.stringify({
                            "link": file_link,
							"donvi_id" : gonrinApp().currentUser.donvi_id,
							'id': self.model.get("id")
                        }),
                        error: function (error) {
                            self.getApp().notify({ message: "Có lỗi xảy ra" }, { type: "danger", delay: 1000 });
                        },
                        success: function (res) {
                            self.getApp().notify({ message: "Import dữ liệu thành công" });

                            let listSuccess = res.listSuccess;
                            if (Array.isArray(listSuccess) === false){
                                listSuccess = [];
                            }


                            for (let i = 0; i<listSuccess.length; i++){
                                self.onSaveDataVatTu(listSuccess[i]);
                            }

                            var resultView = new ResultImportExcel({ viewData: { "listFailed": res.listFailed, "countCreate": res.countCreate, "countUpdate": res.countUpdate } });
                            resultView.dialog({ "size": "large" });

                        }
                    });
                } else {
                    self.getApp().notify({ message: "Vui lòng chọn file đúng định dạng .xlsx" }, { type: "danger", delay: 1000 });
                }
            });

		},
		getDanhSachDuocLieu: function(phieuxuat_id){
            var self = this;
            let query_filter ={
                filters: {
                    "$and": [
                        {phieuxuat_id: {"$eq": phieuxuat_id}},
                        {deleted: {"$eq": false}}
                    ]
                }
            }
            let url = (self.getApp().serviceURL || "") + '/api/v1/phieuxuatkho_chitiet_grid?results_per_page=1000' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
            $.ajax({
                url: url,
                type:'GET',
                dataType: 'json',
                success: function(response){
                    self.listChiTiet = response?.objects;
                    if (Array.isArray(self.listChiTiet) === false){
                        self.listChiTiet = [];
                    }
                    self.initButton();

                    let length = self.listChiTiet.length;
                    if (length >0){
                        self.$el.find('.table-vattu').removeClass("d-none");
                        self.$el.find('.search').removeClass("d-none");
                    }
                    else{
                        self.$el.find('.table-vattu').addClass("d-none");
                        self.$el.find('.search').addClass("d-none");
                    }
                    for (let i=0; i< length; i++){
                        self.appendHtmlChitietVatTu(self.listChiTiet[i]);
                        self.fillStt();
						var giatien = gonrinApp().convert_string_to_number(self.listChiTiet[i].dongia);
						var soluong = gonrinApp().convert_string_to_number(self.listChiTiet[i].soluong_thucte);
						self.tongtien_vattu = self.tongtien_vattu + giatien * soluong;
						self.$el.find('.tongtien-vattu').text(Number(self.tongtien_vattu).toLocaleString());
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
            }
            )
        },
        searchDuocLieu: function(search = ""){
            var self = this;
            if (Array.isArray(self.listChiTiet) === false){
                self.listChiTiet = [];
            }

            let arr = self.listChiTiet.filter((value, index) =>{
                return (
                    value.ma_sanpham.includes(search) || 
                    value.ten_sanpham.includes(search)
                )
            })

            self.$el.find(`.table-vattu tbody`).html("");
            let length = arr.length;
            for (let i=0; i<length;i++){
                self.appendHtmlChitietVatTu(arr[i]);
                self.fillStt();
            }
        },
        initButton: function(){
            var self = this;
            self.$el.find(`.search`).on("keyup", self.delay((event) =>{
                let keySearch = $(event.target).val();
                self.searchDuocLieu(keySearch);
            }, 700))
        },
        delay: function (callback, ms) {
            var timer = 0;
            return function () {
                var context = this,
                    args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function () {
                    callback.apply(context, args);
                }, ms || 0);
            };
        }
    });

});