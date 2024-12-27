define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/bases/tpl/collection.html'),
        schema = require('json!schema/DanhMucBoPhanSanPhamSchema.json');
    
    var CustomFilterView = require('app/bases/CustomFilterView');
    var ModelDialogView = require("app/danhmuc/danhmuc_sanpham/BoPhan/ModelView");

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "bophan",
        uiControl: {
            fields: [{
                    field: "stt",
                    label: "STT",
                    width: 10
                },
                {
                    field: "id",
                    label: "ID",
                    width: 250,
                    readonly: true,
                    visible: false
                },
                { field: "ma_bophan", label: "Mã", width: 200 },
                { field: "ten_bophan", label: "Tên", width: 250 },
                { field: "congdung", label: "Công dụng", width: 250 },
            ],
            onRowClick: function(event) {
                var self = this;
                if (event.rowId) {
                    var dialog = new ModelDialogView({ "viewData": { "id": event.rowId } });
                    dialog.dialog();
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
        tools: [{
            name: "defaultgr",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [
                {
                    name: "save",
                    type: "button",
                    buttonClass: "btn-primary btn-sm width-sm",
                    label: `<i class="fas fa-plus"></i> Thêm mới`,
                    visible: function() {
                        var tuyendonvi_id = gonrinApp().getTuyenDonVi();
                        return gonrinApp().hasRole("admin") || tuyendonvi_id=='1';
                    },
                    command: function () {
                        var self = this;
                        var modelDialog = new ModelDialogView();
                        modelDialog.dialog();
                        modelDialog.on("saveData", function (data) {
                            self.doFilter();
                        });
                    }
                },
                // {
                //     name: "save",
                //     type: "button",
                //     buttonClass: "btn-info btn-sm width-sm ml-1",
                //     label: `<i class="fas fa-file-download"></i> Xuất excel`,
                //     command: function () {
                //         gonrinApp().exportExcelCategory(this, "danhmuc_cuakhau");
                //     }
                // },
            ],
        }],
        text_filter: null,
        render: function () {
            this.$el.find('.page-title').text('Danh sách bộ phận dược liệu');
            var self = this;
            self.text_filter = null;
            var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: self.collectionName + "_filter"
            });
            filter.render();
            self.uiControl.filters = null;
            self.applyBindings();
            filter.on('filterChanged', function (evt) {
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
            this.$el.addClass('category-common');
            return this;
        },
        doFilter: function () {
            var self = this;
            var $col = self.getCollectionElement();
            if (!!self.text_filter) {
                var filters = {
                    "$or": [
                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(self.text_filter) } },
                    ]
                }
                $col.data('gonrin').filter(filters);
            } else {
                $col.data('gonrin').filter(null);
            }
        }
    });

});