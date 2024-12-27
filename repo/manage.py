""" Module for managing tasks through a simple cli interface. """
# Libraries

import sys
from os.path import abspath, dirname

sys.path.insert(0, dirname(abspath(__file__)))
import os
# from sqlalchemy import create_engine, or_
# from sqlalchemy.sql import table, column, select, update, insert

from manager import Manager
from sqlalchemy.inspection import inspect
from application.database import db
from application import run_app
from application.server import app
from application.database import init_database
from application.extensions import init_extensions, auth


# from gatco_restapi.helpers import count, to_dict
# from gatco.response import text
# from gatco_restapi import  ProcessingException

from application.controllers.helpers.helper_common import *
from application.models.model_danhmuc import *
# import json as jsonorg
from application.models.model_donvi import *
from application.models.model_sanpham import DanhMucDuocLieu
# from application.models.model_nuoitrong_khaithac import *
import xlrd
# from application.models.model_file import *

from datetime import datetime, timezone
# import calendar
# from sqlalchemy.orm.attributes import flag_modified
# import hashlib
# import requests



manager = Manager()

@manager.command
def create_test_models(mode="dev"):
    if mode == "dev":
        from application.config.development import Config
    elif mode == "product":
        from application.config.production import Config
    elif mode == "stag":
        from application.config.stagging import Config
        
    app.config.from_object(Config)
    init_database(app)
    init_extensions(app)

    salt = str(generator_salt())
    # role_admin = db.session.query(Role).filter(Role.vaitro == 'admin').first()
    # if role_admin is not None:
    #     user = User(email='admin', password=auth.encrypt_password("123456abcA", salt), active=1, salt = salt)
    #     user.roles.append(role_admin)
    #     db.session.add(user)
    #     db.session.flush()

    #     profileUser = ProfileUser(id=user.id, email=user.email, active=user.active, hoten="Admin")
    #     profileUser.vaitro = ['admin']
    #     db.session.add(profileUser)
    #     db.session.commit()
    role_admin_donvi = db.session.query(Role).filter(Role.vaitro == 'admin_donvi').first()
    if role_admin_donvi is not None:
        user = User(email='admindonvi', password=auth.encrypt_password("123456abcA", salt), active=1, salt = salt)
        user.roles.append(role_admin_donvi)
        db.session.add(user)
        db.session.flush()

        profileUser = ProfileUser(id=user.id, email=user.email, active=user.active, hoten="Admin_DonVi")
        profileUser.vaitro = ['admin_donvi']
        db.session.add(profileUser)
        db.session.commit()
    
    role_canbo = db.session.query(Role).filter(Role.vaitro == 'canbo').first()
    if role_canbo is not None:
        user = User(email='canbo', password=auth.encrypt_password("123456abcA", salt), active=1, salt = salt)
        user.roles.append(role_canbo)
        db.session.add(user)
        db.session.flush()

        profileUser = ProfileUser(id=user.id, email=user.email, active=user.active, hoten="Canbo")
        profileUser.vaitro = ['canbo']
        db.session.add(profileUser)
        db.session.commit()
    role_lanhdao = db.session.query(Role).filter(Role.vaitro == 'lanhdao').first()
    if role_lanhdao is not None:
        user = User(email='lanhdao', password=auth.encrypt_password("123456abcA", salt), active=1, salt = salt)
        user.roles.append(role_lanhdao)
        db.session.add(user)
        db.session.flush()

        profileUser = ProfileUser(id=user.id, email=user.email, active=user.active, hoten="Lanhdao")
        profileUser.vaitro = ['lanhdao']
        db.session.add(profileUser)
        db.session.commit()
    
@manager.command
def create_donvi_boyte(mode="dev"):
    if mode == "dev":
        from application.config.development import Config
    elif mode == "product":
        from application.config.production import Config
    elif mode == "stag":
        from application.config.stagging import Config

    app.config.from_object(Config)
    init_database(app)
    init_extensions(app)

    salt = str(generator_salt())
    role_admin_donvi = db.session.query(Role).filter(Role.vaitro == 'admin_donvi').first()

    if role_admin_donvi is not None:
        donvi = DonVi()
        donvi.id = default_uuid()
        donvi.ten_coso = "Cục YDCT - Bộ Y Tế"
        donvi.tenkhongdau = "cuc ydct, bo y te"
        donvi.tuyendonvi_id = "1"
        donvi.active = True
        db.session.add(donvi)
        db.session.flush()        
        
        user_email = "boyte@gmail.com"
        user = User(email=user_email, password=auth.encrypt_password("123456abcA", salt), active=1, salt=salt)
        user.roles.append(role_admin_donvi)
        user.donvi_id = donvi.id
        db.session.add(user)
        db.session.flush()

        profile_user = ProfileUser()
        profile_user.id = user.id
        profile_user.active = 1

        hoten_taikhoan = 'ADMIN Bộ Y Tế'
        
        profile_user.hoten = hoten_taikhoan
        profile_user.tenkhongdau = convert_text_khongdau(hoten_taikhoan)
        profile_user.email = user_email
        profile_user.vaitro = ['admin_donvi']
        profile_user.donvi_id = donvi.id
        db.session.add(profile_user)

        db.session.commit()

notdict = ['_created_at','_updated_at','_deleted','_deleted_at','_etag','created_at','created_by','deleted_at','deleted_by','deleted']

@manager.command
def generate_schema(path = None, exclude = None, prettyprint = True):
    """ Generate javascript schema"""
    exclude_list = None
    if path is None:
        print("Path is required")
        return
    
    if exclude is not None:
        exclude_list = exclude.split(",")
        
    for cls in [cls for cls in db.Model._decl_class_registry.values() if isinstance(cls, type) and issubclass(cls, db.Model)]:
        classname = cls.__name__
        if (exclude_list is not None) and (classname in exclude_list):
            continue
        schema = {}
        for col in cls.__table__.c:
            col_type = str(col.type)
            if col.name in notdict:
                continue
            schema_type = ''
            if 'DECIMAL' in col_type:
                schema_type = 'number'
            if col_type in ['INTEGER','SMALLINT', 'FLOAT', 'BIGINT' ]:
                schema_type = 'number'
            if col_type == 'DATETIME':
                schema_type = 'datetime'
            if col_type == 'DATE':
                schema_type = 'datetime'
            if 'VARCHAR' in col_type:
                schema_type = 'string'
            if col_type in ['VARCHAR', 'UUID', 'TEXT']:
                schema_type = 'string'
            if col_type in ['JSON', 'JSONB']:
                schema_type = 'json'
            if 'BOOLEAN' in col_type:
                schema_type = 'boolean'
            
            schema[col.name] = {"type": schema_type}
            
            if col.primary_key:
                schema[col.name]["primary"] = True
            if (not col.nullable) and (not col.primary_key):
                schema[col.name]["required"] = True
                
            if hasattr(col.type, "length") and (col.type.length is not None):
                schema[col.name]["length"] = col.type.length
            if (col.default is not None) and (col.default.arg is not None) and (not callable(col.default.arg)):
                schema[col.name]["default"] = col.default.arg
        relations = inspect(cls).relationships
        for rel in relations:
            if rel.direction.name in ['MANYTOMANY', 'ONETOMANY']:
                schema[rel.key] = {"type": "list"}
            if rel.direction.name in ['MANYTOONE']:
                schema[rel.key] = {"type": "dict"}
            
        if prettyprint:
            with open(path + '/' + classname + 'Schema.json', 'w') as outfile:
                ujson.dump(schema,  outfile, indent=4,)
        else:
            with open(path + '/' + classname + 'Schema.json', 'w') as outfile:
                ujson.dump(schema,  outfile,)

@manager.command
def init_danhmuc(mode="dev"):
    if mode == "dev":
        from application.config.development import Config
    elif mode == "product":
        from application.config.production import Config
    elif mode == "stag":
        from application.config.stagging import Config
    
    app.config.from_object(Config)
    init_database(app)
    
    print("add quoc gia==========")
    add_quoc_gia()

    print("add danh muc tinh thanh=============")
    add_danhmuc_tinhthanh()
    
    print("add danh muc quan huyen=============")
    add_danhmuc_quanhuyen()
    
    print("add danh muc xa phuong=============")
    add_danhmuc_xaphuong()
     
    print("add danh muc dan toc=============")
    add_danhmuc_dantoc()

    print("add role==========")
    add_role()

    print("add tuyen don vi ==========")
    add_danhmuc_tuyendonvi()


@manager.command
def import_danhmuc(mode="dev"):
    if mode == "dev":
        from application.config.development import Config
    elif mode == "product":
        from application.config.production import Config
    elif mode == "stag":
        from application.config.stagging import Config

    app.config.from_object(Config)
    init_database(app)

    import_danhmuc_vanbangchuyenmon()

    import_duoclieu_new_v2()
    
    
def import_danhmuc_vanbangchuyenmon():
    SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    path = os.path.join(SITE_ROOT, "application/data", "DanhMuc.xlsx")
    loc = (path) 
    wb = xlrd.open_workbook(loc) 
    sheet = wb.sheet_by_index(2) 
    sheet.cell_value(0, 0) 
    count =0
    for i in range(sheet.nrows):
        if i == 0:
            continue
        ma = str(sheet.cell_value(i,1)).strip()
        ten = str(sheet.cell_value(i,2)).strip()
        if ma is not None:
            van_bang_chuyen_mon = db.session.query(VanBangChuyenMon).filter(VanBangChuyenMon.ma==ma).first()
            if van_bang_chuyen_mon is None:
                vanbangchuyenmon = VanBangChuyenMon()
                vanbangchuyenmon.ma = ma
                vanbangchuyenmon.ten = ten
                vanbangchuyenmon.tenkhongdau = convert_text_khongdau(ten)

                db.session.add(vanbangchuyenmon)
                count = count + 1
    db.session.commit()
    print("total_sync====",count)


@manager.command
def add_quoc_gia():
    try:
        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
        json_url_dstinhthanh = os.path.join(SITE_ROOT, "application/data", "QuocGia.json")
        data_ds_quocgia = ujson.load(open(json_url_dstinhthanh))
        for item_quocgia in data_ds_quocgia:
            quocgia_filter = db.session.query(QuocGia).filter(QuocGia.id == item_quocgia["code"]).first()
            if quocgia_filter is None:
                quocgia_filter = QuocGia(ten = item_quocgia["name"], id = item_quocgia["code"])
                quocgia_filter.tenkhongdau = convert_text_khongdau(item_quocgia["name"])
                db.session.add(quocgia_filter)
                db.session.commit()
    except Exception as e:
        print("TINH THANH ERROR",e)

@manager.command
def add_danhmuc_tinhthanh():
    try:
        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
        json_url_dstinhthanh = os.path.join(SITE_ROOT, "application/data", "TinhThanh.json")
        data_dstinhthanh = ujson.load(open(json_url_dstinhthanh))
        for item_dstinhthanh in data_dstinhthanh:
            tinhthanh_filter = db.session.query(TinhThanh).filter(TinhThanh.id == item_dstinhthanh["matinhthanh"]).first()
            if tinhthanh_filter is None:
                quocgia_filter = db.session.query(QuocGia).filter(QuocGia.id == 'VN').first()
                tinhthanh_filter = TinhThanh(ten = item_dstinhthanh["tentinhthanh"], id = item_dstinhthanh["matinhthanh"], quocgia_id = quocgia_filter.id)
                tinhthanh_filter.tenkhongdau = convert_text_khongdau(item_dstinhthanh["tentinhthanh"])
                db.session.add(tinhthanh_filter)
                db.session.commit()
    except Exception as e:
        print("TINH THANH ERROR",e)

@manager.command
def add_danhmuc_quanhuyen():
    try:
        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
        json_url_dsquanhuyen = os.path.join(SITE_ROOT, "application/data", "QuanHuyen.json")
        data_dsquanhuyen = ujson.load(open(json_url_dsquanhuyen))
        for item_dsquanhuyen in data_dsquanhuyen:
            quanhuyen_filter = db.session.query(QuanHuyen).filter(QuanHuyen.id == item_dsquanhuyen["maquanhuyen"]).first()
            if quanhuyen_filter is None:
                tinhthanh_filter = db.session.query(TinhThanh).filter(TinhThanh.id == item_dsquanhuyen["matinhthanh"]).first()
                quanhuyen_filter = QuanHuyen(ten = item_dsquanhuyen["tenquanhuyen"], id = item_dsquanhuyen["maquanhuyen"], tinhthanh_id = tinhthanh_filter.id)
                quanhuyen_filter.tenkhongdau = convert_text_khongdau(item_dsquanhuyen["tenquanhuyen"])
                db.session.add(quanhuyen_filter)
        db.session.commit()
    except Exception as e:
        print("QUAN HUYEN ERROR", e)

@manager.command
def add_danhmuc_xaphuong():
    try:
        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
        json_url_dsxaphuong = os.path.join(SITE_ROOT, "application/data", "XaPhuong.json")
        data_dsxaphuong = ujson.load(open(json_url_dsxaphuong))
        for item_dsxaphuong in data_dsxaphuong:
            xaphuong_filter = db.session.query(XaPhuong).filter(XaPhuong.id == item_dsxaphuong["maxaphuong"]).first()
            if xaphuong_filter is None:
                quanhuyen_filter = db.session.query(QuanHuyen).filter(QuanHuyen.id == item_dsxaphuong["maquanhuyen"]).first()
                xaphuong_filter = XaPhuong(ten = item_dsxaphuong["tenxaphuong"], id = item_dsxaphuong["maxaphuong"], quanhuyen_id = quanhuyen_filter.id)
                xaphuong_filter.tenkhongdau = convert_text_khongdau(item_dsxaphuong["tenxaphuong"])
                db.session.add(xaphuong_filter)
        db.session.commit()
    except Exception as e:
        print("XA PHUONG ERROR", e)

@manager.command
def add_danhmuc_dantoc():
    try:
        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))    
        json_url_dantoc = os.path.join(SITE_ROOT, "application/data", "DanTocEnum.json")
        data_dantoc = ujson.load(open(json_url_dantoc))
        for item_dantoc in data_dantoc:
            check_dantoc = db.session.query(DanToc).filter(DanToc.id == str(item_dantoc["value"])).first()
            if check_dantoc is None:
                dantoc = DanToc(id = str(item_dantoc["value"]), ten = item_dantoc["text"])
                dantoc.tenkhongdau = convert_text_khongdau(item_dantoc["text"])
                db.session.add(dantoc)
        db.session.commit()
    except Exception as e:
        print("DAN TOC ERROR", e)


@manager.command
def add_danhmuc_tuyendonvi():
    
    try:
        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))    
        json_url_tuyendonvi = os.path.join(SITE_ROOT, "application/data", "TuyenDonViEnum.json")
        data_tuyendonvi = ujson.load(open(json_url_tuyendonvi))
        for item_tuyendonvi in data_tuyendonvi:
            check_dantoc = db.session.query(TuyenDonVi).filter(TuyenDonVi.ma == str(item_tuyendonvi["value"])).first()
            if check_dantoc is None:
                tuyendonvi = TuyenDonVi(id = str(item_tuyendonvi["value"]), ma = str(item_tuyendonvi["value"]), ten = item_tuyendonvi["text"])
                db.session.add(tuyendonvi)
        db.session.commit()
    except Exception as e:
        print("TUYEN DON VI ERROR", e)

@manager.command
def add_role():

    # from application.config.development import Config
    # app.config.from_object(Config)
    # init_database(app)

    role_admin = db.session.query(Role).filter(Role.vaitro == 'admin').first()
    if role_admin is None:
        role = Role(vaitro='admin',mota='Admin')
        db.session.add(role)
        db.session.commit()

    role_canbotyt = db.session.query(Role).filter(Role.vaitro == 'canbo').first()
    if role_canbotyt is None:
        role = Role(vaitro = 'canbo',mota='Cán bộ đơn vị')
        db.session.add(role)
        db.session.commit()

    role_admin_tyt = db.session.query(Role).filter(Role.vaitro == 'admin_donvi').first()
    if role_admin_tyt is None:
        role = Role(vaitro = 'admin_donvi',mota='Admin đơn vị')
        db.session.add(role)
        db.session.commit()

    role_lanhdao = db.session.query(Role).filter(Role.vaitro == "lanhdao").first()
    if role_lanhdao is None:
        role = Role(vaitro = 'lanhdao',mota='Lãnh đạo đơn vị')
        db.session.add(role)
        db.session.commit()


def convert_columexcel_to_string(value):
    # print("value", value)
    if isinstance(value,str):
        return value.strip()
    if isinstance(value, float):
        return str(int(value)).strip()
    if isinstance(value,int):
        return str(value).strip()


##import and update duoc lieu 08/07/2021
@manager.command
def import_duoclieu_new_v2():
    # from application.config.development import Config
    # from application.config.production import Config
    # from application.config.stagging import Config
    # app.config.from_object(Config)
    # init_database(app)

    #import moi
    SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    path = os.path.join(SITE_ROOT, "application/data", "newduoclieu_v11.xlsx")

    loc = (path) 
    wb = xlrd.open_workbook(loc) 
    sheet = wb.sheet_by_index(0) 
    sheet.cell_value(0, 0) 
    count =0
    count_ma = 0
    list_duoclieu_no = []
    list_duoclieu_trung = []
    count_existed = 0
    prev_ten_sanpham = ''
    prev_bophan_sudung = ''
    print("so dong=========================: ", sheet.nrows)
    for i in range(sheet.nrows):
        if i == 0:
            continue
        ten_sanpham = str(sheet.cell_value(i,1)).strip()
        ten_khoa_hoc = str(sheet.cell_value(i,2)).strip()
        bophan_sudung = str(sheet.cell_value(i,4)).strip()
        ma_hanghoa = str(sheet.cell_value(i,5)).strip()
        ma_viettat = str(sheet.cell_value(i,6)).strip()
        ma_danhmuc = str(sheet.cell_value(i,7)).strip()
        thuoc_ho = str(sheet.cell_value(i,8)).strip()
        mota = str(sheet.cell_value(i,9)).strip()
        vi_phau = str(sheet.cell_value(i,10)).strip()
        bot = str(sheet.cell_value(i,11)).strip()
        dinh_tinh = str(sheet.cell_value(i,12)).strip()
        do_am = str(sheet.cell_value(i,13)).strip()
        tro_toanphan = str(sheet.cell_value(i,14)).strip()
        tro_khongtan_trongacid = str(sheet.cell_value(i,15)).strip()
        chiso_acid = str(sheet.cell_value(i,16)).strip()
        chiso_carbonyl = str(sheet.cell_value(i,17)).strip()
        chiso_peroxyd = str(sheet.cell_value(i,18)).strip()
        tyle_vun_nat = str(sheet.cell_value(i,19)).strip()
        tap_chat = str(sheet.cell_value(i,20)).strip()
        kimloainang = str(sheet.cell_value(i,21)).strip()
        chat_chiet_trong_sanpham = str(sheet.cell_value(i,22)).strip()
        dinh_luong = str(sheet.cell_value(i,23)).strip()
        che_bien = str(sheet.cell_value(i,24)).strip()
        bao_che = str(sheet.cell_value(i,25)).strip()
        bao_quan = str(sheet.cell_value(i,26)).strip()
        tinh_vi_quy_kinh = str(sheet.cell_value(i,27)).strip()
        congnang_chutri = str(sheet.cell_value(i,28)).strip()
        cachdung_lieuluong = str(sheet.cell_value(i,29)).strip()
        kieng_ky = str(sheet.cell_value(i,30)).strip()
        hinhanh = str(sheet.cell_value(i,31)).strip()

        check_existed = db.session.query(DanhMucDuocLieu).filter(DanhMucDuocLieu.ma_sanpham == ma_viettat).first()
        if check_existed is not None:
            count_existed +=1
            if ten_khoa_hoc is not None and ten_khoa_hoc !="":
                check_existed.ten_khoa_hoc = ten_khoa_hoc
            if bophan_sudung is not None and bophan_sudung !="":
                prev_bophan_sudung = bophan_sudung
                check_existed.bophan_sudung = bophan_sudung
            else:
                check_existed.bophan_sudung = prev_bophan_sudung
                db.session.flush()
        else:
            print("ko trùng dược liệu, thêm mới===================:", ma_viettat)
            print("dòng thứ n=================:", i)
            sanpham = DanhMucDuocLieu()
            if ten_sanpham!='' and ten_sanpham is not None:
                sanpham.ten_sanpham = ten_sanpham
                prev_ten_sanpham = ten_sanpham
            else:
                sanpham.ten_sanpham = prev_ten_sanpham

            if sanpham.ten_sanpham!='' and sanpham.ten_sanpham is not None:
                sanpham.tenkhongdau = convert_text_khongdau(sanpham.ten_sanpham)
            if ten_khoa_hoc!='' and ten_khoa_hoc is not None: 
                sanpham.ten_khoa_hoc = ten_khoa_hoc.replace('-','').strip()

            if bophan_sudung!='' and bophan_sudung is not None:
                sanpham.bophan_sudung = bophan_sudung
                prev_bophan_sudung = bophan_sudung
            else:
                sanpham.bophan_sudung = prev_bophan_sudung
            sanpham.ma_hanghoa = ma_hanghoa
            sanpham.ma_viettat = ma_viettat
            sanpham.ma_sanpham = ma_viettat
            if sanpham.ma_sanpham is None or sanpham.ma_sanpham == "":
                count_ma+=1
                list_duoclieu_no.append(to_dict(sanpham))
            if ma_danhmuc!='' and ma_danhmuc is not None:
                sanpham.ma_danhmuc = int(float(ma_danhmuc))
            sanpham.thuoc_ho = thuoc_ho
            sanpham.mota = mota
            sanpham.vi_phau = vi_phau
            sanpham.bot = bot
            sanpham.dinh_tinh = dinh_tinh
            sanpham.do_am = do_am
            sanpham.tro_toanphan = tro_toanphan
            sanpham.tro_khongtan_trongacid = tro_khongtan_trongacid
            sanpham.chiso_acid = chiso_acid
            sanpham.chiso_carbonyl = chiso_carbonyl
            sanpham.chiso_peroxyd = chiso_peroxyd
            sanpham.tyle_vun_nat = tyle_vun_nat
            sanpham.tap_chat = tap_chat
            sanpham.kimloainang = kimloainang
            sanpham.chat_chiet_trong_sanpham = chat_chiet_trong_sanpham
            sanpham.dinh_luong = dinh_luong
            sanpham.che_bien = che_bien
            sanpham.bao_che = bao_che
            sanpham.bao_quan = bao_quan
            sanpham.tinh_vi_quy_kinh = tinh_vi_quy_kinh
            sanpham.congnang_chutri = congnang_chutri
            sanpham.cachdung_lieuluong = cachdung_lieuluong
            sanpham.kieng_ky = kieng_ky
            db.session.add(sanpham)
            count = count + 1
    db.session.commit()


    print("so duoclieu them vao===========: ", count)
    print("so duoclieu khong co ma============: ", count_ma)
    print("danh sach duoc lieu khong ma========: ", list_duoclieu_no)
    print("so duoc lieu update====================: ", count_existed)



@manager.command
def import_data_cuakhau():   
    try:
        from application.config.development import Config
        app.config.from_object(Config)
        init_database(app)

        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
        json_url = os.path.join(SITE_ROOT, "application/data", "danhmuc_cuakhau.json")
        data = ujson.load(open(json_url))
        for item in data:
            id  = item['id']
            ma_cuakhau = item['ma']
            ten_cuakhau = item['ten']
            tenkhongdau=''
            if ten_cuakhau is not None:
                tenkhongdau = convert_text_khongdau(ten_cuakhau)
            duongboquocte = item['duongboquocte']
            duongbochinh = item['duongbochinh']
            duongbophu = item['duongbophu']
            duongsat = item['duongsat']
            duonghangkhong = item['duonghangkhong']
            duongthuyloai1 = item['duongthuyloai1']
            duongthuyloai2 = item['duongthuyloai2']
            
            if duongboquocte==True:
                phanloai = 1
            elif duongbochinh==True:
                phanloai = 2
            elif duongbophu==True:
                phanloai = 3
            elif duongsat == True:
                phanloai = 4
            elif duonghangkhong ==True:
                phanloai = 5
            elif duongthuyloai1==True:
                phanloai = 6
            elif duongthuyloai2==True:
                phanloai = 7
            
            kiemdichyte = item['kiemdichyte']
            phongcachly = item['phongcachly']
            nguoilienlac = item['nguoilienlac']
            sodienthoai = item['sodienthoai']
            diachi = item['diachi']
            email = item['email']
            thutu = item['thutu']
            quocgia_tiepgiap = item['quocgia_tiepgiap']
            cuakhau_tiepgiap = item['cuakhau_tiepgiap']
            matinhthanh = item['matinhthanh']
            tinhthanh_id = None
            tinhthanh = None

            if matinhthanh is not None:
                tinhthanh = db.session.query(TinhThanh).filter(TinhThanh.ma==str(matinhthanh)).first()
                if tinhthanh is not None:
                    tinhthanh_id=tinhthanh.id
            
            cuakhau = db.session.query(DanhMucCuaKhau).filter(DanhMucCuaKhau.id == str(id)).first()
            if cuakhau is None:
                cuakhau = DanhMucCuaKhau()
                cuakhau.id = id
                cuakhau.ma_cuakhau = ma_cuakhau
                cuakhau.ten_cuakhau = ten_cuakhau
                cuakhau.tenkhongdau = tenkhongdau
                cuakhau.phanloai = phanloai
                cuakhau.kiemdichyte = kiemdichyte
                cuakhau.phongcachly = phongcachly
                cuakhau.nguoilienlac = nguoilienlac
                cuakhau.sodienthoai = sodienthoai
                cuakhau.diachi = diachi
                cuakhau.email = email
                cuakhau.thutu = thutu
                # cuakhau.duongboquocte = duongboquocte
                # cuakhau.duongbochinh = duongbochinh
                # cuakhau.duongbophu = duongbophu
                # cuakhau.duongsat = duongsat
                # cuakhau.duonghangkhong = duonghangkhong
                # cuakhau.duongthuyloai1 = duongthuyloai1
                # cuakhau.duongthuyloai2 = duongthuyloai2
                cuakhau.quocgia_tiepgiap = quocgia_tiepgiap
                cuakhau.cuakhau_tiepgiap = cuakhau_tiepgiap
                cuakhau.tinhthanh = tinhthanh
                cuakhau.tinhthanh_id = tinhthanh_id
                print('\n\n\n========', cuakhau.tinhthanh_id)
                db.session.add(cuakhau)
            db.session.flush() 

        db.session.commit()
    except Exception as e:
        print("add_cuakhau ERROR", e)
     
@manager.command
def import_data_donvi_bhyt():
    from application.config.development import Config
    # from application.config.production import Config
    app.config.from_object(Config)
    init_database(app)

    SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    # path = os.path.join(SITE_ROOT, "application/data", "donvi_yte_79_TPHCM.xlsx")
    path = os.path.join(SITE_ROOT, "application/data", "donvi_yte_01_HN.xlsx")
    loc = (path) 
    wb = xlrd.open_workbook(loc) 
    sheet = wb.sheet_by_index(0) 
    sheet.cell_value(0, 0) 
    count =0
    for i in range(sheet.nrows):
        if i == 0:
            continue
        ma_donvi = str(sheet.cell_value(i,1)).strip()
        ten_donvi = str(sheet.cell_value(i,2)).strip()
        level_donvi = None
        if str(sheet.cell_value(i,3)).strip() != "":
            level_donvi = int(float(str(sheet.cell_value(i,3)).strip()))

        hinhthuc_tochuc = str(sheet.cell_value(i,4)).strip()
        matinhthanh = convert_columexcel_to_string(sheet.cell_value(i,5))
        maquanhuyen = convert_columexcel_to_string(sheet.cell_value(i,6))
        maxaphuong = convert_columexcel_to_string(sheet.cell_value(i,7))
        diachi_donvi = str(sheet.cell_value(i,8)).strip()
        email_donvi = str(sheet.cell_value(i,9)).strip()
        dienthoai_donvi = str(sheet.cell_value(i,10)).strip()
        
        check_donvi = db.session.query(CoSoYTe).filter(CoSoYTe.ma_donvi == ma_donvi).first()
        if check_donvi is not None:
            continue
        donvi = CoSoYTe()
        donvi.id = default_uuid()
        donvi.ma_donvi = ma_donvi
        donvi.ten_donvi = ten_donvi
        donvi.level_donvi = level_donvi
        donvi.hinhthuctochuc = hinhthuc_tochuc
        donvi.dienthoai = dienthoai_donvi
        donvi.email_donvi = email_donvi
        donvi.dienthoai = dienthoai_donvi

        donvi.tenkhongdau = convert_text_khongdau(donvi.ten_donvi)
        check_tinhthanh = db.session.query(TinhThanh).filter(TinhThanh.ma == matinhthanh).first()
        if check_tinhthanh is not None:
            donvi.tinhthanh_id = check_tinhthanh.id
        check_quanhuyen = db.session.query(QuanHuyen).filter(QuanHuyen.ma == maquanhuyen).first()
        if check_quanhuyen is not None:
            donvi.quanhuyen_id = check_quanhuyen.id
        check_xaphuong = db.session.query(XaPhuong).filter(XaPhuong.ma == maxaphuong).first()
        if check_xaphuong is not None:
            donvi.xaphuong_id = check_xaphuong.id

        db.session.add(donvi)
        count = count + 1
    db.session.commit()

    print("total_sync====",count)

def read_text_file(file_path):
    with open(file_path, 'r') as f:
        print(f.read())

@manager.command
def run():
    """ Starts server on port 12034. """
    run_app(host="0.0.0.0", port=12034, mode="production")


@manager.command
def rundev():
    """ Starts server on port 12034. """
    run_app(host="0.0.0.0", port=12034, mode="development")


@manager.command
def runstag():
    """ Starts server on port 12034. """
    run_app(host="0.0.0.0", port=12034, mode="stagging")
    

if __name__ == '__main__':
    manager.main()
