define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/quanly_hanhnghe/NguoiHanhNghe/tpl/model.html'),
		schema = require('json!schema/NguoiHanhNgheCoSoKDSchema.json');
	var ManageFileVIew = require("app/view/AttachFile/ManageFileUploadView");
	var ChungChiHanhNghe = require('app/quanly_hanhnghe/ChungChiHanhNghe/CollectionView');
	var RejectDialogView = require('app/bases/RejectDialogView');
	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "nguoi_hanhnghe",
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
							self.getApp().getRouter().navigate("coso_hanhnghe/model?id=" + self.model.get("coso_kinhdoanh_id"));
						}
					},
					{
						name: "save",
						type: "button",
						buttonClass: "btn-success width-sm ml-2 btn-update",
						label: `<i class="far fa-save"></i> Lưu`,
						// visible: function() {
						// 	return (gonrinApp().hasRole('admin') || gonrinApp().hasRole('admin_donvi'));
						// },
						visible: function() {
                            var tuyendonvi_id = gonrinApp().getTuyenDonVi();
                            return gonrinApp().hasRole("admin") ||  tuyendonvi_id=='1';
                        },
						command: function() {
							var self = this;
							var ten = self.model.get('ten');
							if(ten == null || ten == undefined || ten.trim() == "") {
								self.getApp().notify({ message: "Tên người hành nghề không được để trống"}, { type: "danger", delay: 1000 });
								return false;
							}
							self.model.set("ten", ten.trim().toUpperCase());
							var email = self.model.get("email");					
							if (email != null && email != undefined && email.trim() != "") {
								self.model.set("email", email.trim().toLowerCase());
							}
							self.getApp().showloading();
							self.model.save(null, {
								success: function (model, response, options) {
									self.getApp().hideloading();
									self.getApp().notify("Lưu thông tin thành công");
									self.model.set("id", response.id);
									if (!gonrinApp().getRouter().getParam("id") && !!self.model.get("id")) {
										self.initChungChiHanhNghe();
									}
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
							var view = new RejectDialogView({viewData: {"text": "Xóa người hành nghề này thì sẽ không thể khôi phục lại và bản ghi dữ liệu này sẽ được xóa vĩnh viễn."}});
							view.dialog();
							view.on("confirm",(e) => {
								self.getApp().showloading();
								self.model.destroy({
									success: function (model, response) {
										self.getApp().hideloading();
										self.getApp().notify('Xoá dữ liệu thành công');
										self.getApp().getRouter().navigate("coso_hanhnghe/model?id=" + self.model.get("coso_kinhdoanh_id"));
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
					field: "ngay_cap",
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
					field: "ngay_hieu_luc",
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
					field: "ngay_het_han",
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
					field: "ngaysinh",
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
					field: "ngay_batdau",
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
					field: "ngay_kethuc",
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
                    field: "vaitro",
                    uicontrol: "combobox",
                    textField: "name",
                    valueField: "value",
                    cssClass: "form-control",
					placeholder: "Chọn vai trò",
                    dataSource: [
                        { name: "Người chịu trách nhiệm chuyên môn về dược", value: 1 },
                    	{ name: "Người phụ trách đảm bảo chất lượng", value: 2 },
                    ],
                },
				{
                    field: "gioitinh",
                    uicontrol: "combobox",
                    textField: "name",
                    valueField: "value",
                    cssClass: "form-control",
					placeholder: "Chọn giới tính",
                    dataSource: [
                        { name: "Nam", value: 1 },
                    	{ name: "Nữ", value: 2 },
						{ name: "Khác", value: 3 },
                    ],
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
					success: function(data) {
						self.applyBindings();
						self.initChungChiHanhNghe();
						self.initEvent();
						var tuyendonvi_id = gonrinApp().getTuyenDonVi();
						if(!gonrinApp().hasRole("admin") && tuyendonvi_id != '1'){
							self.$el.find("input").css("pointer-events","none");
							self.$el.find("#pointer-selectize").css("pointer-events","none");
							// self.$el.find("#button_of").hide();
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
				var coso_kinhdoanh_id = self.getApp().getRouter().getParam("coso_kinhdoanh_id");
				if (coso_kinhdoanh_id) {
					self.model.set("coso_kinhdoanh_id", coso_kinhdoanh_id);
					self.initEvent();
				}
				else {
					self.getApp().notify({ message: "Có lỗi xảy ra, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
					return
				}
			}

			return;
		},
		initEvent: function() {
			var self = this;
			gonrinApp().selectizeTinhThanhQuanHuyenXaPhuong(self); 
			var fileView = new ManageFileVIew({ viewData: { "listFile": self.model.get('dinhkem_giaychungnhan'), "el_btn_upload": ".btn-add-file" }, el: self.$el.find(".list-attachment") });
			fileView.render();
			fileView.on("change", (event) => {
				var listfile = event.data;
				self.model.set('dinhkem_giaychungnhan', listfile);
			});
			self.$el.find(".btn-add-file").unbind("click").bind("click", function() {
				fileView.$el.find("#upload_files").trigger('click');
			});
		},
		initChungChiHanhNghe: function() {
			var self = this;
			if (self.model.get("id")) {
				self.$el.find("#danhsach_chungchi_hanhnghe").removeClass("d-none");
				var chungchi_hanhnghe = new ChungChiHanhNghe({ el: self.$el.find("#danhsach_chungchi_hanhnghe"), viewData: {"nguoi_hanhnghe_id": self.model.get("id")}});
				chungchi_hanhnghe.render();
			}
			else {
				self.$el.find("#danhsach_chungchi_hanhnghe").addClass("d-none");
			}
		},
	});
});