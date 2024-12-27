define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/bases/tpl/collection.html');
    var CustomFilterView = require('app/bases/CustomFilterView');
    var ModelDialogView = require("app/quanly_thuongmai_dientu/SanPhamViPham/ModelView");
    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: {},
        urlPrefix: "/api/v1/",
        collectionName: "sanpham_vipham_donvi",
        uiControl: {
            fields: [
                { field: "stt", label: "STT", width: 50 },
                { field: "ten_sanpham", label: "Tên sản phẩm", width: 300 },
				{ field: "donvi_cungung_ten", label: "Nhà cung cấp"},
            ],
            onRowClick: function (event) {
                var self = this;
                if (event.rowId) {
                    var dialog = new ModelDialogView({ "viewData": { "id": event.rowId } });
                    dialog.dialog({size:"large"});
                    dialog.on("saveData", function () {
                        self.doFilter();
                    })
                }
            },
            language: {
                no_records_found: "Chưa có dữ liệu"
            },
            noResultsClass: "alert alert-default no-records-found",
            datatableClass: "table table-mobile",
            onRendered: function (e) {
            	gonrinApp().responsive_table();
            }
        },
        tools: [
            {
                name: "defaultgr",
                type: "group",
                groupClass: "toolbar-group",
                buttons: [
                    {
                        name: "create",
                        type: "button",
                        buttonClass: "btn-primary btn-sm width-sm",
                        label: `<i class="fas fa-plus"></i> Thêm mới`,
                        command: function() {
                            var self = this;
                            var dialog = new ModelDialogView();
                            dialog.dialog({size:"large"});
                            dialog.on("saveData", function () {
                                self.doFilter();
                            });
                        }
                    },
                ],
            }
        ],
        text_filter: null,
        render: function() {
            var self = this;
            self.$el.find('.page-title').text('Danh sách sản phẩm vi phạm');
            self.text_filter = null;
            var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: self.collectionName + "_filter"
            });
            filter.render();
            self.uiControl.orderBy = [{ "field": "ten_sanpham", "direction": "asc" }];
            self.applyBindings();
            filter.on('filterChanged', function(evt) {
                var $col = self.getCollectionElement();
                var text = !!evt.data.text ? evt.data.text.trim() : "";
                if ($col) {
                    if (text !== null) {
                        self.text_filter = text;
                    } 
                    else {
                        self.text_filter = null;
                    }
                    self.doFilter();
                }
                self.applyBindings();
            });
            self.$el.find("table").addClass("table-hover");
            self.$el.find("table").removeClass("table-striped");
            return this;
        },
        doFilter: function () {
            var self = this;
            var $col = self.getCollectionElement();
            var filters = null;
            if (!!self.text_filter) {
                filters = {
                    "$and": [
                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(self.text_filter) } }
                    ]
                }
            } 
            $col.data('gonrin').filter(filters);
        }
    });

});