define(function (require) {

    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin            	= require('gonrin'),
//        storejs				= require('store'),
        tpl                 = require('text!app/bases/tpl/forgotpassword.html'),
        template = _.template(tpl);

    return Gonrin.View.extend({
        render: function () {
            var self = this;
            this.$el.html(template());
            this.$el.find("#button-forgot-password").unbind("click").bind("click", function(){
                self.processForgotPass();
            });
            self.$el.find("#back").unbind('click').bind('click', function() {
                gonrinApp().getRouter().navigate('login');
                return false;
            });
            
          
            return this;
        },

       	processForgotPass: function(){
            var self = this;
            var type_confirm = self.$el.find("input[name='type_confirm']:checked").val();
            var email = this.$('#emailaddress').val();
            if(email ===undefined || email ===""){
                self.getApp().notify("Yêu cầu nhập Email");
                return false;
            }
       		var data = JSON.stringify({
                   email: email,
       		});
       		$.ajax({
       		    url: (self.getApp().serviceURL || "") + '/api/resetpw',
       		    type: 'post',
       		    data: data,
	       		headers: {
	    		    	'content-type': 'application/json'
	    		    },
       		    dataType: 'json',
       		    success: function (data) {
                    if (type_confirm === '0' || type_confirm === 0){
                        gonrinApp().notify("Gửi mã xác nhận thành công, vui lòng kiểm tra Email");
                    }else{
                        gonrinApp().notify("Gửi mã xác nhận thành công, vui lòng kiểm tra tin nhắn điện thoại");
                    }
                    
       		    	self.getApp().getRouter().navigate("confirm-changepass?uid="+data.id);
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
       	},

    });

});