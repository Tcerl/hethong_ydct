define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/quanly_tintuc/baiviet/tpl/collection.html');
    var CustomFilterView = require('app/bases/CustomFilterView');
    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: {},
        urlPrefix: "/api/v1/",
        collectionName: gonrinApp().getRouter().currentRoute().fragment.indexOf('bai-bi-go/collection') >= 0 ? "post_publish" : "post",
        tools: [{
            name: "default",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [
                {
                    name: "create",
                    type: "button",
                    buttonClass: "btn-success btn-sm btn-custom mr-2",
                    label: '<i class="fa fa-plus"></i> Thêm mới',
                    visible: function() {
                        var currentUser = gonrinApp().currentUser;
                        return (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
                    },
                    command: function() {
                        var self = this;
                        var path = 'postadmin/model';
                        self.getApp().getRouter().navigate(path);
                    }
                },
                {
                    name: "clear",
                    type: "button",
                    buttonClass: "btn-danger btn-sm clear-filter",
                    label: `<i class="fas fa-minus"></i> Xóa bộ lọc`,
                },
            ]
        }, ],
        uiControl: {
            fields: [
                { 
                    field: "image_thumbnail", 
                    label: "Hình đại diện", 
                    width: 110,
                    template: function(rowData) {
                        var url_img = gonrinApp().check_file_minio(rowData.image_thumbnail); 
                        return `<img src="` + url_img + `" class="collection-image">`;
                    }
                },
                { 
                    field: "title", 
                    label: "Tiêu đề"
                },
                { 
					field: "editor_name", 
					label: "Người viết bài",
                    width: 150
				},
                { 
					field: "category_name", 
					label: "Chuyên mục",
                    width: 200
				},
                { 
					field: "created_at", 
					label: "Thời gian viết bài",
                    width: 160,
                    visible: function() {
                        var currentRoute = gonrinApp().getRouter().currentRoute().fragment;
                        if (currentRoute.indexOf('bai-da-tra/collection') < 0) {
                            return true;
                        }
                    }
				},
                { 
					field: "returner_name", 
					label: "Người trả bài",
                    width: 160,
                    visible: function() {
                        var currentRoute = gonrinApp().getRouter().currentRoute().fragment;
                        if (currentRoute.indexOf('bai-da-tra/collection') >= 0) {
                            return true;
                        }
                    }
				},
                { 
					field: "returned_time", 
					label: "Thời gian trả bài",
                    width: 160,
                    visible: function() {
                        var currentRoute = gonrinApp().getRouter().currentRoute().fragment;
                        if (currentRoute.indexOf('bai-da-tra/collection') >= 0) {
                            return true;
                        }
                    }
				},
                {
                    field: "status",
                    label: "Trạng thái",
                    width: 100,
                    visible: function() {
                        var currentRoute = gonrinApp().getRouter().currentRoute().fragment;
                        if (currentRoute.indexOf('bai-da-tra/collection') >= 0) {
                            return true;
                        }
                    },
                    template: function(rowData) {
                        if (rowData.status == 0) {
                            return '<div class = "text-warning">Bài lưu tạm</div>';
                        }
                        else if (rowData.status == 1) {
                            return '<div class = "text-info">Bài chờ biên tập</div>';
                        } 
                        else if (rowData.status == 2) {
                            return '<div class = "text-primary">Bài nhận biên tập</div>';
                        } 
                        else if (rowData.status == 3) {
                            return '<div class = "text-secondary">Đang đang xử lý</div>';
                        } 
                        else if (rowData.status == 4) {
                            return '<div class = "text-danger">Bài bị trả</div>';
                        } 
                        else if (rowData.status == 5) {
                            return '<div class = "text-dark">Bị bị gỡ</div>';
                        } 
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
            onRowClick: function(event) {
                if (event.rowId) {
                    var path = 'postadmin/model?id=' + event.rowId;
                    this.getApp().getRouter().navigate(path);
                }
            },
            onRendered: function (e) {
                // gonrinApp().responsive_table();
                this.$el.find("#total_post").text(this.getCollectionElement().data('gonrin').getAllOptions().pagination.totalRows);
            }
        },
        donvi_id: null,
        category_id: null,
        text_filter: null,
        currentRoute: null,
        enable_filter: true,
        status: null,
        user_id: null,
        render: function() {
            var self = this;
            var currentUser = self.getApp().currentUser;
            if (currentUser === undefined || currentUser === null) {
                self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                self.getApp().getRouter().navigate("login");
                return false;
            }

            self.enable_filter = true;
            self.donvi_id = null;
            self.category_id = null;
            self.text_filter = null;
            self.user_id = null;

            self.currentRoute = self.getApp().getRouter().currentRoute().fragment;
            if (self.currentRoute.indexOf('bai-luu-tam/collection') >= 0) {
                self.status = 0;
                self.user_id = currentUser.id;
                self.$el.find("#title_page").text("Danh sách bài viết lưu tạm");
                self.$el.find(".select-donvi").remove();
            }
            else if (self.currentRoute.indexOf('bai-bi-xoa/collection') >= 0) {
                self.status = 7;
                self.user_id = currentUser.id;
                self.$el.find("#title_page").text("Danh sách bài viết bị xóa");
                self.$el.find(".select-donvi").remove();
            }
            else if (self.currentRoute.indexOf('bai-tra-lai-toi/collection') >= 0) {
                self.status = 4;
                self.user_id = currentUser.id;
                self.$el.find("#title_page").text("Danh sách bài viết trả lại tôi");
                self.$el.find(".select-donvi").remove();
            }
            else if (self.currentRoute.indexOf('bai-cho-bien-tap/collection') >= 0) {
                self.status = 1;
                if (self.getApp().hasRole('btv')) {
                    self.user_id = currentUser.id;
                }
                self.$el.find("#title_page").text("Danh sách bài viết chờ biên tập");
            }
            else if (self.currentRoute.indexOf('bai-dang-xu-ly/collection') >= 0) {
                self.status = 3;
                if (self.getApp().hasRole('btv')) {
                    self.user_id = currentUser.id;
                }
                self.$el.find("#title_page").text("Danh sách bài viết đang xử lý");
            }
            else if (self.currentRoute.indexOf('bai-da-tra/collection') >= 0) {
                self.status = 8;
                self.$el.find("#title_page").text("Danh sách bài viết đã trả");
            }
            else if (self.currentRoute.indexOf('bai-nhan-bien-tap/collection') >= 0) {
                self.status = 2;
                if (self.getApp().hasRole('btv')) {
                    self.user_id = currentUser.id;
                }
                self.$el.find("#title_page").text("Danh sách bài viết nhận biên tập");
            }
            else if (self.currentRoute.indexOf('bai-bi-go/collection') >= 0) {
                self.status = 5;
                if (self.getApp().hasRole('btv')) {
                    self.user_id = currentUser.id;
                }
                self.$el.find("#title_page").text("Danh sách bài viết bị gỡ");
            }

            if (currentUser.donvi.tuyendonvi_id == "3") {
				self.donvi_id = currentUser.donvi_id;
				self.$el.find(".select-donvi").remove();
			}
			else {
				self.selectizeDonVi();
				self.$el.find(".select-donvi").removeClass("d-none");
			}
            var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: "post_filter"
            });
            self.$el.find("#grid_search .search-collection input").attr("placeholder", "Tìm kiếm tiêu đề bài viết");
            filter.render();
            self.uiControl.orderBy = [{"field": "created_at", "direction": "desc"}];
            self.getFilter();
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
            });

            self.selectizeCategory();
            if (currentUser.donvi.tuyendonvi_id == "3") {
                self.$el.find("#selectize_category")[0].selectize.load(function(callback) {
                    self.getCategory('', callback);
                });
            }
            else {
                self.controlSelectize();
            }
            

            self.$el.find('.clear-filter').unbind("click").bind("click", function() {
                self.enable_filter = false;
                if ((gonrinApp().getTuyenDonVi() != "3")) {
                    self.donvi_id = null;
                    self.$el.find('#selectize_donvi')[0].selectize.setValue(self.category_id);
                    self.controlSelectize();
                }
                self.category_id = null;
                self.$el.find('#selectize_category')[0].selectize.setValue(self.category_id);
                self.text_filter = null;
                self.$el.find("#grid_search input").val(null);
                self.enable_filter = true;
                self.doFilter();
            });
            self.$el.find("table").addClass("table-hover");
            self.$el.find("table").removeClass("table-striped");
            return this;
        },
        controlSelectize: function() {
            var self = this;
            if (!!self.donvi_id) {
                self.$el.find("#selectize_category")[0].selectize.enable();
            } 
            else {
                self.$el.find("#selectize_category")[0].selectize.disable();
            }
        },
        getCategory: function(query = '', callback) {
            var self = this;
            var url = (self.getApp().serviceURL || "") + '/api/v1/get-list-category?donvi_id=' + self.donvi_id + (query ? "&text_filter=" + query : "");
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
        selectizeCategory: function() {
            var self = this;
            var $selectize = self.$el.find('#selectize_category').selectize({
                maxItems: 1,
                valueField: 'id',
                labelField: 'name',
                searchField: ['name', 'unsigned_name'],
                preload: true,
                placeholder: "Chọn chuyên mục",
                load: function(query, callback) {
                    // self.getCategory(query, callback);
                },
                // render: {
                //     option: function (item, escape) {
                //         if (!!item && !!item.cate_parent_id) {
                //             return '<div class=" px-2 border-bottom">'
                //             + '<h5 class="px-3 ">' + item.name + '</h5>'
                //             + '</div>';
                //         }
                //         else {
                //             return '<div class=" px-2 border-bottom">'
                //             + '<h5 class="py-0 font-weight-400 ">'  + item.name + '</h5>'
                //             + '</div>';
                //         }
                //     }
                // },
                onItemAdd: function(value, $item) {
                    if (value != self.category_id) {
                        self.category_id = value;
                        self.doFilter();
                    }
                },
                onItemRemove: function(value) {
                    self.category_id = null;
                    self.doFilter();
                }
            });
        },
        selectizeDonVi: function() {
			var self = this;
			var $selectize_donvi = self.$el.find('#selectize_donvi').selectize({
				maxItems: 1,
				valueField: 'id',
				labelField: 'ten_coso',
				searchField: ['ten_coso', 'tenkhongdau'],
				preload: true,
				placeholder: "Chọn đơn vị",  
				load: function(query, callback) {
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
                        self.category_id = null;
						self.doFilter();

                        self.$el.find("#selectize_category")[0].selectize.clear();
                        self.$el.find("#selectize_category")[0].selectize.clearOptions();
                        self.$el.find("#selectize_category")[0].selectize.load(function(callback) {
                            self.getCategory('', callback);
                        });
                        self.controlSelectize();
					}
				},
				onItemRemove: function(value) {
					self.donvi_id = null;
                    self.category_id = null;
					self.doFilter();
                    self.$el.find("#selectize_category")[0].selectize.clear();
                    self.$el.find("#selectize_category")[0].selectize.clearOptions();
                    self.controlSelectize();
				}
			});
		},
        getFilter:  function() {
            var self = this;
            var obj = {
                "$and": [
                    { "status": self.status }                
                ]
            };
            // if (self.currentRoute.indexOf('bai-da-tra/collection') >= 0) {
            //     obj = {
            //         "$and": [
            //             {"status": {"$nin": [6, 7]}},
            //             {"returned_by": {"$neq": ""}}  
            //         ]
            //     };
            // }
            if (self.user_id !== null) {
                obj["$and"].push({ "user_id": self.user_id });
            } 
            if (self.text_filter !== null && self.text_filter.trim() != "") {
                obj["$and"].push({ "text_filter": self.text_filter });
            } 
            if (self.category_id != null) {
                obj["$and"].push({ "category_id": self.category_id });
            }
            if (self.donvi_id != null) {
                obj["$and"].push({ "donvi_id": self.donvi_id });
            }
            self.uiControl.filters = obj;
        },
        doFilter: function() {
            var self = this;
            if (self.enable_filter) {
                self.getFilter();
                var $col = self.getCollectionElement();
                $col.data('gonrin').filter(self.uiControl.filters);
            }
        }
    });
});