
const Alexa = require('ask-sdk-core');

var request = require('request'),
  fs = require('fs'),
  url = 'https://e34c23e8.ngrok.io/check_parking';

var express = require('express');
var cors = require('cors')

var bodyParser = require('body-parser')

const app = express();
const router = express.Router();
const dotenv = require('dotenv').config();
const https = require('https')
const options = {
  hostname: '19cb4e54.ngrok.io',
  //   port: 443,
  path: '/check_parking',
  method: 'GET'
}

// env variables
const PORT = process.env.PORT || 8001;
const num_parking_spaces = 8;

const vision = require('@google-cloud/vision');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    // console.log('alexa baby, whos down for some football ehhn?')
    // console.log(Alexa.getRequestType(handlerInput.requestEnvelope))
    // return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    return true;
  },
  handle(handlerInput, res_text) {
    return new Promise((resolve, reject) => {
      return handlerInput.responseBuilder
        .speak(res_text)
        .getResponse()
    })
  }

};

async function handle_alexa(request, response) {
  // function handle_alexa(request, response) {
  // return new Promise((resolve, reject) => {
  const fileName = `./img.png`;
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */

  const req = {
    image: { content: fs.readFileSync(fileName) },
  };

  console.log('about to await on client.objectLocalization')
  const [result] = await client.objectLocalization(req);
  const objects = result.localizedObjectAnnotations;

  // count number of 'packaged goods'
  let num_cars = 0
  objects.forEach(object => {
    console.log(`Name: ${object.name}`);
    console.log(`Confidence: ${object.score}`);
    if (object.name == 'Packaged goods' || object.name === 'Tin can' || object.name === 'Toy' || object.name === 'Toy Vehicle') {
      num_cars += 1;
    }
    const vertices = object.boundingPoly.normalizedVertices;
    vertices.forEach(v => console.log(`x: ${v.x}, y:${v.y}`));
  });

  console.log('number of cars: ' + num_cars)

  var response_text;
  if (num_cars < num_parking_spaces) {
    response_text = "Yes, there is parking!";
    console.log('Yes, there is parking!')
  } else {
    response_text = "No, parking is full!";
    console.log('No, parking is full!')
  }


  if (LaunchRequestHandler.canHandle(request)) {
    final_response = LaunchRequestHandler.handle(request, response_text);
    response.send(final_response);
  }
  // })
}



// Creates a client
async function quickstart(response) {
  const fileName = `./img.png`;
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */

  const req = {
    image: { content: fs.readFileSync(fileName) },
  };

  const [result] = await client.objectLocalization(req);
  // const [result] = await client.objectLocalization(fileName);
  console.log(result);
  const objects = result.localizedObjectAnnotations;

  if (objects.length < num_parking_spaces) {
    response.send(' Yes there is parking!')
    console.log('Yes, there is parking!')
  }
  else {
    response.send('No, parking is full!')
  }
  objects.forEach(object => {
    console.log(`Name: ${object.name}`);
    console.log(`Confidence: ${object.score}`);
    const vertices = object.boundingPoly.normalizedVertices;
    vertices.forEach(v => console.log(`x: ${v.x}, y:${v.y}`));
  });
}


app.use(bodyParser.json(), cors()) // cross origin resource sharing


var download = (uri, filename, callback) => {
  console.log('downloading file from ' + uri + ' to ' + filename)
  request.head(uri, function (err, res, body) {
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  })

};
// app.get('/parking', (request, response) => {
//     // var image = https.get(options, () => {
//     //     console.log('Status: ' + response.statusCode)
//     //     console.log('Body ' + response.content)
//     // });
//     // request(url).pipe(fs.createWriteStream('downloaded.jpg'));
//     download(url, 'img.png', () => {
//         console.log('done');
//     });
//     quickstart(response);

// })

app.get('/alexa-parking', (req, res) => {
  console.log('get request to ./alexa-parking')
  download(url, 'img.png', () => {
    console.log('image downloaded')
    res.send(handle_alexa(req, res));
  })




})

// start command
exports.start = () => {
  app.listen(PORT, () => {
    console.log('server listening on port: ' + PORT);
  })
}

// stop command
exports.stop = () => {
  app.close(PORT, () => {
    console.log('server shut down on port: ' + PORT);
  })
}