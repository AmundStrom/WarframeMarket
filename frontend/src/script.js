/* Audio defined */
const audio = new Audio('../../assets/money.mp3');

/* Allow music to be played button */
document.getElementById('playButton').addEventListener('click', function() {
  playMusic();
});

function playMusic() {
  audio.play();
}


populateItems();

document.getElementById("newItemForm").addEventListener("submit", submitNewItemForm);

modalListener("newItemModal", "newItemOpen", "newItemClose");

// Set the interval (in milliseconds)
var interval = 60000;

// Call the function at the specified interval
var intervalID = setInterval(searchMarket, interval);  

/* Searches the Warframe market with the given items in the database */
async function searchMarket() {

  var mediaDB = null;
  try {
    const responseGet = await fetch("http://localhost:3000/database");
    mediaDB = await responseGet.json();

  } catch (error) {
    console.error("Error Getting Media Database:", error.message);
    return;
  }

  for (let key in mediaDB) {
    if ( mediaDB[key].status === 'active' ) {

      var warframeDB = null;
    
      try {
        const response = await fetch("http://localhost:3000/database/order/" + mediaDB[key].id);
        warframeDB = await response.json();

      } catch (error) {
        console.error("Error Getting Warframe Database:", error.message);
        return;
      }

      for (let item in warframeDB) {
        if ( warframeDB[item].status === 'ingame' ) {
          if ( warframeDB[item].order_type === 'sell') {
            if ( warframeDB[item].platinum >= mediaDB[key].low_price && warframeDB[item].platinum <= mediaDB[key].high_price ) {
              var elem = document.getElementById('item' + mediaDB[key].id);
              elem.style.backgroundColor = 'purple';
              audio.play();
            }
          }
        }
      }

    }
  }
}


/* Called by the EventListener, will submit a new item to the database and DOM */
async function submitNewItemForm(event) {
  // Stops the web browser from performing the built-in handler 
  event.preventDefault();

  var formData = getFormData(this);

  /* Code taken from: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch */
  try {
    // Make a POST request 
    await fetch("http://localhost:3000/database", {
      method: "POST", // or 'PUT'
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData)
    });

    // Make a GET request and insert the latest element into the image gallery 
    const responseGet = await fetch("http://localhost:3000/database");
    const obj = await responseGet.json();
    insertItem(obj[obj.length - 1]);

    // Reset the input fields 
    document.getElementById("newItemForm").reset();

    // Close the modal window 
    var modal = document.getElementById(document.getElementById("newItemModal").id);
    modal.style.display = "none";

  } catch (error) {
    console.error("Error Submitting Form:", error.message);
  }
}


/* Called by the EventListner, Deletes an item from the DOM and Database  */
async function buyButtonHandler(event) {
  // Stops the web browser from performing the built-in handler 
  event.preventDefault();

  // Get the ID number for the entire item
  var self = event.target;
  var id = self.id[self.id.length - 1];

  /* Code taken from: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch */
  try {
    // Make a GET request 
    const responseGET = await fetch("http://localhost:3000/database/item/" + id, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });

    // Check for error
    if (!responseGET.ok) {
      throw new Error('Network response was not ok');
    }

    var obj = await responseGET.json();
    window.open(obj[0].item_url, '_blank');

  } catch (error) {
    console.error('Error getting element:', error.message);
  }
}


/* Called by the EventListener, Activates/Deactivates the item in the DOM and Database */
async function switchButtonHandler(event) {
  // Stops the web browser from performing the built-in handler 
  event.preventDefault();

  // Get the ID number for the entire item
  var self = event.target;
  var id = self.id[self.id.length - 1];
  
  /* Code taken from: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch */
  try {
    // Make a GET request 
    const responseGET = await fetch("http://localhost:3000/database/item/" + id, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });

    // Check for error
    if (!responseGET.ok) {
      throw new Error('Network response was not ok');
    }

    var obj = await responseGET.json();

  } catch (error) {
    console.error('Error getting element:', error.message);
  }

  // Switch status
  if(obj[0].status === 'active') {
    obj[0].status = 'deactive';
  } else {
    obj[0].status = 'active';
  }

  // Change the place in the DOM
  var newParent = document.getElementById('list-' + obj[0].status + '-container');
  newParent.appendChild(document.getElementById('item' + id));

  /* Code taken from: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch */
  try {
    // Make a PUT request 
    const response = await fetch("http://localhost:3000/database/item/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj[0])
    });

    // Check for error
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

  } catch (error) {
    console.error('Error updating element:', error.message);
  }
}


/* Called by the EventListner, Deletes an item from the DOM and Database  */
async function deleteButtonHandler(event) {
  // Stops the web browser from performing the built-in handler 
  event.preventDefault();

  // Get the ID number for the entire item
  var self = event.target;
  var id = self.id[self.id.length - 1];

  // Remove the Item from the DOM
  var parent = document.getElementById('item' + id).parentElement;
  parent.removeChild(document.getElementById('item' + id));

  /* Code taken from: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch */
  try {
    // Make a DELETE request 
    const response = await fetch("http://localhost:3000/database/item/" + id, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }
    });

    // Check for error
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

  } catch (error) {
    console.error('Error deleting element:', error.message);
  }
}


/* Will populate the gallery with all the objects in the database */
async function populateItems() {
  try {
    /* Make a GET requst */
    const response = await fetch("http://localhost:3000/database");
    const obj = await response.json();

    for (let i = 0; i < obj.length; i++) {
      insertItem(obj[i]);
    }

  } catch (error) {
    console.error("Error Populating Items:", error.message);
  }
}


/* Helper function to insert a image into the gallery */
async function insertItem(JSONobj) {

  // Split the URL by slashes ("/") and get the last part
  const parts = JSONobj.item_url.split('/');
  const itemName = parts[parts.length - 1];

  // Replace underscores with spaces and capitalize each word
  const formattedItemName = itemName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());


  // Step 1: Create new elements
  var newItem = document.createElement('div');
  newItem.className = 'list-row';
  newItem.id = 'item' + JSONobj.id;

  var listTextItem1 = document.createElement('div');
  listTextItem1.className = 'list-text-item';
  listTextItem1.innerHTML = '<span>' + formattedItemName + '</span>';

  var listTextItem2 = document.createElement('div');
  listTextItem2.className = 'list-text-item list-text-lowest';
  listTextItem2.innerHTML = '<span>' + JSONobj.low_price + '</span>';

  var listTextItem3 = document.createElement('div');
  listTextItem3.className = 'list-text-item list-text-highest';
  listTextItem3.innerHTML = '<span>' + JSONobj.high_price + '</span>';

  var buyButton = document.createElement('button');
  buyButton.className = 'list-base-button list-buy-button';
  buyButton.id = 'buy' + JSONobj.id;
  buyButton.textContent = 'Buy';

  var editButton = document.createElement('button');
  editButton.className = 'list-base-button list-edit-button';
  editButton.id = 'edit' + JSONobj.id;
  editButton.textContent = 'Edit';

  var switchButton = document.createElement('button');
  switchButton.className = 'list-base-button list-switch-button';
  switchButton.id = 'switch' + JSONobj.id;
  switchButton.textContent = 'Switch';

  var deleteButton = document.createElement('button');
  deleteButton.className = 'list-base-button list-delete-button';
  deleteButton.id = 'delete' + JSONobj.id;
  deleteButton.textContent = 'Delete';

  // Step 2: Combine different div containers
  newItem.appendChild(listTextItem1);
  newItem.appendChild(listTextItem2);
  newItem.appendChild(listTextItem3);
  newItem.appendChild(buyButton);
  newItem.appendChild(editButton);
  newItem.appendChild(switchButton);
  newItem.appendChild(deleteButton);

  // Step 3: Insert the new item into the DOM
  var listContainer = document.getElementById('list-' + JSONobj.status + '-container');

  // Append the new item
  listContainer.appendChild(newItem);

  // Step 4: Add event listeners
  document.getElementById(buyButton.id).addEventListener("click", buyButtonHandler);
  document.getElementById(switchButton.id).addEventListener("click", switchButtonHandler);
  document.getElementById(deleteButton.id).addEventListener("click", deleteButtonHandler);
}


/* Add event listeners to the modal */
function modalListener(modalID, openID, closeID) {
  /* Code taken from: https://www.w3schools.com/howto/howto_css_modals.asp */

  // Get the modal
  var modal = document.getElementById(modalID);

  // When the user clicks the button, open the modal 
  document.getElementById(openID).addEventListener("click", function () {
    modal.style.display = "block";
  });

  // When the user clicks on (x), close the modal
  document.getElementById(closeID).addEventListener("click", function () {
    modal.style.display = "none";
  });

  // When the user clicks anywhere outside of the modal, close it
  document.addEventListener('click', function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });

  // When the user presses the escape key, close the modal
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      modal.style.display = "none";
    }
  });
}


/* Helper function that extracts data in the form */
function getFormData(self) {

  // Get form data using FormData
  var formData = new FormData(self);

  // Data which will be sent to server
  return {
    item_url: formData.get('item_url'),
    low_price: formData.get('low_price'),
    high_price: formData.get('high_price'),
    status: formData.get('status')
  };
}