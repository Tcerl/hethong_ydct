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
    
    




class CoSoDaoTaoYHCT(CommonModel):
    __tablename__ = 'coso_daotao_yhct'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma_coso = db.Column(String(255), index=True)
    ten_coso = db.Column(String)
    tenkhongdau = db.Column(String)
    nguoi_dai_dien = db.Column(String)
    email = db.Column(String)
    dienthoai = db.Column(String)
    xaphuong_id = db.Column(String, ForeignKey('xaphuong.id'), nullable=True, index=True)
    xaphuong = db.Column(JSONB()) 
    quanhuyen_id = db.Column(String, ForeignKey('quanhuyen.id'), nullable=True, index=True)
    quanhuyen = db.Column(JSONB()) 
    tinhthanh_id = db.Column(String, ForeignKey('tinhthanh.id'), nullable=True, index=True)
    tinhthanh = db.Column(JSONB()) 
    sonha_tenduong = db.Column(String)
    diachi = db.Column(String)
    trangthai = db.Column(SmallInteger, default=1)



class CoSoKCBYHCT(CommonModel):
    __tablename__ = 'coso_kcb_yhct'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma_coso = db.Column(String(255), index=True)
    ten_coso = db.Column(String)
    tenkhongdau = db.Column(String)
    nguoi_dai_dien = db.Column(String)
    tuyen_coso = db.Column(SmallInteger)#1-bv trung uong, 2- bv tinh, 3- bv huyen, 4-phong kham yhct, 5- khac
    hinhthuc_tochuc = db.Column(String)
    email = db.Column(String)
    dienthoai = db.Column(String)
    xaphuong_id = db.Column(String, ForeignKey('xaphuong.id'), nullable=True, index=True)
    xaphuong = db.Column(JSONB()) 
    quanhuyen_id = db.Column(String, ForeignKey('quanhuyen.id'), nullable=True, index=True)
    quanhuyen = db.Column(JSONB()) 
    tinhthanh_id = db.Column(String, ForeignKey('tinhthanh.id'), nullable=True, index=True)
    tinhthanh = db.Column(JSONB()) 
    sonha_tenduong = db.Column(String)
    diachi = db.Column(String)
    trangthai = db.Column(SmallInteger, default=1)


class CoSoHanhNghe(CommonModel):
    __tablename__ = 'coso_hanhnghe'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma_coso = db.Column(String, nullable = True)
    ten_coso = db.Column(String)
    ten_coso_khongdau = db.Column(String)
    loai_coso = db.Column(SmallInteger, default=1) # 1 - hanhh nghe y cổ truyền ruyền, 2 - hành nghe duoc cổ truyền

    ma_dangky_kinhdoanh = db.Column(String, index = True)
    dkkd_ngay_cap = db.Column(String)
    dkkd_ngay_hieu_luc = db.Column(String)
    dkkd_ngay_het_han = db.Column(String)
    dkkd_co_quan_cap = db.Column(String)

    email_coso = db.Column(String)
    dienthoai_coso = db.Column(String, index = True, nullable = True)
    fax_coso = db.Column(String)
    avatar_url = db.Column(String)

    # so_giay_phep = db.Column(String) # So chung chi + / + ma hoi dong
    # so_giay_phep_before = db.Column(Integer) #So chung chi 
    # so_giay_phep_after = db.Column(String) #Mã hội đồng

    # ngay_cap = db.Column(BigInteger, nullable = True)
    # ngay_hieu_luc = db.Column(BigInteger, nullable = True)
    # ngay_het_han = db.Column(BigInteger, nullable = True)
    # co_quan_cap = db.Column(String)

    #nguoi chiu trach nhiem chuyen mon
    nguoi_tncm_ten = db.Column(String)
    nguoi_tncm_so_cchn = db.Column(String, index = True)
    nguoi_tncm_ngaycap = db.Column(BigInteger)
    nguoi_tncm_vanbang = db.Column(JSONB)

    # chungchi_nguoi_tncm_id = db.Column(String, ForeignKey('danhmuc_chung_chi.id'), index=True, nullable=True)
    # chungchi_nguoi_tncm = relationship('DanhMucChungChi', viewonly=True)
    dinhkem_chungchi = db.Column(JSONB)
    dinhkem_anh_chandung = db.Column(JSONB)
    dinhkem_vanbang_chuyenmon = db.Column(JSONB)
    dinhkem_xacnhan_congdan = db.Column(JSONB)
    dinhkem_files_khac = db.Column(JSONB())
    #Pham vi hoạt động chuyên môn
    loaihinh_kinhdoanh = db.Column(JSONB)

    #Vị trí hành nghề
    phamvi_kinhdoanh = db.Column(JSONB)

    #dia chi co so kinh doanh chinh
    tinhthanh_coso_id = db.Column(String(), index = True, nullable = True)
    tinhthanh_coso = db.Column(JSONB())
    quanhuyen_coso_id = db.Column(String())
    quanhuyen_coso = db.Column(JSONB())
    xaphuong_coso_id = db.Column(String())
    xaphuong_coso = db.Column(JSONB())
    # sonha_coso = db.Column(String())
    # tenduong_coso = db.Column(String())
    sonha_tenduong_coso = db.Column(String) # số nhà, tên ngõ, tên đường
    diachi_coso = db.Column(String())   #Full: bao gom ca tinhthanh, quan huyen, ....

    #dia chi kho hang
    #[{"ten_kho":"Kho A","tinhthanh_id":"","tinhthanh_ten":"",
    # "quanhuyen_id":"","quanhuyen_ten":"","xaphuong_id":"","xaphuong_ten":"","dia_diem":""}]
    #danhsach_khohang = db.Column(JSONB())
    tinhthanh_kho_id = db.Column(String(), index = True, nullable = True)
    tinhthanh_kho = db.Column(JSONB())
    quanhuyen_kho_id = db.Column(String())
    quanhuyen_kho = db.Column(JSONB())
    xaphuong_kho_id = db.Column(String())
    xaphuong_kho = db.Column(JSONB())
    # sonha_kho = db.Column(String())
    # tenduong_kho = db.Column(String())
    sonha_tenduong_kho = db.Column(String) # số nhà, tên ngõ, tên đường
    diachi_kho = db.Column(String())    #Full: bao gom ca tinhthanh, quan huyen, ....

    #dia chi dia diem kinh doanh
    ten_kinhdoanh = db.Column(String)
    ten_kinhdoanh_khongdau = db.Column(String)
    tinhthanh_kinhdoanh_id = db.Column(String(), index = True, nullable = True)
    tinhthanh_kinhdoanh = db.Column(JSONB())
    quanhuyen_kinhdoanh_id = db.Column(String())
    quanhuyen_kinhdoanh = db.Column(JSONB())
    xaphuong_kinhdoanh_id = db.Column(String())
    xaphuong_kinhdoanh = db.Column(JSONB())
    # sonha_kinhdoanh = db.Column(String())
    # tenduong_kinhdoanh = db.Column(String())
    sonha_tenduong_kinhdoanh = db.Column(String) # số nhà, tên ngõ, tên đường
    diachi_kinhdoanh = db.Column(String()) #Full: bao gom ca tinhthanh, quan huyen, ....

    #thong tin nguoi lien he
    ten_nguoi_lienhe = db.Column(String)
    chucdanh_nguoi_lienhe = db.Column(String)
    email_nguoi_lienhe = db.Column(String) 
    dienthoai_nguoi_lienhe = db.Column(String)
    fax_nguoi_lienhe = db.Column(String)

    tructhuoc = db.Column(Boolean, default=False)
    ten_tructhuoc = db.Column(String)
    ten_tructhuoc_khongdau = db.Column(String)
    tinhthanh_tructhuoc_id = db.Column(String(), index = True, nullable = True)
    tinhthanh_tructhuoc = db.Column(JSONB())
    quanhuyen_tructhuoc_id = db.Column(String())
    quanhuyen_tructhuoc = db.Column(JSONB())
    xaphuong_tructhuoc_id = db.Column(String())
    xaphuong_tructhuoc = db.Column(JSONB())
    # sonha_tructhuoc = db.Column(String())
    # tenduong_tructhuoc = db.Column(String())
    sonha_tenduong_tructhuoc = db.Column(String) # số nhà, tên ngõ, tên đường
    diachi_tructhuoc = db.Column(String()) #Full: bao gom ca tinhthanh, quan huyen, ....
    # captren_id = db.Column(String, index = True, nullable = True)
    # captren_ten = db.Column(String)
    # captren = db.Column(JSONB)
    danhsach_nguoi_hanhnghe = relationship('NguoiHanhNgheCoSoKD', viewonly=True)

class NguoiHanhNgheCoSoKD(CommonModel):
    #Danh sach nguoi hanh nghe tại cơ sở 
    __tablename__ = 'nguoi_hanhnghe_coso'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ten = db.Column(String)
    tenkhongdau = db.Column(String, index = True)
    ngaysinh = db.Column(String) # YYYYMMDD
    gioitinh = db.Column(SmallInteger, default=1) # 1 - nam, 2 - nu, 3 khac
    email = db.Column(String)
    sodienthoai = db.Column(String)
    ma_cong_dan = db.Column(String)

    ma_cchn = db.Column(String, index=True)
    ngay_cap = db.Column(String, nullable = True)
    noi_cap = db.Column(String)
    ngay_hieu_luc = db.Column(String, nullable = True)
    ngay_het_han = db.Column(String, nullable = True)

    ngay_batdau = db.Column(String) # YYYYMMDD - ngày bắt đầu làm việc tại cơ sở
    ngay_kethuc = db.Column(String) # YYYYMMDD - ngày kết thúc làm việc tại cơ sở

    vaitro = db.Column(Integer, default=2) # 1 - Người chịu trách nhiệm chuyên môn về dược, 2 - Người phụ trách đảm bảo chất lượng

    tinhthanh_id = db.Column(String)
    tinhthanh = db.Column(JSONB)
    quanhuyen_id = db.Column(String)
    quanhuyen = db.Column(JSONB)
    xaphuong_id = db.Column(String)
    xaphuong = db.Column(JSONB)
    sonha_tenduong = db.Column(String)
    diachi = db.Column(String) #Full: bao gom ca tinhthanh, quan huyen, ....

    dinhkem_giaychungnhan = db.Column(JSONB)

    trangthai = db.Column(SmallInteger, default=1) # 0 - ngừng hoạt động, 1 - đang hoạt động
    coso_kinhdoanh_id = db.Column(String, ForeignKey('coso_hanhnghe.id'), index=True, nullable=True)

class ChungChiHanhNghe(CommonModel):
    __tablename__ = 'chungchi_hanhnghe'
    id = db.Column(String, primary_key=True, default=default_uuid)
    nguoi_hanhnghe_id = db.Column(String, ForeignKey('nguoi_hanhnghe_coso.id'), index=True, nullable=False)
    nguoi_hanhnghe = db.Column(JSONB)
    
    so_giay_phep = db.Column(String, index=True)
    co_quan_cap = db.Column(String)
    ngay_hieu_luc = db.Column(String)
    nam_cap = db.Column(String)
    ngay_cap = db.Column(String)
    noi_cap = db.Column(String())
    ngay_het_han = db.Column(String)
    noi_cong_tac = db.Column(String)
    ma_vanbang_cm = db.Column(String) # van bang chuyen mon
    ten_vanbang_cm = db.Column(String) # ten van bang chuyen mon
    vanbang = db.Column(JSONB)

    phamvi_hanhnghe = db.Column(JSONB)
    vitri_hanhnghe = db.Column(JSONB)
    loai_chungchi = db.Column(SmallInteger, default=1) # 1- chung chi y, 2- chung chi duoc 
    dinhkem_chungchi = db.Column(JSONB)
    dinhkem_vanbang_chuyenmon = db.Column(JSONB)
    trangthai  = db.Column(SmallInteger, default=1)

    

Index('coso_kcb_yhct_uq_ma_coso', CoSoKCBYHCT.ma_coso, unique=True, postgresql_where=(and_(CoSoKCBYHCT.ma_coso.isnot(None),CoSoKCBYHCT.ma_coso !='')))

