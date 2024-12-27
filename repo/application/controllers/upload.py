import os, sys
import io
# from PIL import Image
import time
import os.path
# import httplib2
import base64
import ujson
import requests
import random, string

from gatco.response import json
# from gatco import Blueprint
from application.server import app
from application.database import db, redisdb
from gatco.response import json, text, html
from gatco_restapi.helpers import to_dict

import aiofiles
import hashlib
from application.models.models import FileInfo
from application.models.model_donvi import *
from application.controllers.helpers.helper_common import current_uid, current_user, convert_text_khongdau, default_uuid
# from application.controllers.helpers.MinIOConnector import uploadFromData
import uuid
import math
from sqlalchemy import or_, and_, desc, asc
from urllib.request import urlopen
from sanic import response
from datetime import datetime


# imageupload = Blueprint('image', url_prefix='/image')
# 
# @imageupload.route('/')
# async def bp_root(request):
#     return json({'image': 'blueprint'})


# @app.route('/image/upload', methods=['POST'])
# async def imgupload(request):
#     ret = None
#     url = app.config['IMAGE_SERVICE_URL']
#     fsroot = app.config['FS_ROOT']
# #     uid_current = current_uid(request)
# #     if uid_current is None:
# #         return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    
#     if request.method == 'POST':
#         file_data = request.files.get('image', None)
#         if file_data :
#             response = await write_file(file_data,None, None,"system")
#             return response
#     return json(ret)


@app.route('/api/v1/upload', methods=['POST'])
async def upload_file(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)

    if request.method == 'POST':
        fileId = request.headers.get("fileId", None)
        file_data = request.files.get('file', None)
        attrs = request.form.get('attrs', None)
        type_file = request.form.get('type_file', None)
        if file_data :
            response = await write_file(file_data, fileId, attrs, currentUser, type_file)
            return response
        
    return json({"error_code": "Upload Error", "error_message": "Could not upload file to store"}, status=520)


async def write_file(file, fileId, attrs, currentUser, type_file):
    url = app.config['FILE_SERVICE_URL']
    fsroot = app.config['FS_ROOT_FILE']
    if not os.path.exists(fsroot):
        os.makedirs(fsroot)
    file_name = os.path.splitext(file.name)[0]
    extname = os.path.splitext(file.name)[1]
        
    BLOCKSIZE = 65536
    sha256 = hashlib.sha256()
    file_data = file.body
    data_length = len(file_data)
    if (data_length <= 0):
        return json({"error_code": "Error","error_message": "File không hợp lệ"}, status=520)
    elif (data_length < BLOCKSIZE):
        BLOCKSIZE = data_length

    # f = file.body.open('rb')
    # if f.multiple_chunks():
    #     for chunk in f.chunks():
    #         sha256.update(chunk)
    # else:    
    #         sha256.update(f.read())
    # f.close()
    sha256.update(file_data)
    # file_buffer = file_data.read(BLOCKSIZE)
    # while len(file_buffer) > 0:
    #     sha256.update(file_buffer)
    #     file_buffer = file_data.read(BLOCKSIZE)
            
    str_sha256 = sha256.hexdigest()   
    if type_file in ["1", "2"]:
        type_file = int(type_file)
    check_exist = db.session.query(FileInfo).filter(
        FileInfo.sha256 == str_sha256, 
        FileInfo.user_id == currentUser.id
    )
    if currentUser.donvi_id is not None:
        check_exist = check_exist.filter(FileInfo.donvi_id == currentUser.donvi_id)
    if type_file is not None:
        check_exist = check_exist.filter(FileInfo.type == type_file)
    check_exist = check_exist.first()
    if check_exist is not None:
        print("upload file tra luon ve ket qua===",str_sha256 )
        return json(to_dict(check_exist))
    async with aiofiles.open(fsroot + str_sha256 + extname, 'wb+') as f:
        await f.write(file.body)
        print("ghi file thanh cong path====",fsroot + str_sha256 + extname)
    f.close()
    if fileId is None:
        fileId = str(uuid.uuid4())
        
    fileInfo = FileInfo()
    fileInfo.id = fileId
    fileInfo.sha256 = str_sha256
    fileInfo.user_id = currentUser.id
    fileInfo.user_name = currentUser.hoten
    fileInfo.name = file_name
    fileInfo.extname = extname
    fileInfo.link = str(url)  + "/" + str(str_sha256) + str(extname)
    fileInfo.attrs = attrs
    fileInfo.size = data_length
    fileInfo.type = type_file
    fileInfo.unsigned_name = convert_text_khongdau(file_name)
    fileInfo.donvi_id = currentUser.donvi_id
    fileInfo.created_by = currentUser.id
    
    db.session.add(fileInfo)
    db.session.commit()
    return json(to_dict(fileInfo), status=200)

async def write_file_minio(file, fileId, attrs, uid_current):
    url = app.config['FILE_SERVICE_URL']
    # fsroot = app.config['FS_ROOT_FILE']
    # if not os.path.exists(fsroot):
    #     os.makedirs(fsroot)
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

    # f = file.body.open('rb')
    # if f.multiple_chunks():
    #     for chunk in f.chunks():
    #         sha256.update(chunk)
    # else:    
    #         sha256.update(f.read())
    # f.close()
    sha256.update(file_data)
    # file_buffer = file_data.read(BLOCKSIZE)
    # while len(file_buffer) > 0:
    #     sha256.update(file_buffer)
    #     file_buffer = file_data.read(BLOCKSIZE)
            
    str_sha256 = sha256.hexdigest()   
    check_exist = db.session.query(FileInfo).filter(FileInfo.sha256 == str_sha256).first()
    if check_exist is not None:
        return json(to_dict(check_exist))
    
    # async with aiofiles.open(fsroot + str_sha256 + extname, 'wb+') as f:
    #     await f.write(file.body)
    # f.close()

    bucket_name = app.config.get('BUCKET_NAME',None)
    object_name = str(str_sha256) + str(extname)
    url_file = await uploadFromData(bucket_name,object_name , file_data, data_length)
    print("upload file url ====", url)
    
    if fileId is None:
        fileId = str(uuid.uuid4())
    fileInfo = FileInfo()
    fileInfo.id = fileId
    fileInfo.sha256 = str_sha256
    fileInfo.user_id = uid_current
    fileInfo.name = file_name
    fileInfo.extname = extname
    fileInfo.link = str(url)  + "/" + str(str_sha256) + str(extname)
    fileInfo.attrs = attrs
    fileInfo.size = data_length
    fileInfo.kind = "fileserver"
    db.session.add(fileInfo)
    db.session.commit()
    return json(to_dict(fileInfo), status=200)

@app.route('/api/v1/get-list-file', methods=['GET'])
async def get_list_file(request, type_file=None):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    
    page = int(request.args.get('page', 1))
    results_per_page = int(request.args.get('results_per_page', 40))
    offset = (page - 1) * results_per_page 

    user_id = request.args.get('user_id', None)
    text_filter = request.args.get('text_filter', None)
    type_file = request.args.get('type_file', None)
    
    query_filter = db.session.query(FileInfo).filter(FileInfo.deleted == False)
    if currentUser.donvi_id is not None:
        query_filter = query_filter.filter(FileInfo.donvi_id == currentUser.donvi_id)
    if user_id is not None:
        query_filter = query_filter.filter(FileInfo.user_id == user_id)
    if type_file in ['1', '2']:
        type_file = int(type_file)
        query_filter = query_filter.filter(FileInfo.type == type_file)
    if text_filter is not None:
        query_filter = query_filter.filter(FileInfo.unsigned_name.like('%{0}%'.format(convert_text_khongdau(text_filter))))
    
    num_results = query_filter.count()
    total_pages = int(math.ceil(num_results / results_per_page))
    
    list_data = query_filter.order_by(desc(FileInfo.updated_at)).limit(results_per_page).offset(offset).all()
    objects = []
    for data in list_data:
        item = func_return_obj(to_dict(data))
        objects.append(item)

    return json({'page': page, 'objects': objects, 'total_pages': total_pages, 'num_results': num_results}, status=200)

def func_return_obj(file_data):
    return {
        'updated_at': file_data['updated_at'],
        "id": file_data['id'],
        "name": file_data['name'],
        'extname': file_data['extname'],
        'link': file_data['link'],
        'size': file_data['size'],
        'created_at': file_data['created_at'],
    }
    
@app.route('/api/v1/change-file-name', methods=['POST'])
async def change_file_name(request, type_file=None):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)

    data = request.json
    # domain = data.get('domain',None)
    # path_api = data.get('path_api', None)
    file_id = data.get('file_id', None)
    file_name = data.get('file_name', None)
    # type_file = data.get('type_file', None)
    if file_id is None or file_name is None or file_name.strip() == "":
        return json({'error_code':'PARAM_ERORR', 'error_message':'Tham số không hợp lệ'}, status=520)
    file_name = file_name.strip()
    type_file = int(type_file)
    file_info = db.session.query(FileInfo).filter(
        FileInfo.id == file_id,
        FileInfo.deleted == False
    ).first()
    if file_info is None:
        return json({"error_code": "PARAM_ERROR", "error_message": "Không tìm thấy file"}, status=520)
    file_info.name = file_name
    file_info.unsigned_name = convert_text_khongdau(file_name)
    db.session.commit()
    return json({"error_code":"OK","error_message":"successful", "data": func_return_obj(to_dict(file_info))},status=200)
        

@app.route('/api/v1/upload-link', methods=['POST'])
async def upload_file(request, type_file=None):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    fileId = request.headers.get("fileId",None)
    url_file = request.json.get('url_file', None)
    user_id = request.json.get("user_id", None)
    file_fullname = request.json.get('file_name', None)
    type_file = request.json.get('type_file', None)

    file_name = "Anh-Upoad-Link-" + str(random.randint(1000000, 90000000)) 
    extname = ".png"

    file_data = None

    if url_file.startswith("data:image") == True:
        response = urlopen(url_file)
        file_data = response.file.read()

    else:
        res = requests.get(url_file, allow_redirects=True)

        if res.status_code not in [200, 201, "200", "201"]:
            return json({"error_code": "Error","error_message": "Tải file không thành công. Vui lòng thử lại sau."}, status=520)
        file_data = res.content

        list_split = file_fullname.split(".")
        if len(list_split) == 2:
            file_name = list_split[0]
            extname = "." + list_split[1]
    
    # try:
    if True:
        BLOCKSIZE = 65536
        sha256 = hashlib.sha256()
        # file_data = res.content
        data_length = len(file_data)
        if(data_length <= 0):
            return json({"error_code": "Error","error_message": "File không hợp lệ"}, status=520)
        elif (data_length < BLOCKSIZE):
            BLOCKSIZE = data_length
            
        sha256.update(file_data)
        str_sha256 = sha256.hexdigest()   

        check_exist = db.session.query(FileInfo).filter(
            FileInfo.sha256 == str_sha256, 
            FileInfo.user_id == currentUser.id
        )
        if currentUser.donvi_id is not None:
            check_exist = check_exist.filter(FileInfo.donvi_id == currentUser.donvi_id)
        if type_file is not None:
            type_file = int(type_file)
            check_exist = check_exist.filter(FileInfo.type == type_file)
        check_exist = check_exist.first()
        if check_exist is not None:
            print("upload file tra luon ve ket qua===",str_sha256 )
            return json(to_dict(check_exist))

        # file don't exits in database 
        # write file
        url = app.config['FILE_SERVICE_URL']
        fsroot = app.config['FS_ROOT_FILE']
        if not os.path.exists(fsroot):
            os.makedirs(fsroot)
        
        async with aiofiles.open(fsroot + str_sha256 + extname, 'wb+') as f:
            await f.write(file_data)
        f.close()
            
        #create new file info
        if fileId is None:
            fileId = str(uuid.uuid4())
            
        fileInfo = FileInfo()
        fileInfo.id = fileId
        fileInfo.sha256 = str_sha256
        fileInfo.user_id = currentUser.id
        fileInfo.user_name = currentUser.hoten
        fileInfo.name = file_name
        fileInfo.extname = extname
        fileInfo.link = str(url)  + "/" + str(str_sha256) + str(extname)
        fileInfo.size = data_length
        fileInfo.type = type_file
        fileInfo.unsigned_name = convert_text_khongdau(file_name)
        fileInfo.donvi_id = currentUser.donvi_id
        fileInfo.created_by = currentUser.id
        
        db.session.add(fileInfo)
        db.session.commit()
        return json(to_dict(fileInfo), status=200)

    
# async def UploadFileDicom(path):
#     URL_UPLOAD = 'http://103.74.122.206:8042/instances'
#     f = open(path, "rb")
#     content = f.read()
#     f.close()

#     try:
#         sys.stdout.write("Importing %s" % path)

#         h = httplib2.Http()

#         headers = { 'content-type' : 'application/dicom' }

#         if len(sys.argv) == 6:
#             username = sys.argv[4]
#             password = sys.argv[5]

            
#             creds_str = username + ':' + password
#             creds_str_bytes = creds_str.encode("ascii")
#             creds_str_bytes_b64 = b'Basic ' + base64.b64encode(creds_str_bytes)
#             headers['authorization'] = creds_str_bytes_b64.decode("ascii")

#         resp, content = h.request(URL_UPLOAD, 'POST', 
#                                   body = content,
#                                   headers = headers)

#         if resp.status == 200 or resp.status == 201:
#             sys.stdout.write(" => success\n")
            
#             result= ujson.loads(content)
#             x = requests.get(URL_UPLOAD+"/"+result["ID"]+"/simplified-tags")
#             ret = x.json()
#             print("StudyInstanceUID:",ret['StudyInstanceUID'])
#             return ret
#         else:
#             sys.stdout.write(" => failure (Is it a DICOM file? Is there a password?)\n")

#     except:
#         type, value, traceback = sys.exc_info()
#         sys.stderr.write(str(value))
#         sys.stdout.write(" => unable to connect (Is Orthanc running? Is there a password?)\n")
#     return None