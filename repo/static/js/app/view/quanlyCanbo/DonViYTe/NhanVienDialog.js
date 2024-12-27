define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/view/quanlyCanbo/DonViYTe/tpl/nhanvien_dialog.html');  
    return Gonrin.ModelDialogView.extend({
    	template : template,
        modelSchema	: {
            "id" : {
				"type" : "string"
			},
			"ma" : {
				"type" : "string"
			},
			"ten" : {
				"type" : "string"
			},
			"chuyenmon" : {
				"type" : "string"
			},
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
                            let ma = self.model.get('ma');
                            if (ma === undefined || ma === null || ma === ""){
                                self.getApp().notify({message : "Vui lòng nhập mã nhân viên"}, {type : 'danger', delay : 1000});
                                return false;
                            }
                            let ten = self.model.get("ten");
                            if (ten === undefined || ten === null || ten === ""){
                                self.getApp().notify({message : "Vui lòng nhập tên nhân viên"}, {type : 'danger', delay : 1000});
                                return false;
                            }
                            let chuyenmon = self.model.get("chuyenmon");
                            if (chuyenmon === undefined || chuyenmon === null || chuyenmon === ""){
                                self.getApp().notify({message : "Vui lòng nhập chuyên môn"}, {type : 'danger', delay : 1000});
                                return false;
                            }
                            var params = {
								"id" : self.model.get("id"),
								"ma" : ma,
								"ten" :  ten,
								"chuyenmon" : self.model.get("chuyenmon"),
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