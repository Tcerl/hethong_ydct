define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
		var template 			= require('text!app/bases/tpl/select.html'),
    	schema 				= require('json!schema/DanhMucKhoSchema.json');
    var CustomFilterView      = require('app/bases/CustomFilterView');

    return Gonrin.CollectionDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "danhmuc_kho",
    	textField: "ten_kho",
    	valueField: "id",
		query: null,
    	tools : [
			{
				name: "close",
				type: "button",
				buttonClass: "btn-secondary waves-effect width-sm",
				label: "TRANSLATE:CLOSE",
				command: function(){
					var self = this;
					self.close();
				}
			},
    	],
    	uiControl:{
    		fields: [
				{ field: "ma_kho", label: "Mã Kho", width:200},
				{ field: "ten_kho", label: "Tên Kho", width:250 },
				{ field: "mota", label: "Mô tả", width:250 }
    		    ],
    		    onRowClick: function(event){
					this.uiControl.selectedItems = event.selectedItems;
					var self = this;
					self.trigger("onSelected");
					self.close();
				},
				language:{
					no_records_found:"Chưa có dữ liệu"
				},
				noResultsClass:"alert alert-default no-records-found",
    	    	onRendered: function (e) {
    		    	gonrinApp().responsive_table();
    			}
    	},
    	render:function(){
			var self= this;
			self.$el.find("#title_page").html("Danh sách Kho");
			self.query == null;
			if (this.uiControl.selectedItems !== null) {
                this.uiControl.selectedItems = "";
            }
    		var filter = new CustomFilterView({
    			el: self.$el.find("#grid_search"),
    			sessionKey: self.collectionName +"_filter"
    		});
    		filter.render();
			self.$el.find("#grid_search input").val("");
            var filter_query = self.uiControl.filters;
            if (filter_query !== undefined && filter_query !== null && filter_query !== false) {
				self.query = filter_query;
            }
            filter.model.set("text", "");

    		self.uiControl.orderBy = [{"field": "ten_kho", "direction": "asc"}];
    		if(!filter.isEmptyFilter()) {
    			var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
    			var filters = {"ten_kho": {"$likeI": text }};
				var filter1;
				if (self.query !== null && self.query !== undefined) {
					filter1 = { "$and": [
						filters, self.query,
						{"active": {"$eq": 1}}
					]};
				} else {
					filter1 = {
						"$and": [
							filters,
						{"active": {"$eq": 1}}
						]
					} ;
				}
    			self.uiControl.filters = filter1;
    		}
			else{
				filter1 = { "$and": [
					{"active": {"$eq": 1}}
				]};
    			self.uiControl.filters = filter1;
			}
    		self.applyBindings();
    		
    		filter.on('filterChanged', function(evt) {
    			var $col = self.getCollectionElement();
    			var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null){
						var filters = {"ten_kho": {"$likeI": text }};
						var filter1;
						if (self.query !== null && self.query !== undefined) {
                            filter1 = { "$and": [
                                filters, self.query,
								{"active": {"$eq": 1}}
							]};
                        } else {
                            filter1 = {
								"$and": [
									filters,
								{"active": {"$eq": 1}}
								]
							} ;
						}
						$col.data('gonrin').filter(filter1);
					}
				}
				self.applyBindings();
    		});
    		return this;
    	},
    });

});