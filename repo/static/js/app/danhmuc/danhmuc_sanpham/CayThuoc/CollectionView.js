define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/bases/tpl/collection.html');
    var CustomFilterView = require('app/bases/CustomFilterView');
    var ModelDialogView = require("app/danhmuc/danhmuc_sanpham/CayThuoc/ModelView");
    
    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: {},
        urlPrefix: "/api/v1/",
        collectionName: "caythuoc",
        uiControl: {
            fields: [
                { field: "stt", label: "STT", width: 50 },
                { field: "ma_caythuoc", label: "Mã", width: 200 },
                { field: "ten_caythuoc", label: "Tên", width: 250 },
                { field: "ten_khoa_hoc", label: "Tên khoa học", width: 250 },
                { field: "cong_dung", label: "Công dụng", width: 250 },
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
            // onRendered: function (e) {
            // 	gonrinApp().responsive_table();
            // }
        },
        tools: [
            {
                name: "defaultgr",
                type: "group",
                groupClass: "toolbar-group",
                buttons: [
                    {
                        name: "save",
                        type: "button",
                        buttonClass: "btn-primary btn-sm width-sm",
                        label: `<i class="fas fa-plus"></i> Thêm mới`,
                        // visible: function() {
                        //     return gonrinApp().hasRole("admin") || gonrinApp().hasRole("admin_donvi");
                        // },
                        visible: function() {
                            var tuyendonvi_id = gonrinApp().getTuyenDonVi();
                            return gonrinApp().hasRole("admin") ||  tuyendonvi_id=='1';
                        },
                        command: function () {
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
            this.$el.find('.page-title').text('Danh sách cây thuốc');
            var self = this;
            self.text_filter = null;
            var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: self.collectionName + "_filter"
            });
            filter.render();
            var filters = {
                "$and": [
                    { "deleted": { "$eq": false } }
                ]
            }
            self.uiControl.filters = filters;
            self.applyBindings();
            filter.on('filterChanged', function(evt) {
                var $col = self.getCollectionElement();
                var text = !!evt.data.text ? evt.data.text.trim() : "";
                if ($col) {
                    if (text !== null) {
                        self.text_filter = text;
                    } else {
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
            var filters = {
                "$and": [
                    { "deleted": { "$eq": false } }
                ]
            }
            if (!!self.text_filter) {
                filters['$and'].push({
                    "$or": [
                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(self.text_filter) } },
                        { "ma_caythuoc": { "$likeI": self.text_filter } }
                    ]
                });                
            } 
            $col.data('gonrin').filter(filters);
        }
    });
});