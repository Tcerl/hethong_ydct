define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/quanlykho/PhieuDuTru/tpl/collection.html'),
		schema = require('json!schema/PhieuDuTruSchema.json');
	var CustomFilterView = require('app/bases/CustomFilterView');

	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "phieudutru",
		uiControl: {
			fields: [
				{
					field: "ngay_du_tru", label: "Ngày dự trù", width: 180, template: function (rowData) {
						if (rowData !== undefined) {
							if (rowData.ngay_du_tru !== null && rowData.ngay_du_tru !== undefined) {
								return gonrinApp().parseInputDateString(rowData.ngay_du_tru).format("DD/MM/YYYY");
							}
						}
						return "";
					}
				},
				{
					field: "loai_du_tru", label: "Loại dự trù", width: 250, template: function (rowData) {
						if (rowData !== undefined && rowData.loai_du_tru !== null) {
							if (rowData.loai_du_tru === 1 || rowData.loai_du_tru === "1") {
								return "dự trù mới";
							} else if (rowData.loai_du_tru === 2 || rowData.loai_du_tru === "2") {
								return "dự trù bổ sung";
							}
						}
						return "";
					}
				},
				{
					field: "ten_kho", label: "Kho dự trù", width: 200, template: function (rowData) {
						if (rowData !== undefined) {
							if (rowData.du_tru_tat_ca_kho === 1) {
								return "tất cả";
							} else if (rowData.ten_kho != null) {
								return rowData.ten_kho;
							}
						}
						return "";
					}
				},
				{ field: "ten_nguoi_lap_phieu", label: "Người lập phiếu", width: 250 },
				{
					field: "updated_at", label: "Thời gian lưu phiếu", width: 180, template: function (rowData) {
						if (rowData !== undefined) {
							if (rowData.updated_at !== null && rowData.updated_at !== undefined) {
								return gonrinApp().timestampFormat(rowData.updated_at * 1000, "DD/MM/YYYY hh:mm");
							}
						}
						return "";
					}
				},
			],
			onRowClick: function (event) {
				if (event.rowId) {
					var path = this.collectionName + '/model?id=' + event.rowId;
					this.getApp().getRouter().navigate(path);
				}
			},
			language: {
				no_records_found: "Chưa có dữ liệu"
			},
			noResultsClass: "alert alert-default no-records-found",
			datatableClass: "table table-mobile",
			onRendered: function (e) {
				gonrinApp().responsive_table();
			}
		},
		tools: [
			{
				name: "default",
				type: "group",
				groupClass: "toolbar-group",
				buttons: [
					{
						name: "create",
						type: "button",
						buttonClass: "btn-primary btn-sm",
						label: `<i class="fa fa-plus"></i> Thêm mới`,
						command: function () {
							var self = this;
							gonrinApp().getRouter().navigate(this.collectionName + '/model');
						}
					},
				]
			},
		],
		render: function () {
			var self = this;
			var tungay = self.$el.find('.tungay').datetimepicker({
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
			});
			var denngay = self.$el.find('.denngay').datetimepicker({
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
			});

			self.$el.find(".btn-search").unbind("click").bind("click", function () {
				var ngay_bat_dau = tungay.data("gonrin").getValue();
				var ngay_ket_thuc = denngay.data("gonrin").getValue();
				var tmp = gonrinApp().parseInputDateString(ngay_ket_thuc);
				var ngay_ket_thuc = self.parse_date_custom((moment(tmp).set({ hour: 23, minute: 59, second: 59 })));
				if ((ngay_bat_dau === null && ngay_ket_thuc === null)  || (ngay_bat_dau === "" && ngay_ket_thuc === "") || (ngay_bat_dau === null && ngay_ket_thuc === "") || (ngay_bat_dau === "" && ngay_ket_thuc === null)) {
					self.getApp().notify({ message: "Vui lòng chọn thời gian tìm kiếm." }, { type: "danger", delay: 3000 });
					return false;
				}
				else {
					if ((ngay_bat_dau !== null && ngay_ket_thuc == null) || (ngay_bat_dau !== "" && ngay_ket_thuc === "")) {
						var filters = {
							"ngay_du_tru": { "$ge": ngay_bat_dau }
						}
						self.uiControl.filters = filters;
						var $col = self.getCollectionElement();
						$col.data('gonrin').filter(filters);
					}
					else if ((ngay_bat_dau === null || ngay_bat_dau === "") && ngay_ket_thuc !== null && ngay_ket_thuc !== "") {
						var filters = {
							"ngay_du_tru": { "$le": (ngay_ket_thuc) }
						}
						self.uiControl.filters = filters;
						var $col = self.getCollectionElement();
						$col.data('gonrin').filter(filters);
					}
					else {
						if (ngay_ket_thuc < ngay_bat_dau) {
							self.getApp().notify({ message: "Vui lòng chọn ngày kết thúc lớn hơn hoặc bằng ngày bắt đầu." }, { type: "danger", delay: 1000 });
							return false;
						}
						else {
							var filters = {
								"$and": [
									{ "ngay_du_tru": { "$ge": ngay_bat_dau } },
									{ "ngay_du_tru": { "$le": (ngay_ket_thuc) } }
								]
							}
							self.uiControl.filters = filters;
							var $col = self.getCollectionElement();
							$col.data('gonrin').filter(filters);
						}
					}
				}
			});
			self.applyBindings();
			return this;
		},
		parse_date_custom: function (firstDay) {
			var tmp = "";
			var firstDay = new Date(firstDay);
			if (isNaN(firstDay) == true) {
				return "";
			}
			tmp = tmp + firstDay.getUTCFullYear();
			if (firstDay.getUTCMonth() < 9) {
				tmp = tmp + "0" + (firstDay.getUTCMonth() + 1)
			} else {
				tmp = tmp + (firstDay.getUTCMonth() + 1)
			}
			if (firstDay.getUTCDate() <= 9) {
				tmp = tmp + "0" + firstDay.getUTCDate();
			}
			else {
				tmp = tmp + firstDay.getUTCDate();
			}
			if (firstDay.getUTCHours() <= 9) {
				tmp = tmp + "0" + firstDay.getUTCHours();
			}
			else {
				tmp = tmp + firstDay.getUTCHours();
			}
			if (firstDay.getUTCMinutes() <= 9) {
				tmp = tmp + "0" + firstDay.getUTCMinutes();
			}
			else {
				tmp = tmp + firstDay.getUTCMinutes();
			}
			if (firstDay.getUTCSeconds() <= 9) {
				tmp = tmp + "0" + firstDay.getUTCSeconds();
			}
			else {
				tmp = tmp + firstDay.getUTCSeconds();
			}
			return tmp;
		}

	});

});