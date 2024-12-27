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


class LichSuGiaoDich(CommonModel):
    __tablename__ = "lichsu_giaodich"
    id = db.Column(String, primary_key=True, default=default_uuid)
    id_sanpham = db.Column(String , index = True, nullable=False)
    ma_sanpham = db.Column(String , index = True, nullable=False)
    ten_sanpham = db.Column(String)
    loai_giaodich = db.Column(SmallInteger)#1-mua ban, chuyen nhuong, 2- van chuyen
    ma_giaodich_chitiet = db.Column(String, unique=True, index = True, nullable=False)
    thoigian_giaodich = db.Column(String)


    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi')
    trangthai = db.Column(SmallInteger(), default=1)

class ChiTietGiaoDich(CommonModel):
    __tablename__ = "chitiet_giaodich"
    id = db.Column(String, primary_key=True, default=default_uuid)
    id_sanpham = db.Column(String(), index=True, nullable=False)
    ma_sanpham = db.Column(String(), index=True, nullable=False)
    ten_sanpham = db.Column(String())
    tenkhongdau = db.Column(String())

    ma_donvi_xuat = db.Column(String(), index=True, nullable=False)
    ten_donvi_xuat = db.Column(String())
    donvi_xuat = db.Column(JSONB())
    loai_giaodich = db.Column(SmallInteger())#1- nhap khau, 2- phan phoi tu don vi den don vi, 3- thu gom; 4- ban le 
    thoigian_xuat = db.Column(String(), index=True)
    diachi_xuat = db.Column(String())
    trangthai_hang_xuat = db.Column(String())
    dinhkem_xuat = db.Column(JSONB())

    ma_donvi_vanchuyen = db.Column(String(), index=True, nullable=True)
    ten_donvi_vanchuyen = db.Column(String())
    donvi_vanchuyen = db.Column(JSONB())
    hinhthuc_vanchuyen = db.Column(SmallInteger()) #1- oto, 2- maybay; 3- tau hoa; 4- tau thuy; 5- xe may; 6- khac
    thoigian_batdau_chuyen = db.Column(String(), index=True)
    thoigian_ketthuc_chuyen = db.Column(String(), index=True)
    dinhkem_vanchuyen = db.Column(JSONB())

    ma_donvi_nhan = db.Column(String(), index=True, nullable=False)
    ten_donvi_nhan = db.Column(String())
    donvi_nhan = db.Column(JSONB())
    thoigian_nhan = db.Column(String(), index=True)
    diachi_nhan = db.Column(String())
    dinhkem_nhan = db.Column(JSONB())
    trangthai = db.Column(SmallInteger, default=1)# 1- moi tao, 2- xac nhan da xuat, 3- xac nhan van chuyen, 4- xac nhan da nhan hang
