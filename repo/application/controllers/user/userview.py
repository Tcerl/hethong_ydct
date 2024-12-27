from application.database import redisdb,db
from application.server import app
from gatco.response import json,text, html
from application.extensions import jinja
from application.extensions import apimanager
import asyncio
import hashlib
import binascii
from application.client import HTTPClient 
import ujson
import uuid
from sqlalchemy import func
import time
from application.controllers.helpers.helper_common import *            
from application.extensions import auth
from sqlalchemy import or_, and_
from gatco_restapi.helpers import to_dict
from application.models.model_donvi import *
from application.controllers.helpers.EmailClient import send_active_account
from sqlalchemy.orm.attributes import flag_modified




#from application.controllers.admin import resp


def deny_func(request=None, **kw):
    return json({'error_code':"ERROR_PERMISSION_DENY", 'error_message':'Permission denied'}, status=520)

@app.route('/')
async def index(request):
    return jinja.render('index.html', request, current_time = "1")


@app.route('/landingpage')
async def index(request):
    return jinja.render('landingpage.html', request)


 

@app.route('/api/v1/current_user')
async def check_current_user(request):
    uid = current_uid(request)
    data = await get_current_user(request,uid)
    if data is None:
        return json({"error_code": "SESSION_EXPIRED", "error_msg": "Hết phiên làm việc, vui lòng đăng nhập lại!"},status=520)
    else:
        return json(data,status=200)
    
@app.route('/api/v1/login', methods=["POST"])
async def do_login(request):
    if not check_content_json(request):
        return json({"error_message":"content type is not application-json", "error_code":"PARAM_ERROR"}, status=520)
    
    param = request.json
    if "data" not in param or param['data'] is None or "password" not in param \
        or (param['password'] is None) or (len(param['data']) == 0) or (len(param['password']) == 0):
        return json({"error_message":"Tham số không hợp lệ", "error_code":"PARAM_ERROR"}, status=520)
    
    data = param['data']
    password = param['password']
    user = db.session.query(User).filter(and_(or_(User.phone == data, User.email == data), User.deleted == False)).first()
    if user is None:
        return json({"error_code":"LOGIN_FAILED", "error_message":u"Tài khoản không tồn tại"}, status=520)
    else:
        if auth.verify_password(password, user.password, user.salt):
            check_donvi = db.session.query(DonVi).filter(DonVi.id == user.donvi_id).first()
            if check_donvi is not None and check_donvi.active is not True:
                return json({"error_code":"LOGIN_FAILED", "error_message":u"Đơn vị trực thuộc hiện đang bị khóa. Vui lòng thử lại sau."}, status=520)
            profileUser = db.session.query(ProfileUser).filter(ProfileUser.id == user.id).first()
            result = response_current_user(profileUser)
            return json(result, status=200)
        else:
            return json({"error_code":"LOGIN_FAILED", "error_message":u"Mật khẩu không đúng"}, status=520)

        
@app.route('/logout', methods=['GET'])    
async def logout2(request):
    return logout(request)

@app.route('/api/v1/logout', methods=['GET'])
async def logout1(request):
    return logout(request)

def logout(request):
    token = request.headers.get("X-USER-TOKEN", None)
    if token is not None:
        #get uid
        uid = redisdb.get("sessions:" + token)
        if uid is not None:
            uid = uid.decode("utf8")
            redisdb.delete("sessions-uid:" + uid)
        redisdb.delete("sessions:" + token)
    
    return json({"error_message": "successful!"})
    
@app.route('/api/v1/user/changepw', methods=['POST'])
async def changepassword(request):
    error_msg = None
    params = request.json
    password = params['password']
    cfpassword = params['confirm_password']
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết hạn phiên làm việc"}, status=520)
    
    if((error_msg is None)):
        if(password != cfpassword ) :
            error_msg = u"Xin mời nhập lại mật khẩu!"
    
    salt = generator_salt()
    user = db.session.query(User).filter(User.id == uid_current).first()
    if user is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết hạn phiên làm việc"}, status=520)
    
    newpassword = auth.encrypt_password(str(password), str(salt))
    user.password = newpassword
    user.salt = salt
    db.session.commit()

    return json({"error_code": "OK", "error_message": "successfilly"},status=200) 

#api change profile for app     
@app.route('/api/v1/user/changeprofile', methods=["POST"])
async def change_profile(request):
    error_msg = None
    if request.method == 'POST':
        
        address = request.json.get('address', None)
        email = request.json.get('email', None)
        phone = request.json.get('phone', None)
        name = request.json.get('name', '')
        birthday = request.json.get('birthday', None)
        gender = request.json.get('gender', None)
        ma_bhyt = request.json.get('ma_bhyt', None)
        organization_id = request.json.get('organization_id', '')
        if(phone is None):
            if  not valid_phone_number(phone):
                error_msg = u"Số điện thoại không đúng định dạng, xin mời nhập lại!"

        uid_current = current_uid(request)
        if uid_current is None:
            return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết hạn phiên làm việc"}, status=520)

        user = db.session.query(User).filter(or_(User.phone == phone, User.email == email)).first()
        if user is not None and user.id != uid_current:
            return json({"error_code": "SESSION_EXPIRED", "error_message": "Số điện thoại hoặc email đã tồn tại trong hệ thống."}, status=520)

        current_user = db.session.query(User).filter(User.id == uid_current).first()
        if current_user is None:
            return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết hạn phiên làm việc"}, status=520)
        
        current_user.name = name
        current_user.phone = phone
        current_user.email = email
        current_user.unsigned_name = convert_text_khongdau(name)
        db.session.commit()

    return json({"error_code": "Ok", "error_message": "successfully", "data": response_current_user(current_user)},status=200)




async def change_profile_user(data, Model, **kw):
    param = data
    if ("id" not in param or param['id'] is None):
        return json({"error_message":"Tham số không hợp lệ", "error_code":"PARAM_ERROR"}, status=520)

    user = db.session.query(User).filter(and_(User.id == param["id"],User.deleted == False)).first()
    if user is None:
        return json({
                "error_code": "USER_NOT_FOUND",
                "error_message":"Không tìm thấy tài khoản cán bộ"
            }, status=520)
    dienthoai = param["dienthoai"]
    if param["dienthoai"] is None and param["email"] is None and param["taikhoan"] is None:
        return json({"error_message":"Tham số không hợp lệ.", "error_code":"PARAM_ERROR"}, status=520)
    
    if dienthoai is not None and (dienthoai[0] == 0  or dienthoai[0] == '0'):
        check_dienthoai = db.session.query(User).filter(and_(User.id != user.id,User.deleted == False)).filter(User.dienthoai == param["dienthoai"]).first()
        if check_dienthoai is not None:
            return json({"error_message":"Số điện thoại đã tồn tại, vui lòng nhập lại", "error_code":"PARAM_ERROR"}, status=520)
    if ("email" in param) and (param["email"] is not None) and (len(param["email"])>0):
        check_email = db.session.query(User).filter(and_(User.id != user.id,User.deleted == False)).filter(User.email == param["email"]).first()
        if check_email is not None:
            return json({"error_message":"Email đã tồn tại trong hệ thống, vui lòng chọn email khác", "error_code":"PARAM_ERROR"}, status=520)

    if ("taikhoan" in param) and (param["taikhoan"] is not None) and (len(param["taikhoan"])>0):
        check_taikhoan = db.session.query(User).filter(and_(User.id != user.id,User.deleted == False)).filter(User.taikhoan == param["taikhoan"]).first()
        if check_taikhoan is not None:
            return json({"error_message":"Tên đăng nhập đã tồn tại trong hệ thống, vui lòng nhập lại tên đăng nhập.", "error_code":"PARAM_ERROR"}, status=520)
    
    user.email = param["email"]
    user.dienthoai = param["dienthoai"]
    user.active = param["active"]
    user.hoten = param["hoten"]
    user.tenkhongdau = convert_text_khongdau(user.hoten)
    user.taikhoan = param["taikhoan"]
    roles_dict = []
    for role_user in param["vaitro"]:
        if isinstance(role_user, str):
            roles_dict.append(role_user)
        elif isinstance(role_user, dict) and "vaitro" in role_user:
            roles_dict.append(role_user["vaitro"])
    if len(roles_dict) == 0:
        roles_dict.append("canbo")
    list_role = db.session.query(Role).filter(\
        Role.vaitro.in_(roles_dict), \
        Role.deleted == False, \
    ).all()
    user.vaitro = list_role
    if("matkhau" in param and param["matkhau"] is not None and param["matkhau"] !=""):
        if user.salt is not None:
            newpassword = auth.encrypt_password(str(param['matkhau']), str(user.salt))
            user.password = newpassword
        else:
            salt = generator_salt()
            user.salt = salt
            newpassword = auth.encrypt_password(str(param['matkhau']), str(user.salt))
            user.password = newpassword

    user.deleted = param['deleted']
    user.deleted_by = param['deleted_by']
    db.session.commit()

    return json({"error_message": "successfully"}, status=200)


async def preprocess_create_user(data, Model, **kw):
    param = data
    user = User()

    dienthoai = param["dienthoai"]
    if param["dienthoai"] is None and param["email"] is None and param["taikhoan"] is None:
        return json({"error_message":"Tham số không hợp lệ.", "error_code":"PARAM_ERROR"}, status=520)
        
    if dienthoai is not None and (dienthoai[0] == 0  or dienthoai[0] == '0'):
        check_phone = db.session.query(User).filter(and_(User.id != user.id,User.deleted == False)).filter(User.dienthoai == param["dienthoai"]).first()
        if check_phone is not None:
            return json({"error_message":"Số điện thoại đã tồn tại, vui lòng nhập lại", "error_code":"PARAM_ERROR"}, status=520)
    if ("email" in param) and (param["email"] is not None) and (len(param["email"])>0):
        check_email = db.session.query(User).filter(and_(User.id != user.id,User.deleted == False)).filter(User.email == param["email"]).first()
        if check_email is not None:
            return json({"error_message":"Email đã tồn tại trong hệ thống, vui lòng chọn email khác", "error_code":"PARAM_ERROR"}, status=520)

    if ("taikhoan" in param) and (param["taikhoan"] is not None) and (len(param["taikhoan"])>0):
        check_taikhoan = db.session.query(User).filter(and_(User.id != user.id,User.deleted == False)).filter(User.taikhoan == param["taikhoan"]).first()
        if check_taikhoan is not None:
            return json({"error_message":"Tên đăng nhập đã tồn tại trong hệ thống, vui lòng nhập lại tên đăng nhập.", "error_code":"PARAM_ERROR"}, status=520)
    
    salt = generator_salt()

    user.email = param["email"]
    user.dienthoai = param["dienthoai"]
    user.active = 1
    user.hoten = param["hoten"]
    user.tenkhongdau = convert_text_khongdau(user.hoten)
    user.donvi_id = param["donvi_id"]
    user.taikhoan = param["taikhoan"]
    roles_dict = []
    for role_user in param["vaitro"]:
        if isinstance(role_user, str):
            roles_dict.append(role_user)
        elif isinstance(role_user, dict) and "vaitro" in role_user:
            roles_dict.append(role_user["vaitro"])
    if len(roles_dict) == 0:
        roles_dict.append("canbo")
    list_role = db.session.query(Role).filter(\
        Role.vaitro.in_(roles_dict), \
        Role.deleted == False, \
    ).all()
    user.vaitro = list_role
    
    if("matkhau" in param and param["matkhau"] is not None and param["matkhau"] !=""):
        newpassword = auth.encrypt_password(str(param['matkhau']), str(salt))
        user.password = newpassword
        user.salt = salt
    db.session.add(user)
    db.session.commit()
    return json({"error_message": "successfully"}, status=200)


apimanager.create_api(User,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user, pre_getmany_user], POST=[validate_admin_donvi,preprocess_create_user], PUT_SINGLE=[validate_user,change_profile_user], DELETE_SINGLE=[validate_admin, pre_delete]),
    exclude_columns= ["matkhau","salt","deleted"],
    collection_name='user')

apimanager.create_api(Role,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_admin], PUT_SINGLE=[validate_admin], DELETE_SINGLE=[validate_admin]),
    collection_name='role')


@app.route('/api/v1/user/create', methods=["POST"])
async def preprocess_create_user(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết hạn phiên làm việc"}, status=520)

    params = request.json
    '''
        note: chỉ được tạo user trong các trường hợp:
        TH1: admin hệ thống sửa thông tin
        TH2: admin đơn vị của đơn vị đó hoặc admin đơn vị cấp sở hoặc admin đơn vị cha cập nhật thông tin
    '''

    donvi_id = params.get('donvi_id')
    check_donvi = db.session.query(DonVi.id).filter(DonVi.deleted == False, DonVi.id == donvi_id).first()
    if check_donvi is None:
        return json({"error_message":"Không tìm thấy thông tin đơn vị", "error_code":"PARAM_ERROR"}, status=520)

    if currentUser.has_role("admin") is False and currentUser.has_role("admin_donvi") is False:
        return json({"error_code": "PERMISSION_DENY", "error_message": "Bạn không có quyền thực hiện hành động này"}, status=520)
    
    phone = params["dienthoai"].strip() if params['dienthoai'] is not None else None
    email = params["email"].strip() if params['email'] is not None else None

    if (email is None or str(email).strip() == "") and (phone is None  or str(phone).strip() == ""):
        return json({"error_message":"Vui lòng nhập email hoặc số điện thoại dùng để đăng nhập.", "error_code":"PARAM_ERROR"}, status=520)

    if phone is not None:
        if phone.isnumeric() is False:
            return json({"error_message":"Vui lòng nhập đúng định dạng số điện thoại", "error_code":"PARAM_ERROR"}, status=520)
    
        check_phone = db.session.query(User.id).filter(User.deleted == False, User.phone == phone).first()
        if check_phone is not None:
            return json({"error_message":"Số điện thoại đã tồn tại, vui lòng nhập lại", "error_code":"PARAM_ERROR"}, status=520)
    
    if email is not None:
        if validate_email(email) is False:
            return json({"error_message":"Email đã tồn tại, vui lòng nhập lại", "error_code":"PARAM_ERROR"}, status=520)

        check_email = db.session.query(User.id).filter(User.deleted == False, User.email == email).first()
        if check_email is not None:
            return json({"error_message":"Email đã tồn tại trong hệ thống, vui lòng chọn email khác", "error_code":"PARAM_ERROR"}, status=520)

    user = User(id = default_uuid())
    user.email = email
    user.phone = phone
    user.donvi_id = donvi_id
    user.active = 1
    user.salt = generator_salt()
    db.session.add(user)
    db.session.flush()

    roles_str = []
    roles = params['vaitro']
    if isinstance(roles, list) is False or len(roles) == 0:
        return json({"error_message":"Vui lòng chọn vai trò", "error_code":"PARAM_ERROR"}, status=520)
    elif isinstance(roles[0], str):
        for role_user in roles:
            roles_str.append(role_user)
    elif isinstance(roles[0], dict):
        for role_user in roles:
            roles_str.append(role_user['name'])

    roles_user = db.session.query(Role).filter(Role.deleted == False, Role.vaitro.in_(roles_str)).all()
    if len(roles_user) == 0:
        return json({"error_message":"Vui lòng chọn vai trò", "error_code":"PARAM_ERROR"}, status=520)
        
    user.roles = roles_user

    if "password" in params and params["password"] is not None and params["password"] !="":
        newpassword = auth.encrypt_password(str(params['password']), str(user.salt))
        user.password = newpassword

    
    profile_user = ProfileUser()
    profile_user.id = user.id
    profile_user.active = 1
    profile_user.hoten = params.get('hoten')
    profile_user.tenkhongdau = convert_text_khongdau(profile_user.hoten)
    profile_user.email = email
    profile_user.dienthoai = phone
    profile_user.vaitro = roles_str
    profile_user.donvi_id = donvi_id

    db.session.add(profile_user)
    
    db.session.commit()
    return json({"error_message": "successfully"}, status=200)


@app.route('/api/v1/user/update', methods=["POST"])
async def change_profile_user(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết hạn phiên làm việc"}, status=520)

    params = request.json
    if "id" not in params or params['id'] is None:
        return json({"error_message":"Tham số không hợp lệ", "error_code":"params_ERROR"}, status=520)

    user = db.session.query(User).filter(and_(User.id == params["id"],User.deleted == False)).first()
    if user is None:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"Không tìm thấy tài khoản cán bộ"
        }, status=520)
    '''
        note: chỉ được sửa thông tin user trong các trường hợp:
        TH1: sửa thông tin chính tài khoản đang đăng nhập
        TH2: admin hệ thống sửa thông tin
        TH3: admin đơn vị của đơn vị đó hoặc admin đơn vị cấp sở hoặc admin đơn vị cha cập nhật thông tin
    '''

    donvi_id = params.get('donvi_id')
    check_donvi = db.session.query(DonVi.id).filter(DonVi.deleted == False, DonVi.id == donvi_id).first()
    if check_donvi is None:
        return json({"error_message":"Không tìm thấy thông tin đơn vị", "error_code":"params_ERROR"}, status=520)

    if currentUser.id == params['id'] or currentUser.has_role("admin") or currentUser.has_role("admin_donvi"):
        phone = params["dienthoai"].strip() if params['dienthoai'] is not None else None
        email = params["email"].strip() if params['email'] is not None else None

        if (email is None or str(email).strip() == "") and (phone is None  or str(phone).strip() == ""):
            return json({"error_message":"Vui lòng nhập email hoặc số điện thoại dùng để đăng nhập.", "error_code":"PARAM_ERROR"}, status=520)

        if phone is not None and phone.isnumeric() is False:
            return json({"error_message":"Vui lòng nhập đúng định dạng số điện thoại", "error_code":"PARAM_ERROR"}, status=520)
        elif phone is not None:
            check_phone = db.session.query(User.id).filter(User.id != user.id, User.deleted == False, User.phone == phone).first()
            if check_phone is not None:
                return json({"error_message":"Số điện thoại đã tồn tại, vui lòng nhập lại", "error_code":"PARAM_ERROR"}, status=520)
        
        if email is not None:
            if validate_email(email) is False:
                return json({"error_message":"Email đã tồn tại, vui lòng nhập lại", "error_code":"PARAM_ERROR"}, status=520)

            check_email = db.session.query(User.id).filter(User.id != user.id, User.deleted == False, User.email == email).first()
            if check_email is not None:
                return json({"error_message":"Email đã tồn tại trong hệ thống, vui lòng chọn email khác", "error_code":"PARAM_ERROR"}, status=520)

        user.email = email
        user.phone = phone

        roles_str = []
        roles = params['vaitro']
        if isinstance(roles, list) is False or len(roles) == 0:
            return json({"error_message":"Vui lòng chọn vai trò", "error_code":"PARAM_ERROR"}, status=520)
        elif isinstance(roles[0], str):
            for role_user in roles:
                roles_str.append(role_user)
        elif isinstance(roles[0], dict):
            for role_user in roles:
                roles_str.append(role_user['name'])

        roles_user = db.session.query(Role).filter(Role.deleted == False, Role.vaitro.in_(roles_str)).all()
        if len(roles_user) == 0:
            return json({"error_message":"Vui lòng chọn vai trò", "error_code":"PARAM_ERROR"}, status=520)
            
        user.roles = roles_user
        '''
            note: chỉ cập nhật password ở API này với admin hệ thống hoặc admin đơn vị quản lý
        '''
        if currentUser.id != params['id'] and "password" in params and params["password"] is not None and params["password"] !="":
            if user.salt is None:
                user.salt = generator_salt()
            newpassword = auth.encrypt_password(str(params['password']), str(user.salt))
            user.password = newpassword
            db.session.add(user)
            db.session.commit()

        profile_user = db.session.query(ProfileUser).filter(ProfileUser.deleted == False, ProfileUser.id == user.id).first()
        if profile_user is None:
            profile_user = ProfileUser()
            profile_user.id = user.id
            profile_user.active = 1
            profile_user.donvi_id = donvi_id
            db.session.add(profile_user)
            db.session.flush()
            
        profile_user.hoten = params.get('hoten')
        profile_user.tenkhongdau = convert_text_khongdau(profile_user.hoten)
        profile_user.macongdan = params.get('macongdan')
        profile_user.email = email
        profile_user.dienthoai = phone
        profile_user.vaitro = roles_str
        
        db.session.commit()
        return json({"error_message": "successfully"}, status=200)

    return json({"error_code": "PERMISSION_DENY", "error_message": "Bạn không có quyền thực hiện hành động này"}, status=520)
    
    
async def preprocess_profile_user(request=None, data=None, Model=None, **kw):
    currentUser = current_user(request)
    if currentUser is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    data['tenkhongdau'] = convert_text_khongdau(data['hoten'])  

async def postprocess_update_profile(request, Model, result,  **kw):  
    dienthoai = result['dienthoai']
    user = db.session.query(User).filter(and_(User.id == result["id"],User.deleted == False)).first()
    if(user is not None):
        user.phone = dienthoai
        db.session.commit()

apimanager.create_api(ProfileUser,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[deny_request], PUT_SINGLE=[deny_request], DELETE_SINGLE=[deny_request], PUT_MANY=[deny_request], DELETE_MANY=[deny_request]),
    postprocess=dict(GET_MANY=[postprocess_stt]),
    collection_name='profile_user')

@app.route('/api/v1/user/change_status', methods=["POST"])
async def preprocess_create_user(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết hạn phiên làm việc"}, status=520)

    current_donvi = currentUser.donvi
    #note: đã là vai trò admin_donvi , bắt buộc phải có đơn vị 
    if currentUser.has_role("admin_donvi") is True and current_donvi is None:
        return json({"error_message":"Bạn không có quyền thực hiện hành động này", "error_code":"PARAM_ERROR"}, status=520)

    params = request.json
    if "id" not in params or params['id'] is None:
        return json({"error_message":"Tham số không hợp lệ", "error_code":"params_ERROR"}, status=520)

    user = db.session.query(User).filter(
        User.id == params["id"],
        User.deleted == False
    ).first()
    if user is None:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"Không tìm thấy tài khoản cán bộ"
        }, status=520)
    
    check_profile = db.session.query(ProfileUser).filter(ProfileUser.id == user.id, ProfileUser.deleted == False).first()
    if check_profile is None:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"Không tìm thấy tài khoản cán bộ"
        }, status=520)

    active = params.get("active", 0)
    user.active = active
    check_profile.active = active
    db.session.commit()
    return json({"error_message": "successfully"}, status=200)