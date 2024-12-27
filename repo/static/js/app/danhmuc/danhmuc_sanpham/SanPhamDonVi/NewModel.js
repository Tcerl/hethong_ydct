define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/danhmuc/danhmuc_sanpham/SanPhamDonVi/tpl/create.html'),
        schema = require('json!schema/SanPhamDonViSchema.json');
    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "sanpham_donvi",
        ds_sanpham : [],
        ds_sanpham_id : [],
        ds_sanpham_donvi_id : [],
        ds_sanpham_donvi : [],
        uiControl: {
            fields: [{
                    field: "stt",
                    label: "STT",
                    width: 10
                },
                {
                    field: "id",
                    label: "ID",
                    width: 250,
                    readonly: true,
                    visible: false
                },
                { field: "ten_sanpham", label: "Tên", width: 250 },
                { field: "ten_khoa_hoc", label: "Tên khoa học", width: 250 },
                { field: "ma_viettat", label: "Mã viết tắt", width: 100 },
                {
                    field: "bophan_sudung",
                    label: "Bộ phận",
                    width: 250
                },
            ],
            onRowClick: function(event) {
                if (event.rowId) {
                    var path = this.collectionName + '/model?id=' + event.rowId;
                    this.getApp().getRouter().navigate(path);
                }

            },
            language: {
                no_records_found: "Chưa có dữ liệu"
            },
            pagination: {
                page: 1,
                pageSize: 100
            },
            noResultsClass: "alert alert-default no-records-found",
            datatableClass: "table table-mobile",
        },
        tools: [
            {
            name: "default",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [
                {
                    name: "back",
                    type: "button",
                    buttonClass: "btn-secondary btn-sm mr-1",
                    label: `<i class="fas fa-arrow-circle-left"></i> Quay lại`,
                    command: function() {
                        var self = this;
                        Backbone.history.history.back();
                    }
                },
                {
                name: "create",
                type: "button",
                buttonClass: "btn-primary btn-sm width-sm",
                label: `<i class="far fa-save"></i> Lưu`,
                command: function() {
                    var self = this;
                    let btnContine = false;
                    self.$el.find("#exampleModalCenter").modal("show");
                    self.$el.find("#exampleModalCenter .btn-continue").unbind("click").bind("click", function () {
                        btnContine = true;
                    });
                    self.$el.find("#exampleModalCenter").on("hidden.bs.modal", function (e) {
                        if (btnContine == true) {
                            self.saveData(self.ds_sanpham_donvi);
                            btnContine = false;
                        }
                    });
                }
                }, 
            ]
            }, 
        ],
        render: function() {
            var self = this;
            self.ds_sanpham = [];
            self.ds_sanpham_donvi = [];
            self.ds_sanpham_donvi_id = [];
            self.ds_sanpham_id = [];
            self.get_ds_sanpham_sanpham_dv();
            self.applyBindings();
            return this;
        },
        get_ds_sanpham_sanpham_dv : function(){
            var self = this;
            var donvi_id = "";
            var currentUser = self.getApp().currentUser;
            if (!!currentUser && currentUser.donvi_id){
                donvi_id = currentUser.donvi_id;
            }
            self.getApp().showloading();
            $.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/get_ds_sanpham_ds_sanpham_donvi',
				dataType: "json",
                contentType: "application/json",
                data : JSON.stringify({
                    "donvi_id" : self.getApp().currentUser.donvi_id
                }),
				method: 'POST',
				success: function(response) {
                    self.getApp().hideloading();
                    if (!!response){
                        self.ds_sanpham = response.objects.ds_sanpham,
                        self.ds_sanpham_id = response.objects.ds_sanpham_id,
                        self.ds_sanpham_donvi = response.objects.ds_sanpham_donvi,
                        self.ds_sanpham_donvi_id = response.objects.ds_sanpham_donvi_id
                    }
                    if (self.ds_sanpham === undefined || self.ds_sanpham === null){
                        self.ds_sanpham = [];
                    }
                    if (self.ds_sanpham_id === undefined || self.ds_sanpham_id === null){
                        self.ds_sanpham_id = [];
                    }
                    if (self.ds_sanpham_donvi === undefined || self.ds_sanpham_donvi === null){
                        self.ds_sanpham_donvi = [];
                    }
                    if (self.ds_sanpham_donvi_id === undefined || self.ds_sanpham_donvi_id === null){
                        self.ds_sanpham_donvi_id = [];
                    }
                    self.render_duoc_lieu(self.ds_sanpham);
                    self.render_duoc_lieu_dv(self.ds_sanpham_donvi);
                    let length = self.ds_sanpham.length;
                    for (let i=0; i<length; i++){
                        self.appendDuoclieu(self.ds_sanpham[i]);
                    }
                    let len = self.ds_sanpham_donvi.length;
                    for (let j=0; j<len; j++){
                        self.appendDuoclieuDv(self.ds_sanpham_donvi[j]);
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
        },
        saveData : function(arrDuoclieu){
            var self = this;
            var donvi_id = "";
            var currentUser = self.getApp().currentUser;
            if (!!currentUser){
                donvi_id = currentUser.donvi_id
            }
            if (Array.isArray(arrDuoclieu) === false){
                arrDuoclieu = [];
            }
            let arr = arrDuoclieu.filter((value) =>{
                return !!value.id_sanpham;
            })
            var params = JSON.stringify({
                "objects" : arr,
                "donvi_id" : donvi_id
            });
            self.getApp().showloading();
            $.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/save_data_duoclieu_donvi',
				dataType: "json",
				contentType: "application/json",
                method: 'POST',
                data : params,
				success: function(response) {
                    self.getApp().hideloading();
                    self.getApp().notify({message : "Lưu thông tin thành công"});
                    self.getApp().getRouter().refresh();
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
			});
        },
        appendDuoclieu : function(item){
            var self = this;
            if (!!item){
                let text_ten_sanpham = "";
                if (!!item.ten_sanpham){
                    text_ten_sanpham = item.ten_sanpham;
                }
                let text_ten_khoahoc = "";
                if (!!item.ten_khoa_hoc){
                    text_ten_khoahoc = item.ten_khoa_hoc
                }
                let text_bophan_sudung = "";
                if (!!item.bophan_sudung){
                    text_bophan_sudung = item.bophan_sudung;
                }
                self.$el.find(`.ds-duoclieu tbody`).prepend(`
                    <tr id="${item.id_sanpham}">
                        <td>${text_ten_sanpham}</td>
                        <td>${text_ten_khoahoc}</td>
                        <td>${text_bophan_sudung}</td>
                        <td class="check-ds-duoclieu">
                            <button class="btn btn-sm btn-primary btn-add-duoclieudv" type="button">Chọn</button>
                        </td>
                    </tr>
                `);
                self.$el.find(`.ds-duoclieu #${item.id_sanpham} .btn-add-duoclieudv `).unbind("click").bind("click", {data : item}, (event)=>{
                    let data = event.data.data;
                    if (!!data){
                        self.$el.find(`.ds-duoclieu #${item.id_sanpham}`).remove();
                        self.onSaveDuoclieu(data);
                    }
                })
            }
        },
        appendDuoclieuDv : function(item){
            var self = this;
            if (!!item){
                let text_ten_sanpham = "";
                if (!!item.ten_sanpham){
                    text_ten_sanpham = item.ten_sanpham;
                }
                let text_ten_khoahoc = "";
                if (!!item.ten_khoa_hoc){
                    text_ten_sanpham = text_ten_sanpham + " - "+ item.ten_khoa_hoc
                }
                if (!!item.bophan_sudung){
                    text_ten_sanpham = text_ten_sanpham + " - "+ item.bophan_sudung
                }

                self.$el.find(`.ds-duoclieu-dv tbody`).prepend(`
                    <tr id="${item.id_sanpham}">
                        <td class="align-middle">${text_ten_sanpham}</td>
                        <td class="align-middle "><input class="form-control ma_sanpham_donvi"></td>
                        <td><textarea class="ten_thuong_mai form-control"></textarea></td>
                        <td class="align-middle">
                            <button type="button" class="btn btn-sm btn-danger demo-delete-row">Xóa</button>
                        </td>
                    </tr>
                `);

                let text_ten_thuong_mai = "";
                if (!!item.ten_thuong_mai){
                    text_ten_thuong_mai = item.ten_thuong_mai;
                    self.$el.find(`.ds-duoclieu-dv #${item.id_sanpham} .ten_thuong_mai`).val(text_ten_thuong_mai);
                }

                let text_ma_sanpham_donvi = "";
                if (!!item.ma_sanpham_donvi){
                    text_ma_sanpham_donvi = item.ma_sanpham_donvi;
                    self.$el.find(`.ds-duoclieu-dv #${item.id_sanpham} .ma_sanpham_donvi`).val(text_ma_sanpham_donvi);
                }
                
                self.$el.find(`.ds-duoclieu-dv #${item.id_sanpham} .ten_thuong_mai`).on("change",{data : item}, (event)=>{
                    if (!!event && !!event.data){
                        let data = event.data.data;
                        let ten_thuong_mai = self.$el.find(`.ds-duoclieu-dv #${item.id_sanpham} .ten_thuong_mai`).val();
                        let id_sanpham = data.id_sanpham;
                        let check = self.ds_sanpham_donvi_id.indexOf(id_sanpham);
                        if (check !== -1){
                            self.ds_sanpham_donvi[check].ten_thuong_mai = ten_thuong_mai;
                        }
                    }
                })

                self.$el.find(`.ds-duoclieu-dv #${item.id_sanpham} .ma_sanpham_donvi`).on("change",{data : item}, (event)=>{
                    if (!!event && !!event.data){
                        let data = event.data.data;
                        let ma_sanpham_donvi = self.$el.find(`.ds-duoclieu-dv #${item.id_sanpham} .ma_sanpham_donvi`).val();
                        let id_sanpham = data.id_sanpham;
                        let check = self.ds_sanpham_donvi_id.indexOf(id_sanpham);
                        if (check !== -1){
                            self.ds_sanpham_donvi[check].ma_sanpham_donvi = ma_sanpham_donvi;
                        }
                    }
                })

                self.$el.find(`.ds-duoclieu-dv #${item.id_sanpham} .demo-delete-row`).unbind("click").bind("click", {data : item}, (event)=>{
                    let data = event.data.data;
                    if (!!data){
                        self.$el.find(`.ds-duoclieu-dv #${data.id_sanpham}`).remove();
                        let index = self.ds_sanpham_donvi_id.indexOf(item.id_sanpham);
                        if (index != -1){
                            self.ds_sanpham_donvi_id.splice(index,1);
                            self.ds_sanpham_donvi.splice(index,1);
                        }
                        self.appendDuoclieu(data);
                    }
                })
            }
        },
        onSaveDuoclieu : function(item){
            var self = this;
            if (!!item){
                let id_sanpham = item.id_sanpham;
                let check = self.ds_sanpham_donvi_id.indexOf(id_sanpham);
                if (check === -1){
                    self.ds_sanpham_donvi_id.push(item.id_sanpham);
                    self.ds_sanpham_donvi.push(item);
                    self.appendDuoclieuDv(item);
                }
            }
        },
        render_duoc_lieu: function(arrDuoclieu) {
            var self = this;
            var $selectize = self.$el.find('#selectize-duoclieu').selectize({
                valueField: 'id_sanpham',
                labelField: 'ten_sanpham',
                searchField: ['ten_sanpham', 'ten_khoa_hoc', 'ma_viettat', 'tenkhongdau'],
                preload: false,
                persist: false,
                options : arrDuoclieu,
                render: {
                    option: function(item, escape) {
                        return `<div class="option">${item.ten_sanpham} - ${item.ten_khoa_hoc} - ${item.ma_viettat}</div>`;
                    }
                },
                onChange: function(value, isOnInitialize) {
                    let obj = $selectize[0].selectize.options[value];
                    if (!!obj){
                        delete obj.$order;
                        self.$el.find(`.ds-duoclieu #${obj.id_sanpham}`).remove();
                        self.onSaveDuoclieu(obj);
                        $selectize[0].selectize.clear();
                    }
                }

            });
        },
        render_duoc_lieu_dv: function(arrDuoclieu) {
            var self = this;
            var $selectize = self.$el.find('#selectize-duoclieu-donvi').selectize({
                valueField: 'id_sanpham',
                labelField: 'ten_sanpham',
                searchField: ['ten_sanpham', 'ten_khoa_hoc', 'ma_viettat', 'tenkhongdau'],
                preload: false,
                options : arrDuoclieu,
                render: {
                    option: function(item, escape) {
                        return `<div class="option">${item.ten_sanpham} - ${item.ten_khoa_hoc} - ${item.ma_viettat}</div>`;
                    }
                },
                onChange: function(value, isOnInitialize) {
                    let obj = $selectize[0].selectize.options[value];
                    if (!!obj){
                        delete obj.$order;
                        let index = self.ds_sanpham_donvi_id.indexOf(obj.id_sanpham);
                        if (index != -1){
                            self.$el.find(`.ds-duoclieu-dv #${obj.id_sanpham}`).remove();
                            self.ds_sanpham_donvi_id.splice(index,1);
                            self.ds_sanpham_donvi.splice(index,1);
                            self.appendDuoclieu(obj);
                        }
                        $selectize[0].selectize.clear();
                    }
                }
            });
        },
    });

});