
//L'application requiert l'utilisation du module Express.
//La variable express nous permettra d'utiliser les fonctionnalités du module Express.
var express = require('express');
// Nous définissons ici les paramètres du serveur.
var hostname = 'localhost';
var port = 3000;



// Nous créons un objet de type Express.
var app = express();

//Afin de faciliter le routage (les URL que nous souhaitons prendre en charge dans notre API), nous créons un objet Router.
//C'est à partir de cet objet myRouter, que nous allons implémenter les méthodes.
var myRouter = express.Router();


 bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

myRouter.route('/')
// all permet de prendre en charge toutes les méthodes.
.all(function(req,res){
      res.json({message : "Bienvenue sur notre Frugal API ", methode : req.method});
});
myRouter.route('/soiree/:pseudo')
.get(function(req,res){
    var pseudo = req.params.pseudo;

    const fs = require('fs');
    const readline = require('readline');
    const {google} = require('googleapis');

    // If modifying these scopes, delete token.json.
    const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
    const TOKEN_PATH = 'token.json';

    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Sheets API.
      authorize(JSON.parse(content), listMajors);
    });

    /**
    * Create an OAuth2 client with the given credentials, and then execute the
    * given callback function.
    * @param {Object} credentials The authorization client credentials.
    * @param {function} callback The callback to call with the authorized client.
    */
    function authorize(credentials, callback) {
      const {client_secret, client_id, redirect_uris} = credentials.installed;
      const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
          if (err) return getNewToken(oAuth2Client, callback);
          oAuth2Client.setCredentials(JSON.parse(token));
          callback(oAuth2Client);
        });
      }

      /**
      * Get and store new token after prompting for user authorization, and then
      * execute the given callback with the authorized OAuth2 client.
      * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
      * @param {getEventsCallback} callback The callback for the authorized client.
      */
      function getNewToken(oAuth2Client, callback) {
        const authUrl = oAuth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
          rl.close();
          oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
              if (err) console.error(err);
              console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
          });
        });
      }

      function launch(row, succ, spreadsheetId, sheets, pseudo){
        //console.log(row);
        //console.log(spreadsheetId);
      //  console.log(sheets);
        const myRange = {
          sheetId: 882461340,
          startRowIndex: succ-1,
          endRowIndex: succ,
          startColumnIndex: 3,
          endColumnIndex: 4,
        };
        const requests = [{
          addConditionalFormatRule: {
            rule: {
              ranges: myRange,
              booleanRule: {
                condition: {
                  type: 'CUSTOM_FORMULA',
                  values: [{userEnteredValue: '=EXACT("'+row+'";'+pseudo}],
                },
                format: {
                  backgroundColor: {red: 0.1, green: 0.8., blue: 0.1},
                },
              },
            },
            index: 0,
          },
        }];
        const resource = {
          requests,
        };
        sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          resource,
        }, (err, response) => {
          if (err) {
            // Handle error.
            console.log(err);
          } else {
            console.log(`${response} cells updated.`);
          }
        });
      }

      /**
      * Prints the names and majors of students in a sample spreadsheet:
      * @see https://docs.google.com/spreadsheets/d/1AAG1IbMNjOb5L1bwuyvTF2klWuQw0VkDvFYqDE7RB94/edit#gid=70429597
      * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
      */
      function listMajors(auth, pseudo) {
        const sheets = google.sheets({version: 'v4', auth});
        var succ = 0;
        var spreadsheetId= '1AAG1IbMNjOb5L1bwuyvTF2klWuQw0VkDvFYqDE7RB94';
        sheets.spreadsheets.values.get({
          spreadsheetId: '1AAG1IbMNjOb5L1bwuyvTF2klWuQw0VkDvFYqDE7RB94',
          range: 'Awards onoff!D3:D60',
        }, (err, res) => {
          if (err) return console.log('The API returned an error: ' + err);
          const rows = res.data.values;
          if (rows.length) {
            // Print columns A and E, which correspond to indices 0 and 4.
            var i = 3;
            rows.map((row) => {

              console.log(`${row[0]}`);
              if(`${row[0]}` == pseudo){
                console.log("yes");
                console.log(i);

                succ = i;
                launch(row[0], succ, spreadsheetId, sheets, pseudo);
                console.log("ttt");
            }
          i++;
        });


          } else {
            console.log('No data found.');
          }
        });
      }
      res.json({message : "Bien envoye"});
})



// Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);

// Démarrer le serveur
app.listen(port, hostname, function(){
	console.log("Mon serveur fonctionne sur http://"+ hostname +":"+port);
});
