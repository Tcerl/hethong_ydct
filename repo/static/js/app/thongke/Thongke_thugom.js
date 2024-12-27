
define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/thongke/tpl/thonke_thugom.html');  
    return Gonrin.ModelDialogView.extend({
    	template : template,
        modelSchema	: {},
    	uiControl:{
			fields:[
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
						buttonClass: "btn-secondary btn-sm",
						label: "Đóng",
						command: function () {
                            var self = this;
                            self.close()
						}
					}
				],
		}],
        render: function() {
            var self = this;
            var viewData = self.viewData;
            var donvi_id = "";
            var id_sanpham = "";
            if (!!viewData && !! viewData.data){
                donvi_id = viewData.data.donvi_id;
                id_sanpham = viewData.data.id_sanpham;
                self.get_thugom(donvi_id, id_sanpham);
            }
            self.applyBindings();
		},
        appendHtmlChitietVatTu: function (data) {
			var self = this;
			var tr_el = $("<tr>").attr({"id":data.id});
			tr_el.html(`<td class="stt text-center">` + 1 + `</td>
				<td class="ten_coso_cungung text-center">` + (data.ten_coso_cungung ? data.ten_coso_cungung:"") + `</td>
				<td class="diachi_coso_cungung">` + (data.diachi_coso_cungung? data.diachi_coso_cungung : "") + `</td>
				<td class="soluong_nhap text-center">` + (data.soluong_nhap ? data.soluong_nhap : "0") + `</td>
				<td class="thoigian_nhap text-center">` + (data.thoigian_nhap ? gonrinApp().parseInputDateString(data.thoigian_nhap).format("DD/MM/YYYY") : "") + `</td>
                `);
			self.$el.find('.table-vattu tbody').append(tr_el);
        },
        fillStt: function () {
			var self = this;
			var stt = self.$el.find(".stt");
			$.each(stt, (index, element) => {
				$(element).text(index + 1);
			});
		},
        get_thugom : function(donvi_id, id_sanpham){
            var self = this;
            var params = {
                "donvi_id" : donvi_id,
                "id_sanpham" : id_sanpham
            }
            $.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/get_chitiet_thugom',
				dataType: "json",
				contentType: "application/json",
				method: 'POST',
				data: JSON.stringify(params),
				success: function(response) {
					self.getApp().hideloading();
                    var list_thugom = response.list_thugom;
                    if (list_thugom === undefined || list_thugom === null){
                        list_thugom = [];
                    }
                    list_thugom.forEach( (value, index) => {
                        self.appendHtmlChitietVatTu(value);
                        self.fillStt();
                    });

				},
				error:function(xhr,status,error){
					self.getApp().hideloading();
					try {
						if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
							self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
							self.getApp().getRouter().navigate("login");
						} else {
						self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
						}
					}
					catch (err) {
						self.getApp().notify({ message: "Có lỗi xảy ra vui lòng thử lại sau"}, { type: "danger", delay: 1000 });
					}
				},
			});
        }
    });
});