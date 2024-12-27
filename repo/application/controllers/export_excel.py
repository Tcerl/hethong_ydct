from application.models.model_danhmuc import DanhMucCuaKhau, DanhMucDonViSanXuatNhapKhau, DanhMucCungUngNuocNgoai
from application.models.model_duoclieu import TieuChuanChatLuong, DMCayThuoc, DMVungTrongDuocLieu

from application.controllers.helpers.constant import list_export_excel
from application.controllers.helpers.helper_common import default_uuid
from application.server import app
from application.database import redisdb, db
import xlsxwriter
from sanic import response
from gatco.response import json,text, html
import os

@app.route('/api_export/v1/file_pdf/<filename>', methods=['GET'])
async def view_file(request, filename=None):
    if filename is not None:
        url_folder = app.config.get('PDF_FOLDER', '')
        url_respone = url_folder + filename
        respone_file = await response.file(url_respone, mime_type='application/octet-stream', filename=filename)
        if os.path.exists(url_respone):
            os.remove(url_respone)
            return respone_file
        else:
            print("The file does not exist") 
    return json({"message": "Không tìm thấy file"}, status=520)

@app.route('/api_export/v1/export_category',methods=['POST'])
async def export_excel_thuoc_database(request):
    url_folder = app.config.get('PDF_FOLDER', '')
    type_export = request.json.get("type_export", None)
    file_name = "export_{}_{}.xlsx".format(type_export, default_uuid())
    url_file = url_folder + file_name
    workbook = xlsxwriter.Workbook(url_file, {'in_memory': True})
    worksheet = workbook.add_worksheet("Sheet1")
    fisrt_column = False

    if type_export == "danhmuc_cuakhau": 
        export_danhmuc_cuakhau(worksheet)

    elif type_export == "danhmuc_donvisanxuat_nhapkhau": 
        export_donvisanxuat_nhapkhau(worksheet)

    elif type_export == "danhmuc_cungung_nuoc_ngoai": 
        export_cungung_nuoc_ngoai(worksheet)

    elif type_export == "tieuchuan_chatluong": 
        export_chatluong(worksheet)

    workbook.close()
    url_file = '/api_export/v1/file_pdf/{}'.format(file_name)
    return json(url_file, status=200)

danhsach_loai_cuakhau = [
	{ "value": 1, "text": "Đường bộ - Cửa khẩu quốc tế" },
	{ "value": 2, "text": "Đường bộ - Cửa khẩu chính" },
	{ "value": 3, "text": "Đường bộ - Cửa khẩu phụ" },
	{ "value": 4, "text": "Đường sắt" },
	{ "value": 5, "text": "Đường hàng không" },
	{ "value": 6, "text": "Đường thủy loại I" },
	{ "value": 7, "text": "Đường thủy loại II" }
]

def export_danhmuc_cuakhau(worksheet):
    danhsach_cuakhau = db.session.query(DanhMucCuaKhau.ma_cuakhau, 
        DanhMucCuaKhau.ten_cuakhau, 
        DanhMucCuaKhau.phanloai, 
        DanhMucCuaKhau.diachi).filter(DanhMucCuaKhau.deleted == False).limit(10000).all()

    worksheet.write(0, 0, "STT")
    worksheet.write(0, 1, "Mã cửa khẩu")
    worksheet.write(0, 2, "Tên cửa khẩu")
    worksheet.write(0, 3, "Phân loại")
    worksheet.write(0, 4, "Địa chỉ")

    for index, cuakhau in enumerate(danhsach_cuakhau):
        row = index + 1
        worksheet.write(row, 0, row)
        worksheet.write(row, 1, getattr(cuakhau, 'ma_cuakhau', ""))
        worksheet.write(row, 2, getattr(cuakhau, 'ten_cuakhau', ""))
        phanloai = getattr(cuakhau, 'phanloai', "")
        phanloai_text = ""
        for loai_cuakhau in danhsach_loai_cuakhau:
            if phanloai == loai_cuakhau['value']:
                phanloai_text = loai_cuakhau['text']
                break
        worksheet.write(row, 3, phanloai_text)
        worksheet.write(row, 4, getattr(cuakhau, 'diachi', ""))


def export_donvisanxuat_nhapkhau(worksheet):
    danhsach_donvi_sanxuat = db.session.query(DanhMucDonViSanXuatNhapKhau.ten_donvi, 
        DanhMucDonViSanXuatNhapKhau.ma_donvi, 
        DanhMucDonViSanXuatNhapKhau.diachi, 
        DanhMucDonViSanXuatNhapKhau.quocgia).filter(DanhMucDonViSanXuatNhapKhau.deleted == False).limit(10000).all()

    worksheet.write(0, 0, "STT")
    worksheet.write(0, 1, "Tên đơn vị")
    worksheet.write(0, 2, "Mã đơn vị")
    worksheet.write(0, 3, "Địa chỉ")
    worksheet.write(0, 4, "Quốc gia")

    for index, _donvi_sanxuat in enumerate(danhsach_donvi_sanxuat):
        row = index + 1
        worksheet.write(row, 0, row)
        worksheet.write(row, 1, getattr(_donvi_sanxuat, 'ten_donvi', ""))
        worksheet.write(row, 2, getattr(_donvi_sanxuat, 'ma_donvi', ""))
        worksheet.write(row, 3, getattr(_donvi_sanxuat, 'diachi', ""))
        quocgia = _donvi_sanxuat.quocgia
        quocgia_ten = quocgia["ten"] if quocgia is not None else ""
        worksheet.write(row, 4, quocgia_ten)

def export_cungung_nuoc_ngoai(worksheet):
    danhsach_cungung_nuoc_ngoai = db.session.query(DanhMucCungUngNuocNgoai.ten_donvi, 
        DanhMucCungUngNuocNgoai.ma_donvi, 
        DanhMucCungUngNuocNgoai.diachi, 
        DanhMucCungUngNuocNgoai.quocgia).filter(DanhMucCungUngNuocNgoai.deleted == False).limit(10000).all()

    worksheet.write(0, 0, "STT")
    worksheet.write(0, 1, "Tên đơn vị")
    worksheet.write(0, 2, "Mã đơn vị")
    worksheet.write(0, 3, "Địa chỉ")
    worksheet.write(0, 4, "Quốc gia")

    for index, cungung_nuoc_ngoai in enumerate(danhsach_cungung_nuoc_ngoai):
        row = index + 1
        worksheet.write(row, 0, row)
        worksheet.write(row, 1, getattr(cungung_nuoc_ngoai, 'ten_donvi', ""))
        worksheet.write(row, 2, getattr(cungung_nuoc_ngoai, 'ma_donvi', ""))
        worksheet.write(row, 3, getattr(cungung_nuoc_ngoai, 'diachi', ""))
        quocgia = cungung_nuoc_ngoai.quocgia
        quocgia_ten = quocgia["ten"] if quocgia is not None else ""
        worksheet.write(row, 4, quocgia_ten)

def export_chatluong(worksheet):
    danhsach_chatluong = db.session.query(TieuChuanChatLuong.ma_tieuchuan, 
        TieuChuanChatLuong.ten_tieuchuan, 
        TieuChuanChatLuong.phanloai, 
        TieuChuanChatLuong.mota).filter(TieuChuanChatLuong.deleted == False).limit(10000).all()

    worksheet.write(0, 0, "STT")
    worksheet.write(0, 1, "Mã tiêu chuẩn")
    worksheet.write(0, 2, "Tên tiêu chuẩn")
    worksheet.write(0, 3, "Phân loại")
    worksheet.write(0, 4, "Mô tả")

    for index, chatluong in enumerate(danhsach_chatluong):
        row = index + 1
        worksheet.write(row, 0, row)
        worksheet.write(row, 1, getattr(chatluong, 'ma_tieuchuan', ""))
        worksheet.write(row, 2, getattr(chatluong, 'ten_tieuchuan', ""))
        worksheet.write(row, 4, getattr(chatluong, 'mota', ""))
        phanloai = chatluong.phanloai
        phanloai_ten = ""
        if phanloai == 1:
            phanloai_ten = "Dược liệu"
        elif phanloai == 2:
            phanloai_ten = "Sản phẩm"
        worksheet.write(row, 3, phanloai_ten)
        
def export_nhomsanpham(worksheet):
    danhsach_nhomsanpham = db.session.query(DanhMucNhomSanPham.ma_nhom, 
        TieuChuanChatLuong.ten_nhom, 
        TieuChuanChatLuong.mota).filter(TieuChuanChatLuong.deleted == False).limit(10000).all()

    worksheet.write(0, 0, "STT")
    worksheet.write(0, 1, "Mã nhóm")
    worksheet.write(0, 2, "Tên nhóm")
    worksheet.write(0, 3, "Mô tả")

    for index, nhomsanpham in enumerate(danhsach_nhomsanpham):
        row = index + 1
        worksheet.write(row, 0, row)
        worksheet.write(row, 1, getattr(nhomsanpham, 'ma_nhom', ""))
        worksheet.write(row, 2, getattr(nhomsanpham, 'ten_nhom', ""))
        worksheet.write(row, 3, getattr(nhomsanpham, 'mota', ""))


def export_sanpham(worksheet):
    danhsach_sanpham = db.session.query(DanhMucSanPham).filter(DanhMucSanPham.deleted == False).limit(10000).all()

    worksheet.write(0, 0, "STT")
    worksheet.write(0, 1, "Mã sản phẩm")
    worksheet.write(0, 2, "Tên sản phẩm")
    worksheet.write(0, 3, "Tên khoa học")

    for index, sanpham in enumerate(danhsach_sanpham):
        row = index + 1
        worksheet.write(row, 0, row)
        worksheet.write(row, 1, getattr(sanpham, 'ma_sanpham', ""))
        worksheet.write(row, 2, getattr(sanpham, 'ten_sanpham', ""))
        worksheet.write(row, 3, getattr(sanpham, 'ten_khoa_hoc', ""))

        worksheet.write(row, 4, getattr(sanpham, 'ten_trung_quoc', ""))
        worksheet.write(row, 5, getattr(sanpham, 'ma_nhom', ""))
        worksheet.write(row, 6, getattr(sanpham, 'ten_nhom', ""))
        worksheet.write(row, 7, getattr(sanpham, 'mota', ""))
        worksheet.write(row, 8, getattr(sanpham, 'hang_sanxuat', ""))
        worksheet.write(row, 9, getattr(sanpham, 'nuoc_sanxuat', ""))
        worksheet.write(row, 10, getattr(sanpham, 'loai_sanpham', ""))
        worksheet.write(row, 11, getattr(sanpham, 'donvitinh', ""))
        worksheet.write(row, 12, getattr(sanpham, 'bophan_sudung', ""))

        worksheet.write(row, 13, getattr(sanpham, 'dinh_luong', ""))
        worksheet.write(row, 14, getattr(sanpham, 'che_bien', ""))
        worksheet.write(row, 15, getattr(sanpham, 'bao_che', ""))


        worksheet.write(row, 13, getattr(sanpham, 'dinh_luong', ""))
        worksheet.write(row, 14, getattr(sanpham, 'che_bien', ""))
        worksheet.write(row, 15, getattr(sanpham, 'bao_che', ""))
        worksheet.write(row, 13, getattr(sanpham, 'bao_quan', ""))
        worksheet.write(row, 14, getattr(sanpham, 'cachdung_lieuluong', ""))
        worksheet.write(row, 15, getattr(sanpham, 'bao_che', ""))

def export_bophan_sanpham(worksheet):
    danhsach_bophan_sanpham = db.session.query(DanhMucNhomSanPham.ma_bophan, 
        TieuChuanChatLuong.ten_bophan, 
        TieuChuanChatLuong.mota).filter(TieuChuanChatLuong.deleted == False).limit(10000).all()

    worksheet.write(0, 0, "STT")
    worksheet.write(0, 1, "Mã bộ phận")
    worksheet.write(0, 2, "Tên bộ phận")
    worksheet.write(0, 3, "Mô tả")

    for index, bophan_sanpham in enumerate(danhsach_bophan_sanpham):
        row = index + 1
        worksheet.write(row, 0, row)
        worksheet.write(row, 1, getattr(bophan_sanpham, 'ma_bophan', ""))
        worksheet.write(row, 2, getattr(bophan_sanpham, 'ten_bophan', ""))
        worksheet.write(row, 3, getattr(bophan_sanpham, 'mota', ""))

        


