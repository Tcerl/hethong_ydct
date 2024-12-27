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
        collectionName: "get_tonkho_filter",
        uiControl: {
            fields: [
                {
                    field: "stt",
                    label: "STT",
                    width: 10
                },
                {
                    field: "ten_sanpham",
                    label: "Tên Dược Liệu",
                    width: 200,
                    template: function(rowData) {
                        var result = "";
                        if (!!rowData && !!rowData.sanpham && !!rowData.sanpham.sanpham) {
                            result = rowData.ten_sanpham + " - " + rowData.sanpham.sanpham.ten_khoa_hoc;
                        }
                        else if (!!rowData && !!rowData.sanpham){
                            result = rowData.ten_sanpham + " - " + rowData.sanpham.ten_khoa_hoc;
                        }
                        else {
                            result = rowData.ten_sanpham;
                        }
                        return result;
                    }
                },
                { field: "so_lo", label: "Số Lô", width:65  },
                { field: "ten_kho", label: "Tên Kho", width: 200 },
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
                {
                    field: "lichsu_id", label: "<span class='text-center'>Mã QR</span>", width: 300,template: function(rowData){
                        if (!!rowData && !!rowData.lichsu_id){
                            // return `<a class="text-center qrcode" id="${rowData.id}"><i class="fa fa-eye" aria-hidden="true"></i></a>`;
                            return `<div class="text-center qrcode" id="${rowData.lichsu_id}"></div>`;
                        }
                        return "";
                    }
                }
            ],
            onRowClick: function(event) {

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
                var self = this;
                let arr = self.$el.find("div.qrcode");
                let length = arr.length;
                for (let i=0; i<length;i++){
                    let item = arr[i];
                    let url = self.getApp().serviceURL + "/api/v1/scanqrcode";
                    let lichsu_id = $(item).attr("id");
                    var qrcode = new QRCode(document.getElementById(`${lichsu_id}`), {
                        width: 80,
                        height: 80,
                        colorDark: "#000000",
                        colorLight: "#ffffff",
                        text: url + "?id=" + lichsu_id,
                        logoBackgroundColor: '#ffffff',
                        logoBackgroundTransparent: false,
                        quietZone: 5
                    });
                    self.$el.find(`#${lichsu_id}`).unbind('click').bind('click', function(e) {
                        e.stopPropagation();
                        var image_src = self.$el.find(`#${lichsu_id} img`).attr("src");
                        var DialogImagePost = Gonrin.DialogView.extend({
                            template: '<div class="row text-center"  style="padding: 50px 0px;"><img style="margin-left:auto;margin-right:auto" src="' + image_src + '"></img></div>',
                            render: function() {
                                var self = this;
                                self.applyBindings();
                            },
                        });
                        var view = new DialogImagePost();
                        view.dialog();
                    });
                }
                gonrinApp().responsive_table();
            }
        },
        tools: [
        ],
        render: function() {
            var self = this;
            var viewData = self.viewData;
            if (!!viewData){
                self.filterCollection(viewData);
            }   
            return this;
        },
        filterCollection: function(data) {
            var self = this;
            let donvi_id = data.donvi_id;
            let so_lo = data.so_lo;
            let id_sanpham = data.id_sanpham;
            let ma_phieu = data.ma_phieu;
            var query = "";

            if (!!id_sanpham && !donvi_id && !so_lo && !ma_phieu){
                query = {
                    "$and": [
                        {"id_sanpham" : {"$eq":  id_sanpham}}
                    ]
                }
            }
            else if (!!id_sanpham && !donvi_id && !so_lo && !!ma_phieu){
                query = {
                    "$and": [
                        {"id_sanpham": {"$eq": id_sanpham}},
                        {"ma_phieu": {"$eq":  ma_phieu}}
                    ]
                }
            }
            else if (!!id_sanpham && !donvi_id && !!so_lo && !ma_phieu){
                query = {
                    "$and": [
                        {'id_sanpham': {"$eq": id_sanpham}},
                        {"so_lo": {"$eq": so_lo}}
                    ]
                }
            }
            else if (!!id_sanpham && !donvi_id && !!so_lo && !!ma_phieu){
                query = {
                    "$and": [
                        {"id_sanpham" : {"$eq":  id_sanpham}},
                        {"ma_phieu": {"$eq":  ma_phieu}},
                        {"so_lo": {"$eq": so_lo}}
                    ]
                }
            }
            else if (!!id_sanpham && !!donvi_id && !so_lo && !ma_phieu){
                query = {
                    "$and": [
                        {"id_sanpham": {"$eq": id_sanpham}},
                        {"donvi_id" : {"$eq":  donvi_id}}
                    ]
                }
            }
            else if (!!id_sanpham && !!donvi_id && !so_lo && !!ma_phieu){
                query = {
                    "$and": [
                        {"id_sanpham" : {"$eq":  id_sanpham}},
                        {"donvi_id": {"$eq":  donvi_id}},
                        {"ma_phieu": {"$eq": ma_phieu}}
                    ]
                }
            }
            else if (!!id_sanpham && !!donvi_id && !!so_lo && !ma_phieu){
                query = {
                    "$and": [
                        {"id_sanpham" : {"$eq":  id_sanpham}},
                        {"donvi_id": {"$eq":  donvi_id}},
                        {"so_lo": {"$eq": so_lo}}
                    ]
                }
            }
            else if (!!id_sanpham && !!donvi_id && !!so_lo && !!ma_phieu){
                query = {
                    "$and": [
                        {"id_sanpham" : {"$eq":  id_sanpham}},
                        {"donvi_id": {"$eq":  donvi_id}},
                        {"so_lo": {"$eq": so_lo}},
                        {"ma_phieu": {"$eq": ma_phieu}}
                    ]
                }
            }

            if (query !== "") {
                self.uiControl.filters = query;
                self.applyBindings();   
            }
        },
    });

});