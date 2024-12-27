define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/danhmuc/danhmuc_sanpham/DonViSanXuatNhapKhau/tpl/model.html'),
        schema = require('json!schema/DanhMucDonViSanXuatNhapKhauSchema.json');
    var RejectDialogView = require('app/bases/RejectDialogView');
    return Gonrin.ModelDialogView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "donvisanxuat_nhapkhau",
        flagReset: true,
        uiControl: {
            fields: [
                {
                    field: "loai_donvi",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: 1, text: "Ngoài nước" },
                        { value: 2, text: "Trong nước" }
                    ],
                }
            ]
        },
        tools: [{
            name: "back",
            type: "button",
            buttonClass: "btn-secondary waves-effect width-sm",
            label: `<i class="fas fa-times-circle"></i> Đóng`,
            command: function () {
                var self = this;
                self.close();
            }
        },
        {
            name: "save",
            type: "button",
            buttonClass: "btn-success width-sm ml-2",
            label: `<i class="far fa-save"></i> Lưu`,
            command: function () {
                var self = this;
                var isValid = self.validateData();
                if (!isValid) {
                    return;
                }
                self.model.save(null, {
                    success: function (model, respose, options) {
                        self.getApp().notify("Lưu thông tin thành công");
                        // self.getApp().getRouter().navigate(self.collectionName + "/collection");
                        self.trigger("saveData");
                        self.close();
                    },
                    error: function (xhr, status, error) {
                        self.getApp().hideloading();
                        try {
                            if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                self.getApp().getRouter().navigate("login");
                            } else {
                                self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                            }
                        } catch (err) {
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
            label: `<i class="fas fa-trash-alt"></i> Xóa`,
            visible: function () {
                var self = this;
                return (!!self.viewData && self.viewData.id) ? true : false;
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
                                } else {
                                    self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                }
                            } catch (err) {
                                self.getApp().notify({ message: "Xóa thông tin không thành công" }, { type: "danger", delay: 1000 });
                            }
                        }
                    });
                });
            }
        },
        ],
        render: function () {
            var self = this;
            // var id = this.getApp().getRouter().getParam("id");
            var id = !!self.viewData ? self.viewData.id : null;
            if (id) {
                //progresbar quay quay
                this.model.set('id', id);
                this.model.fetch({
                    success: function (data) {
                        self.applyBindings();
                    },
                    error: function () {
                        self.getApp().notify("Get data Eror");
                    },
                });
            } else {
                self.applyBindings();
            }
            self.selectizeQuocGia();

        },
        validateData: function () {
            var self = this;
            // if (!self.model.get('ma_donvi')) {
            //     self.getApp().notify({ message: "Chưa nhập mã đơn vị" }, { type: "danger", delay: 1000 });
            //     return false;
            // }
            if (!self.model.get('ten_donvi')) {
                self.getApp().notify({ message: "Vui lòng nhập tên doanh nghiệp" }, { type: "danger", delay: 1000 });
                return false;
            }
            var loai_donvi = self.model.get("loai_donvi");
            if (loai_donvi === undefined || loai_donvi === null) {
                self.getApp().notify({ message: "Vui lòng chọn loại doanh nghiệp" }, { type: "danger", delay: 1000 });
                return false;
            }

            return true;
        },

        selectizeQuocGia: function () {
            var self = this;
            var set = false;
            var $selectize0 = self.$el.find('#selectize-quocgia').selectize({
                maxItems: 1,
                valueField: 'id',
                labelField: 'ten',
                searchField: ['ten', 'ma', 'tenkhongdau'],
                preload: true,
                load: function (query, callback) {
                    if (set == false) {
                        set = true;
                        if (!!self.model.get('quocgia_id')) {
                            callback([self.model.get('quocgia')]);
                            $selectize0[0].selectize.setValue(self.model.get('quocgia_id'));
                        } else {
                            callback([{ "id": "VN", "ten": "Việt Nam", "tenkhongdau": "viet nam" }]);
                            $selectize0[0].selectize.setValue("VN");
                        }
                    }
                    var query_filter = {
                        "filters": {
                            "$or": [
                                { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                { "ma": { "$eq": query } }
                            ],
                        },
                        // "order_by": [{ "field": "douutien", "direction": "desc" }, { "field": "ten", "direction": "asc" }]

                    };

                    var url = (self.getApp().serviceURL || "") + '/api/v1/quocgia?page=1&results_per_page=300' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
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

                    if (obj != null && obj != undefined) {
                        self.model.set({
                            'quocgia_id': value,
                            'quocgia': obj
                        })
                    } else {
                        self.model.set({
                            'quocgia_id': null,
                            'quocgia': null
                        })
                    }
                }
            });
        },

    });

});