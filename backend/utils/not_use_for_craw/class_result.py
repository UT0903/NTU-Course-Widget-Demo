# !/usr/bin/python
# -*-coding:utf-8 -*-
from tqdm import tqdm
from webdriver_manager.chrome import ChromeDriverManager
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select
from bs4 import BeautifulSoup
import re, sys
import time
from joblib import Parallel, parallel_backend, delayed
def craw(file='output.txt'):
	options = Options()
	options.add_argument("--disable-notifications")
	options.add_argument("--headless")
	options.add_argument("--window-size=1920,1080")
	chrome = webdriver.Chrome(ChromeDriverManager().install(), options=options)
	chrome.get('http://140.112.161.154/regquery/index.aspx')
	
	for i in tqdm(range(100000)):
		select = Select(chrome.find_element_by_name('ctl00$MainContent$ddpKind'))
		select.select_by_value("4")
		query = chrome.find_element_by_name('ctl00$MainContent$txtKeyWord')
		query.clear()
		query.send_keys("{0:05d}".format(i))
		button = chrome.find_element_by_name('ctl00$MainContent$btnQuery')
		button.click()
		soup = BeautifulSoup(chrome.page_source, 'html.parser')
		table_tag = soup.find_all("table", id='MainContent_GridView1')
		if len(table_tag) == 1:
			tds = table_tag[0].find_all("td")
			class_info = []
			for td in tds:
				class_info.append(td.string.strip())
			with open(file, 'a+') as f:
				print(";".join(class_info), file=f)
		elif len(table_tag) > 1:
			print('too many table:', i)
	chrome.close()
	return 0

craw()
