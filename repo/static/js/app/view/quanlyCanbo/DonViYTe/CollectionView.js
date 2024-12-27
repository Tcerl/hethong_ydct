define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/view/quanlyCanbo/DonViYTe/tpl/collection.html'),
        schema = require('json!schema/DonViSchema.json');
    var tuyendonvi = require('json!app/constant/tuyendonvi.json');
    var CustomFilterView = require('app/bases/CustomFilterView');
    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "donvi",
        tools: [{
            name: "default",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [{
                name: "create",
                type: "button",
                buttonClass: "btn-primary btn-sm",
                label: `<i class="fa fa-plus"></i> Thêm mới`,
                visible: function() {
					return gonrinApp().hasRole("admin") || gonrinApp().hasRole("admin_donvi");
				},
                command: function() {
                    var self = this;
                    self.getApp().getRouter().navigate("admin/DonVi/create");
                }
            }, ]
        }, ],
        uiControl: {
            fields: [
                { field: "stt", label: "STT", with: 50 },
                { field: "ten_coso", label: "Tên đơn vị" },
                // {
                //     field: "tinhthanh_id",
                //     label: "Tỉnh thành",
                //     foreign: "tinhthanh",
                //     foreignValueField: "id",
                //     foreignTextField: "ten",
                // },
                // {
                //     field: "quanhuyen_id",
                //     label: "Quận/Huyện",
                //     foreign: "quanhuyen",
                //     foreignValueField: "id",
                //     foreignTextField: "ten",
                // },
                // {
                //     field: "xaphuong_id",
                //     label: "Xã/Phường",
                //     foreign: "xaphuong",
                //     foreignValueField: "id",
                //     foreignTextField: "ten",
                // },
                { 
					field: "tuyendonvi_id", 
					label: "Tuyến đơn vị",
					template: (rowData) => {
						for (let i = 0; i < tuyendonvi.length; i++) {
							if (tuyendonvi[i]['value'] == rowData.tuyendonvi_id) {
								return tuyendonvi[i]['text'];
							}
						}
						return '';	
					}
				},
                {
                    field: "diachi",
                    label: "Địa chỉ",
                },
                {
                    field: "active",
                    label: "Trạng thái",
                    with: 100,
                    template: (rowData) => {
                        if (rowData.active == 0) {
                            return '<div class="text-danger">Đang bị khóa</div>';
                        } 
                        else if (rowData.active == 1) {
                            return '<div class="text-primary">Đang hoạt động</div>';
                        }
                        return '';
                    }
                }
            ],
            pagination: {
                page: 1,
                pageSize: 15
            },
            onRowClick: function(event) {
                if (event.rowId) {
                    gonrinApp().getRouter().navigate("canbo/DonViYTe/chitiet?id=" + event.rowId);
                }
            },
            datatableClass: "table table-mobile",
            onRendered: function(e) {
                gonrinApp().responsive_table();
            }
        },
        render: function() {
            var self = this;
            var captren_id = gonrinApp().currentUser.donvi_id;
            let trangthai = self.$el.find("#trangthai").val();
            var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: self.collectionName + "_filter"
            });
            filter.render();
            if (!filter.isEmptyFilter()) {
                var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
                var filters = { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text) } };
                self.uiControl.filters = filters;
            }
            var tuyendonvi_id = gonrinApp().getTuyenDonVi();
            if (this.getApp().hasRole('admin') === true || (this.getApp().hasRole('admin_donvi') == true && tuyendonvi_id == "1")) {
                var filters = { "tenkhongdau": { "$likeI": "" } };
                if (trangthai === "true" || trangthai === "false" ){
                    filters = {
                        "$and":[
                            filters,
                            {"active": {"$eq": trangthai}}
                        ]
                    }
                }
                self.uiControl.filters = filters;
            } 
            else {
                if (captren_id !== null && captren_id !== undefined) {
                    var filters_donvidangki = { "captren_id": { "$eq": captren_id } };
                    if (trangthai === "true" || trangthai === "false" ){
                        filters_donvidangki = {
                            "$and":[
                                filters_donvidangki,
                                {"active": {"$eq": trangthai}}
                            ]
                        }
                    }
                    self.uiControl.filters = filters_donvidangki;
                }
            }
            self.applyBindings();
            filter.on('filterChanged', function(evt) {
                var $col = self.getCollectionElement();
                var text = !!evt.data.text ? evt.data.text.trim() : "";
                if ($col) {
                    if (text !== null) {
                        var filters = "";
                        if (this.getApp().hasRole('admin') === true || (this.getApp().hasRole('admin_donvi') == true && tuyendonvi_id == "1")) {
                            filters = {
                                "$and": [
                                    {"$or": [
                                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text) } },
                                        { "ten_coso": { "$likeI": (text) } },
                                        { "sogiayphep": { "$likeI": (text) } }
                                    ]}
                                ]
                            };
                            if (trangthai === "true" || trangthai === "false" ){
                                filters = {
                                    "$and":[
                                        filters,
                                        {"active": {"$eq": trangthai}}
                                    ]
                                }
                            }
                        } 
                        else {
                            filters = {
                                "$and": [
                                    {"$or": [
                                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text) } },
                                        { "ten_coso": { "$likeI": (text) } },
                                        { "sogiayphep": { "$likeI": (text) } }
                                    ]},
                                    { "captren_id": { "$eq": captren_id } }
                                ]
                            };
                            if (trangthai === "true" || trangthai === "false" ){
                                filters = {
                                    "$and":[
                                        filters,
                                        {"active": {"$eq": trangthai}}
                                    ]
                                }
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
                if (trangthai === "true" || trangthai === "false"){
                    if (!!text){
                        if (this.getApp().hasRole('admin') === true || (this.getApp().hasRole('admin_donvi') == true && tuyendonvi_id == "1")) {
                            filterNew = {
                                "$and": [
                                    {                                
                                    "$or": [
                                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text) } },
                                        {"ten_coso": {"$likeI":  text}},
                                        { "sogiayphep": { "$likeI": (text) } }
                                    ]},
                                    {"active": {"$eq": trangthai}}
                                ]
                            }
                        }
                        else{
                            filterNew = {
                                "$and": [
                                    {                                
                                    "$or": [
                                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text) } },
                                        {"ten_coso": {"$likeI":  text}},
                                        { "sogiayphep": { "$likeI": (text) } }
                                    ]},
                                    {"active": {"$eq": trangthai}},
                                    { "captren_id": { "$eq": captren_id } }
                                ]
                            }
                        }
                    }
                    else {
                        if (this.getApp().hasRole('admin') === true || (this.getApp().hasRole('admin_donvi') == true && tuyendonvi_id == "1")) {
                            filterNew = {"$and": [
                                {"active": {"$eq": trangthai}}
                            ]}
                        }
                        else {
                            filterNew = {"$and": [
                                {"active": {"$eq": trangthai}},
                                { "captren_id": { "$eq": captren_id } }
                            ]}
                        }

                    }
                    var $col = self.getCollectionElement();
                    $col.data('gonrin').filter(filterNew);
                }
                else{
                    let filterNew = self.uiControl.filters;
                    var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
                    if (!!text){
                        if (this.getApp().hasRole('admin') === true || (this.getApp().hasRole('admin_donvi') == true && tuyendonvi_id == "1")) {
                            filterNew = {
                                "$and": [
                                    {                                
                                    "$or": [
                                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text) } },
                                        {"ten_coso": {"$likeI":  text}},
                                        { "sogiayphep": { "$likeI": (text) } }
                                    ]}
                                ]
                            }
                        }
                        else {
                            filterNew = {
                                "$and": [
                                    {                                
                                    "$or": [
                                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text) } },
                                        {"ten_coso": {"$likeI":  text}},
                                        { "sogiayphep": { "$likeI": (text) } }
                                    ]},
                                    { "captren_id": { "$eq": captren_id } }
                                ]
                            }
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