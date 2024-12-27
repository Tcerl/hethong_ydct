define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/quanlykho/PhieuKiemKe/tpl/collection.html');
    // schema 				= require('json!schema/PhieuNhapKhoSchema.json');
    var CustomFilterView = require('app/bases/CustomFilterView'),
        KhoSelectView = require('app/quanlykho/DanhMucKho/SelectView');

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: {},
        urlPrefix: "/api/v1/",
        collectionName: "phieukiemkekho",
        uiControl: {
            fields: [
                { field: "stt", label: "STT", width: 10 },
                {
                    field: "thoigian_kiemke",
                    label: "Ngày kiểm kê",
                    width: 180,
                    template: function(rowData) {
                        if (rowData !== undefined) {
                            if (rowData.thoigian_kiemke !== null && rowData.thoigian_kiemke !== undefined) {
                                return gonrinApp().parseInputDateString(rowData.thoigian_kiemke).format("DD/MM/YYYY");
                            }
                        }
                        return "";
                    }
                },
                { field: "so_phieu_chungtu", label: "Số phiếu chứng từ", width: 250 }


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
                label: `<i class="fa fa-plus"></i> Thêm mới`,
                command: function() {
                    var self = this;
                    gonrinApp().getRouter().navigate(this.collectionName + '/model');
                }
            }, ]
        }, ],
        render: function() {
            var self = this;
            self.$el.find("#title_page").html("Danh sách Phiếu kiểm kê kho");
            // self.$el.find("#kho").ref({
            //     textField: "ten_kho",
            //     valueField: "ma_kho",
            //     dataSource: KhoSelectView,
            // });
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
            self.uiControl.orderBy = [{ "field": "thoigian_taophieu", "direction": "desc" }];
            self.applyBindings();
               self.$el.find(".btn-search").unbind("click").bind("click", function () {
            	   self.filterCollection();
               }); 
               self.$el.find('.btn-clear').unbind("click").bind("click", function () {
            	   self.$el.find('#tungay').data('gonrin').setValue(null);
            	   self.$el.find('#dengay').data('gonrin').setValue(null);
            	   self.$el.find('#sophieuchungtu').val("");
            	   self.filterCollection();
               });
            return this;
        },
        filterCollection: function() {
            var self = this;
            var tu_ngay = self.$el.find('#tungay').data('gonrin').getValue(),
                den_ngay = self.$el.find('#dengay').data('gonrin').getValue(),
                sophieuchungtu = self.$el.find('#sophieuchungtu').val();
                var tmp = gonrinApp().parseInputDateString(den_ngay);
                var den_ngay = self.parse_date_custom((moment(tmp).set({hour:23,minute:59,second:59})));
            var query_time = "";
            if (tu_ngay !== null && tu_ngay !== undefined && den_ngay !== null && den_ngay !== undefined) {
                query_time = {
                    "$and": [
                        { "thoigian_taophieu": { "$gte": tu_ngay } },
                        { "thoigian_taophieu": { "$lte": den_ngay } },
                    ]
                };
            } else if (tu_ngay !== null && tu_ngay !== undefined) {
                query_time = {
                    "$and": [
                        { "thoigian_taophieu": { "$gte": tu_ngay } }
                    ]
                };
            } else if (den_ngay !== null && den_ngay !== undefined) {
                query_time = {
                    "$and": [
                        { "thoigian_taophieu": { "$lte": den_ngay } },
                    ]
                };
            }

            var query = "";
            if (sophieuchungtu !== null && sophieuchungtu !== undefined && sophieuchungtu != "" && query_time !== "") {
                query = {
                    "$and": [
                        { "so_phieu_chungtu": { "$eq": sophieuchungtu } },
                        query_time,
                    ]
                }
            } else if (sophieuchungtu !== null && sophieuchungtu !== undefined && sophieuchungtu != "" && query_time == "") {
                query = {
                    "$and": [
                        { "so_phieu_chungtu": { "$eq": sophieuchungtu } },
                    ]
                }
            } else if (query_time !== "") {
                query = {
                   "$and" : [
                       query_time
                   ]
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
		}
    });

});