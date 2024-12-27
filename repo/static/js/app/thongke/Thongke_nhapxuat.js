
define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/thongke/tpl/thongke_nhapxuat.html');  
    return Gonrin.ModelDialogView.extend({
    	template : template,
        modelSchema	: {},
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
					}
				],
		}],
        render: function() {
			var self = this;
            var viewData = self.viewData;
            if (!!viewData){
				let chitiet_nhap_xuat = viewData;
				if (Array.isArray(chitiet_nhap_xuat) === false){
					chitiet_nhap_xuat = [];
				}
				let length = chitiet_nhap_xuat.length;
				for (let i=0; i<length;i++){
					let item_nhap_xuat = chitiet_nhap_xuat[i];
					let type = item_nhap_xuat.type;
					//nhập
					if (type ===1){
						let nguon = item_nhap_xuat.nguon_cungcap;
						if (nguon ===4 || nguon ==5){
							self.$el.find(".table-duoclieu tbody").append(`
							<tr>
								<td>${i+1}</td>
								<td class="text-primary">${item_nhap_xuat.ten_dv_cungung? item_nhap_xuat.ten_dv_cungung: ""}</td>
								<td class="text-right">Nhập/Mua dược liệu</td>
								<td class="text-right">${item_nhap_xuat.soluong? Number(item_nhap_xuat.soluong).toLocaleString("de-DE"):0}</td>
								<td class="text-right">${gonrinApp().parseInputDateString(item_nhap_xuat.thoigian).format('DD/MM/YYYY')}</td>
							</tr>
						`);
						}
						else{
							self.$el.find(".table-duoclieu tbody").append(`
							<tr>
								<td>${i+1}</td>
								<td>${item_nhap_xuat.ten_dv_cungung? item_nhap_xuat.ten_dv_cungung: ""}</td>
								<td class="text-right">Nhập/Mua dược liệu</td>
								<td class="text-right">${item_nhap_xuat.soluong? Number(item_nhap_xuat.soluong).toLocaleString("de-DE"):0}</td>
								<td class="text-right">${gonrinApp().parseInputDateString(item_nhap_xuat.thoigian).format('DD/MM/YYYY')}</td>
							</tr>
						`);
						}

					}
					//xuất
					else{
						self.$el.find(".table-duoclieu tbody").append(`
						<tr>
							<td>${i+1}</td>
							<td>${item_nhap_xuat.ten_dv_cungung? item_nhap_xuat.ten_dv_cungung: ""}</td>
							<td class="text-right">Xuất/Bán dược liệu</td>
							<td class="text-right">${item_nhap_xuat.soluong? Number(item_nhap_xuat.soluong).toLocaleString("de-DE"):0}</td>
							<td class="text-right">${gonrinApp().parseInputDateString(item_nhap_xuat.thoigian).format('DD/MM/YYYY')}</td>
						</tr>
					`);
					}

				}
            }   
            self.applyBindings();
		},
    });
});