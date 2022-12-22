var API_KEY = "121b7d3d4e8323ac3c4c503bd3a7409f";
var todaysDate = moment().format("[(]DD[/]MM[/]YYYY[)]");
var searchHistoryString = localStorage.getItem("locationHistory");
var searchHistoryItems = JSON.parse(searchHistoryString) ?? [];

searchApi(searchHistoryItems[0]);

function createHistoryBtns() {
    $("#history-list").empty();
    for (var i = 0; i < searchHistoryItems.length; i++) {
        var searchHistoryBtn = $("<button class='history col-12' data-location='" + searchHistoryItems[i] + "'><li>");
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
    searchHistoryString = JSON.stringify(searchHistoryItems);
    localStorage.setItem("locationHistory", searchHistoryString);
    searchHistoryString = localStorage.getItem("locationHistory");
    searchHistoryItems = JSON.parse(searchHistoryString) ?? [];
    createHistoryBtns();
}

function searchApi(location) {

    var geoURL = "http://api.openweathermap.org/geo/1.0/direct?q=" + location + "&limit=5&appid=" + API_KEY;

    if (location !== "") {
        $.ajax({
            url: geoURL,
            method: "GET"
        }).then(function(response) {
            var lat = response[0].lat;
            var lon = response[0].lon;
            
            var forecastQueryURL = "http://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + API_KEY;

            $.ajax({
                url: forecastQueryURL,
                method: "GET"
            }).then(function(response) {
                var fiveDaysArray = [];
                for (var i = 0; i < response.list.length; i += 8) {
                    fiveDaysArray.push(response.list[i]);
                }
                console.log(fiveDaysArray);
                var locationName = response.city.name;
                var todayTemp = (fiveDaysArray[0].main.temp - 273.15).toFixed(2);
                var todayWind = (fiveDaysArray[0].wind.speed * 3.6).toFixed(1);
                var todayHumidity = fiveDaysArray[0].main.humidity;
                var iconCode = fiveDaysArray[0].weather[0].icon;
                $("#location-date").text(locationName + " " + todaysDate);
                $("#weather-icon").attr("src", "http://openweathermap.org/img/wn/" + iconCode + "@2x.png");
                $("#today-temp").text("Temp: " + todayTemp + " °C");
                $("#today-wind").text("Wind: " + todayWind + " KPH");
                $("#today-humidity").text("Humidity: " + todayHumidity + "%");

                var newH3 = $("<h3 id='five-day'>");
                newH3.text("5-Day Forecast:");
                $("#forecast").append(newH3);
                for (var i = 0; i < 5; i++) {
                    var newDiv = $("<div class='forecast col-2 m-3 p-2'>");
                    var newDate = $("<p class='date'>");
                    newDate.text(moment().add((i),'days').format("DD[/]MM[/]YYYY"));
                    var newIcon = $("<img class='icon' src='http://openweathermap.org/img/wn/" + fiveDaysArray[i].weather[0].icon + "@2x.png'>");
                    var newTemp = $("<p class='temp'>");
                    newTemp.text("Temp: " + (fiveDaysArray[i].main.temp - 273.15).toFixed(2) + " °C");
                    var newWind = $("<p class='wind'>");
                    newWind.text("Wind: " + (fiveDaysArray[i].wind.speed * 3.6).toFixed(1) + " KPH");
                    var newHumidity = $("<p class='humidity'>");
                    newHumidity.text("Humidity: " + fiveDaysArray[i].main.humidity + "%");
                    newDiv.append(newDate, newIcon, newTemp, newWind, newHumidity);
                    $("#forecast").append(newDiv);
                }
                saveHistory(locationName);
            });
        });
    }
}

function search(event) {
    event.preventDefault();
    $("#forecast").empty();
    if ($(event.target).attr("data-location") === undefined) {
        var location = $("#search-input").val().trim().toLowerCase();
    } else {
        var location = $(event.target).attr("data-location");
    }
    searchApi(location);
};

$("#search-button").on("click", search);
$(document).on("click", ".history", search);