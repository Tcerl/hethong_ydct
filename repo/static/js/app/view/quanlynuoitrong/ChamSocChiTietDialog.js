define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
	var template 			= require('text!app/view/quanlynuoitrong/tpl/chamsoc_chitiet_dialog.html');  
	var ManageFileVIew = require('app/view/AttachFile/ManageFileUploadView');
		
    return Gonrin.ModelDialogView.extend({
		template : template,
        modelSchema	: {
            "id" : {
				"type" : "string"
			},
			"thoigian" : {
				"type" : "string"
			},
			"noidung" : {
				"type" : "string"
			},
			"mota" : {
				"type" : "string"
			},
			"trangthai":{
				"type" : "string"
			},
			"hinhanh":{
				"type":"list"
			}
		},
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
							let thoigian = self.model.get("thoigian");
							if (thoigian === null || thoigian === undefined || thoigian === ""){
								self.getApp().notify({message : "Vui lòng nhập thời gian"}, {type : "danger", delay : 1000});
								return false;
							}
							let noidung = self.model.get("noidung");
							if (noidung === undefined || noidung === null || noidung === ""){
								self.getApp().notify({message : "Vui lòng nhập nội dung thực hiện"}, {type : "danger", delay : 1000});
								return false;
							}
							let trangthai = self.model.get("trangthai");
							if (trangthai === undefined || trangthai === null){
								self.getApp().notify({message : "Vui lòng nhập trạng thái"}, {type : "danger", delay : 1000});
								return false;
							}
                            var params = {
								id : self.model.get("id"),
								thoigian,
								noidung,
								mota : self.model.get("mota"),
								trangthai : self.model.get("trangthai"),
								hinhanh : self.model.get("hinhanh")
							};
                            self.trigger("saveData", {data: params});
                            self.close();
						}
					},
				],
		}],
        render: function() {
			var self = this;
			self.obj_image = "";
			var viewData = self.viewData;
			if (viewData !== undefined && viewData !== null && viewData.id !== undefined && viewData.id !== null){
				self.model.set(viewData);
				var fileView = new ManageFileVIew({viewData:{"listFile":self.model.get("hinhanh"), "$el_btn_upload": self.$el.find(".btn-add-file")},  el:self.$el.find(".list-attachment")});
				fileView.render();
				fileView.on("change", (event) => {
					var listfile = event.data;
					self.model.set('hinhanh', listfile);
				});
				self.applyBindings();
			}
			else{
				const baseString = '0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
				var id = self.getRandomString(32,baseString);
				self.model.set("id", id);
				var fileView = new ManageFileVIew({viewData:{"listFile":self.model.get("hinhanh"), "$el_btn_upload": self.$el.find(".btn-add-file")},  el:self.$el.find(".list-attachment")});
				fileView.render();
				fileView.on("change", (event) => {
					var listfile = event.data;
					self.model.set('hinhanh', listfile);
				});
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