'''
Created on March 06, 2020

@author: namdv
'''
import time
import asyncio
import aiosmtplib
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from email.mime.text import MIMEText
from email.header import Header
from application.server import app
from application.extensions import  jinja
from application.database import redisdb,db

from gatco.response import json, text
from application.client import HTTPClient
import ujson
import binascii
import uuid
import string
import random
import urllib.parse

import smtplib
import imghdr
from email.message import EmailMessage
import os
from os.path import abspath, dirname



async def send_mail_process(subject, recipient, body):

    #Thanks: https://github.com/cole/aiosmtplib/issues/1
    host = app.config.get('MAIL_SERVER_HOST')
    port = app.config.get('MAIL_SERVER_PORT')
    user = app.config.get('MAIL_SERVER_USER')
    password = app.config.get('MAIL_SERVER_PASSWORD')

    loop = asyncio.get_event_loop()

    #server = aiosmtplib.SMTP(host, port, loop=loop, use_tls=False, use_ssl=True)
    server = aiosmtplib.SMTP(hostname=host, port=port, loop=loop, use_tls=False)
    await server.connect()

    await server.starttls()
    await server.login(user, password)

    async def send_a_message():
        # message = MIMEText(body)
        message = MIMEText(body, 'html', _charset='utf-8')
        message['From'] = app.config.get('MAIL_SERVER_USER')
        #message['To'] = ','.join(new_obj.get('email_to'))
        message['To'] = recipient
        # message['Subject'] = Header(subject, "utf-8")
        message['Subject'] = Header(subject.encode('utf-8'), 'UTF-8').encode()
        await server.send_message(message)

    await send_a_message()


async def send_email(subject, recipient, body):
    scheduler = AsyncIOScheduler()
    scheduler.add_job(send_mail_process,args=[subject, recipient, body])
    scheduler.start()


async def generate_token(key="sessions:", user_id=None, time_expire=None):
    token =  binascii.hexlify(uuid.uuid4().bytes).decode()
    p = redisdb.pipeline()
    p.set(key + token, user_id)
    p.expire(key + token, time_expire)
    p.execute()
    return token

async def set_to_cache(key, value, time_expire):
    p = redisdb.pipeline()
    p.set(key , value)
    p.expire(key, time_expire)
    p.execute()
    return True

async def send_reset_password(request, user):
    one = ''.join(random.choices(string.digits, k=1))
    two = ''.join(random.choices(string.digits, k=1))
    three = ''.join(random.choices(string.digits, k=1))
    four = ''.join(random.choices(string.digits, k=1))
    five = ''.join(random.choices(string.digits, k=1))
    six = ''.join(random.choices(string.digits, k=1))
    str_number = ''+str(one)+str(two)+str(three)+str(four)+str(five)+str(six)
    await set_to_cache("session-reset-password:"+str(user["id"]),str_number, 3600)
    subject = 'Khôi phục mật khẩu'
    
    #get template for forgot password
    #mailbody = reset_link

    if ("type_confirm" in user and user["type_confirm"] is not None and user["type_confirm"] == 1):
        await sendSMS(user, str_number,"ma xac nhan khoi phuc mat khau cua ")
    else:
        mailbody = jinja.render_string('email/reset-pass.html',request, userName=user['hoten'], one=one, two=two, three=three, four=four,five=five, six=six) 
        scheduler = AsyncIOScheduler()
        scheduler.add_job(send_email,args=[subject, user["email"], mailbody])
        scheduler.start()

async def send_active_account(request, user):
    one = ''.join(random.choices(string.digits, k=1))
    two = ''.join(random.choices(string.digits, k=1))
    three = ''.join(random.choices(string.digits, k=1))
    four = ''.join(random.choices(string.digits, k=1))
    five = ''.join(random.choices(string.digits, k=1))
    six = ''.join(random.choices(string.digits, k=1))
    str_number = ''+str(one)+str(two)+str(three)+str(four)+str(five)+str(six)
    await set_to_cache("session-active-account:"+str(user["id"]),str_number, 3600)
    subject = 'Kích hoạt tài khoản'
    
    #get template for forgot password
    #mailbody = reset_link
    if ("type_confirm" in user and user["type_confirm"] is not None and user["type_confirm"] == 1):
        await sendSMS(user, str_number,"ma xac nhan kich hoat tai khoan ")
    else:
        mailbody = jinja.render_string('email/active-account.html',request, userName=user['name'], one=one, two=two, three=three, four=four,five=five, six=six) 
        scheduler = AsyncIOScheduler()
        scheduler.add_job(send_email,args=[subject, user["email"], mailbody])
        scheduler.start()   



####send image email
###12/07/2021
###add by duy
async def sendImageEmail(subject, recipient, body, image):
    Sender_Email = app.config.get('MAIL_SERVER_USER')
    Reciever_Email = recipient
    Password = app.config.get('MAIL_SERVER_PASSWORD')
    newMessage = EmailMessage()                         
    newMessage['Subject'] = subject
    newMessage['From'] = Sender_Email                   
    newMessage['To'] = Reciever_Email                   
    newMessage.set_content(body) 
    with open(image, 'rb') as f:
        image_data = f.read()
        image_type = imghdr.what(f.name)
        image_name = f.name
        filename = os.path.basename(image)

    newMessage.add_attachment(image_data, maintype='image', subtype=image_type, filename=filename)
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
        
        smtp.login(Sender_Email, Password)              
        smtp.send_message(newMessage)


    


