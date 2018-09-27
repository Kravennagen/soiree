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

  function launch(row, succ, spreadsheetId, sheets){
    //console.log(row);
    //console.log(spreadsheetId);
  //  console.log(sheets);
    const myRange = {
      sheetId: 70429597,
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
              values: [{userEnteredValue: '=EXACT("'+row+'";"2-over")'}],
            },
            format: {
              backgroundColor: {red: 0.1, green: 0.1, blue: 0.8},
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
  function listMajors(auth) {
    const sheets = google.sheets({version: 'v4', auth});
    var succ = 0;
    var spreadsheetId= '1AAG1IbMNjOb5L1bwuyvTF2klWuQw0VkDvFYqDE7RB94';
    sheets.spreadsheets.values.get({
      spreadsheetId: '1AAG1IbMNjOb5L1bwuyvTF2klWuQw0VkDvFYqDE7RB94',
      range: 'Tiki bar!D3:D60',
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const rows = res.data.values;
      if (rows.length) {
        // Print columns A and E, which correspond to indices 0 and 4.
        var i = 3;
        rows.map((row) => {

          console.log(`${row[0]}`);
          if(`${row[0]}` == "2-over"){
            console.log("yes");
            console.log(i);

            succ = i;
            launch(row[0], succ, spreadsheetId, sheets);
            console.log("ttt");
        }
      i++;
    });


      } else {
        console.log('No data found.');
      }
    });
  }
