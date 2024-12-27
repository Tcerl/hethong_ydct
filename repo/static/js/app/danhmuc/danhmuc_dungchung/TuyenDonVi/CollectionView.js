define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/bases/tpl/collection.html'),
    	schema 				= require('json!app/danhmuc/danhmuc_dungchung/TuyenDonVi/Schema.json');
    
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "tuyendonvi",
    	uiControl:{
    		fields: [
				{ field: "stt", label: "STT", width:50},
				{ field: "ma", label: "Mã", width:250},
				{ field: "ten", label: "Tên", width:250 },
		     	{ field: "mota", label: "Mô tả", width:250 },
			],
			onRowClick: function(event) {
		    	if (event.rowId){
					var path = this.collectionName + '/model?id='+ event.rowId;
					this.getApp().getRouter().navigate(path);
		        }
		    }
    	},
	    render:function(){
			this.uiControl.orderBy = [{"field": "ma", "direction": "asc"}];
			this.$el.find('.page-title').text('Danh sách tuyến đơn vị');
			this.applyBindings();
			return this;
    	},
    });

});