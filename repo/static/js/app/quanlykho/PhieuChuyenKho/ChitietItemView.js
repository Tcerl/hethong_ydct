define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!./tpl/item_view.html'),

        schema 				= require('json!schema/PhieuChuyenKhoChiTietSchema.json');
    var danhmuc_donvitinh = require('json!app/constant/donvitinh.json');
    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
        collectionName: "phieuchuyenkho_chitiet",
        bindings:"bind-item",
        tagName:"tr",
        uiControl:{
            fields:[
            ]
        },
        render:function(){
            var self = this;
            var viewData_data = self.viewData.data;
            self.model.on('change:donvitinh', function(){
                var donvitinh = self.model.get("donvitinh");
                for(var i=0; i< danhmuc_donvitinh.length; i++){
                    if(danhmuc_donvitinh[i].value === donvitinh){
                        self.$el.find(".donvitinh").html(danhmuc_donvitinh[i].text);
                        break;
                    }
                }
            });
            var id_vattu = viewData_data.id_vattu;
            if (id_vattu !== undefined && id_vattu  !== null){
                self.model.set("id_vattu", id_vattu);
                self.model.set(viewData_data);
            }
            // self.check_ton_kho_vattu();
            var check_ton = self.viewData.check_ton;
            if (check_ton == true){
                self.save_model();
            }
            if (!!viewData_data && viewData_data !== undefined && viewData_data !== null && viewData_data.id !== null && viewData_data.id !== undefined) {
                self.model.set("id", viewData_data.id);
                this.model.fetch({
        			success: function(data){
                        self.applyBindings();
                        self.model.on("change:soluong_chungtu change:ghichu change:dongia change:soluong_thucte", function(){
                            self.save_model();
                        });
                    },
                    error: function () {
    					self.getApp().notify(self.getApp().translate("TRANSLATE:error_load_data"));
                    }
                });
            } else {
                // self.save_model();
                // return;
                self.applyBindings();
                self.model.on("change:soluong_chungtu change:ghichu change:dongia change:soluong_thucte", function(){
                    self.save_model();
                });
            }
            
            
            self.$el.find(".demo-delete-row").unbind("click").bind("click",function(){
                var id_row = self.model.get("id");
                if(!!id_row){
                    var obj_model = self.model.toJSON();
                    var url = (self.getApp().serviceURL || "") + '/api/v1/phieuchuyenkho_chitiet/' + id_row;
                    $.ajax({
                        url: url,
                        type: 'DELETE',
                        headers: {
                            'content-type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        success: function(response) {
                            self.trigger("removeVattu", {"data": obj_model});
                            self.remove();
                        },
                        error: function(xhr, status, error) {
                            try {
                                if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                    self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                    self.getApp().getRouter().navigate("login");
                                } else {
                                    self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                }
                            } catch (err) {
                                self.getApp().notify({ message: "Có lỗi xảy ra, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
                            }
                        }
                    });
                }else{
                    self.remove();
                }
            });
            return this;
        },
        save_model: function(){
            var self = this;
            self.model.save(null,{
                success: function (model, respose, options) {
                    self.model.set(model.attributes);
                    self.trigger("saveVattu", {"data": self.model.toJSON()});
                },
                error: function (xhr, status, error) {
                    try {
                        if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
                            self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                            self.getApp().getRouter().navigate("login");
                        } else {
                        self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 3000 });
                        }
                    }
                    catch (err) {
                        self.getApp().notify({ message: "Lưu thông tin không thành công"}, { type: "danger", delay: 3000 });
                    }
                },
            });
        }
    });

});