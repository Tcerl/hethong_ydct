define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/quanlykho/PhieuNhap/tpl/model_phieuxuat.html');

    return Gonrin.ModelDialogView.extend({
		template : template,
        modelSchema	: {
            "thoigian_nhap": {
                type:"string"
            },
            "ma_kho": {
                type:"string"
            },
            "ten_kho": {
                type:"string"
            },
            "so_phieu_chungtu":{
				type:"string"
			},
			"id_phieuxuat": {
				type:"string"
			}
        },
    	uiControl:{
			fields:[
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
						buttonClass: "btn-secondary btn-sm mr-1",
						label: `<i class="fas fa-arrow-circle-left"></i> Đóng`,
						command: function () {
                            var self = this;
                            self.close();
						}
					},
					{
						name:"xacnhan",
						type:"button",
						buttonClass: "btn-primary btn-sm",
						label: `<i class="far fa-save"></i> Xác nhận`,
						command: function(){
							var self = this;
							self.xacNhan();
						}
					}
				],
		}],
        render: function() {
            var self = this;
            self.selectizeKho();
            self.applyBindings();
        },
		selectizeKho: function () {
			var self = this;
			var currentUser = self.getApp().currentUser;
			var donvi_id = "";
			if (!!currentUser && !!currentUser.donvi) {
				donvi_id = currentUser.donvi.id;
			}
			var $selectize0 = self.$el.find('#chonkho').selectize({
				maxItems: 1,
				valueField: 'id',
				labelField: 'ten_kho',
				searchField: ['ten_kho'],
				preload: true,
				load: function (query, callback) {
					var query_filter = {
						"filters": {
							"$and": [{
								"$or": [
									{ "ten_kho": { "$likeI": (query) } },
								]
							},
							{ "donvi_id": { "$eq": donvi_id } }
							]
						},
						"order_by": [{ "field": "loai_uu_tien", "direction": "asc" }]
					};
					var url = (self.getApp().serviceURL || "") + '/api/v1/danhmuc_kho?page=1&results_per_page=20' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
					$.ajax({
						url: url,
						type: 'GET',
						dataType: 'json',
						error: function () {
							callback();
						},
						success: function (res) {
							callback(res.objects);
							var id = self.model.get("id");
							if (!id) {
								var khoChinh = res.objects.filter((value, index) => {
									return value.isPrimay === 1;
								})
								if (khoChinh.length === 0) {
									if (res.objects.length > 0) {
										let tmp = res.objects[0];
										$selectize0[0].selectize.setValue([tmp.id]);
									}
								}
								else {
									let tmp = khoChinh[0];
									$selectize0[0].selectize.setValue([tmp.id]);
								}
							}
							else {
								var khoId = self.model.get('ma_kho');
								if (!!khoId) {
									$selectize0[0].selectize.setValue(khoId);
								}
								$selectize0[0].selectize.disable();
							}
						}
					});
				},
				onChange: function (value) {
					var obj = $selectize0[0].selectize.options[value];
					if (obj !== null && obj !== undefined) {
						let id = self.model.get("id");
						if (!id || self.setKho == true) {
							self.model.set({
								"ma_kho": value,
								"ten_kho": obj.ten_kho,
								"kho": obj
							})
						}
						else {
							self.setKho = true;
						}
					} else {
						self.model.set({
							"ma_kho": null,
							"ten_kho": null,
							"kho": null
						})
					}
				}
			});
		},
		xacNhan: function(){
			var self = this;
			var params = JSON.stringify({
				"ma_kho" : self.model.get("ma_kho"),
				"ten_kho" : self.model.get("ten_kho"),
				"kho" : self.model.get("kho"),
				"id_phieuxuat" : self.model.get("id_phieuxuat"),
				"so_phieu_chungtu" : self.model.get("so_phieu_chungtu"),
				"thoigian_nhap" : self.model.get("thoigian_nhap")
			});
			if (!self.model.get("ma_kho")){
				self.getApp().notify({message: 'Vui lòng nhập thông tin kho nhập dược liệu'}, {type:"danger", delay: 1000});
				return false;
			}
			if (!self.model.get("ten_kho")){
				self.getApp().notify({message:"Vui lòng chọn kho nhập dược liệu"}, {type:"danger", delay: 1000});
				return false;
			}
			if (!self.model.get("id_phieuxuat")){
				self.getApp().notify({message:"Vui lòng nhập mã phiếu nhà cung cấp"}, {type:"danger", delay : 1000});
				return false;
			}
			if (!self.model.get("thoigian_nhap")){
				self.getApp().notify({message: "Vui lòng nhập thời gian nhập kho"}, {type: "danger", delay : 1000});
				return false;
			}
			self.getApp().showloading();
			$.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/xacnhan_phieunhap',
				dataType: "json",
				contentType: "application/json",
				method: 'POST',
				data: params,
				success: function(response) {
					self.getApp().hideloading();
					self.getApp().notify({message : "Xác nhận thành công."});
					// self.getApp().getRouter().navigate("phieunhapkho/collection");
				},
				error:function(xhr,status,error){
					self.getApp().hideloading();
					try {
						if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED"){
							self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
							self.getApp().getRouter().navigate("login");
						} else {
						self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 2000 });
						}
					}
					catch (err) {
						self.getApp().notify({ message: "Lưu thông tin không thành công"}, { type: "danger", delay: 1000 });
					}
				},
				complete: function(){
					self.close();
				}
			});
		}
    });
});