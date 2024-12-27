define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/Suggestion/tpl/model.html');
    	// schema 				= require('json!app/view/HeThong/User/Schema.json');
    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: {},
    	render:function() {
            var self = this;
            var currentUser = self.getApp().currentUser;
            if (currentUser) {
                self.applyBindings();
                self.$el.find("#email").val(currentUser.email);
                self.$el.find("#hoten").val(currentUser.fullname);
                self.$el.find("#phone").val(currentUser.phone);
                self.$el.find(".btn_send").unbind("click").bind("click", function () {
                    var uid = currentUser.id,
                        suggestion = self.$el.find("#suggestion").val(),
                        created_at = Number( moment().unix());
                    if (suggestion !== undefined && suggestion !== null && suggestion.trim() !== ""){
                        var currentDay = moment.unix(created_at).local().format("DD/MM/YYYY H:mm:ss");
                        var data = self.$el.find("#hoten").val() + " đã góp ý phần mềm Báo cáo vật tư phòng chống dich PPE vào ngày " + String(currentDay) + "\n" + suggestion;
    
                        var params = {
                            "id": uid,
                            "created_at": created_at,
                            "email" : self.$el.find("#hoten").val(),
                            "phone" : self.$el.find("#hoten").val(),
                            "fullname" : self.$el.find("#hoten").val(),
                            "data": data
                        }
                        $.ajax({
                            url: (self.getApp().serviceURL || "") + '/api/v1/suggestion',
                            data: JSON.stringify(params),
                            dataType: "json",
                            method: 'POST',
                            contentType: "application/json",
                            success: function (data) {
                                self.getApp().notify("Cảm ơn bạn đã góp ý đến Phần mềm Báo cáo vật tư phòng chống dịch PPE.Chúng tôi sẽ tiếp nhận và phản hồi trong thời gian sớm nhất!");
                                self.getApp().getRouter().navigate("sochamsoc/model?id=current");
                            },
                            error: function (xhr, status, error) {
                                try {
                                    var data = JSON.stringify(params);
                                } catch (e) {
                                    console.log(e);
                                }
                                self.getApp().notify("Có lỗi xảy ra, vui lòng thử lại sau");
                            },
                        });
                    }
                    else{
                        self.getApp().notify({message : "Vui lòng không để trống thông tin góp ý"}, {type : "danger", delay : 1000});
                        return;
                    }
                });
            }
        }
    });

});