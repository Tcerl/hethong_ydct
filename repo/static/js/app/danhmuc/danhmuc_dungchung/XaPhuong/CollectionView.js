define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/bases/tpl/collection.html'),
    	schema 				= require('json!app/danhmuc/danhmuc_dungchung/XaPhuong/Schema.json');
    
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "xaphuong",
    	uiControl:{
	    	fields: [
				 { field: "stt", label: "STT", width:50},
		     	 { field: "id", label: "Mã", width:250},
		     	 { field: "ten", label: "Tên", width:300 },
		     	 {
	            	 field: "quanhuyen_id", 
	            	 label: "Quận Huyện",
	            	 foreign: "quanhuyen",
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
			this.$el.find('.page-title').text('Danh sách xã phường');
	    	 this.uiControl.orderBy = [{"field": "ma", "direction": "asc"}];
	    	 this.applyBindings();
	    	 return this;
    	}
    	
    });

});