from gatco_sqlalchemy import SQLAlchemy
import redis
from gatco_motor import Motor

db = SQLAlchemy()
redisdb = redis.StrictRedis(host='localhost', port=6379, db=7)

mdb = Motor()

def init_database(app):
    db.init_app(app)
    mdb.init_app(app=app, uri=app.config.get("MOTOR_URI"))