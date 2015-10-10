import BeautifulSoup
from splinter import Browser
import time
import re
import json

def getGniCodes():
	f = open("capita_codes.json", "w")
	browser = Browser()
	url = r'https://www.quandl.com/data/UN?keyword=per%20capita%20gni'
	browser.visit(url)
	finalListOfCodes = []
	finalDictionary = {}
	for i in range(0, 13):
		time.sleep(5)
		capita_codes = browser.find_by_css('.ember-view')
		for code in capita_codes:
			if re.match(r'^UN/NA', code.value):
				finalListOfCodes.append(code.value)
		browser.click_link_by_partial_text('Next')
		time.sleep(5)
	finalDictionary['codes'] = finalListOfCodes
	f.write(json.dumps(finalDictionary))

getGniCodes()

