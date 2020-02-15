

var request = require('request'), 
fs      = require('fs'),
url     = 'https://19cb4e54.ngrok.io/check_parking';
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


// Creates a client
async function quickstart() {
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
    objects.forEach(object => {
      console.log(`Name: ${object.name}`);
      console.log(`Confidence: ${object.score}`);
      const vertices = object.boundingPoly.normalizedVertices;
      vertices.forEach(v => console.log(`x: ${v.x}, y:${v.y}`));
    });
  }


app.use(bodyParser.json(), cors()) // cross origin resource sharing


// // for now just return 404 to every route
// app.all('*', (request, response) => {
//     console.log('returning 404 to catch-all route')
//     return response.sendStatus(404);
// })
var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);
  
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
  };
app.get('/parking', (request, response) => {
    // var image = https.get(options, () => {
    //     console.log('Status: ' + response.statusCode)
    //     console.log('Body ' + response.content)
    // });
    // request(url).pipe(fs.createWriteStream('downloaded.jpg'));
    download(url, 'img.png', () => {
        console.log('done');
    });
    quickstart();
})

// app.get('/groups=239408123', (req, res) => {




// app.use(require('./error-middleware')); // if we use error middleware

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