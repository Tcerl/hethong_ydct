define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/bases/tpl/collection.html'),
		schema 				= require('json!schema/NgheNghiepSchema.json');
	var CustomFilterView      = require('app/bases/CustomFilterView');
    
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "nghenghiep",
    	uiControl:{
	    	fields: [
		     	 { field: "ma", label: "Mã", width:200},
				  { field: "ten", label: "Tên", width:250 },
				  { field: "mota", label: "Mô tả", width:250 },
				  { field: "active", label: "Trạng thái", width:150, template:function(rowData){
					if(rowData.active !== undefined && rowData.active === 1){
						return "Hoạt động";
					} else {
						return "tạm ngưng";
					}
				  } }
	           	 
		     ],
		     onRowClick: function(event){
		    		if(event.rowId){
		        		var path = this.collectionName + '/model?id='+ event.rowId;
		        		this.getApp().getRouter().navigate(path);
		        	}
		    	},
		    	language:{
	        		no_records_found:"Chưa có dữ liệu"
	        	},
	        	noResultsClass:"alert alert-default no-records-found",
	        	datatableClass:"table table-mobile",
		    	onRendered: function (e) {
			    	gonrinApp().responsive_table();
				}
    	},
	     render:function(){
			 var self = this;
			 self.$el.find("#title_page").html("Danh sách Nghề nghiệp");
			//  this.uiControl.orderBy = [{"field": "ten", "direction": "asc"}];
			 
	    	//  this.applyBindings();
			//  return this;
			 

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

    		self.uiControl.orderBy = [{"field": "ten", "direction": "asc"}];
    		if(!filter.isEmptyFilter()) {
    			var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
    			var filters = {"tenkhongdau": {"$likeI": text }};
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
						var filters = {"tenkhongdau": {"$likeI": text }};
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
    	}
    	
    });

});