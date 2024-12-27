define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/danhmuc/danhmuc_dungchung/CoSoDaoTao/tpl/model.html'),
		schema = require('json!schema/CoSoDaoTaoYHCTSchema.json');
	var RejectDialogView = require('app/bases/RejectDialogView');
	return Gonrin.ModelDialogView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "coso_daotao",
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
						label: `<i class="fa fa-times"></i> Đóng`,
						command: function() {
							var self = this;
							self.close();
						}
					},
					{
						name: "save",
						type: "button",
						buttonClass: "btn-success width-sm ml-2",
						label: `<i class="far fa-save"></i> Lưu`,
						visible: function() {
							var tuyendonvi_id = gonrinApp().getTuyenDonVi();
							return gonrinApp().hasRole("admin") || tuyendonvi_id=='1';
						},
						// visible: function() {
						// 	return gonrinApp().hasRole("admin") || gonrinApp().hasRole("admin_donvi");
						// },
						command: function() {
							var self = this;
							var ma = self.model.get("ma_coso"),
								ten = self.model.get("ten_coso");
							
							if (!ma) {
								self.getApp().notify({ message: "Vui lòng nhập mã cơ sở" }, { type: "danger", delay: 1000 });
								return;
							} 
							else if (!ten) {
								self.getApp().notify({ message: "Vui lòng nhập tên cơ sở" }, { type: "danger", delay: 1000 });
								return;
							}
							self.getApp().showloading();
							self.model.save(null, {
								success: function(model, respose, options) {
									self.getApp().hideloading();
									self.getApp().notify("Lưu thông tin thành công");
									self.trigger("saveData");
									self.close();
								},
								error: function(xhr, status, error) {
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
					},
					{
						name: "delete",
						type: "button",
						buttonClass: "btn-danger width-sm ml-2",
						label: `<i class="fas fa-trash-alt"></i> Xóa`,
						visible: function() {
							var tuyendonvi_id = gonrinApp().getTuyenDonVi();
							return gonrinApp().hasRole("admin") || tuyendonvi_id=='1';
						},
						// visible: function() {
						// 	return ((gonrinApp().hasRole("admin") || gonrinApp().hasRole("admin_donvi")) && !!this.viewData && !!this.viewData.id);
						// },
						command: function() {
							var self = this;
							var view = new RejectDialogView({ viewData: { "text": "Bạn có chắc chắn muốn xóa bản ghi này không?" } });
							view.dialog();
							view.on("confirm", (e) => {
								self.getApp().showloading();
								self.model.destroy({
									success: function (model, response) {
										self.getApp().hideloading();
										self.getApp().notify('Xoá dữ liệu thành công');
										self.trigger("saveData");
										self.close();
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
							});
						}
					},
				],
			}
		],
		uiControl: {
		},
		render: function () {
			var self = this;
			var id = (!!self.viewData && !!self.viewData.id) ? self.viewData.id : null;
			if (id) {
				this.model.set('id', id);
				this.model.fetch({
					success: function (data) {
						self.applyBindings();
						var tuyendonvi_id = gonrinApp().getTuyenDonVi();
						if(!gonrinApp().hasRole("admin") && tuyendonvi_id != '1'){
							self.$el.find("input").css("pointer-events","none");
							self.$el.find("#pointer-selectize").css("pointer-events","none");
						}
						gonrinApp().selectizeTinhThanhQuanHuyenXaPhuong(self);
					},
					error: function () {
						self.getApp().notify(self.getApp().traslate("TRANSLATE:error_load_data"));
					},
				});
			} else {
				self.applyBindings();
				gonrinApp().selectizeTinhThanhQuanHuyenXaPhuong(self);
			}
		},
	});
});