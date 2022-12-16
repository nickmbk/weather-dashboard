var API_KEY = "121b7d3d4e8323ac3c4c503bd3a7409f";

function search(event) {
    event.preventDefault();
    var location = $("#search-input").val().trim().toLowerCase();
    var geoURL = "http://api.openweathermap.org/geo/1.0/direct?q=" + location + "&limit=5&appid=" + API_KEY;

    $.ajax({
        url: geoURL,
        method: "GET"
    }).then(function(response) {
        var lat = response[0].lat;
        var lon = response[0].lon;
        
        var currentQueryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=" + API_KEY;
        var forecastQueryURL = "http://api.openweathermap.org/data/2.5/forecast?id=524901&appid=" + API_KEY;;

        $.ajax({
            url: currentQueryURL,
            method: "GET"
        }).then(function(response) {
            $("#location-date").text();
        });
    });

    
};

$("#search-button").on("click", search);