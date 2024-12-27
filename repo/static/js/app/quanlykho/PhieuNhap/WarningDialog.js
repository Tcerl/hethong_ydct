const { values } = require('underscore');

define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/quanlykho/PhieuNhap/tpl/dialog.html'),
        schema 				= require('json!schema/PhieuNhapChiTietSchema.json');
    var donvitinh           = require('json!app/constant/donvitinh.json');
    return Gonrin.ModelDialogView.extend({
    	template : template,
    	modelSchema	: {},
    	urlPrefix: "/api/v1/",
        collectionName: "phieunhapkho_chitiet",
        bindings:"data-warning",
        render:function(){
            var self = this;
            var viewData = self.viewData;
            if (!!viewData) {
                if (viewData.type == 'DELETE') {
                    self.$el.find(".text-warning-healder").text('Xoá phiếu không thành công.');
                    self.$el.find(".text-warning-vattu").html("Dược liệu đã được cấp phát. Vui lòng xoá dược liệu <b  class='text-danger'>" + viewData.ten_sanpham + " (Số lô: " + (!!viewData.so_lo?viewData.so_lo: "") + ")</b> trong các phiếu sau để có thể xoá phiếu nhập.");
                } else if (viewData.type == 'UPDATE') {
                    self.$el.find(".text-warning-healder").text('Sửa phiếu không thành công.');
                    self.$el.find(".text-warning-vattu").html("Dược liệu đã được cấp phát. Vui lòng xoá dược liệu <b class='text-danger'>" + viewData.ten_sanpham + " (Số lô: " + (!!viewData.so_lo?viewData.so_lo: "") + ")</b> trong các phiếu sau để có thể sửa phiếu nhập.");
                } else {
                    self.close();
                }
                var danhsach_phieuxuat = viewData.danhsach_phieuxuat;
                if (danhsach_phieuxuat instanceof Array && danhsach_phieuxuat.length > 0) {
                    self.$el.find(".danhsach-phieuxuat").append("<h4>Danh sách phiếu xuất</h4>");
                    danhsach_phieuxuat.forEach((value, index) => {
                        var text_phieuxuat = 'Phiếu xuất ( Mã phiếu: <b>' + value.id + '</b>) ngày ' + gonrinApp().parseInputDateString(value.thoigian_xuat).format("DD/MM/YYYY");
                        self.$el.find(".danhsach-phieuxuat").append(`<div class='pl-2 py-1'> ` + (index + 1) + `. ` + text_phieuxuat + `</div>`);
                    });
                }
            } else {
                self.close();
            }
            self.$el.find('.btn-close').unbind("click").bind("click", function () {
                self.close();
            });
            self.applyBindings();
            return this;
        },
    });

});