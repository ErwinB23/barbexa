module.exports = ({ config }) => {
  const development =
    process.env.APP_VARIANT === 'development' &&
    (!process.env.EAS_BUILD_PROFILE ||
      process.env.EAS_BUILD_PROFILE === 'development');
  return {
    ...config,
    extra: { ...config.extra, localHttpDevelopment: development },
    plugins: [
      ...(config.plugins ?? []),
      ['./plugins/with-development-http.js', { development }],
    ],
  };
};
