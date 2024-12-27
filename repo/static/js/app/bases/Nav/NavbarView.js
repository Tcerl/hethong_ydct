define(function(require) {
    "use strict";
    var Gonrin = require('gonrin');

    var template = `<ul class="navbar-nav"></ul>`;
    var template_menudoc = `<ul id="side-menu"></ul>`;
    var navdata = require('app/bases/Nav/nav');
    // var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || $(window).width() <= 767;
    return Gonrin.View.extend({
        checkUser: function() {
            return (!!gonrinApp().currentUser && !!gonrinApp().currentUser.vaitro) && gonrinApp().currentUser.vaitro.indexOf('thongtin_canhan') >= 0;
        },
        userHasRole: function(role) {
            return (!!gonrinApp().currentUser && !!gonrinApp().currentUser.vaitro) && gonrinApp().currentUser.vaitro.indexOf(role) >= 0;
        },
        check_tuyendonvi: function() {
            if (!!gonrinApp().currentUser && !!gonrinApp().currentUser.donvi && gonrinApp().currentUser.donvi.tuyendonvi_id !== null){
                return gonrinApp().currentUser.donvi.tuyendonvi_id;
            }
            else {
                return false;
            }
        },
        check_loai_donvi : function(){
            if(!!gonrinApp().currentUser && !!gonrinApp().currentUser.donvi && gonrinApp().currentUser.donvi.loai_donvi !== null){
                return gonrinApp().currentUser.donvi.loai_donvi;
            }
            else {
                return false;
            }
        },
        check_donvi_chilam_baocao : function(){
            if(!!gonrinApp().currentUser && !!gonrinApp().currentUser.donvi && gonrinApp().currentUser.donvi.tuyendonvi_id !== null && (gonrinApp().currentUser.donvi.tuyendonvi_id =="1" || gonrinApp().currentUser.donvi.tuyendonvi_id == "2" || gonrinApp().currentUser.donvi.tuyendonvi_id == "3" || gonrinApp().currentUser.donvi.tuyendonvi_id == "6")){
                return true;
            }
            else {
                return false;
            }
        },
        loadEntries: function($el, entries, is_root) {
            var self = this;
            if (entries && (entries.length > 0)) {
                _.each(entries, function(entry, index) {
                    var entry_type = _.result(entry, 'type');
                    var entry_collectionName = _.result(entry, 'collectionName');
                    var entry_ref = _.result(entry, '$ref');
                    var entry_text = _.result(entry, 'text');
                    var entry_icon = _.result(entry, 'icon'),
                        entry_icon_svg = _.result(entry, "icon_svg");
                    var entry_entries = _.result(entry, 'entries');
                    var entry_route = _.result(entry, 'route');
                    var entry_viewData = _.result(entry, 'viewData');
                    var visible = false;
                    if (self.isEntryVisible(entry)) {
                        visible = true;
                    }
                    var _html = '';
                    var class_parent = "class_parent_" + String(index)

                    if (entry_type === "category" && entry_text !== undefined && visible !== undefined && visible !== false) {
                        var text_icon = '';
                        if (!!entry_icon) {
                            text_icon ='<i class="' + entry_icon + ' mr-1" aria-hidden="true"></i>';
                        } else if (!!entry_icon_svg) {
                            text_icon = '<img class="icon-svg-menu" src="' + entry_icon_svg + '" alt=" ">'
                        }
                        _html = _html + ` <li class="nav-item dropdown ` + class_parent + `">
                            <a class="nav-link dropdown-toggle arrow-none" href="#" role="button" id="topnav-apps" role="button"
                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">` + text_icon + entry_text + ` <div class="arrow-down"></div>
                        </a>`;
                        var html_entries = '';

                        if (!!entry_entries && entry_entries instanceof Array && entry_entries.length > 0) {
                            html_entries = '<div class="dropdown-menu" aria-labelledby="topnav-apps" >';
                            entry_entries.forEach( (value, index) => {
                                var visible_entry_children = false;
                                if (self.isEntryVisible(value)) {
                                    visible_entry_children = true;
                                }
                                if (visible_entry_children == true && value.type == "view"  && value !== undefined) {
                                    var html_href = `href="javascript:;"`;
                                    if (!!value.route && value.route !== null && value.route !== undefined && value.route !== "") {
                                        html_href = `href="#` + value.route + `"`;
                                    }
                                    var text_icon = "";
                                    if (!!value['icon']) {
                                        text_icon = `<i class="` + value['icon'] + ` mr-1"></i> `;
                                    } else if (!!value['icon_svg']) {
                                        text_icon = '<img class="icon-svg-menu" src="' + value['icon_svg'] + '" alt=" ">'
                                    }
                                    html_entries = html_entries + `<a ` + html_href + ` class="dropdown-item" class-parent="` + class_parent +`">` + text_icon + `</i> ` + value['text'] + `</a>`;
                                } else if (visible_entry_children == true && value.type == "category"  && value !== undefined) {
                                    var html_entries1 = self.loadChildEntries(value, class_parent);
                                    html_entries = html_entries +  html_entries1;
                                }
                            });
                            html_entries = html_entries + `</div>`;
                        }
                        _html = _html + html_entries + `</li>`;
                    }
                    if (entry_type === "view" && entry_text !== undefined && visible !== undefined && visible !== false) {
                        var html_href = `href="javascript:;"`;
                        if (!!entry_route && entry_route !== null && entry_route !== undefined && entry_route !== "") {
                            html_href = `href="#` + entry_route + `"`;
                        }
                        _html = _html + `<li class="nav-item ` + class_parent + `"><a class="nav-link  arrow-none" ` + html_href + ` role="button" class-parent="` + class_parent +`">`;
                        if (entry_icon) {
                            _html = _html + '<i class="' + entry_icon + ' mr-1"></i>';
                        } else if (entry_icon_svg) {
                            _html = _html + '<img class="icon-svg-menu" src="' + entry_icon_svg + '" alt=" ">'
                        }
                        _html = _html + ' ' + entry_text;
                        _html = _html + '</a>';
                    }
                    $el.append(_html);
                    
                });
                $el.append(`<div class="dropdown float-right icon-switch-menu">
                    <a href="#" class="dropdown-toggle arrow-none card-drop" data-toggle="dropdown" aria-expanded="false">
                        <i class="mdi mdi-dots-vertical"></i>
                    </a>
                    <div class="dropdown-menu dropdown-menu-right">
                        <a href="javascript:void(0);" class="dropdown-item switch-menu-doc">Chuyển sang menu dọc</a>
                    </div>
                </div>`);
                self.$el.find('.switch-menu-doc').unbind("click").bind("click", function () {
                    var currentUser = gonrinApp().currentUser;
                    if (currentUser) {
                        self.getApp().renderTplMenuDoc(currentUser, true);
                    }
                });
                self.$el.find(".navbar-nav li.nav-item a").unbind("click").bind("click", function () {
                    var class_selected = $(this).attr("class-parent");
                    if (!!class_selected) {
                        self.$el.find(".navbar-nav li.nav-item ").removeClass("active-menu");
                        self.$el.find("." + class_selected).addClass("active-menu");
                    }
                }); 
            };
            return this;
        },
        isEntryVisible: function(entry) {
            var self = this;
            var visible = "visible";
            return !entry.hasOwnProperty(visible) || (entry.hasOwnProperty(visible) && (_.isFunction(entry[visible]) ? entry[visible].call(self) : (entry[visible] === true)));

        },
        loadChildEntries: function (obj, class_parent) {
            var self = this;
            var entry_text = _.result(obj, 'text');
            var entry_icon_svg = _.result(obj, 'icon_svg');
            var entry_icon = _.result(obj, 'icon');
            var entry_entries = _.result(obj, 'entries');
            if (entry_text == undefined || entry_text == null || entry_text == "") {
                return '';
            }
            var text_icon = '<i class="mr-1"></i>';
            if (!!entry_icon) {
                text_icon ='<i class="' + entry_icon + ' align-middle mr-1" aria-hidden="true"></i>';
            }  else if (!!entry_icon_svg) {
                text_icon = '<img class="icon-svg-menu" src="' + entry_icon_svg + '" alt=" ">';
            }
            var _html =`<div class="dropdown">
            <a class="dropdown-item dropdown-toggle arrow-none" href="#" id="topnav-ecommerce" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                ` + text_icon + entry_text + ` <div class="arrow-down"></div>
            </a>`;

            var html_entries = '';
            if (!!entry_entries && entry_entries instanceof Array && entry_entries.length > 0) {
                html_entries = '<div class="dropdown-menu" aria-labelledby="topnav-ecommerce">';
                entry_entries.forEach( (value, index) => {
                    var visible_entry_children = false;
                    if (self.isEntryVisible(value)) {
                        visible_entry_children = true;
                    }
                    if (visible_entry_children == true && value.type == "view"  && value !== undefined) {
                        var html_href = `href="javascript:;"`;
                        if (!!value.route && value.route !== null && value.route !== undefined && value.route !== "") {
                            html_href = `href="#` + value.route + `"`;
                        }
                        var text_icon = "";
                        if (!!value['icon']) {
                            text_icon = `<i class="` + value['icon'] + ` mr-1"></i> `;
                        } else if (!!value['icon_svg']) {
                            text_icon = '<img class="icon-svg-menu" src="' + value['icon_svg'] + '" alt=" ">'
                        }
                        html_entries = html_entries + `<a ` + html_href + ` class="dropdown-item" class-parent="` + class_parent +`">` + text_icon + value['text'] + `</a>`;
                    }
                });
                html_entries = html_entries + `</div>`;
            }
            _html = _html + html_entries + '</div>'
            return _html;
        },
        render: function(entries) {
            this.$el.empty();
            entries = entries || navdata;
            var self = this;
            this.$el.empty();
            var viewData = self.viewData;
            if (!!viewData && !!viewData.menu && viewData.menu == "doc") {
                this.$el.html(template_menudoc);
                var nav_list = this.$el.find('ul#side-menu');
                this.loadEntriesMenuDoc(nav_list, entries, true);
            } else {
                this.$el.html(template);
                var nav_list = this.$el.find('ul.navbar-nav');
                this.loadEntries(nav_list, entries, true);
            }
            return this;
        },
        loadEntriesMenuDoc: function($el, entries, is_root) {
            var self = this;
            var stt_id = 0;// dùng để set id cho menu khog trung nhau
            if (entries && (entries.length > 0)) {
                _.each(entries, function(entry, index) {
                    var entry_type = _.result(entry, 'type');
                    var entry_collectionName = _.result(entry, 'collectionName');
                    var entry_ref = _.result(entry, '$ref');
                    var entry_text = _.result(entry, 'text');
                    var entry_icon = _.result(entry, 'icon'),
                        entry_icon_svg = _.result(entry, "icon_svg");
                    var entry_entries = _.result(entry, 'entries');
                    var entry_route = _.result(entry, 'route');
                    var entry_viewData = _.result(entry, 'viewData');
                    var visible = false;
                    if (self.isEntryVisible(entry)) {
                        visible = true;
                    }
                    console.log("=====", entry_icon_svg)
                    var _html = '';
                    if (entry_type === "category" && entry_text !== undefined && visible !== undefined && visible !== false) {
                        // var text_icon = '';
                        // if (!!entry_icon) {
                        //     text_icon ='<i class="' + entry_icon + ' mr-1" aria-hidden="true"></i>';
                        // }
                        // console.log('abc==1111');
                        _html = _html + `<li class="menu-title">` + entry_text + `</li>`;
                        var html_entries = '';
                        if (!!entry_entries && entry_entries instanceof Array && entry_entries.length > 0) {
                            entry_entries.forEach( (value, index) => {
                                var visible_entry_children = false;
                                if (self.isEntryVisible(value)) {
                                    visible_entry_children = true;
                                }
                                if (visible_entry_children == true && value.type == "view"  && value !== undefined) {
                                    var html_href = `href="javascript:;"`;
                                    if (!!value.route && value.route !== null && value.route !== undefined && value.route !== "") {
                                        html_href = `href="#` + value.route + `"`;
                                    }
                                    var text_icon = ""
                                    if (value['icon']) {
                                        text_icon = '<i class="' + value['icon'] + ' mr-1"></i>';
                                    } else if (value['icon_svg']) {
                                        text_icon = '<img class="icon-svg-menu" src="' + value['icon_svg'] + '" alt=" ">'
                                    }
                                    html_entries = html_entries + `<li>
                                        <a ` + html_href + ` title="` + value['text'] + `">
                                            `+ text_icon +`
                                            <span> ` +  value['text'] + ` </span>
                                        </a>
                                    </li>`;
                                } else if (visible_entry_children == true && value.type == "category"  && value !== undefined) {
                                    var html_entries1 = self.loadChildEntriesMenuDoc(value, stt_id);
                                    html_entries = html_entries +  html_entries1;
                                    stt_id = stt_id + 1;
                                }
                            });
                        }
                        _html = _html + html_entries;
                    } else if (entry_type === "view" && entry_text !== undefined && visible !== undefined && visible !== false) {
                        var html_href = `href="javascript:;"`;
                        if (!!entry_route && entry_route !== null && entry_route !== undefined && entry_route !== "") {
                            html_href = `href="#` + entry_route + `"`;
                        }
                        var text_icon = "";
                        if (entry_icon) {
                            text_icon = '<i class="' + entry_icon + ' mr-1"></i>';
                        } else if (entry_icon_svg) {
                            text_icon = '<img class="icon-svg-menu" src="' + entry_icon_svg + '" alt=" ">'
                        }
                        _html = _html + `<li>
                            <a ` + html_href + `>
                                ` + text_icon + `
                                <span> ` + entry_text + ` </span>
                            </a>
                        </li>`;
                    }
                    $el.append(_html);
                });
                $el.append(`<li>
                    <a href="javascript:;" title="Chuyển menu ngang" class="switch-menu-ngang">
                        <i class="fa fa-redo-alt"></i>
                        <span> Chuyển menu ngang </span>
                    </a>
                </li>`);
                self.$el.find('.switch-menu-ngang').unbind("click").bind("click", function () {
                    var currentUser = gonrinApp().currentUser;
                    if (currentUser) {
                        self.getApp().renderHomePage(currentUser, true);
                    }
                });
            };
            return this;
        },
        loadChildEntriesMenuDoc: function (obj, stt_id = 0) {
            var self = this;
            var entry_text = _.result(obj, 'text');
            var entry_icon = _.result(obj, 'icon'),
                entry_icon_svg = _.result(obj, "icon_svg");
            var entry_entries = _.result(obj, 'entries');
            if (entry_text == undefined || entry_text == null || entry_text == "") {
                return '';
            }
            // var text_icon = '<i></i>';
            // if (!!entry_icon) {
            //     text_icon =`<i class="` +  entry_icon + `"></i>`;
            // }
            var text_icon = "";
            if (entry_icon) {
                text_icon = '<i class="' + entry_icon + ' mr-1"></i>';
            } else if (entry_icon_svg) {
                text_icon = '<img class="icon-svg-menu" src="' + entry_icon_svg + '" alt=" ">'
            }
            var _html =`<li>
            <a href="#sidebarEmail` + stt_id + `" data-toggle="collapse">
                ` + text_icon + `
                <span> ` + entry_text + ` </span>
                <span class="menu-arrow"></span>
            </a>`;
                    // <li>
                    // <a href="#sidebarEmail" data-toggle="collapse">
                    //     <i class="mdi mdi-email-outline"></i>
                    //     <span> Email </span>
                    //     <span class="menu-arrow"></span>
                    // </a>
                    //     <div class="collapse" id="sidebarEmail">
                    //         <ul class="nav-second-level">
                    //             <li>
                    //                 <a href="email-inbox.html">Inbox</a>
                    //             </li>
                    //             <li>
                    //                 <a href="email-read.html">Read Email</a>
                    //             </li>
                    //             <li>
                    //                 <a href="email-templates.html">Email Templates</a>
                    //             </li>
                    //         </ul>
                    //     </div>
                    // </li>
            var html_entries = '';
            if (!!entry_entries && entry_entries instanceof Array && entry_entries.length > 0) {
                html_entries = `<div class="collapse" id="sidebarEmail` + stt_id + `">
                <ul class="nav-second-level">`;
                entry_entries.forEach( (value, index) => {
                    var visible_entry_children = false;
                    if (self.isEntryVisible(value)) {
                        visible_entry_children = true;
                    }
                    if (visible_entry_children == true && value.type == "view"  && value !== undefined) {
                        var html_href = `href="javascript:;"`;
                        if (!!value.route && value.route !== null && value.route !== undefined && value.route !== "") {
                            html_href = `href="#` + value.route + `"`;
                        }
                        html_entries = html_entries + `<li>
                            <a ` + html_href + `">` + value['text'] + `</a>
                        </li>`;
                    }
                });
                html_entries = html_entries + `</div></ul>`;
            }
            _html = _html + html_entries + '</li>'
            return _html;
        },
    });

});