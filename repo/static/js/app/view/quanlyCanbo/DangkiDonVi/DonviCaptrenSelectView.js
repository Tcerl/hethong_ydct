define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/view/quanlyCanbo/DangkiDonVi/tpl/selectDonVi.html'),
    	schema 				= require('json!app/danhmuc/danhmuc_dungchung/TuyenDonVi/Schema.json');
	var CustomFilterView      = require('app/bases/CustomFilterView');
    return Gonrin.CollectionDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "donvi",
    	textField: "ten",
    	tools : [
    	    {
    	    	name: "defaultgr",
    	    	type: "group",
    	    	groupClass: "toolbar-group",
    	    	buttons: [
					{
		    	    	name: "select",
		    	    	type: "button",
		    	    	buttonClass: "btn-success btn-sm",
		    	    	label: "TRANSLATE:SELECT",
		    	    	command: function(){
		    	    		var self = this;
		    	    		self.trigger("onSelected");
		    	    		self.close();
		    	    	}
		    	    },
    	    	]
    	    },
    	],
    	uiControl:{
			// orderBy:[
			// 	{field: "ma", direction: "asc"}
			// ],
    		fields: [
				// { field: "ma", label: "Mã", width:100},
				{ field: "ten", label: "Tên", width:350 },
		    ],
		    onRowClick: function(event){
	    		this.uiControl.selectedItems = event.selectedItems;
				var self = this;
				self.trigger("onSelected");
				self.close();
	    	},
    	},
    	render:function(){
			var self = this;
			var filter = new CustomFilterView({
    			el: self.$el.find("#grid_search"),
    			sessionKey: self.collectionName +"_filter"
    		});
    		filter.render();
    		self.uiControl.orderBy = [{"field": "ma_coso", "direction": "asc"}];
    		if(!filter.isEmptyFilter()) {
    			var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
    			var filters = { "$or": [
					{"ten": {"$likeI": text }},
				] };
    			self.uiControl.filters = filters;
    		}
    		self.applyBindings();
    		
    		filter.on('filterChanged', function(evt) {
    			var $col = self.getCollectionElement();
    			var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null){
						var filters = { "$or": [
							{"ten": {"$likeI": text }},
						] };
						$col.data('gonrin').filter(filters);
					} else {
					}
				}
				self.applyBindings();
    		});
    		return this;
    	},
    	
    });

});