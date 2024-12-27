define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/bases/tpl/collection.html');
    var CustomFilterView      = require('app/bases/CustomFilterView');
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: {},
    	urlPrefix: "/api/v1/",
        collectionName: "coso_hanhnghe",
		text_filter: null,
		tools: [
			{
				name: "create",
                type: "button",
                buttonClass: "btn-primary btn-sm",
                label: `<i class="fas fa-plus"></i> Thêm mới`,
                visible: function() {
                    var tuyendonvi_id = gonrinApp().getTuyenDonVi();
                    return gonrinApp().hasRole("admin") ||  tuyendonvi_id=='1';
                },
                command: function() {
                    var self = this;
                    self.getApp().getRouter().navigate(self.collectionName + "/model");
                }
			},
      	],
		uiControl: {
            fields: [
                { field: "stt", label: "STT", width: 50 },
                { field: "ma_coso", label: "Mã cơ sở", width: 200 },
                { field: "ten_coso", label: "Tên cơ sở", width: 350 },
                { field: "diachi_coso", label: "Địa chỉ" },
            ],
            pagination: {
                page: 1,
                pageSize: 15
            },
            onRowClick: function(event) {
                if (event.rowId) {
                    var self = this;
                    self.getApp().getRouter().navigate(self.collectionName + "/model?id=" + event.rowId);
                }
            },
            datatableClass: "table table-mobile",
            onRendered: function(e) {
                gonrinApp().responsive_table();
            }
        },
	    render: function () {
			var self = this;
            self.$el.find('.page-title').text('Danh sách cơ sở hành nghề');
			var filter = new CustomFilterView({
    			el: self.$el.find("#grid_search"),
    			sessionKey: self.collectionName +"_filter"
			});
    		filter.render();
			self.uiControl.orderBy = [{"field": "ten_coso", "direction": "asc"}];
            var filters = {"$and": [
                {"deleted": {"$eq": false}},
            ]}
            self.uiControl.filters = filters;
			self.applyBindings();
			filter.on('filterChanged', function(evt) {
    			var $col = self.getCollectionElement();
    			var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null) {		
						self.doFilter();
					}
				}
				self.applyBindings();
			});
            self.$el.find("table").addClass("table-hover");
            self.$el.find("table").removeClass("table-striped");
            return this;
		},
		doFilter: function() {
            var self = this;
            var $col = self.getCollectionElement();
			var obj = {
				"$and": [
                    {"deleted": {"$eq": false}}
				]
			};
            var text = self.$el.find("#grid_search input").val();
			if (text !== null) {
                obj["$and"].push({ "ten_coso_khongdau": { "$likeI": gonrinApp().convert_khongdau(text) }});
            } 
            $col.data('gonrin').filter(obj);
			self.applyBindings();
        }
    });
});