from re import S
from sqlalchemy import (
    Column, String, Integer,SmallInteger, BigInteger, DateTime, Date, Boolean, DECIMAL, Text, ForeignKey, UniqueConstraint, JSON, Index, Float
)
from sqlalchemy.orm import relationship, backref
from sqlalchemy.orm.collections import attribute_mapped_collection

from sqlalchemy.orm import *
from sqlalchemy.sql.expression import null
from application.database import db
from application.database.model import CommonModel
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import or_,and_
import uuid
from application.models.model_danhmuc import TuyenDonVi

def default_uuid():
    return str(uuid.uuid4())
    


roles_users = db.Table('roles_users',
                       db.Column('user_id', String(), db.ForeignKey('userinfo.id')),
                       db.Column('role_id', String(), db.ForeignKey('role.id')))


class User(CommonModel):
    __tablename__ = 'userinfo'
    id = db.Column(String(), primary_key=True, default=default_uuid)
    email = db.Column(String(255), index=True)
    phone = db.Column(String())
    password = db.Column(String(255))
    salt = db.Column(String())

    active = db.Column(SmallInteger(), default=0) 
    #0- chua active, 1- active, >1 Khoa
    roles = relationship("Role", secondary=roles_users)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=True)
    donvi = relationship('DonVi')
    
    
    # Methods
    def __repr__(self):
        """ Show user object info. """
        return '<User: {}>'.format(self.id)


    def has_role(self, role):
        if isinstance(role, str):
            return role in (role.vaitro for role in self.roles)
        else:
            return role in self.roles

        
class ProfileUser(CommonModel):
    __tablename__ = 'profile_user'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma = db.Column(String)
    hoten = db.Column(String, nullable=False, index=True)
    tenkhongdau = db.Column(String())
    macongdan = db.Column(String(200), nullable=True, index=True)
    email = db.Column(String(255), index=True)
    dienthoai = db.Column(String(20), index=True)
    diachi = db.Column(String)
    vaitro = db.Column(JSONB)
    chucvu = db.Column(String)
    chungchi = db.Column(String)
    chungchi_url = db.Column(String)
    phamvi_hanhnghe = db.Column(String)
    gioithieu = db.Column(String)
    avatar_url = db.Column(String)
    
    active = db.Column(SmallInteger(), default=1)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=True)
    donvi = relationship('DonVi')
    
    def has_role(self, role):
        if isinstance(role, str) and self.vaitro is not None:
            return role in self.vaitro
        return False


class Role(CommonModel):
    __tablename__ = 'role'
    id = db.Column(String(), primary_key=True,default=default_uuid)
    vaitro = db.Column(String(200), unique=True)
    mota = db.Column(String)
    active = db.Column(SmallInteger(), default=1) 

    
class DonVi(CommonModel):
    __tablename__ = 'donvi'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma_coso = db.Column(String(255), nullable=True)
    ten_coso = db.Column(String, nullable=False)
    tenkhongdau = db.Column(String())
    sogiayphep = db.Column(String, index = True)
    ngaycapphep = db.Column(String)
    dienthoai = db.Column(String(63))
    email = db.Column(String(255))
    website = db.Column(String)
    loaihinh_hoatdong = db.Column(String)
    #1- don vi y te, 2- don vi cung ung,
    #  3- don vi van chuyen, 4 - don vi su dung (benh vien)
    # 5- don vi nuoi trong, 6 - don vi khai thac tu nhien
    # 7- don vi la ca nhan nuoi trong, 8 - ca nhan khai thac tu nhien
    # 9 don vi nuoi trong va khai thac tu nhien
    loai_donvi = db.Column(SmallInteger)
    
    lich_lamviec = db.Column(Float)
    gioithieu = db.Column(String)
    nguoidaidien = db.Column(String)
    nguoidaidien_dienthoai = db.Column(String)
    thumbnail_url = db.Column(String)
    banner_url = db.Column(String)
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
    tuyendonvi_id = db.Column(String, ForeignKey('tuyendonvi.id'), nullable=True, index=True)
    tuyendonvi = relationship('TuyenDonVi', viewonly=True)
    captren_id = db.Column(String, ForeignKey('donvi.id'), nullable=True, index=True)
    captren_name = db.Column(String)


    dinhkem_giayphep_dkkd = db.Column(JSONB())
    #ap dung voi don vi nuoi trong va khai thac tu nhien
    # diadiem_nuoitrong_khaithac = relationship('DiaDiemNuoiTrongKhaiThac', viewonly=True)
    dinhkem_sodo_nhansu = db.Column(JSONB())#sơ đồ nhân sự
    dinhkem_chungnhan_daotao = db.Column(JSONB())#Chứng nhận đào tạo
    danhsach_nhanvien_daotao = db.Column(JSONB())#danh sách nhân viên đào tạo {'ma', 'ten', 'chuyenmon'}
    dinhkem_thuyetminh_quytrinh = db.Column(JSONB())
    dinhkem_chungnhan_gacp = db.Column(JSONB())
    loai_chungnhan_gacp = db.Column(SmallInteger())
    so_chungnhan_gacp = db.Column(String)

    duyet_thongtin = db.Column(SmallInteger, default =1)#1 tao moi, 2 la da duyet
    nguoi_duyet_ten = db.Column(String)
    nguoi_duyet_id = db.Column(String)
    thoigian_duyet = db.Column(String)

    chophep_ketnoi = db.Column(Boolean, default =False, index = True) # cho phép sàn thương mại điện tử kết nối với nền tảng 
    appinfo_id = db.Column(String, ForeignKey('appinfo.id'), nullable=True, index=True)
    appinfo = relationship('AppInfo', viewonly=True)
 
    active = db.Column(Boolean(), default=False)
    users = relationship('ProfileUser', viewonly=True)
    children = relationship("DonVi",
        # cascade deletions
        cascade="all, delete-orphan",
        # many to one + adjacency list - remote_side
        # is required to reference the 'id'
        # column in the join condition.
        backref=backref("captren", remote_side=id),
        # children will be represented as a dictionary
        # on the "id" attribute.
        collection_class=attribute_mapped_collection('id'),
    )

    def __repr__(self):
        return "DonVi(id=%r, ten_coso=%r, captren_id=%r, tuyendonvi_id=%r, tenkhongdau=%r)" % (
                    self.id,
                    self.ten_coso,
                    self.captren_id,
                    self.tuyendonvi_id,
                    self.tenkhongdau
                )
    def __todict__(self):
        return {"id":str(self.id), "ma": self.ma,"text": self.ten_coso,"ten": self.ten_coso, "captren_id": str(self.captren_id), "tuyendonvi_id":str(self.tuyendonvi_id)}

    def __toid__(self):
        return self.id

    def dump(self, _indent=0):
        obj = self.__todict__()
        #obj["tuyendonvi"] = to_dict(self.tuyendonvi)
        obj["nodes"] = [c.dump() for c in self.children.values()]
        return obj

    def get_children_ids(self, data):
        if type(data) is list:
            # data.append(self.id)
            for r in self.children.values():
                # r.get_children_ids(data)
                data.append(r.id)

    def getlistid(self):
        data = []
        self.get_children_ids(data)
        return data


class KhachHangDonVi(CommonModel):
    __tablename__ = 'khachhang_donvi'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma_coso = db.Column(String(255))
    ten_coso = db.Column(String)
    type = db.Column(SmallInteger)#1-cơ sở, 2- khách lẻ
    tenkhongdau = db.Column(String())
    sogiayphep = db.Column(String, index = True)
    hoten = db.Column(String)
    dienthoai = db.Column(String(63))
    email = db.Column(String(255))
    diachi = db.Column(String)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi', viewonly=True) 


class DiaDiemNuoiTrongKhaiThac(CommonModel):
    __tablename__ = 'diadiem_nuoitrong_khaithac'
    id = db.Column(String(), primary_key=True, default=default_uuid)
    ten_diadiem = db.Column(String())
    tenkhongdau = db.Column(String())
    lat = db.Column(String())#vĩ độ
    long = db.Column(String())#kinh độ
    loai_diadiem = db.Column(SmallInteger)#1 đơn vị nuôi trồng, 2 khai thác tự nhiên
    xaphuong_id = db.Column(String, ForeignKey('xaphuong.id'), nullable=True, index=True)
    xaphuong = db.Column(JSONB()) 
    quanhuyen_id = db.Column(String, ForeignKey('quanhuyen.id'), nullable=True, index=True)
    quanhuyen = db.Column(JSONB()) 
    tinhthanh_id = db.Column(String, ForeignKey('tinhthanh.id'), nullable=True, index=True)
    tinhthanh = db.Column(JSONB()) 
    quocgia_id = db.Column(String, ForeignKey('quocgia.id'), nullable=True, index=True)
    quocgia = db.Column(JSONB()) 
    sonha_tenduong = db.Column(String)
    diachi = db.Column(String())
    mo_ta = db.Column(String())
    dien_tich = db.Column(Float())
    donvitinh_dientich = db.Column(SmallInteger())# 1-m2, 2-hecta(ha), 3- km2
    chungtu_xacnhan = db.Column(JSONB)
    giayphep_khaithac = db.Column(JSONB)
    thoigian_batdau_khaithac = db.Column(String())
    thoigian_ketthuc_khaithac = db.Column(String())
    dinhkem_chungnhan_vungtrong = db.Column(JSONB)

    dinhkem_chungnhan_kiemnghiem = db.Column(JSONB)
    

    

    active = db.Column(SmallInteger(), default=0) 
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=True)
    donvi = relationship('DonVi')
    
   
class GiayPhepNhapKhau(CommonModel):
    __tablename__ = "giayphep_nhapkhau"
    id = db.Column(String, primary_key=True, default=default_uuid)
    so_giay_phep = db.Column(String(), index=True, nullable=False)
    thoigian_capphep = db.Column(String(), index=True, nullable=False)
    thoigian_hieuluc_batdau = db.Column(String(), index=True, nullable=True)
    thoigian_hieuluc_ketthuc = db.Column(String(), index=True, nullable=True)
    # donvi_id_owner = db.Column(String, index=True)
    # donvi_owner = db.Column(JSONB)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi', viewonly=True)
    chitiet_giayphep = relationship("GiayPhepNhapKhauChiTiet", order_by="GiayPhepNhapKhauChiTiet.thoigian_capphep", cascade="all, delete-orphan")
    chungtu_dinhkem = db.Column(JSONB)
    trangthai = db.Column(SmallInteger, default=1) #1- Tạo mới - 2 Chờ duyệt, 3 Đã duyệt
    nguoi_duyet_id = db.Column(String, index = True)
    nguoi_duyet_ten = db.Column(String)
    thoigian_duyet = db.Column(String)
    thoigian_guiduyet = db.Column(String)
    chungtu_dinhkem = db.Column(JSONB)
    

class GiayPhepNhapKhauChiTiet(CommonModel):
    __tablename__ = "giayphep_nhapkhau_chitiet"
    id = db.Column(String, primary_key=True, default=default_uuid)
    giayphep_id = db.Column(String, ForeignKey('giayphep_nhapkhau.id'), nullable=True, index=True)
    giayphep = relationship('GiayPhepNhapKhau', viewonly=True) 
    so_giay_phep = db.Column(String(), index=True, nullable=False)
    thoigian_capphep = db.Column(String(), index=True, nullable=False)
    thoigian_hieuluc_batdau = db.Column(String(), index=True, nullable=True)
    thoigian_hieuluc_ketthuc = db.Column(String(), index=True, nullable=True)


    id_sanpham = db.Column(String(), index=True)#la id item vat tu trong danh muc
    ma_sanpham = db.Column(String(), index=True)
    loai_sanpham = db.Column(String(), index=True)
    ten_sanpham = db.Column(String())
    ten_khoahoc = db.Column(String)
    sanpham = db.Column(JSONB)
    bophan_sudung = db.Column(String)
    dongia = db.Column(Float)
    soluong_capphep = db.Column(Float)
    soluong_danhap = db.Column(Float)
    donvitinh = db.Column(String())

    tieuchuan_chatluong_id = db.Column(String)
    tieuchuan_chatluong = db.Column(JSONB)

    quocgia_sanxuat_id = db.Column(String)
    quocgia_sanxuat = db.Column(JSONB)
    ten_coso_sanxuat = db.Column(String)
    
    quocgia_cungcap_id = db.Column(String)
    quocgia_cungcap = db.Column(JSONB)
    ten_coso_cungcap = db.Column(String)

    chungtu_dinhkem = db.Column(JSONB)
    ghichu = db.Column(String)
    # donvi_id_owner = db.Column(String, index=True)
    # donvi_owner = db.Column(JSONB)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi', viewonly=True)


class GiayChungNhanCO(CommonModel):
    __tablename__ = "giay_chungnhan_co"
    id = db.Column(String, primary_key=True, default=default_uuid)
    so_co = db.Column(String(), index=True, nullable=False)

    so_giay_phep = db.Column(String(), index=True, nullable=True)
    giayphep_nhapkhau_id = db.Column(String)
    giayphep_nhapkhau = db.Column(JSONB)

    thoigian_cap_co = db.Column(String(), index=True, nullable=True)
    thoigian_hieuluc_batdau = db.Column(String(), index=True, nullable=True)
    thoigian_hieuluc_ketthuc = db.Column(String(), index=True, nullable=True)

    loai_co = db.Column(SmallInteger) # 1 là nhập khẩu,2 là trong nước

    id_donvi_sanxuat = db.Column(String)
    ten_donvi_sanxuat = db.Column(String)
    donvi_sanxuat = db.Column(JSONB)
    diachi_donvi_sanxuat = db.Column(String())
    quocgia_donvi_sanxuat= db.Column(JSONB)
    quocgia_donvi_sanxuat_id = db.Column(String)
    
    id_donvi_tiepnhan = db.Column(String)
    ten_donvi_tiepnhan = db.Column(String())
    donvi_tiepnhan = db.Column(JSONB)
    diachi_donvi_tiepnhan  = db.Column(String())
    quocgia_donvi_tiepnhan_id = db.Column(String())
    quocgia_donvi_tiepnhan = db.Column(JSONB)
    ten_nguoiky_xacnhan = db.Column(String())

    donvi_phanphoi = db.Column(JSONB)
    id_donvi_phanphoi = db.Column(String)
    ten_donvi_phanphoi = db.Column(String)
    diachi_donvi_phanphoi = db.Column(String)
    quocgia_donvi_phanphoi = db.Column(JSONB)
    quocgia_donvi_phanphoi_id = db.Column(String)

    ngay_khoi_hanh = db.Column(String(), index=True)
    ngay_nhap_canh = db.Column(String(), index=True)
    so_hieu_phuongtien = db.Column(String(), index=True)
    ten_phuongtien = db.Column(String(), index=True)
    loaihinh_vanchuyen = db.Column(String(), index=True)
    donvi_id_truycap =  db.Column(JSONB) # mảng đơn vị id được xem


    donvi_chungnhan_co = db.Column(String)
    donvi_chungnhan_co_id = db.Column(String)

    cuakhau_id = db.Column(String)
    cuakhau = db.Column(JSONB)
    tencuakhau = db.Column(String)
    # donvi_id_owner = db.Column(String, index=True)
    # donvi_owner = db.Column(JSONB)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi', viewonly=True)
    chungtu_dinhkem = db.Column(JSONB)
    chitiet_giayphep = relationship("GiayChungNhanCOChitiet", order_by="GiayChungNhanCOChitiet.thoigian_cap_co",  viewonly=True)

    trangthai = db.Column(SmallInteger, default=1) # 1 tạo mới - 2 chờ duyệt, 3- đã duyệt
    nguoi_duyet_id = db.Column(String, index = True)
    nguoi_duyet_ten = db.Column(String)
    thoigian_duyet = db.Column(String)
    thoigian_guiduyet = db.Column(String)


#change model

#so_chungnhan_cq => ma_kiem_nghiem;
#id_chungnhan_cq => phieu_kiem_nghiem_id;
#chungnhan_cq => phieu_kiem_nghiem;


class GiayChungNhanCOChitiet(CommonModel):
    __tablename__ = "giay_chungnhan_co_chitiet"
    id = db.Column(String, primary_key=True, default=default_uuid)
    chungnhan_id = db.Column(String, ForeignKey('giay_chungnhan_co.id', ondelete='SET NULL'), nullable=True, index=True)
    chungnhan = relationship('GiayChungNhanCO', viewonly=True) 
    so_co = db.Column(String(), index=True, nullable=False)
    so_giay_phep = db.Column(String(), index=True, nullable=True)
    thoigian_cap_co = db.Column(String(), index=True, nullable=True)
    thoigian_hieuluc_batdau = db.Column(String(), index=True, nullable=True)
    thoigian_hieuluc_ketthuc = db.Column(String(), index=True, nullable=True)

    giayphep_nhapkhau_id = db.Column(String)
    loai_co = db.Column(SmallInteger) # 1 là nhập khẩu,2 là trong nước

    id_sanpham = db.Column(String(), index=True)#la id item vat tu trong danh muc
    ma_sanpham = db.Column(String(), index=True)
    loai_sanpham = db.Column(String(), index=True)
    ten_sanpham = db.Column(String())
    sanpham = db.Column(JSONB)
    dongia = db.Column(Float)
    soluong_donggoi = db.Column(Float)
    loai_donggoi = db.Column(String())
    mota_sanpham = db.Column(String())
    ma_HS = db.Column(String())
    tieuchi_xuatxu = db.Column(String())
    soluong = db.Column(Float)
    soluong_danhap = db.Column(Float)

    tongsoluong = db.Column(Float())#tổng số lượng bao gồm bì

    donvitinh = db.Column(String())
    so_hoadon = db.Column(String())
    ngay_hoadon = db.Column(String())

    ma_kiem_nghiem = db.Column(String)
    phieu_kiem_nghiem_id = db.Column(String)
    phieu_kiem_nghiem = db.Column(JSONB)

    ghichu = db.Column(String)
    # donvi_id_owner = db.Column(String, index=True)
    # donvi_owner = db.Column(JSONB)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi', viewonly=True)



#change model
# GiayChungNhanChatLuongCQ==>PhieuKiemNghiem
# giay_chungnhan_chatluong_cq==>phieu_kiem_nghiem
#so_chungnhan_cq==>ma_kiem_nghiem

class PhieuKiemNghiem(CommonModel):
    __tablename__ = "phieu_kiem_nghiem"
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma_kiem_nghiem = db.Column(String(), index=True, nullable=False)
    ngay_kiem_nghiem = db.Column(String(), index=True, nullable=True)

    ten_donvi_cap = db.Column(String())
    donvi_cap_id = db.Column(String())
    diachi_donvi_cap = db.Column(String())
    
    donvi_yeucau = db.Column(JSONB)
    ma_donvi_yeucau = db.Column(String())
    ten_donvi_yeucau = db.Column(String())
    diachi_donvi_yeucau = db.Column(String())

    id_sanpham = db.Column(String(), index=True)#la id item vat tu trong danh muc
    ma_sanpham = db.Column(String(), index=True)
    loai_sanpham = db.Column(String(), index=True)
    ten_sanpham = db.Column(String())
    sanpham = db.Column(JSONB)
    so_lo = db.Column(String())

    nguoi_lay_mau = db.Column(String)
    nguoi_giao_mau = db.Column(String)
    nguoi_nhan_mau = db.Column(String)
    tinh_trang_mau = db.Column(String)
    luong_lay_mau = db.Column(String())
    tieu_chuan_kiem_nghiem = db.Column(String())
    cac_muc_kiem_nghiem = db.Column(String())

    noi_san_suat = db.Column(String)
    noi_san_suat_id = db.Column(String)

    nuoc_sanxuat = db.Column(String())
    ngay_san_xuat = db.Column(String())
    han_su_dung = db.Column(String())
    ngay_bao_cao = db.Column(String())
    ngay_nhan_mau = db.Column(String)


    quy_cach = db.Column(String)
    ket_qua = db.Column(JSONB)
    ketluan = db.Column(String)
    don_vi_gui_mau = db.Column(String)

    ghichu = db.Column(String)
    # donvi_id_owner = db.Column(String, index=True)
    # donvi_owner = db.Column(JSONB)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi', viewonly=True)
    chungtu_dinhkem = db.Column(JSONB)

    trangthai = db.Column(SmallInteger, default=1)# 1- Tạo mới 2- chờ duyệt. 3 đã duyệt
    nguoi_duyet_id = db.Column(String, index = True)
    nguoi_duyet_ten = db.Column(String)
    thoigian_duyet = db.Column(String)
    thoigian_guiduyet = db.Column(String)

    auto_ma_kiem_nghiem = db.Column(Boolean)

    donvi_id_truycap =  db.Column(JSONB) # mảng đơn vị id được xem




#Danh mục đơn vị cấp phiếu kiểm nghiệm COA

class DanhMucDonViCap(CommonModel):
    __tablename__ = 'donvicap'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ten = db.Column(String)
    ma_viettat = db.Column(String())
    tenkhongdau = db.Column(String)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi', viewonly=True)

#Danh mục nơi sản xuất phiếu kiểm nghiệm COA

class DanhMucNoiSanXuat(CommonModel):
    __tablename__ = 'noisanxuat'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ten = db.Column(String)
    ma_viettat = db.Column(String())
    tenkhongdau = db.Column(String)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi', viewonly=True)


class DanhMucDonViChungNhanCO(CommonModel):
    __tablename__ = 'donvicapco'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ten = db.Column(String)
    ma_viettat = db.Column(String())
    tenkhongdau = db.Column(String)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
    donvi = relationship('DonVi', viewonly=True)


Index('user_uq_email', User.email, unique=True, postgresql_where=(and_(User.email.isnot(None),User.email !='', User.deleted == False)))