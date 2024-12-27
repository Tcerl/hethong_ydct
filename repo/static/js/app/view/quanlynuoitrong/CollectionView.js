define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/view/quanlynuoitrong/tpl/collection.html'),
        schema = require('json!schema/DuocLieuNuoiTrongSchema.json');
    var CustomFilterView = require('app/bases/CustomFilterView');

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "duoclieu_nuoitrong_filter",
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
                { field: "diadiem_nuoitrong", label: "Địa điểm nuôi trồng", width: 250,template:  function (rowData) {
                    if (!!rowData && !!rowData.diadiem_nuoitrong){
                        let diadiem_nuoitrong = rowData.diadiem_nuoitrong;
                        if (Array.isArray(diadiem_nuoitrong) == true){
                            let results = diadiem_nuoitrong.map((value)=>{
                                return value.ten_diadiem;
                            }).join(", ");
                            return results;
                        }
                    }
                    return "";
                } },
                { field: "ngay_lam_dat", label: "Ngày làm đất", width: 250, template: function(rowData) {
                    if (!!rowData && !!rowData.ngay_lam_dat) {
                        return gonrinApp().parseInputDateString(rowData.ngay_lam_dat).format("DD/MM/YYYY");
                    }
                    return "";
                } },
                { field: "ngay_uom_giong", label: "Ngày ươm giống", width: 250, template: function(rowData) {
                    if (!!rowData && !!rowData.ngay_uom_giong) {
                        return gonrinApp().parseInputDateString(rowData.ngay_uom_giong).format("DD/MM/YYYY");
                    }
                    return "";
                } },
                { field: "ngay_trong_giong", label: "Ngày trồng giống", width: 250,template: function(rowData) {
                    if (!!rowData && !!rowData.ngay_trong_giong) {
                        return gonrinApp().parseInputDateString(rowData.ngay_trong_giong).format("DD/MM/YYYY");
                    }
                    return "";
                } },
            ],
            onRowClick: function(event) {
                if (event.rowId) {
                    var path = 'duoclieu_nuoitrong/model?id=' + event.rowId;
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
                command: function() {
                    var self = this;
                    let path = 'duoclieu_nuoitrong/model'
                    gonrinApp().getRouter().navigate(path);
                }
            }, ]
        }, ],
        render: function() {
            var self = this;
            var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: 'duoclieu_nuoitrong'+ "_filter"
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