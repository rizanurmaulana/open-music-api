const CollaborationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, {
    service, playlistsService, usersService, validator,
  }) => {
    // eslint-disable-next-line max-len
    const collaborationsHandler = new CollaborationsHandler(service, playlistsService, usersService, validator);
    server.route(routes(collaborationsHandler));
  },
};
