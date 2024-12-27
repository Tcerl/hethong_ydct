define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= `<div class="row">
        <div class="grid-collection" id="grid" data-bind='collection:$collection'></div>
        </div>
        `,

        schema 				= require('json!schema/BaoCaoKhoChiTietSchema.json');
    var danhmuc_donvitinh = require('json!app/constant/donvitinh.json');
    var CustomFilterView      = require('app/bases/CustomFilterView');

    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
        collectionName: "baocaokho_chitiet",
        uiControl:{
            fields:[
                { field: "stt", label: "STT", width:20 },
                { field: "ten_sanpham", label: "Tên Dược liệu", width:200, template: function(rowData){
                    if(rowData !== undefined){
						if (rowData.so_lo !== null && rowData.so_lo !== undefined){
                            return rowData.ten_sanpham +(rowData.ten_kho?("("+rowData.ten_kho + ")"):"");
						} else {
                            return rowData.ten_sanpham;
                        }
					}
					return "";
                } },
                { field: "ma_sanpham", label: "Mã Dược liệu", template:function(rowData){
					if(rowData !== undefined){
						if (rowData.ma_sanpham !== null && rowData.ma_sanpham !== undefined){
                            return rowData.ma_sanpham;
						}
					}
					return "";
                  } },
                  { field: "so_lo", label: "Số lô", width:100, template:function(rowData){
					if(rowData !== undefined){
						if (rowData.so_lo !== null && rowData.so_lo !== undefined){
                            return rowData.so_lo? rowData.so_lo : "";
						}
					}
					return "";
                  } },
                  { field: "donvitinh", label: "ĐVT", width:95 ,
                    template: function (rowData) {
                        if (rowData.sanpham !== null && rowData.sanpham !== undefined) {
                            for(var i=0; i< danhmuc_donvitinh.length; i++){
                                if(danhmuc_donvitinh[i].value === rowData.sanpham.donvitinh){
                                    return danhmuc_donvitinh[i].text;
                                }
                            }
                        }
                        return "Kg";
                    }
                },
                  { field: "dongia_nhap", label: "Đơn giá", template:function(rowData){
					if(rowData !== undefined){
						if (rowData.dongia_nhap !== null && rowData.dongia_nhap !== undefined){
                            return rowData.dongia_nhap ? Number(rowData.dongia_nhap).toLocaleString() : "";
						}
					}
					return "";
                  } },
                  { field: "soluong_ton_dauky", label: "soluong_ton_dauky", template:function(rowData){
                    if(rowData.soluong_ton_dauky !== null && rowData.soluong_ton_dauky !== undefined){
                        return Number(rowData.soluong_ton_dauky).toLocaleString();
                    }
                    return "";
                  }},
                  { field: "thanhtien_ton_dauky", label: "thanhtien_ton_dauky", template:function(rowData){
                    if(rowData.thanhtien_ton_dauky !== null && rowData.thanhtien_ton_dauky !== undefined){
                        return Number(rowData.thanhtien_ton_dauky).toLocaleString();
                    }
                    return "0";
                }},
                  { field: "soluong_nhap", label: "soluong_nhap", template:function(rowData){
                    if(rowData.soluong_nhap !== null && rowData.soluong_nhap!==undefined){
                        return Number(rowData.soluong_nhap).toLocaleString();
                    }
                    return "0";
                }},
                  { field: "thanhtien_nhap", label: "thanhtien_nhap", template:function(rowData){
                    if(rowData.thanhtien_nhap !== null && rowData.thanhtien_nhap!==undefined){
                        return Number(rowData.thanhtien_nhap).toLocaleString();
                    }
                    return "0";
                }},
                  { field: "soluong_xuat", label: "soluong_xuat", template:function(rowData){
                    if(rowData.soluong_xuat !== null && rowData.soluong_xuat!==undefined){
                        return Number(rowData.soluong_xuat).toLocaleString();
                    }
                    return "0";
                }},
                  { field: "thanhtien_xuat", label: "thanhtien_xuat", template:function(rowData){
                    if(rowData.thanhtien_xuat !== null && rowData.thanhtien_xuat !== undefined){
                        return Number(rowData.thanhtien_xuat).toLocaleString();
                    }
                    return "0";
                }},
                  { field: "soluong_ton_cuoiky", label: "thanhtien_ton_cuoiky", template:function(rowData){
                    if(rowData.soluong_ton_cuoiky !== null && rowData.soluong_ton_cuoiky !== undefined){
                        return Number(rowData.soluong_ton_cuoiky).toLocaleString();
                    }
                    return "0";
                }},
                  { field: "thanhtien_ton_cuoiky", label: "thanhtien_ton_cuoiky", template:function(rowData){
                    if(rowData.thanhtien_ton_cuoiky !== null && rowData.thanhtien_ton_cuoiky !==undefined){
                        return Number(rowData.thanhtien_ton_cuoiky).toLocaleString();
                    }
                    return "0";
                }},
                  { field: "nuoc_sanxuat", label: "nuoc_sanxuat"}
            ],
            language:{
                no_records_found:"Chưa có thông tin báo cáo"
            },
            noResultsClass:"alert alert-default no-records-found",
            datatableClass:"table table-bordered",
            rowClass: "grid_row px-05",
            onRendered: function(){
                var self = this;
                self.$el.find("thead").addClass("thead-light").html(`<tr>
                    <th data-sort-initial="true" data-toggle="true" rowspan="2" >STT</th>
                    <th rowspan="2" style="min-width: 220px;" >Tên Dược liệu</th>
                    <th rowspan="2" style="width: 100px;" >Mã Dược liệu</th>
                    <th rowspan="2" style="width: 120px;" >Số lô</th>
                    <th rowspan="2" class="text-center" style="width: 70px;">ĐVT</th>
                    <th rowspan="2" class="">Đơn giá</th>
                    <th class="text-center tondau" colspan="2">Tồn đầu</th>
                    <th class="text-center" colspan="2">Nhập</th>
                    <th class="text-center" colspan="2">Xuất</th>
                    <th class="text-center" colspan="2">Tồn cuối</th>
                    <th  rowspan="2" class="">Nước sản xuất</th>
                </tr>
                <tr>
                    <th class="px-05 text-center">S.lg</th>
                    <th class="px-05 text-center">T.Tiền</th>
                    <th class="px-05 text-center">S.lg</th>
                    <th class="px-05 text-center">T.Tiền</th>
                    <th class="px-05 text-center">S.lg</th>
                    <th class="px-05 text-center">T.Tiền</th>
                    <th class="px-05 text-center">S.lg</th>
                    <th class="px-05 text-center">T.Tiền</th>
                </tr>`);
            },
        },
        
        render:function(){
            var self = this;
            var viewData = self.viewData;
            if(viewData == undefined || viewData.baocao_id == undefined){
                return "";
            } else {
                self.uiControl.filters = {"baocao_id": {"$eq": viewData.baocao_id }};
            }
			 var filter = new CustomFilterView({
    			el: $("div#grid_search"),
    			sessionKey: self.collectionName +"_filter"
    		});
    		filter.render();
            self.$el.find("#grid_search input").val("");
            self.$el.find("#grid_search input").removeClass("col-11");
            var filter_query = self.uiControl.filters;
            if (filter_query !== undefined && filter_query !== null && filter_query !== false) {
				self.query = filter_query;
            }
            filter.model.set("text", "");
    		self.uiControl.orderBy = [{"field": "ten_sanpham", "direction": "asc"}];
    		if(!filter.isEmptyFilter()) {
				var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
				if(text!=null && text !==""){
					var filters = {"ten_sanpham": {"$likeI": text }};
					var filter1;
					if (self.query !== null && self.query !== undefined) {
						filter1 = { "$and": [
							filters, self.query
						]};
					} else {
						filter1 = filters;
					}
					self.uiControl.filters = filter1;
				}
				
    		}
    		self.applyBindings();
    		
    		filter.on('filterChanged', function(evt) {
    			var $col = self.getCollectionElement();
    			var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null){
						var filters = {"ten_sanpham": {"$likeI": text }};
						var filter1;
						if (self.query !== null && self.query !== undefined) {
							filter1 = { "$and": [
								filters, self.query
							]};
						} else {
							filter1 = filters;
						}
						$col.data('gonrin').filter(filter1);
					}
				}
				self.applyBindings();
            });
            self.$el.find(".grid_container").addClass("w-100");
    		return this;
        },
       
    });

});