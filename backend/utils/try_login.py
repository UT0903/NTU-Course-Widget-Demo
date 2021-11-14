from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import requests
import json

class MyError(Exception):
    pass
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
def try_login(acc, pwd):
    with open('log/syslog.txt', 'a+') as f:
        try:
            sess = requests.session()
            login(acc, pwd, sess)
            print('ok')
        except Exception as e:
            with open('log/syslog.txt', 'a+') as f:
                from datetime import datetime
                print("try_login.py acc: {}, pwd:{}, exception: {}, time: {}".format(acc, pwd, str(e), datetime.now().strftime("%d/%m/%Y %H:%M:%S")), file=f)
            import sys
            sys.exit(1)
if __name__ == '__main__':
    para = input().split()
    try_login(para[0], para[1])
