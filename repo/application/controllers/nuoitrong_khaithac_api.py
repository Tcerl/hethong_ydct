import asyncio
import aiohttp
import hashlib
import ujson
from application.extensions import apimanager
from application.server import app
from application.database import db
from sqlalchemy.orm import aliased, joinedload_all
from sqlalchemy import asc, desc
# from sqlalchemy import has
from gatco.response import json, text, html
import time
from math import floor
from application.controllers.helpers.helper_common import *
from application.models.model_danhmuc import TuyenDonVi
from sqlalchemy import or_, and_, desc, asc


from application.models.model_duoclieu import TieuChuanChatLuong

from application.models.model_donvi import *
from application.models.models import Counter
# from application.models.model_quanlykho import *
from application.extensions import auth
from application.controllers.upload import *
from sqlalchemy.orm.attributes import flag_modified
from application.extensions import jinja
from application.models.model_duoclieu import *
from datetime import datetime


async def pre_delete_nuoitrong_khaithac(request = None, instance_id = None, Model = None, **kw):
    if Model.__tablename__ == "nuoitrong_chamsoc":
        check_phieunhap = db.session.query(PhieuNhapKho).filter(and_(\
            PhieuNhapKho.thuhoach_nuoitrong_id == instance_id, \
            PhieuNhapKho.deleted == False)).first()
        if check_phieunhap is not None:
            return json({'error_code': 'NOT_ALLOW', 'error_message': "Vui lòng xóa phiếu nhập trước khi xóa dữ liệu"}, status= 520)
        
    elif Model.__tablename__ == "khaithac_tunhien":
        check_phieunhap = db.session.query(PhieuNhapKho).filter(and_(\
            PhieuNhapKho.thuhoach_khaithac_id == instance_id, \
            PhieuNhapKho.deleted == False)).first()
        if check_phieunhap is not None:
            return json({'error_code': 'NOT_ALLOW', 'error_message': "Vui lòng xóa phiếu nhập trước khi xóa dữ liệu"}, status= 520)    


async def pre_post_gacp(request = None, Model = None, data = None, **kw):
    if "id_sanpham" in data and  data["id_sanpham"] is not None and data["id_sanpham"] != "":
        check_sanpham = db.session.query(DanhMucSanPham).filter(DanhMucSanPham.id == data["id_sanpham"]).first()
        if check_sanpham is not None:
            data['sanpham'] = to_dict(check_sanpham)
            data['ma_sanpham'] = check_sanpham.ma_sanpham
            data['ten_sanpham'] = check_sanpham.ten_sanpham
            data['ten_khoa_hoc'] = check_sanpham.ten_khoa_hoc
            data['tenkhongdau'] = check_sanpham.tenkhongdau
    else:
        return json({'error_code': "PARAM_ERROR", "error_message": "Tham số không hợp lệ"}, status = 520)
    
    if "loai_nuoitrong_khaithac" in data:
        if data['loai_nuoitrong_khaithac'] == 1:
            nuoitrong_khaithac_id = data['nuoitrong_khaithac_id']
            if nuoitrong_khaithac_id is not None and nuoitrong_khaithac_id != "":
                thuhoach_nuoitrong = db.session.query(DuocLieuNuoiTrong).filter(DuocLieuNuoiTrong.id == nuoitrong_khaithac_id, \
                    DuocLieuNuoiTrong.deleted == False).first()
                if thuhoach_nuoitrong is not None:
                    data['nuoitrong_khaithac'] = to_dict(thuhoach_nuoitrong)
        elif data['loai_nuoitrong_khaithac'] == 2:
            nuoitrong_khaithac_id = data['nuoitrong_khaithac_id']
            if nuoitrong_khaithac_id is not None and nuoitrong_khaithac_id != "":
                thuhoach_khaithac = db.session.query(KhaiThacTuNhien).filter(KhaiThacTuNhien.id == nuoitrong_khaithac_id, \
                    KhaiThacTuNhien.deleted == False).first()
                if thuhoach_khaithac is not None:
                    data['nuoitrong_khaithac'] = to_dict(thuhoach_khaithac)
    if 'stt' in data:
        del data['stt']


async def pre_post_nuoitrong_khaithac(request= None, Model =None, data= None, **kw):
    if 'chungnhangacp' in data:
        del data['chungnhangacp']


apimanager.create_api(DuocLieuNuoiTrong,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_token_donvi_get_put_delete_single], GET_MANY=[validate_user,pre_getmany_donvi], POST=[validate_user, pre_post_insert_donvi, pre_post_nuoitrong_khaithac], PUT_SINGLE=[validate_token_donvi_get_put_delete_single, pre_put_insert_tenkhongdau, pre_post_nuoitrong_khaithac], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_token_donvi_get_put_delete_single, pre_delete_nuoitrong_khaithac, pre_delete]),
    postprocess=dict(GET_MANY=[postprocess_stt, get_many_object_donvi], GET_SINGLE=[get_single_object_donvi]),
    collection_name='duoclieu_nuoitrong')

apimanager.create_api(DuocLieuNuoiTrong,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_token_donvi_get_put_delete_single], GET_MANY=[validate_user,pre_getmany_donvi], POST=[validate_user, pre_post_insert_donvi, pre_post_nuoitrong_khaithac], PUT_SINGLE=[validate_token_donvi_get_put_delete_single, pre_put_insert_tenkhongdau, pre_post_nuoitrong_khaithac], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_token_donvi_get_put_delete_single, pre_delete_nuoitrong_khaithac, pre_delete]),
    postprocess=dict(GET_MANY=[postprocess_stt, get_many_object_donvi], GET_SINGLE=[get_single_object_donvi]),
    include_columns= ['id', 'id_sanpham', 'ma_sanpham', 'ten_sanpham', 'ten_khoa_hoc', 'tenkhongdau', 'diadiem_nuoitrong', 'ngay_lam_dat', 'ngay_uom_giong', 'ngay_trong_giong', 'donvi_id', 'donvi'],
    collection_name='duoclieu_nuoitrong_filter')

apimanager.create_api(KhaiThacTuNhien,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_token_donvi_get_put_delete_single], GET_MANY=[validate_user,pre_getmany_donvi], POST=[validate_user, pre_post_insert_donvi, pre_post_nuoitrong_khaithac], PUT_SINGLE=[validate_token_donvi_get_put_delete_single, pre_put_insert_tenkhongdau, pre_post_nuoitrong_khaithac], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_token_donvi_get_put_delete_single, pre_delete_nuoitrong_khaithac, pre_delete]),
    postprocess=dict(GET_MANY=[postprocess_stt, get_many_object_donvi], GET_SINGLE=[get_single_object_donvi]),
    collection_name='khaithac_tunhien')
    
apimanager.create_api(KhaiThacTuNhien,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_token_donvi_get_put_delete_single], GET_MANY=[validate_user,pre_getmany_donvi], POST=[validate_user, pre_post_insert_donvi, pre_post_nuoitrong_khaithac], PUT_SINGLE=[validate_token_donvi_get_put_delete_single, pre_put_insert_tenkhongdau, pre_post_nuoitrong_khaithac], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_token_donvi_get_put_delete_single, pre_delete_nuoitrong_khaithac, pre_delete]),
    postprocess=dict(GET_MANY=[postprocess_stt, get_many_object_donvi], GET_SINGLE=[get_single_object_donvi]),
    include_columns= ['id', 'id_sanpham', 'ma_sanpham', 'ten_sanpham', 'ten_khoa_hoc', 'tenkhongdau', 'mota_vitri_diadiem', 'dientich_khaithac', 'thoigian_batdau_khaithac', 'tong_thoigian_khaithac', 'donvi_id', 'donvi'],
    collection_name='khaithac_tunhien_filter')

apimanager.create_api(ChungNhanGACP,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_token_donvi_get_put_delete_single], GET_MANY=[validate_user,pre_getmany_gacp], POST=[validate_user, pre_post_insert_donvi], PUT_SINGLE=[validate_user, pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_token_donvi_get_put_delete_single, pre_delete]),
    postprocess=dict(GET_MANY=[postprocess_stt, get_many_object_donvi], GET_SINGLE=[get_single_object_donvi]),
    collection_name='chungnhangacp')

apimanager.create_api(ChungNhanGACP,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_token_donvi_get_put_delete_single], GET_MANY=[validate_user,pre_getmany_gacp], POST=[validate_user, pre_post_insert_donvi], PUT_SINGLE=[validate_token_donvi_get_put_delete_single, pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_token_donvi_get_put_delete_single, pre_delete]),
    postprocess=dict(GET_MANY=[postprocess_stt, get_many_object_donvi], GET_SINGLE=[get_single_object_donvi]),
    include_columns = ['id', 'so_giay_chungnhan', 'ten_sanpham', 'donvi', 'loai_nuoitrong_khaithac', 'thoigian_batdau_hieuluc', 'thoigian_ketthuc_hieuluc', 'trangthai'],
    collection_name='chungnhangacp_collection')

apimanager.create_api(DiaDiemNuoiTrongKhaiThac,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_token_donvi_get_put_delete_single], GET_MANY=[pre_getmany_donvi], POST=[pre_post_insert_donvi, pre_put_insert_tenkhongdau, preprocess_convert_diachi], PUT_SINGLE=[validate_token_donvi_get_put_delete_single, pre_put_insert_tenkhongdau],  DELETE_SINGLE=[validate_token_donvi_get_put_delete_single, pre_delete]),
    postprocess=dict(GET_MANY=[postprocess_stt, get_many_object_donvi], GET_SINGLE=[get_single_object_donvi]),
    collection_name='nuoitrong_khaithac')

apimanager.create_api(DiaDiemNuoiTrongKhaiThac,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_token_donvi_get_put_delete_single], GET_MANY=[pre_getmany_donvi], POST=[pre_post_insert_donvi, pre_put_insert_tenkhongdau, preprocess_convert_diachi], PUT_SINGLE=[validate_token_donvi_get_put_delete_single, pre_put_insert_tenkhongdau],  DELETE_SINGLE=[validate_token_donvi_get_put_delete_single, pre_delete]),
    postprocess=dict(GET_MANY=[postprocess_stt, get_many_object_donvi], GET_SINGLE=[get_single_object_donvi]),
    include_columns =['id', 'ten_diadiem', 'tenkhongdau', 'xaphuong', 'quanhuyen', 'tinhthanh', 'donvi_id', 'donvi'],
    collection_name='nuoitrong_khaithac_filter')


@app.route('/api/v1/xacnhan_gacp', methods= ['POST'])
async def xacnhan_gacp(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    if data is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)

    id = data.get("id")
    if id is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)
    
    #check gacp

    chungnhangacp = db.session.query(ChungNhanGACP).filter(and_(\
        ChungNhanGACP.id == id, \
        ChungNhanGACP.deleted == False)).first()
    
    if chungnhangacp is None:
        return json({'error_code': "NOT_EXIST", "error_message": "Không tìm thấy bản ghi dữ liệu"}, status= 520)
    else:
        chungnhangacp.trangthai = 2
        now = datetime.now()
        timestamp = now.timestamp()
        thoigian_guiduyet = parse_date_custom(timestamp)
        chungnhangacp.thoigian_guiduyet = thoigian_guiduyet

    db.session.commit()
    return json(to_dict(chungnhangacp), status = 200)

@app.route('/api/v1/huy_gacp', methods= ['POST'])
async def huy_gacp(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    if data is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)

    id = data.get("id")
    if id is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)
    
    #check gacp

    chungnhangacp = db.session.query(ChungNhanGACP).filter(and_(\
        ChungNhanGACP.id == id, \
        ChungNhanGACP.deleted == False)).first()
    
    if chungnhangacp is None:
        return json({'error_code': "NOT_EXIST", "error_message": "Không tìm thấy bản ghi dữ liệu"}, status= 520)
    else:
        chungnhangacp.trangthai = 2
        chungnhangacp.nguoi_duyet_id = ""
        chungnhangacp.nguoi_duyet_ten = ""
        chungnhangacp.thoigian_duyet = ""

    db.session.commit()
    return json(to_dict(chungnhangacp), status = 200)


@app.route('/api/v1/mo_gacp', methods= ['POST'])
async def mo_gacp(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    if data is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)

    id = data.get("id")
    if id is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)
    
    #check gacp

    chungnhangacp = db.session.query(ChungNhanGACP).filter(and_(\
        ChungNhanGACP.id == id, \
        ChungNhanGACP.deleted == False)).first()
    
    if chungnhangacp is None:
        return json({'error_code': "NOT_EXIST", "error_message": "Không tìm thấy bản ghi dữ liệu"}, status= 520)
    else:
        chungnhangacp.trangthai = 1
        chungnhangacp.nguoi_duyet_id = ""
        chungnhangacp.nguoi_duyet_ten = ""
        chungnhangacp.thoigian_duyet = ""
        chungnhangacp.thoigian_guiduyet = ""

    db.session.commit()
    return json(to_dict(chungnhangacp), status = 200)


@app.route('/api/v1/duyet_gacp', methods= ['POST'])
async def duyet_gacp(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    if data is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)

    id = data.get("id")
    if id is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)
    
    #check gacp

    chungnhangacp = db.session.query(ChungNhanGACP).filter(and_(\
        ChungNhanGACP.id == id, \
        ChungNhanGACP.deleted == False)).first()
    
    if chungnhangacp is None:
        return json({'error_code': "NOT_EXIST", "error_message": "Không tìm thấy bản ghi dữ liệu"}, status= 520)
    else:
        chungnhangacp.trangthai = 3
        chungnhangacp.nguoi_duyet_id = currentUser.id
        chungnhangacp.nguoi_duyet_ten = currentUser.hoten
        now = datetime.now()
        timestamp = now.timestamp()
        thoigian_duyet = parse_date_custom(timestamp)
        os.environ['TZ'] = 'UTC-7'
        time.tzset()
        tmp = datetime.now().strftime("%d/%m/%Y %H:%M")
        chungnhangacp.thoigian_duyet = thoigian_duyet
        db.session.flush()

        loai_nuoitrong_khaithac = chungnhangacp.loai_nuoitrong_khaithac
        if loai_nuoitrong_khaithac == 1:
            #notify vs email
            donvi_id = chungnhangacp.donvi_id
            if donvi_id is not None:
                # lấy user của đơn vị được duyệt
                check_user = db.session.query(User).filter(and_(User.donvi_id == donvi_id, User.active == 1)).all()
                if check_user is not None and isinstance(check_user, list) and len(check_user) >0:
                    for items in check_user:
                        if items.email is not None and validate_email(items.email): 
                            #gửi email       
                            data = "Cục Quản lý Y Dược Cổ Truyền đã duyệt quy trình nuôi trồng và thu hái dược liệu {} theo GACP của đơn vị vào thời gian {}".format(chungnhangacp.ten_sanpham, tmp)
                            subject = "Duyệt quá trình nuôi trông, thu hái dược liệu theo GACP"
                            await send_mail(subject, items.email, data)

        elif loai_nuoitrong_khaithac == 2:
            #notify vs email
            donvi_id = chungnhangacp.donvi_id
            if donvi_id is not None:
                # lấy user của đơn vị được duyệt
                check_user = db.session.query(User).filter(and_(User.donvi_id == donvi_id, User.active == 1)).all()
                if check_user is not None and isinstance(check_user, list) and len(check_user) >0:
                    for items in check_user:
                        if items.email is not None and validate_email(items.email): 
                            #gửi email       
                            data = "Cục Quản lý Y Dược Cổ Truyền đã duyệt quá trình khai thác tự nhiên dược liệu {} theo GACP của đơn vị vào thời gian {}".format(chungnhangacp.ten_sanpham, tmp)
                            subject = "Duyệt quá trình nuôi trông, thu hái dược liệu theo GACP"
                            await send_mail(subject, items.email, data)


    db.session.commit()
    return json(to_dict(chungnhangacp), status = 200)


