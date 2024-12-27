#from gatco.exceptions import ServerError
from application.server import app
from gatco.response import json
from application.database import redisdb, db
from application.client import HTTPClient 
from application.models.models import *

import aiosmtplib
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from email.mime.text import MIMEText
from email.header import Header

import random
import os
import re
import binascii
import asyncio
import aiohttp
import hashlib
import ujson
import uuid
import string
from datetime import datetime,timezone
import calendar
from math import floor
import time
from gatco_restapi.helpers import to_dict
from application.models.model_donvi import *
from sqlalchemy import or_, and_, desc, asc
from sqlalchemy import update
# import qrcode, os
from io import BytesIO
import base64
from slugify import slugify


def hash_value(value):
    return hashlib.md5(value.encode('utf-8')).hexdigest()

def format_address(tinhthanh, quanhuyen, xaphuong, thonxom, dia_chi):

    if dia_chi is None:
        dia_chi = ""

    if thonxom is not None:
        if dia_chi is not None and str(dia_chi).strip() != "":
            dia_chi = dia_chi + ", " + thonxom.ten
        else:
            dia_chi = thonxom.ten

    if xaphuong is not None:
        if dia_chi is not None and str(dia_chi).strip() != "":
            dia_chi = dia_chi + ", " + xaphuong.ten
        else:
            dia_chi = xaphuong.ten

    if quanhuyen is not None:
        if dia_chi is not None and str(dia_chi).strip() != "":
            dia_chi = dia_chi + ", " + quanhuyen.ten
        else:
            dia_chi = quanhuyen.ten

    if tinhthanh is not None:
        if dia_chi is not None and str(dia_chi).strip() != "":
            dia_chi = dia_chi + ", " + tinhthanh.ten
        else:
            dia_chi = tinhthanh.ten
    return dia_chi

def get_timestamp_month_day_range(date):
    """
    For a date 'date' returns the start and end date for the month of 'date'.

    Month with 31 days:
    >>> date = datetime.date(2011, 7, 27)
    >>> get_month_day_range(date)
    (datetime.date(2011, 7, 1), datetime.date(2011, 7, 31))

    Month with 28 days:
    >>> date = datetime.date(2011, 2, 15)
    >>> get_month_day_range(date)
    (datetime.date(2011, 2, 1), datetime.date(2011, 2, 28))
    """
    first_day = date.replace(day = 1, hour=0, minute=0, second=0)
    first_day = int(first_day.replace(tzinfo=timezone.utc).timestamp())
    last_day = date.replace(day = calendar.monthrange(date.year, date.month)[1], hour=23, minute=59, second=59)
    last_day = int(last_day.replace(tzinfo=timezone.utc).timestamp())
    return first_day, last_day

def convert_timestamp_to_utctimestamp(value):
    dtobj_utc = None
    try:
        
        dtobj_utc = datetime.utcfromtimestamp(int(value))
    except:
        try:
            dtobj_utc = datetime.strptime(value, '%Y-%m-%d')
        except:
            return None
    date_utc = datetime(dtobj_utc.year, dtobj_utc.month, dtobj_utc.day)
    return int(date_utc.replace(tzinfo=timezone.utc).timestamp())

def convert_timestamp_to_string(value, format):
    dtobj_utc = None
    try:
        dtobj_utc = datetime.fromtimestamp(int(value))
    except:
        try:
            dtobj_utc = datetime.strptime(value)
        except:
            return None
    return dtobj_utc.strftime(format)

def convert_datetime_to_timestamp(value, formatdate):
    result = None
    if value is None:
        result = None
    else:
        try:
            validate_ngaysinh = int(value)
            result = validate_ngaysinh
        except:
            for format in ['%d-%m-%Y','%Y-%m-%d','%Y-%m-%dT%H:%M:%S','%d/%m/%Y']:
                try:
                    value = datetime.strptime(value, format)
                    date_utc = datetime(value.year, value.month, value.day)
                    result = int(date_utc.replace(tzinfo=timezone.utc).timestamp())
                    break
                except:
                    continue
    return result
    
def format_datetime_string(value):
    if value is None:
        return ""
    year = month = day = ""
    result = ""
    if len(value)>=8:
        year = value[0:4]
        month = value[4:6]
        day = value[6:8]
        result = day + "/" + month + "/" + year
    elif len(value)>=6:
        year = value[0:4]
        month = value[4:6]
        result = month + "/" + year
    elif len(value)>=4:
        year = value[0:4]
        result= year
    return result



###new version
# def generate_counter(type, pre_word, initial = False):
#     if (initial == True):
#         check = db.session.query(Counter).filter(Counter.type == type).first()
#         if check is None:
#             counter = Counter()
#             counter.id = default_uuid()
#             counter.type = type
#             counter.count = 1
#             counter.pre_word = pre_word
#             db.session.add(counter)
#             db.session.commit()
#             return counter.count

#     stt = update(Counter).returning(Counter.count).where(and_(Counter.type == type)).values(count= (Counter.count +1))
#     result = db.session.execute(stt)
#     db.session.commit()
#     for row in result:
#         return row[0]

def generate_counter(path, type, donvi_id = None):
    if donvi_id is not None:
        check = db.session.query(Counter).filter(
            Counter.path == path,
            Counter.type == type,
            Counter.donvi_id == donvi_id
        ).first()
        if check is None:
            counter = Counter()
            counter.id = default_uuid()
            counter.path = path
            counter.type = type
            counter.donvi_id = donvi_id
            counter.count = 1
            db.session.add(counter)
            db.session.commit()
            return counter.count

        stt = update(Counter).returning(Counter.count).where(and_(Counter.id == check.id)).values(count = (Counter.count + 1))
        result = db.session.execute(stt)
        db.session.commit()
        for row in result:
            return row[0]


async def postprocess_getMany(request=None, Model=None, result=None, **kw):
    if "num_results" in result and (result["num_results"] > 0):
        i = 0
        list_item = []
        for item in result["objects"]:
            i = i + 1
            item["stt"] = i
            list_item.append(item)
        
        result["objects"] = list_item


async def get_single_object_donvi(request = None, Model= None, result = None, **kw):
    if 'donvi' in result and result['donvi'] is not None:
        donvi = {
            'id' : result['donvi'].get("id"),
            'ma_coso': result['donvi'].get('ma_coso'),
            'ten_coso': result['donvi'].get('ten_coso'),
            'tenkhongdau': result['donvi'].get('tenkhongdau'),
            'loai_donvi': result['donvi'].get('loai_donvi'),
            'tuyendonvi_id': result['donvi'].get("tuyendonvi_id"),
            'diachi': result['donvi'].get("diachi"),
            'captren_id': result['donvi'].get('captren_id')
        }
        result['donvi'] = donvi


async def get_many_object_donvi(request=None, Model=None, result=None, **kw):
    if "num_results" in result and (result["num_results"] > 0):
        i = 0
        for item in result["objects"]:
            if 'donvi' in item and item['donvi'] is not None:
                donvi = {
                    'id' : item['donvi'].get("id"),
                    'ma_coso': item['donvi'].get('ma_coso'),
                    'ten_coso': item['donvi'].get('ten_coso'),
                    'tenkhongdau': item['donvi'].get('tenkhongdau'),
                    'loai_donvi': item['donvi'].get('loai_donvi'),
                    'tuyendonvi_id': item['donvi'].get("tuyendonvi_id"),
                    'diachi': item['donvi'].get("diachi"),
                    'captren_id': item['donvi'].get('captren_id')
                }
                item['donvi'] = donvi

async def pre_post_insert_donvi(request=None, data=None, Model=None, **kw):
    uid = current_uid(request)
    if uid is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    else:
        user = db.session.query(User).filter(and_(User.id == uid,User.deleted == False)).first()
        if user is not None and user.donvi_id is not None:
            if "created_by" in data and "updated_by" in data:
                data["created_by"] = user.id
                data["updated_by"] = user.id
        if 'ten' in data and 'tenkhongdau' in data:
            data['tenkhongdau'] = convert_text_khongdau(data['ten'])
        if "ten_dichvu" in data and "ten_dichvu_khongdau" in data:
            data['ten_dichvu_khongdau'] = convert_text_khongdau(data['ten_dichvu'])
        if "ten_vattu" in data and "tenkhongdau" in data:
            data['tenkhongdau'] = convert_text_khongdau(data['ten_vattu'])
        if "donvi_id" in data:
            if user.has_role("admin_donvi") or user.has_role("canbo"):
                pre_word = ""
                table_name = Model.__tablename__
                if table_name == "phieunhapkho":
                    pre_word = "PN"
                    # data["ma_tu_sinh"] =  pre_word + str(generate_counter(table_name, user.donvi_id, pre_word)).zfill(7)
                    data["id"] =  pre_word + str(generate_counter(table_name, pre_word, True)).zfill(10)
                elif table_name == "phieuxuatkho":
                    pre_word = "PX"
                    # data["ma_tu_sinh"] = pre_word + str(generate_counter(table_name, user.donvi_id, pre_word)).zfill(7)
                    data["id"] =  pre_word + str(generate_counter(table_name, pre_word, True)).zfill(10)
                elif table_name == "phieudutru":
                    pre_word = "PDT"
                    # data["ma_tu_sinh"] = pre_word + str(generate_counter(table_name, user.donvi_id, pre_word)).zfill(7)
                    data["id"] =  pre_word + str(generate_counter(table_name, pre_word, True)).zfill(10)
                elif table_name == "phieukiemkekho":
                    pre_word = "PKK"
                    # data["ma_tu_sinh"] = pre_word + str(generate_counter(table_name, user.donvi_id, pre_word)).zfill(7)
                    data["id"] =  pre_word + str(generate_counter(table_name, pre_word, True)).zfill(10)
                elif table_name == "baocaokho":
                    pre_word = "BCK"
                    # data["ma_tu_sinh"] = pre_word + str(generate_counter(table_name, user.donvi_id, pre_word)).zfill(7)
                    data["id"] =  pre_word + str(generate_counter(table_name, pre_word, True)).zfill(10)
                if "donvi" in data:
                    data["donvi"] = user.donvi
                if "donvi_id" in data:
                    data["donvi_id"] = user.donvi_id
                if "donvi_id_truycap" in data:
                    arr = []
                    if data['donvi_id'] is not None and data['donvi_id'] !="":
                        arr.append(data['donvi_id'])
                    data['donvi_id_truycap'] = arr
            else:
                return json({'error_code':'PERMISSION_DENY', 'error_message':'Cần đăng nhập tài khoản đơn vị để thực hiện chức năng này'}, status=520)

async def pre_put_insert_tenkhongdau(request=None, data=None, Model=None, **kw):
    currentUser = current_user(request)
    if currentUser is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    
    if 'ten_coso' in data and 'tenkhongdau' in data:
        data['tenkhongdau'] = convert_text_khongdau(data['ten_coso'])
    if 'ten_coso' in data and 'ten_coso_khongdau' in data:
        data['ten_coso_khongdau'] = convert_text_khongdau(data['ten_coso'])
    if 'ten' in data and 'tenkhongdau' in data:
        data['tenkhongdau'] = convert_text_khongdau(data['ten'])
    if "ten_dichvu" in data and "ten_dichvu_khongdau" in data:
        data['ten_dichvu_khongdau'] = convert_text_khongdau(data['ten_dichvu'])
    if "ten_vattu" in data and "tenkhongdau" in data:
        data['tenkhongdau'] = convert_text_khongdau(data['ten_vattu'])
    if "ten_nhom_vattu" in data and "tenkhongdau" in data:
        data['tenkhongdau'] = convert_text_khongdau(data['ten_nhom_vattu'])
    if 'ten_diadiem' in data and 'tenkhongdau' in data:
        data['tenkhongdau'] = convert_text_khongdau(data['ten_diadiem'])
    if 'name' in data and 'unsigned_name' in data:
        data['unsigned_name'] = convert_text_khongdau(data['name'])
    if 'ten_sanpham' in data and 'tenkhongdau' in data:
        data['tenkhongdau'] = convert_text_khongdau(data['ten_sanpham'])
    if 'ten_donvi' in data and 'tenkhongdau' in data:
        data['tenkhongdau'] = convert_text_khongdau(data['ten_donvi'])
    if 'ten_tieuchuan' in data and 'tenkhongdau' in data:
        data['tenkhongdau'] = convert_text_khongdau(data['ten_tieuchuan'])
    if 'ten_caythuoc' in data and 'tenkhongdau' in data:
        data['tenkhongdau'] = convert_text_khongdau(data['ten_caythuoc'])
    if 'ten_vungtrong' in data and 'tenkhongdau' in data:
        data['tenkhongdau'] = convert_text_khongdau(data['ten_vungtrong'])
    if 'ten_baithuoc' in data and 'tenkhongdau' in data:
        data['tenkhongdau'] = convert_text_khongdau(data['ten_baithuoc'])
    if 'ten_bophan' in data and 'tenkhongdau' in data:
        data['tenkhongdau'] = convert_text_khongdau(data['ten_bophan'])
    if 'ten_nhom' in data and 'tenkhongdau' in data:
        data['tenkhongdau'] = convert_text_khongdau(data['ten_nhom'])
    if 'ten_banhang' in data and 'tenkhongdau' in data:
        data['tenkhongdau'] = convert_text_khongdau(data['ten_banhang'])
    if 'ten_sanpham' in data and 'tenkhongdau' in data:
        data['tenkhongdau'] = convert_text_khongdau(data['ten_sanpham'])
   
async def preprocess_post_put_donvi(request=None, data=None, Model=None, **kw):
    currentUser = current_user(request)
    if currentUser is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)

    if request.method == "POST":
        data['donvi_id'] = currentUser.donvi_id
        data['created_by'] = currentUser.id
    elif request.method == "PUT":
        data['updated_by'] = currentUser.id

   
def convert_diachi(tinhthanh = None, quanhuyen = None, xaphuong = None, sonha_tenduong=None):
    diachi = ''
    if sonha_tenduong is not None:
        diachi = diachi + sonha_tenduong
    if xaphuong is not None:
        if diachi!='':
            diachi = diachi+ ", " + xaphuong['ten']
        else:
            diachi =  xaphuong['ten']
    if quanhuyen is not None:
        if diachi!='':
            diachi = diachi +", " + quanhuyen['ten']
        else:
            diachi = quanhuyen['ten']
    if tinhthanh is not None:
        if diachi!='':
            diachi = diachi +", " + tinhthanh['ten']
        else:
            diachi = tinhthanh['ten']
    return diachi

def test_convert_diachi(tinhthanh=None, quanhuyen=None, xaphuong=None, sonha_tenduong=None):
    diachi = ''

    if sonha_tenduong is not None:
        diachi = diachi + sonha_tenduong

    if isinstance(xaphuong, dict):
        if diachi != '':
            diachi = diachi + ", " + xaphuong.get('ten', '')
        else:
            diachi = xaphuong.get('ten', '')

    if isinstance(quanhuyen, dict):
        if diachi != '':
            diachi = diachi + ", " + quanhuyen.get('ten', '')
        else:
            diachi = quanhuyen.get('ten', '')

    if isinstance(tinhthanh, dict):
        if diachi != '':
            diachi = diachi + ", " + tinhthanh.get('ten', '')
        else:
            diachi = tinhthanh.get('ten', '')

    return diachi

async def pre_getmany_danhmuc_nhacungcap(search_params=None, request=None, **kw):
    uid = current_uid(request)
    if uid is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    else:
        user = db.session.query(User).filter(and_(User.id == uid, User.deleted == False)).first()
        if user is not None:
            if user.has_role("admin_donvi") or user.has_role("canbo"):
                if "filters" in search_params and search_params["filters"] != "":
                    search_params["filters"] = {"$and":[search_params["filters"], {"deleted":{"$eq": False}}]}
                else:
                    search_params["filters"] = {"deleted":{"$eq": False}}

    # Add filter for deleted=false
    if "filters" in search_params:
        search_params["filters"]["deleted"] = {"$eq": False}
    else:
        search_params["filters"] = {"deleted": {"$eq": False}}

async def preprocess_convert_diachi(request=None, data=None, Model=None, **kw):
    if 'diachi' in data and 'tinhthanh' in data and 'quanhuyen' in data and 'xaphuong' in data and 'sonha_tenduong' in data:
        data['diachi'] = test_convert_diachi(data['tinhthanh'], data['quanhuyen'], data['xaphuong'], data['sonha_tenduong'])
    if 'tacgia_diachi' in data and 'tacgia_tinhthanh' in data and 'tacgia_quanhuyen' in data and 'tacgia_xaphuong' in data and 'tacgia_sonha_tenduong' in data:
        data['tacgia_diachi'] = test_convert_diachi(data['tacgia_tinhthanh'], data['tacgia_quanhuyen'], data['tacgia_xaphuong'], data['tacgia_sonha_tenduong'])
    if 'diachi_coso' in data and 'tinhthanh_coso' in data and 'quanhuyen_coso' in data and 'xaphuong_coso' in data and 'sonha_tenduong_coso' in data:
        data['diachi_coso'] = test_convert_diachi(data['tinhthanh_coso'], data['quanhuyen_coso'], data['xaphuong_coso'], data['sonha_tenduong_coso'])

async def pre_getmany_donvi(search_params=None,request=None, **kw):
    uid = current_uid(request)
    if uid is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    else:
        user = db.session.query(User).filter(and_(User.id == uid, User.deleted == False)).first()
        if user is not None and user.donvi_id is not None:
            
            if user.has_role("admin_donvi") or user.has_role("canbo"):
                if "filters" in search_params and search_params["filters"] != "":
                    search_params["filters"] = {"$and":[search_params["filters"], {"donvi_id":{"$eq": user.donvi_id}},{"deleted":{"$eq": False}}]}
                else:
                    search_params["filters"] = {"$and":[{"donvi_id":{"$eq": user.donvi_id}},{"deleted":{"$eq": False}}]}

async def pre_getmany_user(search_params=None,request=None, **kw):
    uid = current_uid(request)
    if uid is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    else:
        user = db.session.query(User).filter(and_(User.id == uid, User.deleted == False)).first()
        if user is not None and user.donvi_id is not None:
            
            if user.has_role("admin_donvi") or user.has_role("canbo"):
                donvi= user.donvi
                tuyendonvi_id = ""
                if donvi is not None:
                    tuyendonvi_id = donvi.tuyendonvi_id
                    if user.has_role("admin_donvi") and tuyendonvi_id == "10":
                        if "filters" in search_params and search_params["filters"] != "":
                            search_params["filters"] = {"$and":[search_params["filters"],{"deleted":{"$eq": False}}]}
                        else:
                            search_params["filters"] = {"$and":[{"deleted":{"$eq": False}}]}
                    else:
                        if "filters" in search_params and search_params["filters"] != "":
                            search_params["filters"] = {"$and":[search_params["filters"], {"donvi_id":{"$eq": user.donvi_id}},{"deleted":{"$eq": False}}]}
                        else:
                            search_params["filters"] = {"$and":[{"donvi_id":{"$eq": user.donvi_id}},{"deleted":{"$eq": False}}]}                        



async def pre_getmany_co_cq(search_params=None,request=None, **kw):
    uid = current_uid(request)
    if uid is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    else:
        user = db.session.query(User).filter(and_(User.id == uid, User.deleted == False)).first()
        if user is not None and user.donvi_id is not None:
            
            if user.has_role("admin_donvi") or user.has_role("canbo"):
                donvi= user.donvi
                tuyendonvi_id = ""
                if donvi is not None:
                    tuyendonvi_id = donvi.tuyendonvi_id
                    if (user.has_role("admin_donvi") or user.has_role("canbo"))  and tuyendonvi_id == "10":
                        if "filters" in search_params and search_params["filters"] != "":
                            search_params["filters"] = {"$and":[search_params["filters"],{"deleted":{"$eq": False}}]}
                        else:
                            search_params["filters"] = {"$and":[{"deleted":{"$eq": False}}]}
                    else:
                        if "filters" in search_params and search_params["filters"] != "":
                            search_params["filters"] = {"$and":[search_params["filters"], {"donvi_id":{"$eq": user.donvi_id}},{"deleted":{"$eq": False}}]}
                        else:
                            search_params["filters"] = {"$and":[{"donvi_id":{"$eq": user.donvi_id}},{"deleted":{"$eq": False}}]}                        

async def pre_getmany_co_cq_new(search_params=None,request=None, **kw):
    uid = current_uid(request)
    if uid is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    else:
        user = db.session.query(User).filter(and_(User.id == uid, User.deleted == False)).first()
        if user is not None and user.donvi_id is not None:
            
            if user.has_role("admin_donvi") or user.has_role("canbo"):
                donvi= user.donvi
                tuyendonvi_id = ""
                if donvi is not None:
                    tuyendonvi_id = donvi.tuyendonvi_id
                    if (user.has_role("admin_donvi") or user.has_role("canbo"))  and tuyendonvi_id == "10":
                        if "filters" in search_params and search_params["filters"] != "":
                            search_params["filters"] = {"$and":[search_params["filters"], {"$or": [{"trangthai": {"$eq": 2}},{"trangthai": {"$eq": 1}}, {"trangthai": {"$eq": 3}}]}, {"deleted":{"$eq": False}}]}
                        else:
                            search_params["filters"] = {"$and":[{"$or": [{"trangthai": {"$eq": 2}}, {"trangthai": {"$eq": 1}}, {"trangthai": {"$eq": 3}}]}, {"deleted":{"$eq": False}}]}
                    else:
                        if "filters" in search_params and search_params["filters"] != "":
                            search_params["filters"] = {"$and":[search_params["filters"], {"donvi_id":{"$eq": user.donvi_id}},{"deleted":{"$eq": False}}]}
                        else:
                            search_params["filters"] = {"$and":[{"donvi_id":{"$eq": user.donvi_id}},{"deleted":{"$eq": False}}]}     



async def pre_getmany_gacp(search_params=None,request=None, **kw):
    uid = current_uid(request)
    if uid is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    else:
        user = db.session.query(User).filter(and_(User.id == uid, User.deleted == False)).first()
        if user is not None and user.donvi_id is not None:
            
            if user.has_role("admin_donvi") or user.has_role("canbo"):
                donvi= user.donvi
                tuyendonvi_id = ""
                if donvi is not None:
                    tuyendonvi_id = donvi.tuyendonvi_id
                    if (user.has_role("admin_donvi") or user.has_role("canbo"))  and tuyendonvi_id == "10":
                        if "filters" in search_params and search_params["filters"] != "":
                            search_params["filters"] = {"$and":[search_params["filters"],{"deleted":{"$eq": False}},{"$or": [{"trangthai" : {"$eq" : 2}}, {"trangthai" : {"$eq" : 1}}, {"trangthai" : {"$eq" : 3}}]} ]}
                        else:
                            search_params["filters"] = {"$and":[{"deleted":{"$eq": False}}, {"$or": [{"trangthai" : {"$eq" : 2}}, {"trangthai" : {"$eq" : 1}}, {"trangthai" : {"$eq" : 3}}]}]}
                    else:
                        if "filters" in search_params and search_params["filters"] != "":
                            search_params["filters"] = {"$and":[search_params["filters"], {"donvi_id":{"$eq": user.donvi_id}},{"deleted":{"$eq": False}}]}
                        else:
                            search_params["filters"] = {"$and":[{"donvi_id":{"$eq": user.donvi_id}},{"deleted":{"$eq": False}}]}       


async def pre_delete(request=None, instance_id=None, Model=None, **kw):
    currentUser = current_user(request)
    if currentUser is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    record = db.session.query(Model).filter(Model.id == instance_id).first()
    if record is None:
        return json({'error_code':'NOT_FOUND', 'error_message':'Không tìm thấy dữ liệu tương ứng'}, status=520)
    
    record.deleted = True
    record.deleted_by = currentUser.id
    db.session.commit()
    return json(to_dict(record), status=200)
        
async def pre_delete_donvi_cungung(request=None, instance_id=None, Model=None, **kw):
    currentUser = current_user(request)
    if currentUser is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    record = db.session.query(Model).filter(Model.id == instance_id).first()
    if record is None:
        return json({'error_code':'NOT_FOUND', 'error_message':'Không tìm thấy dữ liệu tương ứng'}, status=520)
    
    record.deleted = True
    record.deleted_by = currentUser.id
    record.ma_donvi = ma_donvi_generator()
    db.session.commit()
    return json(to_dict(record), status=200)
        
async def pre_delete_nhasanxuat_donvi(request=None, instance_id=None, Model=None, **kw):
    currentUser = current_user(request)
    if currentUser is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    record = db.session.query(Model).filter(Model.id == instance_id).first()
    if record is None:
        return json({'error_code':'NOT_FOUND', 'error_message':'Không tìm thấy dữ liệu tương ứng'}, status=520)
    
    record.deleted = True
    record.deleted_by = currentUser.id
    record.ma = ma_donvi_generator()
    db.session.commit()
    return json(to_dict(record), status=200)
def check_content_json(request):
    ret = False
    try:
        content_type = request.headers.get('Content-Type', "")
        ret = content_type.startswith('application/json')
    except:
        pass
    return ret


def valid_phone_number(phone_number):
    if phone_number is None:
        return False
    if phone_number.isdigit() and len(phone_number)>=8 and len(phone_number)<=12 and phone_number.startswith("0"):
        return True
    return False

# def convert_text_khongdau(text):
#     if text is None:
#         return None
#     kituA=["á","à","ạ","ã","ả","â","ấ","ầ","ậ","ẫ","ẩ","ă","ặ","ằ","ắ","ẳ","ẵ"]
#     kituE=["é","è","ẹ","ẻ","ẽ","ê","ế","ề","ệ","ễ","ể"]
#     kituI=["í","ì","ị","ỉ","ĩ"]
#     kituO=["ò","ó","ọ","ỏ","õ","ô","ồ","ố","ộ","ổ","ỗ","ơ","ờ","ớ","ợ","ở","ỡ"]
#     kituU=["ù","ú","ụ","ủ","ũ","ư","ừ","ứ","ự","ử","ữ"]
#     kituY=["ỳ","ý","ỵ","ỷ","ỹ"]

#     ten = text.lower()
#     for i in ten:
#         if i in kituA:
#             ten = ten.replace(i,"a")
#         elif i in kituE:
#             ten = ten.replace(i,"e")
#         elif i in kituI:
#             ten = ten.replace(i,"i")
#         elif i in kituO:
#             ten = ten.replace(i,"o")
#         elif i in kituU:
#             ten = ten.replace(i,"u")
#         elif i in kituY:
#             ten = ten.replace(i,"y")
#         elif i=="đ":
#             ten = ten.replace(i,"d")
#     return ten

def convert_text_khongdau(text):
    if text is None:
        return None
    ten = slugify(text.lower(), separator=" ")
    ten = ten.strip()
    return ten


def password_generator(size = 8, chars=string.ascii_letters + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

def ma_donvi_generator(size = 24, chars=string.ascii_letters + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

def generator_salt():
    return ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(24))

def current_uid(request):
    user_token = request.headers.get("X-USER-TOKEN", None)
    if user_token is None:
        return None
    uid = redisdb.get("sessions:" + user_token)
    if uid is not None:
        p = redisdb.pipeline()
        p.set("sessions:" + user_token, uid)
        p.expire("sessions:" + user_token, app.config.get('SESSION_EXPIRED', 86400))
        uid_string = uid.decode("utf8")
        p.set("sessions-uid:" + uid_string, user_token)
        p.expire("sessions-uid:" + uid_string, app.config.get('SESSION_EXPIRED', 86400))
        p.execute()
        return uid.decode('utf8')
    
    return None

def current_user(request):
    user_token = request.headers.get("X-USER-TOKEN", None)
    if user_token is None:
        return None
    uid = redisdb.get("sessions:" + user_token)
    if uid is not None:
        p = redisdb.pipeline()
        p.set("sessions:" + user_token, uid)
        p.expire("sessions:" + user_token, app.config.get('SESSION_EXPIRED', 86400))
        uid_string = uid.decode("utf8")
        p.set("sessions-uid:" + uid_string, user_token)
        p.expire("sessions-uid:" + uid_string, app.config.get('SESSION_EXPIRED', 86400))
        p.execute()
        currentUser = db.session.query(ProfileUser).filter(ProfileUser.id == uid.decode('utf8'), ProfileUser.deleted == False).first()
        if (currentUser is not None):
            return currentUser
    
    return None    

def generate_user_token(uid_user, token):
    if token is None or token == "":
        token =  binascii.hexlify(uuid.uuid4().bytes).decode()
    p1 = redisdb.pipeline()
    p1.set("sessions:" + token, uid_user)
    p1.expire("sessions:" + token, app.config.get('SESSION_EXPIRE_TIME', 86400))
    p1.execute()
    return token


def current_uid_canbo(request):
    user_token = request.headers.get("X-USER-TOKEN", None)
    if user_token is None:
        return None
    uid = redisdb.get("sessions-canbo:" + user_token)
    if uid is not None:
        p = redisdb.pipeline()
        p.set("sessions-canbo:" + user_token, uid)
        p.expire("sessions-canbo:" + user_token, app.config.get('SESSION_EXPIRED', 86400))
        p.execute()
        return uid.decode('utf8')
    
    return None

async def get_current_user(request, userId):
    if userId is not None:
        profileUser = db.session.query(ProfileUser).filter(or_(ProfileUser.id ==userId,ProfileUser.dienthoai == userId, User.email == userId)).first()
        if profileUser is None:
            return None
        user_token = request.headers.get("X-USER-TOKEN", None)
        return response_current_user(profileUser, user_token)
    return None

def response_current_user(profileUser, token = None):
    response = {}
    token = generate_user_token(profileUser.id, token)
    response["token"] = token
    
    response["id"] = profileUser.id
    response["hoten"] = profileUser.hoten
    response["macongdan"] = profileUser.macongdan
    response["email"] = profileUser.email
    response["dienthoai"] = profileUser.dienthoai
    response["diachi"] = profileUser.diachi
    response['vaitro'] = profileUser.vaitro
    response['avatar_url'] = profileUser.avatar_url
    response["active"] = profileUser.active
    response["donvi_id"] = profileUser.donvi_id
    if profileUser.donvi is not None:
        donvi = to_dict(profileUser.donvi)
        response['donvi'] = {
            'id' : donvi.get("id"),
            'ma_coso': donvi.get('ma_coso'),
            'ten_coso': donvi.get('ten_coso'),
            'tenkhongdau': donvi.get('tenkhongdau'),
            'loai_donvi': donvi.get('loai_donvi'),
            'tuyendonvi_id': donvi.get("tuyendonvi_id"),
            'diachi': donvi.get("diachi"),
            'captren_id': donvi.get('captren_id'),
            'tinhthanh_id': donvi.get('tinhthanh_id'),
            'tinhthanh': donvi.get('tinhthanh'),
            'quanhuyen_id': donvi.get('quanhuyen_id'),
            'quanhuyen': donvi.get('quanhuyen'),
            'xaphuong_id': donvi.get('xaphuong_id'),
            'xaphuong': donvi.get('xaphuong')
        }
        response["ma_coso"] = donvi.get('ma_coso')
    
    return response

async def hasRole(request, role):
    uid = current_uid(request)
    if uid is None:
        return False;
    else:
        currentUser = await get_current_user(request, uid)
        if currentUser is not None and role in currentUser["vaitro"]:
            return True
        else:
            return False

async def validate_admin(request, **kw):
    
    uid = current_uid(request)
    if uid is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên đăng nhập'}, status=520)
    else:
        user = db.session.query(User).filter(and_(User.id == uid,User.deleted == False)).first()
        donvi_id = user.donvi_id
        tuyendonvi_id =  None
        check_donvi = db.session.query(DonVi).filter(and_(DonVi.id == donvi_id)).first()
        if check_donvi is not None:
            tuyendonvi_id = check_donvi.tuyendonvi_id
        roles = user.roles
        list_role = []
        for role in roles:
            list_role.append(role.vaitro)
        if 'admin_donvi' not in list_role and 'admin' not in list_role and tuyendonvi_id != "10" :
            return json({'error_code':'ERROR_PERMISSION', 'error_message':'Permission deny!'}, status=520)

async def validate_admin_donvi(request, **kw):
    
    uid = current_uid(request)
    if uid is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên đăng nhập'}, status=520)
    else:
        user = db.session.query(User).filter(and_(User.id == uid,User.deleted == False)).first()
        roles = user.vaitro
        list_role = []
        for role in roles:
            list_role.append(role.vaitro)
        if 'admin' not in list_role and "admin_donvi" not in list_role:
            return json({'error_code':'ERROR_PERMISSION', 'error_message':'Không có quyền thực hiện hành động này'}, status=520)

def validate_user(request, **kw):
    uid = current_uid(request)
    if uid is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên đăng nhập'}, status=520)

def deny_request(request, **kw):
    return json({'error_code':'ERROR_PERMISSION', 'error_message':'Không có quyền thực hiện hành động này'}, status=520)


    


def validate_email(email):
    return re.match('^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$', email)

def default_uuid():
    return str(uuid.uuid4())


async def send_mail(subject, recipient, body):
    host = app.config.get('MAIL_SERVER_HOST')
    port = app.config.get('MAIL_SERVER_PORT')
    user = app.config.get('MAIL_SERVER_USER')
    password = app.config.get('MAIL_SERVER_PASSWORD')

    loop = asyncio.get_event_loop()

    #server = aiosmtplib.SMTP(host, port, loop=loop, use_tls=False, use_ssl=True)
    server = aiosmtplib.SMTP(hostname=host, port=port, loop=loop, use_tls=False)
    await server.connect()

    await server.starttls()
    await server.login(user, password)

    async def send_a_message():
        # message = MIMEText(body)
        # message = MIMEText(body, _charset='utf-8')
        message = MIMEText(body, "html")
        message['From'] = app.config.get('MAIL_SERVER_USER')
        print("..............", message['From'])
        #message['To'] = ','.join(new_obj.get('email_to'))
        message['To'] = recipient
        # message['Subject'] = Header(subject, "utf-8")
        message['Subject'] = Header(subject.encode('utf-8'), 'UTF-8').encode()
        await server.send_message(message)

    await send_a_message()

async def generate_stt(request=None, Model=None, result=None, **kw):
    page = result['page'] if 'page' in result else 1
    results_per_page = result['results_per_page'] if 'results_per_page' in result else 15
    index = (page-1) * results_per_page + 1
    if 'objects' in result:
        data = []
        objects = result["objects"]
        for obj in objects:
            obj['stt'] = index
            index = index + 1
            data.append(obj)
        result['objects'] = data

async def postprocess_stt(request=None, Model=None, result=None, **kw):
    if "num_results" in result and (result["num_results"] > 0):
        results_per_page = request.args.get('results_per_page')
        if results_per_page is not None:
            results_per_page = int(request.args.get('results_per_page'))
        else:
            results_per_page = 100

        page = result['page']
        if page is not None:
            page = int(result['page'])
        else:
            page = 1
        stt = (page - 1) * results_per_page
        for object in result['objects']:
            object['stt'] = stt + 1
            stt = stt + 1

def validate_number(number):
    if number == "nan" or number == "NAN" or number == "NaN":
        return 0
    try:
        number = float(number)
        if number < 0:
            number = 0
        return number
    except:
        return 0

def convert_number_to_money(number, mode = 1):
    #mode = 1. dang format 129.123,00, #mode 2 dang format 1.129.123
    text = ''
    if number is not None and (isinstance(number, float) or isinstance(number, int)) and number > 0:
        if mode == 3:
            text = int(number)
        else:
            text_number = "{:,.0f}".format(number)
            if mode == 1:
                text_number = "{:,.2f}".format(number)
            text = text_number.replace(",",";").replace(".", ",").replace(";", ".")
    else:
        text = 0
    return text
    

def make_base64_qr_code(text):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=4,
        border=4,
    )

    qr.add_data(text)
    qr.make(fit=True)
    img = qr.make_image()

    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue())
    img_str  = "data:image/png;base64,"+str(img_str.decode('utf-8'))
    return img_str

#convet to timestamp to string YYYY MM DD HH MM SS
def parse_date_custom(timestamp):
    date = datetime.fromtimestamp(timestamp)
    tmp = ""
    tmp = tmp + str(date.year)
    if (date.month <= 9):
        tmp = tmp + "0" + str(date.month)
    else:
        tmp = tmp + str(date.month)
    if (date.day <= 9):
        tmp = tmp + "0" + str(date.day)
    else:
        tmp = tmp + str(date.day)
    if (date.hour <= 9):
        tmp = tmp + "0" + str(date.hour)
    else:
        tmp = tmp + str(date.hour)
    if (date.minute <= 9):
        tmp = tmp + "0" + str(date.minute)
    else:
        tmp = tmp + str(date.minute)
    if (date.second <= 9):
        tmp = tmp + "0" + str(date.second)
    else:
        tmp = tmp + str(date.second)
    # if (date.microsecond <= 9):
    #     tmp = tmp + "0" + str(date.microsecond)[0:2]
    # else:
    #     tmp = tmp + str(date.second)[0:2]
    return tmp


def get_time_range(month, year):
    arr_nhuan = [0,31,29,31,30,31,30,31,31,30,31,30,31]
    arr_ko_nhuan = [0,31,28,31,30,31,30,31,31,30,31,30,31]
    ngay_bat_dau = None
    ngay_ket_thuc = None
    if (check_nam_nhuan(year) == True):
        ngay_bat_dau = str(year)
        if month <=9:
            ngay_bat_dau = ngay_bat_dau + "0" + str(month) + "01000000"
        else:
            ngay_bat_dau = ngay_bat_dau + str(month) + "01000000"

        ngay_ket_thuc = str(year)
        if month <=9:
            tmp = arr_nhuan[month]
            ngay_ket_thuc = ngay_ket_thuc + "0" + str(month) + str(tmp) + "235959"
        else:
            tmp = arr_nhuan[month]
            ngay_ket_thuc = ngay_ket_thuc + str(month) + str(tmp) + "235959"
    else:
        ngay_bat_dau = str(year)
        if month <=9:
            ngay_bat_dau = ngay_bat_dau + "0" + str(month) + "01000000"
        else:
            ngay_bat_dau = ngay_bat_dau + str(month) + "01000000"

        ngay_ket_thuc = str(year)
        if month <=9:
            tmp = arr_ko_nhuan[month]
            ngay_ket_thuc = ngay_ket_thuc + "0" + str(month) + str(tmp) + "235959"
        else:
            tmp = arr_ko_nhuan[month]
            ngay_ket_thuc = ngay_ket_thuc + str(month) + str(tmp) + "235959"

    return ngay_bat_dau, ngay_ket_thuc

def check_nam_nhuan(year):
    tmp = abs(year - 2020)
    if (tmp % 4) == 0:
        return True
    else:
        return False

async def pre_deny_put_many(request=None, data=None, Model=None, **kw):
    return json({'error_code':'DENY_REQUEST', 'error_message':'request not found'}, status=401)

def convert_to_strtime(time, mode = 1):
    # 1 - dd/mm/YYYY, 2 - HH:MM dd/mm/YYYY
    results = ""
    if time is not None:
        time = str(time)
        if mode == 1 and len(time) > 7:
            results = time[6:8] + "/" + time[4:6] + "/" + time[0:4]
        elif mode == 2 and len(time) > 11:
            results = time[8:10] + ":" + time[10:12] + " " + time[6:8] + "/" + time[4:6] + "/" + time[0:4]
    return results

async def validate_token_donvi_get_put_delete_single(request=None, instance_id = None, Model=None, **kw):
    currentUser = current_user(request)
    if currentUser is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên đăng nhập'}, status=520)

    donvi_id = currentUser.donvi_id

    if currentUser.has_role("admin") == False and (donvi_id is None or donvi_id == ""):
        return json({'error_code':'DENY_REQUEST', 'error_message':'request not found'}, status=401)
    else:
        if instance_id is not None:
            checkData = db.session.query(Model).filter(Model.id == instance_id).first()
            if checkData is not None:
                donvi_id_data = checkData.donvi_id

                if donvi_id_data is not None and donvi_id_data != donvi_id:
                    if request.method == "GET":
                        if currentUser.has_role("admin") or \
                             (currentUser.donvi is not None and \
                        currentUser.donvi.tuyendonvi_id == "10"):
                            pass
                        else:
                            return json({'error_code':'DENY_REQUEST', 'error_message':'request not found'}, status=401)
                    else:
                        return json({'error_code':'DENY_REQUEST', 'error_message':'request not found'}, status=401)
