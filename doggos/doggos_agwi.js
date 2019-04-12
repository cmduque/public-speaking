let _ = require('lodash');
let parser = require('rss-parser');
let request = require('request');

exports.handler = function(event, context, callback) {

    let rating = event.queryStringParameters.rating;
    let outOf = event.queryStringParameters.outOf;

    if (rating < 10) {
        sendResponse(context, 200, '{ "error": "What are you asking for—some kind of... bad? dog? No such thing" }' );
        return;
    }

    request('https://queryfeed.net/twitter?q='+rating+'%2F'+outOf+
            '+from%3Adog_rates&title-type=user-name-both&geocode=',
        function(error, response, body) {
            if (error) {
                console.log("Error fetching Queryfeed:" + error);
                sendResponse(context, 200, '{ "error": "Error fetching Queryfeed" }' );
                return;
            }
            parser.parseString(body, function(err, goodies) {
                if (err) {
                    console.log("Error parsing feed RSS:" + error);
                    sendResponse(context, 200, '{ "error": "Error parsing feed RSS" }' );
                    return;
                }
                let doggoTweets = goodies.feed.entries;
                if (doggoTweets.length == 0) {
                    sendResponse(context, 200, '{ "error" : "No doggos found at that level of goodness." }' );
                    return;
                }
                let index = Math.floor(Math.random() * doggoTweets.length);
                //sendResponse(context, 200,  '{ "tweet" : "' + _.sample(doggoTweets).link + '"}' );
                sendResponse(context, 200,  '{ "tweet" : "' + doggoTweets[index].link + '"}' );
                return;
            });
        });

}

function sendResponse(context, statusCode, body) {
  let response = {
    'isBase64Encoded': 0,
    'statusCode': statusCode,
    'headers': {  
       "Access-Control-Allow-Origin":"*",
       "Access-Control-Allow-Methods":"DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
       "Access-Control-Allow-Headers":"Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
       "Content-Type":"application/json"
    },
    'body': body
  }
  console.log(`Lambda exits.  Response sent with status code ${statusCode}`)
  context.succeed(response)
}
