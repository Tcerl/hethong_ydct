define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/quanlykho/DanhMucKho/tpl/model.html'),
		schema = require('json!schema/DanhMucKhoSchema.json');
	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "danhmuc_kho",
		state: null,
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
						label: `<i class="fas fa-arrow-circle-left"></i> Quay lại`,
						command: function () {
							var self = this;
							let back = self.getApp().getRouter().getParam("back");
							if (!!back){
								let path = `danhmuc_kho/collection`;
								self.getApp().getRouter().navigate(path);
							}
							else{
								Backbone.history.history.back();

							}
						}
					},
					{
						name: "save",
						type: "button",
						buttonClass: "btn-success width-sm ml-2",
						label: `<i class="far fa-save"></i> Lưu`,
						command: function () {
							var self = this;
							var ma_kho = self.model.get("ma_kho");
							var ten_kho = self.model.get("ten_kho");
							if (ma_kho == null || ma_kho == undefined || ma_kho.trim() == "") {
								self.getApp().notify({ message: "Mã kho không được để trống" }, { type: "danger", delay: 1000 });
								return false;
							}
							if (ten_kho == null || ten_kho == undefined || ten_kho.trim() == "") {
								self.getApp().notify({ message: "Tên kho không được để trống" }, { type: "danger", delay: 1000 });
								return false;
							}
							var email_list = self.model.get("email_nhanthongbao"),
								phone = self.model.get('nguoiphutrach_dienthoai');
							if (!!phone && gonrinApp().validatePhone(phone) == false) {
								self.getApp().notify({ message: "Vui lòng nhập đúng định dạng số điện thoại." }, { type: 'danger', delay: 3000 });
								return false;
							}
							if (email_list !== null && email_list !== undefined && email_list !== "") {
								var danhsach_email = email_list.split(',');
								for (var i = 0; i < danhsach_email.length; i++) {
									if (!!danhsach_email[i] && gonrinApp().validateEmail(danhsach_email[i]) == false) {
										self.getApp().notify({ message: "Vui lòng nhập đúng định dạng email." }, { type: 'danger', delay: 3000 });
										return false;
									}
								}
							}
							self.model.save(null, {
								success: function (model, respose, options) {
									self.getApp().notify("Lưu thông tin thành công");
									self.getApp().getRouter().navigate(self.collectionName + "/collection");

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
						}
					},
					{
						name: "delete",
						type: "button",
						buttonClass: "btn-danger width-sm ml-2",
						label: `<i class="fas fa-trash-alt"></i> Xóa`,
						visible: function () {
							return false;
							return this.getApp().getRouter().getParam("id") !== null;
						},
						command: function () {
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
										success: function (model, response) {
											self.getApp().hideloading();
											delete_success = null;
											self.getApp().notify('Xoá dữ liệu thành công');
											self.getApp().getRouter().navigate(self.collectionName + "/collection");
										},
										error: function (xhr, status, error) {
											self.getApp().hideloading();
											delete_success = null;
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
						{ value: 0, text: "Ngừng hoạt động" },
					],
				},
				{
					field: "loai_uu_tien",
					uicontrol: "combobox",
					textField: "text",
					valueField: "value",
					cssClass: "form-control",
					dataSource: [
						{ value: 1, text: "Ưu tiên cao" },
						{ value: 2, text: "trung bình" },
						{ value: 3, text: "Ưu tiên thấp" },
					],
					value: 1
				},
			]
		},
		render: function () {
			var self = this;
			var id = this.getApp().getRouter().getParam("id");
			if (id) {
				this.model.set('id', id);
				this.model.fetch({
					success: function (data) {
						self.applyBindings();
						self.initCheckBox();
						self.initEvent();
					},
					error: function () {
						self.getApp().notify(self.getApp().translate("TRANSLATE:error_load_data"));
					},
				});
			} else {
				self.applyBindings();
				self.initEvent();
			}

		},
		initCheckBox: function(){
			var self = this;
			let kho_mac_dinh = self.model.get("kho_mac_dinh");
			if (!!kho_mac_dinh){
				self.$el.find(`#kho_mac_dinh`).attr("style", "pointer-events: none;");
				self.$el.find(`#khomacdinh`).prop("checked", true);
			}
		},
		initEvent: function(){
			var self = this;
			self.$el.find(`#khomacdinh`).on("change", (event)=>{
				let check = self.$el.find(`#khomacdinh`).prop("checked");
				if (check){
					self.setKhoMacDinh();
				}
			})
		},
		setKhoMacDinh: function(){
			var self = this;
			var ma_kho = self.model.get("ma_kho");
			var ten_kho = self.model.get("ten_kho");
			if (ma_kho == null || ma_kho == undefined || ma_kho.trim() == "") {
				self.$el.find(`#khomacdinh`).prop("checked", false);
				self.getApp().notify({ message: "Mã kho không được để trống" }, { type: "danger", delay: 1000 });
				return false;
			}
			if (ten_kho == null || ten_kho == undefined || ten_kho.trim() == "") {
				self.$el.find(`#khomacdinh`).prop("checked", false);
				self.getApp().notify({ message: "Tên kho không được để trống" }, { type: "danger", delay: 1000 });
				return false;
			}

			var url = (self.getApp().serviceURL || "") + '/api/v1/set_khomacdinh';
			$.ajax({
				url: url,
				type: 'POST',
				data: JSON.stringify(self.model.toJSON()),
				dataType: 'json',
				success: function (response) {
					self.getApp().hideloading();
					self.getApp().notify('Lưu thông tin thành công');
					let id = self.getApp().getRouter().getParam("id");
					if (!!id){
						self.getApp().getRouter().refresh();
					}
					else{
						let path = `danhmuc_kho/model?id=${response.id}&back=true`;
						self.getApp().getRouter().navigate(path);
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

});