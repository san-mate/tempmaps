import React from 'react'
import ReactDOM from 'react-dom'
import mapboxgl from 'mapbox-gl'
import './App.css';

mapboxgl.accessToken = 'pk.eyJ1IjoibWFydGluLW4zeG8iLCJhIjoiY2p4MmJhOHJtMDE3MDRicmZzOGZnMTdrMiJ9.kIGprx1cMHV6_9HxLCM59A';

const API_URL = "/tempapi";

class App extends React.Component {

	// constructor(props) {
	//     super(props);
	// }

	callAPI(lat, lon) {
    return fetch(API_URL + "?lat=" + lat + "&lon=" + lon).then(res => res.json());
	}

  componentDidMount() {
		var that = this;

		this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/martin-n3xo/cjx2cjhlf0zp31cnv9o13ftzb?fresh=true',
      zoom: 1.6
    });

		this.map.on('load', () => {
			this.map.addSource('countries', {
				'type': 'vector',
				'url': 'mapbox://mapbox.mapbox-streets-v8'
			});
			this.map.addLayer({
				'id': 'countries',
				'source': 'countries',
				'source-layer': 'place_label',
				'type': 'symbol',
				'layout': {
					'text-field': '{name_es}',
					'text-size': 16,
				},
				'filter': ['==', 'class', 'country']
			})

			this.map.addLayer({
				'id': 'cities',
				'source': 'countries',
				'source-layer': 'place_label',
				'type': 'symbol',
				'layout': {
					'text-field': '{name_es}',
					'text-size': 9,
				},
				'filter': ['in', 'class', 'state', 'settlement']
			})
		});

		this.map.on('click', function (e) {
			let features = that.map.queryRenderedFeatures(e.point, { layers: ['countries', 'cities'] });
			if (features.length){
				var lng = features[0].geometry.coordinates[0];
				var lat = features[0].geometry.coordinates[1];
				that.callAPI(lat, lng).then(res => {
					new mapboxgl.Popup()
						.setHTML('<h1>Temperatura: ' + res.temp + 'C</h1><h1>Estacion: ' + res.season + '</h1>')
						.setLngLat([lng, lat])
						.addTo(that.map);
				});
			}
    });
  }

  render() {
    return (
      <div>
        <div ref={el => this.mapContainer = el} className="absolute top right left bottom" />
      </div>
    );
  }
}

export default App;
