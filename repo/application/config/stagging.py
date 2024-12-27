class Config(object):
    DEBUG = True
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
       

    DOMAIN_URL = 'platform-ydct.baocaoyte.com'
    
    FS_ROOT= "/opt/deploys/nentang_ydct/repo/static/files/uploads/"
    FS_ROOT_FILE= "/opt/deploys/nentang_ydct/repo/static/files/uploads/"
    FILE_SERVICE_URL = '/files/uploads'

    MAIL_SERVER_HOST = 'smtp.gmail.com'
    MAIL_SERVER_PORT = 587
    MAIL_SERVER_USER = 'cskh.healthchainvn@gmail.com'
    MAIL_SERVER_PASSWORD = 'kveqmteracleunsd'
    MAIL_SERVER_USE_TLS = False
    MAIL_SERVER_USE_SSL = True
    
    MOTOR_URI = 'mongodb://127.0.0.1:27017/nentang_ydct'