define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/view/quanlykhaithac/tpl/collection.html'),
        schema = require('json!schema/KhaiThacTuNhienSchema.json');
    var CustomFilterView = require('app/bases/CustomFilterView');

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "khaithac_tunhien_filter",
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
                { field: "ten_sanpham", label: "Tên dược liệu", width: 250 },
                { field: "mota_vitri_diadiem", label: "Địa điểm khai thác", width: 250 },
                { field: "dientich_khaithac", label: "Diện tích khai thác", width: 250, template: function(rowData) {
                    if (!!rowData && !!rowData.dientich_khaithac && !!rowData.donvi_dientich) {
                        let text_donvi = "";
                        if (rowData.donvi_dientich == 1){
                            text_donvi = "m2";
                        }
                        else if (rowData.donvi_dientich == 2){
                            text_donvi = "hecta (ha)";
                        }
                        else if (rowData.donvi_dientich == 3){
                            text_donvi = "km2";
                        }
                        else{
                            text_donvi = "";
                        }
                        return `${rowData.dientich_khaithac} (${text_donvi})`;
                    }
                    return "";
                } },
                { field: "thoigian_batdau_khaithac", label: "Thời gian bắt đầu khác thác", width: 250, template: function(rowData) {
                    if (!!rowData && !!rowData.thoigian_batdau_khaithac) {
                        return gonrinApp().parseInputDateString(rowData.thoigian_batdau_khaithac).format("DD/MM/YYYY");
                    }
                    return "";
                } },
                { field: "tong_thoigian_khaithac", label: "Tổng thời gian khai thác (ngày)", width: 250,template: function(rowData) {
                    if (!!rowData && !!rowData.tong_thoigian_khaithac) {
                        return `${rowData.tong_thoigian_khaithac}`;
                    }
                    return "";
                } },
            ],
            onRowClick: function(event) {
                if (event.rowId) {
                    var path = 'khaithac_tunhien/model?id=' + event.rowId;
                    this.getApp().getRouter().navigate(path);
                }
            },
            language: {
                no_records_found: "Chưa có dữ liệu"
            },
            noResultsClass: "alert alert-default no-records-found",
            datatableClass: "table table-mobile",
            pagination: {
                page: 1,
                pageSize: 100
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
                // visible: function() {
                //     var tuyendonvi_id = gonrinApp().getTuyenDonVi();
                //     return gonrinApp().hasRole("admin") || tuyendonvi_id=='1';
                // },
                command: function() {
                    var self = this;
                    let path = `khaithac_tunhien/model`;
                    gonrinApp().getRouter().navigate(path);
                }
            }, ]
        }, ],
        render: function() {
            var self = this;
            var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: 'khaithac_tunhien' + "_filter"
            });
            filter.render();
            if (!filter.isEmptyFilter()) {
                var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
                var filters = {
                    "$or": [
                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text) } },
                        { "ten_sanpham": { "$likeI": text } }
                    ]
                }

                self.uiControl.filters = filters;
            }
            self.applyBindings();
            filter.on('filterChanged', function(evt) {
                var $col = self.getCollectionElement();
                var text = !!evt.data.text ? evt.data.text.trim() : "";
                if ($col) {
                    if (text !== null) {
                        var filters = {
                            "$or": [
                                { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text) } },
                                { "ten_sanpham": { "$likeI": text } }
                            ]
                        }
                        $col.data('gonrin').filter(filters);
                    }
                }
                self.applyBindings();
            });
            self.$el.find("table").addClass("table-hover");
            self.$el.find("table").removeClass("table-striped");
            return this;
        },
    });

});