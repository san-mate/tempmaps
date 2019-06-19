import React from 'react';
import mapboxgl from 'mapbox-gl';
import './App.css';

mapboxgl.accessToken = 'pk.eyJ1IjoibWFydGluLW4zeG8iLCJhIjoiY2p4MmJhOHJtMDE3MDRicmZzOGZnMTdrMiJ9.kIGprx1cMHV6_9HxLCM59A';

const API_URL = "/tempapi";

class App extends React.Component {
	map;

	constructor(props: Props) {
		super(props);
		this.state = {
			loading: false,
			show_overlay: true
		};
	}

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
					'text-size': 16
				},
				'filter': ['==', 'class', 'country']
			});

			this.map.addLayer({
				'id': 'cities',
				'source': 'countries',
				'source-layer': 'place_label',
				'type': 'symbol',
				'layout': {
					'text-field': '{name_es}',
					'text-size': 9
				},
				'filter': ['in', 'class', 'state', 'settlement']
			});
		});

		this.map.on('mousemove', function (e) {
			let features = that.map.queryRenderedFeatures(e.point, { layers: ['countries', 'cities'] });
			that.map.getCanvas().style.cursor = features.length ? 'pointer' : '';
		});

		this.map.on('click', function (e) {
			let features = that.map.queryRenderedFeatures(e.point, { layers: ['countries', 'cities'] });
			if (features.length){
				// loading screen
				var lng = features[0].geometry.coordinates[0];
				var lat = features[0].geometry.coordinates[1];
				that.setState({loading: true});
				that.callAPI(lat, lng).then(res => {
					new mapboxgl.Popup()
						.setHTML('<h1>Temperatura: ' + res.temp + 'C</h1><h1>Estacion: ' + res.season + '</h1>')
						.setLngLat([lng, lat])
						.addTo(that.map);
					that.setState({loading: false});
				});
			}
    });
  }

  render() {
    return (
      <div>
				{ this.state.show_overlay && (<div id="overlay" onClick={() => {
            this.setState({ show_overlay: false })
          }}>
					<span>Haga click en las etiquetas para ver la informacion de temperatura y estacion.</span>
				</div>)}
				{ this.state.loading && <div id="overlay"><img alt="Loading..." src="spinner.gif" id="spinner"/></div> }
        <div ref={el => this.mapContainer = el} className="absolute top right left bottom" />
      </div>
    );
  }
}

export default App;
