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
        collectionName: "post_filter",

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
                    width:"110px",
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
                    width:"150px"
				},
                { 
					field: "category_name", 
					label: "Chuyên mục",
                    width:"200px"
				},
                { 
					field: "created_at", 
					label: "Thời gian viết bài",
                    width:"160px"
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
        chuyen_muc: "1",
        text_filter: null,
        render: function() {
            var self = this;
            self.$el.find("#title_page").text("Danh sách bài viết lưu tạm");
            var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: "post_filter"
            });
            self.$el.find("#grid_search .search-collection input").attr("placeholder", "Tìm kiếm tiêu đề bài viết");
            self.$el.find(".select-donvi").remove();
            var currentUser = self.getApp().currentUser;
            if (currentUser) {
                self.chuyen_muc = "1";
                self.text_filter = null;
                filter.render();
                self.uiControl.orderBy = [{"field": "created_at", "direction": "desc"}];
                var filters_collection_post = {"$and": [
                    {"user_id": {"$eq": currentUser.id}},
                    {"status": {"$eq": 0}},
                    {"deleted": {"$eq": false}},
                ]};
                self.uiControl.filters = filters_collection_post;
                
                self.applyBindings();
                filter.on('filterChanged', function(evt) {
                    var $col = self.getCollectionElement();
                    var text = !!evt.data.text ? evt.data.text.trim() : "";
                    if ($col) {
                        if (text !== null) {
                            self.text_filter = text;
                            self.filterCollection();
                        }
                    }
                });
                self.selectizeCategory();
                self.$el.find('.clear-filter').unbind("click").bind("click", function() {
                    self.chuyen_muc = "1";
                    self.$el.find('#selectize_category')[0].selectize.setValue(self.chuyen_muc);
                    self.text_filter = null;
                    self.$el.find("#grid_search input").val(null);
                    self.filterCollection();
                });
                self.$el.find("table").addClass("table-hover");
                self.$el.find("table").removeClass("table-striped");
                return this;
            }
        },
        selectizeCategory: function() {
            var self = this;
            var firstLoad = true;
            var $selectize = self.$el.find('#selectize_category').selectize({
                maxItems: 1,
                valueField: 'id',
                labelField: 'name',
                searchField: ['name', 'unsigned_name'],
                preload: true,
                placeholder: "Chọn chuyên mục",
                load: function(query, callback) {
                    if (firstLoad) {
						firstLoad = false;
						var dict = {
							id: "1",
							name: "Tất cả",
							unsigned_name: "tat ca"
						};
						callback([dict]);
						$selectize[0].selectize.setValue(self.chuyen_muc);
					}
                    var donvi_id = null;
                    var currentUser = gonrinApp().currentUser;
                    if (currentUser.donvi.tuyendonvi_id == "3") {
                        donvi_id = currentUser.donvi_id;
                    }
                    var url = (self.getApp().serviceURL || "") + '/api/v1/get-list-category' + (donvi_id ? "?donvi_id=" + donvi_id : "") + (query ? "&text_filter=" + query : "");
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
                    if (value != self.chuyen_muc) {
                        self.chuyen_muc = value;
                        self.filterCollection();
                    }
                },
                onItemRemove: function(value) {
                    self.chuyen_muc = null;
                    self.filterCollection();
                }
            });
        },
        filterCollection: function() {
            var self = this;
            var currentUser = self.getApp().currentUser;
            var obj = {
                "$and": [
                    {"user_id": {"$eq": currentUser.id}},
                    {"status": {"$eq": 0}},
                    {"deleted": {"$eq": false}}
                ]
            };
            
            var filter_all = "";
            var text = self.text_filter;
            if (text !== null) {
                obj["$and"].push({ "unsigned_title": { "$likeI": text } });
            } 
            if (self.chuyen_muc != "1" && self.chuyen_muc != null) {
                obj["$and"].push({ "category_id": { "$eq": self.chuyen_muc } });
            }
            filter_all = obj;
            var $col = self.getCollectionElement();
            if (filter_all != "") {
                $col.data('gonrin').filter(filter_all);
            } else {
                $col.data('gonrin').filter();
            }
            self.applyBindings();
        }
    });
});