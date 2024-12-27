define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/quanly_tintuc/feature_news/tpl/model.html'),
    	schema 				= require('json!schema/FeatureNewsSchema.json');
    return Gonrin.ModelDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "feature_news",
		uiControl: {
            fields: [
				// {
                //     field: "type_placement",
                //     uicontrol: "combobox",
                //     textField: "text",
                //     valueField: "value",
                //     cssClass: "form-control",
                //     dataSource: [
                //         { value: 1, text: "Vị trí 1" },
                //         { value: 2, text: "Vị trí 2" },
				// 		{ value: 3, text: "Vị trí 3" },
				// 		{ value: 4, text: "Vị trí 4" },
				// 		{ value: 5, text: "Vị trí 5" },
                //     ],
                // }
            ]
        },
    	tools : [
			{
				name: "back",
				type: "button",
				buttonClass: "btn-secondary waves-effect width-sm",
				label: `<i class="fas fa-times"></i> Đóng`,
				command: function(){
					this.close();
				}
			},
			{
				name: "save",
				type: "button",
				buttonClass: "btn-success width-sm ml-2",
				label: `<i class="far fa-save"></i> Lưu`,
				visible: function() {
					var currentUser = gonrinApp().currentUser;
					return (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
				},
				command: function(){
					var self = this;
					if (self.validateTypePlacement("all") == true) {
						return;
					}
					self.getApp().showloading();
					self.model.save(null,{
						success: function (model, respose, options) {
							self.getApp().hideloading();
							self.getApp().notify("Lưu thông tin thành công");
							self.trigger("saveData");
							self.close();
						},
						error: function (xhr, status, error) {
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
								self.getApp().notify({ message: "Lưu thông tin không thành công"}, { type: "danger", delay: 1000 });
							}
						}
					});
				}
			},
			{
				name: "delete",
				type: "button",
				buttonClass: "btn-danger width-sm ml-2",
				label: `<i class="fas fa-trash-alt"></i> Xóa`,
				visible: function() {
					var currentUser = gonrinApp().currentUser;
					return (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
				},
				command: function() {
					var self = this;
					self.getApp().showloading();
					self.model.destroy({
						success: function(model, response) {
							self.getApp().hideloading();
							self.getApp().notify('Xoá dữ liệu thành công');
							self.trigger("saveData");
							self.close();
						},
						error: function (xhr, status, error) {
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
								self.getApp().notify({ message: "Xóa thông tin không thành công"}, { type: "danger", delay: 1000 });
							}
						}
					});
				}
			},
		],
		stt_news: 1,
    	render: function() {
    		var self = this;
			self.stt_news = 1;
			var arrayPlacement = [];
			if (self.getApp().project_name == "TINTUC_SO_BMTE") {
				arrayPlacement = [
					{ text: "Vị trí 1", value: 1 },
					{ text: "Vị trí 2", value: 2 },
					{ text: "Vị trí 3", value: 3 },
					{ text: "Vị trí 4", value: 4 },
					{ text: "Vị trí 5", value: 5 }
				]
			}
			else if (self.getApp().project_name == "TINTUC_YDCT") {
				arrayPlacement = [
					{ text: "Vị trí 1", value: 1 },
					{ text: "Vị trí 2", value: 2 },
				]
				self.$el.find("#preview_feature_news").attr("src", "static/images_template/preview_feature_news_ydct.png");
			}
			else if (self.getApp().project_name == "TINTUC_CTMTQG") {
				arrayPlacement = [
					{ text: "Vị trí 1", value: 1 },
					{ text: "Vị trí 2", value: 2 },
					{ text: "Vị trí 3", value: 3 },
				]
			}
			else {
				arrayPlacement = [
					{ text: "Vị trí 1", value: 1 },
					{ text: "Vị trí 2", value: 2 },
					{ text: "Vị trí 3", value: 3 },
					{ text: "Vị trí 4", value: 4 },
					{ text: "Vị trí 5", value: 5 }
				]
			}
			self.$el.find('#type_placement').combobox({
				textField: "text",
				valueField: "value",
				dataSource: arrayPlacement,
				value: 1
			});
			self.$el.find('#type_placement').on("change.gonrin", function() {
				var type_value = self.$el.find('#type_placement').data('gonrin').getValue();
				self.model.set("type_placement", type_value)
			});
    		var id = (!!self.viewData && !!self.viewData.id)? self.viewData.id : null;
			self.$el.find("#bocuc-vitri").unbind("click").bind("click", function () {
				gonrinApp().openPhotoSwipe(0, self.$el, "list-image");
			});
			self.selectize_chon_baiviet();
    		if(id) {
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data){
        				self.applyBindings();
						self.$el.find('#type_placement').data('gonrin').setValue(self.model.get("type_placement"));
						var list_news = self.model.get("list_news");
						self.$el.find('.table-news').removeClass("d-none");
						self.stt_news = list_news.length + 1;
						if (!!list_news && list_news !== null && list_news instanceof Array && list_news.length > 0) {
							list_news.forEach( (value, index) => {
								self.renderTplNews(value);
							});
						} else {
							self.model.set("list_news", []);
							self.$el.find('.table-news').addClass("d-none");
						}
        			},
        			error:function(){
    					try {
							if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED") {
								self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
								self.getApp().getRouter().navigate("login");
							} else {
								self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
							}
						} catch (err) {
							self.getApp().notify({ message: "Lỗi truy cập dữ liệu, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
						}
    				},
        		});
    		}
			else{
    			self.applyBindings();
				self.model.set("list_news", []);
				self.$el.find('.table-news').addClass("d-none");
    		}
    	},
		selectize_chon_baiviet: function () {
			var self = this;
			var $selectize = self.$el.find("#selectize-chon-baiviet").selectize({
                valueField: 'id',
                labelField: 'title',
				searchField: ['id', 'title', "unsigned_title"],
                preload: true,
				maxItems: 1,
                load: function(query, callback) {

					var query_filter = {
						"filters": {
							"$and": [
								{"status": {"$eq": 6}},
								{"deleted": {"$eq": false}}
							]
						},
						"order_by": [{ "field": "publish_time", "direction": "desc" }]
					};
					if (query != "" && query != null && query != undefined) {
						query_filter["filters"]["$and"].push({"unsigned_title": { "$likeI": gonrinApp().removeVietnameseTones(query) } });
					}

                    var url = (self.getApp().serviceURL || "") + '/api/v1/post_dialog?page=1&results_per_page=10' + (query_filter ? "&q=" + JSON.stringify(query_filter): "");
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
                onChange: function(value, isOnInitialize) {
					var $selectz = (self.$el.find("#selectize-chon-baiviet"))[0];
					if (!!value && value !== "") {
						var obj = $selectz.selectize.options[value];
						if (!!obj) delete obj.$order;
						var object_new = {
							"id": obj.id,
							"title": obj.title,
						}
						if (self.validateTypePlacement("over") == false) {
							self.onSaveNews(object_new);
						}
						
						$selectz.selectize.clear();
						self.$el.find("#selectize-chon-baiviet").focus();
					}
                }
            });
		},
		// benh kem theo
        onRemoveNews: function (data_news) {
            var self = this;
			var list_news = self.model.get('list_news');
            if (list_news instanceof Array && list_news.length > 0) {
                var array_list_news = [];
                for (var i = 0; i < list_news.length; i++) {
                    if (data_news.id == list_news[i].id) {
                        continue
                    } else {
                        array_list_news.push(list_news[i]);
                    }
				}
				self.model.set("list_news", array_list_news);
				if (array_list_news.length == 0) {
					self.stt_news = 1;
					self.$el.find('.table-news').addClass("d-none");
				}
				self.$el.find('.' + data_news.id).remove();
                return;
            }
        },
        onSaveNews: function (data_news) {
			var self = this;
			var exist = false;
			var list_news = self.model.get('list_news');
            if (list_news == null || list_news == undefined) {
                list_news = [];
			}
            if (list_news instanceof Array) {
                var array_list_news = [];
                if (list_news.length == 0) {
					data_news.stt = self.stt_news;
					self.stt_news = self.stt_news + 1;

                    array_list_news.push(data_news);
					
                } else {
                    for (var i = 0; i < list_news.length; i++) {
                        if (data_news.id == list_news[i].id) {
							exist= true;
                            continue
                        } else {
                            array_list_news.push(list_news[i]);
                        }
                    }
					if (exist == false) {
						data_news.stt = self.stt_news;
						self.stt_news = self.stt_news + 1;
					}
					

                    array_list_news.push(data_news);
				}
				self.model.set("list_news", array_list_news);
				if (array_list_news.length > 0) {
					self.$el.find('.table-news').removeClass("d-none");
				} else {
					self.stt_news = 1;
				}
				if (exist == false) {
					self.renderTplNews(data_news);
				}
			}
		},
		renderTplNews: function (data_news) {
			var self = this;
			self.$el.find('.table-news tbody').append(`<tr class="` + data_news.id + `">
				<td class="px-1"><input type="number" class="stt form-control text-center" value=` + data_news.stt +  `></td>
				<td scope="col">` + data_news.title + `</td>
				<td class="text-center"><button class="demo-delete-row btn btn-danger btn-xs btn-icon ` + data_news.id + `_remove" title="Xóa"><i class="fa fa-times"></i></button></td>
			</tr>`);
			self.$el.find("." + data_news.id + "_remove").unbind("click").bind("click",{obj: data_news }, function (e) {
				var data_obj = e.data.obj;
				self.onRemoveNews(data_obj);
			});
			self.$el.find("." + data_news.id + " .stt").on("change", {obj: data_news} , function (e) {
				var data_obj = e.data.obj;
				var stt = self.$el.find("." + data_obj.id + " .stt").val();
				try {
					data_obj.stt = Number(stt);
					self.onSaveNews(data_obj);
				} catch (err) {
					console.log(err);
				}
			})
		},
		validateTypePlacement: function (mode = "over") {
			//mode: over: chỉ so sánh vượt quá thì báo lỗi, all - so sánh all
			var self = this;
			var result = false; // false - no problem , true - have error
			var type_placement = self.model.get("type_placement");
			var list_news =  self.model.get("list_news");
			var number_placement_1 = 1,
				number_placement_2 = 0,
				number_placement_3 = 0,
				number_placement_4 = 0,
				number_placement_5 = 0;

			if (self.getApp().project_name == "TINTUC_SO_BMTE") {
				number_placement_2 = 2;
				number_placement_3 = 3;
				number_placement_4 = 1;
				number_placement_5 = 6;
			}
			else if (self.getApp().project_name == "TINTUC_YDCT") {
				number_placement_2 = 4;
			}
			else if (self.getApp().project_name == "TINTUC_CTMTQG") {
				number_placement_2 = 2;
				number_placement_3 = 9;
			}
			else {
				number_placement_2 = 2;
				number_placement_3 = 3;
				number_placement_4 = 1;
				number_placement_5 = 6;
			}
			if (mode == "all"){
				if (list_news instanceof Array && list_news.length == 0) {
					gonrinApp().notify({ message: "Vui lòng chọn bài viết nổi bật." }, { type: "danger", delay: 1000 });
					return true
				}
			}
			var text_warning = "Số lượng bài viết đã đủ. Vui lòng xoá bài viết để thêm vào danh sách.";
			if (type_placement == 1 && ((mode == "over" && list_news.length >= number_placement_1) || (mode == "all" && list_news.length > number_placement_1))) {
				if (mode == "all") {
					text_warning = "Số lượng bài viết không hợp lệ.";
				} 
				result = true;
			} else if (type_placement == 2 && ((mode == "over" && list_news.length >= number_placement_2) || (mode == "all" && list_news.length > number_placement_2))) {
				if (mode == "all") {
					text_warning = "Số lượng bài viết không hợp lệ.";
				}
				result = true;
			} else if (type_placement == 3 && ((mode == "over" && list_news.length >= number_placement_3) || (mode == "all" && list_news.length > number_placement_3))) {
				if (mode == "all") {
					text_warning = "Số lượng bài viết không hợp lệ.";
				}
				result = true;
			} else if (type_placement == 4 && ((mode == "over" && list_news.length >= number_placement_4) || (mode == "all" && list_news.length > number_placement_4))) {
				if (mode == "all") {
					text_warning = "Số lượng bài viết không hợp lệ.";
				}
				result = true;
			} else if (type_placement == 5 && ((mode == "over" && list_news.length >= number_placement_5) || (mode == "all" && list_news.length > number_placement_5))) {
				if (mode == "all") {
					text_warning = "Số lượng bài viết không hợp lệ.";
				}
				result = true;
			} 

			self.$el.find(".border-red").removeClass("border-red");
			for(var i = 0; i < list_news.length; i++) {
				var stt = self.$el.find("." + list_news[i].id + " .stt").val();
				if (!stt) {
					self.$el.find("." + list_news[i].id + " .stt").focus();
					self.$el.find("." + list_news[i].id + " input").addClass("border-red");
					result = true;
					text_warning = "Số thứ tự bài viết không đúng";
				}
			}
			if (result) {
				gonrinApp().notify({ message: text_warning }, { type: "danger", delay: 3000 });
			}
			return result;
		}
    });

});