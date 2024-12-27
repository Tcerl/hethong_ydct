""" Module represents a User. """

from sqlalchemy import (
    func, Column, Table, String, Integer, SmallInteger,BigInteger,
    DateTime, Date, Boolean, Float,
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
from application.models.model_danhmuc import QuocGia, TinhThanh, QuanHuyen, XaPhuong


def default_uuid():
    return str(uuid.uuid4())

class Counter(CommonModel):
    __tablename__ = 'counter'
    id = db.Column(String, primary_key=True, default=default_uuid)
    type = db.Column(String(), index=True) # "post" - path của bài viết, "category" - path của chuyên mục
    path = db.Column(String, index=True)
    count = db.Column(BigInteger, index=True)
    donvi_id = db.Column(String, index=True)

class FileInfo(CommonModel):
    __tablename__ = 'fileinfo'
    id = db.Column(String, primary_key=True)
    sha256 = db.Column(String, index=True, nullable=False)
    user_name = db.Column(String)
    user_id = db.Column(String(), index=True, nullable=False) #user id
    name = db.Column(String, nullable=True)
    extname = db.Column(String, nullable=True)
    link = db.Column(String, nullable=True)
    description = db.Column(String, nullable=True)
    attrs = db.Column(JSONB())
    size = db.Column(String())
    kind = db.Column(String, nullable=True) #fileserver, or normal
    type = db.Column(SmallInteger) # 1 - hình ảnh trong bài viết, 2 - tệp đính kèm trong bài viết
    unsigned_name = db.Column(String)
    donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=True)
    donvi = relationship('DonVi')
    
class AppInfo(CommonModel):
    __tablename__ = 'appinfo'

    id = Column(String, primary_key=True, default=default_uuid)
    appkey = Column(String, index=True, nullable=False, unique=True, default=default_uuid)
    password = Column(String, nullable=False)
    salt = Column(String, nullable=False)
    name = Column(String, nullable=False)
    unsigned_name = Column(String)
    description = Column(String)
    organization_name = Column(String, nullable=False)
    status = Column(Integer, default=0)
    type = Column(SmallInteger, default=0)  # 0=application ket noi den nen tang, 1 nen tang kết nối tới ứng dụng khác
    url_connect = Column(String)
    # cosoyte_id = Column(String, ForeignKey('cosoyte.id'), nullable=False)
    
    # # Mối quan hệ với CoSoYTe
    # cosoyte = relationship('CoSoYTe', back_populates='appinfo', foreign_keys=[cosoyte_id])

    # def __repr__(self):
    #     return f"AppInfo(id={self.id}, name={self.name}, organization_name={self.organization_name})"
        