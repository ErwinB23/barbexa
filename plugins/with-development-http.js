const { withAndroidManifest } = require('expo/config-plugins');

module.exports = (config, { development = false } = {}) =>
  withAndroidManifest(config, (mod) => {
    const application = mod.modResults.manifest.application?.[0];
    if (!application) throw new Error('Android application manifest missing');
    application.$ = {
      ...application.$,
      'android:usesCleartextTraffic': development === true ? 'true' : 'false',
    };
    return mod;
  });
