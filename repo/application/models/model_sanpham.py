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


class DanhMucNhomSanPham(CommonModel):
    __tablename__ = "danhmuc_nhom_sanpham"
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma_nhom = db.Column(String , index = True, nullable = False)
    ten_nhom = db.Column(String)
    tenkhongdau = db.Column(String)
    mota = db.Column(String)
    trangthai = db.Column(SmallInteger, default=1)

class NhomSanPhamDonVi(CommonModel):
    __tablename__ = "donvi_nhom_sanpham"
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma_nhom = db.Column(String , index = True, nullable = False)
    ten_nhom = db.Column(String)
    tenkhongdau = db.Column(String)
    mota = db.Column(String)
    thoigian_dongbo = db.Column(String)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi')
    trangthai = db.Column(SmallInteger, default=1)

# DanhMucSanPham - lưu sản phẩm của tuyến đơn vị TMĐT
class DanhMucSanPham(CommonModel):
    __tablename__ = "danhmuc_sanpham"
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma_sanpham = db.Column(String(), index=True,nullable =True)
    ma_bhxh = db.Column(String(), nullable=True)
    ma_boyte = db.Column(String(), nullable=True)
    ma_sanxuat = db.Column(String(), nullable=True)
    id_sanpham = db.Column(String(),nullable = True)
    ten_sanpham = db.Column(String())
    ten_khoa_hoc = db.Column(String())
    ten_trung_quoc = db.Column(String())
    tenkhongdau = db.Column(String())
    id_nhacungcap = db.Column(String())
    ma_nhacungcap = db.Column(String())
    ten_nhacungcap = db.Column(String())
    id_nhasanxuat = db.Column(String())
    ma_nhasanxuat = db.Column(String())
    ten_nhasanxuat = db.Column(String())
    ma_nhom = db.Column(String())
    ten_nhom = db.Column(String())
    mota = db.Column(String)
    hang_sanxuat = db.Column(String())
    ma_hang_sanxuat = db.Column(String())
    nuoc_sanxuat = db.Column(String())
    ma_nuoc_sanxuat = db.Column(String())
    loai_sanpham = db.Column(String())
    donvitinh = db.Column(String)
    bophan_sudung = db.Column(String)
    ma_hanghoa = db.Column(String)
    ma_viettat = db.Column(String)
    ma_danhmuc = db.Column(String)
    thuoc_ho = db.Column(String)
    vi_phau = db.Column(String)
    bot = db.Column(String)
    dinh_tinh = db.Column(String)
    do_am = db.Column(String)
    tro_toanphan = db.Column(String)
    tro_khongtan_trongacid = db.Column(String)
    chiso_acid = db.Column(String)
    chiso_carbonyl = db.Column(String)
    chiso_peroxyd = db.Column(String)
    tyle_vun_nat = db.Column(String)
    tap_chat = db.Column(String)
    kimloainang = db.Column(String)
    chat_chiet_trong_sanpham = db.Column(String)
    dinh_luong = db.Column(String)
    che_bien = db.Column(String)
    bao_che = db.Column(String)
    bao_quan = db.Column(String)
    tinh_vi_quy_kinh = db.Column(String)
    congnang_chutri = db.Column(String)
    cachdung_lieuluong = db.Column(String)
    kieng_ky = db.Column(String)
    chungtu_dinhkem = db.Column(JSONB)
    thumbnail = db.Column(JSONB)
    hinhanh= db.Column(JSONB)

    trangthai = db.Column(SmallInteger, default=1)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi')

Index('danhmuc_sanpham_uq_ma_sanpham_donvi', DanhMucSanPham.ma_sanpham, DanhMucSanPham.donvi_id, unique=True, postgresql_where=(and_(DanhMucSanPham.ma_sanpham.isnot(None),DanhMucSanPham.ma_sanpham != '')))

class DanhMucDuocLieu(CommonModel):
    __tablename__ = "danhmuc_duoclieu"
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma_sanpham = db.Column(String())
    ma_bhxh = db.Column(String(), index=True, nullable=True)
    ma_boyte = db.Column(String(), index=True, nullable=True)
    ma_sanxuat = db.Column(String(), index=True, nullable=True)

    ten_sanpham = db.Column(String())
    ten_khoa_hoc = db.Column(String())
    ten_trung_quoc = db.Column(String())
    tenkhongdau = db.Column(String())
    ma_nhom = db.Column(String())
    ten_nhom = db.Column(String())
    ma_bophan = db.Column(String())
    ten_bophan = db.Column(String())
    mota = db.Column(String)
    hang_sanxuat = db.Column(String())
    ma_hang_sanxuat = db.Column(String())
    nuoc_sanxuat = db.Column(String())
    ma_nuoc_sanxuat = db.Column(String())
    loai_sanpham = db.Column(String())
    donvitinh = db.Column(String)
    bophan_sudung = db.Column(String)
    ma_hanghoa = db.Column(String)
    ma_viettat = db.Column(String)
    ma_danhmuc = db.Column(String)
    thuoc_ho = db.Column(String)
    vi_phau = db.Column(String)
    bot = db.Column(String)
    dinh_tinh = db.Column(String)
    do_am = db.Column(String)
    tro_toanphan = db.Column(String)
    tro_khongtan_trongacid = db.Column(String)
    chiso_acid = db.Column(String)
    chiso_carbonyl = db.Column(String)
    chiso_peroxyd = db.Column(String)
    tyle_vun_nat = db.Column(String)
    tap_chat = db.Column(String)
    kimloainang = db.Column(String)
    chat_chiet_trong_sanpham = db.Column(String)
    dinh_luong = db.Column(String)
    che_bien = db.Column(String)
    bao_che = db.Column(String)
    bao_quan = db.Column(String)
    tinh_vi_quy_kinh = db.Column(String)
    congnang_chutri = db.Column(String)
    cachdung_lieuluong = db.Column(String)
    kieng_ky = db.Column(String)
    chungtu_dinhkem = db.Column(JSONB)
    thumbnail = db.Column(JSONB)
    hinhanh= db.Column(JSONB)

    trangthai = db.Column(SmallInteger, default=1)

class DanhMucBoPhanSanPham(CommonModel):
    __tablename__ = "danhmuc_bophan_sanpham"
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma_bophan = db.Column(String , index = True, nullable = False)
    ten_bophan = db.Column(String)
    tenkhongdau = db.Column(String)
    mota = db.Column(String)
    congdung = db.Column(String)
    ghichu = db.Column(String)
    trangthai = db.Column(SmallInteger, default=1)



#change model
#id_chungnhan_cq  ==> phieu_kiem_nghiem_id;

class LichSuSanPham(CommonModel):
    __tablename__ = "lichsu_sanpham"
    id = db.Column(String, primary_key=True, default=default_uuid)
    #thông tin sản phẩm
    id_sanpham_danhmuc = db.Column(String , index = True, nullable = False)
    ten_sanpham = db.Column(String)
    so_lo = db.Column(String , index = True, nullable = False)
    donvi_id = db.Column(String, index = True, nullable = True)#id don vi hien tai
    hansudung = db.Column(String , index = True, nullable = True)

    #co cq sản phẩm
    id_chungnhan_co = db.Column(String , index = True, nullable = True)
    # chungnhan_co = db.Column(JSONB)#tam thời bỏ json
    phieu_kiem_nghiem_id = db.Column(String , index = True, nullable = True)
    # chungnhan_cq = db.Column(JSONB)tạm thời bỏ json

    #lấy thông tin từ CO
    donvi_sanxuat = db.Column(String , nullable = True)
    donvi_cungung_bandau = db.Column(String , nullable = True)
    id_donvi_cungung_bandau = db.Column(String , nullable = True)
    id_giaynhapkhau = db.Column(String , index = True, nullable = True)

    #loại hoạt động sản xuất sản phẩm ban đầu
    #một số lô, id_sanpham chỉ có một loại hoạt động ban đầu
    loai_sanpham_bandau = db.Column(SmallInteger)#1- nhập khẩu, 2- phân phối trong nước , 3- thu gom, 4- nuôi trồng, 5- khai thác

    #Tên đơn vị nhập khẩu, thu gom
    donvi_nhapkhau_phanphoi_thugom = db.Column(String)

    #thông tin nuôi trồng, khai thác
    thuhoach_nuoitrong_id = db.Column(String)
    thuhoach_khaithac_id = db.Column(String)

    thoigian_nhapkhau_thugom = db.Column(String)

    #lịch sử nhập xuất của đơn vị
    lichsu = db.Column(JSONB)#{id_phieu, thoigian, donvi_cungung, donvi_tiepnhan, loai_giaodich}
    trangthai = db.Column(SmallInteger, default=1)

class SanPhamDonVi(CommonModel):
    __tablename__ = "sanpham_donvi"
    id = db.Column(String, primary_key=True, default=default_uuid)
    id_sanpham = db.Column(String(), index = True, nullable = False)

    ma_sanpham = db.Column(String())
    ma_bhxh = db.Column(String(), index=True, nullable=True)
    ma_boyte = db.Column(String(), index=True, nullable=True)
    ma_sanxuat = db.Column(String(), index=True, nullable=True)

    ten_sanpham = db.Column(String())
    ten_khoa_hoc = db.Column(String())
    ten_trung_quoc = db.Column(String())
    tenkhongdau = db.Column(String())
    ten_thuong_mai = db.Column(String)
    ma_sanpham_donvi = db.Column(String)

    ma_nhom = db.Column(String())
    ten_nhom = db.Column(String())
    mota = db.Column(String)
    hang_sanxuat = db.Column(String())
    ma_hang_sanxuat = db.Column(String())
    nuoc_sanxuat = db.Column(String())
    ma_nuoc_sanxuat = db.Column(String())
    loai_sanpham = db.Column(String())
    donvitinh = db.Column(String)
    bophan_sudung = db.Column(String)
    ma_hanghoa = db.Column(String)
    ma_viettat = db.Column(String)
    ma_danhmuc = db.Column(String)
    thuoc_ho = db.Column(String)
    vi_phau = db.Column(String)
    bot = db.Column(String)
    dinh_tinh = db.Column(String)
    do_am = db.Column(String)
    tro_toanphan = db.Column(String)
    tro_khongtan_trongacid = db.Column(String)
    chiso_acid = db.Column(String)
    chiso_carbonyl = db.Column(String)
    chiso_peroxyd = db.Column(String)
    tyle_vun_nat = db.Column(String)
    tap_chat = db.Column(String)
    kimloainang = db.Column(String)
    chat_chiet_trong_sanpham = db.Column(String)
    dinh_luong = db.Column(String)
    che_bien = db.Column(String)
    bao_che = db.Column(String)
    bao_quan = db.Column(String)
    tinh_vi_quy_kinh = db.Column(String)
    congnang_chutri = db.Column(String)
    cachdung_lieuluong = db.Column(String)
    kieng_ky = db.Column(String)
    chungtu_dinhkem = db.Column(JSONB)
    thumbnail = db.Column(JSONB)
    hinhanh= db.Column(JSONB)

    donvi_cungung_ma = db.Column(String, index = True)
    donvi_cungung_ten = db.Column(String)
    thoigian_dongbo = db.Column(String)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi', viewonly=True)
    trangthai = db.Column(SmallInteger, default=1)

class DuocLieuDonVi(CommonModel):
    __tablename__ = "duoclieu_donvi"
    id = db.Column(String, primary_key=True, default=default_uuid)
    id_sanpham = db.Column(String(), index = True, nullable = False)

    ma_sanpham = db.Column(String())
    ma_bhxh = db.Column(String(), index=True, nullable=True)
    ma_boyte = db.Column(String(), index=True, nullable=True)
    ma_sanxuat = db.Column(String(), index=True, nullable=True)

    ten_sanpham = db.Column(String())
    ten_khoa_hoc = db.Column(String())
    ten_trung_quoc = db.Column(String())
    tenkhongdau = db.Column(String())
    ten_thuong_mai = db.Column(String)
    ma_sanpham_donvi = db.Column(String)

    ma_nhom = db.Column(String())
    ten_nhom = db.Column(String())
    mota = db.Column(String)
    hang_sanxuat = db.Column(String())
    ma_hang_sanxuat = db.Column(String())
    nuoc_sanxuat = db.Column(String())
    ma_nuoc_sanxuat = db.Column(String())
    loai_sanpham = db.Column(String())
    donvitinh = db.Column(String)
    bophan_sudung = db.Column(String)
    ma_hanghoa = db.Column(String)
    ma_viettat = db.Column(String)
    ma_danhmuc = db.Column(String)
    thuoc_ho = db.Column(String)
    vi_phau = db.Column(String)
    bot = db.Column(String)
    dinh_tinh = db.Column(String)
    do_am = db.Column(String)
    tro_toanphan = db.Column(String)
    tro_khongtan_trongacid = db.Column(String)
    chiso_acid = db.Column(String)
    chiso_carbonyl = db.Column(String)
    chiso_peroxyd = db.Column(String)
    tyle_vun_nat = db.Column(String)
    tap_chat = db.Column(String)
    kimloainang = db.Column(String)
    chat_chiet_trong_sanpham = db.Column(String)
    dinh_luong = db.Column(String)
    che_bien = db.Column(String)
    bao_che = db.Column(String)
    bao_quan = db.Column(String)
    tinh_vi_quy_kinh = db.Column(String)
    congnang_chutri = db.Column(String)
    cachdung_lieuluong = db.Column(String)
    kieng_ky = db.Column(String)
    chungtu_dinhkem = db.Column(JSONB)
    thumbnail = db.Column(JSONB)
    hinhanh= db.Column(JSONB)

    donvi_cungung_ma = db.Column(String, index = True)
    donvi_cungung_ten = db.Column(String)
    thoigian_dongbo = db.Column(String)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi', viewonly=True)
    trangthai = db.Column(SmallInteger, default=1)


class DonViCungUng(CommonModel):
    __tablename__ = "donvi_cungung"
    id = db.Column(String, primary_key=True, default=default_uuid)
    ten_donvi = db.Column(String, nullable=False)
    tenkhongdau = db.Column(String)
    ma_donvi = db.Column(String, index=True, nullable=False)
    ngay_capphep = db.Column(String)
    dienthoai = db.Column(String)
    email = db.Column(String)
    nguoilienlac_ten = db.Column(String)
    nguoilienlac_dienthoai = db.Column(String())
    xaphuong_id = db.Column(String, ForeignKey('xaphuong.id'), nullable=True, index=True)
    xaphuong = db.Column(JSONB()) 
    quanhuyen_id = db.Column(String, ForeignKey('quanhuyen.id'), nullable=True, index=True)
    quanhuyen = db.Column(JSONB()) 
    tinhthanh_id = db.Column(String, ForeignKey('tinhthanh.id'), nullable=True, index=True)
    tinhthanh = db.Column(JSONB()) 
    quocgia_id = db.Column(String, ForeignKey('quocgia.id'), nullable=True, index=True)
    quocgia = db.Column(JSONB()) 
    sonha_tenduong = db.Column(String)
    diachi = db.Column(String)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi')
    trangthai = db.Column(SmallInteger(), default=1) # 1 - đang hoạt động, 0 - ngừng hoạt động
    danhmuc_nhacungcap_id = db.Column(String, ForeignKey('danhmuc_nhacungcap.id'),nullable = True, index=True)
    danhmuc_nhacungcap = db.Column(JSONB()) 

Index('donvi_cungung_uq_ma_donvi', DonViCungUng.ma_donvi, DonViCungUng.donvi_id, unique=True, postgresql_where=(and_(DonViCungUng.ma_donvi.isnot(None),DonViCungUng.ma_donvi != '')))

class NhaSanXuatDonVi(CommonModel):
    __tablename__ = "nhasanxuat_donvi"
    id = db.Column(String, primary_key=True, default=default_uuid)
    ten = db.Column(String, nullable=False)
    tenkhongdau = db.Column(String)
    ma = db.Column(String, index=True, nullable=False)
    ngay_capphep = db.Column(String)
    dienthoai = db.Column(String)
    email = db.Column(String)
    nguoilienlac_ten = db.Column(String)
    nguoilienlac_dienthoai = db.Column(String())
    xaphuong_id = db.Column(String, ForeignKey('xaphuong.id'), nullable=True, index=True)
    xaphuong = db.Column(JSONB()) 
    quanhuyen_id = db.Column(String, ForeignKey('quanhuyen.id'), nullable=True, index=True)
    quanhuyen = db.Column(JSONB()) 
    tinhthanh_id = db.Column(String, ForeignKey('tinhthanh.id'), nullable=True, index=True)
    tinhthanh = db.Column(JSONB()) 
    quocgia_id = db.Column(String, ForeignKey('quocgia.id'), nullable=True, index=True)
    quocgia = db.Column(JSONB()) 
    sonha_tenduong = db.Column(String)
    diachi = db.Column(String)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi')
    trangthai = db.Column(SmallInteger(), default=1) # 1 - đang hoạt động, 0 - ngừng hoạt động
    nhasanxuat_id = db.Column(String, ForeignKey('nhasanxuat.id'),nullable = True, index=True)
    nhasanxuat = db.Column(JSONB()) 

Index('nhasanxuat_uq_ma_donvi', NhaSanXuatDonVi.ma, NhaSanXuatDonVi.donvi_id, unique=True, postgresql_where=(and_(NhaSanXuatDonVi.ma.isnot(None),NhaSanXuatDonVi.ma != '')))
# chọn sản phẩm từ DanhMucSanPham (chọn từ sản phẩm của đơn vị sàn TMĐT) 
class SanPhamGACPDonVi(CommonModel):
    __tablename__ = "sanpham_gacp_donvi"
    id = db.Column(String, primary_key=True, default=default_uuid)
    id_sanpham = db.Column(String(), index = True, nullable = False)
    ma_sanpham = db.Column(String(), index=True)
    ten_sanpham = db.Column(String())
    ten_khoa_hoc = db.Column(String())
    tenkhongdau = db.Column(String())
    ten_thuong_mai = db.Column(String)
    ma_sanpham_donvi = db.Column(String)
    donvi_cungung_id = db.Column(String, index = True)
    donvi_cungung_ma = db.Column(String, index = True)
    donvi_cungung_ten = db.Column(String)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi', viewonly=True)
    thoigian_dongbo = db.Column(String)
    trangthai = db.Column(SmallInteger, default=1)
    
class SanPhamNhapKhauDonVi(CommonModel):
    __tablename__ = "sanpham_nhapkhau_donvi"
    id = db.Column(String, primary_key=True, default=default_uuid)
    id_sanpham = db.Column(String(), index = True, nullable = False)
    ma_sanpham = db.Column(String(), nullable=False)
    ten_sanpham = db.Column(String())
    ten_khoa_hoc = db.Column(String())
    tenkhongdau = db.Column(String())
    ten_thuong_mai = db.Column(String)
    ma_sanpham_donvi = db.Column(String)
    quocgia_id = db.Column(String)
    quocgia = db.Column(JSONB)
    donvi_cungung_id = db.Column(String, index = True)
    donvi_cungung_ma = db.Column(String, index = True)
    donvi_cungung_ten = db.Column(String)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi', viewonly=True)
    thoigian_dongbo = db.Column(String)
    trangthai = db.Column(SmallInteger, default=1)

Index('sanpham_nhapkhau_uq_donvi_ma_sanpham', SanPhamNhapKhauDonVi.donvi_id, SanPhamNhapKhauDonVi.ma_sanpham, SanPhamNhapKhauDonVi.deleted, unique=True, postgresql_where=(and_(SanPhamNhapKhauDonVi.deleted == False)))

class SanPhamNoiBatDonVi(CommonModel):
    __tablename__ = "sanpham_noibat_donvi"
    id = db.Column(String, primary_key=True, default=default_uuid)
    id_sanpham = db.Column(String(), index = True, nullable = False)
    ma_sanpham = db.Column(String(), nullable=False)
    ten_sanpham = db.Column(String())
    ten_khoa_hoc = db.Column(String())
    tenkhongdau = db.Column(String())
    ten_thuong_mai = db.Column(String)
    ma_sanpham_donvi = db.Column(String)
    donvi_cungung_id = db.Column(String, index = True)
    donvi_cungung_ma = db.Column(String, index = True)
    donvi_cungung_ten = db.Column(String)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi', viewonly=True)
    thoigian_dongbo = db.Column(String)
    trangthai = db.Column(SmallInteger, default=1)

Index('sanpham_noibat_uq_donvi_ma_sanpham', SanPhamNoiBatDonVi.donvi_id, SanPhamNoiBatDonVi.ma_sanpham, SanPhamNoiBatDonVi.deleted, unique=True, postgresql_where=(and_(SanPhamNoiBatDonVi.deleted == False)))

class SanPhamViPhamDonVi(CommonModel):
    __tablename__ = "sanpham_vipham_donvi"
    id = db.Column(String, primary_key=True, default=default_uuid)
    id_sanpham = db.Column(String, index = True, nullable = False)
    ma_sanpham = db.Column(String, index=True)
    ten_sanpham = db.Column(String, index=True)
    tenkhongdau_sanpham = db.Column(String)
    thongtin_sanpham = db.Column(JSONB())
    id_nhacungcap = db.Column(String, index=True)
    ma_nhacungcap = db.Column(String, index=True)
    ten_nhacungcap = db.Column(String, index=True)
    tenkhongdau_nhacungcap = db.Column(String)
    thongtin_nhacungcap = db.Column(JSONB())
    soquyetdinh = db.Column(String)
    noidung_vipham = db.Column(String)
    thoigian_vipham = db.Column(String)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi', viewonly=True)

Index('sanpham_vipham_uq_donvi_ma_sanpham', SanPhamViPhamDonVi.donvi_id, SanPhamViPhamDonVi.id_sanpham,SanPhamViPhamDonVi.id_nhacungcap, unique=True, postgresql_where=(and_(SanPhamViPhamDonVi.deleted == False)))


class KetQuaTrungThau(CommonModel):
    __tablename__ = "ketqua_trungthau"
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma_goi_thau = db.Column(String)
    ten_goi_thau = db.Column(String)
    loai_goi_thau = db.Column(String)#generic1-5, dong y 1-3
    thuoc_goi_thau = db.Column(String)
    thoigian_trungthau = db.Column(String)
    thoigian_batdau = db.Column(String)
    thoigian_ketthuc = db.Column(String)
    nam_ke_hoach = db.Column(SmallInteger)
    mota = db.Column(String)
    ghichu = db.Column(String)
    # donvi_cungung = db.Column(JSONB)
    # donvi_cungung_id = db.Column(JSONB)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi', viewonly=True)
    tenkhongdau = db.Column(String)
    chitiet_sanpham = relationship("KetQuaTrungThauChiTiet", order_by="KetQuaTrungThauChiTiet.thoigian_trungthau", cascade="all, delete-orphan")
    ten_nguoi_lap_phieu = db.Column(String)
    ma_nguoi_lap_phieu = db.Column(String)
    trangthai = db.Column(SmallInteger(), default=1)

class KetQuaTrungThauChiTiet(CommonModel):
    __tablename__ = "ketqua_trungthau_chitiet"
    id = db.Column(String, primary_key=True, default=default_uuid)
    ketqua_trungthau_id = db.Column(String, ForeignKey('ketqua_trungthau.id', ondelete='SET NULL'), nullable=True, index=True)
    ketqua_trungthau = relationship('KetQuaTrungThau', viewonly=True) 
    ma_goi_thau = db.Column(String)
    ten_goi_thau = db.Column(String)
    loai_goi_thau = db.Column(String)#generic1-5, dong y 1-3
    thuoc_goi_thau = db.Column(String)
    thoigian_trungthau = db.Column(String)
    thoigian_batdau = db.Column(String)
    thoigian_ketthuc = db.Column(String)
    nam_ke_hoach = db.Column(SmallInteger)

    id_sanpham = db.Column(String(), index=True)#la id item vat tu trong danh muc
    ma_sanpham = db.Column(String(), index=True)
    loai_sanpham = db.Column(String(), index=True)
    ten_sanpham = db.Column(String())
    ten_khoa_hoc = db.Column(String())
    sanpham = db.Column(JSONB)
    dongia = db.Column(Float, default = 0)
    donvi_cungung_ma = db.Column(String, index=True)
    donvi_cungung_ten = db.Column(String)
    donvi_cungung = db.Column(JSONB)
    donvitinh = db.Column(String)
    so_luong_thucte = db.Column(Float)
    so_luong_ke_hoach = db.Column(Float)
    so_luong_con_lai = db.Column(Float)
    ghichu = db.Column(String)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi', viewonly=True)


#change model
#chungnhan_cq_id ==> phieu_kiem_nghiem_id;
#so_chungnhan_cq ==> ma_kiem_nghiem

class KhoSanPham(CommonModel):
    __tablename__ = "kho_sanpham_hanghoa"
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma_kho = db.Column(String(), index=True, nullable=False)
    ten_kho = db.Column(String())
    kho = db.Column(JSONB)
    id_sanpham = db.Column(String(), index=True, nullable=False)
    ma_sanpham = db.Column(String(), index=True)
    ten_sanpham = db.Column(String())
    tenkhongdau = db.Column(String())
    sanpham = db.Column(JSONB)
    so_lo = db.Column(String, index=True)
    loai_sanpham = db.Column(String())
    soluong = db.Column(Float)
    dongia_ban = db.Column(Float)
    dongia_nhap = db.Column(Float)
    donvitinh = db.Column(String)
    hansudung = db.Column(String())
    ma_kiem_nghiem = db.Column(String(), index = True)
    phieu_kiem_nghiem_id = db.Column(String(), index = True)
    so_co = db.Column(String(), index= True)
    chungnhan_co_id = db.Column(String(), index = True)
    # loai_phieu_nhap = db.Column(SmallInteger, index = True)# 1 là thu gom, 2 là nhập từ đơn vị cung ứng, 3 là nhập khẩu
    nguon_cungcap = db.Column(SmallInteger)#1 nhap khau, 2- mua lai tu nha phan phoi trong nuoc, 3- thu mua tu dan
    danhsach_phieunhap = db.Column(JSONB) #{id_phieunhap_chitiet, soluong, soluong_conlai, thoigiannhap}
    
    ten_goi_thau = db.Column(String)
    ma_goi_thau = db.Column(String)
    ma_don_vi_trung_thau = db.Column(String)
    ten_don_vi_trung_thau = db.Column(String)
    thoi_gian_dau_thau = db.Column(String())
    hang_sanxuat = db.Column(String())
    nuoc_sanxuat = db.Column(String())
    nguon_kinh_phi = db.Column(SmallInteger)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi', viewonly=True)
    trangthai = db.Column(SmallInteger(), default=1)

