from application.extensions import apimanager
from gatco_restapi.helpers import to_dict
from application.server import app
from gatco.response import json
from datetime import datetime
import ujson
import asyncio
import aiohttp
import time
from sqlalchemy.orm.attributes import flag_modified
from sqlalchemy import or_, and_, desc, asc

from application.controllers.helpers.helper_common import *
from application.database import db
from application.models.models import AppInfo
from application.models.model_donvi import DonVi, GiayChungNhanCO, PhieuKiemNghiem
from application.models.model_duoclieu import BaiThuocYDCT
from application.models.model_sanpham import *

# from application.models.model_quanlykho import *
from application.models.model_donvi import *
from application.extensions import init_extensions, auth
from application.controllers.helpers.helper_decorator import validate_authen_appinfo, preprocess_getmany_appapi
from application.models.model_sanpham import *
from application.models.models_tintuc import *
from application.models.model_duoclieu import DMVungTrongDuocLieu
import xlrd
import os
import math

def generate_token(uid, expire_time=7200):
    token =  binascii.hexlify(uuid.uuid4().bytes).decode()
    p = redisdb.pipeline()
    p.set("sessions:" + token, uid)
    p.expire("sessions:" + token,  expire_time)
    p.execute()
    #user_id = redisdb.get("sessions:" + token).decode('utf8')
    return token

@app.route('/app_api/v1/token', methods=['POST'])
async def get_token(request):
    auth_header = request.headers.get("X-Auth")
    if auth_header is None or auth_header != "TICHHOP-NENTANG":
        return json({'error_code': -1, 'error_message':u'Không có quyền truy cập'},status=520)
    appkey = request.json.get("appkey", None)
    password = request.json.get("password", None)
    if appkey is None or password is None:
        return json({'error_code':-1, 'error_message':u'Tài khoản ứng dụng hoặc mật khẩu không đúng, vui lòng kiểm tra lại!'}, status=520)
    appInfo = db.session.query(AppInfo).filter(AppInfo.appkey == appkey).first()
    if (appInfo is not None) and auth.verify_password(password, appInfo.password, appInfo.salt):
        token = generate_token(appkey, 86400)
        return json({"token":token,"error_code":0, "error_message":"Thành công"}, status=200)
    else:
        return json({'error_code':-1, 'error_message':u'Tài khoản ứng dụng hoặc mật khẩu không đúng, vui lòng kiểm tra lại!'}, status=520)


# API danh sách tác giả
@app.route('/app_api/v1/news/author', methods=['GET'])
@validate_authen_appinfo()
async def get_authors(request, donvi):
    data = request.args
    max_results_per_page = 50
    results_per_page = int(request.args.get('results_per_page', 30))
    page_num = int(request.args.get('page', 1))
    if results_per_page > max_results_per_page:
        results_per_page = max_results_per_page
    offset = (page_num - 1) * results_per_page
    
    query_filter = db.session.query(Author).filter(
        Author.donvi_id == donvi.id,
        Author.deleted == False
    )

    num_results = query_filter.count()
    danhsach = query_filter.order_by(asc(Author.created_at)).limit(results_per_page).offset(offset).all()
    objects = []
    for item in danhsach:
        objects.append(to_dict(item))

    total_pages = int(math.ceil(num_results / results_per_page))
    return json({"page": page_num, "total_pages":total_pages, "num_results":num_results, "objects":objects}, status=200)


# API danh sách chuyên mục
@app.route('/app_api/v1/news/category', methods=['GET'])
@validate_authen_appinfo()
async def get_categories(request, donvi):
    data = request.args
    max_results_per_page = 50
    results_per_page = int(request.args.get('results_per_page', 30))
    page_num = int(request.args.get('page', 1))
    if results_per_page > max_results_per_page:
        results_per_page = max_results_per_page
    offset = (page_num - 1) * results_per_page
    
    query_filter = db.session.query(Category).filter(
        Category.donvi_id == donvi.id,
        Category.deleted == False
    )

    num_results = query_filter.count()
    danhsach = query_filter.order_by(asc(Category.created_at)).limit(results_per_page).offset(offset).all()
    objects = []
    for item in danhsach:
        objects.append(to_dict(item))

    total_pages = int(math.ceil(num_results / results_per_page))
    return json({"page": page_num, "total_pages":total_pages, "num_results":num_results, "objects":objects}, status=200)


# API danh sách bài viết
@app.route('/app_api/v1/news/post', methods=['GET'])
@validate_authen_appinfo()
async def get_list_post(request, donvi):
    data = request.args
    max_results_per_page = 50
    results_per_page = int(request.args.get('results_per_page', 30))
    page_num = int(request.args.get('page', 1))
    if results_per_page > max_results_per_page:
        results_per_page = max_results_per_page
    offset = (page_num - 1) * results_per_page
    
    query_filter = db.session.query(Post).filter(
        Post.donvi_id == donvi.id,
        Post.deleted == False
    )

    num_results = query_filter.count()
    danhsach = query_filter.order_by(asc(Post.created_at)).limit(results_per_page).offset(offset).all()
    objects = []
    for item in danhsach:
        objects.append(to_dict(item))

    total_pages = int(math.ceil(num_results / results_per_page))
    return json({"page": page_num, "total_pages":total_pages, "num_results":num_results, "objects":objects}, status=200)


# API danh sách bài viết đang xuất bản
@app.route('/app_api/v1/news/post_publish', methods=['GET'])
@validate_authen_appinfo()
async def get_list_post_publish(request, donvi):
    data = request.args
    max_results_per_page = 50
    results_per_page = int(request.args.get('results_per_page', 30))
    page_num = int(request.args.get('page', 1))
    if results_per_page > max_results_per_page:
        results_per_page = max_results_per_page
    offset = (page_num - 1) * results_per_page
    
    query_filter = db.session.query(PostPublish).filter(
        PostPublish.donvi_id == donvi.id,
        PostPublish.status == 6,
        PostPublish.deleted == False
    )

    num_results = query_filter.count()
    danhsach = query_filter.order_by(asc(PostPublish.created_at)).limit(results_per_page).offset(offset).all()
    objects = []
    for item in danhsach:
        objects.append(to_dict(item))

    total_pages = int(math.ceil(num_results / results_per_page))
    return json({"page": page_num, "total_pages":total_pages, "num_results":num_results, "objects":objects}, status=200)


# api dong bo nhom san pham
@app.route('/app_api/v1/nhom_sanpham', methods=['POST'])
@validate_authen_appinfo()
async def sync_product(request, donvi):
    data = request.json
    danhsach_nhom_sanpham = data.get("danhsach_nhom_sanpham")

    total_update = 0
    total_create = 0
    total_error = 0
    list_error = []

    if isinstance(danhsach_nhom_sanpham, list) is False:
        return json({'error_code': "PARAM_ERROR", 'error_message':u'Tham số không hợp lệ. Vui lòng thử lại '}, status=520)

    for nhomsanpham in danhsach_nhom_sanpham:
        ma_nhom = nhomsanpham.get("ma_nhom", None)
        ten_nhom = nhomsanpham.get("ten_nhom", None)
        if ma_nhom is None or str(ma_nhom).strip() == "":
            total_error += 1
            nhomsanpham['lydo_loi'] = "Mã nhóm sản phẩm không được để trống"
            list_error.append(nhomsanpham)
            continue
        elif ten_nhom is None or str(ten_nhom).strip() == "":
            total_error += 1
            nhomsanpham['lydo_loi'] = "Tên nhóm sản phẩm không được để trống"
            list_error.append(nhomsanpham)
            continue

        type_update = create_danhmuc_nhomsanpham(nhomsanpham, donvi)
        if 'update' in type_update and type_update['update'] is True:
            total_update += 1
        elif 'create' in type_update and type_update['create'] is True:
            total_create += 1
    return json({"total_create": total_create, "total_update": total_update, "total_error": total_error, "list_error": list_error}, status=200)


def create_danhmuc_nhomsanpham(nhomsanpham, donvi):
    create = False

    ma_nhom = nhomsanpham.get("ma_nhom", None)
    check_nhomsanpham = db.session.query(DanhMucNhomSanPham).filter(DanhMucNhomSanPham.deleted == False, DanhMucNhomSanPham.ma_nhom == ma_nhom).first()
    if check_nhomsanpham is None:
        check_nhomsanpham = DanhMucNhomSanPham()
        check_nhomsanpham.id = default_uuid()
        create = True

    check_nhomsanpham.ma_nhom = nhomsanpham.get("ma_nhom", None)
    check_nhomsanpham.ten_nhom = nhomsanpham.get("ten_nhom", None)
    check_nhomsanpham.tenkhongdau = convert_text_khongdau(check_nhomsanpham.ten_nhom)
    check_nhomsanpham.mota = nhomsanpham.get("mota", None)

    check_nhomsanpham.trangthai = 1
    check_nhomsanpham.donvi_id = donvi.id
    
    if create is True:
        db.session.add(check_nhomsanpham)

    db.session.commit()

    if create is True:
        return {"create": True}
    return {"update": True}

@app.route('/app_api/v1/danhsach_nhom_sanpham', methods=['GET'])
@validate_authen_appinfo()
async def get_products(request, donvi):
    data = request.args

    results_per_page = int(request.args.get('results_per_page', 30))
    page_num = int(request.args.get('page', 1))
    offset = (page_num - 1) * results_per_page

    danhsach = db.session.query(DanhMucNhomSanPham.ma_nhom,
        DanhMucNhomSanPham.ten_nhom,
        DanhMucNhomSanPham.mota,
        DanhMucNhomSanPham.trangthai,
    ).filter(DanhMucNhomSanPham.deleted == False)

    num_results = danhsach.count()
    danhsach = danhsach.order_by(asc(DanhMucNhomSanPham.created_at)).limit(results_per_page).offset(offset).all()
    objects = [product._asdict() for product in danhsach]

    total_pages = int(math.ceil(num_results / results_per_page))
    return json({"page": page_num,"total_pages":total_pages,"num_results":num_results, "objects":objects},status=200)
    

# api dong bo san pham
@app.route('/app_api/v1/sanpham', methods=['POST'])
@validate_authen_appinfo()
async def sync_product(request, donvi):
    data = request.json
    list_product = data.get("danhsach_sanpham")

    total_update = 0
    total_create = 0
    total_error = 0
    list_error = []

    if isinstance(list_product, list) is False:
        return json({'error_code': "PARAM_ERROR", 'error_message':u'Tham số không hợp lệ. Vui lòng thử lại '}, status=520)

    for product in list_product:
        ma_sanpham = product.get("ma_sanpham", None)
        if ma_sanpham is None:
            total_error += 1
            product['lydo_loi'] = "Mã sản phẩm không được để trống"
            list_error.append(product)
            continue

        type_update = create_danhmuc_sanpham(product, donvi)
        if 'update' in type_update and type_update['update'] is True:
            total_update += 1
        elif 'create' in type_update and type_update['create'] is True:
            total_create += 1
    return json({"total_create": total_create, "total_update": total_update, "tottal_error": total_error, "list_error": list_error}, status=200)


def create_danhmuc_sanpham(product, donvi):
    create = False

    ma_sanpham = product.get("ma_sanpham", None)
    check_product = db.session.query(DanhMucSanPham).filter(DanhMucSanPham.deleted == False, DanhMucSanPham.ma_sanpham == ma_sanpham, DanhMucSanPham.donvi_id == donvi.id).first()
    if check_product is None:
        check_product = DanhMucSanPham()
        check_product.id = default_uuid()
        create = True

    check_product.ma_sanpham = product.get("ma_sanpham", None)
    check_product.ma_bhxh =  product.get("ma_bhxh", None)
    check_product.ma_boyte =  product.get("ma_boyte", None)
    check_product.ma_sanxuat =  product.get("ma_sanxuat", None)

    check_product.ten_sanpham = product.get("ten_sanpham", None)
    check_product.ten_khoa_hoc = product.get("ten_khoa_hoc", None)
    check_product.ten_trung_quoc = product.get("ten_trung_quoc", None)
    check_product.tenkhongdau = product.get("tenkhongdau", None)
    check_product.ma_nhom = product.get("ma_nhom", None)
    check_product.ten_nhom = product.get("ten_nhom", None)
    check_product.mota =  product.get("mota", None)
    check_product.hang_sanxuat = product.get("hang_sanxuat", None)
    check_product.ma_hang_sanxuat = product.get("ma_hang_sanxuat", None)
    check_product.nuoc_sanxuat = product.get("nuoc_sanxuat", None)
    check_product.ma_nuoc_sanxuat = product.get("ma_nuoc_sanxuat", None)
    check_product.loai_sanpham = product.get("loai_sanpham", None)
    check_product.donvitinh =  product.get("donvitinh", None)
    check_product.bophan_sudung =  product.get("bophan_sudung", None)
    check_product.ma_hanghoa =  product.get("ma_hanghoa", None)
    check_product.ma_viettat =  product.get("ma_viettat", None)
    check_product.ma_danhmuc =  product.get("ma_danhmuc", None)
    check_product.thuoc_ho =  product.get("thuoc_ho", None)
    check_product.vi_phau =  product.get("vi_phau", None)
    check_product.bot =  product.get("bot", None)
    check_product.dinh_tinh =  product.get("dinh_tinh", None)
    check_product.do_am =  product.get("do_am", None)
    check_product.tro_toanphan =  product.get("tro_toanphan", None)
    check_product.tro_khongtan_trongacid =  product.get("tro_khongtan_trongacid", None)
    check_product.chiso_acid =  product.get("chiso_acid", None)
    check_product.chiso_carbonyl =  product.get("chiso_carbonyl", None)
    check_product.chiso_peroxyd =  product.get("chiso_peroxyd", None)
    check_product.tyle_vun_nat =  product.get("tyle_vun_nat", None)
    check_product.tap_chat =  product.get("tap_chat", None)
    check_product.kimloainang =  product.get("kimloainang", None)
    check_product.chat_chiet_trong_sanpham =  product.get("chat_chiet_trong_sanpham", None)
    check_product.dinh_luong =  product.get("dinh_luong", None)
    check_product.che_bien =  product.get("che_bien", None)
    check_product.bao_che =  product.get("bao_che", None)
    check_product.bao_quan =  product.get("bao_quan", None)
    check_product.tinh_vi_quy_kinh =  product.get("tinh_vi_quy_kinh", None)
    check_product.congnang_chutri =  product.get("congnang_chutri", None)
    check_product.cachdung_lieuluong =  product.get("cachdung_lieuluong", None)
    check_product.kieng_ky =  product.get("kieng_ky", None)
    check_product.chungtu_dinhkem =  product.get("chungtu_dinhkem", None)
    check_product.thumbnail =  product.get("thumbnail", None)
    check_product.hinhanh=  product.get("hinhanh", None)

    check_product.trangthai =  product.get("trangthai", None)
    check_product.donvi_id = donvi.id
    
    if create is True:
        db.session.add(check_product)

    db.session.commit()

    if create is True:
        return {"create": True}
    return {"update": True}

@app.route('/app_api/v1/danhsach_sanpham', methods=['GET'])
@validate_authen_appinfo()
async def get_products(request, donvi):
    data = request.args

    results_per_page = int(request.args.get('results_per_page', 30))
    page_num = int(request.args.get('page', 1))
    offset = (page_num - 1) * results_per_page

    danhsach = db.session.query(DanhMucSanPham).filter(DanhMucSanPham.donvi_id == donvi.id)

    num_results = danhsach.count()
    danhsach = danhsach.order_by(asc(DanhMucSanPham.created_at)).limit(results_per_page).offset(offset).all()
    objects = []
    for product in danhsach:
        objects.append(to_dict(product))

    total_pages = int(math.ceil(num_results / results_per_page))
    return json({"page": page_num,"total_pages":total_pages,"num_results":num_results, "objects":objects},status=200)
    
# api dong bo don vi cung ung
@app.route('/app_api/v1/nha_cungcap', methods=['POST'])
@validate_authen_appinfo()
async def dongbo_nhacungcap(request, donvi):
    data = request.json
    list_provider = data.get("danhsach_nhacungcap")

    total_update = 0
    total_create = 0
    total_error = 0
    list_error = []

    if isinstance(list_provider, list) is False:
        return json({'error_code': "PARAM_ERROR", 'error_message':u'Tham số không hợp lệ. Vui lòng thử lại '}, status=520)

    for provider in list_provider:
        ma_donvi = provider.get("ma_donvi", None)
        ten_donvi = provider.get("ten_donvi", None)
        if ma_donvi is None or str(ma_donvi).strip() == "":
            total_error += 1
            provider['lydo_loi'] = "Mã đơn vị cung cấp không được để trống"
            list_error.append(provider)
            continue
        elif ten_donvi is None or str(ten_donvi).strip() == "":
            total_error += 1
            provider['lydo_loi'] = "Tên đơn vị cung cấp không được để trống"
            list_error.append(provider)
            continue

        type_update = create_provider_organization(provider, donvi)
        if 'update' in type_update and type_update['update'] is True:
            total_update += 1
        elif 'create' in type_update and type_update['create'] is True:
            total_create += 1
    return json({"total_create": total_create, "total_update": total_update, "tottal_error": total_error, "list_error": list_error}, status=200)

def create_provider_organization(provider, donvi):
    create = False

    ma_donvi = provider.get("ma_donvi", None)
    check_provider = db.session.query(DonViCungUng).filter(DonViCungUng.deleted == False, DonViCungUng.ma_donvi == ma_donvi, DonViCungUng.donvi_id == donvi.id).first()
    if check_provider is None:
        check_provider = DonViCungUng()
        check_provider.id = default_uuid()
        create = True

    check_provider.ten_donvi = provider.get("ten_donvi", None)
    check_provider.tenkhongdau = convert_text_khongdau(check_provider.ten_donvi)
    check_provider.ma_donvi = provider.get("ma_donvi", None)
    check_provider.ngay_capphep = provider.get("ngay_capphep", None)
    check_provider.dienthoai = provider.get("dienthoai", None)
    check_provider.email = provider.get("email", None)
    check_provider.nguoilienlac_ten = provider.get("nguoilienlac_ten", None)
    check_provider.nguoilienlac_dienthoai = provider.get("nguoilienlac_dienthoai", None)
    check_provider.xaphuong_id = provider.get("xaphuong_id", None)
    check_provider.xaphuong = provider.get("xaphuong", None)
    check_provider.quanhuyen_id = provider.get("quanhuyen_id", None)
    check_provider.quanhuyen = provider.get("quanhuyen", None)
    check_provider.tinhthanh_id = provider.get("tinhthanh_id", None)
    check_provider.tinhthanh = provider.get("tinhthanh", None)
    check_provider.quocgia_id = provider.get("quocgia_id", None)
    check_provider.quocgia = provider.get("quocgia", None)
    check_provider.sonha_tenduong = provider.get("sonha_tenduong", None)
    check_provider.diachi = provider.get("diachi", None)

    check_provider.trangthai = 1
    check_provider.donvi_id = donvi.id
    
    if create is True:
        db.session.add(check_provider)

    db.session.commit()

    if create is True:
        return {"create": True}
    return {"update": True}


@app.route('/app_api/v1/danhsach_nha_cungcap', methods=['GET'])
@validate_authen_appinfo()
async def get_providers(request, donvi):
    data = request.args

    results_per_page = int(request.args.get('results_per_page', 30))
    page_num = int(request.args.get('page', 1))
    offset = (page_num - 1) * results_per_page

    danhsach = db.session.query(DonViCungUng).filter(DonViCungUng.donvi_id == donvi.id)

    num_results = danhsach.count()
    danhsach = danhsach.order_by(asc(DonViCungUng.created_at)).limit(results_per_page).offset(offset).all()
    objects = []
    for provider in danhsach:
        objects.append(to_dict(provider))

    total_pages = int(math.ceil(num_results / results_per_page))
    return json({"page": page_num,"total_pages":total_pages,"num_results":num_results, "objects":objects},status=200)
    

# API dong bo quoc gia
@app.route('/app_api/v1/quocgia', methods=['GET'])
@validate_authen_appinfo()
async def get_quocgia_filter(request, donvi):
    data = request.args

    results_per_page = int(request.args.get('results_per_page', 30))
    page_num = int(request.args.get('page', 1))
    offset = (page_num - 1) * results_per_page

    danhsach = db.session.query(
        QuocGia.id,
        QuocGia.ma,
        QuocGia.ten,
        QuocGia.tenkhongdau,
    ).filter(QuocGia.deleted == False)

    num_results = danhsach.count()
    danhsach = danhsach.order_by(asc(QuocGia.tenkhongdau)).limit(results_per_page).offset(offset).all()

    objects = [quocgia._asdict() for quocgia in danhsach]

    total_pages = int(math.ceil(num_results / results_per_page))
    return json({"page": page_num,"total_pages":total_pages,"num_results":num_results, "objects":objects},status=200)


# API dong bo tinh thanh 
@app.route('/app_api/v1/tinhthanh', methods=['GET'])
@validate_authen_appinfo()
async def get_tinhthanh_filter(request, donvi):
    danhsach = db.session.query(TinhThanh.ten,\
        TinhThanh.id,
        TinhThanh.ma,
        
        TinhThanh.tenkhongdau,
    ).filter(TinhThanh.deleted == False)

    num_results = danhsach.count()
    danhsach = danhsach.all()

    objects = [tinhthanh._asdict() for tinhthanh in danhsach]

    return json({"num_results":num_results, "objects":objects},status=200)

# API dong bo quan huyen
@app.route('/app_api/v1/quanhuyen', methods=['GET'])
@validate_authen_appinfo()
async def get_quanhuyen_filter(request, donvi):
    data = request.args
    tinhthanh_id = data.get('tinhthanh_id', "")

    danhsach = db.session.query(QuanHuyen.id,\
        QuanHuyen.ma,
        QuanHuyen.ten,
        QuanHuyen.tenkhongdau,
    ).filter(QuanHuyen.deleted == False)

    if tinhthanh_id is not None and str(tinhthanh_id).strip() != "":
        danhsach = danhsach.filter(QuanHuyen.tinhthanh_id == tinhthanh_id)

    num_results = danhsach.count()
    danhsach = danhsach.order_by(asc(QuanHuyen.ma)).all()

    objects = [quanhuyen._asdict() for quanhuyen in danhsach]

    return json({"objects":objects},status=200)

# API dong bo xa phuong
@app.route('/app_api/v1/xaphuong', methods=['GET'])
@validate_authen_appinfo()
async def get_xaphuong_filter(request, donvi):
    data = request.args
    quanhuyen_id = data.get('quanhuyen_id', "")

    danhsach = db.session.query(XaPhuong.id,\
        XaPhuong.ma,
        XaPhuong.ten,
        XaPhuong.tenkhongdau,
    ).filter(XaPhuong.deleted == False)

    if quanhuyen_id is not None and str(quanhuyen_id).strip() != "":
        danhsach = danhsach.filter(XaPhuong.quanhuyen_id == quanhuyen_id)

    danhsach = danhsach.order_by(asc(XaPhuong.ma)).all()

    objects = [xaphuong._asdict() for xaphuong in danhsach]

    return json({"objects":objects},status=200)

# API bai thuoc
@app.route('/app_api/v1/baithuoc_yduoc_cotruyen', methods=['GET'])
@validate_authen_appinfo()
async def get_baithuoc_filter(request, donvi):
    data = request.args

    results_per_page = int(request.args.get('results_per_page', 50))
    page_num = int(request.args.get('page', 1))
    offset = (page_num - 1) * results_per_page

    danhsach = db.session.query(BaiThuocYDCT).filter(BaiThuocYDCT.deleted == False)

    num_results = danhsach.count()
    danhsach = danhsach.order_by(asc(BaiThuocYDCT.tenkhongdau)).limit(results_per_page).offset(offset).all()

    # objects = [baithuoc._asdict() for baithuoc in danhsach]
    objects = [to_dict(baithuoc) for baithuoc in danhsach]

    total_pages = int(math.ceil(num_results / results_per_page))
    return json({"page": page_num,"total_pages":total_pages,"num_results":num_results, "objects":objects},status=200)

# API dong bo duoc lieu
@app.route('/app_api/v1/danhsach_duoclieu', methods=['POST'])
@validate_authen_appinfo()
async def danhsach_duoclieu(request, donvi):
    results_per_page = int(request.args.get('results_per_page', 50))
    page_num = int(request.args.get('page', 1))
    offset = (page_num - 1) * results_per_page

    danhsach = db.session.query(DanhMucDuoclieu).filter(DanhMucDuoclieu.deleted == False)

    num_results = danhsach.count()
    danhsach = danhsach.order_by(asc(DanhMucDuoclieu.created_at)).limit(results_per_page).offset(offset).all()

    objects = []
    for duoclieu in danhsach:
        objects.append(duoclieu._asdict())

    total_pages = int(math.ceil(num_results / results_per_page))
    return json({"page": page_num,"total_pages":total_pages,"num_results":num_results, "objects":objects},status=200)


# API chung nhan GACP
@app.route('/app_api/v1/sanpham-gacp', methods=['GET'])
@validate_authen_appinfo()
async def get_sanpham_gacp(request, donvi):
    results_per_page = int(request.args.get('results_per_page', 50))
    page_num = int(request.args.get('page', 1))
    offset = (page_num - 1) * results_per_page

    danhsach = db.session.query(SanPhamGACPDonVi.ma_sanpham,
        SanPhamGACPDonVi.ten_sanpham,
        SanPhamGACPDonVi.ten_khoa_hoc,
        SanPhamGACPDonVi.ten_thuong_mai,
        SanPhamGACPDonVi.ma_sanpham_donvi,
        SanPhamGACPDonVi.donvi_cungung_ma,
        SanPhamGACPDonVi.donvi_cungung_ten
    ).filter(SanPhamGACPDonVi.deleted == False)

    num_results = danhsach.count()
    danhsach = danhsach.limit(results_per_page).offset(offset).all()

    objects = [sanpham_gacp._asdict() for sanpham_gacp in danhsach]

    total_pages = int(math.ceil(num_results / results_per_page))
    return json({"page": page_num,"total_pages":total_pages,"num_results":num_results, "objects":objects},status=200)

############### SYNC SP NHAP KHAU ################

# API ADD SP NHAP KHAU
@app.route('/app_api/v1/sanpham-nhapkhau', methods=['POST'])
@validate_authen_appinfo()
async def sync_imported_product_(request, donvi):
    data = request.json
    danhsach_sanpham_nhapkhau = data.get("danhsach_sanpham_nhapkhau")

    total_update = 0
    total_create = 0
    total_error = 0
    list_error = []

    if isinstance(danhsach_sanpham_nhapkhau, list) == False:
        return json({'error_code': "PARAM_ERROR", 'error_message':u'Tham số không hợp lệ. Vui lòng thử lại '}, status=520)

    for sanpham_nhapkhau in danhsach_sanpham_nhapkhau:
        create = False

        ma_sanpham = sanpham_nhapkhau.get("ma_sanpham", None)
        check_sanpham = db.session.query(DanhMucSanPham).filter(DanhMucSanPham.deleted == False, DanhMucSanPham.ma_sanpham == ma_sanpham, DanhMucSanPham.donvi_id == donvi.id).first()
        if check_sanpham is None:
            # error
            total_error += 1
            sanpham_nhapkhau['lydo_loi'] = "Không tìm thấy mã sản phẩm trong danh mục"
            list_error.append(sanpham_nhapkhau)
            continue

        sanpham_nhapkhau_orm = db.session.query(SanPhamNhapKhauDonVi).filter(SanPhamNhapKhauDonVi.deleted == False, SanPhamNhapKhauDonVi.donvi_id == donvi.id, SanPhamNhapKhauDonVi.id_sanpham == check_sanpham.id).first()

        if sanpham_nhapkhau_orm is None:
            sanpham_nhapkhau_orm = SanPhamNhapKhauDonVi()
            sanpham_nhapkhau_orm.id = default_uuid()
            create = True
        
        sanpham_nhapkhau_orm.id_sanpham = check_sanpham.id
        sanpham_nhapkhau_orm.ma_sanpham = sanpham_nhapkhau.get("ma_sanpham", None)
        sanpham_nhapkhau_orm.ten_sanpham = sanpham_nhapkhau.get("ten_sanpham", None)
        sanpham_nhapkhau_orm.ten_khoa_hoc = sanpham_nhapkhau.get("ten_khoa_hoc", None)
        sanpham_nhapkhau_orm.tenkhongdau = convert_text_khongdau(sanpham_nhapkhau_orm.ten_sanpham)
        sanpham_nhapkhau_orm.ten_thuong_mai = sanpham_nhapkhau.get("ten_thuong_mai", None)
        sanpham_nhapkhau_orm.ma_sanpham_donvi = sanpham_nhapkhau.get("ma_sanpham_donvi", None)
        sanpham_nhapkhau_orm.quocgia_id = sanpham_nhapkhau.get("quocgia_id", None)
        # sanpham_nhapkhau_orm.quocgia = sanpham_nhapkhau.get("quocgia", None)
        # sanpham_nhapkhau_orm.donvi_cungung_id = sanpham_nhapkhau.get("donvi_cungung_id", None)
        sanpham_nhapkhau_orm.donvi_cungung_ma = sanpham_nhapkhau.get("donvi_cungung_ma", None)
        sanpham_nhapkhau_orm.donvi_cungung_ten = sanpham_nhapkhau.get("donvi_cungung_ten", None)
       
        sanpham_nhapkhau_orm.thoigian_dongbo = convert_timestamp_to_string(floor(time.time()), "%Y%m%d%H%M%S")
        sanpham_nhapkhau_orm.trangthai = 1
        sanpham_nhapkhau_orm.donvi_id = donvi.id    
        if create == True:
            db.session.add(sanpham_nhapkhau_orm)
            total_create += 1
        else:
            total_update += 1

    db.session.commit()

    return json({"total_create": total_create, "total_update": total_update, "total_error": total_error, "list_error": list_error}, status=200)

# API DELETE SP NHAP KHAU

# API GET MANY SP NHAU KHAU
@app.route('/app_api/v1/sanpham-nhapkhau', methods=['GET'])
@validate_authen_appinfo()
async def get_sanpham_nhapkhau(request, donvi):
    results_per_page = int(request.args.get('results_per_page', 50))
    page_num = int(request.args.get('page', 1))
    offset = (page_num - 1) * results_per_page

    danhsach = db.session.query(SanPhamNhapKhauDonVi.id,
                                SanPhamNhapKhauDonVi.ma_sanpham,
                                SanPhamNhapKhauDonVi.ten_sanpham,
                                SanPhamNhapKhauDonVi.ten_khoa_hoc,
                                SanPhamNhapKhauDonVi.ten_thuong_mai,
                                SanPhamNhapKhauDonVi.donvi_cungung_ma,
                                SanPhamNhapKhauDonVi.donvi_cungung_ten,
                                SanPhamNhapKhauDonVi.quocgia_id
    ).filter(SanPhamNhapKhauDonVi.deleted == False, SanPhamNhapKhauDonVi.donvi_id == donvi.id)

    num_results = danhsach.count()
    danhsach = danhsach.limit(results_per_page).offset(offset).all()

    objects = []
    for sanpham_nhapkhau in danhsach:
        objects.append(sanpham_nhapkhau._asdict())

    total_pages = int(math.ceil(num_results / results_per_page))
    return json({"page": page_num,"total_pages":total_pages,"num_results":num_results, "objects":objects},status=200)

# API GET SINGLE SP NHAP KHAU
@app.route('/app_api/v1/sanpham-nhapkhau/<ma_sanpham>', methods=['GET'])
@validate_authen_appinfo()
async def get_single_sanpham_nhapkhau(request, donvi, ma_sanpham=None):
    if ma_sanpham is None:
        return json({"error_code": "PARAM_ERROR", "error_message": "Tham số không hợp lệ"}, status=200)
    
    sanpham_nhapkhau = db.session.query(SanPhamNhapKhauDonVi.id,
                                        SanPhamNhapKhauDonVi.ma_sanpham,
                                        SanPhamNhapKhauDonVi.ten_sanpham,
                                        SanPhamNhapKhauDonVi.ten_khoa_hoc,
                                        SanPhamNhapKhauDonVi.ten_thuong_mai, 
                                        SanPhamNhapKhauDonVi.donvi_cungung_ma,
                                        SanPhamNhapKhauDonVi.donvi_cungung_ten,
                                        SanPhamNhapKhauDonVi.quocgia_id
    ).filter(SanPhamNhapKhauDonVi.deleted == False, SanPhamNhapKhauDonVi.donvi_id == donvi.id, SanPhamNhapKhauDonVi.ma_sanpham == ma_sanpham).first()
    if sanpham_nhapkhau is None:
        return json({"error_code": "NOT_FOUND", "error_message": "Không tìm thấy sản phẩm nhập khẩu"}, status=200)

    return json(sanpham_nhapkhau._asdict(), status=200)

############### END SYNC SP NHAP KHAU ################

############### START SYNC SP VI PHAM ################

# API ADD SP VI PHAM
@app.route('/app_api/v1/sanpham-vipham', methods=['POST'])
@validate_authen_appinfo()
async def sync_sanpham_vipham(request, donvi):
    data = request.json
    danhsach_sanpham_vipham = data.get("danhsach_sanpham_vipham")

    total_update = 0
    total_create = 0
    total_error = 0
    list_error = []

    if isinstance(danhsach_sanpham_vipham, list) == False:
        return json({'error_code': "PARAM_ERROR", 'error_message':u'Tham số không hợp lệ. Vui lòng thử lại '}, status=520)

    for sanpham_vipham in danhsach_sanpham_vipham:
        create = False

        ma_sanpham = sanpham_vipham.get("ma_sanpham", None)
        check_sanpham = db.session.query(DanhMucSanPham).filter(DanhMucSanPham.deleted == False, DanhMucSanPham.ma_sanpham == ma_sanpham, DanhMucSanPham.donvi_id == donvi.id).first()
        if check_sanpham is None:
            # error
            total_error += 1
            sanpham_vipham['lydo_loi'] = "Không tìm thấy mã sản phẩm trong danh mục"
            list_error.append(sanpham_vipham)
            continue

        sanpham_vipham_orm = db.session.query(SanPhamViPhamDonVi).filter(SanPhamViPhamDonVi.deleted == False, SanPhamViPhamDonVi.donvi_id == donvi.id, SanPhamNhapKhauDonVi.id_sanpham == check_sanpham.id).first()

        if sanpham_vipham_orm is None:
            sanpham_vipham_orm = SanPhamViPhamDonVi()
            sanpham_vipham_orm.id = default_uuid()
            create = True
        
        sanpham_vipham_orm.id_sanpham = check_sanpham.id
        sanpham_vipham_orm.ma_sanpham = sanpham_vipham.get("ma_sanpham", None)
        sanpham_vipham_orm.ten_sanpham = sanpham_vipham.get("ten_sanpham", None)
        sanpham_vipham_orm.ten_khoa_hoc = sanpham_vipham.get("ten_khoa_hoc", None)
        sanpham_vipham_orm.tenkhongdau = convert_text_khongdau(sanpham_vipham_orm.ten_sanpham)
        sanpham_vipham_orm.ten_thuong_mai = sanpham_vipham.get("ten_thuong_mai", None)
        sanpham_vipham_orm.ma_sanpham_donvi = sanpham_vipham.get("ma_sanpham_donvi", None)
        sanpham_vipham_orm.noidung_vipham = sanpham_vipham.get("noidung_vipham", None)
        sanpham_vipham_orm.hinhthuc_xuphat = sanpham_vipham.get("hinhthuc_xuphat", None)
        # sanpham_vipham_orm.donvi_cungung_id = sanpham_vipham.get("", None)
        sanpham_vipham_orm.donvi_cungung_ma = sanpham_vipham.get("donvi_cungung_ma", None)
        sanpham_vipham_orm.donvi_cungung_ten = sanpham_vipham.get("donvi_cungung_ten", None)

        sanpham_vipham_orm.thoigian_dongbo = convert_timestamp_to_string(floor(time.time()), "%Y%m%d%H%M%S")
        sanpham_vipham_orm.trangthai = 1
        sanpham_vipham_orm.donvi_id = donvi.id    
        if create == True:
            db.session.add(sanpham_vipham_orm)
            total_create += 1
        else:
            total_update += 1

    db.session.commit()

    return json({"total_create": total_create, "total_update": total_update, "total_error": total_error, "list_error": list_error}, status=200)

# API DELETE SP VI PHAM

# API GET MANY SP VI PHAM
@app.route('/app_api/v1/sanpham-vipham', methods=['GET'])
@validate_authen_appinfo()
async def get_sanpham_vipham(request, donvi):
    results_per_page = int(request.args.get('results_per_page', 50))
    page_num = int(request.args.get('page', 1))
    offset = (page_num - 1) * results_per_page

    danhsach = db.session.query(SanPhamViPhamDonVi.id,
                                SanPhamViPhamDonVi.ma_sanpham,
                                SanPhamViPhamDonVi.ten_sanpham,
                                SanPhamViPhamDonVi.ten_khoa_hoc,
                                SanPhamViPhamDonVi.ten_thuong_mai,
                                SanPhamViPhamDonVi.donvi_cungung_ma,
                                SanPhamViPhamDonVi.donvi_cungung_ten,
    ).filter(SanPhamViPhamDonVi.deleted == False, SanPhamViPhamDonVi.donvi_id == donvi.id)

    num_results = danhsach.count()
    danhsach = danhsach.limit(results_per_page).offset(offset).all()

    objects = [sanpham_vipham._asdict() for sanpham_vipham in danhsach]

    total_pages = int(math.ceil(num_results / results_per_page))
    return json({"page": page_num,"total_pages":total_pages,"num_results":num_results, "objects":objects},status=200)

# API GET SINGLE SP VI PHAM
@app.route('/app_api/v1/sanpham-vipham/<ma_sanpham>', methods=['GET'])
@validate_authen_appinfo()
async def get_single_sanpham_vipham(request, donvi, ma_sanpham=None):
    if ma_sanpham is None:
        return json({"error_code": "PARAM_ERROR", "error_message": "Tham số không hợp lệ"}, status=200)
    
    sanpham_vipham = db.session.query(SanPhamViPhamDonVi.id,
                                        SanPhamViPhamDonVi.ma_sanpham,
                                        SanPhamViPhamDonVi.ten_sanpham,
                                        SanPhamViPhamDonVi.ten_khoa_hoc,
                                        SanPhamViPhamDonVi.ten_thuong_mai, 
                                        SanPhamViPhamDonVi.donvi_cungung_ma,
                                        SanPhamViPhamDonVi.donvi_cungung_ten
    ).filter(SanPhamViPhamDonVi.deleted == False, SanPhamViPhamDonVi.donvi_id == donvi.id, SanPhamViPhamDonVi.ma_sanpham == ma_sanpham).first()
    if sanpham_vipham is None:
        return json({"error_code": "NOT_FOUND", "error_message": "Không tìm thấy sản phẩm vi phạm"}, status=200)

    return json(sanpham_vipham._asdict(), status=200)

############### END SYNC SP VI PHAM ################

############### START SYNC SP NOI BAT ################
# API ADD SP NOI BAT
@app.route('/app_api/v1/sanpham-noibat', methods=['POST'])
@validate_authen_appinfo()
async def sync_sanpham_noibat(request, donvi):
    data = request.json
    danhsach_sanpham_noibat = data.get("danhsach_sanpham_noibat")

    total_update = 0
    total_create = 0
    total_error = 0
    list_error = []

    if isinstance(danhsach_sanpham_noibat, list) == False:
        return json({'error_code': "PARAM_ERROR", 'error_message':u'Tham số không hợp lệ. Vui lòng thử lại '}, status=520)

    for sanpham_noibat in danhsach_sanpham_noibat:
        create = False

        ma_sanpham = sanpham_noibat.get("ma_sanpham", None)
        check_sanpham = db.session.query(DanhMucSanPham).filter(DanhMucSanPham.deleted == False, DanhMucSanPham.ma_sanpham == ma_sanpham, DanhMucSanPham.donvi_id == donvi.id).first()
        if check_sanpham is None:
            # error
            total_error += 1
            sanpham_noibat['lydo_loi'] = "Không tìm thấy mã sản phẩm trong danh mục"
            list_error.append(sanpham_noibat)
            continue

        sanpham_noibat_orm = db.session.query(SanPhamNoiBatDonVi).filter(SanPhamNoiBatDonVi.deleted == False, SanPhamNoiBatDonVi.donvi_id == donvi.id, SanPhamNoiBatDonVi.id_sanpham == check_sanpham.id).first()

        if sanpham_noibat_orm is None:
            sanpham_noibat_orm = SanPhamNoiBatDonVi()
            sanpham_noibat_orm.id = default_uuid()
            create = True
        
        sanpham_noibat_orm.id_sanpham = check_sanpham.id
        sanpham_noibat_orm.ma_sanpham = sanpham_noibat.get("ma_sanpham", None)
        sanpham_noibat_orm.ten_sanpham = sanpham_noibat.get("ten_sanpham", None)
        sanpham_noibat_orm.ten_khoa_hoc = sanpham_noibat.get("ten_khoa_hoc", None)
        sanpham_noibat_orm.tenkhongdau = convert_text_khongdau(sanpham_noibat_orm.ten_sanpham)
        sanpham_noibat_orm.ten_thuong_mai = sanpham_noibat.get("ten_thuong_mai", None)
        sanpham_noibat_orm.ma_sanpham_donvi = sanpham_noibat.get("ma_sanpham_donvi", None)
        sanpham_noibat_orm.noidung_vipham = sanpham_noibat.get("noidung_vipham", None)
        sanpham_noibat_orm.hinhthuc_xuphat = sanpham_noibat.get("hinhthuc_xuphat", None)
        # sanpham_noibat_orm.donvi_cungung_id = sanpham_noibat.get("", None)
        sanpham_noibat_orm.donvi_cungung_ma = sanpham_noibat.get("donvi_cungung_ma", None)
        sanpham_noibat_orm.donvi_cungung_ten = sanpham_noibat.get("donvi_cungung_ten", None)

        sanpham_noibat_orm.thoigian_dongbo = convert_timestamp_to_string(floor(time.time()), "%Y%m%d%H%M%S")
        sanpham_noibat_orm.trangthai = 1
        sanpham_noibat_orm.donvi_id = donvi.id    
        if create == True:
            db.session.add(sanpham_noibat_orm)
            total_create += 1
        else:
            total_update += 1

    db.session.commit()

    return json({"total_create": total_create, "total_update": total_update, "total_error": total_error, "list_error": list_error}, status=200)

# API DELETE SP NOI BAT

# API GET MANY SP NOI BAT
@app.route('/app_api/v1/sanpham-noibat', methods=['GET'])
@validate_authen_appinfo()
async def get_sanpham_noibat(request, donvi):
    results_per_page = int(request.args.get('results_per_page', 50))
    page_num = int(request.args.get('page', 1))
    offset = (page_num - 1) * results_per_page

    danhsach = db.session.query(SanPhamNoiBatDonVi.id,
                                SanPhamNoiBatDonVi.ma_sanpham,
                                SanPhamNoiBatDonVi.ten_sanpham,
                                SanPhamNoiBatDonVi.ten_khoa_hoc,
                                SanPhamNoiBatDonVi.ten_thuong_mai,
                                SanPhamNoiBatDonVi.donvi_cungung_ma,
                                SanPhamNoiBatDonVi.donvi_cungung_ten
    ).filter(SanPhamViPhamDonVi.donvi_id == donvi.id)

    num_results = danhsach.count()
    danhsach = danhsach.limit(results_per_page).offset(offset).all()

    objects = [sanpham_noibat._asdict() for sanpham_noibat in danhsach]

    total_pages = int(math.ceil(num_results / results_per_page))
    return json({"page": page_num,"total_pages":total_pages,"num_results":num_results, "objects":objects},status=200)

# API GET SINGLE SP NOI BAT
@app.route('/app_api/v1/sanpham-noibat/<ma_sanpham>', methods=['GET'])
@validate_authen_appinfo()
async def get_single_sanpham_noibat(request, donvi, ma_sanpham=None):
    if ma_sanpham is None:
        return json({"error_code": "PARAM_ERROR", "error_message": "Tham số không hợp lệ"}, status=200)
    
    sanpham_noibat = db.session.query(SanPhamViPhamDonVi.id,
                                        SanPhamViPhamDonVi.ma_sanpham,
                                        SanPhamViPhamDonVi.ten_sanpham,
                                        SanPhamViPhamDonVi.ten_khoa_hoc,
                                        SanPhamViPhamDonVi.ten_thuong_mai, 
                                        SanPhamViPhamDonVi.donvi_cungung_ma,
                                        SanPhamViPhamDonVi.donvi_cungung_ten,
                                        SanPhamViPhamDonVi.quocgia_id
    ).filter(SanPhamViPhamDonVi.deleted == False, SanPhamViPhamDonVi.donvi_id == donvi.id, SanPhamViPhamDonVi.ma_sanpham == ma_sanpham).first()
    if sanpham_noibat is None:
        return json({"error_code": "NOT_FOUND", "error_message": "Không tìm thấy sản phẩm vi phạm"}, status=200)

    return json(sanpham_noibat._asdict(), status=200)

############### END SYNC SP NOI BAT ################

# API chung nhan chat luong duoc lieu - PhieuKiemNghiem
@app.route('/app_api/v1/chungnhan_chatluong', methods=['POST'])
@validate_authen_appinfo()
async def get_chungnhan_chatluong(request, donvi):
    results_per_page = int(request.args.get('results_per_page', 50))
    page_num = int(request.args.get('page', 1))
    offset = (page_num - 1) * results_per_page

    danhsach = db.session.query(PhieuKiemNghiem).filter(PhieuKiemNghiem.deleted == False, PhieuKiemNghiem.donvi_id == donvi.id)

    num_results = danhsach.count()
    danhsach = danhsach.limit(results_per_page).offset(offset).all()

    objects = [chungnhan_chatluong._asdict() for chungnhan_chatluong in danhsach]

    total_pages = int(math.ceil(num_results / results_per_page))
    return json({"page": page_num,"total_pages":total_pages,"num_results":num_results, "objects":objects},status=200)


# API vung trong duoc lieu
@app.route('/app_api/v1/vungtrong-duoclieu', methods=['GET'])
@validate_authen_appinfo()
async def get_vungtrong_duoclieu(request, donvi):
    results_per_page = int(request.args.get('results_per_page', 50))
    page_num = int(request.args.get('page', 1))
    offset = (page_num - 1) * results_per_page

    danhsach = db.session.query(DMVungTrongDuocLieu).filter(DMVungTrongDuocLieu.deleted == False)

    num_results = danhsach.count()
    danhsach = danhsach.limit(results_per_page).offset(offset).all()

    # objects = [danhmuc_vungtrong._asdict() for danhmuc_vungtrong in danhsach]
    objects = [to_dict(danhmuc_vungtrong) for danhmuc_vungtrong in danhsach]

    total_pages = int(math.ceil(num_results / results_per_page))
    return json({"page": page_num,"total_pages":total_pages,"num_results":num_results, "objects":objects},status=200)


# API tra cuu nguồn gốc duoc lieu
@app.route('/app_api/v1/chungnhan_co', methods=['GET'])
async def get_chungnhan_co(request):
    results_per_page = int(request.args.get('results_per_page', 50))
    page_num = int(request.args.get('page', 1))
    offset = (page_num - 1) * results_per_page

    type_filter = request.args.get('type_filter', 1) # 1 - tìm kiếm theo số giấy phép, 2 - tìm kiếm theo sản phẩm
    so_giay_phep = request.args.get('so_giay_phep_co', None)
    ma_sanpham = request.args.get('ma_sanpham', None)
    ma_HS = request.args.get("ma_HS", None)

    danhsach = db.session.query(GiayChungNhanCO.id, 
        GiayChungNhanCO.so_co,
        GiayChungNhanCO.so_giay_phep,
        GiayChungNhanCO.giayphep_nhapkhau_id,
        GiayChungNhanCO.giayphep_nhapkhau,
        GiayChungNhanCO.thoigian_cap_co,
        GiayChungNhanCO.thoigian_hieuluc_batdau,
        GiayChungNhanCO.donvi_id,
        GiayChungNhanCO.thoigian_hieuluc_ketthuc).filter(GiayChungNhanCO.deleted == False)

    error_message = None
    if type_filter == "1":
        if so_giay_phep is not None and str(so_giay_phep).strip() != "":
            danhsach = danhsach.filter(GiayChungNhanCO.so_giay_phep == so_giay_phep)
        else:
            error_message = "Vui lòng nhập số giấy phép"
    elif type_filter == "2":
        if ma_sanpham is None or str(ma_sanpham).strip() == "":
            error_message = "Vui lòng nhập mã sản phẩm"
        elif ma_HS is None or str(ma_HS).strip() == "":
            error_message = "Vui lòng nhập mã HS sản phẩm"

        danhsach = danhsach.join(GiayChungNhanCOChitiet, GiayChungNhanCOChitiet.chungnhan_id == GiayChungNhanCO.id).filter(GiayChungNhanCOChitiet.ma_sanpham == ma_sanpham, GiayChungNhanCOChitiet.deleted == False, GiayChungNhanCOChitiet.ma_HS == ma_HS)

    if error_message is not None:
        return json({"page": 1,"total_pages":1,"num_results":0, "objects":[], "error_message": error_message},status=200)

    num_results = danhsach.count()
    danhsach = danhsach.limit(results_per_page).offset(offset).all()

    objects = [chungnhan_co._asdict() for chungnhan_co in danhsach]

    total_pages = int(math.ceil(num_results / results_per_page))
    return json({"page": page_num,"total_pages":total_pages,"num_results":num_results, "objects":objects},status=200)

# API tra cuu chat luong duoc lieu
@app.route('/app_api/v1/chungnhan_cq', methods=['GET'])
async def get_chungnhan_co(request):
    results_per_page = int(request.args.get('results_per_page', 50))
    page_num = int(request.args.get('page', 1))
    offset = (page_num - 1) * results_per_page

    type_filter = request.args.get('type_filter', 1) # 1 - tìm kiếm theo số giấy phép, 2 - tìm kiếm theo sản phẩm
    ma_kiem_nghiem = request.args.get('ma_kiem_nghiem', None)
    ma_sanpham = request.args.get('ma_sanpham', None)
    so_lo = request.args.get('so_lo', None)

    danhsach = db.session.query(PhieuKiemNghiem.id,
        PhieuKiemNghiem.ma_kiem_nghiem,
        PhieuKiemNghiem.ngay_kiem_nghiem,
        PhieuKiemNghiem.ma_sanpham,
        PhieuKiemNghiem.ten_sanpham,
        PhieuKiemNghiem.so_lo
    ).filter(PhieuKiemNghiem.deleted == False)

    error_message = None
    if type_filter == "1":
        if ma_kiem_nghiem is not None and str(ma_kiem_nghiem).strip() != "":
            danhsach = danhsach.filter(PhieuKiemNghiem.ma_kiem_nghiem == ma_kiem_nghiem)
        else:
            error_message = "Vui lòng nhập mã kiểm nghiệm"
        
    elif type_filter == "2":
        if ma_sanpham is None or str(ma_sanpham).strip() == "":
            error_message = "Vui lòng nhập mã sản phẩm"
        elif so_lo is None or str(so_lo).strip() == "":
            error_message = "Vui lòng nhập mã số lô sản phẩm"

        danhsach = danhsach.filter(PhieuKiemNghiem.ma_sanpham == ma_sanpham, PhieuKiemNghiem.deleted == False, PhieuKiemNghiem.so_lo == so_lo)

    if error_message is not None:
        return json({"page": 1,"total_pages":1,"num_results":0, "objects":[], "error_message": error_message},status=200)

    num_results = danhsach.count()
    danhsach = danhsach.limit(results_per_page).offset(offset).all()

    objects = [chungnhan_cq._asdict() for chungnhan_cq in danhsach]

    total_pages = int(math.ceil(num_results / results_per_page))
    return json({"page": page_num,"total_pages":total_pages,"num_results":num_results, "objects":objects},status=200)

# API dong bo  chung nhan CO từ hệ thống COCQ
@app.route('/app_api/v1/sync_chungnhan_co', methods=['POST'])
@validate_authen_appinfo()
async def sync_chungnhan_co(request, donvi):
    token = request.headers.get('X-COCQ-TOKEN')
    if token != "token-cocq":
        return json({"error_message": "Bạn không có quyền thực hiện hành động này", "error_code": "PARAM_ERROR"}, status=520)

    danhsach_chungnhan_co = request.json.get("danhsach_chungnhan_co")
    for chungnhan_co in danhsach_chungnhan_co:
        pass
    
# API dong bo chung nhan CQ từ hệ thống COCQ
@app.route('/app_api/v1/sync_chungnhan_CQ', methods=['POST'])
@validate_authen_appinfo()
async def sync_chungnhan_CQ(request, donvi):
    token = request.headers.get('X-COCQ-TOKEN')
    if token != "token-cocq":
        return json({"error_message": "Bạn không có quyền thực hiện hành động này", "error_code": "PARAM_ERROR"}, status=520)

    danhsach_chungnhan_CQ = request.json.get("danhsach_chungnhan_CQ")
    for chungnhan_CQ in danhsach_chungnhan_CQ:
        ma_donvi = chungnhan_CQ.get("ma_donvi", None)
        id_chungnhan_CO = chungnhan_CQ.get("id", None)
        if ma_donvi is None or id_chungnhan_CO is None:
            continue

        check_donvi = db.session.query(DonVi.id).filter(DonVi.deleted == False,
            DonVi.ma_donvi == ma_donvi,
            DonVi.loai_donvi == "3",
        ).first()
        if check_donvi is None:
            continue
            
        check_chungnhan_CO = db.session.query(GiayChungNhanCO).filter(GiayChungNhanCO.deleted == False, GiayChungNhanCO.id == id_chungnhan_CO, ).first()
        create = False
        if check_chungnhan_CO is None:
            check_chungnhan_CO = GiayChungNhanCO()
            check_chungnhan_CO.id = id_chungnhan_CO
            check_chungnhan_CO.donvi_id = check_donvi.id
            create = True

        check_chungnhan_CO.ma_kiem_nghiem = chungnhan_CQ.get("ma_kiem_nghiem", None)
        check_chungnhan_CO.ngay_kiem_nghiem = chungnhan_CQ.get("ngay_kiem_nghiem", None)

        check_chungnhan_CO.ten_donvi_cap = chungnhan_CQ.get("ten_donvi_cap", None)
        check_chungnhan_CO.donvi_cap_id = chungnhan_CQ.get("donvi_cap_id", None)
        check_chungnhan_CO.diachi_donvi_cap = chungnhan_CQ.get("diachi_donvi_cap", None)
        
        check_chungnhan_CO.donvi_yeucau = chungnhan_CQ.get("donvi_yeucau", None)
        check_chungnhan_CO.ma_donvi_yeucau = chungnhan_CQ.get("ma_donvi_yeucau", None)
        check_chungnhan_CO.ten_donvi_yeucau = chungnhan_CQ.get("ten_donvi_yeucau", None)
        check_chungnhan_CO.diachi_donvi_yeucau = chungnhan_CQ.get("diachi_donvi_yeucau", None)

        check_chungnhan_CO.id_sanpham = chungnhan_CQ.get("id_sanpham", None)
        check_chungnhan_CO.ma_sanpham = chungnhan_CQ.get("ma_sanpham", None)
        check_chungnhan_CO.loai_sanpham = chungnhan_CQ.get("loai_sanpham", None)
        check_chungnhan_CO.ten_sanpham = chungnhan_CQ.get("ten_sanpham", None)
        check_chungnhan_CO.sanpham = chungnhan_CQ.get("sanpham", None)
        check_chungnhan_CO.so_lo = chungnhan_CQ.get("so_lo", None)

        check_chungnhan_CO.nguoi_lay_mau = chungnhan_CQ.get("nguoi_lay_mau", None)
        check_chungnhan_CO.nguoi_giao_mau = chungnhan_CQ.get("nguoi_giao_mau", None)
        check_chungnhan_CO.nguoi_nhan_mau = chungnhan_CQ.get("nguoi_nhan_mau", None)
        check_chungnhan_CO.tinh_trang_mau = chungnhan_CQ.get("tinh_trang_mau", None)
        check_chungnhan_CO.luong_lay_mau = chungnhan_CQ.get("luong_lay_mau", None)
        check_chungnhan_CO.tieu_chuan_kiem_nghiem = chungnhan_CQ.get("tieu_chuan_kiem_nghiem", None)
        check_chungnhan_CO.cac_muc_kiem_nghiem = chungnhan_CQ.get("cac_muc_kiem_nghiem", None)

        check_chungnhan_CO.noi_san_suat = chungnhan_CQ.get("noi_san_suat", None)
        check_chungnhan_CO.noi_san_suat_id = chungnhan_CQ.get("noi_san_suat_id", None)

        check_chungnhan_CO.nuoc_sanxuat = chungnhan_CQ.get("nuoc_sanxuat", None)
        check_chungnhan_CO.ngay_san_xuat = chungnhan_CQ.get("ngay_san_xuat", None)
        check_chungnhan_CO.han_su_dung = chungnhan_CQ.get("han_su_dung", None)
        check_chungnhan_CO.ngay_bao_cao = chungnhan_CQ.get("ngay_bao_cao", None)
        check_chungnhan_CO.ngay_nhan_mau = chungnhan_CQ.get("ngay_nhan_mau", None)


        check_chungnhan_CO.quy_cach = chungnhan_CQ.get("quy_cach", None)
        check_chungnhan_CO.ket_qua = chungnhan_CQ.get("ket_qua", None)
        check_chungnhan_CO.ketluan = chungnhan_CQ.get("ketluan", None)
        check_chungnhan_CO.don_vi_gui_mau = chungnhan_CQ.get("don_vi_gui_mau", None)

        check_chungnhan_CO.ghichu = chungnhan_CQ.get("ghichu", None)
        # donvi_id_owner = db.Column(String, index=True)
        # donvi_owner = chungnhan_CQ.get("", None)
        check_chungnhan_CO.chungtu_dinhkem = chungnhan_CQ.get("chungtu_dinhkem", None)

        check_chungnhan_CO.trangthai = chungnhan_CQ.get("trangthai", 1)# 1- Tạo mới 2- chờ duyệt. 3 đã duyệt
        check_chungnhan_CO.nguoi_duyet_id = chungnhan_CQ.get("nguoi_duyet_id", None)
        check_chungnhan_CO.nguoi_duyet_ten = chungnhan_CQ.get("nguoi_duyet_ten", None)
        check_chungnhan_CO.thoigian_duyet = chungnhan_CQ.get("thoigian_duyet", None)
        check_chungnhan_CO.thoigian_guiduyet = chungnhan_CQ.get("thoigian_guiduyet", None)

        check_chungnhan_CO.auto_ma_kiem_nghiem = chungnhan_CQ.get("auto_ma_kiem_nghiem", None)

        if create is True:
            db.session.add(check_chungnhan_CO)
        db.session.commit()





