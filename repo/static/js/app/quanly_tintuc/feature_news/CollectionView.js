define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/quanly_tintuc/feature_news/tpl/collection.html');
	var ModelDialog = require('app/quanly_tintuc/feature_news/ModelView');
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: {},
    	urlPrefix: "/api/v1/",
    	collectionName: "feature_news",
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
						label: `<i class="fas fa-plus"></i> Thêm mới`,
						visible: function() {
							var currentUser = gonrinApp().currentUser;
							return (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
						},
						command: function() {
							var self = this;
							var model_dialog = new ModelDialog({"viewData": {"id": null,"create": true}});
							model_dialog.dialog();
							model_dialog.on("saveData", function () {
								self.doFilter();
							});
						}
					},
				]
			},
		],
    	uiControl:{
    		fields: [
				{ 
					field: "stt",
					label:"STT"
				},
				{ 
					field: "type_placement", 
					label: "Vị trí hiển thị bài viết nổi bật",
					template: function (rowData) {
						var type_placement = rowData.type_placement;
						var danhsach = [
							{ value: 1, text: "Vị trí 1" },
							{ value: 2, text: "Vị trí 2" },
							{ value: 3, text: "Vị trí 3" },
							{ value: 4, text: "Vị trí 4" },
							{ value: 5, text: "Vị trí 5" },
						]
						for (var i = 0; i < danhsach.length; i++) {
							if (type_placement == danhsach[i]['value']) {
								return danhsach[i]['text'];
							}
						}
						return "";
					}
				},
				{ 
					field: "updated_at", 
					label: "Thời gian cập nhật gần nhất",
					template: function (rowData) {
						// return moment.unix(rowData["updated_at"]).local().format("DD/MM/YYYY HH:mm:ss");
						return gonrinApp().parseInputDateString(String(rowData.updated_at)).format("HH:mm DD/MM/YYYY");
					}
				},
				{ 
					field: "donvi_ten", 
					label: "Đơn vị",
                    width: 200,
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
					model_dialog.dialog();
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
		    onRendered: function (e) {
		    	gonrinApp().responsive_table();
			}
    	},
		donvi_id: "all",
	    render: function() {
			var self = this;
			self.uiControl.orderBy = [{"field": "type_placement", "direction": "asc"}];
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
			self.$el.find("table").addClass("table-hover");
			self.$el.find("table").removeClass("table-striped");
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
			var obj = null;
			if (self.donvi_id != null && self.donvi_id != "all") {
				obj = {
					"$and": [
						{ "donvi_id": self.donvi_id }
					]
				};
			}
            var $col = self.getCollectionElement();
            $col.data('gonrin').filter(obj);
        }
    });
});