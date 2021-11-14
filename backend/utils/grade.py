from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import requests
import json

class MyError(Exception):
    pass
def login(acc, pwd, sess):
    sess.get('https://if163.aca.ntu.edu.tw/eportfolio/login.asp')
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
    sess.post('https://web2.cc.ntu.edu.tw/p/s/login2/p1.php',
                    data=params, headers=headers)
    
    ret = sess.post(
        'https://if163.aca.ntu.edu.tw/eportfolio/login.php', data={'reg_no':acc})
    ret.encoding = 'big5'
    if "登入失敗，可能原因如下" in ret.text or "拒絕存取" in ret.text or "無法指出的錯誤" in ret.text:
       raise MyError('login')
def craw(sess):
    ret = sess.get("https://if163.aca.ntu.edu.tw/eportfolio/student/CourseSem.asp")
    ret.encoding = 'big5'
    soup = BeautifulSoup(ret.text, 'html.parser')
    tables = soup.select('center table')
    info = []
    for table in tables:
        rows = table.findAll("tr")
        keys = []
        for key in rows[0].findAll(["td", "th"]):
            keys.append(key.get_text().strip())
        for row in rows[1:]:
            csv_row = {}
            for idx, cell in enumerate(row.findAll(["td", "th"])):
                if cell.get_text().strip() != '':
                    csv_row[keys[idx]] = cell.get_text().strip()
            info.append(csv_row)
    return info
def get_nessary_data(datas, acc, pwd):
    res = []
    with open('log/syslog.txt', 'a+') as f:
        for data in datas:
            val = {}
            key = {}
            origin = data
            try:
                data['學年/學期'] = str(int(data['學年/學期']))
                key['semester'] = data['學年/學期'][:-1] + "-" + data['學年/學期'][-1]
                key['class_id'] = data['課程識別碼'].replace(" ", "")
                if '班次' in data:
                    key['class_num'] = data['班次']
                val['class_name'] = data['課程名稱']
                val['grade'] = data['成績'].replace(" ", "")
                val['lower_grade'] = data['比您成績低的比例'].replace("%", "")
                val['same_grade'] = data['與您相同成績的比例'].replace("%", "")
                val['higher_grade'] = data['比您成績高的比例'].replace("%", "")
                res.append({"key":key, "val":val, "origin":origin})
            except Exception as e:
               from datetime import datetime
               print("grade.py obj: {}, acc: {}, pwd: {} exception: {}, time:{}".format(data, acc, pwd, str(e), datetime.now().strftime("%d/%m/%Y %H:%M:%S")), file=f)
    return res

def Epo(acc, pwd):
    try:
        sess = requests.session()
        login(acc, pwd, sess)
        return {'status':'success', 'msg':get_nessary_data(craw(sess), acc, pwd)}
    except Exception as e:
       return {'status':'failed', 'msg':str(e)}
if __name__ == '__main__': 
    argv = input().split()
    print(json.dumps(Epo(argv[0], argv[1]), ensure_ascii=False))