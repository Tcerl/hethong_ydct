define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/giaychungnhanco/tpl/modalviewdata.html'),
        schema = require('json!schema/GiayChungNhanCOSchema.json');
    var ManageFileVIew = require("app/view/AttachFile/ManageFileUploadView");


    return Gonrin.ModelDialogView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "giaychungnhanco",
        tools: [{
            name: "defaultgr",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [
                {
                    name: "back",
                    type: "button",
                    buttonClass: "btn-secondary waves-effect width-sm",
                    label: `<i class="fas fa-arrow-circle-left"></i> Quay lại`,
                    command: function() {
                        var self = this;
                        self.close();
                    }
                },
            ],
        }],
        uiControl: {
            fields: [
            ]
        },
        render: function() {
            var self = this;
            var viewData = self.viewData;
            if (!!viewData){
                var id = viewData.id;

                if (id) {
                    this.model.set('id', id);
                    this.model.fetch({
                        success: function(data) {
                            self.applyBindings();
                            self.getDanhSachDuocLieu(id);
                            var fileView = new ManageFileVIew({ viewData: { "listFile": self.model.get('chungtu_dinhkem'), "$el_btn_upload": self.$el.find(".btn-add-file") }, el: self.$el.find(".list-attachment") });
                            fileView.render();
                            fileView.on("change", (event) => {
                                var listfile = event.data;
                                self.model.set('chungtu_dinhkem', listfile);
                            });
                            self.initData();
                            self.showData();
                        },
                        error: function() {
                            self.getApp().notify(self.getApp().translate("TRANSLATE:error_load_data"));
                        },
                        complete: function() {
    
                        }
                    });
                } 
                else 
                {
                    self.applyBindings();
                }
            }

        },
        appendHtmlChitietVatTu: function(data) {
            var self = this;

            self.$el.find('.table-vattu').removeClass("d-none");
            self.$el.find('.search').removeClass("d-none");

            self.$el.find('.table-vattu tbody').append(`
                <tr id="${data.id}">
                    <td class="stt text-center">${1}</td>
                    <td class="ten_sanpham">${data.ten_sanpham? data.ten_sanpham: ""}</td>
                    <td class="ma_HS ma_hs">${data.ma_HS? data.ma_HS: ""}</td>
                    <td class="so_hoadon">${data.so_hoadon? data.so_hoadon:""}</td>
                    <td class="soluong text-right">${data.soluong? Number(data.soluong).toLocaleString("de-DE"): 0}</td>
                    <td class="donvitinh text-center">Kg</td>
                </tr>
            `)
            
        },
        fillStt: function() {
            var self = this;
            var stt = self.$el.find(".stt");
            $.each(stt, (index, element) => {
                $(element).text(index + 1);
            });
        },
        getDanhSachDuocLieu: function(chungnhan_id){
            var self = this;
            let query_filter ={
                filters: {
                    "$and": [
                        {chungnhan_id: {"$eq": chungnhan_id}},
                        {deleted: {"$eq": false}}
                    ]
                }
            }
            let url = (self.getApp().serviceURL || "") + '/api/v1/giaychungnhanco_chitiet_grid?results_per_page=1000' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
            $.ajax({
                url: url,
                type:'GET',
                dataType: 'json',
                success: function(response){
                    self.listChiTiet = response?.objects;
                    if (Array.isArray(self.listChiTiet) === false){
                        self.listChiTiet = [];
                    }

                    let length = self.listChiTiet.length;
                    if (length >0){
                        self.$el.find('.table-vattu').removeClass("d-none");
                        self.$el.find('.search').removeClass("d-none");
                    }
                    else{
                        self.$el.find('.table-vattu').addClass("d-none");
                        self.$el.find('.search').addClass("d-none");
                    }
                    for (let i=0; i< length; i++){
                        self.appendHtmlChitietVatTu(self.listChiTiet[i]);
                        self.fillStt();
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
						self.getApp().notify({ message: "Có lỗi xảy ra vui lòng thử lại sau"}, { type: "danger", delay: 1000 });
					}
				},
            }
            )
        },
        initData: function(){
            var self = this;

            let loai_co = self.model.get("loai_co");
            if (loai_co === 1){
                self.$el.find(`.loai_co`).text('Ngoài nước');
            }
            else{
                self.$el.find(`.loai_co`).text('Trong nước');
            }

            let thoigian_cap_co = self.model.get("thoigian_cap_co");
            if (!!thoigian_cap_co){
                self.$el.find(`.thoigian_cap_co`).text(gonrinApp().parseInputDateString(thoigian_cap_co).format('DD/MM/YYYY'));
            }
            let ngay_khoi_hanh = self.model.get("ngay_khoi_hanh");
            if (!!ngay_khoi_hanh){
                self.$el.find(`.ngay_khoi_hanh`).text(gonrinApp().parseInputDateString(ngay_khoi_hanh).format('DD/MM/YYYY'));
            }
            else{
                self.$el.find(`#ngay_khoi_hanh`).addClass('d-none');
            }
            let ngay_nhap_canh = self.model.get("ngay_nhap_canh");
            if (!!ngay_nhap_canh){
                self.$el.find(`.ngay_nhap_canh`).text(gonrinApp().parseInputDateString(ngay_nhap_canh).format('DD/MM/YYYY'));
            }
            else{
                self.$el.find(`#ngay_nhap_canh`).addClass('d-none');
            }

            let quocgia_donvi_sanxuat = self.model.get("quocgia_donvi_sanxuat");
            if (!!quocgia_donvi_sanxuat){
                self.$el.find(`.quocgia_donvi_sanxuat`).text(quocgia_donvi_sanxuat.ten);
            }
            else{
                self.$el.find(`#quocgia_donvi_sanxuat`).addClass("d-none");
            }

            let quocgia_donvi_phanphoi = self.model.get("quocgia_donvi_phanphoi");
            if (!!quocgia_donvi_phanphoi){
                self.$el.find(`.quocgia_donvi_phanphoi`).text(quocgia_donvi_phanphoi.ten);
            }
            else{
                self.$el.find(`#quocgia_donvi_phanphoi`).addClass("d-none");
            }

        },
        showData: function(){
            var self = this;
            let objects = self.model.toJSON();
            delete objects.quocgia_donvi_sanxuat;
            delete objects.quocgia_donvi_phanphoi;
            delete objects.thoigian_cap_co;
            delete objects.ngay_nhap_canh;
            delete objects.ngay_khoi_hanh;
            let keys = Object.keys(objects);
            let length = keys.length;
            for (let i=0; i< length; i++){
                let value =  self.model.get(keys[i]);
                if (!!value){
                    self.$el.find(`#${keys[i]}`).removeClass("d-none");
                }
                else{
                    self.$el.find(`#${keys[i]}`).addClass("d-none");
                }
            }

            self.$el.find(`.list-attachment button`).remove();
        }
    });

});