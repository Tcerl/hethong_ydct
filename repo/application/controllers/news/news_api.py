# import asyncio
import aiohttp
import hashlib
import ujson

from application.extensions import apimanager
from application.server import app
from gatco.response import json, text, html
from application.database import redisdb, db, mdb
from application.controllers.helpers.helper_common import *
from sqlalchemy import or_, and_, desc, asc
import uuid
import time
from application.database.model import default_uuid
from application.models.models_tintuc import *
from application.models.model_donvi import *
import math
from operator import itemgetter
import requests
from bson.objectid import ObjectId
from sqlalchemy.orm.attributes import flag_modified
from bson.son import SON
from slugify import slugify

SOURCE_POST = {
    "APP": "app",
    "WEB": "web"
}

async def preprocess_getmany_donvi(search_params=None, request=None, data=None, Model=None, **kw):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    
    results_per_page = int(request.args.get('results_per_page', 15))
    page_num = int(request.args.get('page', 1))
    offset = (page_num - 1) * results_per_page  
    query_filter = db.session.query(Model).filter(Model.deleted == False)
    
    donvi_id = None
    text_filter = None
    order_by_field = None
    order_by_direction = None
    
    user_id = None
    status = None
    category_id = None
    
    if 'filters' in search_params and '$and' in search_params['filters'] and isinstance(search_params['filters']['$and'], list): 
        for query_conditions in search_params['filters']['$and']:
            if 'donvi_id' in query_conditions:
                donvi_id = query_conditions['donvi_id']
            if 'text_filter' in query_conditions:
                text_filter = query_conditions['text_filter']
            if 'user_id' in query_conditions:
                user_id = query_conditions['user_id']
            if 'status' in query_conditions:
                status = query_conditions['status']
            if 'category_id' in query_conditions:
                category_id = query_conditions['category_id']
                
    if 'order_by' in search_params and isinstance(search_params['order_by'], list) and len(search_params['order_by']) > 0:
        order_by_field = search_params['order_by'][0]['field']
        order_by_direction = search_params['order_by'][0]['direction']
        
    if donvi_id is not None:
        query_filter = query_filter.filter(Model.donvi_id == donvi_id)
    elif currentUser.donvi is not None and currentUser.donvi.tuyendonvi_id == "2":
        query_filter = query_filter.join(DonVi, DonVi.id == Model.donvi_id).filter(DonVi.captren_id == currentUser.donvi_id)
        
    if text_filter is not None and text_filter.strip() != "":
        looking_for = '%{0}%'.format(convert_text_khongdau(text_filter))
        if Model.__tablename__ in ["post", "post_publish"]:
            query_filter = query_filter.filter(Model.unsigned_title.like(looking_for))
        else:
            query_filter = query_filter.filter(Model.unsigned_name.like(looking_for))
            
    if user_id is not None:
        query_filter = query_filter.filter(Model.user_id == user_id)
    if status is not None:
        if status == 8:
            # danh sach bai viet da tra
            query_filter = query_filter.filter(Model.status.notin_([6, 7]), Model.returned_by != "")
        else:
            query_filter = query_filter.filter(Model.status == status)
    if category_id is not None:
        query_filter = query_filter.filter(Model.category_id == category_id) 
        
        
    num_results = query_filter.count()
    total_pages = int(math.ceil(num_results / results_per_page))
    if order_by_field is not None:
        if order_by_direction == "desc":
            query_filter = query_filter.order_by(desc(getattr(Model, order_by_field)))
        else:
            query_filter = query_filter.order_by(getattr(Model, order_by_field))
    list_data = query_filter.limit(results_per_page).offset(offset).all()
    objects = []
    stt = offset + 1
    for item in list_data:
        item_dict = to_dict(item)
        donvi = db.session.query(DonVi.ten_coso).filter(DonVi.id == item_dict['donvi_id'], DonVi.deleted == False).first()
        item_dict['donvi_ten'] = ""
        if donvi is not None and donvi.ten_coso is not None:
            item_dict['donvi_ten'] = donvi.ten_coso
        item_dict['stt'] = stt
        stt += 1
        if Model.__tablename__ in ["post", "post_publish"]:
            item_dict['created_at'] = convert_to_strtime(item_dict['created_at'], 2)
            item_dict['publish_time'] = convert_timestamp_to_string(item_dict['publish_time'], "%H:%M, %d/%m/%Y")
            category = db.session.query(Category).filter(and_(Category.id == item_dict['category_id'], Category.deleted == False)).first()
            item_dict['category_name'] = category.name if category is not None else ""
            item_dict['category_path'] = category.path if category is not None else ""
            editor = db.session.query(ProfileUser.hoten).filter(ProfileUser.id == item_dict['user_id'], ProfileUser.deleted == False).first()
            item_dict['editor_name'] = editor.hoten if editor is not None else ""
            returner = db.session.query(ProfileUser.hoten).filter(ProfileUser.id == item_dict['returned_by'], ProfileUser.deleted == False).first()
            item_dict['returner_name'] = returner.hoten if returner is not None else ""
            item_dict['returned_time'] = convert_timestamp_to_string(item_dict['returned_time'], "%H:%M, %d/%m/%Y")
            
        objects.append(item_dict)
    return json({"page": page_num, "total_pages": total_pages, "num_results": num_results, "objects": objects}, status=200)
    

apimanager.create_api(Author,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[preprocess_getmany_donvi], POST=[preprocess_post_put_donvi, pre_put_insert_tenkhongdau], PUT_SINGLE=[preprocess_post_put_donvi, pre_put_insert_tenkhongdau], DELETE_SINGLE=[pre_delete], PUT_MANY=[pre_deny_put_many], DELETE_MANY=[pre_deny_put_many]),
    postprocess=dict(GET_MANY=[], POST=[],PUT_SINGLE=[]),
    collection_name='author'
)
 
# go bai, nhan bai
@app.route('/api/v1/post/changestatus', methods=['POST'])
async def change_status_post(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    
    if currentUser.donvi is None or currentUser.donvi.tuyendonvi_id != "3":
        return json({"error_code":"ERROR_PERMISSION","error_message":"Bạn không có quyền thực hiện chức năng này"},status=520)
    
    params = request.json
    post_id = params.get("post_id",None)
    status = params.get("status",None)

    if post_id is None or str(post_id) == "":
        return json({"error_code":"PARAM_ERROR","error_message":"Tham số không hợp lệ"},status=520)
    elif status is None or status not in [0, 2, 3, 4, 5, 6, 7]:
        return json({"error_code":"PARAM_ERROR","error_message":"Tham số không hợp lệ"},status=520)

    post = db.session.query(Post).filter(Post.id == post_id, Post.deleted == False).first()
    if post is None:
        return json({"error_code":"PARAM_ERROR","error_message":"Bài viết không tồn tại"},status=520)
    
    if currentUser.has_role("btv") and status not in [0, 7]:
        return json({"error_code":"ERROR_PERMISSION","error_message":"Bạn không có quyền thực hiện chức năng này"},status=520)
    
    post_publish = db.session.query(PostPublish).filter(PostPublish.id == post_id, PostPublish.deleted == False).first()
    
    if status == 0:  #phục hồi bài viết bị xóa
        if post.user_id != currentUser.id:
            return json({"error_code":"PARAM_ERROR","error_message":"Bạn không thể phục hồi bài viết không phải của mình"},status=520) 
        post.status = status
        post.updated_by = currentUser.id
        
        if post_publish is not None:
            if post_publish.status != 7:
                return json({"error_code":"PARAM_ERROR","error_message":"Bài viết chưa bị xóa, bạn không thể phục hồi bài viết"},status=520) 
             
            post_publish.status = status
            post_publish.updated_by = currentUser.id
    
    elif status == 2: #nhận biên tập bài viết
        if currentUser.has_role("admin") is False and currentUser.has_role("admin_donvi") is False and currentUser.has_role("canbo") is False:
            return json({"error_code":"ERROR_PERMISSION","error_message":"Bạn không có quyền thực hiện chức năng này"},status=520)
        post.status = status
        post.updated_by = currentUser.id
    
    elif status == 4: #trả bài viết
        if currentUser.has_role("admin") is False and currentUser.has_role("admin_donvi") is False and currentUser.has_role("canbo") is False:
            return json({"error_code":"ERROR_PERMISSION","error_message":"Bạn không có quyền thực hiện chức năng này"},status=520)

        post.status = status
        post.updated_by = currentUser.id
        post.returned_time = floor(time.time())
        post.returned_by = currentUser.id
        
    elif status == 7:  #xóa bài viết
        post.status = status
        post.updated_by = currentUser.id
        if post_publish is not None:
            if post_publish.status == 7:
                return json({"error_code":"PARAM_ERROR","error_message":"Bài viết đã bị xóa, bạn không thể xóa bài viết"},status=520) 
            if post_publish.status == 6:
                return json({"error_code":"PARAM_ERROR","error_message":"Bài viết đang được đăng, bạn không thể thực hiện chức năng này"},status=520) 
            post_publish.status = status
            post_publish.updated_by = currentUser.id
    
    elif status == 3:  #sửa bài viết khi đang xem ở tab Bài đang xuất bản và Bài bị gỡ
        if post_publish is None:
            return json({"error_code":"PARAM_ERROR","error_message":"Bài viết không tồn tại"},status=520)
        if currentUser.has_role("admin") is False and currentUser.has_role("admin_donvi") is False and currentUser.has_role("canbo") is False:
            return json({"error_code":"ERROR_PERMISSION","error_message":"Bạn không có quyền thực hiện chức năng này"},status=520)
        if post.status in [5, 6]:
            post.status = status
            post.updated_by = currentUser.id
                        
    elif status == 5: #gỡ bài viết
        if post_publish is None:
            return json({"error_code":"PARAM_ERROR","error_message":"Bài viết không tồn tại"},status=520)
        if currentUser.has_role("admin") is False and currentUser.has_role("admin_donvi") is False and currentUser.has_role("canbo") is False:
            return json({"error_code":"ERROR_PERMISSION","error_message":"Bạn không có quyền thực hiện chức năng này"},status=520)
        post_publish.status = status
        post_publish.updated_by = currentUser.id
        if post.status == 6:
            post.status = status
            post.updated_by = currentUser.id
            
    elif status == 6: #đăng bài viết
        if post_publish is None:
            return json({"error_code":"PARAM_ERROR","error_message":"Bài viết không tồn tại"},status=520)
        if currentUser.has_role("admin") is False and currentUser.has_role("admin_donvi") is False and currentUser.has_role("canbo") is False:
            return json({"error_code":"ERROR_PERMISSION","error_message":"Bạn không có quyền thực hiện chức năng này"},status=520)
        post_publish.status = status
        post_publish.updated_by = currentUser.id
        post_publish.approved_time = floor(time.time())
        post_publish.approved_by = currentUser.id
        
    db.session.commit()
    
    post_dict = {}
    if status in [0, 2, 4, 7, 3]:
        post_dict = to_dict(post)
    elif status in [5, 6]:
        post_dict = to_dict(post_publish)
    mongo_item = {
        "post_id": str(post_id),
        "data": post_dict,
        "user_id": currentUser.id,
        "account_name": currentUser.hoten,
        "updated_time": convert_timestamp_to_string(time.time(), "%Y%m%d%H%M%S"),
        "action": "change_status",
        "ip": request.remote_addr
    }
    await mdb.db['lichsu_baiviet'].insert_one(mongo_item)
    del post_dict['status_send_notify']
    post_dict['hour_time'] = convert_timestamp_to_string(post_dict['publish_time'], "%H:%M")
    return json({"error_code":"OK","error_message":"successful", "data":post_dict},status=200)


@app.route('/api/v1/get_history_post', methods=['GET'])
async def get_history_post(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    filters = request.args.get("q")
    post_id = None
    if filters is not None:
        filters = ujson.loads(filters)
        post_id = filters['filters']["post_id"]["$eq"]
    if post_id is None or post_id == '':
        return json({"error_code": "PARAM_ERROR", "error_message": "Tham số không hợp lệ, vui lòng chọn lại bài viết"}, status=520)

    # query_filter = {"$and": [
    #     {"tenkhongdau": {"$eq": nguoidan["tenkhongdau"]}},
    #     {"$or": [
    #         {"nam_sinh": {"$eq": int(nguoidan['nam_sinh']) }},
    #         {"nam_sinh": {"$eq": str(nguoidan['nam_sinh']) }}
    #     ]},
    #     {"so_dien_thoai": {"$eq": nguoidan['so_dien_thoai']}}
    # ]}
    # count = await mdb.db["lichsu_baiviet"].count_documents(query_filter)
    danhsach = mdb.db["lichsu_baiviet"].find({"post_id": {"$eq": post_id}}).sort([("updated_time", -1)]).limit(20)
    response = await danhsach.to_list(None)
    result = []
    for index, obj in enumerate(response):
        new_obj ={}
        new_obj["stt"] = index + 1
        new_obj["id"] = str(obj['_id'])
        new_obj["post_id"] = obj["post_id"]
        new_obj["title"] = obj["data"]["title"]
        new_obj["description"] = obj["data"]["description"]
        new_obj["user_id"] = obj["user_id"]
        new_obj["account_name"] = obj["account_name"]
        new_obj["updated_time"] = obj["updated_time"]
        new_obj["action"] = obj["action"]
        new_obj["ip"] = obj["ip"]
        result.append(new_obj)
    return json({"error_code":"OK","error_message":"successful", "objects":result},status=200)

@app.route('/api/v1/get_detail_history_post', methods=['GET'])
async def get_detail_history_post(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    params = request.args
    post_id = params.get("post_id",None)
    id = params.get("id",None)
    if post_id is None or post_id == '' or id is None:
        return json({"error_code": "PARAM_ERROR", "error_message": "Tham số không hợp lệ, vui lòng chọn lại bài viết"}, status=520)

    lich_su = await mdb.db["lichsu_baiviet"].find_one({"_id": {"$eq": ObjectId(str(id))}})
    # ObjectId(str(resp_mdb.inserted_id)) }
    if lich_su is not None:
        del lich_su["_id"]
        return json({"error_code":"OK","error_message":"successful", "data":to_dict(lich_su)},status=200)
    else:
        return json({"error_code": "PARAM_ERROR", "error_message": "Không tìm thấy nội dung lịch sử"}, status=520)


async def pre_post_category(request=None, data=None, Model=None, **kw):
    currentUser = current_user(request)
    if currentUser is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    elif currentUser.donvi_id is None:
        return json({'error_code':'PARAM_ERORR', 'error_message':'Tham số không hợp lệ'}, status=520)
    
    name = data.get("name")
    if name is None or name.strip() == "":
        return json({'error_code':'PARAM_ERORR', 'error_message':'Vui lòng nhập tên chuyên mục'}, status=520)
    name = name.strip()
    data['name'] = name
    data['unsigned_name'] = convert_text_khongdau(name)
    
    if "priority" in data and (data['priority'] is None or data['priority'] == ""):
        data["priority"] = 10 #default
        
    if request.method == "POST":
        data['donvi_id'] = currentUser.donvi_id
        data['created_by'] = currentUser.id
        
        path = slugify(name.lower(), separator="-")
        stt = generate_counter(path, "category", currentUser.donvi_id)
        if stt != 1:
            path = path + "-v" + str(stt)
        data['path'] = path
        
    elif request.method == "PUT":
        data['updated_by'] = currentUser.id
        if "id" in data and data['id'] is not None:
            category = db.session.query(Category).filter(Category.id == data['id']).first()
            if category is None:
                return json({"error_code":"PARAM_ERROR","error_message":"Chuyên mục không tồn tại"},status=520)
            if category.unsigned_name != data['unsigned_name']:
                path = slugify(name.lower(), separator="-")
                stt = generate_counter(path, "category", currentUser.donvi_id)
                if stt != 1:
                    path = path + "-v" + str(stt)
                data['path'] = path
        else:
            return json({"error_code":"PARAM_ERROR","error_message":"Tham số không tồn tại"},status=520)
        
    if 'category_parent' in data:
        del data['category_parent']

async def preprocess_post(request=None, data=None, Model=None, **kw):
    currentUser = current_user(request)
    if currentUser is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    elif currentUser.donvi is None or currentUser.donvi.tuyendonvi_id != "3":
        return json({'error_code':'PARAM_ERORR', 'error_message':'Bạn không có quyền thực hiện chức năng này'}, status=520)
    
    title = data.get("title")
    if title is None or title.strip() == "":
        return json({'error_code':'PARAM_ERORR', 'error_message':'Vui lòng nhập tiêu đề bài viết'}, status=520)
    
    title = title.strip()
    data['title'] = title
    
    if "priority" in data and (data['priority'] is None or data['priority'] == ""):
        data["priority"] = 10 #default
    if 'publish_time' in data and data['publish_time'] is not None:
        if "hour_time" in data: 
            if data['hour_time'] is not None and data['hour_time'] != "":
                str_time = convert_timestamp_to_string(data['publish_time'], "%d/%m/%Y") + " " + data['hour_time']
                local_time = datetime.strptime(str_time,"%d/%m/%Y %H:%M")
                data['publish_time'] = local_time.timestamp()
            del data['hour_time']
        
    if "publish_time" not in data or data['publish_time'] is None or data['publish_time'] == "":
        if "hour_time" in data: 
            del data['hour_time']
        data['publish_time'] = convert_datetime_to_timestamp(time.time(), "%Y%m%d%H%M%S")
    if 'status_send_notify' in data:
        del data['status_send_notify']
    
    if 'ward_id' in data:
        del data['ward_id']
    if 'district_id' in data:
        del data['district_id']
    if 'province' in data:
        del data['province']
        
    if 'tags_display' in data:
        data['tags_unsigned'] = convert_text_khongdau(data['tags_display'])
        
    data['unsigned_title'] = convert_text_khongdau(title)
    
    path = None
    if data.get("default_path") is True:
        path = slugify(title.lower(), separator="-")
    else:
        if data.get("detail_path") is None or data.get("detail_path").strip() == "":
            return json({"error_code":"PARAM_ERROR","error_message":"Vui lòng nhập đường dẫn bài viết"},status=520)
        data['detail_path'] = data.get("detail_path").strip()
        path = slugify(data['detail_path'].lower(), separator="-")
   
    check_path = db.session.query(Post.id).filter(Post.path == path, Post.deleted == False).first()
    if check_path is not None:
        return json({'error_code':'PARAM_ERORR', 'error_message':'Đường dẫn bài viết bị trùng với 1 bài viết khác. Vui lòng kiểm tra lại'}, status=520)
    
    data['path'] = path
    
    data['created_by'] = currentUser.id
    data['user_id'] = currentUser.id
    data['donvi_id'] = currentUser.donvi_id
        
    
async def write_log_post(request=None, Model=None, result=None, **kw):
    currentUser = current_user(request)
    if currentUser is None:
        return False
    mongo_item = {
        "post_id": result["id"],
        "data": result,
        "user_id": currentUser.id,
        "donvi_id": result["donvi_id"],
        "account_name": currentUser.hoten,
        "updated_time": convert_timestamp_to_string(time.time(), "%Y%m%d%H%M%S"),
        "action": request.method,
        "ip": request.remote_addr
    }
    await mdb.db['lichsu_baiviet'].insert_one(mongo_item)


async def postprocess_get_single_post(request=None, Model=None, result=None, **kw):
    if result['status'] in [5, 6]:
        post_publish = db.session.query(PostPublish).filter(PostPublish.id == result['id'], PostPublish.deleted == False).first()
        if post_publish is not None:
            result = to_dict(post_publish)
    else:
        post_publish = db.session.query(PostPublish.status).filter(PostPublish.id == result['id'], PostPublish.status == 6, PostPublish.deleted == False).first()
        if post_publish is not None:
            result['status_post_publish'] = post_publish.status
        
    if 'publish_time' in result:
        result['hour_time'] = convert_timestamp_to_string(result['publish_time'], "%H:%M")
    
    del result['status_send_notify']
  
        
async def postprocess_get_single_post_publish(request=None, Model=None, result=None, **kw):
    if 'publish_time' in result:
        result['hour_time'] = convert_timestamp_to_string(result['publish_time'], "%H:%M")
    del result['status_send_notify']

async def postprocess_get_single_category(request=None, Model=None, result=None, **kw):
    result['category_parent'] = None
    if 'cate_parent_id' in result and result['cate_parent_id'] is not None:
        category = db.session.query(Category).filter(\
            Category.deleted == False,\
            Category.id == result['cate_parent_id'],\
        ).first()
        if category is not None:
            result['category_parent'] = to_dict(category)

async def pre_delete_post(request=None, instance_id=None, Model=None, **kw):
    currentUser = current_user(request)
    if currentUser is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    
    if currentUser.has_role("admin_donvi") or currentUser.has_role("admin") or currentUser.has_role("canbo") or currentUser.has_role("btv"):
        record = db.session.query(Model).filter(and_(Model.id == instance_id, Model.deleted == False)).first()
        if record is not None:
            record.deleted = True
            record.deleted_by = currentUser.id
            record.deleted_at = floor(time.time())
            db.session.commit()
            return json(to_dict(record), status=200)
        else:
            return json({'error_code':'NOT_FOUND', 'error_message':'Không tìm thấy dữ liệu tương ứng'}, status=520)
    else:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Bạn cần được cấp quyền để thực hiện chức năng này'}, status=520)

async def get_list_post(request=None, Model=None, result=None, **kw):
    objects = result['objects']
    if isinstance(objects, list) and len(objects) > 0:
        danhsach = []
        for post_dict in objects:
            category_id = post_dict['category_id']
            category = db.session.query(Category).filter(and_(Category.id == category_id, Category.deleted == False)).first()
            post_dict['category_name'] = category.name if category is not None else ""
            post_dict['category_path'] = category.path if category is not None else ""
            danhsach.append(post_dict)
        result['objects'] = danhsach

@app.route('/api/v1/get-list-category', methods = ["GET"])
async def get_list_category_api(request):   
    currentUser = current_user(request)
    if currentUser is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    elif currentUser.donvi_id is None:
        return json({'error_code':'PARAM_ERORR', 'error_message':'Tham số không hợp lệ'}, status=520)
    id = request.args.get('id', None)
    text_filter = request.args.get('text_filter', None)
    donvi_id = request.args.get('donvi_id', None)
    q_filter = db.session.query(Category).filter(Category.cate_parent_id == None, Category.deleted == False)
    if id is not None:
        q_filter = q_filter.filter(Category.id != id)
    looking_for = None
    if text_filter is not None:
        text_filter = convert_text_khongdau(text_filter)
        looking_for = '%{0}%'.format(text_filter)
        q_filter = q_filter.filter(Category.unsigned_name.ilike(looking_for))
    if donvi_id is not None:
        q_filter = q_filter.filter(Category.donvi_id == donvi_id)
    list_category = q_filter.order_by(Category.priority).all()
    danhsach = []
    if len(list_category) > 0:
        for category in list_category:
            category_dict = {
                "id": category.id,
                "name": category.name,
                "unsigned_name": category.unsigned_name,
                "path": category.path,
                "cate_parent_id": category.cate_parent_id
            }
            danhsach.append(category_dict)
            query_filter = db.session.query(Category).filter(Category.cate_parent_id == category.id, Category.deleted == False)
            if id is not None:
                query_filter = query_filter.filter(Category.id != id)
            if looking_for is not None:
                query_filter = query_filter.filter(Category.unsigned_name.ilike(looking_for))
            list_category_child = query_filter.order_by(Category.priority).all()
            for child in list_category_child:
                child_dict = {
                    "id": child.id,
                    "name": child.name,
                    "unsigned_name": child.unsigned_name,
                    "path": child.path,
                    "cate_parent_id": child.cate_parent_id
                }
                danhsach.append(child_dict)
    else:
        q_filter = db.session.query(Category).filter(Category.cate_parent_id != None, Category.deleted == False)
        if id is not None:
            q_filter = q_filter.filter(Category.id != id)
        if looking_for is not None:
            q_filter = q_filter.filter(Category.unsigned_name.ilike(looking_for))
        list_category = q_filter.order_by(Category.priority).all()
        for category in list_category:
            category_dict = {
                "id": category.id,
                "name": category.name,
                "unsigned_name": category.unsigned_name,
                "path": category.path,
                "cate_parent_id": category.cate_parent_id
            }
            danhsach.append(category_dict)
    return json({"objects": danhsach}, status = 200)

@app.route('/api/v1/get-list-category-parent', methods = ["GET"])
async def get_list_category_parent(request):   
    currentUser = current_user(request)
    if currentUser is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    elif currentUser.donvi_id is None:
        return json({'error_code':'PARAM_ERORR', 'error_message':'Tham số không hợp lệ'}, status=520)
    id = request.args.get('id', None)
    text_filter = request.args.get('text_filter', None)
    q_filter = db.session.query(Category).filter(Category.cate_parent_id == None, Category.deleted == False)
    if id is not None:
        q_filter = q_filter.filter(Category.id != id)
    looking_for = None
    if text_filter is not None:
        text_filter = convert_text_khongdau(text_filter)
        looking_for = '%{0}%'.format(text_filter)
        q_filter = q_filter.filter(Category.unsigned_name.ilike(looking_for))
    list_category = q_filter.order_by(Category.priority).all()
    danhsach = []
    for category in list_category:
        category_dict = {
            "id": category.id,
            "name": category.name,
            "unsigned_name": category.unsigned_name,
            "path": category.path,
            "cate_parent_id": category.cate_parent_id
        }
        danhsach.append(category_dict)
    return json({"objects": danhsach}, status = 200)

apimanager.create_api(Category,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[preprocess_getmany_donvi], POST=[pre_post_category], PUT_SINGLE=[pre_post_category], DELETE_SINGLE=[pre_delete], PUT_MANY=[deny_request], DELETE_MANY=[deny_request]),
    postprocess=dict(GET_SINGLE=[postprocess_get_single_category], GET_MANY=[generate_stt], POST=[], PUT_SINGLE=[]),
    collection_name='category')

#namdv edit ngay 15/4/2022
async def create_statistic_post(request=None, Model=None, result=None, **kw):
    statistic_post_web = {
            "post_id": result['id'],
            "total_comments": 0,
            "total_likes": 0,
            "total_saved": 0,
            "total_shared": 0,
            "total_views": 0,
            "total_action_promotion": 0,
            "total_click_adv": 0,
            "created_at": convert_timestamp_to_string(time.time(), "%Y%m%d%H%M%S"),
            "updated_at": convert_timestamp_to_string(time.time(), "%Y%m%d%H%M%S"),
            "source": SOURCE_POST['WEB'],
            "editor_id": result['user_id'],
            "publish_time": convert_timestamp_to_string(result['publish_time'], "%Y%m%d%H%M%S"),
            "donvi_id": result['donvi_id']
        }
    await mdb.db['statistic_post'].insert_one(statistic_post_web)
    
    statistic_post_app = {
            "post_id": result['id'],
            "total_comments": 0,
            "total_likes": 0,
            "total_saved": 0,
            "total_shared": 0,
            "total_views": 0,
            "total_action_promotion": 0,
            "total_click_adv": 0,
            "created_at": convert_timestamp_to_string(time.time(), "%Y%m%d%H%M%S"),
            "updated_at": convert_timestamp_to_string(time.time(), "%Y%m%d%H%M%S"),
            "source": SOURCE_POST['APP'],
            "editor_id": result['user_id'],
            "publish_time": convert_timestamp_to_string(result['publish_time'], "%Y%m%d%H%M%S"),
            "donvi_id": result['donvi_id']
        }
    await mdb.db['statistic_post'].insert_one(statistic_post_app)

async def preprocess_change_post(request=None, data=None, Model=None, **kw):
    currentUser = current_user(request)
    if currentUser is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    elif currentUser.donvi is None or currentUser.donvi.tuyendonvi_id != "3":
        return json({'error_code':'PARAM_ERORR', 'error_message':'Bạn không có quyền thực hiện chức năng này'}, status=520)
    if "id" not in data or data['id'] is None:
        return json({'error_code':'PARAM_ERORR', 'error_message':'Tham số không hợp lệ'}, status=520)
    
    title = data.get("title")
    if title is None or title.strip() == "":
        return json({'error_code':'PARAM_ERORR', 'error_message':'Vui lòng nhập tiêu đề bài viết'}, status=520)
    
    post = db.session.query(Post).filter(Post.id == data['id'], Post.donvi_id == currentUser.donvi_id, Post.deleted == False).first()
    if post is None:
        return json({"error_code":"PARAM_ERROR","error_message":"Không tìm thấy bài viết"},status=520) 
    elif post.status in [2, 3, 5, 6] and currentUser.has_role("btv"):
        return json({"error_code":"PARAM_ERROR","error_message":"Bài viết đã được nhận, bạn không thể thay đổi bài viết"},status=520)

    title = title.strip()
    data['title'] = title

    if 'publish_time' in data and data['publish_time'] is not None:
        if "hour_time" in data: 
            if data['hour_time'] is not None and data['hour_time'] != "":
                str_time = convert_timestamp_to_string(data['publish_time'], "%d/%m/%Y") + " " + data['hour_time']
                local_time = datetime.strptime(str_time,"%d/%m/%Y %H:%M")
                data['publish_time'] = local_time.timestamp()
            del data['hour_time']
        
    if "publish_time" not in data or data['publish_time'] is None or data['publish_time'] == "":
        if "hour_time" in data: 
            del data['hour_time']
        data['publish_time'] = convert_datetime_to_timestamp(time.time(), "%Y%m%d%H%M%S")
        
    if 'tags_display' in data:
        data['tags_unsigned'] = convert_text_khongdau(data['tags_display'])
        
    data['unsigned_title'] = convert_text_khongdau(title)
    
    path = None
    if data.get("default_path") is True:
        path = slugify(title.lower(), separator="-")
    else:
        if data.get("detail_path") is None or data.get("detail_path").strip() == "":
            return json({"error_code":"PARAM_ERROR","error_message":"Vui lòng nhập đường dẫn bài viết"},status=520)
        data['detail_path'] = data.get("detail_path").strip()
        path = slugify(data['detail_path'].lower(), separator="-")
      
      
    check_path = db.session.query(Post.id).filter(Post.id != data['id'], Post.path == path, Post.deleted == False).first()
    if check_path is not None:
        return json({'error_code':'PARAM_ERORR', 'error_message':'Đường dẫn bài viết bị trùng với 1 bài viết khác. Vui lòng kiểm tra lại'}, status=520)
    
    data['path'] = path
    
    post.title = data.get("title")
    post.unsigned_title = data.get("unsigned_title")
    post.path = data.get("path")
    post.detail_path = data.get("detail_path")
    post.default_path = data.get("default_path")
    post.description = data.get("description")
    post.content = data.get("content")
    post.image_thumbnail = data.get("image_thumbnail")
    post.avatar_doc = data.get("avatar_doc")
    post.avatar_vuong = data.get("avatar_vuong")
    post.avatar_share_fb = data.get("avatar_share_fb")
    post.tags = data.get("tags")
    post.status = data.get("status")
    # post.approved_time = post.approved_time
    # post.approved_by = post.approved_by
    post.publish_time = data.get("publish_time")
    # post.priority = post.priority
    post.tags_unsigned = data.get("tags_unsigned")
    post.tags_display = data.get("tags_display")
    post.is_highlights_home = data.get("is_highlights_home")
    post.is_highlights_category = data.get("is_highlights_category")
    post.style_display  = data.get("style_display")
    post.is_show = data.get("is_show")
    # post.user_id = post.user_id
    post.show_comment = data.get("show_comment")
    post.allowed_comment = data.get("allowed_comment")
    post.allow_show_advertisement = data.get("allow_show_advertisement")
    post.survey_id = data.get("survey_id")
    post.promotion_id = data.get("promotion_id")
    post.author_id = data.get("author_id")
    post.is_show_avatar = data.get("is_show_avatar")
    post.tac_gia = data.get("tac_gia")
    post.chuc_danh_tac_gia = data.get("chuc_danh_tac_gia")
    post.related_news = data.get("related_news")
    post.is_show_icon = data.get("is_show_icon")
    post.avatar_caption = data.get("avatar_caption")
    post.note = data.get("note")
    post.news_source = data.get("news_source")
    post.link_original_post = data.get("link_original_post")
    post.category_id = data.get("category_id")
    post.related_category = data.get("related_category")
    post.topic = data.get("topic")
    post.is_sensitive = data.get("is_sensitive")
    post.show_suggestion = data.get("show_suggestion")
    post.is_post_pr = data.get("is_post_pr")
    post.title_google = data.get("title_google")
    post.description_google = data.get("description_google")
    post.main_keyword = data.get("main_keyword")
    post.keywords = data.get("keywords")
    post.is_post_video = data.get("is_post_video")
    post.age_group = data.get("age_group")
    post.allow_send_notify = data.get("allow_send_notify")
    # post.status_send_notify = post.status_send_notify
    post.ward = data.get("ward")
    post.district = data.get("district")
    post.province_id = data.get("province_id")
    
    # post.created_at = post.created_at
    # post.created_by = post.created_by
    # post.updated_at = floor(time.time())
    post.updated_by = currentUser.id
    
    if data.get("status") == 6:
        post.approved_time = floor(time.time())
        post.approved_by = currentUser.id
        post.returned_by = None
        post.returned_time = None
        
        post_publish = db.session.query(PostPublish).filter(PostPublish.id == data['id'], PostPublish.deleted == False).first()
        if post_publish is None:
            post_publish = PostPublish()
            post_publish.id = data['id']
            
            post_publish.title = post.title
            post_publish.unsigned_title = post.unsigned_title
            post_publish.path = post.path
            post_publish.detail_path = post.detail_path
            post_publish.default_path = post.default_path
            post_publish.description = post.description
            post_publish.content = post.content
            post_publish.image_thumbnail = post.image_thumbnail
            post_publish.avatar_doc = post.avatar_doc
            post_publish.avatar_vuong = post.avatar_vuong
            post_publish.avatar_share_fb = post.avatar_share_fb
            post_publish.tags = post.tags
            post_publish.status = post.status
            post_publish.approved_time = post.approved_time
            post_publish.approved_by = post.approved_by
            post_publish.publish_time = post.publish_time
            post_publish.returned_time = post.returned_time
            post_publish.returned_by = post.returned_by
            post_publish.priority = post.priority
            post_publish.tags_unsigned = post.tags_unsigned
            post_publish.tags_display = post.tags_display
            post_publish.is_highlights_home = post.is_highlights_home
            post_publish.is_highlights_category = post.is_highlights_category
            post_publish.style_display  = post.style_display
            post_publish.is_show = post.is_show
            post_publish.user_id = post.user_id
            post_publish.show_comment = post.show_comment
            post_publish.allowed_comment = post.allowed_comment
            post_publish.allow_show_advertisement = post.allow_show_advertisement
            post_publish.survey_id = post.survey_id
            post_publish.promotion_id = post.promotion_id
            post_publish.author_id = post.author_id
            post_publish.is_show_avatar = post.is_show_avatar
            post_publish.tac_gia = post.tac_gia
            post_publish.chuc_danh_tac_gia = post.chuc_danh_tac_gia
            post_publish.related_news = post.related_news
            post_publish.is_show_icon = post.is_show_icon
            post_publish.avatar_caption = post.avatar_caption
            post_publish.note = post.note
            post_publish.news_source = post.news_source
            post_publish.link_original_post = post.link_original_post
            post_publish.category_id = post.category_id
            post_publish.related_category = post.related_category
            post_publish.topic = post.topic
            post_publish.is_sensitive = post.is_sensitive
            post_publish.show_suggestion = post.show_suggestion
            post_publish.is_post_pr = post.is_post_pr
            post_publish.title_google = post.title_google
            post_publish.description_google = post.description_google
            post_publish.main_keyword = post.main_keyword
            post_publish.keywords = post.keywords
            post_publish.is_post_video = post.is_post_video
            post_publish.age_group = post.age_group
            post_publish.allow_send_notify = post.allow_send_notify
            post_publish.status_send_notify = post.status_send_notify
            post_publish.ward = post.ward
            post_publish.district = post.district
            post_publish.province_id = post.province_id
            
            # post_publish.created_at = post.created_at
            post_publish.created_by = post.created_by
            # post_publish.updated_at = post.updated_at
            post_publish.updated_by = post.updated_by
            post_publish.donvi_id = post.donvi_id
            
            db.session.add(post_publish)
            db.session.flush()
            update_post = update(PostPublish).where(PostPublish.id == post.id).values(created_at = post.created_at, updated_at = post.updated_at)
            db.session.execute(update_post)
            
        else:         
            post_publish.title = post.title
            post_publish.unsigned_title = post.unsigned_title
            post_publish.path = post.path
            post_publish.detail_path = post.detail_path
            post_publish.default_path = post.default_path
            post_publish.description = post.description
            post_publish.content = post.content
            post_publish.image_thumbnail = post.image_thumbnail
            flag_modified(post_publish, "image_thumbnail")
            post_publish.avatar_doc = post.avatar_doc
            post_publish.avatar_vuong = post.avatar_vuong
            flag_modified(post_publish, "avatar_vuong")
            post_publish.avatar_share_fb = post.avatar_share_fb
            post_publish.tags = post.tags
            post_publish.status = post.status
            post_publish.approved_time = post.approved_time
            post_publish.approved_by = post.approved_by
            post_publish.publish_time = post.publish_time
            post_publish.returned_time = post.returned_time
            post_publish.returned_by = post.returned_by
            post_publish.priority = post.priority
            post_publish.tags_unsigned = post.tags_unsigned
            post_publish.tags_display = post.tags_display
            post_publish.is_highlights_home = post.is_highlights_home
            post_publish.is_highlights_category = post.is_highlights_category
            post_publish.style_display  = post.style_display
            post_publish.is_show = post.is_show
            post_publish.user_id = post.user_id
            post_publish.show_comment = post.show_comment
            post_publish.allowed_comment = post.allowed_comment
            post_publish.allow_show_advertisement = post.allow_show_advertisement
            post_publish.survey_id = post.survey_id
            post_publish.promotion_id = post.promotion_id
            post_publish.author_id = post.author_id
            post_publish.is_show_avatar = post.is_show_avatar
            post_publish.tac_gia = post.tac_gia
            post_publish.chuc_danh_tac_gia = post.chuc_danh_tac_gia
            post_publish.related_news = post.related_news
            flag_modified(post_publish, "related_news")
            post_publish.is_show_icon = post.is_show_icon
            post_publish.avatar_caption = post.avatar_caption
            post_publish.note = post.note
            post_publish.news_source = post.news_source
            post_publish.link_original_post = post.link_original_post
            post_publish.category_id = post.category_id
            post_publish.related_category = post.related_category
            flag_modified(post_publish, "related_category")
            post_publish.topic = post.topic
            post_publish.is_sensitive = post.is_sensitive
            post_publish.show_suggestion = post.show_suggestion
            post_publish.is_post_pr = post.is_post_pr
            post_publish.title_google = post.title_google
            post_publish.description_google = post.description_google
            post_publish.main_keyword = post.main_keyword
            post_publish.keywords = post.keywords
            post_publish.is_post_video = post.is_post_video
            post_publish.age_group = post.age_group
            flag_modified(post_publish, "age_group")
            post_publish.allow_send_notify = post.allow_send_notify
            post_publish.status_send_notify = post.status_send_notify
            post_publish.ward = post.ward
            flag_modified(post_publish, "ward")
            post_publish.district = post.district
            flag_modified(post_publish, "district")
            post_publish.province_id = post.province_id
            
            post_publish.updated_by = post.updated_by
        
    db.session.commit()
    
    #change publish_time collection statistic_post mdb
    item_statistic_post = {
        "$set": {
            "publish_time": convert_timestamp_to_string(data['publish_time'], "%Y%m%d%H%M%S")
        }
    }
    
    await mdb.db['statistic_post'].update_many(
        {"post_id" : data['id'] },
        item_statistic_post,
        upsert = False
    )
    
    #write_log_post
    mongo_item = {
        "post_id": data["id"],
        "data": data,
        "user_id": currentUser.id,
        "account_name": currentUser.hoten,
        "updated_time": convert_timestamp_to_string(time.time(), "%Y%m%d%H%M%S"),
        "action": request.method,
        "ip": request.remote_addr
    }
    await mdb.db['lichsu_baiviet'].insert_one(mongo_item)
       
    post_dict = to_dict(post)
    del post_dict['status_send_notify']
    return json(post_dict, status=200)

async def pre_get_list_post_filter(search_params=None,request=None, **kw):
    currentUser = current_user(request)
    if currentUser is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    elif currentUser.donvi_id is None:
        return json({'error_code':'PARAM_ERORR', 'error_message':'Tham số không hợp lệ'}, status=520)
    
    if "filters" in search_params and "$and" in search_params["filters"]:
        danh_sach = []
        for query_conditions in search_params['filters']['$and']:
            if 'unsigned_title' in query_conditions and '$likeI' in query_conditions['unsigned_title']:
                text = query_conditions['unsigned_title']['$likeI']
                query_conditions['unsigned_title']['$likeI'] = convert_text_khongdau(text)
                danh_sach.append(query_conditions)
            else:
                danh_sach.append(query_conditions)
        search_params['filters']['$and'] = danh_sach

apimanager.create_api(Post,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[preprocess_getmany_donvi], POST=[preprocess_post], PUT_SINGLE=[preprocess_change_post], DELETE_SINGLE=[pre_delete_post], PUT_MANY=[deny_request], DELETE_MANY=[deny_request]),
    postprocess=dict(GET_SINGLE=[postprocess_get_single_post], POST=[create_statistic_post, write_log_post], DELETE_SINGLE=[write_log_post]),
    collection_name='post')

apimanager.create_api(PostPublish,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[preprocess_getmany_donvi], POST=[deny_request], PUT_SINGLE=[deny_request], DELETE_SINGLE=[deny_request], PUT_MANY=[deny_request], DELETE_MANY=[deny_request]),
    postprocess=dict(GET_SINGLE=[postprocess_get_single_post_publish]),
    collection_name='post_publish')

@app.route('/api/v1/post_statistic')
async def post_statistic(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    
    results_per_page = int(request.args.get('results_per_page', 30))
    page_num = int(request.args.get('page', 1))
    offset = (page_num - 1) * results_per_page
    q = request.args.get('q')
    if q is not None:
        query = ujson.loads(q)
        text_filter = None
        publish_time_start = None
        publish_time_end = None
        user_id = None
        category_id = None
        donvi_id = None
        order_by_field = None
        order_by_direction = None
        if 'order_by' in query and isinstance(query['order_by'], list) and len(query['order_by']) > 0:
            order_by_field = query['order_by'][0]['field']
            order_by_direction = query['order_by'][0]['direction']
        if 'filters' in query and '$and' in query['filters']:
            for query_conditions in query['filters']['$and']:
                if 'text_filter' in query_conditions:
                    text_filter = query_conditions["text_filter"]
                if 'publish_time' in query_conditions:
                    if '$gte' in query_conditions['publish_time']:
                        publish_time_start = query_conditions['publish_time']['$gte']
                    if '$lte' in query_conditions['publish_time']:
                        publish_time_end = query_conditions['publish_time']['$lte']
                if 'user_id' in query_conditions: 
                    user_id = query_conditions['user_id']
                if 'category_id' in query_conditions:
                    category_id = query_conditions['category_id']
                if 'donvi_id' in query_conditions:
                    donvi_id = query_conditions['donvi_id']
            
        query_filter = db.session.query(
            PostPublish.id,
            PostPublish.title,
            PostPublish.created_at,
            PostPublish.publish_time,
            PostPublish.status,
            PostPublish.is_show,
            PostPublish.unsigned_title,
            PostPublish.category_id,
            PostPublish.tac_gia,
            PostPublish.user_id,
            PostPublish.image_thumbnail,
            PostPublish.donvi_id
        ).filter(
            PostPublish.status == 6, 
            PostPublish.deleted == False
        )
        if donvi_id is not None:
            query_filter = query_filter.filter(PostPublish.donvi_id == donvi_id)
        if text_filter is not None and text_filter.strip() != "":
            looking_for = '%{0}%'.format(convert_text_khongdau(text_filter))
            query_filter = query_filter.filter(PostPublish.unsigned_title.ilike(looking_for))
        if publish_time_start is not None:
            query_filter = query_filter.filter(PostPublish.publish_time >= publish_time_start)
        if publish_time_end is not None:
            query_filter = query_filter.filter(PostPublish.publish_time <= publish_time_end)
        if user_id is not None:
            query_filter = query_filter.filter(PostPublish.user_id == user_id)
        if category_id is not None:
            query_filter = query_filter.filter(PostPublish.category_id == category_id)

        if order_by_field == 'publish_time':
            if order_by_direction == 'asc':
                query_filter = query_filter.order_by(PostPublish.publish_time)
            elif order_by_direction == 'desc':
                query_filter = query_filter.order_by(PostPublish.publish_time.desc())
        
        num_results = query_filter.count()
        list_post = query_filter.limit(results_per_page).offset(offset).all()
        objects = []
        for post in list_post:
            category = db.session.query(Category).filter(Category.id == post.category_id, Category.deleted == False).first()
            user = db.session.query(ProfileUser).filter(ProfileUser.id == post.user_id, ProfileUser.deleted == False).first()
            category_name = ""
            if category is not None:
                category_name = category.name
            statistic_post_web = await mdb.db["statistic_post"].find_one({
                "$and": [
                    {"post_id": post.id},
                    {"source": SOURCE_POST['WEB']}
                ]
            })
            
            statistic_post_app = await mdb.db["statistic_post"].find_one({
                "$and": [
                    {"post_id": post.id},
                    {"source": SOURCE_POST['APP']}
                ]
            })
            total_views = 0
            total_shared = 0
            total_likes = 0
            total_comments = 0
            if statistic_post_web is not None and statistic_post_app is not None:
                total_views = statistic_post_web['total_views'] + statistic_post_app['total_views']
                total_shared = statistic_post_web['total_shared'] + statistic_post_app['total_shared']
                total_likes = statistic_post_web['total_likes'] + statistic_post_app['total_likes']
                total_comments = statistic_post_web['total_comments'] + statistic_post_app['total_comments']
            post_dict = {
                'id': post.id,
                'title': post.title,
                'created_at': convert_to_strtime(post.created_at, 2),
                'publish_time': convert_timestamp_to_string(post.publish_time, "%Hh:%M', %d/%m/%Y"),
                'status': post.status,
                'is_show': post.is_show,
                'unsigned_title': post.unsigned_title,
                'category_name': category_name,
                'total_views': total_views,
                'total_shared': total_shared,
                'total_likes': total_likes,
                'total_comments': total_comments,
                'image_thumbnail': post.image_thumbnail,
                'tac_gia': post.tac_gia,
                'editor_name': user.hoten if user is not None else ""
            }
            donvi = db.session.query(DonVi.ten_coso).filter(DonVi.id == post.donvi_id, DonVi.deleted == False).first()
            post_dict['donvi_ten'] = ""
            if donvi is not None and donvi.ten_coso is not None:
                post_dict['donvi_ten'] = donvi.ten_coso
            objects.append(post_dict)
        total_pages = int(math.ceil(num_results / results_per_page))
        return json({"page": page_num,"total_pages":total_pages,"num_results":num_results,"objects":objects},status=200)
    else:
        return json({'error_code':'PARAM_ERORR', 'error_message':'Tham số không hợp lệ'}, status=520)

apimanager.create_api(PostPublish,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[deny_request], GET_MANY=[validate_user], POST=[deny_request], PUT_SINGLE=[deny_request], DELETE_SINGLE=[deny_request], PUT_MANY=[deny_request], DELETE_MANY=[deny_request]),
    postprocess=dict(GET_MANY=[get_list_post]),
    include_columns = ['id', 'title', 'description', 'category_name', 'created_at', 'publish_time', 'status', 'is_show', 'category_id', 'category_path', 'image_thumbnail', 'unsigned_title', 'path'],
    collection_name='post_dialog')

async def postprocess_getmany_post(request=None, Model=None, result=None, **kw):
    objects = result['objects']
    if isinstance(objects, list) and len(objects) > 0:
        danhsach = []
        for post in objects:
            publish_time = convert_timestamp_to_string(post['publish_time'], "%d/%m/%Y %H:%M")
            category_id = post['category_id']
            category = db.session.query(Category).filter(and_(Category.id == category_id, Category.deleted == False)).first()
            category_name = ""
            if category is not None:
                category_name = category.name
            post_dict = {
                "id": post["id"],
                "title": post["title"],
                "description": post["description"],
                "path": post["path"],
                "image_thumbnail_url": app.config.get('DOMAIN_URL_VIEW_FILE') + post["image_thumbnail"].get('link'),
                "publish_time": publish_time,
                "category_name": category_name,
                "category_id": category_id
            }
            danhsach.append(post_dict)
        result['objects'] = danhsach

apimanager.create_api(PostPublish,
    methods=['GET'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[deny_request], GET_MANY=[pre_getmany_donvi], POST=[deny_request], PUT_SINGLE=[deny_request], DELETE_SINGLE=[deny_request], PUT_MANY=[deny_request], DELETE_MANY=[deny_request]),
    postprocess=dict(GET_MANY=[postprocess_getmany_post]),
    collection_name='get-related-news')

apimanager.create_api(PostPublish,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[deny_request], GET_MANY=[validate_user], POST=[deny_request], PUT_SINGLE=[deny_request], DELETE_SINGLE=[deny_request], PUT_MANY=[deny_request], DELETE_MANY=[deny_request]),
    include_columns = ['id', 'title', 'unsigned_title'],
    collection_name='search_post')

#api statistic
@app.route('/api/v1/statistic')
async def statistic(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    if currentUser.has_role("admin") is False and currentUser.has_role("admin_donvi") is False and currentUser.has_role("canbo") is False:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Bạn không có quyền truy cập"}, status=520)
    
    results_per_page = int(request.args.get('results_per_page', 15))
    page_num = int(request.args.get('page', 1))
    skip = (page_num - 1) * results_per_page
    time_start = None
    time_end = None
    mode = "views"
    q = request.args.get('q')
    if q is not None:
        query = ujson.loads(q)
        if 'filters' in query and '$and' in query['filters']:
            for query_conditions in query['filters']['$and']:
                if 'time' in query_conditions:
                    if '$gte' in query_conditions['time']:
                        time_start = convert_timestamp_to_string(query_conditions['time']['$gte'], "%Y%m%d%H%M%S")
                    if '$lte' in query_conditions['time']:
                        time_end = convert_timestamp_to_string(query_conditions['time']['$lte'], "%Y%m%d%H%M%S")
                if 'mode' in query_conditions:
                    mode = query_conditions['mode']['$eq']
    query_time = [{}]
    query_comment_status = {"status": {"$ne": 4}}
    list_post = []
    num_results = 0
    if time_start is not None:
        time = {"time": {"$gte": time_start}}
        query_time.append(time)
    if time_end is not None:
        time = {"time": {"$lte": time_end}}
        query_time.append(time)
    
    query_match = query_time
    table_name = ""
    if mode == "views":
        table_name = "view_post"
    elif mode == "likes":
        table_name = "like_post"
    elif mode == "shared":
        table_name = "share_post"
    elif mode == "comments":
        table_name = "comment_post"
        query_match = query_match + [query_comment_status]
        
    pipeline = [
        {"$match": {"$and": query_match}},
        {"$group": {"_id": "$post_id", "count": { "$sum": 1}}},
        {"$sort": {"count": -1 }},
        {"$skip": skip },
        {"$limit": results_per_page }
    ]
    pipeline_count = [
        {"$match": {"$and": query_match}},
        {"$group": {"_id": "$post_id"}},
        {"$count": "num_results"},
    ]
    danhsach = mdb.db[table_name].aggregate(pipeline)
    list_post = await danhsach.to_list(None)
    danhsach_count = mdb.db[table_name].aggregate(pipeline_count)
    danhsach_count = await danhsach_count.to_list(None)
    if len(danhsach_count) > 0 and danhsach_count[0]['num_results'] is not None:
        num_results = danhsach_count[0]['num_results']
        
    objects = []
    item_source_web = {
        "source": SOURCE_POST['WEB']
    }
    item_source_app = {
        "source": SOURCE_POST['APP']
    }
    stt = skip + 1
    for post in list_post:
        post_db = db.session.query(
            PostPublish.id,
            PostPublish.title,
            PostPublish.publish_time,
            PostPublish.image_thumbnail
        ).filter(PostPublish.id == post['_id']).first()
        if post_db is not None:
            item_post_id = {
                "post_id": post_db.id
            }
            query_filter_web = query_time + [item_post_id, item_source_web]
            query_filter_app = query_time + [item_post_id, item_source_app]
            views_web = await mdb.db["view_post"].count_documents({
                "$and": query_filter_web
            })
            views_app = await mdb.db["view_post"].count_documents({
                "$and": query_filter_app
            })
            likes_web = await mdb.db["like_post"].count_documents({
                "$and": query_filter_web
            })
            likes_app = await mdb.db["like_post"].count_documents({
                "$and": query_filter_app
            })
            shared_web = await mdb.db["share_post"].count_documents({
                "$and": query_filter_web
            })
            shared_app = await mdb.db["share_post"].count_documents({
                "$and": query_filter_app
            })
            comments_web = await mdb.db["comment_post"].count_documents({
                "$and": query_filter_web + [query_comment_status]
            })
            comments_app = await mdb.db["comment_post"].count_documents({
                "$and": query_filter_app + [query_comment_status]
            })
            
            post_dict = {
                'id': post_db.id,
                'title': post_db.title,
                'total_views': views_web + views_app,
                'total_shared': shared_web + shared_app,
                'total_likes': likes_web + likes_app,
                'total_comments': comments_web + comments_app,
                'image_thumbnail': app.config.get("DOMAIN_URL_VIEW_FILE") + post_db.image_thumbnail.get("link"),
                'views_web': views_web,
                'views_app': views_app,
                'likes_web': likes_web,
                'likes_app': likes_app,
                'comments_web': comments_web,
                'comments_app': comments_app,
                'shared_web': shared_web,
                'shared_app': shared_app,
                'stt': stt
            }
            stt = stt + 1
            objects.append(post_dict)
    total_pages = int(math.ceil(num_results / results_per_page))
    return json({"page": page_num, "total_pages": total_pages, "num_results": num_results, "objects": objects},status=200)
        
@app.route('/api/v1/statistic-overview')
async def statistic_overview(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    if currentUser.has_role("admin") is False and currentUser.has_role("admin_donvi") is False and currentUser.has_role("canbo") is False:
        return json({"error_code": "ERROR_PERMISSION", "error_message": "Bạn không có quyền truy cập"}, status=520)
    
    time_start = None
    time_end = None
    q = request.args.get('q')
    if q is not None:
        query = ujson.loads(q)
        if '$and' in query:
            for query_conditions in query['$and']:
                if 'time' in query_conditions:
                    if '$gte' in query_conditions['time']:
                        time_start = convert_timestamp_to_string(query_conditions['time']['$gte'], "%Y%m%d%H%M%S")
                    if '$lte' in query_conditions['time']:
                        time_end = convert_timestamp_to_string(query_conditions['time']['$lte'], "%Y%m%d%H%M%S")
    query_filter = [{}]
    query_comment_status = {"status": {"$ne": 4}}
    if time_start is not None:
        item_time = {"time": {"$gte": time_start}}
        query_filter.append(item_time)
    if time_end is not None:
        item_time = {"time": {"$lte": time_end}}
        query_filter.append(item_time)
    total_views = 0
    total_likes = 0
    total_shared = 0
    total_comments = 0
    
    total_views = await mdb.db["view_post"].count_documents({
        "$and": query_filter
    })
    total_likes = await mdb.db["like_post"].count_documents({
        "$and": query_filter
    })
    total_shared = await mdb.db["share_post"].count_documents({
        "$and": query_filter
    })
    total_comments = await mdb.db["comment_post"].count_documents({
        "$and": query_filter + [query_comment_status]
    })

    results = {
        "total_views": total_views,
        "total_likes": total_likes,
        "total_shared": total_shared,
        "total_comments": total_comments 
    }
    return json(results, status=200) 
    
@app.route('/api/v1/list-user')
async def get_list_user(request):   
    currentUser = current_user(request)
    if currentUser is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    elif currentUser.donvi_id is None:
        return json({'error_code':'PARAM_ERORR', 'error_message':'Tham số không hợp lệ'}, status=520)
    query_filter = db.session.query(
        ProfileUser.id,
        ProfileUser.hoten,
        ProfileUser.tenkhongdau,
        ProfileUser.dienthoai
    ).filter(
        ProfileUser.donvi_id == currentUser.donvi_id, 
        ProfileUser.deleted == False
    )
    text_filter = request.args.get('text_filter', None)
    if text_filter is not None:
        text_filter = convert_text_khongdau(text_filter)
        looking_for = '%{0}%'.format(text_filter)
        query_filter = query_filter.filter(ProfileUser.tenkhongdau.ilike(looking_for))
    list_user = query_filter.order_by(ProfileUser.hoten).limit(15).all()
    danhsach = []
    for user in list_user:
        danhsach.append(user._asdict())
    return json({"objects": danhsach}, status = 200)
    
@app.route('/api/v1/statistic-editor')
async def statistic_editor(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    if currentUser.has_role("admin") is False and currentUser.has_role("admin_donvi") is False and currentUser.has_role("canbo") is False:
        return json({"error_code": "ERROR_PERMISSION", "error_message": "Bạn không có quyền truy cập"}, status=520)
    
    results_per_page = int(request.args.get('results_per_page', 15))
    page_num = int(request.args.get('page', 1))
    offset = (page_num - 1) * results_per_page
    time_start = None
    time_end = None
    mode = "all"
    editor = None
    q = request.args.get('q')
    if q is not None:
        query = ujson.loads(q)
        if 'filters' in query and '$and' in query['filters']:
            for query_conditions in query['filters']['$and']:
                if 'time' in query_conditions:
                    if '$gte' in query_conditions['time']:
                        time_start = query_conditions['time']['$gte']
                    if '$lte' in query_conditions['time']:
                        time_end = query_conditions['time']['$lte']
                if 'mode' in query_conditions:
                    mode = query_conditions['mode']['$eq']
                if 'editor' in query_conditions:
                    editor = query_conditions['editor']['$eq']
    query_filter = None
    if mode == "all":
        query_filter = db.session.query(
            Post.id,
            Post.title,
            Post.created_at,
            Post.publish_time,
            Post.returned_time,
            Post.status,
            Post.image_thumbnail
        ).filter(Post.status != 7, Post.deleted == False)
        
    elif mode == "published":
        query_filter = db.session.query(
            PostPublish.id,
            PostPublish.title,
            PostPublish.created_at,
            PostPublish.publish_time,
            PostPublish.returned_time,
            PostPublish.status,
            PostPublish.image_thumbnail
        ).filter(PostPublish.status == 6, PostPublish.deleted == False)
        
    elif mode == "returned":
        query_filter = db.session.query(
            Post.id,
            Post.title,
            Post.created_at,
            Post.publish_time,
            Post.returned_time,
            Post.status,
            Post.image_thumbnail
        ).filter(Post.returned_by != None, Post.status != 7, Post.deleted == False)
        
    if time_start is not None:
        if mode == "all":
            query_filter = query_filter.filter(Post.created_at >= time_start)
        elif mode == "published":
            query_filter = query_filter.filter(PostPublish.publish_time >= time_start)
        elif mode == "returned":
            query_filter = query_filter.filter(Post.returned_time >= time_start)
        
    if time_end is not None:
        if mode == "all":
            query_filter = query_filter.filter(Post.created_at <= time_end)
        elif mode == "published":
            query_filter = query_filter.filter(PostPublish.publish_time <= time_end)
        elif mode == "returned":
            query_filter = query_filter.filter(Post.returned_time <= time_end)
    
    if editor is not None and editor != "1":
        if mode in ["all", "returned"]:
            query_filter = query_filter.filter(Post.user_id == editor)
        elif mode == "published":
            query_filter = query_filter.filter(PostPublish.user_id == editor)
    
    num_results = query_filter.count()
    total_pages = int(math.ceil(num_results / results_per_page))
    list_post = []
    if mode == "all":
        list_post = query_filter.order_by(Post.created_at.desc()).limit(results_per_page).offset(offset).all()
    elif mode == "published":
        list_post = query_filter.order_by(PostPublish.publish_time.desc()).limit(results_per_page).offset(offset).all()
    elif mode == "returned":
        list_post = query_filter.order_by(Post.returned_time.desc()).limit(results_per_page).offset(offset).all()
        
    objects = []
    stt = offset + 1
    for post in list_post:
        post_dict = post._asdict()
        post_dict['image_thumbnail'] = app.config.get("DOMAIN_URL_VIEW_FILE") + post.image_thumbnail.get("link")
        post_dict['created_at'] = convert_to_strtime(post.created_at, 2)
        post_dict['publish_time'] = convert_timestamp_to_string(post.publish_time, "%H:%M %d/%m/%Y")
        if post.returned_time is not None:
            post_dict['returned_time'] = convert_timestamp_to_string(post.returned_time, "%H:%M %d/%m/%Y")
        
        statistic_post_web = await mdb.db["statistic_post"].find_one({
            "$and": [
                {"post_id": post.id},
                {"source": SOURCE_POST['WEB']}
            ]
        })
        
        statistic_post_app = await mdb.db["statistic_post"].find_one({
            "$and": [
                {"post_id": post.id},
                {"source": SOURCE_POST['APP']}
            ]
        })
        total_views = 0
        total_shared = 0
        total_likes = 0
        total_comments = 0
        if statistic_post_web is not None and statistic_post_app is not None:
            total_views = statistic_post_web['total_views'] + statistic_post_app['total_views']
            total_shared = statistic_post_web['total_shared'] + statistic_post_app['total_shared']
            total_likes = statistic_post_web['total_likes'] + statistic_post_app['total_likes']
            total_comments = statistic_post_web['total_comments'] + statistic_post_app['total_comments']
        
        post_dict['total_views'] = total_views
        post_dict['total_shared'] = total_shared
        post_dict['total_likes'] = total_likes
        post_dict['total_comments'] = total_comments
        post_dict['stt'] = stt
        stt = stt + 1
        objects.append(post_dict)
        
    return json({"page": page_num, "total_pages": total_pages, "num_results": num_results, "objects": objects}, status=200)
        
@app.route('/api/v1/statistic-editor-overview')
async def statistic_editor_overview(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    if currentUser.has_role("admin") is False and currentUser.has_role("admin_donvi") is False and currentUser.has_role("canbo") is False:
        return json({"error_code": "ERROR_PERMISSION", "error_message": "Bạn không có quyền truy cập"}, status=520)
    
    time_start = None
    time_end = None
    editor = None
    q = request.args.get('q')
    if q is not None:
        query = ujson.loads(q)
        if '$and' in query:
            for query_conditions in query['$and']:
                if 'time' in query_conditions:
                    if '$gte' in query_conditions['time']:
                        time_start = query_conditions['time']['$gte']
                    if '$lte' in query_conditions['time']:
                        time_end = query_conditions['time']['$lte']
                if 'editor' in query_conditions:
                    editor = query_conditions['editor']['$eq']
    
    query_filter_all = db.session.query(Post.id).filter(Post.status != 7, Post.deleted == False)
    query_filter_published = db.session.query(PostPublish.id).filter(PostPublish.status == 6, PostPublish.deleted == False)
    query_filter_returned = db.session.query(Post.id).filter(Post.returned_by != None, Post.status != 7, Post.deleted == False)
    
    if time_start is not None:
        query_filter_all = query_filter_all.filter(Post.created_at >= time_start)
        query_filter_published = query_filter_published.filter(PostPublish.publish_time >= time_start)
        query_filter_returned = query_filter_returned.filter(Post.returned_time >= time_start)
    if time_end is not None:
        query_filter_all = query_filter_all.filter(Post.created_at <= time_end)
        query_filter_published = query_filter_published.filter(PostPublish.publish_time <= time_end)
        query_filter_returned = query_filter_returned.filter(Post.returned_time <= time_end)
    if editor is not None and editor != "1":
        query_filter_all = query_filter_all.filter(Post.user_id == editor)
        query_filter_published = query_filter_published.filter(PostPublish.user_id == editor)
        query_filter_returned = query_filter_returned.filter(Post.user_id == editor)
        
    total_all = query_filter_all.count()
    total_published = query_filter_published.count()
    total_returned = query_filter_returned.count()
    results = {
        "total_all": total_all,
        "total_published": total_published,
        "total_returned": total_returned
    }
    return json(results, status=200)

@app.route('/api/v1/related-news', methods = ["POST"])
async def related_news(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    related_news = data.get("data")
    donvi_id = data.get("donvi_id")
    array_related_news = []
    if isinstance(related_news, list) and len(related_news) > 0:
        list_data = db.session.query(
            PostPublish.id,
            PostPublish.category_id,
            PostPublish.deleted,
            PostPublish.status,
            PostPublish.publish_time,
            PostPublish.title,
            PostPublish.description,
            PostPublish.path,
            PostPublish.image_thumbnail
        ).filter(
            PostPublish.id.in_(related_news),
            PostPublish.status == 6,
            PostPublish.deleted == False,
            PostPublish.donvi_id == donvi_id
        ).all()
        for post_db in list_data:
            category = db.session.query(Category).filter(Category.id == post_db.category_id, Category.deleted == False).first()
            post_dict = {
                'id': post_db.id,
                'title': post_db.title,
                'image_thumbnail': app.config.get("DOMAIN_URL_VIEW_FILE") + post_db.image_thumbnail.get('link'),
                'category_name': category.name if category is not None else ""
            }
            array_related_news.append(post_dict)
    
    return json({"related_news": array_related_news}, status=200)

async def pre_feature_news(request=None, data=None, Model=None, **kw):
    user = current_user(request)
    if user is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)

    type_placement = data.get("type_placement", None)
    if type_placement not in [1, 2, 3, 4, 5]:
        return json({'error_code':'PARAM_ERROR', 'error_message':'Tham số không hợp lệ'}, status=520)
    
    feature_news_model = None
    if request.method == 'POST':
        check_feature_news = db.session.query(FeatureNews).filter(FeatureNews.deleted == False, FeatureNews.type_placement == type_placement).first()
        if check_feature_news is not None:
            return json({'error_code':'PARAM_ERROR', 'error_message':'Vị trí bài viết nổi bật này đã được tạo. Vui lòng kiểm tra lại'}, status=520)

        feature_news_model = FeatureNews()
        feature_news_model.id = default_uuid()
        feature_news_model.donvi_id = user.donvi_id
        feature_news_model.created_by = user.id
    elif request.method == "PUT":
        feature_news_model = db.session.query(FeatureNews).filter(FeatureNews.deleted == False, FeatureNews.id == data['id']).first()
        if feature_news_model is None:
            return json({'error_code':'PARAM_ERROR', 'error_message':'Không tìm thấy bản ghi dữ liệu'}, status=520)
        feature_news_model.updated_by = user.id

    list_news = data.get("list_news", [])
    if list_news is None or isinstance(list_news, list) is False:
        return json({'error_code':'PARAM_ERROR', 'error_message':'Tham số không hợp lệ'}, status=520)

    feature_news_model.type_placement = type_placement

    list_news = sorted(list_news, key=lambda d: d['stt'])


    feature_news_model.list_news = list_news
    flag_modified(feature_news_model, "list_news")

    if request.method == 'POST':
        db.session.add(feature_news_model)
    
    db.session.commit()

    return json(to_dict(feature_news_model), status=200)

async def postprocess_get_single_feature_news(request=None, Model=None, result=None, **kw):
    list_news = result['list_news']
    list_news_id = []
    for news in list_news:
        list_news_id.append(news['id'])

    list_news_model = db.session.query(PostPublish.id, PostPublish.title).filter(\
        PostPublish.deleted == False, \
        PostPublish.id.in_(list_news_id), \
        PostPublish.status == 6 \
    ).all()

    list_news_model_dict = {}
    for news in list_news_model:
        list_news_model_dict[news.id] = {
            "id": news.id,
            "title": news.title,
        }

    list_response = []
    stt = 1
    for id in list_news_id:
        if id in list_news_model_dict:
            object_new = list_news_model_dict[id]
            object_new['stt'] = stt 
            stt = stt + 1

            list_response.append(object_new)
    result['list_news'] = list_response

apimanager.create_api(FeatureNews,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[preprocess_getmany_donvi], POST=[pre_feature_news], PUT_SINGLE=[pre_feature_news], PUT_MANY=[deny_request], DELETE_MANY=[deny_request], DELETE_SINGLE=[pre_delete]),
    postprocess=dict(GET_SINGLE=[postprocess_get_single_feature_news]),
    collection_name='feature_news'
)