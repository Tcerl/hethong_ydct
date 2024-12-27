const { fn } = require('jquery');

define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/bases/tpl/collection.html'),
        schema = require('json!schema/KhoSanPhamSchema.json');
    var CustomFilterView = require('app/bases/CustomFilterView');
    var QRCodeView = require('app/quanlykho/DanhSachVatTu/QrcodeDialog');


    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "kho_sanpham_hanghoa_filter",
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
                    width: 250,
                    template: function(rowData) {
                        var result = "";
                        if (!!rowData && !!rowData.sanpham) {
                            result = rowData.ten_sanpham + " - " + rowData.sanpham.ten_khoa_hoc;
                        } else {
                            result = rowData.ten_sanpham;
                        }
                        // result = result + `(<a target="_blank" href="/api/v1/access/history?donvi_id=` + rowData.donvi_id + `&so_lo=` + rowData.so_lo + `&id_sp=` + rowData.id_sanpham + `">Nguồn gốc</a>)`;
                        return result;
                    }
                },
                { field: "so_lo", label: "Số Lô", width: 100 },
                { field: "ten_kho", label: "Tên Kho", width: 200 },
                { field: "soluong", label: "Số Lượng Tồn", width: 200, template: function(rowData){
                    if (!!rowData && !!rowData.soluong){
                        return `<span class="text-center">${Number(rowData.soluong).toLocaleString("de-DE")}</span>`
                    }
                    return `<span class="text-center">0</span>`
                } },
                { field: "dongia_nhap", label: "Giá nhập", width: 150, template: function(rowData){
                    if (!!rowData && !!rowData.dongia_nhap){
                        return `<span class="text-center">${Number(rowData.dongia_nhap).toLocaleString("de-DE")}</span>`
                    }
                    return `<span class="text-center">0</span>`
                } },
                {
                    field: "hansudung",
                    label: "Hạn dùng",
                    width: 150,
                    template: function(rowData) {
                        if (!!rowData && !!rowData.hansudung) {
                            return gonrinApp().parseInputDateString(rowData.hansudung).format("DD/MM/YYYY");
                        }
                        return "";
                    }
                },
                {
                    field: "command",
                    label: " ",
                    width: 250,
                    command: [
                        {
                            label: "Nguồn gốc",
                            action: function (params, args) {
                                var self = this;
                                if (!!params && !!params.rowData){
                                    let url = (self.getApp().serviceURL || "") + `/api/v1/access/history?donvi_id=${params.rowData.donvi_id}&so_lo=${params.rowData.so_lo}&id_sp=${params.rowData.id_sanpham}`;
                                    window.open(url, '_blank');
                                }
                            },
                            class: function (e) {
                                return 'btn btn-sm btn-primary btn-view-nguongoc btn-small-cs btn-pr-cs';
                            },
                        },
                        {
                            label: "Xem mã QR",
                            action: function (params, args) {
                                var self = this;
                                let qrCode = new QRCodeView({viewData: {lichsu_id: params.rowData.lichsu_id, ten_sanpham: params.rowData.ten_sanpham}});
                                qrCode.dialog();
                            },
                            class: function (e) {
                                return `btn btn-sm btn-success btn-view-qr btn-small-cs`
                            }
                        },
                    ]
                }


            ],
            onRowClick: function(event) {
                event.stopPropagation();
                if (event.rowId) {
                    var path = 'kho_sanpham_hanghoa/model?id=' + event.rowId;
                    this.getApp().getRouter().navigate(path);
                }
            },
            language: {
                no_records_found: "Chưa có dữ liệu"
            },
            noResultsClass: "alert alert-default no-records-found",
            datatableClass: "table table-mobile",
            onRendered: function(e) {
                var self = this;
                // self.$el.find("a").bind("click", (e) =>{
                //     e.stopPropagation();
                // })
                gonrinApp().responsive_table();

            }
        },
        tools: [{
                name: "Nhap",
                type: "group",
                groupClass: "toolbar-group",
                buttons: [{
                    name: "create",
                    type: "button",
                    buttonClass: "btn-primary btn-sm width-sm",
                    label: `<i class="fa fa-plus"></i> Nhập kho`,
                    command: function() {
                        var self = this;
                        gonrinApp().getRouter().navigate('phieunhapkho/model');
                    }
                }, ]
            },
            {
                name: "Xuat",
                type: "group",
                groupClass: "toolbar-group",
                buttons: [{
                    name: "create",
                    type: "button",
                    buttonClass: "btn-success btn-sm width-sm ml-1",
                    label: `<i class="fa fa-plus"></i> Xuất kho`,
                    command: function() {
                        var self = this;
                        gonrinApp().getRouter().navigate('phieuxuatkho/model');
                    }
                }, ]
            },
            {
                name: "Xuat-Excel",
                type: "group",
                groupClass: "toolbar-group",
                buttons: [{
                    name: "create",
                    type: "button",
                    buttonClass: "btn-info btn-sm width-sm ml-1",
                    label: `<i class="fas fa-file-excel"></i> Xuất Excel`,
                    command: function() {
                        var self = this;
                        var donvi_id = "";
                        if (!!gonrinApp().currentUser){
                            donvi_id = gonrinApp().currentUser.donvi_id;
                        }
                        var data = JSON.stringify({
                            'donvi_id': donvi_id
                        });
                        self.getApp().showloading();
                        var url_login = self.getApp().serviceURL + '/api_export/v1/export_duoclieu_trongkho';
                        $.ajax({
                            url: url_login,
                            type: 'POST',
                            data: data,
                            headers: {
                                'content-type': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            },
                            dataType: 'json',
                            success: function(response) {
                                window.open(response, "_blank");
                            },
                            error: function(xhr, status, error) {
                                try {
                                    if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                        self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                        self.getApp().getRouter().navigate("login");
                                    } else {
                                        self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                    }
                                } catch (err) {
                                    self.getApp().notify({ message: "Có lỗi xảy ra, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
                                }
                            },
                            complete: function() {
                                self.getApp().hideloading();
                                return false;
                            }
                        });
                    }
                }, ]
            }
        ],
        render: function() {
            var self = this;
            self.$el.find("#title_page").html("Danh sách dược liệu");
            var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: self.collectionName + "_filter"
            });
            filter.render();
            self.$el.find("#grid_search input").val("");
            var filter_query = self.uiControl.filters;
            if (filter_query !== undefined && filter_query !== null && filter_query !== false) {
                self.query = filter_query;
            }
            filter.model.set("text", "");

            self.uiControl.orderBy = [{ "field": "ten_sanpham", "direction": "asc" }, { "field": "created_at", "direction": "desc" }];
            if (!filter.isEmptyFilter()) {
                var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
                var filters = { "ten_sanpham": { "$likeI": text } };
                var filter1;
                if (self.query !== null && self.query !== undefined) {
                    filter1 = {
                        "$and": [
                            filters, self.query
                        ]
                    };
                } else {
                    filter1 = filters;
                }
                self.uiControl.filters = filter1;
            }
            self.applyBindings();

            filter.on('filterChanged', function(evt) {
                var $col = self.getCollectionElement();
                var text = !!evt.data.text ? evt.data.text.trim() : "";
                if ($col) {
                    if (text !== null) {
                        var filters = { "ten_sanpham": { "$likeI": text } };
                        var filter1;
                        if (self.query !== null && self.query !== undefined) {
                            filter1 = {
                                "$and": [
                                    filters, self.query
                                ]
                            };
                        } else {
                            filter1 = filters;
                        }
                        $col.data('gonrin').filter(filter1);
                    }
                }
                self.applyBindings();
            });
            return this;
        }
    });

});