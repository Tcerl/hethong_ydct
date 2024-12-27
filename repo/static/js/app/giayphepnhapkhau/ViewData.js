define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/giayphepnhapkhau/tpl/viewdata.html'),
        schema = require('json!schema/GiayPhepNhapKhauSchema.json');
    var ManageFileVIew = require("app/view/AttachFile/ManageFileUploadView");

    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "giayphep_nhapkhau",
        tools: [{
            name: "defaultgr",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [
                {
                    name: "back",
                    type: "button",
                    buttonClass: "btn-secondary btn",
                    label: `<i class="fas fa-arrow-circle-left"></i> Quay lại`,
                    command: function() {
                        var self = this;
                        Backbone.history.history.back();
                    }
                }
            ],
        }],
        render: function() {
            var self = this;
            var id = this.getApp().getRouter().getParam("id");
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
            else {
                self.applyBindings();
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
                    <td class="ten_khoahoc">${data.ten_khoahoc? data.ten_khoahoc: ""}</td>
                    <td class="bophan_sudung">${data.bophan_sudung? data.bophan_sudung:""}</td>
                    <td class="donvitinh text-center">${data.donvitinh? data.donvitinh: "Kg"}</td>
                    <td class="soluong_capphep text-right">${data.soluong_capphep? Number(data.soluong_capphep).toLocaleString("de-DE"): 0}</td>
                    <td class="soluong_danhap text-right">${data.soluong_danhap? Number(data.soluong_danhap).toLocaleString("de-DE"): 0}</td>
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
        getDanhSachDuocLieu: function(giayphep_id){
            var self = this;
            let query_filter ={
                filters: {
                    "$and": [
                        {giayphep_id: {"$eq": giayphep_id}},
                        {deleted: {"$eq": false}}
                    ]
                }
            }
            let url = (self.getApp().serviceURL || "") + '/api/v1/giayphep_nhapkhau_chitiet_grid?results_per_page=1000' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
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

            let thoigian_capphep = self.model.get("thoigian_capphep");
            if (!!thoigian_capphep){
                self.$el.find(`.thoigian_capphep`).text(gonrinApp().parseInputDateString(thoigian_capphep).format('DD/MM/YYYY'));
            }
            let thoigian_hieuluc_batdau = self.model.get("thoigian_hieuluc_batdau");
            if (!!thoigian_hieuluc_batdau){
                self.$el.find(`.thoigian_hieuluc_batdau`).text(gonrinApp().parseInputDateString(thoigian_hieuluc_batdau).format('DD/MM/YYYY'));
            }
            else{
                self.$el.find(`#thoigian_hieuluc_batdau`).addClass('d-none');
            }
            let thoigian_hieuluc_ketthuc = self.model.get("thoigian_hieuluc_ketthuc");
            if (!!thoigian_hieuluc_ketthuc){
                self.$el.find(`.thoigian_hieuluc_ketthuc`).text(gonrinApp().parseInputDateString(thoigian_hieuluc_ketthuc).format('DD/MM/YYYY'));
            }
            else{
                self.$el.find(`#thoigian_hieuluc_ketthuc`).addClass('d-none');
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