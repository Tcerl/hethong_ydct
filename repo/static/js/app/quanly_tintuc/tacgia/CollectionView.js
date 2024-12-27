define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/quanly_tintuc/tacgia/tp/collection.html');
	var CustomFilterView    = require('app/bases/CustomFilterView');
	var ModelDialog = require('app/quanly_tintuc/tacgia/ModelView');
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: {},
    	urlPrefix: "/api/v1/",
    	collectionName: "author",
		tools: [
			{
				name: "create",
				type: "button",
				buttonClass: "btn-success btn-sm mr-2",
				label: `<i class="fas fa-plus"></i> Thêm mới`,
				visible: function() {
					var currentUser = gonrinApp().currentUser;
					return (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
				},
				command: function() {
					var self = this;
					var model_dialog = new ModelDialog({"viewData": {"id": null,"create": true}});
					model_dialog.dialog({size:"large"});
					model_dialog.on("saveData", function () {
						self.doFilter();
					});
				}
			},
			{
				name: "clear",
				type: "button",
				buttonClass: "btn-danger btn-sm clear-filter",
				label: `<i class="fas fa-minus"></i> Xóa bộ lọc`,
			},
		],
    	uiControl:{
    		fields: [
				{
					field: "stt",
					label: "STT",
					width: 60
				},
				{ 
					field: "name",
					label: "Tên tác giả"
				},
				{ 
					field: "alias_name",
					label: "Bút danh"
				},
				// { 
				// 	field: "job_title", 
				// 	label: "Chức danh"
				// },
				{ 
					field: "years_of_experience", 
					label: "Số năm kinh nghiệm",
				},
				// { 
				// 	field: "field_of_activity", 
				// 	label: "Lĩnh vực hoạt động"
				// },
				// { 
				// 	field: "phone", 
				// 	label: "Điện thoại",
				// },
				// { 
				// 	field: "email", 
				// 	label: "Email",
				// },
				{ 
					field: "donvi_ten", 
					label: "Đơn vị",
                    visible: function() {
                        return (gonrinApp().getTuyenDonVi() != "3");
                    }
				},
		     ],
			pagination: {
				page: 1,
				pageSize: 15
			},
			onRowClick: function(event){
				var self = this;
	    		if(event.rowId){
	    			var model_dialog = new ModelDialog({"viewData": {"id": event.rowId,"create": true}});
					model_dialog.dialog({size:"large"});
					model_dialog.on("saveData", function () {
						self.doFilter();
					});
	        	}
			},
		    language:{
        		no_records_found:"Chưa có dữ liệu"
        	},
        	noResultsClass:"alert alert-default no-records-found",
        	datatableClass:"table table-mobile",
		    // onRendered: function (e) {
		    // 	gonrinApp().responsive_table();
			// }
    	},
		text_filter: null,
		donvi_id: "all",
	    render: function() {
			var self = this;
			self.text_filter = null;
			self.donvi_id = "all";
			self.$el.find('.page-title').text('Danh sách tác giả');
			var filter = new CustomFilterView({
    			el: self.$el.find("#grid_search"),
    			sessionKey: self.collectionName +"_filter"
			});
    		filter.render();
			self.uiControl.orderBy = [{"field": "name", "direction": "asc"}];
			var filters = null;
			var currentUser = self.getApp().currentUser;
			if (currentUser.donvi.tuyendonvi_id == "3") {
				self.donvi_id = currentUser.donvi_id;
				self.$el.find(".select-donvi").remove();
				filters = {
					"$and": [
						{ "donvi_id": self.donvi_id }
					]
				}
			}
			else {
				self.selectizeDonVi();
				self.$el.find(".select-donvi").removeClass("d-none");
			}
			self.uiControl.filters = filters;
			self.applyBindings();
			filter.on('filterChanged', function(evt) {
    			var $col = self.getCollectionElement();
    			var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null) {	
						self.text_filter = text;	
						self.doFilter();
					}
				}
				self.applyBindings();
			});

			self.$el.find("table").addClass("table-hover");
			self.$el.find("table").removeClass("table-striped");

			self.$el.find('.clear-filter').unbind("click").bind("click", function() {
				if (currentUser.donvi.tuyendonvi_id != "3") {
					self.donvi_id = "all";
					self.$el.find('#selectize_donvi')[0].selectize.setValue(self.donvi_id);
				}
				
				self.text_filter = null;
				self.$el.find("#grid_search input").val(null);
				self.doFilter();
			});
			return this;
    	},
		selectizeDonVi: function() {
			var self = this;
			var firstLoad = true;
			var $selectize_donvi = self.$el.find('#selectize_donvi').selectize({
				maxItems: 1,
				valueField: 'id',
				labelField: 'ten_coso',
				searchField: ['ten_coso', 'tenkhongdau'],
				preload: true,
				placeholder: "Chọn đơn vị",  
				load: function(query, callback) {
					if (firstLoad) {
						firstLoad = false;
						var dict = {
							id: "all",
							ten_coso: "Tất cả",
							tenkhongdau: "tat ca"
						};
						callback([dict]);
						$selectize_donvi[0].selectize.setValue(self.donvi_id);
					}
					var query_filter = {
						"filters": {
							"$and": [
								{"deleted": {"$eq": false }},
								{"tuyendonvi_id": {"$eq": "3" }}
							]
						},
						"order_by": [{ "field": "ten_coso", "direction": "asc" }]
					};
					var currentUser = self.getApp().currentUser;
					if (currentUser.donvi.tuyendonvi_id == "2") {
						query_filter["filters"]["$and"].push({"captren_id": { "$eq": currentUser.donvi_id }});
					}
					if (query) {
						query_filter["filters"]["$and"].push({"tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text)}});
					}
					var url = (self.getApp().serviceURL || "") + '/api/v1/donvi_filter?results_per_page=15' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
					$.ajax({
						url: url,
						type: 'GET',
						dataType: 'json',
						error: function() {
							callback();
						},
						success: function(res) {
							var obj = res.objects;
							callback(obj);
						}
					});
				},
				onItemAdd: function(value, $item) {
					if (value != self.donvi_id) {
						self.donvi_id = value;
						self.doFilter();
					}
				},
				onItemRemove: function(value) {
					self.donvi_id = null;
					self.doFilter();
				}
			});
		},
		doFilter: function() {
            var self = this;
            var $col = self.getCollectionElement();
			var obj = null;
			if ((self.donvi_id != null && self.donvi_id != "all") || self.text_filter != null) {
				obj = {
					"$and": [

					]
				};
				if (self.donvi_id != null && self.donvi_id != "all") {
					obj["$and"].push({ "donvi_id": self.donvi_id });
				}
				if (self.text_filter != null) {
					obj["$and"].push({ "text_filter": self.text_filter });
				} 
			}
			
            $col.data('gonrin').filter(obj);
        },
    });
});