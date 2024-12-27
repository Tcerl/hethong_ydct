define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/bases/tpl/collection.html');
    var CustomFilterView = require('app/bases/CustomFilterView');
    var ModelDialogView = require("app/quanly_thuongmai_dientu/NguoiBanHang/ModelView");
    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: {},
        urlPrefix: "/api/v1/",
        collectionName: "nguoibanhang",
        uiControl: {
            fields: [
                { field: "stt", label: "STT", width: 50 },
                { field: "ten", label: "Tên ngừoi bán hàng ", width: 350 },
				{ field: "dienthoai", label: "Số điện thoại", width:120 },
				{ field: "diachi", label: "Địa chỉ"},
                {
                    field: "trangthai",
                    label: "Trạng thái",
                    with: 100,
                    template: (rowData) => {
                        if (rowData.trangthai == 0) {
                            return '<div class="text-danger">Ngừng hoạt động</div>';
                        } 
                        else if (rowData.trangthai == 1) {
                            return '<div class="text-primary">Đang hoạt động</div>';
                        }
                        return '';
                    }
                }
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
            this.$el.find('.page-title').text('Danh sách người bán hàng');
            var self = this;
            self.text_filter = null;
            var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: self.collectionName + "_filter"
            });
            filter.render();
            self.uiControl.orderBy = [{ "field": "ten", "direction": "asc" }];
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
            var filters = {
                "$and": [
    
                ]
            }

            if (!!self.text_filter) {
                filters['$and'].push({
                    "$or": [
                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(self.text_filter) } },
                        { "ma": { "$likeI": self.text_filter } }
                    ]
                });                
            } 
            $col.data('gonrin').filter(filters);
        }
    });

});