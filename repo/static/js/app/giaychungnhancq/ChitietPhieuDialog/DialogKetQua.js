define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/giaychungnhancq/ChitietPhieuDialog/tpl/ketqua_dialog.html');  
    return Gonrin.ModelDialogView.extend({
    	template : template,
        modelSchema	: {
			"ketluan" : {
				"type" : "number"
			},
			"id" : {
				"type" : "string"
			},
			"chitieukiemtra" : {
				"type" : "string"
			},
			"noidung" : {
				"type" : "string"
			},
			"ketqua" : {
				"type" : "string"
			}
		},
    	uiControl:{
			fields:[
				{
					field:"ketluan",
					uicontrol:"combobox",
					textField: "text",
					valueField: "value",
					cssClass:"form-control loai_bao_cao",
						dataSource: [
						{ value: "1", text: "Đạt" },
						{ value: "2", text: "Không Đạt" }
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
							var chitieukiemtra = self.$el.find("#chitieukiemtra").val();
							if (chitieukiemtra === undefined || chitieukiemtra === null || chitieukiemtra.trim() === ""){
								self.getApp().notify({message : "Vui lòng nhập chỉ tiêu kiểm tra"}, {type : "danger", delay : 2000});
								return False;
							}
							var noidung = self.$el.find("#noidung").val();
							if (noidung === undefined || noidung === null || noidung.trim() === ""){
								self.getApp().notify({message : "Vui lòng nhập nội dung yêu cầu chất lượng"}, {type : "danger", delay : 2000});
								return False;
							}
							var ketqua = self.$el.find("#ketqua").val();
							if (ketqua === undefined || ketqua === null || ketqua.trim() === ""){
								self.getApp().notify({message : "Vui lòng nhập kết quả kiểm nghiệm"}, {type : "danger", delay : 1000});
								return false;
							}
							var ketluan = self.$el.find("#ketluan").val();
							if (ketluan === undefined || ketluan === null || ketluan.trim() === ""){
								self.getApp().notify({message : "Vui lòng nhập kết luận"}, {type : "danger", delay : 2000});
								return False;
							}
                            var params = {
								"id" : self.model.get("id"),
								"chitieukiemtra" : chitieukiemtra,
								"noidung" :  noidung,
								"ketluan" : self.model.get("ketluan"),
								"ketqua" : self.model.get("ketqua")
							};
                            self.trigger("saveData", {data: params});
                            self.close();
						}
					},
				],
		}],
        render: function() {
			var self = this;
			var viewData = self.viewData;
			if (viewData !== undefined && viewData !== null && viewData.id !== undefined && viewData.id !== null){
				self.model.set(viewData);
				self.applyBindings();
			}
			else{
				const baseString = '0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
				var id = self.getRandomString(32,baseString);
				self.model.set("id", id);
				self.applyBindings();
			}
		},
		getRandomString : function(length, base){
			var self = this;
			var result = '';
			const baseLength = base.length;
		  
			for (var i = 0; i < length; i++) {
			  var randomIndex = self.getRandomInt(0, baseLength);
			  result += base[randomIndex];
			}
		  
			return result;
		},
		getRandomInt : function(min,max) {
			return Math.floor(Math.random() * (max - min)) + min;
		}
    });
});