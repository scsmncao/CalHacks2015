import BeautifulSoup
from splinter import Browser
import time
import re
import json

def getGniCodes():
	browser = Browser()
	url = r'https://www.quandl.com/data/UN?keyword=per%20capita%20gni'
	browser.visit(url)
	finalDictionary = {}
	finalDictionary['codes'] = {}
	stringOfCountries = ""
	for i in range(0, 13):
		time.sleep(5)
		capita_codes = browser.find_by_css('.ember-view').first
		country = ""
		databaseCode = ""
		splinterList = capita_codes.value.split("\n")
		for line in splinterList:
			if "Per Capita GNI" in line:
				for i in range(len(line) - 1, -1, -1):
					if line[i] == "-":
						country = " ".join(line[i + 1:].split()[3:])
						stringOfCountries += country + "\n"
			if re.match(r'^CODE: UN/NA', line):
				databaseCode = line.split()[1]
				finalDictionary['codes'][country] = databaseCode
		browser.click_link_by_partial_text('Next')
		time.sleep(5)
	f = open("capita_codes.json", "w")
	c = open("countries.txt", "w")
	f.write(json.dumps(finalDictionary))
	c.write(stringOfCountries.encode("UTF-8"))
	f.close()
	c.close()

getGniCodes()

