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
    	collectionName: "nhanvien",
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
				{ field: "ten", label: "Tên nhân viên", width:250 },
				{ field: "ma", label: "Mã nhân viên", width:250 },
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
			this.$el.find('.page-title').text('Danh sách nhân viên');
			self.query == null;
			if (this.uiControl.selectedItems !== null) {
                this.uiControl.selectedItems = "";
            }
    		var filter = new CustomFilterView({
    			el: self.$el.find("#grid_search"),
    			sessionKey: self.collectionName +"_filter"
    		});
    		filter.render();
			self.$el.find("#grid_search input").val("");
            var filter_query = self.uiControl.filters;
            if (filter_query !== undefined && filter_query !== null && filter_query !== false) {
				self.query = filter_query;
            }
            filter.model.set("text", "");

    		self.uiControl.orderBy = [{"field": "ten", "direction": "asc"}];
    		if(!filter.isEmptyFilter()) {
    			var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
    			var filters = {"tenkhongdau": {"$likeI": text }};
				var filter1;
				if (self.query !== null && self.query !== undefined) {
					filter1 = { "$and": [
						filters, self.query
					]};
				} else {
					filter1 = filters;
				}
    			self.uiControl.filters = filter1;
    		}
    		self.applyBindings();
    		
    		filter.on('filterChanged', function(evt) {
    			var $col = self.getCollectionElement();
    			var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null){
						var filters = {"tenkhongdau": {"$likeI": text }};
						var filter1;
						if (self.query !== null && self.query !== undefined) {
                            filter1 = { "$and": [
                                filters, self.query
							]};
                        } else {
                            filter1 = filters;
						}
						$col.data('gonrin').filter(filter1);
					}
				}
				self.applyBindings();
    		});
    		return this;
    	},
    });

});