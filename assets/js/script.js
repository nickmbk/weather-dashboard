// GLOBAL VARIABLES
// variable to store api key for OpenWeatherMap
var API_KEY = "121b7d3d4e8323ac3c4c503bd3a7409f";
// use moment.js to get today's date to display on screen
var todaysDate = moment().format("[(]DD[/]MM[/]YYYY[)]");
// variable to initially get data from localStorage and turn it into an array to work with later
var searchHistoryItems = JSON.parse(localStorage.getItem("locationHistory")) ?? [];

//RUNS ON PAGE LOAD
// use the searchApi function, using the first entry of the searchHistoryItems array from above as an argument, this is to immediately show the user the last city that was searched for
searchApi(searchHistoryItems[0]);

// CREATE HISTORY BUTTONS
// function to create the history buttons
function createHistoryBtns() {
  // select the ul with the id of history-list using jQuery, and empty the contents, removing previous dynamically generated HTML
  $("#history-list").empty();
  // use a for loop to go through the searchHistoryItems array
  for (var i = 0; i < searchHistoryItems.length; i++) {
    // use a variable to create a button with relevant bootstrap classes, and custom class and a data-location attribute to store the location
    var searchHistoryBtn = $(
      "<button class='history-btn col-12 my-1 border-0 rounded' data-location='" + searchHistoryItems[i] + "'><li>"
    );
    // add the location from the array to the text of the newly created button, so the user can see what location the button is refering to
    searchHistoryBtn.text(searchHistoryItems[i]);
    // append the new button to the history-list ul
    $("#history-list").append(searchHistoryBtn);
  }
}

// SAVE TO LOCAL STORAGE
// function to save the history of locations searched to local storage for persistant data
function saveHistory(locationName) {
  // check to see if the location entered by the user is already in the searchHistoryItems array, and if it exists, what index it lives at is stored in checkLocation variable
  var checkLocation = searchHistoryItems.indexOf(locationName);
  // if the location doesn't exist in the history then we can carry on past this if statement, but if it does exist...
  if (checkLocation !== -1) {
    // ... remove it from the array
    searchHistoryItems.splice(checkLocation, 1);
  }
  // add the location to the beginning of the array
  searchHistoryItems.unshift(locationName);
  // if the array holds more than 10 entries, remove the last one, I only want to keep a history of 10 so it doesn't get too messy
  if (searchHistoryItems.length > 10) {
    searchHistoryItems.pop();
  }
  // save to localStorage
  localStorage.setItem("locationHistory", JSON.stringify(searchHistoryItems));
  // pull it back out of localStorage to keep our working array updated
  searchHistoryItems = JSON.parse(localStorage.getItem("locationHistory")) ?? [];
  // go to the createHistoryBtns function to create the buttons
  createHistoryBtns();
}

// SEARCH APIS
// function that will search the API's and create the dynamic html to display the weather to the user, taking a parameter of location
function searchApi(location) {
  // variable to store and use the geo API to find the long and lat coordinates for the location entered by the user
  var geoURL = "http://api.openweathermap.org/geo/1.0/direct?q=" + location + "&limit=5&appid=" + API_KEY;

  // if the location text box isn't empty (the user may have clicked search without typing anything in), then proceed
  if (location !== "") {
    // use ajax within jQuery to get data from the Geo API for the long and lat coordinates
    $.ajax({
      // using the geoURL variable above as the address
      url: geoURL,
      method: "GET",
      // when the data is returned
    }).then(function (response) {
      // store the lat data from the response in the lat variable
      var lat = response[0].lat;
      // and the lon data from the response in the llon variable
      var lon = response[0].lon;

      // now we create the url for the weather API using the lon and lat variable to tell the API the location
      var forecastQueryURL = "http://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + API_KEY;

      // use ajax again to get the data from the weather API
      $.ajax({
        url: forecastQueryURL,
        method: "GET",
        // once we get a response from the API then do this...
      }).then(function (response) {
        // empty the sections with the ids today and forecast
        $("#today").empty();
        $("#forecast").empty();
        // create a new array to store the details of the next five days in 24 hour blocks
        var fiveDaysArray = [];
        // use a for loop to go through the array of data in the API response add add that data to our own fiveDaysArray array, we are going up in eights in the for loop, because each 24 hour period is stored in every 8th array index
        // stores the city name in the first index of the array
        fiveDaysArray = [response.city.name];
        for (var i = 0; i < response.list.length; i += 8) {
          // push an array inside the fiveDaysArray to store the data we need for each days forecast
          fiveDaysArray.push([
            // grabs the icon and adds it to the link to get the icon from
            "http://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + "@2x.png",
            // grabs the detail of the weather to put in an alt tag for the icon
            response.list[i].weather[0].main,
            // gets the temperature and converts it to celcius
            (response.list[i].main.temp - 273.15).toFixed(2),
            // converts and stores the wind speed in kph
            (response.list[i].wind.speed * 3.6).toFixed(1),
            // gets the humidity
            response.list[i].main.humidity
          ]);
        }

        // CREATE TODAYS WEATHER HTML
        // take the location name from the fiveDaysArray and stoer in the variable locationName
        var locationName = fiveDaysArray[0];
        // create the h2 heading that will display the location name and date
        var todaysDateH2 = $(
          "<h2 id='location-date' class='my-3 d-inline-block font-weight-bold'>"
        ).text(locationName + " " + todaysDate);
        // create the icon that will display next to the h2
        var todaysIconImg = $("<img id='weather-icon'>").attr("src", fiveDaysArray[1][0], "alt", fiveDaysArray[1][1]);
        // create the temperature paragraph ...
        var todaysTempP = $("<p id='today-temp'>").text("Temp: " + fiveDaysArray[1][2] + " °C");
        // ... the wind speed paragraph ...
        var todaysWindP = $("<p id='today-wind'>").text("Wind: " + fiveDaysArray[1][3] + " KPH");
        // ... and the humidity paragraph ...
        var todaysHumidityP = $("<p id='today-humidity'>").text("Humidity: " + fiveDaysArray[1][4] + "%");
        // ... and append all of the above to the section with today for it's id, this will display to the user
        $("#today").append(
          todaysDateH2,
          todaysIconImg,
          todaysTempP,
          todaysWindP,
          todaysHumidityP
        );
        
        // CREATE FORECAST SECTION
        // create a div to hold the h3 heading that will display "5-day forecast" to the user
        var forecastH3Div = $("<div class='d-block col-12'>");
        // create the h3 and add text to it
        var forecastH3 = $("<h3 id='five-day' class='font-weight-bold'>").text("5-Day Forecast:");
        // append the h3 to the h3 div and then to the section with the id forecast
        $("#forecast").append(forecastH3Div.append(forecastH3));

        // create a div that will hold the five day forecast cards
        var fiveDayDiv = $("<div id='five-day-forecast' class='col-12 d-flex justify-content-between flex-wrap'>");
        
        // use a for loop to create the 5 cards that will display the next 5 days forecast
        for (var i = 1; i < 6; i++) {
          var forecastCardDiv = $("<div class='forecast col-12 col-md-5 col-lg-2 p-2'>");
          var forecastCardDate = $("<p class='font-weight-bold mb-0'>").text(moment().add(i - 1, "days").format("DD[/]MM[/]YYYY"));
          var forecastCardIcon = $("<img class='icon' src='" + fiveDaysArray[i][0] + "' alt='" + fiveDaysArray[i][1] + "'>");
          var forecastCardTemp = $("<p class='temp'>").text("Temp: " + fiveDaysArray[i][2] + " °C");
          var forecastCardWind = $("<p class='wind'>").text("Temp: " + fiveDaysArray[i][2] + " °C");
          var forecastCardHumidity = $("<p class='humidity'>").text("Humidity: " + fiveDaysArray[i][4] + "%");
          // append all the elements we've created above to the forecastCardDiv to create our card
          forecastCardDiv.append(
            forecastCardDate,
            forecastCardIcon,
            forecastCardTemp,
            forecastCardWind,
            forecastCardHumidity
          );
          // append the card to the final div that will hold all the cards
          fiveDayDiv.append(forecastCardDiv);
        }
        // and finally append to the section with id of forecast for the user to see
        $("#forecast").append(fiveDayDiv);
        // run the saveHistory function passing the locationName as an argument
        saveHistory(locationName);
      });
    });
  }
}

// this search function will run when the user clicks either the search button or a history button
function search(event) {
  // prevent the form from running it's default behaviour, for example clearing the search box
  event.preventDefault();
  // if the button the user clicked does not have a datat-location attribute (meaning they've clicked the search button), take the location name from the search text box on the webpage, remove any white space and convert to lower case, store it in the location variable
  if ($(event.target).attr("data-location") === undefined) {
    var location = $("#search-input").val().trim().toLowerCase();
  // otherwise take the location name from the data-location attribute from the button that was clicked, this attribute would have been added when the button was created
  } else {
    var location = $(event.target).attr("data-location");
  }
  // run the searchApi function with the location variable as the argument
  searchApi(location);
  // clear the search tex box
  $("#search-input").val("");
  // clear the location variable
  location = "";
}

// event listeners if the user clicks the search button ... 
$("#search-button").on("click", search);
// ... or a history button
$(document).on("click", ".history-btn", search);
