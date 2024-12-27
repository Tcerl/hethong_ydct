define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/quanlykho/TraoDoiSanPham/tpl/kho_dialog.html');  
	var DanhMucSelectView = require('app/quanlykho/DanhMucKho/SelectView');
    return Gonrin.ModelDialogView.extend({
    	template : template,
        modelSchema	: {    
            "kho": {
            "type": "json"
        },
            "ma_kho": {
            "type": "string",
            "required": true
        },
            "ten_kho": {
            "type": "string"
        },
            "thoigian_nhap": {
            "type": "string"
        },
            "so_phieu_chungtu": {
            "type": "string"
        }
    },
    	uiControl:{
            fields : [
                {
                    field:"kho",
                    uicontrol:"ref",
                    textField: "ten_kho",
                    foreignRemoteField: "id",
                    foreignField: "ma_kho",
                    dataSource: DanhMucSelectView
                },
                {
                    field:"thoigian_nhap",
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
                }
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
                            var so_phieu_chungtu = self.model.get("so_phieu_chungtu");
                            if (so_phieu_chungtu === undefined || so_phieu_chungtu === null || so_phieu_chungtu === ""){
                                self.getApp().notify({message : "Vui lòng nhập số phiếu chứng từ"}, {type : "danger", delay : 1000});
                                return false;
                            }
                            var thoigian_nhap = self.model.get("thoigian_nhap");
                            if (thoigian_nhap === undefined || thoigian_nhap === null || thoigian_nhap === ""){
                                self.getApp().notify({message : "Vui lòng chọn thời gian nhập kho"}, {type : "danger", delay : 1000});
                                return false;
                            }
                            var kho = self.model.get("kho");
                            if (kho === undefined || kho === null){
                                self.getApp().notify({message : "Vui lòng chọn kho lưu vật tư"},{type : "danger", delay : 2000});
                                return false;
                            }
                            var params = {
                                "ten_kho" : self.model.get("ten_kho"),
                                "ma_kho" : self.model.get("ma_kho"),
                                "kho" : self.model.get("kho"),
                                "so_phieu_chungtu" : self.model.get("so_phieu_chungtu"),
                                "thoigian_nhap" : self.model.get("thoigian_nhap")
                            }
                            self.trigger("saveData", {data: params});
                            self.close();
						}
					},
				],
		}],
        render: function() {
            var self = this;
            self.model.on("change:kho", function(){
                var kho = self.model.get("kho");
                if (!!kho && kho.ten_kho){
                    self.model.set("ten_kho", kho.ten_kho);
                }
            });
            self.applyBindings();
        }
    });
});