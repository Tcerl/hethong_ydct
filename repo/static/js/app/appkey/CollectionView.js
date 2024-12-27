define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/appkey/tpl/collection.html'),
        schema = require('json!schema/AppInfoSchema.json');
    var CustomFilterView = require('app/bases/CustomFilterView');

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "appinfo",
        uiControl: {
            fields: [
                {
                    field: "stt",
                    label: "STT",
                    width: 10
                },
                { field: "name", label: "Tên ứng dụng", width: 250 },
                { field: "description", label: "Mô tả", width: 250 },
                { field: "status", label: "Trạng thái", width: 250, template: function(rowData){
                    if (!!rowData){
                        if (rowData.status == 1){
                            return '<span class="text-success">Đang hoạt động</span>';
                        }
                        else if (rowData.status ==0){
                            return '<span class="text-danger">Ngừng hoạt động</span>';
                        }
                    }
                    return "";
                } },
            ],
            onRowClick: function(event) {
                if (event.rowId) {
                    var path = this.collectionName + '/model?id=' + event.rowId;
                    this.getApp().getRouter().navigate(path);
                }
                //this.getApp().loading(); 
                //this.getApp().alert("haha");

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
            // onRendered: function (e) {
            // 	gonrinApp().responsive_table();
            // }
        },
        tools: [{
            name: "default",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [{
                name: "create",
                type: "button",
                buttonClass: "btn-primary btn-sm",
                label: "Tạo mới",
                command: function() {
                    var self = this;
                    gonrinApp().getRouter().navigate(this.collectionName + '/model');
                }
            }, ]
        }, ],
        render: function() {
            var self = this;
            var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: self.collectionName + "_filter"
            });
            filter.render();
            if (!filter.isEmptyFilter()) {
                var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
                var filters = {
                    "$or": [
                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text) } },
                        { "ten": { "$likeI": text } }
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
                                { "ten": { "$likeI": text } }
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