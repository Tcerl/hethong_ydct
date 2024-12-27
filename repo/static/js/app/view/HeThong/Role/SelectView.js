define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/bases/tpl/select.html'),
	schema 				= require('json!app/view/HeThong/Role/Schema.json');
    
    
    return Gonrin.CollectionDialogView.extend({
    	
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "role",
    	textField: "vaitro",
    	uiControl:{
    		fields: [
				// { 
				// 	field: "id",label:"ID",width:50,readonly: false, 
				//  },	
				 { field: "vaitro", label: "Tên", width:150 },
				 { field: "mota", label: "Mô tả", width:150 },
		    ],
		    onRowClick: function(event){
				this.uiControl.selectedItems = event.selectedItems;
				var self = this;
				self.trigger("onSelected");
				self.close();
	    	},
    	},
    	render:function(){
			this.applyBindings();
			this.$el.find('.page-title').text('Danh sách vai trò');
    		return this;
    	},
    	
    });

});