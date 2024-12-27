define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
	var template 			= require('text!app/view/quanlykhaithac/tpl/khaithac_chitiet_dialog.html');  
	var ManageFileVIew = require('app/view/AttachFile/ManageFileUploadView');
		
    return Gonrin.ModelDialogView.extend({
		template : template,
		setObjVitri: false,
		isView: false,
        modelSchema	: {
            "id" : {
				"type" : "string"
			},
			"thoigian" : {
				"type" : "string"
			},
			"soluong" : {
				"type" : "string"
			},
			"vitri" : {
				"type" : "json"
			},
			"mota":{
				"type" : "string"
			},
			"chatluong": {
				"type": "number"
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
					field:"chatluong",
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
						buttonClass: "btn-secondary btn",
						label: `<i class="fas fa-arrow-circle-left"></i> Đóng`,
						command: function () {
                            var self = this;
                            self.close();
						}
					},
					{
						name: "save",
						type: "button",
						buttonClass: "btn-success btn width-sm ml-2",
						label: `<i class="far fa-save"></i> Lưu`,
						command: function () {
							var self = this;
							let thoigian = self.model.get("thoigian");
							if (thoigian === null || thoigian === undefined || thoigian === ""){
								self.getApp().notify({message : "Vui lòng nhập thời gian"}, {type : "danger", delay : 1000});
								return false;
							}
							let soluong = self.model.get("soluong");
							if (soluong === undefined || soluong === null || soluong === ""){
								self.getApp().notify({message : "Vui lòng nhập sản lượng khai thác"}, {type : "danger", delay : 1000});
								return false;
							}
							let chatluong = self.model.get("chatluong");
							if (chatluong === undefined || chatluong === null){
								self.getApp().notify({message : "Vui lòng nhập chất lượng dược liệu"}, {type : "danger", delay : 1000});
								return false;
							}
							
                            var params = {
								id : self.model.get("id"),
								thoigian,
								soluong	,
								vitri : self.model.get("vitri"),
								mota : self.model.get("mota"),
								chatluong,
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
			self.setObjVitri = false;
			self.isView = false;
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
				self.selectizeVitri();
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
				self.selectizeVitri();
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
		},
		selectizeVitri: function(){
			var self = this;
			var $selectize = self.$el.find('#vitri').selectize({
                valueField: 'id',
                labelField: 'ten_diadiem',
                searchField: ['ten_diadiem','tenkhongdau'],
				preload: true,
				render: {
					option: function (item, escape) {
						let text_donvi_dientich = "";
						if (item.donvitinh_dientich === 1){
							text_donvi_dientich = "m2";
						}
						else if (item.donvitinh_dientich ===2){
							text_donvi_dientich = "hecta (ha)";
			
						}
						else if (item.donvitinh_dientich ===3){
							text_donvi_dientich = "km2";
						}
						return `<div class="option">${item.ten_diadiem} - ${item.dien_tich} ${text_donvi_dientich}</div>`;
					}
				},
                load: function(query, callback) {
					var query_filter = {"filters": 
						{"$and": [
							{
								"$or": 
									[
										{ "ten_diadiem": { "$likeI": (query) } },
										{ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
									]
							},
							{"loai_diadiem": {"$eq": 2}}
						]}

					};
					let vitri = self.model.get("vitri");
					if (!!vitri && self.setObjVitri === false){
						callback([vitri]);
						self.setObjVitri = true;
					}
                    var url = (self.getApp().serviceURL || "") + '/api/v1/nuoitrong_khaithac?results_per_page=20' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
							callback(res.objects);
							let vitri = self.model.get("vitri");
							if (!!vitri && !!vitri.id){
								$selectize[0].selectize.setValue(vitri.id);
							}
                        }
                    });  

                },
				onChange: function(value){
                    var $selectz = (self.$el.find('#vitri'))[0];
					var obj = $selectz.selectize.options[value];
					if (obj !== undefined && obj !== null){
						let objs = {
							id : value,
							ten_diadiem: obj.ten_diadiem,
							dien_tich: obj.dien_tich,
							donvitinh_dientich: obj.donvitinh_dientich
						}
						self.model.set("vitri", objs);
					}
					else{
						self.model.set("vitri", null);
					}
				}
            });
		},
    });
});