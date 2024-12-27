define(function (require) {
  "use strict";
  var $ = require("jquery"),
    _ = require("underscore"),
    Gonrin = require("gonrin");

  var template = require("text!app/view/quanlyCanbo/DonViYTe/tpl/model.html"),
    schema = require("json!schema/DonViSchema.json");
  var tuyendonvi = require("json!app/constant/tuyendonvi.json");

  var DialogAppInfo = require("app/appkey/ModelDialog");

  return Gonrin.ModelView.extend({
    template: template,
    modelSchema: schema,
    urlPrefix: "/api/v1/",
    collectionName: "donvi",
    tools: [
      {
        name: "back",
        type: "button",
        buttonClass: "btn-secondary width-sm",
        label: `<i class="fas fa-arrow-circle-left"></i> Quay lại`,
        command: function () {
          Backbone.history.history.back();
        },
      },
      {
        name: "save",
        type: "button",
        buttonClass: "btn-success width-sm button_save ml-2",
        label: `<i class="far fa-save"></i> Lưu`,
        visible: function () {
          return (
            this.getApp().hasRole("admin_donvi") === true ||
            this.getApp().hasRole("admin") === true
          );
        },
        command: function () {
          var self = this;
          var ten_coso = self.model.get("ten_coso");
          var tuyendonvi_id = self.model.get("tuyendonvi_id");
          var email = self.model.get("email");
          if (!!email) {
            self.model.set("email", email.toLowerCase());
          }

          if (!ten_coso || ten_coso == null || ten_coso == "") {
            self
              .getApp()
              .notify(
                "Tên đơn vị không được để trống.Vui lòng nhập tên đơn vị!"
              );
            return false;
          }
          if (tuyendonvi_id == null || tuyendonvi_id == undefined) {
            self
              .getApp()
              .notify(
                { message: "Chưa chọn tuyến đơn vị!" },
                { type: "danger" }
              );
            return;
          }
          if (self.validate_level() == false) {
            return false;
          }
          self.model.set({
            ten_coso: ten_coso.toUpperCase(),
          });
          var chophep_ketnoi = self.model.get("chophep_ketnoi");
          if (chophep_ketnoi == true) {
            var appinfo_name = self.$el.find("#appinfo-name").val(),
              appinfo_password = self.$el.find("#appinfo-password").val(),
              appinfo_description = self.$el.find("#appinfo-description").val(),
              appinfo = self.model.get("appinfo");

            if (!appinfo_name) {
              self
                .getApp()
                .notify(
                  { message: "Nhập tên tài khoản kết nối" },
                  { type: "danger" }
                );
              return;
            } else if (appinfo == null && !appinfo_password) {
              self
                .getApp()
                .notify(
                  { message: "Nhập mật khẩu tài khoản kết nối" },
                  { type: "danger" }
                );
              return;
            }
            var appinfo = {
              name: appinfo_name,
              password: appinfo_password,
              description: appinfo_description,
            };
            self.model.set("appinfo", appinfo);
          }
          self.getApp().showloading();
          self.model.save(null, {
            success: function (model, respose, options) {
              self.getApp().hideloading();
              self.getApp().notify("Lưu dữ liệu thành công.");
              let id = self.model.get("id");
              if (!!id) {
                gonrinApp()
                  .getRouter()
                  .navigate("canbo/DonViYTe/chitiet?id=" + id);
              } else {
                gonrinApp().getRouter().navigate("canbo/DonViYTe/chitiet");
              }
            },
            error: function (xhr, status, error) {
              self.getApp().hideloading();
              try {
                if (
                  $.parseJSON(error.xhr.responseText).error_code ===
                  "SESSION_EXPIRED"
                ) {
                  self
                    .getApp()
                    .notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                } else {
                  self
                    .getApp()
                    .notify(
                      {
                        message: $.parseJSON(error.xhr.responseText)
                          .error_message,
                      },
                      { type: "danger", delay: 1000 }
                    );
                }
              } catch (err) {
                self
                  .getApp()
                  .notify(
                    { message: "Lưu không thành công. Vui lòng thử lại sau!" },
                    { type: "danger", delay: 1000 }
                  );
              }
            },
          });
        },
      },
    ],
    uiControl: {
      fields: [
        {
          field: "chophep_ketnoi",
          uicontrol: "checkbox",
          textField: "text",
          valueField: "value",
          checkedField: "name",
          cssClassField: "cssClass",
          text: "<b>Cho phép kết nối đến nền tảng YDCT</b>",
          dataSource: [
            { name: true, value: true, text: "Có" },
            { name: false, value: false, text: "Không" },
          ],
          value: 0,
        },
      ],
    },
    render: function () {
      var self = this;
      var donvi_id = this.getApp().getRouter().getParam("id");
      var currentUser = self.getApp().currentUser;
      if (currentUser === undefined || currentUser === null) {
        self
          .getApp()
          .notify(
            { message: "Hết phiên làm việc, vui lòng đăng nhập lại!" },
            { type: "danger", delay: 1000 }
          );
        self.getApp().getRouter().navigate("login");
        return false;
      }
      if (!donvi_id) {
        donvi_id = currentUser.donvi_id;
      }
      var tuyendonvi_id = gonrinApp().getTuyenDonVi();
      var donvi = currentUser.donvi;
      if (donvi_id) {
        var url = self.getApp().serviceURL + "/api/v1/donvi/" + donvi_id;
        $.ajax({
          url: url,
          method: "GET",
          contentType: "application/json",
          success: function (data) {
            self.model.set(data);
            self.applyBindings();
            var danhsach_tuyendonvi_id = [];
            if (gonrinApp().hasRole("admin")) {
              gonrinApp().selectizeTinhThanhQuanHuyenXaPhuong(self);
              if (self.model.get("tuyendonvi_id") == "1") {
                self.comboboxTuyendonvi(["1"]);
                self.$el.find(".parent_donvi").addClass("d-none");
              } else {
                self.comboboxTuyendonvi(["2", "3"]);
                self.$el.find(".parent_donvi").removeClass("d-none");
                self.selectize_donvicaptren();
              }
              self.eventChange();
              self.model.on("change:tinhthanh_id", function () {
                if (self.model.get("tuyendonvi_id") == "3") {
                  self.selectize_donvicaptren();
                }
              });
              self.button_duyet();
            } else {
              if (donvi_id == currentUser.donvi_id) {
                if (tuyendonvi_id == "1") {
                  self.$el.find(".parent_donvi").addClass("d-none");
                  gonrinApp().selectizeTinhThanhQuanHuyenXaPhuong(self);
                } else {
                  self.$el
                    .find("#selectize-donvi-captren")
                    .val(self.model.get("captren_name"))
                    .attr("disabled", true);
                  gonrinApp().selectizeTinhThanhQuanHuyenXaPhuong(self, true);
                }
                self.comboboxTuyendonvi([self.model.get("tuyendonvi_id")]);
              } else if (tuyendonvi_id == "1") {
                self.selectize_donvicaptren();
                danhsach_tuyendonvi_id = ["2", "3"];
                self.comboboxTuyendonvi(danhsach_tuyendonvi_id);
                gonrinApp().selectizeTinhThanhQuanHuyenXaPhuong(self);
                self.model.on("change:tinhthanh_id", function () {
                  if (self.model.get("tuyendonvi_id") == "3") {
                    self.selectize_donvicaptren();
                  }
                });
                self.eventChange();
                self.button_duyet();
              } else if (tuyendonvi_id == "2") {
                danhsach_tuyendonvi_id = ["3"];
                self.comboboxTuyendonvi(danhsach_tuyendonvi_id);
                gonrinApp().selectizeTinhThanhQuanHuyenXaPhuong(self, true);
                self.$el
                  .find("#selectize-donvi-captren")
                  .val(donvi.ten_coso)
                  .addClass("disable-click");
                self.eventChange();
                self.button_duyet();
              }
            }
          },
          error: function (xhr, status, error) {
            try {
              if (
                $.parseJSON(error.xhr.responseText).error_code ===
                "SESSION_EXPIRED"
              ) {
                self
                  .getApp()
                  .notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                self.getApp().getRouter().navigate("login");
              } else {
                self
                  .getApp()
                  .notify(
                    {
                      message: $.parseJSON(error.xhr.responseText)
                        .error_message,
                    },
                    { type: "danger", delay: 1000 }
                  );
              }
            } catch (err) {
              self
                .getApp()
                .notify(
                  { message: "Lỗi không lấy được dữ liệu" },
                  { type: "danger", delay: 1000 }
                );
            }
          },
        });
      } else {
        self.applyBindings();
        self.getApp().notify("Lỗi truy cập dữ liệu. Vui lòng thử lại sau");
        if (gonrinApp().hasRole("admin")) {
          self.getApp().getRouter().navigate("admin/donvi/collection");
        } else {
          self.getApp().getRouter().navigate("canbo/donvi/collection");
        }
      }
    },
    eventChange: function () {
      var self = this;
      self.model.on("change:tuyendonvi_id", function () {
        self.selectize_donvicaptren();
      });
      self.$el
        .find(".btn-copy")
        .unbind("click")
        .bind("click", function () {
          var $temp = $("<input>");
          $("body").append($temp);
          $temp.val(self.$el.find("#appkey").val()).select();
          document.execCommand("copy");
          $temp.remove();
        });

      var tuyendonvi_id = self.model.get("tuyendonvi_id");
      if (tuyendonvi_id == "3") {
        var chophep_ketnoi = self.model.get("chophep_ketnoi");
        if (chophep_ketnoi == true) {
          self.$el.find(".el-appinfo").removeClass("d-none");
          var appinfo = self.model.get("appinfo");
          self.$el.find("#appinfo-name").val(!!appinfo ? appinfo.name : ""),
            self.$el
              .find("#appinfo-password")
              .val(!!appinfo ? appinfo.password : ""),
            self.$el
              .find("#appinfo-description")
              .val(!!appinfo ? appinfo.description : "");
          self.$el.find("#appkey").val(!!appinfo ? appinfo.appkey : "");
        } else {
          self.$el.find(".el-appinfo").addClass("d-none");
        }

        self.model.on("change:chophep_ketnoi", function () {
          var chophep_ketnoi = self.model.get("chophep_ketnoi");
          if (chophep_ketnoi == true) {
            self.$el.find(".el-appinfo").removeClass("d-none");
            var appinfo = self.model.get("appinfo");
            if (!!appinfo) {
              self.$el.find("#appinfo-name").val(!!appinfo ? appinfo.name : ""),
                self.$el
                  .find("#appinfo-password")
                  .val(!!appinfo ? appinfo.password : ""),
                self.$el
                  .find("#appinfo-description")
                  .val(!!appinfo ? appinfo.description : "");
              self.$el.find("#appkey").val(!!appinfo ? appinfo.appkey : "");
            }
          } else {
            self.$el.find(".el-appinfo").addClass("d-none");
          }
        });
        self.$el
          .find(".btn-connect-appinfo")
          .unbind("click")
          .bind("click", function () {
            var chophep_ketnoi = self.model.get("chophep_ketnoi");
            if (chophep_ketnoi == false) {
              return false;
            }
            var dialogView = new DialogAppInfo({
              viewData: { donvi: self.model.toJSON() },
            });
            dialogView.dialog();
          });
      } else {
        self.$el.find(".el-appinfo").remove();
        self.$el.find(".chophep_ketnoi").remove();
      }
    },
    comboboxTuyendonvi: function (danhsach_tuyendonvi_id) {
      var self = this;
      var tuyendonvi_filter = tuyendonvi.filter(function (item) {
        if (danhsach_tuyendonvi_id.includes(item.value)) {
          return item;
        }
      });
      if (tuyendonvi_filter.length == 1) {
        self.$el
          .find("#selectize-tuyendonvi")
          .val(tuyendonvi_filter[0].text)
          .attr("disabled", true);
        return;
      }
      try {
        self.$el.find(`#selectize-tuyendonvi`).data("gonrin").destroy();
      } catch (e) {}
      self.$el.find(`#selectize-tuyendonvi`).combobox({
        uicontrol: "combobox",
        textField: "text",
        valueField: "value",
        cssClass: "form-control",
        dataSource: tuyendonvi_filter,
        value: self.model.get("tuyendonvi_id"),
      });
      self.$el.find(`#selectize-tuyendonvi`).on("change.gonrin", function () {
        var tuyendonvi_id = self.$el
          .find(`#selectize-tuyendonvi`)
          .data("gonrin")
          .getValue();
        self.model.set("tuyendonvi_id", tuyendonvi_id);
      });
    },
    selectize_donvicaptren: function () {
      var self = this;
      var seted = false;
      var $selectz = self.$el.find("#selectize-donvi-captren")[0];
      if ($selectz.selectize !== undefined && $selectz.selectize !== null) {
        $selectz.selectize.enable();
        $selectz.selectize.clear();
        $selectz.selectize.clearOptions();
        self.model.set({
          captren_id: null,
          captren_name: null,
        });
        $selectz.selectize.destroy();
      }
      var $selectize = self.$el.find("#selectize-donvi-captren").selectize({
        maxItems: 1,
        valueField: "id",
        labelField: "ten_coso",
        searchField: ["ten_coso", "tenkhongdau"],
        preload: true,
        load: function (query, callback) {
          var filter_condition = {
            $and: [
              { deleted: { $eq: false } },
              { id: { $neq: self.model.get("id") } },
            ],
          };
          var tuyendonvi_id = self.model.get("tuyendonvi_id"),
            tinhthanh_id = self.model.get("tinhthanh_id");

          tinhthanh_id = !!tinhthanh_id ? tinhthanh_id : "";

          if (tuyendonvi == "2") {
            filter_condition["$and"].push({ tuyendonvi_id: { $eq: "1" } });
          } else if (tuyendonvi_id == "3") {
            filter_condition["$and"].push({ tuyendonvi_id: { $eq: "2" } });
            filter_condition["$and"].push({
              tinhthanh_id: { $eq: tinhthanh_id },
            });
          }

          if (!!query) {
            filter_condition["$and"].push({
              $or: [
                { ten_coso: { $likeI: query } },
                {
                  tenkhongdau: { $likeI: gonrinApp().convert_khongdau(query) },
                },
              ],
            });
          }
          var query_filter = {
            filters: filter_condition,
            order_by: [{ field: "tuyendonvi_id", direction: "asc" }],
          };

          var url =
            (self.getApp().serviceURL || "") +
            "/api/v1/donvi?results_per_page=15" +
            (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
          $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            error: function () {
              callback();
            },
            success: function (res) {
              callback(res.objects);
              if (seted == false) {
                seted = true;
                if (res.objects.length > 0) {
                  self.$el
                    .find("#selectize-donvi-captren")[0]
                    .selectize.setValue(res.objects[0].id);
                  if (self.model.get("tuyendonvi_id") == "2") {
                    $selectz.selectize.disable();
                  }
                }
              }
            },
          });
        },
        onChange: function (value, isOnInitialize) {
          var $selectz = self.$el.find("#selectize-donvi-captren")[0];
          var obj = $selectz.selectize.options[value];
          if (!!obj && value !== self.model.get("captren_id")) {
            self.model.set({
              captren_name: obj.ten_coso,
              captren_id: obj.id,
            });
          } else if (value == null || value == "") {
            self.model.set({
              captren_name: null,
              captren_id: null,
            });
          }
        },
      });
    },
    validate_level: function () {
      var self = this;
      var tuyendonvi_id = self.model.get("tuyendonvi_id"),
        tinhthanh_id = self.model.get("tinhthanh_id"),
        xaphuong_id = self.model.get("xaphuong_id"),
        quanhuyen_id = self.model.get("quanhuyen_id"),
        captren_id = self.model.get("captren_id");

      if (
        tuyendonvi_id != "1" &&
        (tinhthanh_id == null || tinhthanh_id == undefined)
      ) {
        self
          .getApp()
          .notify(
            { message: "Vui lòng chọn Tỉnh/Thành phố" },
            { type: "danger", delay: 1000 }
          );
        return false;
      }
      // if (tuyendonvi_id != "1" && !captren_id) {
      // 	self.getApp().notify({ message: "Vui lòng chọn đơn vị cấp trên"}, { type: "danger", delay: 1000 });
      // 	return false;
      // }
      return true;
    },
    button_duyet: function () {
      var self = this;
      var donvi_id = this.getApp().getRouter().getParam("id");
      self.$el.find(".button_mo").remove();
      self.$el.find(".button_khoa").remove();
      if (donvi_id) {
        var active = self.model.get("active");
        if (active === false) {
          self.$el
            .find(".toolbar")
            .append(
              '<button type="button" btn-name="Duyet" class="btn btn-primary width-sm button_mo ml-2"><i class="fas fa-key"></i> Mở</button>'
            );
        } else {
          self.$el
            .find(".toolbar")
            .append(
              '<button type="button" btn-name="Khoa" class="btn btn-danger width-sm button_khoa ml-2"><i class="fas fa-user-lock"></i> Khóa</button>'
            );
        }

        self.$el
          .find(".button_mo")
          .unbind("click")
          .bind("click", function () {
            self.changeStatus(true);
          });
        self.$el
          .find(".button_khoa")
          .unbind("click")
          .bind("click", function () {
            self.changeStatus(false);
          });
      }
    },
    changeStatus: function (status) {
      var self = this;
      var data = JSON.stringify({
        id: self.model.get("id"),
        status: status,
      });
      $.ajax({
        url:
          (self.getApp().serviceURL || "") +
          "/api/v1/organization/change_status",
        type: "post",
        data: data,
        dataType: "json",
        success: function (data) {
          self.model.set("active", status);
          if (status == true) {
            gonrinApp().notify("Mở khoá đơn vị thành công.");
          } else {
            gonrinApp().notify("Khoá đơn vị thành công");
          }
          self.button_duyet();
        },
        error: function (xhr, status, error) {
          try {
            if (
              $.parseJSON(xhr.responseText).error_code === "SESSION_EXPIRED"
            ) {
              self
                .getApp()
                .notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
              self.getApp().getRouter().navigate("login");
            } else {
              self
                .getApp()
                .notify(
                  { message: $.parseJSON(xhr.responseText).error_message },
                  { type: "danger", delay: 1000 }
                );
            }
          } catch (err) {
            self
              .getApp()
              .notify(
                { message: "Có lỗi xảy ra, vui lòng thử lại sau" },
                { type: "danger", delay: 1000 }
              );
          }
        },
      });
    },
  });
});
