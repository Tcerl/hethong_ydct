define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    // var template = require('text!app/bases/tpl/collection.html');
    var template 			= require('text!app/quanly_tintuc/tacgia/tp/collection.html');
    var CustomFilterView      = require('app/bases/CustomFilterView'),
        ModelDialog = require('app/quanly_tintuc/chuyenmuc/ModelView');
    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: {},
        urlPrefix: "/api/v1/",
        collectionName: "category",
        tools: [
            {
                name: "create",
                type: "button",
                buttonClass: "btn-success btn-sm mr-2",
                label: '<i class="fa fa-plus"></i> Thêm mới',
                visible: function() {
					var currentUser = gonrinApp().currentUser;
					return (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
				},
                command: function() {
                    var self = this;
                    var model_dialog = new ModelDialog({"viewData": {"id": null,"create": true}});
                    model_dialog.dialog({size:"large"});
                    model_dialog.on("saveChuyenmuc", function () {
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
        uiControl: {
            fields: [
                {
                    field: "stt",
                    label: "STT",
                    width: 100
                },
                { field: "name", label: "Tên" },
                { field: "description", visible: false },
                {
                    field: "show_top_menu",
                    label: "Hiển thị trên Menu",
                    template: function(rowData) {
                        if (rowData.show_top_menu == 1) {
                            return "Hiển thị";
                        } else {
                            return "Ẩn";
                        }
                    }
                },
                {
                    field: "show_in_home",
                    label: "Hiển thị trên trang chủ",
                    template: function(rowData) {
                        if (rowData.show_in_home == 1) {
                            return "Hiển thị";
                        } else {
                            return "Ẩn";
                        }
                    }
                },
                { field: "priority", label: "Độ ưu tiên" },
				{ 
					field: "donvi_ten", 
					label: "Đơn vị",
                    visible: function() {
                        return (gonrinApp().getTuyenDonVi() != "3");
                    }
				},
            ],
            onRowClick: function(event) {
                if (event.rowId) {
                    var self = this;
                    var model_dialog = new ModelDialog({"viewData": {"id": event.rowId,"create": false}});
                    model_dialog.dialog({size:"large"});
                    model_dialog.on("saveChuyenmuc", function () {
                        self.doFilter();
                    });
                }
            }
        },
        text_filter: null,
		donvi_id: "all",
        render: function() {
            var self = this;
            self.$el.find(".page-title").text("Danh sách chuyên mục");
            self.filter = new CustomFilterView({
    			el: self.$el.find("#grid_search"),
    			sessionKey: self.collectionName +"_filter"
			});
    		self.filter.render();
            self.uiControl.orderBy = [{"field": "priority", "direction": "asc"}, {"field": "unsigned_name", "direction": "asc"}];
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
    		self.filter.on('filterChanged', function(evt) {
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
        }
    });
});