import asyncio
from re import A, S
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
from math import fabs, floor
from application.controllers.helpers.helper_common import *
from application.controllers.quanlykho import check_index_keys_dict_int_arr, pre_process_chitiet_old_version
from sqlalchemy import or_, and_, desc, asc
from application.models.model_donvi import *
from application.models.model_quanlykho import *
from application.extensions import auth
from application.controllers.upload import *
from sqlalchemy.orm.attributes import flag_modified
from application.extensions import jinja
import random
from datetime import datetime


def generate_makiemnghiem():
    now = datetime.now()

    year = now.year
    month = now.month
    day = now.day

    result = str(year) + str(month).zfill(2) + str(day).zfill(2)

    random.seed(datetime.now().timestamp())

    for i in range(4):
        result += str(random.randint(0,9))

    return result

async def pre_process_phieukiemnghiem(request = None, Model = None, data = None, **kw):
    if 'id' in data and data['id'] is not None:
        phieuKiemNghiem = db.session.query(PhieuKiemNghiem).filter(\
            PhieuKiemNghiem.id == data['id'], \
            PhieuKiemNghiem.deleted == False).first()
        if  phieuKiemNghiem is not None:
            ##nếu thay đổi số lô và dược liệu kiểm tra xem đã được sử dụng hay chưa
            ##các loại sử dụng CQ
            ##phieu nhập chi tiết
            if phieuKiemNghiem.so_lo != data.get("so_lo") or \
                phieuKiemNghiem.id_sanpham != data.get("id_sanpham"):

                chungnhanco_chitiet = db.session.query(GiayChungNhanCOChitiet).filter(\
                    GiayChungNhanCOChitiet.phieu_kiem_nghiem_id == phieuKiemNghiem.id, \
                    GiayChungNhanCOChitiet.deleted == False).first()

                if chungnhanco_chitiet is not None:
                    return json({'error_code':'PARAM_ERROR', 'error_message':'Phiếu kiểm nghiệm đã được sử dụng, không thể thay đổi số lô và dược liệu'}, status=520)


async def post_process_change_giayphep_nhapkhau(request = None, Model= None, result = None, **kw):
    if 'id' in result and result['id'] is not None:
        giayPhep = db.session.query(GiayPhepNhapKhau).filter(\
            GiayPhepNhapKhau.id == result['id'], \
            GiayPhepNhapKhau.deleted == False).first()
        if giayPhep is not None:
            #update chi tiet giay phep

            chitiet_giayphep = db.session.query(GiayPhepNhapKhauChiTiet).filter(\
                GiayPhepNhapKhauChiTiet.giayphep_id == giayPhep.id, \
                GiayPhepNhapKhauChiTiet.deleted == False).all()

            for item in chitiet_giayphep:
                item.so_giay_phep = giayPhep.so_giay_phep
            db.session.flush()
            
            #update CO 
            chungnhanCO = db.session.query(GiayChungNhanCO).filter(\
                GiayChungNhanCO.giayphep_nhapkhau_id == giayPhep.id, \
                GiayChungNhanCO.deleted == False).all()

            for item in chungnhanCO:
                item.so_giay_phep = giayPhep.so_giay_phep
            db.session.flush()

            #update CO chi tiet

            chungnhanCOChiTiet = db.session.query(GiayChungNhanCOChitiet).filter(\
                GiayChungNhanCOChitiet.giayphep_nhapkhau_id == giayPhep.id, \
                GiayChungNhanCOChitiet.deleted == False).all()

            for item in chungnhanCOChiTiet:
                item.so_giay_phep = giayPhep.so_giay_phep
            db.session.flush()

        db.session.commit()

async def post_process_change_phieukiemnghiem(request = None, Model= None, result = None, **kw):
    if 'id' in result and result['id'] is not None:
        phieuKiemNghiem = db.session.query(PhieuKiemNghiem).filter(\
            PhieuKiemNghiem.id == result['id'], \
            PhieuKiemNghiem.deleted == False).first()

        if phieuKiemNghiem is not None:
            #update CO chi tiet
            chungnhanco_chitiet = db.session.query(GiayChungNhanCOChitiet).filter(\
                GiayChungNhanCOChitiet.phieu_kiem_nghiem_id == phieuKiemNghiem.id, \
                GiayChungNhanCOChitiet.deleted == False).all()

            for itemCO in chungnhanco_chitiet:
                itemCO.ma_kiem_nghiem = phieuKiemNghiem.ma_kiem_nghiem
            db.session.flush()

        db.session.commit()

async def pre_check_sogiayphep(request = None, Model = None, data = None, **kw):
    if 'so_giay_phep' in data:
        so_giay_phep = data['so_giay_phep']
        if so_giay_phep is None or so_giay_phep == "":
            return json({'error_code': 'PARAM_ERROR', 'error_message': 'Vui lòng nhập số giấy phép nhập khẩu'}, status=520)
        else:
            if request.method == 'POST':
                check_giayphep = db.session.query(GiayPhepNhapKhau).filter(\
                    GiayPhepNhapKhau.so_giay_phep == so_giay_phep, \
                    GiayPhepNhapKhau.deleted == False).first()
                if check_giayphep is not None:
                    return json({'error_code': "PARAM_ERROR", 'error_message': "Số giấy phép nhập khẩu đã tồn tại trên hệ thống"}, status=520)
            elif request.method == 'PUT':
                check_giayphep = db.session.query(GiayPhepNhapKhau).filter(\
                    GiayPhepNhapKhau.so_giay_phep == so_giay_phep, \
                    GiayPhepNhapKhau.id != data['id'], \
                    GiayPhepNhapKhau.deleted == False).first()
                if check_giayphep is not None:
                    return json({'error_code': "PARAM_ERROR", 'error_message': "Số giấy phép nhập khẩu đã tồn tại trên hệ thống"}, status=520)

async def post_process_change_soluong_nhapkhau(request = None, Model= None, result = None, **kw):
    if request.method == "POST":
        loai_co = result['loai_co']
        if loai_co ==1 and result['giayphep_nhapkhau_id'] is not None \
            and result['giayphep_nhapkhau_id'] != "":
            id_sanpham = result['id_sanpham']
            giayphep_chitiet = db.session.query(GiayPhepNhapKhauChiTiet).filter(\
                GiayPhepNhapKhauChiTiet.giayphep_id == result['giayphep_nhapkhau_id'],\
                GiayPhepNhapKhauChiTiet.id_sanpham == id_sanpham, \
                GiayPhepNhapKhauChiTiet.deleted == False).all()

            soluong = validate_number(result['soluong'])

            for itemChitiet in giayphep_chitiet:
                itemChitiet.soluong_capphep = validate_number(itemChitiet.soluong_capphep)
                itemChitiet.soluong_danhap = validate_number(itemChitiet.soluong_danhap)

                if itemChitiet.soluong_danhap >= itemChitiet.soluong_capphep or soluong <= 0:
                    continue
                else:
                    if itemChitiet.soluong_capphep - itemChitiet.soluong_danhap >= soluong:
                        itemChitiet.soluong_danhap += soluong
                        soluong = 0
                        break
                    else:
                        itemChitiet.soluong_danhap += (itemChitiet.soluong_capphep - itemChitiet.soluong_danhap)
                        soluong -= (itemChitiet.soluong_capphep - itemChitiet.soluong_danhap)
                    

        db.session.commit()

    elif request.method == "PUT":
        obj_old = request.headers.get("old_version",None)
        if obj_old is not None:
            loai_co_old = obj_old['loai_co']
            if loai_co_old ==1 and obj_old['giayphep_nhapkhau_id'] is not None and \
                obj_old['giayphep_nhapkhau_id'] != "":
                ##hoàn trả số lượng đã nhập cho giấy phép nhập khẩu
                id_sanpham_old = obj_old['id_sanpham']
                giayphep_chitiet = db.session.query(GiayPhepNhapKhauChiTiet).filter(\
                    GiayPhepNhapKhauChiTiet.giayphep_id == obj_old['giayphep_nhapkhau_id'],\
                    GiayPhepNhapKhauChiTiet.id_sanpham == id_sanpham_old, \
                    GiayPhepNhapKhauChiTiet.deleted == False).all()


                soluong_old = validate_number(obj_old['soluong'])
                for itemChitiet in giayphep_chitiet:
                    itemChitiet.soluong_danhap = validate_number(itemChitiet.soluong_danhap)
                    if itemChitiet.soluong_danhap <=0 or soluong_old <= 0:
                        continue
                    else:
                        if itemChitiet.soluong_danhap >= soluong_old:
                            itemChitiet.soluong_danhap -= soluong_old
                            soluong_old = 0
                            break
                        else:
                            soluong_old -= itemChitiet.soluong_danhap
                            itemChitiet.soluong_danhap =0

                db.session.flush()
                
                
            loai_co_new = result['loai_co']
            if loai_co_new ==1 and result['giayphep_nhapkhau_id'] is not None and \
                result['giayphep_nhapkhau_id'] !="":
                id_sanpham = result['id_sanpham']
                giayphep_chitiet_new = db.session.query(GiayPhepNhapKhauChiTiet).filter(\
                    GiayPhepNhapKhauChiTiet.giayphep_id == result['giayphep_nhapkhau_id'],\
                    GiayPhepNhapKhauChiTiet.id_sanpham == id_sanpham, \
                    GiayPhepNhapKhauChiTiet.deleted == False).all()

                soluong = validate_number(result['soluong'])

                for itemChitiet in giayphep_chitiet_new:
                    itemChitiet.soluong_capphep = validate_number(itemChitiet.soluong_capphep)
                    itemChitiet.soluong_danhap = validate_number(itemChitiet.soluong_danhap)

                    if itemChitiet.soluong_danhap >= itemChitiet.soluong_capphep or soluong <= 0:
                        continue
                    else:
                        if itemChitiet.soluong_capphep - itemChitiet.soluong_danhap >= soluong:
                            itemChitiet.soluong_danhap += soluong
                            soluong = 0
                            break
                        else:
                            itemChitiet.soluong_danhap += (itemChitiet.soluong_capphep - itemChitiet.soluong_danhap)
                            soluong -= (itemChitiet.soluong_capphep - itemChitiet.soluong_danhap)


        db.session.commit()

async def pre_check_soluong_giayphep(request = None, Model = None, data = None, **kw):
    loai_co = data.get("loai_co")
    giayphep_nhapkhau_id = data.get("giayphep_nhapkhau_id")
    soluong_current = data.get("soluong")
    id_sanpham = data.get("id_sanpham")
    donvi_id = data.get("donvi_id")
    if loai_co is not None and giayphep_nhapkhau_id is not None and soluong_current is not None and id_sanpham is not None and donvi_id is not None:
        if loai_co ==1 and giayphep_nhapkhau_id is not None and giayphep_nhapkhau_id != "":
            ##method post
            if request.method == "POST":
                tong_soluong_capphep = 0
                check_giay_phep_chitiet = db.session.query(GiayPhepNhapKhauChiTiet).filter(and_(GiayPhepNhapKhauChiTiet.giayphep_id == giayphep_nhapkhau_id, \
                    GiayPhepNhapKhauChiTiet.donvi_id == donvi_id,\
                    GiayPhepNhapKhauChiTiet.id_sanpham == id_sanpham, \
                    GiayPhepNhapKhauChiTiet.deleted == False)).all()
                if isinstance(check_giay_phep_chitiet, list) and len(check_giay_phep_chitiet) > 0:
                    for item in check_giay_phep_chitiet:
                        soluong_capphep = item.soluong_capphep
                        if soluong_capphep is None:
                            soluong_capphep =0
                        tong_soluong_capphep += float(soluong_capphep)

                soluong_current = float(soluong_current)
                soluong_danhap = 0

                check_co_chitiet = db.session.query(GiayChungNhanCOChitiet).filter(and_(GiayChungNhanCOChitiet.donvi_id== donvi_id,\
                    GiayChungNhanCOChitiet.giayphep_nhapkhau_id == giayphep_nhapkhau_id, GiayChungNhanCOChitiet.id_sanpham == id_sanpham,
                    GiayChungNhanCOChitiet.deleted == False)).all()

                if isinstance(check_co_chitiet,list) and len(check_co_chitiet) > 0:
                    for item in check_co_chitiet:
                        soluong = item.soluong
                        if soluong is None:
                            soluong =0
                        soluong_danhap += soluong
                    if soluong_danhap > tong_soluong_capphep:
                        return json({"error_code" : "PARAM_ERROR", "error_message" : "Số lượng được cấp phép theo giấy phép nhập khẩu là {}. Số lượng dược liệu đã nhập trong các giấy chứng nhận nguồn gốc (CO) là {} đã vượt mức số lượng được cấp phép.".format(tong_soluong_capphep, soluong_danhap)}, status=520)
                    else:
                        soluong_danhap_new = soluong_danhap + float(soluong_current)
                        if soluong_danhap_new > tong_soluong_capphep:
                            return json({"error_code" : "PARAM_ERROR", "error_message" : "Số lượng được cấp phép theo giấy phép nhập khẩu là {}. Số lượng dược liệu đã nhập trong các giấy chứng nhận nguồn gốc (CO) là {}. Số lượng nhập hiện tại là : {} đã vượt quá số lượng được cấp phép.".format(tong_soluong_capphep, soluong_danhap, soluong_current)}, status=520)
                else:
                    if soluong_current > tong_soluong_capphep:
                        return json({"error_code" : "PARAM_ERROR", "error_message" : "Số lượng được cấp phép theo giấy phép nhập khẩu là {}. Số lượng nhập hiện tại là {} đã vượt quá hạn số lượng được cấp phép".format(tong_soluong_capphep,soluong_current)}, status=520)
            
            elif request.method == "PUT":
                id = data['id']
                if id is None or id == "":
                    return json({'error_code':"PARAM_ERROR", "error_message": "Tham số không hợp lệ"}, status = 520)
                tong_soluong_capphep = 0
                check_giay_phep_chitiet = db.session.query(GiayPhepNhapKhauChiTiet).filter(and_(GiayPhepNhapKhauChiTiet.giayphep_id == giayphep_nhapkhau_id, \
                    GiayPhepNhapKhauChiTiet.donvi_id == donvi_id,\
                    GiayPhepNhapKhauChiTiet.id_sanpham == id_sanpham, \
                    GiayPhepNhapKhauChiTiet.deleted == False)).all()
                if isinstance(check_giay_phep_chitiet, list) and len(check_giay_phep_chitiet) > 0:
                    for item in check_giay_phep_chitiet:
                        soluong_capphep = item.soluong_capphep
                        if soluong_capphep is None:
                            soluong_capphep =0
                        tong_soluong_capphep += float(soluong_capphep)


                soluong_current = float(soluong_current)
                soluong_danhap = 0

                check_co_chitiet = db.session.query(GiayChungNhanCOChitiet).filter(and_(\
                    GiayChungNhanCOChitiet.id_sanpham == id_sanpham,\
                    GiayChungNhanCOChitiet.giayphep_nhapkhau_id == giayphep_nhapkhau_id, \
                    GiayChungNhanCOChitiet.donvi_id== donvi_id,\
                    GiayChungNhanCOChitiet.id != id,\
                    GiayChungNhanCOChitiet.deleted == False)).all()
                
                if isinstance(check_co_chitiet, list) and len(check_co_chitiet)>0:
                    for item in check_co_chitiet:
                        soluong = item.soluong
                        if soluong is None:
                            soluong =0
                        soluong_danhap += soluong
                    if soluong_danhap > tong_soluong_capphep:
                        return json({"error_code" : "PARAM_ERROR", "error_message" : "Số lượng được cấp phép theo giấy phép nhập khẩu là {}. Số lượng dược liệu đã nhập trong các giấy chứng nhận nguồn gốc (CO) là {} đã vượt mức số lượng được cấp phép.".format(tong_soluong_capphep, soluong_danhap)}, status=520)
                    else:
                        soluong_danhap_new = soluong_danhap + float(soluong_current)
                        if soluong_danhap_new > tong_soluong_capphep:
                            return json({"error_code" : "PARAM_ERROR", "error_message" : "Số lượng được cấp phép theo giấy phép nhập khẩu là {}. Số lượng dược liệu đã nhập trong các giấy chứng nhận nguồn gốc (CO) là {}. Số lượng nhập hiện tại là : {} đã vượt quá số lượng được cấp phép.".format(tong_soluong_capphep, soluong_danhap, soluong_current)}, status=520)
                else:
                    if soluong_current > tong_soluong_capphep:
                        return json({"error_code" : "PARAM_ERROR", "error_message" : "Số lượng được cấp phép theo giấy phép nhập khẩu là {}. Số lượng nhập hiện tại là {} đã vượt quá hạn số lượng được cấp phép".format(tong_soluong_capphep,soluong_current)}, status=520)

async def check_co(request = None, Model = None, data = None, **kw):
    if "so_co" in data and data["so_co"] is  not None:
        if request.method == "POST":
            check_chungnhan_co = db.session.query(GiayChungNhanCO).filter(and_(GiayChungNhanCO.so_co == data["so_co"], GiayChungNhanCO.deleted == False)).first()
            if check_chungnhan_co is not None:
                return json({"error_code" : "PARAM_EXISTED", "error_message" : "Số CO đã tồn tại. Vui lòng kiểm tra lại"},status=520)
        elif request.method == "PUT":
            check_chungnhan_co = db.session.query(GiayChungNhanCO).filter(and_(GiayChungNhanCO.id != data["id"], \
                GiayChungNhanCO.so_co == data["so_co"],\
                GiayChungNhanCO.deleted == False)).first()
            if check_chungnhan_co is not None:
                return json({"error_code" : "PARAM_ERROR", "error_message" : "Số CO đã tồn tại. Vui lòng kiểm tra lại"},status=520)
    else:
        return json({"error_code" : "PARAM_ERROR", "error_message" : "Vui lòng nhập số CO"}, status=520)

# lọc những vật tư deleted = False ở xem 1 chi tiết 1 phiếu, nhập xuất
async def post_process_get_single(request=None, Model=None, result=None, **kw):
    if 'id' in result and result['id'] is not None:
        danhsach_phieu = []
        chitiet_sanpham = []
        chitiet_giayphep = []
        if Model.__tablename__ == "giayphep_nhapkhau":
            danhsach_phieu = db.session.query(GiayPhepNhapKhauChiTiet).filter(GiayPhepNhapKhauChiTiet.giayphep_id == result['id'], GiayPhepNhapKhauChiTiet.deleted == False).all()
            for sanpham in danhsach_phieu:
                chitiet_giayphep.append(to_dict(sanpham))
            result['chitiet_giayphep'] = chitiet_giayphep
        elif Model.__tablename__ == "giay_chungnhan_co":
            danhsach_phieu = db.session.query(GiayChungNhanCOChitiet).filter(GiayChungNhanCOChitiet.chungnhan_id == result['id'], GiayChungNhanCOChitiet.deleted == False).all()
            for sanpham in danhsach_phieu:
                chitiet_giayphep.append(to_dict(sanpham))
            result['chitiet_giayphep'] = chitiet_giayphep

async def check_ma_kiemnghiem(request = None, Model = None, data = None, **kw):

    if request.method == 'POST':

        ma_kiem_nghiem =  data['ma_kiem_nghiem']
        auto_ma_kiem_nghiem = data.get("auto_ma_kiem_nghiem")
        if auto_ma_kiem_nghiem == True:
            checkExist = True
            while checkExist == True:
                ma_kiem_nghiem = generate_makiemnghiem()
                phieuKiemNghiem = db.session.query(PhieuKiemNghiem).filter(and_(\
                    PhieuKiemNghiem.ma_kiem_nghiem == ma_kiem_nghiem,\
                    PhieuKiemNghiem.so_lo == data.get("so_lo"), \
                    PhieuKiemNghiem.id_sanpham == data.get("id_sanpham"), \
                    PhieuKiemNghiem.donvi_id == data.get("donvi_id"),  \
                    PhieuKiemNghiem.deleted == False)).first()

                if phieuKiemNghiem is not None:
                    checkExist = True
                else:
                    checkExist = False
                    data['ma_kiem_nghiem'] = ma_kiem_nghiem
        else:
            phieuKiemNghiem = db.session.query(PhieuKiemNghiem).filter(and_(\
                PhieuKiemNghiem.ma_kiem_nghiem == ma_kiem_nghiem,\
                PhieuKiemNghiem.so_lo == data.get("so_lo"), \
                PhieuKiemNghiem.id_sanpham == data.get("id_sanpham"), \
                PhieuKiemNghiem.donvi_id == data.get("donvi_id"),  \
                PhieuKiemNghiem.deleted == False)).first()
            if phieuKiemNghiem is not None:
                return json({'error_code' : 'PARAM_ERROR', "error_message" : "Mã kiểm nghiệm đã tồn tại vui lòng nhập lại"}, status=520)
    elif request.method == 'PUT':
        ma_kiem_nghiem =  data['ma_kiem_nghiem']
        phieuKiemNghiem = db.session.query(PhieuKiemNghiem).filter(and_(\
            PhieuKiemNghiem.id != data['id'], \
            PhieuKiemNghiem.ma_kiem_nghiem == ma_kiem_nghiem,\
            PhieuKiemNghiem.so_lo == data.get("so_lo"), \
            PhieuKiemNghiem.id_sanpham == data.get("id_sanpham"), \
            PhieuKiemNghiem.donvi_id == data.get("donvi_id"),  \
            PhieuKiemNghiem.deleted == False)).first()
        if phieuKiemNghiem is not None:
            return json({'error_code' : 'PARAM_ERROR', "error_message" : "Mã kiểm nghiệm đã tồn tại vui lòng nhập lại"}, status=520)


async def post_process_delete_co(request=None, instance_id=None, Model=None, **kw):
    uid = current_uid(request)
    if uid is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    else:
        user = db.session.query(User).filter(and_(User.id == uid,User.deleted == False)).first()
        if user is not None:
            record = db.session.query(Model).filter(Model.id == instance_id, Model.deleted == False).first()
            if record is not None:
                record.deleted = True
                if Model.__tablename__ == "giay_chungnhan_co":

                    #kiem tra co phieu nhap nao duoc tao chua
                    loai_co = record.loai_co

                    checkChungNhanCoChitiet = db.session.query(GiayChungNhanCOChitiet).filter(\
                        GiayChungNhanCOChitiet.chungnhan_id == instance_id, \
                        GiayChungNhanCOChitiet.deleted == False).all()

                    for itemCo in checkChungNhanCoChitiet:
                        itemCo.deleted = True
                        soluong = validate_number(itemCo.soluong)
                        itemChitietNhapKhau = db.session.query(GiayPhepNhapKhauChiTiet).filter(\
                            GiayPhepNhapKhauChiTiet.giayphep_id == itemCo.giayphep_nhapkhau_id, \
                            GiayPhepNhapKhauChiTiet.id_sanpham == itemCo.id_sanpham, \
                            GiayPhepNhapKhauChiTiet.deleted == False).all()

                        for itemChitiet in itemChitietNhapKhau:
                            itemChitiet.soluong_danhap =  validate_number(itemChitiet.soluong_danhap)
                            if itemChitiet.soluong_danhap <=0 or soluong <=0:
                                continue
                            else:
                                if itemChitiet.soluong_danhap >= soluong:
                                    itemChitiet.soluong_danhap -= soluong
                                    soluong =0
                                    break
                                else:
                                    soluong -=itemChitiet.soluong_danhap
                                    itemChitiet.soluong_danhap = 0
                        db.session.flush()                                


                if Model.__tablename__ == "giayphep_nhapkhau":
                    checkGiayPhepChitiet = db.session.query(GiayPhepNhapKhauChiTiet).filter(\
                        GiayPhepNhapKhauChiTiet.giayphep_id == record.id, \
                        GiayPhepNhapKhauChiTiet.donvi_id == record.donvi_id, \
                        GiayPhepNhapKhauChiTiet.deleted == False).all()
                        
                    for itemChitiet in checkGiayPhepChitiet:
                        itemChitiet.deleted = True

                db.session.commit()
                return json(to_dict(record), status=200)
            else:
                return json({'error_code':'NOT_FOUND', 'error_message':'Không tìm thấy dữ liệu tương ứng'}, status=520)
        else:
            return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)



async def post_process_change_co(request = None, Model= None, result = None, **kw):
    if 'id' in result and result['id'] is not None:
        chungnhanCO = db.session.query(GiayChungNhanCO).filter(\
            GiayChungNhanCO.id == result['id'], \
            GiayChungNhanCO.deleted == False).first()

        if chungnhanCO is not None:

            chitiet_co = db.session.query(GiayChungNhanCOChitiet).filter(\
                GiayChungNhanCOChitiet.chungnhan_id == chungnhanCO.id, \
                GiayChungNhanCOChitiet.deleted == False).all()

            for item in chitiet_co:
                item.so_co = chungnhanCO.so_co
            
            db.session.flush()

        db.session.commit()

async def pre_delete_phieukiemnghiem(request=None, instance_id=None, Model=None, **kw):
    phieuKiemNghiem = db.session.query(PhieuKiemNghiem).filter(\
        PhieuKiemNghiem.id == instance_id, \
        PhieuKiemNghiem.deleted == False).first()
    if  phieuKiemNghiem is not None:
        #nếu sử dụng rồi thì không đc xóa

        chungnhanco_chitiet = db.session.query(GiayChungNhanCOChitiet).filter(\
            GiayChungNhanCOChitiet.phieu_kiem_nghiem_id == phieuKiemNghiem.id, \
            GiayChungNhanCOChitiet.deleted == False).first()

        if chungnhanco_chitiet is not None:
            return json({'error_code':'PARAM_ERROR', 'error_message':'Phiếu kiểm nghiệm đã được sử dụng, không thể xóa phiếu kiểm nghiệm'}, status=520)


async def pre_post_put_nhapkhau_co(request = None, Model = None, data = None, **kw):
    if "chitiet_giayphep" in data and isinstance(data['chitiet_giayphep'], list):
        del data['chitiet_giayphep']


apimanager.create_api(GiayPhepNhapKhau,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single], GET_MANY=[validate_user, pre_getmany_co_cq_new], POST=[validate_user, pre_post_insert_donvi, pre_check_sogiayphep, pre_post_put_nhapkhau_co], PUT_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single, pre_check_sogiayphep, pre_post_put_nhapkhau_co, pre_process_chitiet_old_version], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single, post_process_delete_co]),
    postprocess=dict(GET_SINGLE=[get_single_object_donvi], GET_MANY=[postprocess_getMany,postprocess_stt, get_many_object_donvi], POST=[], PUT_SINGLE=[post_process_change_giayphep_nhapkhau], DELETE_SINGLE = []),
    exclude_columns = ['chitiet_giayphep'],
    collection_name='giayphep_nhapkhau')

apimanager.create_api(GiayPhepNhapKhau,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single], GET_MANY=[validate_user, pre_getmany_co_cq_new], POST=[validate_user, pre_post_insert_donvi], PUT_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single, pre_process_chitiet_old_version], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single, pre_delete,pre_process_chitiet_old_version]),
    postprocess=dict(GET_SINGLE=[get_single_object_donvi], GET_MANY=[postprocess_getMany,postprocess_stt, get_many_object_donvi], POST=[], PUT_SINGLE=[], DELETE_SINGLE = []),
    include_columns=['id', 'so_giay_phep'],
    collection_name='giayphep_nhapkhau_filter')

apimanager.create_api(GiayPhepNhapKhau,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single], GET_MANY=[validate_user, pre_getmany_co_cq_new], POST=[validate_user, pre_post_insert_donvi], PUT_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single, pre_process_chitiet_old_version], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single, pre_delete,pre_process_chitiet_old_version]),
    postprocess=dict(GET_SINGLE=[get_single_object_donvi], GET_MANY=[postprocess_getMany,postprocess_stt, get_many_object_donvi], POST=[], PUT_SINGLE=[], DELETE_SINGLE = []),
    include_columns=['id', 'so_giay_phep', 'thoigian_capphep', 'thoigian_hieuluc_batdau', 'thoigian_hieuluc_ketthuc', 'donvi_id', 'donvi', 'trangthai'],
    collection_name='giayphep_nhapkhau_collection_filter')

apimanager.create_api(GiayPhepNhapKhauChiTiet,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single], GET_MANY=[validate_user, pre_getmany_co_cq], POST=[validate_user, pre_post_insert_donvi], PUT_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single, pre_process_chitiet_old_version], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single,  pre_delete,pre_process_chitiet_old_version]),
    postprocess=dict(GET_SINGLE=[get_single_object_donvi], GET_MANY=[postprocess_getMany, get_many_object_donvi], POST=[], PUT_SINGLE=[], DELETE_SINGLE = []),
    collection_name='giayphep_nhapkhau_chitiet')

apimanager.create_api(GiayPhepNhapKhauChiTiet,
    max_results_per_page=1000,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single], GET_MANY=[validate_user, pre_getmany_co_cq], POST=[validate_user, pre_post_insert_donvi], PUT_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single, pre_process_chitiet_old_version], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single, pre_delete,pre_process_chitiet_old_version]),
    postprocess=dict(GET_SINGLE=[get_single_object_donvi], GET_MANY=[get_many_object_donvi], POST=[], PUT_SINGLE=[], DELETE_SINGLE = []),
    exclude_columns= ['chungtu_dinhkem', 'created_at', 'created_by', 'deleted_at', 'deleted_by', 'dongia', 'donvi', 'giayphep', 'updated_at', 'updated_by'],
    collection_name='giayphep_nhapkhau_chitiet_grid')

apimanager.create_api(PhieuKiemNghiem,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single], GET_MANY=[validate_user, pre_getmany_co_cq_new], POST=[validate_user, pre_post_insert_donvi, check_ma_kiemnghiem], PUT_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single, check_ma_kiemnghiem, pre_process_phieukiemnghiem, pre_process_chitiet_old_version], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single, pre_delete_phieukiemnghiem, pre_delete]),
    postprocess=dict(GET_SINGLE=[get_single_object_donvi], GET_MANY=[postprocess_getMany, postprocess_stt, get_many_object_donvi], POST=[], PUT_SINGLE=[post_process_change_phieukiemnghiem], DELETE_SINGLE = []),
    collection_name='phieu_kiem_nghiem')

apimanager.create_api(PhieuKiemNghiem,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single], GET_MANY=[validate_user, pre_getmany_co_cq_new], POST=[validate_user, pre_post_insert_donvi, check_ma_kiemnghiem], PUT_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single, check_ma_kiemnghiem, pre_process_chitiet_old_version], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single, pre_delete]),
    postprocess=dict(GET_SINGLE=[get_single_object_donvi], GET_MANY=[postprocess_getMany, postprocess_stt, get_many_object_donvi], POST=[], PUT_SINGLE=[], DELETE_SINGLE = []),
    include_columns=['id', 'ma_kiem_nghiem', 'id_sanpham', 'ma_sanpham', 'ten_sanpham', 'so_lo', 'ngay_kiem_nghiem','ten_donvi_yeucau'],
    collection_name='phieu_kiem_nghiem_filter')

apimanager.create_api(PhieuKiemNghiem,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single], GET_MANY=[validate_user, pre_getmany_co_cq_new], POST=[validate_user, pre_post_insert_donvi, check_ma_kiemnghiem], PUT_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single, check_ma_kiemnghiem, pre_process_chitiet_old_version], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single, pre_delete, pre_process_chitiet_old_version]),
    postprocess=dict(GET_SINGLE=[get_single_object_donvi], GET_MANY=[postprocess_getMany, postprocess_stt, get_many_object_donvi], POST=[], PUT_SINGLE=[], DELETE_SINGLE = []),
    include_columns=['id', 'ma_kiem_nghiem', 'id_sanpham', 'ma_sanpham', 'ten_sanpham', 'so_lo', 'ngay_kiem_nghiem', 'sanpham', 'donvi_id', 'donvi', 'noi_san_suat', 'ten_donvi_cap'],
    collection_name='phieu_kiem_nghiem_collection_filter')

apimanager.create_api(GiayChungNhanCO,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single], GET_MANY=[validate_user, pre_getmany_co_cq_new], POST=[validate_user, pre_post_insert_donvi, check_co, pre_post_put_nhapkhau_co], PUT_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single, check_co, pre_post_put_nhapkhau_co, pre_process_chitiet_old_version], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user,validate_token_donvi_get_put_delete_single, post_process_delete_co,pre_process_chitiet_old_version]),
    postprocess=dict(GET_SINGLE=[get_single_object_donvi, post_process_co], GET_MANY=[postprocess_getMany, postprocess_stt, get_many_object_donvi], POST=[], PUT_SINGLE=[post_process_change_co], DELETE_SINGLE = []),
    exclude_columns = ['chitiet_giayphep'],
    collection_name='giaychungnhanco')

apimanager.create_api(GiayChungNhanCO,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single], GET_MANY=[validate_user, pre_getmany_co_cq_new], POST=[validate_user, pre_post_insert_donvi, check_co], PUT_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single, check_co,pre_process_chitiet_old_version], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user,validate_token_donvi_get_put_delete_single, pre_delete,pre_process_chitiet_old_version]),
    postprocess=dict(GET_SINGLE=[get_single_object_donvi], GET_MANY=[postprocess_getMany, postprocess_stt, get_many_object_donvi], POST=[], PUT_SINGLE=[], DELETE_SINGLE = []),
    include_columns=['id', 'loai_co', 'so_co','so_giay_phep', 'donvi_id', 'ten_donvi_tiepnhan', 'thoigian_cap_co', 'trangthai', 'donvi', 'donvi_chungnhan_co','chungtu_dinhkem'],
    collection_name='giaychungnhanco_collection_filter')

apimanager.create_api(GiayChungNhanCOChitiet,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single], GET_MANY=[validate_user, pre_getmany_co_cq], POST=[validate_user, pre_post_insert_donvi,pre_check_soluong_giayphep], PUT_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single, pre_process_chitiet_old_version,pre_check_soluong_giayphep], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single, pre_process_delecte_co_chitiet,pre_process_chitiet_old_version]),
    postprocess=dict(GET_SINGLE=[get_single_object_donvi], GET_MANY=[postprocess_getMany, get_many_object_donvi], POST=[post_process_change_soluong_nhapkhau], PUT_SINGLE=[post_process_change_soluong_nhapkhau], DELETE_SINGLE = []),
    collection_name='giaychungnhanco_chitiet')

apimanager.create_api(GiayChungNhanCOChitiet,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    max_results_per_page=1000,
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single], GET_MANY=[validate_user, pre_getmany_co_cq], POST=[validate_user, pre_post_insert_donvi,pre_check_soluong_giayphep], PUT_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single, pre_process_chitiet_old_version,pre_check_soluong_giayphep], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single, pre_process_delecte_co_chitiet,pre_process_chitiet_old_version]),
    postprocess=dict(GET_SINGLE=[get_single_object_donvi], GET_MANY=[get_many_object_donvi], POST=[post_process_change_soluong_nhapkhau], PUT_SINGLE=[post_process_change_soluong_nhapkhau], DELETE_SINGLE = []),
    exclude_columns = ["created_at", 'created_by', 'updated_at', 'updated_by', 'deleted_by', 'deleted_at', 'thoigian_cap_co', 'thoigian_hieuluc_batdau', 'thoigian_hieuluc_ketthuc', 'chungnhan', 'donvi'],
    collection_name='giaychungnhanco_chitiet_grid')

apimanager.create_api(GiayChungNhanCOChitiet,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single], GET_MANY=[validate_user, pre_getmany_co_cq], POST=[validate_user, pre_post_insert_donvi,pre_check_soluong_giayphep], PUT_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single, pre_process_chitiet_old_version,pre_check_soluong_giayphep], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, validate_token_donvi_get_put_delete_single, pre_process_delecte_co_chitiet,pre_process_chitiet_old_version]),
    postprocess=dict(GET_SINGLE=[get_single_object_donvi], GET_MANY=[postprocess_getMany, get_many_object_donvi], POST=[post_process_change_soluong_nhapkhau], PUT_SINGLE=[post_process_change_soluong_nhapkhau], DELETE_SINGLE = []),
    include_columns= ['id', 'chungnhan_id', 'so_co', 'so_giay_phep', 'giayphep_nhapkhau_id', 'loai_co', 'id_sanpham', 'ma_sanpham', 'ten_sanpham', 'sanpham'],
    collection_name='giaychungnhanco_chitiet_filter')


@app.route("/api/v1/change_status_chungnhan_cq", methods = ["POST","GET"])
async def change_status_chungnhan_cq(request):
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    if data is None:
        return json({"error_code" : "PARAM_ERROR", "error_message" : "Tham số không hợp lệ"}, status=520)
    chungnhan_id = data.get("chungnhan_id")
    trangthai = data.get("trangthai")
    if chungnhan_id is None or trangthai is None:
        return json({"error_code" : "PARAM_ERROR", "error_message" : "Tham số không hợp lệ"}, status=520)
    check_cq = db.session.query(PhieuKiemNghiem).filter(and_(PhieuKiemNghiem.id == chungnhan_id)).first()
    if check_cq is None:
        return json({"error_code" : "PARAM_NOT_EXISTED", "error_message" : "Không tìm thấy bản ghi dữ liệu"}, status=520)
    if trangthai == 2:
        check_cq.trangthai = trangthai
        now = datetime.now()
        timestamp = now.timestamp()
        thoigian_duyet = parse_date_custom(timestamp)
        os.environ['TZ'] = 'UTC-7'
        time.tzset()
        tmp = datetime.now().strftime("%d/%m/%Y %H:%M")
        check_cq.thoigian_duyet = thoigian_duyet
        nguoi_duyet = uid_current
        check_cq.nguoi_duyet = nguoi_duyet
        db.session.commit()
        donvi_id = check_cq.donvi_id
        if donvi_id is not None:
            # lấy user của đơn vị được duyệt
            check_user = db.session.query(User).filter(and_(User.donvi_id == donvi_id, User.active == 1)).all()
            if check_user is not None and isinstance(check_user, list) and len(check_user) >0:
                for items in check_user:
                    if items.email is not None and validate_email(items.email): 
                        #gửi email       
                        data = "Cục Y Dược Cổ Truyền đã duyệt phiếu kiểm nghiệm với mã số kiểm nghiệm {} vào thời gian {}".format(check_cq.ma_kiem_nghiem, tmp)
                        subject = "Xác nhận Phiếu kiểm nghiệm- CQ"
                        await send_mail(subject, items.email, data)

        return json({"error_message" : "Duyệt thành công"},status=200)
    else:
        check_cq.trangthai = 1
        db.session.commit()
        return json({"error_message" : "Hủy duyệt thành công."}, status=200)

@app.route("/api/v1/change_status_giayphep_nhapkhau", methods = ["POST","GET"])
async def change_status_giayphep_nhapkhau(request):
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    if data is None:
        return json({"error_code" : "PARAM_ERROR", "error_message" : "Tham số không hợp lệ"}, status=520)
    chungnhan_id = data.get("chungnhan_id")
    trangthai = data.get("trangthai")
    if chungnhan_id is None or trangthai is None:
        return json({"error_code" : "PARAM_ERROR", "error_message" : "Tham số không hợp lệ"}, status=520)
    check_giayphep = db.session.query(GiayPhepNhapKhau).filter(and_(GiayPhepNhapKhau.id == chungnhan_id)).first()
    if check_giayphep is None:
        return json({"error_code" : "PARAM_NOT_EXISTED", "error_message" : "Không tìm thấy bản ghi dữ liệu"}, status=520)
    if trangthai == 2:
        check_giayphep.trangthai = trangthai
        now = datetime.now()
        timestamp = now.timestamp()
        thoigian_duyet = parse_date_custom(timestamp)
        nguoi_duyet = uid_current
        os.environ['TZ'] = 'UTC-7'
        time.tzset()
        tmp = datetime.now().strftime("%d/%m/%Y %H:%M")
        check_giayphep.thoigian_duyet = thoigian_duyet
        check_giayphep.nguoi_duyet = nguoi_duyet
        db.session.commit()
        donvi_id = check_giayphep.donvi_id
        if donvi_id is not None:
            # lấy user của đơn vị được duyệt
            check_user = db.session.query(User).filter(and_(User.donvi_id == donvi_id, User.active == 1)).all()
            if check_user is not None and isinstance(check_user, list) and len(check_user) >0:
                for items in check_user:
                    if items.email is not None and validate_email(items.email): 
                        #gửi email       
                        data = "Cục Y Dược Cổ Truyền đã duyệt giấy phép nhập khẩu với số giấy phép {} vào thời gian {}".format(check_giayphep.so_giay_phep, tmp)
                        subject = "Xác nhận Giấy Phép Nhập Khẩu"
                        await send_mail(subject, items.email, data)

        return json({"error_message" : "Duyệt thành công"},status=200)
    else:
        check_giayphep.trangthai = 1
        db.session.commit()
        return json({"error_message" : "Hủy duyệt thành công."}, status=200)

@app.route("/api/v1/change_status_chungnhan_co", methods = ["POST","GET"])
async def change_status_chungnhan_co(request):
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    if data is None:
        return json({"error_code" : "PARAM_ERROR", "error_message" : "Tham số không hợp lệ"}, status=520)
    chungnhan_id = data.get("chungnhan_id")
    trangthai = data.get("trangthai")
    if chungnhan_id is None or trangthai is None:
        return json({"error_code" : "PARAM_ERROR", "error_message" : "Tham số không hợp lệ"}, status=520)
    check_co = db.session.query(GiayChungNhanCO).filter(and_(GiayChungNhanCO.id == chungnhan_id)).first()
    if check_co is None:
        return json({"error_code" : "PARAM_NOT_EXISTED", "error_message" : "Không tìm thấy bản ghi dữ liệu"}, status=520)
    if trangthai == 2:
        check_co.trangthai = trangthai
        now = datetime.now()
        timestamp = now.timestamp()
        thoigian_duyet = parse_date_custom(timestamp)
        nguoi_duyet = uid_current
        os.environ['TZ'] = 'UTC-7'
        time.tzset()
        tmp = datetime.now().strftime("%d/%m/%Y %H:%M")
        check_co.thoigian_duyet = thoigian_duyet
        check_co.nguoi_duyet = nguoi_duyet
        db.session.commit()
        donvi_id = check_co.donvi_id
        if donvi_id is not None:
            # lấy user của đơn vị được duyệt
            check_user = db.session.query(User).filter(and_(User.donvi_id == donvi_id, User.active == 1)).all()
            if check_user is not None and isinstance(check_user, list) and len(check_user) >0:
                for items in check_user:
                    if items.email is not None and validate_email(items.email): 
                        #gửi email       
                        data = "Cục Y Dược Cổ Truyền đã duyệt giấy chứng nhận chất lượng CO với số CO là: {} vào thời gian {}".format(check_co.so_co, tmp)
                        subject = "Xác nhận Giấy Phép Nhập Khẩu"
                        await send_mail(subject, items.email, data)

        return json({"error_message" : "Duyệt thành công"},status=200)
    else:
        check_co.trangthai = 1
        db.session.commit()
        return json({"error_message" : "Hủy duyệt thành công."}, status=200)

#duyệt thông tin đơn vị
@app.route('/api/v1/duyet_donvi', methods= ['POST'])
async def duyet_donvi(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    if data is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)

    id = data.get("id")
    if id is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)
    
    #check co

    donvi = db.session.query(DonVi).filter(DonVi.id == id, DonVi.deleted == False).first()

    
    if donvi is None:
        return json({'error_code': "NOT_EXIST", "error_message": "Không tìm thấy bản ghi dữ liệu"}, status= 520)
    else:
        donvi.duyet_thongtin = 2
        donvi.nguoi_duyet_id = currentUser.id
        donvi.nguoi_duyet_ten = currentUser.hoten
        now = datetime.now()
        timestamp = now.timestamp()
        thoigian_duyet = parse_date_custom(timestamp)
        os.environ['TZ'] = 'UTC-7'
        time.tzset()
        tmp = datetime.now().strftime("%d/%m/%Y %H:%M")
        donvi.thoigian_duyet = thoigian_duyet
        db.session.flush()

        donvi_id = donvi.id
        if donvi_id is not None:
            # lấy user của đơn vị được duyệt
            check_user = db.session.query(User).filter(and_(User.donvi_id == donvi_id, User.active == 1)).all()
            if check_user is not None and isinstance(check_user, list) and len(check_user) >0:
                for items in check_user:
                    if items.email is not None and validate_email(items.email): 
                        #gửi email       
                        data = "Cục Y Dược Cổ Truyền đã duyệt thông tin đơn vị của bạn vào thời gian {}".format(tmp)
                        subject = "Duyệt thông tin đơn vị"
                        await send_mail(subject, items.email, data)


    db.session.commit()
    return json(to_dict(donvi), status = 200)

#gửi duyệt giấy chứng nhận co
@app.route('/api/v1/xacnhan_co', methods= ['POST'])
async def xacnhan_co(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    if data is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)

    id = data.get("id")
    if id is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)
    
    #check co

    chungnhan_co = db.session.query(GiayChungNhanCO).filter(GiayChungNhanCO.id == id, GiayChungNhanCO.deleted == False).first()
    
    if chungnhan_co is None:
        return json({'error_code': "NOT_EXIST", "error_message": "Không tìm thấy bản ghi dữ liệu"}, status= 520)
    else:
        chungnhan_co.trangthai = 2
        now = datetime.now()
        timestamp = now.timestamp()
        thoigian_guiduyet = parse_date_custom(timestamp)
        chungnhan_co.thoigian_guiduyet = thoigian_guiduyet

    db.session.commit()
    return json(to_dict(chungnhan_co), status = 200)

#duyệt giấy chứng nhân co
@app.route('/api/v1/duyet_co', methods= ['POST'])
async def duyet_co(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    if data is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)

    id = data.get("id")
    if id is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)
    
    #check co

    chungnhan_co = db.session.query(GiayChungNhanCO).filter(GiayChungNhanCO.id == id, GiayChungNhanCO.deleted == False).first()

    
    if chungnhan_co is None:
        return json({'error_code': "NOT_EXIST", "error_message": "Không tìm thấy bản ghi dữ liệu"}, status= 520)
    else:
        chungnhan_co.trangthai = 3
        chungnhan_co.nguoi_duyet_id = currentUser.id
        chungnhan_co.nguoi_duyet_ten = currentUser.hoten
        now = datetime.now()
        timestamp = now.timestamp()
        thoigian_duyet = parse_date_custom(timestamp)
        os.environ['TZ'] = 'UTC-7'
        time.tzset()
        tmp = datetime.now().strftime("%d/%m/%Y %H:%M")
        chungnhan_co.thoigian_duyet = thoigian_duyet
        db.session.flush()

        donvi_id = chungnhan_co.donvi_id
        if donvi_id is not None:
            # lấy user của đơn vị được duyệt
            check_user = db.session.query(User).filter(and_(User.donvi_id == donvi_id, User.active == 1)).all()
            if check_user is not None and isinstance(check_user, list) and len(check_user) >0:
                for items in check_user:
                    if items.email is not None and validate_email(items.email): 
                        #gửi email       
                        data = "Cục Y Dược Cổ Truyền đã duyệt giấy chứng nhận chất lượng CO với số CO là: {} vào thời gian {}".format(chungnhan_co.so_co, tmp)
                        subject = "Xác nhận Giấy Phép Nhập Khẩu"
                        await send_mail(subject, items.email, data)


    db.session.commit()
    return json(to_dict(chungnhan_co), status = 200)

#huỷ duyệt giấy chứng nhận co
@app.route('/api/v1/huy_co', methods= ['POST'])
async def huy_co(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    if data is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)

    id = data.get("id")
    if id is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)
    
    #check co

    chungnhan_co = db.session.query(GiayChungNhanCO).filter(GiayChungNhanCO.id == id, GiayChungNhanCO.deleted == False).first()

    
    if chungnhan_co is None:
        return json({'error_code': "NOT_EXIST", "error_message": "Không tìm thấy bản ghi dữ liệu"}, status= 520)
    else:
        chungnhan_co.trangthai = 2
        chungnhan_co.nguoi_duyet_id = ""
        chungnhan_co.nguoi_duyet_ten = ""
        chungnhan_co.thoigian_duyet = ""

    db.session.commit()
    return json(to_dict(chungnhan_co), status = 200)

#mở khóa co
@app.route('/api/v1/mo_co', methods= ['POST'])
async def mo_co(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    if data is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)

    id = data.get("id")
    if id is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)
    
    #check co

    chungnhan_co = db.session.query(GiayChungNhanCO).filter(GiayChungNhanCO.id == id, GiayChungNhanCO.deleted == False).first()

    
    if chungnhan_co is None:
        return json({'error_code': "NOT_EXIST", "error_message": "Không tìm thấy bản ghi dữ liệu"}, status= 520)
    else:
        chungnhan_co.trangthai = 1
        chungnhan_co.nguoi_duyet_id = ""
        chungnhan_co.nguoi_duyet_ten = ""
        chungnhan_co.thoigian_duyet = ""
        chungnhan_co.thoigian_guiduyet = ""

    db.session.commit()
    return json(to_dict(chungnhan_co), status = 200)

#gửi duyệt giấy chứng nhận cq
@app.route('/api/v1/xacnhan_cq', methods= ['POST'])
async def xacnhan_cq(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    if data is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)

    id = data.get("id")
    if id is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)
    
    #check cq

    chungnhan_cq = db.session.query(PhieuKiemNghiem).filter(PhieuKiemNghiem.id == id, PhieuKiemNghiem.deleted == False).first()
    
    if chungnhan_cq is None:
        return json({'error_code': "NOT_EXIST", "error_message": "Không tìm thấy bản ghi dữ liệu"}, status= 520)
    else:
        chungnhan_cq.trangthai = 2
        now = datetime.now()
        timestamp = now.timestamp()
        thoigian_guiduyet = parse_date_custom(timestamp)
        chungnhan_cq.thoigian_guiduyet = thoigian_guiduyet

    db.session.commit()
    return json(to_dict(chungnhan_cq), status = 200)

#duyệt giấy chứng nhân cq
@app.route('/api/v1/duyet_cq', methods= ['POST'])
async def duyet_cq(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    if data is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)

    id = data.get("id")
    if id is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)
    
    #check co

    chungnhan_cq = db.session.query(PhieuKiemNghiem).filter(PhieuKiemNghiem.id == id, PhieuKiemNghiem.deleted == False).first()

    
    if chungnhan_cq is None:
        return json({'error_code': "NOT_EXIST", "error_message": "Không tìm thấy bản ghi dữ liệu"}, status= 520)
    else:
        chungnhan_cq.trangthai = 3
        chungnhan_cq.nguoi_duyet_id = currentUser.id
        chungnhan_cq.nguoi_duyet_ten = currentUser.hoten
        now = datetime.now()
        timestamp = now.timestamp()
        thoigian_duyet = parse_date_custom(timestamp)
        os.environ['TZ'] = 'UTC-7'
        time.tzset()
        tmp = datetime.now().strftime("%d/%m/%Y %H:%M")
        chungnhan_cq.thoigian_duyet = thoigian_duyet
        db.session.flush()

        donvi_id = chungnhan_cq.donvi_id
        if donvi_id is not None:
            # lấy user của đơn vị được duyệt
            check_user = db.session.query(User).filter(and_(User.donvi_id == donvi_id, User.active == 1)).all()
            if check_user is not None and isinstance(check_user, list) and len(check_user) >0:
                for items in check_user:
                    if items.email is not None and validate_email(items.email): 
                        #gửi email       
                        data = "Cục Y Dược Cổ Truyền đã duyệt phiếu kiểm nghiệm với mã số kiểm nghiệm {} vào thời gian {}".format(chungnhan_cq.ma_kiem_nghiem, tmp)
                        subject = "Xác nhận Phiếu kiểm nghiệm- CQ"
                        await send_mail(subject, items.email, data)


    db.session.commit()
    return json(to_dict(chungnhan_cq), status = 200)

#huỷ duyệt giấy chứng nhận cq
@app.route('/api/v1/huy_cq', methods= ['POST'])
async def huy_cq(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    if data is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)

    id = data.get("id")
    if id is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)
    
    #check cq

    chungnhan_cq = db.session.query(PhieuKiemNghiem).filter(PhieuKiemNghiem.id == id, PhieuKiemNghiem.deleted == False).first()

    if chungnhan_cq is None:
        return json({'error_code': "NOT_EXIST", "error_message": "Không tìm thấy bản ghi dữ liệu"}, status= 520)
    else:
        chungnhan_cq.trangthai = 2
        chungnhan_cq.nguoi_duyet_id = ""
        chungnhan_cq.nguoi_duyet_ten = ""
        chungnhan_cq.thoigian_duyet = ""

    db.session.commit()
    return json(to_dict(chungnhan_cq), status = 200)

#mở khóa cq
@app.route('/api/v1/mo_cq', methods= ['POST'])
async def mo_cq(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    if data is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)

    id = data.get("id")
    if id is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)
    
    #check cq

    chungnhan_cq = db.session.query(PhieuKiemNghiem).filter(PhieuKiemNghiem.id == id, PhieuKiemNghiem.deleted == False).first()

    if chungnhan_cq is None:
        return json({'error_code': "NOT_EXIST", "error_message": "Không tìm thấy bản ghi dữ liệu"}, status= 520)
    else:
        chungnhan_cq.trangthai = 1
        chungnhan_cq.nguoi_duyet_id = ""
        chungnhan_cq.nguoi_duyet_ten = ""
        chungnhan_cq.thoigian_duyet = ""
        chungnhan_cq.thoigian_guiduyet = ""

    db.session.commit()
    return json(to_dict(chungnhan_cq), status = 200)

#gửi duyệt giấy phép nhập khẩu
@app.route('/api/v1/xacnhan_giayphep', methods= ['POST'])
async def xacnhan_giayphep(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    if data is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)

    id = data.get("id")
    if id is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)
    
    #check giấy phép

    giayphep_nhapkhau = db.session.query(GiayPhepNhapKhau).filter(GiayPhepNhapKhau.id == id, GiayPhepNhapKhau.deleted == False).first()
    
    if giayphep_nhapkhau is None:
        return json({'error_code': "NOT_EXIST", "error_message": "Không tìm thấy bản ghi dữ liệu"}, status= 520)
    else:
        giayphep_nhapkhau.trangthai = 2
        now = datetime.now()
        timestamp = now.timestamp()
        thoigian_guiduyet = parse_date_custom(timestamp)
        giayphep_nhapkhau.thoigian_guiduyet = thoigian_guiduyet

    db.session.commit()
    return json(to_dict(giayphep_nhapkhau), status = 200)

#duyệt giấy phép nhập khẩu
@app.route('/api/v1/duyet_giayphep', methods= ['POST'])
async def duyet_giayphep(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    if data is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)

    id = data.get("id")
    if id is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)
    
    #check giay phep

    giayphep_nhapkhau = db.session.query(GiayPhepNhapKhau).filter(GiayPhepNhapKhau.id == id, GiayPhepNhapKhau.deleted == False).first()
    
    
    if giayphep_nhapkhau is None:
        return json({'error_code': "NOT_EXIST", "error_message": "Không tìm thấy bản ghi dữ liệu"}, status= 520)
    else:
        giayphep_nhapkhau.trangthai = 3
        giayphep_nhapkhau.nguoi_duyet_id = currentUser.id
        giayphep_nhapkhau.nguoi_duyet_ten = currentUser.hoten
        now = datetime.now()
        timestamp = now.timestamp()
        thoigian_duyet = parse_date_custom(timestamp)
        os.environ['TZ'] = 'UTC-7'
        time.tzset()
        tmp = datetime.now().strftime("%d/%m/%Y %H:%M")
        giayphep_nhapkhau.thoigian_duyet = thoigian_duyet
        db.session.flush()

        donvi_id = giayphep_nhapkhau.donvi_id
        if donvi_id is not None:
            # lấy user của đơn vị được duyệt
            check_user = db.session.query(User).filter(and_(User.donvi_id == donvi_id, User.active == 1)).all()
            if check_user is not None and isinstance(check_user, list) and len(check_user) >0:
                for items in check_user:
                    if items.email is not None and validate_email(items.email): 
                        #gửi email       
                        data = "Cục Y Dược Cổ Truyền đã duyệt giấy phép nhập khẩu với số giấy phép {} vào thời gian {}".format(giayphep_nhapkhau.so_giay_phep, tmp)
                        subject = "Xác nhận Giấy Phép Nhập Khẩu"
                        await send_mail(subject, items.email, data)

    db.session.commit()
    return json(to_dict(giayphep_nhapkhau), status = 200)

#hủy duyệt giấy phép nhập khẩu
@app.route('/api/v1/huy_giayphep', methods= ['POST'])
async def huy_giayphep(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    if data is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)

    id = data.get("id")
    if id is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)
    
    #check giay phep

    giayphep_nhapkhau = db.session.query(GiayPhepNhapKhau).filter(GiayPhepNhapKhau.id == id, GiayPhepNhapKhau.deleted == False).first()
    
    if giayphep_nhapkhau is None:
        return json({'error_code': "NOT_EXIST", "error_message": "Không tìm thấy bản ghi dữ liệu"}, status= 520)
    else:
        giayphep_nhapkhau.trangthai = 2
        giayphep_nhapkhau.nguoi_duyet_id = ""
        giayphep_nhapkhau.nguoi_duyet_ten = ""
        giayphep_nhapkhau.thoigian_duyet = ""

    db.session.commit()
    return json(to_dict(giayphep_nhapkhau), status = 200)

#mở khóa giấy phép
@app.route('/api/v1/mo_giayphep', methods= ['POST'])
async def mo_giayphep(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    if data is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)

    id = data.get("id")
    if id is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)
    
    #check cq

    giayphep_nhapkhau = db.session.query(GiayPhepNhapKhau).filter(GiayPhepNhapKhau.id == id, GiayPhepNhapKhau.deleted == False).first()

    if giayphep_nhapkhau is None:
        return json({'error_code': "NOT_EXIST", "error_message": "Không tìm thấy bản ghi dữ liệu"}, status= 520)
    else:
        giayphep_nhapkhau.trangthai = 1
        giayphep_nhapkhau.nguoi_duyet_id = ""
        giayphep_nhapkhau.nguoi_duyet_ten = ""
        giayphep_nhapkhau.thoigian_duyet = ""
        giayphep_nhapkhau.thoigian_guiduyet = ""

    db.session.commit()
    return json(to_dict(giayphep_nhapkhau), status = 200)

##lưu thông tin CO mới
@app.route('/api/v1/giaychungnhanco_save', methods = ['POST'])
async def giaychungnhanco_save(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    if data is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)

    checkDonvi = db.session.query(DonVi).filter(DonVi.id == currentUser.donvi_id, DonVi.deleted == False).first()
    if checkDonvi is None:
        return json({'error_code':'PARAM_ERROR', 'error_message':'Không tìm thấy đơn vị của bạn trong hệ thống'}, status=520)

    id = data.get("id")

    chungnhanco = db.session.query(GiayChungNhanCO).filter(GiayChungNhanCO.id == id, GiayChungNhanCO.deleted == False).first()
    if chungnhanco is None:
        return json({'error_code': 'PARAM_ERROR', 'error_message':'Không tìm thấy giấy chứng nhận CO'}, status=520)
    
    chungnhanco_chitiet = db.session.query(GiayChungNhanCOChitiet).filter(\
        GiayChungNhanCOChitiet.chungnhan_id == id,\
        GiayChungNhanCOChitiet.deleted == False, or_(GiayChungNhanCOChitiet.phieu_kiem_nghiem_id == None, \
        GiayChungNhanCOChitiet.phieu_kiem_nghiem_id == "", \
        GiayChungNhanCOChitiet.ma_kiem_nghiem == None, \
        GiayChungNhanCOChitiet.ma_kiem_nghiem == "")).first()
    if chungnhanco_chitiet is not None:
        return json({'error_code':'PARAM_ERROR', 'error_message':'Vui lòng bổ sung đầy đủ giấy chứng nhận chất lượng CQ đối với từng dược liệu trong danh sách dược liệu'}, status=520)
    
    #check trùng số CO
    checkCo = db.session.query(GiayChungNhanCO).filter(GiayChungNhanCO.so_co == data.get("so_co"), \
        GiayChungNhanCO.id != id, GiayChungNhanCO.deleted == False).first()
    if checkCo is not None:
        return json({'error_code':'PARAM_ERROR', 'error_message':'Số CO đã tồn tại trên hệ thống, vui lòng nhập lại'}, status=520)
        
    waringChange = False#canh bao da co phieu xuat va thay doi thong tin chi tiet
    listWarning = []#tra ve danh sach CO chi tiết khong cap nhat vao phieu nhap, kho va lich su
    warningList = []###lay ra list warning

    #cập nhật thông tin CO
    chungnhanco.so_co = data.get("so_co")
    chungnhanco.so_giay_phep = data.get("so_giay_phep")
    chungnhanco.giayphep_nhapkhau_id = data.get("giayphep_nhapkhau_id")
    chungnhanco.giayphep_nhapkhau = data.get("giayphep_nhapkhau")
    chungnhanco.thoigian_cap_co = data.get("thoigian_cap_co")
    chungnhanco.loai_co = data.get("loai_co")
    chungnhanco.id_donvi_sanxuat = data.get("id_donvi_sanxuat")
    chungnhanco.ten_donvi_sanxuat = data.get("ten_donvi_sanxuat")
    chungnhanco.donvi_sanxuat = data.get("donvi_sanxuat")
    chungnhanco.diachi_donvi_sanxuat = data.get("diachi_donvi_sanxuat")
    chungnhanco.quocgia_donvi_sanxuat = data.get("quocgia_donvi_sanxuat")
    chungnhanco.quocgia_donvi_sanxuat_id = data.get("quocgia_donvi_sanxuat_id")
    chungnhanco.id_donvi_tiepnhan = data.get("id_donvi_tiepnhan")
    chungnhanco.ten_donvi_tiepnhan = data.get("ten_donvi_tiepnhan")
    chungnhanco.donvi_tiepnhan = data.get("donvi_tiepnhan")
    chungnhanco.diachi_donvi_tiepnhan = data.get("diachi_donvi_tiepnhan")
    chungnhanco.quocgia_donvi_tiepnhan_id = data.get("quocgia_donvi_tiepnhan_id")
    chungnhanco.quocgia_donvi_tiepnhan = data.get("quocgia_donvi_tiepnhan")
    chungnhanco.ten_nguoiky_xacnhan = data.get("ten_nguoiky_xacnhan")
    chungnhanco.donvi_phanphoi = data.get("donvi_phanphoi")
    chungnhanco.id_donvi_phanphoi = data.get("id_donvi_phanphoi")
    chungnhanco.ten_donvi_phanphoi = data.get("ten_donvi_phanphoi")
    chungnhanco.diachi_donvi_phanphoi = data.get("diachi_donvi_phanphoi")
    chungnhanco.quocgia_donvi_phanphoi = data.get("quocgia_donvi_phanphoi")
    chungnhanco.quocgia_donvi_phanphoi_id = data.get("quocgia_donvi_phanphoi_id")
    chungnhanco.ngay_khoi_hanh = data.get("ngay_khoi_hanh")
    chungnhanco.ngay_nhap_canh = data.get("ngay_nhap_canh")
    chungnhanco.so_hieu_phuongtien = data.get("so_hieu_phuongtien")
    chungnhanco.ten_phuongtien = data.get("ten_phuongtien")
    chungnhanco.loaihinh_vanchuyen = data.get("loaihinh_vanchuyen")
    chungnhanco.donvi_id_truycap = data.get("donvi_id_truycap")
    chungnhanco.donvi_chungnhan_co = data.get("donvi_chungnhan_co")
    chungnhanco.donvi_chungnhan_co_id = data.get("donvi_chungnhan_co_id")
    chungnhanco.cuakhau_id = data.get("cuakhau_id")
    chungnhanco.cuakhau = data.get("cuakhau")
    chungnhanco.tencuakhau = data.get("tencuakhau")
    chungnhanco.donvi_id = data.get("donvi_id")
    chungnhanco.chungtu_dinhkem = data.get("chungtu_dinhkem")
    chungnhanco.trangthai = data.get("trangthai")
    chungnhanco.nguoi_duyet_id = data.get("nguoi_duyet_id")
    chungnhanco.nguoi_duyet_ten = data.get("nguoi_duyet_ten")
    chungnhanco.thoigian_duyet = data.get("thoigian_duyet")
    chungnhanco.thoigian_guiduyet = data.get("thoigian_guiduyet")
    flag_modified(chungnhanco, "chungtu_dinhkem")
    db.session.flush()

    db.session.commit()

    return json({'error_message':'Successful', 'warnchange': waringChange, 'warningList': warningList}, status = 200)

####quan ly giay chung nhan CO chi tiet new
@app.route('/api/v2/giaychungnhanco_chitiet', methods=['POST'])
async def giaychungnhanco_chitiet(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    
    data = request.json

    if data is None:
        return json({'error_code': 'PARAM_ERROR', 'error_message':'Tham số không hợp lệ'}, status=520)

    #validatte data
    chungnhan_id = data.get("chungnhan_id")
    if chungnhan_id is None or chungnhan_id == "":
        return json({'error_code':'PARAM_ERROR', 'error_message':'Chứng nhận CO ID không được để trống'}, status=520)

    so_co = data.get("so_co")
    if so_co is None or so_co == "":
        return json({'error_code':'PARAM_ERROR', 'error_message':'Số chứng nhận CO không được để trống'}, status=520)

    loai_co = data.get("loai_co")
    if loai_co is None:
        return json({'error_code':'PARAM_ERROR', 'error_message':'Loại CO không được để trống'}, status=520)

    giayphep_nhapkhau_id = data.get("giayphep_nhapkhau_id")
    phieu_kiem_nghiem_id = data.get("phieu_kiem_nghiem_id")

    if loai_co ==1:
        if giayphep_nhapkhau_id is None or giayphep_nhapkhau_id == "":
            return json({'error_code':'PARAM_ERROR', 'error_message':'Giấy phép nhập khẩu không được để trống'}, status=520)

        if phieu_kiem_nghiem_id is None or phieu_kiem_nghiem_id == "":
            return json({'error_code':'PARAM_ERROR', 'error_mesage':'Mã kiểm nghiệm CQ không được để trống'}, status=520)

    id_sanpham = data.get("id_sanpham")
    if id_sanpham is None or id_sanpham == "":
        return json({'error_code':'PARAM_ERROR', 'error_message':'Dược liệu không được để trống'}, status=520)


    soluong = data.get("soluong")
    if soluong is None or soluong == "":
        return json({'error_code':'PARAM_ERROR', 'error_message':'Số lượng không được để trống'}, status=520)
    
    soluong = validate_number(soluong)
    #kiểm tra số lượng theo giấy phép nhập khẩu
    soluong_current = validate_number(data.get("soluong"))
    donvi_id = currentUser.donvi_id

    if loai_co ==1:
        tong_soluong_capphep = 0
        check_giay_phep_chitiet = db.session.query(GiayPhepNhapKhauChiTiet).filter(\
            GiayPhepNhapKhauChiTiet.giayphep_id == giayphep_nhapkhau_id, \
            GiayPhepNhapKhauChiTiet.donvi_id == donvi_id,\
            GiayPhepNhapKhauChiTiet.id_sanpham == id_sanpham, \
            GiayPhepNhapKhauChiTiet.deleted == False).all()
        if isinstance(check_giay_phep_chitiet, list) and len(check_giay_phep_chitiet) > 0:
            for item in check_giay_phep_chitiet:
                soluong_capphep = validate_number(item.soluong_capphep)
                tong_soluong_capphep += (soluong_capphep)

        soluong_danhap = 0

        check_co_chitiet = db.session.query(GiayChungNhanCOChitiet).filter(\
            GiayChungNhanCOChitiet.donvi_id== donvi_id,\
            GiayChungNhanCOChitiet.giayphep_nhapkhau_id == giayphep_nhapkhau_id,\
            GiayChungNhanCOChitiet.id_sanpham == id_sanpham,
            GiayChungNhanCOChitiet.deleted == False).all()

        if isinstance(check_co_chitiet,list) and len(check_co_chitiet) > 0:
            for item in check_co_chitiet:
                soluongItem = validate_number(item.soluong)
                soluong_danhap += soluongItem
            if soluong_danhap > tong_soluong_capphep:
                return json({"error_code" : "PARAM_ERROR", "error_message" : "Số lượng được cấp phép theo giấy phép nhập khẩu là {}. Số lượng dược liệu đã nhập trong các giấy chứng nhận nguồn gốc (CO) là {} đã vượt mức số lượng được cấp phép.".format(tong_soluong_capphep, soluong_danhap)}, status=520)
            else:
                soluong_danhap_new = soluong_danhap + soluong_current
                if soluong_danhap_new > tong_soluong_capphep:
                    return json({"error_code" : "PARAM_ERROR", "error_message" : "Số lượng được cấp phép theo giấy phép nhập khẩu là {}. Số lượng dược liệu đã nhập trong các giấy chứng nhận nguồn gốc (CO) là {}. Số lượng nhập hiện tại là : {} đã vượt quá số lượng được cấp phép.".format(tong_soluong_capphep, soluong_danhap, soluong_current)}, status=520)
        else:
            if soluong_current > tong_soluong_capphep:
                return json({"error_code" : "PARAM_ERROR", "error_message" : "Số lượng được cấp phép theo giấy phép nhập khẩu là {}. Số lượng nhập hiện tại là {} đã vượt quá hạn số lượng được cấp phép".format(tong_soluong_capphep,soluong_current)}, status=520)


    #tạo record mới

    newChiTiet = GiayChungNhanCOChitiet()
    newChiTiet.id = default_uuid()
    newChiTiet.chungnhan_id = chungnhan_id
    newChiTiet.so_co = so_co
    newChiTiet.so_giay_phep = data.get("so_giay_phep")
    newChiTiet.thoigian_cap_co = data.get("thoigian_cap_co")
    newChiTiet.giayphep_nhapkhau_id = giayphep_nhapkhau_id
    newChiTiet.loai_co = loai_co
    newChiTiet.id_sanpham = id_sanpham
    newChiTiet.ma_sanpham = data.get("ma_sanpham")
    newChiTiet.ten_sanpham = data.get("ten_sanpham")
    objSanPham = data.get("sanpham")
    if isinstance(objSanPham, dict):
        if '$order' in objSanPham:
            del objSanPham['$order']
    newChiTiet.sanpham = objSanPham
    newChiTiet.soluong_donggoi = validate_number(data.get("soluong_donggoi"))
    newChiTiet.loai_donggoi = data.get("loai_donggoi")
    newChiTiet.mota_sanpham = data.get("mota_sanpham")
    newChiTiet.tieuchi_xuatxu = data.get("tieuchi_xuatxu")
    newChiTiet.soluong = validate_number(soluong)
    newChiTiet.donvitinh = "Kg"
    newChiTiet.so_hoadon = data.get("so_hoadon")
    newChiTiet.ma_kiem_nghiem = data.get("ma_kiem_nghiem")
    newChiTiet.phieu_kiem_nghiem_id = data.get("phieu_kiem_nghiem_id")
    newChiTiet.chungnhan_cq = data.get("chungnhan_cq")
    newChiTiet.ma_HS = data.get("ma_HS")
    newChiTiet.tongsoluong = validate_number(data.get("tongsoluong"))
    newChiTiet.donvi_id = donvi_id
    db.session.add(newChiTiet)
    db.session.flush()


    #cộng số lượng đã nhập giấy phép nhập khẩu
    if loai_co ==1: 
        soluong_danhap = 0
        soluong_capphep = 0
        checkGiayPhep = db.session.query(GiayPhepNhapKhauChiTiet).filter(\
            GiayPhepNhapKhauChiTiet.giayphep_id == giayphep_nhapkhau_id, \
            GiayPhepNhapKhauChiTiet.id_sanpham == id_sanpham, \
            GiayPhepNhapKhauChiTiet.donvi_id ==donvi_id,\
            GiayPhepNhapKhauChiTiet.deleted == False).all()

        if len(checkGiayPhep) ==0:
            return json({'error_code':'PARAM_ERROR', 'error_message':'Không tìm thấy dược liệu trong giấy cấp phép nhập khẩu'}, status=520)
        
        for giayphep in checkGiayPhep:
            soluong_danhap += validate_number(giayphep.soluong_danhap)
            soluong_capphep += validate_number(giayphep.soluong_capphep)
        


        for giayphep in checkGiayPhep:
            giayphep.soluong_danhap = validate_number(giayphep.soluong_danhap)
            giayphep.soluong_capphep = validate_number(giayphep.soluong_capphep)
            if giayphep.soluong_danhap >= giayphep.soluong_capphep or soluong <= 0:
                continue
            else:
                if giayphep.soluong_capphep - giayphep.soluong_danhap >= soluong:
                    giayphep.soluong_danhap += soluong
                    soluong = 0
                    break
                else:
                    giayphep.soluong_danhap += (giayphep.soluong_capphep - giayphep.soluong_danhap)
                    soluong -= (giayphep.soluong_capphep - giayphep.soluong_danhap)
        
        db.session.flush()


    db.session.commit()
    return json(to_dict(newChiTiet), status=200)

@app.route('/api/v2/giaychungnhanco_chitiet/<id>', methods=['PUT'])
async def giaychungnhanco_chitiet(request, id):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)

    newData = request.json

    if newData is None:
        return json({'error_code':'PARAM_ERROR', 'error_message':'Tham số không hợp lệ'}, status=520)

    #validatte data

    oldData = db.session.query(GiayChungNhanCOChitiet).filter(\
        GiayChungNhanCOChitiet.id == id, \
        GiayChungNhanCOChitiet.deleted == False).first()

    if oldData is None:
        return json({'error_code':'PARAM_ERROR', 'error_message':'Không tìm thấy bản ghi dữ liệu'}, status=520)

    chungnhan_id = newData.get("chungnhan_id")
    if chungnhan_id is None or chungnhan_id == "":
        return json({'error_code':'PARAM_ERROR', 'error_message':'Chứng nhận CO ID không được để trống'}, status=520)

    so_co = newData.get("so_co")
    if so_co is None or so_co == "":
        return json({'error_code':'PARAM_ERROR', 'error_message':'Số chứng nhận CO không được để trống'}, status=520)

    loai_co = newData.get("loai_co")
    if loai_co is None:
        return json({'error_code':'PARAM_ERROR', 'error_message':'Loại CO không được để trống'}, status=520)
    
    giayphep_nhapkhau_id = newData.get("giayphep_nhapkhau_id")
    phieu_kiem_nghiem_id = newData.get("phieu_kiem_nghiem_id")

    if loai_co ==1:
        if giayphep_nhapkhau_id is None or giayphep_nhapkhau_id == "":
            return json({'error_code':'PARAM_ERROR', 'error_message':'Giấy phép nhập khẩu không được để trống'}, status=520)

        if phieu_kiem_nghiem_id is None or phieu_kiem_nghiem_id == "":
            return json({'error_code':'PARAM_ERROR', 'error_mesage':'Mã kiểm nghiệm CQ không được để trống'}, status=520)

    id_sanpham = newData.get("id_sanpham")
    if id_sanpham is None or id_sanpham == "":
        return json({'error_code':'PARAM_ERROR', 'error_message':'Dược liệu không được để trống'}, status=520)


    soluong = newData.get("soluong")
    if soluong is None or soluong == "":
        return json({'error_code':'PARAM_ERROR', 'error_message':'Số lượng không được để trống'}, status=520)

    soluong = validate_number(soluong)

    #kiểm tra số lượng theo giấy phép nhập khẩu
    soluong_current = validate_number(newData.get("soluong"))
    donvi_id = currentUser.donvi_id

    if loai_co ==1:
        tong_soluong_capphep = 0
        check_giay_phep_chitiet = db.session.query(GiayPhepNhapKhauChiTiet).filter(\
            GiayPhepNhapKhauChiTiet.giayphep_id == giayphep_nhapkhau_id, \
            GiayPhepNhapKhauChiTiet.donvi_id == donvi_id,\
            GiayPhepNhapKhauChiTiet.id_sanpham == id_sanpham, \
            GiayPhepNhapKhauChiTiet.deleted == False).all()
        if isinstance(check_giay_phep_chitiet, list) and len(check_giay_phep_chitiet) > 0:
            for item in check_giay_phep_chitiet:
                soluong_capphep = validate_number(item.soluong_capphep)
                tong_soluong_capphep += (soluong_capphep)

        soluong_danhap = 0

        check_co_chitiet = db.session.query(GiayChungNhanCOChitiet).filter(\
            GiayChungNhanCOChitiet.donvi_id== donvi_id,\
            GiayChungNhanCOChitiet.id != id,\
            GiayChungNhanCOChitiet.giayphep_nhapkhau_id == giayphep_nhapkhau_id,\
            GiayChungNhanCOChitiet.id_sanpham == id_sanpham,
            GiayChungNhanCOChitiet.deleted == False).all()

        if isinstance(check_co_chitiet,list) and len(check_co_chitiet) > 0:
            for item in check_co_chitiet:
                soluong_danhap += validate_number(item.soluong)
            if soluong_danhap > tong_soluong_capphep:
                return json({"error_code" : "PARAM_ERROR", "error_message" : "Số lượng được cấp phép theo giấy phép nhập khẩu là {}. Số lượng dược liệu đã nhập trong các giấy chứng nhận nguồn gốc (CO) là {} đã vượt mức số lượng được cấp phép.".format(tong_soluong_capphep, soluong_danhap)}, status=520)
            else:
                soluong_danhap_new = soluong_danhap + soluong_current
                if soluong_danhap_new > tong_soluong_capphep:
                    return json({"error_code" : "PARAM_ERROR", "error_message" : "Số lượng được cấp phép theo giấy phép nhập khẩu là {}. Số lượng dược liệu đã nhập trong các giấy chứng nhận nguồn gốc (CO) là {}. Số lượng nhập hiện tại là : {} đã vượt quá số lượng được cấp phép.".format(tong_soluong_capphep, soluong_danhap, soluong_current)}, status=520)
        else:
            if soluong_current > tong_soluong_capphep:
                return json({"error_code" : "PARAM_ERROR", "error_message" : "Số lượng được cấp phép theo giấy phép nhập khẩu là {}. Số lượng nhập hiện tại là {} đã vượt quá hạn số lượng được cấp phép".format(tong_soluong_capphep,soluong_current)}, status=520)
        

    #hoàn lại số lượng cho giấy phép nhập khẩu cũ

    oldLoaiCo = oldData.loai_co
    if oldLoaiCo ==1:

        oldGiayPhepId = oldData.giayphep_nhapkhau_id
        oldIdSanPham = oldData.id_sanpham
        oldSoluong = validate_number(oldData.soluong)

        oldGiayPhep = db.session.query(GiayPhepNhapKhauChiTiet).filter(\
            GiayPhepNhapKhauChiTiet.giayphep_id == oldGiayPhepId, \
            GiayPhepNhapKhauChiTiet.donvi_id == donvi_id,\
            GiayPhepNhapKhauChiTiet.id_sanpham == oldIdSanPham,\
            GiayPhepNhapKhauChiTiet.deleted == False).all()

        for oldItem in oldGiayPhep:
            oldItem.soluong_danhap = validate_number(oldItem.soluong_danhap)
            if oldItem.soluong_danhap <= 0 or oldSoluong <=0:
                continue
            else:
                if oldItem.soluong_danhap >= oldSoluong:
                    oldItem.soluong_danhap -= oldSoluong
                    oldSoluong = 0
                    break
                else:
                    oldItem.soluong_danhap = 0
                    oldSoluong -= oldItem.soluong_danhap

        db.session.flush()

    
    #cập nhật mới

    oldData.so_co = so_co
    oldData.so_giay_phep = newData.get("so_giay_phep")
    oldData.thoigian_cap_co = newData.get("thoigian_cap_co")
    oldData.giayphep_nhapkhau_id = giayphep_nhapkhau_id
    oldData.loai_co = loai_co
    oldData.id_sanpham = id_sanpham
    oldData.ma_sanpham = newData.get("ma_sanpham")
    oldData.ten_sanpham = newData.get("ten_sanpham")
    objSanPham = newData.get("sanpham")
    if isinstance(objSanPham, dict):
        if '$order' in objSanPham:
            del objSanPham['$order']
    oldData.sanpham = objSanPham
    oldData.soluong_donggoi = validate_number(newData.get("soluong_donggoi"))
    oldData.loai_donggoi = newData.get("loai_donggoi")
    oldData.mota_sanpham = newData.get("mota_sanpham")
    oldData.tieuchi_xuatxu = newData.get("tieuchi_xuatxu")
    oldData.soluong = validate_number(soluong)
    oldData.donvitinh = "Kg"
    oldData.so_hoadon = newData.get("so_hoadon")
    oldData.ma_kiem_nghiem = newData.get("ma_kiem_nghiem")
    oldData.phieu_kiem_nghiem_id = newData.get("phieu_kiem_nghiem_id")
    oldData.chungnhan_cq = newData.get("chungnhan_cq")
    oldData.ma_HS = newData.get("ma_HS")
    oldData.tongsoluong = validate_number(newData.get("tongsoluong"))
    db.session.flush()

    #cộng số lượng đã nhập giấy phép nhập khẩu
    if loai_co ==1: 
        soluong_danhap = 0
        soluong_capphep = 0
        checkGiayPhep = db.session.query(GiayPhepNhapKhauChiTiet).filter(\
            GiayPhepNhapKhauChiTiet.giayphep_id == giayphep_nhapkhau_id, \
            GiayPhepNhapKhauChiTiet.id_sanpham == id_sanpham, \
            GiayPhepNhapKhauChiTiet.donvi_id ==donvi_id,\
            GiayPhepNhapKhauChiTiet.deleted == False).all()

        if len(checkGiayPhep) ==0:
            return json({'error_code':'PARAM_ERROR', 'error_message':'Không tìm thấy dược liệu trong giấy cấp phép nhập khẩu'}, status=520)
        
        for giayphep in checkGiayPhep:
            soluong_danhap += validate_number(giayphep.soluong_danhap)
            soluong_capphep += validate_number(giayphep.soluong_capphep)
        


        for giayphep in checkGiayPhep:
            giayphep.soluong_danhap = validate_number(giayphep.soluong_danhap)
            giayphep.soluong_capphep = validate_number(giayphep.soluong_capphep)
            if giayphep.soluong_danhap >= giayphep.soluong_capphep or soluong <= 0:
                continue
            else:
                if giayphep.soluong_capphep - giayphep.soluong_danhap >= soluong:
                    giayphep.soluong_danhap += soluong
                    soluong = 0
                    break
                else:
                    giayphep.soluong_danhap += (giayphep.soluong_capphep - giayphep.soluong_danhap)
                    soluong -= (giayphep.soluong_capphep - giayphep.soluong_danhap)
        
        db.session.flush()


    
    db.session.commit()



    return json(to_dict(oldData), status=200)

@app.route('/api/v2/giaychungnhanco_chitiet/<id>', methods=['DELETE'])
async def giaychungnhanco_chitiet(request, id):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)

    
    #validatte data

    oldData = db.session.query(GiayChungNhanCOChitiet).filter(\
        GiayChungNhanCOChitiet.id == id, \
        GiayChungNhanCOChitiet.deleted == False).first()

    if oldData is None:
        return json({'error_code':'PARAM_ERROR', 'error_message':'Không tìm thấy bản ghi dữ liệu'}, status=520)


    donvi_id = currentUser.donvi_id
    #trừ số lượng đã nhập trong giấy phép nhập khẩu
    if loai_co == 1:
        oldGiayPhepId = oldData.giayphep_nhapkhau_id
        oldIdSanPham = oldData.id_sanpham
        oldSoluong = validate_number(oldData.soluong)

        oldGiayPhep = db.session.query(GiayPhepNhapKhauChiTiet).filter(\
            GiayPhepNhapKhauChiTiet.giayphep_id == oldGiayPhepId, \
            GiayPhepNhapKhauChiTiet.donvi_id == donvi_id,\
            GiayPhepNhapKhauChiTiet.id_sanpham == oldIdSanPham,\
            GiayPhepNhapKhauChiTiet.deleted == False).all()

        for oldItem in oldGiayPhep:
            oldItem.soluong_danhap = validate_number(oldItem.soluong_danhap)
            if oldItem.soluong_danhap <= 0 or oldSoluong <=0:
                continue
            else:
                if oldItem.soluong_danhap >= oldSoluong:
                    oldItem.soluong_danhap -= oldSoluong
                    oldSoluong = 0
                    break
                else:
                    oldItem.soluong_danhap = 0
                    oldSoluong -= oldItem.soluong_danhap



    oldData.deleted = True

    db.session.commit()

    return json({}, status=200)