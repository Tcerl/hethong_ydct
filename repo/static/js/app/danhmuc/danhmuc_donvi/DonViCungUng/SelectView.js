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
    	collectionName: "donvi",
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
	    	    { field: "ten_coso", label: "Tên đơn vị", width:250 },
				{ field: "sodienthoai", label: "Số điện thoại", width:120 },
				// { field: "diachi", label: "Địa chỉ"},
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
			this.$el.find('.page-title').text('Danh sách đơn vị cung ứng');
    		var filter = new CustomFilterView({
    			el: self.$el.find("#grid_search"),
    			sessionKey: self.collectionName +"_filter"
    		});
    		filter.render();
    		self.$el.find("#grid_search input").val("");
    		filter.model.set("text", "");
    		if(!filter.isEmptyFilter()) {
    			var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
    			var filters = {"$and" : [
					{"tenkhongdau": {"$likeI": gonrinApp().convert_khongdau(text) }},
					{"loai_donvi" : {"$eq" : 2}}
				]};
    			self.uiControl.filters = filters;
			}
			else {
    			var filters = {"$and" : [
					{"loai_donvi" : {"$eq" : 2}}
				]};
    			self.uiControl.filters = filters;
			}
    		self.applyBindings();
    		
    		filter.on('filterChanged', function(evt) {
    			var $col = self.getCollectionElement();
    			var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null){
						var filters = {"$and" : [
							{"tenkhongdau": {"$likeI": gonrinApp().convert_khongdau(text) }},
							{"loai_donvi" : {"$eq" : 2}}
						]};
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