define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/quanlykho/PhieuXuat/tpl/collection.html'),
        schema = require('json!schema/PhieuXuatKhoSchema.json');
    var KhoSelectView = require('app/quanlykho/DanhMucKho/SelectView');

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "phieuxuatkho_filter",
        kho_id: null,
        uiControl: {
            fields: [
                { field: "stt", label: "STT", width: 10 },
                { field: "id", label: "Mã phiếu", width: 200 },
                {
                    field: "thoigian_xuat",
                    label: "Thời gian xuất",
                    width: 180,
                    template: function(rowData) {
                        if (!!rowData && !!rowData.thoigian_xuat) {
                            return gonrinApp().parseInputDateString(rowData.thoigian_xuat).format("DD/MM/YYYY");
                        }
                        return "";
                    }
                },
                { field: "ten_kho", label: "Kho Xuất Dược Liệu", width: 250 },
                { field: "ten_nguoi_lap_phieu", label: "Người lập phiếu", width: 250 },
                { field: "lydo_xuat", label: "Lý do xuất", width: 250 }
            ],
            onRowClick: function(event) {
                if (event.rowId) {
                    var path = 'phieuxuatkho/model?id=' + event.rowId;
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
                    gonrinApp().getRouter().navigate('phieuxuatkho/model');
                }
            }, ]
        }, ],
        render: function() {
            var self = this;

            self.$el.find(".btn-new").unbind("click").bind("click", (e)=>{
                gonrinApp().getRouter().navigate("phieuxuatkho/model");
            })

            self.kho_id = null;
            self.$el.find("#title_page").html("Danh sách Phiếu Xuất kho");
            self.$el.find("#kho").ref({
                textField: "ten_kho",
                valueField: "id",
                dataSource: KhoSelectView,
            });
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
            self.$el.find('#dengay').datetimepicker({
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
            self.uiControl.orderBy = [{ "field": "thoigian_xuat", "direction": "desc" }];
            self.applyBindings();
            self.selectizeKho();
            self.$el.find(".btn-search").unbind("click").bind("click", function() {
                self.filterCollection();
            });
            self.$el.find('.btn-clear').unbind("click").bind("click", function() {
                self.$el.find('#tungay').data('gonrin').setValue(null);
                self.$el.find('#dengay').data('gonrin').setValue(null);
                self.$el.find("#sophieu").val("");
                let select = (self.$el.find('#chonkho'))[0];
                if (!!select && !!select.selectize){
                    select.selectize.clear();
                    self.kho_id =null;
                }
                self.filterCollection();
            });
            return this;
        },
        filterCollection1: function() {
            var self = this;
            var tu_ngay = self.$el.find('#tungay').data('gonrin').getValue(),
                den_ngay = self.$el.find('#dengay').data('gonrin').getValue(),
                kho_id = self.$el.find('#kho').data('gonrin').getValue(),
                sophieu = self.$el.find("#sophieu").val(),
                so_hoadon = self.$el.find("#sohoadon").val();
            var query_time = "";
            if (tu_ngay !== null && tu_ngay !== undefined && den_ngay !== null && den_ngay !== undefined) {
                query_time = {
                    "$and": [
                        { "thoigian_xuat": { "$gte": tu_ngay } },
                        { "thoigian_xuat": { "$lte": (den_ngay + 86399) } },
                    ]
                };
            } else if (tu_ngay !== null && tu_ngay !== undefined) {
                query_time = {
                    "$and": [
                        { "thoigian_xuat": { "$gte": tu_ngay } }
                    ]
                };
            } else if (den_ngay !== null && den_ngay !== undefined) {
                query_time = {
                    "$and": [
                        { "thoigian_xuat": { "$lte": (den_ngay + 86399) } },
                    ]
                };
            }

            var query = "";
            if (kho_id !== null && kho_id !== undefined && query_time !== "") {
                query = {
                    "$and": [
                        { "ma_kho": { "$eq": kho_id } },
                        query_time,
                        { "so_phieu_chungtu": { "$likeI": sophieu } },
                        { "so_hoa_don": { "$likeI": so_hoadon } },
                    ]
                }
            } else if (kho_id !== null && kho_id !== undefined && query_time == "") {
                query = {
                    "$and": [
                        { "ma_kho": { "$eq": kho_id } },
                        { "so_phieu_chungtu": { "$likeI": sophieu } },
                        { "so_hoa_don": { "$likeI": so_hoadon } },
                    ]
                }
            } else if (query_time !== "") {
                query = {
                    "$and": [
                        query_time,
                        { "so_phieu_chungtu": { "$likeI": sophieu } },
                        { "so_hoa_don": { "$likeI": so_hoadon } },
                    ]
                }
            } else {
                query = {
                    "$and": [
                        { "so_phieu_chungtu": { "$likeI": sophieu } },
                        { "so_hoa_don": { "$likeI": so_hoadon } },
                    ]
                }
            }
            if (query !== "") {
                var $col = self.getCollectionElement();
                $col.data('gonrin').filter(query);
            }
        },
        filterCollection: function() {
            var self = this;
            var tu_ngay = self.$el.find('#tungay').data('gonrin').getValue(),
                den_ngay = self.$el.find('#dengay').data('gonrin').getValue(),
                kho_id = self.kho_id,
                sophieu = self.$el.find("#sophieu").val();
                var tmp = gonrinApp().parseInputDateString(den_ngay);             
                den_ngay = self.parse_date_custom((moment(tmp).set({hour:23,minute:59,second:59})));       
            var query_time = "";
            if (!!tu_ngay && !!den_ngay) {
                query_time = {
                    "$and": [
                        { "thoigian_xuat": { "$gte": tu_ngay } },
                        { "thoigian_xuat": { "$lte": (den_ngay) } },
                    ]
                };
            } else if (!!tu_ngay) {
                query_time = {
                    "$and": [
                        { "thoigian_xuat": { "$gte": tu_ngay } }
                    ]
                };
            } else if (!!den_ngay) {
                query_time = {
                    "$and": [
                        { "thoigian_xuat": { "$lte": (den_ngay) } },
                    ]
                };
            }

            var query = "";
            if (!!kho_id && query_time !== "") {
                if (!!sophieu){
                    query = {
                        "$and": [
                            { "ma_kho": { "$eq": kho_id } },
                            query_time,
                            {"id" : {"$eq": sophieu}}
                        ]
                    }
                }
                else{
                    query = {
                        "$and": [
                            { "ma_kho": { "$eq": kho_id } },
                            query_time
                        ]
                    }
                }
            } else if (!!kho_id && !query_time) {
                if (!!sophieu){
                    query = {
                        "$and": [
                            { "ma_kho": { "$eq": kho_id } },
                            {"id" : {"$eq": sophieu}}
    
                        ]
                    }
                }
                else{
                    query = {
                        "$and": [
                            { "ma_kho": { "$eq": kho_id } }
                        ]
                    }
                }
 
            } else if (!kho_id && query_time) {
                if (!!sophieu){
                    query = {
                        "$and": [
                            query_time,
                            {"id" : {"$eq": sophieu}}
                        ]
                    }
                }
                else{
                    query = {
                        "$and": [
                            query_time
                        ]
                    }
                }

            } else {
                if (!!sophieu){
                    query = {
                        "$and": [{ "id": { "$eq": sophieu } }
                        ]
                    }
                }
                else {
                    query = {
                        "$or": [
                            { "id": { "$likeI": sophieu } }
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
        selectizeKho: function () {
			var self = this;
			var currentUser = self.getApp().currentUser;
			var donvi_id = "";
			if (!!currentUser && !!currentUser.donvi) {
				donvi_id = currentUser.donvi.id;
			}
			var $selectize0 = self.$el.find('#chonkho').selectize({
				maxItems: 1,
				valueField: 'id',
				labelField: 'ten_kho',
				searchField: ['ten_kho'],
				preload: true,
				load: function (query, callback) {
					var query_filter = {
						"filters": {
							"$and": [{
								"$or": [
									{ "ten_kho": { "$likeI": (query) } },
								]
							},
							{ "donvi_id": { "$eq": donvi_id } }
							]
						},
						"order_by": [{ "field": "loai_uu_tien", "direction": "asc" }]
					};
					var url = (self.getApp().serviceURL || "") + '/api/v1/danhmuc_kho?page=1&results_per_page=20' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
					$.ajax({
						url: url,
						type: 'GET',
						dataType: 'json',
						error: function () {
							callback();
						},
						success: function (res) {
							callback(res.objects);
						}
					});
				},
				onChange: function (value) {
					var obj = $selectize0[0].selectize.options[value];
					if (obj !== null && obj !== undefined) {
                        self.kho_id = value;
                    } 
                    else {
                        self.kho_id = null;
					}
				}
			});
		},
    });

});