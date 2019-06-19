import React from 'react'
import ReactDOM from 'react-dom'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = 'pk.eyJ1IjoibWFydGluLW4zeG8iLCJhIjoiY2p4MmJhOHJtMDE3MDRicmZzOGZnMTdrMiJ9.kIGprx1cMHV6_9HxLCM59A';


class App extends React.Component {
  map;

  componentDidUpdate() {
    // this.setFill();
  }

  componentDidMount() {
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
				'id': 'states',
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

		var map = this.map;
		this.map.on('click', function (e) {
			let features = map.queryRenderedFeatures(e.point, { layers: ['countries', 'states'] });
			if (features.length){
				const name = features[0].properties.name_es; // Grab the country code from the map properties.
				const html = `
				<h1>${name}</h1>
				`;
				new mapboxgl.Popup()
				.setLngLat(e.lngLat)
				.setHTML(html)
				.addTo(map);
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
