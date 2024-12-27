const { bind } = require('underscore');

define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/truyxuatcocq/tpl/model.html'),
    schema = require('json!app/searchcocq/schema.json');
    var CollectionTruyXuat = require('app/truyxuatcocq/CollectionView');
    var CollectionCuc = require('app/truyxuatcocq/CollectionCuc');

    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
        collectionName: "truyxuat",
        arrKey: [],
		uiControl: {
            fields: [
            ]
        },
    	tools : [
		],
    	render:function(){
            var self = this;
            self.arrKey = [];
            self.applyBindings();
            self.register_event();
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
        register_event: function(){
            var self = this;
            self.$el.find('.list-search a').unbind("click").bind("click", (e)=>{
                e.stopPropagation();
                let el = $(e.target);
                let pre = el.attr("pre");
                let key = el.attr("key");
                if (pre === '0'){
                    el.prepend(`<i class="fas fa-check ${key}"></i>`);
                    el.attr("pre", "1");
                    self.arrKey.push(key);
                    let text = self.arrKey.map((value) =>{
                        if (value === "ma"){
                            return "Mã dược liệu";
                        }
                        else if (value ==="ten"){
                            return "Tên dược liệu";
                        }
                        else if (value === "solo"){
                            return "Số lô";
                        }
                        else if (value === "nhapkhau"){
                            return "Giấy phép nhập khẩu";
                        }
                        else if (value === "co"){
                            return "Số CO";
                        }
                        else if (value === "cq"){
                            return "Số CQ";
                        }
                        else {
                            return "";
                        }
                    }).join(", ");
                    if (text === ""){
                        self.$el.find(".filter").text(`(Tìm kiếm theo: Tên dược liệu, Mã dược liệu, Số lô)`);
                    }
                    else{
                        self.$el.find(".filter").text(`(Tìm kiếm theo: ${text})`);
                    }
                }
                else if(pre ==="1"){
                    self.$el.find(`i.${key}`).remove();
                    el.attr("pre", "0");
                    let index = self.arrKey.indexOf(key);
                    if (index != -1){
                        self.arrKey.splice(index,1)
                    }
                    let text = self.arrKey.map((value) =>{
                        if (value === "ma"){
                            return "Mã dược liệu";
                        }
                        else if (value ==="ten"){
                            return "Tên dược liệu";
                        }
                        else if (value === "solo"){
                            return "Số lô";
                        }
                        else if (value === "nhapkhau"){
                            return "Giấy phép nhập khẩu";
                        }
                        else if (value === "co"){
                            return "Số CO";
                        }
                        else if (value === "cq"){
                            return "Số CQ";
                        }
                        else {
                            return "";
                        }
                    }).join(", ");
                    if (text === ""){
                        self.$el.find(".filter").text(`(Tìm kiếm theo: Mã dược liệu, Tên dược liệu, Số lô)`);
                    }
                    else{
                        self.$el.find(".filter").text(`(Tìm kiếm theo: ${text})`);
                    }
                }
            })

            self.$el.find(".btn-truyxuat").unbind("click").bind("click", (e)=>{
                e.stopPropagation();

                let text_search = self.$el.find(".text-search").val();
                if (!text_search){
                    self.getApp().notify({message: "Vui lòng nhập từ khóa tìm kiếm"}, {type: "danger", delay : 1000});
                    return false;
                }
                else{
                    text_search = text_search.trim();
                    if (!text_search){
                        self.getApp().notify({message: "Vui lòng nhập từ khóa tìm kiếm"}, {type: "danger", delay : 1000});
                        return false;
                    }
                }
                let params = {
                    text_search,
                    arrKey: self.arrKey
                }
                let currentUser = self.getApp().currentUser;
                if (!!currentUser && currentUser.donvi?.tuyendonvi_id === "10"){
                    let collection = new CollectionCuc({el: self.$el.find(".list-results"), viewData: params});
                    collection.render();
                }
                else{
                    let collection = new CollectionTruyXuat({el: self.$el.find(".list-results"), viewData: params});
                    collection.render();
                }
            })

            self.$el.find(".text-search").on("keyup", (event)=>{
                event.stopPropagation();
                if (event.keyCode === 13) {
                    self.$el.find(".btn-truyxuat").trigger("click");
                }
            })
        },
    });

});