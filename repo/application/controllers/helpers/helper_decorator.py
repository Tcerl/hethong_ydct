from application.extensions import apimanager
from gatco_restapi.helpers import to_dict
from application.server import app
from sqlalchemy import or_, asc, desc, and_
from gatco.response import json
from datetime import datetime
import ujson
import asyncio
import aiohttp
import time
import xlrd
import math

from application.controllers.helpers.helper_common import current_user
from application.database import db, redisdb
from application.models.model_donvi import DonVi
from application.models.models import AppInfo


#decorator
def validate_authen(authen=True, roles=[], tuyendonvi=[]):
    def decorator(func_api):
        def wrapper(request, id=None, **kwargs1):
            currentUser = None
            if authen is True:
                currentUser = current_user(request)
                if currentUser is None:
                    return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
                is_permission = False
                for role in roles:
                    if currentUser.has_role(role) is True:
                        is_permission = True

                if len(roles) > 0 and is_permission is False:
                    return json({"error_code": "PARAM_ERROR", "error_message": "Bạn không có quyền thực hiện hành động này"}, status=520)
        
                current_donvi = currentUser.donvi
                if len(tuyendonvi) > 0 and current_donvi is not None and current_donvi.tuyendonvi_id not in tuyendonvi:
                    return json({"error_code": "PARAM_ERROR", "error_message": "Bạn không có quyền thực hiện hành động này"}, status=520)
            if id is not None:
                return func_api(request=request, currentUser=currentUser, id=id)
            return func_api(request=request, currentUser=currentUser)
        return wrapper
    return decorator

#decorator
def validate_authen_appinfo(authen=True):
    def decorator(func_api):
        def wrapper(request, **kwargs):
            token = request.headers.get("X-Auth-Token",None)
            if token is None:
                return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
            
            try:
                appkey = redisdb.get("sessions:" + token).decode('utf8')
                if appkey is None or str(appkey).strip() == "":
                    return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
                check_donvi = db.session.query(DonVi).join(AppInfo, AppInfo.id == DonVi.appinfo_id).filter(
                    DonVi.deleted == False,
                    AppInfo.appkey == appkey,
                ).first()
                if check_donvi is None:
                    return json({"error_code": "PARAM_ERROR", "error_message": "Không tìm thấy thông tin đơn vị kết nối"}, status=520)
                elif check_donvi.chophep_ketnoi is False:
                    return json({"error_code": "PARAM_ERROR", "error_message": "Đơn vị không được phép kết nối. Vui lòng liên hệ nền tảng YDCT"}, status=520)
                return func_api(request=request, donvi=check_donvi)
            except Exception as e:
                print("error=====", e)
                return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
        return wrapper
    return decorator


async def preprocess_getmany_appapi(request=None, data=None, Model=None, **kw):
    token = request.headers.get("X-Auth-Token",None)
    if token is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    try:
        appkey = redisdb.get("sessions:" + token).decode('utf8')
        if appkey is None or str(appkey).strip() == "":
            return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)

        check_donvi = db.session.query(DonVi).join(AppInfo, AppInfo.id == DonVi.appinfo_id).filter(
            DonVi.deleted == False,
            AppInfo.appkey == appkey,
        ).fisrt()
        if check_donvi is None:
            return json({"error_code": "PARAM_ERROR", "error_message": "Không tìm thấy thông tin đơn vị kết nối"}, status=520)
        elif check_donvi.chophep_ketnoi is False:
            return json({"error_code": "PARAM_ERROR", "error_message": "Đơn vị không được phép kết nối. Vui lòng liên hệ nền tảng YDCT"}, status=520)
    except Exception as e:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)