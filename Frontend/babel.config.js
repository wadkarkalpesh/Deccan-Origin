module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      function ({ types: t }) {
        return {
          name: 'expo-router-context-fix',
          visitor: {
            MemberExpression(path) {
              if (path.matchesPattern('process.env.EXPO_ROUTER_APP_ROOT')) {
                path.replaceWith(t.stringLiteral('../../app'));
              } else if (path.matchesPattern('process.env.EXPO_ROUTER_IMPORT_MODE')) {
                path.replaceWith(t.stringLiteral('sync'));
              }
            },
          },
        };
      },
    ],
  };
};


