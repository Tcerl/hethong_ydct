import requests
from bs4 import BeautifulSoup
from application.server import app
from gatco.response import json, text, html
from application.controllers.helpers.helper_common import current_user
import time
import re

@app.route('/api/v1/crawl_news', methods=['GET'])
async def crawl_news(request):
    currentUser = current_user(request)
    if currentUser is None:
        return json({'error_code':'SESSION_EXPIRED', 'error_message':'Hết phiên làm việc, vui lòng đăng nhập lại'}, status=520)
    url = request.args.get('url_post', None)
    is_sava_link = request.args.get('is_sava_link', None)
    if url is None:
        return json({"error_code": "PARAM_ERROR", "error_message": "ERROR"}, status=520)
    if is_sava_link is None:
        return json({"error_code": "PARAM_ERROR", "error_message": "ERROR"}, status=520)
    response = requests.get(url)

    soup = BeautifulSoup(response.content, "html.parser")

    def not_lacie(href):
        return href and not re.compile("lacie").search(href)
    tag_href = soup.find_all(href=not_lacie)

    if is_sava_link == "true":
        for href in tag_href:
            if href['href'].startswith('/'):
                href['href'] = "https://suckhoedoisong.vn" + href['href']
    else:
        for href in tag_href:
            if href['href'].startswith('#'):
                pass
            else:
                href['href'] = "javascript:;"
    data_news = {
        "anhdaidien": None,
        "description": "",
        "title": "",
        "content": "",
        "news_source": "suckhoedoisong",
        "link_original_post": url
    }
    # data_news['title'] = soup.find('title').string
    title = soup.find('meta', {"property": "og:title"})
    data_news['title'] = title['content'] if title.get("content", None) is not None else None

    anhdaidien = soup.find('meta', {"property": "og:image"})
    data_news['anhdaidien'] = anhdaidien['content'] if anhdaidien.get("content", None) is not None else None

    description = soup.find('meta', {"name": "description"})
    data_news['description'] = description['content'] if description.get("content", None) is not None else ""

    content = soup.find('div', {"itemprop": "articleBody"}).find('div', {"class": "detail-content"})
    str_content = str(content) if content is not None else ""
    
    
    author = soup.find('div', {"data-role": "author"})
    data_news['author'] = author.text if author is not None else ""

    #tìm các ảnh và thay thế bằng element của mình
    list_img_figure = content.find_all("figure", {"class":"VCSortableInPreviewMode","type":"Photo"})
    for item_img in list_img_figure:
        img = item_img.find('img')
        title_img = img['title'] if img.get("title", None) is not None else ""
        src_img = img['src'] if img.get("src", None) is not None else ""
        el_caption_img = item_img.find('figcaption', {"class": "PhotoCMS_Caption"}).find("p")
        caption_img = el_caption_img.text if el_caption_img is not None else ""
        str_replace_img = '''<figure class="tinybox block-image">
                                <div class="box-image">
                                    <img src="'''+ src_img + '''" title="''' + title_img + '''">
                                </div>
                                <figcaption class="block-caption">''' + caption_img + '''</figcaption></figure>'''
        str_content = str_content.replace(str(item_img), str_replace_img)
        
    list_img_div = content.find_all("div", {"class":"VCSortableInPreviewMode","type":"Photo"})
    for item_img in list_img_div:
        img = item_img.find('img')
        title_img = img['title'] if img.get("title", None) is not None else ""
        src_img = img['src'] if img.get("src", None) is not None else ""
        el_caption_img = item_img.find('div', {"class": "PhotoCMS_Caption"}).find("p")
        caption_img = el_caption_img.text if el_caption_img is not None else ""
        str_replace_img = '''<figure class="tinybox block-image">
                                <div class="box-image">
                                    <img src="'''+ src_img + '''" title="''' + title_img + '''">
                                </div>
                                <figcaption class="block-caption">''' + caption_img + '''</figcaption></figure>'''
        str_content = str_content.replace(str(item_img), str_replace_img)
    
    #tìm các box nội dung nổi bật và thay thế bằng element của mình
    list_box_highlight = content.find_all("div", id=re.compile(r'ObjectBoxContent'))
    for box_highlight in list_box_highlight:
        el_div = box_highlight.find("div")
        box_highlight_content = el_div.text if el_div is not None else ""
        str_replace = """
            <div class='tinybox box-highlight' data-type='3' data-content='""" + box_highlight_content + """' data-link=''>
                <div class="boxhighlight-content">""" + box_highlight_content + """</div>
            </div>
        """
        str_content = str_content.replace(str(box_highlight), str_replace)
      
    #tìm các trích dẫn và thay thế bằng element của mình
    list_quote = content.find_all("div", {"class":"VCSortableInPreviewMode","type":"block-quote-info"})
    for quote in list_quote:
        data_layout = quote.get('data-layout', None)
        if data_layout is not None:
            #content
            el_content = quote.find('div', {"class": "quote-content"})
            q_content = el_content.text if el_content is not None else None
            if q_content is not None and q_content != "":
                #avatar
                avatar = None
                el_avatar = quote.find('span', {"class": "q-avatar"})
                if el_avatar is not None:
                    el_img = el_avatar.find('img')
                    if el_img is not None:
                        avatar = el_img.get("src", None)
                str_avatar = ''
                if avatar is not None:
                    str_avatar = '<span class="q-avatar"><img src="' + avatar + '"></span>'
                if avatar is None:
                    avatar = ''
                    
                #name
                el_name = quote.find('span', {"class": "q-name"})
                name = el_name.text if el_name is not None else ""
                
                #link
                link = None
                el_link = quote.find('span', {"class": "q-link"})
                if el_link is not None:
                    link = el_link.get("data-link", None)
                if link is None:
                    link = ''
                
                if data_layout in ["default","right-center"]:
                    str_replace = """
                        <div class='tinybox block-quote' data-type='1' data-content='""" + q_content + """' data-link='""" + link + """' data-name='""" + name + """' data-author-image='""" + avatar + """'>
                            <div class='quote-content'>""" + q_content + """</div>
                            <div class='quote-author'>
                                """ + str_avatar + """
                                <span class='q-name'>""" + name + """</span>
                                <span class='q-link'>
                                    <a href='""" + link + """' target='_blank'>""" + link + """</a>
                                </span>
                            </div>
                        </div>
                    """
                    str_content = str_content.replace(str(quote), str_replace)
                elif data_layout == "top-center":
                    str_replace = """
                        <div class='tinybox block-quote' data-type='2' data-content='""" + q_content + """' data-link='""" + link + """' data-name='""" + name + """' data-author-image='""" + avatar + """'>
                            <div class='icon-quote'></div>
                            <div class='quote-content'>""" + q_content + """</div>
                            <div class='quote-author'>
                                """ + str_avatar + """
                                <span class='q-name'>""" + name + """</span>
                                <span class='q-link'>
                                    <a href='""" + link + """' target='_blank'>""" + link + """</a>
                                </span>
                            </div>
                        </div>
                    """
                    str_content = str_content.replace(str(quote), str_replace)
                elif data_layout == "middle-left":
                    str_replace = """
                        <div class='tinybox block-quote' data-type='3' data-content='""" + q_content + """' data-link='""" + link + """' data-name='""" + name + """' data-author-image='""" + avatar + """'>
                            <div class='quote-author'>
                                """ + str_avatar + """
                                <span class='q-name'>""" + name + """</span>
                            </div>
                            <div class='quote-content'>""" + q_content + """</div>
                            <span class='q-link'>
                                <a href='""" + link + """' target='_blank'>""" + link + """</a>
                            </span>
                        </div>
                    """
                    str_content = str_content.replace(str(quote), str_replace)
      
    list_toc = content.find_all("div", {"class":"VCSortableInPreviewMode","type":"toc"})
    for toc in list_toc:
        list_class = toc.get("class")
        is_alignRight = False
        is_alignLeft = False
        is_h2 = False
        is_h3 = False
        is_h4 = False
        is_h5 = False
        if isinstance(list_class, list) and len(list_class) > 0:
            if "alignRight" in list_class:
                is_alignRight = True
            if "alignLeft" in list_class:
                is_alignLeft = True
        data_heading_select = toc.get("data-heading-select")
        if "h2" in data_heading_select:
            is_h2 = True
        if "h3" in data_heading_select:
            is_h3 = True
        if "h4" in data_heading_select:
            is_h4 = True
        if "h5" in data_heading_select:
            is_h5 = True
        
        inner_html_of_toc = ""
        toc_title = toc.find("div", {"class":"toc-title"})
        inner_html_of_toc += str(toc_title)
        inner_html_of_toc += "<ul>"
        list_li = toc.find_all("li", {"class":"toc-level"})
        for item_li in list_li:
            if item_li.text != "":
                inner_html_of_toc += str(item_li)
        inner_html_of_toc += "</ul>"
        
        str_class = "tinybox block-toc"
        if is_alignRight == True:
            str_class = str_class + " alignRight"
        elif is_alignLeft == True:
            str_class = str_class + " alignLeft"
        data_toc_level = ""
        if is_h2 == True:
            data_toc_level += "toc-level-0 "
        if is_h3 == True:
            data_toc_level += "toc-level-1 "
        if is_h4 == True:
            data_toc_level += "toc-level-2 "
        if is_h5 == True:
            data_toc_level += "toc-level-3 "
        data_toc_level = data_toc_level.strip()
        data_toc_level = data_toc_level.replace(" ", ",")
        str_replace = """
            <div class='""" + str_class + """' data-toc-level='""" + data_toc_level + """'><div class="toc-content">""" + inner_html_of_toc + """</div></div>
        """
        str_content = str_content.replace(str(toc), str_replace)
    
    list_h1 = content.find_all('h1')
    for item_h in list_h1:
        if item_h.has_attr('id') == False and item_h.has_attr('class') == False:
            inner_html_of_h = "".join([str(x) for x in item_h.contents])
            str_replace = """
                <h1 class='heading-skds'>""" + inner_html_of_h + """</h1>
            """
            str_content = str_content.replace(str(item_h), str_replace)
    
    list_h2 = content.find_all('h2')
    for item_h in list_h2:
        inner_html_of_h = "".join([str(x) for x in item_h.contents])
        if item_h.has_attr('id'):
            id_h = item_h.get("id")
            str_replace = """
                <div id='""" + id_h + """' class='table-of-contents toc-level-0'>""" + inner_html_of_h + """</div>
            """
            str_content = str_content.replace(str(item_h), str_replace)
        elif item_h.has_attr('class') == False:
            str_replace = """
                <h2 class='heading-skds'>""" + inner_html_of_h + """</h2>
            """
            str_content = str_content.replace(str(item_h), str_replace)
        
    list_h3 = content.find_all('h3')
    for item_h in list_h3:
        inner_html_of_h = "".join([str(x) for x in item_h.contents])
        if item_h.has_attr('id'):
            id_h = item_h.get("id")
            str_replace = """
                <div id='""" + id_h + """' class='table-of-contents toc-level-1'>""" + inner_html_of_h + """</div>
            """
            str_content = str_content.replace(str(item_h), str_replace)
        elif item_h.has_attr('class') == False:
            str_replace = """
                <h3 class='heading-skds'>""" + inner_html_of_h + """</h3>
            """
            str_content = str_content.replace(str(item_h), str_replace)
        
    list_h4 = content.find_all('h4')
    for item_h in list_h4:
        inner_html_of_h = "".join([str(x) for x in item_h.contents])
        if item_h.has_attr('id'):
            id_h = item_h.get("id")
            str_replace = """
                <div id='""" + id_h + """' class='table-of-contents toc-level-2'>""" + inner_html_of_h + """</div>
            """
            str_content = str_content.replace(str(item_h), str_replace)
        elif item_h.has_attr('class') == False:
            str_replace = """
                <h4 class='heading-skds'>""" + inner_html_of_h + """</h4>
            """
            str_content = str_content.replace(str(item_h), str_replace)
        
    list_h5 = content.find_all('h5')
    for item_h in list_h5:
        inner_html_of_h = "".join([str(x) for x in item_h.contents])
        if item_h.has_attr('id'):
            id_h = item_h.get("id")
            str_replace = """
                <div id='""" + id_h + """' class='table-of-contents toc-level-3'>""" + inner_html_of_h + """</div>
            """
            str_content = str_content.replace(str(item_h), str_replace)
        elif item_h.has_attr('class') == False:
            str_replace = """
                <h5 class='heading-skds'>""" + inner_html_of_h + """</h5>
            """
            str_content = str_content.replace(str(item_h), str_replace)
    
    list_h6 = content.find_all('h6')
    for item_h in list_h6:
        if item_h.has_attr('id') == False and item_h.has_attr('class') == False:
            inner_html_of_h = "".join([str(x) for x in item_h.contents])
            str_replace = """
                <h6 class='heading-skds'>""" + inner_html_of_h + """</h6>
            """
            str_content = str_content.replace(str(item_h), str_replace)
        
    data_news['content'] = str_content
    return json({"error_code": "OK", "error_message": "Successful", "data_news": data_news}, status=200)