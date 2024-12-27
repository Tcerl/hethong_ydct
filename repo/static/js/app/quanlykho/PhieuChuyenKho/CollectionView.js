define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/quanlykho/PhieuChuyenKho/tpl/collection.html'),
        schema = require('json!schema/PhieuChuyenKhoSchema.json');
    var CustomFilterView = require('app/bases/CustomFilterView');

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "phieuchuyenkho",
        uiControl: {
            fields: [
                { field: "stt", label: "STT", width: 10 },
                {
                    field: "thoigian_chuyenkho",
                    label: "Ngày chuyển kho",
                    width: 180,
                    template: function(rowData) {
                        if (rowData !== undefined) {
                            if (rowData.thoigian_chuyenkho !== null && rowData.thoigian_chuyenkho !== undefined) {
                                return gonrinApp().timestampFormat(rowData.thoigian_chuyenkho * 1000, "DD/MM/YYYY");
                            }
                        }
                        return "";
                    }
                },
                {
                    field: "ten_kho_thu_nhat",
                    label: "Kho chuyển",
                    width: 200,
                    template: function(rowData) {
                        if (rowData !== undefined) {
                            if (rowData.ten_kho_thu_nhat != null) {
                                return rowData.ten_kho_thu_nhat;
                            }
                        }
                        return "";
                    }
                },
                {
                    field: "ten_kho_thu_hai",
                    label: "Kho nhận",
                    width: 200,
                    template: function(rowData) {
                        if (rowData !== undefined) {
                            if (rowData.ten_kho_thu_hai != null) {
                                return rowData.ten_kho_thu_hai;
                            }
                        }
                        return "";
                    }
                },
                { field: "ten_nguoi_lap_phieu", label: "Người lập phiếu", width: 250 },
                {
                    field: "updated_at",
                    label: "Thời gian lưu phiếu",
                    width: 180,
                    template: function(rowData) {
                        if (rowData !== undefined) {
                            if (rowData.updated_at !== null && rowData.updated_at !== undefined) {
                                return gonrinApp().timestampFormat(rowData.updated_at * 1000, "DD/MM/YYYY hh:mm");
                            }
                        }
                        return "";
                    }
                },
            ],
            onRowClick: function(event) {
                if (event.rowId) {
                    var path = this.collectionName + '/model?id=' + event.rowId;
                    this.getApp().getRouter().navigate(path);
                }
            },
            language: {
                no_records_found: "Chưa có dữ liệu"
            },
            noResultsClass: "alert alert-default no-records-found",
            datatableClass: "table table-mobile",
            onRendered: function(e) {
                gonrinApp().responsive_table();
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
                label: "Tạo phiếu mới",
                command: function() {
                    var self = this;
                    gonrinApp().getRouter().navigate(this.collectionName + '/model');
                }
            }, ]
        }, ],
        render: function() {
            var self = this;
            var tungay = self.$el.find('.tungay').datetimepicker({
                textFormat: 'DD/MM/YYYY',
                extraFormats: ['DDMMYYYY'],
                parseInputDate: function(val) {
                    return moment.unix(val)
                },
                parseOutputDate: function(date) {
                    return date.unix()
                },
                disabledComponentButton: true
            });
            var denngay = self.$el.find('.denngay').datetimepicker({
                textFormat: 'DD/MM/YYYY',
                extraFormats: ['DDMMYYYY'],
                parseInputDate: function(val) {
                    return moment.unix(val)
                },
                parseOutputDate: function(date) {
                    return date.unix()
                },
                disabledComponentButton: true
            });

            self.$el.find(".btn-search").unbind("click").bind("click", function() {
                var ngay_bat_dau = tungay.data("gonrin").getValue();
                var ngay_ket_thuc = denngay.data("gonrin").getValue();
                if (ngay_bat_dau === null && ngay_ket_thuc === null) {
                    self.getApp().notify({ message: "Vui lòng chọn thời gian tìm kiếm." }, { type: "danger", delay: 3000 });
                    return false;
                } else {
                    if (ngay_bat_dau !== null && ngay_ket_thuc == null) {
                        var filters = {
                            "thoigian_chuyenkho": { "$ge": ngay_bat_dau }
                        }
                        self.uiControl.filters = filters;
                        var $col = self.getCollectionElement();
                        $col.data('gonrin').filter(filters);
                    } else if (ngay_bat_dau === null && ngay_ket_thuc !== null) {
                        var filters = {
                            "thoigian_chuyenkho": { "$le": (ngay_ket_thuc + 86399) }
                        }
                        self.uiControl.filters = filters;
                        var $col = self.getCollectionElement();
                        $col.data('gonrin').filter(filters);
                    } else {
                        if (ngay_ket_thuc < ngay_bat_dau) {
                            self.getApp().notify({ message: "Vui lòng chọn ngày kết thúc lớn hơn hoặc bằng ngày bắt đầu." }, { type: "danger", delay: 1000 });
                            return false;
                        } else {
                            var filters = {
                                "$and": [
                                    { "thoigian_chuyenkho": { "$ge": ngay_bat_dau } },
                                    { "thoigian_chuyenkho": { "$le": (ngay_ket_thuc + 86399) } }
                                ]
                            }
                            self.uiControl.filters = filters;
                            var $col = self.getCollectionElement();
                            $col.data('gonrin').filter(filters);
                        }
                    }
                }
            });
            self.applyBindings();
            return this;
        }

    });

});