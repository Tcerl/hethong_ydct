define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/bases/tpl/collection.html');
    var CustomFilterView = require('app/bases/CustomFilterView');
    var ModelDialogView = require("app/quanly_thuongmai_dientu/NhomSanPham/ModelView");

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: {},
        urlPrefix: "/api/v1/",
        collectionName: "nhomsanpham_donvi",
        uiControl: {
            fields: [{
                    field: "stt",
                    label: "STT",
                    width: 10
                },
                { field: "ma_nhom", label: "Mã", width: 250 },
                { field: "ten_nhom", label: "Tên", width: 250 },
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
                    name: "create",
                    type: "button",
                    buttonClass: "btn-primary btn-sm width-sm",
                    label: `<i class="fas fa-plus"></i> Thêm mới`,
                    command: function () {
                        var self = this;
                        var modelDialog = new ModelDialogView();
                        modelDialog.dialog();
                        modelDialog.on("saveData", function (data) {
                            self.doFilter();
                        });
                    }
                },
            ],
        }],
        text_filter: null,
        render: function() {
            var self = this;
            var currentUser = self.getApp().currentUser;
            if (currentUser === undefined || currentUser === null || currentUser.donvi == null) {
                self.getApp().notify({ message: "Hết phiên làm việc, vui lòng đăng nhập lại!" }, { type: "danger", delay: 1000 });
                self.getApp().getRouter().navigate("login");
                return false;
            }
            if (!!self.getApp().hasRole('admin') || currentUser.donvi.tuyendonvi_id != "3") {
                self.getApp().notify({ message: "Bạn không có quyền truy cập" }, { type: "danger", delay: 1000 });
                self.getApp().getRouter().navigate("login");
                return false;
            }
            self.$el.find('.page-title').text('Danh sách nhóm sản phẩm');
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
                    "$and": [
                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(self.text_filter) } },
                    ]
                }
                $col.data('gonrin').filter(filters);
            } 
            else {
                $col.data('gonrin').filter(null);
            }
        }
    });

});