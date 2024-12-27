define(function (require) {
    "use strict";
    var Gonrin				= require('gonrin');
    
    var template 			= require('text!app/bases/tpl/select.html'),
    	schema 				= require('json!app/danhmuc/danhmuc_dungchung/TinhThanh/Schema.json');
    var CustomFilterView      = require('app/bases/CustomFilterView');

    return Gonrin.CollectionDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "tinhthanh",
    	textField: "ten",
//    	valueField: "id",
		query: null,
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
	    	     { field: "id", label: "Mã", width:200},
		     	 { field: "ten", label: "Tên", width:250 },
		    ],
		    onRowClick: function(event){
				this.uiControl.selectedItems = event.selectedItems;
				var self = this;
				self.trigger("onSelected");
				var selected_items = self.uiControl.selectedItems;
				if(!!selected_items && selected_items.length>0){
					self.getApp().data("tinhthanh_id", selected_items[0]["id"]);
				}
				
				self.close();
			},
			language:{
        		no_records_found:"Chưa có dữ liệu"
        	},
        	noResultsClass:"alert alert-default no-records-found",
	    	onRendered: function (e) {
		    	gonrinApp().responsive_table();
			}
    	},
    	render:function(){
//    		if (this.getApp().data("quocgia_id") !== null){
//    			this.uiControl.filters = {"quocgia_id": {"$eq": this.getApp().data("quocgia_id")}};
//    		}
    		
			var self= this;
			this.$el.find('.page-title').text('Danh sách tỉnh thành');
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
    		self.uiControl.orderBy = [{"field": "ma", "direction": "asc"}];
    		if(!filter.isEmptyFilter()) {
				var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
				
    			var filters = {"ten": {"$likeI": text }};
				var filter1;
				if (self.query !== null && self.query !== undefined) {
					if(text!==null && text!==""){
						filter1 = { "$and": [
							filters, self.query
						]};
					}else{
						filter1 = self.query;
					}
					
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
					if (text !== null && text!==""){
						var filters = {"ten": {"$likeI": text }};
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