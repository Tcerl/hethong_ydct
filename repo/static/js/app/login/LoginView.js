define(function(require) {

    "use strict";
    var Gonrin = require('gonrin'),
        storejs = require('vendor/store'),

        tpl = require('text!app/login/tpl/login.html'),
        template = _.template(tpl);
    return Gonrin.View.extend({
        render: function() {
            var self = this;
            storejs.set('X-USER-TOKEN', '');
            if (!!gonrinApp().currentUser) {
                gonrinApp().currentUser = null;
            }

            this.$el.html(template());
            this.$el.find(".btn-login").unbind("click").bind("click", function() {
                gonrinApp().check_permission_notify();
                self.processLogin();
                return false;
            });
            self.$el.find(".btn_forgot").unbind("click").bind("click", function() {
                self.getApp().getRouter().navigate("forgot")
                return false;
            });
            this.$el.find("#register").unbind("click").bind("click", function() {
                self.getApp().getRouter().navigate("register")
                return false;
            });
            // this.$el.find("#back").unbind("click").bind("click", function() {
            //     self.getApp().getRouter().navigate("splash")
            //     return false;
            // });
            // self.$el.find('.input-group-append').unbind("click").bind("click", function () {
                self.$el.find("[data-password]").on('click', function() {
                    if($(this).attr('data-password') == "false"){
                        $(this).siblings("input").attr("type", "text");
                        $(this).attr('data-password', 'true');
                        $(this).addClass("show-password");
                    } else {
                        $(this).siblings("input").attr("type", "password");
                        $(this).attr('data-password', 'false');
                        $(this).removeClass("show-password");
                    }
                });
            // });
            self.$el.find(".input-login").unbind("keyup").bind("keyup", function(event) {
                var keycode = (event.keyCode ? event.keyCode : event.which);
                if(keycode == '13'){
                    self.$el.find(".btn-login").click();
                }
            });
            return this;
        },
        processLogin: function() {
            var self = this;
            var username = self.$el.find('#emailaddress').val();
            var password = self.$el.find('#password').val();
            // var qrcode = this.getApp().getRouter().getParam("qr");
            if (username === undefined || username === "" || password === undefined || password === "") {
                self.getApp().notify({ message: "Vui lòng nhập tài khoản và mật khẩu" }, { type: "danger", delay: 2000 });
                return;
            } 
            else {
                username = username.toLowerCase();
            }
            var data = JSON.stringify({
                data: username,
                password: password
            });

            self.getApp().showloading();
            var url_login = self.getApp().serviceURL + '/api/v1/login';
            $.ajax({
                url: url_login,
                type: 'POST',
                data: data,
                headers: {
                    'content-type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                beforeSend: function() {
                    $("#loading").removeClass("d-none");
                },
                dataType: 'json',
                success: function(data) {
                    self.getApp().hideloading();
                    if (data.active == 0) {
                        self.getApp().notify({message: "Tài khoản của bạn đã bị khóa"}, {type: "danger", delay: 5000});
                        self.$el.find('#emailaddress').val("");
                        self.$el.find('#password').val("");
                    } 
                    else if (data.active === 1 || data.active === '1') {
                        $.ajaxSetup({
                            headers: {
                                'X-USER-TOKEN': data.token
                            }
                        });
                        storejs.set('X-USER-TOKEN', data.token);
                        self.getApp().postLogin(data);
                        self.getApp().notify("Đăng nhập thành công");
                    } 
                    else {
                        self.getApp().notify({message: "Tài khoản của bạn đã bị khóa"}, {type: "danger", delay: 5000});
                        self.$el.find('#emailaddress').val("");
                        self.$el.find('#password').val("");
                    }
                },
                error: function(xhr, status, error) {
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
                        self.getApp().notify({ message: "Có lỗi xảy ra, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
                    }
                },
            });
        },

    });

});