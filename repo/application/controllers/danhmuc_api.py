
from application.extensions import apimanager
from gatco_restapi.helpers import to_dict
from application.server import app
from sqlalchemy import or_
from gatco.response import json
from datetime import datetime
import ujson
import asyncio
import aiohttp
import time

from application.controllers.helpers.helper_common import *
from application.database import db
from application.models.model_danhmuc import *
from application.models.model_duoclieu import *
from application.models.model_hanhnghe import *
from application.models.model_sanpham import *

async def check_exist_danhmuc(request=None, data=None, Model=None, **kw):
    if data is not None and "ma" in data and data["ma"] is not None:
        record = db.session.query(Model).filter(Model.ma == data['ma']).first()
        if record is not None:
            data['id'] = record.id
            return json(to_dict(record))



async def update_name_khongdau(request=None, data=None, Model=None, **kw):
    if "ten" in data:
        data["tenkhongdau"]  = convert_text_khongdau(data["ten"])
    elif "name" in data:
        data["tenkhongdau"]  = convert_text_khongdau(data["name"])
    elif "ten_nhom" in data:
        data["tenkhongdau"] = convert_text_khongdau(data["ten_nhom"])
    elif "ten_sanpham" in data:
        data["tenkhongdau"] = convert_text_khongdau(data["ten_sanpham"])
    elif "ten_bophan" in data:
        data["tenkhongdau"] = convert_text_khongdau(data["ten_bophan"])
    elif "ten_tieuchuan" in data:
        data["tenkhongdau"] = convert_text_khongdau(data["ten_tieuchuan"])
    elif "ten_cuakhau" in data:
        data["tenkhongdau"] = convert_text_khongdau(data["ten_cuakhau"])
    elif "ten_donvi" in data:
        data["tenkhongdau"] = convert_text_khongdau(data["ten_donvi"])
    

async def preprocess_post_put_sanpham_donvi(request=None, data=None, Model=None, **kw):
    currentUser = current_user(request)
    if currentUser is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    if currentUser.has_role("admin") is True or currentUser.donvi is None or currentUser.donvi.tuyendonvi_id != "3":
        return json({'error_code':'PARAM_ERROR', 'error_message':"Bạn không có quyền thực hiện hành động này"}, status=520)
    if 'ten_sanpham' in data and 'tenkhongdau' in data:
        data['tenkhongdau'] = convert_text_khongdau(data['ten_sanpham'])
    elif 'ten_nhom' in data and 'tenkhongdau' in data:
        data['tenkhongdau'] = convert_text_khongdau(data['ten_nhom'])
    elif 'ten_donvi' in data and 'tenkhongdau' in data:
        data['tenkhongdau'] = convert_text_khongdau(data['ten_donvi'])
    if request.method == "POST":
        data['donvi_id'] = currentUser.donvi_id
        data['created_by'] = currentUser.id
    elif request.method == "PUT":
        data['updated_by'] = currentUser.id

async def preprocess_post_put_nhasanxuat_donvi(request=None, data=None, Model=None, **kw):
    currentUser = current_user(request)
    if currentUser is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    if currentUser.has_role("admin") is True or currentUser.donvi is None or currentUser.donvi.tuyendonvi_id != "3":
        return json({'error_code':'PARAM_ERROR', 'error_message':"Bạn không có quyền thực hiện hành động này"}, status=520)
    if 'ten_sanpham' in data and 'tenkhongdau' in data:
        data['tenkhongdau'] = convert_text_khongdau(data['ten_sanpham'])
    elif 'ten_nhom' in data and 'tenkhongdau' in data:
        data['tenkhongdau'] = convert_text_khongdau(data['ten_nhom'])
    elif 'ten' in data and 'tenkhongdau' in data:
        data['tenkhongdau'] = convert_text_khongdau(data['ten'])
    if request.method == "POST":
        data['donvi_id'] = currentUser.donvi_id
        data['created_by'] = currentUser.id
    elif request.method == "PUT":
        data['updated_by'] = currentUser.id

async def preprocess_post_put_danhmuc_nhacungcap(request=None, data=None, Model=None, **kw):
    currentUser = current_user(request)
    if currentUser is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    if currentUser.has_role("admin") is not True and currentUser.has_role("canbo") is not True and currentUser.has_role("admin_donvi") is not True:
        return json({"success_message":"Đơn vị này được chỉnh sửa"},status=520)
    if 'ten_sanpham' in data and 'tenkhongdau' in data:
        data['tenkhongdau'] = convert_text_khongdau(data['ten_sanpham'])
    elif 'ten_nhom' in data and 'tenkhongdau' in data:
        data['tenkhongdau'] = convert_text_khongdau(data['ten_nhom'])
    elif 'ten_donvi' in data and 'tenkhongdau' in data:
        data['tenkhongdau'] = convert_text_khongdau(data['ten_donvi'])
    if request.method == "POST":
        # data['donvi_id'] = currentUser.donvi_id
        data['created_by'] = currentUser.id
    elif request.method == "PUT":
        data['updated_by'] = currentUser.id

async def preprocess_check_ma_donvi_danhmucnhacungcap(request=None, data=None, Model=None, **kw):
    if 'ma_donvi' not in data or data['ma_donvi'] is None or data['ma_donvi'].strip() == "":
        return json({'error_code':'PARAM_ERROR', 'error_message':"Vui lòng nhập mã đơn vị"}, status=520)
    if request.method == "POST":
        check_data = db.session.query(Model.id).filter(
            Model.ma_donvi == data['ma_donvi']
        ).first()
        if check_data is not None:
            return json({'error_code':'PARAM_ERROR', 'error_message':"Mã đơn vị đã được sử dụng, vui lòng nhập mã khác"}, status=520)
    elif request.method == "PUT":
        check_data = db.session.query(Model.id).filter(
            Model.id != data['id'],
            Model.ma_donvi == data['ma_donvi']
        ).first()
        if check_data is not None:
            return json({'error_code':'PARAM_ERROR', 'error_message':"Mã đơn vị đã được sử dụng, vui lòng nhập mã khác"}, status=520)
async def preprocess_check_ma_donvi(request=None, data=None, Model=None, **kw):
    if 'ma_donvi' not in data or data['ma_donvi'] is None or data['ma_donvi'].strip() == "":
        return json({'error_code':'PARAM_ERROR', 'error_message':"Vui lòng nhập mã đơn vị"}, status=520)
    if request.method == "POST":
        check_data = db.session.query(Model.id).filter(
            Model.ma_donvi == data['ma_donvi'], 
            Model.donvi_id == data['donvi_id']
        ).first()
        if check_data is not None:
            return json({'error_code':'PARAM_ERROR', 'error_message':"Mã đơn vị đã được sử dụng, vui lòng nhập mã khác"}, status=520)
    elif request.method == "PUT":
        check_data = db.session.query(Model.id).filter(
            Model.id != data['id'],
            Model.ma_donvi == data['ma_donvi'], 
            Model.donvi_id == data['donvi_id']
        ).first()
        if check_data is not None:
            return json({'error_code':'PARAM_ERROR', 'error_message':"Mã đơn vị đã được sử dụng, vui lòng nhập mã khác"}, status=520)
        
async def preprocess_check_ma_nhasanxuat_donvi(request=None, data=None, Model=None, **kw):
    if 'ma' not in data or data['ma'] is None or data['ma'].strip() == "":
        return json({'error_code':'PARAM_ERROR', 'error_message':"Vui lòng nhập mã đơn vị"}, status=520)
    if request.method == "POST":
        check_data = db.session.query(Model.id).filter(
            Model.ma == data['ma']
        ).first()
        if check_data is not None:
            return json({'error_code':'PARAM_ERROR', 'error_message':"Mã đơn vị đã được sử dụng, vui lòng nhập mã khác"}, status=520)
    elif request.method == "PUT":
        check_data = db.session.query(Model.id).filter(
            Model.id != data['id'],
            Model.ma == data['ma'], 
            Model.donvi_id == data['donvi_id']
        ).first()
        if check_data is not None:
            return json({'error_code':'PARAM_ERROR', 'error_message':"Mã đơn vị đã được sử dụng, vui lòng nhập mã khác"}, status=520)
        
async def preprocess_check_ma_sanpham(request=None, data=None, Model=None, **kw):
    if 'ma_sanpham' not in data or data['ma_sanpham'] is None or data['ma_sanpham'].strip() == "":
        return json({'error_code':'PARAM_ERROR', 'error_message':"Vui lòng nhập mã sản phẩm"}, status=520)
    if request.method == "POST":
        check_data = db.session.query(Model.id).filter(
            Model.ma_sanpham == data['ma_sanpham'], 
            Model.donvi_id == data['donvi_id']
        ).first()
        if check_data is not None:
            return json({'error_code':'PARAM_ERROR', 'error_message':"Mã sản phẩm đã được sử dụng, vui lòng nhập mã khác"}, status=520)
    elif request.method == "PUT":
        check_data = db.session.query(Model.id).filter(
            Model.id != data['id'],
            Model.ma_sanpham == data['ma_sanpham'], 
            Model.donvi_id == data['donvi_id']
        ).first()
        if check_data is not None:
            return json({'error_code':'PARAM_ERROR', 'error_message':"Mã sản phẩm đã được sử dụng, vui lòng nhập mã khác"}, status=520)


async def preprocess_tenkhongdau_sanpham(request=None, data=None, Model=None, **kw):
    tenkhongdau = ""
    if data.get('ma_sanpham') is not None:
        if tenkhongdau != "":
            tenkhongdau += " "
        tenkhongdau += convert_text_khongdau(data.get('ma_sanpham'))
    if data.get('ten_sanpham') is not None:
        if tenkhongdau != "":
            tenkhongdau += " "
        tenkhongdau += convert_text_khongdau(data.get('ten_sanpham'))
    if data.get('ten_khoa_hoc') is not None:
        if tenkhongdau != "":
            tenkhongdau += " "
        tenkhongdau += convert_text_khongdau(data.get('ten_khoa_hoc'))
    if data.get('ten_thuong_mai') is not None:
        if tenkhongdau != "":
            tenkhongdau += " "
        tenkhongdau += convert_text_khongdau(data.get('ten_thuong_mai'))
    if data.get('ma_sanpham_donvi') is not None:
        if tenkhongdau != "":
            tenkhongdau += " "
        tenkhongdau += convert_text_khongdau(data.get('ma_sanpham_donvi'))
    if tenkhongdau != "":
        data['tenkhongdau'] = tenkhongdau

async def pre_getmany_danhmucchung(search_params=None,request=None, **kw):
    user = current_user(request)
    if user is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    
    if "filters" in search_params and search_params["filters"] != "":
        search_params["filters"] = {"$and":[search_params["filters"],{"deleted":{"$eq": False}}]}
    else:
        search_params["filters"] = {"$and":[{"deleted":{"$eq": False}}]}
               


async def preprocess_check_ma(request=None, data=None, Model=None, **kw):
    if 'ma' not in data or data['ma'] is None or data['ma'].strip() == "":
        return json({'error_code':'PARAM_ERROR', 'error_message':"Vui lòng nhập mã người bán hàng"}, status=520)
    if (request.method == "POST") or (request.method == "PUT"):
        check_data = db.session.query(Model.id).filter(
            Model.id != data['id'],
            Model.ma == data['ma'], 
        ).first()
        if check_data is not None:
            return json({'error_code':'PARAM_ERROR', 'error_message':"Mã đã được sử dụng, vui lòng nhập mã khác"}, status=520)
        
apimanager.create_api(QuocGia,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user, check_exist_danhmuc], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], PUT_SINGLE=[validate_user,pre_put_insert_tenkhongdau], DELETE_SINGLE=[pre_delete]),
    postprocess=dict(GET_MANY=[postprocess_stt]),
    collection_name='quocgia')

apimanager.create_api(QuocGia,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user, check_exist_danhmuc], PUT_SINGLE=[validate_user,pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, pre_delete]),
    postprocess=dict(GET_MANY=[postprocess_stt]),
    include_columns= ['id', 'ma', 'ten', 'tenkhongdau'],
    collection_name='quocgia_filter')


apimanager.create_api(TinhThanh,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user, check_exist_danhmuc], PUT_SINGLE=[validate_user, pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, pre_delete]),
    postprocess=dict(GET_MANY=[postprocess_stt]),
    collection_name='tinhthanh')


apimanager.create_api(QuanHuyen,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user,check_exist_danhmuc], PUT_SINGLE=[validate_user,pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, pre_delete]),
    postprocess=dict(GET_MANY=[postprocess_stt]),
    collection_name='quanhuyen')



apimanager.create_api(XaPhuong,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user, check_exist_danhmuc], PUT_SINGLE=[validate_user,pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, pre_delete]),
    postprocess=dict(GET_MANY=[postprocess_stt]),
    collection_name='xaphuong')



apimanager.create_api(TuyenDonVi,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user, check_exist_danhmuc], PUT_SINGLE=[validate_user,pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, pre_delete]),
    postprocess=dict(GET_MANY=[postprocess_stt]),
    collection_name='tuyendonvi')


apimanager.create_api(DanToc,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user, check_exist_danhmuc], PUT_SINGLE=[validate_user,pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, pre_delete]),
    postprocess=dict(GET_MANY=[postprocess_stt]),
    collection_name='dantoc')

apimanager.create_api(NgheNghiep,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user, check_exist_danhmuc,pre_post_insert_donvi], PUT_SINGLE=[validate_user,pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, pre_delete]),
    postprocess=dict(GET_MANY=[postprocess_stt]),
    collection_name='nghenghiep')


apimanager.create_api(VanBangChuyenMon,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user, update_name_khongdau], PUT_SINGLE=[validate_user,update_name_khongdau], DELETE_SINGLE=[pre_delete], PUT_MANY=[deny_request], DELETE_MANY=[deny_request]),
    postprocess=dict(GET_MANY=[postprocess_stt]),
    exclude_columns= ["deleted_at", "deleted_by", "created_at", "created_by", "updated_at", "updated_by", 'deleted'],
    collection_name='vanbang_chuyenmon')


apimanager.create_api(VanBangChuyenMon,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[deny_request], GET_MANY=[validate_user], POST=[deny_request], PUT_SINGLE=[deny_request], DELETE_SINGLE=[deny_request], PUT_MANY=[deny_request], DELETE_MANY=[deny_request]),
    postprocess=dict(GET_MANY=[postprocess_stt]),
    collection_name='vanbang_chuyenmon_filter',
    include_columns=['id', 'ma','ten', 'tenkhongdau']  
)
    
# apimanager.create_api(CoSoYTe,
#     methods=['GET', 'POST', 'DELETE', 'PUT'],
#     url_prefix='/api/v1',
#     preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[], POST=[validate_admin], PUT_SINGLE=[validate_admin, pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user]),
#     postprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[], PUT_SINGLE=[]),
#     collection_name='cosoyte')

apimanager.create_api(DanhMucNhomSanPham,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_admin, pre_put_insert_tenkhongdau], PUT_SINGLE=[validate_admin, pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_admin]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='nhomsanpham')

apimanager.create_api(NhomSanPhamDonVi,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[pre_getmany_donvi], POST=[preprocess_post_put_sanpham_donvi], PUT_SINGLE=[preprocess_post_put_sanpham_donvi], DELETE_SINGLE=[pre_delete], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='nhomsanpham_donvi')

apimanager.create_api(DanhMucSanPham,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[pre_getmany_donvi], POST=[preprocess_post_put_sanpham_donvi, preprocess_check_ma_sanpham], PUT_SINGLE=[preprocess_post_put_sanpham_donvi, preprocess_check_ma_sanpham], DELETE_SINGLE=[pre_delete], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='danhmuc_sanpham')

apimanager.create_api(DanhMucNhaCungCap,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[pre_getmany_danhmuc_nhacungcap], POST=[preprocess_post_put_danhmuc_nhacungcap, preprocess_check_ma_donvi_danhmucnhacungcap, preprocess_convert_diachi], PUT_SINGLE=[preprocess_post_put_danhmuc_nhacungcap, preprocess_check_ma_donvi_danhmucnhacungcap, preprocess_convert_diachi], DELETE_SINGLE=[pre_delete], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='danhmuc_nhacungcap')

apimanager.create_api(DonViCungUng,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[pre_getmany_donvi], POST=[preprocess_post_put_sanpham_donvi, preprocess_check_ma_donvi, preprocess_convert_diachi], PUT_SINGLE=[preprocess_post_put_sanpham_donvi, preprocess_check_ma_donvi, preprocess_convert_diachi], DELETE_SINGLE=[pre_delete_donvi_cungung], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='donvi_cungung')

apimanager.create_api(NhaSanXuatDonVi,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[pre_getmany_donvi], POST=[preprocess_post_put_nhasanxuat_donvi, preprocess_check_ma_nhasanxuat_donvi, preprocess_convert_diachi], PUT_SINGLE=[preprocess_post_put_nhasanxuat_donvi, preprocess_check_ma_nhasanxuat_donvi, preprocess_convert_diachi], DELETE_SINGLE=[pre_delete_nhasanxuat_donvi], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='nhasanxuat_donvi')

apimanager.create_api(NhaSanXuat,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[pre_getmany_danhmucchung], POST=[pre_put_insert_tenkhongdau,preprocess_convert_diachi,preprocess_check_ma], PUT_SINGLE=[pre_put_insert_tenkhongdau, preprocess_check_ma,preprocess_convert_diachi], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_delete], DELETE_SINGLE=[pre_delete]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='nhasanxuat')

@app.route('/api/v2/nhasanxuat')
async def get_nsx(request):
    user = current_user(request)
    if user is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    query_filter = db.session.query(
    NhaSanXuat.id,
    NhaSanXuat.ma,
    NhaSanXuat.ten,
    NhaSanXuat.tenkhongdau,
    NhaSanXuat.diachi,
    NhaSanXuat.email,
    NhaSanXuat.dienthoai,
    NhaSanXuat.ngay_capphep,
    NhaSanXuat.tinhthanh_id,
    NhaSanXuat.tinhthanh,
    NhaSanXuat.quanhuyen,
    NhaSanXuat.quanhuyen_id,
    NhaSanXuat.xaphuong_id,
    NhaSanXuat.xaphuong,
    NhaSanXuat.sonha_tenduong,
    NhaSanXuat.trangthai
    ).filter(
        NhaSanXuat.deleted == False ,
        NhaSanXuat.trangthai ==1,
        ~NhaSanXuat.ma.in_(db.session.query(NhaSanXuatDonVi.ma).filter((NhaSanXuatDonVi.deleted == False)))
    )
    text_filter = request.args.get('query_filter')
    if text_filter is not None and text_filter.strip() != "":
        text_khongdau = convert_text_khongdau(text_filter)
        query_filter = query_filter.filter(or_(
            NhaSanXuat.ten.like("%"+ text_filter+"%"),
            NhaSanXuat.tenkhongdau.like("%" + text_khongdau + "%"),
            NhaSanXuat.ma.like("%"+ text_filter.strip() +"%")
            )
        )
    danhsach = query_filter.order_by(NhaSanXuat.ten).limit(30).all()
    objects = []
    for item in danhsach:
        tem_obj = item._asdict()
        objects.append(tem_obj)
    return json({"objects": objects}, status=200)
@app.route('/api/v2/nhasanxuat_donvi')
async def get_nsx(request):
    user = current_user(request)
    if user is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    query = db.session.query(
    NhaSanXuatDonVi.id,
    NhaSanXuatDonVi.ma,
    NhaSanXuatDonVi.ten,
    NhaSanXuatDonVi.tenkhongdau
    ).filter(
        NhaSanXuatDonVi.deleted == False ,
        NhaSanXuatDonVi.trangthai ==1
    )
    text_filter = request.args.get('query')
    if text_filter is not None and text_filter.strip() != "":
        text_khongdau = convert_text_khongdau(text_filter)
        query = query.filter(or_(
            NhaSanXuatDonVi.ten.like("%"+ text_filter+"%"),
            NhaSanXuatDonVi.tenkhongdau.like("%" + text_khongdau + "%"),
            NhaSanXuatDonVi.ma.like("%"+ text_filter.strip() +"%")
            )
        )
    danhsach = query.order_by(NhaSanXuatDonVi.ten).limit(30).all()
    objects = []
    for item in danhsach:
        tem_obj = item._asdict()
        objects.append(tem_obj)
    return json({"objects": objects}, status=200)

apimanager.create_api(SanPhamGACPDonVi,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[pre_getmany_donvi], POST=[preprocess_post_put_sanpham_donvi, preprocess_tenkhongdau_sanpham], PUT_SINGLE=[preprocess_post_put_sanpham_donvi, preprocess_tenkhongdau_sanpham], DELETE_SINGLE=[pre_delete], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='sanpham_gacp_donvi')

apimanager.create_api(SanPhamNhapKhauDonVi,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[pre_getmany_donvi], POST=[preprocess_post_put_sanpham_donvi, preprocess_tenkhongdau_sanpham], PUT_SINGLE=[preprocess_post_put_sanpham_donvi, preprocess_tenkhongdau_sanpham], DELETE_SINGLE=[pre_delete], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='sanpham_nhapkhau_donvi')

apimanager.create_api(SanPhamNoiBatDonVi,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[pre_getmany_donvi], POST=[preprocess_post_put_sanpham_donvi, preprocess_tenkhongdau_sanpham], PUT_SINGLE=[preprocess_post_put_sanpham_donvi, preprocess_tenkhongdau_sanpham], DELETE_SINGLE=[pre_delete], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='sanpham_noibat_donvi')

apimanager.create_api(SanPhamViPhamDonVi,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[pre_getmany_donvi], POST=[preprocess_post_put_sanpham_donvi, preprocess_tenkhongdau_sanpham], PUT_SINGLE=[preprocess_post_put_sanpham_donvi, preprocess_tenkhongdau_sanpham], DELETE_SINGLE=[pre_delete], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='sanpham_vipham_donvi')

# apimanager.create_api(DanhMucSanPham,
#     methods=['GET', 'POST', 'DELETE', 'PUT'],
#     url_prefix='/api/v1',
#     preprocess=dict(GET_SINGLE=[deny_request], GET_MANY=[pre_getmany_donvi], POST=[deny_request], PUT_SINGLE=[deny_request], PUT_MANY=[deny_request], DELETE_MANY=[deny_request], DELETE_SINGLE=[deny_request]),
#     postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
#     collection_name='danhmuc_sanpham_filter')


apimanager.create_api(DanhMucDuocLieu,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_admin, pre_put_insert_tenkhongdau], PUT_SINGLE=[validate_admin, pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_admin]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='danhmuc_duoclieu')

apimanager.create_api(DanhMucDuocLieu,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[deny_request], GET_MANY=[validate_user], POST=[deny_request], PUT_SINGLE=[deny_request], PUT_MANY=[deny_request], DELETE_MANY=[deny_request], DELETE_SINGLE=[deny_request]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='danhmuc_duoclieu_filter')


# apimanager.create_api(DanhMucSanPham,
#     methods=['GET', 'POST', 'DELETE', 'PUT'],
#     url_prefix='/api/v1',
#     preprocess=dict(GET_SINGLE=[ validate_token_donvi_get_put_delete_single], GET_MANY=[validate_user], POST=[validate_user, pre_post_insert_donvi,pre_put_insert_tenkhongdau], PUT_SINGLE=[ validate_token_donvi_get_put_delete_single, pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[ validate_token_donvi_get_put_delete_single,  pre_delete]),
#     postprocess=dict(GET_SINGLE=[get_single_object_donvi], GET_MANY=[postprocess_stt, get_many_object_donvi], POST=[], PUT_SINGLE=[]),
#     collection_name='danhmuc_sanpham_filter',
#     include_columns=['id', 'ten_sanpham', 'ten_khoa_hoc', 'tenkhongdau' , 'ma_viettat', 'ma_sanpham', 'bophan_sudung'])


apimanager.create_api(DanhMucBoPhanSanPham,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_admin, pre_put_insert_tenkhongdau], PUT_SINGLE=[validate_admin, pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_admin]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='bophan')


apimanager.create_api(TieuChuanChatLuong,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_admin, pre_put_insert_tenkhongdau], PUT_SINGLE=[validate_admin, pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='tieuchuan')

apimanager.create_api(DMCayThuoc,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_admin, pre_put_insert_tenkhongdau], PUT_SINGLE=[validate_admin, pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_admin, pre_delete]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='caythuoc')

apimanager.create_api(DMVungTrongDuocLieu,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_admin, pre_put_insert_tenkhongdau, preprocess_convert_diachi], PUT_SINGLE=[validate_admin, pre_put_insert_tenkhongdau, preprocess_convert_diachi], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_admin, pre_delete]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='vungtrong_duoclieu')

apimanager.create_api(BaiThuocYDCT,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_admin, pre_put_insert_tenkhongdau, preprocess_convert_diachi], PUT_SINGLE=[validate_admin, pre_put_insert_tenkhongdau, preprocess_convert_diachi], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_admin, pre_delete]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='baithuoc_ydct')

apimanager.create_api(DanhMucCuaKhau,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_admin, pre_put_insert_tenkhongdau, preprocess_convert_diachi], PUT_SINGLE=[validate_admin, pre_put_insert_tenkhongdau, preprocess_convert_diachi], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_admin, pre_delete]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='cuakhau')

apimanager.create_api(DanhMucCuaKhau,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_admin, pre_put_insert_tenkhongdau], PUT_SINGLE=[validate_admin, pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    include_columns= ['id', 'ten_cuakhau', 'tenkhongdau'],
    collection_name='cuakhau_filter')

apimanager.create_api(DanhMucDonViSanXuatNhapKhau,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_admin, pre_put_insert_tenkhongdau], PUT_SINGLE=[validate_admin, pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='donvisanxuat_nhapkhau')

apimanager.create_api(DanhMucCungUngNuocNgoai,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_admin, pre_put_insert_tenkhongdau], PUT_SINGLE=[validate_admin, pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='danhmuc_cungung_nuoc_ngoai')

apimanager.create_api(CoSoDaoTaoYHCT,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_admin, pre_put_insert_tenkhongdau,preprocess_convert_diachi], PUT_SINGLE=[validate_admin, pre_put_insert_tenkhongdau,preprocess_convert_diachi], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_admin, pre_delete]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='coso_daotao')

apimanager.create_api(DuocLieuNuoiTrong,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[validate_user], POST=[validate_admin, pre_put_insert_tenkhongdau], PUT_SINGLE=[validate_admin, pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_admin, pre_delete]),
    postprocess=dict(GET_MANY=[postprocess_stt, get_many_object_donvi], GET_SINGLE=[get_single_object_donvi]),
    collection_name='duoclieu')



@app.route('/api/v2/danhmuc_nhacungcap', methods=['GET'])
def get_danhmuc_nhacungcap(request):
    uid = current_uid(request)
    if uid is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)

    search_text = request.args.get('query_filter')

    query_filter = db.session.query(DanhMucNhaCungCap).filter(DanhMucNhaCungCap.deleted == False, DanhMucNhaCungCap.trangthai == 1)
    if search_text is not None and search_text.strip() != "":
        query_filter = query_filter.filter(or_(
            DanhMucNhaCungCap.tenkhongdau.ilike(f"%{convert_text_khongdau(search_text)}%"),
            DanhMucNhaCungCap.ma_donvi.ilike(f"%{search_text.strip()}%"),
            DanhMucNhaCungCap.ten_donvi.ilike(f"%{search_text}%")
        ))

    query_filter = query_filter.filter(~DanhMucNhaCungCap.ma_donvi.in_(db.session.query(DonViCungUng.ma_donvi).filter(DonViCungUng.deleted == False)))

    danh_muc_nhacungcap_list = query_filter.limit(30).all()

    result = []
    for danh_muc_nhacungcap in danh_muc_nhacungcap_list:
        danh_muc_nhacungcap_data = {
            'id': danh_muc_nhacungcap.id,
            'ten_donvi': danh_muc_nhacungcap.ten_donvi,
            'ma_donvi': danh_muc_nhacungcap.ma_donvi,
            'email': danh_muc_nhacungcap.email,
            'dienthoai': danh_muc_nhacungcap.dienthoai,
            'ngay_capphep': danh_muc_nhacungcap.ngay_capphep,
            'xaphuong_id': danh_muc_nhacungcap.xaphuong_id,
            'xaphuong': danh_muc_nhacungcap.xaphuong,
            'quanhuyen_id': danh_muc_nhacungcap.quanhuyen_id,
            'quanhuyen': danh_muc_nhacungcap.quanhuyen,
            'tinhthanh_id':danh_muc_nhacungcap.tinhthanh_id,
            'tinhthanh': danh_muc_nhacungcap.tinhthanh,
            'sonha_tenduong': danh_muc_nhacungcap.sonha_tenduong,
            'diachi': danh_muc_nhacungcap.diachi,
            'trangthai': danh_muc_nhacungcap.trangthai,
            'tenkhongdau': danh_muc_nhacungcap.tenkhongdau
        }
        result.append(danh_muc_nhacungcap_data)

    response_data = {
        'objects': result
    }

    return json(response_data)

@app.route('/api/v2/donvi_cungung', methods=['GET'])
def get_donvi_cungung(request):
    uid = current_uid(request)
    if uid is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)

    search_text = request.args.get('query')

    query = db.session.query(DonViCungUng).filter(DonViCungUng.deleted == False, DonViCungUng.trangthai == 1)
    if search_text is not None and search_text.strip() != "":
        query = query.filter(or_(
            DonViCungUng.tenkhongdau.ilike(f"%{convert_text_khongdau(search_text)}%"),
            DonViCungUng.ma_donvi.ilike(f"%{search_text.strip()}%"),
            DonViCungUng.ten_donvi.ilike(f"%{search_text}%")
        ))

    donvi_cungung_list = query.limit(30).all()

    result = []
    for donvi_cungung in donvi_cungung_list:
        danh_muc_nhacungcap_data = {
            'id': donvi_cungung.id,
            'ten_donvi': donvi_cungung.ten_donvi,
            'ma_donvi': donvi_cungung.ma_donvi,
            'tenkhongdau': donvi_cungung.tenkhongdau
        }
        result.append(danh_muc_nhacungcap_data)

    response_data = {
        'objects': result
    }

    return json(response_data)
@app.route('/api/v2/danhmucsanpham', methods=['GET'])
def get_danhmuc_nhacungcap(request):
    uid = current_uid(request)
    if uid is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)

    search_text = request.args.get('query_filter')

    query_filter = db.session.query(DanhMucSanPham).filter(DanhMucSanPham.deleted == False)
    if search_text is not None and search_text.strip() != "":
        query_filter = query_filter.filter(or_(
            DanhMucSanPham.tenkhongdau.ilike(f"%{convert_text_khongdau(search_text)}%"),
            DanhMucSanPham.ma_sanpham.ilike(f"%{search_text.strip()}%"),
            DanhMucSanPham.ten_sanpham.ilike(f"%{search_text}%")
        ))

    query_filter = query_filter.filter(DanhMucSanPham.id_nhacungcap == DonViCungUng.id)

    danh_muc_sanpham_list = query_filter.limit(30).all()

    result = []
    for danh_muc_sanpham in danh_muc_sanpham_list:
        danh_muc_sanpham_data = {
            'id': danh_muc_sanpham.id,
            'ten_sanpham': danh_muc_sanpham.ten_sanpham,
            'ma_sanpham': danh_muc_sanpham.ma_sanpham,
            'tenkhongdau_sanpham': danh_muc_sanpham.tenkhongdau,
            'id_nhacungcap': danh_muc_sanpham.id_nhacungcap,
            'ma_nhacungcap': danh_muc_sanpham.ma_nhacungcap,
            'ten_nhacungcap': danh_muc_sanpham.ten_nhacungcap
        }
        result.append(danh_muc_sanpham_data)

    response_data = {
        'objects': result
    }

    return json(response_data)


@app.route('/api/v2/danhmuc_sanpham', methods=['GET'])
def get_sanpham_donvicungung(request):
    uid = current_uid(request)
    if uid is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)

    query_filter = db.session.query(DanhMucSanPham).filter(
        DanhMucSanPham.id_nhacungcap == DonViCungUng.id,
        DanhMucSanPham.deleted == False
    )

    search_text = request.args.get('query_filter')
    if search_text is not None and search_text.strip() != "":
        query_filter = query_filter.filter(or_(
            DanhMucSanPham.tenkhongdau_sanpham.ilike(f"%{convert_text_khongdau(search_text)}%"),
            DanhMucSanPham.ma_sanpham.ilike(f"%{search_text.strip()}%"),
            DanhMucSanPham.ten_sanpham.ilike(f"%{search_text}%")
        ))

    sanpham_donvicungung_list = query_filter.limit(30).all()

    result = []
    for sanpham_donvicungung in sanpham_donvicungung_list:
        sanpham_data = {
            'id': sanpham_donvicungung.id,
            'ten_sanpham': sanpham_donvicungung.ten_sanpham,
            'ma_sanpham': sanpham_donvicungung.ma_sanpham,
            'tenkhongdau_sanpham': sanpham_donvicungung.tenkhongdau,
            'id_nhacungcap': sanpham_donvicungung.id_nhacungcap,
            'ma_nhacungcap': sanpham_donvicungung.ma_nhacungcap,
            'ten_nhacungcap': sanpham_donvicungung.ten_nhacungcap
        }
        result.append(sanpham_data)

    response_data = {
        'objects': result
    }

    return json(response_data)
