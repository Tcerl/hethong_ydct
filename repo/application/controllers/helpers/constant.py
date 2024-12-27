from application.models.model_danhmuc import DanhMucCuaKhau, DanhMucDonViSanXuatNhapKhau, DanhMucCungUngNuocNgoai
from application.models.model_duoclieu import TieuChuanChatLuong, DMCayThuoc, DMVungTrongDuocLieu

list_export_excel = {
    "danhmuc_cuakhau": {
        "model": DanhMucCuaKhau,
        "fields": {
            "ma_cuakhau": "Mã cửa khẩu",
            "ten_cuakhau": "Tên cửa khẩu",
            "phanloai": "Phân loại",
            "diachi": "Địa chỉ"
        }
    },
    "danhmuc_donvisanxuat_nhapkhau" : {
        "model": DanhMucDonViSanXuatNhapKhau,
        "fields": {
            "ten_donvi": "Tên đơn vị",
            "ma_donvi": "Mã đơn vị",
            "diachi": "Địa chỉ",
            "quocgia": "Quốc gia"
        }
    },
    "danhmuc_cungung_nuoc_ngoai" : {
        "model": DanhMucCungUngNuocNgoai,
        "fields": {
            "ten_donvi": "Tên đơn vị",
            "ma_donvi": "Mã đơn vị",
            "diachi": "Địa chỉ",
            "quocgia": "Quốc gia"
        }
    },
    "tieuchuan_chatluong" : {
        "model": TieuChuanChatLuong,
        "fields": {
            "ma_tieuchuan": "Mã tiêu chuẩn",
            "ten_tieuchuan": "Tên tiêu chuẩn",
            "phanloai": "Phân loại", #1-duoc lieu; 2- sản phẩm
            "mota": "Mô tả"
        }
    }
}
