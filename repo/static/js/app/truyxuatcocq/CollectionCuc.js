define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/truyxuatcocq/tpl/collection.html'),
        schema = require('json!schema/GiayPhepNhapKhauSchema.json');

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "truyxuat",
        uiControl: {
            fields: [
                {
                    field: "ten_sanpham",
                    label: " ",
                    template: function(rowData) {
                        if (!!rowData){
                            let text_duoclieu = "";
                            let text_donvi = "";
                            if (rowData.loai_sanpham_bandau === 1){
                                text_duoclieu = "Dược liệu nhập khẩu";
                                text_donvi = "nhập khẩu";
                            }
                            else if (rowData.loai_sanpham_bandau ===2){
                                text_duoclieu = "Dược liệu phân phối trong nước";
                                text_donvi = "phân phối";
                            }
                            else if (rowData.loai_sanpham_bandau ===3){
                                text_duoclieu = "Dược liệu thu gom trong nước";
                                text_donvi = "thu gom";
                            }
                            else if (rowData.loai_sanpham_bandau ===4){
                                text_duoclieu = "Dược liệu nuôi trồng, thu hái";
                                text_donvi = "nuôi trồng";
                            }
                            else if (rowData.loai_sanpham_bandau ===5){
                                text_duoclieu = "Dược liệu khai thác tự nhiên";
                                text_donvi = "khai thác";
                            }
                            return `
                            <div class="card">
                                <div class="card-body row">
                                        <div class="col-12 col-md-8">
                                            <lable>Tên dược liệu: <span class="text-primary">${rowData.ten_sanpham? rowData.ten_sanpham: ""}</span></lable>
                                            <br>
                                            <lable>Tên đơn vị: <span class="text-primary">${rowData.ten_coso?rowData.ten_coso: ""}</span></lable>
                                            <br>
                                            <lable class="d-inline">Mã dược liệu: <span class="text-primary">${rowData.ma_sanpham?rowData.ma_sanpham: ""}</span></lable>
                                            <br>
                                            <lable class="d-inline">Tên khoa học: <span class="text-primary">${rowData.ten_khoa_hoc?rowData.ten_khoa_hoc: ""}</span></lable>
                                            <br>
                                            <lable class="d-inline">Loại dược liệu: <span class="text-primary">${text_duoclieu?text_duoclieu: ""}</span></lable>
                                            <br>
                                            <lable class="d-inline">Đơn vị ${text_donvi}: <span class="text-primary">${rowData.donvi_nhapkhau_phanphoi_thugom?rowData.donvi_nhapkhau_phanphoi_thugom: ""}</span></lable>
                                            <br>
                                            <lable class="d-inline">Số lô: <span class="text-primary">${rowData.so_lo?rowData.so_lo: ""}</span></lable>
                                            <br>
                                            <lable class="d-inline">Số chứng nhận nguồn gốc CO: <span class="text-primary">${rowData.so_co?rowData.so_co: ""}</span></lable>
                                            <br>
                                            <lable class="d-inline">Mã số kiểm nghiệm: <span class="text-primary">${rowData.ma_kiem_nghiem?rowData.ma_kiem_nghiem: ""}</span></lable>
                                        </div>
                                        <div class="col-12 col-md-4 text-center">
                                            <lable class="font-weight-bold">Mã QR truy xuất dược liệu</lable>
                                            <br>
                                            <div class="text-center qrcode mt-1" id="${rowData.id}" lichsu="${rowData.lichsu_id}"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            `
                        }
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
                self.$el.find(`tr`).unbind("click");
                let arr = self.$el.find("div.qrcode");
                let length = arr.length;
                for (let i=0; i<length;i++){
                    let item = arr[i];
                    let url = self.getApp().serviceURL + "/api/v1/scanqrcode";
                    let id = $(item).attr("id");
                    let lichsu_id = $(item).attr("lichsu");
                    var qrcode = new QRCode(document.getElementById(`${id}`), {
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
                            template: '<div class="row text-center" style="padding: 50px 0px;"> <lable class="col-12 font-weight-bold mb-2">Mã QR truy xuất dược liệu</lable> <img style="margin-left:auto;margin-right:auto" src="' + image_src + '"></img></div>',
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
            let text_search = data.text_search;
            let arrKey = data.arrKey;
            var query = "";
            query = {
                "$and": [
                    {"text_search": text_search},
                    {"arrKey": arrKey}
                ]
            }

            if (query !== "") {
                self.uiControl.filters = query;
                self.applyBindings();   
            }
        },
    });

});