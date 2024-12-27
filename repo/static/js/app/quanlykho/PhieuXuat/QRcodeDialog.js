define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/quanlykho/PhieuXuat/tpl/qrcode.html');
    var schema = require('json!schema/KhachHangDonViSchema.json')  
		
    return Gonrin.ModelDialogView.extend({
		template : template,
        modelSchema	: schema,
    	uiControl:{
			fields:[
                {
                    field:"thoigian",
                    uicontrol:"datetimepicker",
                    format:"DD/MM/YYYY",
                    textFormat:"DD/MM/YYYY",
                    extraFormats:["DDMMYYYY"],
                    parseInputDate: function(val){
                        return gonrinApp().parseInputDateString(val);
                    },
                    parseOutputDate: function(date){
                        return gonrinApp().parseOutputDateString(date);
                    },
                    disabledComponentButton: true
				},
				{
					field:"trangthai",
					uicontrol:"combobox",
					textField: "text",
					valueField: "value",
					cssClass:"form-control",
						dataSource: [
							{ value: 1, text: "Kém" },
							{ value: 2, text: "Bình thường" },
							{ value: 3, text: "Tốt" },
						]
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
						buttonClass: "btn-secondary btn-sm mr-1",
						label: "Đóng",
						command: function () {
                            var self = this;
                            self.close();
						}
					}
				],
		}],
        render: function() {
            var self = this;
            self.applyBindings();
            var viewData = self.viewData;
            if (!!viewData){
                self.genQR(viewData);
            }
        },
		genQR: function(id){
            var self = this;
             
            let el = self.$el.find("#qrcode_dialog");
            if (!!el && el.length >0){
                self.$el.find('.div_qr').removeClass('d-none');
                let url = self.getApp().serviceURL + `/api/v1/phieuxuat?id=${id}`
                var qrcode = new QRCode(el[0], {
                    width: 130,
                    height: 130,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    text: url,
                    logoWidth: undefined,
                    logoHeight: undefined,
                    logoBackgroundColor: '#ffffff',
                    logoBackgroundTransparent: false,
                    quietZone: 10
                });
            }
			self.$el.find('.download-qrcode').unbind("click").bind('click', function(){
				var image_src = self.$el.find('#qrcode_dialog img').attr("src");
				self.$el.find('.download-qrcode').parent().attr("download", id + ".png");
				self.$el.find('.download-qrcode').parent().attr("href", image_src);
			});	
		}
    });
});