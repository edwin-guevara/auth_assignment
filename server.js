require('dotenv').config();
const Hapi = require('@hapi/hapi');
const jwt = require('jsonwebtoken');

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost'
  });

  await server.register({
    plugin: require('hapi-auth-jwt2')
  });

  const validate = async (decoded, request, h) => {
    const credentials = { ...decoded, scope: decoded.roles };
    return { isValid: true, credentials };
  };

  server.auth.strategy('jwt', 'jwt', {
    key: process.env.JWT_SECRET,
    validate,
    verifyOptions: { algorithms: ['HS256'] },
    urlKey: false,
    cookieKey: false
  });

  server.route([
    {
      method: 'GET',
      path: '/public',
      options: {
        auth: { strategy: 'jwt', mode: 'optional' }
      },
      handler: (request, h) => {
        return { credentials: request.auth.credentials || null };
      }
    },
    {
      method: 'POST',
      path: '/admin',
      options: {
        auth: { strategy: 'jwt', scope: ['admin'] }
      },
      handler: (request, h) => {
        return { credentials: request.auth.credentials };
      }
    }
  ]);

  await server.start();
  console.log('Server running on %s', server.info.uri);

  const token = jwt.sign(
    { id: 123, roles: ['admin'] },
    process.env.JWT_SECRET
    { algorithm: 'HS256', expiresIn: '20m' }
  );
  console.log('Sample JWT:', token);
};

init();
