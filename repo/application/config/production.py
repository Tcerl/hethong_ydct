class Config(object):
    DEBUG = False
    STATIC_URL = '/static'
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:123456@127.0.0.1:5432/base_data'



    AUTH_LOGIN_ENDPOINT = 'login'
    AUTH_PASSWORD_HASH = 'bcrypt'
    AUTH_PASSWORD_SALT = 'add_salt'
    SESSION_COOKIE_SALT = 'salt_key'
    SECRET_KEY = 'acndefhskrmsdfgs'
    SESSION_EXPIRED = 86400 #seconds
    REQUEST_TIMEOUT = 3600
    RESPONSE_TIMEOUT = 3600

    DOMAIN_URL = 'https://cocq.baocaoyte.com'
    

    FS_ROOT= "/opt/deploys/duoclieucocq/repo/static/files/uploads/"
    FS_ROOT_FILE= "/opt/deploys/duoclieucocq/repo/static/files/uploads/"
    IMAGE_SERVICE_URL = 'http://cocq.baocaoyte.com/static/images/uploads'
    FILE_SERVICE_URL = '/files/uploads'
    FILE_ANH_DUOCLIEU = '/anhduoclieu'
    
    # PDF_FOLDER = '/opt/deploys/baocao_ppe/pdf_kcb/'

    MAIL_SERVER_HOST = 'smtp.gmail.com'
    MAIL_SERVER_PORT = 587
    MAIL_SERVER_USER = 'cskh.healthchainvn@gmail.com'
    MAIL_SERVER_PASSWORD = 'kveqmteracleunsd'
    MAIL_SERVER_USE_TLS = False
    MAIL_SERVER_USE_SSL = True

    PDF_FOLDER = '/opt/deploys/duoclieucocq/repo/static/export_pdf/'
    QRCODE_FOLDER= '/opt/deploys/duoclieucocq/repo/static/qrcode/'

    URL_FILEUPLOAD = 'https://uploads.baocaoyte.com/api/v1/duoclieucocq'
    URL_VIEW_FILE_UPLOAD = 'https://uploads.baocaoyte.com/'

