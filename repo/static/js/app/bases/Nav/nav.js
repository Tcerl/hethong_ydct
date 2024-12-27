define(function(require) {
    "use strict";
    return [
        {
            "text": "Hệ thống",
            "icon": "ri-user-line",
            "type": "category",
            "visible": function() {
                // return true;  && this.check_tuyendonvi() =="2"
                var tuyendonvi_id = gonrinApp().getTuyenDonVi();
                // return (this.userHasRole("admin") || ((this.userHasRole("admin_donvi") || this.userHasRole("canbo")) && ["1", "2", "3"].includes(tuyendonvi_id)));
                return (this.userHasRole("admin") || (this.userHasRole("admin_donvi")) || ["1","2","3"].includes(tuyendonvi_id));
            },
            "entries": [
                {
                    "text": "Báo cáo sử dụng phần mềm",
                    "type": "view",
                    "icon": "fa fa-hospital-user",
                    "collectionName": "donvi",
                    "route": "baocao_sudung_phanmem",
                    "$ref": "app/thongke/BaoCaoSuDungPMView",
                    "visible": function() {
                        return ( (this.check_tuyendonvi() == "10")  &&  (this.userHasRole("admin_donvi") == true || this.userHasRole("lanhdao") == true));
                    }
                },
                {
                    "text": "Quản lý danh sách đơn vị",
                    "type": "view",
                    "icon": "fa fa-hospital-user",
                    "collectionName": "donvi",
                    "route": "admin/donvi/collection",
                    "$ref": "app/view/quanlyCanbo/DonViYTe/CollectionView",
                    "visible": function() {
                        var tuyendonvi_id = gonrinApp().getTuyenDonVi();
                        return (this.userHasRole("admin") || ((this.userHasRole("admin_donvi") || this.userHasRole("canbo")) && ["1", "2"].includes(tuyendonvi_id)));
                    }
                },
                // {
                //     "text": "Quản lý danh sách nhà cung cấp",
                //     "type": "view",
                //     "icon": "fa fa-hospital-user",
                //     "collectionName": "danhmuc_nhacungcap",
                //     "route": "danhmuc_nhacungcap/collection",
                //     "$ref": "app/danhmuc/danhmuc_dungchung/danhmuc_nhacungcap/CollectionView",
                //     "visible": function() {
                //         return (this.userHasRole("admin") || this.check_tuyendonvi() == "1");
                //     }
                // },
                {
                    "text": "Quản lý danh sách DN",
                    "type": "view",
                    "icon": "fa fa-hospital-user",
                    "collectionName": "donvi",
                    "route": "admin/donvi/collection",
                    "$ref": "app/view/quanlyCanbo/DonViYTe/CollectionView",
                    "visible": function() {
                        return ( (this.check_tuyendonvi() == "10")  &&  (this.userHasRole("admin_donvi") == true || this.userHasRole("lanhdao") == true));
                    }
                },
                {
                    "text": "Quản lý danh sách DN đăng ký",
                    "type": "view",
                    "icon": "fa fa-hospital-user",
                    "collectionName": "donvidangki",
                    "route": "donvidangky/collection",
                    "$ref": "app/view/donvidangky/CollectionView",
                    "visible": function() {
                        return ( (this.check_tuyendonvi() == "10")  &&  (this.userHasRole("admin_donvi") == true) );
                    }
                },
                // {
                //     "text": "Danh mục dược liệu",
                //     "type": "view",
                //     "icon":"fas fa-list-alt",
                //     "collectionName": "sanpham",
                //     "route": "sanpham/collection",
                //     "$ref": "app/danhmuc/danhmuc_sanpham/SanPham/CollectionView",
                //     "visible": function() {
                //         return (this.userHasRole("admin"));
                //     }
                // },
                {
                    "text": "Danh mục hành chính",
                    "type": "category",
                    "icon":"fas fa-list-alt",
                    "visible": function() {
                        return (this.userHasRole("admin") || this.check_tuyendonvi() == "1");
                    },
                    "entries": [
                        {
                            "text": "Dân Tộc",
                            "type": "view",
                            "route": "dantoc/collection",
                            "visible": function() {
                                return (this.userHasRole("admin") || this.check_tuyendonvi() == "1");
                            }
                        },
                        {
                            "text": "Quốc Gia",
                            "type": "view",
                            "route": "quocgia/collection",
                            "visible": function() {
                                return (this.userHasRole("admin") || this.check_tuyendonvi() == "1");
                            }
                        },
                        {
                            "text": "Tỉnh Thành",
                            "type": "view",
                            "route": "tinhthanh/collection",
                            "visible": function() {
                                return (this.userHasRole("admin") || this.check_tuyendonvi() == "1");
                            }
                        },
                        {
                            "text": "Quận Huyện",
                            "type": "view",
                            "route": "quanhuyen/collection",
                            "visible": function() {
                                return (this.userHasRole("admin") || this.check_tuyendonvi() == "1");
                            }
                        },
                        {
                            "text": "Xã Phường",
                            "type": "view",
                            "route": "xaphuong/collection",
                            "visible": function() {
                                return (this.userHasRole("admin") || this.check_tuyendonvi() == "1");
                            }
                        },
                        {
                            "text": "Tuyến đơn vị",
                            "type": "view",
                            "route": "tuyendonvi/collection",
                            "visible": function() {
                                return (this.userHasRole("admin") || this.check_tuyendonvi() == "1");
                            }
                        },
                    ]
                },
                {
                    "text": "Danh mục dùng chung",
                    "icon": "ri-book-line",
                    "type": "category",
                    "visible": function() {
                        var tuyendonvi_id = gonrinApp().getTuyenDonVi();
                        return (this.userHasRole("admin") || ((this.userHasRole("admin_donvi") )) || this.check_tuyendonvi() == "1");
                    },
                    "entries": [
                        // {
                        //     "text": "Nhà sản xuất",
                        //     "type": "view",
                        //     "route": "nhasanxuat/collection",
                        //     "visible": function() {
                        //         return (this.userHasRole("admin") || (this.userHasRole("admin_donvi")) || this.check_tuyendonvi() == "1");
                        //     }
                        // },
                        // =======================================================
                        {
                            "text": "Nhà sản xuất",
                            "type": "view",
                            "route": "nhasanxuat/collection",
                            "visible": function() {
                                return (this.userHasRole("admin") || (this.userHasRole("admin_donvi")) || this.check_tuyendonvi() == "1");
                            }
                        },
                        // =======================================================
                        {
                            "text": "Nhà cung cấp",
                            "type": "view",
                            "route": "nhacungcap/collection",
                            "visible": function() {
                                return (this.userHasRole("admin") || (this.userHasRole("admin_donvi")) || this.check_tuyendonvi() == "1");
                            }
                        },
                        {
                            "text": "Danh mục Cây thuốc",
                            "type": "view",
                            "route": "caythuoc/collection",
                            "visible": function() {
                                return (this.userHasRole("admin") || (this.userHasRole("admin_donvi")) || this.check_tuyendonvi() == "1");
                            }
                        },
                        {
                            "text": "Nhóm dược liệu",
                            "type": "view",
                            "route": "nhomsanpham/collection",
                            "visible": function() {
                                return (this.userHasRole("admin") || (this.userHasRole("admin_donvi")) || this.check_tuyendonvi() == "1");
                            }
                        },  
                        {
                            "text": "Danh mục dược liệu",
                            "type": "view",
                            "route": "danhmuc_duoclieu/collection",
                            "visible": function() {
                                return (this.userHasRole("admin") || (this.userHasRole("admin_donvi")) || this.check_tuyendonvi() == "1");
                            }
                        },
                        {
                            "text": "Bộ phận dược liệu",
                            "type": "view",
                            "route": "bophan/collection",
                            "visible": function() {
                                return (this.userHasRole("admin") || (this.userHasRole("admin_donvi")) || this.check_tuyendonvi() == "1");
                            }
                        },
                        {
                            "text": "Danh mục Vùng trồng dược liệu",
                            "type": "view",
                            "route": "vungtrong_duoclieu/collection",
                            "visible": function() {
                                return (this.userHasRole("admin") || (this.userHasRole("admin_donvi")) || this.check_tuyendonvi() == "1");
                            }
                        },
                        {
                            "text": "Danh mục Tiêu chuẩn",
                            "type": "view",
                            "route": "tieuchuan/collection",
                            "visible": function() {
                                return (this.userHasRole("admin") || (this.userHasRole("admin_donvi")) || this.check_tuyendonvi() == "1");
                            }
                        },
                        {
                            "text": "Bài thuốc Y dược cổ truyền",
                            "type": "view",
                            "route": "baithuoc_ydct/collection",
                            "visible": function() {
                                return (this.userHasRole("admin") || (this.userHasRole("admin_donvi")) || this.check_tuyendonvi() == "1");
                            }
                        },
                        {
                            "text": "Cơ sở đào tạo y dược cổ truyền",
                            "type": "view",
                            "route": "coso_daotao/collection",
                            "visible": function() {
                                return (this.userHasRole("admin") || (this.userHasRole("admin_donvi")) || this.check_tuyendonvi() == "1");
                            }
                        },
                        
                        {
                            "text": "Danh sách Cửa khẩu",
                            "type": "view",
                            "collectionName": "cuakhau",
                            "route": "cuakhau/collection",
                            "$ref": "app/danhmuc/danhmuc_sanpham/CuaKhau/CollectionView",
                            "visible": function() {
                                return false;
                                // return (this.userHasRole("admin"));
                            }
                        },     
                        {
                            "text": "Danh mục DN Sản Xuất",
                            "type": "view",
                            "route": "donvisanxuat_nhapkhau/collection",
                            "visible": function() {
                                return false;
                                // return (this.userHasRole("admin"));
                            }
                        },
                        {
                            "text": "Danh mục DNCU Nước Ngoài",
                            "type": "view",
                            "route": "danhmuc_cungung_nuoc_ngoai/collection",
                            "visible": function() {
                                return false;
                                // return (this.userHasRole("admin"));
                            }
                        }, 
                        
                    ]
                },
                // {
                //     "text": "Danh Mục dược liệu",
                //     "icon": "ri-book-line",
                //     "type": "category",
                //     "visible": function() {
                //         return (this.userHasRole("admin"));
                //     },
                //     "entries": [
                //     ]
                // },
                {
                    "text": "Quản lý hành nghề",
                    "icon": "ri-book-line",
                    "type": "category",
                    "visible": function() {
                        // var tuyendonvi_id = gonrinApp().getTuyenDonVi();
                        return (this.userHasRole("admin") || (this.userHasRole("admin_donvi")) || this.check_tuyendonvi() == "1");
                        // return (this.userHasRole("admin") || ((this.userHasRole("admin_donvi") || this.userHasRole("canbo")) && ["1", "2", "3"].includes(tuyendonvi_id)));
                    },
                    "entries": [
                        {
                            "text": "Cơ sở hành nghề",
                            "type": "view",
                            "route": "coso_hanhnghe/collection",
                            "visible": function() {
                                return (this.userHasRole("admin") || (this.userHasRole("admin_donvi")) || this.check_tuyendonvi() == "1");
                                // return (this.userHasRole("admin") || ((this.userHasRole("admin_donvi") || this.userHasRole("canbo")) && this.check_tuyendonvi() == "3"));
                            }
                        }, 
                    ]
                },
            ]
        },
        {
            "text": "Báo cáo - thống kê",
            "icon": "mdi mdi-view-dashboard",
            "type": "view",
            "$ref": "app/thongke/NewModel",
            "collectionName": "thongke_vattu",
            "route": "thongke_vattu",
            "visible": function() {
                return (this.check_tuyendonvi() == "10" && this.userHasRole("canbo") == false && this.userHasRole("admin") === false);
            }
        },
        {
            "text": "Danh Mục",
            "icon": "ri-book-line",
            "type": "category",
            "visible": function() {
                return false;
            },
            "entries": [
                {
                    "text": "Danh mục dược liệu dùng chung",
                    "type": "view",
                    "route": "danhmuc_duoclieu/collection",
                    "visible": function() {
                        return false;
                    }
                },
                {
                    "text": "Danh mục dược liệu đơn vị",
                    "type": "view",
                    "route": "sanpham_donvi/collection",
                    "visible": function() {
                        return false;
                    }
                },
        ]
        },
        {
            "text" : 'Quản lý nuôi trồng',
            "type" : 'category',
            'icon' : "fas fa-clinic-medical",
            'visible' : function(){
                return ((this.userHasRole("admin_donvi") || this.userHasRole("canbo")) && (this.check_loai_donvi() == 5 || this.check_loai_donvi() == 7));
            },
            "entries": [
                {
                    "text": "Quản lý địa điểm nuôi trồng",
                    "type": "view",
                    "collectionName": "diadiem_nuoitrong",
                    "route": "diadiem_nuoitrong/collection",
                    "$ref": "app/view/diadiemnuoitrong/CollectionView",
                    "visible": function() {
                        return ((this.userHasRole("admin_donvi") || this.userHasRole("canbo")) && (this.check_loai_donvi() == 5 || this.check_loai_donvi() == 7));
                    },
                },
                {
                    "text": "Quản lý đợt nuôi trồng",
                    "type": "view",
                    "collectionName": "duoclieu_nuoitrong",
                    "route": "duoclieu_nuoitrong/collection",
                    "$ref": "app/view/nuoitrongkhaithac/CollectionView",
                    "visible": function() {
                        return ((this.userHasRole("admin_donvi") || this.userHasRole("canbo")) && (this.check_loai_donvi() == 5 || this.check_loai_donvi() == 7));
                    },
                }
            ]
        },
        {
            "text" : 'Quản lý nuôi trồng, khai thác',
            "type" : 'category',
            'icon' : "fas fa-clinic-medical",
            'visible' : function(){
                return ((this.userHasRole("admin_donvi") || this.userHasRole("canbo")) && (this.check_loai_donvi() == 9));
            },
            "entries": [
                {
                    "text": "Quản lý địa điểm nuôi trồng",
                    "type": "view",
                    "collectionName": "diadiem_nuoitrong",
                    "route": "diadiem_nuoitrong/collection",
                    "$ref": "app/view/diadiemnuoitrong/CollectionView",
                    "visible": function() {
                        return ((this.userHasRole("admin_donvi") || this.userHasRole("canbo")) && (this.check_loai_donvi() == 9));
                    },
                },
                {
                    "text": "Quản lý đợt nuôi trồng",
                    "type": "view",
                    "collectionName": "duoclieu_nuoitrong",
                    "route": "duoclieu_nuoitrong/collection",
                    "$ref": "app/view/nuoitrongkhaithac/CollectionView",
                    "visible": function() {
                        return ((this.userHasRole("admin_donvi") || this.userHasRole("canbo")) && (this.check_loai_donvi() == 9));
                    },
                },
                {
                    "text": "Quản lý địa điểm khai thác",
                    "type": "view",
                    "collectionName": "diadiem_khaithac",
                    "route": "diadiem_khaithac/collection",
                    "$ref": "app/view/diadiemkhaithac/CollectionView",
                    "visible": function() {
                        return ((this.userHasRole("admin_donvi") || this.userHasRole("canbo")) && (this.check_loai_donvi() == 9));
                    },
                },
                {
                    "text": "Quản lý đợt khai thác",
                    "type": "view",
                    "collectionName": "khaithac_tunhien",
                    "route": "khaithac_tunhien/collection",
                    "$ref": "app/view/quanlykhaithac/CollectionView",
                    "visible": function() {
                        return ((this.userHasRole("admin_donvi") || this.userHasRole("canbo")) && (this.check_loai_donvi() == 9));
                    },
                }
            ]
        },
        {
            "text" : 'Quản lý khai thác',
            "type" : 'category',
            'icon' : "fas fa-clinic-medical",
            'visible' : function(){
                return ((this.userHasRole("chuaduochien")));
                // return (!this.userHasRole('admin') && this.check_tuyendonvi() =="2");
            },
            "entries": [
                {
                    "text": "Quản lý địa điểm khai thác",
                    "icon": "fa fa-tree",
                    "type": "view",
                    "route": "diadiem_khaithac/collection",
                    "visible": function() {
                        return ((this.userHasRole("admin_donvi")));
                    },
                },
                {
                    "text": "Quản lý đợt khai thác",
                    "type": "view",
                    // "icon": "fa fa-pagelines",
                    "route": "khaithac_tunhien/collection",
                    "visible": function() {
                        return ((this.userHasRole("admin_donvi")));
                    },
                }
            ]
        },
        {
            "text": "Quản lý chứng nhận",
            "icon": "ri-book-line",
            "type": "category",
            "visible": function() {
                return false;
                // return ((this.userHasRole("admin_donvi") || this.userHasRole("canbo") || this.userHasRole("lanhdao")) && this.check_tuyendonvi() == "10");
            },
            "entries": [{
                    "text": "QL cấp phép nhập khẩu",
                    "type": "view",
                    "collectionName": "giayphep_nhapkhau",
                    "route": "giayphep_nhapkhau_cuc/collection",
                    "$ref": "app/giayphepnhapkhau/CollectionView",
                    "visible": function() {
                        return ((this.userHasRole("admin_donvi") || this.userHasRole("canbo") || this.userHasRole("lanhdao")) && this.check_tuyendonvi() == "10");

                    }

                },
                {
                    "text": "QL Phiếu Kiểm Nghiệm-COA",
                    "type": "view",
                    "collectionName": "phieu_kiem_nghiem",
                    "route": "phieu_kiem_nghiem_cuc/collection",
                    "$ref": "app/giaychungnhancq/CollectionView",
                    "visible": function() {
                        return ((this.userHasRole("admin_donvi") || this.userHasRole("canbo") || this.userHasRole("lanhdao")) && this.check_tuyendonvi() == "10");
                    }

                },
                {
                    "text": "QL Nguồn Gốc-CO",
                    "type": "view",
                    "collectionName": "giaychungnhanco",
                    "route": "giaychungnhanco_cuc/collection",
                    "$ref": "app/giaychungnhanco/CollectionView",
                    "visible": function() {
                        return ((this.userHasRole("admin_donvi") || this.userHasRole("canbo") || this.userHasRole("lanhdao")) && this.check_tuyendonvi() == "10");
                    }

                },
                {
                    "text": "QL chứng nhận GACP",
                    "type": "view",
                    "collectionName": "chitieu_gacp",
                    "route": "chitieu_gacp/collection",
                    "$ref": "app/view/quanlygacp/CollectionView",
                    "visible": function() {
                        return ((this.userHasRole("admin_donvi") || this.userHasRole("canbo") || this.userHasRole("lanhdao")) && this.check_tuyendonvi() == "10");
                    }

                },
            ]
        },
        {
            "text": "Quản lý chứng nhận",
            "icon": "ri-book-line",
            "type": "category",
            "visible": function() {
                return false;
                // return ((this.userHasRole("admin_donvi") || this.userHasRole("canbo") || this.userHasRole("lanhdao")) && this.check_tuyendonvi() != "10");
            },
            "entries": [{
                    "text": "QL cấp phép nhập khẩu",
                    "type": "view",
                    "collectionName": "giayphep_nhapkhau",
                    "route": "giayphep_nhapkhau/collection",
                    "$ref": "app/giayphepnhapkhau/CollectionView",
                    "visible": function() {
                        return ((this.userHasRole("admin_donvi") || this.userHasRole("canbo") || this.userHasRole("lanhdao")) && this.check_tuyendonvi() != "10");

                    }

                },
                {
                    "text": "QL Phiếu Kiểm Nghiệm-COA",
                    "type": "view",
                    "collectionName": "phieu_kiem_nghiem",
                    "route": "phieu_kiem_nghiem/collection",
                    "$ref": "app/giaychungnhancq/CollectionView",
                    "visible": function() {
                        return ((this.userHasRole("admin_donvi") || this.userHasRole("canbo") || this.userHasRole("lanhdao")) && this.check_tuyendonvi() != "10");
                    }

                },
                {
                    "text": "QL Nguồn Gốc-CO",
                    "type": "view",
                    "collectionName": "giaychungnhanco",
                    "route": "giaychungnhanco/collection",
                    "$ref": "app/giaychungnhanco/CollectionView",
                    "visible": function() {
                        return ((this.userHasRole("admin_donvi") || this.userHasRole("canbo") || this.userHasRole("lanhdao")) && this.check_tuyendonvi() != "10");
                    }

                },
                {
                    "text": "QL chứng nhận GACP",
                    "type": "view",
                    "collectionName": "quanlygacp",
                    "route": "quanlygacp_nuoitrong/collection",
                    "$ref": "app/view/quanlygacpdonvi/Collection_nuoitrong",
                    "visible": function(){
                        return ((this.userHasRole("admin_donvi") || this.userHasRole("canbo")) && (this.check_loai_donvi() == 5 || this.check_loai_donvi() == 7));
                    }
                },
                {
                    "text": "QL chứng nhận GACP",
                    "type": "view",
                    "collectionName": "quanlygacp",
                    "route": "quanlygacp_khaithac/collection",
                    "$ref": "app/view/quanlygacpdonvi/Collection_khaithac",
                    "visible": function(){
                        return ((this.userHasRole("admin_donvi") || this.userHasRole("canbo")) && (this.check_loai_donvi() == 6 || this.check_loai_donvi() == 8));
                    }
                },
                {
                    "text": "QL chứng nhận GACP",
                    "type": "view",
                    "collectionName": "quanlygacp",
                    "route": "quanlygacp_nuoitrong_khaithac/collection",
                    "$ref": "app/view/quanlygacpdonvi/CollectionNuoiTrong_Khaithac",
                    "visible": function(){
                        return ((this.userHasRole("admin_donvi") || this.userHasRole("canbo")) && (this.check_loai_donvi() ==9));
                    }
                }
            ]
        },
        {
            "text": "Báo Cáo Kho",
            "icon": "ri-user-line",
            "type": "category",
            "visible": function() {
                return false;
                // return ((this.userHasRole("admin_donvi") || this.userHasRole("canbo")) && this.check_tuyendonvi() != "10");
            },
            "entries": [
                {
                    "text": "Phiếu nhập kho",
                    "type": "view",
                    "collectionName": "phieunhapkho",
                    "route": "phieunhapkho/collection",
                    "$ref": "app/quanlykho/PhieuNhap/CollectionView",
                    "visible": function() {
                        return (this.userHasRole("admin_donvi") || this.userHasRole("canbo"));
                    }
                },
                {
                    "text": "Phiếu xuất kho",
                    "type": "view",
                    "collectionName": "phieuxuatkho",
                    "route": "phieuxuatkho/collection",
                    "$ref": "app/quanlykho/PhieuXuat/CollectionView",
                    "visible": function() {
                        return (this.userHasRole("admin_donvi") || this.userHasRole("canbo"));
                    }
                },
                {
                    "text": "Quản lý tồn kho",
                    "type": "view",
                    "collectionName": "kho_sanpham_hanghoa",
                    "route": "kho_sanpham_hanghoa",
                    "$ref": "app/quanlykho/DanhSachVatTu/CollectionView",
                    "visible": function() {
                        return (this.userHasRole("admin_donvi") || this.userHasRole("canbo"));
                    }
                },
                {
                    "text": "Danh sách kho",
                    "type": "view",
                    "collectionName": "danhmuc_kho",
                    "route": "danhmuc_kho/collection",
                    "$ref": "app/quanlykho/DanhMucKho/CollectionView",
                    "visible": function() {
                        return (this.userHasRole("admin_donvi") || this.userHasRole("canbo"));
                    }
                },
                {
                    "text": "Báo cáo xuất nhập tồn",
                    "type": "view",
                    "collectionName": "donvi",
                    "route": "baocaokho/create",
                    "$ref": "app/quanlykho/BaoCaoKho/NewModelView",
                    "visible": function() {
                        return (this.userHasRole("admin_donvi") || this.userHasRole("canbo"));
                    }
                },
                {
                    "text": "Quản lý kết quả gói thầu",
                    "type": "view",
                    "collectionName": "ketquathau",
                    "route": "ketquathau/collection",
                    "$ref": "app/quanlykho/KetQuaTrungThau1/CollectionView",
                    "visible": function() {
                        return (this.userHasRole("admin_donvi") || this.userHasRole("canbo"));
                    }
                },
                {
                    "text": "Kế hoạch dự trù",
                    "type": "view",
                    "collectionName": "phieudutru",
                    "route": "phieudutru/collection",
                    "$ref": "app/quanlykho/PhieuDuTru1/CollectionView",
                    "visible": function() {
                        return (this.userHasRole("admin_donvi") || this.userHasRole("canbo"));
                    }
                },
                {
                    "text": "Báo cáo chuyển kho",
                    "type": "view",
                    "collectionName": "phieuchuyenkho",
                    "route": "phieuchuyenkho/collection",
                    "$ref": "app/quanlykho/PhieuChuyenKho1/CollectionView",
                    "visible": function() {
                        return false;
                        // return (this.userHasRole("admin_donvi") || this.userHasRole("canbo"));
                    }
                },
                {
                    "text": "Báo cáo kiểm kê kho",
                    "type": "view",
                    "collectionName": "phieukiemkekho",
                    "route": "phieukiemkekho/collection",
                    "$ref": "app/quanlykho/PhieuKiemKe/CollectionView",
                    "visible": function() {
                        return (this.userHasRole("admin_donvi") || this.userHasRole("canbo"));
                    }
                }
            ]
        },
        {
            "text": "Thống kê",
            "icon": "mdi mdi-view-dashboard",
            "type": "view",
            "collectionName": "thongke_duoclieu",
            "route": "thongke_duoclieu",
            "visible": function() {
                return false;
            }
        },
        {
            "text": "Tìm kiếm",
            "icon": "fas fa-search",
            "type": "view",
            "collectionName": "search",
            "route": "search",
            "$ref": "app/searchcocq/ModelView",
            "visible": function() {
                return ((this.check_tuyendonvi() == "10"))
            }
        },
        {
            "text": "Truy xuất",
            "icon": "fas fa-search-plus",
            "type": "view",
            "collectionName": "truyxuat",
            "route": "truyxuat",
            "$ref": "app/truyxuatcocq/ModelView",
            "visible": function() {
                return false;
                // return ((this.userHasRole("lanhdao") == false) && this.check_tuyendonvi() == "10")
            }
        },
        {
            "text": "Góp Ý",
            "icon": "fa fa-paper-plane",
            "type": "view",
            "collectionName": "suggestion",
            "route": "suggestion",
            "$ref": "app/Suggestion/ModelView",
            "visible": function() {
                return false;
                // return (this.userHasRole("lanhdao") == false)
            }
        },
        //  {
        //     "text": "Ứng dụng kết nối",
        //     "type":"view",
        //     "icon": "fas fa-paperclip",
        //     "$ref": "app/appkey/CollectionView",
        //     "route": "appinfo/collection",
        //     "visible": function() {
        //         return (this.userHasRole("admin") || this.check_tuyendonvi() == "1");
        //     }
        // },
        {
            "text": "Quản lý sản phẩm",
            "icon": "ri-book-line",
            "type": "category",
            "visible": function() {
                return (!this.userHasRole('admin') && this.check_tuyendonvi() == "3");
            },
            "entries": [
                {
                    "text": "Nhà sản xuất",
                    "type": "view",
                    "route": "nhasanxuat_donvi/collection",
                    "visible": function() {
                        return (this.check_tuyendonvi() == "3");
                    }
                },
                {
                    "text": "Nhà cung cấp",
                    "type": "view",
                    "route": "donvi_cungung/collection",
                    "visible": function() {
                        return (!this.userHasRole('admin') && this.check_tuyendonvi() == "3");
                    }
                },
                {
                    "text": "Nhóm sản phẩm",
                    "type": "view",
                    "route": "nhomsanpham_donvi/collection",
                    "visible": function() {
                        return (!this.userHasRole('admin') && this.check_tuyendonvi() == "3");
                    }
                },
                {
                    "text": "Sản phẩm",
                    "type": "view",
                    "route": "sanpham/collection",
                    "visible": function() {
                        return (!this.userHasRole('admin') && this.check_tuyendonvi() == "3");
                    }
                },
                {
                    "text": "Nhà sản xuất",
                    "type": "view",
                    "route": "nhasanxuat/collection",
                    "visible": function() {
                        return (this.check_tuyendonvi() == "3");
                    }
                },
                {
                    "text": "Sản phẩm đạt GACP",
                    "type": "view",
                    "route": "sanpham_gacp_donvi/collection",
                    "visible": function() {
                        return (!this.userHasRole('admin') && this.check_tuyendonvi() == "3");
                    }
                },
                {
                    "text": "Sản phẩm nhập khẩu",
                    "type": "view",
                    "route": "sanpham_nhapkhau_donvi/collection",
                    "visible": function() {
                        return (!this.userHasRole('admin') && this.check_tuyendonvi() == "3");
                    }
                },
                {
                    "text": "Sản phẩm nổi bật",
                    "type": "view",
                    "route": "sanpham_noibat_donvi/collection",
                    "visible": function() {
                        return (!this.userHasRole('admin') && this.check_tuyendonvi() == "3");
                    }
                },
                {
                    "text": "Sản phẩm vi phạm",
                    "type": "view",
                    "route": "sanpham_vipham_donvi/collection",
                    "visible": function() {
                        return (!this.userHasRole('admin') && this.check_tuyendonvi() == "3");
                    }
                },
            ]
        },
        {
            "text": "Quản lý bài viết YDCT",
            "icon": "fa fa-folder-open",
            "type": "category",
            "visible": function() {
                return (!this.userHasRole('admin'));
            },
            "entries": [
                {
                    "text": "Tác giả",
                    "icon":"fas fa-user",
                    "type": "view",
                    "route": "author/collection",
                    // "visible": function() {
                    //     return (!this.userHasRole('admin') && this.check_tuyendonvi() == "3");
                    // }
                },
                {
                    "text": "Chuyên mục",
                    "icon":"fa fa-newspaper",
                    "type": "view",
                    "route": "category/collection",
                    // "visible": function() {
                    //     return (!this.userHasRole('admin') && this.check_tuyendonvi() == "3");
                    // }
                },
                {
                    "text": "Bài viết nổi bật",
                    "icon":"fas fa-highlighter",
                    "type": "view",
                    "route": "feature-news/collection",
                    // "visible": function() {
                    //     return (!this.userHasRole('admin') && this.check_tuyendonvi() == "3");
                    // }
                },
                {
                    "text": "Danh sách bài viết",
                    "icon":"fas fa-list",
                    "type": "category",
                    // "visible": function() {
                    //     return (!this.userHasRole('admin') && this.check_tuyendonvi() == "3");
                    // },
                    "entries": [
                        {
                            "text": "Bài lưu tạm",
                            "type": "view",
                            // "icon": "fas fa-file-download",
                            "route": "bai-luu-tam/collection",
                            "visible": function() {
                                return (!this.userHasRole('admin') && this.check_tuyendonvi() == "3");
                            },
                        },
                        {
                            "text": "Bài trả lại tôi",
                            "type": "view",
                            // "icon": "fas fa-undo",
                            "route": "bai-tra-lai-toi/collection",
                            "visible": function() {
                                return (!this.userHasRole('admin') && this.check_tuyendonvi() == "3");
                            },
                        },
                        {
                            "text": "Bài chờ biên tập",
                            "type": "view",
                            // "icon": "fas fa-pause-circle",
                            "route": "bai-cho-bien-tap/collection",
                            // "visible": function() {
                            //     return (!this.userHasRole('admin') && this.check_tuyendonvi() == "3");
                            // },
                        },
                        {
                            "text": "Bài nhận biên tập",
                            "type": "view",
                            // "icon": "fas fa-check",
                            "route": "bai-nhan-bien-tap/collection",
                            // "visible": function() {
                            //     return (!this.userHasRole('admin') && this.check_tuyendonvi() == "3");
                            // },
                        },
                        {
                            "text": "Bài đang xử lý",
                            "type": "view",
                            // "icon": "fas fa-chalkboard-teacher",
                            "route": "bai-dang-xu-ly/collection",
                            // "visible": function() {
                            //     return (!this.userHasRole('admin') && this.check_tuyendonvi() == "3");
                            // },
                        },
                        {
                            "text": "Bài đã trả",
                            "type": "view",
                            // "icon": "fas fa-backward",
                            "route": "bai-da-tra/collection",
                            // "visible": function() {
                            //     return (!this.userHasRole('admin') && this.check_tuyendonvi() == "3");
                            // },
                        },
                        {
                            "text": "Bài bị gỡ",
                            "type": "view",
                            // "icon": "far fa-window-close",
                            "route": "bai-bi-go/collection",
                            // "visible": function() {
                            //     return (!this.userHasRole('admin') && this.check_tuyendonvi() == "3");
                            // },
                        },
                        {
                            "text": "Bài đang xuất bản",
                            "type": "view",
                            // "icon": "fas fa-upload",
                            "route": "bai-dang-xuat-ban/collection",
                            // "visible": function() {
                            //     return (!this.userHasRole('admin') && this.check_tuyendonvi() == "3");
                            // },
                        },
                        {
                            "text": "Bài bị xóa",
                            "type": "view",
                            // "icon": "far fa-trash-alt",
                            "route": "bai-bi-xoa/collection",
                            "visible": function() {
                                return (!this.userHasRole('admin') && this.check_tuyendonvi() == "3");
                            },
                        }
                    ]
                },
            ]
        },
        // {
        //     "text": "Nhà sản xuất",
        //     "icon": "ri-book-line",
        //     "type": "category",
        //     "visible": function() {
        //         return (!this.userHasRole('admin')  || this.check_tuyendonvi() =="2"  || this.check_tuyendonvi() =="3");
        //     },
        //     "entries": [
        //         {
        //             "text": "Nhà sản xuất",
        //             "type": "view",
        //             "route": "nhasanxuat/collection",
        //             "visible": function() {
        //                 return (!this.userHasRole('admin'));
        //             }
        //         },
        //         {
        //             "text": "Nhà sản xuất dơn vị",
        //             "type": "view",
        //             "route": "nhasanxuat/collection",
        //             "visible": function() {
        //                 return (this.check_tuyendonvi() =="2"  || this.check_tuyendonvi() =="3");
        //             }
        //         },
        // ]
        // },
    ];

});