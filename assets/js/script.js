// variable to store api key for OpenWeatherMap
var API_KEY = "121b7d3d4e8323ac3c4c503bd3a7409f";
// use moment.js to get today's date to display on screen
var todaysDate = moment().format("[(]DD[/]MM[/]YYYY[)]");
// variables to initially get data from localStorage and turn it into an array to work with later
var searchHistoryString = localStorage.getItem("locationHistory");
var searchHistoryItems = JSON.parse(searchHistoryString) ?? [];

// use the searchApi function, using the first entry of the searchHistoryItems array from above as an argument, this is to immediately show the user the last city that was searched for
searchApi(searchHistoryItems[0]);

// function to create the history buttons
function createHistoryBtns() {
  // select the ul with the id of history-list using jQuery, and empty the contents, removing previous dynamically generated HTML
  $("#history-list").empty();
  // use a for loop to go through the searchHistoryItems array
  for (var i = 0; i < searchHistoryItems.length; i++) {
    // use a variable to create a button with relevant bootstrap classes, and custom class and a data-location attribute to store the location
    var searchHistoryBtn = $(
      "<button class='history-btn col-12 my-1 border-0 rounded' data-location='" +
        searchHistoryItems[i] +
        "'><li>"
    );
    // add the location from the array to the text of the newly created button, so the user can see what location the button is refering to
    searchHistoryBtn.text(searchHistoryItems[i]);
    // append the new button to the history-list ul
    $("#history-list").append(searchHistoryBtn);
  }
}

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
  // stringify the array
  searchHistoryString = JSON.stringify(searchHistoryItems);
  // save to localStorage
  localStorage.setItem("locationHistory", searchHistoryString);
  // pull it back out of localStorage to keep our working array updated
  searchHistoryString = localStorage.getItem("locationHistory");
  searchHistoryItems = JSON.parse(searchHistoryString) ?? [];
  // go to the createHistoryBtns function to create the buttons
  createHistoryBtns();
}

// function that will search the API's and create the dynamic html to display the weather to the user, taking a parameter of location
function searchApi(location) {
  // variable to store and use the geo API to find the long and lat coordinates for the location entered by the user
  var geoURL =
    "http://api.openweathermap.org/geo/1.0/direct?q=" +
    location +
    "&limit=5&appid=" +
    API_KEY;

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
      var forecastQueryURL =
        "http://api.openweathermap.org/data/2.5/forecast?lat=" +
        lat +
        "&lon=" +
        lon +
        "&appid=" +
        API_KEY;
      
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
        for (var i = 0; i < response.list.length; i += 8) {
          fiveDaysArray.push(response.list[i]);
        }
        var locationName = response.city.name;
        var todayTemp = (fiveDaysArray[0].main.temp - 273.15).toFixed(2);
        var todayWind = (fiveDaysArray[0].wind.speed * 3.6).toFixed(1);
        var todayHumidity = fiveDaysArray[0].main.humidity;
        var iconCode = fiveDaysArray[0].weather[0].icon;
        var todaysDateH2 = $(
          "<h2 id='location-date' class='my-3 d-inline-block font-weight-bold'>"
        ).text(locationName + " " + todaysDate);
        var todaysIconImg = $("<img id='weather-icon'>").attr(
          "src",
          "http://openweathermap.org/img/wn/" + iconCode + "@2x.png"
        );
        var todaysTempP = $("<p id='today-temp'>").text(
          "Temp: " + todayTemp + " °C"
        );
        var todaysWindP = $("<p id='today-wind'>").text(
          "Wind: " + todayWind + " KPH"
        );
        var todaysHumidityP = $("<p id='today-humidity'>").text(
          "Humidity: " + todayHumidity + "%"
        );
        $("#today").append(
          todaysDateH2,
          todaysIconImg,
          todaysTempP,
          todaysWindP,
          todaysHumidityP
        );

        var h3Div = $("<div class='d-block col-12'>");
        var newH3 = $("<h3 id='five-day' class='font-weight-bold'>");
        newH3.text("5-Day Forecast:");
        h3Div.append(newH3);
        $("#forecast").append(h3Div);
        var fiveDayDiv = $(
          "<div id='five-day-forecast' class='col-12 d-flex justify-content-between flex-wrap'>"
        );
        for (var i = 0; i < 5; i++) {
          var newDiv = $("<div class='forecast col-12 col-md-5 col-lg-2 p-2'>");
          var newDate = $("<p class='date mb-0'>");
          newDate.text(moment().add(i, "days").format("DD[/]MM[/]YYYY"));
          var newIcon = $(
            "<img class='icon' src='http://openweathermap.org/img/wn/" +
              fiveDaysArray[i].weather[0].icon +
              "@2x.png'>"
          );
          var newTemp = $("<p class='temp'>");
          newTemp.text(
            "Temp: " + (fiveDaysArray[i].main.temp - 273.15).toFixed(2) + " °C"
          );
          var newWind = $("<p class='wind'>");
          newWind.text(
            "Wind: " + (fiveDaysArray[i].wind.speed * 3.6).toFixed(1) + " KPH"
          );
          var newHumidity = $("<p class='humidity'>");
          newHumidity.text("Humidity: " + fiveDaysArray[i].main.humidity + "%");
          newDiv.append(newDate, newIcon, newTemp, newWind, newHumidity);
          fiveDayDiv.append(newDiv);
        }
        $("#forecast").append(fiveDayDiv);
        saveHistory(locationName);
      });
    });
  }
}

function search(event) {
  event.preventDefault();
  if ($(event.target).attr("data-location") === undefined) {
    var location = $("#search-input").val().trim().toLowerCase();
  } else {
    var location = $(event.target).attr("data-location");
  }
  searchApi(location);
  $("#search-input").val("");
  location = "";
}

$("#search-button").on("click", search);
$(document).on("click", ".history-btn", search);