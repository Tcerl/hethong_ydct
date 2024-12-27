define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/quanly_hanhnghe/CoSoHanhNghe/tpl/model.html'),
		schema = require('json!schema/CoSoHanhNgheSchema.json');
	var ManageFileVIew = require("app/view/AttachFile/ManageFileUploadView");
	var NguoiHanhNghe = require('app/quanly_hanhnghe/NguoiHanhNghe/CollectionView');
	var RejectDialogView = require('app/bases/RejectDialogView');
	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "coso_hanhnghe",
		tools: [
			{
				name: "defaultgr",
				type: "group",
				groupClass: "toolbar-group",
				buttons: [
					{
						name: "back",
						type: "button",
						buttonClass: "btn-secondary width-sm",
						label: `<i class="fas fa-arrow-circle-left"></i> Quay lại`,
						command: function() {
							var self = this;
							self.getApp().getRouter().navigate(self.collectionName + "/collection");
						}
					},
					{
						name: "save",
						type: "button",
						buttonClass: "btn-success width-sm ml-2 btn-update",
						label: `<i class="far fa-save"></i> Lưu`,
						visible: function() {
                            var tuyendonvi_id = gonrinApp().getTuyenDonVi();
                            return gonrinApp().hasRole("admin") ||  tuyendonvi_id=='1';
                        },
						command: function() {
							var self = this;
							var ten_coso = self.model.get('ten_coso');
							if (ten_coso == null || ten_coso == undefined || ten_coso.trim() == "") {
								self.getApp().notify({ message: "Tên cơ sở hành nghề không được để trống"}, { type: "danger", delay: 1000 });
								return false;
							}
							self.model.set("ten_coso", ten_coso.trim().toUpperCase());
							var email_coso = self.model.get("email_coso");
							if (email_coso != null && email_coso != undefined && email_coso.trim() != "") {
								self.model.set("email_coso", email_coso.trim().toLowerCase());
							}
							self.getApp().showloading();
							self.model.save(null, {
								success: function (model, response, options) {
									self.getApp().hideloading();
									self.getApp().notify("Lưu thông tin thành công");
									self.model.set("id", response.id);
									if (!gonrinApp().getRouter().getParam("id") && !!self.model.get("id")) {
										self.initNguoiHanhNghe();
									};
									// let path = 'coso_hanhnghe/collection'
									// self.getApp().getRouter().navigate(path);
								},
								error: function(xhr, status, error) {
									self.getApp().hideloading();
									try {
										if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
											self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
											self.getApp().getRouter().navigate("login");
										} 
										else {
											self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 2000 });
										}
									}
									catch (err) {
										self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 2000 });
									}
								},
							});
						}
					},
					{
						name: "delete",
						type: "button",
						buttonClass: "btn-danger width-sm ml-2 btn-delete",
						label: `<i class="fas fa-trash-alt"></i> Xoá`,
						// visible: function() {
						// 	return (!!gonrinApp().getRouter().getParam("id") && (gonrinApp().hasRole('admin') || gonrinApp().hasRole('admin_donvi')));
						// },
						visible: function() {
                            var tuyendonvi_id = gonrinApp().getTuyenDonVi();
                            return gonrinApp().hasRole("admin") ||  tuyendonvi_id=='1';
                        },
						command: function() {
							var self = this;
							var view = new RejectDialogView({viewData: {"text": "Xóa cơ sở này thì sẽ không thể khôi phục lại và bản ghi dữ liệu này sẽ được xóa vĩnh viễn."}});
							view.dialog();
							view.on("confirm",(e) => {
								self.getApp().showloading();
								self.model.destroy({
									success: function (model, response) {
										self.getApp().hideloading();
										self.getApp().notify('Xoá dữ liệu thành công');
										gonrinApp().getRouter().navigate(self.collectionName + '/collection');
									},
									error: function(xhr, status, error) {
										self.getApp().hideloading();
										try {
											if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
												self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
												self.getApp().getRouter().navigate("login");
											} 
											else {
												self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
											}
										}
										catch (err) {
											self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
										}
									},
								});
							});							
						}
					},
				],
			}
		],
		uiControl: {
			fields: [
				{
                    field: "loai_coso",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: 1, text: "Hành nghề y cổ truyền" },
                        { value: 2, text: "Hành nghề dược cổ truyền" },
                    ],
                },
				{
                    field: "dkkd_ngay_cap",
                    uicontrol: "datetimepicker",
                    format: "DD/MM/YYYY",
                    textFormat: "DD/MM/YYYY",
                    extraFormats: ["DDMMYYYY"],
                    parseInputDate: function(val) {
                        return gonrinApp().parseInputDateString(val);
                    },
                    parseOutputDate: function(date) {
                        return gonrinApp().parseOutputDateString(date, "YYYYMMDD");
                    },
                    disabledComponentButton: true
                },
				{
                    field: "dkkd_ngay_hieu_luc",
                    uicontrol: "datetimepicker",
                    format: "DD/MM/YYYY",
                    textFormat: "DD/MM/YYYY",
                    extraFormats: ["DDMMYYYY"],
                    parseInputDate: function(val) {
                        return gonrinApp().parseInputDateString(val);
                    },
                    parseOutputDate: function(date) {
                        return gonrinApp().parseOutputDateString(date, "YYYYMMDD");
                    },
                    disabledComponentButton: true
                },
				{
                    field: "dkkd_ngay_het_han",
                    uicontrol: "datetimepicker",
                    format: "DD/MM/YYYY",
                    textFormat: "DD/MM/YYYY",
                    extraFormats: ["DDMMYYYY"],
                    parseInputDate: function(val) {
                        return gonrinApp().parseInputDateString(val);
                    },
                    parseOutputDate: function(date) {
                        return gonrinApp().parseOutputDateString(date, "YYYYMMDD");
                    },
                    disabledComponentButton: true
                },
			]
		},
		render: function() {
			var self = this;
			var id = self.getApp().getRouter().getParam("id");
			if (id) {
				this.model.set({
                    'id': id
                });
				this.model.fetch({
					success: function (data) {
						self.applyBindings();
						self.initNguoiHanhNghe();
						self.initEvent();
						var tuyendonvi_id = gonrinApp().getTuyenDonVi();
						if(!gonrinApp().hasRole("admin") && tuyendonvi_id != '1'){
							self.$el.find("input").css("pointer-events","none");
							self.$el.find("#pointer-selectize").css("pointer-events","none");
							self.$el.find("#button_of").hide();
						}
					},
					error: function(xhr, status, error) {
						try {
							if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
								self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
								self.getApp().getRouter().navigate("login");
							} 
							else {
								self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
							}
						}
						catch (err) {
							self.getApp().notify({ message: "Có lỗi xảy ra, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
						}
					},
				});
			} 
			else {
				self.applyBindings();
				self.initEvent();
			}

			return;
		},
		initEvent: function() {
			var self = this;
			gonrinApp().selectizeTinhThanhQuanHuyenXaPhuong(self, false, false, false, '#selectize-tinhthanh', '#selectize-quanhuyen', '#selectize-xaphuong', 'tinhthanh_coso_id', 'quanhuyen_coso_id', 'xaphuong_coso_id', 'tinhthanh_coso', 'quanhuyen_coso', 'xaphuong_coso'); 
			var fileView = new ManageFileVIew({ viewData: { "listFile": self.model.get('dinhkem_chungchi'), "el_btn_upload": ".btn-add-file" }, el: self.$el.find(".list-attachment") });
			fileView.render();
			fileView.on("change", (event) => {
				var listfile = event.data;
				self.model.set('dinhkem_chungchi', listfile);
			});
			self.$el.find(".btn-add-file").unbind("click").bind("click", function() {
				fileView.$el.find("#upload_files").trigger('click');
			});
		},
		initNguoiHanhNghe: function() {
			var self = this;
			if (self.model.get("id")) {
				self.$el.find("#danhsach_nguoihanhnghe").removeClass("d-none");
				var nguoi_hanhnghe = new NguoiHanhNghe({ el: self.$el.find("#danhsach_nguoihanhnghe"), viewData: {"coso_kinhdoanh_id": self.model.get("id")}});
				nguoi_hanhnghe.render();
			}
			else {
				self.$el.find("#danhsach_nguoihanhnghe").addClass("d-none");
			}
		},
	});

});