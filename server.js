
const Alexa = require('ask-sdk');


var request = require('request'), 
fs      = require('fs'),
url     = 'https://317e452e.ngrok.io/check_parking';
  //import packages
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
const PORT = process.env.PORT || 5555;


const vision = require('@google-cloud/vision');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
      return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput, num_cars) {

    var response_text;
    if ( num_cars < 8 ) {
      response_text = "Yes, there is parking!";
    } else  {
      response_text = "No, parking is full!";
    }
    return handlerInput.responseBuilder
    .speak(response_text)
    .withSimpleCard(
      "This is the Title of the Card", 
      "This is the card content. This card just has plain text content.\r\nThe content is formated with line breaks to improve readability.")
    .getResponse();
  }
};

async function handle_alexa(request, response) {
  const fileName = `./img.png`;
  const client = new vision.ImageAnnotatorClient();
  
  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  
  const req = {
    image: {content: fs.readFileSync(fileName)},
  };
  
  const [result] = await client.objectLocalization(req);
  const objects = result.localizedObjectAnnotations;

  let num_cars = 0
  objects.forEach(object => {
    console.log(`Name: ${object.name}`);
    console.log(`Confidence: ${object.score}`);
    if ( object.name == 'Packaged goods'){
      num_cars += 1;
    }
    const vertices = object.boundingPoly.normalizedVertices;
    vertices.forEach(v => console.log(`x: ${v.x}, y:${v.y}`));
  });
  

  if ( LaunchRequestHandler.canHandle(request) ) {
    final_response = LaunchRequestHandler.handle(request, num_cars);
    response.send(final_response);
  }

}
// Creates a client
async function quickstart(response) {
    const fileName = `./img.png`;
    const client = new vision.ImageAnnotatorClient();
    
    /**
     * TODO(developer): Uncomment the following line before running the sample.
     */
    
    const req = {
      image: {content: fs.readFileSync(fileName)},
    };
    
    const [result] = await client.objectLocalization(req);
    console.log(result);
    const objects = result.localizedObjectAnnotations;

    if(objects.length < 8)
    {
      response.send(' Yes there is parking!')
      console.log('Yes, there is parking!')
    }
    else{
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
  return new Promise((resolve, reject) => {
    request.head(uri, function(err, res, body){
      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);
  
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
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

app.get('/alexa-parking', (req, res)  => {

  download(url, 'img.png')
  .then(() => {
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