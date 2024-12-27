define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/quanly_tintuc/tacgia/tp/model.html'),
    	schema 				= require('json!schema/AuthorSchema.json');
	var RejectDialogView = require('app/bases/RejectDialogView');
    return Gonrin.ModelDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "author",
		uiControl: {
            fields: [
                {
                    field: "birthday",
                    uicontrol: "datetimepicker",
                    format: "DD/MM/YYYY",
                    textFormat: "DD/MM/YYYY",
                    extraFormats: ["DDMMYYYY"],
                    parseInputDate: function(val) {
                        return gonrinApp().parseInputDateString(String(val));
                    },
                    parseOutputDate: function(date) {
                        return gonrinApp().parseOutputDateString(date, "YYYYMMDD");
                    },
                    disabledComponentButton: true
                },
				{
                    field: "gender",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: 1, text: "Nam" },
                        { value: 2, text: "Nữ" },
                        { value: 3, text: "Khác" },
                    ],
                },
            ]
        },
    	tools : [
			{
				name: "back",
				type: "button",
				buttonClass: "btn-secondary waves-effect width-sm",
				label: `<i class="fas fa-times"></i> Đóng`,
				command: function() {
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
				command: function() {
					var self = this;
					var validate = self.validate();
                    if (validate === false) {
                        return;
                    }
					self.getApp().showloading();
					self.model.save(null,{
						success: function(model, respose, options) {
							self.getApp().hideloading();
							self.getApp().notify("Lưu thông tin thành công");
							self.trigger("saveData");
							self.close();
						},
						error: function(model, xhr, options) {
							self.getApp().hideloading();
							try {
								if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED") {
									self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
									self.getApp().getRouter().navigate("login");
								} 
								else {
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
                    return (!!this.viewData && this.viewData.id && !!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
				},
				command: function() {
					var self = this;
					var view = new RejectDialogView({ viewData: { "text": "Bạn có chắc chắn muốn xóa bản ghi này không?" } });
					view.dialog();
					view.on("confirm", (e) => {
						self.getApp().showloading();
						self.model.destroy({
							success: function(model, response) {
								self.getApp().hideloading();
								self.getApp().notify('Xoá dữ liệu thành công');
								self.trigger("saveData");
								self.close();
							},
							error: function(model, xhr, options) {
								self.getApp().hideloading();
								try {
									if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED") {
										self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
										self.getApp().getRouter().navigate("login");
									} 
									else {
										self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
									}
								}
								catch (err) {
									self.getApp().notify({ message: "Xóa thông tin không thành công"}, { type: "danger", delay: 1000 });
								}
							}
						});
					})
				}
			},
		],
    	render: function() {
    		var self = this;
			$.fn.inputFilter = function(inputFilter) {
				return this.on("input keydown keyup mousedown mouseup select contextmenu drop", function() {
					if (inputFilter(this.value)) {
						this.oldValue = this.value;
						this.oldSelectionStart = this.selectionStart;
						this.oldSelectionEnd = this.selectionEnd;
					} else if (this.hasOwnProperty("oldValue")) {
						this.value = this.oldValue;
						this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
					} else {
						this.value = "";
					}
				});
			};
			self.$el.find("input[data-bind='value:years_of_experience']").inputFilter(function(value) {
				return /^-?\d*$/.test(value); 
			});
    		var id = (!!self.viewData && !!self.viewData.id)? self.viewData.id : null;
    		if (id) {
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data) {
        				self.applyBindings();
        			},
        			error: function(model, xhr, options) {
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
    		}
    	},
		validate: function() {
            var self = this;
            var name = self.model.get("name"),
				alias_name = self.model.get("alias_name"),
				phone = self.model.get("phone"),
				email = self.model.get("email");
            
            if (!name || name == null || name == "") {
                self.getApp().notify({message: "Vui lòng nhập tên tác giả"}, {type: "danger", delay: 1000});
                return false;
            } 
            else if (!alias_name || alias_name == null || alias_name == "") {
                self.getApp().notify({message: "Vui lòng nhập bút danh tác giả"}, {type: "danger", delay: 1000});
                return false;
            } 
			if(!!phone && gonrinApp().validatePhone(phone) == false) {
                self.getApp().notify({message: "Vui lòng nhập đúng định dạng số điện thoại."}, {type: 'danger', delay: 1000});
                return false;
            } 
			if (!!email && gonrinApp().validateEmail(email) == false) {
                self.getApp().notify({message: "Vui lòng nhập đúng định dạng email."}, {type: 'danger', delay: 1000});
                return false;
            } 
			else if (!!email) {
                self.model.set("email", email.toLowerCase());
            }
            
            return true;
        },
    });
});