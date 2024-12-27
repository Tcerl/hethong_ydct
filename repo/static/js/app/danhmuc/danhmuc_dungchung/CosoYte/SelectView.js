define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/bases/tpl/select.html'),
    	schema 				= require('json!schema/CoSoYTeSchema.json');;
    var CustomFilterView      = require('app/bases/CustomFilterView');

    return Gonrin.CollectionDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "cosoyte",
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
	    	    { field: "ma_coso", label: "Mã", width:80},
				{ field: "ten", label: "Tên", width:250 },
				{ field: "diachi", label: "Địa chỉ", width:250 },
				  
		     ],
		    onRowClick: function(event){
				var self = this;
				this.uiControl.selectedItems = event.selectedItems;
				self.trigger("onSelected");
		    	self.close();
			},
			language:{
        		no_records_found:"Chưa có dữ liệu"
        	},
        	noResultsClass:"alert alert-default no-records-found",
    	},
    	render:function(){
			var self= this;
			this.$el.find('.page-title').text('Danh sách dân tộc');
    		var filter = new CustomFilterView({
    			el: self.$el.find("#grid_search"),
    			sessionKey: "Dantoc_filter"
    		});
    		filter.render();
    		self.uiControl.orderBy = [{"field": "ma_coso", "direction": "asc"}];
    		if(!filter.isEmptyFilter()) {
    			var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
    			var filters = {"tenkhongdau": {"$likeI": gonrinApp().convert_khongdau(text) }};
    			self.uiControl.filters = filters;
    		}
    		self.applyBindings();
    		
    		filter.on('filterChanged', function(evt) {
    			var $col = self.getCollectionElement();
    			var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null){
						var filters = {"tenkhongdau": {"$likeI": gonrinApp().convert_khongdau(text) }};
						$col.data('gonrin').filter(filters);
						//self.uiControl.filters = filters;
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