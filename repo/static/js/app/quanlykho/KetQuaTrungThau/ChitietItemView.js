define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!./tpl/item_view.html'),

        schema 				= require('json!schema/KetQuaTrungThauChiTietSchema.json');
    var danhmuc_donvitinh = require('json!app/constant/donvitinh.json');
	var DonViCungUngSelectView = require('app/danhmuc/danhmuc_donvi/DonViCungUng/SelectView');
    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
        collectionName: "ketqua_trungthau_chitiet",
        bindings:"bind-item",
        tagName:"tr",
        donvi_cungung_id : "",
        uiControl:{
            fields:[
                {
                    field:"donvi_cungung",
                    uicontrol:"ref",
                    textField: "ten",
                    foreignRemoteField: "id",
                    foreignField: "ma_donvi_cungung",
                    dataSource: DonViCungUngSelectView
                }
            ]
        },
        render:function(){
            var self = this;
            self.donvi_cungung_id = "";
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

            self.model.set(self.viewData.data);
            self.applyBindings();
            if (!!viewData_data && viewData_data !== undefined && viewData_data !== null && viewData_data.id !== null && viewData_data.id !== undefined) {
                self.model.set("id", viewData_data.id);
                this.model.fetch({
        			success: function(data){
                        self.applyBindings();
                        self.model.on("change:so_luong_thucte change:ghichu change:dongia change:so_luong_ke_hoach change:donvi_cungung", function(){
                            self.save_model();
                        });
                    },
                    error: function () {
    					self.getApp().notify(self.getApp().translate("TRANSLATE:error_load_data"));
                    }
                });
            } else {
                
                // self.save_model();
                self.applyBindings();
                self.model.on("change:so_luong_thucte change:ghichu change:dongia change:so_luong_ke_hoach change:donvi_cungung", function(){
                    self.save_model();
                });
            }
            
            
            self.$el.find(".demo-delete-row").unbind("click").bind("click",function(){
                var id_row = self.model.get("id");
                if(!!id_row){
                    var obj_model = self.model.toJSON();
                    var url = (self.getApp().serviceURL || "") + '/api/v1/ketqua_trungthau_chitiet/' + id_row;
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