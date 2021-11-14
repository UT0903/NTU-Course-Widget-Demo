#!/usr/bin/env python3
# setup: pip3 install -U tqdm beautifulsoup4

import requests
import json
import logging
import sys
from random import randint
from getpass import getpass
from bs4 import BeautifulSoup
from tqdm import tqdm


logging.basicConfig(format='%(levelname)s:%(message)s', level=logging.INFO)
sess = requests.session()

def url_is_video_page(url):
    r = sess.get(url)
    return r.text.find('/api/v0/videos') != -1


def login():
    logging.info(f'[login] try to log in to NTU COOL ...')
    page = sess.get('https://cool.ntu.edu.tw/login/saml').text
    
    soup = BeautifulSoup( page[page.find('<form'):page.find('</form>')+7], 'html.parser' )
    payload = {}
    for data in soup.find_all('input'):
        if 'UsernameTextBox' in data.get('name'):
            payload[data.get('name')] = input('Username: ').strip()
        elif 'PasswordTextBox' in data.get('name'):
            payload[data.get('name')] = getpass('Password: ')
        else:
            payload[data.get('name')] = data.get('value')

    url = 'https://adfs.ntu.edu.tw' + soup.form.get('action')
    soup = BeautifulSoup( sess.post(url, data=payload).text, 'html.parser' )
    payload = {'SAMLResponse': soup.input .get('value')}
    url = 'https://cool.ntu.edu.tw/login/saml'
    sess.post(url, data=payload)
    logging.info('[login] finished logging in')
    
    soup = BeautifulSoup(sess.get('https://cool.ntu.edu.tw/courses').text, 'html.parser')
    hrefs = soup.select('#my_courses_table .course-list-table-row > td > a')
    hrefs = list(map(lambda x: x['href'].split('/')[-1], hrefs))
    for href in hrefs:
        assign = sess.get('https://cool.ntu.edu.tw/api/v1/courses/{}/assignment_groups?exclude_response_fields%5B%5D=description&exclude_response_fields%5B%5D=rubric&include%5B%5D=assignments&include%5B%5D=discussion_topic&override_assignment_dates=false&per_page=50'.format(href)).text
        assign = json.loads(assign.split(';')[-1])
        assign = assign[0]
        for key, val in assign.items():
            print(key, val)
        print()
        sys.exit(0)


def get_video_info(course_id, video_id):
    while True:
        try:
            ret = json.loads(sess.get(f'https://lti.dlc.ntu.edu.tw/api/v1/courses/{course_id}/videos/{video_id}').text)
        except json.decoder.JSONDecodeError:
            logging.error(f'[get_video_info] json decode error, retrying ...')
            continue
        break
    return ret


def watch(course_id, url):
    logging.info(f'[watch] watching {url}')

    page = sess.get(url)
    soup = BeautifulSoup( page.text, 'html.parser' )
    video_id = soup.form['action'].split('/')[-2]
    payload = { data.get('name') : data.get('value') for data in soup.find_all('input') }

    iframe = sess.post(soup.form['action'], data=payload)
    soup = BeautifulSoup( iframe.text, 'html.parser' )
    csrf_token = soup.find('meta', attrs={'name': 'csrf-token'})['content']

    video_info = get_video_info(course_id, video_id)
    video_length = video_info['video']['meta']['duration']

    # add some randomness to make the viewing records more realistic
    records = [(0, video_length)]
    records.append( (lambda x, y: (min(x, y), max(x, y)))(randint(0, video_length), randint(0, video_length)) )
    if randint(0, 1) == 0: records.append((0, randint(0, video_length//3)))
    if randint(0, 1) == 0: records.append((randint(video_length*2//3, video_length), video_length))
    if randint(0, 2) == 0:
        times = randint(5, 10)
        start = randint(0, video_length//2)
        for t in range(start, start + times*6, 6):
            records.append((t, t+1))

    for record in tqdm(records, desc=f'video_id: {video_id}'):
        headers = {'Content-Type': 'application/json;charset=UTF-8', 'X-CSRF-TOKEN': csrf_token}
        data = json.dumps({'playback_rate': 1, 'start': record[0],'end': record[1], 'video_id': video_id})
        r = sess.post(f'https://lti.dlc.ntu.edu.tw/api/v1/courses/{course_id}/video_viewing_records', data=data, headers=headers)
        tqdm.write(f'response: {r.text}')


def watch_all(course_id):
    url_candidates = []

    soup = BeautifulSoup( sess.get(f'https://cool.ntu.edu.tw/courses/{course_id}/modules').text, 'html.parser' )
    for aaa in soup.findAll('a', attrs={'class': 'item_link'}):
        if aaa.parent.parent.parent.parent.span['title'] == 'External Tool':
            url_candidates.append(f'https://cool.ntu.edu.tw' + aaa.attrs['href'])

    for url in tqdm(url_candidates, desc=f'course_id: {course_id}'):
        if url_is_video_page(url):
            watch(course_id, url)


def main():
    if len(sys.argv) <= 1:
        print((f'usage:\n'
               f'    python3 {__file__} course_id [course_id ...]\n'
               f'example:\n'
               f'    python3 {__file__} 1013\n'
               f'    python3 {__file__} 1013 1804\n'
               f'    python3 {__file__} 1013 1804 1893'), file=sys.stderr)
        exit(1)
    try:
        course_ids = [ int(c) for c in sys.argv[1:] ]
    except ValueError as e:
        print(f'Bad course_id: {str(e)}')
        exit(1)

    print(('WARNING:\n'
           '    During the execution of this script, please DO NOT use NTU COOL by any other means; otherwise, the auto-watching may fail by chance.\n'
           '    If you do not know what it means, just close your NTU COOL tab in your browser if any.\n'
           '    （我的英文有那麼爛嗎？）\n'
           '\n'
           '    Please ONLY run the script ONCE. This script will randomly re-watch the video to make the viewing records real.\n'
           '    It is at your own risk to be caught by the lecturer.\n'
           '\n'
           '    If you think this script will steal your password, then just review the code by yourself.\n'
           '    An eligible NTU CSIE student should be able to understand this really simple Python script.\n'
           '    Or you can write a script to watch NTU COOL videos on your own. It\'s up to you.\n'))

    login()
    for course_id in course_ids:
        watch_all(course_id)


if __name__ == '__main__':
    main()
