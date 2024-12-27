define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/bases/tpl/collection.html'),
    	schema 				= require('json!schema/DanhMucNhomVatTuSchema.json');
		var CustomFilterView      = require('app/bases/CustomFilterView');
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
        collectionName: "nhom_vattu",
        tools: [
            {
                name: "default",
                type: "group",
                groupClass: "toolbar-group",
                buttons: [
                    {
                        name: "create",
                        type: "button",
                        buttonClass: "btn-primary btn-sm",
                        label: "TRANSLATE:CREATE",
                        command: function() {
                            var self = this;
                            var path = "danhmuc_nhom_vattu/model"
                            self.getApp().getRouter().navigate(path);
                        }
                    },
                ]
            },
        ],
    	uiControl:{
    		fields: [
	    	    { 
	    	    	field: "id",label:"ID",width:250,readonly: true, visible:false
	    	    },
	    	    { field: "ma_nhom", label: "Mã nhóm vật tư", width:80},
				{ field: "ten_nhom_vattu", label: "Tên nhóm vật tư", width:250 },
				{ field: "ghichu", label: "Ghi chú", width:250 },			  
		     ],
		     onRowClick: function(event){
		    	if(event.rowId){
		        		var path = 'danhmuc_nhom_vattu/model?id='+ event.rowId;
		        		this.getApp().getRouter().navigate(path);
		        }
		    	
		    },
		    language:{
        		no_records_found:"Chưa có dữ liệu"
        	},
        	noResultsClass:"alert alert-default no-records-found",
        	datatableClass:"table table-mobile",
		    onRendered: function (e) {
		    	gonrinApp().responsive_table();
			}
    	},
	    render:function(){
			var self = this;
			this.uiControl.orderBy = [{"field": "ma_nhom", "direction": "asc"}];
			this.$el.find('.page-title').text('Danh sách nhóm vật tư');
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

    		// self.uiControl.orderBy = [{"field": "ten_nhom_vattu", "direction": "asc"}];
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