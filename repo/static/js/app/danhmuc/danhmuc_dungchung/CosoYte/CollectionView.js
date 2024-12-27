define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/bases/tpl/collection.html'),
    	schema 				= require('json!schema/CoSoYTeSchema.json');
		var CustomFilterView      = require('app/bases/CustomFilterView');
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "cosoyte",
    	uiControl:{
    		fields: [
	    	    { 
	    	    	field: "id",label:"ID",width:250,readonly: true, visible:false
	    	    },
	    	    { field: "ma_coso", label: "Mã", width:80},
				{ field: "ten", label: "Tên", width:250 },
				{ field: "diachi", label: "Địa chỉ", width:250, template: function(rowData){
                    var address = "";
                    if(rowData !== undefined){
                        return gonrinApp().convert_diachi(rowData.diachi, rowData.tinhthanh, rowData.quanhuyen, rowData.xaphuong);
                    }
                    return address;
                }},
				  
		     ],
		     onRowClick: function(event){
		    	if(event.rowId){
		        		var path = 'cosoyte/model?id='+ event.rowId;
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
			this.uiControl.orderBy = [{"field": "ma_coso", "direction": "asc"}];
			this.$el.find('.page-title').text('Danh mục cơ sở y tế');
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
    	},
    });

});