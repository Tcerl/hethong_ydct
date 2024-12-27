define(function(require) {
    "use strict";
    var Gonrin = require('gonrin');

    var template = require('text!app/bases/tpl/collection.html');
    var CustomFilterView = require('app/bases/CustomFilterView');
    var ModelDialogView = require("app/danhmuc/danhmuc_sanpham/BaiThuocYDCT/ModelView");
    
    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: {},
        urlPrefix: "/api/v1/",
        collectionName: "baithuoc_ydct",
        uiControl: {
            fields: [
                { field: "stt", label: "STT", width: "30px" },
                { field: "ma_baithuoc", label: "Mã bài thuốc", width: "100px" },
                { field: "tacgia_ten", label: "Tác giả", width: "120px" },
                { field: "ten_baithuoc", label: "Tên bài thuốc", width: "300px" },
                { field: "ngay_congbo", label: "Ngày công bố", width: "90px", template: function(rowData){
                    return gonrinApp().formatDatetimeString(rowData.ngay_congbo);
                } },
                { field: "nguoi_congbo", label: "Người công bố", width: "120px" },
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
            this.$el.find('.page-title').text('Danh sách bài thuốc y dược cổ truyền');
            var self = this;
            self.text_filter = null;
            var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: self.collectionName + "_filter"
            });
            filter.render();
            var filters = { "deleted": { "$eq": false } };
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
            var filters = { "deleted": { "$eq": false } };
            if (!!self.text_filter) {
                filters['$and'] = [{
                    "$or": [
                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(self.text_filter) } },
                        { "tacgia_ten": { "$likeI": self.text_filter } },
                        { "ma_baithuoc": { "$eq": self.text_filter } }
                    ]
                }]
            } 
            $col.data('gonrin').filter(filters);
        }
    });

});