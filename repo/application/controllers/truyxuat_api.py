import asyncio
import aiohttp
import hashlib
import ujson
from application.extensions import apimanager
from application.server import app
from application.database import db
from sqlalchemy.orm import aliased, joinedload_all
from sqlalchemy import asc, desc
from gatco.response import json, text, html
import time
from math import floor
from application.controllers.helpers.helper_common import *
from sqlalchemy import or_, and_, desc, asc


from application.models.model_danhmuc import TieuChuanChatLuong

from application.models.model_donvi import *
from application.models.model_quanlykho import *
from application.extensions import auth

from application.controllers.upload import *
from sqlalchemy.orm.attributes import flag_modified
from application.extensions import jinja
from application.models.model_duoclieu import *
import math


@app.route("/api/v1/get_lichsu_duoclieu", methods = ["POST", "GET"])
async def get_lichsu_duoclieu(request):
    uid = current_uid(request)
    if uid is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"},status=520) 
    data = request.json
    if data is None:
        return json({"error_code" : "PARAM_ERROR", "error_message" : "Tham số không hợp lệ"}, status=520)
    id_sanpham = data.get("id_sanpham")
    donvi_id = data.get("donvi_id")
    so_lo = data.get("so_lo")
    if id_sanpham is None or donvi_id is None or so_lo is None:
        return json({"error_code" : "PARAM_ERROR", "error_message" : "Tham số không hợp lệ"}, status=520)
    lichsusanpham = db.session.query(LichSuSanPham).filter(and_(LichSuSanPham.id_sanpham_danhmuc == id_sanpham,LichSuSanPham.so_lo == so_lo, LichSuSanPham.donvi_id ==
 donvi_id)).first()

    if lichsusanpham is not None:
        return json({"lichsusanpham_id" : lichsusanpham.id}, status=200)
    else:
        return json({"error_message" : "Không tìm thấy bản ghi dữ liệu", "error_code" : "PARAM_NOT_EXITS"}, status=520)
#old
@app.route("old/api/v1/scanqrcode/duoclieu", methods = ["POST", "GET"])
async def scanqrcodeduoclieu(request):
    params = request.args

    donvi_id = None
    so_lo = None
    id_sp = None
    lichsusanpham_id = params.get("id")
    lichsusanpham = db.session.query(LichSuSanPham).filter(and_(LichSuSanPham.id == lichsusanpham_id)).first()
    if lichsusanpham is not None:
        id_sp = lichsusanpham.id_sanpham_danhmuc
    sanpham = db.session.query(DanhMucSanPham).filter(DanhMucSanPham.id == id_sp).first()
    
    if lichsusanpham is None or sanpham is None:
        return jinja.render('notfound_product.html', request)

    arr_lichsu = []

    # ten_sanpham = db.Column(String())
    # ten_khoa_hoc = db.Column(String())
    # ten_trung_quoc = db.Column(String())
    lichsu = lichsusanpham.lichsu
    if lichsu is None:
        lichsu = []
    else:
        #{id_phieu, thoigian, donvi_cungung, donvi_tiepnhan, loai_giaodich}
        # obj_nhap = { "id_phieu":obj["id"], 
        #         "loai_giaodich":"nhap",
        #         "thoigian":obj["thoigian_nhap"],
        #         "donvi_cungung":{"ma_donvi":obj["ma_donvi_cungung"],"ten_donvi":obj["ten_coso_cungung"],"diachi":obj["diachi_coso_cungung"]},
        #         "donvi_tiepnhan":{"ma_donvi":obj["donvi"]["id"],"ten_donvi":obj["donvi"]["ten_coso"],"diachi":obj["donvi"]["diachi"]}
        #         }
        lichsu = sorted(lichsusanpham.lichsu, key=lambda k: (k['thoigian']), reverse=False)
        arr_donvi_tmp = []
        arr_lichsu = []
        stt = 1
        for item in lichsu:
            print(item)
            key = ""
            if item["donvi_cungung"]["ma_donvi"] is not None:
                key = item["donvi_cungung"]["ma_donvi"]+"_"
            if item["donvi_tiepnhan"]["ma_donvi"] is not None:
                key = key + item["donvi_tiepnhan"]["ma_donvi"]
            
            if key not in arr_donvi_tmp:
                arr_donvi_tmp.append(key)
                item["thoigian"] = format_datetime_string(item["thoigian"])
                item["stt"] = stt
                stt = stt + 1
                arr_lichsu.append(item)
            else:
                continue

    # id_sanpham_danhmuc = db.Column(String , index = True, nullable = False)
    # id_chungnhan_co = db.Column(String , index = True, nullable = True)
    # chungnhan_co = db.Column(JSONB)
    # phieu_kiem_nghiem_id = db.Column(String , index = True, nullable = True)
    # chungnhan_cq = db.Column(JSONB)
    # donvi_sanxuat = db.Column(String , nullable = True)
    # donvi_cungung_bandau = db.Column(String , nullable = True)
    # id_donvi_cungung_bandau = db.Column(String , nullable = True)
    # donvi_id = db.Column(String, index = True, nullable = True)#id don vi hien tai
    # ten_sanpham = db.Column(String)
    # so_lo = db.Column(String , index = True, nullable = False)
    # hansudung = db.Column(String , index = True, nullable = True)
    # id_giaynhapkhau = db.Column(String , index = True, nullable = True)
    # thoigian_nhapkhau_thugom = db.Column(String)
    # lichsu = db.Column(JSONB)#{id_phieu, thoigian, donvi_cungung, donvi_tiepnhan, loai_giaodich}
    # trangthai = db.Column(SmallInteger, default=1)
    obj_lichsu = {}
    obj_lichsu["id"] = lichsusanpham.id
    obj_lichsu["id_sanpham_danhmuc"] = lichsusanpham.id_sanpham_danhmuc
    obj_lichsu["id_chungnhan_co"] = lichsusanpham.id_chungnhan_co
    if lichsusanpham.chungnhan_co is not None:
        obj_lichsu["so_co"] = lichsusanpham.chungnhan_co["so_co"]
        obj_lichsu["thoigian_cap_co"] = format_datetime_string(lichsusanpham.chungnhan_co["thoigian_cap_co"])
        obj_lichsu["donvi_chungnhan_co"] = lichsusanpham.chungnhan_co["donvi_chungnhan_co"] if lichsusanpham.chungnhan_co["donvi_chungnhan_co"] is not None else " "
        obj_lichsu["diachi_donvi_sanxuat"] = lichsusanpham.chungnhan_co["diachi_donvi_sanxuat"]
        obj_lichsu["tencuakhau"] = lichsusanpham.chungnhan_co["tencuakhau"]
        if lichsusanpham.chungnhan_co["quocgia_donvi_sanxuat"] is not None:
            obj_lichsu["quocgia_donvi_sanxuat"] = lichsusanpham.chungnhan_co["quocgia_donvi_sanxuat"]["ten"]   
    if lichsusanpham.chungnhan_cq is not None:
        obj_lichsu["phieu_kiem_nghiem_id"] = lichsusanpham.phieu_kiem_nghiem_id
        obj_lichsu["ma_kiem_nghiem"] = lichsusanpham.chungnhan_cq["ma_kiem_nghiem"]
        obj_lichsu["ngay_kiem_nghiem_cq"] = format_datetime_string(lichsusanpham.chungnhan_cq["ngay_kiem_nghiem"])
        obj_lichsu["ten_donvi_cap_cq"] = lichsusanpham.chungnhan_cq["ten_donvi_cap"]
        obj_lichsu["diachi_donvi_cap_cq"] = lichsusanpham.chungnhan_cq["diachi_donvi_cap"]

    obj_lichsu["donvi_sanxuat"] = lichsusanpham.donvi_sanxuat

    obj_lichsu["donvi_cungung_bandau"] = lichsusanpham.donvi_cungung_bandau
    obj_lichsu["donvi_id"] = lichsusanpham.donvi_id
    obj_lichsu["ten_sanpham"] = lichsusanpham.ten_sanpham
    obj_lichsu["ten_sanpham_khoahoc"] = sanpham.ten_khoa_hoc
    obj_lichsu["so_lo"] = lichsusanpham.so_lo
    obj_lichsu["id_giaynhapkhau"] = lichsusanpham.id_giaynhapkhau
    obj_lichsu["bophan_sudung"] = sanpham.bophan_sudung
    obj_lichsu["mota_sanpham"] = sanpham.mota
    obj_lichsu["cachdung_lieuluong"] = sanpham.cachdung_lieuluong
    obj_lichsu["kieng_ky"] = sanpham.kieng_ky
    obj_lichsu["thoigian_nhapkhau_thugom"] = format_datetime_string(lichsusanpham.thoigian_nhapkhau_thugom)
    
    
    if lichsusanpham.id_giaynhapkhau is not None:
        nhapkhau = db.session.query(GiayPhepNhapKhau).filter(GiayPhepNhapKhau.id == lichsusanpham.id_giaynhapkhau).first()
        if (nhapkhau is not None):
            obj_lichsu["so_giay_phep_nhapkhau"] = nhapkhau.so_giay_phep
    obj_lichsu["thoigian_nhapkhau_thugom"] = format_datetime_string(lichsusanpham.thoigian_nhapkhau_thugom)
    obj_lichsu["hansudung"] = format_datetime_string(lichsusanpham.hansudung)



    return jinja.render('truyxuat_nguongoc.html', request, lichsu=arr_lichsu, sanpham=obj_lichsu, static_url="/static")
    
#new scan QR
@app.route("/api/v1/scanqrcode/duoclieu", methods = ['POST', 'GET'])
async def scanqrcodeduoclieu(request):
    data = request.json
    if data is None:
        return jinja.render('notfound_product.html', request)

    donvi_id = None
    so_lo = None
    id_sp = None
    lichsusanpham_id = data.get("id")
    if lichsusanpham_id is None or lichsusanpham_id =="":
        return jinja.render('notfound_product.html', request)
    lichsusanpham = db.session.query(LichSuSanPham).filter(and_(LichSuSanPham.id == lichsusanpham_id)).first()
    if lichsusanpham is not None:
        id_sp = lichsusanpham.id_sanpham_danhmuc
    sanpham = db.session.query(DanhMucSanPham).filter(DanhMucSanPham.id == id_sp).first()
    
    if lichsusanpham is None or sanpham is None:
        return jinja.render('notfound_product.html', request)
    #thông tin sản phẩm
    sanpham_info = {
        "ten_sanpham": sanpham.ten_sanpham,
        "ten_khoa_hoc": sanpham.ten_khoa_hoc,
        "ma_viettat": sanpham.ma_viettat,
        "hansudung" : lichsusanpham.hansudung
    }
    #chứng nhận co
    chungnhan_co = None
    id_chungnhan_co = lichsusanpham.id_chungnhan_co
    if id_chungnhan_co is not None and id_chungnhan_co != "":
        chungnhan_co = db.session.query(GiayChungNhanCO).filter(\
            GiayChungNhanCO.id == id_chungnhan_co, \
            GiayChungNhanCO.deleted == False).first()

    if chungnhan_co is not None:
        sanpham_info['so_chungnhan_co'] = chungnhan_co.so_co
        sanpham_info['donvi_chungnhan_co'] = chungnhan_co.donvi_chungnhan_co
        sanpham_info['thoigian_cap_co'] = chungnhan_co.thoigian_cap_co
        sanpham_info['donvi_sanxuat'] = chungnhan_co.ten_donvi_sanxuat
        sanpham_info['donvi_cungung_bandau'] = chungnhan_co.ten_donvi_phanphoi


    #chứng nhân cq
    chungnhan_cq = None
    phieu_kiem_nghiem_id = lichsusanpham.phieu_kiem_nghiem_id
    if phieu_kiem_nghiem_id is not None and phieu_kiem_nghiem_id != "":
        chungnhan_cq = db.session.query(PhieuKiemNghiem).filter(\
            PhieuKiemNghiem.id == phieu_kiem_nghiem_id, \
            PhieuKiemNghiem.deleted == False).first()

    if chungnhan_cq is not None:
        sanpham_info['ma_kiem_nghiem'] = chungnhan_cq.ma_kiem_nghiem
        sanpham_info['ten_donvi_cap'] = chungnhan_cq.ten_donvi_cap
        sanpham_info['ngay_kiem_nghiem'] = chungnhan_cq.ngay_kiem_nghiem
        sanpham_info['so_lo'] = chungnhan_cq.so_lo

    loai_sanpham_bandau = lichsusanpham.loai_sanpham_bandau

    #nhập khẩu
    id_giaynhapkhau = lichsusanpham.id_giaynhapkhau
    thuhoach_nuoitrong_info = {}
    thuhoach_khaithac_info = {}
    if loai_sanpham_bandau == 1:

        if id_giaynhapkhau is not None and id_giaynhapkhau != "":
            giayphep_nhapkhau = db.session.query(GiayPhepNhapKhau).filter(\
                GiayPhepNhapKhau.id == id_giaynhapkhau,\
                GiayPhepNhapKhau.deleted == False).first()
            if giayphep_nhapkhau is not None:
                sanpham_info['so_giay_phep'] = giayphep_nhapkhau.so_giay_phep
                sanpham_info['thoigian_capphep'] = giayphep_nhapkhau.thoigian_capphep
        sanpham_info['donvi_nhapkhau_phanphoi_thugom'] = lichsusanpham.donvi_nhapkhau_phanphoi_thugom

    #phân phối trong nước
    elif loai_sanpham_bandau ==2:
        sanpham_info['donvi_nhapkhau_phanphoi_thugom'] = lichsusanpham.donvi_nhapkhau_phanphoi_thugom
    #thu gom
    elif loai_sanpham_bandau ==3:
        sanpham_info['donvi_nhapkhau_phanphoi_thugom'] = lichsusanpham.donvi_nhapkhau_phanphoi_thugom
    #nuôi trồng
    elif loai_sanpham_bandau ==4:
        list_diadiem_nuoitrong = []
        thuhoach_nuoitrong_id =lichsusanpham.thuhoach_nuoitrong_id
        if thuhoach_nuoitrong_id is  not None and thuhoach_nuoitrong_id != "":
            thuhoach_nuoitrong = db.session.query(DuocLieuNuoiTrong).filter(\
                DuocLieuNuoiTrong.id == thuhoach_nuoitrong_id, \
                DuocLieuNuoiTrong.deleted == False).first()
            if thuhoach_nuoitrong is not None:
                thuhoach_nuoitrong_info["ngay_lam_dat"] = thuhoach_nuoitrong.ngay_lam_dat
                thuhoach_nuoitrong_info['ngay_uom_giong'] = thuhoach_nuoitrong.ngay_uom_giong
                thuhoach_nuoitrong_info['ngay_trong_giong'] = thuhoach_nuoitrong.ngay_trong_giong
                thuhoach_nuoitrong_info['thoigian_nhap_kho'] = thuhoach_nuoitrong.thoigian_nhap_kho
                list_mota_qtrinh_chamsoc = thuhoach_nuoitrong.mota_qtrinh_chamsoc
                if isinstance(list_mota_qtrinh_chamsoc, list) == False:
                    list_mota_qtrinh_chamsoc = []
                sort_arr = sorted(list_mota_qtrinh_chamsoc, key=lambda k: k['thoigian'])

                thuhoach_nuoitrong_info['mota_qtrinh_chamsoc'] = sort_arr
                diadiem_nuoitrong  = thuhoach_nuoitrong.diadiem_nuoitrong
                if isinstance(diadiem_nuoitrong, list) == True:
                    for diadiem in diadiem_nuoitrong:
                        obj_diadiem = {
                            "ten_diadiem" : diadiem['ten_diadiem']
                        }
                        list_diadiem_nuoitrong.append(obj_diadiem)
                thuhoach_nuoitrong_info['diadiem_nuoitrong'] = list_diadiem_nuoitrong
                
        #tên đơn vị nuôi trồng 
        sanpham_info['donvi_nhapkhau_phanphoi_thugom'] = lichsusanpham.donvi_nhapkhau_phanphoi_thugom
    #khai thác tự nhiên
    elif loai_sanpham_bandau ==5:
        thuhoach_khaithac_id = lichsusanpham.thuhoach_khaithac_id
        if thuhoach_khaithac_id is not None and thuhoach_khaithac_id != "":
            thuhoach_khaithac = db.session.query(KhaiThacTuNhien).filter(\
                KhaiThacTuNhien.id == thuhoach_khaithac_id, \
                KhaiThacTuNhien.deleted == False).first()
            if thuhoach_khaithac is not None:
                thuhoach_khaithac_info['thoigian_batdau_khaithac'] = thuhoach_khaithac.thoigian_batdau_khaithac
                thuhoach_khaithac_info['thoigian_nhap_kho'] = thuhoach_khaithac.thoigian_nhap_kho
                thuhoach_khaithac_info['tong_thoigian_khaithac'] = thuhoach_khaithac.tong_thoigian_khaithac
                thuhoach_nuoitrong_info['mota_vitri_diadiem'] = thuhoach_khaithac.mota_vitri_diadiem
                list_mota_qtrinh_khaithac = thuhoach_khaithac.mota_qtrinh_khaithac
                if isinstance(list_mota_qtrinh_khaithac, list) == False:
                    list_mota_qtrinh_khaithac = []
                sort_arr = sorted(list_mota_qtrinh_khaithac, key=lambda k: k['thoigian'])
                thuhoach_khaithac_info['mota_qtrinh_khaithac'] = sort_arr
        #tên đơn vị khai thác 
        sanpham_info['donvi_nhapkhau_phanphoi_thugom'] = lichsusanpham.donvi_nhapkhau_phanphoi_thugom

    #lịch sử mua bán trao dổi sản phẩm
    lichsu = lichsusanpham.lichsu
    if isinstance(lichsu, list) == False:
        lichsu = []
    arr_lichsu = []

    lichsu = sorted(lichsusanpham.lichsu, key=lambda k: (k['thoigian']), reverse=False)
    for item in lichsu:
        donvi_tiepnhan = item.get("donvi_tiepnhan")
        if donvi_tiepnhan is not None:
            ma_donvi = donvi_tiepnhan.get("ma_donvi")
            if ma_donvi == donvi_id:
                arr_lichsu.append(item)



    return json({"sanpham_info" : sanpham_info, "loai_sanpham_bandau" : loai_sanpham_bandau, "thuhoach_nuoitrong_info": thuhoach_nuoitrong_info, "thuhoach_khaithac_info":thuhoach_khaithac_info,"arr_lichsu" : arr_lichsu}, status=200)

@app.route('/access/history', methods=['GET'])
async def truy_xuat_nguon_goc(request):

    params = request.args
    donvi_id = params.get("donvi_id",None)
    so_lo = params.get("so_lo",None)
    id_sp = params.get("id_sp",None)
    if donvi_id is None or so_lo is None or id_sp is None:
        return jinja.render('notfound_product.html', request)
    lichsusanpham = db.session.query(LichSuSanPham).filter(and_(\
        LichSuSanPham.id_sanpham_danhmuc == id_sp,LichSuSanPham.so_lo == so_lo, \
        LichSuSanPham.donvi_id == donvi_id)).first()
    sanpham = db.session.query(DanhMucSanPham).filter(DanhMucSanPham.id == id_sp).first()
    if lichsusanpham is None or sanpham is None:
        return jinja.render('notfound_product.html', request)

    arr_lichsu = []

    # ten_sanpham = db.Column(String())
    # ten_khoa_hoc = db.Column(String())
    # ten_trung_quoc = db.Column(String())
    lichsu = lichsusanpham.lichsu
    if lichsu is None:
        lichsu = []
    else:
        #{id_phieu, thoigian, donvi_cungung, donvi_tiepnhan, loai_giaodich}
        # obj_nhap = { "id_phieu":obj["id"], 
        #         "loai_giaodich":"nhap",
        #         "thoigian":obj["thoigian_nhap"],
        #         "donvi_cungung":{"ma_donvi":obj["ma_donvi_cungung"],"ten_donvi":obj["ten_coso_cungung"],"diachi":obj["diachi_coso_cungung"]},
        #         "donvi_tiepnhan":{"ma_donvi":obj["donvi"]["id"],"ten_donvi":obj["donvi"]["ten_coso"],"diachi":obj["donvi"]["diachi"]}
        #         }
        lichsu = sorted(lichsusanpham.lichsu, key=lambda k: (k['thoigian']), reverse=False)
        arr_donvi_tmp = []
        arr_lichsu = []
        stt = 1
        for item in lichsu:
            print(item)
            key = ""
            if item["donvi_cungung"]["ma_donvi"] is not None:
                key = item["donvi_cungung"]["ma_donvi"]+"_"
            if item["donvi_tiepnhan"]["ma_donvi"] is not None:
                key = key + item["donvi_tiepnhan"]["ma_donvi"]
            
            if key not in arr_donvi_tmp:
                arr_donvi_tmp.append(key)
                item["thoigian"] = format_datetime_string(item["thoigian"])
                item["stt"] = stt
                stt = stt + 1
                arr_lichsu.append(item)
            else:
                continue

    # id_sanpham_danhmuc = db.Column(String , index = True, nullable = False)
    # id_chungnhan_co = db.Column(String , index = True, nullable = True)
    # chungnhan_co = db.Column(JSONB)
    # phieu_kiem_nghiem_id = db.Column(String , index = True, nullable = True)
    # chungnhan_cq = db.Column(JSONB)
    # donvi_sanxuat = db.Column(String , nullable = True)
    # donvi_cungung_bandau = db.Column(String , nullable = True)
    # id_donvi_cungung_bandau = db.Column(String , nullable = True)
    # donvi_id = db.Column(String, index = True, nullable = True)#id don vi hien tai
    # ten_sanpham = db.Column(String)
    # so_lo = db.Column(String , index = True, nullable = False)
    # hansudung = db.Column(String , index = True, nullable = True)
    # id_giaynhapkhau = db.Column(String , index = True, nullable = True)
    # thoigian_nhapkhau_thugom = db.Column(String)
    # lichsu = db.Column(JSONB)#{id_phieu, thoigian, donvi_cungung, donvi_tiepnhan, loai_giaodich}
    # trangthai = db.Column(SmallInteger, default=1)
    obj_lichsu = {}
    obj_lichsu["id"] = lichsusanpham.id
    obj_lichsu["id_sanpham_danhmuc"] = lichsusanpham.id_sanpham_danhmuc
    obj_lichsu["id_chungnhan_co"] = lichsusanpham.id_chungnhan_co
    if lichsusanpham.chungnhan_co is not None:
        obj_lichsu["so_co"] = lichsusanpham.chungnhan_co["so_co"]
        obj_lichsu["thoigian_cap_co"] = format_datetime_string(lichsusanpham.chungnhan_co["thoigian_cap_co"])
        obj_lichsu["donvi_chungnhan_co"] = lichsusanpham.chungnhan_co["donvi_chungnhan_co"] if lichsusanpham.chungnhan_co["donvi_chungnhan_co"] is not None else " "
        obj_lichsu["diachi_donvi_sanxuat"] = lichsusanpham.chungnhan_co["diachi_donvi_sanxuat"]
        obj_lichsu["tencuakhau"] = lichsusanpham.chungnhan_co["tencuakhau"]
        if lichsusanpham.chungnhan_co["quocgia_donvi_sanxuat"] is not None:
            obj_lichsu["quocgia_donvi_sanxuat"] = lichsusanpham.chungnhan_co["quocgia_donvi_sanxuat"]["ten"]
    
    if lichsusanpham.chungnhan_cq is not None:
        obj_lichsu["phieu_kiem_nghiem_id"] = lichsusanpham.phieu_kiem_nghiem_id
        obj_lichsu["ma_kiem_nghiem"] = lichsusanpham.chungnhan_cq["ma_kiem_nghiem"]
        obj_lichsu["ngay_kiem_nghiem_cq"] = format_datetime_string(lichsusanpham.chungnhan_cq["ngay_kiem_nghiem"])
        obj_lichsu["ten_donvi_cap_cq"] = lichsusanpham.chungnhan_cq["ten_donvi_cap"]
        obj_lichsu["diachi_donvi_cap_cq"] = lichsusanpham.chungnhan_cq["diachi_donvi_cap"]


    obj_lichsu["donvi_sanxuat"] = lichsusanpham.donvi_sanxuat
    obj_lichsu["donvi_cungung_bandau"] = lichsusanpham.donvi_cungung_bandau
    obj_lichsu["donvi_id"] = lichsusanpham.donvi_id
    obj_lichsu["ten_sanpham"] = lichsusanpham.ten_sanpham
    obj_lichsu["ten_sanpham_khoahoc"] = sanpham.ten_khoa_hoc
    obj_lichsu["so_lo"] = lichsusanpham.so_lo
    obj_lichsu["id_giaynhapkhau"] = lichsusanpham.id_giaynhapkhau
    obj_lichsu["bophan_sudung"] = sanpham.bophan_sudung
    obj_lichsu["mota_sanpham"] = sanpham.mota
    obj_lichsu["cachdung_lieuluong"] = sanpham.cachdung_lieuluong
    obj_lichsu["kieng_ky"] = sanpham.kieng_ky
    obj_lichsu["thoigian_nhapkhau_thugom"] = format_datetime_string(lichsusanpham.thoigian_nhapkhau_thugom)
    
    
    if lichsusanpham.id_giaynhapkhau is not None:
        nhapkhau = db.session.query(GiayPhepNhapKhau).filter(GiayPhepNhapKhau.id == lichsusanpham.id_giaynhapkhau).first()
        if (nhapkhau is not None):
            obj_lichsu["so_giay_phep_nhapkhau"] = nhapkhau.so_giay_phep
    obj_lichsu["thoigian_nhapkhau_thugom"] = format_datetime_string(lichsusanpham.thoigian_nhapkhau_thugom)
    obj_lichsu["hansudung"] = format_datetime_string(lichsusanpham.hansudung)



    return jinja.render('truyxuat_nguongoc.html', request, lichsu=arr_lichsu, sanpham=obj_lichsu, static_url="/static")

#####get lich su san pham new
@app.route('/api/v1/access_history', methods = ['POST'])
async def access_history(request):
    data = request.json
    if data is None:
        return jinja.render('notfound_product.html', request)
    id_sp = data.get("id_sanpham")
    so_lo = data.get("so_lo")
    donvi_id = data.get("donvi_id")
    if id_sp is None or id_sp == "" or so_lo is None \
        or so_lo == "" or donvi_id is None or donvi_id == "":
        return json({"error_code": "PARRM_ERROR", "error_message": "Tham số không hợp lệ"}, status=520)
    
    lichsusanpham = db.session.query(LichSuSanPham).filter(and_(\
        LichSuSanPham.id_sanpham_danhmuc == id_sp,LichSuSanPham.so_lo == so_lo, \
        LichSuSanPham.donvi_id == donvi_id)).first()
    sanpham = db.session.query(DanhMucSanPham).filter(DanhMucSanPham.id == id_sp).first()
    if lichsusanpham is None or sanpham is None:
        return jinja.render('notfound_product.html', request)

    #thông tin sản phẩm
    sanpham_info = {
        "ten_sanpham": sanpham.ten_sanpham,
        "ten_khoa_hoc": sanpham.ten_khoa_hoc,
        "ma_viettat": sanpham.ma_viettat,
        "hansudung" : lichsusanpham.hansudung
    }
    #chứng nhận co
    chungnhan_co = None
    id_chungnhan_co = lichsusanpham.id_chungnhan_co
    if id_chungnhan_co is not None and id_chungnhan_co != "":
        chungnhan_co = db.session.query(GiayChungNhanCO).filter(\
            GiayChungNhanCO.id == id_chungnhan_co, \
            GiayChungNhanCO.deleted == False).first()

    if chungnhan_co is not None:
        sanpham_info['so_chungnhan_co'] = chungnhan_co.so_co
        sanpham_info['donvi_chungnhan_co'] = chungnhan_co.donvi_chungnhan_co
        sanpham_info['thoigian_cap_co'] = chungnhan_co.thoigian_cap_co
        sanpham_info['donvi_sanxuat'] = chungnhan_co.ten_donvi_sanxuat
        sanpham_info['donvi_cungung_bandau'] = chungnhan_co.ten_donvi_phanphoi


    #chứng nhân cq
    chungnhan_cq = None
    phieu_kiem_nghiem_id = lichsusanpham.phieu_kiem_nghiem_id
    if phieu_kiem_nghiem_id is not None and phieu_kiem_nghiem_id != "":
        chungnhan_cq = db.session.query(PhieuKiemNghiem).filter(\
            PhieuKiemNghiem.id == phieu_kiem_nghiem_id, \
            PhieuKiemNghiem.deleted == False).first()

    if chungnhan_cq is not None:
        sanpham_info['ma_kiem_nghiem'] = chungnhan_cq.ma_kiem_nghiem
        sanpham_info['ten_donvi_cap'] = chungnhan_cq.ten_donvi_cap
        sanpham_info['ngay_kiem_nghiem'] = chungnhan_cq.ngay_kiem_nghiem
        sanpham_info['so_lo'] = chungnhan_cq.so_lo

    loai_sanpham_bandau = lichsusanpham.loai_sanpham_bandau

    #nhập khẩu
    id_giaynhapkhau = lichsusanpham.id_giaynhapkhau
    thuhoach_nuoitrong_info = {}
    thuhoach_khaithac_info = {}
    if loai_sanpham_bandau == 1:

        if id_giaynhapkhau is not None and id_giaynhapkhau != "":
            giayphep_nhapkhau = db.session.query(GiayPhepNhapKhau).filter(\
                GiayPhepNhapKhau.id == id_giaynhapkhau,\
                GiayPhepNhapKhau.deleted == False).first()
            if giayphep_nhapkhau is not None:
                sanpham_info['so_giay_phep'] = giayphep_nhapkhau.so_giay_phep
                sanpham_info['thoigian_capphep'] = giayphep_nhapkhau.thoigian_capphep
        sanpham_info['donvi_nhapkhau_phanphoi_thugom'] = lichsusanpham.donvi_nhapkhau_phanphoi_thugom

    #phân phối trong nước
    elif loai_sanpham_bandau ==2:
        sanpham_info['donvi_nhapkhau_phanphoi_thugom'] = lichsusanpham.donvi_nhapkhau_phanphoi_thugom
    #thu gom
    elif loai_sanpham_bandau ==3:
        sanpham_info['donvi_nhapkhau_phanphoi_thugom'] = lichsusanpham.donvi_nhapkhau_phanphoi_thugom
    #nuôi trồng
    elif loai_sanpham_bandau ==4:
        list_diadiem_nuoitrong = []
        thuhoach_nuoitrong_id =lichsusanpham.thuhoach_nuoitrong_id
        if thuhoach_nuoitrong_id is  not None and thuhoach_nuoitrong_id != "":
            thuhoach_nuoitrong = db.session.query(DuocLieuNuoiTrong).filter(\
                DuocLieuNuoiTrong.id == thuhoach_nuoitrong_id, \
                DuocLieuNuoiTrong.deleted == False).first()
            if thuhoach_nuoitrong is not None:
                thuhoach_nuoitrong_info["ngay_lam_dat"] = thuhoach_nuoitrong.ngay_lam_dat
                thuhoach_nuoitrong_info['ngay_uom_giong'] = thuhoach_nuoitrong.ngay_uom_giong
                thuhoach_nuoitrong_info['ngay_trong_giong'] = thuhoach_nuoitrong.ngay_trong_giong
                thuhoach_nuoitrong_info['thoigian_nhap_kho'] = thuhoach_nuoitrong.thoigian_nhap_kho
                list_mota_qtrinh_chamsoc = thuhoach_nuoitrong.mota_qtrinh_chamsoc
                if isinstance(list_mota_qtrinh_chamsoc, list) == False:
                    list_mota_qtrinh_chamsoc = []
                sort_arr = sorted(list_mota_qtrinh_chamsoc, key=lambda k: k['thoigian'])
                thuhoach_nuoitrong_info['mota_qtrinh_chamsoc'] = sort_arr
                diadiem_nuoitrong  = thuhoach_nuoitrong.diadiem_nuoitrong
                if isinstance(diadiem_nuoitrong, list) == True:
                    for diadiem in diadiem_nuoitrong:
                        obj_diadiem = {
                            "ten_diadiem" : diadiem['ten_diadiem']
                        }
                        list_diadiem_nuoitrong.append(obj_diadiem)
                thuhoach_nuoitrong_info['diadiem_nuoitrong'] = list_diadiem_nuoitrong
                
        #tên đơn vị nuôi trồng 
        sanpham_info['donvi_nhapkhau_phanphoi_thugom'] = lichsusanpham.donvi_nhapkhau_phanphoi_thugom
    #khai thác tự nhiên
    elif loai_sanpham_bandau ==5:
        thuhoach_khaithac_id = lichsusanpham.thuhoach_khaithac_id
        if thuhoach_khaithac_id is not None and thuhoach_khaithac_id != "":
            thuhoach_khaithac = db.session.query(KhaiThacTuNhien).filter(\
                KhaiThacTuNhien.id == thuhoach_khaithac_id, \
                KhaiThacTuNhien.deleted == False).first()
            if thuhoach_khaithac is not None:
                thuhoach_khaithac_info['thoigian_batdau_khaithac'] = thuhoach_khaithac.thoigian_batdau_khaithac
                thuhoach_khaithac_info['thoigian_nhap_kho'] = thuhoach_khaithac.thoigian_nhap_kho
                thuhoach_khaithac_info['tong_thoigian_khaithac'] = thuhoach_khaithac.tong_thoigian_khaithac
                thuhoach_nuoitrong_info['mota_vitri_diadiem'] = thuhoach_khaithac.mota_vitri_diadiem
                list_mota_qtrinh_khaithac = thuhoach_khaithac.mota_qtrinh_khaithac
                if isinstance(list_mota_qtrinh_khaithac, list) == False:
                    list_mota_qtrinh_khaithac = []
                sort_arr = sorted(list_mota_qtrinh_khaithac, key=lambda k: k['thoigian'])
                thuhoach_khaithac_info['mota_qtrinh_khaithac'] = sort_arr
        #tên đơn vị khai thác 
        sanpham_info['donvi_nhapkhau_phanphoi_thugom'] = lichsusanpham.donvi_nhapkhau_phanphoi_thugom

    #lịch sử mua bán trao dổi sản phẩm
    lichsu = lichsusanpham.lichsu
    if isinstance(lichsu, list) == False:
        lichsu = []
    arr_lichsu = []

    lichsu = sorted(lichsusanpham.lichsu, key=lambda k: (k['thoigian']), reverse=False)
    for item in lichsu:
        donvi_tiepnhan = item.get("donvi_tiepnhan")
        if donvi_tiepnhan is not None:
            ma_donvi = donvi_tiepnhan.get("ma_donvi")
            if ma_donvi == donvi_id:
                arr_lichsu.append(item)



    return json({"sanpham_info" : sanpham_info, "loai_sanpham_bandau" : loai_sanpham_bandau, "thuhoach_nuoitrong_info": thuhoach_nuoitrong_info, "thuhoach_khaithac_info":thuhoach_khaithac_info,"arr_lichsu" : arr_lichsu}, status=200)


@app.route('/api/v1/truyxuat', methods = ['POST', 'GET'])
async def truyxuat(request):
    uid_current = current_user(request)
    if uid_current is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    else:
        page = int(request.args.get('page')) #args to get any bien tren URL
        results_per_page = int(request.args.get('results_per_page'))
        filters = request.args.get("q")
        if filters is not None:
            filters = ujson.loads(filters)

        text_search = None
        search_kho = None
        search_nhapkhau = None
        search_co = None
        search_cq = None
        donvi_id_tmp = None


        #kho-nhapkhau-co-cq
        #0000
        #....
        #1111

        #ưu tiên nhập khẩu- co- cq
        listCo = []
        listIdDonvi = []
        listResults = []
        listIdKho = []

        #ID san pham


        if isinstance(filters, dict) and 'filters' in filters and filters['filters'] is not None:
            obj = filters['filters']
            if '$and' in obj and obj['$and'] is not None:
                arrFilter = obj['$and']
                if isinstance(arrFilter, list) and len(arrFilter) >0:
                    for item in arrFilter:
                        if 'text_search' in item and item['text_search'] is not None:
                            text_search = item['text_search']
                        
                        if 'arrKey' in item and isinstance(item['arrKey'], list):
                            if 'ma' in item['arrKey'] or 'ten' in item['arrKey'] or 'solo' in item['arrKey']:
                                search_kho = True
                            if 'nhapkhau' in item['arrKey']:
                                search_nhapkhau = True
                            if 'cq' in item['arrKey']:
                                search_cq = True
                            if 'co' in item['arrKey']:
                                search_co = True

        donvi_id = uid_current.donvi_id
        check_donvi = db.session.query(DonVi).filter(DonVi.id == donvi_id, DonVi.active ==  True, DonVi.deleted == False).first()
        tuyendonvi_id = None
        if check_donvi is not None:
            tuyendonvi_id = check_donvi.tuyendonvi_id

        text = '%{}%'.format(text_search)
        text_khongdau = '%{}%'.format(convert_text_khongdau(text_search))

        checkSanPham = None
        if tuyendonvi_id == "10":
            checkSanPham = db.session.query(KhoSanPham)
        else:
            checkSanPham = db.session.query(KhoSanPham).filter(KhoSanPham.donvi_id == donvi_id)

        if search_nhapkhau == True:
            checkCo = db.session.query(GiayChungNhanCO).filter(GiayChungNhanCO.loai_co == 1, \
                GiayChungNhanCO.so_giay_phep == text_search).all()

            for item in checkCo:
                so_co = item.so_co
                dv_id = item.donvi_id
                if so_co is not None and so_co not in listCo:
                    listCo.append(so_co)
                if dv_id is not None and dv_id not in listIdDonvi:
                    listIdDonvi.append(dv_id)


            checkKho = db.session.query(KhoSanPham).join(GiayPhepNhapKhauChiTiet, \
                KhoSanPham.ten_sanpham == GiayPhepNhapKhauChiTiet.ten_sanpham).filter(\
                (or_(KhoSanPham.ten_sanpham.ilike(text), \
                KhoSanPham.tenkhongdau.ilike(text_khongdau)))).all()
            
            for item in checkKho:
                id_kho = item.id
                listIdKho.append(id_kho)


        if search_kho is None and search_nhapkhau is None and search_co is None and search_cq is None:
            ##mac dinh tim kiem theo ten, ma, solo
            checkSanPham = checkSanPham.filter(or_(\
                KhoSanPham.tenkhongdau.ilike(text_khongdau), \
                KhoSanPham.ma_sanpham.ilike(text), KhoSanPham.ten_sanpham.ilike(text), \
                KhoSanPham.so_lo == text_search))
        elif search_kho is None and search_nhapkhau is None and search_co is None and search_cq == True:
            checkSanPham = checkSanPham.filter(KhoSanPham.ma_kiem_nghiem == text_search)
        elif search_kho is None and search_nhapkhau is None and search_co == True and search_cq is None:
            checkSanPham = checkSanPham.filter(KhoSanPham.so_co == text_search)
        elif search_kho is None and search_nhapkhau is None and search_co == True and search_cq == True:
            checkSanPham = checkSanPham.filter(or_(\
                KhoSanPham.so_co == text_search, \
                KhoSanPham.ma_kiem_nghiem == text_search))
        elif search_kho is None and search_nhapkhau == True and search_co is None and search_cq is None:            
            checkSanPham = checkSanPham.filter(or_(\
                and_(KhoSanPham.so_co.in_(listCo), KhoSanPham.donvi_id.in_(listIdDonvi)),\
                KhoSanPham.id.in_(listIdKho)))
        elif search_kho is None and search_nhapkhau == True and search_co is None and search_cq == True:
            checkSanPham = checkSanPham.filter(or_(\
                KhoSanPham.ma_kiem_nghiem == text_search, \
                KhoSanPham.id.in_(listIdKho), \
                and_(KhoSanPham.so_co.in_(listCo), KhoSanPham.ma_kiem_nghiem.in_(listIdDonvi))))
        elif search_kho is None and search_nhapkhau == True and search_co == True and search_cq is None:
            checkSanPham = checkSanPham.filter(or_(\
                KhoSanPham.so_co == text_search, \
                KhoSanPham.id.in_(listIdKho), \
                and_(KhoSanPham.so_co.in_(listCo), KhoSanPham.donvi_id.in_(listIdDonvi))))
        elif search_kho is None and search_nhapkhau == True and search_co == True and search_cq == True:
            checkSanPham = checkSanPham.filter(or_(\
                KhoSanPham.so_co == text_search, \
                KhoSanPham.ma_kiem_nghiem == text_search, \
                KhoSanPham.id.in_(listIdKho), \
                and_(KhoSanPham.so_co.in_(listCo), KhoSanPham.donvi_id.in_(listIdDonvi))))
        elif search_kho == True and search_nhapkhau is None and search_co is None and search_cq is None:
            checkSanPham = checkSanPham.filter(or_(\
                KhoSanPham.tenkhongdau.ilike(text_khongdau), \
                KhoSanPham.ma_sanpham.ilike(text), KhoSanPham.ten_sanpham.ilike(text), \
                KhoSanPham.so_lo == text_search))
        elif search_kho == True and search_nhapkhau is None and search_co is None and search_cq == True:
            checkSanPham = checkSanPham.filter(or_(\
                KhoSanPham.tenkhongdau.ilike(text_khongdau), \
                KhoSanPham.ma_sanpham.ilike(text), KhoSanPham.ten_sanpham.ilike(text), \
                KhoSanPham.so_lo == text_search, \
                KhoSanPham.ma_kiem_nghiem == text_search))
        elif search_kho == True and search_nhapkhau is None and search_co == True and search_cq is None:
            checkSanPham = checkSanPham.filter(or_(\
                KhoSanPham.tenkhongdau.ilike(text_khongdau), \
                KhoSanPham.ma_sanpham.ilike(text), KhoSanPham.ten_sanpham.ilike(text), \
                KhoSanPham.so_lo == text_search,\
                KhoSanPham.so_co == text_search))
        elif search_kho == True and search_nhapkhau is None and search_co == True and search_cq == True:
            checkSanPham = checkSanPham.filter(or_(\
                KhoSanPham.tenkhongdau.ilike(text_khongdau), \
                KhoSanPham.ma_sanpham.ilike(text), KhoSanPham.ten_sanpham.ilike(text), \
                KhoSanPham.so_lo == text_search,\
                KhoSanPham.so_co == text_search,\
                KhoSanPham.ma_kiem_nghiem == text_search))
        elif search_kho == True and search_nhapkhau == True and search_co is None and search_cq is None:
            checkSanPham = checkSanPham.filter(or_(\
                KhoSanPham.tenkhongdau.ilike(text_khongdau), \
                KhoSanPham.ma_sanpham.ilike(text), KhoSanPham.ten_sanpham.ilike(text), \
                KhoSanPham.so_lo == text_search,\
                KhoSanPham.id.in_(listIdKho), \
                and_(KhoSanPham.so_co.in_(listCo), KhoSanPham.donvi_id.in_(listIdDonvi))))
        elif search_kho == True and search_nhapkhau == True and search_co is None and search_cq == True:
            checkSanPham = checkSanPham.filter(or_(\
                KhoSanPham.tenkhongdau.ilike(text_khongdau), \
                KhoSanPham.ma_sanpham.ilike(text), KhoSanPham.ten_sanpham.ilike(text), \
                KhoSanPham.so_lo == text_search,\
                KhoSanPham.id.in_(listIdKho), \
                KhoSanPham.ma_kiem_nghiem == text_search,\
                and_(KhoSanPham.so_co.in_(listCo), KhoSanPham.donvi_id.in_(listIdDonvi))))
        elif search_kho == True and search_nhapkhau == True and search_co == True and search_cq is None:
            checkSanPham = checkSanPham.filter(or_(\
                KhoSanPham.tenkhongdau.ilike(text_khongdau), \
                KhoSanPham.ma_sanpham.ilike(text), KhoSanPham.ten_sanpham.ilike(text), \
                KhoSanPham.so_lo == text_search,\
                KhoSanPham.so_co == text_search,\
                KhoSanPham.id.in_(listIdKho), \
                and_(KhoSanPham.so_co.in_(listCo), KhoSanPham.donvi_id.in_(listIdDonvi))))
        elif search_kho == True and search_nhapkhau == True and search_co == True and search_cq == True:
            checkSanPham = checkSanPham.filter(or_(\
                KhoSanPham.tenkhongdau.ilike(text_khongdau), \
                KhoSanPham.ma_sanpham.ilike(text), KhoSanPham.ten_sanpham.ilike(text), \
                KhoSanPham.so_lo == text_search,\
                KhoSanPham.so_co == text_search,\
                KhoSanPham.id.in_(listIdKho), \
                KhoSanPham.ma_kiem_nghiem == text_search,\
                and_(KhoSanPham.so_co.in_(listCo), KhoSanPham.donvi_id.in_(listIdDonvi))))


        ## phân trang
        if page is None:
            page = 1
        if results_per_page is None:
            results_per_page = 10
        elif results_per_page == 0:
            results_per_page = 1
        ##đếm số bản ghi trong database
        count = checkSanPham.filter(KhoSanPham.deleted == False).count()
        checkSanPham = checkSanPham.limit(results_per_page).offset(results_per_page*(page-1)).all()
        total_pages = math.ceil(count/results_per_page)
        stt = 1
        for item in checkSanPham:
            donvi = item.donvi
            ten_khoa_hoc = ""
            if item.sanpham is not None:
                if 'ten_khoa_hoc' in item.sanpham:
                    ten_khoa_hoc = item.sanpham.get("ten_khoa_hoc")
                else:
                    sanpham = item.sanpham.get("sanpham")
                    if sanpham is not None:
                        ten_khoa_hoc = sanpham.get("ten_khoa_hoc")
            tmp = {
                "id_sanpham": item.id_sanpham,
                "ma_sanpham": item.ma_sanpham,
                "ten_sanpham": item.ten_sanpham,
                "tenkhongdau": item.tenkhongdau,
                "ten_khoa_hoc": ten_khoa_hoc,
                "so_lo": item.so_lo,
                "ma_kiem_nghiem": item.ma_kiem_nghiem,
                "so_co": item.so_co,
                "donvi_id": item.donvi_id,
                "id" : item.id
            }
            if donvi is not None:
                tmp['ten_coso'] = donvi.ten_coso
            id_sanpham = item.id_sanpham
            so_lo = item.so_lo
            donvi_id = item.donvi_id
            if id_sanpham is not None and so_lo is not None and donvi_id is not None and id_sanpham != ""\
                and so_lo != "" and donvi_id != "":
                item_id_lichsu = ""
                lichsu = db.session.query(LichSuSanPham.id, LichSuSanPham.loai_sanpham_bandau, LichSuSanPham.donvi_nhapkhau_phanphoi_thugom).filter(LichSuSanPham.id_sanpham_danhmuc == id_sanpham, \
                    LichSuSanPham.so_lo == so_lo, LichSuSanPham.donvi_id == donvi_id, \
                    LichSuSanPham.deleted == False).first()
                if lichsu is not None:
                    item_id_lichsu = lichsu[0]
                    item_loai_sanpham_bandau = lichsu[1]
                    item_donvi_nhapkhau_phanphoi_thugom = lichsu[2]
                    tmp['lichsu_id'] = item_id_lichsu
                    tmp['loai_sanpham_bandau'] = item_loai_sanpham_bandau
                    tmp['donvi_nhapkhau_phanphoi_thugom'] = item_donvi_nhapkhau_phanphoi_thugom
            tmp['stt'] = stt
            listResults.append(tmp)
            stt +=1


        return json({'page' : page,'objects' : listResults,'total_pages': total_pages,'num_results': count}, status=200)

@app.route('/api/v1/access/history')
async def history(request):
    return jinja.render('new_truyxuat_nguongoc.html', request, current_time = "20210525100113")

@app.route('/api/v1/scanqrcode')
async def scanqrcode(request):
    return jinja.render('new_truyxuat_nguon_goc_qr.html', request, current_time= "20210525100113")


@app.route('/api/v1/search', methods = ['POST'])
async def search(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    if data is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)

    results = []
    loai_timkiem = data.get("loai_timkiem")
    #nhập khẩu
    if loai_timkiem == 1:
        tungay = data.get("tungay")
        denngay = data.get("denngay")
        so_giay_phep = data.get("so_giay_phep")
        trangthai = data.get("trangthai")
        donvi_id = data.get("donvi_id")

        check_giaypphep = db.session.query(GiayPhepNhapKhau)

        if donvi_id is not None and donvi_id != "":
            check_giaypphep = check_giaypphep.filter(GiayPhepNhapKhau.donvi_id == donvi_id)
        
        if so_giay_phep is not None and so_giay_phep != "":
            check_giaypphep = check_giaypphep.filter(GiayPhepNhapKhau.so_giay_phep == so_giay_phep)

        if tungay is not None and tungay !="":
            check_giaypphep = check_giaypphep.filter(GiayPhepNhapKhau.thoigian_capphep >= tungay)
        
        if denngay is not None and denngay != "":
            check_giaypphep = check_giaypphep.filter(GiayPhepNhapKhau.thoigian_capphep <= denngay)
        
        if trangthai is not None and trangthai != "" and trangthai != "10":
            check_giaypphep = check_giaypphep.filter(GiayPhepNhapKhau.trangthai == trangthai)
        
        check_giaypphep = check_giaypphep.filter(GiayPhepNhapKhau.deleted == False).all()
        for item in check_giaypphep:
            results.append(to_dict(item))
    #co
    elif loai_timkiem ==2:
        tungay = data.get("tungay")
        denngay = data.get("denngay")
        so_co = data.get("so_co")
        trangthai = data.get("trangthai")
        donvi_id = data.get("donvi_id")
        
        check_co = db.session.query(GiayChungNhanCO)

        if donvi_id is not None and donvi_id != "":
            check_co = check_co.filter(GiayChungNhanCO.donvi_id == donvi_id)
        
        if so_co is not None and so_co != "":
            check_co = check_co.filter(GiayChungNhanCO.so_co == so_co)

        if tungay is not None and tungay != "":
            check_co = check_co.filter(GiayChungNhanCO.thoigian_cap_co >= tungay)

        if denngay is not None and denngay != "":
            check_co = check_co.filter(GiayChungNhanCO.thoigian_cap_co <= denngay)

        if trangthai is not None and trangthai != "" and trangthai != "10":
            check_co = check_co.filter(GiayChungNhanCO.trangthai == trangthai)
        
        check_co = check_co.filter(GiayChungNhanCO.deleted == False).all()
        for item in check_co:
            results.append(to_dict(item))
    #cq
    elif loai_timkiem ==3:
        tungay = data.get("tungay")
        denngay = data.get("denngay")
        ma_kiem_nghiem = data.get("ma_kiem_nghiem")
        trangthai = data.get("trangthai")
        donvi_id = data.get("donvi_id")

        check_cq = db.session.query(PhieuKiemNghiem)

        if donvi_id is not None and donvi_id != "":
            check_cq = check_cq.filter(PhieuKiemNghiem.donvi_id == donvi_id)

        if ma_kiem_nghiem is not None and ma_kiem_nghiem != "":
            check_cq = check_cq.filter(PhieuKiemNghiem.ma_kiem_nghiem == ma_kiem_nghiem)

        if tungay is not None and tungay != "":
            check_cq = check_cq.filter(PhieuKiemNghiem.ngay_kiem_nghiem >= tungay)

        if denngay is not None and denngay !="":
            check_cq = check_cq.filter(PhieuKiemNghiem.ngay_kiem_nghiem <= denngay)

        if trangthai is not None and trangthai != "" and trangthai != "10":
            check_cq = check_cq.filter(PhieuKiemNghiem.trangthai == trangthai)

        check_cq = check_cq.filter(PhieuKiemNghiem.deleted == False).all()
        for item in check_cq:
            results.append(to_dict(item))
    #sản phẩm
    elif loai_timkiem ==4:
        id_sanpham = data.get("id_sanpham")
        donvi_id = data.get("donvi_id")
        so_lo = data.get("so_lo")
        if id_sanpham is None or id_sanpham == "":
            return json({"error_code": "PARAM_ERROR", "error_message": "Tham số không hợp lệ"}, status=520)
        
        khosanpham = db.session.query(KhoSanPham).filter(KhoSanPham.id_sanpham == id_sanpham)

        if donvi_id is not None and donvi_id != "":
            khosanpham = khosanpham.filter(KhoSanPham.donvi_id == donvi_id)
        
        if so_lo is not None and so_lo != "":
            khosanpham = khosanpham.filter(KhoSanPham.so_lo == so_lo)
        
        khosanpham = khosanpham.filter(KhoSanPham.deleted == False).all()

        for item in khosanpham:
            item_donvi_id = item.donvi_id
            item_donvi_ten = ""
            item_donvi = db.session.query(DonVi).filter(DonVi.id == item_donvi_id).first()
            if item_donvi is not None:
                item_donvi_ten = item_donvi.ten_coso

            item_so_lo =  item.so_lo
            
            item_lichsu = db.session.query(LichSuSanPham.id).filter(LichSuSanPham.id_sanpham_danhmuc == id_sanpham,\
                LichSuSanPham.so_lo == item_so_lo, LichSuSanPham.donvi_id == item_donvi_id).first()
            
            item_id_lichsu = ""
            if item_lichsu is not None:
                item_id_lichsu = item_lichsu[0]
            tmp = to_dict(item)
            tmp['ten_donvi'] =  item_donvi_ten
            tmp['lichsu_id'] = item_id_lichsu
            results.append(to_dict(tmp))

    return json({"results" : results}, status=200)