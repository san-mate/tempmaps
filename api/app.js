var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var express = require("express");
var fetch = require('node-fetch');

var app = express();
var cache = require('express-redis-cache')({ client: require('redis').createClient(process.env.REDIS_URL) })

const DARK_SKY_API = 'https://api.darksky.net/forecast/4faf4524850d1e8035376dfaa29cf3a3/'

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

function fetch_retry(req){
	return new Promise(function(resolve, reject) {
		fetch(DARK_SKY_API + req.query.lat + ',' + req.query.lon + '?exclude=minutely,hourly,daily,alerts,flags&units=si')
			.then(res => res.json())
			.then(res => {
				// Agrega el factor de error
				error = Math.random() * 100;
				console.log("valor del error: " + error);
				if(error < 10)
					throw "error-retry"

				var current_time = new Date(res.currently.time*1000);
				var season;
				if (current_time.getMonth() > 2 && current_time.getMonth() < 6) {
					season = req.query.lat > 0 ? "Primavera" : "Otoño";
				} else if (current_time.getMonth() > 8 && current_time.getMonth() < 12) {
					season = req.query.lat > 0 ? "Otoño" : "Primavera";
				} else if ( current_time.getMonth() > 5 && current_time.getMonth() < 9) {
					season = req.query.lat > 0 ? "Verano" : "Invierno";
				} else if ( current_time.getMonth() > 5 && current_time.getMonth() < 9) {
					season = req.query.lat > 0 ? "Invierno" : "Verano";
				}

				resolve({
					temp: res['currently']['temperature'],
					season: season
				});
			})
			.catch(err => {
				if (err == 'error-retry'){
					fetch_retry(req).then(resolve).catch(reject);
				} else {
					res.send("error externo de la api");
				}
			});
	})
}

app.get('/tempapi', cache.route({ expire: 60 }), function(req, res, next) {
	fetch_retry(req, res).then(data => {
		res.send(data);
	})
});

module.exports = app;
