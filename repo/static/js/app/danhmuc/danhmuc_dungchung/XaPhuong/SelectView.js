define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/bases/tpl/select.html'),
    	schema 				= require('json!app/danhmuc/danhmuc_dungchung/XaPhuong/Schema.json');
    var CustomFilterView      = require('app/bases/CustomFilterView');

    return Gonrin.CollectionDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "xaphuong",
    	textField: "ten",
    	valueField: "id",
		query: null,
    	tools : [
			{
					name: "close",
					type: "button",
					buttonClass: "btn-secondary waves-effect width-sm ml-2",
					label: "TRANSLATE:CLOSE",
					command: function(){
						var self = this;
						self.close();
					}
			},
    	],
    	uiControl:{
    		fields: [
    				{ field: "ma", label: "Mã", width:150},
    		     	{ field: "ten", label: "Tên", width:250 },
//    		     	{
//        	        	 field: "quanhuyen_id", 
//        	        	 label: "Quận huyện",
//        	        	 foreign: "quanhuyen",
//        	        	 foreignValueField: "id",
//        	        	 foreignTextField: "ten",
//        	        	 width:250
//        	         },
    		    ],
    		    onRowClick: function(event){
					this.uiControl.selectedItems = event.selectedItems;
					var self = this;
					self.trigger("onSelected");
					var selected_items = self.uiControl.selectedItems;
					if(!!selected_items && selected_items.length>0){
						self.getApp().data("xaphuong_id", selected_items[0]["id"]);
					}
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
//    		if (this.getApp().data("quanhuyen_id") !== null){
//    			this.uiControl.filters = {"quanhuyen_id": {"$eq": this.getApp().data("quanhuyen_id")}};
//    		}
			this.$el.find('.page-title').text('Danh sách xã phường');
    		var self = this;
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
    		self.uiControl.orderBy = [{"field": "ma", "direction": "asc"}];
    		if(!filter.isEmptyFilter()) {
    			var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
    			var filters = {"ten": {"$likeI": text }};
				var filter1;
				if (self.query !== null && self.query !== undefined) {
					filter1 = { "$and": [
						filters, self.query
					]};
				} else {
					filter1 = filters;
				}
    			self.uiControl.filters = filter1;
    		}
    		self.applyBindings();
    		
    		filter.on('filterChanged', function(evt) {
    			var $col = self.getCollectionElement();
    			var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null){
						var filters = {"ten": {"$likeI": text }};
						var filter1;
						if (self.query !== null && self.query !== undefined) {
                            filter1 = { "$and": [
                                filters, self.query
							]};
                        } else {
                            filter1 = filters;
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