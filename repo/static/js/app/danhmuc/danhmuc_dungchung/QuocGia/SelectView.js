define(function (require) {
    "use strict";
    var Gonrin				= require('gonrin');
    
    var template 			= require('text!app/bases/tpl/select.html'),
    	schema 				= require('json!app/danhmuc/danhmuc_dungchung/QuocGia/Schema.json');
    var CustomFilterView      = require('app/bases/CustomFilterView');

    return Gonrin.CollectionDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "quocgia",
    	textField: "ten",
    	valueField: "id",
    	tools : [
    	    {
				name: "close",
				type: "button",
				buttonClass: "btn-secondary waves-effect width-sm ml-2",
				label: `<i class="far fa-window-close"></i> Đóng`,
				command: function(){
					var self = this;
					self.close();
				}
			},
    	],
    	uiControl:{
    		fields: [
	    	     { field: "id", label: "Mã", width:150},
		     	 { field: "ten", label: "Tên", width:250 },
		    ],
		    onRowClick: function(event){
	    		this.uiControl.selectedItems = event.selectedItems;
	    		var self = this;
				self.trigger("onSelected");
				self.close();
			},
			language:{
        		no_records_found:"Chưa có dữ liệu"
        	},
        	noResultsClass:"alert alert-default no-records-found",
	    	onRendered: function(e){
	    		this.trigger("onRendered");
			    gonrinApp().responsive_table();
            }
    	},
    	render:function(){
			var self= this;
			this.$el.find('.page-title').text('Danh sách quốc gia');
    		var filter = new CustomFilterView({
    			el: self.$el.find("#grid_search"),
    			sessionKey: self.collectionName +"_filter"
    		});
    		filter.render();
    		
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