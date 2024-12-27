define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/giayphepnhapkhau/tpl/collection.html'),
        schema = require('json!schema/GiayPhepNhapKhauSchema.json');
    var AttachFileVIew = require("app/view/AttachFile/AttachFileVIew");
    var ResultImportExcel = require('app/giayphepnhapkhau/ResultImportExcel');

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "giayphep_nhapkhau_collection_filter",
        uiControl: {
            fields: [{
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
                // { field: "nguoi_duyet", label: "Người duyệt giấy phép", width: 250 },
                { field: "trangthai", label: "Trạng thái", width: 100, template : function(rowData){
                    if (!!rowData){
                        if  (rowData.trangthai == 1){
                            return '<div class="text-info">Tạo mới</div>';
                        }
                        else if (rowData.trangthai ==2){
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
                if (event.rowId) {
                    this.setLocalStorage();
                    let path = `giayphep_nhapkhau/model?id=${event.rowId}`;
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
        tools: [{
            name: "default",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [{
                name: "create",
                type: "button",
                buttonClass: "btn-primary btn-sm d-none new-giayphep",
                label: `<i class="fa fa-plus"></i> Thêm mới`,
                command: function() {
                    var self = this;
                    let path = `giayphep_nhapkhau/model`;
                    gonrinApp().getRouter().navigate(path);
                }
            }, ]
        }, ],
        render: function() {
            var self = this;
            var currentUser = gonrinApp().currentUser;
            var tuyendonvi_id = "";
            if (!!currentUser && !! currentUser.donvi){
                tuyendonvi_id = currentUser.donvi.tuyendonvi_id;
            }
            if(tuyendonvi_id == "10"){
                self.$el.find(".import-excel").remove();
            }
            else{
                self.$el.find(".new-giayphep").removeClass("d-none");
            }
            var tungay = self.$el.find('#tungay').datetimepicker({
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
            var denngay = self.$el.find('#denngay').datetimepicker({
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
            var data_cache = window.sessionStorage.getItem('datafilter_danhsach_gpnk_donvi');
            if (!!data_cache) {
                data_cache = JSON.parse(data_cache);
                if (data_cache.so_giay_phep != null && data_cache.so_giay_phep != undefined) {
                    self.$el.find("#so_giay_phep").val(data_cache.so_giay_phep);
                }
                if (data_cache.trangthai != null && data_cache.trangthai != undefined && data_cache.trangthai != "") {
                    self.$el.find("#trangthai").val(data_cache.trangthai);
                }
                if (!!data_cache.ngay_bat_dau) {
                    self.$el.find("#tungay").data('gonrin').setValue(data_cache.ngay_bat_dau);
                }
                if (!!data_cache.ngay_ket_thuc) {
                    self.$el.find("#denngay").data('gonrin').setValue(data_cache.ngay_ket_thuc);
                }
                 
            }
            self.uiControl.filters = self.filterCollection(tungay, denngay, false);
            self.uiControl.orderBy = [{ "field": "thoigian_capphep", "direction": "desc" }];
            self.applyBindings();
            window.sessionStorage.removeItem('datafilter_danhsach_gpnk_donvi');
            // self.$el.find("#so_giay_phep").val("");
            self.$el.find(".btn-search").unbind("click").bind("click", function() {
                self.filterCollection(tungay,denngay, true);
            });
            self.$el.find('.btn-clear').unbind("click").bind("click", function() {
                tungay.data('gonrin').setValue(null);
                denngay.data('gonrin').setValue(null);
                self.$el.find("#so_giay_phep").val("");
                self.$el.find("#trangthai").val("10");
                self.filterCollection(tungay, denngay, true);
            });
            self.register_attach_file('btn-import');            
            return this;
        },
        setLocalStorage: function () {
            var myStorage = window.sessionStorage;
            var self = this;
            var so_giay_phep = self.$el.find('#so_giay_phep').val();
            var trangthai = self.$el.find("#trangthai").val();
            var ngay_bat_dau = self.$el.find("#tungay").data('gonrin').getValue();
            var ngay_ket_thuc = self.$el.find("#denngay").data('gonrin').getValue();
            var tmp = gonrinApp().parseInputDateString(ngay_ket_thuc);
            var ngay_ket_thuc = self.parse_date_custom((moment(tmp).set({hour:23,minute:59,second:59})));
            var data = JSON.stringify({
                "so_giay_phep": so_giay_phep,
                "trangthai": trangthai,
                "ngay_bat_dau": ngay_bat_dau,
                "ngay_ket_thuc": ngay_ket_thuc
            });
            myStorage.setItem('datafilter_danhsach_gpnk_donvi', data);
            
        },
        filterCollection: function(tungay,denngay, is_query) {
            var self = this;
            var so_giay_phep = self.$el.find('#so_giay_phep').val();
            var trangthai = self.$el.find("#trangthai").val();
            var ngay_bat_dau = tungay.data("gonrin").getValue();
            var ngay_ket_thuc = denngay.data("gonrin").getValue();
            var tmp = gonrinApp().parseInputDateString(ngay_ket_thuc);
            var ngay_ket_thuc = self.parse_date_custom((moment(tmp).set({hour:23,minute:59,second:59})));
            var query_time = "";
            if (ngay_bat_dau !== null && ngay_bat_dau !== undefined && ngay_ket_thuc !== null && ngay_ket_thuc !== undefined && ngay_bat_dau !== "" && ngay_ket_thuc !== "") {
                query_time = {
                    "$and": [
                        { "thoigian_capphep": { "$gte": ngay_bat_dau } },
                        { "thoigian_capphep": { "$lte": (ngay_ket_thuc) } },
                    ]
                };
            } else if (ngay_bat_dau !== null && ngay_bat_dau !== undefined && ngay_bat_dau !== "") {
                query_time = {
                    "$and": [
                        { "thoigian_capphep": { "$gte": ngay_bat_dau } }
                    ]
                };
            } else if (ngay_ket_thuc !== null && ngay_ket_thuc !== undefined && ngay_ket_thuc !== "") {
                query_time = {
                    "$and": [
                        { "thoigian_capphep": { "$lte": (ngay_ket_thuc) } },
                    ]
                };
            }

            var query = "";
            if (so_giay_phep !== null && so_giay_phep !== undefined && so_giay_phep !== "" && query_time !== "") {
                if (trangthai != 10){
                    query = {
                        "$and": [
                            { "so_giay_phep": { "$likeI": so_giay_phep } },
                            query_time,
                            {"trangthai" : {"$eq" : Number(trangthai)}}
                        ]
                    }
                }
                else{
                    query = {
                        "$and": [
                            { "so_giay_phep": { "$likeI": so_giay_phep } },
                            query_time,
                        ]
                    }
                }

            } else if (so_giay_phep !== null && so_giay_phep !== undefined && so_giay_phep !== "" && query_time == "") {
                if (trangthai != 10){
                    query = {
                        "$and": [
                            { "so_giay_phep": { "$likeI": so_giay_phep } },
                            {"trangthai" : {"$eq" : Number(trangthai)}}
                        ]
                    }
                }
                else{
                    query = {
                        "$and": [
                            { "so_giay_phep": { "$likeI": so_giay_phep } },
                        ]
                    }
                }

            }
            else if ((so_giay_phep ===undefined || so_giay_phep === null || so_giay_phep ==="") && query_time != ""){
                if (trangthai != 10){
                    query = {
                        "$and": [
                            query_time,
                            {"trangthai" : {"$eq" : Number(trangthai)}}
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
            }
            else {
                if (trangthai != 10){
                    query = {
                        "$and": [
                            {"trangthai" : {"$eq" : Number(trangthai)}}
                        ]
                    }
                }
                else{
                    query = {
                        "$or": [
                            {"trangthai" : {"$eq" : Number(1)}},
                            {"trangthai" : {"$eq" : Number(2)}},
                            {"trangthai" : {"$eq" : Number(3)}}
                        ]
                    }
                }
            }
            if (query !== "" && is_query == true) {
                var $col = self.getCollectionElement();
                $col.data('gonrin').filter(query);
            }
            return query;
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
        register_attach_file: function (class_file = null) {
			var self = this;
			self.$el.find("." + class_file).unbind("click").bind("click", function () {
				var attachImage = new AttachFileVIew();
                attachImage.render();
				attachImage.on("success", (event) => {
					var file = event.data;
                    var file_type = file.type;
                    console.log(file_type)
					if (!!file && !!file_type && (file_type.toLowerCase().includes("xlsx"))) {
						var file_link = file.link;
						var url = (self.getApp().serviceURL || "") + '/api/v1/import_excel_giayphep_nhapkhau';
						$.ajax({
							url: url,
							type: 'POST',
							dataType: 'json',
							data: JSON.stringify({
                                "link": file_link,
                                "donvi_id" : gonrinApp().currentUser.donvi_id
							}),
							error: function (error) {
								self.getApp().notify({ message: "Có lỗi xảy ra" }, { type: "danger", delay: 1000 });
							},
							success: function (res) {
                                self.getApp().notify({ message: "Import dữ liệu thành công" });
                                var resultView = new ResultImportExcel({ viewData: { "listFailed": res.listFailed, "countCreate": res.countCreate } });
                                resultView.dialog({ "size": "large" });
								self.getApp().getRouter().refresh();
							}
						});
					} else {
						self.getApp().notify({ message: "Vui lòng chọn file đúng định dạng .xlsx" }, { type: "danger", delay: 1000 });
					}
				});
			});
		}
    });

});