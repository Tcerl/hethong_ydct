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
from gatco_restapi.helpers import count, to_dict
from application.models.model_quanlykho import *
from application.models.model_danhmuc import *
from application.models.model_duoclieu import *
from application.models.model_donvi import *
from application.models.model_file import *
import aiofiles
import os
# import xlrender
from math import floor
from sqlalchemy.orm.attributes import flag_modified
from datetime import datetime
import pandas as pd


async def upload_file(file, fileId, attrs, uid_current, type="upload"):
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
    if(data_length<=0):
        return json({"error_code": "Error","error_message": "File không hợp lệ"}, status=520)
    elif (data_length<BLOCKSIZE):
        BLOCKSIZE = data_length
    sha256.update(file_data)

    str_sha256 = sha256.hexdigest()   
    file_exits = None
    url_file = None
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
        if type == "upload":
            db.session.add(fileInfo)
            db.session.commit()

        url_file = fsroot + str_sha256 + extname
    else:
        url_file = fsroot + file_exits.sha256 + file_exits.extname
    print("url====", url_file)
    return url_file, (str_sha256 + extname)


@app.route('/api/v1/import_excel_giayphep_nhapkhau', methods =['POST'])
async def import_giayphep_nhapkhau(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại."}, status=520)

    donvi_id = currentUser.donvi_id
    checkDonvi = db.session.query(DonVi).filter(DonVi.id == donvi_id, DonVi.deleted == False).first()
    if checkDonvi is None:
        return json({'error_code':'PARAM_ERROR', 'error_message':'Không được phép truy cập'}, status=520)

    idRequest = request.headers.get("X-ID", None)
    if idRequest is None or idRequest == "":
        return json({'error_code':'PARAM_ERROR', 'error_message':'Không được phép truy cập'}, status = 520)

    checkGiayPhep = db.session.query(GiayPhepNhapKhau).filter(\
        GiayPhepNhapKhau.id == idRequest, \
        GiayPhepNhapKhau.donvi_id == donvi_id, \
        GiayPhepNhapKhau.deleted == False).first()

    if checkGiayPhep is None:
        return json({'error_code':'PARAM_ERROR', 'error_message':'Không tìm thấy giấy phép nhập khẩu trên hệ thống'}, status=520)
    
    listFailed = []
    countCreate =0
    countUpdate = 0
    listSuccess = []

    fileId = request.headers.get("fileId",None)
    file_data = request.files.get('file', None)
    attrs = request.form.get('attrs',None)
    if file_data:
        url_file, name_file = await upload_file(file_data,fileId, attrs,currentUser.id, "dont_upload")
        df = pd.read_excel(url_file, dtype=str, keep_default_na=False)


        isAddNew = True

        for k in range(4,len(df)):
            i= k-4
            # so_giay_phep = str(df.loc[k, df.columns[1]]).strip()
            ma_duoclieu = str(df.loc[k, df.columns[1]]).strip()
            ma_duoclieu_donvi = str(df.loc[k, df.columns[2]]).strip()
            ma_tieuchuan = str(df.loc[k, df.columns[3]]).strip()
            soluong_capphep = str(df.loc[k, df.columns[4]]).strip()
            ten_coso_sanxuat = str(df.loc[k, df.columns[5]]).strip()
            ten_coso_cungcap = str(df.loc[k, df.columns[6]]).strip()
            ma_quocgia_sanxuat = str(df.loc[k, df.columns[7]]).strip()
            ma_quocgia_cungcap = str(df.loc[k, df.columns[8]]).strip()
            ghichu = str(df.loc[k, df.columns[9]]).strip()

            # print("so giay phep========: ", so_giay_phep)
            # print("ma duoc lieu========: ", ma_duoclieu)
            # print("ma duoc lieu don vi========: ", ma_duoclieu_donvi)
            # print("ma ticu chuan ========: ", ma_tieuchuan)
            # print("so luong cap phep========: ", soluong_capphep)
            # print("ten coso san xuat========: ", ten_coso_sanxuat)
            # print("ten coso cung cap========: ", ten_coso_cungcap)
            # print("ma quoc gia san xuat========: ", ma_quocgia_sanxuat)
            # print("ma quoc gia cung cap========: ", ma_quocgia_cungcap)
            # print("ghi chu========: ", ghichu)


            if (ma_duoclieu is None or ma_duoclieu == "" or ma_duoclieu == "nan") and \
                (ma_duoclieu_donvi is None or ma_duoclieu_donvi == "" or ma_duoclieu_donvi == "nan"):
                listFailed.append({'index': i+1, 'lydo':'Mã dược liệu dùng chung và mã dược liệu đơn vị không được phép cùng bỏ trống'})
                isAddNew = False
                continue
            tmpIdSanPham = None
            if ma_duoclieu is not None and ma_duoclieu != "" and ma_duoclieu !="nan" and \
                (ma_duoclieu_donvi is None or ma_duoclieu_donvi == "" or ma_duoclieu_donvi == "nan"):
                checkDanhMuc = db.session.query(DanhMucSanPham).filter(\
                    DanhMucSanPham.ma_sanpham == ma_duoclieu, \
                    DanhMucSanPham.deleted == False).first()

                if checkDanhMuc is None:
                    listFailed.append({'index': i+1, 'lydo':'Không tìm thấy dược liệu trong hệ thống với mã dược liệu dùng chung'.format(ma_duoclieu)})
                    isAddNew = False
                    continue
                else:
                    tmpIdSanPham = checkDanhMuc.id
                
            elif ma_duoclieu_donvi is not None and ma_duoclieu_donvi != "" and ma_duoclieu_donvi != "nan" and \
                (ma_duoclieu is None or ma_duoclieu == "" or ma_duoclieu == "nan"):
                checkDanhMucDonVi = db.session.query(DanhMucSanPhamDonVi).filter(\
                    DanhMucSanPhamDonVi.ma_sanpham_donvi == ma_duoclieu_donvi, \
                    DanhMucSanPhamDonVi.donvi_id == donvi_id, \
                    DanhMucSanPhamDonVi.deleted ==  False).first()

                if checkDanhMucDonVi is None:
                    listFailed.append({'index': i+1, 'lydo':'Không tìm thấy dược liệu trong hệ thống với mã dược liệu đơn vị {}'.format(ma_duoclieu_donvi)})
                    isAddNew = False
                    continue
                else:
                    tmpIdSanPham = checkDanhMucDonVi.id_sanpham
            else:
                checkDanhMuc = db.session.query(DanhMucSanPham).filter(\
                    DanhMucSanPham.ma_sanpham == ma_duoclieu, \
                    DanhMucSanPham.deleted == False).first()
                
                if checkDanhMuc is not None:
                    tmpIdSanPham = checkDanhMuc.id
                else:
                    checkDanhMucDonVi = db.session.query(DanhMucSanPhamDonVi).filter(\
                        DanhMucSanPhamDonVi.ma_sanpham_donvi == ma_duoclieu_donvi, \
                        DanhMucSanPhamDonVi.donvi_id == donvi_id, \
                        DanhMucSanPhamDonVi.deleted ==  False).first()

                    if checkDanhMucDonVi is not None:
                        tmpIdSanPham = checkDanhMucDonVi.id_sanpham
                    else:
                        listFailed.append({'index': i+1, 'lydo':'Không tìm thấy dược liệu trong hệ thống với mã dược liệu {} và mã dược liệu đơn vị {}'.format(ma_duoclieu, ma_duoclieu_donvi)})
                        isAddNew = False
                        continue

            
            checkDanhMucDonVi = db.session.query(DanhMucSanPhamDonVi).filter(\
                DanhMucSanPhamDonVi.id_sanpham == tmpIdSanPham, \
                DanhMucSanPhamDonVi.donvi_id == donvi_id, \
                DanhMucSanPhamDonVi.deleted ==  False).first()       

            if checkDanhMucDonVi is None:
                listFailed.append({'index': i+1, 'lydo':'Không tìm thấy dược liệu trong danh mục của đơn vị'})
                isAddNew = False
                continue

            if ma_tieuchuan is None or ma_tieuchuan == "" or ma_tieuchuan == "nan":
                listFailed.append({'index': i+1, 'lydo':'Mã tiêu chuẩn ko được để trống'})
                isAddNew = False
                continue

            checkTieuChuan = db.session.query(TieuChuanChatLuong).filter(\
                TieuChuanChatLuong.ma_tieuchuan == ma_tieuchuan, \
                TieuChuanChatLuong.deleted == False).first()
            
            if checkTieuChuan is None:
                listFailed.append({'index': i+1, 'lydo':'Không tìm thấy tiêu chuẩn chất lượng hoặc mã tiêu chuẩn chưa chính xác'})
                isAddNew = False
                continue
            
            if soluong_capphep is None or soluong_capphep == "" or soluong_capphep == "nan":
                listFailed.append({'index': i+1, 'lydo':'Số lượng cấp phép không được để trống'})
                isAddNew = False
                continue
            try:
                soluong_capphep = float(soluong_capphep)
            except:
                listFailed.append({'index': i+1, 'lydo':'Số lượng cấp phép không đúng định dạng'})
                isAddNew = False
                continue


            #check xem co san pham chua, neu co roi la update
            checkChiTiet = db.session.query(GiayPhepNhapKhauChiTiet).filter(\
                GiayPhepNhapKhauChiTiet.id_sanpham == tmpIdSanPham, \
                GiayPhepNhapKhauChiTiet.giayphep_id == checkGiayPhep.id, \
                GiayPhepNhapKhauChiTiet.donvi_id == donvi_id, \
                GiayPhepNhapKhauChiTiet.deleted == False).first()
            
            if checkChiTiet is not None:
                checkChiTiet.so_giay_phep = checkGiayPhep.so_giay_phep
                checkChiTiet.thoigian_capphep = checkGiayPhep.thoigian_capphep
                checkChiTiet.thoigian_hieuluc_batdau = checkGiayPhep.thoigian_hieuluc_batdau
                checkChiTiet.thoigian_hieuluc_ketthuc = checkGiayPhep.thoigian_hieuluc_ketthuc
                checkChiTiet.id_sanpham = checkDanhMucDonVi.id_sanpham
                checkChiTiet.ma_sanpham = checkDanhMucDonVi.ma_sanpham
                checkChiTiet.ten_sanpham = checkDanhMucDonVi.ten_sanpham
                checkChiTiet.ten_khoahoc = checkDanhMucDonVi.ten_khoa_hoc
                objSanPham = {
                    'donvi_id': donvi_id,
                    'id_sanpham': checkDanhMucDonVi.id_sanpham,
                    'ma_sanpham': checkDanhMucDonVi.ma_sanpham,
                    'ma_viettat': checkDanhMucDonVi.ma_viettat,
                    'ten_sanpham': checkDanhMucDonVi.ten_sanpham,
                    'tenkhongdau': checkDanhMucDonVi.tenkhongdau,
                    'ten_khoa_hoc': checkDanhMucDonVi.ten_khoa_hoc,
                    'bophan_sudung': checkDanhMucDonVi.bophan_sudung
                }
                checkChiTiet.sanpham = objSanPham
                checkChiTiet.bophan_sudung = checkDanhMucDonVi.bophan_sudung
                checkChiTiet.soluong_capphep = soluong_capphep
                checkChiTiet.donvitinh = "Kg"
                checkChiTiet.tieuchuan_chatluong_id = checkTieuChuan.id
                checkChiTiet.tieuchuan_chatluong = to_dict(checkTieuChuan)
                checkChiTiet.ghichu = ghichu
                checkChiTiet.ten_coso_sanxuat = ten_coso_sanxuat
                checkChiTiet.ten_coso_cungcap = ten_coso_cungcap
                checkChiTiet.donvi_id = donvi_id
                if ma_quocgia_sanxuat is not None and ma_quocgia_sanxuat != "" and ma_quocgia_sanxuat != "nan":
                    checkQuocGia = db.session.query(QuocGia).filter(\
                        QuocGia.ma == ma_quocgia_sanxuat, \
                        QuocGia.deleted == False).first()
                    if checkQuocGia is not None:
                        checkChiTiet.quocgia_sanxuat_id = checkQuocGia.id
                        checkChiTiet.quocgia_sanxuat = to_dict(checkQuocGia)

                if ma_quocgia_cungcap is not None and ma_quocgia_cungcap != "" and ma_quocgia_cungcap != "nan":
                    checkQuocGia = db.session.query(QuocGia).filter(\
                        QuocGia.ma == ma_quocgia_cungcap, \
                        QuocGia.deleted == False).first()
                    if checkQuocGia is not None:
                        checkChiTiet.quocgia_cungcap_id = checkQuocGia.id
                        checkChiTiet.quocgia_cungcap = to_dict(checkQuocGia)

                db.session.flush()
                countUpdate +=1
                listSuccess.append(to_dict(checkChiTiet))
            else:
                newGiayPhep = checkGiayPhep

                newChiTiet = GiayPhepNhapKhauChiTiet()
                newChiTiet.id = default_uuid()
                newChiTiet.giayphep_id = newGiayPhep.id
                newChiTiet.so_giay_phep = newGiayPhep.so_giay_phep
                newChiTiet.thoigian_capphep = newGiayPhep.thoigian_capphep
                newChiTiet.thoigian_hieuluc_batdau = newGiayPhep.thoigian_hieuluc_batdau
                newChiTiet.thoigian_hieuluc_ketthuc = newGiayPhep.thoigian_hieuluc_ketthuc
                newChiTiet.id_sanpham = checkDanhMucDonVi.id_sanpham
                newChiTiet.ma_sanpham = checkDanhMucDonVi.ma_sanpham
                newChiTiet.ten_sanpham = checkDanhMucDonVi.ten_sanpham
                newChiTiet.ten_khoahoc = checkDanhMucDonVi.ten_khoa_hoc
                objSanPham = {
                    'donvi_id': donvi_id,
                    'id_sanpham': checkDanhMucDonVi.id_sanpham,
                    'ma_sanpham': checkDanhMucDonVi.ma_sanpham,
                    'ma_viettat': checkDanhMucDonVi.ma_viettat,
                    'ten_sanpham': checkDanhMucDonVi.ten_sanpham,
                    'tenkhongdau': checkDanhMucDonVi.tenkhongdau,
                    'ten_khoa_hoc': checkDanhMucDonVi.ten_khoa_hoc,
                    'bophan_sudung': checkDanhMucDonVi.bophan_sudung
                }
                newChiTiet.sanpham = objSanPham
                newChiTiet.bophan_sudung = checkDanhMucDonVi.bophan_sudung
                newChiTiet.soluong_capphep = soluong_capphep
                newChiTiet.donvitinh = "Kg"
                newChiTiet.tieuchuan_chatluong_id = checkTieuChuan.id
                newChiTiet.tieuchuan_chatluong = to_dict(checkTieuChuan)
                newChiTiet.ghichu = ghichu
                newChiTiet.ten_coso_sanxuat = ten_coso_sanxuat
                newChiTiet.ten_coso_cungcap = ten_coso_cungcap
                newChiTiet.donvi_id = donvi_id
                
                if ma_quocgia_sanxuat is not None and ma_quocgia_sanxuat != "" and ma_quocgia_sanxuat != "nan":
                    checkQuocGia = db.session.query(QuocGia).filter(\
                        QuocGia.ma == ma_quocgia_sanxuat, \
                        QuocGia.deleted == False).first()
                    if checkQuocGia is not None:
                        newChiTiet.quocgia_sanxuat_id = checkQuocGia.id
                        newChiTiet.quocgia_sanxuat = to_dict(checkQuocGia)

                if ma_quocgia_cungcap is not None and ma_quocgia_cungcap != "" and ma_quocgia_cungcap != "nan":
                    checkQuocGia = db.session.query(QuocGia).filter(\
                        QuocGia.ma == ma_quocgia_cungcap, \
                        QuocGia.deleted == False).first()
                    if checkQuocGia is not None:
                        newChiTiet.quocgia_cungcap_id = checkQuocGia.id
                        newChiTiet.quocgia_cungcap = to_dict(checkQuocGia)

                db.session.add(newChiTiet)
                db.session.flush()
                countCreate +=1
                listSuccess.append(to_dict(newChiTiet))


        if isAddNew == True:
            db.session.commit()
        else:
            countCreate = 0
            listSuccess = []
            countUpdate = 0



        return json({'error_code': 'Successful', 'countCreate':  countCreate, 'listSuccess': listSuccess, 'countUpdate': countUpdate, 'listFailed': listFailed}, status=200)
    else:
        return json({'error_code':'PARAM_ERROR', 'error_message':'Không được phép truy cập'}, status = 520)

@app.route('/api/v1/import_excel_chungnhan_co', methods = ['POST'])
async def import_excel_chungnhan_co(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại."}, status=520)

    donvi_id = currentUser.donvi_id
    checkDonvi = db.session.query(DonVi).filter(DonVi.id == donvi_id, DonVi.deleted == False).first()
    if checkDonvi is None:
        return json({'error_code':'PARAM_ERROR', 'error_message':'Không được phép truy cập'}, status=520)

    idRequest = request.headers.get("X-ID", None)
    if idRequest is None or idRequest == "":
        return json({'error_code':'PARAM_ERROR', 'error_message':'Không được phép truy cập'}, status = 520)

    chungnhanCo = db.session.query(GiayChungNhanCO).filter(\
        GiayChungNhanCO.id == idRequest, \
        GiayChungNhanCO.donvi_id == donvi_id,  \
        GiayChungNhanCO.deleted == False).first()
    
    if chungnhanCo is None:
        return json({'error_code':'PARAM_ERROR', 'error_message':'Không tìm thấy giấy chứng nhận CO trên hệ thống'}, status=520)
    
    listFailed = []
    listSuccess = []
    countCreate =0
    countUpdate = 0

    fileId = request.headers.get("fileId",None)
    file_data = request.files.get('file', None)
    attrs = request.form.get('attrs',None)

    if file_data:
        url_file, name_file = await upload_file(file_data,fileId, attrs,currentUser.id, "dont_upload")
        df = pd.read_excel(url_file, dtype=str, keep_default_na=False)

        isAddNew = True

        for k in range(4,len(df)):
            i= k-4
            # so_co = str(df.loc[k, df.columns[1]]).strip()
            so_giay_phep = str(df.loc[k, df.columns[1]]).strip()
            ma_duoclieu = str(df.loc[k, df.columns[2]]).strip()
            ma_duoclieu_donvi = str(df.loc[k, df.columns[3]]).strip()
            ma_HS = str(df.loc[k, df.columns[4]]).strip().strip()
            tieuchi_xuatxu = str(df.loc[k, df.columns[5]]).strip()
            soluong = str(df.loc[k, df.columns[6]]).strip()
            so_hoadon = str(df.loc[k, df.columns[7]]).strip()
            loai_donggoi =  str(df.loc[k, df.columns[8]]).strip()
            soluong_donggoi = str(df.loc[k, df.columns[9]]).strip()
            mota_sanpham = str(df.loc[k, df.columns[10]]).strip()
            ma_kiem_nghiem = str(df.loc[k, df.columns[11]]).strip()
            so_lo = str(df.loc[k, df.columns[12]]).strip()
            tongsoluong = str(df.loc[k, df.columns[13]])


            # print("so co================: ", so_co)
            # print("so giấy phép nhập khẩu================: ", so_giay_phep)
            # print("ma duoc lieu ==================: ", ma_duoclieu)
            # print("ma duoc lieu don vi=================: ", ma_duoclieu_donvi)
            # print("ma hang hoa=================: ", ma_HS)
            # print("tieu chi xuat xuuuuuuuuuuuuuuuu: ", tieuchi_xuatxu)
            # print("so luong=====================: ", soluong)
            # print("so hoa don================: ", so_hoadon)
            # print("loai dong goi ===============: ", loai_donggoi)
            # print('mota san pham=================: ', mota_sanpham)
            # print("co chung nhan cq====================: ", ma_kiem_nghiem)
            # print("solo===================: ", so_lo)
            # print("tong so luong====================: ", tongsoluong)



            if (ma_duoclieu is None or ma_duoclieu =="" or ma_duoclieu == "nan") and \
                (ma_duoclieu_donvi is None or ma_duoclieu_donvi == "" or ma_duoclieu_donvi == "nan"):
                listFailed.append({'index': i+1, 'lydo':'Mã dược liệu dùng chung và mã dược liệu đơn vị không được phép cùng bỏ trống'})
                isAddNew = False
                continue
            tmpIdSanPham = None
            if ma_duoclieu is not None and ma_duoclieu != "" and ma_duoclieu != "nan" and \
                (ma_duoclieu_donvi is None or ma_duoclieu_donvi == "" or ma_duoclieu_donvi == "nan"):
                checkDanhMuc = db.session.query(DanhMucSanPham).filter(\
                    DanhMucSanPham.ma_sanpham == ma_duoclieu, \
                    DanhMucSanPham.deleted == False).first()

                if checkDanhMuc is None:
                    listFailed.append({'index': i+1, 'lydo':'Không tìm thấy dược liệu trong hệ thống với mã dược liệu dùng chung'.format(ma_duoclieu)})
                    isAddNew = False
                    continue
                else:
                    tmpIdSanPham = checkDanhMuc.id
                
            elif ma_duoclieu_donvi is not None and ma_duoclieu_donvi != "" and ma_duoclieu_donvi != "nan" and \
                (ma_duoclieu is None or ma_duoclieu == "" or ma_duoclieu == "nan"):
                checkDanhMucDonVi = db.session.query(DanhMucSanPhamDonVi).filter(\
                    DanhMucSanPhamDonVi.ma_sanpham_donvi == ma_duoclieu_donvi, \
                    DanhMucSanPhamDonVi.donvi_id == donvi_id, \
                    DanhMucSanPhamDonVi.deleted ==  False).first()

                if checkDanhMucDonVi is None:
                    listFailed.append({'index': i+1,'lydo':'Không tìm thấy dược liệu trong hệ thống với mã dược liệu đơn vị {}'.format(ma_duoclieu_donvi)})
                    isAddNew = False
                    continue
                else:
                    tmpIdSanPham = checkDanhMucDonVi.id_sanpham
            else:
                checkDanhMuc = db.session.query(DanhMucSanPham).filter(\
                    DanhMucSanPham.ma_sanpham == ma_duoclieu, \
                    DanhMucSanPham.deleted == False).first()
                
                if checkDanhMuc is not None:
                    tmpIdSanPham = checkDanhMuc.id
                else:
                    checkDanhMucDonVi = db.session.query(DanhMucSanPhamDonVi).filter(\
                        DanhMucSanPhamDonVi.ma_sanpham_donvi == ma_duoclieu_donvi, \
                        DanhMucSanPhamDonVi.donvi_id == donvi_id, \
                        DanhMucSanPhamDonVi.deleted ==  False).first()

                    if checkDanhMucDonVi is not None:
                        tmpIdSanPham = checkDanhMucDonVi.id_sanpham
                    else:
                        listFailed.append({'index': i+1, 'lydo':'Không tìm thấy dược liệu trong hệ thống với mã dược liệu {} và mã dược liệu đơn vị {}'.format(ma_duoclieu, ma_duoclieu_donvi)})
                        isAddNew = False
                        continue

            
            checkDanhMucDonVi = db.session.query(DanhMucSanPhamDonVi).filter(\
                DanhMucSanPhamDonVi.id_sanpham == tmpIdSanPham, \
                DanhMucSanPhamDonVi.donvi_id == donvi_id, \
                DanhMucSanPhamDonVi.deleted ==  False).first()       

            if checkDanhMucDonVi is None:
                listFailed.append({'index': i+1, 'lydo':'Không tìm thấy dược liệu trong danh mục của đơn vị'})
                isAddNew = False
                continue

                
            if tieuchi_xuatxu is None or tieuchi_xuatxu == "" or tieuchi_xuatxu == "nan":
                listFailed.append({'index': i+1, 'lydo':'Tiêu chí xuất xứ không được để trống'})
                isAddNew = False
                continue             

            if soluong is None or soluong == "" or soluong == "nan":
                listFailed.append({'index': i+1, 'lydo':'Số lượng không được để trống'})
                isAddNew = False
                continue
            try:
                soluong = float(soluong)
            except:
                listFailed.append({'index': i+1, 'lydo':'Số lượng không đúng định dạng'})
                isAddNew = False
                continue

                
            loai_co = chungnhanCo.loai_co
            #nhap khau
            if loai_co ==1:

                if ma_HS is None or ma_HS == "" or ma_HS == "nan":
                    listFailed.append({'index': i+1,'lydo':'Mã HS không được để trống'})
                    isAddNew = False
                    continue

                if ma_kiem_nghiem is None or ma_kiem_nghiem == "" or ma_kiem_nghiem == "nan":
                    listFailed.append({'index': i+1, 'lydo':'Mã kiểm nghiệm không được để trống'})
                    isAddNew = False
                    continue
                
                if so_lo is None or so_lo == "" or so_lo == "nan":
                    listFailed.append({'index': i+1, 'lydo':'Số lô không được để trống'})
                    isAddNew = False
                    continue

                phieuKiemNghiem = db.session.query(PhieuKiemNghiem).filter(\
                    PhieuKiemNghiem.ma_kiem_nghiem == ma_kiem_nghiem, \
                    PhieuKiemNghiem.id_sanpham == checkDanhMucDonVi.id_sanpham, \
                    PhieuKiemNghiem.so_lo == so_lo, \
                    PhieuKiemNghiem.donvi_id == donvi_id, \
                    PhieuKiemNghiem.deleted == False).first()
                
                if phieuKiemNghiem is None:
                    listFailed.append({'index': i+1, 'lydo':'Không tìm thấy phiếu kiểm nghiệm với mã kiểm nghiệm {}, số lô {} và mã dược liệu {}'.format(ma_kiem_nghiem, so_lo, checkDanhMucDonVi.ma_sanpham)})
                    isAddNew = False
                    continue

                if so_giay_phep is None or so_giay_phep == "" or so_giay_phep == "nan":
                    listFailed.append({'index': i+1, 'lydo':'Số giấy phép nhập khẩu không được để trống'})
                    isAddNew = False
                    continue

                giayphepNhapKhau = db.session.query(GiayPhepNhapKhau).filter(\
                    GiayPhepNhapKhau.so_giay_phep == so_giay_phep, \
                    GiayPhepNhapKhau.deleted == False).first()

                if giayphepNhapKhau is None:
                    listFailed.append({'index': i+1, 'lydo':'Không tìm thấy giấy phép nhập khẩu với số giấy phép {}'.format(so_giay_phep)})
                    isAddNew = False
                    continue
                giayphep_nhapkhau_id = giayphepNhapKhau.id

                
                soluong_danhap = 0
                soluong_capphep = 0
                checkGiayPhep = db.session.query(GiayPhepNhapKhauChiTiet).filter(\
                    GiayPhepNhapKhauChiTiet.giayphep_id == giayphep_nhapkhau_id, \
                    GiayPhepNhapKhauChiTiet.id_sanpham == tmpIdSanPham, \
                    GiayPhepNhapKhauChiTiet.deleted == False).all()

                if len(checkGiayPhep) ==0:
                    listFailed.append({'index': i+1, 'lydo':'Không tìm thấy dược liệu trong giấy cấp phép nhập khẩu'})
                    isAddNew = False
                    continue
                
                for giayphep in checkGiayPhep:
                    soluong_danhap += validate_number(giayphep.soluong_danhap)
                    soluong_capphep += validate_number(giayphep.soluong_capphep)
                
                if soluong_danhap >=soluong_capphep:
                    listFailed.append({'index': i+1,'lydo':'Số lượng cấp phép đã được nhập đủ'})
                    isAddNew = False
                    continue
                else:
                    if (soluong_danhap + soluong) > soluong_capphep:
                        listFailed.append({'index': i+1,'lydo':'Số lượng cấp phép là {}, số lượng đã nhập về là {}. Số lượng mới thêm là {}, đã vượt quá số lượng cấp phép'.format(soluong_capphep, soluong_danhap, soluong)})
                        isAddNew = False
                        continue


                    newChiTiet = GiayChungNhanCOChitiet()
                    newChiTiet.id = default_uuid()
                    newChiTiet.chungnhan_id = chungnhanCo.id
                    newChiTiet.so_co = chungnhanCo.so_co
                    newChiTiet.so_giay_phep = giayphepNhapKhau.so_giay_phep
                    newChiTiet.thoigian_cap_co = chungnhanCo.thoigian_cap_co
                    newChiTiet.giayphep_nhapkhau_id = giayphepNhapKhau.id
                    newChiTiet.loai_co = chungnhanCo.loai_co
                    newChiTiet.id_sanpham = checkDanhMucDonVi.id_sanpham
                    newChiTiet.ma_sanpham = checkDanhMucDonVi.ma_sanpham
                    newChiTiet.ten_sanpham = checkDanhMucDonVi.ten_sanpham
                    objSanPham = {
                        'donvi_id': donvi_id,
                        'id_sanpham': checkDanhMucDonVi.id_sanpham,
                        'ma_sanpham': checkDanhMucDonVi.ma_sanpham,
                        'ma_viettat': checkDanhMucDonVi.ma_viettat,
                        'ten_sanpham': checkDanhMucDonVi.ten_sanpham,
                        'tenkhongdau': checkDanhMucDonVi.tenkhongdau,
                        'ten_khoa_hoc': checkDanhMucDonVi.ten_khoa_hoc,
                        'bophan_sudung': checkDanhMucDonVi.bophan_sudung
                    }
                    newChiTiet.sanpham = objSanPham
                    newChiTiet.soluong_donggoi = validate_number(soluong_donggoi)
                    newChiTiet.loai_donggoi = loai_donggoi
                    newChiTiet.mota_sanpham = mota_sanpham
                    newChiTiet.tieuchi_xuatxu = tieuchi_xuatxu
                    newChiTiet.soluong = soluong
                    newChiTiet.donvitinh = "Kg"
                    newChiTiet.so_hoadon = so_hoadon
                    newChiTiet.ma_kiem_nghiem = phieuKiemNghiem.ma_kiem_nghiem
                    newChiTiet.phieu_kiem_nghiem_id = phieuKiemNghiem.id
                    newChiTiet.phieu_kiem_nghiem = to_dict(phieuKiemNghiem)
                    newChiTiet.ma_HS = ma_HS
                    newChiTiet.tongsoluong = validate_number(tongsoluong)
                    newChiTiet.donvi_id = donvi_id
                    db.session.add(newChiTiet)
                    db.session.flush()
                    countCreate +=1
                    listSuccess.append(to_dict(newChiTiet))

                
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

            else:
                phieuKiemNghiem = None
                if ma_kiem_nghiem is not None and ma_kiem_nghiem != "" and ma_kiem_nghiem != "nan" and \
                    so_lo is not None and so_lo != "" and so_lo != "nan":
                    phieuKiemNghiem = db.session.query(PhieuKiemNghiem).filter(\
                        PhieuKiemNghiem.ma_kiem_nghiem == ma_kiem_nghiem, \
                        PhieuKiemNghiem.id_sanpham == checkDanhMucDonVi.id_sanpham, \
                        PhieuKiemNghiem.so_lo == so_lo, \
                        PhieuKiemNghiem.donvi_id == donvi_id, \
                        PhieuKiemNghiem.deleted == False).first()

                newChiTiet = GiayChungNhanCOChitiet()
                newChiTiet.id = default_uuid()
                newChiTiet.chungnhan_id = chungnhanCo.id
                newChiTiet.so_co = chungnhanCo.so_co
                newChiTiet.thoigian_cap_co = chungnhanCo.thoigian_cap_co
                newChiTiet.loai_co = chungnhanCo.loai_co
                newChiTiet.id_sanpham = checkDanhMucDonVi.id_sanpham
                newChiTiet.ma_sanpham = checkDanhMucDonVi.ma_sanpham
                newChiTiet.ten_sanpham = checkDanhMucDonVi.ten_sanpham
                objSanPham = {
                    'donvi_id': donvi_id,
                    'id_sanpham': checkDanhMucDonVi.id_sanpham,
                    'ma_sanpham': checkDanhMucDonVi.ma_sanpham,
                    'ma_viettat': checkDanhMucDonVi.ma_viettat,
                    'ten_sanpham': checkDanhMucDonVi.ten_sanpham,
                    'tenkhongdau': checkDanhMucDonVi.tenkhongdau,
                    'ten_khoa_hoc': checkDanhMucDonVi.ten_khoa_hoc,
                    'bophan_sudung': checkDanhMucDonVi.bophan_sudung
                }
                newChiTiet.sanpham = objSanPham
                newChiTiet.soluong_donggoi = validate_number(soluong_donggoi)
                newChiTiet.loai_donggoi = loai_donggoi
                newChiTiet.mota_sanpham = mota_sanpham
                newChiTiet.tieuchi_xuatxu = tieuchi_xuatxu
                newChiTiet.soluong = soluong
                newChiTiet.donvitinh = "Kg"
                newChiTiet.so_hoadon = so_hoadon
                if phieuKiemNghiem is not None:
                    newChiTiet.ma_kiem_nghiem = phieuKiemNghiem.ma_kiem_nghiem
                    newChiTiet.phieu_kiem_nghiem_id = phieuKiemNghiem.id
                    newChiTiet.phieu_kiem_nghiem = to_dict(phieuKiemNghiem)
                newChiTiet.ma_HS = ma_HS
                newChiTiet.tongsoluong = validate_number(tongsoluong)
                newChiTiet.donvi_id = donvi_id
                db.session.add(newChiTiet)
                db.session.flush()
                countCreate +=1
                listSuccess.append(to_dict(newChiTiet))

        
        if isAddNew == True:
            db.session.commit()
        else:
            countCreate = 0
            listSuccess = []
            countUpdate = 0



        return json({'error_code': 'Successful', 'countCreate':  countCreate, 'listSuccess': listSuccess, 'countUpdate': countUpdate, 'listFailed': listFailed}, status=200)

    else:
        return json({'error_code':'PARAM_ERROR', 'error_message':'Không được phép truy cập'}, status = 520)

