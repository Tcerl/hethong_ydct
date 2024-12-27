define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/quanlykho/PhieuNhap/tpl/model.html'),
		schema = require('json!schema/PhieuNhapKhoSchema.json');
	var WarningDialog = require('app/quanlykho/PhieuNhap/WarningDialog'),
		ChitietVattu = require('app/quanlykho/PhieuNhap/ChitietPhieuDialog/ChitietVatTu');

	var ManageFileVIew = require("app/view/AttachFile/ManageFileUploadView");
	var ChungNhanCODialogView = require('app/giaychungnhanco/ModelDialog');
	var ChungNhanCo = require('app/giaychungnhanco/ModelDialogThongke');
    var AttachFileVIew = require("app/view/AttachFile/AttachFileVIew");
    var ResultImportExcel = require('app/quanlykho/PhieuNhap/ResultImportExcel');
	


	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "phieunhapkho",
		isFirstLoad: false,
		isViewNuoiTrong: false,
		isSetIdNuoiTrong: false,
		isSetObjNuoiTrong: false,
		isViewKhaiThac: false,
		isSetIdKhaiThac: false,
		isSetObjKhaiThac: false,
		isSetObjCo: false,
		state: null,
		chungnhan_co_id: null,
		listChiTiet: [],
		isSetKho: null,
		isSetIdKho: false,
		isViewKho: false,
		tools: [
			{
				name: "defaultgr",
				type: "group",
				groupClass: "toolbar-group",
				buttons: [
					{
						name: "back",
						type: "button",
						buttonClass: "btn-secondary waves-effect width-sm",
						label:  `<i class="fas fa-arrow-circle-left"></i> Quay lại`,
						command: function () {
							var self = this;
							Backbone.history.history.back();
						}
					},
					{
						name: "save",
						type: "button",
						buttonClass: "btn-success width-sm ml-2",
						label: `<i class="far fa-save"></i> Lưu`,
						command: function () {
							var self = this;
							self.savePhieu();
						}
					},
					{
						name: "delete",
						type: "button",
						buttonClass: "btn-danger width-sm ml-2",
						label: `<i class="fas fa-trash-alt"></i> Xóa`,
						visible: function () {
							return this.getApp().getRouter().getParam("id") !== null;
						},
						command: function () {
							var self = this;
							self.deletePhieu();
							return;
							var delete_success = null;
							self.$el.find("#exampleModalCenter").modal("show");
							self.$el.find(".btn-deleted-continue").unbind("click").bind("click", function () {
								delete_success = true;
							});
							self.$el.find("#exampleModalCenter").on("hidden.bs.modal", function (e) {
								if (delete_success == true) {
									self.getApp().showloading();
									self.model.destroy({
										success: function (model, response) {
											self.getApp().hideloading();
											// self.getApp().notify('Xoá dữ liệu thành công');
											// self.getApp().getRouter().navigate(self.collectionName + "/collection");
											if (!!response && !!response.error_code && response.error_code == "UPDATE_ERROR") {
												response.type = 'DELETE';
												var warningDialog = new WarningDialog({ "viewData": response });
												warningDialog.dialog({ size: "large" });
											} else {
												self.getApp().notify('Xoá dữ liệu thành công');
												self.getApp().getRouter().navigate(self.collectionName + "/collection");
											}
										},
										error: function (xhr, status, error) {
											self.getApp().hideloading();
											try {
												if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
													self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
													self.getApp().getRouter().navigate("login");
												} else {
													self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
												}
											}
											catch (err) {
												self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
											}
										}
									});
								}
							});
							// self.model.destroy({
							//     success: function(model, response) {
							//     	self.getApp().notify('Xoá dữ liệu thành công');
							//         self.getApp().getRouter().navigate(self.collectionName + "/collection");
							//     },
							//     error: function (xhr, status, error) {
							// 		try {
							// 			if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
							// 				self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
							// 				self.getApp().getRouter().navigate("login");
							// 			} else {
							// 		  	self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
							// 			}
							// 		}
							// 		catch (err) {
							// 		  self.getApp().notify({ message: "Lưu thông tin không thành công"}, { type: "danger", delay: 1000 });
							// 		}
							// 	}
							// });
						}
					},
					{
						name: "print",
						type: "button",
						buttonClass: "btn-primary waves-effect width-sm ml-2",
						label: "<i class='fa fa-file-pdf'></i> In Phiếu",
						visible: function () {
							return this.getApp().getRouter().getParam("id") !== null;
						},
						command: function () {
							var self = this;
							self.getApp().showloading();
							var params = JSON.stringify({
								"id": self.model.get("id"),
								"type": "phieunhap_kho"
							});
							$.ajax({
								url: (self.getApp().serviceURL || "") + '/api/v1/export_pdf_kho',
								dataType: "json",
								contentType: "application/json",
								method: 'POST',
								data: params,
								success: function (response) {
									self.getApp().hideloading();
									window.open(response, "_blank");
								},
								error: function (xhr, status, error) {
									self.getApp().hideloading();
									try {
										if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
											self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
											self.getApp().getRouter().navigate("login");
										} else {
											self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
										}
									}
									catch (err) {
										self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
									}
								},
							});
						}
					},
				],
			}],
		uiControl: {
			fields: [
				{
					field: "active",
					uicontrol: "combobox",
					textField: "text",
					valueField: "value",
					cssClass: "form-control",
					dataSource: [
						{ value: 1, text: "Đang hoạt động" },
						{ value: 0, text: "ngừng hoạt động" },
					],
				},
				{
					field: "thoigian_nhap",
					uicontrol: "datetimepicker",
					format: "DD/MM/YYYY",
					textFormat: "DD/MM/YYYY",
					extraFormats: ["DDMMYYYY"],
					parseInputDate: function (val) {
						return gonrinApp().parseInputDateString(val);
					},
					parseOutputDate: function (date) {
						return gonrinApp().parseOutputDateString(date);
					},
					disabledComponentButton: true
				},
				{
					field: "nguon_cungcap",
					uicontrol: "combobox",
					textField: "text",
					valueField: "value",
					cssClass: "form-control",
					dataSource: [
						{ value: 1, text: "Nhập khẩu" },
						{ value: 2, text: "Nhập từ đơn vị cung ứng trong nước" },
						{ value: 3, text: "Thu gom" },
						{ value: 4, text: "Thu hoạch nuôi trồng" },
						{ value: 5, text: "Thu hoạch khai thác" }
					]
				},
				{
					field: "loaihinh_vanchuyen",
					uicontrol: "combobox",
					textField: "text",
					valueField: "value",
					cssClass: "form-control",
					dataSource: [
						{ value: '1', text: "Đường bộ" },
						{ value: '2', text: "Đường sắt" },
						{ value: '3', text: "Đường hàng không" },
						{ value: '4', text: "Đường thủy" },
					]
				},
				{
					field: "thoigian_batdau_vanchuyen",
					uicontrol: "datetimepicker",
					format: "DD/MM/YYYY",
					textFormat: "DD/MM/YYYY",
					extraFormats: ["DDMMYYYY"],
					parseInputDate: function (val) {
						return gonrinApp().parseInputDateString(val);
					},
					parseOutputDate: function (date) {
						return gonrinApp().parseOutputDateString(date);
					},
					disabledComponentButton: true
				},
				{
					field: "thoigian_ketthuc_vanchuyen",
					uicontrol: "datetimepicker",
					format: "DD/MM/YYYY",
					textFormat: "DD/MM/YYYY",
					extraFormats: ["DDMMYYYY"],
					parseInputDate: function (val) {
						return gonrinApp().parseInputDateString(val);
					},
					parseOutputDate: function (date) {
						return gonrinApp().parseOutputDateString(date);
					},
					disabledComponentButton: true
				}
			]
		},
		tongtien_vattu: 0,
		render: function () {
			var self = this;
			self.tongtien_vattu = 0;
			self.isFirstLoad = false;
			self.isViewNuoiTrong = false;
			self.isSetIdNuoiTrong = false;
			self.isSetObjNuoiTrong = false;
			self.isViewKhaiThac = false;
			self.isSetIdKhaiThac = false;
			self.isSetObjKhaiThac = false;
			self.isSetObjCo = false;
			self.listChiTiet = [];
			self.isSetKho = false;
			self.isSetIdKho = false;
			self.isViewKho = false;
			var id = this.getApp().getRouter().getParam("id");
			self.register_event();
			self.selectizeDonViCungUng();

            self.$el.find(`.btn-download`).unbind("click").bind("click", (event)=>{
                event.stopPropagation();
                let url = self.getApp().serviceURL + `/static/template_import_excel/Template_ImportNhapKho.xlsx`;
                window.open(url, '_blank');
            })


			if (id) {
				this.model.set('id', id);
				this.model.fetch({
					success: function (data) {
						self.applyBindings();
						self.selectizeKho();
						self.render_nguon_cungcap();
						self.register_nguon_cungcap();
						self.selectizeCO();
						self.$el.find("#nguon_cungcap").attr("style", "pointer-events:none");
						self.getDanhSachDuocLieu(id);
					},
					error: function () {
						self.getApp().notify(self.getApp().traslate("TRANSLATE:error_load_data"));
					},
					complete: function () {
						var fileView = new ManageFileVIew({ viewData: { "listFile": self.model.get('chungtu_dinhkem'), "$el_btn_upload": self.$el.find(".btn-add-file") }, el: self.$el.find(".list-attachment") });
						fileView.render();
						fileView.on("change", (event) => {
							var listfile = event.data;
							self.model.set('chungtu_dinhkem', listfile);
						});
						self.importExcel(self, '/api/v1/import_excel_nhapkho');

						self.$el.find(`.btn-import`).unbind("click").bind("click", (event)=>{
							event.stopPropagation();
                            self.$el.find("#upload_files_import").unbind("click").click();
						})
					}
				});
			} else {
				self.applyBindings();
				self.selectizeKho();
				self.register_nguon_cungcap();
				self.selectizeCO();
				self.initButton();
				self.importExcel(self, '/api/v1/import_excel_nhapkho');
				self.$el.find('.table-vattu').addClass("d-none");
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
			return;

		},
		savePhieu: function (mode = 0, dataView = null) {
			var self = this;
			var thoigian_nhap = self.model.get("thoigian_nhap");
			if (thoigian_nhap === undefined || thoigian_nhap === null || thoigian_nhap === "") {
				self.getApp().notify({ message: "Vui lòng nhập thời gian nhập kho" }, { type: "danger", delay: 2000 });
				return;
			}
			var nguon_cungcap = self.model.get("nguon_cungcap");
			if (nguon_cungcap === undefined && nguon_cungcap === null) {
				self.getApp().notify({ message: "Vui lòng chọn nguồn cung cấp" }, { type: "danger", delay: 2000 });
				return;
			}
			var kho = self.model.get("kho");
			if (!kho || kho == null || kho == undefined) {
				self.getApp().notify({ message: "Vui lòng chọn kho nhận hàng." }, { type: "danger", delay: 5000 });
				return;
			} else {
				self.model.set({
					"ma_kho": kho.id,
					"ten_kho": kho.ten_kho
				})
			}
			var tmp = self.validate_theo_nguon_cungcap();
			if (tmp == false) {
				return;
			}

			let thoigian_taophieu = gonrinApp().parseOutputDateString(moment().set({millisecond: 0}));
			self.model.set("thoigian_taophieu", thoigian_taophieu);
			self.model.save(null, {
				success: function (model, respose, options) {
					if (mode == 0) {
						self.getApp().notify("Lưu thông tin thành công");
						// self.getApp().getRouter().navigate(self.collectionName + "/collection");
					} else if (mode == 1) {
						self.model.set(model.attributes);
						var phieunhap_id = self.model.get("id");
						var thoigian_taophieu = self.model.get("thoigian_taophieu");
						if (thoigian_taophieu == null || thoigian_taophieu == undefined) {
							thoigian_taophieu = moment().unix();
							self.model.set("thoigian_taophieu", thoigian_taophieu);
						}
						var thoigian_nhap = self.model.get("thoigian_nhap");
						if (thoigian_nhap === null || thoigian_nhap === undefined) {
							thoigian_nhap = moment().unix();
							self.model.set("thoigian_nhap", thoigian_nhap);
						}
						let nguon_cungcap = self.model.get("nguon_cungcap");
						let data_thuhoach = null;
						if (nguon_cungcap == 4) {
							let thuhoach_nuoitrong = self.model.get("thuhoach_nuoitrong");
							if (!!thuhoach_nuoitrong) {
								data_thuhoach = thuhoach_nuoitrong;
							}
						}
						else if (nguon_cungcap == 5) {
							let thuhoach_khaithac = self.model.get("thuhoach_khaithac");
							if (!!thuhoach_khaithac) {
								data_thuhoach = thuhoach_khaithac
							}
						}

						var chitietVattu = new ChitietVattu({ viewData: { "data": dataView, "phieunhap_id": phieunhap_id, "so_phieu_chungtu": self.model.get("so_phieu_chungtu"), "thoigian_taophieu": thoigian_taophieu, "ma_kho": self.model.get("ma_kho"), "ten_kho": self.model.get("ten_kho"), "thoigian_nhap": self.model.get("thoigian_nhap"), "nguon_cungcap": self.model.get("nguon_cungcap"), "chungnhan_co_id": self.model.get("chungnhan_co_id"), "so_chungnhan_co": self.model.get("so_chungnhan_co"), "data_thuhoach": data_thuhoach } });

						chitietVattu.dialog({ size: "large" });
						chitietVattu.on("saveVattu", function (event) {
							self.$el.find('.table-vattu').removeClass("d-none");
							self.$el.find('.search').removeClass("d-none");
							var data_sanpham = event.data;
							self.onSaveDataVatTu(data_sanpham);
						});
					}
					else if (mode ==2){
						self.$el.find("#upload_files_import").unbind("click").click();
					}
				},
				error: function (xhr, status, error) {
					try {
						if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
							self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
							self.getApp().getRouter().navigate("login");
						} else {
							self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
						}
					}
					catch (err) {
						self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
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
				
				var phieunhap_id = self.model.get("id");
				var thoigian_taophieu = self.model.get("thoigian_taophieu");
				var thoigian_nhap = self.model.get("thoigian_nhap");
				if (thoigian_taophieu == null || thoigian_taophieu == undefined) {
					thoigian_taophieu = gonrinApp().parseOutputDateString(moment().set({millisecond: 0}));
					self.model.set("thoigian_taophieu", thoigian_taophieu);
				}
				if (thoigian_nhap === null || thoigian_nhap === undefined) {
					thoigian_nhap = gonrinApp().parseOutputDateString(moment().set({millisecond: 0}));
					self.model.set("thoigian_nhap", thoigian_nhap);
				}
				var nguon_cungcap = self.model.get("nguon_cungcap");
				if (nguon_cungcap === undefined && nguon_cungcap === null) {
					self.getApp().notify({ message: "Vui lòng chọn nguồn cung cấp" }, { type: "danger", delay: 2000 });
					return;
				}
				var kho = self.model.get("kho");
				if (!kho || kho == null || kho == undefined) {
					self.getApp().notify({ message: "Vui lòng chọn kho nhận hàng." }, { type: "danger", delay: 5000 });
					return;
				} else {
					self.model.set({
						"ma_kho": kho.id,
						"ten_kho": kho.ten_kho
					})
				}
				var tmp = self.validate_theo_nguon_cungcap();
				if (tmp == false) {
					return;
				}


				let data_thuhoach = null;
				if (nguon_cungcap == 4) {
					let thuhoach_nuoitrong = self.model.get("thuhoach_nuoitrong");
					if (!!thuhoach_nuoitrong) {
						data_thuhoach = thuhoach_nuoitrong;
					}
				}
				else if (nguon_cungcap == 5) {
					let thuhoach_khaithac = self.model.get("thuhoach_khaithac");
					if (!!thuhoach_khaithac) {
						data_thuhoach = thuhoach_khaithac
					}
				}

				var chitietSanpham = new ChitietVattu({ viewData: { "data": dataView, "phieunhap_id": phieunhap_id, "so_phieu_chungtu": self.model.get("so_phieu_chungtu"), "thoigian_taophieu": thoigian_taophieu, "ma_kho": self.model.get("ma_kho"), "ten_kho": self.model.get("ten_kho"), "thoigian_nhap": self.model.get("thoigian_nhap"), "nguon_cungcap": self.model.get("nguon_cungcap"), "chungnhan_co_id": self.model.get("chungnhan_co_id"), "so_chungnhan_co": self.model.get("so_chungnhan_co"), "data_thuhoach": data_thuhoach } });

				chitietSanpham.dialog({ size: "large" });
				chitietSanpham.on("saveVattu", function (event) {
					self.$el.find('.table-vattu').removeClass("d-none");
					self.$el.find('.search').removeClass("d-none");
					var data_sanpham = event.data;
					self.onSaveDataVatTu(data_sanpham);
				});
			}
		},
		appendHtmlChitietVatTu: function (data) {
			var self = this;
			var thanhtien = (data.soluong_thucte ? data.soluong_thucte : 0) * (data.dongia ? data.dongia : 0);

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


			self.$el.find(`#${data.id} .demo-delete-row`).unbind("click").bind("click", { obj: data }, function (e) {
				e.stopPropagation();
				var data_sanpham = e.data.obj;
				let deleteItem = null;
			
                self.$el.find("#exampleModalCenter1").modal("show");
                self.$el.find(".btn-item-deleted-continue").unbind("click").bind("click", function () {
                    deleteItem = true;
				});


				self.$el.find("#exampleModalCenter1").on("hidden.bs.modal", function (e) {
					if (deleteItem){
						var url = (self.getApp().serviceURL || "") + '/api/v2/phieunhapkho_chitiet/' + data_sanpham.id;
						$.ajax({
							url: url,
							type: 'DELETE',
							headers: {
								'content-type': 'application/json',
								'Access-Control-Allow-Origin': '*'
							},
							success: function (response) {
								deleteItem = null;
								if (!!response && !!response.error_code && response.error_code == "UPDATE_ERROR") {
									response.type = 'DELETE';
									var warningDialog = new WarningDialog({ "viewData": response });
									warningDialog.dialog({ size: "large" });
								}
								else {
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
								}
							},
							error: function (xhr, status, error) {
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
			self.$el.find(`#${data.id} .demo-edit-row`).unbind("click").bind("click", { obj: data }, function (e) {
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
				var thanhtien = (data_sanpham.soluong_thucte ? data_sanpham.soluong_thucte : 0) * (data_sanpham.dongia ? data_sanpham.dongia : 0);
				var elt = self.$el.find(".table-vattu #" + data_sanpham.id);
				elt.find('.so_lo').text(data_sanpham.so_lo);
				elt.find('.ten_sanpham').text(data_sanpham.ten_sanpham);
				elt.find('.soluong_chungtu').text(data_sanpham.soluong_chungtu);
				elt.find('.soluong_thucte').text(data_sanpham.soluong_thucte);
				elt.find('.dongia').text(Number(data_sanpham.dongia).toLocaleString());
				elt.find('.thanhtien').text(Number(thanhtien).toLocaleString());
				elt.find(".demo-edit-row").unbind("click").bind("click", { obj: data_sanpham }, function (e) {
					e.stopPropagation();
					var obj_data = e.data.obj;
					self.DialogChitietVattu(obj_data);
				});

				elt.find(`.demo-delete-row`).unbind("click").bind("click", { obj: data_sanpham }, function (e) {
					e.stopPropagation();
					var data_sanpham = e.data.obj;
					let deleteItem = null;
				
					self.$el.find("#exampleModalCenter1").modal("show");
					self.$el.find(".btn-item-deleted-continue").unbind("click").bind("click", function () {
						deleteItem = true;
					});
	
	
					self.$el.find("#exampleModalCenter1").on("hidden.bs.modal", function (e) {
						if (deleteItem){
							var url = (self.getApp().serviceURL || "") + '/api/v2/phieunhapkho_chitiet/' + data_sanpham.id;
							$.ajax({
								url: url,
								type: 'DELETE',
								headers: {
									'content-type': 'application/json',
									'Access-Control-Allow-Origin': '*'
								},
								success: function (response) {
									deleteItem = null;
									if (!!response && !!response.error_code && response.error_code == "UPDATE_ERROR") {
										response.type = 'DELETE';
										var warningDialog = new WarningDialog({ "viewData": response });
										warningDialog.dialog({ size: "large" });
									}
									else {
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
									}
								},
								error: function (xhr, status, error) {
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
		validate_theo_nguon_cungcap: function () {
			var self = this;
			var nguon_cungcap = self.model.get("nguon_cungcap");
			if (nguon_cungcap === undefined || nguon_cungcap === null) {
				self.getApp().notify({ message: "Vui lòng chọn nguồn cung cấp" }, { type: "danger", delay: 1000 });
				return false;
			}
			else {
				if (nguon_cungcap == 1) {

					var chungnhan_co_id = self.model.get("chungnhan_co_id");
					if (!chungnhan_co_id){
						self.getApp().notify({ message: "Vui lòng chọn giấy chứng nhận nguồn gốc CO" }, { type: "danger", delay: 2000 });
						return false;
					}

					var ten_donvi_cungung = self.model.get("ten_donvi_cungung");
					if (ten_donvi_cungung === undefined || ten_donvi_cungung === null) {
						self.getApp().notify({ message: "Vui lòng nhập tên đơn vị cung ứng" }, { type: "danger", delay: 2000 });
						return false;
					}
				}
				else if (nguon_cungcap == 2) {
					var ten_donvi_cungung = self.model.get("ten_donvi_cungung");
					if (ten_donvi_cungung === undefined || ten_donvi_cungung === null) {
						self.getApp().notify({ message: "Vui lòng nhập tên đơn vị cung ứng" }, { type: "danger", delay: 2000 });
						return false;
					}
				}
				else if (nguon_cungcap == 4) {
					let thuhoach_nuoitrong_id = self.model.get("thuhoach_nuoitrong_id");
					if (thuhoach_nuoitrong_id === undefined || thuhoach_nuoitrong_id === null || thuhoach_nuoitrong_id === "") {
						self.getApp().notify({ message: "Vui lòng nhập thông tin quy trình thu hoạch nuôi trồng" }, { type: "danger", delay: 1000 });
						return false;
					}
				}
				else if (nguon_cungcap == 5) {
					let thuhoach_khaithac_id = self.model.get("thuhoach_khaithac_id");
					if (thuhoach_khaithac_id === undefined || thuhoach_khaithac_id === null || thuhoach_khaithac_id === "") {
						self.getApp().notify({ message: "Vui lòng nhập thông tin quy trình thu hoạch khai thác" }, { type: "danger", delay: 1000 });
						return false;
					}
				}
			}
			return true;
		},
		selectizeCO: function () {
			var self = this;
			var currentUser = self.getApp().currentUser;
			var donvi_id = "";
			if (!!currentUser && !!currentUser.donvi_id) {
				donvi_id = currentUser.donvi_id;
			}
			let nguon_cungcap = self.model.get("nguon_cungcap");
			//Nhập khẩu
			if (nguon_cungcap === 1) {
				let $selectize = self.$el.find('#selectize-co').selectize({
					valueField: 'id',
					labelField: 'so_co',
					searchField: ['so_co'],
					preload: true,
					maxOptions: 10,
					maxItems: 1,
					load: function (query, callback) {
						var query_filter = {
							"filters": {
								"$and": [
									{ "so_co": { "$likeI": gonrinApp().convert_khongdau(query) } },
									{ "loai_co": { "$eq": 1 } },
									{ "donvi_id": { "$eq": donvi_id } }
								]
							}
						};

						let so_chungnhan_co = self.model.get("so_chungnhan_co");
						let chungnhan_co_id = self.model.get("chungnhan_co_id");
						if (!!chungnhan_co_id && !!so_chungnhan_co && self.isSetObjCo === false) {
							let objs = {
								id: chungnhan_co_id,
								so_co: so_chungnhan_co
							}
							callback([objs]);
							self.isSetObjCo = true;
						}
						var url = (self.getApp().serviceURL || "") + '/api/v1/giaychungnhanco?' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
						$.ajax({
							url: url,
							type: 'GET',
							dataType: 'json',
							error: function () {
								callback();
							},
							success: function (res) {
								callback(res.objects);
								var chungnhan_co_id = self.model.get("chungnhan_co_id");
								if (chungnhan_co_id !== undefined && chungnhan_co_id !== null) {
									$selectize[0].selectize.setValue([chungnhan_co_id]);
								}
							}
						});
					},
					onChange: function (value, isOnInitialize) {
						var $selectz = (self.$el.find('#selectize-co'))[0];
						var obj = $selectz.selectize.options[value];
						if (obj !== undefined && obj !== null) {
							var so_chungnhan_co = obj.so_co;
							var chungnhan_co_id = obj.id;
							self.model.set({
								"so_chungnhan_co": so_chungnhan_co,
								"chungnhan_co_id": chungnhan_co_id
							});
							// Lần đâu tiên không thay đổi đơn vị phân phối
							var id = self.model.get("id");
							if (self.isFirstLoad == true || !id) {
								var ten_donvi_phanphoi = obj.ten_donvi_phanphoi;
								var diachi_donvi_phanphoi = obj.diachi_donvi_phanphoi;
								var donvi_phanphoi = obj.donvi_phanphoi;
								var id_donvi_phanphoi = obj.id_donvi_phanphoi;
								if (!!id_donvi_phanphoi && !!donvi_phanphoi) {
									self.model.set({
										"ten_donvi_cungung": ten_donvi_phanphoi,
										"diachi_donvi_cungung": diachi_donvi_phanphoi,
										"ma_donvi_cungung": id_donvi_phanphoi,
										"donvi_cungung": donvi_phanphoi
									})
								}
								else if (donvi_phanphoi === null || donvi_phanphoi === undefined || id_donvi_phanphoi === null || id_donvi_phanphoi === undefined && !!ten_donvi_phanphoi) {
									self.model.set({
										"ten_donvi_cungung": ten_donvi_phanphoi,
										"diachi_donvi_cungung": diachi_donvi_phanphoi
									});
								}
							}
							else {
								self.isFirstLoad = true;
							}
							self.$el.find("#view-co").unbind("click").bind("click", (e)=>{
								e.stopPropagation();
								let co = new ChungNhanCo({viewData: {"id" :  self.model.get("chungnhan_co_id")}});
								co.dialog({size: "large"});
							})
						}
						else {
							self.model.set({
								"so_chungnhan_co": null,
								"chungnhan_co_id": null
							})
						}
						self.selectizeDonViCungUng();
					}
				});
			}
			else {
				let $selectize = self.$el.find('#selectize-co').selectize({
					valueField: 'id',
					labelField: 'so_co',
					searchField: ['so_co'],
					preload: true,
					maxOptions: 10,
					maxItems: 1,
					load: function (query, callback) {
						var query_filter = {
							"filters": {
								"$and": [
									{ "so_co": { "$likeI": gonrinApp().convert_khongdau(query) } },
									{ "loai_co": { "$eq": 2 } },
									{ "donvi_id": { "$eq": donvi_id } }
								]
							}
						};

						let so_chungnhan_co = self.model.get("so_chungnhan_co");
						let chungnhan_co_id = self.model.get("chungnhan_co_id");
						if (!!chungnhan_co_id && !!so_chungnhan_co && self.isSetObjCo === false) {
							let objs = {
								id: chungnhan_co_id,
								so_co: so_chungnhan_co
							}
							callback([objs]);
							self.isSetObjCo = true;
						}
						var url = (self.getApp().serviceURL || "") + '/api/v1/giaychungnhanco?' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
						$.ajax({
							url: url,
							type: 'GET',
							dataType: 'json',
							error: function () {
								callback();
							},
							success: function (res) {
								callback(res.objects);
								var chungnhan_co_id = self.model.get("chungnhan_co_id");
								if (chungnhan_co_id !== undefined && chungnhan_co_id !== null) {
									$selectize[0].selectize.setValue([chungnhan_co_id]);
								}
							}
						});
					},
					onChange: function (value, isOnInitialize) {
						var $selectz = (self.$el.find('#selectize-co'))[0];
						var obj = $selectz.selectize.options[value];
						if (obj !== undefined && obj !== null) {
							// Lần đâu tiên không thay đổi đơn vị phân phối
							var id = self.model.get("id");
							var so_chungnhan_co = obj.so_co;
							var chungnhan_co_id = obj.id;
							if (self.isFirstLoad == true || !id) {
								self.model.set({
									"so_chungnhan_co": so_chungnhan_co,
									"chungnhan_co_id": chungnhan_co_id
								});

								let ten_donvi_phanphoi = obj.ten_donvi_phanphoi;
								let diachi_donvi_phanphoi = obj.diachi_donvi_phanphoi;
								let donvi_phanphoi = obj.donvi_phanphoi;
								let id_donvi_phanphoi = obj.id_donvi_phanphoi;
								if (!!ten_donvi_phanphoi){
									self.model.set("ten_donvi_cungung", ten_donvi_phanphoi);
								}
								if (!!diachi_donvi_phanphoi){
									self.model.set("diachi_donvi_cungung", diachi_donvi_phanphoi);
								}
								if (!!donvi_phanphoi && !!id_donvi_phanphoi){
									self.model.set("donvi_cungung", donvi_phanphoi);
									set.model.set("ma_donvi_cungung", id_donvi_phanphoi);
								}
							}
							else {

								if (!self.model.get("chungnhan_co_id")){
									self.model.set({
										"so_chungnhan_co": so_chungnhan_co,
										"chungnhan_co_id": chungnhan_co_id
									});

									let ten_donvi_phanphoi = obj.ten_donvi_phanphoi;
									let diachi_donvi_phanphoi = obj.diachi_donvi_phanphoi;
									let donvi_phanphoi = obj.donvi_phanphoi;
									let id_donvi_phanphoi = obj.id_donvi_phanphoi;
									if (!!ten_donvi_phanphoi){
										self.model.set("ten_donvi_cungung", ten_donvi_phanphoi);
									}
									if (!!diachi_donvi_phanphoi){
										self.model.set("diachi_donvi_cungung", diachi_donvi_phanphoi);
									}
									if (!!donvi_phanphoi && !!id_donvi_phanphoi){
										self.model.set("donvi_cungung", donvi_phanphoi);
										set.model.set("ma_donvi_cungung", id_donvi_phanphoi);
									}
								}

								self.isFirstLoad = true;
							}
							self.$el.find("#view-co").unbind("click").bind("click", (e)=>{
								e.stopPropagation();
								let co = new ChungNhanCo({viewData: {"id" :  self.model.get("chungnhan_co_id")}});
								co.dialog({size: "large"});
							})
						}
						else {
							self.model.set({
								"so_chungnhan_co": null,
								"chungnhan_co_id": null
							})
						}
						self.selectizeDonViCungUng();
					}
				});
			}
		},
		register_nguon_cungcap: function () {
			var self = this;
			self.model.on("change:nguon_cungcap", function () {
				var nguon_cungcap = self.model.get("nguon_cungcap");
				//thu gom
				if (nguon_cungcap == 3) {
					self.$el.find(".thongtinco").removeClass("d-none");
					self.$el.find(".thongtincungung").addClass("d-none");
					self.$el.find(".thongtinvanchuyen").addClass("d-none");
					self.$el.find(".nuoitrong").addClass("d-none");
					self.$el.find(".khaithac").addClass("d-none");
				}
				//đơn vị cung ứng
				else if (nguon_cungcap == 2) {
					self.$el.find(".thongtinco").removeClass("d-none");
					self.$el.find(".thongtincungung").removeClass("d-none");
					self.$el.find(".thongtinvanchuyen").removeClass("d-none");
					self.$el.find(".ten_donvi_cungung").removeClass("d-none");
					self.$el.find(".donvi_cungung").removeClass("d-none");
					self.$el.find(".nuoitrong").addClass("d-none");
					self.$el.find(".khaithac").addClass("d-none");
				}
				//nhập khẩu
				else if (nguon_cungcap == 1) {
					self.$el.find(".thongtinco").removeClass("d-none");
					self.$el.find(".thongtincungung").removeClass("d-none");
					self.$el.find(".thongtinvanchuyen").removeClass("d-none");
					self.$el.find(".donvi_cungung").removeClass("d-none");
					self.$el.find(".ten_donvi_cungung").removeClass("d-none");
					self.$el.find(".nuoitrong").addClass("d-none");
					self.$el.find(".khaithac").addClass("d-none");
				}
				//thu hoạch nuôi trồng
				else if (nguon_cungcap == 4) {
					self.$el.find(".nuoitrong").removeClass("d-none");
					self.$el.find(".khaithac").addClass("d-none");
					self.$el.find(".thongtinco").removeClass("d-none");

					self.selectizeNuoiTrong();
				}
				//thu hoạch khai thác
				else if (nguon_cungcap == 5) {
					self.$el.find(".nuoitrong").addClass("d-none");
					self.$el.find(".khaithac").removeClass("d-none");
					self.$el.find(".thongtinco").removeClass("d-none");

					self.selectizeKhaiThac();
				}
				if (nguon_cungcap !== undefined && nguon_cungcap !== null) {
					var $selectz = (self.$el.find('#selectize-donvi-cungung'))[0];
					if (!!$selectz && !!$selectz.selectize) {
						$selectz.selectize.destroy();
					}
					self.selectizeDonViCungUng();

					var $selectz1 = (self.$el.find('#selectize-co'))[0];
					if (!!$selectz1 && !!$selectz1.selectize) {
						$selectz1.selectize.destroy();
					}
					self.selectizeCO();
				}
			});
		},
		render_nguon_cungcap: function () {
			var self = this;
			var nguon_cungcap = self.model.get("nguon_cungcap");
			if (!!nguon_cungcap && nguon_cungcap == 3) {
				self.$el.find(".thongtinco").removeClass("d-none");
				self.$el.find(".thongtincungung").addClass("d-none");
				self.$el.find(".thongtinvanchuyen").addClass("d-none");
				self.$el.find(".nuoitrong").addClass("d-none");
				self.$el.find(".khaithac").addClass("d-none");
			}
			else if (nguon_cungcap == 2) {
				self.$el.find(".thongtinco").removeClass("d-none");
				self.$el.find(".thongtincungung").removeClass("d-none");
				self.$el.find(".thongtinvanchuyen").removeClass("d-none");
				self.$el.find(".ten_donvi_cungung").removeClass("d-none");
				self.$el.find(".donvi_cungung").removeClass("d-none");
				self.$el.find(".nuoitrong").addClass("d-none");
				self.$el.find(".khaithac").addClass("d-none");
			}
			else if (nguon_cungcap == 1) {
				self.$el.find(".thongtinco").removeClass("d-none");
				self.$el.find(".thongtincungung").removeClass("d-none");
				self.$el.find(".thongtinvanchuyen").removeClass("d-none");
				self.$el.find(".donvi_cungung").removeClass("d-none");
				self.$el.find(".ten_donvi_cungung").removeClass("d-none");
				self.$el.find(".nuoitrong").addClass("d-none");
				self.$el.find(".khaithac").addClass("d-none");
			}
			else if (nguon_cungcap == 4) {
				self.$el.find(".nuoitrong").removeClass("d-none");
				self.$el.find(".khaithac").addClass("d-none");
				self.$el.find(".thongtinco").removeClass("d-none");
				self.selectizeNuoiTrong();

			}
			else if (nguon_cungcap == 5) {
				self.$el.find(".nuoitrong").addClass("d-none");
				self.$el.find(".khaithac").removeClass("d-none");
				self.$el.find(".thongtinco").removeClass("d-none");
				self.selectizeKhaiThac();
			}
		},
		selectizeDonViCungUng: function () {
			var self = this;
			var nguon_cungcap = self.model.get("nguon_cungcap");
			if (nguon_cungcap == 2) {
				var $selectize0 = self.$el.find('#selectize-donvi-cungung').selectize({
					maxItems: 1,
					valueField: 'id',
					labelField: 'ten_coso',
					searchField: ['ma_coso', 'tenkhongdau'],
					preload: true,
					load: function (query, callback) {
						var query_filter = {
							"filters": {
								"$and": [{
									"$or": [
										{ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
										{ "ma_coso": { "$eq": query } }
									],
									"order_by": [{ "field": "ten_coso", "direction": "asc" }]
								},
								{
									"$or": [
										{ "loai_donvi": { "$eq": 2 } },
										{ "loai_donvi": { "$eq": 4 } },
										{ "loai_donvi": { "$eq": 5 } },
										{ "loai_donvi": { "$eq": 6 } },
										{ "loai_donvi": { "$eq": 7 } },
										{ "loai_donvi": { "$eq": 8 } },
										{ "loai_donvi": { "$eq": 9 } },										
									]
								}
								]
							}

						};

						var url = (self.getApp().serviceURL || "") + '/api/v1/donvi?page=1&results_per_page=300' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
						$.ajax({
							url: url,
							type: 'GET',
							dataType: 'json',
							error: function () {
								callback();
							},
							success: function (res) {
								callback(res.objects);
							}
						});
					},
					onChange: function (value) {
						var $selectz = (self.$el.find('#selectize-donvi-cungung'))[0];
						var obj = $selectz.selectize.options[value];
						if (obj !== null && obj !== undefined) {
							self.model.set("donvi_cungung", obj);
							var ten_donvi_cungung = obj.ten_coso;
							if (ten_donvi_cungung !== undefined && ten_donvi_cungung !== null && ten_donvi_cungung !== "") {
								self.model.set("ten_donvi_cungung", ten_donvi_cungung);
							}
							var ma_donvi_cungung = obj.id;
							if (ma_donvi_cungung !== undefined && ma_donvi_cungung !== null && ma_donvi_cungung !== "") {
								self.model.set("ma_donvi_cungung", ma_donvi_cungung);
							}
							var diachi_donvi_cungung = obj.diachi;
							if (diachi_donvi_cungung !== undefined && diachi_donvi_cungung !== null && diachi_donvi_cungung !== "") {
								self.model.set("dienthoai_donvi_cungung", dienthoai_donvi_cungung);
							}
							var dienthoai_donvi_cungung = obj.dienthoai;
							if (dienthoai_donvi_cungung !== undefined && dienthoai_donvi_cungung !== null && dienthoai_donvi_cungung !== "") {
								self.model.set("dienthoai_donvi_cungung", dienthoai_donvi_cungung);
							}
						} else {
							self.model.set("donvi_cungung", null);
							self.model.set("ten_donvi_cungung", null);
							self.model.set("ma_donvi_cungung", null);
							self.model.set("diachi_donvi_cungung", null);
							self.model.set("dienthoai_donvi_cungung", null);
						}
					}
				});
			}
			else if (nguon_cungcap == 1) {
				var $selectize0 = self.$el.find('#selectize-donvi-cungung').selectize({
					maxItems: 1,
					valueField: 'id',
					labelField: 'ten_donvi',
					searchField: ['ten_donvi', 'tenkhongdau', 'ma_donvi'],
					preload: true,
					load: function (query, callback) {
						var query_filter = {
							"filters": {
								"$or": [
									{ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
								]
							}
						};
						var url = (self.getApp().serviceURL || "") + '/api/v1/danhmuc_cungung_nuoc_ngoai?' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
						$.ajax({
							url: url,
							type: 'GET',
							dataType: 'json',
							error: function () {
								callback();
							},
							success: function (res) {
								callback(res.objects);
							}
						});
					},
					onChange: function (value) {
						var $selectz = (self.$el.find('#selectize-donvi-cungung'))[0];
						var obj = $selectz.selectize.options[value];
						if (obj !== null && obj !== undefined) {
							self.model.set("donvi_cungung", obj);
							var ten_donvi_cungung = obj.ten_donvi;
							if (ten_donvi_cungung !== undefined && ten_donvi_cungung !== null && ten_donvi_cungung !== "") {
								self.model.set("ten_donvi_cungung", ten_donvi_cungung);
							}
							var ma_donvi_cungung = obj.id;
							if (ma_donvi_cungung !== undefined && ma_donvi_cungung !== null && ma_donvi_cungung !== "") {
								self.model.set("ma_donvi_cungung", ma_donvi_cungung);
							}
							var diachi_donvi_cungung = obj.diachi;
							if (diachi_donvi_cungung !== undefined && diachi_donvi_cungung !== null && diachi_donvi_cungung !== "") {
								self.model.set("dienthoai_donvi_cungung", diachi_donvi_cungung);
							}
						} else {
							self.model.set("donvi_cungung", null);
							self.model.set("ten_donvi_cungung", null);
							self.model.set("ma_donvi_cungung", null);
							self.model.set("diachi_donvi_cungung", null);
							self.model.set("dienthoai_donvi_cungung", null);
						}
					}
				});
			}
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
		selectizeNuoiTrong: function () {
			var self = this;
			var currentUser = self.getApp().currentUser;
			var donvi_id = "";
			if (!!currentUser && !!currentUser.donvi) {
				donvi_id = currentUser.donvi.id;
			}
			var $selectize0 = self.$el.find('#nuoitrong').selectize({
				maxItems: 1,
				valueField: 'id',
				labelField: 'ten_sanpham',
				searchField: ['ten_sanpham', 'ten_khoa_hoc', 'tenkhongdau'],
				preload: true,
				load: function (query, callback) {
					var query_filter = {
						"filters": {
							"$or": [
								{ "ten_sanpham": { "$likeI": (query) } },
								{ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
								{ "ten_khoa_hoc": { "$likeI": (query) } }
							]
						}
					};
					let thuhoach_nuoitrong = self.model.get("thuhoach_nuoitrong");
					if (!!thuhoach_nuoitrong && self.isSetObjNuoiTrong === false) {
						callback([thuhoach_nuoitrong]);
						self.isSetObjNuoiTrong = false;
					}
					var url = (self.getApp().serviceURL || "") + '/api/v1/duoclieu_nuoitrong?page=1&results_per_page=20' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
					$.ajax({
						url: url,
						type: 'GET',
						dataType: 'json',
						error: function () {
							callback();
						},
						success: function (res) {
							callback(res.objects);
							let thuhoach_nuoitrong_id = self.model.get("thuhoach_nuoitrong_id");
							if (!!thuhoach_nuoitrong && self.isSetIdNuoiTrong === false) {
								var $selectz = (self.$el.find('#nuoitrong'))[0];
								$selectz.selectize.setValue([thuhoach_nuoitrong_id]);
								self.isSetIdNuoiTrong = true;
								$selectz.selectize.disable();
							}
						}
					});
				},
				onChange: function (value) {
					var obj = $selectize0[0].selectize.options[value];
					if (obj !== null && obj !== undefined) {
						let id = self.model.get("id");
						if (!id || self.isViewNuoiTrong == true) {
							self.model.set({
								"thuhoach_nuoitrong": obj,
								"thuhoach_nuoitrong_id": value
							});
						}
						else {
							self.isViewNuoiTrong = true;
						}
					} else {
						self.model.set({
							"thuhoach_nuoitrong": obj,
							"thuhoach_nuoitrong_id": value
						});
					}
				}
			});
		},
		selectizeKhaiThac: function () {
			var self = this;
			var currentUser = self.getApp().currentUser;
			var donvi_id = "";
			if (!!currentUser && !!currentUser.donvi) {
				donvi_id = currentUser.donvi.id;
			}
			var $selectize0 = self.$el.find('#khaithac').selectize({
				maxItems: 1,
				valueField: 'id',
				labelField: 'ten_sanpham',
				searchField: ['ten_sanpham', 'ten_khoa_hoc', 'tenkhongdau'],
				preload: true,
				load: function (query, callback) {
					var query_filter = {
						"filters": {
							"$or": [
								{ "ten_sanpham": { "$likeI": (query) } },
								{ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
								{ "ten_khoa_hoc": { "$likeI": (query) } }
							]
						}
					};
					let thuhoach_khaithac = self.model.get("thuhoach_khaithac");
					if (!!thuhoach_khaithac && self.isSetObjKhaiThac === false) {
						callback([thuhoach_khaithac]);
						self.isSetObjKhaiThac = false;
					}
					var url = (self.getApp().serviceURL || "") + '/api/v1/khaithac_tunhien?page=1&results_per_page=20' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
					$.ajax({
						url: url,
						type: 'GET',
						dataType: 'json',
						error: function () {
							callback();
						},
						success: function (res) {
							callback(res.objects);
							let thuhoach_khaithac_id = self.model.get("thuhoach_khaithac_id");
							if (!!thuhoach_khaithac_id && self.isSetIdKhaiThac === false) {
								var $selectz = (self.$el.find('#khaithac'))[0];
								$selectz.selectize.setValue([thuhoach_khaithac_id]);
								self.isSetIdKhaiThac = true;
								$selectz.selectize.disable();
							}
						}
					});
				},
				onChange: function (value) {
					var obj = $selectize0[0].selectize.options[value];
					if (obj !== null && obj !== undefined) {
						let id = self.model.get("id");
						if (!id || self.isViewKhaiThac == true) {
							self.model.set({
								"thuhoach_khaithac": obj,
								"thuhoach_khaithac_id": value
							});
						}
						else {
							self.isViewKhaiThac = true;
						}
					} else {
						self.model.set({
							"thuhoach_khaithac": obj,
							"thuhoach_khaithac_id": value
						});
					}
				}
			});
		},
		register_event: function(){
			var self = this;
			self.$el.find('.btn-add-vattu').unbind("click").bind("click", function (e) {
				e.stopPropagation();
				self.DialogChitietVattu();
			});

            self.$el.find(".btn-new-co").unbind("click").bind("click", ()=>{
                var chungNhanCO = new ChungNhanCODialogView();
                chungNhanCO.dialog({size: "large"});
                chungNhanCO.on("saveCO", function(e){
                    if (!!self.$el.find('#selectize-co')[0].selectize) {
                        self.$el.find('#selectize-co')[0].selectize.destroy();
                    }
                    if (!!e){
                        self.model.set({
                            "so_chungnhan_co": e.so_co,
                            "chungnhan_co_id": e.id
                        })
                    }
                    self.selectizeCO();
                })
            })
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
                    var url = (self.getApp().serviceURL || "") + '/api/v1/import_excel_nhapkho';
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
		deletePhieu: function(){
			var self = this;
			var delete_success = null;
			self.$el.find("#exampleModalCenter").modal("show");
			self.$el.find(".btn-deleted-continue").unbind("click").bind("click", function () {
				delete_success = true;
			});
			self.$el.find("#exampleModalCenter").on("hidden.bs.modal", function (e) {
				if (delete_success == true) {
					self.getApp().showloading();
					var url = (self.getApp().serviceURL || "") + '/api/v2/phieunhapkho/' + self.model.get("id");
					$.ajax({
						url: url,
						type: 'DELETE',
						dataType: 'json',
						success: function (response) {
							self.getApp().hideloading();
							delete_success = null;
							if (!!response && !!response.error_code && response.error_code == "UPDATE_ERROR") {
								response.type = 'DELETE';
								var warningDialog = new WarningDialog({ "viewData": response });
								warningDialog.dialog({ size: "large" });
							} else {
								self.getApp().notify('Xoá dữ liệu thành công');
								self.getApp().getRouter().navigate(self.collectionName + "/collection");
							}
		
						},
						error: function (xhr, status, error) {
							delete_success = null;
							self.getApp().hideloading();
							try {
								if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED") {
									self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
									self.getApp().getRouter().navigate("login");
								} else {
									self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
								}
							}
							catch (err) {
								self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
							}
						}
					});
				}
			});

		},
		getDanhSachDuocLieu: function(phieunhap_id){
            var self = this;
            let query_filter ={
                filters: {
                    "$and": [
                        {phieunhap_id: {"$eq": phieunhap_id}},
                        {deleted: {"$eq": false}}
                    ]
                }
            }
            let url = (self.getApp().serviceURL || "") + '/api/v1/phieunhapkho_chitiet_grid?results_per_page=1000' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
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