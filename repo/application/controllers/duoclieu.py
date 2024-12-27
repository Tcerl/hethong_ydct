import asyncio
import aiohttp
import hashlib
import ujson
from application.extensions import apimanager
from application.server import app
from application.database import db
from sqlalchemy.orm import aliased, joinedload_all
# from sqlalchemy import has
from gatco.response import json, text, html
import time
from datetime import datetime, timezone
from application.client import HTTPClient
from math import floor
from application.controllers.helpers.helper_common import *
from application.models.model_donvi import User, DonVi, GiayChungNhanCO, GiayChungNhanCOChitiet, PhieuKiemNghiem,GiayPhepNhapKhau, GiayPhepNhapKhauChiTiet
from application.extensions import auth
from sqlalchemy.orm.attributes import flag_modified
from gatco_restapi.helpers import to_dict
from sqlalchemy import or_, and_, desc, asc
from sqlalchemy import update
import ujson
from application.extensions import jinja
import os
import math
from io import BytesIO
from application.models.model_sanpham import DuocLieuDonVi, DanhMucDuocLieu, DanhMucDuocLieu


@app.route('/api/v1/get_ds_sanpham_ds_sanpham_donvi', methods = ["POST", "GET"])
async def get_ds_sanpham_ds_sanpham_donvi(request):
    uid_current = current_uid(request)
    if uid_current is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    data = request.json
    if data is None:
        return json({"error_code" : "PARRAM_ERROR", "error_message" : "Tham số không hợp lệ"}, status=520)
    donvi_id = data.get("donvi_id")
    if donvi_id is None:
        return json({"error_code" : "PARRAM_ERROR", "error_message" : "Tham số không hợp lệ"}, status=520)
    ds_sanpham = []
    ds_sanpham_donvi = []
    ds_sanpham_id = []
    ds_sanpham_donvi_id = []

    check_ds_sanpham_dv = db.session.query(DuocLieuDonVi.id_sanpham, DuocLieuDonVi.ten_sanpham, DuocLieuDonVi.ten_khoa_hoc, \
        DuocLieuDonVi.tenkhongdau, DuocLieuDonVi.bophan_sudung, DuocLieuDonVi.ma_viettat, DuocLieuDonVi.ten_thuong_mai, DuocLieuDonVi.ma_sanpham_donvi)\
        .filter(and_(DuocLieuDonVi.donvi_id == donvi_id, DuocLieuDonVi.deleted == False))\
        .order_by(desc(DuocLieuDonVi.tenkhongdau))\
        .order_by(desc(DuocLieuDonVi.ten_sanpham)).all()
    if check_ds_sanpham_dv is not None and isinstance(check_ds_sanpham_dv, list):
        for item in check_ds_sanpham_dv:
            id_sanpham = item[0]
            ten_sanpham = item[1]
            ten_khoa_hoc = item[2]
            tenkhongdau = item[3] 
            bophan_sudung = item[4] 
            ma_viettat = item[5]
            ten_thuong_mai = item[6]
            ma_sanpham_donvi = item[7]
            if id_sanpham is not None and id_sanpham not in ds_sanpham_donvi_id:
                ds_sanpham_donvi_id.append(id_sanpham)
                objs = {
                    "id_sanpham" : id_sanpham,
                    "ten_sanpham" : ten_sanpham,
                    "ten_khoa_hoc" : ten_khoa_hoc,
                    "bophan_sudung" : bophan_sudung,
                    "tenkhongdau" : tenkhongdau,
                    "ma_viettat" : ma_viettat,
                    "ten_thuong_mai": ten_thuong_mai,
                    'ma_sanpham_donvi': ma_sanpham_donvi
                }
                ds_sanpham_donvi.append(objs)
            else:
                continue

    check_ds_sanpham = db.session.query(DanhMucDuocLieu.id, DanhMucDuocLieu.ten_sanpham, \
        DanhMucDuocLieu.ten_khoa_hoc, DanhMucDuocLieu.tenkhongdau, DanhMucDuocLieu.bophan_sudung, DanhMucDuocLieu.ma_viettat).filter(\
        and_(DanhMucDuocLieu.deleted == False, \
        DanhMucDuocLieu.id.notin_(ds_sanpham_donvi_id)))\
        .order_by(desc(DanhMucDuocLieu.tenkhongdau))\
        .order_by(desc(DanhMucDuocLieu.ten_sanpham)).all()
    if check_ds_sanpham is not None and isinstance(check_ds_sanpham, list):
        for item in check_ds_sanpham:
            id_sanpham = item[0]
            ten_sanpham = item[1]
            ten_khoa_hoc = item[2]
            tenkhongdau = item[3] 
            bophan_sudung = item[4]
            ma_viettat = item[5]
            if id_sanpham is not None and id_sanpham not in ds_sanpham_donvi_id:
                ds_sanpham_id.append(id_sanpham)
                objs = {
                    "id_sanpham" : id_sanpham,
                    "ten_sanpham" : ten_sanpham,
                    "ten_khoa_hoc" : ten_khoa_hoc,
                    "bophan_sudung" : bophan_sudung,
                    "tenkhongdau" : tenkhongdau,
                    "ma_viettat" : ma_viettat
                }
                ds_sanpham.append(objs)
            else:
                continue

    objects = {
        "ds_sanpham" : ds_sanpham,
        "ds_sanpham_id" : ds_sanpham_id,
        "ds_sanpham_donvi" : ds_sanpham_donvi,
        "ds_sanpham_donvi_id" : ds_sanpham_donvi_id
    }
    return json({"objects" : objects}, status=200)

@app.route('/api/v1/save_data_duoclieu_donvi', methods = ["POST"])
async def save_data_duoclieu_donvi(request):
    uid_current = current_uid(request)
    if uid_current is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    data = request.json
    if data is None:
        return json({"error_code" : "PARRAM_ERROR", "error_message" : "Tham số không hợp lệ"}, status=520)
    donvi_id = data.get("donvi_id")
    if donvi_id is None:
        return json({"error_code" : "PARRAM_ERROR", "error_message" : "Tham số không hợp lệ"}, status=520)
    ds_duoclieu = data.get("objects")
    if ds_duoclieu is None:
        ds_duoclieu = []

    print("so san pham gui len==============: ", len(ds_duoclieu))
    cnt = 0

    check_sanpham = db.session.query(DuocLieuDonVi).filter(and_(DuocLieuDonVi.donvi_id == donvi_id)).delete()
    db.session.flush()
    for item in ds_duoclieu:
        sanpham = DuocLieuDonVi()
        sanpham.id = default_uuid()
        check_sanpham = db.session.query(DanhMucDuocLieu).filter(and_(\
            DanhMucDuocLieu.id == item['id_sanpham'],\
            DanhMucDuocLieu.deleted == False)).first()
        if check_sanpham is not None:
            sanpham.id_sanpham = check_sanpham.id
            sanpham.ma_sanpham = check_sanpham.ma_sanpham
            sanpham.ma_bhxh = check_sanpham.ma_bhxh
            sanpham.ma_boyte = check_sanpham.ma_boyte
            sanpham.ma_sanxuat = check_sanpham.ma_sanxuat
            sanpham.ten_sanpham = check_sanpham.ten_sanpham
            sanpham.ten_khoa_hoc = check_sanpham.ten_khoa_hoc
            sanpham.ten_trung_quoc = check_sanpham.ten_trung_quoc
            sanpham.tenkhongdau = check_sanpham.tenkhongdau
            if item.get("ten_thuong_mai") is not None and item.get("ten_thuong_mai") != "":
                sanpham.ten_thuong_mai = item.get("ten_thuong_mai")

            if item.get("ma_sanpham_donvi") is not None and item.get("ma_sanpham_donvi") !="":
                checkDuocLieuDonVi = db.session.query(DuocLieuDonVi).filter(\
                    DuocLieuDonVi.donvi_id == donvi_id, \
                    DuocLieuDonVi.ma_sanpham_donvi == item.get("ma_sanpham_donvi"),\
                    DuocLieuDonVi.deleted == False).first()
                if checkDuocLieuDonVi is not None:
                    return json({'error_code':'PARAM_ERROR', 'error_message': 'Mã dược liệu đơn vị {} đã tồn tại trong danh mục của đơn vị, vui lòng nhập mã khác'.format(item.get("ma_sanpham_donvi"))}, status=520)
                else:
                    sanpham.ma_sanpham_donvi = item.get("ma_sanpham_donvi")

            
            sanpham.ma_nhom = check_sanpham.ma_nhom
            sanpham.ten_nhom = check_sanpham.ten_nhom
            sanpham.mota = check_sanpham.mota
            sanpham.hang_sanxuat = check_sanpham.hang_sanxuat
            sanpham.nuoc_sanxuat = check_sanpham.nuoc_sanxuat
            sanpham.ma_nuoc_sanxuat = check_sanpham.ma_nuoc_sanxuat
            sanpham.loai_sanpham = check_sanpham.loai_sanpham
            sanpham.donvitinh = check_sanpham.donvitinh
            sanpham.bophan_sudung = check_sanpham.bophan_sudung
            sanpham.ma_hanghoa = check_sanpham.ma_hanghoa
            sanpham.ma_viettat = check_sanpham.ma_viettat
            sanpham.ma_danhmuc = check_sanpham.ma_danhmuc
            sanpham.thuoc_ho = check_sanpham.thuoc_ho
            sanpham.vi_phau = check_sanpham.vi_phau
            sanpham.bot = check_sanpham.bot
            sanpham.dinh_tinh = check_sanpham.dinh_tinh
            sanpham.do_am = check_sanpham.do_am
            sanpham.tro_toanphan = check_sanpham.tro_toanphan
            sanpham.tro_khongtan_trongacid = check_sanpham.tro_khongtan_trongacid
            sanpham.chiso_acid = check_sanpham.chiso_acid
            sanpham.chiso_carbonyl = check_sanpham.chiso_acid
            sanpham.chiso_peroxyd = check_sanpham.chiso_peroxyd
            sanpham.tyle_vun_nat = check_sanpham.tyle_vun_nat
            sanpham.tap_chat = check_sanpham.tap_chat
            sanpham.kimloainang = check_sanpham.kimloainang
            sanpham.chat_chiet_trong_sanpham = check_sanpham.chat_chiet_trong_sanpham
            sanpham.dinh_luong = check_sanpham.dinh_luong
            sanpham.che_bien = check_sanpham.che_bien
            sanpham.bao_che = check_sanpham.bao_che
            sanpham.bao_quan = check_sanpham.bao_quan
            sanpham.tinh_vi_quy_kinh = check_sanpham.tinh_vi_quy_kinh
            sanpham.congnang_chutri = check_sanpham.congnang_chutri
            sanpham.cachdung_lieuluong = check_sanpham.cachdung_lieuluong
            sanpham.kieng_ky = check_sanpham.kieng_ky
            sanpham.chungtu_dinhkem = check_sanpham.chungtu_dinhkem
            sanpham.thumbnail = check_sanpham.thumbnail
            sanpham.hinhanh = check_sanpham.hinhanh
            sanpham.donvi_id = donvi_id
            db.session.add(sanpham)
            db.session.flush()
        else:
            cnt +=1
        
    print("danh sach duoc lieu khong  them vaof duoc=========: ", cnt)

    db.session.commit()

    return json({"error_message" : "Lưu thông tin thành công"}, status=200)

@app.route('/api/v1/create_duoclieu_donvi', methods = ['POST'])
async def create_duoclieu_donvi(request):
    uid_current = current_user(request)
    if uid_current is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    data = request.json
    if data is None:
        return json({'error_code': 'PARAM_ERROR', 'error_message': 'Tham số không hợp lệ'}, status=520)
    id_sanpham = data.get("id_sanpham")
    if id_sanpham is None or id_sanpham =="":
        return json({'error_code': 'PARAM_ERROR', 'error_message': 'Dược liệu không được để trống'}, status=520)
    
    check_sanpham = db.session.query(DanhMucDuocLieu).filter(DanhMucDuocLieu.id == id_sanpham, DanhMucDuocLieu.deleted == False).first()
    if check_sanpham is None:
        return json({'error_code': 'PARAM_ERROR', 'error_message': "Không tìm thấy thông tin dược liệu"}, status=520)
    
    donvi_id = data.get("donvi_id")
    if donvi_id is None or donvi_id == "":
        donvi_id = current_uid.donvi_id
    
    check_donvi = db.session.query(DonVi).filter(DonVi.id == donvi_id, DonVi.deleted == False, DonVi.active == True).first()
    if check_donvi is None:
        return json({'error_code': 'PARAM_ERROR', 'error_message': 'Không tìm thấy thông tin đơn vị'}, status=520)

    sanpham_donvi = db.session.query(DuocLieuDonVi).filter(DuocLieuDonVi.id_sanpham == id_sanpham, DuocLieuDonVi.donvi_id == donvi_id ,DuocLieuDonVi.deleted == False).first()
    if sanpham_donvi is not None:
        return json({'error_code': 'PARAM_ERROR', 'error_message': 'Dược liệu đã có trong danh mục dược liệu đơn vị'}, status=520)

    sanpham = DuocLieuDonVi()
    sanpham.id = default_uuid()
    sanpham.id_sanpham = check_sanpham.id
    sanpham.ma_sanpham = check_sanpham.ma_sanpham
    sanpham.ma_bhxh = check_sanpham.ma_bhxh
    sanpham.ma_boyte = check_sanpham.ma_boyte
    sanpham.ma_sanxuat = check_sanpham.ma_sanxuat
    sanpham.ten_sanpham = check_sanpham.ten_sanpham
    sanpham.ten_khoa_hoc = check_sanpham.ten_khoa_hoc
    sanpham.ten_trung_quoc = check_sanpham.ten_trung_quoc
    sanpham.tenkhongdau = check_sanpham.tenkhongdau
    sanpham.ma_nhom = check_sanpham.ma_nhom
    sanpham.ten_nhom = check_sanpham.ten_nhom
    sanpham.mota = check_sanpham.mota
    sanpham.hang_sanxuat = check_sanpham.hang_sanxuat
    sanpham.nuoc_sanxuat = check_sanpham.nuoc_sanxuat
    sanpham.ma_nuoc_sanxuat = check_sanpham.ma_nuoc_sanxuat
    sanpham.loai_sanpham = check_sanpham.loai_sanpham
    sanpham.donvitinh = check_sanpham.donvitinh
    sanpham.bophan_sudung = check_sanpham.bophan_sudung
    sanpham.ma_hanghoa = check_sanpham.ma_hanghoa
    sanpham.ma_viettat = check_sanpham.ma_viettat
    sanpham.ma_danhmuc = check_sanpham.ma_danhmuc
    sanpham.thuoc_ho = check_sanpham.thuoc_ho
    sanpham.vi_phau = check_sanpham.vi_phau
    sanpham.bot = check_sanpham.bot
    sanpham.dinh_tinh = check_sanpham.dinh_tinh
    sanpham.do_am = check_sanpham.do_am
    sanpham.tro_toanphan = check_sanpham.tro_toanphan
    sanpham.tro_khongtan_trongacid = check_sanpham.tro_khongtan_trongacid
    sanpham.chiso_acid = check_sanpham.chiso_acid
    sanpham.chiso_carbonyl = check_sanpham.chiso_acid
    sanpham.chiso_peroxyd = check_sanpham.chiso_peroxyd
    sanpham.tyle_vun_nat = check_sanpham.tyle_vun_nat
    sanpham.tap_chat = check_sanpham.tap_chat
    sanpham.kimloainang = check_sanpham.kimloainang
    sanpham.chat_chiet_trong_sanpham = check_sanpham.chat_chiet_trong_sanpham
    sanpham.dinh_luong = check_sanpham.dinh_luong
    sanpham.che_bien = check_sanpham.che_bien
    sanpham.bao_che = check_sanpham.bao_che
    sanpham.bao_quan = check_sanpham.bao_quan
    sanpham.tinh_vi_quy_kinh = check_sanpham.tinh_vi_quy_kinh
    sanpham.congnang_chutri = check_sanpham.congnang_chutri
    sanpham.cachdung_lieuluong = check_sanpham.cachdung_lieuluong
    sanpham.kieng_ky = check_sanpham.kieng_ky
    sanpham.chungtu_dinhkem = check_sanpham.chungtu_dinhkem
    sanpham.thumbnail = check_sanpham.thumbnail
    sanpham.hinhanh = check_sanpham.hinhanh

    sanpham.donvi_id = donvi_id
    db.session.add(sanpham)
    db.session.commit()

    return json(to_dict(sanpham), status=200)


#set donvi cung ung, donvi tiep nhan
async def pre_nguon_cungcap(request = None, Model = None, data= None, **kw):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    donvi = currentUser.donvi
    donvi_id = ""
    if donvi is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    donvi_id = donvi.id
    donvi_ten = donvi.ten_coso
    donvi_diachi = donvi.diachi
    if "nguon_cungcap" in data and data["nguon_cungcap"] is not None:
        nguon_cungcap = data['nguon_cungcap']
        if nguon_cungcap == 4 or nguon_cungcap ==5:
            data['ma_donvi_cungung'] = donvi_id
            data['ten_donvi_cungung'] = donvi_ten
            data['diachi_donvi_cungung'] = donvi_diachi

async def postprocess_lichsu(request=None, Model=None, result=None, **kw):
    if "objects" in result:
        objects = result['objects']
        for item in objects:
            id_sanpham = item['id_sanpham']
            so_lo = item['so_lo']
            donvi_id = item['donvi_id']
            if id_sanpham is not None and so_lo is not None and donvi_id is not None and id_sanpham != ""\
                and so_lo != "" and donvi_id != "":
                item_id_lichsu = ""
                lichsu = db.session.query(LichSuSanPham.id).filter(LichSuSanPham.id_sanpham_danhmuc == id_sanpham, \
                    LichSuSanPham.so_lo == so_lo, LichSuSanPham.donvi_id == donvi_id, \
                    LichSuSanPham.deleted == False).first()
                if lichsu is not None:
                    item_id_lichsu = lichsu[0]
                    item['lichsu_id'] = item_id_lichsu

async def pre_post_danhmuc_donvi(request= None, Model = None, data = None, **kw):
    if request.method == "POST":
        if 'ma_sanpham_donvi' in data and data['ma_sanpham_donvi'] is not None and \
            data['ma_sanpham_donvi'] != "":
            checkDanhMucDonVi = db.session.query(DuocLieuDonVi).filter(\
                DuocLieuDonVi.ma_sanpham_donvi == data['ma_sanpham_donvi'], \
                DuocLieuDonVi.deleted ==  False, \
                DuocLieuDonVi.donvi_id== data['donvi_id']).first()
            if checkDanhMucDonVi is not None:
                return json({'error_code':'PARAM_ERROR', 'error_message':'Mã dược liệu đơn vị đã tồn tại trong danh mục đơn vị, vui lòng nhập mã khác'}, status=520)
        else:
            return json({'error_code':'PARAM_ERROR', 'error_message':'Mã dược liệu đơn vị vui lòng không để trống'}, status=520)
    else:
        if 'ma_sanpham_donvi' in data and data['ma_sanpham_donvi'] is not None and \
            data['ma_sanpham_donvi'] != "":
            checkDanhMucDonVi = db.session.query(DuocLieuDonVi).filter(\
                DuocLieuDonVi.ma_sanpham_donvi == data['ma_sanpham_donvi'], \
                DuocLieuDonVi.deleted ==  False, \
                DuocLieuDonVi.donvi_id== data['donvi_id'],\
                DuocLieuDonVi.id != data['id']).first()
            if checkDanhMucDonVi is not None:
                return json({'error_code':'PARAM_ERROR', 'error_message':'Mã dược liệu đơn vị đã tồn tại trong danh mục đơn vị, vui lòng nhập mã khác'}, status=520)
        else:
            return json({'error_code':'PARAM_ERROR', 'error_message':'Mã dược liệu đơn vị vui lòng không để trống'}, status=520)

apimanager.create_api(DuocLieuDonVi,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[ validate_token_donvi_get_put_delete_single], GET_MANY=[validate_user, pre_getmany_donvi], POST=[validate_user, pre_post_insert_donvi,pre_put_insert_tenkhongdau, pre_post_danhmuc_donvi], PUT_SINGLE=[validate_token_donvi_get_put_delete_single, pre_put_insert_tenkhongdau, pre_post_danhmuc_donvi], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[ validate_token_donvi_get_put_delete_single, pre_delete]),
    postprocess=dict(GET_SINGLE=[get_single_object_donvi], GET_MANY=[postprocess_stt, get_many_object_donvi], POST=[], PUT_SINGLE=[]),
    collection_name='sanpham_donvi')

apimanager.create_api(DuocLieuDonVi,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[ validate_token_donvi_get_put_delete_single], GET_MANY=[validate_user, pre_getmany_co_cq], POST=[validate_user, pre_post_insert_donvi,pre_put_insert_tenkhongdau], PUT_SINGLE=[ validate_token_donvi_get_put_delete_single, pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[ validate_token_donvi_get_put_delete_single, pre_delete]),
    postprocess=dict(GET_SINGLE=[get_single_object_donvi], GET_MANY=[postprocess_stt, get_many_object_donvi], POST=[], PUT_SINGLE=[]),
    include_columns=['id', 'id_sanpham', 'ten_sanpham', 'ten_khoa_hoc', 'tenkhongdau' , 'ma_viettat', 'ma_sanpham','bophan_sudung' ,'donvi_id'],
    collection_name='sanpham_donvi_filter')
