define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/bases/tpl/collection.html'),
    	schema 				= require('json!app/danhmuc/danhmuc_dungchung/DanToc/Schema.json');
    
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "dantoc",
    	uiControl:{
    		fields: [
				{ field: "id", label: "Mã", width:250},
				{ field: "ten", label: "Tên", width:250 },
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
			this.uiControl.orderBy = [{"field": "ma", "direction": "asc"}];
			this.$el.find('.page-title').text('Danh sách dân tộc');
	    	 this.applyBindings();
	    	 return this;
    	},
    });

});