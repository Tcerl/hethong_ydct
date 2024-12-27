define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/quanlykho/PhieuNhap/tpl/collection.html'),
        schema = require('json!schema/PhieuNhapKhoSchema.json');
    var PhieuXuatModel = require('app/quanlykho/PhieuNhap/ModelPhieuXuat');

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "phieunhapkho_collection",
        donvi_id: null,
        uiControl: {
            fields: [
                { field: "stt", label: "STT", width: 10 },
                { field: "id", label: "Mã phiếu", width: 200 },
                { field: "ten_donvi_cungung", label: "Đơn vị cung ứng", width: 250 },
                { field: "nguon_cungcap", label: "Nguồn cung cấp", width: 250, template: function(rowData){
                    if (!!rowData){
                        if (rowData.nguon_cungcap == 1){
                            return 'Nhập khẩu';
                        }
                        else if (rowData.nguon_cungcap == 2){
                            return 'Mua từ đơn vị cung ứng trong nước';
                        }
                        else if (rowData.nguon_cungcap ==3){
                            return 'Thu gom';
                        }
                        else if (rowData.nguon_cungcap ==4){
                            return 'Thu hái, nuôi trồng';
                        }
                        else if (rowData.nguon_cungcap ==5){
                            return 'Khai thác tự nhiên';
                        }
                    }
                } },
                {
                    field: "thoigian_nhap",
                    label: "Thời gian nhập kho",
                    width: 180,
                    template: function(rowData) {
                        if (!!rowData && !!rowData.thoigian_nhap) {
                            return gonrinApp().parseInputDateString(rowData.thoigian_nhap).format("DD/MM/YYYY");
                        }
                        return "";
                    }
                },
                { field: "ten_kho", label: "Tên Kho", width: 250 }


            ],
            onRowClick: function(event) {
                if (event.rowId) {
                    var path = 'phieunhapkho/model?id=' + event.rowId;
                    this.getApp().getRouter().navigate(path);
                }
                return
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
                    gonrinApp().getRouter().navigate('phieunhapkho/model');
                }
            }, ]
        }, ],
        render: function() {
            var self = this;
            self.donvi_id = null;

            self.$el.find(".btn-new").unbind("click").bind("click", ()=>{
                gonrinApp().getRouter().navigate('phieunhapkho/model');
            })

            self.$el.find(".btn-new-px").unbind("click").bind("click", ()=>{
                let phieuXuat = new PhieuXuatModel();
                phieuXuat.dialog();
            })

            self.$el.find('#tungay').datetimepicker({
                format: "DD/MM/YYYY",
                textFormat: "DD/MM/YYYY",
                extraFormats: ["DDMMYYYY"],
                parseInputDate: function(val) {
                    return gonrinApp().parseInputDateString(val);
                },
                parseOutputDate: function(date) {
                    return gonrinApp().parseOutputDateString(date);
                },
                disabledComponentButton: true
            });
            self.$el.find('#denngay').datetimepicker({
                format: "DD/MM/YYYY",
                textFormat: "DD/MM/YYYY",
                extraFormats: ["DDMMYYYY"],
                parseInputDate: function(val) {
                    return gonrinApp().parseInputDateString(val);
                },
                parseOutputDate: function(date) {
                    return gonrinApp().parseOutputDateString(date);
                },
                disabledComponentButton: true
            });
            self.uiControl.orderBy = [{ "field": "thoigian_nhap", "direction": "desc" }];
            self.$el.find(".btn-search").unbind("click").bind("click", function() {
                self.filterCollection();
            });
            self.$el.find('.btn-clear').unbind("click").bind("click", function() {
                self.$el.find('#tungay').data('gonrin').setValue(null);
                self.$el.find('#denngay').data('gonrin').setValue(null);
                self.$el.find("#sophieu").val("");
                self.$el.find("#sohoadon").val("");
                let select = (self.$el.find('#donvi_cungung'))[0];
                if (!!select && !!select.selectize){
                    select.selectize.clear();
                    self.donvi_id =null;
                }
                self.filterCollection();
            });
            self.applyBindings();
            self.selectDonvi();
            return this;
        },
        filterCollection: function() {
            var self = this;
            var tu_ngay = self.$el.find('#tungay').data('gonrin').getValue(),
                den_ngay = self.$el.find('#denngay').data('gonrin').getValue(),
                donvi_cungung_id = self.donvi_id,
                sophieu = self.$el.find("#sophieu").val(),
                so_hoadon = self.$el.find("#sohoadon").val();
                var tmp = gonrinApp().parseInputDateString(den_ngay);
                var den_ngay = self.parse_date_custom((moment(tmp).set({hour:23,minute:59,second:59})));
            var query_time = "";
            if (tu_ngay !== null && tu_ngay !== undefined && den_ngay !== null && den_ngay !== undefined && tu_ngay !== "" && den_ngay !=="") {
                query_time = {
                    "$and": [
                        { "thoigian_nhap": { "$gte": tu_ngay } },
                        { "thoigian_nhap": { "$lte": (den_ngay) } },
                    ]
                };
            } else if (tu_ngay !== null && tu_ngay !== undefined && tu_ngay !== "") {
                query_time = {
                    "$and": [
                        { "thoigian_nhap": { "$gte": tu_ngay } }
                    ]
                };
            } else if (den_ngay !== null && den_ngay !== undefined && den_ngay !== "") {
                query_time = {
                    "$and": [
                        { "thoigian_nhap": { "$lte": (den_ngay) } },
                    ]
                };
            }

            var query = "";
            if (donvi_cungung_id !== null && donvi_cungung_id !== undefined && donvi_cungung_id !== "" && query_time !== "") {
                query = {
                    "$and": [
                        { "ma_donvi_cungung": { "$eq": donvi_cungung_id } },
                        query_time,
                        {
                            "$or": [{ "so_phieu_chungtu": { "$likeI": sophieu } },
                                { "so_hoa_don": { "$likeI": so_hoadon } },
                            ]
                        }
                    ]
                }
            } else if (donvi_cungung_id !== null && donvi_cungung_id !== undefined && donvi_cungung_id !== "" && query_time == "") {
                query = {
                    "$and": [
                        { "ma_donvi_cungung": { "$eq": donvi_cungung_id } },
                        {
                            "$or": [
                                { "so_phieu_chungtu": { "$likeI": sophieu } },
                                { "so_hoa_don": { "$likeI": so_hoadon } },
                            ]
                        }
                    ]
                }
            } else if (query_time !== "") {
                query = {
                    "$and": [
                        query_time,
                        {
                            "$or": [{ "so_phieu_chungtu": { "$likeI": sophieu } },
                                { "so_hoa_don": { "$likeI": so_hoadon } },
                            ]
                        }
                    ]
                }
            } else {
                if (so_hoadon !== "" && so_hoadon !== null && so_hoadon !== undefined && sophieu !== "" && sophieu !== undefined && sophieu !== null){
                    query = {
                        "$or": [{ "so_phieu_chungtu": { "$likeI": sophieu } },
                            { "so_hoa_don": { "$likeI": so_hoadon } },
                        ]
                    }
                }
                else if (so_hoadon !== undefined && so_hoadon !== null && so_hoadon === "" && sophieu !== "" && sophieu !== undefined && sophieu !== null ){
                    query = {
                        "$and": [
                            { "so_phieu_chungtu": { "$likeI": sophieu } }
                        ]
                    }
                }
                else if (so_hoadon === "" && sophieu === ""){
                    query = {
                        "$or": [{ "so_phieu_chungtu": { "$likeI": sophieu } },
                            { "so_hoa_don": { "$likeI": so_hoadon } },
                        ]
                    }
                }
                else {
                    query = {
                        "$and": [
                            { "so_hoa_don": { "$likeI": so_hoadon } }
                        ]
                    }
                }
            }
            if (query !== "") {
                var $col = self.getCollectionElement();
                $col.data('gonrin').filter(query);
            }
        },
        parse_date_custom : function(firstDay){
            var tmp = "";
            var firstDay = new Date(firstDay);
            if (isNaN(firstDay) == true){
                return "";
            }
			tmp = tmp + firstDay.getUTCFullYear();
			if (firstDay.getUTCMonth() < 9){
				tmp = tmp + "0" + (firstDay.getUTCMonth() +1)
			}else{
				tmp = tmp + (firstDay.getUTCMonth() +1)
			}
			if (firstDay.getUTCDate() <= 9){
				tmp = tmp + "0" + firstDay.getUTCDate();
			}
			else{
				tmp = tmp + firstDay.getUTCDate();
			}
			if (firstDay.getUTCHours() <=9){
				tmp = tmp + "0" + firstDay.getUTCHours();
			}
			else{
				tmp = tmp + firstDay.getUTCHours();
			}
			if (firstDay.getUTCMinutes() <=9){
				tmp = tmp + "0" + firstDay.getUTCMinutes();
			}
			else{
				tmp = tmp + firstDay.getUTCMinutes();
			}
			if (firstDay.getUTCSeconds() <=9){
				tmp = tmp + "0" + firstDay.getUTCSeconds();
			}
			else{
				tmp = tmp + firstDay.getUTCSeconds();
			}
			return tmp;
        },
        selectDonvi : function(){
            var self = this;
            var $selectize = self.$el.find('#donvi_cungung').selectize({
                valueField: 'id',
                labelField: 'ten_coso',
				searchField: ['ten_coso', 'tenkhongdau'],
				preload: true,
				maxOptions : 10,
				maxItems : 1,
                load: function(query, callback) {
                    var query_filter = {"filters": {"$and": [
                        {
                            "$or": [
                                { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                { "ten_coso": { "$likeI": (query) } },
                            ]
                        },
                        {"$or": [
                            { "loai_donvi": { "$eq": 2} },
                            { "loai_donvi": { "$eq": 4} },
                            { "loai_donvi": { "$eq": 5} },
                            { "loai_donvi": { "$eq": 5} },
                            { "loai_donvi": { "$eq": 6} },
                            { "loai_donvi": { "$eq": 7} },
                            { "loai_donvi": { "$eq": 8} },
                            { "loai_donvi": { "$eq": 9} }
                        ]},
                        ]}};
					var url = (self.getApp().serviceURL || "") + '/api/v1/donvi_filter?' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                        }
                    });
                },
                onChange: function(value, isOnInitialize) {
					var $selectz = (self.$el.find('#donvi_cungung'))[0];
					var obj = $selectz.selectize.options[value];
					if (obj !== undefined && obj !== null){
                        self.donvi_id = value;
					}
					else{
                        self.donvi_id = null;
					}
                }



            });
        },
    });

});