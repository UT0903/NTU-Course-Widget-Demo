from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import requests
import json

class MyError(Exception):
    pass
def parse_date(obj):
    if obj['due'] == None:
        obj.pop('due')
    else:
        obj['due'] = datetime.strptime(obj['due'], "%Y-%m-%dT%H:%M:%SZ") + timedelta(hours=8)
        obj['due'] = obj['due'].strftime("%Y:%m:%d:%H:%M:%S")
    return obj

def login(acc, pwd, sess):
    page = sess.get('https://cool.ntu.edu.tw/login/saml').text
    soup = BeautifulSoup(
        page[page.find('<form'):page.find('</form>')+7], 'html.parser')
    payload = {}
    for data in soup.find_all('input'):
        if 'UsernameTextBox' in data.get('name'):
            payload[data.get('name')] = acc
        elif 'PasswordTextBox' in data.get('name'):
            payload[data.get('name')] = pwd
        else:
            payload[data.get('name')] = data.get('value')

    url = 'https://adfs.ntu.edu.tw' + soup.form.get('action')
    soup = BeautifulSoup(sess.post(url, data=payload).text, 'html.parser')
    payload = {'SAMLResponse': soup.input .get('value')}
    url = 'https://cool.ntu.edu.tw/login/saml'
    loginRes = sess.post(url, data=payload)
    if loginRes.status_code != 200:
        raise MyError('login')

def craw(sess):
    ret_obj = []
    text = sess.get('https://cool.ntu.edu.tw/courses').text
    
    soup = BeautifulSoup(text, 'html.parser')
    
    courseIDs = soup.select(
        '#my_courses_table .course-list-table-row > td > a')
    courseIDs = list(
        map(lambda x: [x['href'].split('/')[-1], x['title']], courseIDs))
    for courseID in courseIDs:
        course_name = courseID[1]
        assign_info = sess.get(
            'https://cool.ntu.edu.tw/api/v1/courses/{}/assignment_groups?exclude_response_fields%5B%5D=description&exclude_response_fields%5B%5D=rubric&include%5B%5D=assignments&include%5B%5D=discussion_topic&override_assignment_dates=true'.format(courseID[0])).text
        assign_infos = json.loads(assign_info.split(';')[-1])
        for assign_info in assign_infos:
            for assign in assign_info['assignments']:
                hwName = " ".join(assign['name'].strip().split())
                ret_obj.append(
                    parse_date({'course': course_name.replace("\"", "\'").replace('\b', ' '), 'hw': hwName.replace("\"", "\'").replace('\b', ' '), 'due': assign['due_at'], 'src_from':"cool"}))
    return ret_obj

def Cool(acc, pwd):
    try:
        sess = requests.session()
        login(acc, pwd, sess)
        return {'status':'success', 'msg':craw(sess)}
    except Exception as e:
        with open('log/syslog.txt', 'a+') as f:
            from datetime import datetime
            print("cool.py acc: {}, pwd:{}, exception: {}, time: {}".format(acc, pwd, str(e), datetime.now().strftime("%d/%m/%Y %H:%M:%S")), file=f)
        return {'status':'failed', 'msg':str(e)}

if __name__ == '__main__': 
    import sys, json
    argv = input().split()
    print(json.dumps(Cool(argv[0], argv[1]), ensure_ascii=False))
