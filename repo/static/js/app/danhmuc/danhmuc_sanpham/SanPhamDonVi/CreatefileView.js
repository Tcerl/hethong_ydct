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
                // { field: "ma_sanpham", label: "Mã", width: 250 },
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
                buttonClass: "btn-primary  btn-sm",
                label: `<i class="far fa-save"></i> Lưu`,
                command: function() {
                    var self = this;
                    self.saveData(self.ds_sanpham_donvi);
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
            self.regeter_addDuoclieu();
            self.regeter_addDuoclieudv();
            self.applyBindings();
            return this;
        },
        get_ds_sanpham : function(){
            var self = this;
            $.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/danhmuc_sanpham_filter?results_per_page=100&max_results_per_page=100',
				dataType: "json",
				contentType: "application/json",
				method: 'GET',
				success: function(response) {
                    self.getApp().hideloading();
                    self.appendDSduoclieu(response.objects);
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
                    self.appendDSduoclieu(self.ds_sanpham);
                    self.appendDSduoclieudonvi(self.ds_sanpham_donvi);
                    self.render_duoc_lieu(self.ds_sanpham);
                    self.render_duoc_lieu_dv(self.ds_sanpham_donvi);
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
        appendDSduoclieu : function(ds_sanpham){
            var self = this;
            if (ds_sanpham === undefined || ds_sanpham === null){
                ds_sanpham = [];
            }
            self.$el.find(".ds-duoclieu tbody").html("");
            ds_sanpham.forEach((value, index) =>{
                var id = value.id_sanpham;
                var tr_html = `<tr id ="` + id + `">
                    <td>` + value.ten_sanpham + `</td>
                    <td>` + value.ten_khoa_hoc + `</td>
                    <td>` + (value.bophan_sudung? value.bophan_sudung : "") + `</td>
                    <td class="check-ds-duoclieu"><input type="checkbox" class="form-check-input" id_sanpham ="` + id + `"></td>
                </tr>`;
                self.$el.find(".ds-duoclieu tbody").append(tr_html);
                self.$el.find('.ds-duoclieu #' + id + " .form-check-input").unbind("click").bind("click", function(){
                    var value_check = $(this).prop("checked");
                    if (value_check == true){
                        var id_sanpham = $(this).attr("id_sanpham");
                        var items = value;
                        self.appendDuoclieudonvi(items);
                        self.$el.find(".ds-duoclieu #" + id).remove();
                        self.ds_sanpham = self.removeDuoclieu(id_sanpham, self.ds_sanpham);
                        self.ds_sanpham_id = self.removeIdDuoclieu(id_sanpham, self.ds_sanpham_id);
                    }
                });
            });
        },
        appendDSduoclieudonvi : function(ds_sanpham_dv){
            var self = this;
            if (ds_sanpham_dv === undefined || ds_sanpham_dv === null){
                ds_sanpham_dv = [];
            }
            self.$el.find(".ds-duoclieu-dv tbody").html("");
            ds_sanpham_dv.forEach((value, index) =>{
                var id = value.id_sanpham;
                var tr_html = `<tr id ="` + id + `">
                    <td>` + value.ten_sanpham + `</td>
                    <td>` + value.ten_khoa_hoc + `</td>
                    <td>` + (value.bophan_sudung? value.bophan_sudung : "") + `</td>
                    <td><a href="javascript:;" class="demo-delete-row btn btn-danger btn-xs btn-icon mr-2" title="Xóa"><i class="fa fa-times"></i></a></td>
                </tr>`;
                self.$el.find(".ds-duoclieu-dv tbody").append(tr_html);
                self.$el.find('#' + id + " .demo-delete-row").unbind("click").bind("click", function(){
                    self.$el.find(".ds-duoclieu-dv #" + id).remove();
                    var items = value;
                    self.appendDuoclieu(items);
                    self.ds_sanpham_donvi = self.removeDuoclieu(id, self.ds_sanpham_donvi);
                    self.ds_sanpham_donvi_id = self.removeIdDuoclieu(id, self.ds_sanpham_donvi_id);
                });
            });
        },
        appendDuoclieudonvi : function(items){
            var self = this;
            var id = items.id_sanpham;
            var tr_html = `<tr id ="` + id + `">
                <td>` + (items.ten_sanpham? items.ten_sanpham : "") + `</td>
                <td>` + (items.ten_khoa_hoc? items.ten_khoa_hoc : "") + `</td>
                <td>` + (items.bophan_sudung? items.bophan_sudung : "") + `</td>
                <td><a href="javascript:;" class="demo-delete-row btn btn-danger btn-xs btn-icon mr-2" title="Xóa"><i class="fa fa-times"></i></a></td>
            </tr>`;
            self.$el.find(".ds-duoclieu-dv tbody").append(tr_html);
            self.ds_sanpham_donvi.push(items);
            self.ds_sanpham_donvi_id.push(id);
            self.$el.find(".ds-duoclieu-dv #" + id + " .demo-delete-row").unbind("click").bind("click", function(){
                self.$el.find(".ds-duoclieu-dv #" + id).remove();
                self.ds_sanpham_donvi = self.removeDuoclieu(id,self.ds_sanpham_donvi);
                self.ds_sanpham_donvi_id = self.removeIdDuoclieu(id, self.ds_sanpham_donvi_id);
                self.appendDuoclieu(items);
            });
        },
        removeDuoclieu : function(id_sanpham, arrduoclieu){
            var self = this;
            if (arrduoclieu === undefined || arrduoclieu === null){
                arrduoclieu = [];
            }
            var arr = [];
            arrduoclieu.forEach((value, index) => {
                if (value.id_sanpham == id_sanpham){
                }
                else{
                    arr.push(value);
                }
            });
            return arr;
        },
        removeIdDuoclieu : function(id_sanpham, arrDuoclieu){
            var self = this;
            var arr = [];
            arrDuoclieu.forEach((value, index) =>{
                if (value == id_sanpham){

                }
                else{
                    arr.push(value);
                }
            });
            return arr;
        },
        appendDuoclieu : function(items){
            var self = this;
            var id = items.id_sanpham;
            var tr_html = `<tr id ="` + id + `">
            <td>` + items.ten_sanpham + `</td>
            <td>` + items.ten_khoa_hoc + `</td>
            <td>` + (items.bophan_sudung? items.bophan_sudung : "") + `</td>
            <td class="check-ds-duoclieu"><input type="checkbox" class="form-check-input" id_sanpham ="` + id + `"></td>
            </tr>`;
            self.$el.find(".ds-duoclieu tbody").append(tr_html);
            self.ds_sanpham.push(items);
            self.ds_sanpham_id.push(id);
            self.$el.find('.ds-duoclieu #' + id + " .form-check-input").unbind("click").bind("click", function(){
                var value_check = $(this).prop("checked");
                if (value_check == true){
                    self.appendDuoclieudonvi(items);
                    self.$el.find(".ds-duoclieu #" + id).remove();
                    self.ds_sanpham = self.removeDuoclieu(id, self.ds_sanpham);
                    self.ds_sanpham_id = self.removeIdDuoclieu(id, self.ds_sanpham_id);
                }
            });
        },
        saveData : function(arrDuoclieu){
            var self = this;
            var donvi_id = "";
            var currentUser = self.getApp().currentUser;
            if (!!currentUser){
                donvi_id = currentUser.donvi_id
            }
            var params = JSON.stringify({
                "objects" : arrDuoclieu,
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
                }
            });
        },
        regeter_addDuoclieu : function(){
            var self = this;
            self.$el.find(".btn-add-duoclieu").unbind("click").bind("click", function(){
                var $selectz = (self.$el.find('#selectize-duoclieu'))[0];
                var items =null;
                var id_sanpham = "";
                if ($selectz !== undefined && $selectz.selectize !== undefined && $selectz.selectize !== null){
                    var obj = $selectz.selectize.getValue();
                    if (obj !== null && obj !== undefined && obj !== "") {
                        id_sanpham = obj;
                        items = $selectz.selectize.options[id_sanpham];
                        var itemss = {
                            "id_sanpham" : items.id_sanpham,
                            "ten_sanpham" : items.ten_sanpham,
                            "ten_khoa_hoc" : items.ten_khoa_hoc,
                            "bophan_sudung" : items.bophan_sudung,
                            "tenkhongdau" : items.tenkhongdau,
                            "ma_viettat" : items.ma_viettat
                        }
                        self.appendDuoclieudonvi(itemss);
                        self.$el.find(".ds-duoclieu #" + id_sanpham).remove();
                        self.ds_sanpham = self.removeDuoclieu(id_sanpham, self.ds_sanpham);
                        self.ds_sanpham_id = self.removeIdDuoclieu(id_sanpham, self.ds_sanpham_id);
                        $selectz.selectize.destroy();
                        self.render_duoc_lieu(self.ds_sanpham);
                    }
                }
            });
        },
        regeter_addDuoclieudv : function(){
            var self = this;
            self.$el.find(".btn-add-duoclieu-dv").unbind("click").bind("click", function(){
                var $selectz = (self.$el.find('#selectize-duoclieu-donvi'))[0];
                var items =null;
                var id_sanpham = "";
                if ($selectz !== undefined && $selectz.selectize !== undefined && $selectz.selectize !== null){
                    var obj = $selectz.selectize.getValue();
                    if (obj !== null && obj !== undefined && obj !== "") {
                        id_sanpham = obj;
                        items = $selectz.selectize.options[id_sanpham];
                        var itemss = {
                            "id_sanpham" : items.id_sanpham,
                            "ten_sanpham" : items.ten_sanpham,
                            "ten_khoa_hoc" : items.ten_khoa_hoc,
                            "bophan_sudung" : items.bophan_sudung,
                            "tenkhongdau" : items.tenkhongdau,
                            "ma_viettat" : items.ma_viettat
                        }
                        self.appendDuoclieu(itemss);
                        self.$el.find(".ds-duoclieu-dv #" + id_sanpham).remove();
                        self.ds_sanpham_donvi = self.removeDuoclieu(id_sanpham, self.ds_sanpham_donvi);
                        self.ds_sanpham_donvi_id = self.removeIdDuoclieu(id_sanpham, self.ds_sanpham_donvi_id);
                        $selectz.selectize.destroy();
                        self.render_duoc_lieu_dv(self.ds_sanpham_donvi);
                    }
                }
            });
        }
    });

});