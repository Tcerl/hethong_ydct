""" Module represents a User. """

from sqlalchemy import (
    func, Column, Table, String, Integer, SmallInteger,BigInteger,
    DateTime, Date, Boolean, Float, Text, 
    Index, ForeignKey,UniqueConstraint, event, __version__
)
from sqlalchemy import or_,and_

from sqlalchemy.orm import relationship, backref
from sqlalchemy.orm.collections import attribute_mapped_collection


import uuid
from datetime import datetime

from gatco_restapi import ProcessingException
from application.database import db
from application.database.model import CommonModel, default_uuid
from sqlalchemy.dialects.postgresql import UUID, JSONB
from application.models.model_danhmuc import *


def default_uuid():
    return str(uuid.uuid4())

#tac gia
class Author(CommonModel):
    __tablename__ = 'author'
    id = db.Column(String, primary_key=True, default=default_uuid)
    name = db.Column(String)
    unsigned_name = db.Column(String, index=True)# ten khong dau 
    birthday = db.Column(String()) # YYYYDDMM
    gender = db.Column(SmallInteger(), default=1) # 1 - nam, 2 - nu, 3 - khac 
    introduce = db.Column(String)
    alias_name = db.Column(String)
    job_title = db.Column(String)
    phone = db.Column(String)
    email = db.Column(String)
    address = db.Column(String)
    workplace = db.Column(String) #Nơi làm việc
    years_of_experience = db.Column(String) #Năm kinh nghiệm
    field_of_activity = db.Column(String) #Lĩnh vực hoạt động
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=True)
    donvi = relationship('DonVi')

#chuyên mục
class Category(CommonModel):
    __tablename__ = 'category'
    id = db.Column(String, primary_key=True, default=default_uuid)
    image_thumbnail = db.Column(JSONB())
    name = db.Column(String)
    unsigned_name = db.Column(String, index=True)# ten khong dau cua chuyen muc
    path = db.Column(String, nullable=True, index=True)
    tags = db.Column(String)# danh sach cac tag của chuyên mục
    description = db.Column(String)# mô tả chuyên mục
    show_top_menu = db.Column(Boolean(), index=True, default=True)
    show_in_home = db.Column(Boolean(), index=True, default=True)
    cate_parent_id = db.Column(String, index=True)
    status = db.Column(SmallInteger(), default=0)# 1: Hiện chuyên mục, 0: Ẩn chuyên muc
    style_display  = db.Column(SmallInteger(), default=0)# quy uoc cac loai hien thi tren trang chu
    priority = db.Column(SmallInteger())# thứ tự ưu tiên hiển thị theo chuyên mục
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=True)
    donvi = relationship('DonVi')
    
Index('category_uq_path', Category.path, Category.donvi_id, unique=True, postgresql_where=(and_(Category.path.isnot(None), Category.path != '', Category.donvi_id.isnot(None), Category.donvi_id != '')))
    
# bài viết
class Post(CommonModel):
    __tablename__ = 'post'
    id = db.Column(String, primary_key=True, default=default_uuid)
    # categorie_id = db.Column(String, ForeignKey('category.id'), index=True)
    # categories = db.relationship("Category")# một bài viết có thể nằm trong nhiều chuyên mục
    title = db.Column(String)
    unsigned_title = db.Column(String, index=True)# tieu de khong dau cua bai viet
    path = db.Column(String, nullable=True, index=True)  #đường dẫn của bài viết
    detail_path = db.Column(String) 
    default_path = db.Column(Boolean(), default=True) # path mặc định theo title
    description = db.Column(String)
    content = db.Column(Text)
    image_thumbnail = db.Column(JSONB())# hình đại diện của bài viết
    avatar_doc = db.Column(JSONB())# hình đại diện của bài viết dạng dọc tỉ lệ 3:4
    avatar_vuong = db.Column(JSONB())# hình đại diện của bài viết dạng vuông tỉ lệ 1:1
    avatar_share_fb = db.Column(JSONB())# hình đại diện của bài viết share facebook tỉ lệ 600x315
    tags = db.Column(String)# danh sach cac tag của bai viet
    status = db.Column(SmallInteger, default=0, index=True)# Trạng thái hiển thị của bài viết. 0: lưu tạm, 1: bài chờ biên tập, 2: bài nhận biên tập, 3: bài đang xử lý, 4: bài bị trả, 5: bài bị gỡ, 6: bài được đăng, 7: Bai bị xóa
    approved_time = db.Column(BigInteger())  #thời gian đăng bài
    approved_by = db.Column(String())
    publish_time = db.Column(BigInteger(), index=True)# thời gian xuất bản bài viết
    returned_time = db.Column(BigInteger())
    returned_by = db.Column(String())
    #add
    priority = db.Column(SmallInteger())# thứ tự ưu tiên của bài viết, cần phải có quy ước để nhiều category áp dụng chung được
    tags_unsigned = db.Column(String)# danh sách từ khóa tìm kiếm của bài viết, lưu dạng không dấu
    tags_display = db.Column(String)# danh sách từ khóa tìm kiếm của bài viết
    is_highlights_home = db.Column(Boolean(), default=False)    #hiển thị trong mục highlights trên trang home
    is_highlights_category = db.Column(Boolean(), default=False) #hiển thị trong mục highlights trên trang category
    style_display  = db.Column(SmallInteger(), default=0)# Loại hiển thị trang detail, 0: SIZE M, 1: SIZE L, 2: MAGAZINE, 3: INFOGRAPHIC, 4: VIDEO TỰ CHẠY, 5: BÀI HỎI ĐÁP
    is_show = db.Column(SmallInteger(), default=1)# có hiển thị bài viết trong chuyên mục và home
    user_id = db.Column(String, index=True, nullable=False)
    show_comment = db.Column(Boolean(), default=True) # bài viết hiển thị comment hay không
    allowed_comment = db.Column(Boolean(), default=True) # bài viết được phép comment hay không
    allow_show_advertisement = db.Column(Boolean(), default=True)
    # allow_share =  db.Column(Boolean(), default=0)
    survey_id = db.Column(String, index=True, nullable=True)#co ap dung survey hay khong? neu co thi chon chuong trinh
    promotion_id = db.Column(String, index=True, nullable=True)# chuong trinh uu dai
    # advertisements = db.Column(JSONB())# danh sach quang cao hien thi trong bai viet
    # approvers = db.Column(JSONB())# Danh sách người duyệt bài
    author_id =  db.Column(String)
    is_show_avatar = db.Column(Boolean(), default=False)  #hiển thị avatar trang chi tiết
    tac_gia = db.Column(String())
    chuc_danh_tac_gia = db.Column(String())
    related_news = db.Column(JSONB())   #tin liên quan
    is_show_icon = db.Column(Boolean(), default=False)  #hiển thị icon
    avatar_caption = db.Column(String()) #chú thích avatar 
    note = db.Column(String()) 
    news_source = db.Column(String()) # nguồn tin tức
    link_original_post = db.Column(String())  #link bài gốc
    category_id = db.Column(String()) #chuyên mục chính
    related_category = db.Column(JSONB())  #chuyên mục liên quan
    topic = db.Column(JSONB())   #chủ đề
    is_sensitive = db.Column(Boolean(), default=False)  #bài nhạy cảm
    show_suggestion = db.Column(SmallInteger(), default=0)  #đề xuất hiển thị. 0: Tin thông thường, 1: Tin tiêu điểm
    is_post_pr = db.Column(Boolean(), default=False) #bài pr
    title_google = db.Column(String()) #tiêu đề hiển thị trên google 
    description_google = db.Column(String()) #mô tả hiển thị trên google 
    main_keyword = db.Column(String()) #từ khóa chủ đạo
    keywords = db.Column(String()) #từ khóa
    is_post_video = db.Column(Boolean(), default=False)  #có phải bài viết video hay không 
    age_group = db.Column(JSONB(), index=True)  #nhóm tuổi
    allow_send_notify = db.Column(Boolean(), default=False)# cho phep gui notify sang app so
    status_send_notify = db.Column(Boolean(), default=False)# trang thai da gui yeu cau thong bao hay chua 
    #Khu vuc muc tieu gui notify
    ward = db.Column(JSONB())  #Khu vuc muc tieu gui notify
    district = db.Column(JSONB())  #Khu vuc muc tieu gui notify
    province_id = db.Column(String)  #Khu vuc muc tieu gui notify
    reason_delete = db.Column(String)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=True)
    donvi = relationship('DonVi')

Index('post_uq_path', Post.path, Post.donvi_id, unique=True, postgresql_where=(and_(Post.path.isnot(None), Post.path != '', Post.donvi_id.isnot(None), Post.donvi_id != '')))

class PostPublish(CommonModel):
    __tablename__ = 'post_publish'
    id = db.Column(String, primary_key=True, default=default_uuid)
    # categorie_id = db.Column(String, ForeignKey('category.id'), index=True)
    # categories = db.relationship("Category")# một bài viết có thể nằm trong nhiều chuyên mục
    title = db.Column(String)
    unsigned_title = db.Column(String, index=True)# tieu de khong dau cua bai viet
    path = db.Column(String, nullable=True, index=True)  #đường dẫn của bài viết
    detail_path = db.Column(String) 
    default_path = db.Column(Boolean(), default=True) # path mặc định theo title
    description = db.Column(String)
    content = db.Column(Text)
    image_thumbnail = db.Column(JSONB())# hình đại diện của bài viết
    avatar_doc = db.Column(JSONB())# hình đại diện của bài viết dạng dọc tỉ lệ 3:4
    avatar_vuong = db.Column(JSONB())# hình đại diện của bài viết dạng vuông tỉ lệ 1:1
    avatar_share_fb = db.Column(JSONB())# hình đại diện của bài viết share facebook tỉ lệ 600x315
    tags = db.Column(String)# danh sach cac tag của bai viet
    status = db.Column(SmallInteger, default=0, index=True)# Trạng thái hiển thị của bài viết. 5 - gỡ bài, 6 - bài được đăng
    approved_time = db.Column(BigInteger())
    approved_by = db.Column(String())
    publish_time = db.Column(BigInteger(), index=True)# thời gian xuất bản bài viết
    returned_time = db.Column(BigInteger())
    returned_by = db.Column(String())
    #add
    priority = db.Column(SmallInteger())# thứ tự ưu tiên của bài viết, cần phải có quy ước để nhiều category áp dụng chung được
    tags_unsigned = db.Column(String)# danh sách từ khóa tìm kiếm của bài viết, lưu dạng không dấu
    tags_display = db.Column(String)# danh sách từ khóa tìm kiếm của bài viết
    is_highlights_home = db.Column(Boolean(), default=False, index=True)    #hiển thị trong mục highlights trên trang home
    is_highlights_category = db.Column(Boolean(), default=False, index=True)
    style_display  = db.Column(SmallInteger(), default=0)# Loại hiển thị trang detail, 0: SIZE M, 1: SIZE L, 2: MAGAZINE, 3: INFOGRAPHIC, 4: VIDEO TỰ CHẠY, 5: BÀI HỎI ĐÁP
    is_show = db.Column(SmallInteger(), default=1)# có hiển thị bài viết trong chuyên mục và home
    user_id = db.Column(String, index=True, nullable=False)
    show_comment = db.Column(Boolean(), default=True) # bài viết được hiển thị comment hay không
    allowed_comment = db.Column(Boolean(), default=True)
    allow_show_advertisement = db.Column(Boolean(), default=True)
    # allow_share =  db.Column(Boolean(), default=0)
    survey_id = db.Column(String, index=True, nullable=True)#co ap dung survey hay khong? neu co thi chon chuong trinh
    promotion_id = db.Column(String, index=True, nullable=True)# chuong trinh uu dai
    # advertisements = db.Column(JSONB())# danh sach quang cao hien thi trong bai viet
    # approvers = db.Column(JSONB())# Danh sách người duyệt bài
    author_id =  db.Column(String)
    is_show_avatar = db.Column(Boolean(), default=False)  #hiển thị avatar trang chi tiết
    tac_gia = db.Column(String())
    chuc_danh_tac_gia = db.Column(String())
    related_news = db.Column(JSONB())   #tin liên quan
    is_show_icon = db.Column(Boolean(), default=False)  #hiển thị icon
    avatar_caption = db.Column(String()) #chú thích avatar 
    note = db.Column(String()) 
    news_source = db.Column(String()) # nguồn tin tức
    link_original_post = db.Column(String())  #link bài gốc
    category_id = db.Column(String()) #chuyên mục chính
    related_category = db.Column(JSONB())  #chuyên mục liên quan
    topic = db.Column(JSONB())   #chủ đề
    is_sensitive = db.Column(Boolean(), default=False)  #bài nhạy cảm
    show_suggestion = db.Column(SmallInteger(), default=0)  #đề xuất hiển thị. 0: Tin thông thường, 1: Tin tiêu điểm
    is_post_pr = db.Column(Boolean(), default=False) #bài pr
    title_google = db.Column(String()) #tiêu đề hiển thị trên google 
    description_google = db.Column(String()) #mô tả hiển thị trên google 
    main_keyword = db.Column(String()) #từ khóa chủ đạo
    keywords = db.Column(String()) #từ khóa
    is_post_video = db.Column(Boolean(), default=False)  #có phải bài viết video hay không 
    age_group = db.Column(JSONB(), index=True)  #nhóm tuổi
    allow_send_notify = db.Column(Boolean(), default=False)# cho phep gui notify sang app so
    status_send_notify = db.Column(Boolean(), default=False)# trang thai da gui yeu cau thong bao hay chua 
    ward = db.Column(JSONB())  #Khu vuc muc tieu gui notify
    district = db.Column(JSONB())  #Khu vuc muc tieu gui notify
    province_id = db.Column(String) #Khu vuc muc tieu gui notify
    reason_delete = db.Column(String)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=True)
    donvi = relationship('DonVi')

Index('post_publish_uq_path', PostPublish.path, PostPublish.donvi_id, unique=True, postgresql_where=(and_(PostPublish.path.isnot(None), PostPublish.path != '', PostPublish.donvi_id.isnot(None), PostPublish.donvi_id != '')))

#advertisement placement
class FeatureNews(CommonModel):
    __tablename__ = 'feature_news'
    id = db.Column(String, primary_key=True, default=default_uuid)
    type_placement = db.Column(SmallInteger, index=True, default=1) # 1 - vị trí 1, 2,3,4,5
    list_news = db.Column(JSONB(), index=True)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=True)
    donvi = relationship('DonVi')


class SurveysInfo(CommonModel):
    __tablename__ = 'surveys_info'
    id = db.Column(String, primary_key=True, default=default_uuid)
    survey_name = db.Column(String,  nullable=False)
    survey_title = db.Column(String)
    survey_type = db.Column(String)
    # survey_content = db.Column(JSONB())# [{id, filed_name, label, type, placeholder, value, required}]
    start_time = db.Column(BigInteger)
    end_time = db.Column(BigInteger)
    status = db.Column(SmallInteger())
    survey_detail = relationship('SurveysDetail')

class SurveysSteps(CommonModel):
    __tablename__ = 'surveys_steps'
    id = db.Column(String, primary_key=True, default=default_uuid)
    survey_id = db.Column(String, ForeignKey('surveys_info.id'), index=True,  nullable=False)
    step_title = db.Column(String)
    step_description = db.Column(String)
    priority = db.Column(SmallInteger(), index=True, default=0)
    status = db.Column(SmallInteger(), default=1)


class SurveysDetail(CommonModel):
    __tablename__ = 'surveys_detail'
    id = db.Column(String, primary_key=True, default=default_uuid)
    name = db.Column(String)
    type = db.Column(SmallInteger, index=True, default=0) # 1 - text, 2- radio , 3 - checkbox , 4 - datetime, 5 - gio-phut, 6 - datetiem + giophut
    placeholder = db.Column(String())
    data_answer = db.Column(JSONB())
    is_other = db.Column(Boolean(), default=False)
    required = db.Column(Boolean(), index=True)
    priority = db.Column(SmallInteger(), index=True, default=0)
    steps_id = db.Column(String, ForeignKey('surveys_steps.id'), index=True,  nullable=False)
    survey_id = db.Column(String, ForeignKey('surveys_info.id'), index=True,  nullable=False)


class SurveysData(CommonModel):
    __tablename__ = 'surveys_data'
    id = db.Column(String, primary_key=True, default=default_uuid)
    session_survey = db.Column(String(), index=True)# mã lần làm survey, mỗi người có thể làm 1 hoặc nhiều lần, nhưng 1 lần nhiều câu hỏi sẽ có cùng mã lượt thực hiện
    survey_id = db.Column(String, ForeignKey('surveys_info.id'), index=True,  nullable=False)
    survey = relationship('SurveysInfo') 
    field_id = db.Column(String, index=True)
    field_name = db.Column(String)
    field_value = db.Column(JSONB())
    field_other = db.Column(Boolean(), default=False)
    # field_other_value = db.Column(String())
    post_id = db.Column(String, index=True)
    user_id = db.Column(String(), index=True)
    user_name = db.Column(String())
    
    

class Advertisements(CommonModel):
    __tablename__ = 'advertisements'
    id = db.Column(String, primary_key=True, default=default_uuid)
    name = db.Column(String,  nullable=False)
    title = db.Column(String)
    content = db.Column(String)
    type = db.Column(SmallInteger, index=True)#0- text, 1- image, 2- video, 3- slideshow
    url_media = db.Column(JSONB())
    url_redirect = db.Column(String)
    position_show = db.Column(String)
    category_id = db.Column(String, ForeignKey('category.id'), index=True,  nullable=False)
    categories = db.relationship("Category")#quang cao se hien thi trong nhung chuyen muc nao
    start_time = db.Column(BigInteger())
    end_time = db.Column(BigInteger())
    status = db.Column(SmallInteger())

class ViewAdvs(CommonModel):
    __tablename__ = 'view_advertisements'
    id = db.Column(String, primary_key=True, default=default_uuid)
    post_id = db.Column(String,index=True)
    user_id = db.Column(String(), index=True)
    user_name = db.Column(String())
    adv_id = db.Column(String())
    source = db.Column(String())# nguon xem, co the la web, app, facebook, tiktok



#advertisement placement
class Placement(CommonModel):
    __tablename__ = 'placement'
    id = db.Column(String, primary_key=True, default=default_uuid)
    name = db.Column(String)
    unsigned_name = db.Column(String)
    description = db.Column(String)
    priority = db.Column(SmallInteger(), index=True, default=0)
    status = db.Column(SmallInteger, default=0) # 0 - deactive, 1- active
    ad_placement = db.Column(String, default="home") # advertisement placement - nơi đặt quảng cáo - home, category, detail 
    type_display = db.Column(String, default="1") # loại hiển thị - thuong, sau x thoi gian thi bat full man hinh,....

    width = db.Column(String)
    height = db.Column(String)

    type_screen = db.Column(String, default="1") # loai man hinh - web, mobile, mobile_web


class Advertisement(CommonModel):
    __tablename__ = 'advertisement'
    id = db.Column(String, primary_key=True, default=default_uuid)

    name = db.Column(String)
    unsigned_name = db.Column(String)
    description = db.Column(String)
    type_adv = db.Column(String, default="image") # image, video, link

    partner_name = db.Column(String)
    partner_id = db.Column(String)
    start_time = db.Column(String) # YYYYMMDDHHmm
    end_time = db.Column(String) # YYYYMMDDHHmm

    appear_frequency = db.Column(String) #frequency of appearance - tần suất xuất hiện

    link = db.Column(String) # link direct
    content = db.Column(String) # nội dung hiển thị 

    price =  db.Column(Float, default=0) # giá

    price_unit_type = db.Column(String, default="time")
    price_unit = db.Column(String) # don vi tinh cua gia, - theo thoi gian, theo ngay, theo luot view 

    total_cost = db.Column(Float, default=0) # tong chi phi
    status = db.Column(SmallInteger, default=1) # 0 - deactive , 1 - active


class AdvertisementPlacement(CommonModel):
    __tablename__ = 'advertisement_placement'
    id = db.Column(String, primary_key=True, default=default_uuid)
    placement_id = db.Column(String, ForeignKey('placement.id'), index=True,  nullable=False)
    advertisement_id = db.Column(String, ForeignKey('advertisement.id'), index=True,  nullable=False)

    total_view = db.Column(Float, default=0)
    total_click = db.Column(Float, default=0)
    total_like = db.Column(Float, default=0)
    total_share = db.Column(Float, default=0)


class Partner(CommonModel):  
    __tablename__ = 'partner'
    id = db.Column(String, primary_key=True, default=default_uuid)
    fullname = db.Column(String)
    unsigned_name = db.Column(String)
    description = db.Column(String)
    phone = db.Column(String)
    email = db.Column(String)
    address = db.Column(String)

    user_name = db.Column(String)
    password = db.Column(String)
    salt = db.Column(String)

    active = db.Column(SmallInteger(), default=1) 
