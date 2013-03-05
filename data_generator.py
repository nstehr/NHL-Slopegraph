#Nathan Stehr
#Utility script that parses weekly standings from http://www.shrpsports.com/nhl/ into move javascript 
#friendly JSON
#February 27, 2013

import urllib2
import json
import time
import datetime
from BeautifulSoup import BeautifulSoup


def main():
    #first sunday of the season
    startDate = datetime.date(2013,1,20)
    currentDate = datetime.datetime.now().date()
    date = startDate

    weeks = []
    while(date <= currentDate):
        print "Retrieving standings for: {0} {1} {2}".format(date.strftime('%b'),date.day,date.year)
        week = {}
        week = buildStandingsJson(buildPageForDate(date))
        week['date'] = date.strftime('%B %d')
        weeks.append(week)
        date = date + datetime.timedelta(weeks=1)
        time.sleep(2)
    
    f = open('data.json','w')
    f.write(json.dumps(weeks))
    f.close()

def buildPageForDate(date):
    url = 'http://www.shrpsports.com/nhl/stand.php?link=Y&season={0}&divcnf=cnf&month={1}&date={2}'.format(date.year,date.strftime('%b'),date.day)
    page = urllib2.urlopen(url)
    return page

def buildStandingsJson(page):
	soup = BeautifulSoup(page)
	standingsTable = soup.findAll("tr",{"class":"standfont1"})
	easternConference = standingsTable[0:15]
	westernConference = standingsTable[15:30]

	returnMap = {}

	returnMap['easternConference'] = getStandings(easternConference)
	returnMap['westernConference'] = getStandings(westernConference)
	
	return returnMap
	
def getStandings(conference):
    standings = []
    for row in conference:
        columns = row.findAll('td')
        team = columns[0].contents[1].contents[0]
        points = columns[2].contents[0]
        standing = {'team':str(team),'points':int(points)}
        standings.append(standing)	
    return standings
		
if __name__ == "__main__":
	main()