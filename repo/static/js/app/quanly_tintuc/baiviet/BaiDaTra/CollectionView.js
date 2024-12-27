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
            buttons: [{
                    name: "create",
                    type: "button",
                    buttonClass: "btn-success btn-sm btn-custom",
                    label: '<i class="fa fa-plus"></i> Thêm mới',
                    command: function() {
                        var self = this;
                        var path = 'postadmin/model';
                        self.getApp().getRouter().navigate(path);
                    }
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
					field: "returner_name", 
					label: "Người trả bài",
                    width:"160px"
				},
                { 
					field: "returned_time", 
					label: "Thời gian trả bài",
                    width:"160px"
				},
                {
                    field: "status",
                    label: "Trạng thái",
                    width: 100,
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
        selectize_load_first: true,
        render: function() {
            var self = this;
            self.$el.find("#title_page").text("Danh sách bài viết đã trả");
            var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: "post_filter"
            });
            self.$el.find("#grid_search .search-collection input").attr("placeholder", "Tìm kiếm tiêu đề bài viết");
            if (self.getApp().currentUser && (self.getApp().hasRole('admin') || self.getApp().hasRole('admin_donvi') || self.getApp().hasRole('tkts'))) {
                self.chuyen_muc = "1";
                self.text_filter = null;
                self.selectize_load_first = true;
                var currentUser = self.getApp().currentUser;
                filter.render();
                self.uiControl.orderBy = [{"field": "returned_time", "direction": "desc"}];
                var filters_collection_post = {"$and": [
                    {"deleted": {"$eq": false}},
                    {"status": {"$nin": [6, 7]}},
                    {"returned_by": {"$neq": ""}},
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
                var $selectize = self.$el.find('#select-category').selectize({
                    maxItems: 1,
                    valueField: 'id',
                    labelField: 'name',
                    searchField: ['name', 'unsigned_name'],
                    preload: true,
                    placeholder: "Chọn chuyên mục",
                    
                    load: function(query, callback) {
                        var url = (self.getApp().serviceURL || "") + '/api/v1/get-list-category' + (query ? "?text_filter=" + query : "");
                        $.ajax({
                            url: url,
                            type: 'GET',
                            dataType: 'json',
                            error: function() {
                                callback();
                            },
                            success: function(res) {
                                var obj = res.objects;
                                var dict = {
                                    id: "1",
                                    name: "Tất cả"
                                };
                                obj.unshift(dict)
                                callback(obj);
                                if (self.selectize_load_first) {
                                    $selectize[0].selectize.setValue(self.chuyen_muc);
                                }
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
                        self.chuyen_muc = value;
                        if (self.selectize_load_first) {
                            self.selectize_load_first = false;
                        }
                        else {
                            self.filterCollection();
                        }
                    },
                    onItemRemove: function(value) {
                        self.chuyen_muc = "0";
                        self.filterCollection();
                    }
                });
                self.$el.find('.clear-filter').unbind("click").bind("click", function() {
                    self.chuyen_muc = "0";
                    $selectize[0].selectize.setValue(self.chuyen_muc);
                    self.text_filter = null;
                    self.$el.find("#grid_search input").val(null);
                    self.filterCollection();
                });
                self.$el.find("table").addClass("table-hover");
                self.$el.find("table").removeClass("table-striped");
                return this;
            }
        },
        filterCollection: function() {
            var self = this;
            var obj = {
                "$and": [
                    {"deleted": {"$eq": false}},
                    {"status": {"$nin": [6, 7]}},
                    {"returned_by": {"$neq": ""}},
                ]
            };
            
            var filter_all = "";
            var text = self.text_filter;
            if (text !== null) {
                obj["$and"].push({ "unsigned_title": { "$likeI": text } });
            } 
            obj["$and"].push({ "category_id": { "$eq": self.chuyen_muc } });
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