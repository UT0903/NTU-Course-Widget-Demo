from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import requests
import json
from bs4 import BeautifulSoup

from requests.packages import urllib3
urllib3.disable_warnings()

class MyError(Exception):
    pass
def parse_date(obj):
    if obj == None or obj['due'] == None:
        obj.pop('due')
    elif obj['due'][-3:] == ' 24':
        obj['due'] = datetime.strptime(obj['due'], "%Y-%m-%d 24")
        obj['due'] += timedelta(days=1)
        obj['due'] = obj['due'].strftime("%Y:%m:%d:%H:%M:%S")
    else:
        obj['due'] = datetime.strptime(obj['due'], "%Y-%m-%d %H")
        obj['due'] = obj['due'].strftime("%Y:%m:%d:%H:%M:%S")
    return obj
def login(acc, pwd, sess):
    sess.post(
        'https://ceiba.ntu.edu.tw/ChkSessLib.php', verify=False).text
    # print(page)
    params = {
        'user': acc,
        'pass': pwd,
        'Submit': '登入'
    }
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'DNT': '1',
        'Origin': 'https://web2.cc.ntu.edu.tw',
        'Referer': 'https://web2.cc.ntu.edu.tw/p/s/login2/p1.php'
    }
    loginRes = sess.post('https://web2.cc.ntu.edu.tw/p/s/login2/p1.php',
              data=params, headers=headers)
    if loginRes.text != '<meta http-equiv="refresh" content="0;https://ceiba.ntu.edu.tw/ChkSessLib.php">':
        raise MyError('login')
def craw(sess):
    ret_obj = []
    ret = sess.get('https://ceiba.ntu.edu.tw/ChkSessLib.php')
    ret.encoding = 'utf-8'
    soup = BeautifulSoup(ret.text, 'html.parser')
    hrefs = soup.select('table tr > td > a')
    hrefs = list(map(lambda x: [x['href'], x.getText()], hrefs))
    hrefs = list(filter(lambda x: 'https://ceiba.ntu.edu.tw/1' in x[0], hrefs))
    for href in hrefs:
        course_name = href[1]
        # print(course_name)
        href = href[0]
        ret = sess.get(href)
        ret = sess.get(
            "https://ceiba.ntu.edu.tw/modules/hw/hw.php?default_lang=chinese")
        ret.encoding = 'utf-8'
        soup = BeautifulSoup(ret.text, 'html.parser')
        trs = soup.select('#sect_cont tr')
        trs = trs[1:]
        for tr in trs:
            tds = tr.select('td')
            hw_name = tds[0].getText()
            due_date = tds[4].getText()
            #print(hw_name, due_date)
            ret_obj.append(
                parse_date({'course': course_name.replace("\"", "\'").replace('\b', ' '), 'hw': hw_name.replace("\"", "\'").replace('\b', ' '), 'due': due_date, 'src_from':"ceiba"}))
    return ret_obj
def Ceiba(acc, pwd):
    try:
        sess = requests.session()
        login(acc, pwd, sess)
        return {'status':'success', 'msg':craw(sess)}
    except Exception as e:
        with open('log/syslog.txt', 'a+') as f:
            from datetime import datetime
            print("ceiba.py acc: {}, pwd:{}, exception: {}, time: {}".format(acc, pwd, str(e), datetime.now().strftime("%d/%m/%Y %H:%M:%S")), file=f)
        return {'status':'failed', 'msg':str(e)}
if __name__ == '__main__': 
    import sys, json
    print(json.dumps(Ceiba(sys.argv[1], sys.argv[2]), ensure_ascii=False))