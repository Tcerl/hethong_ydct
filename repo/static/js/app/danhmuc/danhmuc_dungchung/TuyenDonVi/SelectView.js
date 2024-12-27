define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/bases/tpl/select.html'),
    	schema 				= require('json!app/danhmuc/danhmuc_dungchung/TuyenDonVi/Schema.json');
    
    return Gonrin.CollectionDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "tuyendonvi",
    	textField: "ten",
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
				{ 
				field: "id",label:"ID",width:250,readonly: true, visible:false
				},
				// { field: "ma", label: "Mã", width:250},
				{ field: "ten", label: "Tên", width:250 },
		     	// { field: "mota", label: "Mô tả", width:250 },
			],
			language:{
        		no_records_found:"Chưa có dữ liệu"
        	},
        	noResultsClass:"alert alert-default no-records-found",
		    onRowClick: function(event){
				this.uiControl.selectedItems = event.selectedItems;
				var self = this;
				self.trigger("onSelected");
				self.close();
	    	},
    	},
    	render:function(){
			this.uiControl.orderBy = [{"field": "ma", "direction": "desc"}];
			this.$el.find('.page-title').text('Danh sách tuyến đơn vị');
    		this.applyBindings();
    		return this;
    	},
    	
    });

});