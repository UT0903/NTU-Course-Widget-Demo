# !/usr/bin/python
# -*-coding:utf-8 -*-
from tqdm import tqdm
from webdriver_manager import chrome
from webdriver_manager.chrome import ChromeDriverManager
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select
from bs4 import BeautifulSoup
import re, sys
import time
from joblib import Parallel, parallel_backend, delayed
def craw(file='craw_files/nol.txt'):
    def get_head(chrome, cur_sem, f):
        chrome.get('https://nol.ntu.edu.tw/nol/coursesearch/search_result.php?alltime=yes&allproced=yes&cstype=1&csname=&current_sem={}&op=stu&startrec=0&week1=&week2=&week3=&week4=&week5=&week6=&proced0=&proced1=&proced2=&proced3=&proced4=&procedE=&proced5=&proced6=&proced7=&proced8=&proced9=&procedA=&procedB=&procedC=&procedD=&allsel=yes&selCode1=&selCode2=&selCode3=&page_cnt=1'.format(cur_sem))
        soup = BeautifulSoup(chrome.page_source, 'html.parser')
        tables = soup.select('table > tbody')
        for tr in tables[6].find_all('tr'):
            header = []
            for td in tr.find_all('td'):
                header.append(td.getText().strip())
            print(";".join(header), file=f)
            return
    def get_body(chrome, cur_sem, f, total_cnt, per_page):
        for start_rec in range(0, total_cnt, per_page):
            print('now index:', start_rec)
            chrome.get('https://nol.ntu.edu.tw/nol/coursesearch/search_result.php?alltime=yes&allproced=yes&cstype=1&csname=&current_sem={}&op=stu&startrec={}&week1=&week2=&week3=&week4=&week5=&week6=&proced0=&proced1=&proced2=&proced3=&proced4=&procedE=&proced5=&proced6=&proced7=&proced8=&proced9=&procedA=&procedB=&procedC=&procedD=&allsel=yes&selCode1=&selCode2=&selCode3=&page_cnt={}'.format(cur_sem, start_rec, per_page))
            soup = BeautifulSoup(chrome.page_source, 'html.parser')
            #print(soup)
            tables = soup.select('table > tbody')
            if len(tables[6].find_all('tr')) <= 1:
                return
            for idx, tr in enumerate(tables[6].find_all('tr')):
                if idx == 0:
                    continue
                td_a = []
                for td in tr.find_all('td'):
                    td_a.append(td.getText().strip().replace("\n", " "))
                print(";".join(td_a), file=f)
    options = Options()
    options.add_argument("--disable-notifications")
    options.add_argument("--headless")
    options.add_argument("--window-size=1920,1080")
    chrome = webdriver.Chrome(ChromeDriverManager().install(), options=options)
    total_cnt = 50000
    per_page = 5000
    for cur_sem in ['109-2', '109-1', '108-2', '108-1', '107-2', '107-1', '106-2', '106-1', '105-2', '105-1']:
        print('now sem:', cur_sem)
        with open("craw_files/{}{}".format(cur_sem, file), "w+") as f:
            get_head(chrome, cur_sem, f)
            get_body(chrome, cur_sem, f, total_cnt, per_page)
    chrome.close()
craw()
