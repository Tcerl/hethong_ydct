define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/view/diadiemnuoitrong/tpl/collection.html'),
        schema = require('json!schema/DiaDiemNuoiTrongKhaiThacSchema.json');
    var CustomFilterView = require('app/bases/CustomFilterView');

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "nuoitrong_khaithac_filter",
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
                { field: "ten_diadiem", label: "Tên", width: 250 },
                { field: "xaphuong", label: "Xã phường", width: 250, template : function(rowData){
                    if (!!rowData && !!rowData.xaphuong){
                        return `${rowData.xaphuong.ten}`;
                    }
                    return '';
                } },
                { field: "quanhuyen", label: "Quận huyện", width: 250, template : function(rowData){
                    if (!!rowData && !!rowData.quanhuyen){
                        return `${rowData.quanhuyen.ten}`;
                    }
                    return '';
                } },
                { field: "tinhthanh", label: "Tỉnh thành", width: 250, template : function(rowData){
                    if (!!rowData && !!rowData.tinhthanh){
                        return `${rowData.tinhthanh.ten}`;
                    }
                    return '';
                } },
            ],
            onRowClick: function(event) {
                if (event.rowId) {
                    let path = `diadiem_nuoitrong/model?id=${event.rowId}`;
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
                    let path = 'diadiem_nuoitrong/model'
                    gonrinApp().getRouter().navigate(path);
                }
            }, ]
        }, ],
        render: function() {
            var self = this;
            var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: 'nuoitrong_khaithac' + "_filter"
            });
            filter.render();
            if (!filter.isEmptyFilter()) {
                var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
                var filters = {
                    "$and":[
                        {
                            "$or": [
                                { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text) } },
                                { "ten_diadiem": { "$likeI": text } }
                            ]
                        },
                        {"loai_diadiem" : {"$eq": 1}}
                    ]

                }

                self.uiControl.filters = filters;
            }
            else{
                var filters = {
                    "$and":[
                        {"loai_diadiem" : {"$eq": 1}}
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
                            "$and": [
                                {
                                    "$or": [
                                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text) } },
                                        { "ten_diadiem": { "$likeI": text } }
                                    ]
                                },
                            {"loai_diadiem" : {"$eq": 1}}
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