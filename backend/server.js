const sqlite = require("sqlite3").verbose();
let db = my_database("./backend/media.db");

// ###############################################################################
// The database should be OK by now. Let's setup the Web server so we can start
// defining routes.
//
// First, create an express application `app`:

var express = require("express");
var app = express();

// We need some middleware to parse JSON data in the body of our HTTP requests:
app.use(express.json());

/* Functions */
const axios = require('axios').default;

app.get("/hello", function (req, res) {
    response_body = { Hello: "World" };
  
    // This example returns valid JSON in the response, but does not yet set the
    // associated HTTP response header.  This you should do yourself in your
    // own routes!
    res.json(response_body);
});


// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow any origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});


/* 1. Retrieve the full data set */
app.get("/database", function (req, res) {
  
    // Set headers for response
    res.setHeader('Accept', 'application/json'); // Receiving json data
    res.setHeader('Content-Type', 'application/json'); // Responding json data
  
    /* Canvas template: Retrive all items */
    db.all("SELECT id, item_url, low_price, high_price, status FROM media", function(err, rows) {
  
      // Check if query received an error
      if (err) {
        return res.status(500).json({error : err.message});
      }
  
      // OK, everything is fine
      return res.status(200).json(rows);
    });
});


/* 2. Add data for a new item (Create) */ 
app.post("/database", function (req, res) {
    
  // Set headers for response
  res.setHeader('Accept', 'application/json'); // Receiving json data
  res.setHeader('Content-Type', 'application/json'); // Responding json data

  // Check if Content-Type is application/json
  const contentType = req.get('Content-Type');
  if (!contentType || contentType !== 'application/json') {
    return res.status(400).json({error: 'Invalid Content-Type. Expected application/json.'});
  }

  // Check if the necessary fields are present in the JSON body
  const { item_url, low_price, high_price } = req.body;
  if (!item_url || !low_price || !high_price) {
    return res.status(400).json({error: 'Missing required fields in the JSON body.'});
  }
  
  console.log(req.body)
  const item = req.body;

  /* Canvas template: Insert single item */
  db.run(`INSERT INTO media (item_url, low_price, high_price, status) VALUES (?, ?, ?, ?)`,
          [item['item_url'], item['low_price'], item['high_price'], item['status']], 
          function(err) {

            // Check if query received an error
            if (err) {
              return res.status(500).json({error : err.message});
            }

            // OK, everything is fine
            console.log(`Row ID: ${this.lastID} - Inserted`);
            return res.status(200).send();
          });
});


/* 3. List the data of a specific item (Retrieve) */
app.get("/database/item/:id", function (req, res) {

    // Set headers for response
    res.setHeader('Accept', 'application/json'); // Receiving json data
    res.setHeader('Content-Type', 'application/json'); // Responding json data
  
    const id = req.params.id;
    // Check if ID is a number
    if (isNaN(id)){
        return res.status(400).json({error : 'Invalid ID. Expected a number.'});
    }

    db.all("SELECT item_url, low_price, high_price, status FROM media WHERE id=" + id, function(err, row) {

      // Check if query received an error
      if (err) {
        return res.status(500).json({error : err.message});
      }

      // Check if the ID has any content
      if (row.length == 0) {
        return res.status(404).json({error : 'ID and its content could not be found.'});
      }
      
      // OK, everything is fine
      console.log(`Row ID: ${id} - Retrieved`);
      return res.status(200).json(row);
    });
});


/* 4. Change data of a specific item (Update) */
app.put("/database/item/:id", function(req, res) {

    // Set headers for response
    res.setHeader('Accept', 'application/json'); // Receiving json data
    res.setHeader('Content-Type', 'application/json'); // Responding json data
  
    // Check if Content-Type is application/json
    const contentType = req.get('Content-Type');
    if (!contentType || contentType !== 'application/json') {
      return res.status(400).json({error: 'Invalid Content-Type. Expected application/json.'});
    }
  
    // Check if the necessary fields are present in the JSON body
    const { item_url, low_price, high_price } = req.body;
    if (!item_url || !low_price || !high_price) {
      return res.status(400).json({error: 'Missing required fields in the JSON body.'});
    }
  
    const item = req.body;
  
    const id = req.params.id;
    // Check if ID is a number
    if (isNaN(id)){
      return res.status(400).json({error : 'Invalid ID. Expected a number.'});
    }

    /* Canvas template: Update a single item matching with the ID */
    db.run(`UPDATE media SET item_url=?, low_price=?, high_price=?, status=? WHERE id=?`,
            [item['item_url'], item['low_price'], item['high_price'], item['status'], id], 
            function(err) {

              // Check if query received an error
              if (err) {
                return res.status(500).json({error : err.message});
              }

              // OK, everything is fine
              console.log(`Row ID: ${id} - Updated`);
              return res.status(200).send();
            });
});


/* 5. Remove data of a specific item (Delete) */
app.delete("/database/item/:id", function(req, res) {

    // Set headers for response
    res.setHeader('Accept', 'application/json'); // Receiving json data
    res.setHeader('Content-Type', 'application/json'); // Responding json data
  
    const id = req.params.id;
    // Check if ID is a number
    if (isNaN(id)){
      return res.status(400).json({error : 'Invalid ID. Expected a number.'});
    }

    /* Canvas template: Delete a single item matching with the ID */
    db.run("DELETE FROM media WHERE id=" + id, function(err) {
  
      // Check if query received an error
      if (err) {
        return res.status(500).json({error : err.message}).send();
      }
  
      // OK, everything is fine
      console.log(`Row ID: ${id} - Deleted`);
      return res.status(200).send();
    });
});


/* Retrieve the Warframe Market data for a single item */
app.get("/database/order/:id", function (req, res) {

  // Set headers for response
  res.setHeader('Accept', 'application/json'); // Receiving json data
  res.setHeader('Content-Type', 'application/json'); // Responding json data

  const id = req.params.id;
  // Check if ID is a number
  if (isNaN(id)){
      return res.status(400).json({error : 'Invalid ID. Expected a number.'});
  }

  db.all("SELECT item_url, low_price, high_price, status FROM media WHERE id=" + id, function(err, result) {

    // Check if query received an error
    if (err) {
      return res.status(500).json({error : err.message});
    }

    // Check if the ID has any content
    if (result.length == 0) {
      return res.status(404).json({error : 'ID and its content could not be found.'});
    }
    
    /* Make GET request to Warframe Market */ 
    axios.get(modifyUrl(result[0].item_url))
      .then(function (response) {

        // Get important data
        const data = get_market_data(response);

        // OK, everything is fine
        console.log(`Row ID: ${id} - Retrieved`);
        return res.status(200).json(data);   
      })
      .catch(error => {
        console.error('Error:', error.message);
        return res.status(500).json({error : error.message});
      }); 
  });
});


/* Helper function to modify a normal warframe url to an API url */
function modifyUrl(originalUrl) {
  // Split the original URL by '/'
  let parts = originalUrl.split('/');

  // Extract the item name from the original URL
  let itemName = parts[parts.length - 1];

  // Replace the necessary parts
  parts[2] = 'api.warframe.market';
  parts[3] = 'v1';
  parts[4] = 'items';
  parts[5] = itemName;
  parts[6] = 'orders';

  // Join the modified parts back into a URL
  let modifiedUrl = parts.join('/');

  return modifiedUrl;
}


/* Helper function to get only the important data from warframe market */
function get_market_data(response) {
  
  // Access the response body
  const responseBody = response.data;

  // Check if the response body contains the expected structure
  if (
      responseBody &&
      responseBody.payload &&
      responseBody.payload.orders &&
      Array.isArray(responseBody.payload.orders) &&
      responseBody.payload.orders.length > 0
  ) {
      // Extract "platinum" and "status" values for all orders
      const orderDetails = responseBody.payload.orders.map(order => ({
          platinum: order.platinum,
          status: order.user.status,
          order_type: order.order_type
  }));

  // Convert the data to a JSON string
  // const jsonData = JSON.stringify(orderDetails, null, 2);

  return orderDetails;
  
  } else {
    console.log('Unexpected response body structure.');
  }
}


app.listen(3000);
console.log(
  "Your Web server should be up and running, waiting for requests to come in. Try http://localhost:3000/hello"
);

function my_database(filename) {
    // Conncect to db by opening filename, create filename if it does not exist:
    var db = new sqlite.Database(filename, (err) => {
      if (err) {
        console.error(err.message);
      }
      console.log("Connected to the media database.");
    });
    // Create our media table if it does not exist already:
    db.serialize(() => {
      db.run(`
              CREATE TABLE IF NOT EXISTS media
               (
                      id INTEGER PRIMARY KEY,
                      item_url char(2048) NOT NULL,
                      low_price CHAR(100) NOT NULL,
                      high_price CHAR(100) NOT NULL,
                      status CHAR(100) NOT NULL
           )
          `);
      db.all(`select count(*) as count from media`, function (err, result) {
        if (result[0].count == 0) {
          db.run(
            `INSERT INTO media (item_url, low_price, high_price, status) VALUES (?, ?, ?, ?)`,
            [
              "https://warframe.market/items/ash_prime_blueprint",
              "10",
              "20",
              "active"
            ]
          );
          db.run(
            `INSERT INTO media (item_url, low_price, high_price, status) VALUES (?, ?, ?, ?)`,
            [
              "https://warframe.market/items/ash_prime_systems_blueprint",
              "40",
              "50",
              "active"
            ]
          );
          console.log("Inserted dummy photo entry into empty database");
        } else {
          console.log(
            "Database already contains",
            result[0].count,
            " item(s) at startup."
          );
        }
      });
    });
    return db;

}