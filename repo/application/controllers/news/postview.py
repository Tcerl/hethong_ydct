from sanic.router import url_hash
from application.database import redisdb,db, mdb
from application.server import app
from gatco.response import json,text, html
from application.extensions import jinja
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
from sanic import response
from application.models.model_news import *
import math
from datetime import datetime, timezone, timedelta, date
from sanic.response import redirect
import requests
from bson.objectid import ObjectId
import random

SOURCE_POST = {
    "APP": "app",
    "WEB": "web"
}

def meta_tag_public():
    result = {
        "fb_app_id": app.config.get("FB_APP_ID"),
        "type": "article",
        "title": "Chuyên trang sàn dược liệu: Sàn thương mại điện tử",
        "description": "Chuyên trang sàn thương mại điện tử dược liệu",
        "keywords": "san duoc lieu, san thuong mai dien tu duoc lieu, chuyen trang san thuong mai dien tu duoc lieu",
        "url": app.config.get("DOMAIN_URL_NEWS"),
        "site_name": "sanduoclieu",
        "image": app.config.get("DOMAIN_URL_NEWS") + "/static/images_template/logo_tvm.jpg",
        "image_alt": "Chuyên trang sàn dược liệu",
        "image_width": "800",
        "image_height": "354",
        "rich_attachment": True
    }
    return result


def convert_to_date(time):
    return time[6:8] + "/" + time[4:6] + "/" + time[0:4]
def convert_to_hours(time):
    return time[8:10] + ":" + time[10:12]

def convert_publish_time(timestamp = 0):
    sub_time = datetime.now().timestamp() - timestamp
    publish_time = ""
    if sub_time < 60:
        publish_time = str(math.floor(sub_time)) + " giây trước"
    elif sub_time < 3600:
        publish_time = str(math.floor(sub_time//60)) + " phút trước"
    elif sub_time < 86400:
        publish_time = str(math.floor(sub_time//3600)) + " giờ trước"
    elif sub_time < 2592000:
        publish_time = str(math.floor(sub_time//86400)) + " ngày trước"
    else:
        publish_time = str(math.floor(sub_time//2592000)) + " tháng trước"
    return publish_time

def get_path_from_cate_parent(cate_parent_id, path):
    cate_parent = db.session.query(NewsCategory.path).filter(NewsCategory.id == cate_parent_id, NewsCategory.deleted == False).first()
    if cate_parent is not None:
        cate_parent_path = cate_parent.path
        path = cate_parent_path + "/" + path
    return path

def get_category_from_id(category_id):
    cate = db.session.query(\
        NewsCategory.name, \
        NewsCategory.path, \
        NewsCategory.cate_parent_id\
    ).filter(NewsCategory.id == category_id, NewsCategory.deleted == False).first()
    category_name = category_path = ""
    if cate is not None:
        category_name = cate.name
        category_path = cate.path
        cate_parent_path = ""
        if cate.cate_parent_id is not None:
            cate_parent = db.session.query(NewsCategory.path).filter(NewsCategory.id == cate.cate_parent_id, NewsCategory.deleted == False).first()
            if cate_parent is not None:
                cate_parent_path = cate_parent.path
        if cate_parent_path != "":
            category_path = cate_parent_path + "/" + cate.path

    return category_name, category_path

def get_avatar_vuong(avatar):
    avatar_vuong = None
    if avatar is not None:
        avatar_vuong = app.config.get("DOMAIN_URL_VIEW_FILE") + avatar.get('link')
    return avatar_vuong

def get_featrure_news(type_placement=1):
    fearture_news = db.session.query(FeatureNews).filter(FeatureNews.deleted == False, FeatureNews.type_placement == type_placement).order_by(desc(FeatureNews.updated_at)).first()

    if fearture_news is None:
        return [],[]

    list_news = fearture_news.list_news
    list_news_id = []
    for news in list_news:
        list_news_id.append(news['id'])
    list_news_model = db.session.query(PostPublish.id,\
        PostPublish.category_id,\
        PostPublish.is_highlights_home,\
        PostPublish.deleted,\
        PostPublish.status,\
        PostPublish.publish_time,\
        PostPublish.title,\
        PostPublish.description,\
        PostPublish.path,\
        PostPublish.tac_gia,\
        PostPublish.avatar_vuong,\
        PostPublish.image_thumbnail)\
    .filter(\
        PostPublish.deleted == False, \
        PostPublish.id.in_(list_news_id), \
        PostPublish.status == 6 \
    ).all()
    list_news_model_dict = {}
    
    for news in list_news_model:
        category_name, category_path = get_category_from_id(news.category_id)
        publish_time = convert_publish_time(news.publish_time)
        avatar_vuong = get_avatar_vuong(news.avatar_vuong)
        list_news_model_dict[news.id] = {
            'id': news.id,
            'title': news.title,
            'description': news.description,
            'path': "/detail/" + news.path,
            'image_thumbnail': app.config.get("DOMAIN_URL_VIEW_FILE") + news.image_thumbnail.get('link'),
            'avatar_vuong': avatar_vuong,
            'publish_time': publish_time,
            'tac_gia': news.tac_gia,
            'category_name': category_name,
            'category_path': category_path
        }
    
    list_response = []
    list_response_id = []
    for id in list_news_id:
        if id in list_news_model_dict:
            object_new = list_news_model_dict[id]
            list_response_id.append(id)
            list_response.append(object_new)

    return list_response_id, list_response

def get_list_menu(cate_parent_id = None):
    list_menu = []
    list_menu_db = db.session.query(\
        NewsCategory.id,\
        NewsCategory.name,\
        NewsCategory.path,\
        NewsCategory.cate_parent_id)\
    .filter(\
        NewsCategory.show_top_menu == True,\
        NewsCategory.deleted == False)\
    .order_by(NewsCategory.priority).all()
    for menu_db in list_menu_db:
        category_name = menu_db.name
        category_path = menu_db.path
        array_menu_id = []
        array_menu_id.append(menu_db.id)
        array_menu_child_id = db.session.query(NewsCategory.id).filter(NewsCategory.cate_parent_id == menu_db.id,\
                                                                        NewsCategory.deleted == False).all()
        if isinstance(array_menu_child_id, list) and len(array_menu_child_id) > 0:
            array_menu_id.extend(array_menu_child_id)
        count_post = db.session.query(PostPublish.id).filter(\
            PostPublish.category_id.in_(array_menu_id),\
            PostPublish.status == 6, PostPublish.publish_time <= time.time(),\
            PostPublish.deleted == False).count()
        if count_post > 0:
            if menu_db.cate_parent_id is not None:
                category_path = get_path_from_cate_parent(menu_db.cate_parent_id, menu_db.path)
            active = 0
            if cate_parent_id == menu_db.id:
                active = 1
            menu_dict = {
                "name": category_name,
                "path": "/category/" + category_path,
                "active": active
            }
            list_menu.append(menu_dict)
    return list_menu

#home for new feature news
@app.route('/news')
async def home(request):
    validate_domain = validate_domain_request(request)
    if validate_domain is not None:
        # return validate_domain
        pass

    # list_menu = get_list_menu()

    highlight_news_1 = []
    highlight_news_2 = []
    highlight_news_3 = []
    highlight_news_4 = []
    array_highlight_news_id = []

    list_highlight_news_1_id, highlight_news_1 = get_featrure_news(1)
    list_highlight_news_2_id, highlight_news_2 = get_featrure_news(2)
    list_highlight_news_3_id, highlight_news_3 = get_featrure_news(3)
    list_highlight_news_4_id, highlight_news_4 = get_featrure_news(4)


    array_highlight_news_id = list_highlight_news_1_id + list_highlight_news_2_id + list_highlight_news_3_id + list_highlight_news_4_id

    #Cac chuyen muc se hien thi tren trang home
    array_category = []
    list_category = db.session.query(NewsCategory)\
    .filter(NewsCategory.show_in_home == True, NewsCategory.deleted == False).order_by(NewsCategory.priority).all()
    for category in list_category:
        category_dict = to_dict(category)
        array_category_id = []
        array_category_id.append(category.id)
        array_category_child_id = db.session.query(NewsCategory.id).filter(and_(NewsCategory.cate_parent_id == category.id, NewsCategory.deleted == False)).all()
        if isinstance(array_category_child_id, list) and len(array_category_child_id) > 0:
            array_category_id.extend(array_category_child_id)

        list_post = db.session.query(\
            PostPublish.id,\
            PostPublish.category_id,\
            PostPublish.is_highlights_home,\
            PostPublish.deleted,\
            PostPublish.status,\
            PostPublish.publish_time,\
            PostPublish.title,\
            PostPublish.description,\
            PostPublish.path,\
            PostPublish.tac_gia,\
            PostPublish.avatar_vuong,\
            PostPublish.image_thumbnail)\
        .filter(\
            PostPublish.category_id.in_(array_category_id),\
            PostPublish.status == 6, PostPublish.publish_time <= time.time(),\
            PostPublish.deleted == False)\
        .order_by(PostPublish.publish_time.desc()).all()
        array_category_post = []
        for post in list_post:
            check_post = array_highlight_news_id.count(post.id)
            if check_post == 0:
                category_name, category_path = get_category_from_id(post.category_id)
                publish_time = convert_publish_time(post.publish_time)
                avatar_vuong = get_avatar_vuong(post.avatar_vuong) 
                post_dict = {
                    'id': post.id,
                    'title': post.title,
                    'description': post.description,
                    'tac_gia': post.tac_gia,
                    'path': "/detail/" + post.path,
                    'image_thumbnail': app.config.get("DOMAIN_URL_VIEW_FILE") + post.image_thumbnail.get('link'),
                    'avatar_vuong': avatar_vuong,
                    'publish_time': publish_time,
                    'category_path': "/category/" + category_path,
                    'category_name': category_name
                }
                array_category_post.append(post_dict)
        category_dict['post'] = array_category_post
        category_dict['path'] = "/category/" + category.path
        if category.cate_parent_id is not None:
            category_dict['path'] = "/category/" + get_path_from_cate_parent(category.cate_parent_id, category.path)
        array_category.append(category_dict)

    array_news_video = []

    list_post_video = db.session.query(\
        PostPublish.id,\
        PostPublish.category_id,\
        PostPublish.is_highlights_home,\
        PostPublish.deleted,\
        PostPublish.status,\
        PostPublish.publish_time,\
        PostPublish.title,\
        PostPublish.description,\
        PostPublish.path,\
        PostPublish.tac_gia,\
        PostPublish.content,\
        PostPublish.avatar_vuong,\
        PostPublish.image_thumbnail \
    ).filter( \
        PostPublish.is_post_video == True, \
        PostPublish.deleted == False, \
        PostPublish.status == 6, \
        PostPublish.publish_time <= time.time() \
    ).order_by(PostPublish.publish_time.desc()).limit(5).all()
    
    for news_video in list_post_video:
        category_name, category_path = get_category_from_id(news_video.category_id)
        publish_time = convert_publish_time(news_video.publish_time)
        avatar_vuong = get_avatar_vuong(post.avatar_vuong) 
        news_video_dict = {
            'id': news_video.id,
            'title': news_video.title,
            'description': news_video.description if news_video.description is not None else "",
            'path': "/detail/" + news_video.path,
            'image_thumbnail': app.config.get("DOMAIN_URL_VIEW_FILE") + news_video.image_thumbnail.get('link'),
            'avatar_vuong': avatar_vuong,
            'publish_time': publish_time,
            'category_path': "/category/" + category_path,
            'category_name': category_name,
            'tac_gia': news_video.tac_gia
        }
        array_news_video.append(news_video_dict)
        
    meta_tag = meta_tag_public()
            
    return jinja.render('post/home.html', request, \
        highlight_news_1 = highlight_news_1, \
        highlight_news_2 = highlight_news_2, \
        highlight_news_3 = highlight_news_3, \
        highlight_news_4 = highlight_news_4, \
        array_category = array_category, \
        array_news_video = array_news_video,\
        meta_tag = meta_tag \
    )

@app.route('/detail/<path>')
async def post_detail(request, path):
    post = db.session.query(PostPublish).filter( \
        PostPublish.path == path,\
        PostPublish.status == 6,\
        PostPublish.publish_time <= time.time(),\
        PostPublish.deleted == False \
    ).first()
    if post is not None:
        array_check_post = [post.id]
        post_dict = to_dict(post)
        post_dict['title'] = post.title.strip()
        post_dict['author'] = post.tac_gia
        post_dict['publish_time'] = convert_timestamp_to_string(post.publish_time, "%d/%m/%Y %H:%M")
        count_comment = await mdb.db["comment_post"].count_documents({
            "$and": [
                {"post_id": post.id},
                {"status": {"$in":[1]}}
            ]
        })
        post_dict['count_comment'] = count_comment
        cate = db.session.query(\
            NewsCategory.id,\
            NewsCategory.name,\
            NewsCategory.path,\
            NewsCategory.cate_parent_id)\
        .filter(and_(NewsCategory.id == post.category_id, NewsCategory.deleted == False)).first()
        post_dict['category_name'] = cate.name if cate is not None else ""
        post_dict['category_path'] = "/category/" + cate.path if cate is not None else ""
        
        cate_parent_id = cate.id if cate is not None else ""
        if cate is not None and cate.cate_parent_id is not None:
            cate_parent = db.session.query(\
                NewsCategory.id,\
                NewsCategory.name,\
                NewsCategory.path,\
                NewsCategory.cate_parent_id)\
            .filter(NewsCategory.id == cate.cate_parent_id, NewsCategory.deleted == False).first()
            if cate_parent is not None:
                post_dict['category_name'] = cate_parent.name
                post_dict['category_path'] = "/category/" + cate_parent.path
                cate_parent_id = cate_parent.id
        
        related_news = post.related_news
        array_related_news = []
        if isinstance(related_news, list) and len(related_news) > 0:
            list_related_news = db.session.query(\
                PostPublish.id,\
                PostPublish.category_id,\
                PostPublish.deleted,\
                PostPublish.status,\
                PostPublish.publish_time,\
                PostPublish.title,\
                PostPublish.description,\
                PostPublish.path,\
                PostPublish.tac_gia,\
                PostPublish.avatar_vuong,\
                PostPublish.image_thumbnail)\
            .filter(PostPublish.id.in_(related_news),\
                    PostPublish.status == 6,\
                    PostPublish.deleted == False,\
                    PostPublish.publish_time <= time.time())\
            .order_by(PostPublish.publish_time.desc())\
            .all()
        
            for news in list_related_news:
                category_name, category_path = get_category_from_id(news.category_id)
                publish_time = convert_publish_time(news.publish_time)
                avatar_vuong = get_avatar_vuong(news.avatar_vuong)
                related_news_dict = {
                    'id': news.id,
                    'title': news.title,
                    'description': news.description,
                    'tac_gia': news.tac_gia,
                    'path': "/detail/" + news.path,
                    'image_thumbnail': app.config.get("DOMAIN_URL_VIEW_FILE") + news.image_thumbnail.get('link'),
                    'avatar_vuong': avatar_vuong,
                    'publish_time': publish_time,
                    'category_path': "/category/" + category_path,
                    'category_name': category_name
                }
                array_related_news.append(related_news_dict) 
        array_category_id = []
        array_category_id.append(cate_parent_id)
        array_category_child = []
        list_category_child = db.session.query(\
            NewsCategory.id,\
            NewsCategory.name,\
            NewsCategory.path,\
            NewsCategory.cate_parent_id)\
        .filter(and_(NewsCategory.cate_parent_id == cate_parent_id, NewsCategory.deleted == False))\
        .order_by(NewsCategory.priority).limit(5).all()
        for category_child in list_category_child:
            array_category_id.append(category_child.id)
            list_post_child = db.session.query(\
                PostPublish.id,\
                PostPublish.category_id,\
                PostPublish.deleted,\
                PostPublish.status,\
                PostPublish.publish_time,\
                PostPublish.title,\
                PostPublish.description,\
                PostPublish.path,\
                PostPublish.tac_gia,\
                PostPublish.avatar_vuong,\
                PostPublish.image_thumbnail)\
            .filter(\
                PostPublish.id.notin_(array_check_post),\
                PostPublish.category_id == category_child.id,\
                PostPublish.status == 6,\
                PostPublish.publish_time <= time.time(),\
                PostPublish.deleted == False)\
            .order_by(PostPublish.publish_time.desc()).limit(3).all()
            array_category_post_child = []
            for post_child in list_post_child:
                category_name, category_path = get_category_from_id(post_child.category_id)
                publish_time = convert_publish_time(post_child.publish_time)
                avatar_vuong = get_avatar_vuong(post_child.avatar_vuong)
                post_child_dict = {
                    'id': post_child.id,
                    'title': post_child.title,
                    'description': post_child.description,
                    'tac_gia': post_child.tac_gia,
                    'path': "/detail/" + post_child.path,
                    'image_thumbnail': app.config.get("DOMAIN_URL_VIEW_FILE") + post_child.image_thumbnail.get('link'),
                    'avatar_vuong': avatar_vuong,
                    'publish_time': publish_time,
                    'category_path': "/category/" + category_path,
                    'category_name': category_name
                }
                array_category_post_child.append(post_child_dict)
            cat_parent = db.session.query(\
                NewsCategory.id,\
                NewsCategory.name,\
                NewsCategory.path,\
                NewsCategory.cate_parent_id)\
            .filter(NewsCategory.id == cate_parent_id, NewsCategory.deleted == False).first()
            cate_dict = {
                "name": category_child.name,
                "path": "/category/" + cat_parent.path + "/" + category_child.path ,
                "post": array_category_post_child,
                "active": 1 if category_child.id == post.category_id else 0
            }
            array_category_child.append(cate_dict)

        news_other = db.session.query(\
            PostPublish.id,\
            PostPublish.category_id,\
            PostPublish.deleted,\
            PostPublish.status,\
            PostPublish.publish_time,\
            PostPublish.title,\
            PostPublish.description,\
            PostPublish.path,\
            PostPublish.tac_gia,\
            PostPublish.avatar_vuong,\
            PostPublish.image_thumbnail)\
        .filter(\
            PostPublish.id.notin_(array_check_post),\
            PostPublish.category_id.in_(array_category_id),\
            PostPublish.deleted == False,\
            PostPublish.status == 6,\
            PostPublish.publish_time <= time.time())\
        .order_by(PostPublish.publish_time.desc()).limit(10).all()
        array_news_other = []
        for news in news_other:
            #chinhnv_review: chỉ get những field nào cần lấy, không get hết toàn bộ
            category_name, category_path = get_category_from_id(news.category_id)
            publish_time = convert_publish_time(news.publish_time)
            avatar_vuong = get_avatar_vuong(news.avatar_vuong) 
            news_dict = {
                'id': news.id,
                'title': news.title,
                'description': news.description,
                'tac_gia': news.tac_gia,
                'path': "/detail/" + news.path,
                'image_thumbnail': app.config.get("DOMAIN_URL_VIEW_FILE") + news.image_thumbnail.get('link'),
                'avatar_vuong': avatar_vuong,
                'publish_time': publish_time,
                'category_path': "/category/" + category_path,
                'category_name': category_name
            }
            array_news_other.append(news_dict)
        if post_dict['tags'] is not None:
            tags = post_dict['tags']
            list_tags = tags.split(",")
            post_dict['tags'] = list_tags
            
        meta_tag = meta_tag_public()
        meta_tag['title'] = post.title.strip()
        meta_tag['description'] = post.description
        meta_tag['url'] = app.config.get("DOMAIN_URL_NEWS") + "/detail/" + post.path
        meta_tag['image'] = app.config.get("DOMAIN_URL_VIEW_FILE") + post.image_thumbnail.get("link")
        meta_tag['image_alt'] = post.image_thumbnail.get("name")
        if post.tags_display is not None:
            meta_tag['keywords'] = post.tags_display
        
        
        return jinja.render('post/post_detail.html', request, \
            post = post_dict, \
            array_category_child = array_category_child, \
            array_related_news = array_related_news, \
            array_news_other = array_news_other,\
            meta_tag = meta_tag \
        )
    else:
        return jinja.render('post/error.html', request)
    
#chinhnv_review: để mình đọc lại kĩ hơn
@app.route('/category/<path>')
async def category_path(request, path):
    #chinhnv_review: chỉ get những field nào cần lấy, không get hết toàn bộ
    category = db.session.query(\
        NewsCategory.id,\
        NewsCategory.name,\
        NewsCategory.path,\
        NewsCategory.cate_parent_id)\
    .filter(\
        NewsCategory.path == path, \
        NewsCategory.deleted == False).first()

    if category is None:
        return jinja.render('post/error.html', request)

    list_menu = get_list_menu(category.id)

    list_category_child = []
    list_category_child_id = [category.id]
    list_id_post = []

    #chinhnv_review: tối ưu query nhé
    category_child = db.session.query(\
        NewsCategory.id,\
        NewsCategory.name,\
        NewsCategory.path,\
        NewsCategory.cate_parent_id)\
    .filter(\
        NewsCategory.cate_parent_id == category.id, \
        NewsCategory.id != category.id, \
        NewsCategory.deleted == False)\
    .order_by(asc(NewsCategory.priority))\
    .limit(5).all()

    for item in category_child:
        obj = {
            'id': item.id,
            'name': item.name,
            'path': item.path
        }
        list_category_child.append(obj)
        list_category_child_id.append(item.id)

    now = datetime.now().timestamp()

    list_post_top = db.session.query(\
        PostPublish.id,\
        PostPublish.category_id,\
        PostPublish.is_highlights_home,\
        PostPublish.deleted,\
        PostPublish.status,\
        PostPublish.publish_time,\
        PostPublish.title,\
        PostPublish.description,\
        PostPublish.path,\
        PostPublish.avatar_vuong,\
        PostPublish.tac_gia,\
        PostPublish.image_thumbnail)\
    .filter(\
        PostPublish.category_id.in_(list_category_child_id), \
        PostPublish.publish_time <= now, \
        PostPublish.status ==6, \
        PostPublish.is_highlights_category == True, \
        PostPublish.deleted == False)\
    .order_by(desc(PostPublish.publish_time))\
    .limit(6).all()
        
    list_post_top_id = []
    if len(list_post_top) > 0:
        for post_top in list_post_top:
            list_post_top_id.append(post_top.id)
    if len(list_post_top) < 6:
        list_post_top_more = db.session.query(\
            PostPublish.id,\
            PostPublish.category_id,\
            PostPublish.is_highlights_home,\
            PostPublish.deleted,\
            PostPublish.status,\
            PostPublish.publish_time,\
            PostPublish.title,\
            PostPublish.description,\
            PostPublish.path,\
            PostPublish.avatar_vuong,\
            PostPublish.tac_gia,\
            PostPublish.image_thumbnail)\
        .filter(\
            PostPublish.id.notin_(list_post_top_id),\
            PostPublish.category_id.in_(list_category_child_id), \
            PostPublish.publish_time <= now, \
            PostPublish.status ==6, \
            PostPublish.deleted == False)\
        .order_by(desc(PostPublish.publish_time))\
        .limit(6 - len(list_post_top)).all()
        
        if len(list_post_top_more) > 0:
            for post_top_more in list_post_top_more:
                list_post_top_id.append(post_top_more.id)
        list_post_top.extend(list_post_top_more)

    list_post_main_top = []
    list_post_sub_top = []

    length_list_post_top = len(list_post_top)

    for i in range(length_list_post_top):
        item = list_post_top[i]
        category_id = item.category_id
        if category_id == category.id:
            category_path = category.path
            category_name = category.name
        else:
            #chinhnv_review: đoạn này không sai, nhưng lưu list_category_child thành dict có key: category_id và value là object category thì oke hơn, đỡ phải lấy index
            _index = list_category_child_id.index(category_id)
            category_path = list_category_child[_index -1].get("path")
            category_name = list_category_child[_index -1].get("name")
        publish_time = convert_publish_time(item.publish_time)
        avatar_vuong = get_avatar_vuong(item.avatar_vuong)
        obj = {
            'post_id': item.id,
            'title': item.title,
            'path': "/detail/" + item.path,
            'tac_gia': item.tac_gia,
            'description': item.description,
            'image_thumbnail': app.config.get("DOMAIN_URL_VIEW_FILE") +  item.image_thumbnail.get('link'),
            'avatar_vuong': avatar_vuong,
            'publish_time': publish_time,
            'category_path': category_path,
            'category_name': category_name
        }
        if i <=1:
            list_post_main_top.append(obj)
        else:
            list_post_sub_top.append(obj)

        list_id_post.append(item.id)

    list_post_main_middle = []
    list_post_sub_middle = []
    object_sub_middle = {
        'name': 'ĐỌC NHIỀU'
    }

    list_post_main_bottom = []

    page = request.args.get("page")
    if page is None or page == "":
        page =1
    
    try:
        page = int(page)
    except:
        page = 1
    
    results_per_page = 21


    #chinhnv_review: tối ưu phần count và all
    list_post_rest = db.session.query(\
        PostPublish.id,\
        PostPublish.category_id,\
        PostPublish.is_highlights_home,\
        PostPublish.deleted,\
        PostPublish.status,\
        PostPublish.publish_time,\
        PostPublish.title,\
        PostPublish.description,\
        PostPublish.path,\
        PostPublish.avatar_vuong,\
        PostPublish.tac_gia,\
        PostPublish.image_thumbnail)\
    .filter(\
        PostPublish.id.notin_(list_post_top_id),\
        PostPublish.category_id.in_(list_category_child_id), \
        PostPublish.publish_time <= now, \
        PostPublish.status ==6, \
        PostPublish.deleted == False)\
    .order_by(desc(PostPublish.publish_time))\
    .limit(results_per_page).offset((page-1)*results_per_page).all()

    sum_of_post_paginate = db.session.query(PostPublish.id)\
    .filter(PostPublish.id.notin_(list_post_top_id),\
            PostPublish.category_id.in_(list_category_child_id), \
            PostPublish.publish_time <= now, \
            PostPublish.status ==6, \
            PostPublish.deleted == False)\
    .count()

    sum_of_page = math.ceil(sum_of_post_paginate/results_per_page)

    length_list_post_rest = len(list_post_rest)

    list_object_sub_bottom = []

    for i in range(length_list_post_rest):
        item = list_post_rest[i]
        
        category_id = item.category_id
        if category_id == category.id:
            category_path = category.path
            category_name = category.name
        else:
            _index = list_category_child_id.index(category_id)
            category_path = list_category_child[_index -1].get("path")
            category_name = list_category_child[_index -1].get("name")
        
        publish_time = convert_publish_time(item.publish_time)
        avatar_vuong = get_avatar_vuong(item.avatar_vuong)
        obj = {
            'post_id': item.id,
            'title': item.title,
            'path': "/detail/" + item.path,
            'tac_gia': item.tac_gia,
            'description': item.description,
            'image_thumbnail': app.config.get("DOMAIN_URL_VIEW_FILE") +  item.image_thumbnail.get('link'),
            'avatar_vuong': avatar_vuong,
            'publish_time': publish_time,
            'category_path': category_path,
            'category_name': category_name
        }
        if i <=10:
            list_post_main_middle.append(obj)
            if i <=4:
                list_post_sub_middle.append(obj)
        else:
            list_post_main_bottom.append(obj)

    object_sub_middle['list_post_sub_middle'] = list_post_sub_middle

    for item in category_child:
        category_id = item.id
        list_post_category = db.session.query( \
            PostPublish.id,\
            PostPublish.category_id,\
            PostPublish.is_highlights_home,\
            PostPublish.deleted,\
            PostPublish.status,\
            PostPublish.publish_time,\
            PostPublish.title,\
            PostPublish.description,\
            PostPublish.path,\
            PostPublish.avatar_vuong,\
            PostPublish.tac_gia,\
            PostPublish.image_thumbnail \
        ).filter( \
            PostPublish.id.notin_(list_post_top_id),\
            PostPublish.category_id == category_id, \
            PostPublish.publish_time <= now, \
            PostPublish.status ==6, \
            PostPublish.deleted == False \
        ).order_by(desc(PostPublish.publish_time))\
        .limit(3).all()
        object_sub_bottom = {
            'name': item.name.upper() if type(item.name) == str else "",
            'list_post_sub_bottom': []
        }

        for post_category in list_post_category:
            publish_time = convert_publish_time(post_category.publish_time)
            avatar_vuong = get_avatar_vuong(post_category.avatar_vuong)
            obj = {
                'post_id': post_category.id,
                'title': post_category.title,
                'path': "/detail/" + post_category.path,
                'tac_gia': post_category.tac_gia,
                'description': post_category.description,
                'image_thumbnail': app.config.get("DOMAIN_URL_VIEW_FILE") +  post_category.image_thumbnail.get('link'),
                'avatar_vuong': avatar_vuong,
                'publish_time': publish_time,
                'category_path': item.path,
                'category_name': item.name
            }
            object_sub_bottom['list_post_sub_bottom'].append(obj)
        list_object_sub_bottom.append(object_sub_bottom)

    meta_tag = meta_tag_public()
    meta_tag['title'] = category.name
    meta_tag['url'] = app.config.get("DOMAIN_URL_NEWS") + "/category/" + category.path
    
    advertisement = {}
    str_current_time = convert_timestamp_to_string(time.time(), "%Y%m%d%H%M%S")
    TOPHOME = db.session.query(\
        AdvertisementPlacement.file_advertisement, \
        Placement.type_display, \
        Placement.time_to_full, \
        Advertisement.type_adv, \
        Advertisement.link)\
    .join(Placement, Placement.id == AdvertisementPlacement.placement_id) \
    .join(Advertisement, Advertisement.id == AdvertisementPlacement.advertisement_id) \
    .filter(\
        Placement.status == 1, \
        Placement.deleted == False, \
        Advertisement.status == 1, \
        Advertisement.deleted == False, \
        Advertisement.start_time <= str_current_time, \
        Advertisement.end_time >= str_current_time, \
        AdvertisementPlacement.status == 1, \
        AdvertisementPlacement.deleted == False, \
        Placement.code == "TOPCATEGORY") \
    .order_by(AdvertisementPlacement.priority, AdvertisementPlacement.updated_at.desc()) \
    .first()
    if TOPHOME is not None:
        advertisement['TOPHOME'] = {
            "link": TOPHOME.link if TOPHOME.link is not None else "javascript:;",
            "src": app.config.get("DOMAIN_URL_VIEW_FILE") + TOPHOME.file_advertisement.get('link'),
            "type_display": TOPHOME.type_display,
            "time_to_full": TOPHOME.time_to_full,
            "type_adv": TOPHOME.type_adv
        }
    
    ads_popup = db.session.query(\
        AdvertisementPlacement.file_advertisement, \
        Placement.type_display, \
        Placement.time_to_full, \
        Advertisement.type_adv, \
        Advertisement.link)\
    .join(Placement, Placement.id == AdvertisementPlacement.placement_id) \
    .join(Advertisement, Advertisement.id == AdvertisementPlacement.advertisement_id) \
    .filter(\
        Placement.status == 1, \
        Placement.deleted == False, \
        Advertisement.status == 1, \
        Advertisement.deleted == False, \
        Advertisement.start_time <= str_current_time, \
        Advertisement.end_time >= str_current_time, \
        AdvertisementPlacement.status == 1, \
        AdvertisementPlacement.deleted == False, \
        Placement.code == "MIDDLECATEGORY") \
    .order_by(AdvertisementPlacement.priority, AdvertisementPlacement.updated_at.desc()) \
    .first()
    if ads_popup is not None:
        advertisement['ADSPOPUP'] = {
            "link": ads_popup.link if ads_popup.link is not None else "javascript:;",
            "src": app.config.get("DOMAIN_URL_VIEW_FILE") + ads_popup.file_advertisement.get('link'),
            "type_display": ads_popup.type_display,
            "time_to_full": ads_popup.time_to_full,
            "type_adv": ads_popup.type_adv
        }
        
    ads_popup_param = ujson.dumps(advertisement.get('ADSPOPUP'))
    
    RIGHTCATEGORY = db.session.query(\
        AdvertisementPlacement.file_advertisement, \
        Placement.type_display, \
        Placement.time_to_full, \
        Advertisement.type_adv, \
        Advertisement.link)\
    .join(Placement, Placement.id == AdvertisementPlacement.placement_id) \
    .join(Advertisement, Advertisement.id == AdvertisementPlacement.advertisement_id) \
    .filter(\
        Placement.status == 1, \
        Placement.deleted == False, \
        Advertisement.status == 1, \
        Advertisement.deleted == False, \
        Advertisement.start_time <= str_current_time, \
        Advertisement.end_time >= str_current_time, \
        AdvertisementPlacement.status == 1, \
        AdvertisementPlacement.deleted == False, \
        Placement.code == "RIGHTCATEGORY") \
    .order_by(AdvertisementPlacement.priority, AdvertisementPlacement.updated_at.desc()) \
    .first()
    if RIGHTCATEGORY is not None:
        advertisement['RIGHTCATEGORY'] = {
            "link": RIGHTCATEGORY.link if RIGHTCATEGORY.link is not None else "javascript:;",
            "src": app.config.get("DOMAIN_URL_VIEW_FILE") + RIGHTCATEGORY.file_advertisement.get('link'),
            "type_display": RIGHTCATEGORY.type_display,
            "time_to_full": RIGHTCATEGORY.time_to_full,
            "type_adv": RIGHTCATEGORY.type_adv
        }
    
    return jinja.render('post/category.html', request, _category = category.name, \
        domain = app.config.get("DOMAIN_URL_NEWS"),
        sum_of_page = sum_of_page,
        page = page,
        list_menu = list_menu,
        domain_cate_parent = "/category/" + category.path,\
        list_category_child = list_category_child, \
        list_post_main_top = list_post_main_top, list_post_sub_top = list_post_sub_top, \
        list_post_main_middle =list_post_main_middle, object_sub_middle = object_sub_middle, \
        list_post_main_bottom =list_post_main_bottom, list_object_sub_bottom = list_object_sub_bottom, home_active = False,\
        meta_tag = meta_tag,\
        domain_book = app.config.get("DOMAIN_BOOK"),\
        page_name = "category", \
        advertisement = advertisement, \
        ads_popup_param = ads_popup_param \
    )

@app.route('/category/<path>/<subpath>')
async def category_path(request, path, subpath):
    #chinhnv_review: chỉ get những field nào cần lấy, không get hết toàn bộ
    category = db.session.query(\
        NewsCategory.id,\
        NewsCategory.name,\
        NewsCategory.path,\
        NewsCategory.cate_parent_id)\
    .filter(\
        NewsCategory.path == path, \
        NewsCategory.deleted == False)\
    .first()

    #chinhnv_review: chỉ get những field nào cần lấy, không get hết toàn bộ
    sub_category =  db.session.query(\
        NewsCategory.id,\
        NewsCategory.name,\
        NewsCategory.path,\
        NewsCategory.cate_parent_id)\
    .filter(\
        NewsCategory.path == subpath, \
        NewsCategory.deleted == False)\
    .first()

    if category is None or sub_category is None:
        return jinja.render('post/error.html', request)

    list_menu = get_list_menu(category.id)

    list_category_child = []
    list_category_child_id = [category.id]
    list_id_post = []
    
    #chinhnv_review: chỉ get những field nào cần lấy, không get hết toàn bộ
    category_child = db.session.query(\
        NewsCategory.id,\
        NewsCategory.name,\
        NewsCategory.path,\
        NewsCategory.cate_parent_id)\
    .filter(\
        or_(NewsCategory.id == sub_category.id, \
        NewsCategory.cate_parent_id == category.id),\
        NewsCategory.id != category.id, \
        NewsCategory.deleted == False)\
    .order_by(asc(NewsCategory.priority))\
    .limit(5).all()

    for item in category_child:
        if item.id == sub_category.id:
            obj = {
                'id': item.id,
                'name': item.name,
                'path': item.path,
                "active" : True
            }
        else:
            obj = {
                'id': item.id,
                'name': item.name,
                'path': item.path
            }
        list_category_child.append(obj)
        list_category_child_id.append(item.id)


    now = datetime.now().timestamp()

    list_post_top = db.session.query(\
        PostPublish.id,\
        PostPublish.category_id,\
        PostPublish.is_highlights_home,\
        PostPublish.deleted,\
        PostPublish.status,\
        PostPublish.publish_time,\
        PostPublish.title,\
        PostPublish.description,\
        PostPublish.avatar_vuong,\
        PostPublish.path,\
        PostPublish.tac_gia,\
        PostPublish.image_thumbnail)\
    .filter(\
        PostPublish.category_id == sub_category.id, \
        PostPublish.publish_time <= now, \
        PostPublish.status ==6, \
        PostPublish.is_highlights_category == True, \
        PostPublish.deleted == False)\
    .order_by(desc(PostPublish.publish_time))\
    .limit(6).all()

    list_post_top_id = []
    if len(list_post_top) > 0:
        for post_top in list_post_top:
            list_post_top_id.append(post_top.id)
    
    if len(list_post_top) < 6:
        list_post_top_more = db.session.query(\
            PostPublish.id,\
            PostPublish.category_id,\
            PostPublish.is_highlights_home,\
            PostPublish.deleted,\
            PostPublish.status,\
            PostPublish.publish_time,\
            PostPublish.title,\
            PostPublish.description,\
            PostPublish.avatar_vuong,\
            PostPublish.path,\
            PostPublish.tac_gia,\
            PostPublish.image_thumbnail)\
        .filter(PostPublish.id.notin_(list_post_top_id),\
            PostPublish.category_id == sub_category.id, \
            PostPublish.publish_time <= now, \
            PostPublish.status ==6, \
            PostPublish.deleted == False)\
        .order_by(desc(PostPublish.publish_time))\
        .limit(6 - len(list_post_top)).all()
            
        if len(list_post_top_more) > 0:
            for post_top_more in list_post_top_more:
                list_post_top_id.append(post_top_more.id)
        list_post_top.extend(list_post_top_more)


    list_post_main_top = []
    list_post_sub_top = []

    length_list_post_top = len(list_post_top)

    for i in range(length_list_post_top):
        item = list_post_top[i]
        category_id = item.category_id
        if category_id == category.id:
            category_path = category.path
            category_name = category.name
        else:
            _index = list_category_child_id.index(category_id)
            category_path = list_category_child[_index -1].get("path")
            category_name = list_category_child[_index -1].get("name")
        publish_time = convert_publish_time(item.publish_time)
        avatar_vuong = get_avatar_vuong(item.avatar_vuong)
        obj = {
            'post_id': item.id,
            'title': item.title,
            'path': "/detail/" + item.path,
            'tac_gia': item.tac_gia,
            'description': item.description,
            'image_thumbnail': app.config.get("DOMAIN_URL_VIEW_FILE") +  item.image_thumbnail.get('link'),
            'avatar_vuong': avatar_vuong,
            'publish_time': publish_time,
            'category_path': category_path,
            'category_name': category_name
        }
        if i <=1:
            list_post_main_top.append(obj)
        else:
            list_post_sub_top.append(obj)

        list_id_post.append(item.id)

    list_post_main_middle = []
    list_post_sub_middle = []
    object_sub_middle = {
        'name': 'ĐỌC NHIỀU'
    }

    list_post_main_bottom = []

    page = request.args.get("page")
    if page is None or page == "":
        page =1
    
    try:
        page = int(page)
    except:
        page = 1
    
    results_per_page = 21

    list_post_rest = db.session.query(\
        PostPublish.id,\
        PostPublish.category_id,\
        PostPublish.is_highlights_home,\
        PostPublish.deleted,\
        PostPublish.status,\
        PostPublish.publish_time,\
        PostPublish.title,\
        PostPublish.description,\
        PostPublish.avatar_vuong,\
        PostPublish.path,\
        PostPublish.tac_gia,\
        PostPublish.image_thumbnail)\
    .filter(PostPublish.id.notin_(list_post_top_id),\
        PostPublish.category_id == sub_category.id, \
        PostPublish.publish_time <= now, \
        PostPublish.status ==6, \
        PostPublish.deleted == False)\
    .order_by(desc(PostPublish.publish_time))\
    .limit(results_per_page).offset((page-1)*results_per_page).all()

    sum_of_post_paginate = db.session.query(PostPublish.id)\
    .filter(\
        PostPublish.id.notin_(list_post_top_id),\
        PostPublish.category_id == sub_category.id, \
        PostPublish.publish_time <= now, \
        PostPublish.status ==6, \
        PostPublish.deleted == False)\
    .count()

    sum_of_page = math.ceil(sum_of_post_paginate/results_per_page)

    length_list_post_rest = len(list_post_rest)

    list_object_sub_bottom = []

    for i in range(length_list_post_rest):
        item = list_post_rest[i]
        category_id = item.category_id
        if category_id == category.id:
            category_path = category.path
            category_name = category.name
        else:
            _index = list_category_child_id.index(category_id)
            category_path = list_category_child[_index -1].get("path")
            category_name = list_category_child[_index -1].get("name")
        
        publish_time = convert_publish_time(item.publish_time)
        avatar_vuong = get_avatar_vuong(item.avatar_vuong)
        obj = {
            'post_id': item.id,
            'title': item.title,
            'path': "/detail/" + item.path,
            'tac_gia': item.tac_gia,
            'description': item.description,
            'image_thumbnail': app.config.get("DOMAIN_URL_VIEW_FILE") +  item.image_thumbnail.get('link'),
            'avatar_vuong': avatar_vuong,
            'publish_time': publish_time,
            'category_path': category_path,
            'category_name': category_name
        }
        if i <=10:
            list_post_main_middle.append(obj)
            if i <=4:
                list_post_sub_middle.append(obj)
        else:
            list_post_main_bottom.append(obj)


    object_sub_middle['list_post_sub_middle'] = list_post_sub_middle

    for item in category_child:
        category_id = item.id
        list_post_category = db.session.query( \
            PostPublish.id,\
            PostPublish.category_id,\
            PostPublish.is_highlights_home,\
            PostPublish.deleted,\
            PostPublish.status,\
            PostPublish.publish_time,\
            PostPublish.title,\
            PostPublish.description,\
            PostPublish.avatar_vuong,\
            PostPublish.path,\
            PostPublish.tac_gia,\
            PostPublish.image_thumbnail \
        ).filter(\
            PostPublish.id.notin_(list_post_top_id),\
            PostPublish.category_id == category_id, \
            PostPublish.publish_time <= now, \
            PostPublish.status ==6, \
            PostPublish.deleted == False \
        ).order_by(desc(PostPublish.publish_time))\
        .limit(3).all()
        
        object_sub_bottom = {
            'name': item.name.upper() if type(item.name) == str else "",
            'list_post_sub_bottom': []
        }

        for post_category in list_post_category:
            publish_time = convert_publish_time(post_category.publish_time)
            avatar_vuong = get_avatar_vuong(post_category.avatar_vuong)
            obj = {
                'post_id': post_category.id,
                'title': post_category.title,
                'path': "/detail/" + post_category.path,
                'tac_gia': post_category.tac_gia,
                'description': post_category.description,
                'image_thumbnail': app.config.get("DOMAIN_URL_VIEW_FILE") +  post_category.image_thumbnail.get('link'),
                'publish_time': publish_time,
                'category_path': item.path,
                'category_name': item.name
            }
            object_sub_bottom['list_post_sub_bottom'].append(obj)
        list_object_sub_bottom.append(object_sub_bottom)
        
    meta_tag = meta_tag_public()
    meta_tag['title'] = sub_category.name
    meta_tag['url'] = app.config.get("DOMAIN_URL_NEWS") + "/category/" + category.path + "/" + sub_category.path
        
    advertisement = {}
    str_current_time = convert_timestamp_to_string(time.time(), "%Y%m%d%H%M%S")
    TOPHOME = db.session.query(\
        AdvertisementPlacement.file_advertisement, \
        Placement.type_display, \
        Placement.time_to_full, \
        Advertisement.type_adv, \
        Advertisement.link)\
    .join(Placement, Placement.id == AdvertisementPlacement.placement_id) \
    .join(Advertisement, Advertisement.id == AdvertisementPlacement.advertisement_id) \
    .filter(\
        Placement.status == 1, \
        Placement.deleted == False, \
        Advertisement.status == 1, \
        Advertisement.deleted == False, \
        Advertisement.start_time <= str_current_time, \
        Advertisement.end_time >= str_current_time, \
        AdvertisementPlacement.status == 1, \
        AdvertisementPlacement.deleted == False, \
        Placement.code == "TOPCATEGORY") \
    .order_by(AdvertisementPlacement.priority, AdvertisementPlacement.updated_at.desc()) \
    .first()
    if TOPHOME is not None:
        advertisement['TOPHOME'] = {
            "link": TOPHOME.link if TOPHOME.link is not None else "javascript:;",
            "src": app.config.get("DOMAIN_URL_VIEW_FILE") + TOPHOME.file_advertisement.get('link'),
            "type_display": TOPHOME.type_display,
            "time_to_full": TOPHOME.time_to_full,
            "type_adv": TOPHOME.type_adv
        }
    
    ads_popup = db.session.query(\
        AdvertisementPlacement.file_advertisement, \
        Placement.type_display, \
        Placement.time_to_full, \
        Advertisement.type_adv, \
        Advertisement.link)\
    .join(Placement, Placement.id == AdvertisementPlacement.placement_id) \
    .join(Advertisement, Advertisement.id == AdvertisementPlacement.advertisement_id) \
    .filter(\
        Placement.status == 1, \
        Placement.deleted == False, \
        Advertisement.status == 1, \
        Advertisement.deleted == False, \
        Advertisement.start_time <= str_current_time, \
        Advertisement.end_time >= str_current_time, \
        AdvertisementPlacement.status == 1, \
        AdvertisementPlacement.deleted == False, \
        Placement.code == "MIDDLECATEGORY") \
    .order_by(AdvertisementPlacement.priority, AdvertisementPlacement.updated_at.desc()) \
    .first()
    if ads_popup is not None:
        advertisement['ADSPOPUP'] = {
            "link": ads_popup.link if ads_popup.link is not None else "javascript:;",
            "src": app.config.get("DOMAIN_URL_VIEW_FILE") + ads_popup.file_advertisement.get('link'),
            "type_display": ads_popup.type_display,
            "time_to_full": ads_popup.time_to_full,
            "type_adv": ads_popup.type_adv
        }
        
    ads_popup_param = ujson.dumps(advertisement.get('ADSPOPUP'))
    
    RIGHTCATEGORY = db.session.query(\
        AdvertisementPlacement.file_advertisement, \
        Placement.type_display, \
        Placement.time_to_full, \
        Advertisement.type_adv, \
        Advertisement.link)\
    .join(Placement, Placement.id == AdvertisementPlacement.placement_id) \
    .join(Advertisement, Advertisement.id == AdvertisementPlacement.advertisement_id) \
    .filter(\
        Placement.status == 1, \
        Placement.deleted == False, \
        Advertisement.status == 1, \
        Advertisement.deleted == False, \
        Advertisement.start_time <= str_current_time, \
        Advertisement.end_time >= str_current_time, \
        AdvertisementPlacement.status == 1, \
        AdvertisementPlacement.deleted == False, \
        Placement.code == "RIGHTCATEGORY") \
    .order_by(AdvertisementPlacement.priority, AdvertisementPlacement.updated_at.desc()) \
    .first()
    if RIGHTCATEGORY is not None:
        advertisement['RIGHTCATEGORY'] = {
            "link": RIGHTCATEGORY.link if RIGHTCATEGORY.link is not None else "javascript:;",
            "src": app.config.get("DOMAIN_URL_VIEW_FILE") + RIGHTCATEGORY.file_advertisement.get('link'),
            "type_display": RIGHTCATEGORY.type_display,
            "time_to_full": RIGHTCATEGORY.time_to_full,
            "type_adv": RIGHTCATEGORY.type_adv
        }
        
    return jinja.render('post/category_sub.html', request, _category = category.name, \
        domain = app.config.get("DOMAIN_URL_NEWS"),\
        domain_cate_parent = "/category/" + category.path,\
        sum_of_page = sum_of_page,\
        page = page,\
        list_menu = list_menu,\
        list_category_child = list_category_child, \
        list_post_main_top = list_post_main_top, list_post_sub_top = list_post_sub_top, \
        list_post_main_middle =list_post_main_middle, object_sub_middle = object_sub_middle, \
        list_post_main_bottom =list_post_main_bottom, list_object_sub_bottom = list_object_sub_bottom, home_active = False,\
        meta_tag = meta_tag,\
        domain_book = app.config.get("DOMAIN_BOOK"),\
        page_name = "category", \
        advertisement = advertisement, \
        ads_popup_param = ads_popup_param \
    )
    
# @app.route('/search')
# async def tim_kiem(request):
#     list_menu = get_list_menu()
    
#     keywords = request.args.get('keywords', None)
#     if keywords is None:
#         meta_tag = meta_tag_public()
#         denngay = "0"
#         tungay = "0"
#         advertisement = {}
#         return jinja.render('post/search.html', request, \
#             domain = app.config.get("DOMAIN_URL_NEWS"), \
#             list_menu = list_menu, \
#             home_active = False,\
#             meta_tag = meta_tag,\
#             domain_book = app.config.get("DOMAIN_BOOK"),\
#             array_post = [],\
#             tungay = tungay,\
#             denngay = denngay,\
#             page_name = "search", \
#             advertisement = advertisement, \
#             keywords = "")
#     else:
#         unsigned_title = convert_text_khongdau(keywords)
#         looking_for = '%{0}%'.format(unsigned_title)
#         tungay = request.args.get('tungay', None)
#         denngay = request.args.get('denngay', None)
#         array_post = []
#         query_filter = db.session.query(\
#             PostPublish.id,\
#             PostPublish.category_id,\
#             PostPublish.is_highlights_home,\
#             PostPublish.deleted,\
#             PostPublish.status,\
#             PostPublish.publish_time,\
#             PostPublish.title,\
#             PostPublish.description,\
#             PostPublish.path,\
#             PostPublish.tac_gia,\
#             PostPublish.image_thumbnail)\
#         .filter(\
#             PostPublish.unsigned_title.ilike(looking_for),\
#             PostPublish.status == 6,\
#             PostPublish.publish_time <= time.time(),\
#             PostPublish.deleted == False)
#         if tungay is not None and tungay != "null":
#             tungay = convert_string_to_timestamp(tungay, '%Y%m%d')
#             query_filter = query_filter.filter(PostPublish.publish_time >= tungay)
#             tungay = convert_timestamp_to_string(tungay, "%d/%m/%Y")
#         else:
#             tungay = "0"
#         if denngay is not None and denngay != "null":
#             denngay = convert_string_to_timestamp(denngay, '%Y%m%d')
#             query_filter = query_filter.filter(PostPublish.publish_time <= denngay)
#             denngay = convert_timestamp_to_string(denngay, "%d/%m/%Y")
#         else:
#             denngay = "0"
#         results_per_page = 15
#         list_post = query_filter.order_by(PostPublish.publish_time.desc()).limit(results_per_page).all()
#         for post in list_post:
#             cate = db.session.query(NewsCategory).filter(NewsCategory.id == post.category_id, NewsCategory.deleted == False).first()
#             category_name = category_path = ""
#             if cate is not None:
#                 category_name = cate.name
#                 category_path = cate.path
#                 cate_parent_path = ""
#                 if cate.cate_parent_id is not None:
#                     cate_parent = db.session.query(NewsCategory).filter(NewsCategory.id == cate.cate_parent_id, NewsCategory.deleted == False).first()
#                     if cate_parent is not None:
#                         cate_parent_path = cate_parent.path
#                 if cate_parent_path != "":
#                     category_path = cate_parent_path + "/" + cate.path
#             publish_time = convert_publish_time(post.publish_time)
#             post_dict = {
#                 'id': post.id,
#                 'title': post.title,
#                 'description': post.description,
#                 'tac_gia': post.tac_gia,
#                 'path': "/detail/" + post.path,
#                 'image_thumbnail': app.config.get("DOMAIN_URL_VIEW_FILE") + post.image_thumbnail.get('link'),
#                 'publish_time': publish_time,
#                 'category_path': "/category/" + category_path,
#                 'category_name': category_name
#             }
#             array_post.append(post_dict)
            
#         meta_tag = meta_tag_public()
        
#         advertisement = {}
        
#         return jinja.render('post/search.html', request, \
#             domain = app.config.get("DOMAIN_URL_NEWS"), \
#             list_menu = list_menu, \
#             home_active = False,\
#             meta_tag = meta_tag,\
#             domain_book = app.config.get("DOMAIN_BOOK"),\
#             array_post = array_post,\
#             tungay = tungay,\
#             denngay = denngay,\
#             page_name = "search", \
#             advertisement = advertisement, \
#             keywords = request.args.get('keywords', None))
    
@app.route('/saved-news')
async def saved_news(request):
    list_menu = get_list_menu()
    meta_tag = meta_tag_public()
    advertisement = {}
    return jinja.render('post/save.html', request, \
        domain = app.config.get("DOMAIN_URL_NEWS"), \
        list_menu = list_menu, \
        home_active = False,\
        meta_tag = meta_tag,\
        page_name = "saved_news", \
        advertisement = advertisement, \
        domain_book = app.config.get("DOMAIN_BOOK")\
        )
    
@app.route('/api/v1/get-saved-news')
async def get_saved_news(request):
    token = request.headers.get("X-USER-TOKEN", None)
    if token is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    url = app.config.get("DOMAIN_BOOK") + "/api_donvi/v1/current_user"
    headers = {
        'X-USER-TOKEN': token
    }
    user_id = None
    resp = requests.get(url, headers=headers)
    if resp.status_code in [200, 201, "200", "201"]:
        response_data = resp.json()
        if 'id' in response_data and response_data['id'] is not None:
            user_id = response_data['id']
        else:
            return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    else:
        return json({'error_code':'ERROR', 'error_message':'Có lỗi xảy ra, vui lòng thử lại sau'}, status=520)
    
    danhsach = mdb.db["save_post"].find({"user_id": user_id}).sort([("time", -1)])
    list_post = await danhsach.to_list(None)
    idx = 1
    array_post = []
    for item_post in list_post:
        if idx == 16:
            break 

        post = db.session.query(\
            PostPublish.id,\
            PostPublish.category_id,\
            PostPublish.is_highlights_home,\
            PostPublish.deleted,\
            PostPublish.status,\
            PostPublish.publish_time,\
            PostPublish.title,\
            PostPublish.description,\
            PostPublish.path,\
            PostPublish.tac_gia,\
            PostPublish.image_thumbnail)\
        .filter(\
            PostPublish.id == item_post['post_id'],\
            PostPublish.status == 6,\
            PostPublish.publish_time <= time.time(),\
            PostPublish.deleted == False).first()
        if post is not None:
            category_name, category_path = get_category_from_id(post.category_id)
            publish_time = convert_publish_time(post.publish_time)
            post_dict = {
                'id': post.id,
                'title': post.title,
                'description': post.description,
                'tac_gia': post.tac_gia,
                'path': "/detail/" + post.path,
                'image_thumbnail': app.config.get("DOMAIN_URL_VIEW_FILE") + post.image_thumbnail.get('link'),
                'publish_time': publish_time,
                'category_path': "/category/" + category_path,
                'category_name': category_name
            }
            idx = idx + 1
            array_post.append(post_dict)
    return json({"error_code": "OK", "error_message": "Seccessful", "objects": array_post}, status=200)

@app.route('/like-news')
async def like_news(request):
    list_menu = get_list_menu()
    meta_tag = meta_tag_public()
    
    advertisement = {}
    
    return jinja.render('post/like.html', request, \
        domain = app.config.get("DOMAIN_URL_NEWS"), \
        list_menu = list_menu, \
        home_active = False,\
        meta_tag = meta_tag,\
        page_name = "like_news", \
        advertisement = advertisement, \
        domain_book = app.config.get("DOMAIN_BOOK")\
        )
    
@app.route('/api/v1/get-like-news')
async def get_like_news(request):
    token = request.headers.get("X-USER-TOKEN", None)
    if token is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    url = app.config.get("DOMAIN_BOOK") + "/api_donvi/v1/current_user"
    headers = {
        'X-USER-TOKEN': token
    }
    user_id = None
    resp = requests.get(url, headers=headers)
    if resp.status_code in [200, 201, "200", "201"]:
        response_data = resp.json()
        if 'id' in response_data and response_data['id'] is not None:
            user_id = response_data['id']
        else:
            return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    else:
        return json({'error_code':'ERROR', 'error_message':'Có lỗi xảy ra, vui lòng thử lại sau'}, status=520)
    danhsach = mdb.db["like_post"].find({"user_id": user_id}).sort([("time", -1)])
    list_post = await danhsach.to_list(None)
    idx = 1
    array_post = []
    for item_post in list_post:
        if idx == 16:
            break 

        post = db.session.query(\
            PostPublish.id,\
            PostPublish.category_id,\
            PostPublish.is_highlights_home,\
            PostPublish.deleted,\
            PostPublish.status,\
            PostPublish.publish_time,\
            PostPublish.title,\
            PostPublish.description,\
            PostPublish.path,\
            PostPublish.tac_gia,\
            PostPublish.image_thumbnail)\
        .filter(\
            PostPublish.id == item_post['post_id'],\
            PostPublish.status == 6,\
            PostPublish.publish_time <= time.time(),\
            PostPublish.deleted == False).first()
        if post is not None:
            category_name, category_path = get_category_from_id(post.category_id)
            publish_time = convert_publish_time(post.publish_time)
            post_dict = {
                'id': post.id,
                'title': post.title,
                'description': post.description,
                'tac_gia': post.tac_gia,
                'path': "/detail/" + post.path,
                'image_thumbnail': app.config.get("DOMAIN_URL_VIEW_FILE") + post.image_thumbnail.get('link'),
                'publish_time': publish_time,
                'category_path': "/category/" + category_path,
                'category_name': category_name
            }
            idx = idx + 1
            array_post.append(post_dict)
    return json({"error_code": "OK", "error_message": "Seccessful", "objects": array_post}, status=200)

@app.route('/api/v1/viewpost-mobile', methods = ["PUT"])
async def api_viewpost_mobile(request):
    data = request.json
    post_id = data.get("post_id")
    if post_id is None:
        return json({'error_code':'PARAM_ERORR', 'error_message':'Tham số không hợp lệ'}, status=520)
    user_id = data.get("user_id")
    if user_id is None:
        return json({'error_code':'PARAM_ERORR', 'error_message':'Tham số không hợp lệ'}, status=520)
    post = db.session.query(PostPublish.id, PostPublish.category_id).filter(PostPublish.id ==  post_id, PostPublish.status == 6, PostPublish.deleted == False).first()
    if post is not None:
        statistic_post = await mdb.db["statistic_post"].find_one({
            "$and": [
                {"post_id": post.id}, 
                {"source": SOURCE_POST['APP']}
            ]
        })
        if statistic_post is not None and 'total_views' in statistic_post:
            item_statistic_post = {
                "$set": {
                    "total_views": statistic_post['total_views'] + 1,
                    "updated_at": convert_timestamp_to_string(time.time(), "%Y%m%d%H%M%S")
                }
            }
            await mdb.db["statistic_post"].update_one({
                "$and": [
                    {"post_id": post.id}, 
                    {"source": SOURCE_POST['APP']}
                ]
            }, item_statistic_post, True)
            
            item_view = {
                "post_id": post.id,
                "user_id": user_id,
                "category_id": post.category_id,
                "time": convert_timestamp_to_string(time.time(), "%Y%m%d%H%M%S"),
                "source": SOURCE_POST['APP']
            }
            await mdb.db['view_post'].insert_one(item_view)
            
            return json({"error_code": "OK", "error_message": "Successful"}, status=200)
        else:
            return json({"error_code": "NOT_FOUND", "error_message": "Không tìm thấy thống kê bài viết"}, status=520)
    else:
        return json({"error_code": "NOT_FOUND", "error_message": "Không tìm thấy bài viết"}, status=520)

@app.route('/api/v1/viewpost', methods = ["POST"])
async def viewpost_api(request):
    data = request.json
    post_id = data.get("post_id")
    if post_id is None:
        return json({'error_code':'PARAM_ERORR', 'error_message':'Tham số không hợp lệ'}, status=520)
    user_id = data.get("user_id")
    if user_id is None:
        return json({'error_code':'PARAM_ERORR', 'error_message':'Tham số không hợp lệ'}, status=520)
    token = request.headers.get("X-USER-TOKEN", None)
    if token is not None and token != "no_data":
        url = app.config.get("DOMAIN_BOOK") + "/api_donvi/v1/current_user"
        headers = {
            'X-USER-TOKEN': token
        }
        resp = requests.get(url, headers=headers)
        if resp.status_code in [200, 201, "200", "201"]:
            response_data = resp.json()
            if 'id' in response_data and response_data['id'] is not None:
                user_id = response_data['id']
        
    post = db.session.query(PostPublish.id, PostPublish.category_id).filter(PostPublish.id ==  post_id, PostPublish.status == 6, PostPublish.deleted == False).first()
    if post is not None:
        statistic_post = await mdb.db["statistic_post"].find_one({
            "$and": [
                {"post_id": post_id}, 
                {"source": SOURCE_POST['WEB']}
            ]
        })
        if statistic_post is not None and 'total_views' in statistic_post:
            item_statistic_post = {
                "$set": {
                    "total_views": statistic_post['total_views'] + 1,
                    "updated_at": convert_timestamp_to_string(time.time(), "%Y%m%d%H%M%S")
                }
            }
            await mdb.db["statistic_post"].update_one({
                "$and": [
                    {"post_id": post_id}, 
                    {"source": SOURCE_POST['WEB']}
                ]
            }, item_statistic_post, True)
            
            item_view = {
                "post_id": post_id,
                "user_id": user_id,
                "category_id": post.category_id,
                "time": convert_timestamp_to_string(time.time(), "%Y%m%d%H%M%S"),
                "source": SOURCE_POST['WEB']
            }
            await mdb.db['view_post'].insert_one(item_view)
            
            return json({"error_code": "OK", "error_message": "Successful"}, status=200)
        else:
            return json({"error_code": "NOT_FOUND", "error_message": "Không tìm thấy thống kê bài viết"}, status=520)
    else:
        return json({"error_code": "NOT_FOUND", "error_message": "Không tìm thấy bài viết"}, status=520)

@app.route('/api/v1/sharepost', methods = ["POST"])
async def sharepost_api(request):
    token = request.headers.get("X-USER-TOKEN", None)
    if token is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    data = request.json
    post_id = data.get("post_id")
    if post_id is None:
        return json({'error_code':'PARAM_ERORR', 'error_message':'Tham số không hợp lệ'}, status=520)
    user_id = data.get("user_id")
    if user_id is None:
        return json({'error_code':'PARAM_ERORR', 'error_message':'Tham số không hợp lệ'}, status=520)
    type_share = data.get("type_share")
    if type_share is None:
        return json({'error_code':'PARAM_ERORR', 'error_message':'Tham số không hợp lệ'}, status=520)
    
    if token != "no_data":
        url = app.config.get("DOMAIN_BOOK") + '/api_donvi/v1/current_user'
        headers = {
            'X-USER-TOKEN': token
        }
        resp = requests.get(url, headers=headers)
        if resp.status_code in [200, 201, "200", "201"]:
            response_data = resp.json()
            if 'id' in response_data and response_data['id'] is not None:
                user_id = response_data['id']
    post = db.session.query(PostPublish.id).filter(PostPublish.id ==  post_id, PostPublish.status == 6, PostPublish.deleted == False).first()
    if post is not None:
        statistic_post = await mdb.db["statistic_post"].find_one({
            "$and": [
                {"post_id": post_id}, 
                {"source": SOURCE_POST['WEB']}
            ]
        })
        if statistic_post is not None and 'total_shared' in statistic_post:
            item_statistic_post = {
                "$set": {
                    "total_shared": statistic_post['total_shared'] + 1,
                    "updated_at": convert_timestamp_to_string(time.time(), "%Y%m%d%H%M%S")
                }
            }
            await mdb.db["statistic_post"].update_one({
                "$and": [
                    {"post_id": post_id}, 
                    {"source": SOURCE_POST['WEB']}
                ]
            }, item_statistic_post, True)
            
            mongo_item = {
                "post_id": post_id,
                "user_id": user_id,
                "time": convert_timestamp_to_string(time.time(), "%Y%m%d%H%M%S"),
                "type_share": type_share,
                "source": SOURCE_POST['WEB']
            }
            await mdb.db['share_post'].insert_one(mongo_item)
            
            return json({"error_code": "OK", "error_message": "Successful"}, status=200)
        else:
            return json({"error_code": "NOT_FOUND", "error_message": "Không tìm thấy thống kê bài viết"}, status=520)
    else:
        return json({"error_code": "NOT_FOUND", "error_message": "Không tìm thấy bài viết"}, status=520)

@app.route('/api/v1/likepost', methods = ["POST"])
async def likepost_api_post(request):
    token = request.headers.get("X-USER-TOKEN", None)
    if token is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    user_id = None
    url = app.config.get("DOMAIN_BOOK") + '/api_donvi/v1/current_user'
    headers = {
        'X-USER-TOKEN': token
    }
    resp = requests.get(url, headers=headers)
    if resp.status_code in [200, 201, "200", "201"]:
        response_data = resp.json()
        if 'id' in response_data and response_data['id'] is not None:
            user_id = response_data['id']
        else:
            return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    else:
        return json({'error_code':'ERROR', 'error_message':'Có lỗi xảy ra, vui lòng thử lại sau'}, status=520)
    
    data = request.json
    post_id = data.get("post_id")
    if post_id is None:
        return json({"error_code": "PARAM_ERROR", "error_message": "Tham số không hợp lệ"}, status=520)
    post = db.session.query(PostPublish.id).filter(PostPublish.id ==  post_id, PostPublish.status == 6, PostPublish.deleted == False).first()
    if post is None:
        return json({"error_code": "NOT_FOUND", "error_message": "Không tìm thấy bài viết"}, status=520)
    statistic_post = await mdb.db["statistic_post"].find_one({
        "$and": [
            {"post_id": post_id}, 
            {"source": SOURCE_POST['WEB']}
        ]
    })
    if statistic_post is not None and 'total_likes' in statistic_post:
        item_statistic_post = {
            "$set": {
                "total_likes": statistic_post['total_likes'] + 1,
                "updated_at": convert_timestamp_to_string(time.time(), "%Y%m%d%H%M%S")
            }
        }
        await mdb.db["statistic_post"].update_one({
            "$and": [
                {"post_id": post_id}, 
                {"source": SOURCE_POST['WEB']}
            ]
        }, item_statistic_post, True)
        
        mongo_item = {
            "post_id": post_id,
            "user_id": user_id,
            "time": convert_timestamp_to_string(time.time(), "%Y%m%d%H%M%S"),
            "source": SOURCE_POST['WEB']
        }
        await mdb.db['like_post'].insert_one(mongo_item)
        
        return json({"error_code": "OK", "error_message": "Successful"}, status=200)
    else:
        return json({"error_code": "NOT_FOUND", "error_message": "Không tìm thấy thống kê bài viết"}, status=520)

@app.route('/api/v1/likepost/<post_id>', methods = ["GET","DELETE"])
async def likepost_api_get_delete(request, post_id):
    token = request.headers.get("X-USER-TOKEN", None)
    if token is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    if post_id is None:
        return json({'error_code':'PARAM_ERORR', 'error_message':'Tham số không hợp lệ'}, status=520)
    user_id = None
    url = app.config.get("DOMAIN_BOOK") + '/api_donvi/v1/current_user'
    headers = {
        'X-USER-TOKEN': token
    }
    resp = requests.get(url, headers=headers)
    if resp.status_code in [200, 201, "200", "201"]:
        response_data = resp.json()
        if 'id' in response_data and response_data['id'] is not None:
            user_id = response_data['id']
        else:
            return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    else:
        return json({'error_code':'ERROR', 'error_message':'Có lỗi xảy ra, vui lòng thử lại sau'}, status=520)
    check_like_post = await mdb.db["like_post"].find_one({
        "$and": [
            {"post_id": post_id}, 
            {"user_id": user_id}
        ]
    })
    if request.method == "GET":
        if check_like_post is not None:
            return json({'error_code':'OK', 'error_message':True}, status=200)
        else:
            return json({'error_code':'OK', 'error_message':False}, status=200)
    if request.method == "DELETE":
        if check_like_post is not None:
            source = check_like_post['source']
            await mdb.db["like_post"].delete_one({
                "$and": [
                    {"post_id": post_id}, 
                    {"user_id": user_id}
                ]
            })
            statistic_post = await mdb.db["statistic_post"].find_one({
                "$and": [
                    {"post_id": post_id}, 
                    {"source": source}
                ]
            })
            if statistic_post is not None and 'total_likes' in statistic_post:
                item_statistic_post = {
                    "$set": {
                        "total_likes": statistic_post['total_likes'] - 1,
                        "updated_at": convert_timestamp_to_string(time.time(), "%Y%m%d%H%M%S")
                    }
                }
                await mdb.db["statistic_post"].update_one({
                    "$and": [
                        {"post_id": post_id}, 
                        {"source": source}
                    ]
                }, item_statistic_post, True)
                
                return json({"error_code": "OK", "error_message": "Successful"}, status=200)
            else:
                return json({"error_code": "NOT_FOUND", "error_message": "Không tìm thấy thống kê bài viết"}, status=520)
        else:
            return json({'error_code':'ERROR', 'error_message':'Có lỗi xảy ra, vui lòng thử lại sau'}, status=520)
        
@app.route('/api/v1/savepost', methods = ["POST"])
async def savepost_api_post(request):
    token = request.headers.get("X-USER-TOKEN", None)
    if token is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    url = app.config.get("DOMAIN_BOOK") + '/api_donvi/v1/current_user'
    headers = {
        'X-USER-TOKEN': token
    }
    user_id = None
    resp = requests.get(url, headers=headers)
    if resp.status_code in [200, 201, "200", "201"]:
        response_data = resp.json()
        if 'id' in response_data and response_data['id'] is not None:
            user_id = response_data['id']
        else:
            return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    else:
        return json({'error_code':'ERROR', 'error_message':'Có lỗi xảy ra, vui lòng thử lại sau'}, status=520)

    data = request.json
    post_id = data.get("post_id")
    if post_id is None:
        return json({'error_code':'PARAM_ERORR', 'error_message':'Tham số không hợp lệ'}, status=520)
    post = db.session.query(PostPublish.id).filter(PostPublish.id ==  post_id, PostPublish.status == 6, PostPublish.deleted == False).first()
    if post is None:
        return json({"error_code": "NOT_FOUND", "error_message": "Không tìm thấy bài viết"}, status=520)
    statistic_post = await mdb.db["statistic_post"].find_one({
        "$and": [
            {"post_id": post_id}, 
            {"source": SOURCE_POST['WEB']}
        ]
    })
    if statistic_post is not None and 'total_saved' in statistic_post:
        item_statistic_post = {
            "$set": {
                "total_saved": statistic_post['total_saved'] + 1,
                "updated_at": convert_timestamp_to_string(time.time(), "%Y%m%d%H%M%S")
            }
        }
        await mdb.db["statistic_post"].update_one({
            "$and": [
                {"post_id": post_id}, 
                {"source": SOURCE_POST['WEB']}
            ]
        }, item_statistic_post, True)
        
        mongo_item = {
            "post_id": post_id,
            "user_id": user_id,
            "time": convert_timestamp_to_string(time.time(), "%Y%m%d%H%M%S"),
            "source": SOURCE_POST['WEB']
        }
        await mdb.db['save_post'].insert_one(mongo_item)
        
        return json({"error_code": "OK", "error_message": "Successful"}, status=200)
    else:
        return json({"error_code": "NOT_FOUND", "error_message": "Không tìm thấy thống kê bài viết"}, status=520)

@app.route('/api/v1/savepost/<post_id>', methods = ["GET","DELETE"])
async def savepost_api_get_delete(request, post_id):
    token = request.headers.get("X-USER-TOKEN", None)
    if token is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    if post_id is None:
        return json({'error_code':'PARAM_ERORR', 'error_message':'Tham số không hợp lệ'}, status=520)
    url = app.config.get("DOMAIN_BOOK") + '/api_donvi/v1/current_user'
    headers = {
        'X-USER-TOKEN': token
    }
    user_id = None
    resp = requests.get(url, headers=headers)
    if resp.status_code in [200, 201, "200", "201"]:
        response_data = resp.json()
        if 'id' in response_data and response_data['id'] is not None:
            user_id = response_data['id']
        else:
            return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    else:
        return json({'error_code':'ERROR', 'error_message':'Có lỗi xảy ra, vui lòng thử lại sau'}, status=520)
    check_save_post = await mdb.db["save_post"].find_one({
        "$and": [
            {"post_id": post_id}, 
            {"user_id": user_id}
        ]
    })
    if request.method == "GET":
        if check_save_post is not None:
            return json({'error_code':'OK', 'error_message':True}, status=200)
        else:
            return json({'error_code':'OK', 'error_message':False}, status=200)
    if request.method == "DELETE":
        if check_save_post is not None:
            source = check_save_post['source']
            await mdb.db["save_post"].delete_one({
                "$and": [
                    {"post_id": post_id}, 
                    {"user_id": user_id}
                ]
            })
            statistic_post = await mdb.db["statistic_post"].find_one({
                "$and": [
                    {"post_id": post_id}, 
                    {"source": source}
                ]
            })
            if statistic_post is not None and 'total_saved' in statistic_post:
                item_statistic_post = {
                    "$set": {
                        "total_saved": statistic_post['total_saved'] - 1,
                        "updated_at": convert_timestamp_to_string(time.time(), "%Y%m%d%H%M%S")
                    }
                }
                await mdb.db["statistic_post"].update_one({
                    "$and": [
                        {"post_id": post_id}, 
                        {"source": source}
                    ]
                }, item_statistic_post, True)
                
                return json({"error_code": "OK", "error_message": "Successful"}, status=200)
            else:
                return json({"error_code": "NOT_FOUND", "error_message": "Không tìm thấy thống kê bài viết"}, status=520)
        else:
            return json({'error_code':'ERROR', 'error_message':'Có lỗi xảy ra, vui lòng thử lại sau'}, status=520)
   
@app.route('/api/v1/commentpost', methods = ["POST"])
async def commentpost_api(request):
    data = request.json
    post_id = data.get("post_id")
    content = data.get("content")
    token = request.headers.get("X-USER-TOKEN", None)
    if token is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    if post_id is None:
        return json({'error_code':'PARAM_ERORR', 'error_message':'Tham số không hợp lệ'}, status=520)
    post_db = db.session.query(PostPublish.id, PostPublish.allowed_comment).filter(PostPublish.id ==  post_id, PostPublish.status == 6, PostPublish.deleted == False).first()
    if post_db is None:
        return json({'error_code':'NOT_FOUND', 'error_message':'Không tìm thấy bài viết'}, status=520)
    if post_db.allowed_comment != True:
        return json({'error_code':'PERMISSION_DENY', 'error_message':'Bài viết không được phép bình luận'}, status=520)
    if content is None:
        return json({'error_code':'PARAM_ERORR', 'error_message':'Tham số không hợp lệ'}, status=520)
    url = app.config.get("DOMAIN_BOOK") + "/api_donvi/v1/current_user"
    headers = {
        'X-USER-TOKEN': token
    }
    user_id = None
    user_name = None
    resp = requests.get(url, headers=headers)
    if resp.status_code in [200, 201, "200", "201"]:
        response_data = resp.json()
        if 'id' in response_data and response_data['id'] is not None:
            user_id = response_data['id']
            user_name = response_data.get("full_name")
        else:
            return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    else:
        return json({'error_code':'ERROR', 'error_message':'Có lỗi xảy ra, vui lòng thử lại sau'}, status=520)
    
    commentpost = {
        "_id": ObjectId(''.join(random.choice('0123456789abcdef') for n in range(24))),
        "post_id": post_id,
        "user_id": user_id,
        "user_name": user_name if user_name is not None else "",
        "status": 0,
        "review_time": None,
        "review_by": None,
        "content": content,
        "reply_comment_id": data.get("reply_comment_id"),
        "created_at": convert_timestamp_to_string(time.time(), "%Y%m%d%H%M%S"),
        "source": SOURCE_POST['WEB'],
        "deleted_at": None,
        "deleted_by": None,
        "time": convert_timestamp_to_string(time.time(), "%Y%m%d%H%M%S"),
    }
    await mdb.db['comment_post'].insert_one(commentpost)
    
    statistic_post = await mdb.db["statistic_post"].find_one({
        "$and": [
            {"post_id": post_id}, 
            {"source": SOURCE_POST['WEB']}
        ]
    })
    if statistic_post is not None and 'total_comments' in statistic_post:
        item_statistic_post = {
            "$set": {
                "total_comments": statistic_post['total_comments'] + 1,
                "updated_at": convert_timestamp_to_string(time.time(), "%Y%m%d%H%M%S")
            }
        }
        await mdb.db["statistic_post"].update_one({
            "$and": [
                {"post_id": post_id}, 
                {"source": SOURCE_POST['WEB']}
            ]
        }, item_statistic_post, True)
        
        commentpost['day'] = convert_to_date(commentpost['time'])
        commentpost['hours'] = convert_to_hours(commentpost['time'])
        count_comment = await mdb.db["comment_post"].count_documents({
            "$and": [
                {"post_id": post_id},
                {"$or": [
                    {"status": {"$in":[1]}},
                    {"$and": [
                        {"user_id": user_id},
                        {"status": {"$in":[0,2]}}
                    ]}
                ]}
            ]
        })
        commentpost['count_comment'] = count_comment
        commentpost['id'] = str(commentpost['_id'])
        del commentpost['_id']
        return json(commentpost, status=200)
    else:
        return json({"error_code": "NOT_FOUND", "error_message": "Không tìm thấy thống kê bài viết"}, status=520)

@app.route('/api/v1/listcomment/<post_id>')
async def listcomment_api(request, post_id):
    if post_id is None:
        return json({'error_code':'PARAM_ERORR', 'error_message':'Tham số không hợp lệ'}, status=520)
    check_post = db.session.query(PostPublish.id).filter(PostPublish.id == post_id, PostPublish.status == 6, PostPublish.deleted == False).first()
    if check_post is None:
        return json({'error_code':'NOT_FOUND', 'error_message':'Không tìm thấy bài viết'}, status=520)
    token = request.headers.get("X-USER-TOKEN", None)
    user_id = None
    if token is not None and token != "null":
        url = app.config.get("DOMAIN_BOOK") + "/api_donvi/v1/current_user"
        headers = {
            'X-USER-TOKEN': token
        }
        resp = requests.get(url, headers=headers)
        if resp.status_code in [200, 201, "200", "201"]:
            response_data = resp.json()
            if 'id' in response_data and response_data['id'] is not None:
                user_id = response_data['id']
            else:
                return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
        else:
            return json({'error_code':'ERROR', 'error_message':'Có lỗi xảy ra, vui lòng thử lại sau'}, status=520)
    
    query_filter = {
        "$and": [
            {"post_id": post_id},
            {"status": {"$in":[1]}}
        ]
    }
    if user_id is not None:
        query_filter = {
        "$and": [
            {"post_id": post_id},
            {"$or": [
                {"status": {"$in":[1]}},
                {"$and": [
                    {"user_id": user_id},
                    {"status": {"$in":[0,2]}}
                ]}
            ]}
        ]
    }
    danhsach = mdb.db["comment_post"].find(query_filter).sort([("created_at", -1)])
    list_comment = await danhsach.to_list(None)
    objects = []
    for comment in list_comment:
        day = convert_to_date(comment['time'])
        hours = convert_to_hours(comment['time'])
        comment_dict = {
            "id": str(comment['_id']),
            "user_name": comment['user_name'],
            "content": comment['content'],
            "reply_comment_id": comment['reply_comment_id'],
            "day": day,
            "hours": hours,
            "status": comment['status']
        }
        objects.append(comment_dict)
    return json({"objects": objects}, status = 200)

@app.route('/api/v1/get_count_comment/<post_id>')
async def get_count_comment(request, post_id):
    if post_id is None:
        return json({'error_code':'PARAM_ERORR', 'error_message':'Tham số không hợp lệ'}, status=520)
    check_post = db.session.query(PostPublish.id).filter(PostPublish.id == post_id, PostPublish.status == 6, PostPublish.deleted == False).first()
    if check_post is None:
        return json({'error_code':'NOT_FOUND', 'error_message':'Không tìm thấy bài viết'}, status=520)
    token = request.headers.get("X-USER-TOKEN", None)
    if token is None:
        return json({'error_code':'PARAM_ERORR', 'error_message':'Tham số không hợp lệ'}, status=520)
    user_id = None
    url = app.config.get("DOMAIN_BOOK") + "/api_donvi/v1/current_user"
    headers = {
        'X-USER-TOKEN': token
    }
    resp = requests.get(url, headers=headers)
    if resp.status_code in [200, 201, "200", "201"]:
        response_data = resp.json()
        if 'id' in response_data and response_data['id'] is not None:
            user_id = response_data['id']
        else:
            return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    else:
        return json({'error_code':'ERROR', 'error_message':'Có lỗi xảy ra, vui lòng thử lại sau'}, status=520)
    
    query_filter = {
        "$and": [
            {"post_id": post_id},
            {"$or": [
                {"status": {"$in":[1]}},
                {"$and": [
                    {"user_id": user_id},
                    {"status": {"$in":[0,2]}}
                ]}
            ]}
        ]
    }
    count_comment = await mdb.db["comment_post"].count_documents(query_filter)
    return json({'error_code':'OK', 'error_message':'Successful', 'count_comment': count_comment}, status = 200)