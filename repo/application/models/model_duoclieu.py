from sqlalchemy import (
    Column, String, Integer,SmallInteger, BigInteger, DateTime, Date, Boolean, DECIMAL, Text, ForeignKey, UniqueConstraint, JSON, Index, Float
)
from sqlalchemy.orm import relationship, backref
from sqlalchemy.orm.collections import attribute_mapped_collection

from sqlalchemy.orm import *
from application.database import db
from application.database.model import CommonModel
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import or_,and_
import uuid

def default_uuid():
    return str(uuid.uuid4())

class TieuChuanChatLuong(CommonModel):
    __tablename__ = 'tieuchuan_chatluong'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma_tieuchuan = db.Column(String(255), index=True)
    ten_tieuchuan = db.Column(String)
    tenkhongdau = db.Column(String)
    phanloai = db.Column(SmallInteger, default=1, index=True)#1-duoc lieu; 2- sản phẩm
    mota = db.Column(String)
    trangthai = db.Column(SmallInteger, default=1)

class DMCayThuoc(CommonModel):
    __tablename__ = 'danhmuc_caythuoc'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma_caythuoc = db.Column(String(255), index=True)
    ten_caythuoc = db.Column(String)
    ten_khoa_hoc = db.Column(String)
    tenkhongdau = db.Column(String)
    ten_ho = db.Column(String)#thuộc họ nào
    ten_chi = db.Column(String)#thuộc chi nào
    ten_loai = db.Column(String)#thuộc loài nào
    dac_tinh = db.Column(String)
    bophan_sudung = db.Column(String)
    cong_dung = db.Column(String)
    hinh_anh = db.Column(JSONB)
    mota = db.Column(String)
    trangthai = db.Column(SmallInteger, default=1, index=True)

class DMVungTrongDuocLieu(CommonModel):
    __tablename__ = 'vungtrong_duoclieu'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma_vungtrong = db.Column(String(255), index=True)
    ten_vungtrong = db.Column(String)
    mota = db.Column(String)
    tenkhongdau = db.Column(String)
    dac_diem = db.Column(String)
    xaphuong_id = db.Column(String, ForeignKey('xaphuong.id'), nullable=True, index=True)
    xaphuong = db.Column(JSONB()) 
    quanhuyen_id = db.Column(String, ForeignKey('quanhuyen.id'), nullable=True, index=True)
    quanhuyen = db.Column(JSONB()) 
    tinhthanh_id = db.Column(String, ForeignKey('tinhthanh.id'), nullable=True, index=True)
    tinhthanh = db.Column(JSONB()) 
    sonha_tenduong = db.Column(String)
    diachi = db.Column(String)
    trangthai = db.Column(SmallInteger, default=1, index=True)
    def _asdict(self):
        return{
            'id': self.id,
            'ma_vungtrong': self.ma_vungtrong,
            'ten_vungtrong': self.ten_vungtrong,
            'mota': self.mota,
            'tenkhongdau':self.tenkhongdau,
            'dac_diem':self.dac_diem,
            'xaphuong_id':self.xaphuong_id,
            'xaphuong': self.xaphuong,
            'quanhuyen_id': self.quanhuyen_id,
            'quanhuyen':self.quanhuyen,
            'tinhthanh_id': self.tinhthanh_id,
            'tinhthanh': self.tinhthanh,
            'sonha_tenduong': self.sonha_tenduong,
            'diachi':self.diachi,
            'trangthai': self.trangthai
        }

class BaiThuocYDCT(CommonModel):
    __tablename__ = 'baithuoc_ydct'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma_baithuoc = db.Column(String(255), index=True)
    ten_baithuoc = db.Column(String)
    tacgia_ten = db.Column(String)
    tacgia_dienthoai = db.Column(String)
    cong_dung = db.Column(String)
    thanh_phan = db.Column(String)
    hdsd = db.Column(String)
    mota_baithuoc = db.Column(String)
    tenkhongdau = db.Column(String)
    ngay_congbo = db.Column(String)
    nguoi_congbo = db.Column(String)
    tacgia_xaphuong_id = db.Column(String, ForeignKey('xaphuong.id'), nullable=True, index=True)
    tacgia_xaphuong = db.Column(JSONB()) 
    tacgia_quanhuyen_id = db.Column(String, ForeignKey('quanhuyen.id'), nullable=True, index=True)
    tacgia_quanhuyen = db.Column(JSONB()) 
    tacgia_tinhthanh_id = db.Column(String, ForeignKey('tinhthanh.id'), nullable=True, index=True)
    tacgia_sonha_tenduong = db.Column(String)
    tacgia_tinhthanh = db.Column(JSONB()) 
    tacgia_diachi = db.Column(String)
    trangthai = db.Column(SmallInteger, default=1, index=True)
    def _asdict(self):
        return {
            'id': self.id,
            'ma_baithuoc': self.ma_baithuoc,
            'ten_baithuoc': self.ten_baithuoc,
            'tacgia_ten': self.tacgia_ten,
            'tacgia_dienthoai': self.tacgia_dienthoai,
            'cong_dung': self.cong_dung,
            'thanh_phan': self.thanh_phan,
            'hdsd': self.hdsd,
            'mota_baithuoc': self.mota_baithuoc,
            'tenkhongdau': self.tenkhongdau,
            'ngay_congbo': self.ngay_congbo,
            'nguoi_congbo': self.nguoi_congbo,
            'tacgia_xaphuong_id': self.tacgia_xaphuong_id,
            'tacgia_xaphuong': self.tacgia_xaphuong,
            'tacgia_quanhuyen_id': self.tacgia_quanhuyen_id,
            'tacgia_quanhuyen': self.tacgia_quanhuyen,
            'tacgia_tinhthanh_id': self.tacgia_tinhthanh_id,
            'tacgia_sonha_tenduong': self.tacgia_sonha_tenduong,
            'tacgia_tinhthanh': self.tacgia_tinhthanh,
            'tacgia_diachi': self.tacgia_diachi,
            'trangthai': self.trangthai,
        }
class DuocLieuNuoiTrong(CommonModel):
    __tablename__ = "duoclieu_nuoitrong"
    id = db.Column(String, primary_key=True, default=default_uuid)
    id_sanpham = db.Column(String , index = True, nullable=False)
    ma_sanpham = db.Column(String , index = True, nullable=True)
    ten_sanpham = db.Column(String)
    ten_khoa_hoc = db.Column(String)
    tenkhongdau = db.Column(String)
    sanpham = db.Column(JSONB)

    soluong_giong = db.Column(Integer)
    donvi_tinh_soluong_giong = db.Column(SmallInteger)#1-g, 2- kg, 3- ta, 4- tan
    chon_giong_trong_duoc_dien = db.Column(SmallInteger)
    co_xuat_xu = db.Column(SmallInteger)
    mota_nguon_goc = db.Column(String)
    dinhkem_nguon_goc = db.Column(JSONB)
    giong_nhap_khau = db.Column(SmallInteger)
    thuan_hoa_tai_vietnam = db.Column(SmallInteger)
    donvi_cungcap_giong = db.Column(String)
    diachi_donvi_cungcap_giong = db.Column(String)
    giong_lan_tap_chat = db.Column(SmallInteger)
    tyle_tap_chat = db.Column(Float)
    diadiem_nuoitrong = db.Column(JSONB)# chon tu danh sach dia diem cua don vi
    ngay_lam_dat = db.Column(String)
    ngay_uom_giong = db.Column(String)
    ngay_trong_giong = db.Column(String)
    mota_qtrinh_trong = db.Column(String)
    dinhkem_qtrinh_trong = db.Column(JSONB)
    sudung_phan_huuco = db.Column(SmallInteger)
    sudung_phan_voco = db.Column(SmallInteger)
    mota_phan_bon = db.Column(String)
    mota_qtrinh_chamsoc = db.Column(JSONB)#{stt, thoigian,noidung,mota_chitiet, trangthai_ptrien, dinhkem}
    ngay_batdau_thuhoach = db.Column(String)
    thoigian_thuhoach = db.Column(SmallInteger)
    bo_phan_thuhoach = db.Column(String)
    mota_qtrinh_thuhoach = db.Column(String)
    tong_soluong_tho = db.Column(Float)
    donvi_tinh_soluong = db.Column(SmallInteger)#1-g, 2- kg, 3- ta, 4- tan
    mota_qtrinh_so_che = db.Column(String)
    # thoigian_so_che = db.Column(SmallInteger)
    thoigian_nhap_kho = db.Column(String)
    hinhthuc_dong_goi = db.Column(String)
    mota_quy_trinh_dong_goi = db.Column(String)
    soluong_kien_dong_goi = db.Column(SmallInteger)
    danhgia_noibo = db.Column(SmallInteger)#1- dat,2- khong_dat
    mota_danhgia_noibo = db.Column(String)
    dinhkem_danhgia_noibo = db.Column(JSONB)
    dinhkem_chungnhan_kiemnghiem = db.Column(JSONB)
    nhiet_do_kho_bao_quan = db.Column(Float)
    apsuat_kho_bao_quan = db.Column(String)
    tong_soluong_thanhpham = db.Column(Float)
    dientich_kho = db.Column(SmallInteger)#tinh theo don vi m2
    mucdich_sudung = db.Column(SmallInteger)# 1- tu san xuat san pham, 2- phan phoi, 3- vua san xuat, vua phan phoi

    chungnhangacp_id = db.Column(String, ForeignKey('chungnhangacp.id'), index = True)
    chungnhangacp = relationship('ChungNhanGACP', viewonly= True)

    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi', viewonly=True)
    trangthai = db.Column(SmallInteger(), default=1, index=True)#1- tao moi, 2- uom giong, 3- dang nuoi trong, 4- da thu hoach, 5- đã tạo phiếu nhập

class KhaiThacTuNhien(CommonModel):
    __tablename__ = "khaithac_tunhien"
    id = db.Column(String, primary_key=True, default=default_uuid)
    id_sanpham = db.Column(String , index = True, nullable=False)
    ma_sanpham = db.Column(String , index = True, nullable=True)
    ten_sanpham = db.Column(String)
    ten_khoa_hoc = db.Column(String)
    tenkhongdau = db.Column(String)
    sanpham = db.Column(JSONB)

    co_giay_phep = db.Column(SmallInteger)
    dinhkem_giayphep = db.Column(JSONB)
    mota_vitri_diadiem = db.Column(String)
    dientich_khaithac = db.Column(Float)
    donvi_dientich = db.Column(SmallInteger)# 1-m2, 2-hecta(ha), 3- km2
    mota_kehoach_khaithac = db.Column(String)
    dinhkem_kehoach_khaithac = db.Column(JSONB)
    thoigian_batdau_khaithac = db.Column(String)
    tong_thoigian_khaithac = db.Column(SmallInteger)#tinh theo don vi ngay
    bo_phan_khaithac = db.Column(String)
    mota_qtrinh_khaithac = db.Column(JSONB)#{stt, thoigian, soluong, vitri_khaithac, mota_qtrinh, chatluong_sanpham, dinhkem}

    tong_soluong_khaithac_tho = db.Column(SmallInteger)
    donvi_tinh_soluong = db.Column(SmallInteger)#1-g, 2- kg, 3- ta, 4- tan
    mota_qtrinh_so_che = db.Column(String)
    # thoigian_so_che = db.Column(SmallInteger)
    thoigian_nhap_kho = db.Column(String)
    hinhthuc_dong_goi = db.Column(String)
    mota_quy_trinh_dong_goi = db.Column(String)
    soluong_kien_dong_goi = db.Column(SmallInteger)
    danhgia_noibo = db.Column(SmallInteger)#1- dat,2- khong_dat
    mota_danhgia_noibo = db.Column(String)
    dinhkem_danhgia_noibo = db.Column(JSONB)
    dinhkem_chungnhan_kiemnghiem = db.Column(JSONB)
    nhiet_do_kho_bao_quan = db.Column(Float)
    apsuat_kho_bao_quan = db.Column(String)
    tong_soluong_thanhpham = db.Column(Float)
    dientich_kho = db.Column(SmallInteger)#tinh theo don vi m2
    mucdich_sudung = db.Column(SmallInteger)# 1- tu san xuat san pham, 2- phan phoi, 3- vua san xuat, vua phan phoi

    chungnhangacp_id = db.Column(String, ForeignKey('chungnhangacp.id'), index = True)
    chungnhangacp = relationship('ChungNhanGACP', viewonly= True)

    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi', viewonly=True)
    trangthai = db.Column(SmallInteger(), default=1)#1- tao moi, 2- uom giong, 3- dang nuoi trong, 4- da thu hoach, 5 đã tạo phiếu nhập

class ChungNhanGACP(CommonModel):
    __tablename__ = "chungnhangacp"
    #thong tin chung nhan
    id = db.Column(String, primary_key=True, default=default_uuid)
    id_sanpham = db.Column(String , index = True, nullable=False)
    ma_sanpham = db.Column(String , index = True, nullable=False)
    ten_sanpham = db.Column(String)
    ten_khoa_hoc = db.Column(String)
    tenkhongdau = db.Column(String)
    ten_thuong_mai = db.Column(String)
    bophan_sudung = db.Column(String)


    so_giay_chungnhan = db.Column(String, index =  True)
    dientich = db.Column(Float)
    donvi_dientich = db.Column(SmallInteger)
    diadiem = db.Column(String)
    ten_coso = db.Column(String)
    diachi_coso = db.Column(String)
    thoigian_batdau_hieuluc = db.Column(String)
    thoigian_ketthuc_hieuluc = db.Column(String)
    mucdo_tuanthu_gacp = db.Column(SmallInteger)

    loai_nuoitrong_khaithac = db.Column(SmallInteger)#1- nuôi trồng, 2-khai thác
    # nuoitrong_khaithac_id = db.Column(String, index = True)
    # nuoitrong_khaithac = db.Column(JSONB)

    
    #chi tieu danh gia GACP
    #nuôi trồng
    #1
    chon_giong = db.Column(SmallInteger)
    chon_giong_ghichu = db.Column(String)
    #2
    lai_lich_thuc_vat = db.Column(SmallInteger)
    lai_lich_thuc_vat_ghichu = db.Column(String)
    #3
    hat_giong_vatlieu = db.Column(SmallInteger)
    hat_giong_vatlieu_ghichu = db.Column(String)
    #4
    diadiem_trongtrot = db.Column(SmallInteger)
    diadiem_trongtrot_ghichu = db.Column(String)
    #5
    moitruong_sinhthai = db.Column(SmallInteger)
    moitruong_sinhthai_ghichu = db.Column(String)
    #6
    khi_hau = db.Column(SmallInteger)
    khi_hau_ghichu = db.Column(String)
    #7
    tho_nhuong = db.Column(SmallInteger)
    tho_nhuong_ghichu = db.Column(String)
    #8
    phan_bon = db.Column(SmallInteger)
    phan_bon_ghichu = db.Column(String)
    #9
    tuoi_nuoc_thoat_nuoc = db.Column(SmallInteger)
    tuoi_nuoc_thoat_nuoc_ghichu = db.Column(String)
    #10
    chamsoc_baove = db.Column(SmallInteger)
    chamsoc_baove_ghichu = db.Column(String)
    #11
    thu_hoach = db.Column(SmallInteger)
    thu_hoach_ghichu = db.Column(String)

    #khai thác
    #12
    giayphep_khaithac = db.Column(SmallInteger)
    giayphep_khaithac_ghichu = db.Column(String)
    #13
    khong_trong_danhmuc_cam = db.Column(SmallInteger)
    khong_trong_danhmuc_cam_ghichu = db.Column(String)
    #14
    kehoach_khaithac = db.Column(SmallInteger)
    kehoach_khaithac_ghichu = db.Column(String)
    #15
    diadiem_khaithac = db.Column(SmallInteger)
    diadiem_khaithac_ghichu = db.Column(String)
    #16
    kythuat_khaithac_theo_nguyentac = db.Column(SmallInteger)
    kythuat_khaithac_theo_nguyentac_ghichu = db.Column(String)
    #17
    thu_hoach_bao_quan = db.Column(SmallInteger)
    thu_hoach_bao_quan_ghichu = db.Column(String)

    #chế biến sau thu hoạch
    #18
    dientich_kho = db.Column(SmallInteger)
    dientich_kho_ghichu = db.Column(String)
    #19
    khuvuc_xuly = db.Column(SmallInteger)
    khuvuc_xuly_ghichu = db.Column(String)
    #20
    #hồ sơ điều kiện làm khô dược liệu
    hoso_dieukien_lamkho = db.Column(SmallInteger)
    hoso_dieukien_lamkho_ghichu = db.Column(String)
    #21
    kientruc_kho_dambao = db.Column(SmallInteger)
    kientruc_kho_dambao_ghichu = db.Column(String)
    #22
    nhiet_do_do_am_kho = db.Column(SmallInteger)
    nhiet_do_do_am_kho_ghichu = db.Column(String)
    #23
    bao_duong_vesinh_kho = db.Column(SmallInteger)
    bao_duong_vesinh_kho_ghichu = db.Column(String)
    #24
    thietbi_sanxuat = db.Column(SmallInteger)
    thietbi_sanxuat_ghichu = db.Column(String)
    #25
    be_mat_thietbi_tiepxuc = db.Column(SmallInteger)
    be_mat_thietbi_tiepxuc_ghichu = db.Column(String)
    #26
    vatlieu_dungcu_sanxuat = db.Column(SmallInteger)
    vatlieu_dungcu_sanxuat_ghichu = db.Column(String)
    #27
    kiemdinh_thietbi = db.Column(SmallInteger)
    kiemdinh_thietbi_ghichu = db.Column(String)
    #28
    nuoc_rua_duoclieu = db.Column(SmallInteger)
    nuoc_rua_duoclieu_ghichu = db.Column(String)
    #29
    nuoc_chietxuat_duoclieu = db.Column(SmallInteger)
    nuoc_chietxuat_duoclieu_ghichu = db.Column(String)

    #đóng gói, ghi nhãn, bảo quản, vận chuyển
    #30
    phanloai_donggoi = db.Column(SmallInteger)
    phanloai_donggoi_ghichu = db.Column(String)
    #31
    vatdung_baobi_donggoi = db.Column(SmallInteger)
    vatdung_baobi_donggoi_ghichu = db.Column(String)
    #32
    co_the_kho = db.Column(SmallInteger)
    co_the_kho_ghichu = db.Column(String)
    #33
    quycach_donggoi = db.Column(SmallInteger)
    quycach_donggoi_ghichu = db.Column(String)
    #34
    quydinh_ghinhan = db.Column(SmallInteger)
    quydinh_ghinhan_ghichu = db.Column(String)
    #35
    phan_lo_duoclieu = db.Column(SmallInteger)
    phan_lo_duoclieu_ghichu = db.Column(String)
    #36
    khaibao_xuatxu = db.Column(SmallInteger)
    khaibao_xuatxu_ghichu = db.Column(String)
    #37
    phuongtien_vanchuyen = db.Column(SmallInteger)
    phuongtien_vanchuyen_ghichu = db.Column(String)

    #đảm bảo chất lượng
    #38
    thietlap_hethong_quanly_chatluong = db.Column(SmallInteger)
    thietlap_hethong_quanly_chatluong_ghichu = db.Column(String)
    #39
    sop_quydinh_phancong_kiemtra_chatluong = db.Column(SmallInteger)
    sop_quydinh_phancong_kiemtra_chatluong_ghichu = db.Column(String)

    #yeucau_chatluong_baogom = db.Column(SmallInteger)
    #40-41
    yeucau_chatluong_nguyenlieu = db.Column(SmallInteger)
    yeucau_chatluong_nguyenlieu_ghichu = db.Column(String)
    #42
    yeucau_chatluong_sanpham_trung_gian = db.Column(SmallInteger)
    yeucau_chatluong_sanpham_trung_gian_ghichu = db.Column(String)
    #43
    yeucau_chatluong_thanhpham_dong_goi = db.Column(SmallInteger)
    yeucau_chatluong_thanhpham_dong_goi_ghichu = db.Column(String)
    #44
    phuhop_tieuchuan_duocdien = db.Column(SmallInteger)
    phuhop_tieuchuan_duocdien_ghichu = db.Column(String)
    #45
    co_thietbi_hoso_theodoi_kho = db.Column(SmallInteger)
    co_thietbi_hoso_theodoi_kho_ghichu = db.Column(String)
    #46
    gioihan_hoachat_trong_duoclieu = db.Column(SmallInteger)
    gioihan_hoachat_trong_duoclieu_ghichu = db.Column(String)
    #47
    co_hoso_donggoi = db.Column(SmallInteger)
    co_hoso_donggoi_ghichu = db.Column(String)

    hoso_donggoi_kiemtra_nguyenlieu = db.Column(SmallInteger)
    hoso_donggoi_kiemtra_nguyenlieu_ghichu = db.Column(String)

    hoso_donggoi_thu_nghiem_thuoc_tru_sau = db.Column(SmallInteger)
    hoso_donggoi_thu_nghiem_thuoc_tru_sau_ghichu = db.Column(String)

    hoso_donggoi_lo_sanpham = db.Column(SmallInteger)
    hoso_donggoi_lo_sanpham_ghichu = db.Column(String)
    #48
    hoso_sanpham_chitiet  = db.Column(SmallInteger)
    hoso_sanpham_chitiet_ghichu = db.Column(String)

    #các vấn đề khác
    #49
    daotao_antoan_laodong = db.Column(SmallInteger)
    daotao_antoan_laodong_ghichu = db.Column(String)
    #50
    quydinh_antoan_laodong = db.Column(SmallInteger)
    quydinh_antoan_laodong_ghichu = db.Column(String)
    #51
    hethong_phongchay_chuachay = db.Column(SmallInteger)
    hethong_phongchay_chuachay_ghichu = db.Column(String)

    #kiểm tra nội bộ
    #52
    chuongtrinh_kiemtra_noibo = db.Column(SmallInteger)
    chuongtrinh_kiemtra_noibo_ghichu = db.Column(String)
    #53
    luu_bienban_kiemtra_noibo = db.Column(SmallInteger)
    luu_bienban_kiemtra_noibo_ghichu = db.Column(String)
    #54
    khacphuc_khiem_khuyet = db.Column(SmallInteger)
    khacphuc_khiem_khuyet_ghichu = db.Column(String)

    trangthai = db.Column(SmallInteger, default = 1)#1 tạo mới, 2 xác nhận chờ duyệt, 3- đã được duyệt
    nguoi_duyet_id = db.Column(String, index = True)
    nguoi_duyet_ten = db.Column(String)
    thoigian_duyet = db.Column(String)



    thoigian_guiduyet = db.Column(String)
    dinhkem_chungnhan = db.Column(JSONB)
    
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi', viewonly=True)

