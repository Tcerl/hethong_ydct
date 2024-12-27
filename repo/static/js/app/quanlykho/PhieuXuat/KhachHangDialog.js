define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/quanlykho/PhieuXuat/tpl/khachhang_dialog.html');
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
					},
					{
						name: "save",
						type: "button",
						buttonClass: "btn-success btn-sm",
						label: "TRANSLATE:SAVE",
						command: function () {
							var self = this;
							let type = self.model.get("type");
							if (type ===1){
								let ten_coso = self.model.get("ten_coso");
								if (!ten_coso){
									self.getApp().notify({message:"Vui lòng nhập tên đơn vị tiếp nhận"}, {type:"danger", delay: 1000});
									return false;
								}
								let sogiayphep = self.model.get("sogiayphep");
								if (!sogiayphep){
									self.getApp().notify({message:"Vui lòng nhập số đăng ký kinh doanh đơn vị"}, {type:"danger", delay: 1000});
									return false;
								}
							}
                            self.saveKhachHang();
						}
					},
				],
		}],
        render: function() {
            var self = this;
            var viewData = self.viewData;
            if (!!viewData){
                let loai_xuat_ban = viewData.loai_xuat_ban;
                let donvi_id = viewData.donvi_id;
                if (loai_xuat_ban ===1){
                    self.model.set("type", 1);
                }
                else{
                    self.model.set("type",2);
                }
                self.model.set("donvi_id", donvi_id);
            }
            self.applyBindings();
        },
        saveKhachHang: function(){
            var self = this;
			$.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/save_khachhang_donvi',
				dataType: "json",
				contentType: "application/json",
				method: 'POST',
				data:JSON.stringify(self.model.toJSON()),
				success: function(response) {
					self.getApp().hideloading();
                    if(!!response){
						let existed = response.existed;
						if (existed === true){
							let isContinue = null;
							self.$el.find("#exampleModalCenter").modal("show");
							self.$el.find("#exampleModalCenter .modal-body").html('');
							self.$el.find("#exampleModalCenter .modal-body").append(`
								<h5 class="text-danger">Đơn vị bạn tạo đã có trên hệ thống</h5>
								<lable class="font-weight d-block">Tên đơn vị: <span class="text-primary">${response.ten_coso? response.ten_coso: ""}</span></lable>
								<lable class="font-weight d-block">Mã đăng ký kinh doanh: <span class="text-primary">${response.sogiayphep? response.sogiayphep: ""}</span></lable>
							`)
							self.$el.find(".btn-continue").unbind("click").bind("click", function () {
								isContinue = true;
								self.$el.find("#exampleModalCenter").modal("hide");
							});
							self.$el.find("#exampleModalCenter .btn-close").unbind("click").bind("click", function(e){
								e.stopPropagation();
								self.$el.find("#exampleModalCenter").modal("hide");
							})
							self.$el.find("#exampleModalCenter").on("hidden.bs.modal", function (e) {
								if (isContinue == true) {
									let data = {
										ten_coso: response.ten_coso,
										sogiayphep: response.sogiayphep,
										id: response.id,
										dienthoai: response.dienthoai,
										email: response.email,
										hoten: response.hoten,
										type: response.type,
										diachi: response.diachi
									}
									self.trigger("saveData", {data: data});
									self.close();
								}
							});
						}
						else{
							let data = {
								ten_coso: response.ten_coso,
								sogiayphep: response.sogiayphep,
								id: response.id,
								dienthoai: response.dienthoai,
								email: response.email,
								hoten: response.hoten,
								type: response.type,
								diachi: response.diachi
							}
							self.trigger("saveData", {data: data});
							self.close();
						}
                    }
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