const {groupBy} = require("lodash");

const config = require('./creds');
const {username, password} = require('./basic-creds');
/**
 {
  "username": "...",
  "password": "..."
}
 */
const request = require('request');
const moment = require('moment');

moment.locale('en');
const lastTime = 'Ostatnio';
const baseUrl = 'https://api.bitbucket.org/2.0';
async function run() {
    const today = moment();
    let previousDate;
    if (today.weekday() === 0) {
        console.log('Its monday. Getting PR from last friday');
        previousDate = today.subtract(3, 'days').startOf('day');
    } else {
        previousDate = moment(new Date()).subtract(1, 'days').startOf('day');
    }
    const previousDateString = previousDate.toISOString();
    console.log('Previous day:', previousDateString);
    const encodedQuery = encodeURIComponent(`(state="MERGED" OR state="OPEN") AND updated_on > ${previousDateString}`);
    console.log({encodedQuery});
    const url = `${baseUrl}/pullrequests/${username}?q=${encodedQuery}`;
    console.log({url});
    request(url, {
        method: 'GET',
        headers: {
            Authorization: "Basic " + new Buffer(username + ":" + password).toString("base64")
        }
    }, function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        const jsonBody = JSON.parse(body);
        //console.dir(jsonBody); // Print the HTML for the Google homepage.
        //console.log('Result');
        let result = `\n${lastTime}:\n`;
        Object.entries(groupBy(jsonBody.values, 'destination.repository.name')).forEach(([name, prs]) => {
            result += `**[${name}]**\n`;
            result += prs.map(pr => `\t-${pr.title}`).join('\n');
        });
        console.log(result);
    });
};

run();