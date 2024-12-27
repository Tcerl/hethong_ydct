import os
from .server import app
from application.database import init_database
from application.extensions import init_extensions
from application.controllers import init_controllers


def run_app(host="127.0.0.1", port=12011, debug=False, mode='production'):
    """ Function for bootstrapping gatco app. """
    
    if mode == 'development':
        print('Run develop')
        from .config.development import Config
        app.config.from_object(Config)
        
        static_endpoint = app.config.get("STATIC_URL", None)
        if (static_endpoint is not None) and not ((static_endpoint.startswith( 'http://' ) or (static_endpoint.startswith( 'https://' )))):
            app.static(static_endpoint, './static')
    elif mode == 'production':
        print('Run product')
        from .config.production import Config
        app.config.from_object(Config)
        static_endpoint = app.config.get("STATIC_URL", None)
        if (static_endpoint is not None) and not ((static_endpoint.startswith( 'http://' ) or (static_endpoint.startswith( 'https://' )))):
            app.static(static_endpoint, './static')
    elif mode == 'stagging':
        print('Run stagging')
        from .config.stagging import Config
        app.config.from_object(Config)
        static_endpoint = app.config.get("STATIC_URL", None)
        if (static_endpoint is not None) and not ((static_endpoint.startswith( 'http://' ) or (static_endpoint.startswith( 'https://' )))):
            app.static(static_endpoint, './static')
    else:
        print("require mode production or development")
        
    init_database(app)
    init_extensions(app)
    init_controllers(app)
    app.run(host=host, port=port, debug=debug, workers=os.cpu_count(), access_log=False)


import asyncio
from application.database import redisdb, db
# from application.models.models import  Notify, NotifyUser
from sqlalchemy import or_,and_
import sys
import ujson

# @app.websocket('/socketserver')
# async def socketserver(request, ws):
#     while True:
#         try:
#             try:
#                 userid = request.args.get("uid",None)
#                 data = ''
#                 if( userid is not None):
#                     data_redis = redisdb.get("notify_check:" + str(userid))
#                     if(data_redis is not None and data_redis !=""):
#                         data = ujson.loads(data_redis)
                
#                         print('server socket Sending data======',data)
#                         count_notify = db.session.query(NotifyUser).\
#                             filter(and_(NotifyUser.user_id == userid, NotifyUser.read_at == None)).count()
#                         data['count'] = count_notify
#                         redisdb.delete("notify_check:" + str(userid))
#                         await ws.send(ujson.dumps(data))

#             except asyncio.TimeoutError:
#                 print("socketserver=====NO PONG!!")
#             else:
#                 print("socketserver=====ping: 111111, ======", request.args.get("uid",None))
#             await asyncio.sleep(10)
#         except Exception as e:
#             print(e.__class__.__name__, e)
#             break
#         except:
#             print("socketserver broken connection error:", sys.exc_info()[0])
#             break
