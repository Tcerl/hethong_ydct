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
from sqlalchemy import or_, and_, desc, asc
from application.models.model_danhmuc import TuyenDonVi
from application.models.model_donvi import *
from application.extensions import auth
from application.controllers.upload import *
from sqlalchemy.orm.attributes import flag_modified
from application.extensions import jinja
from application.models.model_duoclieu import *


@app.route('/api/v1/update_logo_donvi', methods=["POST"])
async def DonVitree(request):
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    
    donvi_id = request.json.get('donvi_id',None)
    thumbnail_url = request.json.get('thumbnail_url',None)
    if (donvi_id is None or thumbnail_url is None):
        return json({"error_code": "PARRAM_ERROR", "error_message": "Tham số không hợp lệ"}, status=520)
    data = db.session.query(DonVi).filter(and_(DonVi.id == donvi_id, DonVi.active == True)).first()
    if data is None:
        return json({"error_code": "PARRAM_ERROR", "error_message": "Thông tin đơn vị không hợp lệ"}, status=520)
    data.thumbnail_url = thumbnail_url
    db.session.commit()
    return json({})


@app.route('/api/v1/update_link_file_donvi', methods=["POST"])
async def DonVitree(request):
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    
    donvi_id = request.json.get('donvi_id',None)
    data_file = request.json.get('data_file',None)
    typeFile = request.json.get("type",None)
    if (donvi_id is None or data_file is None or typeFile is None):
        return json({"error_code": "PARRAM_ERROR", "error_message": "Tham số không hợp lệ"}, status=520)
    data = db.session.query(DonVi).filter(and_(DonVi.id == donvi_id, DonVi.active == True)).first()
    if data is None:
        return json({"error_code": "PARRAM_ERROR", "error_message": "Thông tin đơn vị không hợp lệ"}, status=520)

    if typeFile == 1:
        data.thumbnail_url = data_file
    elif typeFile ==2:
        data.dinhkem_giayphep_dkkd = data_file
    elif typeFile ==3:
        data.dinhkem_sodo_nhansu = data_file
    elif typeFile ==4:
        data.dinhkem_chungnhan_daotao = data_file
    elif typeFile ==5:
        data.dinhkem_thuyetminh_quytrinh = data_file
    elif typeFile ==6:
        data.dinhkem_chungnhan_gacp = data_file
    elif typeFile ==7:
        data.danhsach_nhanvien_daotao = data_file
        flag_modified(data, 'danhsach_nhanvien_daotao')

    db.session.commit()
    return json({})


@app.route('/api/v1/donvitree')
async def DonVitree(request):
    data = None
    is_admin = await hasRole(request, "admin")
    if(is_admin == True):
        data = db.session.query(DonVi).\
            options(joinedload_all("children", "children", "children", "children")).\
            join(TuyenDonVi, DonVi.tuyendonvi).filter(TuyenDonVi.ma == 'TW').first()
    else:
        data = db.session.query(DonVi).\
            options(joinedload_all("children", "children", "children", "children")).\
            join(TuyenDonVi, DonVi.tuyendonvi).filter(TuyenDonVi.ma == 'TW').first()
            
    if data is not None:
        obj = data.dump()
        return  json(to_dict(obj))
    else:
        return json({})
#     if datas is not None:
#         for dv in datas:
#             donvi = to_dict(dv)
#             donvi["xaphuong"] = to_dict(dv.xaphuong)
#             donvi["quanhuyen"] = to_dict(dv.quanhuyen)
#             donvi["tinhthanh"] = to_dict(dv.tinhthanh)
#             donvi["quocgia"] = to_dict(dv.quocgia)
#             donvi["tuyendonvi"] = to_dict(dv.tuyendonvi)
#             donvi["users"] = to_dict(dv.users)
#             results.append(to_dict(donvi))
#     return json(to_dict(results), status=200)
#     else:
#         return json({"error_code":"PERMISSION_DENY","error_message":"Not Permission"},status=520)


@app.route('/api/donvi/adduser/new', methods=["POST"])
async def addUserDonvi(request):
    error_msg = None
    if request.method == 'POST':
        donvi_id = request.json.get('donvi_id',None)
        password = request.json.get('password', None)
        cfpassword = request.json.get('password_confirm', None)
        macongdan = request.json.get('macongdan', None)
        email = request.json.get('email', None)
        phone_number = request.json.get('phone', None)
        hoten = request.json.get('hoten', '')
#         if ((email is None) or (email == '')):
#             error_msg = u"Xin mời nhập email"
#         if ((macongdan is None) or (macongdan == '')):
#             error_msg = u"Xin mời nhập Mã công dân (CMND/Hộ chiếu)"
        if(error_msg is None):
            if  not valid_phone_number(phone_number):
                error_msg = u"Số điện thoại không đúng định dạng, xin mời nhập lại"
            else:
                checkphone = await check_user(phone_number)
                if(checkphone is not None):
                    error_msg = u"Số điện thoại đã có người sử dụng, xin mời nhập lại"
        if(error_msg is None):
            check_macongdan = await check_user(macongdan)
            if(check_macongdan is not None):
                error_msg = u"Mã công dân đã có người sử dụng, xin mời nhập lại"
                    
        if((error_msg is None)):
            if((password is None) or (password == '') or (password != cfpassword )) :
                error_msg = u"Xin mời nhập lại mật khẩu"
            
        if((error_msg is None)):
            if(password != cfpassword ) :
                error_msg = u"Mật khẩu không khớp"
                
        if((error_msg is None)):
            if(check_donvi(donvi_id) is None):
                error_msg = u"Tham số đơn vị không đúng"
                
        if (error_msg is None):
            url = app.config.get("USER_STORE_URL") + "user"
            data = {
                'fullname':hoten,
                'phone_number': '+84'+phone_number[1:],
                'email':email,
                'phone_country_prefix':'+84',
                'phone_national_number':phone_number,
                'password':password,
                'confirm_password':cfpassword,
                'id_card':macongdan
            }
            headers = {"X-Auth-Token":"security-token"}
            
            resp = await HTTPClient.post(url, data, headers)
            if resp is not None and 'error_code' not in resp:
                uid = resp['id']
#                 encrypted_id = hashlib.sha256((uid + app.config.get('SECRET_KEY', None)).encode('utf8')).hexdigest()
#                 resp_create_participant = await requests("invoke", "participant_create", [encrypted_id])
                resp_create_participant = await create_participant(uid, uid)
                if resp_create_participant is None:
                    print("donvi.py --> resp_create_participant is None")
                
                user_donvi = UserDonvi(uid=uid, ten= hoten, macongdan = macongdan, donvi_id = donvi_id)
                db.session.add(user_donvi)
                db.session.commit()
                return json({"uid":uid, "donvi_id":donvi_id});
            else:
                try:
                    if "error_message" in resp:
                        error_msg = resp["error_message"]
                        if "error_message" in error_msg:
                            data_message = ujson.loads(error_msg)
                            error_msg = data_message["error_message"]
                    else:
                        error_msg = u" đăng ký không thành công"
                except:
                    error_msg = u" đăng ký không thành công"
    return json({"error_code": "ADD_USER_FAILED", "error_message": error_msg},status=520)

@app.route('/api/donvi/adduser/exist', methods=["POST"])
async def addUserExistToDonvi(request):
    error_msg = None
    if request.method == 'POST':
        donvi_id = request.json.get('donvi_id',None)
        account = request.json.get('account', None)
        userinfo = None
        if(error_msg is None):
            if  account is None:
                error_msg = u"Tham số không hợp lệ, xin mời nhập lại"
            else:
                userinfo = await get_current_user(request, account)
                if(userinfo is None):
                    error_msg = u"Tài khoản không tồn tại, Vui lòng kiểm tra lại hoặc tạo mới tài khoản"

        if (error_msg is None):
            user_donvi = db.session.query(UserDonvi).filter(UserDonvi.uid == userinfo['id']).filter(UserDonvi.donvi_id == donvi_id).first()
            if (user_donvi is not None):
                error_msg = u"Tài khoản đã tồn tại trong đơn vị ( Mã tài khoản: "+ userinfo['id']+ " )"
            else:
                user_donvi = UserDonvi(uid=userinfo["id"], ten= userinfo["fullname"], macongdan = userinfo["id_card"], donvi_id = donvi_id)
                db.session.add(user_donvi)
                db.session.commit()
                return json({"uid":userinfo["id"], "donvi_id":donvi_id});

    return json({"error_code": "ADD_USER_FAILED", "error_message": error_msg},status=520)


def apply_DonVi_filter(search_params, request=None, **kw ):
    uid = current_uid(request)
    if uid is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"},status=520)
    user = db.session.query(User).filter(User.id == uid).first()
    if user is not None:
        #admin_tyt,admin_benhvien,canbo_benhvien,canbo_tyt
        #organization_id
        query = None
        if user.has_role('admin_tyt') or user.has_role('canbo_tyt'):
            query = { "$and": [{ "approved_by_organization_id_level1": { "$eq": user.organization_id } }, { "status": { "$eq": 2 } }] }

        DonVichildids = []
        if(currDonVi is not None):
            currDonVi.get_children_ids(DonVichildids)
            if currDonVi.tuyenDonVi != 1:
                search_params["filters"] = ("filters" in search_params) and {"$and":[search_params["filters"], {"donvi_id":{"$in": DonVichildids}}]} \
                                        or {"donvi_id":{"$in": DonVichildids}}
    
#@jwt_required()
def entity_pregetmany(search_params=None,request=None, **kw):
    apply_DonVi_filter(search_params, request)
    
#def donvi_pregetmany(search_params=None, **kw):
    request = kw.get("request", None)
    currentUser = current_user(request)
    if currentUser is not None:
        currdonvi = currentUser.donvi
        donvichildids = []
        if(currdonvi is not None):
            currdonvi.get_children_ids(donvichildids)
            
        search_params["filters"] = ("filters" in search_params) and {"$and":[search_params["filters"], {"id":{"$in": donvichildids}}]} \
                                or {"id":{"$in": donvichildids}}
                                        
def donvi_predelete(instance_id=None):
    """Accepts a single argument, `instance_id`, which is the primary key
    of the instance which will be deleted.

    """
    donvi = db.session.query(DonVi).filter(DonVi.id == instance_id).first()
    if donvi is not None:
        donvichildids = []
        donvi.get_children_ids(donvichildids)
        if len(donvichildids) > 1:
            return json({"error_message":u'Không thể xoá đơn vị có đơn vị con'},
                                      status=520)

def donvi_prepput_children(request=None, instance_id=None, data=None, **kw):
    if 'children' in data :
        del data['children']
    if 'captren' in data:
        del data['captren']
    if 'users' in data:
        del data['users'] 

def donvi_prepput(instance_id=None, data=None):
    if 'children' in data :
        del data['children']
    if 'parent_id' in data:
        donvi = db.session.query(DonVi).filter(DonVi.id == instance_id).first()
        donvichildids = []
        if(donvi is not None):
            donvi.get_children_ids(donvichildids)
            #try:
            #    donvichildids.remove(instance_id)
            #except:
            #    pass
            if (data['parent_id'] is not None) and (int(data['parent_id']) in donvichildids):
                return json({"error_message":u'Cấp trên không đúng'},
                                      status=520)
                                      


async def check_sogiayphep_kinhdoanh(request = None, Model = None, data = None, **kw):
    if 'sogiayphep' in data:
        sogiayphep = data['sogiayphep']
        if sogiayphep is None or sogiayphep == "":
            return json({'error_code': 'PARAM_ERROR', 'error_message': 'Vui lòng nhập số giấy phép kinh doanh'}, status=520)
        else:
            if request.method == 'POST':
                check_giayphep = db.session.query(DonVi).filter(DonVi.sogiayphep == sogiayphep, DonVi.deleted == False).first()
                if check_giayphep is not None:
                    return json({'error_code': "PARAM_ERROR", 'error_message': "Số giấy phép kinh doanh đã tồn tại"}, status=520)
            elif request.method == 'PUT':
                check_giayphep = db.session.query(DonVi).filter(DonVi.sogiayphep == sogiayphep, DonVi.id != data['id'], DonVi.deleted == False).first()
                if check_giayphep is not None:
                    return json({'error_code': "PARAM_ERROR", 'error_message': "Số giấy phép kinh doanh đã tồn tại"}, status=520)

def preprocess_put_donvi(request=None, instance_id=None, data=None, **kw):
    currentUser = current_user(request)
    if currentUser is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)

    data = request.json
    donvi_id = data.get('id', None)
    if donvi_id is None:
        return json({'error_code':'PARAM_ERROR', 'error_message':'Tham số không hợp lệ'}, status=520)

    donvi = db.session.query(DonVi).filter(DonVi.deleted == False, DonVi.id == donvi_id).first()
    if donvi is None:
        return json({'error_code':'PARAM_ERROR', 'error_message':'Không tìm thấy thông tin đơn vị'}, status=520)
    
    donvi.ma_coso = data.get("ma_coso", None)
    donvi.ten_coso = data.get("ten_coso", None)
    donvi.tenkhongdau = convert_text_khongdau(donvi.ten_coso)
    donvi.sogiayphep = data.get("sogiayphep", None)
    donvi.ngaycapphep = data.get("ngaycapphep", None)
    donvi.dienthoai = data.get("dienthoai", None)
    donvi.email = data.get("email", None)
    donvi.website = data.get("website", None)
    donvi.loaihinh_hoatdong = data.get("loaihinh_hoatdong", None)
    donvi.loai_donvi = data.get("loai_donvi", None)
    
    # donvi.lich_lamviec = data.get("", None)
    donvi.gioithieu = data.get("gioithieu", None)
    donvi.nguoidaidien = data.get("nguoidaidien", None)
    donvi.nguoidaidien_dienthoai =data.get("nguoidaidien_dienthoai", None)
    # donvi.thumbnail_url = data.get("", None)
    # donvi.banner_url = data.get("", None)
    donvi.xaphuong_id = data.get("xaphuong_id", None)
    donvi.xaphuong = data.get("xaphuong", None)
    donvi.quanhuyen_id = data.get("quanhuyen_id", None)
    donvi.quanhuyen = data.get("quanhuyen", None)
    donvi.tinhthanh_id = data.get("tinhthanh_id", None)
    donvi.tinhthanh = data.get("tinhthanh", None)
    donvi.quocgia_id = data.get("quocgia_id", None)
    donvi.quocgia = data.get("quocgia", None)
    donvi.sonha_tenduong = data.get("sonha_tenduong", None)
    donvi.diachi = convert_diachi(data.get("tinhthanh"), data.get("quanhuyen"), data.get("xaphuong"), data.get("sonha_tenduong"))
    donvi.tuyendonvi_id = data.get("tuyendonvi_id", None)
    donvi.captren_id = data.get("captren_id", None)
    donvi.captren_name = data.get("captren_name", None)
    # donvi.dinhkem_giayphep_dkkd = data.get("", None)
    # donvi.dinhkem_sodo_nhansu = data.get("", None)#sơ đồ nhân sự
    # donvi.dinhkem_chungnhan_daotao = data.get("", None)#Chứng nhận đào tạo
    # donvi.danhsach_nhanvien_daotao = data.get("", None)#danh sách nhân viên đào tạo {'ma', 'ten', 'chuyenmon'}
    # donvi.dinhkem_thuyetminh_quytrinh = data.get("", None)
    # donvi.dinhkem_chungnhan_gacp = data.get("", None)
    # donvi.loai_chungnhan_gacp = data.get("", None)
    # donvi.so_chungnhan_gacp = data.get("", None)
    db.session.flush()

    tuyendonvi_id = donvi.tuyendonvi_id
    chophep_ketnoi = data.get("chophep_ketnoi", False)
    appinfo = donvi.appinfo
    data_appinfo = data.get("appinfo", None)
    if tuyendonvi_id == "3" and data_appinfo is not None:
        if chophep_ketnoi == True:
            donvi.chophep_ketnoi = True
            if appinfo is None:
                appinfo = AppInfo()
                appinfo.id = default_uuid()
                # appinfo.password = data_appinfo.get("password", None)
                appinfo.name = data_appinfo.get("name", None)
                appinfo.organization_name = donvi.ten_coso
                appinfo.appkey = default_uuid()
                appinfo.salt = generator_salt()
                appinfo.password = auth.encrypt_password(data_appinfo.get("password", None), appinfo.salt)

                db.session.add(appinfo)
                db.session.flush()
            else:
                if appinfo.salt is None:
                    appinfo.salt = generator_salt()
                if data_appinfo.get("password", None) is not None:
                    appinfo.password = auth.encrypt_password(data_appinfo.get("password", None), appinfo.salt)
                appinfo.name = data_appinfo.get("name", None)

            donvi.appinfo_id = appinfo.id
            
            appinfo.unsigned_name = convert_text_khongdau(appinfo.name)
            appinfo.description = data_appinfo.get("description", None)
            appinfo.status = 1
            appinfo.type = 1  # 0=application ket noi den nen tang, 1 nen tang kết nối tới ứng dụng khác
        elif appinfo is not None:
            appinfo.status = 0
            donvi.chophep_ketnoi = False
    else:
        donvi.chophep_ketnoi = False

    db.session.commit()
    return json({"error_message": "successfully"}, status=200)

async def postprocess_get_donvi(request=None, Model=None, result=None, **kw):
    if 'appinfo' in result and result['appinfo'] is not None and 'password' in result['appinfo']:
        del result['appinfo']['password']

apimanager.create_api(DonVi,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[deny_request], PUT_SINGLE=[preprocess_put_donvi], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, pre_delete]),
    postprocess=dict(GET_SINGLE=[postprocess_get_donvi], GET_MANY=[postprocess_stt]),
    exclude_columns= ["users", "children", "captren"],
    collection_name='donvi')


apimanager.create_api(DonVi,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[deny_request], GET_MANY=[validate_user], POST=[deny_request], PUT_SINGLE=[deny_request], DELETE_SINGLE=[deny_request], PUT_MANY=[deny_request], DELETE_MANY=[deny_request]),
    postprocess=dict(GET_MANY=[postprocess_stt]),
    include_columns=['id', 'ma_coso', 'ten_coso', 'tenkhongdau'],
    collection_name='donvi_filter')


apimanager.create_api(DanhMucNoiSanXuat,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user, pre_getmany_donvi], POST=[validate_user, pre_post_insert_donvi], PUT_SINGLE=[validate_user, donvi_prepput_children, pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, pre_delete]),
    postprocess=dict(GET_MANY=[postprocess_stt]),
    include_columns=['id', 'ten', 'tenkhongdau', 'donvi_id', 'ma_viettat'],
    collection_name='noisanxuat_filter')

apimanager.create_api(DanhMucNoiSanXuat,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user, pre_getmany_donvi], POST=[validate_user, pre_post_insert_donvi], PUT_SINGLE=[validate_user, pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, pre_delete]),
    postprocess=dict(GET_MANY=[postprocess_stt]),
    collection_name='noisanxuat')


apimanager.create_api(DanhMucDonViCap,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user, pre_getmany_donvi], POST=[validate_user, pre_post_insert_donvi], PUT_SINGLE=[validate_user, donvi_prepput_children, pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, pre_delete]),
    postprocess=dict(GET_MANY=[postprocess_stt]),
    include_columns=['id', 'ten', 'tenkhongdau', 'donvi_id', 'ma_viettat'],
    collection_name='donvicap_filter')

apimanager.create_api(DanhMucDonViCap,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user, pre_getmany_donvi], POST=[validate_user, pre_post_insert_donvi], PUT_SINGLE=[validate_user, pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, pre_delete]),
    postprocess=dict(GET_MANY=[postprocess_stt]),
    collection_name='donvicap')


apimanager.create_api(DanhMucDonViChungNhanCO,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user, pre_getmany_donvi], POST=[validate_user, pre_post_insert_donvi], PUT_SINGLE=[validate_user, donvi_prepput_children, pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, pre_delete]),
    postprocess=dict(GET_MANY=[postprocess_stt]),
    include_columns=['id', 'ten', 'tenkhongdau', 'donvi_id', 'ma_viettat'],
    collection_name='donvicapco_filter')

apimanager.create_api(DanhMucDonViChungNhanCO,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user, pre_getmany_donvi], POST=[validate_user, pre_post_insert_donvi], PUT_SINGLE=[validate_user, pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, pre_delete]),
    postprocess=dict(GET_MANY=[postprocess_stt]),
    collection_name='donvicapco')


# apimanager.create_api(DonViDangKy,
#     methods=['GET', 'POST', 'DELETE', 'PUT'],
#     url_prefix='/api/v1',
#     preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user], PUT_SINGLE=[validate_user, pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, pre_delete]),
#     postprocess=dict(GET_MANY=[postprocess_stt]),
#     exclude_columns= ["nguoidaidien_matkhau"],
#     collection_name='donvidangky')


# apimanager.create_api(DonViDangKy,
#     methods=['GET', 'POST', 'DELETE', 'PUT'],
#     url_prefix='/api/v1',
#     preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user], PUT_SINGLE=[validate_user, pre_put_insert_tenkhongdau], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many], DELETE_SINGLE=[validate_user, pre_delete]),
#     postprocess=dict(GET_MANY=[postprocess_stt]),
#     include_columns = ['id', 'ten_coso', 'created_at', 'sogiayphep', 'tenkhongdau', 'captren_id', 'tinhthanh_id', 'tinhthanh', 'quanhuyen_id', 'quanhuyen', 'xaphuong_id', 'xaphuong', 'trangthai'],
#     collection_name='donvidangky_collection')



@app.route('/api/v1/admin/donvi/create', methods=['POST'])
async def create_account_donvi(request):
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
   
    data = request.json
    ma_coso = data.get("ma_coso")
    if ma_coso is not None:
        check_ma_coso = db.session.query(DonVi.id).filter(DonVi.ma_coso == ma_coso, DonVi.deleted == False).first()
        if check_ma_coso is not None:
            return json({"error_code": "ERROR_PARAM", "error_message": "Mã đơn vị đã tồn tại trong hệ thống, vui lòng nhập mã khác"}, status=520)
    hoten = data.get("hoten",None)
    phone = data.get("phone",None)
    user_email = data.get("user_email",None)

    password = data.get("password",None)
    salt = generator_salt()
    if user_email is None:
        return json({"error_code": "ERROR_PARAM", "error_message": "Vui lòng nhập email để đăng nhập"}, status=520)
    elif validate_email(data["user_email"]) is False:
        return json({"error_message":"Vui lòng nhập đúng định dạng email người dùng", "error_code":"PARAM_ERROR"}, status=520)

    if ("user_email" in data) and (data["user_email"] is not None) and (len(data["user_email"])>0):
        check_email = db.session.query(User.id).filter(User.email == data["user_email"], User.deleted == False).first()
        if check_email is not None:
            return json({"error_message":"Email đã tồn tại trong hệ thống, vui lòng chọn email khác", "error_code":"PARAM_ERROR"}, status=520)

    if phone is not None and str(phone).strip() != "":
        if str(phone).strip().isnumeric() is False:
            return json({"error_message":"Vui lòng nhập đúng định dạng SDT người dùng", "error_code":"PARAM_ERROR"}, status=520)
        check_phone = db.session.query(User.id).filter(User.phone == phone, User.deleted == False).first()
        if check_phone is not None:
            return json({"error_message":"Số điện thoại người dùng đã tồn tại trong hệ thống", "error_code":"PARAM_ERROR"}, status=520)
    
    donvi = DonVi()
    donvi.id = default_uuid()
    donvi.ma_coso = ma_coso
    donvi.ten_coso = data.get("ten_coso")
    donvi.xaphuong_id = data.get("xaphuong_id")
    donvi.xaphuong = data.get("xaphuong")
    donvi.quanhuyen_id = data.get("quanhuyen_id")
    donvi.quanhuyen = data.get("quanhuyen")
    donvi.tinhthanh_id = data.get("tinhthanh_id")
    donvi.tinhthanh = data.get("tinhthanh")
    donvi.sonha_tenduong = data.get("sonha_tenduong")
    donvi.diachi = convert_diachi(data.get("tinhthanh"), data.get("quanhuyen"), data.get("xaphuong"), data.get("sonha_tenduong"))
    donvi.tuyendonvi_id = data.get("tuyendonvi_id")
    donvi.captren_id = data.get("captren_id")
    donvi.captren_name = data.get("captren_name")
    donvi.dienthoai = data.get("dienthoai")
    donvi.email = data.get("email")
    donvi.tenkhongdau = convert_text_khongdau(donvi.ten_coso)
    donvi.active = True
    donvi.created_by = uid_current
    db.session.add(donvi)
    db.session.flush()
    
    user = User()
    user.id = default_uuid()
    user.phone = phone
    user.email = user_email
    user.salt = salt
    user.password = auth.encrypt_password(password, str(salt))
    user.donvi_id = donvi.id
    user.created_by = uid_current
    user.active = 1
    role_admin_donvi = db.session.query(Role).filter(Role.vaitro == 'admin_donvi').first()
    user.roles.append(role_admin_donvi)
    db.session.add(user)
    db.session.flush()

    profile_user = ProfileUser()
    profile_user.id = user.id
    profile_user.hoten = hoten
    profile_user.tenkhongdau = convert_text_khongdau(hoten)
    profile_user.email = user_email
    profile_user.dienthoai = phone
    profile_user.vaitro = ['admin_donvi']
    profile_user.active = 1
    profile_user.donvi_id = donvi.id
    profile_user.created_by = uid_current
    db.session.add(profile_user)
    db.session.flush()

    db.session.commit()
    return json({"error_code":"OK","error_message":"successful", "data":to_dict(donvi)},status=200)


@app.route('/api/v1/organization/change_status', methods=['POST'])
async def orgnization_change_status(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_msg": "Hết phiên làm việc, vui lòng đăng nhập lại."},status=520)
    elif currentUser.active == 0:
        return json({"error_code":"SESSION_EXPIRED1", "error_message":u"Tài khoản người dùng đã bị khoá. Không thể thực hiện hành động này."}, status=520)
        
    elif currentUser.has_role("admin") is False and currentUser.has_role("admin_donvi") is False:
        return json({"error_code":"LOGIN_FAILED", "error_message":u"Bạn không có quyền thực hiện hành động này."}, status=520)

    donvi = currentUser.donvi

    data = request.json
    if 'id' not in data or data['id'] is None:
        return json({"error_code":"PARAM_ERROR", "error_message":u"Tham số không hợp lệ."}, status=520)

    check_donvi = db.session.query(DonVi).filter(
        DonVi.deleted == False, 
        DonVi.id == data['id']
    ).first()
    if check_donvi is None: 
        return json({"error_code":"PARAM_ERROR", "error_message":u"Tham số không hợp lệ."}, status=520)
    elif donvi is not None and donvi.tuyendonvi_id not in ["1", "2"]:
        return json({"error_code":"PARAM_ERROR", "error_message":u"Bạn không có quyền thực hiện hành động này."}, status=520)
    elif currentUser.has_role("admin_donvi") and donvi.tuyendonvi_id == "2" and check_donvi.captren_id != currentUser.donvi_id:
        return json({"error_code":"PARAM_ERROR", "error_message":u"Bạn không có quyền thực hiện hành động này."}, status=520)
    
    active = data.get("status", False)
    check_donvi.active = active

    db.session.commit()
    return json({"error_message": "successfully"}, status=200)


async def upload_file(file, fileId, attrs, uid_current):
    url = app.config['EXCEL_FOLDER']
    fsroot = app.config['EXCEL_FOLDER']
    if not os.path.exists(fsroot):
        os.makedirs(fsroot)
    file_name = os.path.splitext(file.name)[0]
    extname = os.path.splitext(file.name)[1]
        
    BLOCKSIZE = 65536
    sha256 = hashlib.sha256()
    file_data = file.body
    data_length = len(file_data)
    if(data_length<=0):
        return json({"error_code": "Error","error_message": "File không hợp lệ"}, status=520)
    elif (data_length<BLOCKSIZE):
        BLOCKSIZE = data_length
    sha256.update(file_data)

    str_sha256 = sha256.hexdigest()   
    file_exits = db.session.query(FileInfo).filter(FileInfo.sha256 == str_sha256).first()
    url_file_thuoc = None
    if file_exits is None:
        async with aiofiles.open(fsroot + str_sha256 + extname, 'wb+') as f:
            print("ghi file")
            await f.write(file.body)
        f.close()

        if fileId is None:
            fileId = str(uuid.uuid4())
        fileInfo = FileInfo()
        fileInfo.id = fileId
        fileInfo.sha256 = str_sha256
        fileInfo.user_id = uid_current
        fileInfo.name = file_name
        fileInfo.extname = extname
        fileInfo.link = "/" + str(str_sha256) + str(extname)
        fileInfo.attrs = attrs
        fileInfo.size = data_length
        fileInfo.kind = "file_import"
        db.session.add(fileInfo)
        db.session.commit()

        url_file_thuoc = fsroot + str_sha256 + extname
    else:
        url_file_thuoc = fsroot + file_exits.sha256 + file_exits.extname
    print("url====", url_file_thuoc)
    return url_file_thuoc

def convert_columexcel_to_string(value):
    # print("value", value)
    if isinstance(value,str):
        return value.strip()
    if isinstance(value, float):
        return str(int(value)).strip()
    if isinstance(value,int):
        return str(value).strip()



@app.route('/api/v1/get_ds_donvi_khachhang', methods = ['POST'])
async def get_ds_donvi_khachhang(request):
    uid_current = current_user(request)
    if uid_current is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    list_results = []
    list_results_id = []
    _type = request.json.get("type")
    query = request.json.get("query")
    donvi_id = request.json.get("donvi_id")
    if donvi_id is None:
        donvi_id = uid_current.donvi_id
    #Đơn vị
    if _type == 1:
        check_donvi = None
        check_khachhang = None
        if query is None or query == "":
            query = '%{}%'.format(query)
            check_donvi = db.session.query(DonVi).filter(DonVi.loai_donvi != 1, or_(DonVi.ten_coso.like(query), DonVi.tenkhongdau.ilike(convert_text_khongdau(query)))).all()

            check_khachhang = db.session.query(KhachHangDonVi).filter(KhachHangDonVi.donvi_id == donvi_id, KhachHangDonVi.type == 1, or_(\
                KhachHangDonVi.ten_coso.like(query), KhachHangDonVi.tenkhongdau.ilike(query))).all()            

        else:
            query = '%{}%'.format(query)
            check_donvi = db.session.query(DonVi).filter(DonVi.loai_donvi != 1, or_(DonVi.ten_coso.like(query), DonVi.tenkhongdau.ilike(convert_text_khongdau(query)))).all()

            check_khachhang = db.session.query(KhachHangDonVi).filter(KhachHangDonVi.donvi_id == donvi_id, KhachHangDonVi.type == 1, or_(\
                KhachHangDonVi.ten_coso.like(query), KhachHangDonVi.tenkhongdau.ilike(query))).all()   
            
        if check_donvi is None:
            check_donvi = []
        if check_khachhang is None:
            check_khachhang = []

        for item in check_donvi:
            if item is not None:
                donvi_id = item.id
                if donvi_id is not None and donvi_id not in list_results_id:
                    list_results_id.append(donvi_id)
                    tmp_donvi = {
                        'id': item.id,
                        "ma_coso": item.ma_coso,
                        'ten_coso': item.ten_coso,
                        "tenkhongdau": item.tenkhongdau,
                        "dienthoai": item.dienthoai,
                        "email": item.email,
                        "diachi": item.diachi,
                        "sogiayphep": item.sogiayphep
                    }
                    list_results.append(tmp_donvi)

        for item in check_khachhang:
            if item is not None:
                khachhang_id = item.id
                if khachhang_id is not None and khachhang_id not in list_results_id:
                    list_results_id.append(khachhang_id)
                    tmp_khachhang = {
                        'id': item.id,
                        "ma_coso": item.ma_coso,
                        'ten_coso': item.ten_coso,
                        "tenkhongdau": item.tenkhongdau,
                        "dienthoai": item.dienthoai,
                        "email": item.email,
                        "diachi": item.diachi,
                        "sogiayphep": item.sogiayphep
                    }
                    list_results.append(tmp_khachhang)

    else:
        check_donvi = None
        if query is None or query == "":
            check_donvi = db.session.query(KhachHangDonVi).filter(KhachHangDonVi.donvi_id == donvi_id, KhachHangDonVi.type ==2).all()
        else:
            query = '%{}%'.format(query)
            check_donvi = db.session.query(KhachHangDonVi).filter(KhachHangDonVi.donvi_id == donvi_id, KhachHangDonVi.type ==2, (or_(\
                KhachHangDonVi.ten_coso.like(query), KhachHangDonVi.tenkhongdau.like(convert_text_khongdau(query))))).all()
            
        if isinstance(check_donvi, list) == False:
            check_donvi = []
        
        for item in check_donvi:
            tmp_khachhang = {
                'id': item.id,
                "hoten": item.hoten,
                "tenkhongdau": item.tenkhongdau,
                "dienthoai": item.dienthoai,
                "email": item.email,
                "diachi": item.diachi
                }
            list_results.append(tmp_khachhang)
    return json({"objects": list_results}, status=200)


@app.route('/api/v1/save_khachhang_donvi', methods = ['POST'])
async def save_khachhang_donvi(request):
    uid_current = current_user(request)
    if uid_current is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    
    data = request.json
    if data is None:
        return json({'error_code': 'PARAM_ERROR', 'error_message': 'Tham số không hợp lệ'}, status=520)
    donvi_id = data.get("donvi_id")
    if donvi_id is None or donvi_id =="":
        donvi_id = uid_current.donvi_id
    
    if data.get("type") ==1:
        ##check xem đã có đơn vị nào trong hệ thống chưa
        check_donvi = db.session.query(DonVi).filter(DonVi.sogiayphep == data.get("sogiayphep"), \
            DonVi.sogiayphep  != None, DonVi.sogiayphep != "",\
            DonVi.deleted == False, DonVi.active == True).first()
        if check_donvi is not None:
            tmp_donvi = {
                'id': check_donvi.id,
                "ma_coso": check_donvi.ma_coso,
                'ten_coso': check_donvi.ten_coso,
                "tenkhongdau": check_donvi.tenkhongdau,
                "dienthoai": check_donvi.dienthoai,
                "email": check_donvi.email,
                "diachi": check_donvi.diachi,
                "sogiayphep": check_donvi.sogiayphep,
                "type": 1,
                "existed": True
            }
            return json((tmp_donvi), status=200)
    
        ##check xem đã có đơn vị khách hàng nào chưa
        check_donvi_khachhang = db.session.query(KhachHangDonVi).filter(\
            KhachHangDonVi.donvi_id == donvi_id, KhachHangDonVi.sogiayphep == data.get("sogiayphep"), \
            KhachHangDonVi.sogiayphep != "", KhachHangDonVi.sogiayphep != None, \
            KhachHangDonVi.type ==1, KhachHangDonVi.deleted == False).first()
        if check_donvi_khachhang is not None:
            tmp_donvi_khachhang = to_dict(check_donvi_khachhang)
            tmp_donvi_khachhang['existed'] = True
            return json(tmp_donvi_khachhang,status=200)

    khachHang = KhachHangDonVi()
    khachHang.id = default_uuid()
    khachHang.ten_coso = data.get("ten_coso")
    khachHang.sogiayphep = data.get("sogiayphep")
    khachHang.type = data.get("type")
    khachHang.hoten = data.get("hoten")
    if data.get("type") == 1:
        khachHang.tenkhongdau = convert_text_khongdau(khachHang.ten_coso)
    else:
        khachHang.tenkhongdau = convert_text_khongdau(khachHang.hoten)
    khachHang.dienthoai = data.get("dienthoai")
    khachHang.email = data.get("email")
    khachHang.diachi = data.get('diachi')
    khachHang.donvi_id = donvi_id
    db.session.add(khachHang)
    db.session.commit()

    return json(to_dict(khachHang), status=200)

#duyệt đơn vị đăng ký
@app.route('/api/v1/duyet_dangky', methods= ['POST'])
async def duyet_dangky(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    if data is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)

    id = data.get("id")
    if id is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)


    #check
    checkDangKy = db.session.query(DonViDangKy).filter(DonViDangKy.id == id, DonViDangKy.deleted == False).first()
    if checkDangKy is None:
        return json({'error_code':'PARAM_ERROR', 'error_message': "Không tìm thấy đơn vị đăng ký"}, status=520)


    sogiayphep = checkDangKy.sogiayphep

    checkDonvi = db.session.query(DonVi).filter(DonVi.sogiayphep == sogiayphep, DonVi.deleted == False).first()
    if checkDonvi is not None:
        return json({'error_code':'PARAM_ERROR', 'error_message':"Số giấy phép đã được đăng ký, không thể duyệt thêm đơn vị"}, status=520)

    nguoidaidien_dienthoai = checkDangKy.nguoidaidien_dienthoai
    nguoidaidien_email = checkDangKy.nguoidaidien_email

    checkUser = db.session.query(User).filter(or_(User.dienthoai == nguoidaidien_dienthoai, User.email == nguoidaidien_email), User.deleted == False).first()
    if checkUser is not None:
        return json({'error_code':'PARAM_ERROR', 'error_message': "Số điện thoại hoặc email người dùng đã được đăng ký, không thể duyệt đơn vị."}, status=520)

    captren_id = ""
    captren_name = ""
    checkCuc = db.session.query(DonVi).filter(DonVi.id == currentUser.donvi_id).first()
    if checkCuc is not None and checkCuc.tuyendonvi_id == "10":
        captren_id = checkCuc.id
        captren_name = checkCuc.ten_coso
    else:
        checkCuc = db.session.query(DonVi).filter(DonVi.tuyendonvi == "10", DonVi.loai_donvi ==1, DonVi.deleted == False).first()
        if checkCuc is not None:
            captren_id = checkCuc.id
            captren_name = checkCuc.ten_coso
        else:
            return json({'error_code':'PARAM_ERROR', 'error_message':"Bạn không có quyền thực hiện, vui lòng thử lại sau"}, status=520)

    #tao don vi
    donvi = DonVi()
    donvi.id = default_uuid()
    donvi.ten_coso = checkDangKy.ten_coso
    donvi.tenkhongdau = convert_text_khongdau(checkDangKy.ten_coso)
    donvi.sogiayphep = checkDangKy.sogiayphep
    donvi.ngaycapphep = checkDangKy.ngaycapphep
    donvi.dienthoai = checkDangKy.dienthoai
    donvi.email = checkDangKy.email
    donvi.loai_donvi = checkDangKy.loai_donvi
    donvi.xaphuong_id = checkDangKy.xaphuong_id
    donvi.quanhuyen_id = checkDangKy.quanhuyen_id
    donvi.tinhthanh_id = checkDangKy.tinhthanh_id
    donvi.diachi = checkDangKy.diachi
    donvi.dinhkem_giayphep_dkkd = checkDangKy.dinhkem_giayphep_dkkd
    donvi.active = True
    donvi.captren_id = captren_id
    donvi.captren_name = captren_name
    donvi.nguoidaidien = checkDangKy.nguoidaidien
    donvi.nguoidaidien_dienthoai = checkDangKy.nguoidaidien_dienthoai
    donvi.gioithieu = checkDangKy.gioithieu

    db.session.add(donvi)
    db.session.flush()

    #tao user    
    user = User()
    user.id = default_uuid()
    user.hoten = checkDangKy.nguoidaidien
    user.tenkhongdau = convert_text_khongdau(checkDangKy.nguoidaidien)
    user.email = nguoidaidien_email
    user.dienthoai = nguoidaidien_dienthoai
    salt = generator_salt()
    user.password = auth.encrypt_password(checkDangKy.nguoidaidien_matkhau, str(salt))
    user.donvi_id = donvi.id
    user.salt = salt
    user.active = 1
    role_admin_donvi = db.session.query(Role).filter(Role.vaitro == 'admin_donvi').first()
    user.vaitro.append(role_admin_donvi)
    db.session.add(user)
    
    db.session.flush()

    #tao kho
    kho = DanhMucKho()
    kho.ten_kho = "KHO CHÍNH"
    kho.ma_kho = "KHOCHINH"
    kho.loai_uu_tien = 1
    kho.active =1
    kho.donvi_id = donvi.id
    db.session.add(kho)

    #change trang thai
    checkDangKy.trangthai = 2
    checkDangKy.nguoi_duyet_id = currentUser.id
    checkDangKy.nguoi_duyet_ten = currentUser.hoten
    now = datetime.now()
    timestamp = now.timestamp()
    thoigian_duyet = parse_date_custom(timestamp)
    os.environ['TZ'] = 'UTC-7'
    time.tzset()
    tmp = datetime.now().strftime("%d/%m/%Y %H:%M")
    checkDangKy.thoigian_duyet = thoigian_duyet
    db.session.flush()

    #gui email
    if nguoidaidien_email is not None and validate_email(nguoidaidien_email):
        data = '''
            Bộ Y tế (Cục Quản lý Y dược cổ truyền) đã chấp nhận yêu cầu đăng ký
            truy cập hệ thống truy xuất nguồn gốc dược liệu cho đơn vị <b>{}</b>.<br>
            Tài khoản của đơn vị là: <br>
            - Tài khoản đăng nhập: {} <br>
            - Mật khẩu: {} <br>
            Đơn vị vui lòng sử dụng tài khoản để đăng nhập vào hệ thống qua đường dẫn https://cocq.baocaoyte.com và làm theo hướng dẫn.
            <br>
            Trân trọng cảm ơn!
        '''.format(checkDangKy.ten_coso,nguoidaidien_email,checkDangKy.nguoidaidien_matkhau)
        subject = "Xét duyệt tài khoản truy cập hệ thống truy xuất nguồn gốc dược liệu"
        await send_mail(subject, nguoidaidien_email, data)
    
    db.session.commit()

    return json({'error_code': "Successful"}, status=200)


#huy đơn vị đăng ký
@app.route('/api/v1/huy_dangky', methods= ['POST'])
async def huy_dangky(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    if data is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)

    id = data.get("id")
    if id is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)


    #check
    checkDangKy = db.session.query(DonViDangKy).filter(DonViDangKy.id == id, DonViDangKy.deleted == False).first()
    if checkDangKy is None:
        return json({'error_code':'PARAM_ERROR', 'error_message': "Không tìm thấy đơn vị đăng ký"}, status=520)

    checkDangKy.trangthai = 3
    now = datetime.now()
    timestamp = now.timestamp()
    thoigian_duyet = parse_date_custom(timestamp)
    os.environ['TZ'] = 'UTC-7'
    time.tzset()
    tmp = datetime.now().strftime("%d/%m/%Y %H:%M")

    nguoidaidien_email = checkDangKy.nguoidaidien_email
    #gui email
    if nguoidaidien_email is not None and validate_email(nguoidaidien_email):
        data = '''
            Bộ Y tế (Cục quản lý Y dược cổ truyền) đã hủy yêu cầu đăng ký của đơn vị vào thời gian {}.
            <br>
            Liên hệ cán bộ Cục để biết thêm thông tin chi tiết. Trân trọng cảm ơn!
        '''.format(tmp)
        subject = "Xét duyệt tài khoản truy cập hệ thống truy xuất nguồn gốc dược liệu"
        await send_mail(subject, nguoidaidien_email, data)

    db.session.commit()
    return json({'error_code':'Successful'}, status=200)


# api for send suggestion
@app.route('/api/v1/suggestion', methods=['POST'])
async def suggestion_and_send_email(request):
    param = request.json
    user_id = param.get("id",None)
    ho_ten = param.get("fullname", None)
    phone = param.get("phone")
    email = param.get("email")
    created_at = param.get("created_at",None)
    data = param.get("data",None)
    user_suggestion = {"create_at": created_at, "suggestion": data}

    #send email
    subject = "Góp ý Phần mềm báo cáo vật tư phòng chống dịch Dược liệu COCQ"
    # await send_mail(subject, "baycaouocmo8@gmail.com", data)
    await send_mail(subject, "dangnam89@gmail.com", data)
    # await send_mail(subject, "tienduy296@gmail.com", data)
    #end send email

    if user_id is None:
        return json({"error_code": "ERROR_PARAM", "error_message": "Tài khoản không tồn tại"}, status=520)
    suggestion = db.session.query(Suggestion).filter(Suggestion.user_id == user_id).first()
    if suggestion is not None:
        content_list = suggestion.content
        content_list.append(user_suggestion)
        suggestion.content = content_list
        db.session.commit()
    else:
        suggestion_user = Suggestion()
        suggestion_user.id = default_uuid()
        suggestion_user.user_id = user_id
        suggestion_user.ho_ten = ho_ten
        suggestion_user.email = email
        suggestion_user.so_dien_thoai = phone
        content = []
        content.append(user_suggestion)
        suggestion_user.content = content
        db.session.add(suggestion_user)
        db.session.commit()

    return json({"error_message" : "Gửi email thành công"},status=200)
