define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
	var template 			= require('text!app/view/quanlynuoitrong/tpl/themduoclieu.html');  
	var ManageFileVIew = require('app/view/AttachFile/ManageFileUploadView');
		
    return Gonrin.ModelDialogView.extend({
		template : template,
        modelSchema	: {
            "id" : {
				"type" : "string"
			},
			"id_sanpham" : {
				"type" : "string"
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
						buttonClass: "btn-secondary btn-sm mr-1",
						label: "Đóng",
						command: function () {
                            var self = this;
                            self.close();
						}
					},
					{
						name: "save",
						type: "button",
						buttonClass: "btn-success btn-sm",
						label: "TRANSLATE:SAVE",
						command: function () {
							var self = this;
                            let id_sanpham = self.model.get("id_sanpham");
                            if (!id_sanpham){
                                self.getApp().notify({message: "Vui lòng chọn dược liệu"}, {type: "danger", delay : 1000});
                                return false;
                            }
                            self.saveDuoclieu();
						}
					},
				],
		}],
        render: function() {
			var self = this;
            self.applyBindings();
            self.selectizeDuoclieu();
        },
        selectizeDuoclieu : function(){
			var self = this;
            var $selectize = self.$el.find('#sanpham').selectize({
                valueField: 'id',
                labelField: 'ten_sanpham',
                searchField: ['ten_sanpham', 'ten_khoa_hoc','tenkhongdau'],
				preload: true,
				render: {
					option: function (item, escape) {
						return `<div class="option">${item.ten_sanpham} - ${item.ten_khoa_hoc} - ${item.ma_viettat}</div>`;
					}
				},
                load: function(query, callback) {
                    var query_filter = {"filters": {"$or": [
                        { "ten_sanpham": { "$likeI": (query) } },
                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                        { "ten_khoa_hoc": { "$likeI": gonrinApp().convert_khongdau(query) } }
                        ]}
					};
					let sanpham = self.model.get("sanpham");
					if (!!sanpham && self.setObject === false){
						callback([sanpham]);
						self.setObject = true;
					}
                    var url = (self.getApp().serviceURL || "") + '/api/v1/danhmuc_sanpham_filter?results_per_page=20' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                        }
                    });  

                },
                onChange: function(value, isOnInitialize) {
                    var $selectz = (self.$el.find('#sanpham'))[0];
                    var obj = $selectz.selectize.options[value];
                    if (obj !== null && obj !== undefined) {
                        self.model.set({
                            "id_sanpham":obj.id
                        });
					}
					else{
						self.model.set({
							"id_sanpham":null
						});
					}
                }
            });
        },
        saveDuoclieu: function(){
            var self = this;
            let donvi_id = null;
            let currentUser = gonrinApp().currentUser;
            if (!!currentUser){
                donvi_id = currentUser.donvi_id;
            }
            let params = JSON.stringify({
                id_sanpham: self.model.get("id_sanpham"),
                donvi_id
            })
			self.getApp().showloading();
			$.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/create_duoclieu_donvi',
				dataType: "json",
				contentType: "application/json",
				method: 'POST',
				data: params,
				success: function(response) {
                    self.getApp().hideloading();
                    if(!!response){
                        let data = {
                            id_sanpham : response.id_sanpham,
                            ten_sanpham: response.ten_sanpham,
                            ten_khoa_hoc: response.ten_khoa_hoc,
                            ma_sanpham: response.ma_sanpham,
                            sanpham: response
    
                        }
                        self.trigger("saveData", {data: data});
                        self.close();
                    }
				},
				error:function(xhr,status,error){
                    self.getApp().hideloading();
					try {
						if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED"){
							self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
							self.getApp().getRouter().navigate("login");
						} else {
						self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
						}
					}
					catch (err) {
						self.getApp().notify({ message: "Lưu thông tin không thành công"}, { type: "danger", delay: 1000 });
					}
				},
			});
        }
    });
});