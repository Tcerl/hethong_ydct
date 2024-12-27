define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/quanlykho/DanhSachVatTu/tpl/qrcode.html');  
    return Gonrin.ModelDialogView.extend({
    	template : template,
        modelSchema	: {
			"id_sanpham" : {
				"type" : "number"
			},
			"so_lo" : {
				"type" : "string"
			},
			"donvi_id" : {
				"type" : "string"
			}
		},
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
					},
					{
						name: "save",
						type: "button",
						buttonClass: "btn-success btn-sm",
						label: "TRANSLATE:SAVE",
						command: function () {
							var self = this;
                            self.trigger("saveData", {data: params});
                            self.close();
						}
					},
				],
		}],
        render: function() {
			var self = this;
			var viewData = self.viewData;
			if (!!viewData){
				let lichsu_id = viewData.lichsu_id;
				let ten_sanpham = viewData.ten_sanpham;
				let el = self.$el.find("#qrcode");
				let url = self.getApp().serviceURL + "/api/v1/scanqrcode";
				var qrcode = new QRCode(el[0], {
					width: 130,
					height: 130,
					colorDark: "#000000",
					colorLight: "#ffffff",
					text: url + "?id=" + lichsu_id,
					logoBackgroundColor: '#ffffff',
					logoBackgroundTransparent: false,
					quietZone: 8
				});
				self.$el.find('.download-qrcode').unbind("click").bind('click', function(){
					var image_src = self.$el.find('#qrcode img').attr("src");
					self.$el.find('.download-qrcode').parent().attr("download", gonrinApp().convert_khongdau(ten_sanpham) + ".png");
					self.$el.find('.download-qrcode').parent().attr("href", image_src);
				});
			}	
		}
    });
});