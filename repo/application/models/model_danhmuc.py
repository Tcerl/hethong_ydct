from sqlalchemy import (
    Column, String, Integer,BigInteger,SmallInteger, DateTime, Date, Boolean, DECIMAL, Text, Index, ForeignKey, UniqueConstraint, Float, JSON
)
from sqlalchemy.orm import *
from sqlalchemy import or_,and_

from sqlalchemy.dialects.postgresql import UUID, JSONB
from application.database import db
from application.database.model import CommonModel
import uuid


def default_uuid():
    return str(uuid.uuid4())
    
    
class QuocGia(CommonModel):
    __tablename__ = 'quocgia'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String(255))
    tenkhongdau = db.Column(String)
    ten_tieng_anh = db.Column(String)
    thu_tu = db.Column(SmallInteger)
    trangthai = db.Column(SmallInteger, default=1)

class TinhThanh(CommonModel):
    __tablename__ = 'tinhthanh'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String(255))
    tenkhongdau = db.Column(String)
    ten_tieng_anh = db.Column(String)
    loai = db.Column(SmallInteger)#thanh pho truc thuoc trung uong,..
    
    quocgia_id = db.Column(String, ForeignKey('quocgia.id'), nullable=True, index=True)
    quocgia = relationship('QuocGia', viewonly=True)
    trangthai = db.Column(SmallInteger, default=1)

class QuanHuyen(CommonModel):
    __tablename__ = 'quanhuyen'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String(255))
    tenkhongdau = db.Column(String)
    ten_tieng_anh = db.Column(String)
    loai = db.Column(SmallInteger)
    
    tinhthanh_id = db.Column(String, ForeignKey('tinhthanh.id'), nullable=True, index=True)
    tinhthanh = relationship('TinhThanh', viewonly=True)
    # xaphuong = db.relationship("XaPhuong", order_by="XaPhuong.id")
    trangthai = db.Column(SmallInteger, default=1)
    
class XaPhuong(CommonModel):
    __tablename__ = 'xaphuong'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String(255))
    tenkhongdau = db.Column(String)
    ten_tieng_anh = db.Column(String)
    loai = db.Column(SmallInteger)#cấp thị trấn, xã
    
    quanhuyen_id = db.Column(String, ForeignKey('quanhuyen.id'), nullable=True, index=True)
    quanhuyen = relationship('QuanHuyen', viewonly=True)  
    trangthai = db.Column(SmallInteger, default=1)
    
class ThonXom(CommonModel):
    __tablename__ = 'thonxom'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String(255))
    ten_tieng_anh = db.Column(String)
    tenkhongdau = db.Column(String)
    xaphuong_id = db.Column(String, ForeignKey('xaphuong.id'), nullable=True, index=True)
    xaphuong = relationship('XaPhuong', viewonly=True) 
    trangthai = db.Column(SmallInteger, default=1)

class TuyenDonVi(CommonModel):
    __tablename__ = 'tuyendonvi'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String(255))
    mota = db.Column(String(255))
    tenkhongdau = db.Column(String)
    trangthai = db.Column(SmallInteger, default=1) 
    
class DanToc(CommonModel):
    __tablename__ = 'dantoc'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String)
    tenkhongdau = db.Column(String)
    trangthai = db.Column(SmallInteger, default=1)

class NgheNghiep(CommonModel):
    __tablename__ = 'nghenghiep'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String)
    tenkhongdau = db.Column(String)
    mota = db.Column(String)
    trangthai = db.Column(SmallInteger, default=1)

class TrinhDoChuyenMon(CommonModel):
    __tablename__ = 'trinhdo_chuyenmon'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String)
    tenkhongdau = db.Column(String)
    phanloai = db.Column(String)
    mota = db.Column(String)
    trangthai = db.Column(SmallInteger, default=1)

class TrinhDoHocVan(CommonModel):
    __tablename__ = 'trinhdo_hocvan'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String)
    tenkhongdau = db.Column(String)
    phanloai = db.Column(String)
    mota = db.Column(String)
    trangthai = db.Column(SmallInteger, default=1)



    

class DanhMucCuaKhau(CommonModel):
    __tablename__ = "danhmuc_cuakhau"
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma_cuakhau = db.Column(String)
    ten_cuakhau= db.Column(String, nullable=False)
    tenkhongdau = db.Column(String)
    phanloai = db.Column(SmallInteger)
    #1: duongboquocte, 2:duongbochinh, 3:duongbophu, 4: duong sat, 5:duonghangkhong, 6: duongthuyloai1, 7:duongthuyloai2
    kiemdichyte = db.Column(db.Boolean, default=True)
    phongcachly = db.Column(db.Boolean, default=True)
    nguoilienlac = db.Column(db.String(255), nullable=True)
    sodienthoai = db.Column(db.String, nullable=True)
    email = db.Column(db.String, nullable=True)
    thutu = db.Column(db.Integer, nullable=True)

    quocgia_tiepgiap = db.Column(db.String, nullable=True)
    cuakhau_tiepgiap = db.Column(db.String, nullable=True)

    xaphuong_id = db.Column(String, ForeignKey('xaphuong.id'), nullable=True, index=True)
    xaphuong = db.Column(JSONB()) 
    quanhuyen_id = db.Column(String, ForeignKey('quanhuyen.id'), nullable=True, index=True)
    quanhuyen = db.Column(JSONB()) 
    tinhthanh_id = db.Column(String, ForeignKey('tinhthanh.id'), nullable=True, index=True)
    tinhthanh = db.Column(JSONB()) 
    sonha_tenduong = db.Column(String)
    diachi = db.Column(String)
    trangthai = db.Column(SmallInteger, default=1)

class DanhMucDonViSanXuatNhapKhau(CommonModel):
    __tablename__ = "danhmuc_donvisanxuat_nhapkhau"
    id = db.Column(String, primary_key=True, default=default_uuid)
    ten_donvi = db.Column(String)
    ma_donvi = db.Column(String)
    loai_donvi = db.Column(SmallInteger, index = True) #1: Ngoài nước, 2- Trong nước
    tenkhongdau = db.Column(String)
    diachi = db.Column(String)
    quocgia_id = db.Column(String)
    quocgia = db.Column(JSONB)
    trangthai = db.Column(SmallInteger, default=1)


class DanhMucCungUngNuocNgoai(CommonModel):
    __tablename__ = "danhmuc_cungung_nuoc_ngoai"
    id = db.Column(String, primary_key=True, default=default_uuid)
    ten_donvi = db.Column(String)
    ma_donvi = db.Column(String)
    tenkhongdau = db.Column(String)
    diachi = db.Column(String)
    quocgia_id = db.Column(String)
    quocgia = db.Column(JSONB)
    trangthai = db.Column(SmallInteger, default=1)


class VanBangChuyenMon(CommonModel):
    __tablename__= 'danhmuc_vanbang_chuyenmon'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma = db.Column(String(255))
    ten = db.Column(String(255))
    tenkhongdau = db.Column(String)
    trangthai = db.Column(SmallInteger(), default=1) 

    apdung_y = db.Column(Boolean, default=False)
    apdung_duoc = db.Column(Boolean, default=False)
class DanhMucNhaCungCap(CommonModel):
    __tablename__='danhmuc_nhacungcap'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ten_donvi = db.Column(String, nullable=False)
    tenkhongdau = db.Column(String)
    ma_donvi = db.Column(String, index=True, nullable=False,unique=True)
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
    trangthai = db.Column(SmallInteger(), default=1) # 1 - đang hoạt động, 0 - ngừng hoạt động

Index('danhmuc_nhacungcap_uq_ma_donvi', DanhMucNhaCungCap.ma_donvi, unique=True, postgresql_where=(and_(DanhMucNhaCungCap.ma_donvi.isnot(None),DanhMucNhaCungCap.ma_donvi != '')))

class NhaSanXuat(CommonModel):
    __tablename__ = "nhasanxuat"
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
    trangthai = db.Column(SmallInteger(), default=1) # 1 - đang hoạt động, 0 - ngừng hoạt động

# class NhaSanXuat(CommonModel):
#     __tablename__ = "nhasanxuat"
#     id = db.Column(String, primary_key=True, default=default_uuid)
#     ten = db.Column(String, nullable=False)
#     tenkhongdau = db.Column(String)
#     ma = db.Column(String, index=True, nullable=False)
#     ngay_capphep = db.Column(String)
#     dienthoai = db.Column(String)
#     email = db.Column(String)
#     nguoilienlac_ten = db.Column(String)
#     nguoilienlac_dienthoai = db.Column(String())
#     xaphuong_id = db.Column(String, ForeignKey('xaphuong.id'), nullable=True, index=True)
#     xaphuong = db.Column(JSONB()) 
#     quanhuyen_id = db.Column(String, ForeignKey('quanhuyen.id'), nullable=True, index=True)
#     quanhuyen = db.Column(JSONB()) 
#     tinhthanh_id = db.Column(String, ForeignKey('tinhthanh.id'), nullable=True, index=True)
#     tinhthanh = db.Column(JSONB()) 
#     quocgia_id = db.Column(String, ForeignKey('quocgia.id'), nullable=True, index=True)
#     quocgia = db.Column(JSONB()) 
#     sonha_tenduong = db.Column(String)
#     diachi = db.Column(String)
#     trangthai = db.Column(SmallInteger(), default=1) # 1 - đang hoạt động, 0 - ngừng hoạt động

# class NhaSanXuat(CommonModel):
#     __tablename__ = "nhasanxuat"
#     id = db.Column(String, primary_key=True, default=default_uuid)
#     ten = db.Column(String, nullable=False)
#     tenkhongdau = db.Column(String)
#     ma = db.Column(String, index=True, nullable=False)
#     ngay_capphep = db.Column(String)
#     dienthoai = db.Column(String)
#     email = db.Column(String)
#     nguoilienlac_ten = db.Column(String)
#     nguoilienlac_dienthoai = db.Column(String())
#     xaphuong_id = db.Column(String, ForeignKey('xaphuong.id'), nullable=True, index=True)
#     xaphuong = db.Column(JSONB()) 
#     quanhuyen_id = db.Column(String, ForeignKey('quanhuyen.id'), nullable=True, index=True)
#     quanhuyen = db.Column(JSONB()) 
#     tinhthanh_id = db.Column(String, ForeignKey('tinhthanh.id'), nullable=True, index=True)
#     tinhthanh = db.Column(JSONB()) 
#     quocgia_id = db.Column(String, ForeignKey('quocgia.id'), nullable=True, index=True)
#     quocgia = db.Column(JSONB()) 
#     sonha_tenduong = db.Column(String)
#     diachi = db.Column(String)
#     trangthai = db.Column(SmallInteger(), default=1) # 1 - đang hoạt động, 0 - ngừng hoạt động

# class DonViCungUng(CommonModel):
#     __tablename__ = "donvi_cungung"
#     id = db.Column(String, primary_key=True, default=default_uuid)
#     ten_donvi = db.Column(String)
#     ma_donvi = db.Column(String)
#     loai_donvi = db.Column(SmallInteger, index = True) #1: Ngoài nước, 2- Trong nước
#     tenkhongdau = db.Column(String)
#     xaphuong_id = db.Column(String, ForeignKey('xaphuong.id'), nullable=True, index=True)
#     xaphuong = relationship('XaPhuong', viewonly=True) 
#     quanhuyen_id = db.Column(String, ForeignKey('quanhuyen.id'), nullable=True, index=True)
#     quanhuyen = relationship('QuanHuyen', viewonly=True)  
#     tinhthanh_id = db.Column(String, ForeignKey('tinhthanh.id'), nullable=True, index=True)
#     tinhthanh = relationship('TinhThanh', viewonly=True)
#     quocgia_id = db.Column(String, ForeignKey('quocgia.id'), nullable=True, index=True)
#     quocgia = relationship('QuocGia', viewonly=True) 
#     diachi = db.Column(String)
#     trangthai = db.Column(SmallInteger, default=1)



# class CoSoDaoTaoYHCT(CommonModel):
#     __tablename__ = 'coso_daotao_yhct'
#     id = db.Column(String, primary_key=True, default=default_uuid)
#     ma_coso = db.Column(String(255), index=True)
#     ten_coso = db.Column(String)
#     tenkhongdau = db.Column(String)
#     nguoi_dai_dien = db.Column(String)
#     email = db.Column(String)
#     dienthoai = db.Column(String)
#     xaphuong_id = db.Column(String, ForeignKey('xaphuong.id'), nullable=True, index=True)
#     xaphuong = relationship('XaPhuong', viewonly=True) 
#     quanhuyen_id = db.Column(String, ForeignKey('quanhuyen.id'), nullable=True, index=True)
#     quanhuyen = relationship('QuanHuyen', viewonly=True)  
#     tinhthanh_id = db.Column(String, ForeignKey('tinhthanh.id'), nullable=True, index=True)
#     tinhthanh = relationship('TinhThanh', viewonly=True)
#     diachi = db.Column(String)
#     trangthai = db.Column(SmallInteger, default=1)



# class CoSoKCBYHCT(CommonModel):
#     __tablename__ = 'coso_kcb_yhct'
#     id = db.Column(String, primary_key=True, default=default_uuid)
#     ma_coso = db.Column(String(255), index=True)
#     ten_coso = db.Column(String)
#     tenkhongdau = db.Column(String)
#     nguoi_dai_dien = db.Column(String)
#     tuyen_coso = db.Column(SmallInteger)#1-bv trung uong, 2- bv tinh, 3- bv huyen, 4-phong kham yhct, 5- khac
#     hinhthuc_tochuc = db.Column(String)
#     email = db.Column(String)
#     dienthoai = db.Column(String)
#     xaphuong_id = db.Column(String, ForeignKey('xaphuong.id'), nullable=True, index=True)
#     xaphuong = relationship('XaPhuong', viewonly=True) 
#     quanhuyen_id = db.Column(String, ForeignKey('quanhuyen.id'), nullable=True, index=True)
#     quanhuyen = relationship('QuanHuyen', viewonly=True)  
#     tinhthanh_id = db.Column(String, ForeignKey('tinhthanh.id'), nullable=True, index=True)
#     tinhthanh = relationship('TinhThanh', viewonly=True)
#     diachi = db.Column(String)
#     trangthai = db.Column(SmallInteger, default=1)



    

Index('quocgia_uq_ma', QuocGia.ma, unique=True, postgresql_where=(and_(QuocGia.ma.isnot(None),QuocGia.ma !='')))
Index('tinhthanh_uq_ma', TinhThanh.ma, unique=True, postgresql_where=(and_(TinhThanh.ma.isnot(None),TinhThanh.ma !='')))
Index('quanhuyen_uq_ma', QuanHuyen.ma, unique=True, postgresql_where=(and_(QuanHuyen.ma.isnot(None),QuanHuyen.ma !='')))
Index('xaphuong_uq_ma', XaPhuong.ma, unique=True, postgresql_where=(and_(XaPhuong.ma.isnot(None),XaPhuong.ma !='')))
Index('thonxom_uq_ma', ThonXom.ma, unique=True, postgresql_where=(and_(ThonXom.ma.isnot(None),ThonXom.ma !='')))
Index('dantoc_uq_ma', DanToc.ma, unique=True, postgresql_where=(and_(DanToc.ma.isnot(None),DanToc.ma !='')))
# Index('coso_kcb_yhct_uq_ma_coso', CoSoKCBYHCT.ma_coso, unique=True, postgresql_where=(and_(CoSoKCBYHCT.ma_coso.isnot(None),CoSoKCBYHCT.ma_coso !='')))

