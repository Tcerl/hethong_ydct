define(function(require) {

    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin'),
        tpl = require('text!app/notifications/tpl/notify.html'),
        template = _.template(tpl);
    return Gonrin.View.extend({
        render: function() {
            var self = this;

            this.$el.html(template());


            this.$el.find("#back").unbind("click").bind("click", function() {
                self.getApp().getRouter().navigate("home")
                return false;
            });
            self.get_data_notify();
            return this;
        },
        get_data_notify: function(){
            var self = this;
            var $content = self.$el.find("#main-content");
            $content.html("");
            self.getApp().showloading();
            var url_server = self.getApp().serviceURL + '/api/v1/notify/read';
            $.ajax({
                url: url_server,
                type: 'GET',
                headers: {
                    'content-type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                beforeSend: function() {
                    $("#loading").removeClass("d-none");
                },
                dataType: 'json',
                success: function(data) {
                    // $(".notify .badge").addClass("d-none").html("");
                    if (data !== null && !!data.objects) {
                        for(var i=0; i< data.objects.length ; i++){
                            var item = data.objects[i];
                            var el_container;
                            if (item.type == "call_video") {
                                el_container = $('<div>').addClass('container-2').addClass('col-12 row ').html(`<div class="col-11 row notify-list d-flex"><div class="icon_notify"><div class="border-icon"><i class="fa fa-video"></i></div></div>
                                <div class="content_notify"><div class="name-ticket">
                                <span class="type-notify">`+item.title+`</span> <br>
                                <span class="left">`+moment.unix(item.created_at).local().format("DD/MM/YYYY HH:mm")+`</span>
                                </div>
                                <div class="info-ticket">
                                <p>
                                `+item.content+`
                                </p>
                                </div></div></div>`);

                            } else {
                                el_container = $('<div>').addClass('container-2').addClass('col-12 row ').html(`<div class="col-11 row notify-list d-flex"><div class="icon_notify"><div class="border-icon"><i class="fa fa-bell"></i></div></div>
                                <div class="content_notify"><div class="name-ticket">
                                <span class="type-notify">`+item.title+`</span> <br>
                                <span class="left">`+moment.unix(item.created_at).local().format("DD/MM/YYYY HH:mm")+`</span>
                                </div>
                                <div class="info-ticket">
                                <p>
                                `+item.content+`
                                </p>
                                </div></div></div>`);
                            }
                            

                        // <img src="static/images/icons8-google-alerts-50.png" alt=""></img>
                            $content.append(el_container);
                            // edf2fa
                            if (item.read_at == null || item.read_at == undefined || item.created_at == "") {
                                el_container.find('.notify-list, .news_collection a').css("background-color", "#edf2fa");
                            }
                            el_container.unbind('click').bind('click',{obj:item, el: el_container},function(e){
                                var itemData = e.data.obj;
                                var el_container = e.data.el;
                                if (itemData.read_at == null || itemData.read_at == undefined || itemData.created_at == "") {
                                    self.change_status_read_notify(itemData.id, el_container);
                                }
                                self.$el.find("#myModalDetail .modal-title").html(itemData.title);
                                self.$el.find("#myModalDetail .modal-body").html(itemData.content);
                                if (!!itemData.iteminfo.url){
                                    var el_p = $('<p>').addClass("content").html(`<a id="btn_close" class="btn btn-secondary text-center" data-dismiss="modal" href="javascript:;">Đóng</a>
                                    <a id="btn_detail" class="btn btn-primary  text-center "  href="javascript:;">Xem chi tiết</a>`);
                                    self.$el.find("#myModalDetail .modal-footer").empty();
                                    self.$el.find("#myModalDetail .modal-footer").append(el_p);

                                    var navigate_url = itemData.iteminfo.url.split("#")[1];
                                    el_p.find("#btn_detail").attr("href", "#" + navigate_url);
                                    if (itemData.type == "call_video") {
                                        el_p.find("#btn_detail").attr("target", "_blank");
                                    }
                                    el_p.find("#btn_detail").unbind('click').bind('click',{obj:itemData},function(ex){
                                        var href = self.$el.find("#btn_detail").attr("href");
                                        
                                        if (href == undefined || href == null || href == "") {
                                            var subitem = ex.data.obj;
                                            self.$el.find("#myModalDetail").modal('hide');
                                            if (subitem.iteminfo.url.indexOf(self.getApp().serviceURL)>=0){
                                                if (subitem.iteminfo.url.indexOf("#")>=0){
                                                    var navigate_url = subitem.iteminfo.url.split("#")[1];
                                                    
                                                    gonrinApp().getRouter().navigate(navigate_url);
                                                }else{
                                                    window.open(subitem.iteminfo.url,"_self");
                                                }
                                            }else{
                                                window.open(subitem.iteminfo.url,"_self");
                                            }
                                            self.close();
                                        } else {
                                            self.$el.find("#myModalDetail").modal('hide');
                                            // self.close();
                                        }
                                    });
                                    // el_p.find("#btn_close").unbind("click").bind("click", function () {
                                    //     self.$el.find("#myModalDetail").modal('hide');
                                    // });
                                }

                                self.$el.find("#myModalDetail").modal('show');
                            });

                        }
                    }

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
                },
                complete: function() {
                    self.getApp().hideloading();
                    return false;
                }
            });
        },
        change_status_read_notify: function (id, el_container) {
            var self = this;
            var url_server = self.getApp().serviceURL + '/api/v1/notify/read';
            $.ajax({
                url: url_server,
                type: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                data: JSON.stringify({'id': id}),
                dataType: 'json',
                success: function(data) {
                    var numberNotify = $(".notify .badge").text();
                    if (Number(numberNotify) > 1) {
                        $(".notify .badge").text(Number(numberNotify) - 1);
                    } else {
                        $(".notify .badge").addClass("d-none");
                    }
                    el_container.find('.notify-list, .news_collection a').css("background-color", "#fff");
                },
                error: function () {

                }
            });
        }

    });

});