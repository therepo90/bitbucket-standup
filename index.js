const {groupBy} = require("lodash");

const {username, password} = require('./basic-creds');
/**
 {
  "username": "...",
  "password": "..."
}
 */
const request = require('request');
const moment = require('moment');

moment.locale('pl');
const lastTime = 'Ostatnio';
const nextTime= 'Dziś';
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
            result += `\n**[${name}]**\n`;
            result += prs.map(pr => {
                const icon = pr.state === 'MERGED' ?  '✓' : '◷';
                return `  ${icon}${pr.title}`;
            }).join('\n');
            result+='\n';
        });
        result+= `\n${nextTime}:\n`;
        console.log(result);
    });

    // todo pr status(merged ?)
};

run();
