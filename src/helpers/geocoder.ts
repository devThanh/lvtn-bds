const NodeGeocoder = require('node-geocoder');

const options = {
  provider: process.env.GEOCODER_PROVIDER,

  // Optional depending on the providers
  //fetch: customFetchImplementation,
  apiKey: process.env.GEOCODER_API_KEY, 
  formatter: null // 'gpx', 'string', ...
};

export const geocoder = NodeGeocoder(options);

