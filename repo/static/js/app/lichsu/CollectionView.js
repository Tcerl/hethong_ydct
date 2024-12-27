define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/lichsu/tpl/collection.html'),
		schema = require('json!schema/LichSuSanPhamSchema.json');
	var CustomFilterView = require('app/bases/CustomFilterView');

	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "lichsu_sanpham",
		uiControl: {
			fields: [
				{ field: "id_sanpham_danhmuc", label: "Id dược liệu" },
				{ field: "ten_sanpham", label: "Tên dược liệu"},
				{ field: "id_chungnhan_co", label: "Số CO"},
				{ field: "donvi_sanxuat", label: "Số CQ" },
				{ field: "so_lo", label: "Số lô" },
			],
			onRowClick: function (event) {
				// if (event.rowId) {
				// 	var path = this.collectionName + '/model?id=' + event.rowId;
				// 	this.getApp().getRouter().navigate(path);
				// }
			},
			language: {
				no_records_found: "Chưa có dữ liệu"
			},
			noResultsClass: "alert alert-default no-records-found",
			datatableClass: "table table-mobile"
		},
		tools: [
			
		],
		render: function () {
			var self = this;
			
			self.uiControl.orderBy = [{ "field": "thoigian_nhapkhau", "direction": "desc" }];
			self.applyBindings();
			self.$el.find(".btn-search").unbind("click").bind("click", function () {
				self.filterCollection();
			});
			self.$el.find('.btn-clear').unbind("click").bind("click", function () {
				self.$el.find('#id_sanpham').val('');
				self.$el.find('#so_lo').val('');
				self.$el.find("#so_co").val("");
				self.$el.find("#so_cq").val("");
				self.filterCollection();
			});
			return this;
		},
		filterCollection: function () {
			var self = this;
			var id_sanpham = self.$el.find('#id_sanpham').val();
			var so_lo = self.$el.find('#so_lo').val();
			var so_co = self.$el.find('#so_co').val();
			var so_cq = self.$el.find('#so_cq').val();

			var arr = [];
			if(id_sanpham!=null && id_sanpham!==undefined){
				arr.push({"id_sanpham_danhmuc": {"$likeI": id_sanpham}});
			}
			if(so_lo!=null && so_lo!==undefined){
				arr.push({"so_lo": {"$likeI": so_lo}});
			}
			if(so_co!=null && so_co!==undefined){
				arr.push({"id_chungnhan_co": {"$likeI": so_co}});
			}
			if(so_cq!=null && so_cq!==undefined ){
				arr.push({"phieu_kiem_nghiem_id": {"$likeI": so_cq}});
			}
			var query = "";
			if(arr.length> 0){
				query = {
					"$and": arr
				}
			}
			if (query !== "") {
				var $col = self.getCollectionElement();
				$col.data('gonrin').filter(query);
			}
		}

	});

});