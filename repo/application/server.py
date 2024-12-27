""" App entry point. """

from gatco import Gatco
from gatco.sessions import CookieSessionInterface
from sanic_cors import CORS, cross_origin
# from .config import Config

app = Gatco(name=__name__)
app.session_interface = CookieSessionInterface()
CORS(app, automatic_options=True)
# app.config.from_object(Config)



# @app.listener('before_server_start')
# async def setup_db(app, loop):
#     app.db = await db_setup()

# @app.listener('after_server_start')
# async def notify_server_started(app, loop):
#     print('Server successfully started!')

# @app.listener('before_server_stop')
# async def notify_server_stopping(app, loop):
#     print('Server shutting down!')

# @app.listener('after_server_stop')
# async def close_db(app, loop):
#     await app.db.close()