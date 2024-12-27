# Register Blueprints/Views.
# from application.extensions import jinja
# from .imageupload import imageupload
from application.models.model_danhmuc import *
from application.models.model_donvi import *
from application.models.model_duoclieu import *
from application.models.model_hanhnghe import *
from application.models.model_history import *
from application.models.model_sanpham import *
from application.models.models_tintuc import *
from application.models.models import *


def init_controllers(app):

    import application.controllers.user.forgot_password
    import application.controllers.user.userview
    import application.controllers.upload
    import application.controllers.donvi_api
    import application.controllers.danhmuc_api
    import application.controllers.export_excel
    import application.controllers.hanhnghe_api

    # import application.controllers.export_excel_pdf
    import application.controllers.nuoitrong_khaithac_api
    import application.controllers.duoclieu
    import application.controllers.app_api
    # import application.controllers.import_excel
    # import application.controllers.quanly_giaychungnhan_api
    # import application.controllers.truyxuat_api
    

    import application.controllers.news.news_api
    import application.controllers.news.crawl_data
    # import application.controllers.news.postview
    
