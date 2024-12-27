define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/view/quanlynuoitrong/phieunhapkho/tpl/phieunhap_dialog.html');
    var schema = require('json!app/view/quanlynuoitrong/phieunhapkho/PhieuNhapSchema.json');
    var ChungNhanCQDialogView = require('app/giaychungnhancq/ModelDialogView');
    var ChungNhanCODialogView = require('app/giaychungnhanco/ModelDialog');
    var ChungNhanCo = require('app/giaychungnhanco/ModelDialogThongke');
    var ChungNhanCq = require('app/giaychungnhancq/ModelDialogView');
    var   WarningDialog 	 	=	require('app/quanlykho/PhieuNhap/WarningDialog');



    return Gonrin.ModelDialogView.extend({
        template: template,
        modelSchema: schema,
        firstLoad: false,
        isViewCq: false,
        setCqId: false,
        setCqObject: false,
        isViewCo: false,
        setCoId: false,
        isSetObjCo: false,
        isSetKho: null,
		isSetIdKho: false,
		isViewKho: false,
        uiControl: {
            fields: [
                {
                    field: "thoigian_nhap",
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
                    field: "hansudung",
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
                    field: "donvitinh",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: "Kg", text: "Kg" },
                    ],
                },
            ]
        },
        tools: [
            {
                name: "defaultgr",
                type: "group",
                groupClass: "toolbar-group",
                buttons: [
                    {
                        name: "back",
                        type: "button",
                        buttonClass: "btn-secondary btn mr-1",
                        label: `<i class="fas fa-arrow-circle-left"></i> Đóng`,
                        command: function () {
                            var self = this;
                            self.close();
                        }
                    },
                    {
                        name: "save",
                        type: "button",
                        buttonClass: "btn-success btn width-sm",
                        label: `<i class="far fa-save"></i> Lưu`,
                        command: function () {
                            var self = this;
                            let thoigian_nhap = self.model.get("thoigian_nhap");
                            if (thoigian_nhap === undefined || thoigian_nhap === null || thoigian_nhap === "") {
                                self.getApp().notify({ message: "Vui lòng nhập thời gian nhập kho" }, { type: "danger", delay: 1000 });
                                return false;
                            }
                            let ma_kho = self.model.get("ma_kho");
                            if (ma_kho === undefined || ma_kho === null || ma_kho === "") {
                                self.getApp().notify({ message: "Vui lòng nhập kho nhập dược liệu" }, { type: "danger", delay: 1000 });
                                return false;
                            }
                            let soluong_thucte = self.model.get("soluong_thucte");
                            if (soluong_thucte === undefined || soluong_thucte === null || soluong_thucte === "") {
                                self.getApp().notify({ message: "Vui lòng nhập số lượng thực tế nhập kho" }, { type: "danger", delay: 1000 });
                                return false;
                            }
                            else{
                                if (Number(soluong_thucte) <=0){
                                    self.getApp().notify({message: "Vui lòng nhập số lượng lớn hơn 0"}, {type: "danger", delay: 1000});
                                    return false;
                                }
                            }
                            self.getApp().showloading();
                            $.ajax({
                                url: (self.getApp().serviceURL || "") + `/api/v1/phieunhapkho/create_nuoitrong`,
                                dataType: "json",
                                contentType: "application/json",
                                method: 'POST',
                                data: JSON.stringify(self.model.toJSON()),
                                success: function (response) {
                                    self.getApp().hideloading();
                                    if (!!response && !!response.error_code && response.error_code == "UPDATE_ERROR") {
                                        response.type = 'UPDATE';
                                        var warningDialog = new WarningDialog({"viewData": response});
                                        warningDialog.dialog({size: "large"});
                                    } else {
                                        self.getApp().notify("Lưu thông tin thành công");
                                        let params = response.phieunhap_chitiet;
                                        self.trigger("saveData", { data: params });
                                    }

                                },
                                error: function (xhr, status, error) {
                                    self.getApp().hideloading();
                                    try {
                                        if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                            self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                            self.getApp().getRouter().navigate("login");
                                        }
                                        else {
                                            self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                        }
                                    }
                                    catch (err) {
                                        self.getApp().notify({ message: "Có lỗi xảy ra vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
                                    }
                                },
                                complete: function () {
                                    self.close();
                                }
                            });
                        }
                    },
                ],
            }],
        render: function () {
            var self = this;
            self.firstLoad = false;
            self.isViewCq = false;
            self.setCqId = false;
            self.isViewCo = false;
            self.setCoId = false;
            self.isSetObjCo = false;
            self.isSetKho = false;
			self.isSetIdKho = false;
			self.isViewKho = false;
            var viewData = self.viewData;
            self.selectizeKho();
            if (viewData !== undefined && viewData !== null) {
                if (viewData.phieunhap_chitiet !== "" && viewData.phieunhap_chitiet !== undefined && viewData.phieunhap_chitiet !== null) {
                    self.model.set(viewData.phieunhap_chitiet);
                }
                let id_sanpham = viewData.id_sanpham;
                if (id_sanpham === undefined || id_sanpham === null || id_sanpham === "") {
                    self.getApp().notify({ message: "Tham số không hợp lệ" }, { type: "danger", delay: 1000 });
                    self.close();
                }
                else {
                    let sanpham = viewData.sanpham;
                    self.model.set("ma_sanpham", viewData.ma_sanpham);
                    self.model.set("ten_sanpham", viewData.ma_sanpham);
                    self.model.set("sanpham", sanpham);
                    let thuhoach_nuoitrong_id = viewData.thuhoach_nuoitrong_id;
                    if (!!thuhoach_nuoitrong_id) {
                        self.model.set("thuhoach_nuoitrong_id", thuhoach_nuoitrong_id);
                    }
                    self.selectizeDuoclieu(id_sanpham, sanpham);
                    self.selectizeCQ(id_sanpham);
                    self.selectizeCO(id_sanpham);
                    self.model.set("donvitinh", "Kg");
                    self.register(id_sanpham);
                    self.applyBindings();
                }
            }
            else {
                self.getApp().notify({ message: "Tham số không hợp lệ" }, { type: "danger", delay: 1000 });
                self.applyBindings();
                setTimeout(function () {
                    self.close();
                }, 1000);
            }

        },
        getData: function (phieunhap_id) {
            var self = this;
            $.ajax({
                url: (self.getApp().serviceURL || "") + `/api/v1/phieunhapkho/${phieunhap_id}`,
                dataType: "json",
                contentType: "application/json",
                method: 'GET',
                success: function (response) {
                    self.getApp().hideloading();
                },
                error: function (xhr, status, error) {
                    self.getApp().hideloading();
                    try {
                        if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED") {
                            self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                            self.getApp().getRouter().navigate("login");
                        } else {
                            self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                        }
                    }
                    catch (err) {
                        self.getApp().notify({ message: "Có lỗi xảy ra vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
                    }
                },
            });
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
                            { "donvi_id": { "$eq": donvi_id } },
							{"active": {"$eq": 1}}
                            ]
                        },
                        "order_by": [{ "field": "loai_uu_tien", "direction": "asc" }]
                    };
                    let objs = self.model.get("kho");
					if (!!objs && self.isSetKho === false){
						callback([objs]);
						self.isSetKho = true;
					}
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
                            var id = self.model.get("id");
                            if (!id) {
                                var khoChinh = res.objects.filter((value, index) => {
                                    return value.kho_mac_dinh === true;
                                })
                                if (khoChinh.length === 0) {
                                    if (res.objects.length > 0) {
                                        let tmp = res.objects[0];
                                        $selectize0[0].selectize.setValue([tmp.id]);
                                    }
                                }
                                else {
                                    let tmp = khoChinh[0];
                                    $selectize0[0].selectize.setValue([tmp.id]);
                                }
                            }
                            else {
								var khoId = self.model.get('ma_kho');
								if (!!khoId && self.isSetIdKho === false) {
									$selectize0[0].selectize.setValue(khoId);
									self.isSetIdKho = true;
								}
								$selectize0[0].selectize.disable();
                            }
                        }
                    });
                },
                onChange: function (value) {
                    var obj = $selectize0[0].selectize.options[value];
                    if (obj !== null && obj !== undefined) {
                        let id = self.model.get("id");
                        if (!id || self.setKho == true) {
                            self.model.set({
                                "ma_kho": value,
                                "ten_kho": obj.ten_kho,
                                "kho": obj
                            })
                        }
                        else {
                            self.setKho = true;
                        }
                    } else {
                        self.model.set({
                            "ma_kho": null,
                            "ten_kho": null,
                            "kho": null
                        })
                    }
                }
            });
        },
        selectizeDuoclieu: function (id_sanpham, sanpham) {
            var self = this;
            var $selectize = self.$el.find('#sanpham').selectize({
                valueField: 'id_sanpham',
                labelField: 'ten_sanpham',
                searchField: ['ten_sanpham', 'ten_khoa_hoc', 'tenkhongdau'],
                preload: true,
                render: {
                    option: function (item, escape) {
                        return `<div class="option">${item.ten_sanpham} - ${item.ten_khoa_hoc} - ${item.ma_viettat}</div>`;
                    }
                },
                load: function (query, callback) {
                    var query_filter = {
                        "filters": {
                            "$or": [
                                { "ten_sanpham": { "$likeI": (query) } },
                                { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                { "ten_khoa_hoc": { "$likeI": (query) } }
                            ]
                        }
                    };
                    if (!!sanpham) {
                        callback([sanpham]);
                    }
                    var url = (self.getApp().serviceURL || "") + '/api/v1/sanpham_donvi_filter?results_per_page=20' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function () {
                            callback();
                        },
                        success: function (res) {
                            callback(res.objects);
                            if (!!id_sanpham) {
                                var $selectz = (self.$el.find('#sanpham'))[0];
                                $selectz.selectize.setValue([id_sanpham]);
                                $selectz.selectize.disable();
                            }
                        }
                    });

                },
                onChange: function (value, isOnInitialize) {
                    var $selectz = (self.$el.find('#sanpham'))[0];
                    var obj = $selectz.selectize.options[value];
                    if (obj !== null && obj !== undefined) {
                        var id = self.model.get("id");
                        if (self.firstLoad === true || !id) {
                            // logic: nếu phiếu đó chưa có id - phiếu tạo mới thì set data vật tư
                            // k tính sự kiện onchange khi set data vật tư lần đầu
                            self.model.set({
                                "ten_sanpham": obj.ten_sanpham,
                                "ten_khoa_hoc": obj.ten_khoa_hoc,
                                "ma_sanpham": obj.ma_sanpham,
                                "id_sanpham": obj.id_sanpham,
                                "sanpham": obj
                            });
                        } else {
                            // sự kiện khi update phiếu, set data vật tư lần đầu
                            self.firstLoad = true;
                        }
                        self.$el.find(".ma_viet_tat").text(obj.ma_viettat);
                        self.$el.find(".ten_khoa_hoc").text(obj.ten_khoa_hoc);
                    }
                    else {
                        self.model.set({
                            "ten_sanpham": null,
                            "ten_khoa_hoc": null,
                            "ma_sanpham": null,
                            "id_sanpham": null,
                            "sanpham": null
                        });
                    }
                }
            });
        },
        selectizeCQ: function (id_sanpham) {
            var self = this;
            var currentUser = self.getApp().currentUser;
            var donvi_id = "";
            if (!!currentUser && !!currentUser.donvi_id) {
                donvi_id = currentUser.donvi_id;
            }
            var $selectize = self.$el.find('#selectize-cq').selectize({
                valueField: 'id',
                labelField: 'ma_kiem_nghiem',
                searchField: ['ma_kiem_nghiem'],
                preload: true,
                render: {
                    option: function (item, escape) {

                        return `<div class="option">${item.ma_kiem_nghiem}
                        <div>Tên dược liệu: ${item.ten_sanpham}</div>
                        <div>Số lô: ${item.so_lo}</div>
                        </div>`;
                    }
                },
                load: function (query, callback) {
                    var query_filter = "";
                    if (!!id_sanpham) {
                        let so_lo = self.model.get("so_lo");
                        if (!!so_lo) {
                            query_filter = {
                                "filters": {
                                    "$and": [
                                        {
                                            "$or": [
                                                { "ma_kiem_nghiem": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                                { "ten_sanpham": { "$likeI": (query) } }

                                            ]
                                        },
                                        { "id_sanpham": { "$eq": id_sanpham } },
                                        { "so_lo": { "$eq": so_lo } },
                                        { "donvi_id": { "$eq": donvi_id } },
                                    ]

                                }
                            };
                        }
                        else {
                            query_filter = {
                                "filters": {
                                    "$and": [
                                        {
                                            "$or": [
                                                { "ma_kiem_nghiem": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                                { "ten_sanpham": { "$likeI": (query) } }

                                            ]
                                        },
                                        { "id_sanpham": { "$eq": id_sanpham } },
                                        { "donvi_id": { "$eq": donvi_id } },
                                    ]

                                }
                            };
                        }

                    }
                    else {
                        query_filter = {
                            "filters": {
                                "$and": [
                                    {
                                        "$or": [
                                            { "ma_kiem_nghiem": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                            { "ten_sanpham": { "$likeI": (query) } }

                                        ]
                                    },
                                    { "donvi_id": { "$eq": donvi_id } },

                                ]

                            }
                        };
                    }

                    var url = (self.getApp().serviceURL || "") + '/api/v1/phieu_kiem_nghiem_filter?' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function () {
                            callback();
                        },
                        success: function (res) {
                            callback(res.objects);
                            var phieu_kiem_nghiem_id = self.model.get("phieu_kiem_nghiem_id");
                            if (!!phieu_kiem_nghiem_id && self.setCqId === false) {
                                $selectize[0].selectize.setValue(phieu_kiem_nghiem_id);
                                self.setCqId = true;
                            }
                        }
                    });

                },
                onChange: function (value, isOnInitialize) {
                    var $selectz = (self.$el.find('#selectize-cq'))[0]
                    var obj = $selectz.selectize.options[value];
                    if (!!obj) {
                        let id = self.model.get("id");
                        if (!id || self.isViewCq === true) {
                            self.model.set({
                                "ma_kiem_nghiem": obj.ma_kiem_nghiem,
                                "phieu_kiem_nghiem_id": obj.id,
                            });
                            let so_lo = self.model.get("so_lo");
                            if (so_lo === undefined || so_lo === null || so_lo === "") {
                                if (!!obj.so_lo) {
                                    self.model.set("so_lo", obj.so_lo);
                                }
                            }
                        }
                        else {
                            let phieu_kiem_nghiem_id = self.model.get("phieu_kiem_nghiem_id");
                            if (phieu_kiem_nghiem_id === null || phieu_kiem_nghiem_id === undefined || phieu_kiem_nghiem_id === "") {
                                self.model.set({
                                    "ma_kiem_nghiem": obj.ma_kiem_nghiem,
                                    "phieu_kiem_nghiem_id": obj.id
                                });
                            }
                            self.isViewCq = true;
                        }
                        self.$el.find("#view-cq").removeClass("d-none");
                        self.$el.find("#view-cq").unbind("click").bind("click", (e)=>{
                            e.stopPropagation();
                            let cq = new ChungNhanCq({viewData: {"id" :  self.model.get("phieu_kiem_nghiem_id")}});
                            cq.dialog({size: "large"});
                        })
                    }
                    else {
                        self.$el.find("#view-cq").addClass("d-none");
                        self.model.set({
                            "ma_kiem_nghiem": null,
                            "phieu_kiem_nghiem_id": null,
                        });
                        let id = self.model.get("id");
                        if (!id) {
                            self.model.set("so_lo", null);
                        }
                    }
                }
            });
        },
        selectizeCO: function (id_sanpham) {
            var self = this;
            var currentUser = self.getApp().currentUser;
            var donvi_id = "";
            if (!!currentUser && !!currentUser.donvi_id) {
                donvi_id = currentUser.donvi_id;
            }
            var $selectize = self.$el.find('#selectize-co').selectize({
                valueField: 'id',
                labelField: 'so_co',
                searchField: ['so_co', 'ten_sanpham', 'ma_sanpham'],
                preload: true,
                maxOptions: 10,
                maxItems: 1,
                render: {
                    option: function (item, escape) {

                        return `<div class="option">${item.so_co}
                        <div>Tên dược liệu: ${item.ten_sanpham}</div>
                        </div>`;
                    }
                },
                load: function (query, callback) {
                    var query_filter = "";
                    if (!!id_sanpham) {
                        query_filter = {
                            "filters": {
                                "$and": [
                                    { "so_co": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                    { "donvi_id": { "$eq": donvi_id } },
                                    { "id_sanpham": { "$eq": id_sanpham } }
                                ]

                            }
                        };
                    }
                    else {
                        query_filter = {
                            "filters": {
                                "$and": [
                                    { "so_co": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                    { "donvi_id": { "$eq": donvi_id } }
                                ]

                            }
                        };
                    }
                    let so_chungnhan_co = self.model.get("so_chungnhan_co");
                    let chungnhan_co_id = self.model.get("chungnhan_co_id");
                    let chungnhan_co_chitiet_id = self.model.get("chungnhan_co_chitiet_id");
                    if (!!chungnhan_co_id && !!so_chungnhan_co && self.isSetObjCo === false) {
                        let objs = {
                            chungnhan_id: chungnhan_co_id,
                            so_co: so_chungnhan_co,
                            id: chungnhan_co_chitiet_id
                        }
                        callback([objs]);
                        self.isSetObjCo = true;
                    }
                    var url = (self.getApp().serviceURL || "") + '/api/v1/giaychungnhanco_chitiet_filter?' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function () {
                            callback();
                        },
                        success: function (res) {
                            callback(res.objects);
                            var chungnhan_co_chitiet_id = self.model.get("chungnhan_co_chitiet_id");
                            if (!!chungnhan_co_chitiet_id && self.setCoId === false) {
                                $selectize[0].selectize.setValue([chungnhan_co_chitiet_id]);
                                self.setCoId = true;
                            }
                        }
                    });
                },
                onChange: function (value, isOnInitialize) {
                    var $selectz = (self.$el.find('#selectize-co'))[0];
                    var obj = $selectz.selectize.options[value];
                    if (obj !== undefined && obj !== null) {
                        let id = self.model.get("id");
                        if (!id || self.isViewCo === true) {
                            var so_chungnhan_co = obj.so_co;
                            var chungnhan_co_id = obj.chungnhan_id;
                            self.model.set({
                                "so_chungnhan_co": so_chungnhan_co,
                                "chungnhan_co_id": chungnhan_co_id,
                                "chungnhan_co_chitiet_id": obj.id
                            });
                        }
                        else {
                            let chungnhan_co_id = self.model.get("chungnhan_co_id");
                            if (chungnhan_co_id === undefined || chungnhan_co_id === null || chungnhan_co_id === "") {
                                self.model.set({
                                    "so_chungnhan_co": obj.so_co,
                                    "chungnhan_co_id": obj.chungnhan_id,
                                    "chungnhan_co_chitiet_id": obj.id
                                });
                            }
                            self.isViewCo = true;
                        }
                        self.$el.find("#view-co").removeClass("d-none");
                        self.$el.find("#view-co").unbind("click").bind("click", (e)=>{
                            e.stopPropagation();
                            let co = new ChungNhanCo({viewData: {"id" :  self.model.get("chungnhan_co_id")}});
                            co.dialog({size: "large"});
                        })
                    }
                    else {
                        self.$el.find("#view-co").addClass("d-none");
                        self.model.set({
                            "so_chungnhan_co": null,
                            "chungnhan_co_id": null,
                            "chungnhan_co_chitiet_id": null
                        })
                    }
                }
            });
        },
        register: function(id_sanpham){
            var self = this;
            let so_lo = self.model.get("so_lo");
            let ma_sanpham = self.model.get("ma_sanpham");
            let ten_sanpham = self.model.get("ten_sanpham");
            let sanpham = self.model.get("sanpham");
            let params = {
                id_sanpham,
                ma_sanpham,
                ten_sanpham,
                sanpham,
                so_lo
            }
            self.$el.find(".btn-new-cq").unbind("click").bind("click", ()=>{
                var chungNhanCQDialogView = new ChungNhanCQDialogView({ viewData: params });
                chungNhanCQDialogView.dialog({ size: "large" });
                chungNhanCQDialogView.on('saveDataCQDialog', function(e, data) {
                    if (!!self.$el.find('#selectize-cq')[0].selectize) {
                        self.$el.find('#selectize-cq')[0].selectize.destroy();
                    }
                    if (!!e && e.id_sanpham == self.model.get('id_sanpham')) {

                        self.model.set({
                            "ma_kiem_nghiem": e.ma_kiem_nghiem,
                            "phieu_kiem_nghiem_id": e.id
                        })
                    }
                    self.selectizeCQ(id_sanpham);
                })
            });

            self.$el.find(".btn-new-co").unbind("click").bind("click", ()=>{
                var chungNhanCO = new ChungNhanCODialogView({viewData: {"id_sanpham": id_sanpham}});
                chungNhanCO.dialog({size: "large"});
                chungNhanCO.on("saveCO", function(e){
                    if (!!self.$el.find('#selectize-co')[0].selectize) {
                        self.$el.find('#selectize-co')[0].selectize.destroy();
                    }
                    // if (!!e){
                    //     self.model.set({
                    //         "so_chungnhan_co": e.so_co,
                    //         "chungnhan_co_id": e.id
                    //     })
                    // }
                    self.isSetObjCo = false;
                    self.setCoId = false;
                    self.selectizeCO(id_sanpham);
                })
            })
        }
    });
});