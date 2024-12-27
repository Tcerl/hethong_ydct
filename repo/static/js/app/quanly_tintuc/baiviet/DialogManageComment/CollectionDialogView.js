define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/quanly_tintuc/baiviet/DialogManageComment/tpl/collection.html');
    var CustomFilterView      = require('app/bases/CustomFilterView');
    var DialogConfirmDelete = require('app/quanly_tintuc/baiviet/DialogConfirmDelete/ModelDialogView');
    return Gonrin.CollectionDialogView.extend({
        template: template,
        modelSchema: {},
        urlPrefix: "/api/v1/",
        collectionName: "get_comment_from_post_id",
        bindings:"data-bind-comment-post",
        tools: [],
        post_id: "",
        // objectChangeStatus: {},
        uiControl: {
            fields: [
                { field: "stt", label: "STT", width: "55px" },
                { field: "user_name", label: "Người bình luận", width: "150px" },
                { field: "content", label: "Nội dung" },
                { field: "time", label: "Thời gian", width: "110px" },
                {
                    field: "status",
                    label: "Trạng thái",
                    template: function(rowData) {
                        if (rowData.status == 0) {
                            return `<p id='text_` + rowData.id + `'>Chưa duyệt</p>`;
                        } 
                        else if (rowData.status == 1) {
                            return `<p id='text_` + rowData.id + `'>Đã duyệt</p>`;
                        } 
                        else if (rowData.status == 2) {
                            return `<p id='text_` + rowData.id + `'>Đã ẩn</p>`;
                        } 
                        return "";
                    },
                    width: "110px"
                },
                {
                    field: "command",
                    label: "Hành động",
                    width: "250px",
                    command: [
						{
						    "label":"Duyệt",
							"action": function(params, args){
                                var self = this;
                                self.changestatus(params, 1);
                            },
                            "class": function(e){
                                if (e.rowData.status == 0) {  //Trạng thái chưa duyệt
                                    return "btn-success btn-manage-comment duyet_" + e.rowData.id + " btn_" + e.rowData.id;	
                                }
                                else {
                                    return "btn-success btn-manage-comment d-none duyet_" + e.rowData.id + " btn_" + e.rowData.id;
                                }
                            }
                        }, 
                        {
                            "label":"Ẩn",
						    "action": function(params, args){
							    var self = this;
                                // let status = self.objectChangeStatus?.[params.rowData.id] || params.rowData.status;
                                // let status = self.objectChangeStatus[params.rowData.id] ? self.objectChangeStatus[params.rowData.id] : params.rowData.status;
                                // let status = self.objectChangeStatus[params.rowData.id] ?? params.rowData.status;
                                // if (status == 2) {
                                //     self.getApp().notify({ message: "Bình luận đã được ẩn" }, { type: "danger", delay: 1000 });
                                // }
                                // else {
                                //     self.changestatus(params, 2);
                                //     self.objectChangeStatus[params.rowData.id] = 2;
                                // }
                                self.changestatus(params, 2);
							},
							"class": function(e){
                                if (e.rowData.status == 1) { //Trạng thái đã duyệt 
                                    return "btn-warning btn-manage-comment an_" + e.rowData.id + " btn_" + e.rowData.id;	
                                }
                                else {
                                    return "btn-warning btn-manage-comment d-none an_" + e.rowData.id + " btn_" + e.rowData.id;
                                }
                            }
						},  
                        {
                            "label":"Hiện",
						    "action": function(params, args){
							    var self = this;
                                self.changestatus(params, 3);
							},
							"class": function(e){
                                if (e.rowData.status == 2) { //Trạng thái đã ẩn
                                    return "btn-primary btn-manage-comment hien_" + e.rowData.id + " btn_" + e.rowData.id;	
                                }
                                else {
                                    return "btn-primary btn-manage-comment d-none hien_" + e.rowData.id + " btn_" + e.rowData.id;
                                }
                            }
						}, 
                        {
                            "label":"Xóa",
						    "action": function(params, args){
							    var self = this;
                                // var grid_id = "grid_"+self.collectionName;
                                // self.$el.find("#"+grid_id).data('gonrin').deleteRow(params.el);
                                var dialog = new DialogConfirmDelete({"viewData": {}});
                                dialog.dialog();
                                dialog.on("confirm", function() {
                                    self.changestatus(params, 4);
                                });
							},
							"class": function(e){
                                var status = e.rowData.status;
                                if (status == 0 || status == 1 || status == 2) {
                                    return "btn-danger btn-manage-comment xoa_" + e.rowData.id + " btn_" + e.rowData.id;	
                                }
                                else {
                                    return "btn-danger btn-manage-comment d-none xoa_" + e.rowData.id + " btn_" + e.rowData.id;
                                }
                            }
						}
					],
                },
            ],
            pagination: {
                page: 1,
                pageSize: 50
            },
            // onRendered: function (e) {
			// 	var self = this;
			// 	var num_results = this.getCollectionElement().data('gonrin').getAllOptions().pagination.totalRows;
            //     console.log(num_results)
			// }
        },
        render: function() {
            var self = this;
            // var grid_id = "grid_"+self.collectionName;
            // self.$el.find(".grid-collection").attr({"id":grid_id});
            // self.objectChangeStatus = {};
            self.$el.find("#title_page").text("Danh sách bình luận");
            var post_id = self.viewData.post_id;
            if (post_id == undefined){
                self.getApp().notify({ message: "Tham số không hợp lệ" }, { type: "danger", delay: 1000 });
            }
            self.post_id = post_id;
            var filter = {
                "$and": [
                    { "post_id": { "$eq": post_id } },
                ]
            };
            self.uiControl.filters = filter;
            
    		self.applyBindings();
			self.$el.find("table").addClass("table-hover");
			self.$el.find("table").removeClass("table-striped");
            return this;
        },
        changestatus: function(params, status) {
            var self = this;
            var id = params.rowData.id;
            var data_params = { "id": id, "status": status };
            $.ajax({
                url: (self.getApp().serviceURL || "") + '/api/v1/comment_post/changestatus',
                data: JSON.stringify(data_params),
                dataType: "json",
                method: 'POST',
                contentType: "application/json",
                success: function(res) {
                    var msg = "";
                    if (status == 1) {
                        msg = "Duyệt bình luận thành công";
                        self.$el.find(".btn_" + id).addClass("d-none");
                        self.$el.find(".an_" + id).removeClass("d-none");
                        self.$el.find(".xoa_" + id).removeClass("d-none");
                        self.$el.find("#text_" + id).text("Đã duyệt");
                    }
                    else if (status == 2) {
                        msg = "Ẩn bình luận thành công";
                        self.$el.find(".btn_" + id).addClass("d-none");
                        self.$el.find(".hien_" + id).removeClass("d-none");
                        self.$el.find(".xoa_" + id).removeClass("d-none");
                        self.$el.find("#text_" + id).text("Đã ẩn");
                    }
                    else if (status == 3) {
                        msg = "Hiện bình luận thành công";
                        self.$el.find(".btn_" + id).addClass("d-none");
                        self.$el.find(".an_" + id).removeClass("d-none");
                        self.$el.find(".xoa_" + id).removeClass("d-none");
                        self.$el.find("#text_" + id).text("Đã duyệt");
                    }
                    else if (status == 4) {
                        msg = "Xóa bình luận thành công";
                        params.el.remove();
                    }
                    
                    self.getApp().notify(msg);
                    
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
                        self.getApp().notify({ message: "Thực hiện không thành công" }, { type: "danger", delay: 1000 });
                    }
                }
            });
        }
    });

});