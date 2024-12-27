define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/bases/tpl/collection.html'),
        schema = require('json!schema/DanhMucKhoSchema.json');
    var CustomFilterView = require('app/bases/CustomFilterView');

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "danhmuc_kho",
        uiControl: {
            fields: [{ field: "stt", label: "STT", width: 10 },
                { field: "ma_kho", label: "Mã Kho", width: 200 },
                { field: "ten_kho", label: "Tên Kho", width: 250 },
                { field: "vitri", label: "vị trí", width: 250 },
                { field: "mota", label: "Mô tả", width: 250 },
                { field: "active", label: "Trạng thái", width: 250, template: (rowData) =>{
                    if (!!rowData){
                        if (rowData.active == 1){
                            return `<span class="text-success">Đang hoạt động</span>`;
                        }
                        else if (rowData.active == 0){
                            return `<span class="text-danger">Ngừng hoạt động</span>`;
                        }
                    }
                } }


            ],
            onRowClick: function(event) {
                if (event.rowId) {
                    var path = this.collectionName + '/model?id=' + event.rowId;
                    this.getApp().getRouter().navigate(path);
                }
            },
            language: {
                no_records_found: "Chưa có dữ liệu"
            },
            noResultsClass: "alert alert-default no-records-found",
            datatableClass: "table table-mobile",
            onRendered: function(e) {
                gonrinApp().responsive_table();
            }
        },
        tools: [{
            name: "default",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [{
                name: "create",
                type: "button",
                buttonClass: "btn-primary btn-sm",
                label: `<i class="fa fa-plus"></i> Thêm mới`,
                command: function() {
                    var self = this;
                    let path = `danhmuc_kho/model`;
                    gonrinApp().getRouter().navigate(path);
                }
            }, ]
        }, ],
        render: function() {
            var self = this;
            self.$el.find("#title_page").html("Danh sách Kho");

            var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: self.collectionName + "_filter"
            });
            filter.render();
            self.$el.find("#grid_search input").val("");
            self.$el.find("#grid_search input").attr({ "placeholder": "Tìm kiếm theo Tên kho" });
            var filter_query = self.uiControl.filters;
            if (filter_query !== undefined && filter_query !== null && filter_query !== false) {
                self.query = filter_query;
            }
            filter.model.set("text", "");

            self.uiControl.orderBy = [{ "field": "ten_kho", "direction": "asc" }];
            if (!filter.isEmptyFilter()) {
                var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
                var filters = { "ten_kho": { "$likeI": text } };
                var filter1;
                if (self.query !== null && self.query !== undefined) {
                    filter1 = {
                        "$and": [
                            filters, self.query
                        ]
                    };
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
                    if (text !== null) {
                        var filters = { "ten_kho": { "$likeI": text } };
                        var filter1;
                        if (self.query !== null && self.query !== undefined) {
                            filter1 = {
                                "$and": [
                                    filters, self.query
                                ]
                            };
                        } else {
                            filter1 = filters;
                        }
                        $col.data('gonrin').filter(filter1);
                    }
                }
                self.applyBindings();
            });
            return this;
        }

    });

});