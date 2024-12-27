define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/view/donvidangky/tpl/collection.html'),
        schema = require('json!schema/DonViDangKySchema.json');

    var CustomFilterView = require('app/bases/CustomFilterView');
    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "donvidangky_collection",
        tools: [{
            name: "default",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [
                {
                name: "create",
                type: "button",
                buttonClass: "btn-primary btn-sm d-none",
                label: "TRANSLATE:CREATE",
                command: function() {
                    var self = this;
                    self.getApp().getRouter().navigate("admin/DonVi/create");
                }
            }, ]
        }, ],
        uiControl: {
            fields: [
                { field:"stt", label:"STT"},
                { field: "ten_coso", label: "Tên DN" },
                { field: "sogiayphep", label: "Số đăng ký kinh doanh" },
                { field: "created_at", label: "Thời gian đăng ký", template: function(rowData){
					if(rowData !== undefined){
						if (rowData.created_at !== null && rowData.created_at !== undefined){
							return gonrinApp().timestampFormat(rowData.created_at*1000, "DD/MM/YYYY HH:MM");
						}
					}
					return "";
                } },
                {
                    field: "tinhthanh_id",
                    label: "Tỉnh thành",
                    foreign: "tinhthanh",
                    foreignValueField: "id",
                    foreignTextField: "ten",
                },
                {
                    field: "quanhuyen_id",
                    label: "Quận/Huyện",
                    foreign: "quanhuyen",
                    foreignValueField: "id",
                    foreignTextField: "ten",
                },
                {
                    field: "xaphuong_id",
                    label: "Xã/Phường",
                    foreign: "xaphuong",
                    foreignValueField: "id",
                    foreignTextField: "ten",
                },
                {
                    field: "trangthai",
                    label: "Trạng thái",
                    template: (rowData) => {
                        if (rowData.trangthai == 1) {
                            return '<div class="text-warning">Đang chờ duyệt</div>';
                        } else if (rowData.trangthai == 2) {
                            return '<div class="text-primary">Đã duyệt</div>';
                        }
                        else if(rowData.trangthai == 3){
                            return '<div class="text-danger">Đã hủy</div>';
                        }
                        return '';
                    }
                }
            ],
            pagination: {
                page: 1,
                pageSize: 50
            },
            onRowClick: function(event) {
                if (event.rowId) {
                    gonrinApp().getRouter().navigate("donvidangky/model?id=" + event.rowId);

                }
            },
            datatableClass: "table table-mobile",
            onRendered: function(e) {
                gonrinApp().responsive_table();
            }
        },
        render: function() {
            var self = this;
            var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: self.collectionName + "_filter"
            });
            filter.render();
            let trangthai = self.$el.find("#trangthai").val();
            if (!filter.isEmptyFilter()) {
                var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
                var filters = {
                    "$or": [
                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text) } },
                        {"ten_coso": {"$likeI":  text}}
                    ]
                }
                self.uiControl.filters = filters;
            }
            if (this.getApp().hasRole('admin') === true) {
                var filters = {
                    "$or": [
                        { "tenkhongdau": { "$likeI": "" } },
                        {"ten_coso": {"$likeI":  ""}}
                    ]
                } ;
                if (!!trangthai && trangthai != "10"){
                    filter = {"$and": [
                        filter,
                        {"trangthai" : {"$eq": trangthai}}
                    ]}
                }
                self.uiControl.filters = filters;
            } 
            else{
                var filters = {
                    "$or": [
                        { "tenkhongdau": { "$likeI": "" } },
                        {"ten_coso": {"$likeI":  ""}}
                    ]
                } ;
                if (!!trangthai && trangthai != "10"){
                    filter = {"$and": [
                        filter,
                        {"trangthai" : {"$eq": trangthai}}
                    ]}
                }
                self.uiControl.filters = filters;
            }
            self.applyBindings();
            filter.on('filterChanged', function(evt) {
                var $col = self.getCollectionElement();
                var text = !!evt.data.text ? evt.data.text.trim() : "";
                let trangthai = self.$el.find("#trangthai").val();
                if ($col) {
                    if (text !== null) {
                        var filters = "";
                        if (this.getApp().hasRole('admin') === true) {
                            filters = {
                                "$or": [
                                    { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text) } },
                                    {"ten_coso": {"$likeI":  text}}
                                ]
                            };
                            if (!!trangthai && trangthai != "10"){
                                filters = {"$and": [
                                    filters,
                                    {"trangthai" : {"$eq": trangthai}}
                                ]}
                            }
                        } else {
                            filters = {
                                "$or": [
                                    { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text) } },
                                   {"ten_coso": {"$likeI":  text}}
                                ]
                            };
                            if (!!trangthai && trangthai != "10"){
                                filters = {"$and": [
                                    filters,
                                    {"trangthai" : {"$eq": trangthai}}
                                ]}
                            }
                        }
                        $col.data('gonrin').filter(filters);

                    }
                }
                self.applyBindings();
            });


            self.$el.find("#trangthai").on("change", (event)=>{
                let trangthai = self.$el.find("#trangthai").val();
                var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
                let filterNew = "";
                if (!!trangthai && trangthai != "10"){
                    if (!!text){
                        filterNew = {
                            "$and": [
                                {                                
                                "$or": [
                                    { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text) } },
                                    {"ten_coso": {"$likeI":  text}}
                                ]},
                                {"trangthai": {"$eq": trangthai}}
                            ]
                        }
                    }
                    else{
                        filterNew = {"$and": [
                            {"trangthai": {"$eq": trangthai}}
                        ]}
                    }
                    var $col = self.getCollectionElement();
                    $col.data('gonrin').filter(filterNew);
                }
                else{
                    let filterNew = self.uiControl.filters;
                    var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
                    if (!!text){
                        filterNew = {
                            "$and": [
                                {                                
                                "$or": [
                                    { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text) } },
                                    {"ten_coso": {"$likeI":  text}}
                                ]}
                            ]
                        }
                    }
                    var $col = self.getCollectionElement();
                    $col.data('gonrin').filter(filterNew);
                }
            })

            self.$el.find("table").addClass("table-hover");
            self.$el.find("table").removeClass("table-striped");
            return this;
        },

    });

});