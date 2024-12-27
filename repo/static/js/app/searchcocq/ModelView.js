define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/searchcocq/tpl/newmodel.html'),
    schema = require('json!app/searchcocq/schema.json');
    var storejs  = require('vendor/store');
    var CollectionNhapKhau = require('app/searchcocq/CollectionNhapkhau');
    var CollectionCo = require('app/searchcocq/CollectionCo');
    var CollectionCq = require('app/searchcocq/CollectionCq');
    var CollectionDuoclieu = require('app/searchcocq/CollectionDuoclieu');

    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
		collectionName: "cuakhau",
        flagReset: true,
        donvi_id: null,
        ten_donvi: null,
		uiControl: {
            fields: [
                {
					field:"loai_timkiem",
					uicontrol:"combobox",
					textField: "text",
					valueField: "value",
					cssClass:"form-control",
						dataSource: [
							{ value: 1, text: "Giấy phép nhập khẩu" },
							{ value: 2, text: "Giấy chứng nhận nguồn gốc" },
                            { value: 3, text: "Phiếu kiểm nghiệm" },
							{ value: 4, text: "Tìm kiếm dược liệu" },
						]
                },
                {
                    field:"tungay",
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
                    field:"denngay",
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
    	tools : [
		],
    	render:function(){
            var self = this;
            self.donvi_id = null;
            self.ten_donvi = null;
            self.applyBindings();
            self.register();
            let f = storejs.get("X-F");
            let d = storejs.get("X-D");
            let s = storejs.get("X-S");
            let t = storejs.get("X-T");
            let l = storejs.get("X-L");
            let so = storejs.get("X-SO");
            let sq = storejs.get("X-SQ");
            let dv = storejs.get("X-DV");
            let ten_donvi = storejs.get("X-DVT");
            if (!!f){
                self.model.set("tungay", f);
                storejs.remove("X-F");
            }
            
            if (!!d){
                self.model.set("denngay", d);
                storejs.remove("X-D");
            }

            if (!!s){
                self.model.set("so_giay_phep", s);
                storejs.remove("X-S");
            }

            if (!!so){
                self.model.set("so_co", so);
                storejs.remove("X-SO");
            }

            if (!!sq){
                self.model.set("ma_kiem_nghiem", sq);
                storejs.remove("X-SQ");
            }
            if (!!dv && ten_donvi){
                let obj = {
                    id : dv,
                    ten_coso: ten_donvi
                }
                self.donvi_id = dv;
                self.selectDonvi(obj);
                storejs.remove("X-DV");
                storejs.remove("X-DVT");
            }
            else{
                self.selectDonvi();
            }
            if (!!l){
                self.model.set("loai_timkiem", l);
                storejs.remove("X-L");
                //nhập khẩu
                if (l ===1){
                    self.$el.find("#trangthai-nk").val(t);
                    self.$el.find(".btn-search-nk").click();
                }
                else if (l ==2){
                    self.$el.find("#trangthai-co").val(t);
                    self.$el.find(".btn-search-co").click();
                }
                else if(l==3){
                    self.$el.find("#trangthai-cq").val(t);
                    self.$el.find(".btn-search-cq").click();
                }
            }
            else{
                self.model.set("loai_timkiem", 4);
            }

        },
        selectDonvi : function(obj){
            var self = this;
            var $selectize = self.$el.find('#donvi').selectize({
                valueField: 'id',
                labelField: 'ten_coso',
				searchField: ['ten_coso', 'tenkhongdau'],
				preload: true,
				maxOptions : 10,
				maxItems : 1,
                load: function(query, callback) {
                    var query_filter = {"filters": {"$and": [
                        {
                            "$or": [
                                { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                { "ten_coso": { "$likeI": (query) } },
                            ]
                        },
                        {"$or": [
                            { "loai_donvi": { "$eq": 2} },
                            { "loai_donvi": { "$eq": 5} },
                            { "loai_donvi": { "$eq": 5} },
                            { "loai_donvi": { "$eq": 6} },
                            { "loai_donvi": { "$eq": 7} },
                            { "loai_donvi": { "$eq": 8} },
                            { "loai_donvi": { "$eq": 9} }
                        ]},
                        ]}};
                    if (!!obj){
                        callback([obj]);
                    }
					var url = (self.getApp().serviceURL || "") + '/api/v1/donvi_filter?' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                            if (!!obj){
                                let donvi_id = obj.id;
                                $selectize[0].selectize.setValue(donvi_id);
                            }
                        }
                    });
                },
                onChange: function(value, isOnInitialize) {
					var $selectz = (self.$el.find('#donvi'))[0];
					var obj = $selectz.selectize.options[value];
					if (obj !== undefined && obj !== null){
                        self.donvi_id = value;
                        self.ten_donvi = obj.ten_coso;
                        let $selectz1 = (self.$el.find("#chonduoclieu")[0]);
                        if (!!$selectz1  && !!$selectz1 .selectize){
                            $selectz1.selectize.destroy();	
                        }
                        self.selectizeDuoclieu("chonduoclieu", value);
					}
					else{
                        self.donvi_id = null;
                        self.ten_donvi = null;
                        let $selectz1 = (self.$el.find("#chonduoclieu")[0]);
                        if (!!$selectz1  && !!$selectz1 .selectize){
                            $selectz1.selectize.destroy();	
                        }
                        self.selectizeDuoclieu("chonduoclieu");
					}
                }



            });
        },
        register: function(){
            var self = this;
            self.model.on("change:loai_timkiem", function(){
                let loai_timkiem = self.model.get("loai_timkiem");
                //nhập khẩu
                if (loai_timkiem == 1){
                    self.$el.find(".nhapkhau").removeClass("d-none");
                    self.$el.find(".co").addClass("d-none");
                    self.$el.find(".cq").addClass("d-none");
                    self.$el.find(".duoclieu").addClass("d-none");
                    self.$el.find(".commom").removeClass("d-none");
                }
                //co
                else if (loai_timkiem ==2){
                    self.$el.find(".nhapkhau").addClass("d-none");
                    self.$el.find(".co").removeClass("d-none");
                    self.$el.find(".cq").addClass("d-none");
                    self.$el.find(".duoclieu").addClass("d-none");
                    self.$el.find(".commom").removeClass("d-none");
                }
                //cq
                else if (loai_timkiem ==3){
                    self.$el.find(".nhapkhau").addClass("d-none");
                    self.$el.find(".co").addClass("d-none");
                    self.$el.find(".cq").removeClass("d-none");
                    self.$el.find(".duoclieu").addClass("d-none");
                    self.$el.find(".commom").removeClass("d-none");
                }
                else if (loai_timkiem ==4){
                    // self.$el.find(".commom").addClass("d-none");
                    self.$el.find(".nhapkhau").addClass("d-none");
                    self.$el.find(".co").addClass("d-none");
                    self.$el.find(".cq").addClass("d-none");
                    self.$el.find(".duoclieu").removeClass("d-none");
                    let $selectz = (self.$el.find("#chonduoclieu")[0]);
                    if (!!$selectz  && !!$selectz .selectize){
                        $selectz.selectize.destroy();	
                    }
                    let donvi_id = self.donvi_id;
                    if (!!donvi_id){
                        self.selectizeDuoclieu("chonduoclieu", donvi_id);
                    }
                    else{
                        self.selectizeDuoclieu("chonduoclieu");
                    }
                }
            });
            self.$el.find(".btn-search-nk").unbind("click").bind("click", function(){
                let tungay = self.model.get("tungay");
                let denngay = self.model.get("denngay");
                var tmp = gonrinApp().parseInputDateString(denngay);
                denngay = self.parse_date_custom((moment(tmp).set({hour:23,minute:59,second:59})));
                let so_giay_phep = self.model.get("so_giay_phep");
                let trangthai = self.$el.find("#trangthai-nk").val();
                let donvi_id = self.donvi_id;
                let ten_donvi = self.ten_donvi;
                let params ={
                    tungay,
                    denngay,
                    so_giay_phep,
                    trangthai,
                    loai_timkiem: 1,
                    donvi_id,
                    ten_donvi
                }
                self.$el.find(".list-nhapkhau").removeClass("d-none");
                self.$el.find(".list-co").addClass("d-none");
                self.$el.find(".list-cq").addClass("d-none");
                self.$el.find(".list-duoclieu").addClass("d-none");
                self.$el.find(".results-title").removeClass("d-none").text("Danh sách giấy phép nhập khẩu");
                let collection = new CollectionNhapKhau({el: self.$el.find(".list-nhapkhau"), viewData: params});
                collection.render();

                return;
                self.getData(params);
            });

            self.$el.find(".btn-clear-nk").unbind("click").bind("click", (e)=>{
                e.stopPropagation();
                self.model.set("tungay", null);
                self.model.set("denngay", null);
                self.model.set("so_giay_phep", null);
                self.$el.find("#trangthai-nk").val("10");
                let $selectz = (self.$el.find("#donvi"))[0];
                if (!!$selectz){
                    $selectz.selectize.clear();
                }
                self.$el.find(".btn-search-nk").click();
            });

            self.$el.find(".btn-search-co").unbind("click").bind("click", function(){
                let tungay = self.model.get("tungay");
                let denngay = self.model.get("denngay");
                var tmp = gonrinApp().parseInputDateString(denngay);
                denngay = self.parse_date_custom((moment(tmp).set({hour:23,minute:59,second:59})));
                let so_co = self.model.get("so_co");
                let trangthai = self.$el.find("#trangthai-co").val();
                let donvi_id = self.donvi_id;
                let ten_donvi = self.ten_donvi
                let params ={
                    tungay,
                    denngay,
                    so_co,
                    trangthai,
                    loai_timkiem: 2,
                    donvi_id,
                    ten_donvi
                }
                self.$el.find(".list-nhapkhau").addClass("d-none");
                self.$el.find(".list-co").removeClass("d-none");
                self.$el.find(".list-cq").addClass("d-none");
                self.$el.find(".list-duoclieu").addClass("d-none");
                self.$el.find(".results-title").removeClass("d-none").text("Danh sách giấy chứng nhận nguồn gốc");
                let collection = new CollectionCo({el: self.$el.find(".list-co"), viewData: params});
                collection.render();

                return;
                self.getData(params);
            });

            self.$el.find(".btn-clear-co").unbind("click").bind("click", (e)=>{
                e.stopPropagation();
                self.model.set("tungay", null);
                self.model.set("denngay", null);
                self.model.set("so_co", null);
                self.$el.find("#trangthai-co").val("10");
                let $selectz = (self.$el.find("#donvi"))[0];
                if (!!$selectz){
                    $selectz.selectize.clear();
                }
                self.$el.find(".btn-search-co").click();
            });

            self.$el.find(".btn-search-cq").unbind("click").bind("click", function(){
                let tungay = self.model.get("tungay");
                let denngay = self.model.get("denngay");
                var tmp = gonrinApp().parseInputDateString(denngay);
                denngay = self.parse_date_custom((moment(tmp).set({hour:23,minute:59,second:59})));
                let ma_kiem_nghiem = self.model.get("ma_kiem_nghiem");
                let trangthai = self.$el.find("#trangthai-cq").val();
                let donvi_id = self.donvi_id;
                let ten_donvi = self.ten_donvi;
                let params ={
                    tungay,
                    denngay,
                    ma_kiem_nghiem,
                    trangthai,
                    loai_timkiem: 3,
                    donvi_id,
                    ten_donvi
                }
                self.$el.find(".list-nhapkhau").addClass("d-none");
                self.$el.find(".list-co").addClass("d-none");
                self.$el.find(".list-cq").removeClass("d-none");
                self.$el.find(".list-duoclieu").addClass("d-none");
                self.$el.find(".results-title").removeClass("d-none").text("Danh sách giấy chứng nhận chất lượng");
                let collection = new CollectionCq({el: self.$el.find(".list-cq"), viewData: params});
                collection.render();

                return;
                self.getData(params);
            });
            self.$el.find(".btn-clear-cq").unbind("click").bind("click", (e)=>{
                e.stopPropagation();
                self.model.set("tungay", null);
                self.model.set("denngay", null);
                self.model.set("ma_kiem_nghiem", null);
                self.$el.find("#trangthai-cq").val("10");
                let $selectz = (self.$el.find("#donvi"))[0];
                if (!!$selectz){
                    $selectz.selectize.clear();
                }
                self.$el.find(".btn-search-cq").click();
            });

            self.$el.find(".btn-search-sanpham").unbind("click").bind("click", (e) =>{
                e.stopPropagation();
                let id_sanpham = "";
                let $selectz = (self.$el.find("#chonduoclieu"))[0];
                if (!!$selectz){
                    id_sanpham = $selectz.selectize.getValue();
                }
                if (id_sanpham === undefined || id_sanpham === null || id_sanpham === ""){
                    self.getApp().notify({message: "Vui lòng chọn dược liệu"});
                    return false;
                }
                let donvi_id = self.donvi_id;
                let so_lo = self.model.get("so_lo");
                let ma_phieu = self.model.get("ma_phieu");
                let params = {
                    id_sanpham,
                    so_lo,
                    ma_phieu,
                    donvi_id,
                    loai_timkiem:4
                }
                self.$el.find(".list-nhapkhau").addClass("d-none");
                self.$el.find(".list-co").addClass("d-none");
                self.$el.find(".list-cq").addClass("d-none");
                self.$el.find(".list-duoclieu").removeClass("d-none");
                self.$el.find(".results-title").removeClass("d-none").text("Danh sách dược liệu");
                let collection = new CollectionDuoclieu({el: self.$el.find(".list-duoclieu"), viewData: params});
                collection.render();

                return;
                self.getData(params);
            });

            self.$el.find(".btn-clear-sanpham").unbind("click").bind("click", (e)=>{
                e.stopPropagation();
                self.model.set("so_lo", null);
                let $selectz = (self.$el.find("#donvi"))[0];
                if (!!$selectz){
                    $selectz.selectize.clear();
                }
                let $selectz2 = (self.$el.find("#chonduoclieu"))[0];
                if (!!$selectz2){
                    $selectz2.selectize.clear();
                    self.$el.find(".results .list-duoclieu").addClass("d-none");
                }
            });

        },
        getData: function(params){
            var self = this;
            if (!!params){
    			self.getApp().showloading();
                $.ajax({
                    url: (self.getApp().serviceURL || "") + '/api/v1/search',
                    dataType: "json",
                    contentType: "application/json",
                    method: 'POST',
                    data: JSON.stringify(params),
                    success: function(response) {
                        self.getApp().hideloading();
                        let loai_timkiem = params.loai_timkiem;
                        let results = response.results;
                        self.showData(results, loai_timkiem);
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
            }
        },
        showData: function(results, loai_timkiem){
            var self = this;
            if (Array.isArray(results) === false){
                results = []
            }
            let length = results.length;
            self.$el.find(".results tbody").html("");
            if (loai_timkiem === 1){
                self.$el.find(".table-nhapkhau").removeClass("d-none");
                self.$el.find(".table-co").addClass("d-none");
                self.$el.find(".table-cq").addClass("d-none");
                self.$el.find(".table-duoclieu").addClass("d-none");
                self.$el.find(".results-title").removeClass("d-none").text("Danh sách giấy phép nhập khẩu");
                if (length >0){
                    for (let i=0; i<length; i++){
                        let item = results[i];
                        let text_trangthai = "";
                        if (item.trangthai == 1){
                            text_trangthai = "<span class='text-primary'>Chưa duyệt</span>";
                        }
                        else if (item.trangthai == 2){
                            text_trangthai = "<span class='text-success'>Đã duyệt</span>";
                        }
                        let ten_donvi = "";
                        if (!!item.donvi_owner){
                            ten_donvi = item.donvi_owner.ten_coso;
                        }
                        let text_thoigian = self.convertTime(item.thoigian_capphep);
                        self.$el.find(".results .body-nk").append(`
                            <tr id ="${item.id}">
                                <td class="text-center">${i+1}</td>
                                <td class="">${item.so_giay_phep}</td>
                                <td calss="">${text_thoigian}</td>
                                <td class="">${self.convertTime(item.thoigian_hieuluc_batdau)}</td>
                                <td class="">${self.convertTime(item.thoigian_hieuluc_ketthuc)}</td>
                                <td class="">${ten_donvi}</td>
                                <td class="">${text_trangthai}</td>
                            </tr>
                        `);
                        self.$el.find(`#${item.id}`).unbind("click").bind("click", {data: item.id}, function(e){
                            e.stopPropagation();
                            if (!!e.data.data){
                                let f = self.model.get("tungay");
                                let d = self.model.get("denngay");
                                let s = self.model.get("so_giay_phep");
                                let t = self.$el.find("#trangthai-nk").val();
                                let l = self.model.get("loai_timkiem");
                                let dv = "";
                                let $selectz = (self.$el.find("#donvi"))[0];
                                if (!!$selectz){
                                    dv = $selectz.selectize.getValue();
                                }
                                let path = `giayphep_nhapkhau/model?id=${e.data.data}`;
                                if (!!f){
                                    storejs.set('X-F', f);
                                }
                                if (!!d){
                                    storejs.set('X-D', d);
                                }
                                if (!!s){
                                    storejs.set('X-S', s);
                                }
                                if (!!t){
                                    storejs.set('X-T', t);
                                }
                                if  (!!l){
                                    storejs.set('X-L', l);
                                }
                                if (!!dv){
                                    storejs.set('X-DV', dv);
                                }
                                if (!!ten_donvi){
                                    storejs.set('X-DVT', ten_donvi);
                                }
                                self.getApp().getRouter().navigate(path);
                            }
                        });
                    }
                }
                else{
                    self.$el.find(".results .body-nk").html(`<div class="text-primary mt-2 ml-2" style="width:100px">Chưa có dữ liệu</div>`);
                }
            }
            else if (loai_timkiem ===2){
                self.$el.find(".table-co").removeClass("d-none");
                self.$el.find(".table-nhapkhau").addClass("d-none");
                self.$el.find(".table-cq").addClass("d-none");
                self.$el.find(".table-duoclieu").addClass("d-none");
                self.$el.find(".results-title").removeClass("d-none").text("Danh sách giấy chứng nhận nguồn gốc");
                if (length > 0){
                    for (let i=0; i<length; i++){
                        let item = results[i];
                        let text_trangthai = "";
                        if (item.trangthai == 1){
                            text_trangthai = "<span class='text-primary'>Chưa duyệt</span>";
                        }
                        else if (item.trangthai == 2){
                            text_trangthai = "<span class='text-success'>Đã duyệt</span>";
                        }
                        let text_loaico = "";
                        if (item.loai_co == 1){
                            text_loaico = "Nhập khẩu";
                        }
                        else if (item.loai_co == 2){
                            text_loaico = "Trong nước";
                        }
                        let ten_donvi = "";
                        if (!!item.donvi_owner){
                            ten_donvi = item.donvi_owner.ten_coso;
                        }
                        self.$el.find(".results .body-co").append(`
                            <tr id ="${item.id}">
                                <td class="text-center">${i+1}</td>
                                <td class="">${text_loaico}</td>
                                <td calss="">${item.so_co}</td>
                                <td class="">${ten_donvi}</td>
                                <td class="">${self.convertTime(item.thoigian_cap_co)}</td>
                                <td class="">${item.donvi_chungnhan_co? item.donvi_chungnhan_co : ""}</td>
                                <td class="">${text_trangthai}</td>
                            </tr>
                        `);
                        self.$el.find(`#${item.id}`).unbind("click").bind("click", {data: item.id}, function(e){
                            e.stopPropagation();
                            if (!!e.data.data){
                                let f = self.model.get("tungay");
                                let d = self.model.get("denngay");
                                let so = self.model.get("so_co");
                                let t = self.$el.find("#trangthai-co").val();
                                let l = self.model.get("loai_timkiem");
                                let dv = "";
                                let $selectz = (self.$el.find("#donvi"))[0];
                                if (!!$selectz){
                                    dv = $selectz.selectize.getValue();
                                }
                                if (!!f){
                                    storejs.set('X-F', f);
                                }
                                if (!!d){
                                    storejs.set('X-D', d);
                                }
                                if (!!so){
                                    storejs.set('X-SO', so);
                                }
                                if (!!t){
                                    storejs.set('X-T', t);
                                }
                                if  (!!l){
                                    storejs.set('X-L', l);
                                }
                                if (!!dv){
                                    storejs.set('X-DV', dv);
                                }
                                if (!!ten_donvi){
                                    storejs.set('X-DVT', ten_donvi);
                                }
                                let path = `giaychungnhanco/model?id=${e.data.data}`;
                                self.getApp().getRouter().navigate(path);
                            }
                        });
                    }
                }
                else{
                    self.$el.find(".results .body-co").html(`<div class="text-primary mt-2 ml-2" style="width:100px">Chưa có dữ liệu</div>`);
                }
            }
            else if (loai_timkiem ===3){
                self.$el.find(".table-nhapkhau").addClass("d-none");
                self.$el.find(".table-co").addClass("d-none");
                self.$el.find(".table-cq").removeClass("d-none");
                self.$el.find(".table-duoclieu").addClass("d-none");
                self.$el.find(".results-title").removeClass("d-none").text("Danh sách giấy chứng nhận chất lượng");
                if (length>0){
                    for (let i=0; i<length; i++){
                        let item = results[i];
                        let text_trangthai = "";
                        if (item.trangthai == 1){
                            text_trangthai = "<span class='text-primary'>Chưa duyệt</span>";
                        }
                        else if (item.trangthai == 2){
                            text_trangthai = "<span class='text-success'>Đã duyệt</span>";
                        }
                        let ten_donvi = "";
                        if (!!item.donvi_owner){
                            ten_donvi = item.donvi_owner.ten_coso;
                        }
                        self.$el.find(".results .body-cq").append(`
                            <tr id ="${item.id}">
                                <td class="text-center">${i+1}</td>
                                <td class="">${item.ten_sanpham}</td>
                                <td calss="">${item.ma_kiem_nghiem}</td>
                                <td class="">${item.don_vi_gui_mau? item.don_vi_gui_mau: ""}</td>
                                <td class="">${self.convertTime(item.ngay_kiem_nghiem)}</td>
                                <td class="">${text_trangthai}</td>
                            </tr>
                        `);
                        self.$el.find(`#${item.id}`).unbind("click").bind("click", {data: item.id}, function(e){
                            e.stopPropagation();
                            if (!!e.data.data){
                                let f = self.model.get("tungay");
                                let d = self.model.get("denngay");
                                let sq = self.model.get("ma_kiem_nghiem");
                                let t = self.$el.find("#trangthai-cq").val();
                                let l = self.model.get("loai_timkiem");
                                let dv = "";
                                let $selectz = (self.$el.find("#donvi"))[0];
                                if (!!$selectz){
                                    dv = $selectz.selectize.getValue();
                                }
                                if (!!f){
                                    storejs.set('X-F', f);
                                }
                                if (!!d){
                                    storejs.set('X-D', d);
                                }
                                if (!!sq){
                                    storejs.set('X-SQ', sq);
                                }
                                if (!!t){
                                    storejs.set('X-T', t);
                                }
                                if  (!!l){
                                    storejs.set('X-L', l);
                                }
                                if (!!dv){
                                    storejs.set('X-DV', dv);
                                }
                                if (!!ten_donvi){
                                    storejs.set('X-DVT', ten_donvi);
                                }
                                let path = `phieu_kiem_nghiem/model?id=${e.data.data}`;
                                self.getApp().getRouter().navigate(path);
                            }
                        });
                    }
                }
                else{
                    self.$el.find(".results .body-cq").html(`<div class="text-primary mt-2 ml-2" style="width:100px">Chưa có dữ liệu</div>`);
                }
            }
            else if (loai_timkiem ===4){
                self.$el.find(".table-nhapkhau").addClass("d-none");
                self.$el.find(".table-co").addClass("d-none");
                self.$el.find(".table-cq").addClass("d-none");
                self.$el.find(".table-duoclieu").removeClass("d-none");
                self.$el.find(".results-title").removeClass("d-none").text("Danh sách dược liệu");
                if (length >0){
                    for (let i=0; i<length; i++){
                        let item = results[i];
                        self.$el.find(".results .body-duoclieu").append(`
                            <tr id="${item.id}">
                                <td class="text-center">${i+1}</td>
                                <td>${item.ten_sanpham}</td>
                                <td>${item.so_lo}</td>
                                <td>${item.ten_kho}</td>
                                <td>${item.ten_donvi}</td>
                                <td>
                                    <div id="qr_${item.id}" class="text-center">
                                        
                                    </div>
                                </td>
                            </tr>
                        `);
                        let url = self.getApp().serviceURL + "/api/v1/scanqrcode";
                        var qrcode = new QRCode(document.getElementById(`qr_${item.id}`), {
                            width: 80,
                            height: 80,
                            colorDark: "#000000",
                            colorLight: "#ffffff",
                            text: url + "?id=" + item.lichsu_id,
                            logoBackgroundColor: '#ffffff',
                            logoBackgroundTransparent: false,
                            quietZone: 5
                        });
                        self.$el.find(`#qr_${item.id}`).unbind('click').bind('click', function() {
                            var image_src = self.$el.find(`#qr_${item.id} img`).attr("src");
                            var DialogImagePost = Gonrin.DialogView.extend({
                                template: '<div class="row text-center"  style="padding: 50px 0px;"><img style="margin-left:auto;margin-right:auto" src="' + image_src + '"></img></div>',
                                render: function() {
                                    var self = this;
                                    self.applyBindings();
                                },
                            });
                            var view = new DialogImagePost();
                            view.dialog();
                        });
                    }
                }
                else{
                    self.$el.find(".results .body-duoclieu").html(`<div class="text-primary  mt-2 ml-2" style="width:100px">Chưa có dữ liệu</div>`);
                }
            }
        },
        //20210501000000
        convertTime: function(time) {
            var self = this;
            let results = "";
            if (typeof time === "string") {
                let years = time.slice(0, 4);
                let months = time.slice(4, 6);
                let days = time.slice(6, 8);
                results = `${days}/${months}/${years}`;
            }
            return results;
        },
        parse_date_custom : function(firstDay){
            var tmp = "";
            var firstDay = new Date(firstDay);
            if (isNaN(firstDay) == true){
                return "";
            }
			tmp = tmp + firstDay.getUTCFullYear();
			if (firstDay.getUTCMonth() < 9){
				tmp = tmp + "0" + (firstDay.getUTCMonth() +1)
			}else{
				tmp = tmp + (firstDay.getUTCMonth() +1)
			}
			if (firstDay.getUTCDate() <= 9){
				tmp = tmp + "0" + firstDay.getUTCDate();
			}
			else{
				tmp = tmp + firstDay.getUTCDate();
			}
			if (firstDay.getUTCHours() <=9){
				tmp = tmp + "0" + firstDay.getUTCHours();
			}
			else{
				tmp = tmp + firstDay.getUTCHours();
			}
			if (firstDay.getUTCMinutes() <=9){
				tmp = tmp + "0" + firstDay.getUTCMinutes();
			}
			else{
				tmp = tmp + firstDay.getUTCMinutes();
			}
			if (firstDay.getUTCSeconds() <=9){
				tmp = tmp + "0" + firstDay.getUTCSeconds();
			}
			else{
				tmp = tmp + firstDay.getUTCSeconds();
			}
			return tmp;
        },
        selectizeDuoclieu : function(html_id,  donvi_id){
            var self = this;
            // tìm kiếm theo danh mục
            if (!!donvi_id){
				var $selectize = self.$el.find('#' + html_id).selectize({
					valueField: 'id_sanpham',
					labelField: 'ten_sanpham',
					searchField: ['ten_sanpham', 'ten_khoa_hoc','tenkhongdau'],
					preload: true,
					sortField: {
						field: 'tenkhongdau',
						direction: 'asc'
					},
					load: function(query, callback) {
						var url = "";
	
						var query_filter = {"filters": {
                            "$and": [
                                    {   "$or": [
                                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                        { "ten_sanpham": { "$likeI": (query) } },
                                        { "ten_khoa_hoc": { "$likeI": gonrinApp().convert_khongdau(query) } }
                                        ]
                                    },
                                    {"donvi_id": {"$eq" : donvi_id}}
                                ]
                            }
						};
						var url = (self.getApp().serviceURL || "") + '/api/v1/sanpham_donvi_filter?results_per_page=15' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
						$.ajax({
							url: url,
							type: 'GET',
							dataType: 'json',
							error: function() {
								callback();
							},
							success: function(res) {
								callback(res.objects);
							}
						});  
	
					},
					render: {
						option: function (item, escape) {
							return `<div class="option">${item.ten_sanpham} - ${item.ten_khoa_hoc} - ${item.ma_viettat}</div>`;
						}
					},
					onChange: function(value, isOnInitialize) {
					}
				});
            }
            else{
                var $selectize = self.$el.find('#' + html_id).selectize({
                    valueField: 'id',
                    labelField: 'ten_sanpham',
                    searchField: ['ten_sanpham', 'ten_khoa_hoc','tenkhongdau'],
                    preload: true,
                    sortField: {
                        field: 'tenkhongdau',
                        direction: 'asc'
                    },
                    load: function(query, callback) {
                        var url = "";
    
                        var query_filter = {"filters": {"$or": [
                            { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                            { "ten_sanpham": { "$likeI": (query) } },
                            { "ten_khoa_hoc": { "$likeI": gonrinApp().convert_khongdau(query) } }
                            ]}
                        };
                        var url = (self.getApp().serviceURL || "") + '/api/v1/danhmuc_sanpham_filter?results_per_page=15' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
                        $.ajax({
                            url: url,
                            type: 'GET',
                            dataType: 'json',
                            error: function() {
                                callback();
                            },
                            success: function(res) {
                                callback(res.objects);
                            }
                        });  
    
                    },
                    render: {
                        option: function (item, escape) {
                            return `<div class="option">${item.ten_sanpham} - ${item.ten_khoa_hoc} - ${item.ma_viettat}</div>`;
                        }
                    },
                    onChange: function(value, isOnInitialize) {
    
                    }
                });
            }
		},
    });

});