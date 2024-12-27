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
        collectionName: "giayphep_nhapkhau_collection_filter",
        uiControl: {
            fields: [
                {
                    field: "stt",
                    label: "STT",
                    width: 10
                },
                { field: "so_giay_phep", label: "Số giấy phép", width: 180 },
                {
                    field: "thoigian_capphep",
                    label: "Ngày cấp phép",
                    width: 180,
                    template: function(rowData) {
                        if (!!rowData && !!rowData.thoigian_capphep) {
                            return gonrinApp().parseInputDateString(rowData.thoigian_capphep).format("DD/MM/YYYY");
                        }
                        return "";
                    }
                },
                {
                    field: "thoigian_hieuluc_batdau",
                    label: "Ngày bắt đầu hiệu lực",
                    template: function(rowData) {
                        if (!!rowData && !!rowData.thoigian_hieuluc_batdau) {
                            return gonrinApp().parseInputDateString(rowData.thoigian_hieuluc_batdau).format("DD/MM/YYYY");
                        }
                        return "";
                    }
                },
                {
                    field: "thoigian_hieuluc_ketthuc",
                    label: "Ngày kết thúc",
                    template: function(rowData) {
                        if (!!rowData && !!rowData.thoigian_hieuluc_ketthuc) {
                            return gonrinApp().parseInputDateString(rowData.thoigian_hieuluc_ketthuc).format("DD/MM/YYYY");
                        }
                        return "";
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
                        let s = viewData.so_giay_phep;
                        let t = viewData.trangthai;
                        let l = 1;
                        let dv = viewData.donvi_id;
                        let ten_donvi = viewData.ten_donvi;
                        if (!!f){
                            storejs.set('X-F', f);
                        }
                        if (!!d){
                            storejs.set('X-D', d);
                        }
                        if (!!s){
                            storejs.set('X-S', s);
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
                    var path = 'viewnhapkhau?id=' + event.rowId;
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
            self.uiControl.orderBy = [{ "field": "thoigian_capphep", "direction": "desc" }];
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
            let so_giay_phep = data.so_giay_phep;
            let trangthai = data.trangthai;
            let query_time = "";
            if (!!ngay_bat_dau && !!ngay_ket_thuc){
                query_time = {
                    "$and": [
                        { "thoigian_capphep": { "$gte": ngay_bat_dau } },
                        { "thoigian_capphep": { "$lte": (ngay_ket_thuc) } },
                    ]
                };
            }
            else if (!!ngay_bat_dau && !ngay_ket_thuc){
                query_time = {
                    "$and": [
                        { "thoigian_capphep": { "$gte": ngay_bat_dau } }
                    ]
                };
            }
            else if (!ngay_bat_dau && !!ngay_ket_thuc){
                query_time = {
                    "$and": [
                        { "thoigian_capphep": { "$lte": (ngay_ket_thuc) } },
                    ]
                };
            }
            var query = "";
            if (!!query_time && !!so_giay_phep && !donvi_id){
                query = {
                    "$and": [
                        query_time,
                        {"so_giay_phep": {"$eq": so_giay_phep}}
                    ]
                }
            }
            else if (!!query_time && !!so_giay_phep && !!donvi_id){
                query = {
                    "$and": [
                        query_time,
                        {"so_giay_phep": {"$eq": so_giay_phep}},
                        {"donvi_id": {"$eq": donvi_id}}
                    ]
                }
            }
            else if (!!query_time && !so_giay_phep && !!donvi_id){
                query = {
                    "$and": [
                        query_time,
                        {"donvi_id": {"$eq": donvi_id}}
                    ]
                }
            }
            else if (!!query_time && !so_giay_phep && !donvi_id){
                query = query_time
            }
            else if (!query_time && !!so_giay_phep && !donvi_id){
                query = {
                    "so_giay_phep": {"$eq": so_giay_phep}
                }
            }
            else if (!query_time && !so_giay_phep && !!donvi_id){
                query ={
                    "donvi_id": {"$eq": donvi_id}
                }
            }
            else if (!query_time && !!so_giay_phep && !!donvi_id){
                query = {
                    "$and": [
                        {"so_giay_phep": {"$eq": so_giay_phep}},
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