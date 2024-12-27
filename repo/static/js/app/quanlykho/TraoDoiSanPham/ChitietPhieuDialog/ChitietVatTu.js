define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/quanlykho/PhieuXuat/ChitietPhieuDialog/tpl/model.html'),
        schema 				= require('json!schema/PhieuXuatChiTietSchema.json');
    return Gonrin.ModelDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
        collectionName: "phieuxuatkho_chitiet",
        bindings:"data-phieuxuatkho_chitiet",
        check_setdata: false,
        hasViewData: false,
        uiControl:{
            fields:[
                {
                    field:"loai_vattu",
                    uicontrol:"combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass:"form-control",
                    dataSource: [
                        {"value": "1", "text": "Khẩu trang y tế"},
						{"value": "2", "text": "Găng tay y tế"},
						{"value": "3", "text": "Quần áo phòng hộ y tế"},
						{"value": "4", "text": "Kính chắn giọt bắn y tế"}
                    ],
                    value: "1"
                },
                {
                    field:"thoigian_xuat",
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
        render:function(){
            var self = this;
            self.check_setdata = false;
            self.hasViewData = false;
            self.eventClickButton();
            var viewData_data = self.viewData.data;
            if (!!viewData_data && viewData_data !== undefined && viewData_data !== null) {
                self.hasViewData = true;
                // self.applyBindings();
                self.model.set("id", viewData_data.id);
                this.model.fetch({
        			success: function(data){
                        self.applyBindings();
                    },
                    error: function () {
    					self.getApp().notify(self.getApp().traslate("TRANSLATE:error_load_data"));
                    }
                });
            } else {
                var viewData_phieuxuat_id = self.viewData.phieuxuat_id;
                if (viewData_phieuxuat_id == null || viewData_phieuxuat_id == undefined) {
                    self.getApp().notify({message: "Tham số không hợp lệ"}, {type: "danger", delay: 5000});
                    self.close();
                    return;
                }

                self.model.set({
                    "phieuxuat_id": viewData_phieuxuat_id,
                    "so_phieu": self.viewData.so_phieu_chungtu,
                    "thoigian_taophieu": self.viewData.thoigian_taophieu,
                    "ma_kho":self.viewData.ma_kho, 
                    "ten_kho":self.viewData.ten_kho,
                    "thoigian_xuat" : self.viewData.thoigian_xuat,
                    "ma_donvi_tiepnhan" : self.viewData.ma_donvi_tiepnhan,
                    "ten_donvi_tiepnhan" : self.viewData.ten_donvi_tiepnhan,
                    "donvi_tiepnhan" : self.viewData.donvi_tiepnhan,
                    "ten_nguoinhan" : self.viewData.ten_nguoinhan,
                    "diachi_nguoinhan" : self.viewData.diachi_nguoinhan,
                    "dienthoai_nguoinhan" : self.viewData.dienthoai_nguoinhan
                });
                self.applyBindings();
            }
            var $selectize = self.$el.find('#selectize-programmatic').selectize({
                valueField: 'id_sanpham',
                labelField: 'ten_sanpham',
                searchField: ['ten_sanpham', 'ten_khoa_hoc'],
                preload: true,
                load: function(query, callback) {
                    var ma_kho = self.model.get("ma_kho");
                    if(ma_kho === null || ma_kho === undefined){
                        gonrinApp().notify("Vui lòng chọn kho xuất trước khi chọn vật tư");
                        return;
                    }
                    var query_filter = {"filters": {"$and": [
                        {"donvi_id":{"$eq": gonrinApp().currentUser.donvi_id}},
                        {"ma_kho":{"$eq": ma_kho}},  
                        {"$or":[{"ten_sanpham":{"$likeI": query}},{"tenkhongdau":{"$likeI": query}}]}
                    ]}};

                    if (self.check_setdata == false && self.hasViewData == true) {
                        query_filter = {"filters": {"$and": [
                            {"donvi_id":{"$eq": gonrinApp().currentUser.donvi_id}}, 
                            {"ma_kho":{"$eq": ma_kho}},  
                            {"$or":[{"ten_sanpham":{"$likeI": query}},{"tenkhongdau":{"$likeI": query}}]}
                        ]}};
                    }
                    var url = (self.getApp().serviceURL || "") + '/api/v1/kho_sanpham_hanghoa?' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        headers: {
                            'content-type': 'application/json'
                        },
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                            var id_sanpham = self.model.get("id_sanpham");
                            if (self.check_setdata == false && self.hasViewData == true && !!id_sanpham) {
                                self.check_setdata = true;
                                var $selectz = (self.$el.find('#selectize-programmatic'))[0]
                                $selectz.selectize.setValue([id_sanpham]);
                            }
                        }
                    });
                },
                render: {
                    option: function (item, escape) {
                        var tenkho = item.ten_kho;
                        if(tenkho == null){
                            tenkho = '[Tồn kho:'+item.soluong+']';
                        }else{
                            tenkho = "Kho: "+tenkho + '[Tồn:'+item.soluong+']';
                        }
                        return '<div class=" px-2 border-bottom">'
                            + '<h5 class="py-0">' + escape(item.ten_sanpham) + '</h5>'
                            + (tenkho ? '<small class="" style="display:block">' + tenkho +'</small>' : '')
                            + (item.so_lo ? '<small class="" style="display:block"> số lô: ' + escape(item.so_lo) + '</small>' : '')
                            + (item.so_co? '<small class="" style="display:block"> số CO: ' + escape(item.so_co) + '</small>' : '<small class="" style="display:block"> số CO:  </small>')
                            + (item.ma_kiem_nghiem? '<small class="" style="display:block"> số CQ: ' + escape(item.ma_kiem_nghiem) + '</small>' : '<small class="" style="display:block"> số CQ:  </small>')
                            + '</div>';
                    }
                },
                onChange: function(value, isOnInitialize) {
                    var $selectz = (self.$el.find('#selectize-programmatic'))[0]
                    var obj = $selectz.selectize.options[value];
                    if (obj !== null && obj !== undefined) {
                        console.log("change $selectz.selectize.options[value]====",obj);
                        var id = self.model.get("id");
                        if (self.check_setdata == true || !id) {
                            // logic: nếu phiếu đó chưa có id - phiếu tạo mới thì set data vật tư
                            // k tính sự kiện onchange khi set data vật tư lần đầu
                            self.model.set({
                                "id_sanpham":obj.id_sanpham,
                                "ten_sanpham": obj.ten_sanpham,
                                "ma_sanpham": obj.ma_sanpham,
                                "loai_sanpham":obj.loai_sanpham,
                                "sanpham": obj.sanpham,
                                "so_lo":obj.so_lo,
                                "ma_kho":obj.ma_kho,
                                "ten_kho":obj.ten_kho,
                                "donvitinh":obj.donvitinh,
                                "hansudung": obj.hansudung,
                                "ma_kiem_nghiem" : obj.ma_kiem_nghiem,
                                "so_chungnhan_co" : obj.so_co,
                                "chungnhan_co_id" : obj.chungnhan_co_id,
                                "phieu_kiem_nghiem_id" : obj.phieu_kiem_nghiem_id 
                            });
                            self.$el.find("#tonkho").html('  Tồn kho:'+obj.soluong);
                            if (obj.dongia_ban == null) {
                                self.$el.find('.giatien').html(0);
                            } else {
                                self.$el.find('.giatien').html(Number(obj.dongia_ban).toLocaleString());
                            }
                        } else {
                            // sự kiện khi update phiếu, set data vật tư lần đầu
                            self.check_setdata = true;
                        }
                        var soluong = gonrinApp().convert_string_to_number(self.model.get("soluong_thucte"));
                        var giatien = gonrinApp().convert_string_to_number(self.model.get('dongia'))
                        var tong_gia = soluong * giatien;
                        self.$el.find('.gia_thanhtoan').text(Number(tong_gia).toLocaleString());

                        self.model.on("change:soluong_thucte change:dongia", function () {
                            var soluong = gonrinApp().convert_string_to_number(self.model.get("soluong_thucte"));
                            var giatien = gonrinApp().convert_string_to_number(self.model.get('dongia'))
                            var tong_gia = soluong * giatien;
                            self.model.set("thanhtien", tong_gia);
                            self.$el.find('.gia_thanhtoan').text(Number(tong_gia).toLocaleString());
                        });
                    }
                }
            });
            // self.applyBindings();
            return this;
        },
        eventClickButton: function () {
            var self = this;
            self.$el.find('.btn-close').unbind("click").bind("click", function (e) {
                e.stopPropagation();
                self.close();
            });
            self.$el.find('.btn-save').unbind("click").bind("click", function (e) {
                e.stopPropagation();
                var sanpham = self.model.get("sanpham");
                if (!sanpham || sanpham == null || sanpham == undefined || sanpham == "") {
                    self.getApp().notify({ message: "Vui lòng chọn dược liệu"}, { type: "danger", delay: 1000 });
                    return;
                }
                var chungnhan_co_id = self.model.get("chungnhan_co_id");
                if (chungnhan_co_id === undefined || chungnhan_co_id === null || chungnhan_co_id === "" ){
                    self.getApp().notify({message : "Vui lòng bổ sung đầy đủ giấy chứng nhận nguồn gốc (CO) của lô dược liệu"}, {type : "danger", delay : 2000});
                    return false;
                }
                var phieu_kiem_nghiem_id = self.model.get("phieu_kiem_nghiem_id");
                if (phieu_kiem_nghiem_id === undefined || phieu_kiem_nghiem_id === null || phieu_kiem_nghiem_id === ""){
                    self.getApp().notify({message : "Vui lòng bổ sung đầy đủ giấy chứng nhận chất lượng (CQ) của lô dược liệu"},{type : "danger", delay : 2000});
                    return;
                }
                var soluong_thucte = self.model.get("soluong_thucte");
                if (!soluong_thucte || soluong_thucte == null || soluong_thucte == undefined || soluong_thucte == "") {
                    self.getApp().notify({ message: "Vui lòng nhập số lượng vật tư thực tế"}, { type: "danger", delay: 1000 });
                    return;
                }
                var so_phieu = self.model.get("so_phieu");
                if (so_phieu == null || so_phieu == undefined) {
                    so_phieu = "";
                }
                self.model.set("so_phieu", so_phieu);
                self.model.save(null,{
                    success: function (model, respose, options) {
                        self.model.set(model.attributes);
                        self.getApp().notify("Lưu thông tin thành công");
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
                    complete:function(){
                        
                        self.close();
                    }
                });
                
            });
        }
    });

});