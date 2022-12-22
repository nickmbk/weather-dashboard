var API_KEY = "121b7d3d4e8323ac3c4c503bd3a7409f";
var todaysDate = moment().format("[(]DD[/]MM[/]YYYY[)]");
var searchHistoryString = localStorage.getItem("locationHistory");
var searchHistoryItems = JSON.parse(searchHistoryString) ?? [];

searchApi(searchHistoryItems[0]);

function createHistoryBtns() {
  $("#history-list").empty();
  for (var i = 0; i < searchHistoryItems.length; i++) {
    var searchHistoryBtn = $(
      "<button class='history-btn col-12 my-1 border-0 rounded' data-location='" +
        searchHistoryItems[i] +
        "'><li>"
    );
    searchHistoryBtn.text(searchHistoryItems[i]);
    $("#history-list").append(searchHistoryBtn);
  }
}

function saveHistory(locationName) {
  var checkLocation = searchHistoryItems.indexOf(locationName);
  if (checkLocation !== -1) {
    searchHistoryItems.splice(checkLocation, 1);
  }
  searchHistoryItems.unshift(locationName);
  if (searchHistoryItems.length > 10) {
    searchHistoryItems.pop();
  }
  searchHistoryString = JSON.stringify(searchHistoryItems);
  localStorage.setItem("locationHistory", searchHistoryString);
  searchHistoryString = localStorage.getItem("locationHistory");
  searchHistoryItems = JSON.parse(searchHistoryString) ?? [];
  createHistoryBtns();
}

function searchApi(location) {
  var geoURL =
    "http://api.openweathermap.org/geo/1.0/direct?q=" +
    location +
    "&limit=5&appid=" +
    API_KEY;

  if (location !== "") {
    $.ajax({
      url: geoURL,
      method: "GET",
    }).then(function (response) {
      var lat = response[0].lat;
      var lon = response[0].lon;

      var forecastQueryURL =
        "http://api.openweathermap.org/data/2.5/forecast?lat=" +
        lat +
        "&lon=" +
        lon +
        "&appid=" +
        API_KEY;

      $.ajax({
        url: forecastQueryURL,
        method: "GET",
      }).then(function (response) {
        var fiveDaysArray = [];
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
  $("#today").empty();
  $("#forecast").empty();
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
