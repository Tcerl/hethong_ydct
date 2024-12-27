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
from application.models.model_donvi import User, Role, DonVi
import pdfkit 
from application.models.model_quanlykho import *
from application.models.model_danhmuc import *
from application.models.model_duoclieu import *
from application.models.model_donvi import *
import aiofiles
import os
# import xlrender
from math import floor
from pyvirtualdisplay import Display
import xlsxwriter
from sqlalchemy import or_, and_, desc, asc

#from application.controllers.admin import resp

def convert_timestamp_inobject_tostring(timestamp, format = "%d/%m/%Y"):
    if timestamp is not None:
        return convert_timestamp_to_string(timestamp, format)
    return ''

def convert_string_to_time(time):
    if time is not None and time != "":
        days = time[6:8]
        months = time[4:6]
        years = time[0:4]
        hours = time[8:10]
        minutes = time[10:12]
        seconds = time[12:14]
        # tmp = days + "/" + months + "/" + years +" " + hours + ":" + minutes + ":" + seconds
        tmp = days + "/" + months + "/" + years

        return tmp
    else:
        return ""


def convert_donvitinh(donvitinh):
    text = ""
    if donvitinh == "vi":
        text = "Vỉ"
    elif donvitinh == "vien":
        text = "Viên"
    elif donvitinh == "hop":
        text = "Hộp"
    elif donvitinh == "lo":
        text = "Lọ"
    elif donvitinh == "chai":
        text = "Chai"
    elif donvitinh == "tuyp":
        text = "Tuýp"
    elif donvitinh == "gam":
        text = "Gam"
    elif donvitinh == "goi":
        text = "Gói"
    return text

@app.route('/api_export/v1/export_excel_xuatnhapton',methods=['POST'])
async def baocao(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại."}, status=520)
    data = request.json
    donvi = currentUser.donvi

    id_baocao = data.get("id")
    if id_baocao is None or id_baocao == "":
        return json({"error_code": "PARAM_ERROR", "error_message": "Không tìm thấy không tin báo cáo."}, status=520)
    baocao = db.session.query(BaoCaoKho).filter(and_(\
        BaoCaoKho.id == id_baocao, BaoCaoKho.donvi_id == donvi.id, BaoCaoKho.deleted == False)).\
        order_by(desc(BaoCaoKho.ngay_ket_thuc)).order_by(desc(BaoCaoKho.ngay_bao_cao)).first()

    if baocao is None:
        return json({"error_code": "PARAM_ERROR", "error_message": "Không tìm thấy không tin báo cáo."}, status=520)
    tongtien_tondauki = 0
    tongtien_nhap = 0
    tongtien_xuat = 0
    tongtien_toncuoi = 0

    danhsach_vattu = db.session.query(BaoCaoKhoChiTiet).filter(BaoCaoKhoChiTiet.baocao_id == baocao.id).order_by(asc(BaoCaoKhoChiTiet.ten_sanpham)).all()
    # chitiet_vattu = baocao.chitiet_vattu
    if danhsach_vattu is None:
        danhsach_vattu = []

    for vattu in danhsach_vattu:
        vattu = to_dict(vattu)


        tongtien_tondauki = tongtien_tondauki + vattu['thanhtien_ton_dauky']
        tongtien_nhap = tongtien_nhap + vattu['thanhtien_nhap']
        tongtien_xuat = tongtien_xuat + vattu['thanhtien_xuat']
        tongtien_toncuoi = tongtien_toncuoi + vattu['thanhtien_ton_cuoiky']

    ngay_ket_thuc = convert_timestamp_to_string(baocao.ngay_ket_thuc, "%d%m%Y")
    text_tieude = convert_timestamp_to_string(baocao.ngay_ket_thuc, "BÁO CÁO THÁNG %m NĂM %Y")
    text_ngaythang = convert_timestamp_to_string(baocao.ngay_ket_thuc, "................., ngày %d tháng %m năm %Y")
    
    ## export excel by xlswritter
    
    url_folder = app.config.get('PDF_FOLDER', '')
    file_name = "baocao_xuatnhapton" + str(convert_timestamp_to_string(floor(time.time()), "%Y%m%d")) + ".xlsx"
    url_file =url_folder + file_name
    workbook = xlsxwriter.Workbook(url_file, {'in_memory': True})
    worksheet = workbook.add_worksheet("Sheet1")
    format_center = workbook.add_format({'bold': True, 'text_wrap': True, 'border':1,'border_color': "#ffffff"})
    format_center.set_font_name('Times New Roman')
    format_center.set_align("center")
    format_center.set_font_size(12)

    worksheet.merge_range('A2:E2', donvi.ten_coso, format_center)

    format_right_2 = workbook.add_format({'bold': True,'border':1, 'border_color': "#ffffff"})
    format_right_2.set_font_name('Times New Roman')
    format_right_2.set_font_size(10)
    format_right_2.set_align("center")
    worksheet.merge_range('J1:O1', 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', format_right_2)

    format_right_3 = workbook.add_format({'bold': True})
    format_right_3.set_font_name('Times New Roman')
    format_right_3.set_font_size(10)
    format_right_3.set_align("center")
    worksheet.merge_range('J2:O2', 'Độc lập - Tự do - Hạnh phúc', format_right_3)

    format_center_content = workbook.add_format({'bold': True, 'text_wrap': True, 'border':1,'border_color': "#ffffff"})
    format_center_content.set_align("center")
    format_center_content.set_font_size(16)
    format_center_content.set_font_name('Times New Roman')
    worksheet.merge_range('A3:O3', "BÁO CÁO XUẤT NHẬP TỒN DƯỢC LIỆU", format_center_content)

    format_center_content_1 = workbook.add_format({'bold': True, 'text_wrap': True, 'border':1,'border_color': "#ffffff"})
    format_center_content_1.set_align("center")
    format_center_content_1.set_align("top")
    format_center_content_1.set_font_size(14)
    format_center_content_1.set_font_name('Times New Roman')
    worksheet.merge_range('A4:O4', text_tieude, format_center_content_1)
    ### thead
    format_color = workbook.add_format({
        'border':1,
        'border_color': "#ffffff"
    })
    format_color.set_font_name('Times New Roman')
    for i in range(200):
        worksheet.set_row(i,None , format_color)
    worksheet.set_row(2, 25, format_color)
    worksheet.set_row(3, 25, format_color)

    format_center_th = workbook.add_format({'text_wrap': True, 'bold': True, 'border':1,'border_color': "#000000"})
    format_center_th.set_font_name('Times New Roman')
    format_center_th.set_align("center")
    format_center_th.set_align("top")
    format_center_th.set_font_size(10)
    current_row = 5
    worksheet.merge_range('A' + str(current_row) + ':A' + str(current_row + 1), 'STT', format_center_th)
    worksheet.merge_range('B' + str(current_row) + ':B' + str(current_row + 1), 'Tên dược liệu', format_center_th)
    worksheet.merge_range('C' + str(current_row) + ':C' + str(current_row + 1), 'Mã dược liệu', format_center_th)
    worksheet.merge_range('D' + str(current_row) + ':D' + str(current_row + 1), 'Số lô', format_center_th)
    worksheet.merge_range('E' + str(current_row) + ':E' + str(current_row + 1), 'ĐVT', format_center_th)
    worksheet.merge_range('F' + str(current_row) + ':F' + str(current_row + 1), 'Đơn giá', format_center_th)
    worksheet.merge_range('G' + str(current_row) + ':H' + str(current_row), 'Tồn đầu', format_center_th)
    worksheet.merge_range('I' + str(current_row) + ':J' + str(current_row), 'Nhập', format_center_th)
    worksheet.merge_range('K' + str(current_row) + ':L' + str(current_row), 'Xuất', format_center_th)
    worksheet.merge_range('M' + str(current_row) + ':N' + str(current_row), 'Tồn cuối', format_center_th)
    worksheet.merge_range('O' + str(current_row) + ':O' + str(current_row + 1), 'Nước sản xuất', format_center_th)
    worksheet.write("G" + str(current_row + 1), 'S.lg', format_center_th)
    worksheet.write("H" + str(current_row + 1), 'T.Tiền',format_center_th)
    worksheet.write("I" + str(current_row + 1), 'S.lg', format_center_th)
    worksheet.write("J" + str(current_row + 1), 'T.Tiền',format_center_th)
    worksheet.write("K" + str(current_row + 1), 'S.lg', format_center_th)
    worksheet.write("L" + str(current_row + 1), 'T.Tiền',format_center_th)
    worksheet.write("M" + str(current_row + 1), 'S.lg', format_center_th)
    worksheet.write("N" + str(current_row + 1), 'T.Tiền',format_center_th)

    current_row = current_row + 1

    format_left_bold = workbook.add_format({'text_wrap': True, 'border':1,'border_color': "#000000", 'bold': True})
    format_left_bold.set_font_name('Times New Roman')
    format_left_bold.set_align("left")
    format_left_bold.set_font_size(10)
    format_left_bold.set_fg_color('#dedede')



    format_data_left = workbook.add_format({'border':1,
        'text_wrap': True,
        'border_color': "#000000"})
    format_data_left.set_align("left")
    format_data_left.set_font_name('Times New Roman')
    format_data_left.set_font_size(10)

    format_data_center = workbook.add_format({'border':1,
        'border_color': "#000000"})
    format_data_center.set_align("center")
    format_data_center.set_font_name('Times New Roman')
    format_data_center.set_font_size(10)
    format_data_center.set_num_format('#,##0')

    format_data_right = workbook.add_format({'border':1,
        'border_color': "#000000",})
    format_data_right.set_align("right")
    format_data_right.set_font_name('Times New Roman')
    format_data_right.set_font_size(10)
    format_data_right.set_num_format('#,##0')


    current_row = current_row + 1
    stt = 1

    for vattu in danhsach_vattu:
        vattu = to_dict(vattu)
        worksheet.write("A" + str(current_row), stt, format_data_center)
        worksheet.write("B" + str(current_row), vattu['ten_sanpham'], format_data_left)
        worksheet.write("C" + str(current_row), vattu['ma_sanpham'], format_data_left)
        worksheet.write("D" + str(current_row), vattu['so_lo'], format_data_left)
        worksheet.write("E" + str(current_row), convert_donvitinh(vattu['donvitinh']), format_data_left)
        worksheet.write("F" + str(current_row), vattu['dongia_nhap'],format_data_left)
        worksheet.write("G" + str(current_row), (vattu['soluong_ton_dauky']), format_data_left)
        worksheet.write("H" + str(current_row), vattu['thanhtien_ton_dauky'],format_data_left)
        worksheet.write("I" + str(current_row), vattu['soluong_nhap'], format_data_left)
        worksheet.write("J" + str(current_row), vattu['thanhtien_nhap'],format_data_left)
        worksheet.write("K" + str(current_row), vattu['soluong_xuat'],format_data_left)
        worksheet.write("L" + str(current_row), vattu['thanhtien_xuat'],format_data_left)
        worksheet.write("M" + str(current_row), vattu['soluong_ton_cuoiky'],format_data_left)
        worksheet.write("N" + str(current_row), vattu['thanhtien_ton_cuoiky'], format_data_left)
        worksheet.write("O" + str(current_row), vattu['nuoc_sanxuat'], format_data_right)
        current_row = current_row + 1
        stt = stt + 1


    
    format_left_bold_1 = workbook.add_format({'text_wrap': True, 'bold': True})
    format_left_bold_1.set_font_name('Times New Roman')
    format_left_bold_1.set_align("right")
    format_left_bold_1.set_font_size(10)
    worksheet.merge_range("E" + str(current_row) + ':F' + str(current_row), 'TỔNG CỘNG',format_left_bold_1)
    worksheet.write("H" + str(current_row), convert_number_to_money(tongtien_tondauki, 2),format_left_bold_1)
    worksheet.write("J" + str(current_row), convert_number_to_money(tongtien_nhap, 2), format_left_bold_1)
    worksheet.write("L" + str(current_row), convert_number_to_money(tongtien_xuat, 2),format_left_bold_1)
    worksheet.write("N" + str(current_row), convert_number_to_money(tongtien_toncuoi, 2), format_left_bold_1)
    current_row = current_row + 1

    format_right_ngaythang = workbook.add_format({'border':1,
        'border_color': "#fffff"})
    format_right_ngaythang.set_italic()
    format_right_ngaythang.set_align("center")
    format_right_ngaythang.set_font_name('Times New Roman')
    worksheet.merge_range('L' + str(current_row) + ':O' + str(current_row), text_ngaythang, format_right_ngaythang)
    current_row = current_row + 1

    format_color_text_ki = workbook.add_format({'border':1,'bold': True,
        'border_color': "#fffff"})
    format_color_text_ki.set_font_name('Times New Roman')
    format_color_text_ki.set_align("center")
    format_color_text_ki.set_align('vcenter')
    format_color_text_ki.set_font_size(13)
    worksheet.set_row(18, 40, format_color_text_ki)

    # worksheet.merge_range('A'+ str(current_row) + ':C'+ str(current_row), "P.Trưởng khoa", format_color_text_ki)
    # worksheet.merge_range('F'+ str(current_row) + ':I'+ str(current_row), "Thủ kho", format_color_text_ki)
    # worksheet.merge_range('L'+ str(current_row) + ':O'+ str(current_row), "Người lập", format_color_text_ki)

    # worksheet.merge_range('A'+ str(current_row + 5) + ':O'+ str(current_row + 5), "BAN GIÁM ĐỐC", format_color_text_ki)

    
    worksheet.set_column('B:B', 20)
    worksheet.set_column('D:D', 20)
    workbook.close()
    url = "/static/export_pdf/" + file_name


    return json(url, status=200)


@app.route('/api/v1/export_pdf_gacp', methods =['POST'])
async def export_pdf_gacp(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    options = {
        'encoding': "UTF-8",
    }

    data = request.json
    if data is None:
        return json({"error_code": "PARAM_ERROR", "error_message": "Tham số không hợp lệ"}, status = 520)
    loai_nuoitrong_khaithac = data.get("loai_nuoitrong_khaithac")
    id = data.get("id")
    
    if id is None or loai_nuoitrong_khaithac is None or id == "":
        return json({"error_code": "PARAM_ERROR", "error_message": "Tham số không hợp lệ"}, status = 520)
    options = {
        'encoding': "UTF-8",
    }
    url = ''
    url_filepdf = ''
    filename = ''
    text_time = ''
    url_folder = app.config.get('PDF_FOLDER', '')
    if os.path.isdir(url_folder) is False:
        os.mkdir(url_folder)     
    if loai_nuoitrong_khaithac == 1:
        text_time ="_" + str(time.time())
        filename = "GACP_Nuoitrong" + text_time
        url_filepdf = url_folder + filename + '.pdf'
        url = app.config.get('DOMAIN_URL', '') + '/export_gacp_nuoitrong?id=' + id
    elif loai_nuoitrong_khaithac == 2:
        text_time ="_" + str(time.time())
        filename = "GACP_Khaithac"  + text_time
        url_filepdf = url_folder + filename + '.pdf'
        url = app.config.get('DOMAIN_URL', '') + '/export_gacp_khaithac?id=' + id

    try:
        Display().start()
        options = {
        'page-size': 'A4',
        'orientation': 'Portrait',
        'quiet': '',
        'encoding': "UTF-8",
        'margin-left': '2cm',
        'margin-right': '2cm',
        'margin-bottom': '2cm',
        'margin-top': '2cm'
        }
        pdfkit.from_url(url, url_filepdf, options=options)
        Display().stop()
    except:
        print("==============export pdf error====")

    respone_url_file = app.config.get("STATIC_URL")   +'/export_pdf/' + filename + '.pdf'
    return json(respone_url_file, status=200)


@app.route('/export_gacp_nuoitrong')
async def export_gacp_nuoitrong(request):
    id = request.args.get("id")

    chitieu_gacp = db.session.query(ChungNhanGACP).filter(and_(\
        ChungNhanGACP.id == id, \
        ChungNhanGACP.deleted == False)).first()

    if chitieu_gacp is None:
        return json({'error_code': "NOT_EXIST", "error_message":"Tham số không hợp lệ"}, status = 520)
    else:
        donvi_id =  chitieu_gacp.donvi_id
        donvi = None
        ten_donvi = ""
        if donvi_id is not None and donvi_id != "":
            donvi = db.session.query(DonVi).filter(and_(\
                DonVi.id == donvi_id, \
                DonVi.deleted == False, \
                DonVi.active == True)).first()
        if donvi is not None:
            ten_donvi = donvi.ten_coso

        return jinja.render('export_pdf/gacp_nuoitrong.html', request, chitieu_gacp=to_dict(chitieu_gacp), ten_donvi = ten_donvi, static_url="static")

@app.route('/export_gacp_khaithac')
async def export_gacp_nuoitrong(request):
    id = request.args.get("id")

    chitieu_gacp = db.session.query(ChungNhanGACP).filter(and_(\
        ChungNhanGACP.id == id, \
        ChungNhanGACP.deleted == False)).first()

    if chitieu_gacp is None:
        return json({'error_code': "NOT_EXIST", "error_message":"Tham số không hợp lệ"}, status = 520)
    else:
        donvi_id =  chitieu_gacp.donvi_id
        donvi = None
        ten_donvi = ""
        if donvi_id is not None and donvi_id != "":
            donvi = db.session.query(DonVi).filter(and_(\
                DonVi.id == donvi_id, \
                DonVi.deleted == False, \
                DonVi.active == True)).first()
        if donvi is not None:
            ten_donvi = donvi.ten_coso

        return jinja.render('export_pdf/gacp_khaithac.html', request, chitieu_gacp=to_dict(chitieu_gacp), ten_donvi = ten_donvi, static_url="static")


@app.route('/api/v1/test_gacp')
async def test_gacp(request):
    return jinja.render('export_pdf/gacp_nuoitrong.html', request,static_url="static")

@app.route('/api/v1/excel/thongke_nhapkhau', methods = ['POST'])
async def excel_thongke_nhapkhau(request):
    currentUser = current_user(request)
    user_token = request.headers.get("X-USER-TOKEN")
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại."}, status=520)
    data = request.json
    if data is  None:
        return json({"error_code" : "PARAM_ERROR", "error_message": "Tham số không hợp lệ"}, status=520)

    url = app.config.get("DOMAIN_URL", "http://127.0.0.1:12080") + "/api/v1/thongke_nhapkhau"
    resp = await HTTPClient.post(url=url, data= ujson.dumps(data), headers={"X-USER-TOKEN" : user_token})
    if "error_code" not in resp:
        list_baocao = []
        if "list_baocao" in resp and resp["list_baocao"]:
            list_baocao = resp['list_baocao']

            ### xuất excel 
            url_folder = app.config.get('PDF_FOLDER', '')
            file_name = "BaoCaoNhapKhau" + str(convert_timestamp_to_string(floor(time.time()), "%Y%m%d%H%M%S")) + ".xlsx"
            url_file =url_folder + file_name
            workbook = xlsxwriter.Workbook(url_file, {'in_memory': True})
            worksheet = workbook.add_worksheet("Sheet1")

            #set css
            #text right
            text_right_format = workbook.add_format({
                'border': 1,
                'align': 'right',
                'valign': 'vcenter',
                'text_wrap': 1
            })

            #text_center
            text_center_fornat = workbook.add_format({
                'align': 'center',
                'valign': 'vcenter',
                'text_wrap': 1
            })

            #Center+Bold
            center_bold_format = workbook.add_format({
                'bold': 1,
                'border': 1,
                'align': 'center',
                'valign': 'vcenter',
                'text_wrap': 1
            })

            #header
            header_format = workbook.add_format({
                'bold': 1,
                'border': 1,
                'align': 'center',
                'valign': 'vcenter',
                'text_wrap': 1,
                'font_size' : 13,
                'bg_color'  : "#f7f8f9"
            })


            #Color success
            green = workbook.add_format({
                'font_color' : '#003475'
            })

            #number format
            number_format = workbook.add_format({
                'align': 'right',
                'text_wrap': 1
            })

            ngay_bat_dau = convert_string_to_time(data.get("ngay_bat_dau"))
            ngay_ket_thuc = convert_string_to_time(data.get("ngay_ket_thuc"))

            worksheet.merge_range("A1:I1", "Thống kê dược liệu nhập khẩu", center_bold_format)
            worksheet.merge_range("A2:C2", "Từ ngày: {}".format(ngay_bat_dau))
            worksheet.merge_range("D2:F2", "Đến ngày: {}".format(ngay_ket_thuc))
            worksheet.set_column("A1:I1", 12)
            worksheet.set_row(2, 45)
            worksheet.set_row(0,50)
            worksheet.set_row(1, 30)

            #header 
            worksheet.write_string("A3", "Tên Đơn Vị", header_format)
            worksheet.write_string('B3', "Tên dược liệu", header_format)
            worksheet.write_string("C3", "Số giấy phép NK", header_format)
            worksheet.write_string("D3", "SL cấp phép (KG)", header_format)
            worksheet.write_string("E3", "SL nhập khẩu thực tế (KG)", header_format)
            worksheet.write_string("F3", "Số CO", header_format)
            worksheet.write_string("G3", "Đơn vị sản xuất", header_format)
            worksheet.write_string("H3", "Cửa khẩu", header_format)
            worksheet.write_string("I3", "Giá nhập", header_format)

            row = 3
            col = 0

            # print("list bao cao=====================================: ", list_baocao)

            for item in list_baocao:
                ten_donvi = item.get("ten_donvi", "")
                list_sanpham = item.get("list_sanpham")
                if isinstance(list_sanpham, list) == False:
                    list_sanpham = []
                count = len(list_sanpham)
                if count >0:
                    lenCo = 0
                    # row_donvi = row
                    # col_donvi = col
                    # for sanpham in list_sanpham:
                    #     so_co = sanpham.get("so_co")
                    #     if isinstance(so_co, list) ==  False:
                    #         so_co = []
                    #     lenCo += len(so_co)
                    if count >1:
                        worksheet.merge_range("A{}:A{}".format(row + 1, row +1 + count-1), ten_donvi)
                    else:
                        worksheet.write_string(row, col, ten_donvi)
                    for sanpham in list_sanpham:
                        ten_duoc_lieu = sanpham.get("ten_duoc_lieu", "")
                        ten_khoa_hoc = sanpham.get("ten_khoa_hoc", "")
                        so_giay_phep = sanpham.get("so_giay_phep", "")
                        so_luong_capphep = validate_number(sanpham.get("so_luong_capphep"))
                        so_luong_nhap = validate_number(sanpham.get("so_luong_nhap"))
                        donvi_sanxuat = sanpham.get("donvi_sanxuat", "")
                        cuakhau = sanpham.get("cuakhau", "")
                        dongia = validate_number(sanpham.get("dongia"))
                        so_co = sanpham.get("so_co")
                        if isinstance(so_co, list) ==  False:
                            so_co = []
                        # lenCo += len(so_co)
                        # if len(so_co) >1:
                        #     worksheet.merge_range("B{}:B{}".format(row + 1, row +1 + len(so_co) -1), "{}-{}".format(ten_duoc_lieu, ten_khoa_hoc))
                        #     worksheet.merge_range("C{}:C{}".format(row + 1, row +1 + len(so_co) -1), so_giay_phep, green)
                        #     worksheet.merge_range("D{}:D{}".format(row + 1, row +1 + len(so_co) -1), so_luong_capphep, number_format)
                        #     worksheet.merge_range("E{}:E{}".format(row + 1, row +1 + len(so_co) -1), so_luong_nhap, number_format)
                        #     tmp =  row
                        #     for co in so_co:
                        #         worksheet.write(tmp, col+5, co, green)
                        #         tmp +=1
                        #     worksheet.merge_range("G{}:G{}".format(row + 1, row +1 + len(so_co) -1), donvi_sanxuat)
                        #     worksheet.merge_range("H{}:H{}".format(row + 1, row +1 + len(so_co) -1), cuakhau)
                        #     worksheet.merge_range("I{}:I{}".format(row + 1, row +1 + len(so_co) -1), dongia, number_format)
                        # else:
                        worksheet.write_string(row, col+1, "{}-{}".format(ten_duoc_lieu, ten_khoa_hoc))
                        worksheet.write(row, col+2, so_giay_phep, green)
                        worksheet.write(row, col+3, so_luong_capphep, number_format)
                        worksheet.write(row, col+4, so_luong_nhap, number_format)
                        # tmp =  row
                        # so_co_tmp = ""

                        # for co in so_co:
                        #     so_co_tmp = so_co_tmp.join + co + "; "
                            # tmp +=1
                        worksheet.write(row, col+5, "; ".join(so_co), green)
                        worksheet.write(row, col+6, donvi_sanxuat)
                        worksheet.write(row, col+7, cuakhau)
                        worksheet.write(row, col+8, dongia, number_format)
                        # row += len(so_co)
                        row += 1

                    # if lenCo >1:
                    #     worksheet.merge_range("A{}:A{}".format(row_donvi + 1, row_donvi +1 + lenCo-1), ten_donvi)
                    # else:
                    #     worksheet.write_string(row_donvi, col_donvi, ten_donvi)

            workbook.close()
            url = "/static/export_pdf/" + file_name
            return json(url, status=200)

    else:
        return json({'error_code': "PARAM_ERROR", 'error_message': "Không thể xuất excel, vui lòng thử lại sau"}, status=520)

    
@app.route('/api/v1/excel/thongke_thugom', methods = ['POST'])
async def excel_thongke_thugom(request):
    currentUser = current_user(request)
    user_token = request.headers.get("X-USER-TOKEN")
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại."}, status=520)
    data = request.json
    if data is  None:
        return json({"error_code" : "PARAM_ERROR", "error_message": "Tham số không hợp lệ"}, status=520)

    url = app.config.get("DOMAIN_URL", "http://127.0.0.1:12080") + "/api/v1/thongke_thugom"
    resp = await HTTPClient.post(url=url, data= ujson.dumps(data), headers={"X-USER-TOKEN" : user_token})
    if "error_code" not in resp:
        list_baocao = []
        if "list_baocao" in resp and resp["list_baocao"]:
            list_baocao = resp['list_baocao']
            ### xuất excel 
            url_folder = app.config.get('PDF_FOLDER', '')
            file_name = "BaoCaoThuGom" + str(convert_timestamp_to_string(floor(time.time()), "%Y%m%d%H%M%S")) + ".xlsx"
            url_file =url_folder + file_name
            workbook = xlsxwriter.Workbook(url_file, {'in_memory': True})
            worksheet = workbook.add_worksheet("Sheet1")

            #set css
            #text right
            text_right_format = workbook.add_format({
                'border': 1,
                'align': 'right',
                'valign': 'vcenter',
                'text_wrap': 1
            })

            #text_center
            text_center_fornat = workbook.add_format({
                'align': 'center',
                'valign': 'vcenter',
                'text_wrap': 1
            })

            #Center+Bold
            center_bold_format = workbook.add_format({
                'bold': 1,
                'border': 1,
                'align': 'center',
                'valign': 'vcenter',
                'text_wrap': 1
            })

            #header
            header_format = workbook.add_format({
                'bold': 1,
                'border': 1,
                'align': 'center',
                'valign': 'vcenter',
                'text_wrap': 1,
                'font_size' : 13,
                'bg_color'  : "#f7f8f9"
            })


            #Color success
            green = workbook.add_format({
                'font_color' : '#003475'
            })

            #number format
            number_format = workbook.add_format({
                'align': 'right',
                'text_wrap': 1
            })

            ngay_bat_dau = convert_string_to_time(data.get("ngay_bat_dau"))
            ngay_ket_thuc = convert_string_to_time(data.get("ngay_ket_thuc"))


            #header 
            worksheet.write_string("A3", "Tên Đơn Vị", header_format)
            worksheet.write_string('B3', "Tên dược liệu", header_format)
            worksheet.write_string("C3", "SL thu mua (KG)", header_format)
            worksheet.write_string("D3", "Địa chỉ cơ sở thu mua", header_format)
            worksheet.write_string("E3", "Giá thu mua", header_format)
            worksheet.write_string("F3", "Số chứng nhận nguồn gốc CO", header_format)

            worksheet.merge_range("A1:F1", "Thống kê dược liệu thu gom", center_bold_format)
            worksheet.merge_range("A2:C2", "Từ ngày: {}".format(ngay_bat_dau))
            worksheet.merge_range("D2:F2", "Đến ngày: {}".format(ngay_ket_thuc))
            worksheet.set_column("A1:F1", 15)
            worksheet.set_row(2, 45)
            worksheet.set_row(0,50)
            worksheet.set_row(1, 30)

            row = 3
            col = 0
            for item in list_baocao:
                ten_donvi = item.get("ten_donvi", "")
                list_sanpham = item.get("list_sanpham")
                if isinstance(list_sanpham, list) == False:
                    list_sanpham = []
                count = len(list_sanpham)
                if count>0:
                    if count >1:
                        worksheet.merge_range("A{}:A{}".format(row + 1, row +1 + count-1), ten_donvi)
                    else:
                        worksheet.write_string(row, col, ten_donvi)
                    for sanpham in list_sanpham:
                        ten_duoc_lieu = sanpham.get("ten_duoc_lieu", "")
                        ten_khoa_hoc = sanpham.get("ten_khoa_hoc", "")
                        so_luong_thumua = validate_number(sanpham.get("so_luong_thumua"))
                        diachi_thumua = sanpham.get("diachi_thumua", "")
                        dongia = validate_number(sanpham.get("dongia"))
                        so_co = sanpham.get("so_co", "")
                        
                        worksheet.write_string(row, col+1, "{}-{}".format(ten_duoc_lieu, ten_khoa_hoc))
                        worksheet.write(row, col+2, so_luong_thumua, number_format)
                        worksheet.write(row, col+3, diachi_thumua)
                        worksheet.write(row, col+4, dongia, number_format)
                        worksheet.write(row, col+5, so_co)
                        row +=1    



            workbook.close()
            url = "/static/export_pdf/" + file_name
            return json(url, status=200)

    else:
        return json({'error_code': "PARAM_ERROR", 'error_message': "Không thể xuất excel, vui lòng thử lại sau"}, status=520)

    
@app.route('/api/v1/excel/thongke_nuoitrong', methods = ['POST'])
async def excel_thongke_nuoitrong(request):
    currentUser = current_user(request)
    user_token = request.headers.get("X-USER-TOKEN")
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại."}, status=520)
    data = request.json
    if data is  None:
        return json({"error_code" : "PARAM_ERROR", "error_message": "Tham số không hợp lệ"}, status=520)

    url = app.config.get("DOMAIN_URL", "http://127.0.0.1:12080") + "/api/v1/thongke_nuoitrong"
    resp = await HTTPClient.post(url=url, data= ujson.dumps(data), headers={"X-USER-TOKEN" : user_token})
    if "error_code" not in resp:
        list_baocao = []
        if "list_baocao" in resp and resp["list_baocao"]:
            list_baocao = resp['list_baocao']
            ### xuất excel 
            url_folder = app.config.get('PDF_FOLDER', '')
            file_name = "BaoCaoNuoiTrong" + str(convert_timestamp_to_string(floor(time.time()), "%Y%m%d%H%M%S")) + ".xlsx"
            url_file =url_folder + file_name
            workbook = xlsxwriter.Workbook(url_file, {'in_memory': True})
            worksheet = workbook.add_worksheet("Sheet1")

            #set css
            #text right
            text_right_format = workbook.add_format({
                'border': 1,
                'align': 'right',
                'valign': 'vcenter',
                'text_wrap': 1
            })

            #text_center
            text_center_fornat = workbook.add_format({
                'align': 'center',
                'valign': 'vcenter',
                'text_wrap': 1
            })

            #Center+Bold
            center_bold_format = workbook.add_format({
                'bold': 1,
                'border': 1,
                'align': 'center',
                'valign': 'vcenter',
                'text_wrap': 1
            })

            #header
            header_format = workbook.add_format({
                'bold': 1,
                'border': 1,
                'align': 'center',
                'valign': 'vcenter',
                'text_wrap': 1,
                'font_size' : 13,
                'bg_color'  : "#f7f8f9"
            })


            #Color success
            green = workbook.add_format({
                'font_color' : '#003475'
            })

            #number format
            number_format = workbook.add_format({
                'align': 'right',
                'text_wrap': 1
            })

            ngay_bat_dau = convert_string_to_time(data.get("ngay_bat_dau"))
            ngay_ket_thuc = convert_string_to_time(data.get("ngay_ket_thuc"))


            #header 
            worksheet.write_string("A3", "Tên Đơn Vị", header_format)
            worksheet.write_string('B3', "Tên dược liệu", header_format)
            worksheet.write_string("C3", "SL nuôi trồng (KG)", header_format)
            worksheet.write_string("D3", "Số chứng nhận nguồn gốc CO", header_format)

            worksheet.merge_range("A1:D1", "Thống kê dược liệu thu gom", center_bold_format)
            worksheet.merge_range("A2:B2", "Từ ngày: {}".format(ngay_bat_dau))
            worksheet.merge_range("C2:D2", "Đến ngày: {}".format(ngay_ket_thuc))
            worksheet.set_column("A1:D1", 15)
            worksheet.set_row(2, 45)
            worksheet.set_row(0,50)
            worksheet.set_row(1, 30)

            row = 3
            col = 0
            for item in list_baocao:
                ten_donvi = item.get("ten_donvi", "")
                list_sanpham = item.get("list_sanpham")
                if isinstance(list_sanpham, list) == False:
                    list_sanpham = []
                count = len(list_sanpham)
                if count>0:
                    if count >1:
                        worksheet.merge_range("A{}:A{}".format(row + 1, row +1 + count-1), ten_donvi)
                    else:
                        worksheet.write_string(row, col, ten_donvi)
                    for sanpham in list_sanpham:
                        ten_duoc_lieu = sanpham.get("ten_duoc_lieu", "")
                        ten_khoa_hoc = sanpham.get("ten_khoa_hoc", "")
                        so_luong_nuoitrong = validate_number(sanpham.get("so_luong_nuoitrong"))
                        so_co = sanpham.get("so_co", "")
                        
                        worksheet.write_string(row, col+1, "{}-{}".format(ten_duoc_lieu, ten_khoa_hoc))
                        worksheet.write(row, col+2, so_luong_nuoitrong, number_format)
                        worksheet.write(row, col+3, so_co)
                        row +=1    

            workbook.close()
            url = "/static/export_pdf/" + file_name
            return json(url, status=200)

    else:
        return json({'error_code': "PARAM_ERROR", 'error_message': "Không thể xuất excel, vui lòng thử lại sau"}, status=520)


@app.route('/api/v1/excel/thongke_khaithac', methods = ['POST'])
async def excel_thongke_khaithac(request):
    currentUser = current_user(request)
    user_token = request.headers.get("X-USER-TOKEN")
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại."}, status=520)
    data = request.json
    if data is  None:
        return json({"error_code" : "PARAM_ERROR", "error_message": "Tham số không hợp lệ"}, status=520)

    url = app.config.get("DOMAIN_URL", "http://127.0.0.1:12080") + "/api/v1/thongke_khaithac"
    resp = await HTTPClient.post(url=url, data= ujson.dumps(data), headers={"X-USER-TOKEN" : user_token})
    if "error_code" not in resp:
        list_baocao = []
        if "list_baocao" in resp and resp["list_baocao"]:
            list_baocao = resp['list_baocao']
            ### xuất excel 
            url_folder = app.config.get('PDF_FOLDER', '')
            file_name = "BaoCaoKhaiThac" + str(convert_timestamp_to_string(floor(time.time()), "%Y%m%d%H%M%S")) + ".xlsx"
            url_file =url_folder + file_name
            workbook = xlsxwriter.Workbook(url_file, {'in_memory': True})
            worksheet = workbook.add_worksheet("Sheet1")

            #set css
            #text right
            text_right_format = workbook.add_format({
                'border': 1,
                'align': 'right',
                'valign': 'vcenter',
                'text_wrap': 1
            })

            #text_center
            text_center_fornat = workbook.add_format({
                'align': 'center',
                'valign': 'vcenter',
                'text_wrap': 1
            })

            #Center+Bold
            center_bold_format = workbook.add_format({
                'bold': 1,
                'border': 1,
                'align': 'center',
                'valign': 'vcenter',
                'text_wrap': 1
            })

            #header
            header_format = workbook.add_format({
                'bold': 1,
                'border': 1,
                'align': 'center',
                'valign': 'vcenter',
                'text_wrap': 1,
                'font_size' : 13,
                'bg_color'  : "#f7f8f9"
            })


            #Color success
            green = workbook.add_format({
                'font_color' : '#003475'
            })

            #number format
            number_format = workbook.add_format({
                'align': 'right',
                'text_wrap': 1
            })

            ngay_bat_dau = convert_string_to_time(data.get("ngay_bat_dau"))
            ngay_ket_thuc = convert_string_to_time(data.get("ngay_ket_thuc"))


            #header 
            worksheet.write_string("A3", "Tên Đơn Vị", header_format)
            worksheet.write_string('B3', "Tên dược liệu", header_format)
            worksheet.write_string("C3", "SL khai thác tự nhiên (KG)", header_format)
            worksheet.write_string("D3", "Số chứng nhận nguồn gốc CO", header_format)

            worksheet.merge_range("A1:D1", "Thống kê dược liệu khai thác tự nhiên", center_bold_format)
            worksheet.merge_range("A2:B2", "Từ ngày: {}".format(ngay_bat_dau))
            worksheet.merge_range("C2:D2", "Đến ngày: {}".format(ngay_ket_thuc))
            worksheet.set_column("A1:D1", 15)
            worksheet.set_row(2, 45)
            worksheet.set_row(0,50)
            worksheet.set_row(1, 30)

            row = 3
            col = 0
            for item in list_baocao:
                ten_donvi = item.get("ten_donvi", "")
                list_sanpham = item.get("list_sanpham")
                if isinstance(list_sanpham, list) == False:
                    list_sanpham = []
                count = len(list_sanpham)
                if count>0:
                    if count >1:
                        worksheet.merge_range("A{}:A{}".format(row + 1, row +1 + count-1), ten_donvi)
                    else:
                        worksheet.write_string(row, col, ten_donvi)
                    for sanpham in list_sanpham:
                        ten_duoc_lieu = sanpham.get("ten_duoc_lieu", "")
                        ten_khoa_hoc = sanpham.get("ten_khoa_hoc", "")
                        so_luong_khaithac = validate_number(sanpham.get("so_luong_khaithac"))
                        so_co = sanpham.get("so_co", "")
                        
                        worksheet.write_string(row, col+1, "{}-{}".format(ten_duoc_lieu, ten_khoa_hoc))
                        worksheet.write(row, col+2, so_luong_khaithac, number_format)
                        worksheet.write(row, col+3, so_co)
                        row +=1    

            workbook.close()
            url = "/static/export_pdf/" + file_name
            return json(url, status=200)

    else:
        return json({'error_code': "PARAM_ERROR", 'error_message': "Không thể xuất excel, vui lòng thử lại sau"}, status=520)


@app.route('/api/v1/excel/thongke_phanphoi', methods = ['POST'])
async def excel_thongke_phanphoi(request):
    currentUser = current_user(request)
    user_token = request.headers.get("X-USER-TOKEN")
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại."}, status=520)
    data = request.json
    if data is  None:
        return json({"error_code" : "PARAM_ERROR", "error_message": "Tham số không hợp lệ"}, status=520)

    url = app.config.get("DOMAIN_URL", "http://127.0.0.1:12080") + "/api/v1/thongke_phanphoi"
    resp = await HTTPClient.post(url=url, data= ujson.dumps(data), headers={"X-USER-TOKEN" : user_token})
    if "error_code" not in resp:
        list_baocao = []
        if "list_baocao" in resp and resp["list_baocao"]:
            list_baocao = resp['list_baocao']
            ### xuất excel 
            url_folder = app.config.get('PDF_FOLDER', '')
            file_name = "BaoCaoPhanPhoi" + str(convert_timestamp_to_string(floor(time.time()), "%Y%m%d%H%M%S")) + ".xlsx"
            url_file =url_folder + file_name
            workbook = xlsxwriter.Workbook(url_file, {'in_memory': True})
            worksheet = workbook.add_worksheet("Sheet1")

            #set css
            #text right
            text_right_format = workbook.add_format({
                'border': 1,
                'align': 'right',
                'valign': 'vcenter',
                'text_wrap': 1
            })

            #text_center
            text_center_fornat = workbook.add_format({
                'align': 'center',
                'valign': 'vcenter',
                'text_wrap': 1
            })

            #Center+Bold
            center_bold_format = workbook.add_format({
                'bold': 1,
                'border': 1,
                'align': 'center',
                'valign': 'vcenter',
                'text_wrap': 1
            })

            #header
            header_format = workbook.add_format({
                'bold': 1,
                'border': 1,
                'align': 'center',
                'valign': 'vcenter',
                'text_wrap': 1,
                'font_size' : 13,
                'bg_color'  : "#f7f8f9"
            })


            #Color success
            green = workbook.add_format({
                'font_color' : '#003475'
            })

            #number format
            number_format = workbook.add_format({
                'align': 'right',
                'text_wrap': 1
            })

            ngay_bat_dau = convert_string_to_time(data.get("ngay_bat_dau"))
            ngay_ket_thuc = convert_string_to_time(data.get("ngay_ket_thuc"))


            #header 
            worksheet.write_string("A3", "Tên Đơn Vị", header_format)
            worksheet.write_string('B3', "Tên dược liệu", header_format)
            worksheet.write_string("C3", "SL tồn đầu kỳ (KG)", header_format)
            worksheet.write_string("D3", "SL nhập trong kỳ (KG)", header_format)
            worksheet.write_string("E3", "SL xuất trong kỳ (KG)", header_format)
            worksheet.write_string("F3", "SL tồn cuối kỳ (KG)", header_format)
            worksheet.write_string("G3", "Đơn vị cung ứng", header_format)

            worksheet.merge_range("A1:G1", "Thống kê phân phối dược liệu", center_bold_format)
            worksheet.merge_range("A2:B2", "Từ ngày: {}".format(ngay_bat_dau))
            worksheet.merge_range("C2:D2", "Đến ngày: {}".format(ngay_ket_thuc))
            worksheet.set_column("A1:B1", 30)
            worksheet.set_column("C1:F1", 12)
            worksheet.set_column("G:G", 30)
            worksheet.set_row(2, 45)
            worksheet.set_row(0,50)
            worksheet.set_row(1, 30)

            row = 3
            col = 0
            listCounter = []
            for item in list_baocao:
                list_sanpham = item.get("list_sanpham")
                if isinstance(list_sanpham, list) == False:
                    list_sanpham = []
                count = 0
                for sanpham in list_sanpham:
                    sl_nhap = sanpham.get("nhap_trong_ky")
                    sl_xuat = sanpham.get("xuat_trong_ky")
                    arrChitietNhapXuat = sanpham.get("chitiet_nhap_xuat")
                    if isinstance(arrChitietNhapXuat, list) == False:
                        arrChitietNhapXuat = []
                    if len(arrChitietNhapXuat) >1:
                        count += (len(arrChitietNhapXuat) +1)
                    elif len(arrChitietNhapXuat) ==1 and (arrChitietNhapXuat[0].get("soluong_nhap") != sl_nhap) and \
                        (arrChitietNhapXuat[0].get("soluong_xuat") != arrChitietNhapXuat[0].get("soluong_xuat")):
                        count += (len(arrChitietNhapXuat) +1)
                    else:
                        count +=1
                listCounter.append(count)

            for item in list_baocao:
                list_sanpham = item.get("list_sanpham")
                if isinstance(list_sanpham, list) == False:
                    list_sanpham = []    
                count = len(list_sanpham)    
                if count>0:        
                    ten_donvi = item.get("ten_donvi", "")
                    index = list_baocao.index(item)
                    cnt = listCounter[index]
                    if cnt >1:
                        worksheet.merge_range("A{}:A{}".format(row + 1, row +1 + cnt-1), ten_donvi)
                    else:
                        worksheet.write_string(row, col, ten_donvi)

                    for sanpham in list_sanpham:
                        ten_duoc_lieu = sanpham.get("ten_duoc_lieu", "")
                        ten_khoa_hoc = sanpham.get("ten_khoa_hoc", "")
                        ton_dau_ky = validate_number(sanpham.get("ton_dau_ky"))
                        nhap_trong_ky = validate_number(sanpham.get("nhap_trong_ky"))
                        xuat_trong_ky = validate_number(sanpham.get("xuat_trong_ky"))
                        ton_cuoi_ky = validate_number(sanpham.get("ton_cuoi_ky"))

                        chitiet_nhap_xuat =sanpham.get("chitiet_nhap_xuat")
                        if isinstance(chitiet_nhap_xuat, list) == False:
                            chitiet_nhap_xuat = []

                        if len(chitiet_nhap_xuat) >1:
                            worksheet.merge_range("B{}:B{}".format(row+1, row+1 + len(chitiet_nhap_xuat)), "{}-{}".format(ten_duoc_lieu, ten_khoa_hoc))
                            worksheet.write(row, col + 2, ton_dau_ky, number_format)
                            worksheet.write(row, col + 3, nhap_trong_ky, number_format)
                            worksheet.write(row, col + 4, xuat_trong_ky, number_format)
                            worksheet.write(row, col + 5, ton_cuoi_ky, number_format)

                            row +=1
                            for nhap_xuat in chitiet_nhap_xuat:
                                soluong_nhap = validate_number(nhap_xuat.get("soluong_nhap"))
                                soluong_xuat = validate_number(nhap_xuat.get("soluong_xuat"))    
                                ten_dv_cungung = nhap_xuat.get("ten_dv_cungung", "")
                                worksheet.write(row, col + 3, soluong_nhap, number_format)
                                worksheet.write(row, col + 4, soluong_xuat, number_format)
                                worksheet.write(row, col + 6, ten_dv_cungung)    
                                row+=1
                        elif len(chitiet_nhap_xuat) ==1 and chitiet_nhap_xuat[0].get("soluong_nhap") == nhap_trong_ky and \
                            chitiet_nhap_xuat[0].get("soluong_xuat") == xuat_trong_ky:
                            worksheet.write(row, col+1, "{}-{}".format(ten_duoc_lieu, ten_khoa_hoc)) 
                            worksheet.write(row, col + 2, ton_dau_ky, number_format)
                            worksheet.write(row, col + 3, nhap_trong_ky, number_format)
                            worksheet.write(row, col + 4, xuat_trong_ky, number_format)
                            worksheet.write(row, col + 5, ton_cuoi_ky, number_format)
                            ten_dv_cungung = chitiet_nhap_xuat[0].get("ten_dv_cungung", "")
                            worksheet.write(row, col+6, ten_dv_cungung)
                            row +=1
                        elif len(chitiet_nhap_xuat) == 1:
                            worksheet.merge_range("B{}:B{}".format(row+1, row + 1 + len(chitiet_nhap_xuat)), "{}-{}".format(ten_duoc_lieu, ten_khoa_hoc))
                            worksheet.write(row, col + 2, ton_dau_ky, number_format)
                            worksheet.write(row, col + 3, nhap_trong_ky, number_format)
                            worksheet.write(row, col + 4, xuat_trong_ky, number_format)
                            worksheet.write(row, col + 5, ton_cuoi_ky, number_format)

                            row +=1
                            for nhap_xuat in chitiet_nhap_xuat:
                                soluong_nhap = validate_number(nhap_xuat.get("soluong_nhap"))
                                soluong_xuat = validate_number(nhap_xuat.get("soluong_xuat"))    
                                ten_dv_cungung = nhap_xuat.get("ten_dv_cungung", "")
                                worksheet.write(row, col + 3, soluong_nhap, number_format)
                                worksheet.write(row, col + 4, soluong_xuat, number_format)
                                worksheet.write(row, col + 6, ten_dv_cungung)    
                                row+=1
                        else:
                            worksheet.write(row, col + 1, "{}-{}".format(ten_duoc_lieu, ten_khoa_hoc))
                            worksheet.write(row, col + 2, ton_dau_ky, number_format)
                            worksheet.write(row, col + 3, nhap_trong_ky, number_format)
                            worksheet.write(row, col + 4, xuat_trong_ky, number_format)
                            worksheet.write(row, col + 5, ton_cuoi_ky, number_format)
                            row +=1

            workbook.close()
            url = "/static/export_pdf/" + file_name
            return json(url, status=200)

    else:
        return json({'error_code': "PARAM_ERROR", 'error_message': "Không thể xuất excel, vui lòng thử lại sau"}, status=520)

@app.route('/api/v1/excel/thongke_donvi', methods = ['POST'])
async def excel_thongke_donvi(request):
    currentUser = current_user(request)
    user_token = request.headers.get("X-USER-TOKEN")
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại."}, status=520)
    data = request.json
    if data is  None:
        return json({"error_code" : "PARAM_ERROR", "error_message": "Tham số không hợp lệ"}, status=520)

    url = app.config.get("DOMAIN_URL", "http://127.0.0.1:12080") + "/api/vi/thongke_donvi"
    resp = await HTTPClient.post(url=url, data= ujson.dumps(data), headers={"X-USER-TOKEN" : user_token})
    if "error_code" not in resp:
        list_baocao = []
        if "list_baocao" in resp and resp["list_baocao"]:
            list_baocao = resp['list_baocao']
            ### xuất excel 
            url_folder = app.config.get('PDF_FOLDER', '')
            file_name = "BaoCaoXuatNhapTon" + str(convert_timestamp_to_string(floor(time.time()), "%Y%m%d%H%M%S")) + ".xlsx"
            url_file =url_folder + file_name
            workbook = xlsxwriter.Workbook(url_file, {'in_memory': True})
            worksheet = workbook.add_worksheet("Sheet1")

            #set css
            #text right
            text_right_format = workbook.add_format({
                'border': 1,
                'align': 'right',
                'valign': 'vcenter',
                'text_wrap': 1
            })

            #text_center
            text_center_fornat = workbook.add_format({
                'align': 'center',
                'valign': 'vcenter',
                'text_wrap': 1
            })

            #Center+Bold
            center_bold_format = workbook.add_format({
                'bold': 1,
                'border': 1,
                'align': 'center',
                'valign': 'vcenter',
                'text_wrap': 1
            })

            #header
            header_format = workbook.add_format({
                'bold': 1,
                'border': 1,
                'align': 'center',
                'valign': 'vcenter',
                'text_wrap': 1,
                'font_size' : 13,
                'bg_color'  : "#f7f8f9"
            })


            #Color success
            green = workbook.add_format({
                'font_color' : '#003475'
            })

            #number format
            number_format = workbook.add_format({
                'align': 'right',
                'text_wrap': 1
            })

            ngay_bat_dau = convert_string_to_time(data.get("ngay_bat_dau"))
            ngay_ket_thuc = convert_string_to_time(data.get("ngay_ket_thuc"))


            #header 
            worksheet.write_string("A3", "Tên dược liệu", header_format)
            worksheet.write_string('B3', "Tên kho", header_format)
            worksheet.write_string("C3", "SL tồn đầu kỳ (KG)", header_format)
            worksheet.write_string("D3", "SL nhập trong kỳ (KG)", header_format)
            worksheet.write_string("E3", "SL xuất trong kỳ (KG)", header_format)
            worksheet.write_string("F3", "SL tồn cuối kỳ (KG)", header_format)

            worksheet.merge_range("A1:F1", "Thống kê số lượng nhập xuất tồn của đơn vị", center_bold_format)
            worksheet.merge_range("A2:B2", "Từ ngày: {}".format(ngay_bat_dau))
            worksheet.merge_range("C2:D2", "Đến ngày: {}".format(ngay_ket_thuc))
            worksheet.set_column("A1:B1", 30)
            worksheet.set_column("C1:F1", 12)
            worksheet.set_column("G:G", 30)
            worksheet.set_row(2, 45)
            worksheet.set_row(0,50)
            worksheet.set_row(1, 30)

            row = 3
            col = 0

            for item in list_baocao:
                list_sanpham =  item.get("list_sanpham")
                if isinstance(list_sanpham, list) == False:
                    list_sanpham = []

                count = len(list_sanpham)
                if count >0:
                    for sanpham in list_sanpham:
                        ten_duoc_lieu = sanpham.get("ten_duoc_lieu", "")
                        ten_khoa_hoc = sanpham.get("ten_khoa_hoc", "")
                        ton_dau_ky = validate_number(sanpham.get("ton_dau_ky"))
                        nhap_trong_ky = validate_number(sanpham.get("nhap_trong_ky"))
                        xuat_trong_ky = validate_number(sanpham.get("xuat_trong_ky"))
                        ton_cuoi_ky = validate_number(sanpham.get("ton_cuoi_ky"))
                        ten_kho = sanpham.get("ten_kho", "")
                        worksheet.write(row, col, "{}-{}".format(ten_duoc_lieu, ten_khoa_hoc))
                        worksheet.write(row, col+1, ten_kho)
                        worksheet.write(row, col+2, ton_dau_ky, number_format)
                        worksheet.write(row, col+3, nhap_trong_ky, number_format)
                        worksheet.write(row, col+4, xuat_trong_ky, number_format)
                        worksheet.write(row, col+5, ton_cuoi_ky, number_format)
                        row +=1

            workbook.close()
            url = "/static/export_pdf/" + file_name
            return json(url, status=200)

    else:
        return json({'error_code': "PARAM_ERROR", 'error_message': "Không thể xuất excel, vui lòng thử lại sau"}, status=520)



@app.route('/api_export/v1/export_duoclieu_trongkho',methods=['POST'])
async def export_vattu(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại."}, status=520)
    data = request.json
    donvi = currentUser.donvi
    if donvi is None:
        return json({"error_code": "PARAM_ERROR", "error_message": "Không tìm thấy thông tin đơn vị."}, status=520)


    donvi_id = data.get("donvi_id")
    if donvi_id is None or donvi_id == "":
        donvi_id = donvi_id
    ds_sanpham = db.session.query(KhoSanPham).filter(and_(KhoSanPham.donvi_id == donvi_id,\
        KhoSanPham.deleted == False)).all()

    if ds_sanpham is None:
        ds_sanpham = []

    
    url_folder = app.config.get('PDF_FOLDER', '')
    file_name = "danhsach_duoclieu" + str(convert_timestamp_to_string(floor(time.time()), "%Y%m%d%H%M%S")) + ".xlsx"
    url_file =url_folder + file_name
    workbook = xlsxwriter.Workbook(url_file, {'in_memory': True})
    worksheet = workbook.add_worksheet("Sheet1")
    format_center = workbook.add_format({'bold': True, 'text_wrap': True, 'border':1,'border_color': "#ffffff", "valign" : "vcenter"})
    format_center.set_font_name('Times New Roman')
    format_center.set_align("center")
    format_center.set_font_size(12)
    worksheet.merge_range('A1:E2', donvi.ten_coso, format_center)

    format_right_2 = workbook.add_format({'bold': True,'border':1, 'border_color': "#ffffff"})
    format_right_2.set_font_name('Times New Roman')
    format_right_2.set_font_size(10)
    format_right_2.set_align("center")

    format_right_3 = workbook.add_format({'text_wrap': True})
    format_right_3.set_font_name('Times New Roman')
    format_right_3.set_font_size(10)
    format_right_3.set_align("center")
    format_right_3.set_align("top")
    worksheet.merge_range('F1:I1', 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', format_center)


    format_right_3 = workbook.add_format({'bold': True})
    format_right_3.set_font_name('Times New Roman')
    format_right_3.set_font_size(10)
    format_right_3.set_align("center")
    worksheet.merge_range('F2:I2', 'Độc lập - Tự do - Hạnh phúc', format_center)

    format_center_content = workbook.add_format({'bold': True, 'text_wrap': True, 'border':1,'border_color': "#ffffff"})
    format_center_content.set_align("center")
    format_center_content.set_font_size(16)
    format_center_content.set_font_name('Times New Roman')
    worksheet.merge_range('A3:I3', "DANH SÁCH DƯỢC LIỆU TRONG KHO", format_center_content)
    current_row = 4
    format_right_ngaythang = workbook.add_format({'border':1,
        'border_color': "#fffff"})
    format_right_ngaythang.set_italic()
    format_right_ngaythang.set_align("center")
    format_right_ngaythang.set_font_name('Times New Roman')



    format_center_text = workbook.add_format({'text_wrap': True, 'border':1,'border_color': "#ffffff"})
    format_center_text.set_align("left")
    format_center_text.set_font_size(11)
    format_center_text.set_font_name('Times New Roman')

    format_color = workbook.add_format({
        'border':1,
        'border_color': "#ffffff"
    })
    format_color.set_font_name('Times New Roman')
    for i in range(200):
        worksheet.set_row(i,None , format_color)
    worksheet.set_row(2, 25, format_color)
    worksheet.set_row(1, 26, format_color)
    worksheet.set_row(0, 30, format_color)


    format_right_th = workbook.add_format({'text_wrap': True, 'bold': True, 'border':1,'border_color': "#000000"})
    format_right_th.set_font_name('Times New Roman')
    format_right_th.set_align("center")
    format_right_th.set_align("top")
    format_right_th.set_font_size(10)


    format_center_th = workbook.add_format({'text_wrap': True, 'bold': True, 'border':1,'border_color': "#000000"})
    format_center_th.set_font_name('Times New Roman')
    format_center_th.set_align("center")
    format_center_th.set_align("top")
    format_center_th.set_font_size(10)
    worksheet.write("A" + str(current_row + 1), 'STT', format_center_th)
    worksheet.write("B" + str(current_row + 1), 'Mã dược liệu',format_center_th)
    worksheet.write("C" + str(current_row + 1), 'Tên dược liệu',format_center_th)
    worksheet.write("D" + str(current_row + 1), 'Số lô', format_center_th)
    worksheet.write("E" + str(current_row + 1), 'Tên kho',format_center_th)
    worksheet.write("F" + str(current_row + 1), 'Số lượng tồn',format_right_th)
    worksheet.write("G" + str(current_row + 1), 'Đơn vị tính', format_right_th)
    worksheet.write("H" + str(current_row + 1), 'Giá nhập', format_right_th)
    worksheet.write("I" + str(current_row + 1), 'Hạn sử dụng', format_center_th)

    current_row = current_row + 2

    format_data_left = workbook.add_format({'border':1,
        'text_wrap': True,
        'border_color': "#000000"})
    format_data_left.set_align("left")
    format_data_left.set_align("top")
    format_data_left.set_font_name('Times New Roman')
    format_data_left.set_font_size(10)

    format_data_center = workbook.add_format({'border':1,
        'border_color': "#000000"})
    format_data_center.set_align("center")
    format_data_center.set_align("top")
    format_data_center.set_font_name('Times New Roman')
    format_data_center.set_font_size(10)

    format_data_right = workbook.add_format({'border':1,
        'border_color': "#000000",})
    format_data_right.set_align("right")
    format_data_right.set_align("top")
    format_data_right.set_font_name('Times New Roman')
    format_data_right.set_font_size(10)
    format_data_right.set_num_format('#,##0')

    stt = 1

    for item in ds_sanpham:
        item = to_dict(item)

        if item['hansudung'] is not None:
            item['hansudung'] = convert_timestamp_to_string(item['hansudung'], "%d/%m/%Y")
        else:
            item['hansudung'] = ""
        worksheet.write("A" + str(current_row), stt, format_data_center)
        worksheet.write("B" + str(current_row), item['ma_sanpham'], format_data_left)
        worksheet.write("C" + str(current_row), item['ten_sanpham'], format_data_left)
        worksheet.write("D" + str(current_row), item['so_lo'], format_data_left)
        worksheet.write("E" + str(current_row), item['ten_kho'],format_data_left)
        worksheet.write("F" + str(current_row), item['soluong'], format_data_left)
        worksheet.write("G" + str(current_row), "KG", format_data_left)
        worksheet.write("H" + str(current_row), item['dongia_nhap'],format_data_left)
        worksheet.write("I" + str(current_row), item['hansudung'],format_data_right)


        current_row = current_row + 1
        stt = stt + 1

    format_left_bold_1 = workbook.add_format({'text_wrap': True, 'bold': True})
    format_left_bold_1.set_font_name('Times New Roman')
    format_left_bold_1.set_align("right")
    format_left_bold_1.set_font_size(11)


    format_data_left_chu = workbook.add_format({'border':1, 'border_color': "#fffff", 'text_wrap': True})
    format_data_left_chu.set_align("left")
    format_data_left_chu.set_font_name('Times New Roman')
    format_data_left_chu.set_font_size(12)

    current_row = current_row + 1
    
    format_color_text_ki = workbook.add_format({'border':1,'bold': True,
        'border_color': "#fffff"})
    format_color_text_ki.set_font_name('Times New Roman')
    format_color_text_ki.set_align("center")
    format_color_text_ki.set_align('vcenter')
    format_color_text_ki.set_font_size(13)
    worksheet.set_row(18, 40, format_color_text_ki)

    
    worksheet.set_column('A:A', 4)
    worksheet.set_column('B:B', 17)
    worksheet.set_column('H:I', 10)
    worksheet.set_column('C:E', 11)
    worksheet.set_column('F:G', 17)
    workbook.close()
    url = "/static/export_pdf/" + file_name
    return json(url, status=200)



@app.route('/api/v1/export_excel_danhmuc_chung', methods =['POST'])
async def export_excel_danhmuc_chung(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại."}, status=520)

    
    danhMucSanPham = db.session.query(DanhMucSanPham).filter(DanhMucSanPham.deleted == False).order_by(asc(DanhMucSanPham.tenkhongdau)).all()

    url_folder = app.config.get('PDF_FOLDER', '')
    file_name = "danhsach_duoclieu" + str(convert_timestamp_to_string(floor(time.time()), "%Y%m%d%H%M%S")) + ".xlsx"
    url_file =url_folder + file_name
    workbook = xlsxwriter.Workbook(url_file, {'in_memory': True})
    worksheet = workbook.add_worksheet("Sheet1")

    #set css
    #text right
    text_right_format = workbook.add_format({
        'border': 1,
        'align': 'right',
        'valign': 'vcenter',
        'text_wrap': 1
    })

    #text_center
    text_center_fornat = workbook.add_format({
        'align': 'center',
        'valign': 'vcenter',
        'text_wrap': 1
    })

    #Center+Bold
    center_bold_format = workbook.add_format({
        'bold': 1,
        'border': 1,
        'align': 'center',
        'valign': 'vcenter',
        'text_wrap': 1
    })

    #header
    header_format = workbook.add_format({
        'bold': 1,
        'border': 1,
        'align': 'center',
        'valign': 'vcenter',
        'text_wrap': 1,
        'font_size' : 13,
        'bg_color'  : "#f7f8f9"
    })


    #Color success
    green = workbook.add_format({
        'font_color' : '#003475'
    })

    #number format
    number_format = workbook.add_format({
        'align': 'right',
        'text_wrap': 1
    })

    row = 3
    col = 0

    #header 
    worksheet.write_string("A3", "Tên dược liệu", header_format)
    worksheet.write_string("B3", "Tên khoa học", header_format)
    worksheet.write_string('C3', "Mã dược liệu dùng chung", header_format)
    worksheet.write_string("D3", "Bộ phận sử dụng", header_format)

    worksheet.merge_range("A1:D2", "Danh mục dược liệu sử dụng trên hệ thống truy xuất nguồn gốc", center_bold_format)

    worksheet.set_column("A:D", 30)
    worksheet.set_row(0, 40)
    worksheet.set_row(2, 25)


    for item in danhMucSanPham:
        ten_sanpham = item.ten_sanpham
        ten_khoa_hoc = item.ten_khoa_hoc
        ma_sanpham = item.ma_sanpham
        bophan_sudung = item.bophan_sudung

        worksheet.write(row, col, ten_sanpham)
        worksheet.write(row, col+1, ten_khoa_hoc)
        worksheet.write(row, col+2, ma_sanpham)
        worksheet.write(row, col+3, bophan_sudung)
        row +=1

    workbook.close()
    url = "/static/export_pdf/" + file_name
    return json(url, status=200)

@app.route('/api/v1/export_excel_danhmuc_donvi', methods =['POST'])
async def export_excel_danhmuc_donvi(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại."}, status=520)

    donvi_id = currentUser.donvi_id
    danhMucSanPham = db.session.query(DanhMucSanPhamDonVi).filter(\
        DanhMucSanPhamDonVi.deleted == False,\
        DanhMucSanPhamDonVi.donvi_id == donvi_id).\
        order_by(asc(DanhMucSanPhamDonVi.tenkhongdau)).all()

    url_folder = app.config.get('PDF_FOLDER', '')
    file_name = "danhsach_duoclieu" + str(convert_timestamp_to_string(floor(time.time()), "%Y%m%d%H%M%S")) + ".xlsx"
    url_file =url_folder + file_name
    workbook = xlsxwriter.Workbook(url_file, {'in_memory': True})
    worksheet = workbook.add_worksheet("Sheet1")

    #set css
    #text right
    text_right_format = workbook.add_format({
        'border': 1,
        'align': 'right',
        'valign': 'vcenter',
        'text_wrap': 1
    })

    #text_center
    text_center_fornat = workbook.add_format({
        'align': 'center',
        'valign': 'vcenter',
        'text_wrap': 1
    })

    #Center+Bold
    center_bold_format = workbook.add_format({
        'bold': 1,
        'border': 1,
        'align': 'center',
        'valign': 'vcenter',
        'text_wrap': 1
    })

    #header
    header_format = workbook.add_format({
        'bold': 1,
        'border': 1,
        'align': 'center',
        'valign': 'vcenter',
        'text_wrap': 1,
        'font_size' : 13,
        'bg_color'  : "#f7f8f9"
    })


    #Color success
    green = workbook.add_format({
        'font_color' : '#003475'
    })

    #number format
    number_format = workbook.add_format({
        'align': 'right',
        'text_wrap': 1
    })

    row = 3
    col = 0

    #header 
    worksheet.write_string("A3", "Tên dược liệu", header_format)
    worksheet.write_string('B3', "Tên khoa học", header_format)
    worksheet.write_string("C3", "Tên thương mại", header_format)
    worksheet.write_string("D3", "Mã dược liệu dùng chung", header_format)
    worksheet.write_string("E3", "Mã dược liệu đơn vị", header_format)
    worksheet.write_string("F3", "Bộ phận sử dụng", header_format)


    worksheet.merge_range("A1:F2", "Danh mục dược liệu đơn vị", center_bold_format)

    worksheet.set_column("A:F", 30)
    worksheet.set_row(0, 45)
    worksheet.set_row(2, 25)


    for item in danhMucSanPham:
        ten_sanpham = item.ten_sanpham
        ten_khoa_hoc = item.ten_khoa_hoc
        ma_sanpham = item.ma_sanpham
        bophan_sudung = item.bophan_sudung
        ten_thuong_mai = item.ten_thuong_mai
        ma_sanpham_donvi = item.ma_sanpham_donvi

        worksheet.write(row, col, ten_sanpham)
        worksheet.write(row, col+1, ten_khoa_hoc)
        worksheet.write(row, col+2, ten_thuong_mai)
        worksheet.write(row, col+3, ma_sanpham)
        worksheet.write(row, col+4, ma_sanpham_donvi)
        worksheet.write(row, col+5, bophan_sudung)

        row +=1

    workbook.close()
    url = "/static/export_pdf/" + file_name
    return json(url, status=200)

@app.route('/api/v1/export_quocgia', methods =['GET'])
async def export_quocgia(request):


    quocGia = db.session.query(QuocGia).filter(QuocGia.deleted == False).all()

    url_folder = app.config.get('PDF_FOLDER', '')
    file_name = "danhsach_quocgia" + str(convert_timestamp_to_string(floor(time.time()), "%Y%m%d%H%M%S")) + ".xlsx"
    url_file =url_folder + file_name
    workbook = xlsxwriter.Workbook(url_file, {'in_memory': True})
    worksheet = workbook.add_worksheet("Sheet1")

    #set css
    #text right
    text_right_format = workbook.add_format({
        'border': 1,
        'align': 'right',
        'valign': 'vcenter',
        'text_wrap': 1
    })

    #text_center
    text_center_fornat = workbook.add_format({
        'align': 'center',
        'valign': 'vcenter',
        'text_wrap': 1
    })

    #Center+Bold
    center_bold_format = workbook.add_format({
        'bold': 1,
        'border': 1,
        'align': 'center',
        'valign': 'vcenter',
        'text_wrap': 1
    })

    #header
    header_format = workbook.add_format({
        'bold': 1,
        'border': 1,
        'align': 'center',
        'valign': 'vcenter',
        'text_wrap': 1,
        'font_size' : 13,
        'bg_color'  : "#f7f8f9"
    })


    #Color success
    green = workbook.add_format({
        'font_color' : '#003475'
    })

    #number format
    number_format = workbook.add_format({
        'align': 'right',
        'text_wrap': 1
    })

    row = 3
    col = 0

    #header 
    worksheet.write_string("A3", "Tên quốc gia", header_format)
    worksheet.write_string('B3', "Mã quốc gia", header_format)


    worksheet.merge_range("A1:B1", "Danh mục quốc gia", center_bold_format)

    worksheet.set_column("A:B", 30)
    worksheet.set_row(0, 45)
    worksheet.set_row(2, 25)


    for item in quocGia:
        ten = item.ten
        ma = item.ma


        worksheet.write(row, col, ten)
        worksheet.write(row, col+1, ma)


        row +=1

    workbook.close()
    url = "/static/export_pdf/" + file_name
    return json(url, status=200)


