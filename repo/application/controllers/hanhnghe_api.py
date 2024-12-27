
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
from application.models.model_hanhnghe import *

    
apimanager.create_api(CoSoHanhNghe,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user, pre_put_insert_tenkhongdau, preprocess_convert_diachi], PUT_SINGLE=[validate_user, pre_put_insert_tenkhongdau, preprocess_convert_diachi], DELETE_SINGLE=[pre_delete], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='coso_hanhnghe')

apimanager.create_api(NguoiHanhNgheCoSoKD,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user, pre_put_insert_tenkhongdau, preprocess_convert_diachi], PUT_SINGLE=[validate_user, pre_put_insert_tenkhongdau, preprocess_convert_diachi], DELETE_SINGLE=[pre_delete], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='nguoi_hanhnghe')

async def pre_post_chungchi_hanhnghe(request=None, data=None, Model=None, **kw):
    currentUser = current_user(request)
    if currentUser is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    nguoi_hanhnghe_id = data.get("nguoi_hanhnghe_id")
    if nguoi_hanhnghe_id is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Tham số không hợp lệ"}, status=520)
    nguoi_hanhnghe = db.session.query(
        NguoiHanhNgheCoSoKD.id,
        NguoiHanhNgheCoSoKD.ten,
        NguoiHanhNgheCoSoKD.ngaysinh,
        NguoiHanhNgheCoSoKD.gioitinh,
        NguoiHanhNgheCoSoKD.email,
        NguoiHanhNgheCoSoKD.sodienthoai,
        NguoiHanhNgheCoSoKD.ma_cong_dan,
        NguoiHanhNgheCoSoKD.diachi
    ).filter(
        NguoiHanhNgheCoSoKD.id == nguoi_hanhnghe_id,
        NguoiHanhNgheCoSoKD.deleted == False
    ).first()
    if nguoi_hanhnghe is None:
        return json({"error_code": "PARAM_ERROR",'error_message': "Không tìm thấy thông tin người hành nghề"}, status=520)
    data['nguoi_hanhnghe'] = nguoi_hanhnghe._asdict()

apimanager.create_api(ChungChiHanhNghe,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[pre_post_chungchi_hanhnghe], PUT_SINGLE=[validate_user], DELETE_SINGLE=[pre_delete], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_stt], POST=[], PUT_SINGLE=[]),
    collection_name='chungchi_hanhnghe')