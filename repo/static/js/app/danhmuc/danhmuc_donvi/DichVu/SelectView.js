define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/bases/tpl/select.html');
    	// schema 				= require('json!app/view/DanhMuc/QuocGia/Schema.json');
    var CustomFilterView      = require('app/bases/CustomFilterView');

    return Gonrin.CollectionDialogView.extend({
    	template : template,
    	modelSchema	: {},
    	urlPrefix: "/api/v1/",
    	collectionName: " dichvu_kythuat",
    	textField: "ten",
    	valueField: "id",
    	tools : [
    	    {
				name: "close",
				type: "button",
				buttonClass: "btn-secondary btn-sm",
				label: "TRANSLATE:CLOSE",
				command: function(){
					var self = this;
					self.close();
				}
			},
    	],
    	uiControl:{
    		fields: [
	    	    //  { field: "ma", label: "Mã", width:150},
		     	 { field: "ten_dichvu", label: "Tên dịch vụ", width:250 },
		    ],
		    onRowClick: function(event){
	    		this.uiControl.selectedItems = event.selectedItems;
	    		var self = this;
				self.trigger("onSelected");
				self.close();
	    	},
	    	onRendered: function(e){
	    		this.trigger("onRendered");
			    gonrinApp().responsive_table();
            }
    	},
    	render:function(){
			var self= this;
			if (this.uiControl.selectedItems !== null) {
                this.uiControl.selectedItems = "";
            }
			this.$el.find('.page-title').text(' Danh sách dịch vụ');
    		var filter = new CustomFilterView({
    			el: self.$el.find("#grid_search"),
    			sessionKey: self.collectionName +"_filter"
    		});
			filter.render();
			self.$el.find("#grid_search input").val("");
    		filter.model.set("text", "");
    		if(!filter.isEmptyFilter()) {
    			var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
    			var filters = {"ten_dichvu_khongdau": {"$likeI": gonrinApp().convert_khongdau(text) }};
    			self.uiControl.filters = filters;
    		}
    		self.applyBindings();
    		
    		filter.on('filterChanged', function(evt) {
    			var $col = self.getCollectionElement();
    			var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null){
						var filters = {"ten_dichvu_khongdau": {"$likeI": gonrinApp().convert_khongdau(text) }};
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