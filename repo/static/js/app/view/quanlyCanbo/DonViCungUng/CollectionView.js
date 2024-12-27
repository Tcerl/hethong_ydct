define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/view/quanlyCanbo/DonViCungUng/tpl/collection.html'),
    	schema 				= require('json!app/view/quanlyCanbo/DonViCungUng/DonViYTeSchema.json');
	var CustomFilterView      = require('app/bases/CustomFilterView');
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
		collectionName: "donvi",
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
							// if (this.getApp().hasRole('admin') === true) {
								self.getApp().getRouter().navigate("admin/DonViCungUng/create");
							// } else {
							// 	self.getApp().getRouter().navigate("canbo/DonViYTe/create");
							// }
  		    	    	}
  		    	    },
      	    	]
      	    },
      	],
    	uiControl:{
    		fields: [
		     	{ field: "ten_coso", label: "Tên đơn vị"},
	           	{
	            	 field: "tinhthanh_id", 
	            	 label: "Tỉnh thành",
	            	 foreign: "tinhthanh",
	            	 foreignValueField: "id",
					 foreignTextField: "ten",
	           	 },
	           	{
	            	 field: "quanhuyen_id", 
	            	 label: "Quận/Huyện",
	            	 foreign: "quanhuyen",
	            	 foreignValueField: "id",
					 foreignTextField: "ten",
	           	 },
	           	{
	            	 field: "xaphuong_id", 
	            	 label: "Xã/Phường",
	            	 foreign: "xaphuong",
	            	 foreignValueField: "id",
					 foreignTextField: "ten",
				},
				{ 
					field: "active", 
					label: "Trạng thái",
					template: (rowData) => {
						if(rowData.active == false) {
							return '<div class="text-danger">Đang bị khóa</div>';
						} else if (rowData.active == true) {
							return '<div class="text-primary">Đang hoạt động</div>';
						}
						return '';
					}
				}
		    ],
		    pagination: {
	            	page: 1,
	            	pageSize: 15
	            },
		    onRowClick: function(event){
	    		if(event.rowId){
	    			this.getApp().getRouter().navigate("canbo/donvicungung/model?id="+ event.rowId);

	        	}
			},
			datatableClass:"table table-mobile",
			onRendered: function (e) {
		    	gonrinApp().responsive_table();
			}
    	},
	    render: function () {
			var self = this;
			var currentUser = self.getApp().currentUser;
			var filter = new CustomFilterView({
    			el: self.$el.find("#grid_search"),
    			sessionKey: self.collectionName +"_filter"
			});
    		filter.render();
    		if(!filter.isEmptyFilter()) {
    			var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
    			var filters = {"tenkhongdau": {"$likeI":  gonrinApp().convert_khongdau(text) }};
    			self.uiControl.filters = filters;
			}
			if (this.getApp().hasRole('admin') === true) {
				var filters = {"loai_donvi": {"$eq": 2 }};
    			self.uiControl.filters = filters;
			} else {
				var filters_donvidangki = {"loai_donvi": {"$eq":2  }};
				self.uiControl.filters = filters_donvidangki;
			}
    		self.applyBindings(); 		
    		filter.on('filterChanged', function(evt) {
    			var $col = self.getCollectionElement();
    			var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null) {
						var filters = "";
						if (this.getApp().hasRole('admin') === true) {
							filters = { "$and": [
								{"tenkhongdau": {"$likeI":  gonrinApp().convert_khongdau(text) }},
								{"loai_donvi" : {"$eq" : 2}}
							]};
						} else {
							filters = { "$and": [
								{"tenkhongdau": {"$likeI":  gonrinApp().convert_khongdau(text) }},
								{"loai_donvi" : {"$eq" : 2}}
							]};
						}
						$col.data('gonrin').filter(filters);
						
					}
				}
				self.applyBindings();
			});
			self.$el.find("table").addClass("table-hover");
			self.$el.find("table").removeClass("table-striped");
			return this;
		},
    	
    });

});