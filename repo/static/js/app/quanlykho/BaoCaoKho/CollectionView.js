define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/quanlykho/BaoCaoKho/tpl/collection.html'),
        schema = require('json!schema/BaoCaoKhoSchema.json');
    var CustomFilterView = require('app/bases/CustomFilterView');

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "baocaokho",
        uiControl: {
            fields: [
                { field: "stt", label: "STT", width: 10 },
                {
                    field: "ngay_bao_cao",
                    label: "Ngày Báo Cáo",
                    width: 180,
                    template: function(rowData) {
                        if (rowData !== undefined) {
                            if (rowData.ngay_bao_cao !== null && rowData.ngay_bao_cao !== undefined) {
                                return gonrinApp().parseInputDateString(rowData.ngay_bao_cao).format('DD/MM/YYYY');
                            }
                        }
                        return "";
                    }
                },
                {
                    field: "ky_bao_cao",
                    label: "Kỳ báo cáo",
                    width: 200,
                    template: function(rowData) {
                        if (rowData !== undefined && rowData !== null) {
                            if (rowData.loai_ky_bao_cao === 2) {
                                return "Tháng " + rowData.ky_bao_cao + "/" + rowData.nam_bao_cao;
                            } else if (rowData.loai_ky_bao_cao === 3) {
                                return "Qúy " + rowData.ky_bao_cao + "/" + rowData.nam_bao_cao;
                            } else if (rowData.loai_ky_bao_cao === 4) {
                                console.log(rowData.nam_bao_cao);
                                return "Năm " + rowData.nam_bao_cao;
                            } else {
                                return gonrinApp().parseInputDateString(rowData.ngay_bat_dau).format('DD/MM/YYYY') + " - " + gonrinApp().parseInputDateString(rowData.ngay_ket_thuc).format('DD/MM/YYYY');
                            }
                        }
                        return "";
                    }
                },
                {
                    field: "ten_kho",
                    label: "Kho",
                    width: 200,
                    template: function(rowData) {
                        if (rowData !== undefined) {
                            if (rowData.bao_cao_tat_ca_kho === 1) {
                                return "tất cả";
                            } else if (rowData.ten_kho != null) {
                                return rowData.ten_kho;
                            }
                        }
                        return "";
                    }
                },
                { field: "ten_nguoi_bao_cao", label: "Người báo cáo", width: 250 },
                {
                    field: "updated_at",
                    label: "Thời gian lưu báo cáo",
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
                buttonClass: "btn-primary btn-sm btn-creat",
                label: "Tạo báo cáo mới",
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
                    return gonrinApp().parseInputDateString(val);
                },
                parseOutputDate: function(date) {
                    return gonrinApp().parseOutputDateString(date);
                },
                disabledComponentButton: true
            });
            var denngay = self.$el.find('.denngay').datetimepicker({
                textFormat: 'DD/MM/YYYY',
                extraFormats: ['DDMMYYYY'],
                parseInputDate: function(val) {
                    return gonrinApp().parseInputDateString(val);
                },
                parseOutputDate: function(date) {
                    return gonrinApp().parseOutputDateString(date);
                },
                disabledComponentButton: true
            });
            var donvi_id = self.getApp().getRouter().getParam("donvi_id");
            var currentUser = self.getApp().currentUser;
            if (!! currentUser && !!donvi_id &&  (currentUser.donvi_id != donvi_id )){
                self.$el.find(".btn-creat").remove();
            }
            var filters = {
                "$and": [
                    { "donvi_id": { "$eq": donvi_id } },
                    { "deleted": { "$eq": false } }
                ]
            }
            self.uiControl.orderBy = [{ "field": "ngay_bao_cao", "direction": "desc" }];
            self.uiControl.filters = filters;
            self.$el.find(".btn-search").unbind("click").bind("click", function() {
                var ngay_bat_dau = tungay.data("gonrin").getValue();
                var ngay_ket_thuc = denngay.data("gonrin").getValue();
                var tmp = gonrinApp().parseInputDateString(ngay_ket_thuc);
                ngay_ket_thuc = self.parse_date_custom((moment(tmp).set({hour:23,minute:59,second:59})));
                if (ngay_bat_dau === undefined || ngay_bat_dau === null) {
                    self.getApp().notify({ message: "Vui lòng chọn ngày bắt đầu." }, { type: "danger", delay: 3000 });
                    return false;
                } else if (ngay_ket_thuc === undefined || ngay_ket_thuc === null) {
                    self.getApp().notify({ message: "Vui lòng chọn ngày kết thúc." }, { type: "danger", delay: 3000 });
                    return false;
                } else {
                    if (ngay_ket_thuc < ngay_bat_dau) {
                        self.getApp().notify({ message: "Vui lòng chọn ngày kết thúc lớn hơn ngày bắt đầu." }, { type: "danger", delay: 3000 });
                        return false;
                    } else {
                        var filters = {
                            "$and": [
                                { "donvi_id": { "$eq": donvi_id } },
                                { "ngay_bao_cao": { "$ge": ngay_bat_dau } },
                                { "ngay_bao_cao": { "$le": (ngay_ket_thuc) } },
                                { "deleted": { "$eq": false } }
                            ]
                        }
                        self.uiControl.filters = filters;
                        var $col = self.getCollectionElement();
                        $col.data('gonrin').filter(filters);
                    }
                }
            });
            self.applyBindings();
        },
        convert_string_to_string_date: function(time) {
            if (time !== undefined && time !== null && time.trim() !== "") {
                if (time[0] == "0" || time[0] == 0) {
                    time = time.slice(1);
                }
                return time;
            } else {
                return "";
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