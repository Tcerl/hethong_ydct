define(function(require) {

    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin'),
        storejs = require('vendor/store'),
        tpl = require('text!app/register/tpl/register.html');
    var    schema = require('json!schema/DonViDangKySchema.json');
    var ManageFileVIew = require("app/view/AttachFile/ManageFileUploadView");


    return Gonrin.ModelView.extend({
        template: tpl,
        modelSchema: schema,
        uiControl: {
            fields: [
                {
					field: "ngaycapphep",
					uicontrol: "datetimepicker",
					format: "DD/MM/YYYY",
					textFormat: "DD/MM/YYYY",
					extraFormats: ["DDMMYYYY"],
					parseInputDate: function (val) {
						return gonrinApp().parseInputDateString(val);
					},
					parseOutputDate: function (date) {
						return gonrinApp().parseOutputDateString(date);
					},
					disabledComponentButton: true
                },
                {
					field:"loai_donvi",
					uicontrol:"combobox",
					textField: "text",
					valueField: "value",
					cssClass:"form-control",
					dataSource: [
                        { value: 2, text: "Đơn vị nhập khẩu/phân phối/cung ứng" },
                        { value: 5, text: "Đơn vị nuôi trồng dược liệu" },
                        { value: 6, text: "Đơn vị khai thác tự nhiên" },
						{ value: 9, text: "Đơn vị nuôi trồng và khai thác tự nhiên" },
						{ value: 4, text: "Bệnh viện" },
						{ value: 7, text: "Cá nhân nuôi trồng, thu gom dược liệu" },
						{ value: 8, text: "Cá nhân khai thác, thu gom dược liệu" },
						]
                },
            ]
        },
        render: function() {
            var self = this;
            this.$el.find(".btn-register").unbind("click").bind("click", function() {
                self.processLogin();
                return false;
            });
            self.$el.find(".btn-register").unbind("submit").bind("submit", function() {
                self.processLogin();
                return false;
            });
            this.$el.find(".btn-back").unbind("click").bind("click", function() {
                self.getApp().getRouter().navigate("login")
                return false;
            });

            var fileView = new ManageFileVIew({ viewData: { "listFile": self.model.get('dinhkem_giayphep_dkkd'), "$el_btn_upload": self.$el.find(".btn-add-file") , register : true}, el: self.$el.find(".list-attachment")});
            fileView.render();
            fileView.on("change", (event) => {
                var listfile = event.data;
                self.model.set('dinhkem_giayphep_dkkd', listfile);
            });

            self.selectizeTinhThanh();
            self.selectizeQuanHuyen();
            self.selectizeXaPhuong();
            self.controlSelectize();
            self.applyBindings();
            return this;
        },
        processLogin: function() {
            var self = this;
            
            let ten_coso = self.$el.find("#ten_coso").val();
            if (!ten_coso){
                self.getApp().notify({message: "Vui lòng nhập tên đơn vị"}, {type:"danger", delay : 1000});
                return false;
            }
            let sogiayphep = self.$el.find("#sogiayphep").val();
            if (!sogiayphep){
                self.getApp().notify({message: "Vui lòng nhập số đăng ký kinh doanh"}, {type:"danger", delay : 1000});
                return false;
            }

            let ngaycapphep = self.model.get("ngaycapphep");
            if (!ngaycapphep){
                self.getApp().notify({message:"Vui lòng nhập ngày cấp phép"}, {type:"danger", delay :1000});
                return false;
            }
            let loai_donvi = self.model.get("loai_donvi");
            if (!loai_donvi){
                self.getApp().notify({message:"Vui lòng nhập loại hình hoạt động của đơn vị"}, {type :"danger", delay : 1000});
                return false;
            }

            let dinhkem_giayphep_dkkd = self.model.get("dinhkem_giayphep_dkkd");
            if (!dinhkem_giayphep_dkkd || (Array.isArray(dinhkem_giayphep_dkkd) === true && dinhkem_giayphep_dkkd.length == 0 )){
                self.getApp().notify({message:"Vui lòng thêm đính kèm giấy phép kinh doanh"}, {type:"danger", delay : 1000});
                return false;
            }

            let nguoidaidien = self.$el.find("#nguoidaidien").val();
            if (!nguoidaidien){
                self.getApp().notify({message:"Vui lòng nhập tên người đại diện"}, {type :"danger", delay : 1000});
                return false;
            }
            let nguoidaidien_dienthoai = self.$el.find("#nguoidaidien_dienthoai").val();
            if (!nguoidaidien_dienthoai){
                self.getApp().notify({message:"Vui lòng nhập số điện thoại người đại diện"}, {type:"danger", delay : 1000});
                return false;
            }
            let nguoidaidien_email = self.$el.find("#nguoidaidien_email").val();
            if (!nguoidaidien_email){
                self.getApp().notify({message:"Vui lòng nhập email người đại diện"}, {type:"danger", delay : 1000});
                return false;
            }
            let password = self.$el.find("#password").val();
            if (!password){
                self.getApp().notify({message:"Vui lòng nhập mật khẩu đăng nhập"}, {type:"danger", delay : 1000});
                return false;
            }
            let comfirm_pw = self.$el.find("#comfirm-password").val();
            if (!comfirm_pw){
                self.getApp().notify({message:"Vui lòng xác nhận lại mật khẩu"}, {type:"danger", delay : 1000});
                return false;
            }
            else{
                if (comfirm_pw !== password){
                    self.getApp().notify({message:"Mật khẩu không khớp, vui lòng nhập lại"}, {type:"danger", delay : 1000});
                    return false;
                }
            }
            self.getApp().showloading();
            var path = self.getApp().serviceURL + '/api/v1/register';

            $.ajax({
                url: path,
                type: 'POST',
                data: JSON.stringify(self.model.toJSON()),
                headers: {
                    'content-type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                beforeSend: function() {
                    $("#loading").removeClass("d-none");
                },
                dataType: 'json',
                success: function(data) {
                    self.getApp().notify('Đăng ký thành công');
                },
                error: function(xhr, status, error) {
                    try {
                        self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                    } catch (err) {
                        self.getApp().notify({ message: "Có lỗi xảy ra, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
                    }
                },
                complete: function() {
                    self.getApp().hideloading();
                    return false;
                }
            });
        },
        controlSelectize: function () {
            var self = this;

            if (!!self.model.get('tinhthanh_id')) {
                self.$el.find("#quanhuyen")[0].selectize.enable();
            } else {
                self.$el.find("#quanhuyen")[0].selectize.disable();

            }
            if (!!self.model.get('quanhuyen_id')) {
                self.$el.find("#xaphuong")[0].selectize.enable();
            } else {
                self.$el.find("#xaphuong")[0].selectize.disable();

            }
        },
        loadTinhThanh: function (query = '', callback) {
            var self = this;
            var arr_filters = [
                { 'deleted': { '$eq': false } },
                { 'active': { '$eq': 1 } }
            ];
            if (!!query) {
                arr_filters.push({ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } });
            }
            var query_filter = {
                "filters": {
                    "$and": arr_filters
                },
                "order_by": [{ "field": "ten", "direction": "asc" }]
            };

            var url =
                (self.getApp().serviceURL || "") + "/api/v1/tinhthanh?results_per_page=100" + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: function (response) {
                    callback(response.objects);
                    if (!!self.model.get('tinhthanh_id')) {
                        self.$el.find('#tinhthanh')[0].selectize.setValue(self.model.get('tinhthanh_id'));
                    }
                },
                error: function () {
                    callback();
                },
            });
        },
        loadQuanHuyen: function (query = '', callback) {
            var self = this;
            var arr_filters = [
                { 'deleted': { '$eq': false } },
                { 'active': { '$eq': 1 } }
            ];
            if (!!self.model.get('tinhthanh_id')) {
                arr_filters.push({ "tinhthanh_id": { "$eq": self.model.get("tinhthanh_id") } });
            }
            if (!!query) {
                arr_filters.push({ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } });
            }

            var query_filter = {
                "filters": {
                    "$and": arr_filters
                },
                "order_by": [{ "field": "ten", "direction": "asc" }]
            };

            var url =
                (self.getApp().serviceURL || "") + "/api/v1/quanhuyen?results_per_page=30" + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: function (response) {
                    callback(response.objects);
                    if (!!self.model.get('quanhuyen_id')) {
                        self.$el.find('#quanhuyen')[0].selectize.setValue(self.model.get('quanhuyen_id'))
                    }
                },
                error: function () {
                    callback();
                },
            });
        },
        loadXaPhuong: function (query = '', callback) {
            var self = this;
            var arr_filters = [
                { 'deleted': { '$eq': false } },
                { 'active': { '$eq': 1 } }
            ];

            if (!!self.model.get('quanhuyen_id')) {
                arr_filters.push({ "quanhuyen_id": { "$eq": self.model.get("quanhuyen_id") } });
            }
            if (!!query) {
                arr_filters.push({ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } });
            }

            var query_filter = {
                "filters": {
                    "$and": arr_filters
                },
                "order_by": [{ "field": "ten", "direction": "asc" }]
            };
            var url =
                (self.getApp().serviceURL || "") + "/api/v1/xaphuong?results_per_page=30" + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: function (response) {
                    callback(response.objects);
                    if (!!self.model.get('xaphuong_id')) {
                        self.$el.find('#xaphuong')[0].selectize.setValue(self.model.get('xaphuong_id'))
                    }
                },
                error: function () {
                    callback();
                },
            });
        },
        selectizeTinhThanh: function () {
            var self = this;
            var $select = self.$el.find("#tinhthanh").selectize({
                maxItems: 1,
                valueField: "id",
                labelField: "ten",
                searchField: ["ten", "tenkhongdau"],
                preload: true,
                placeholder: "Tìm kiếm tỉnh thành",
                load: function (query, callback) {
                    self.loadTinhThanh(query, callback);
                },

                onItemAdd: function (value, $item) {
                    var obj = $select[0].selectize.options[value];
                    // delete obj.$order;
                    var obj_tinhthanh = {
                        "id": obj.id,
                        "ten": obj.ten,
                        "quocgia_id": obj.quocgia_id
                    }
                    self.model.set({
                        "tinhthanh": obj_tinhthanh,
                        "tinhthanh_id": value
                    });
                    self.$el.find("#quanhuyen")[0].selectize.clear();
                    self.$el.find("#xaphuong")[0].selectize.clear();
                    self.$el.find("#quanhuyen")[0].selectize.clearOptions();
                    self.$el.find("#xaphuong")[0].selectize.clearOptions();
                    if (!!self.model.get('quanhuyen') && self.model.get('quanhuyen').tinhthanh_id != value) {
                        self.model.set({
                            "quanhuyen_id": null,
                            "quanhuyen": null,
                            "xaphuong_id": null,
                            "xaphuong": null
                        })

                    }
                    // console.log(self.model.get('quanhuyen'))
                    if ((!!self.model.get('quanhuyen') && self.model.get('quanhuyen').tinhthanh_id != value) || !self.model.get('quanhuyen') || !self.$el.find("#quanhuyen")[0].selectize.getValue()) {
                        self.$el.find("#quanhuyen")[0].selectize.load(function (callback) {
                            self.loadQuanHuyen('', callback);
                        });
                    }

                    self.controlSelectize();

                },
                onItemRemove: function () {
                    self.model.set({
                        "tinhthanh": null,
                        "tinhthanh_id": null,
                        "quanhuyen": null,
                        "quanhuyen_id": null,
                        "xaphuong": null,
                        "xaphuong_id": null
                    });
                    self.$el.find("#quanhuyen")[0].selectize.clear();
                    self.$el.find("#xaphuong")[0].selectize.clear();
                    self.controlSelectize();

                }
            });
        },
        selectizeQuanHuyen: function () {
            var self = this;
            var $select = self.$el.find("#quanhuyen").selectize({
                maxItems: 1,
                valueField: "id",
                labelField: "ten",
                searchField: ["ten", "tenkhongdau"],
                preload: true,
                placeholder: 'Tìm kiếm quận huyện',

                load: function (query, callback) {
                    // self.loadQuanHuyen(query, callback);
                },

                onItemAdd: function (value, $item) {
                    var obj = $select[0].selectize.options[value];
                    // delete obj.$order;
                    var obj_quanhuyen = {
                        "id": obj.id,
                        "ten": obj.ten,
                        "tinhthanh_id": obj.tinhthanh_id
                    }
                    self.model.set({
                        "quanhuyen": obj_quanhuyen,
                        "quanhuyen_id": value
                    });
                    self.$el.find("#xaphuong")[0].selectize.clearOptions();
                    self.$el.find("#xaphuong")[0].selectize.clear();
                    if (!!self.model.get('xaphuong') && self.model.get('xaphuong').quanhuyen_id != value) {
                        self.model.set({
                            "xaphuong_id": null,
                            "xaphuong": null
                        })
                    }
                    self.controlSelectize();
                    if ((!!self.model.get('xaphuong') && self.model.get('xaphuong').quanhuyen_id != value) || !self.model.get('xaphuong') || !self.$el.find("#xaphuong")[0].selectize.getValue()) {
                        self.$el.find("#xaphuong")[0].selectize.load(function (callback) {
                            self.loadXaPhuong('', callback);
                        });
                    }

                },
                onItemRemove: function () {
                    self.model.set({
                        "quanhuyen": null,
                        "quanhuyen_id": null,
                        "xaphuong": null,
                        "xaphuong_id": null
                    });
                    self.$el.find("#xaphuong")[0].selectize.clearOptions();
                    self.$el.find("#xaphuong")[0].selectize.clear();

                    self.controlSelectize();

                }
            });
        },
        selectizeXaPhuong: function () {
            var self = this;
            var $select = self.$el.find("#xaphuong").selectize({
                maxItems: 1,
                valueField: "id",
                labelField: "ten",
                searchField: ["ten", "tenkhongdau"],
                preload: true,
                placeholder: 'Tìm kiếm xã phường',

                load: function (query, callback) {
                    // self.loadXaPhuong(query, callback);
                },

                onItemAdd: function (value, $item) {
                    var obj = $select[0].selectize.options[value];
                    // delete obj.$order;
                    var obj_xaphuong = {
                        "id": obj.id,
                        "ten": obj.ten,
                        "quanhuyen_id": obj.quanhuyen_id
                    }
                    self.model.set({
                        "xaphuong": obj_xaphuong,
                        "xaphuong_id": value,
                    });
                },
                onItemRemove: function () {
                    self.model.set({
                        "xaphuong": null,
                        "xaphuong_id": null
                    });
                    self.controlSelectize();
                }
            });
        },
    });

});