define(function (require) {
    "use strict";
    var $ = require('jquery');
    var Gonrin = require('gonrin');
    var template = require('text!app/quanly_thuongmai_dientu/DonViCungUng/tpl/model.html');
    var schema = require('json!schema/DonViCungUngSchema.json');
    var RejectDialogView = require('app/bases/RejectDialogView');
    return Gonrin.ModelDialogView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "donvi_cungung",
        tools: [
            {
                name: "back",
                type: "button",
                buttonClass: "btn-secondary waves-effect width-sm",
                label: "<i class='fas fa-times-circle'></i> Đóng",
                command: function () {
                    var self = this;
                    self.close();
                }
            },
            {
                name: "save",
                type: "button",
                buttonClass: "btn-success width-sm ml-2",
                label: "<i class='far fa-save'></i> Lưu",
                visible: function () {
                    var currentUser = gonrinApp().currentUser;
                    return (!!currentUser);
                },
                command: function () {
                    var self = this;
                    var isValidData = self.validateData();
                    if (!isValidData) {
                        return;
                    }
                    self.getApp().showloading();
                    self.model.save(null, {
                        success: function (model, respose, options) {
                            self.getApp().hideloading();
                            self.getApp().notify("Lưu thông tin thành công");
                            self.trigger("saveData");
                            self.close();
                        },
                        error: function (xhr, status, error) {
                            self.getApp().hideloading();
                            try {
                                if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                    self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                    self.getApp().getRouter().navigate("login");
                                }
                                else {
                                    self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                }
                            }
                            catch (err) {
                                self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
                            }
                        }
                    });
                }
            },
            {
                name: "delete",
                type: "button",
                buttonClass: "btn-danger width-sm ml-2",
                label: "<i class='fas fa-trash-alt'></i> Xóa",
                visible: function () {
                    var self = this;
                    return (!!self.viewData && self.viewData.id);
                },
                command: function () {
                    var self = this;
                    var view = new RejectDialogView({ viewData: { "text": "Bạn có chắc chắn muốn xóa bản ghi này không?" } });
                    view.dialog();
                    view.on("confirm", (e) => {
                        self.getApp().showloading();
                        self.model.destroy({
                            success: function (model, response) {
                                self.getApp().hideloading();
                                self.getApp().notify('Xoá dữ liệu thành công');
                                self.trigger("saveData");
                                self.close();
                            },
                            error: function (xhr, status, error) {
                                self.getApp().hideloading();
                                try {
                                    if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                        self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                        self.getApp().getRouter().navigate("login");
                                    }
                                    else {
                                        self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                    }
                                }
                                catch (err) {
                                    self.getApp().notify({ message: "Xóa thông tin không thành công" }, { type: "danger", delay: 1000 });
                                }
                            }
                        });
                    });
                }
            },
        ],
        uiControl: {
            fields: [
                {
                    field: "ngay_capphep",
                    uicontrol: "datetimepicker",
                    format: "DD/MM/YYYY",
                    textFormat: "DD/MM/YYYY",
                    extraFormats: ["DDMMYYYY"],
                    parseInputDate: function (val) {
                        return gonrinApp().parseInputDateString(val);
                    },
                    parseOutputDate: function (date) {
                        return gonrinApp().parseOutputDateString(date, "YYYYMMDD");
                    },
                    disabledComponentButton: true,
                },
                {
                    field: "trangthai",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: 1, text: "Đang hoạt động" },
                        { value: 0, text: "Ngừng hoạt động" },
                    ],
                }

            ]
        },
        render: function () {
            var self = this;
            var id = !!self.viewData ? self.viewData.id : null;
            if (id) {
                this.model.set('id', id);
                this.model.fetch({
                    success: function () {
                        self.applyBindings();
                        self.selectizeDanhMucNhaCungCap();
                        var danhmuc_nhacungcap_id = self.model.get("danhmuc_nhacungcap_id");
                        self.selectizeTinhThanhQuanHuyenXaPhuong(self);
                        if (danhmuc_nhacungcap_id) {
                            self.disableInputFields();
                        }
                    },
                    error: function () {
                        self.getApp().notify({ message: "Có lỗi xảy ra, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
                    },
                });
            } else {
                self.applyBindings();
                self.selectizeDanhMucNhaCungCap();
                self.selectizeTinhThanhQuanHuyenXaPhuong(self);
            }
        },
        validateData: function () {
            var self = this;
            var ma_donvi = self.model.get('ma_donvi');
            var ten_donvi = self.model.get('ten_donvi');
            var email = self.model.get('email');
            if (ma_donvi == null || ma_donvi.trim() === "") {
                self.getApp().notify({ message: "Chưa nhập mã nhà cung cấp" }, { type: "danger", delay: 1000 });
                return false;
            }
            if (ten_donvi == null || ten_donvi.trim() === "") {
                self.getApp().notify({ message: "Chưa nhập tên nhà cung cấp" }, { type: "danger", delay: 1000 });
                return false;
            }
            self.model.set("ten_donvi", ten_donvi.trim().toUpperCase());
            if (email != null && email.trim() !== "") {
                self.model.set("email", email.trim().toLowerCase());
            }
            return true;
        },
        selectizeDanhMucNhaCungCap: function () {
            var self = this;
            var firstLoad = true;
            var $selectize = self.$el.find('#selectize_danhmuc_nhacungcap').selectize({
                maxItems: 1,
                valueField: 'id',
                labelField: 'ten_donvi',
                searchField: ['ten_donvi', 'tenkhongdau', 'ma_donvi'],
                preload: true,
                placeholder: "Chọn nhà cung cấp",
                load: function (query, callback) {
                    if (firstLoad) {
                        firstLoad = false;
                        if (!!self.model.get("danhmuc_nhacungcap_id") && self.model.get("danhmuc_nhacungcap")) {
                            callback([self.model.get("danhmuc_nhacungcap")]);
                            self.$el.find("#selectize_danhmuc_nhacungcap")[0].selectize.setValue(self.model.get("danhmuc_nhacungcap_id"));
                        }
                    }
                    var query_filter = null;
                    if (query != null && query != undefined && query.trim() != "") {
                        query_filter = query;
                    }
                    var url = (self.getApp().serviceURL || "") + '/api/v2/danhmuc_nhacungcap?page=1&results_per_page=15' + (query_filter ? "&query_filter=" + query_filter : "");
                    var params = {
                        page: 1,
                        per_page: 15
                    };
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        data: params,
                        error: function () {
                            callback();
                        },
                        success: function (res) {
                            callback(res.objects);
                        }
                    });
                },
                onItemAdd: function (value) {
                    var selectedData = $selectize[0].selectize.options[value];
                    var currentData = self.model.get("danhmuc_nhacungcap");
    
                    if (!currentData || currentData.id !== value) {
                        if (!!selectedData) {
                            delete selectedData.$order;
                            self.model.set({
                                'ma_donvi': selectedData.ma_donvi,
                                'ten_donvi': selectedData.ten_donvi,
                                'email': selectedData.email,
                                'dienthoai': selectedData.dienthoai,
                                'ngay_capphep': selectedData.ngay_capphep,
                                'sonha_tenduong': selectedData.sonha_tenduong,
                                'diachi': selectedData.diachi,
                                'tinhthanh_id': selectedData.tinhthanh_id,
                                'tinhthanh': selectedData.tinhthanh,
                                'quanhuyen_id': selectedData.quanhuyen_id,
                                'quanhuyen': selectedData.quanhuyen,
                                'xaphuong_id': selectedData.xaphuong_id,
                                'xaphuong': selectedData.xaphuong,
                                'danhmuc_nhacungcap_id': selectedData.id,
                                'danhmuc_nhacungcap': selectedData
                            });
                            if (self.model.get("tinhthanh_id")) {
                                self.$el.find("#selectize-tinhthanh")[0].selectize.setValue(self.model.get("tinhthanh_id"));
                            }
                            self.disableInputFields();
                        }
                    }
                },
                onItemRemove: function () {
                    // self.$el.find("#selectize-tinhthanh")[0].selectize.removeItem(self.model.get("tinhthanh_id"));
                    self.model.set({
                        'ma_donvi': null,
                        'ten_donvi': null,
                        'email': null,
                        'dienthoai': null,
                        'ngay_capphep': null,
                        'sonha_tenduong': null,
                        'tinhthanh': null,
                        'tinhthanh_id': null,
                        'quanhuyen': null,
                        'quanhuyen_id': null,
                        'xaphuong': null,
                        'xaphuong_id': null,
                        'diachi' : null,
                        'danhmuc_nhacungcap_id':null,
                        'danhmuc_nhacungcap':null
                    });
                    self.$el.find("#selectize-tinhthanh")[0].selectize.setValue(null);
                    self.$el.find("#selectize-quanhuyen")[0].selectize.setValue(null);
                    self.$el.find("#selectize-xaphuong")[0].selectize.setValue(null);
                    self.selectizeTinhThanhQuanHuyenXaPhuong(self);

                    self.enableInputFields();
                }
            });
        },
        disableInputFields: function () {
            var self = this;
            self.$el.find(".disable-input input").addClass("disable-click");
            self.$el.find(".disable-input .selectize-input").addClass("disable-click");
        },
        enableInputFields: function () {
            var self = this;
            self.$el.find(".disable-input input").removeClass("disable-click");
            self.$el.find(".disable-input .selectize-input").removeClass("disable-click");
        },
        selectizeTinhThanhQuanHuyenXaPhuong: function(self, disable_tinhthanh=false, disable_quanhuyen=false, disable_xaphuong=false, tinhthanh_selector='#selectize-tinhthanh', quanhuyen_selector='#selectize-quanhuyen', xaphuong_selector='#selectize-xaphuong', tinhthanh_id='tinhthanh_id', quanhuyen_id="quanhuyen_id", xaphuong_id="xaphuong_id", tinhthanh_object="tinhthanh", quanhuyen_object="quanhuyen", xaphuong_object="xaphuong") {
            function controlSelectize() {
                if(self.model.get(tinhthanh_id)){
                    self.$el.find(quanhuyen_selector)[0].selectize.enable();
                }else{
                    self.$el.find(quanhuyen_selector)[0].selectize.disable();
                }

                if(self.model.get(quanhuyen_id)){
                    self.$el.find(xaphuong_selector)[0].selectize.enable();
                }else{
                    self.$el.find(xaphuong_selector)[0].selectize.disable();
                }

                if (disable_tinhthanh) {
                    self.$el.find(tinhthanh_selector)[0].selectize.disable();
                }
                if (disable_quanhuyen) {
                    self.$el.find(quanhuyen_selector)[0].selectize.disable();
                }
                if (disable_xaphuong) {
                    self.$el.find(xaphuong_selector)[0].selectize.disable();
                }
            };
            function loadTinhThanh(query = '', callback) {
                if ( !!self.model.get(tinhthanh_id)) {
                    callback([self.model.get(tinhthanh_object)]);
                    self.$el.find(tinhthanh_selector)[0].selectize.setValue(self.model.get(tinhthanh_id));
                    var objects = self.$el.find(tinhthanh_selector)[0].selectize.options[self.model.get(tinhthanh_id)];
                    if (!!objects) delete objects.$order;
                }
                var arr_filters = [
                    {'deleted': {'$eq': false}},
                ];
                if(!!query){
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
                    success: function(response) {
                        callback(response.objects);
                    },
                    error: function() {
                        callback();
                    },
                });
            };
            function loadQuanHuyen(query='', callback) {
                if ( !!self.model.get(quanhuyen_id)) {
                    callback([self.model.get(quanhuyen_object)]);
                    self.$el.find(quanhuyen_selector)[0].selectize.setValue(self.model.get(quanhuyen_id));
                    var objects = self.$el.find(quanhuyen_selector)[0].selectize.options[self.model.get(quanhuyen_id)];
                    if (!!objects) delete objects.$order;
                }
                var arr_filters = [
                    {'deleted': {'$eq': false}},
                ];
                if (!!self.model.get(tinhthanh_id)) {
                    arr_filters.push({ "tinhthanh_id": { "$eq": self.model.get(tinhthanh_id) } });
                }
                
                if(!!query){
                    arr_filters.push({ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } });
                }
                
                var query_filter = {
                        "filters": {
                            "$and": arr_filters
                        },
                        "order_by": [{ "field": "ten", "direction": "asc" }]
                    };

                var url =
                    (self.getApp().serviceURL || "") + "/api/v1/quanhuyen?results_per_page=50" + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                $.ajax({
                    url: url,
                    type: "GET",
                    dataType: "json",
                    success: function(response) {
                        callback(response.objects);
                    },
                    error: function() {
                        callback();
                    },
                });
            };
            function loadXaPhuong(query='', callback) {
                if (!!self.model.get(xaphuong_id)) {
                    callback([self.model.get(xaphuong_object)]);
                    self.$el.find(xaphuong_selector)[0].selectize.setValue(self.model.get(xaphuong_id));
                    var objects = self.$el.find(xaphuong_selector)[0].selectize.options[self.model.get(xaphuong_id)];
                    if (!!objects) delete objects.$order;
                }
                var arr_filters = [
                    {'deleted': {'$eq': false}},
                ];
                if (!!self.model.get(quanhuyen_id)) {
                    arr_filters.push({ "quanhuyen_id": { "$eq": self.model.get(quanhuyen_id) } });
                }
                
                if(!!query){
                    arr_filters.push({ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } });
                }
                
                var query_filter = {
                        "filters": {
                            "$and": arr_filters
                        },
                        "order_by": [{ "field": "ten", "direction": "asc" }]
                    };
                var url =
                    (self.getApp().serviceURL || "") + "/api/v1/xaphuong?results_per_page=50" + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                $.ajax({
                    url: url,
                    type: "GET",
                    dataType: "json",
                    success: function(response) {
                        callback(response.objects);
                    },
                    error: function() {
                        callback();
                    },
                });
            };
            function selectizeTinhThanh() {
                var $select = self.$el.find(tinhthanh_selector).selectize({
                    maxItems: 1,
                    valueField: "id",
                    labelField: "ten",
                    searchField: ["ten", "tenkhongdau"],
                    preload: true,
                    placeholder: 'Chọn tỉnh thành',
                    load: function(query, callback) {
                        loadTinhThanh(query, callback);
                    },

                    onItemAdd: function(value, $item) {
                        var obj = $select[0].selectize.options[value];
                        delete obj.$order;
                        var obj_tinhthanh = {
                            "id": obj.id,
                            "ten": obj.ten
                        }
                        self.model.set({
                            [tinhthanh_object]: obj_tinhthanh,
                            [tinhthanh_id]: value
                        });
                        self.$el.find(quanhuyen_selector)[0].selectize.clear();
                        self.$el.find(xaphuong_selector)[0].selectize.clear();
                        self.$el.find(quanhuyen_selector)[0].selectize.clearOptions();
                        self.$el.find(xaphuong_selector)[0].selectize.clearOptions();
                        if (!!self.model.get(quanhuyen_object) && self.model.get(quanhuyen_object)['tinhthanh_id'] != value) {
                            self.model.set({
                                [quanhuyen_id]: null,
                                [quanhuyen_object]: null,
                                [xaphuong_id]: null,
                                [xaphuong_object]: null
                            })

                        }
                        if ((!!self.model.get(quanhuyen_object) && self.model.get(quanhuyen_object)['tinhthanh_id'] != value) || !self.model.get(quanhuyen_object) || !self.$el.find(quanhuyen_selector)[0].selectize.getValue()) {
                            self.$el.find(quanhuyen_selector)[0].selectize.load(function(callback) {
                                loadQuanHuyen('', callback);
                            });
                        }

                        controlSelectize();

                    },
                    onItemRemove: function() {
                        self.model.set({
                            [tinhthanh_object]: null,
                            [tinhthanh_id]: null,
                            [quanhuyen_object]: null,
                            [quanhuyen_id]: null,
                            [xaphuong_object]: null,
                            [xaphuong_id]: null
                        });
                        self.$el.find(quanhuyen_selector)[0].selectize.clear();
                        self.$el.find(xaphuong_selector)[0].selectize.clear();
                        controlSelectize();

                    }
                });
            };
            function selectizeQuanHuyen() {
                var $select = self.$el.find(quanhuyen_selector).selectize({
                    maxItems: 1,
                    valueField: "id",
                    labelField: "ten",
                    searchField: ["ten", "tenkhongdau"],
                    preload: true,
                    placeholder: 'Chọn quận huyện',

                    load: function(query, callback) {
                    },

                    onItemAdd: function(value, $item) {
                        var obj = $select[0].selectize.options[value];
                        var obj_quanhuyen = {
                            "id": obj.id,
                            "ten":obj.ten,
                            "tinhthanh_id": obj.tinhthanh_id
                        }
                        self.model.set({
                            [quanhuyen_object]: obj_quanhuyen,
                            [quanhuyen_id]: value
                        });

                        self.$el.find(xaphuong_selector)[0].selectize.clear();
                        self.$el.find(xaphuong_selector)[0].selectize.clearOptions();
                        
                        if (!!self.model.get(xaphuong_object) && self.model.get(xaphuong_object)['quanhuyen_id'] != value) {
                            self.model.set({
                                [xaphuong_id]: null,
                                [xaphuong_object]: null
                            })
                        }
                        if ((!!self.model.get(xaphuong_object) && self.model.get(xaphuong_object).quanhuyen_id != value) || !self.model.get(xaphuong_object) || !self.$el.find(xaphuong_selector)[0].selectize.getValue()) {
                            self.$el.find(xaphuong_selector)[0].selectize.load(function(callback) {
                                loadXaPhuong('', callback);
                            });
                        }
                        controlSelectize();

                    },
                    onItemRemove: function() {
                        self.model.set({
                            [quanhuyen_id]: null,
                            [quanhuyen]: null,
                            [xaphuong_id]: null,
                            [xaphuong_object]: null
                        });

                        self.$el.find(xaphuong_selector)[0].selectize.clear();
                        self.$el.find(xaphuong_selector)[0].selectize.clearOptions();  

                        controlSelectize();

                    }
                });
            };
            function selectizeXaPhuong() {
                var $select = self.$el.find(xaphuong_selector).selectize({
                    maxItems: 1,
                    valueField: "id",
                    labelField: "ten",
                    searchField: ["ten", "tenkhongdau"],
                    preload: true,
                    placeholder: 'Chọn xã phường',

                    load: function(query, callback) {
                    },

                    onItemAdd: function(value, $item) {
                        var obj = $select[0].selectize.options[value];
                        var obj_xaphuong ={
                            "id": obj.id,
                            "ten": obj.ten,
                            "quanhuyen_id": obj.quanhuyen_id
                        }
                        
                        self.model.set({
                            [xaphuong_object]: obj_xaphuong,
                            [xaphuong_id]: value,
                        });
                    },
                    onItemRemove: function() {
                        self.model.set({
                            [xaphuong_object]: null,
                            [xaphuong_id]: null
                        });
                        controlSelectize();
                    }
                });
            };
            selectizeTinhThanh();
            selectizeQuanHuyen();
            selectizeXaPhuong();
            controlSelectize();
        },
    });
});
