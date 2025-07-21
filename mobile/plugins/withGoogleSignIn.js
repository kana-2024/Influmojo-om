const { withAndroidManifest } = require('@expo/config-plugins');

const withGoogleSignIn = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;

    // Add Google Sign-In configuration
    const application = androidManifest.manifest.application[0];
    
    // Add meta-data for Google Sign-In
    if (!application['meta-data']) {
      application['meta-data'] = [];
    }

    // Add Google Sign-In meta-data
    application['meta-data'].push({
      $: {
        'android:name': 'com.google.android.gms.version',
        'android:value': '@integer/google_play_services_version'
      }
    });

    return config;
  });
};

module.exports = withGoogleSignIn; 