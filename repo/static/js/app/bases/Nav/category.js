define(function(require) {
    "use strict";
    return [{
            "text": "Tin tức",
            "icon": "fa fa-newspaper-o",
            "type": "category",
            "isloaded": true,
            "entries": [{
                    "text": "Quản lý chuyên mục",
                    //	"icon":"/static/images/icons/task_120.png",
                    "type": "view",
                    "collectionName": "category",
                    "route": "categoryadmin/collection",
                    "$ref": "app/view/CategoryPost/CategoryAdminCollectionView",
                    "visible": function() {
                        return (this.userHasRole("admin"));
                    },
                },
                {
                    //	"icon":"/static/images/icons/task_120.png",
                    "type": "view",
                    "collectionName": "category",
                    "route": "categoryadmin/model(/:id)",
                    "$ref": "app/view/CategoryPost/CategoryAdminModelView",
                    "visible": false,
                },
                {
                    "text": "Quản lý Bài viết",
                    //	"icon":"/static/images/icons/task_120.png",
                    "type": "view",
                    "collectionName": "post",
                    "route": "postadmin/collection",
                    "$ref": "app/view/CategoryPost/PostAdminCollectionView",
                    "visible": function() {
                        return (this.userHasRole("editor") || this.userHasRole("admin") || this.userHasRole("manager"));
                    },
                },
                {
                    //	"icon":"/static/images/icons/task_120.png",
                    "type": "view",
                    "collectionName": "post",
                    "route": "postadmin/model(/:id)",
                    "$ref": "app/view/CategoryPost/PostAdminModelView",
                    "visible": false,
                },
                {
                    "type": "view",
                    "collectionName": "post",
                    "route": "post/model(/:id)",
                    "$ref": "app/view/CategoryPost/PostView",
                    "visible": false,
                },
            ],
        }

    ];

});