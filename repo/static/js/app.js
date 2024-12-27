define('jquery', [], function() {
    return jQuery;
});

require.config({
    baseUrl: static_url + '/js/lib',
    waitSeconds: 200,
    paths: {
        app: '../app',
        tpl: '../tpl',
        vendor: '../../vendor',
        schema: '../schemas',
    },
    /*map: {
        '*': {
            'app/models/nhanvien': 'app/models/memory/nhanvien'
        }
    },*/
    shim: {
        'gonrin': {
            deps: ['underscore', 'jquery', 'backbone'],
            exports: 'Gonrin'
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        }
    },
    urlArgs: "t=6"
});


require(['gonrin', 'app/router',
        'app/bases/Nav/NavbarView',
        'app/notifications/NotifyView',
        'text!app/bases/tpl/mainlayout.html',
        'text!app/bases/tpl/mainlayout_menudoc.html',
        'i18n!app/nls/app',
        'vendor/store',
        'app/view/quanlyCanbo/DonViYTe/UserDonVi/view/ModelDialogView'
    ],
    function(Gonrin, Router, Nav, NotifyView, layout, mainlayout_menudoc, lang, storejs, UserDonViDialogView) {
        $.ajaxSetup({
            headers: {
                'content-type': 'application/json'
            }
        });

        var app = new Gonrin.Application({
            serviceURL: location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : ''),
            // serviceUpload: "https://uploads.baocaoyte.com",
            serviceUpload: upload_file_url,
            staticURL: location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + '/static/',
            uploadURL: cdn_url,
            router: new Router(),
            lang: lang,
            //layout: layout,
            initialize: function() {
                this.nav = new Nav();
                this.nav.render();
                // this.getRouter().registerAppRoute();
                this.getCurrentUser();
                $(document).on('show.bs.modal', '.modal', function (event) {
                    var zIndex = 1040 + (10 * $('.modal:visible').length);
                    $(this).css('z-index', zIndex);
                    setTimeout(function() {
                        $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
                    }, 0);
                });
                $(document).on('hidden.bs.modal', '.modal', function () {
                    $('.modal:visible').length && $(document.body).addClass('modal-open');
                });
            },
            parseDate: function(val) {
                var result = null;
                if (val === null || val === undefined || val === "" || val === 0) {
                    result = null;
                } else {
                    var date = null;
                    if (val instanceof Date) {
                        result = moment.utc([val.getFullYear(), val.getMonth(), val.getDate()]);
                    } else {
                        if ($.isNumeric(val)) {
                            date = new Date(val * 1000);
                        } else if (typeof val === "string") {
                            date = new Date(val);
                        } else {
                            result = moment.utc();
                        }
                        if (date != null && date instanceof Date) {
                            result = moment.utc([date.getFullYear(), date.getMonth(), date.getDate()]);
                        }
                    }
                    return result;
                }
            },
            parseInputDateString: function(val, utc = true) {
                var result = null;
                if (val === null || val === undefined || val === "" || val === 0) {
                    result = null;
                } 
                else {
                    var date = null;
                    if (val instanceof Date) {
                        if (utc === false) {
                            result = val;
                        } 
                        else {
                            result = moment.utc([val.getFullYear(), val.getMonth(), val.getDate()]);
                        }
                    } 
                    else {
                        if ($.isNumeric(val)) {
                            // console.log("val.isNumeric====",val);
                            var len = val.length;
                            //yyyymmddhhmmss
                            var year = 0,
                                month = 0,
                                day = 0,
                                hour = 0,
                                minute = 0,
                                second = 0,
                                milliseconds = 0;
                            if (len > 14) {
                                milliseconds = val.substr(14, 4);
                            }
                            if (len >= 14) {
                                year = val.substr(0, 4); //substr(start,length)
                                month = val.substr(4, 2);
                                day = val.substr(6, 2);
                                hour = val.substr(8, 2);
                                minute = val.substr(10, 2);
                                second = val.substr(12, 2);
          
                            } 
                            else if (len >= 12) {
                                year = val.substr(0, 4); //substr(start,length)
                                month = val.substr(4, 2);
                                day = val.substr(6, 2);
                                hour = val.substr(8, 2);
                                minute = val.substr(10, 2);
                                // second = val.substr(12,2);
                            } 
                            else if (len >= 10) {
                                year = val.substr(0, 4); //substr(start,length)
                                month = val.substr(4, 2);
                                day = val.substr(6, 2);
                                hour = val.substr(8, 2);
                                //minute = val.substr(10,2);
                                // second = val.substr(12,2);
                            } 
                            else if (len >= 8) {
                                year = val.substr(0, 4); //substr(start,length)
                                month = val.substr(4, 2);
                                day = val.substr(6, 2);
                                // hour = val.substr(8,2);
                                // minute = val.substr(10,2);
                                // second = val.substr(12,2);
                            } 
                            else if (len >= 6) {
                                year = val.substr(0, 4); //substr(start,length)
                                month = val.substr(4, 2);
                                day = 1;
                                // day = val.substr(6,2);
                                // hour = val.substr(8,2);
                                // minute = val.substr(10,2);
                                // second = val.substr(12,2);
                            } 
                            else if (len >= 4) {
                                year = val.substr(0, 4); //substr(start,length)
                                month = 1;
                                day = 1;
                                // hour = val.substr(8,2);
                                // minute = val.substr(10,2);
                                // second = val.substr(12,2);
                            }
                            // date = new Date(val * 1000);
                            result = moment.utc([year, month - 1, day, hour, minute, second]);
                        } 
                        else if (typeof val === "string") {
                            date = new Date(val);
                        } 
                        else {
                            result = moment.utc();
                        }
                        if (date != null && date instanceof Date) {
                            result = moment.utc([date.getFullYear(), date.getMonth(), date.getDate()]);
                        }
                    }
          
                }
                return result;
            },
            parseOutputDateString: function(date, type = "full") {
                // type: full: lấy đến milisecond, YYYYMMDD: lấy ngày tháng năm 
        
                if (date == undefined || date == null || date == "" || (date instanceof Date)) {
                    return null;
                } 
                else {
                    var result = "" + date.year();
                    if (date.month() < 9) {
                        result = result + "0" + (date.month() + 1);
                    } 
                    else {
                        result = result + (date.month() + 1);
                    }
                    if (date.date() <= 9) {
                        result = result + "0" + date.date();
                    } 
                    else {
                        result = result + date.date();
                    }
                    if (type == "YYYYMMDD") {
                        return result;
                    }
                    if (date.hour() <= 9) {
                        result = result + "0" + date.hour();
                    } 
                    else {
                        result = result + date.hour();
                    }
                    if (date.minute() <= 9) {
                        result = result + "0" + date.minute();
                    } 
                    else {
                        result = result + date.minute();
                    }
                    if (date.second() <= 9) {
                        result = result + "0" + date.second();
                    } 
                    else {
                        result = result + date.second();
                    }
                    if (date.millisecond() > 0) {
                        result = result + date.millisecond();
                    }
                    return result;
                }
            },
            getParameterUrl: function(parameter, url) {
                if (!url) url = window.location.href;
                var reg = new RegExp('[?&]' + parameter + '=([^&#]*)', 'i');
                var string = reg.exec(url);
                return string ? string[1] : undefined;
            },
            showloading: function(content = null) {
                $('body .loader').addClass('active');
                if (content) {
                    $('body .loader').find(".loader-content").html(content);
                }
            },
            hideloading: function() {
                //			$("#loading").addClass("d-none");
                $('body .loader').removeClass('active');
                $('body .loader').find(".loader-content").empty();
            },
            getCurrentUser: function() {
                var self = this;
                var token = storejs.get('X-USER-TOKEN');
                $.ajaxSetup({
                    headers: {
                        'X-USER-TOKEN': token
                    }
                });
                self.showloading();
                $.ajax({
                    url: self.serviceURL + '/api/v1/current_user',
                    dataType: "json",
                    success: function(data) {
                        gonrinApp().getRouter().registerAppRoute();
                        self.hideloading();
                        if (data.active === 1 || data.active === '1') {
                            $.ajaxSetup({
                                headers: {
                                    'X-USER-TOKEN': data.token
                                }
                            });
                            storejs.set('X-USER-TOKEN', data.token);
                            gonrinApp().postLogin(data);
                        } else {
                            gonrinApp().notify("Tài khoản của bạn đã bị khóa");
                        }
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        gonrinApp().getRouter().registerAppRoute();
                        self.hideloading();
                        self.router.navigate("login");
                    }
                });
            },
            hasRole: function(role) {
                return (gonrinApp().currentUser != null && gonrinApp().currentUser.vaitro != null) && gonrinApp().currentUser.vaitro.indexOf(role) >= 0;
            },
            updateCurrentUser: function(hoten) {
                var self = this;
                var currUser = self.currentUser;
                if (!!hoten && hoten !== "") {
                    currUser.name = hoten;
                    $("span.username").html(currUser.name);
                }
            },
            postLogin: function(data) {
                var self = this;
                $("body").removeClass("bg-login");
                self.currentUser = new Gonrin.User(data);
                this.renderHomePage(data);
            },
            autoHeightArea: function (element, class_auto) {
                var self = this;
                element.$el.find(class_auto).each(function (indexcao, itemcao) {
                    var chieucao = itemcao.scrollHeight;
                    $(itemcao).keyup(function () {
                        if (itemcao.scrollHeight > chieucao) {
                            chieucao = itemcao.scrollHeight;
                            itemcao.style.height = chieucao + 'px';
                        } else if (itemcao.scrollHeight < chieucao) {
                            if (itemcao.scrollHeight < 60) {
                                itemcao.style.height = 60 + 'px';
                            }
                            else {
                                itemcao.style.height = itemcao.scrollHeight + 'px';
                            }
                        }
                    });
                });
            },
            renderHomePage(data, sw_menu = null) {
                var self = this;
                if (this.hasRole('admin') || self.hasRole('admin_donvi') || self.hasRole('canbo') || self.hasRole('lanhdao')) {
                    $('#contaner-template').html(layout);
                    $('body').attr('data-layout-mode', 'horizontal').attr('data-sidebar-size', 'default');
                    this.$header = $('body').find(".navbar-custom");
                    this.$content = $('body').find(".content-page");
                    this.$navbar = $('body').find("#topnav-menu-content");
                    self.hideloading();

                    this.nav = new Nav({ el: this.$navbar });
                    self.nav.render();
                } else {
                    $.ajax({
                        url: this.serviceURL + '/logout',
                        dataType: "json",
                        success: function(data) {
                            self.router.navigate("login");
                            this.currentUser = null;
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) {
                        },
                    });
                }

                let xacNhanPhieu = storejs.get("xacNhanPhieu");
                if (!!xacNhanPhieu){
                    let id_phieuxuat = xacNhanPhieu.id_phieuxuat;
                    let ma_donvi_ban = xacNhanPhieu.ma_donvi_ban;
                    let ma_donvi_mua = xacNhanPhieu.ma_donvi_mua;
                    let donvi_id = data.donvi_id;
                    if (donvi_id === ma_donvi_ban){
                        gonrinApp().getRouter().navigate(`phieuxuatkho/model?id=${id_phieuxuat}`);
                    }
                    else if (donvi_id === ma_donvi_mua){
                        gonrinApp().getRouter().navigate(`xem_phieuxuat/model?id=${id_phieuxuat}`);
                    }
                    storejs.remove('xacNhanPhieu');
                }
                else {
                    var currentRoute = self.getRouter().currentRoute().fragment;
                    if (sw_menu == true) {
                        gonrinApp().getRouter().refresh();
                    }  
                    else if (self.hasRole('admin') === true) {
                        if (currentRoute.indexOf('login') >= 0 || currentRoute === "" || currentRoute === null) {
                            self.router.navigate('admin/donvi/collection');
                        }
                    } 
                    else if (self.hasRole('admin_donvi') || self.hasRole('canbo')) {
                        if (currentRoute.indexOf('login') >= 0 || currentRoute === "" || currentRoute === null) {
                            self.router.navigate('canbo/DonViYTe/chitiet');
                        }
                    }
                }

                //click icon fullscreeen
                $('[data-toggle="fullscreen"]').on("click", function (e) {
                    e.preventDefault();
                    $('body').toggleClass('fullscreen-enable');
                    if (!document.fullscreenElement && /* alternative standard method */ !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
                        if (document.documentElement.requestFullscreen) {
                            document.documentElement.requestFullscreen();
                        } else if (document.documentElement.mozRequestFullScreen) {
                            document.documentElement.mozRequestFullScreen();
                        } else if (document.documentElement.webkitRequestFullscreen) {
                            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                        }
                    } else {
                        if (document.cancelFullScreen) {
                            document.cancelFullScreen();
                        } else if (document.mozCancelFullScreen) {
                            document.mozCancelFullScreen();
                        } else if (document.webkitCancelFullScreen) {
                            document.webkitCancelFullScreen();
                        }
                    }
                });
                document.addEventListener('fullscreenchange', exitHandler );
                document.addEventListener("webkitfullscreenchange", exitHandler);
                document.addEventListener("mozfullscreenchange", exitHandler);
                function exitHandler() {
                    if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
                        // console.log('pressed');
                        $('body').removeClass('fullscreen-enable');
                    }
                }
                var currentUser = self.currentUser;
                $('.pro-user-name .user-name').text(currentUser.hoten);
                $(".info_myself").unbind('click').bind('click', function () {
                    var model_dialog = new UserDonViDialogView({"viewData": {"donvi": currentUser.donvi, "data": currentUser, "create_new": false}});
                    model_dialog.dialog({size:"large"});
                    model_dialog.on("saveUser", function(data) {
                        $('.pro-user-name .user-name').text(data.hoten);
                    });
                });

                $('.info_donvi').unbind('click').bind('click', ()=>{
                    gonrinApp().getRouter().navigate('canbo/DonViYTe/chitiet');
                });

                $('.huongdansudung').unbind("click").bind("click", (event) =>{
                    gonrinApp().getRouter().navigate('huongdansudung');
                })
                return;
            },
            renderTplMenuDoc(data, sw_menu = true) {
                var self = this;
                if (this.hasRole('admin') || self.hasRole('admin_donvi') || self.hasRole('canbo')) {
                    $('#contaner-template').empty();
                    $('#contaner-template').html(mainlayout_menudoc);
                    $('body').removeAttr('data-layout-mode').removeAttr('data-layout');
                    // console.log("menu doc 1", mainlayout_menudoc);
                    this.$header = $('body').find(".navbar-custom");
                    this.$content = $('body').find(".content-page");
                    this.$navbar = $('body').find("#sidebar-menu");

                    this.nav = new Nav({ el: this.$navbar , viewData: {"menu": "doc"}});
                    self.nav.render();

                    
                } else {
                    $.ajax({
                        url: this.serviceURL + '/logout',
                        dataType: "json",
                        success: function(data) {
                            self.router.navigate("login");
                            this.currentUser = null;
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) {
                        },
                    });
                }
                $('.button-menu-mobile').on('click', function (event) {
                    event.preventDefault();
                    var sidebarSize = $('body').attr('data-sidebar-size');
                    if ($(window).width() >= 993) {
                        if (sidebarSize === 'condensed') {
                            $('body').attr('data-sidebar-size', 'default');
                            // this.changeSize(defaultSidebarSize === 'condensed'? 'default': defaultSidebarSize);
                        } else {
                            $('body').attr('data-sidebar-size', 'condensed');
                            // this.changeSize('condensed');
                        }
                    } else {
                        this.changeSize(defaultSidebarSize);
                        this.body.toggleClass('sidebar-enable');
                    }
                });
                // return;
                var currentRoute = self.getRouter().currentRoute().fragment;
                if (sw_menu == true) {
                    gonrinApp().getRouter().refresh();
                } 
                else if(this.hasRole('admin') === true) {
                    if (currentRoute.indexOf('login') >= 0 || currentRoute === "" || currentRoute === null) {
                        self.router.navigate('admin/donvi/collection');
                    }
                } 
                else if (self.hasRole('admin_donvi') || self.hasRole('canbo')) {
                    if (currentRoute.indexOf('login') >= 0 || currentRoute === "" || currentRoute === null){
                        self.router.navigate('canbo/DonViYTe/chitiet');
                    }
                }

                //click icon fullscreeen
                $('[data-toggle="fullscreen"]').on("click", function (e) {
                    e.preventDefault();
                    $('body').toggleClass('fullscreen-enable');
                    if (!document.fullscreenElement && /* alternative standard method */ !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
                        if (document.documentElement.requestFullscreen) {
                            document.documentElement.requestFullscreen();
                        } else if (document.documentElement.mozRequestFullScreen) {
                            document.documentElement.mozRequestFullScreen();
                        } else if (document.documentElement.webkitRequestFullscreen) {
                            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                        }
                    } else {
                        if (document.cancelFullScreen) {
                            document.cancelFullScreen();
                        } else if (document.mozCancelFullScreen) {
                            document.mozCancelFullScreen();
                        } else if (document.webkitCancelFullScreen) {
                            document.webkitCancelFullScreen();
                        }
                    }
                });
                document.addEventListener('fullscreenchange', exitHandler );
                document.addEventListener("webkitfullscreenchange", exitHandler);
                document.addEventListener("mozfullscreenchange", exitHandler);
                function exitHandler() {
                    if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
                        // console.log('pressed');
                        $('body').removeClass('fullscreen-enable');
                    }
                }
                var current_user = self.currentUser;
                $('.pro-user-name .user-name').text(current_user.hoten);
                $(".info_myself").unbind('click').bind('click', function () {
                    var model_dialog = new UserDonViDialogView({"viewData": {"donvi": currentUser.donvi, "data": currentUser, "create_new": false}});
                    model_dialog.dialog({size:"large"});
                    model_dialog.on("saveUser", function(data) {
                        $('.pro-user-name .user-name').text(data.hoten);
                    });
                });
                $('.info_donvi').unbind('click').bind('click', ()=>{
                    gonrinApp().getRouter().navigate('canbo/DonViYTe/chitiet');
                })
                $('.huongdansudung').unbind("click").bind("click", (event) => {
                    gonrinApp().getRouter().navigate('huongdansudung');
                })
                return;
            },
            openPhotoSwipe: function(index, galleryElement, class_file, disableAnimation, fromURL) {
                // var self = this;
                var pswpElement = document.querySelectorAll('.pswp')[0];
                var items = gonrinApp().parseThumbnailElements(galleryElement, class_file);
                var options = { index: index };
                // Pass data to PhotoSwipe and initialize it
                var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
                gallery.init();
            },
            parseThumbnailElements : function(el, class_file = "list-image") {
                var thumbElements = el.find("." + class_file);
                var items = [];
                for(var i = 0; i < thumbElements.length; i++) {
                    // create slide object
                    var item = {
                        src: thumbElements[i].getAttribute('src'),
                        w: parseInt(thumbElements[i].naturalWidth, 10),
                        h: parseInt(thumbElements[i].naturalHeight, 10)
                    };
                    item.el = thumbElements[i]; // save link to element for getThumbBoundsFn
                    items.push(item);
                }
                return items;
            },
            /**
             * Format datetime
             */
            datetimeFormat: function(datetime, formatString, align=null) {
                var format = (formatString != null) ? formatString : "DD-MM-YYYY HH:mm:ss";
    //			console.log(moment(datetime, ["MM-DD-YYYY", "YYYY-MM-DD"]).format(format),"======");
                if (align == null) {
                    return moment(datetime, ["MM-DD-YYYY", "YYYY-MM-DD"]).isValid() ? moment(datetime, ["MM-DD-YYYY", "YYYY-MM-DD"]).format(format) : "";
                }
                return moment(datetime).isValid() ? `<div style="text-align: ${align}">${moment(datetime).format(format)}</div>` : "";
                
            },
            timestampFormat: function(utcTime, format = "YYYY-MM-DD HH:mm:ss") {
                return moment(utcTime).local().format(format);
            },
            formatDatetimeString: function (str, format){
                if (!str){
                    return '';
                } else {
                    var len = str.length;
                    if (len == 8){
                        var year, month, day, hour, minute, second = "";
                        year = str.substr(0, 4), month = str.substr(4, 2), day = str.substr(6, 2);
                        return day + "/" + month + "/" + year;
                    } else if(len == 12){
                        var year, month, day, hour, minute, second = "";
                        year = str.substr(0, 4), month = str.substr(4, 2), day = str.substr(6, 2);
                        hour = str.substr(8, 2), minute = str.substr(10, 2);
                        return day + "/" + month + "/" + year + " " + hour + ":" + minute;
                    } else if(len == 14){
                        var year, month, day, hour, minute, second = "";
                        year = str.substr(0, 4), month = str.substr(4, 2), day = str.substr(6, 2);
                        hour = str.substr(8, 2), minute = str.substr(10, 2), second = str.substr(12, 2);
                        return day + "/" + month + "/" + year + " " + hour + ":" + minute + ":" + second;
                    } else {
                        return str;
                    }
                }
                
            },
            set_text_header: function(text) {
                var self = this;
                // $('.title_header_layout_web').text(text);
            },
            change_avatar: function(url_image) {
                var self = this;
                if (self.hasRole("nguoidan")) {
                    if (url_image == "default") {
                        $(".user-avatar").attr({ "src": "static/images/default_image.png" });
                    } else {
                        var url = self.check_image(url_image);
                        $(".user-avatar").attr({ "src": url });
                    }
                }
            },
            scanQRCode: function() {
                gonrinApp().notify("Chức năng quét mã QRCode chỉ hỗ trợ trên phiên bản cài đặt ứng dụng mobile");
            },
            initNotify: function() {
                var self = this;
                // Your web app's Firebase configuration

                const messaging = firebase.messaging();
                messaging.usePublicVapidKey("BBIWZ46a-CxH1ExEEg-Tm-OPsmYbXnJFbGvzNahztRSo82-k");
                messaging.getToken().then((currentToken) => {
                    if (currentToken) {
                        gonrinApp().set_token_firebase_to_server(currentToken);
                    } else {
                        // Show permission request.
                        console.log('No Instance ID token available. Request permission to generate one.');
                        // Show permission UI.

                        gonrinApp().check_permission_notify();


                    }
                }).catch((err) => {
                    console.log('An error occurred while retrieving token. ', err);
                });
                messaging.onMessage(function(notification) {
                    console.log('Message received. ', notification);
                    // [START_EXCLUDE]
                    // Update the UI to include the received message.
                    console.log(notification);
                    var notifyView = new NotifyView({ viewData: notification });
                    notifyView.dialog();
                    setTimeout(() => {
                        notifyView.close();
                        // notifyView.$el.find("#myModalNotify").modal("hide");
                    }, 5000);
                    // [END_EXCLUDE]
                });
            },
            check_permission_notify: function() {
                if (!('Notification' in window)) {
                    console.log("This browser does not support notifications.");
                } else {
                    if (Notification.permission === 'denied' || Notification.permission === 'default') {
                        try {
                            Notification.requestPermission(function(permission) {
                                if (permission === 'granted') {
                                    console.log('Notification permission granted.');
                                } else {
                                    console.log('Unable to get permission to notify.');
                                }
                            });
                        } catch (error) {
                            Notification.requestPermission().then((permission) => {
                                if (permission === 'granted') {
                                    console.log('Notification permission granted.');
                                } else {
                                    console.log('Unable to get permission to notify.');
                                }
                            });
                        }
                    }
                }
            },
            set_token_firebase_to_server: function(currentToken) {
                if (currentToken) {
                    // var params = JSON.stringify({
                    //     "type_notify": "web",
                    //     "data": currentToken
                    // });
                    $.ajax({
                        url: gonrinApp().serviceURL + '/api/v1/set_notify_token',
                        dataType: "json",
                        type: "POST",
                        data: JSON.stringify({ "type_notify": "web", "data": currentToken }),
                        headers: {
                            'content-type': 'application/json'
                        },
                        success: function(data) {
                            console.log("set token firebase success!!!");
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) {
                            console.log("set notify firebase failed");
                        }
                    });


                } else {
                    console.log('No Instance ID token available. Request permission to generate one.');
                }
            },
            validateEmail: function(email) {
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(String(email).toLowerCase());
            },
            validatePhone: function(inputPhone) {
                if (inputPhone == null || inputPhone == undefined) {
                    return false;
                }
                var phoneno = /(09|08|07|05|03|02)+[0-9]{8}/g;
                const result = inputPhone.match(phoneno);
                if (result && result == inputPhone) {
                    return true;
                } else {
                    return false;
                }
            },
            checkNotificationPromise: function() {
                try {
                    Notification.requestPermission().then();
                } catch (e) {
                    return false;
                }
                return true;
            },
            delete_token_firebase: function() {
                var currentToken = storejs.get('TOKEN-FIREBASE');
                if (!!currentToken) {
                    try {
                        const messaging = firebase.messaging();
                        messaging.getToken().then((currentToken) => {
                            messaging.deleteToken(currentToken).then(() => {
                                console.log('Token deleted.');
                            }).catch((err) => {
                                console.log('Unable to delete token. ', err);
                            });
                        }).catch((err) => {
                            console.log('Error retrieving Instance ID token. ', err);
                        });
                    } catch (error) {

                    }

                }

            },
            render_notify: function(data) {
                var self = this;
                var html_menu = $(".noti-scroll").html("");
                if (data.length === 0) {
                    html_menu.append(`<a class="dropdown-item notify-item active" href="javascript:;">
	                      <div class="notification__icon-wrapper notify-icon bg-soft-primary text-primary">
	                        <div class="notification__icon">
	                          <i class="fas fa-bell"></i>
	                        </div>
	                      </div>
	                      <div class="notification__content">
	                        <span class="notification__category">Không có thông báo mới</span>
	                      </div>
	                    </a>`);
                } else {
                    for (var i = 0; i < data.length; i++) {
                        if (i <= 1) {
                            var url = data[i].url;
                            if (url !== null && url !== "" && url.split('#').length > 0) {
                                url = url.split('#')[1];
                            }
                            var class_unread = "";
                            if (data.read_at === null || data.read_at <= 0) {
                                class_unread = "unread";
                            }
                            html_menu.append(`<a class="dropdown-item notify-item active ` + class_unread + `" href="javascript:;" onClick="gonrinApp().getRouter().navigate(\'` + url + `\',{trigger: true});">
			                      <div class="notification__icon-wrapper notify-icon bg-soft-primary text-primary">
			                        <div class="notification__icon">
			                          <i class="fas fa-bell"></i>
			                        </div>
			                      </div>
			                      <div class="notification__content">
			                        <span class="notification__category font-weight-bold">` + (data[i].title || "") + `</span>
			                        <p class="mb-0">` + (data[i].content || "") + `</p>
                                    <span class="text-primary time"><i class="far fa-clock"></i> ${gonrinApp().timestampFormat(data[i].created_at*1000, "DD/MM/YYYY HH:mm")}</span>
			                      </div>
			                    </a>`);
                        }
                    }

                }
                $(".noti-scroll").attr({ "style": "max-height:400px" });
            },
            get_list_notify: function() {
                var self = this;
                //data: {"q": JSON.stringify({"filters": filters, "order_by":[{"field": "thoigian", "direction": "desc"}], "limit":1})},
                $.ajax({
                    url: self.serviceURL + '/api/v1/notify/read',
                    dataType: "json",
                    type: "POST",
                    //       		    data: {"q": JSON.stringify({"order_by":[{"field": "updated_at", "direction": "desc"}], "limit":100})},
                    headers: {
                        'content-type': 'application/json'
                    },
                    success: function(data) {
                        $(".notifications .badge").addClass("d-none").html("");
                        self.render_notify(data.objects);

                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        console.log("get_list_notify failed", XMLHttpRequest);
                    }
                });
            },
            check_notify: function() {
                var self = this;
                $.ajax({
                    url: self.serviceURL + '/api/v1/notify/check',
                    dataType: "json",
                    type: "GET",
                    headers: {
                        'content-type': 'application/json'
                    },
                    success: function(data) {
                        if (data !== null && data.data > 0) {
                            $(".notifications .badge").removeClass("d-none").html(data.data);
                        } else {
                            $(".notifications .badge").addClass("d-none");
                        }
                        if ($(".modal-body").data('bs.modal') && $(".modal-body").data('bs.modal').isShown){
                        }else{
                            // var notify = data.notify;
                            // return;
                            // if (!!notify){
                            //     var notifyView = new NotifyView({ viewData: notify });
                            //     notifyView.dialog();
                            // }
                        }
                        
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {}
                });
            },
            responsive_table: function() {
                // inspired by http://jsfiddle.net/arunpjohny/564Lxosz/1/

                if ($(window).width() < 768) {
                    $('.table-mobile').find("th").each(function(i) {
                        var el = $('.table td:nth-child(' + (i + 1) + ')');
                        if ($(this).text() === " " || $(this).text() === "") {
                            el.prepend('<span class="table-thead"></span> ');
                        } else {
                            el.prepend('<span class="table-thead">' + $(this).text() + ':</span> ');
                        }

                        $('.table-thead').hide();
                    });
                    $('.table-mobile').each(function() {
                        var thCount = $(this).find("th").length;
                        var rowGrow = 100 / thCount + '%';
                        $(this).find("th, td").css('flex-basis', rowGrow);
                        $(this).find("tr").addClass("shadow-sm p-2 mb-1 bg-white rounded");
                    });

                    function flexTable() {
                        $(".table-mobile").each(function(i) {
                            $(this).find('.table-thead').show();
                            $(this).find('thead').hide();
                        });
                    }
                    flexTable();
                }
            },
            check_image: function(image) {
                if(!image){
                    return "";
                } else if (typeof image === "string"){
                    var url_image = "";
                    if (image.includes("static.somevabe.com")){
                        url_image = image;
                    }
                    else {
                        for (var i = 0; i < 3;i++) {
                            image = image.replace("\"","");
                        }
                        image = image.replace("\"","");
                        var url_image = static_url + image;
                        return url_image;
                    }
                    return url_image;
                }else{
                    var url_image = image.link;
                    if (!url_image){
                        return "";
                    }
                    if (url_image.startsWith("https://somevabe.com/")){
                        url_image = url_image;
                    }else {
                        url_image = static_url + url_image ;
                    }
                    return url_image;
                }
            },
            check_file_minio: function(image) {
                if (!image) {
                    return "";
                } 
                else if (typeof image === "string") {
                    var url_image = "";
                    if (image.includes("https://") || image.includes("http://")) {
                        url_image = image;
                    } 
                    else {
                        for (var i = 0; i < 3; i++) {
                            image = image.replace("\"", "");
                        }
                        image = image.replace("\"", "");
                        if (gonrinApp().project_name == "TINTUC_SO_BMTE") {
                            url_image = gonrinApp().domain_view_file_url + image;
                        }
                        else {
                            url_image = "/static" + image;
                        }
                    }
                    return url_image;
                } 
                else {
                    var url_image = image.link;
                    if (!url_image) {
                        return "";
                    }
                    if (url_image.startsWith("https://") || url_image.startsWith("http://")) {
                        url_image = url_image;
                    } 
                    else {
                        if (gonrinApp().project_name == "TINTUC_SO_BMTE") {
                            url_image = gonrinApp().domain_view_file_url + url_image;
                        }
                        else {
                            url_image = "/static" + url_image;
                        }
                    }
                    return url_image;
                }
            },
            toInt: function(x) {
                return parseInt(x) ? parseInt(x) : 0;
            },
            convert_khongdau: function(strdata) {
                var kituA = ["á", "à", "ạ", "ã", "ả", "â", "ấ", "ầ", "ậ", "ẫ", "ă", "ằ", "ắ", "ẳ"],
                    kituE = ["é", "è", "ẹ", "ẻ", "ẽ", "ê", "ế", "ề", "ệ", "ễ", "ể", "ệ"],
                    kituI = ["í", "ì", "ị", "ỉ", "ĩ"],
                    kituO = ["ò", "ó", "ọ", "ỏ", "õ", "ô", "ồ", "ố", "ộ", "ổ", "ỗ", "ơ", "ờ", "ớ", "ợ", "ở", "ỡ"],
                    kituU = ["ù", "ú", "ụ", "ủ", "ũ", "ư", "ừ", "ứ", "ự", "ử", "ữ"],
                    kituY = ["ỳ", "ý", "ỵ", "ỷ", "ỹ"];

                var str2 = strdata.toLowerCase();
                for (var i = 0; i < kituA.length; i++) {
                    str2 = str2.replace(kituA[i], "a");
                }
                for (var i = 0; i < kituE.length; i++) {
                    str2 = str2.replace(kituE[i], "e");
                }
                for (var i = 0; i < kituI.length; i++) {
                    str2 = str2.replace(kituI[i], "i");
                }
                for (var i = 0; i < kituO.length; i++) {
                    str2 = str2.replace(kituO[i], "o");
                }
                for (var i = 0; i < kituU.length; i++) {
                    str2 = str2.replace(kituU[i], "u");
                }
                for (var i = 0; i < kituY.length; i++) {
                    str2 = str2.replace(kituY[i], "y");
                }
                str2 = str2.replace("đ", "d");
                // if(upper === true){
                // 	return str2.toUpperCase();
                // }
                return str2;
            },
            convert_string_to_number: function (string) {
                var number = 0;
                if (Number.isNaN(Number(string))) {
                    number = 0
                } else {
                    number = Number(string);
                }
                return number;
            },
            convert_diachi: function (diachi = "", tinhthanh = null, quanhuyen = null, xaphuong = null ) {
                var self = this;
                var address = '';
                if (!!xaphuong && xaphuong !== null){
                    if(address!==""){
                        address = address +", "+ xaphuong.ten;
                    }else{
                        address = address + xaphuong.ten;
                    }
                    
                }
                if (!!quanhuyen  && quanhuyen !== null){
                    if(address !== ""){
                        address = address +", ";
                    }
                    address = address + quanhuyen.ten;
                }
                if (!!tinhthanh && tinhthanh !== null){
                    if(address!==""){
                        address = address +", ";
                    }
                    address = address + tinhthanh.ten;
                }
                return address;
            },
            capitalizeFirstLetter: function(string) {
                console.log("string.charAt(0).toUpperCase()", string.charAt(0).toUpperCase())
                return string.charAt().toUpperCase() + string.slice(1);
            },
            getTuyenDonVi: function() {
                if (!!gonrinApp().currentUser && !!gonrinApp().currentUser.donvi) {
                  return gonrinApp().currentUser.donvi.tuyendonvi_id;
                }
                return null;
            },
            selectizeTinhThanhQuanHuyenXaPhuong: function(self, disable_tinhthanh=false, disable_quanhuyen=false, disable_xaphuong=false, tinhthanh_selector='#selectize-tinhthanh', quanhuyen_selector='#selectize-quanhuyen', xaphuong_selector='#selectize-xaphuong', tinhthanh_id='tinhthanh_id', quanhuyen_id="quanhuyen_id", xaphuong_id="xaphuong_id", tinhthanh_object="tinhthanh", quanhuyen_object="quanhuyen", xaphuong_object="xaphuong") {
                var set_tinhthanh = false,
                    set_quanhuyen = false,
                    set_xaphuong = false;
                function controlSelectize() {
                    if(self.model.get(tinhthanh_id)){
                        self.$el.find(quanhuyen_selector)[0].selectize.enable();
                    }else{
                        self.$el.find(quanhuyen_selector)[0].selectize.disable();
                    }
    
                    if(self.model.get(quanhuyen_id)){
                        self.$el.find(xaphuong_selector)[0].selectize.enable();
                    }else{
                        self.$el.find(xaphuong_selector)[0].selectize.disable();
                    }

                    if (disable_tinhthanh) {
                        self.$el.find(tinhthanh_selector)[0].selectize.disable();
                    }
                    if (disable_quanhuyen) {
                        self.$el.find(quanhuyen_selector)[0].selectize.disable();
                    }
                    if (disable_xaphuong) {
                        self.$el.find(xaphuong_selector)[0].selectize.disable();
                    }
                };
                function loadTinhThanh(query = '', callback) {
                    if (set_tinhthanh == false && !!self.model.get(tinhthanh_id)) {
                        callback([self.model.get(tinhthanh_object)]);
                        self.$el.find(tinhthanh_selector)[0].selectize.setValue(self.model.get(tinhthanh_id));
                        var objects = self.$el.find(tinhthanh_selector)[0].selectize.options[self.model.get(tinhthanh_id)];
                        if (!!objects) delete objects.$order;
                        set_tinhthanh = true;
                    }
                    var arr_filters = [
                        {'deleted': {'$eq': false}},
                    ];
                    if(!!query){
                        arr_filters.push({ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } });                             
                    }
                    var query_filter = {
                        "filters": {
                            "$and": arr_filters
                        },
                        "order_by": [{ "field": "ten", "direction": "asc" }]
                    };
                    var url =
                        (self.getApp().serviceURL || "") + "/api/v1/tinhthanh?results_per_page=100" + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: "GET",
                        dataType: "json",
                        success: function(response) {
                            callback(response.objects);
                        },
                        error: function() {
                            callback();
                        },
                    });
                };
                function loadQuanHuyen(query='', callback) {
                    if (set_quanhuyen == false && !!self.model.get(quanhuyen_id)) {
                        callback([self.model.get(quanhuyen_object)]);
                        self.$el.find(quanhuyen_selector)[0].selectize.setValue(self.model.get(quanhuyen_id));
                        var objects = self.$el.find(quanhuyen_selector)[0].selectize.options[self.model.get(quanhuyen_id)];
                        if (!!objects) delete objects.$order;
                        set_quanhuyen = true;
                    }
                    var arr_filters = [
                        {'deleted': {'$eq': false}},
                    ];
                    if (!!self.model.get(tinhthanh_id)) {
                        arr_filters.push({ "tinhthanh_id": { "$eq": self.model.get(tinhthanh_id) } });
                    }
                    
                    if(!!query){
                        arr_filters.push({ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } });
                    }
                    
                    var query_filter = {
                            "filters": {
                                "$and": arr_filters
                            },
                            "order_by": [{ "field": "ten", "direction": "asc" }]
                        };
    
                    var url =
                        (self.getApp().serviceURL || "") + "/api/v1/quanhuyen?results_per_page=50" + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: "GET",
                        dataType: "json",
                        success: function(response) {
                            callback(response.objects);
                        },
                        error: function() {
                            callback();
                        },
                    });
                };
                function loadXaPhuong(query='', callback) {
                    if (set_xaphuong == false && !!self.model.get(xaphuong_id)) {
                        callback([self.model.get(xaphuong_object)]);
                        self.$el.find(xaphuong_selector)[0].selectize.setValue(self.model.get(xaphuong_id));
                        var objects = self.$el.find(xaphuong_selector)[0].selectize.options[self.model.get(xaphuong_id)];
                        if (!!objects) delete objects.$order;
                        set_xaphuong = true;
                    }
                    var arr_filters = [
                        {'deleted': {'$eq': false}},
                    ];
                    if (!!self.model.get(quanhuyen_id)) {
                        arr_filters.push({ "quanhuyen_id": { "$eq": self.model.get(quanhuyen_id) } });
                    }
                    
                    if(!!query){
                        arr_filters.push({ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } });
                    }
                    
                    var query_filter = {
                            "filters": {
                                "$and": arr_filters
                            },
                            "order_by": [{ "field": "ten", "direction": "asc" }]
                        };
                    var url =
                        (self.getApp().serviceURL || "") + "/api/v1/xaphuong?results_per_page=50" + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: "GET",
                        dataType: "json",
                        success: function(response) {
                            callback(response.objects);
                        },
                        error: function() {
                            callback();
                        },
                    });
                };
                function selectizeTinhThanh() {
                    var $select = self.$el.find(tinhthanh_selector).selectize({
                        maxItems: 1,
                        valueField: "id",
                        labelField: "ten",
                        searchField: ["ten", "tenkhongdau"],
                        preload: true,
                        placeholder: 'Chọn tỉnh thành',
                        load: function(query, callback) {
                            loadTinhThanh(query, callback);
                        },
    
                        onItemAdd: function(value, $item) {
                            var obj = $select[0].selectize.options[value];
                            delete obj.$order;
                            var obj_tinhthanh = {
                                "id": obj.id,
                                "ten": obj.ten
                            }
                            self.model.set({
                                [tinhthanh_object]: obj_tinhthanh,
                                [tinhthanh_id]: value
                            });
                            self.$el.find(quanhuyen_selector)[0].selectize.clear();
                            self.$el.find(xaphuong_selector)[0].selectize.clear();
                            self.$el.find(quanhuyen_selector)[0].selectize.clearOptions();
                            self.$el.find(xaphuong_selector)[0].selectize.clearOptions();
                            if (!!self.model.get(quanhuyen_object) && self.model.get(quanhuyen_object)['tinhthanh_id'] != value) {
                                self.model.set({
                                    [quanhuyen_id]: null,
                                    [quanhuyen_object]: null,
                                    [xaphuong_id]: null,
                                    [xaphuong_object]: null
                                })
    
                            }
                            if ((!!self.model.get(quanhuyen_object) && self.model.get(quanhuyen_object)['tinhthanh_id'] != value) || !self.model.get(quanhuyen_object) || !self.$el.find(quanhuyen_selector)[0].selectize.getValue()) {
                                self.$el.find(quanhuyen_selector)[0].selectize.load(function(callback) {
                                    loadQuanHuyen('', callback);
                                });
                            }
    
                            controlSelectize();
    
                        },
                        onItemRemove: function() {
                            self.model.set({
                                [tinhthanh_object]: null,
                                [tinhthanh_id]: null,
                                [quanhuyen_object]: null,
                                [quanhuyen_id]: null,
                                [xaphuong_object]: null,
                                [xaphuong_id]: null
                            });
                            self.$el.find(quanhuyen_selector)[0].selectize.clear();
                            self.$el.find(xaphuong_selector)[0].selectize.clear();
                            controlSelectize();
    
                        }
                    });
                };
                function selectizeQuanHuyen() {
                    var $select = self.$el.find(quanhuyen_selector).selectize({
                        maxItems: 1,
                        valueField: "id",
                        labelField: "ten",
                        searchField: ["ten", "tenkhongdau"],
                        preload: true,
                        placeholder: 'Chọn quận huyện',
    
                        load: function(query, callback) {
                        },
    
                        onItemAdd: function(value, $item) {
                            var obj = $select[0].selectize.options[value];
                            var obj_quanhuyen = {
                                "id": obj.id,
                                "ten":obj.ten,
                                "tinhthanh_id": obj.tinhthanh_id
                            }
                            self.model.set({
                                [quanhuyen_object]: obj_quanhuyen,
                                [quanhuyen_id]: value
                            });

                            self.$el.find(xaphuong_selector)[0].selectize.clear();
                            self.$el.find(xaphuong_selector)[0].selectize.clearOptions();
                            
                            if (!!self.model.get(xaphuong_object) && self.model.get(xaphuong_object)['quanhuyen_id'] != value) {
                                self.model.set({
                                    [xaphuong_id]: null,
                                    [xaphuong_object]: null
                                })
                            }
                            if ((!!self.model.get(xaphuong_object) && self.model.get(xaphuong_object).quanhuyen_id != value) || !self.model.get(xaphuong_object) || !self.$el.find(xaphuong_selector)[0].selectize.getValue()) {
                                self.$el.find(xaphuong_selector)[0].selectize.load(function(callback) {
                                    loadXaPhuong('', callback);
                                });
                            }
                            controlSelectize();
    
                        },
                        onItemRemove: function() {
                            self.model.set({
                                [quanhuyen_id]: null,
                                [quanhuyen]: null,
                                [xaphuong_id]: null,
                                [xaphuong_object]: null
                            });

                            self.$el.find(xaphuong_selector)[0].selectize.clear();
                            self.$el.find(xaphuong_selector)[0].selectize.clearOptions();  
    
                            controlSelectize();
    
                        }
                    });
                };
                function selectizeXaPhuong() {
                    var $select = self.$el.find(xaphuong_selector).selectize({
                        maxItems: 1,
                        valueField: "id",
                        labelField: "ten",
                        searchField: ["ten", "tenkhongdau"],
                        preload: true,
                        placeholder: 'Chọn xã phường',
    
                        load: function(query, callback) {
                        },
    
                        onItemAdd: function(value, $item) {
                            var obj = $select[0].selectize.options[value];
                            var obj_xaphuong ={
                                "id": obj.id,
                                "ten": obj.ten,
                                "quanhuyen_id": obj.quanhuyen_id
                            }
                            self.model.set({
                                [xaphuong_object]: obj_xaphuong,
                                [xaphuong_id]: value,
                            });
                        },
                        onItemRemove: function() {
                            self.model.set({
                                [xaphuong_object]: null,
                                [xaphuong_id]: null
                            });
                            controlSelectize();
                        }
                    });
                };
                selectizeTinhThanh();
                selectizeQuanHuyen();
                selectizeXaPhuong();
                controlSelectize();
            },
            exportExcelCategory: function (self, type) {
                self.getApp().showloading();
                var params = {
                    "type_export": type
                }
                console.log("params===", params);
                $.ajax({
                    url: (self.getApp().serviceURL || "") + '/api_export/v1/export_category',
                    dataType: "json",
                    contentType: "application/json",
                    method: 'POST',
                    data: JSON.stringify(params),
                    success: function(response) {
                        self.getApp().hideloading();
                        window.open(response, "_blank");
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
        });
        app.isMobile = false;
        app.registerScrollToolbar = function(view) {
            if (!!app.isMobile) {
                Backbone.off("window:scroll").on("window:scroll", function(evt) {
                    var toolwrap = view.$el.find(".toolbar-wraper");
                    if (evt.direction === "up") {
                        if ($(window).scrollTop() > 30) {
                            toolwrap.addClass("autofix fix");
                        } else {
                            toolwrap.removeClass("autofix fix");
                        }
                    } else if (evt.direction === "down") {
                        toolwrap.removeClass("autofix fix");
                    }
                });
            }

        };
        
    });
