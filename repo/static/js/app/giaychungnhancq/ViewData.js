define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/giaychungnhancq/tpl/viewdata.html'),
        schema = require('json!schema/PhieuKiemNghiemSchema.json');
    var DialogKetQua = require('app/giaychungnhancq/ChitietPhieuDialog/DialogKetQua');

    var ManageFileVIew = require("app/view/AttachFile/ManageFileUploadView");


    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "phieu_kiem_nghiem",
        tools: [{
            name: "defaultgr",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [
                {
                    name: "back",
                    type: "button",
                    buttonClass: "btn-secondary btn",
                    label: `<i class="fas fa-arrow-circle-left"></i> Quay lại`,
                    command: function() {
                        var self = this;
                        Backbone.history.history.back();
                    }
                }
            ],
        }],
        uiControl: {
            fields: [{
                    field: "active",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: 1, text: "Đang hoạt động" },
                        { value: 0, text: "ngừng hoạt động" },
                    ],
                },
                {
                    field: "ngay_kiem_nghiem",
                    uicontrol: "datetimepicker",
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
                },
                {
                    field: "ngay_nhan_mau",
                    uicontrol: "datetimepicker",
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
                },
                {
                    field: "ngay_bao_cao",
                    uicontrol: "datetimepicker",
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
                },
                {
                    field: "ngay_san_xuat",
                    uicontrol: "datetimepicker",
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
                },
                {
                    field: "han_su_dung",
                    uicontrol: "datetimepicker",
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
                },
                // {
                //     field: "tieu_chuan_kiem_nghiem",
                //     uicontrol: "combobox",
                //     textField: "text",
                //     valueField: "value",
                //     cssClass: "form-control",
                //     dataSource: [
                //         { value: "WO", text: "WO-Wholly Obtained" },
                //         { value: "PE", text: "PE-Produced Entirely" },
                //         { value: "RVC", text: "RVC-Regional Value Content" },
                //         { value: "CTC", text: "CTC-Change in Tariff" },
                //         { value: "PSRs", text: "PSRs-Product Specific Rules" },
                //         { value: "GR", text: "GR-General Rule" },
                //         { value: "SP", text: "SP-Specific Process" },
                //         { value: "PE", text: "PE-De Minimis" },
                //         { value: "Cumulation", text: "Cumulation" },
                //     ],
                // },
            ]
        },
        render: function() {
            var self = this;
            var id = this.getApp().getRouter().getParam("id");
            self.regester_add_ketqua();
            if (id) {
                this.model.set('id', id);
                this.model.fetch({
                    success: function(data) {
                        self.applyBindings();
                        var fileView = new ManageFileVIew({ viewData: { "listFile": self.model.get('chungtu_dinhkem'), "$el_btn_upload": self.$el.find(".btn-add-file") }, el: self.$el.find(".list-attachment") });
                        fileView.render();
                        fileView.on("change", (event) => {
                            var listfile = event.data;
                            self.model.set('chungtu_dinhkem', listfile);
                        });
                        var ketqua = self.model.get("ket_qua");
                        if (ketqua === undefined || ketqua === null) {
                            ketqua = [];
                        }
                        ketqua.forEach((value, index) => {
                            self.render_ketqua(value);
                        })
                        self.initData();
                        self.showData();
                    },
                    error: function() {
                        self.getApp().notify(self.getApp().traslate("TRANSLATE:error_load_data"));
                    },
                    complete: function() {

                    }

                });
            } else {
                self.applyBindings();
            }
        },
        regester_add_ketqua: function() {
            var self = this;
            self.$el.find(".btn-add-ketqua").unbind("click").bind("click", function(e) {
                e.stopPropagation();
                var ketquakiemnghiem = new DialogKetQua();
                ketquakiemnghiem.dialog();
                ketquakiemnghiem.on("saveData", function(event) {
                    var data = event.data;
                    var ketqua = self.model.get('ket_qua');
                    if (ketqua == null || ketqua == undefined || ketqua == "") {
                        ketqua = [];
                    }
                    if (ketqua instanceof Array) {
                        var list_ketqua = [];
                        var exist = false;
                        ketqua.forEach((value, index) => {
                            if (value.id == data.id) {
                                exist = true;
                            } else {
                                list_ketqua.push(value);
                            }
                        });
                        list_ketqua.push(data);
                        self.model.set("ket_qua", list_ketqua);
                        if (exist == false) {
                            self.render_ketqua(data);
                        }
                    }
                });
            });
        },
        render_ketqua: function(data) {
            var self = this;
            var id = data.id;
            var chitieukiemtra = data.chitieukiemtra;
            var noidung = data.noidung;
            var ketqua = data.ketqua;
            var ketluan = data.ketluan;
            self.$el.find(".table-ket-qua-kiem-nghiem tbody").append(`<tr id = "` + id + `">
			<td class ="chitieukiemtra">` + (chitieukiemtra? chitieukiemtra : "") + `</td> 
            <td class="noidung">` + (noidung? noidung : "") + `</td>
            <td class="ketqua">` + (ketqua? ketqua : "") + `</td>
			<td class="ketluan">` + ((ketluan == "1") ? "Đạt" : "Không Đạt") + `</td>
            <td class="text-center"><a href="javascript:;" class="demo-delete-row btn btn-danger btn-xs btn-icon" 
            title="Xóa"><i class="fa fa-times"></i></a>
            <a href="javascript:;"  class="demo-edit-row btn btn-success btn-xs btn-icon" title="Sửa"><i class="mdi mdi-pencil"></i></a>
            </td>
			</tr>`)
            self.$el.find("#" + id + " .demo-delete-row").unbind("click").bind("click", function() {
                var ketqua = self.model.get('ket_qua');
                if (ketqua == null || ketqua == undefined || ketqua == "") {
                    ketqua = [];
                }
                if (ketqua instanceof Array) {
                    var list_ketqua = [];
                    ketqua.forEach((value, index) => {
                        if (value.id == data.id) {} else {
                            list_ketqua.push(value);
                        }
                    });
                    self.model.set("ket_qua", list_ketqua);
                }
                self.$el.find("#" + id).remove();
            });
            self.$el.find("#" + id + " .demo-edit-row").unbind("click").bind("click", { obj: data } ,function(e){
                e.stopPropagation();
                var obj_data = e.data.obj;
                var ketquakiemnghiem = new DialogKetQua({viewData : obj_data});
                ketquakiemnghiem.dialog();
                ketquakiemnghiem.on("saveData", function(event){
                    var data = event.data;

                    var ketqua = self.model.get('ket_qua');
                    if (ketqua == null || ketqua == undefined || ketqua == "") {
                        ketqua = [];
                    }
                    if (ketqua instanceof Array) {
                        var list_ketqua = [];
                        var exist = false;
                        ketqua.forEach((value, index) => {
                            if (value.id == data.id) {
                                exist = true;
                            } else {
                                list_ketqua.push(value);
                            }
                        });
                        list_ketqua.push(data);
                        self.model.set("ket_qua", list_ketqua);
                        if (exist == false) {
                            self.render_ketqua(data);
                        }
                        else{
                            self.$el.find('tr#' + data.id + " .chitieukiemtra").html(data.chitieukiemtra);
                            self.$el.find('tr#' + data.id + " .noidung").html(data.noidung);
                            self.$el.find('tr#' + data.id + " .ketqua").html(data.ketqua);
                            var ketluan = data.ketluan;
                            self.$el.find('tr#' + data.id + " .ketluan").html(((ketluan == "1") ? "Đạt" : "Không Đạt"));
                        }
                    }
                })
            });
        },
        initData: function(){
            var self = this;

            let sanpham = self.model.get("sanpham");
            if (!!sanpham){
                self.$el.find(`.info_duoclieu`).text(`${sanpham.ten_sanpham} - ${sanpham.ma_sanpham} - ${sanpham.ten_khoa_hoc}`);
            }

            let ngay_kiem_nghiem = self.model.get("ngay_kiem_nghiem");
            if (!!ngay_kiem_nghiem){
                self.$el.find(`.ngay_kiem_nghiem`).text(gonrinApp().parseInputDateString(ngay_kiem_nghiem).format('DD/MM/YYYY'));
            }
            let ngay_san_xuat = self.model.get("ngay_san_xuat");
            if (!!ngay_san_xuat){
                self.$el.find(`.ngay_san_xuat`).text(gonrinApp().parseInputDateString(ngay_san_xuat).format('DD/MM/YYYY'));
            }
            else{
                self.$el.find(`#ngay_san_xuat`).addClass('d-none');
            }
            let han_su_dung = self.model.get("han_su_dung");
            if (!!han_su_dung){
                self.$el.find(`.han_su_dung`).text(gonrinApp().parseInputDateString(han_su_dung).format('DD/MM/YYYY'));
            }
            else{
                self.$el.find(`#han_su_dung`).addClass('d-none');
            }
            let ngay_bao_cao = self.model.get("ngay_bao_cao");
            if (!!ngay_bao_cao){
                self.$el.find(`.ngay_bao_cao`).text(gonrinApp().parseInputDateString(ngay_bao_cao).format('DD/MM/YYYY'));
            }
            else{
                self.$el.find(`#ngay_bao_cao`).addClass('d-none');
            }
        },
        showData: function(){
            var self = this;
            let objects = self.model.toJSON();
            delete objects.ngay_kiem_nghiem;
            delete objects.ngay_san_xuat;
            delete objects.han_su_dung;
            delete objects.ngay_bao_cao;
            let keys = Object.keys(objects);
            let length = keys.length;
            for (let i=0; i< length; i++){
                let value =  self.model.get(keys[i]);
                if (!!value){
                    self.$el.find(`#${keys[i]}`).removeClass("d-none");
                }
                else{
                    self.$el.find(`#${keys[i]}`).addClass("d-none");
                }
            }

            self.$el.find(`.list-attachment button`).remove();
            self.$el.find(`#ket-qua-kiem-nghiem a`).remove();
        }
    });

});