define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/bases/tpl/collection.html');
	var ModelDialog = require('app/danhmuc/danhmuc_dungchung/CoSoDaoTao/ModelView');
	var CustomFilterView      = require('app/bases/CustomFilterView');
	
	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: {},
		urlPrefix: "/api/v1/",
		collectionName: "coso_daotao",
		tools: [
			{
				name: "defaultgr",
				type: "group",
				groupClass: "toolbar-group",
				visible: function() {
					return gonrinApp().hasRole("admin") || gonrinApp().hasRole("admin_donvi");
				},
				buttons: [
					{
						name: "save",
						type: "button",
						buttonClass: "btn-primary btn-sm width-sm",
						label: `<i class="fas fa-plus"></i> Thêm mới`,
						visible: function() {
							var tuyendonvi_id = gonrinApp().getTuyenDonVi();
							return gonrinApp().hasRole("admin") || tuyendonvi_id=='1';
						},
						command: function() {
							var self = this;
							var modelDialog = new ModelDialog();
							modelDialog.dialog({size:"large"});
							modelDialog.on("saveData", function (data) {
								self.doFilter();
							});
						}
					},
				],
			}
		],
		uiControl: {
			fields: [
				{ field: "stt", label: "STT", width: 40 },
				{ field: "ma_coso", label: "Mã", width: 200 },
				{ field: "ten_coso", label: "Tên", width: 250},
				{ field: "diachi", label: "Địa chỉ", width: 250},
			],
			onRowClick: function (event) {
				if (event.rowId) {
					var self = this;
					var modelDialog = new ModelDialog({ "viewData": { "id": event.rowId } });
					modelDialog.dialog({size:"large"});
					modelDialog.on("saveData", function (data) {
						self.doFilter();
					});
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
		text_filter: null,
		render: function () {
			var self = this;
			self.text_filter = null;
			self.$el.find("#title_page").html("Danh sách cơ sở đào tạo");
			self.$el.addClass("collection-category");
			var filter = new CustomFilterView({
    			el: self.$el.find("#grid_search")
    		});
			filter.render();
			filter.$el.find('.search-collection input').attr("placeholder", "Nhập tên, mã cơ sở đào tạo để tìm kiếm.");
			var filters = {
                "$and": [
                    { "deleted": { "$eq": false } }
                ]
            }
            self.uiControl.filters = filters;
			filter.on('filterChanged', function(evt) {
    			var $col = self.getCollectionElement();
                var text = !!evt.data.text ? evt.data.text.trim() : "";
                if ($col) {
                    if (text !== null) {
                        self.text_filter = text;
                    } else {
                        self.text_filter = null;
                    }
                    self.doFilter();
                }
                self.applyBindings();
    		});

			self.applyBindings();
			self.$el.find("table").addClass("table-hover");
            self.$el.find("table").removeClass("table-striped");
			return this;
		},
		doFilter: function () {
			var self = this;
            var $col = self.getCollectionElement();
            var filters = {
                "$and": [
                    { "deleted": { "$eq": false } }
                ]
            }
            if (!!self.text_filter) {
                filters['$and'].push({"$or": [
					{"tenkhongdau": {"$likeI": gonrinApp().convert_khongdau(self.text_filter) }},
					{"ma_coso": {"$likeI": self.text_filter }},
				]});
            } 
            $col.data('gonrin').filter(filters);
		}
	});
});