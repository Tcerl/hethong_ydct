define(function(require) {
    "use strict";
    return [
        {
            "route": "baocao_sudung_phanmem",
            "$ref": "app/thongke/BaoCaoSuDungPMView"
        },
        {
            "route": "viewco",
            "$ref": "app/giaychungnhanco/ViewData"
        },
        {
            "route": "viewnhapkhau",
            "$ref": "app/giayphepnhapkhau/ViewData"
        },
        {
            "route": "viewcoa",
            "$ref": "app/giaychungnhancq/ViewData"
        },
        {
            "route": "huongdansudung",
            "$ref": "app/view/huongdansudung/ModelView"
        },
        {
            "route":"donvidangky/collection",
            "$ref":"app/view/donvidangky/CollectionView"
        },
        {
            "route": "donvidangky/model",
            "$ref": "app/view/donvidangky/ModelView"
        },
        {
            "route": "truyxuat",
            "$ref": "app/truyxuatcocq/ModelView"
        },
        {
            "route": "quanlygacp_nuoitrong_khaithac/collection",
            "$ref": "app/view/quanlygacpdonvi/CollectionNuoiTrong_Khaithac"
        },
        {
            "route": "quanlygacp_nuoitrong/collection",
            "$ref": "app/view/quanlygacpdonvi/Collection_nuoitrong"
        },
        {
            "route": "quanlygacp_nuoitrong/model",
            "$ref": "app/view/quanlygacpdonvi/Model_nuoitrong"
        },
        {
            "route": "quanlygacp_khaithac/collection",
            "$ref": "app/view/quanlygacpdonvi/Collection_khaithac"
        },
        {
            "route": "quanlygacp_khaithac/model",
            "$ref": "app/view/quanlygacpdonvi/Model_khaithac"
        },
        {
            "route": "xem_phieuxuat/model",
            "$ref": "app/quanlykho/TraoDoiSanPham/NewModel"
        },
        {
            "route": "user/chitiet",
            "$ref": "app/view/quanlyCanbo/DonViYTe/UserDonVi/view/NewModel"
        },
        {
            "route" : "appinfo/collection",
            "$ref": "app/appkey/CollectionView",
        },
        {
            "route" : "appinfo/model",
            "$ref": "app/appkey/ModelView",
        },
        {
            "route":"thongke_duoclieu",
            "$ref": "app/thongke/ThongkeDoanhNghiep"
        },
        {
            "route" : "search",
            "$ref": "app/searchcocq/ModelView",
        },
        {
            "route" : "chitieu_gacp/collection",
            "$ref": "app/view/quanlygacp/CollectionView",
        },
        {
            "route" : "gacp_nuoitrong/model",
            "$ref": "app/view/quanlygacp/Model_nuoitrong",
        },
        {
            "route" : "gacp_khaithac/model",
            "$ref": "app/view/quanlygacp/Model_khaithac",
        },
        {
            "route" : "sanpham_donvi/create",
            "$ref": "app/danhmuc/danhmuc_sanpham/SanPhamDonVi/NewModel",
        },
        {
            "route" : "sanpham_donvi/collection",
            "$ref": "app/danhmuc/danhmuc_sanpham/SanPhamDonVi/CollectionView",
        },
        {
            "route" : "sanpham_donvi/model",
            "$ref": "app/danhmuc/danhmuc_sanpham/SanPhamDonVi/ModelView",
        },
        {
            "route" : "sanpham_donvi/view",
            "$ref": "app/danhmuc/danhmuc_sanpham/SanPhamDonVi/Viewdata",
        },
        {
            "route" : "khaithac_tunhien/collection",
            "$ref" : "app/view/quanlykhaithac/CollectionView"
        },
        {
            "route" : "khaithac_tunhien/model",
            "$ref" : "app/view/quanlykhaithac/ModelView"
        },
        {
            "route" : "duoclieu_nuoitrong/collection",
            "$ref" : "app/view/quanlynuoitrong/CollectionView"
        },
        {
            "route" : "duoclieu_nuoitrong/model",
            "$ref" : "app/view/quanlynuoitrong/ModelView"
        },
        {
            "route" : "diadiem_khaithac/collection",
            "$ref" : "app/view/diadiemkhaithac/CollectionView"
        },
        {
            "route" : "diadiem_khaithac/model",
            "$ref" : "app/view/diadiemkhaithac/ModelView"
        },
        {
            "route" : "diadiem_nuoitrong/collection",
            "$ref" : "app/view/diadiemnuoitrong/CollectionView"
        },
        {
            "route" : "diadiem_nuoitrong/model",
            "$ref" : "app/view/diadiemnuoitrong/ModelView"
        },
        {
            "route" : "ketquathau/collection",
            "$ref" : "app/quanlykho/KetQuaTrungThau1/CollectionView"
        },
        {
            "route" : "ketquathau/model",
            "$ref" : "app/quanlykho/KetQuaTrungThau1/ModelView"
        },
        {
            "route" : "phieudutru/collection",
            "$ref" : "app/quanlykho/PhieuDuTru1/CollectionView"
        },
        {
            "route" : "phieudutru/model",
            "$ref" : "app/quanlykho/PhieuDuTru1/ModelView"
        },
        {
            "route" : "danhmuc_cungung_nuoc_ngoai/collection",
            "$ref": "app/danhmuc/danhmuc_sanpham/DonViCungUngNuocNgoai/CollectionView",
        },
        {
            "route" : "danhmuc_cungung_nuoc_ngoai/model",
            "$ref": "app/danhmuc/danhmuc_sanpham/DonViCungUngNuocNgoai/ModelView",
        },
        {
			"collectionName": "notify",
			"route": "notify/collection",
			"$ref": "app/notifications/CollectionView",
		},
        {
            "route" : "donvisanxuat_nhapkhau/collection",
            "$ref": "app/danhmuc/danhmuc_sanpham/DonViSanXuatNhapKhau/CollectionView",
        },
        {
            "route" : "donvisanxuat_nhapkhau/model",
            "$ref": "app/danhmuc/danhmuc_sanpham/DonViSanXuatNhapKhau/ModelView",
        },
        {
            "route" : "lich_su_trao_doi_san_pham/collection",
            "$ref" : "app/quanlykho/TraoDoiSanPham/CollectionView"
        },
        {
            "route" : "lich_su_trao_doi_san_pham/model",
            "$ref" : "app/quanlykho/TraoDoiSanPham/ModelView"
        },
        {
            "route" : "phieu_kiem_nghiem_cuc/collection",
            "$ref" : "app/giaychungnhancq/CollectionCuc"
        },
        {
            "route" : "phieu_kiem_nghiem/collection",
            "$ref" : "app/giaychungnhancq/CollectionView"
        },
        {
            "route" : "phieu_kiem_nghiem/model",
            "$ref" : "app/giaychungnhancq/ModelView"
        },
        {
            "route" : "giayphep_nhapkhau_cuc/collection",
            "$ref" : "app/giayphepnhapkhau/CollectionCuc"
        },
        {
            "route" : "giayphep_nhapkhau/collection",
            "$ref" : "app/giayphepnhapkhau/CollectionView"
        },
        {
            "route" : "giayphep_nhapkhau/model",
            "$ref" : "app/giayphepnhapkhau/ModelView"
        },
        {
            "route" : "suggestion",
            "$ref" : "app/Suggestion/ModelView"
        },
        {
            "route" : "phieuchuyenkho/collection",
            "$ref" : "app/quanlykho/PhieuChuyenKho1/CollectionView"
        },
        {
            "route" : "phieuchuyenkho/model",
            "$ref" : "app/quanlykho/PhieuChuyenKho1/ModelView"
        },
        {
            "route" : "danhmuc_nhom_vattu/collection",
            "$ref" : "app/danhmuc/danhmuc_dungchung/danhmuc_nhomvattu/view/CollectionView"
        },
        {
            "route" : "danhmuc_nhom_vattu/model",
            "$ref" : "app/danhmuc/danhmuc_dungchung/danhmuc_nhomvattu/view/ModelView"
        },
        {
            "route": "ketqua_trungthau/collection",
            "$ref": "app/quanlykho/KetQuaTrungThau/CollectionView",
        },
        {
            "route": "ketqua_trungthau/model",
            "$ref": "app/quanlykho/KetQuaTrungThau/ModelView",
        },
        {
            "$ref": "app/thongke/NewModel",
            "route": "thongke_vattu",
        },
        {
            "route": "danhmuc_vattu_donvi/collection",
            "$ref": "app/danhmuc/danhmuc_donvi/DanhMucVatTu/CollectionView",
        },
        {
            "route":"danhmuc_vattu_donvi/model",
            "$ref": "app/danhmuc/danhmuc_donvi/DanhMucVatTu/ModelView"
        },
        {
            "route":"baocaokho/create",
            "$ref": "app/quanlykho/BaoCaoKho/NewModelView"
        },
        {
            "route":"baocaokho/model",
            "$ref": "app/quanlykho/BaoCaoKho/ModelView"
        },
        {
            "route": "kho_sanpham_hanghoa",
            "$ref": "app/quanlykho/DanhSachVatTu/CollectionView"
        },
        {
            "route":"kho_sanpham_hanghoa/model",
            "$ref": "app/quanlykho/DanhSachVatTu/ModelView"
        },
        {
            "route":"phieunhapkho/collection",
            "$ref": "app/quanlykho/PhieuNhap/CollectionView"
        },
        {
            "route":"phieunhapkho/model",
            "$ref": "app/quanlykho/PhieuNhap/ModelView"
        },
        {
            "route":"phieuxuatkho/collection",
            "$ref": "app/quanlykho/PhieuXuat/CollectionView"
        },
        {
            "route":"phieuxuatkho/model",
            "$ref": "app/quanlykho/PhieuXuat/ModelView"
        },
        {
            "route":"danhmuc_kho/collection",
            "$ref": "app/quanlykho/DanhMucKho/CollectionView"
        },
        {
            "route":"danhmuc_kho/model",
            "$ref": "app/quanlykho/DanhMucKho/ModelView"
        },
        {
            "text": "Dân Tộc",
            "type": "view",
            "collectionName": "dantoc",
            "route": "dantoc/collection",
            "$ref": "app/danhmuc/danhmuc_dungchung/DanToc/CollectionView",
            "visible": function() {
                return this.userHasRole("admin");
            }
        },
        {
            "type": "view",
            "collectionName": "dantoc",
            "route": "dantoc/model",
            "$ref": "app/danhmuc/danhmuc_dungchung/DanToc/ModelView",
            "visible": false
        },
        {
            "text": "Quốc Gia",
            "type": "view",
            "collectionName": "quocgia",
            "route": "quocgia/collection",
            "$ref": "app/danhmuc/danhmuc_dungchung/QuocGia/CollectionView",
        },
        {
            "type": "view",
            "collectionName": "quocgia",
            "route": "quocgia/model",
            "$ref": "app/danhmuc/danhmuc_dungchung/QuocGia/ModelView",
        },
        {
            "text": "Tỉnh Thành",
            "type": "view",
            "collectionName": "tinhthanh",
            "route": "tinhthanh/collection",
            "$ref": "app/danhmuc/danhmuc_dungchung/TinhThanh/CollectionView",
        },
        {
            "type": "view",
            "collectionName": "tinhthanh",
            "route": "tinhthanh/model",
            "$ref": "app/danhmuc/danhmuc_dungchung/TinhThanh/ModelView",
        },
        {
            "text": "Quận Huyện",
            "type": "view",
            "collectionName": "quanhuyen",
            "route": "quanhuyen/collection",
            "$ref": "app/danhmuc/danhmuc_dungchung/QuanHuyen/CollectionView",
        },
        {
            "type": "view",
            "collectionName": "quanhuyen",
            "route": "quanhuyen/model",
            "$ref": "app/danhmuc/danhmuc_dungchung/QuanHuyen/ModelView",
        },
        {
            "text": "Xã Phường",
            "type": "view",
            "collectionName": "xaphuong",
            "route": "xaphuong/collection",
            "$ref": "app/danhmuc/danhmuc_dungchung/XaPhuong/CollectionView",
        },
        {
            "type": "view",
            "collectionName": "xaphuong",
            "route": "xaphuong/model",
            "$ref": "app/danhmuc/danhmuc_dungchung/XaPhuong/ModelView",
        },
        {
            "text": "Thôn Xóm",
            "type": "view",
            "collectionName": "thonxom",
            "route": "thonxom/collection",
            "$ref": "app/danhmuc/danhmuc_donvi/ThonXom/CollectionView",
        },
        {
            "type": "view",
            "collectionName": "thonxom",
            "route": "thonxom/model",
            "$ref": "app/danhmuc/danhmuc_donvi/ThonXom/ModelView",
        },
        {
            "collectionName": "donvi",
            "route": "admin/DonVi/create",
            "$ref": "app/view/quanlyCanbo/DonViYTe/AdminCreateDonvi/ModelView"
        },
        {
            "collectionName": "donvidangki",
            "route": "admin/donvi/collection",
            "$ref": "app/view/quanlyCanbo/DonViYTe/CollectionView"
        },
        {
            "collectionName": "donvi",
            "route": "canbo/DonViYTe/model",
            "$ref": "app/view/quanlyCanbo/DonViYTe/ModelView"
        },
        {
            "collectionName": "donvidangki",
            "route": "canbo/donvi/model",
            "$ref": "app/view/quanlyCanbo/DonViYTe/ModelView"
        },
        {
            "collectionName": "donvi",
            "route": "admin/DonViCungUng/create",
            "$ref": "app/view/quanlyCanbo/DonViCungUng/AdminCreateDonvi/ModelView"
        },
        {
            "collectionName": "donvidangki",
            "route": "admin/donvicungung/collection",
            "$ref": "app/view/quanlyCanbo/DonViCungUng/CollectionView"
        },
        {
            "collectionName": "donvi",
            "route": "canbo/DonViCungUng/model",
            "$ref": "app/view/quanlyCanbo/DonViCungUng/ModelView"
        },
        {
            "collectionName": "donvidangki",
            "route": "canbo/donvicungung/model",
            "$ref": "app/view/quanlyCanbo/DonViCungUng/ModelView"
        },
        {
            "collectionName": "user",
            "route": "canbo/user/collection",
            "$ref": "app/view/quanlyCanbo/DonViYTe/UserDonVi/view/CollectionView"
        },
        {
            "collectionName": "tienich",
            "route": "tienich/thaydoimatkhau",
            "$ref": "app/tienich/ChangePassword",
            "check$el": true
        },
        {
            "collectionName": "tienich",
            "route": "tienich/thaydoithongtin",
            "$ref": "app/tienich/ChangeInfo",
            "check$el": true
        },
        {
            "collectionName": "tienich",
            "route": "tienich/xemthongtin",
            "$ref": "app/tienich/ViewInfoUser",
            "check$el": true
        },
        {
            "collectionName": "tienich",
            "route": "tienich",
            "$ref": "app/tienich/TienIchView",
            "check$el": true
        },
        {
            "collectionName": "notifications",
            "route": "notifications",
            "$ref": "app/notifications/CollectionView",
            "check$el": true
        },
        {
            "collectionName": "role",
            "route": "role/collection",
            "$ref": "app/view/HeThong/Role/CollectionView"
        },
        {
            "collectionName": "role",
            "route": "role/model(/:id)",
            "$ref": "app/view/HeThong/Role/ModelView"
        },
        {
            "text": "Quản lý chuyên mục",
            "type": "view",
            "collectionName": "category",
            "route": "categoryadmin/collection",
            "$ref": "app/view/CategoryPost/CategoryAdminCollectionView"
        },
        {
            "collectionName": "category",
            "route": "categoryadmin/model(/:id)",
            "$ref": "app/view/CategoryPost/CategoryAdminModelView",
        },
        {
            "collectionName": "post",
            "route": "postadmin/collection",
            "$ref": "app/view/CategoryPost/PostAdminCollectionView"
        },
        {
            "collectionName": "post",
            "route": "postadmin/model(/:id)",
            "$ref": "app/view/CategoryPost/PostAdminModelView",
        },
        {
            "collectionName": "post",
            "route": "post/model(/:id)",
            "$ref": "app/view/CategoryPost/PostView",
        },
        {
            "collectionName": "news",
            "route": "news/collection",
            "$ref": "app/news/NewCollectionView"
        },
        {
            "collectionName": "post",
            "route": "news/model(/:id)",
            "$ref": "app/news/NewsModelView"
        },
        {
            "collectionName":"tuyendonvi",
            "route":"tuyendonvi/collection",
            "$ref": "app/danhmuc/danhmuc_dungchung/TuyenDonVi/CollectionView"
        },
        {
            "collectionName":"tuyendonvi",
            "route":"tuyendonvi/model",
            "$ref": "app/danhmuc/danhmuc_dungchung/TuyenDonVi/ModelView"
        },
        {
            "route": "dichvu/model(/:id)",
            "$ref": "app/danhmuc/danhmuc_donvi/DichVu/ModelView"
        },
        {
            "route":"dichvu/collection",
            "$ref": "app/danhmuc/danhmuc_donvi/DichVu/CollectionView"
        },
        {
            "route": "donvi_cungung/collection",
            "$ref": "app/danhmuc/danhmuc_donvi/DonViCungUng/CollectionView"
        },
        {
            "route": "donvi_cungung/model",
            "$ref": "app/danhmuc/danhmuc_donvi/DonViCungUng/ModelView"
        },
        {
            "route": "danhmuc_nhacungcap/collection",
            "$ref": "app/danhmuc/danhmuc_dungchung/danhmuc_nhacungcap/CollectionView"
        },
        {
            "route": "danhmuc_nhacungcap/model",
            "$ref": "app/danhmuc/danhmuc_dungchung/danhmuc_nhacungcap/ModelView"
        },
        {
            "route": "phieukiemkekho/collection",
            "$ref": "app/quanlykho/PhieuKiemKe/CollectionView",
        },
        {
            "route": "phieukiemkekho/model",
            "$ref": "app/quanlykho/PhieuKiemKe/NewModel",
        },
        {
            "route": "xuat_xml/collection",
            "$ref": "app/XuatXML/CollectionView",
        },
        {
            "route": "cosoyte/collection",
            "$ref": "app/danhmuc/danhmuc_dungchung/CosoYte/CollectionView",
        },
        {
            "route": "cosoyte/model",
            "$ref": "app/danhmuc/danhmuc_dungchung/CosoYte/ModelView"
        },
        {
            "route": "nhomsanpham/collection",
            "$ref": "app/danhmuc/danhmuc_sanpham/NhomSanPham/CollectionView",
        },
        {
            "route": "nhomsanpham/model",
            "$ref": "app/danhmuc/danhmuc_sanpham/NhomSanPham/ModelView"
        },
        {
            "route": "nhomsanpham_donvi/collection",
            "$ref": "app/quanly_thuongmai_dientu/NhomSanPham/CollectionView",
        },
        {
            "route": "donvi_cungung/collection",
            "$ref": "app/quanly_thuongmai_dientu/DonViCungUng/CollectionView",
        },
        {
            "route": "nhasanxuat_donvi/collection",
            "$ref": "app/quanly_thuongmai_dientu/NhaSanXuatDonVi/CollectionView",
        },
        // {
        //     "route": "danhmuc_nhacungcap/collection",
        //     "$ref": "app/quanly_thuongmai_dientu/DonViCungUng/CollectionView",
        // },
        {
            "route": "nhasanxuat/collection",
            "$ref": "app/danhmuc/danhmuc_sanpham/NhaSanXuat/CollectionView",
        },
        {
            "route": "nhacungcap/collection",
            "$ref": "app/danhmuc/danhmuc_sanpham/NhaCungCap/CollectionView",
        },
        {
            "route": "sanpham/collection",
            "$ref": "app/quanly_thuongmai_dientu/SanPham/CollectionView",
        },
        {
            "route": "sanpham/view",
            "$ref": "app/quanly_thuongmai_dientu/SanPham/Viewdata"
        },
        {
            "route": "sanpham/model",
            "$ref": "app/quanly_thuongmai_dientu/SanPham/ModelView"
        },
        {
            "route": "sanpham_gacp_donvi/collection",
            "$ref": "app/quanly_thuongmai_dientu/SanPhamGACP/CollectionView",
        },
        {
            "route": "sanpham_nhapkhau_donvi/collection",
            "$ref": "app/quanly_thuongmai_dientu/SanPhamNhapKhau/CollectionView",
        },
        {
            "route": "sanpham_noibat_donvi/collection",
            "$ref": "app/quanly_thuongmai_dientu/SanPhamNoiBat/CollectionView",
        },
        {
            "route": "sanpham_vipham_donvi/collection",
            "$ref": "app/quanly_thuongmai_dientu/SanPhamViPham/CollectionView",
        },
        {
            "route": "danhmuc_duoclieu/collection",
            "$ref": "app/danhmuc/danhmuc_sanpham/DanhMucDuocLieu/CollectionView",
        },
        {
            "route": "danhmuc_duoclieu/view",
            "$ref": "app/danhmuc/danhmuc_sanpham/DanhMucDuocLieu/Viewdata"
        },
        {
            "route": "danhmuc_duoclieu/model",
            "$ref": "app/danhmuc/danhmuc_sanpham/DanhMucDuocLieu/ModelView"
        },
        {
            "route": "bophan/collection",
            "$ref": "app/danhmuc/danhmuc_sanpham/BoPhan/CollectionView",
        },
        {
            "route": "bophan/model",
            "$ref": "app/danhmuc/danhmuc_sanpham/BoPhan/ModelView"
        },
        {
            "route": "tieuchuan/collection",
            "$ref": "app/danhmuc/danhmuc_sanpham/TieuChuan/CollectionView",
        },
        {
            "route": "tieuchuan/model",
            "$ref": "app/danhmuc/danhmuc_sanpham/TieuChuan/ModelView"
        },
        {
            "route": "caythuoc/collection",
            "$ref": "app/danhmuc/danhmuc_sanpham/CayThuoc/CollectionView",
        },
        {
            "route": "vungtrong_duoclieu/collection",
            "$ref": "app/danhmuc/danhmuc_sanpham/VungTrongDuocLieu/CollectionView",
        },
        {
            "route": "baithuoc_ydct/collection",
            "$ref": "app/danhmuc/danhmuc_sanpham/BaiThuocYDCT/CollectionView",
        },
        {
            "route": "coso_daotao/collection",
            "$ref": "app/danhmuc/danhmuc_dungchung/CoSoDaoTao/CollectionView",
        },
        {
            "route": "coso_hanhnghe/collection",
            "$ref": "app/quanly_hanhnghe/CoSoHanhNghe/CollectionView",
        },
        {
            "route": "coso_hanhnghe/model",
            "$ref": "app/quanly_hanhnghe/CoSoHanhNghe/ModelView",
        },
        {
            "route": "nguoi_hanhnghe/model",
            "$ref": "app/quanly_hanhnghe/NguoiHanhNghe/ModelView",
        },
        // {
        //     "route": "duoclieu/collection",
        //     "$ref": "app/danhmuc/danhmuc_sanpham/DuocLieu/CollectionView",
        // },
        // {
        //     "route": "duoclieu/model",
        //     "$ref": "app/danhmuc/danhmuc_sanpham/DuocLieu/ModelView",
        // },
        {
            "route": "cuakhau/collection",
            "$ref": "app/danhmuc/danhmuc_sanpham/CuaKhau/CollectionView",
        },
        {
            "route": "cuakhau/model",
            "$ref": "app/danhmuc/danhmuc_sanpham/CuaKhau/ModelView"
        },
        {
            "route": "giaychungnhanco_cuc/collection",
            "$ref": "app/giaychungnhanco/CollectionCuc",
        },
        {
            "route": "giaychungnhanco/collection",
            "$ref": "app/giaychungnhanco/CollectionView",
        },
        {
            "route": "giaychungnhanco/model",
            "$ref": "app/giaychungnhanco/ModelView"
        },
        {
            "route": "lichsu/collection",
            "$ref": "app/lichsu/CollectionView",
        },
        {
            "route": "lichsu/model",
            "$ref": "app/lichsu/ModelView"
        },
        {
            "route": "canbo/DonViYTe/chitiet",
            "$ref": "app/view/quanlyCanbo/DonViYTe/ViewDetail",
        },
        {
            "route": "author/collection",
            "$ref": "app/quanly_tintuc/tacgia/CollectionView"
        },
        {
            "route": "category/collection",
            "$ref": "app/quanly_tintuc/chuyenmuc/CollectionView"
        },
        {
            "collectionName": "post",
            "route": "postadmin/model",
            "$ref": "app/quanly_tintuc/baiviet/ModelView",
        },
        {
            "route": "feature-news/collection",
            "$ref": "app/quanly_tintuc/feature_news/CollectionView",
        },
        {
            "route": "bai-luu-tam/collection",
            "$ref": "app/quanly_tintuc/baiviet/DSBaiViet/CollectionView",
        },
        {
            "route": "bai-cho-bien-tap/collection",
            "$ref": "app/quanly_tintuc/baiviet//DSBaiViet/CollectionView",
        },
        {
            "route": "bai-nhan-bien-tap/collection",
            "$ref": "app/quanly_tintuc/baiviet/DSBaiViet/CollectionView",
        },
        {
            "route": "bai-dang-xu-ly/collection",
            "$ref": "app/quanly_tintuc/baiviet/DSBaiViet/CollectionView",
        },
        {
            "route": "bai-tra-lai-toi/collection",
            "$ref": "app/quanly_tintuc/baiviet/DSBaiViet/CollectionView",
        },
        {
            "route": "bai-bi-go/collection",
            "$ref": "app/quanly_tintuc/baiviet/DSBaiViet/CollectionView",
        },
        {
            "route": "bai-da-tra/collection",
            "$ref": "app/quanly_tintuc/baiviet/DSBaiViet/CollectionView",
        },
        {
            "route": "bai-dang-xuat-ban/collection",
            "$ref": "app/quanly_tintuc/baiviet/BaiDangXuatBan/CollectionView",
        },
        {
            "route": "bai-bi-xoa/collection",
            "$ref": "app/quanly_tintuc/baiviet/DSBaiViet/CollectionView",
        },
    ];

});