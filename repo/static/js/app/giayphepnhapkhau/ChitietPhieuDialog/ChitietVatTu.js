define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/giayphepnhapkhau/ChitietPhieuDialog/tpl/model.html'),
        schema = require('json!schema/GiayPhepNhapKhauChiTietSchema.json');
    var danhmuc_donvitinh = require("json!app/constant/donvitinh.json");
    return Gonrin.ModelDialogView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "giayphep_nhapkhau_chitiet",
        check_setdata: false,
        hasViewData: false,
        clickSave:false,
        isSetObject: false,
        isSetQuocGiaSX: false,
        isSetIdQuocGiaSX: false,
        isSetQuocGiaCU: false,
        isSetIdQuocGiaCU: false,
        firstQuocGiaSX: false,
        uiControl: {
            fields: [{
                field: "donvitinh",
                uicontrol: "combobox",
                textField: "text",
                valueField: "value",
                dataSource: danhmuc_donvitinh,
                value: "Kg"
            }]
        },
        render: function() {
            var self = this;
            self.isSetObject = false;
            self.clickSave = false;
            self.check_setdata = false;
            self.hasViewData = false;
            self.eventClickButton();

            var viewData_data = self.viewData.data;
            var so_giay_phep = self.viewData.so_giay_phep;
            var thoigian_capphep = self.viewData.thoigian_capphep;
            var thoigian_hieuluc_batdau = self.viewData.thoigian_hieuluc_batdau;
            var thoigian_hieuluc_ketthuc = self.viewData.thoigian_hieuluc_ketthuc;
            var giayphep_id = self.viewData.giayphep_id;

            if (!!viewData_data && viewData_data !== undefined && viewData_data !== null) {
                self.hasViewData = true;
                self.model.set(viewData_data);
                self.applyBindings();
            } else {

                self.model.set({
                    'so_giay_phep': so_giay_phep,
                    'thoigian_capphep': thoigian_capphep,
                    'thoigian_hieuluc_batdau': thoigian_hieuluc_batdau,
                    'thoigian_hieuluc_ketthuc': thoigian_hieuluc_ketthuc,
                    'giayphep_id': giayphep_id
                })

                self.applyBindings();
            }
            if (!self.model.get('donvitinh')) {
                self.model.set('donvitinh', 'Kg');
            }
            self.selectizeDuoclieu();
            self.selectizeQuocGiaCungCap();
            self.selectizeQuocGiaSanXuat();
            self.selectizeTieuChuanChatLuong();
            return this;
        },
        eventClickButton: function() {
            var self = this;
            self.$el.find('.btn-close').unbind("click").bind("click", function(e) {
                e.stopPropagation();
                self.close();
            });
            self.$el.find('.btn-save').unbind("click").bind("click", function(e) {
                e.stopPropagation();
                if (self.clickSave === true){
                    return false;
                }
                var sanpham = self.model.get("sanpham");
                if (!sanpham || sanpham == null || sanpham == undefined || sanpham == "") {
                    self.getApp().notify({ message: "Vui lòng chọn dược liệu" }, { type: "danger", delay: 1000 });
                    return;
                }

                if (!self.model.get('donvitinh')) {
                    self.getApp().notify({ message: "Chưa nhập đơn vị tính" }, { type: "danger", delay: 1000 });
                    return;
                }

                let soluong_capphep = self.model.get("soluong_capphep");
                if (soluong_capphep === undefined || soluong_capphep === null || soluong_capphep === ""){
                    self.getApp().notify({message:"Vui lòng nhập số lượng cấp phép"}, {type: "danger", delay : 1000});
                    return false;
                }
                else{
                    if (Number(soluong_capphep) <=0){
                        self.getApp().notify({message:"Vui lòng nhập số lượng cấp phép lớn hơn 0"}, {type: "danger", delay : 1000});
                        return false;
                    }
                }

                var currentUser = gonrinApp().currentUser;
                if (currentUser && currentUser.donvi_id !== null) {
                    self.model.set("donvi_id", currentUser.donvi_id);
                    // self.model.set("donvi", currentUser.donvi);
                }
                self.clickSave = true;
                self.getApp().showloading();
                self.model.save(null, {
                    success: function(model, respose, options) {
                        self.model.set(model.attributes);
                        self.getApp().notify("Lưu thông tin thành công");
                        self.trigger("saveVattu", { "data": self.model.toJSON() });
                    },
                    error: function(xhr, status, error) {
                        try {
                            if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                self.getApp().getRouter().navigate("login");
                            } else {
                                self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 3000 });
                            }
                        } catch (err) {
                            self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 3000 });
                        }
                    },
                    complete: function() {
                        self.getApp().hideloading();
                        self.clickSave = false;
                        self.close();
                    }
                });

            });
        },
        selectizeQuocGiaSanXuat: function() {
            var self = this;
            var $selectize0 = self.$el.find('#selectize-quocgia-sanxuat').selectize({
                maxItems: 1,
                valueField: 'id',
                labelField: 'ten',
                searchField: ['ten', 'ma'],
                preload: true,
                load: function(query, callback) {
                    var query_filter = {
                        "filters": {
                            "$or": [
                                { "ten": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                { "ma": { "$eq": query } }
                            ],
                        },
                        "order_by": [{ "field": "douutien", "direction": "desc" }, { "field": "ten", "direction": "asc" }]

                    };

                    let quocgia_sanxuat = self.model.get("quocgia_sanxuat");
                    if (!!quocgia_sanxuat && self.isSetQuocGiaSX === false){
                        callback([quocgia_sanxuat]);
						self.isSetQuocGiaSX = true;
                    }

                    var url = (self.getApp().serviceURL || "") + '/api/v1/quocgia_filter?page=1&results_per_page=20' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                            var vietnam = res.objects.find((value, index) => {
                                return value.ma == 'VN';
                            })
                            if (!!self.model.get("quocgia_sanxuat_id") && self.isSetIdQuocGiaSX == false) {
                                $selectize0[0].selectize.setValue(self.model.get('quocgia_sanxuat_id'));
                                self.isSetIdQuocGiaSX = true;
                            } else {
                                if (!!vietnam) {
                                    $selectize0[0].selectize.setValue(vietnam.id);
                                }
                            }
                        }
                    });
                },
                onChange: function(value) {
                    var obj = $selectize0[0].selectize.options[value];

                    if (obj != null && obj != undefined) {
                        self.model.set({
                            'quocgia_sanxuat_id': value,
                            'quocgia_sanxuat': obj
                        })
                    } else {
                        self.model.set({
                            'quocgia_sanxuat_id': null,
                            'quocgia_sanxuat': null
                        })
                    }
                }
            });
        },
        selectizeQuocGiaCungCap: function() {
            var self = this;
            var $selectize0 = self.$el.find('#selectize-quocgia-cungcap').selectize({
                maxItems: 1,
                valueField: 'id',
                labelField: 'ten',
                searchField: ['ten', 'ma'],
                preload: true,
                load: function(query, callback) {
                    var query_filter = {
                        "filters": {
                            "$or": [
                                { "ten": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                { "ma": { "$eq": query } }
                            ],
                        },
                        "order_by": [{ "field": "douutien", "direction": "desc" }, { "field": "ten", "direction": "asc" }]

                    };

                    let quocgia_cungcap = self.model.get("quocgia_cungcap");
                    if (!!quocgia_cungcap && self.isSetQuocGiaCU === false){
                        callback([quocgia_cungcap]);
						self.isSetQuocGiaCU = true;
                    }

                    var url = (self.getApp().serviceURL || "") + '/api/v1/quocgia_filter?page=1&results_per_page=20' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                            var vietnam = res.objects.find((value, index) => {
                                return value.ma == 'VN';
                            })
                            if (!!self.model.get("quocgia_cungcap_id") && self.isSetIdQuocGiaCU === false) {
                                $selectize0[0].selectize.setValue(self.model.get('quocgia_cungcap_id'));
                                self.isSetIdQuocGiaCU = true;
                            } else {
                                if (!!vietnam) {
                                    $selectize0[0].selectize.setValue(vietnam.id);
                                }
                            }
                        }
                    });
                },
                onChange: function(value) {
                    var obj = $selectize0[0].selectize.options[value];
                    if (obj != null && obj != undefined) {
                        self.model.set({
                            'quocgia_cungcap_id': value,
                            'quocgia_cungcap': obj
                        })
                    } else {
                        self.model.set({
                            'quocgia_cungcap_id': null,
                            'quocgia_cungcap': null
                        })
                    }
                }
            });
        },
        selectizeTieuChuanChatLuong: function() {
            var self = this;
            var $select = self.$el.find("#tieuchuan_chatluong").selectize({
                maxItems: 1,
                valueField: "id",
                labelField: "ma_tieuchuan",
                searchField: ["ten_tieuchuan", "tenkhongdau", "ma_tieuchuan"],
                preload: true,
                placeholder: "Tiêu chuẩn chất lượng",
                render: {
                    option: function(item, escape) {
                        return `<div class="option">${item.ma_tieuchuan} - ${item.ten_tieuchuan}</div>`;
                    }
                },
                load: function(query, callback) {
                    var query_filter = {
                        "filters": {
                            "$and": [
                                { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } }
                            ],
                        },
                        "order_by": [{ "field": "ten_tieuchuan", "direction": "asc" }]
                    };
                    var url =
                        (self.getApp().serviceURL || "") + "/api/v1/tieuchuan?results_per_page=100" + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: "GET",
                        dataType: "json",
                        success: function(response) {
                            callback(response.objects);
                            if (!!self.model.get('tieuchuan_chatluong_id')) {
                                self.$el.find('#tieuchuan_chatluong')[0].selectize.setValue(self.model.get('tieuchuan_chatluong_id'))
                            }
                        },
                        error: function() {
                            callback();
                        },
                    });
                },

                onItemAdd: function(value, $item) {
                    var obj = $select[0].selectize.options[value];
                    delete obj.$order;
                    self.model.set({
                        "tieuchuan_chatluong": obj,
                        "tieuchuan_chatluong_id": value,
                    });
                },
                onItemRemove: function() {
                    self.model.set({
                        "tieuchuan_chatluong": null,
                        "tieuchuan_chatluong_id": null
                    });
                }
            });
        },
        selectizeDuoclieu: function(){
            var self = this;
            var $selectize = self.$el.find('#selectize-programmatic').selectize({
                valueField: 'id_sanpham',
                labelField: 'ten_sanpham',
                searchField: ['ten_sanpham', 'ten_khoa_hoc', 'tenkhongdau'],
                preload: true,
                render: {
                    option: function(item, escape) {
                        return `<div class="option">${item.ten_sanpham} - ${item.ten_khoa_hoc} - ${item.ma_viettat}</div>`;
                    }
                },
                load: function(query, callback) {
                    var query_filter = {
                        "filters": {
                            "$or": [
                                { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                { "ten_sanpham": { "$likeI": (query) } },
                                { "ten_khoa_hoc": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                { "ma_sanpham": { "$likeI": gonrinApp().convert_khongdau(query) } }
                            ]
                        }
                        // "order_by" : [{"field": "tenkhongdau", "direction": "asc"}]
                    };
                    let sanpham = self.model.get("sanpham");
					if (!!sanpham && self.isSetObject === false){
                        callback([sanpham]);
						self.isSetObject = true;
					}
                    var url = (self.getApp().serviceURL || "") + '/api/v1/sanpham_donvi_filter?results_per_page=20' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                            var id_sanpham = self.model.get("id_sanpham");
                            if (self.check_setdata == false && self.hasViewData == true && !!id_sanpham) {
                                // self.check_setdata = true;
                                var $selectz = (self.$el.find('#selectize-programmatic'))[0]
                                $selectz.selectize.setValue([id_sanpham]);
                            }
                        }
                    });

                },
                onChange: function(value, isOnInitialize) {
                    var $selectz = (self.$el.find('#selectize-programmatic'))[0]
                    var obj = $selectz.selectize.options[value];
                    if (obj !== null && obj !== undefined) {
                        // var id = self.model.get("id");
                        // if (self.check_setdata == true || !id) {
                        // logic: nếu phiếu đó chưa có id - phiếu tạo mới thì set data vật tư
                        // k tính sự kiện onchange khi set data vật tư lần đầu
                        self.model.set({
                            "ten_sanpham": obj.ten_sanpham,
                            "ma_sanpham": obj.ma_sanpham,
                            "id_sanpham": obj.id_sanpham,
                            "sanpham": obj,
                            "ten_khoahoc": obj.ten_khoa_hoc,
                            "bophan_sudung": obj.bophan_sudung
                        });
                        // } else {
                        //     // sự kiện khi update phiếu, set data vật tư lần đầu
                        //     // self.check_setdata = true;
                        // }
                        self.$el.find('.info_duoclieu').html(`
                            <small><b>Chi tiết:</b> ${obj.ten_sanpham} - ${obj.ten_khoa_hoc}</small>
                        `);

                    } else {
                        self.model.set({
                            "ten_sanpham": null,
                            "ma_sanpham": null,
                            "id_sanpham": null,
                            "sanpham": null,
                            "ten_khoahoc": null,
                            "bophan_sudung": null
                        });
                    }


                }
            });
        }
    });

});