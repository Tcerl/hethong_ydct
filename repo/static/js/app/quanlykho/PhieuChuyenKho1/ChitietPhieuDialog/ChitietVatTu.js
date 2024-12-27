define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/quanlykho/PhieuChuyenKho1/ChitietPhieuDialog/tpl/model.html'),
        schema 				= require('json!schema/PhieuChuyenKhoChiTietSchema.json');
    return Gonrin.ModelDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
        collectionName: "phieuchuyenkho_chitiet",
        bindings:"data-phieuchuyenkho_chitiet",
        check_setdata: false,
        hasViewData: false,
        check_data_valid : true,
        uiControl:{
            fields:[
                {
                    field:"thoigian_chuyenkho",
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
                    field:"hansudung",
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
            ]
        },
        render:function(){
            var self = this;
            self.check_setdata = false;
            self.hasViewData = false;
            self.check_data_valid = true;
            self.eventClickButton();
            var viewData_data = self.viewData.data;
            if (!!viewData_data && viewData_data !== undefined && viewData_data !== null) {
                self.hasViewData = true;
                self.model.set(viewData_data);
                self.model.set("phieuchuyenkho_id", self.viewData.phieuchuyenkho_id);
                self.applyBindings();
            } else {
                var viewData_phieuchuyenkho_id = self.viewData.phieuchuyenkho_id;
                if (viewData_phieuchuyenkho_id == null || viewData_phieuchuyenkho_id == undefined) {
                    self.getApp().notify({message: "Tham số không hợp lệ"}, {type: "danger", delay: 5000});
                    self.close();
                    return;
                }
                self.model.set({
                    "phieuchuyenkho_id": viewData_phieuchuyenkho_id,
                    "thoigian_taophieu": self.viewData.thoigian_taophieu,
                    "ten_kho_chuyen":self.viewData.ten_kho_chuyen,
                    "ma_kho_chuyen":self.viewData.ma_kho_chuyen,
                    "kho_chuyen" : self.viewData.kho_chuyen,
                    "thoigian_chuyenkho" : self.viewData.thoigian_chuyenkho,
                    "ma_kho_tiepnhan" : self.viewData.ma_kho_tiepnhan,
                    "ten_kho_tiepnhan" : self.viewData.ten_kho_tiepnhan,
                    "kho_tiepnhan" : self.viewData.kho_tiepnhan
                });
                self.applyBindings();
            }
            self.render_kho_duoclieu();
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
                var soluong_chungtu = self.model.get("soluong_chungtu");
                if (!soluong_chungtu || soluong_chungtu == null || soluong_chungtu == undefined || soluong_chungtu == "") {
                    self.getApp().notify({ message: "Vui lòng nhập số lượng dược liệu theo chứng từ"}, { type: "danger", delay: 1000 });
                    return;
                }
                var soluong_thucte = self.model.get("soluong_thucte");
                if (!soluong_thucte || soluong_thucte == null || soluong_thucte == undefined || soluong_thucte == "") {
                    self.getApp().notify({ message: "Vui lòng nhập số lượng dược liệu thực tế"}, { type: "danger", delay: 1000 });
                    return;
                }
                var dongia = self.model.get("dongia");
                if (dongia === undefined || dongia === null || dongia === ""){
                    self.getApp().notify({message : "Vui lòng nhập đơn giá"}, {type : "danger", delay : 1000});
                    return;
                }
                var currentUser = gonrinApp().currentUser;
                if(currentUser && currentUser.donvi_id !== null){
                    self.model.set("donvi_id", currentUser.donvi_id);
                    self.model.set("donvi", currentUser.donvi);
                }
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
        },
		render_kho_duoclieu: function(){
            var self = this;
            var $selectize = self.$el.find('#selectize-programmatic').selectize({
                valueField: 'id',
                labelField: 'ten_sanpham',
                searchField: ['ten_sanpham', 'ten_khoa_hoc', "ma_kho", "donvi_id", "tenkhongdau"],
                preload: true,
                maxItems : 1,
                load: function(query, callback) {
                    var ma_kho_chuyen = self.model.get("ma_kho_chuyen");
					var query_filter = null;
                    if(ma_kho_chuyen === null || ma_kho_chuyen === undefined){
						query_filter = {"filters": {"$and": [
							{"donvi_id":{"$eq": gonrinApp().currentUser.donvi_id}},
							{"$or":[{"ten_sanpham":{"$likeI": query}},{"tenkhongdau":{"$likeI": gonrinApp().convert_khongdau(query)}}]}
						]}};
					}
					else{
						query_filter = {"filters": {"$and": [
							{"donvi_id":{"$eq": gonrinApp().currentUser.donvi_id}},
							{"ma_kho":{"$eq": ma_kho_chuyen}}, 
							{"$or":[{"ten_sanpham":{"$likeI": query}},{"tenkhongdau":{"$likeI": gonrinApp().convert_khongdau(query)}}]}
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
                            var id_kho_sanpham = self.model.get("id_kho_sanpham");
                            if (self.check_setdata == false && self.hasViewData == true && !!id_kho_sanpham) {
                                // self.check_setdata = true;
                                var $selectz = (self.$el.find('#selectize-programmatic'))[0]
                                $selectz.selectize.setValue([id_kho_sanpham]);
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
                        // console.log("change $selectz.selectize.options[value]====",obj);
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
                                "donvitinh":obj.donvitinh,
                                "hansudung": obj.hansudung,
                                "ma_kiem_nghiem" : obj.ma_kiem_nghiem,
                                "so_chungnhan_co" : obj.so_co,
                                "chungnhan_co_id" : obj.chungnhan_co_id,
                                "phieu_kiem_nghiem_id" : obj.phieu_kiem_nghiem_id,
                                "id_kho_sanpham" : obj.id,
                                'dongia' : obj.dongia_nhap
                            });
                        } else {
                            // sự kiện khi update phiếu, set data vật tư lần đầu
                            self.check_setdata = true;
                        }
                    }
                }
            });
		}
    });

});