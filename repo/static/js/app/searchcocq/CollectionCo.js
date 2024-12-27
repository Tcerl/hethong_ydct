define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/searchcocq/tpl/collection.html'),
        schema = require('json!schema/GiayPhepNhapKhauSchema.json');
    var storejs  = require('vendor/store');

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "giaychungnhanco_collection_filter",
        uiControl: {
            fields: [
                {
                    field: "stt",
                    label: "STT",
                    width: 10
                },
                { field: "loai_co", label : "Loại CO", width : 180, template : function(rowData){
                    if (rowData !== undefined && rowData !== null){
                        if (rowData.loai_co == 1){
                            return '<div>Ngoài nước</div>';
                        }
                        else if (rowData.loai_co == 2){
                            return '<div>Trong nước</div>';
                        }
                        return "";
                    }
                }},
                { field: "so_co", label: "Số CO", width: 180 },
                { field: "so_giay_phep", label: "Số giấy phép", width: 180 },
                { field: "ten_donvi_tiepnhan", label: "Đơn vị tiếp nhận" },
                {
                    field: "thoigian_cap_co",
                    label: "Ngày cấp CO",
                    template: function(rowData) {
                        if (!!rowData && !!rowData.thoigian_cap_co) {
                            return gonrinApp().parseInputDateString(rowData.thoigian_cap_co).format('DD/MM/YYYY')
                        }
                        return '';
                    }
                },
                {
                    field: "donvi",
                    label: "Đơn vị",
                    template: function(rowData) {
                        if (!!rowData && !!rowData.donvi) {
                            let ten_coso = rowData.donvi.ten_coso;
                            if (!!ten_coso){
                                return ten_coso;
                            }
                        }
                        return "";
                    }
                },
                { field: "trangthai", label: "Trạng thái", width: 100, template : function(rowData){
                    if (!!rowData){
                        if  (rowData.trangthai == 2){
                            return '<div class="text-success">Chờ duyệt</div>';
                        }
                        else if (rowData.trangthai ==3){
                            return '<div class="text-primary">Đã duyệt</div>';
                        }
                    }
                    return "";
                } },
            ],
            onRowClick: function(event) {
                var self = this;
                if (event.rowId) {
                    if (!!self.viewData){
                        let viewData = self.viewData;
                        let f = viewData.tungay;
                        let d = viewData.denngay;
                        let so = viewData.so_co;
                        let t = viewData.trangthai;
                        let l = 2;
                        let dv = viewData.donvi_id;
                        let ten_donvi = viewData.ten_donvi;
                        if (!!f){
                            storejs.set('X-F', f);
                        }
                        if (!!d){
                            storejs.set('X-D', d);
                        }
                        if (!!so){
                            storejs.set('X-SO', so);
                        }
                        if (!!t){
                            storejs.set('X-T', t);
                        }
                        if  (!!l){
                            storejs.set('X-L', l);
                        }
                        if (!!dv){
                            storejs.set('X-DV', dv);
                        }
                        if (!!ten_donvi){
                            storejs.set('X-DVT', ten_donvi);
                        }
                    }
                    var path = 'viewco?id=' + event.rowId;
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
                pageSize: 20
            },
            onRendered: function(e) {
                gonrinApp().responsive_table();
            }
        },
        tools: [
        ],
        render: function() {
            var self = this;
            var viewData = self.viewData;
            self.uiControl.orderBy = [{ "field": "thoigian_cap_co", "direction": "desc" }];
            if (!!viewData){
                self.filterCollection(viewData);
            }
            // self.applyBindings();        
            return this;
        },
        filterCollection: function(data) {
            var self = this;
            let ngay_bat_dau = data.tungay;
            let ngay_ket_thuc = data.denngay;
            let donvi_id = data.donvi_id;
            let so_co = data.so_co;
            let trangthai = data.trangthai;
            let query_time = "";
            if (!!ngay_bat_dau && !!ngay_ket_thuc){
                query_time = {
                    "$and": [
                        { "thoigian_cap_co": { "$gte": ngay_bat_dau } },
                        { "thoigian_cap_co": { "$lte": (ngay_ket_thuc) } },
                    ]
                };
            }
            else if (!!ngay_bat_dau && !ngay_ket_thuc){
                query_time = {
                    "$and": [
                        { "thoigian_cap_co": { "$gte": ngay_bat_dau } }
                    ]
                };
            }
            else if (!ngay_bat_dau && !!ngay_ket_thuc){
                query_time = {
                    "$and": [
                        { "thoigian_cap_co": { "$lte": (ngay_ket_thuc) } },
                    ]
                };
            }
            var query = "";
            if (!!query_time && !!so_co && !donvi_id){
                query = {
                    "$and": [
                        query_time,
                        {"so_co": {"$eq": so_co}}
                    ]
                }
            }
            else if (!!query_time && !!so_co && !!donvi_id){
                query = {
                    "$and": [
                        query_time,
                        {"so_co": {"$eq": so_co}},
                        {"donvi_id": {"$eq": donvi_id}}
                    ]
                }
            }
            else if (!!query_time && !so_co && !!donvi_id){
                query = {
                    "$and": [
                        query_time,
                        {"donvi_id": {"$eq": donvi_id}}
                    ]
                }
            }
            else if (!!query_time && !so_co && !donvi_id){
                query = query_time
            }
            else if (!query_time && !!so_co && !donvi_id){
                query = {
                    "so_co": {"$eq": so_co}
                }
            }
            else if (!query_time && !so_co && !!donvi_id){
                query ={
                    "donvi_id": {"$eq": donvi_id}
                }
            }
            else if (!query_time && !!so_co && !!donvi_id){
                query = {
                    "$and": [
                        {"so_co": {"$eq": so_co}},
                        {"donvi_id": {"$eq": donvi_id}}
                    ]
                }
            }
            else{
            }
            if (query !== "") {
                if (!!trangthai && trangthai != "10"){
                    query = {
                        "$and":[
                            query,
                            {"trangthai": {"$eq":  Number(trangthai)}}
                        ]
                    }
                }
                self.uiControl.filters = query;
                self.applyBindings();   
            }
            else{
                if (!!trangthai && trangthai != "10"){
                    query = {"trangthai": {"$eq":  Number(trangthai)}}
                }      
                self.uiControl.filters = query;
                self.applyBindings();   
            }
        }
    });

});