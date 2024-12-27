const { data } = require('jquery');

define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/giaychungnhanco/tpl/chonkho.html');

    return Gonrin.ModelDialogView.extend({
        template: template,
        modelSchema: {
            ma_kho: {
                type: "string"
            },
            ten_kho: {
                type: "string"
            },
            kho: {
                type: "string"
            },
            id: {
                type: "string"
            }
        },
        urlPrefix: "/api/v1/",
        collectionName: "giaychungnhanco",
        tools: [{
            name: "defaultgr",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [
                {
                    name: "save",
                    type: "button",
                    buttonClass: "btn-success width-sm ml-2",
                    label: `<i class="far fa-save"></i> Tiếp tục`,
                    command: function () {
                        var self = this;
                        let ma_kho = self.model.get("ma_kho");
                        if (!ma_kho){
                            self.getApp().notify({message: "Vui lòng chọn kho"}, {type:'danger', delay : 1000});
                            return false;
                        }
                        self.trigger("saveData", {data: ma_kho});
                        self.close();
                    }
                },
            ],
        }],
        uiControl: {
            fields: [
            ]
        },
        render: function() {
            var self = this;
            self.getApp().showloading();
            self.selectizeKho();
            self.applyBindings();
            setTimeout(()=>{
                $(`.bootbox-close-button`).remove();
                self.getApp().hideloading();
            }, 1000);
        },
        selectizeKho: function () {
			var self = this;
			var currentUser = self.getApp().currentUser;
			var donvi_id = "";
			if (!!currentUser && !!currentUser.donvi) {
				donvi_id = currentUser.donvi.id;
			}
			var $selectize0 = self.$el.find('#chonkho').selectize({
				maxItems: 1,
				valueField: 'id',
				labelField: 'ten_kho',
				searchField: ['ten_kho'],
				preload: true,
				load: function (query, callback) {
					var query_filter = {
						"filters": {
							"$and": [{
								"$or": [
									{ "ten_kho": { "$likeI": (query) } },
								]
							},
							{ "donvi_id": { "$eq": donvi_id } },
							{"active": {"$eq": 1}}
							]
						},
						"order_by": [{ "field": "loai_uu_tien", "direction": "asc" }]
					};

					let objs = self.model.get("kho");
					if (!!objs && self.isSetKho === false){
						callback([objs]);
						self.isSetKho = true;
					}

					var url = (self.getApp().serviceURL || "") + '/api/v1/danhmuc_kho?page=1&results_per_page=20' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
					$.ajax({
						url: url,
						type: 'GET',
						dataType: 'json',
						error: function () {
							callback();
						},
						success: function (res) {
							callback(res.objects);
							var id = self.model.get("id");
							if (!id) {
								var khoChinh = res.objects.filter((value, index) => {
									return value.kho_mac_dinh === true;
								})
								if (khoChinh.length === 0) {
									if (res.objects.length > 0) {
										let tmp = res.objects[0];
										$selectize0[0].selectize.setValue([tmp.id]);
									}
								}
								else {
									let tmp = khoChinh[0];
									$selectize0[0].selectize.setValue([tmp.id]);
								}
							}
							else {
								var khoId = self.model.get('ma_kho');
								if (!!khoId && self.isSetIdKho === false) {
									$selectize0[0].selectize.setValue(khoId);
									self.isSetIdKho = true;
								}
								$selectize0[0].selectize.disable();
							}
						}
					});
				},
				onChange: function (value) {
					var obj = $selectize0[0].selectize.options[value];
					if (obj !== null && obj !== undefined) {
						let id = self.model.get("id");
						if (!id || self.setKho == true) {
							self.model.set({
								"ma_kho": value,
								"ten_kho": obj.ten_kho,
								"kho": obj
							})
						}
						else {
							self.setKho = true;
						}
					} else {
						self.model.set({
							"ma_kho": null,
							"ten_kho": null,
							"kho": null
						})
					}
				}
			});
		},
    });

});