define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/bases/tpl/collection.html'),
		schema 				= require('json!schema/ThonXomSchema.json');

    var CustomFilterView      = require('app/bases/CustomFilterView');

    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "thonxom",
    	uiControl:{
	    	fields: [
		     	 { field: "ma", label: "Mã", width:250},
		     	 { field: "ten", label: "Tên", width:250 },
		     	 {
	            	 field: "xaphuong_id", 
	            	 label: "Xã Phường",
	            	 foreign: "xaphuong",
	            	 foreignValueField: "id",
	            	 foreignTextField: "ten",
	           	 },
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
			 this.uiControl.orderBy = [{"field": "ma", "direction": "asc"}];
			 this.$el.find('.page-title').text('Danh sách thôn xóm');
			
			var currentUser = gonrinApp().currentUser;
			if (!currentUser){
				self.getApp().notify("Hết phiên đăng nhập, vui lòng đăng nhập lại");
				self.getApp().getRouter().navigate("login");
				return;
			}
			var filter = new CustomFilterView({
    			el: self.$el.find("#grid_search")
    		});
    		filter.render();
    		self.uiControl.orderBy = [{"field": "ten", "direction": "asc"}];
    		if(!filter.isEmptyFilter()) {
				var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
				var filters = {"tenkhongdau": {"$likeI": gonrinApp().convert_khongdau(text) }};
    			self.uiControl.filters = filters;
    		} else {
				if (this.getApp().hasRole('admin') === false) {
					var filters = {"donvi_id": {"$eq": currentUser.donvi_id}};
					self.uiControl.filters = filters;
				}
    			
			}
    		self.applyBindings();
    		
    		filter.on('filterChanged', function(evt) {
    			var $col = self.getCollectionElement();
    			var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null){
						var filters = {"tenkhongdau": {"$likeI": gonrinApp().convert_khongdau(text) }};
						self.uiControl.filters = filters;
						$col.data('gonrin').filter(filters);
					} else {
						self.uiControl.filters = null;
					}
				}
				self.applyBindings();
    		});


	    	return this;
    	},
    	
    });

});