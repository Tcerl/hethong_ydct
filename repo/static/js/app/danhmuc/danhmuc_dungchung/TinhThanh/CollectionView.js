define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/bases/tpl/collection.html');
	var ModelDialogView = require("app/danhmuc/danhmuc_dungchung/TinhThanh/ModelView");
	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: {},
		urlPrefix: "/api/v1/",
		collectionName: "tinhthanh",
		uiControl: {
			fields: [
				{ field: "stt", label: "STT", width: 100 },
				{ field: "id", label: "Mã", width: 250 },
				{ field: "ten", label: "Tên", width: 350 },
				{
					field: "quocgia", label: "Quốc gia", template: function (rowData) {
						return rowData.quocgia ? rowData.quocgia.ten : "";

					}
				},
			],
			onRowClick: function (event) {
				if (event.rowId) {
					var dialog = new ModelDialogView({ "viewData": { "id": event.rowId } });
					dialog.dialog();
					dialog.on("saveData", function () {
						self.doFilter();
					})
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
		render: function () {
			this.uiControl.orderBy = [{ "field": "ma", "direction": "asc" }];
			this.$el.find('.page-title').text('Danh sách tỉnh thành');
			this.applyBindings();
			this.$el.addClass('category-common');
			return this;
		},
		doFilter: function () {
			var self = this;
			var $col = self.getCollectionElement();
			$col.data('gonrin').filter(null);
		}
	});

});