const locationController = require('../controllers/locationController');

async function routes(fastify, options) {
    fastify.get('/', async (request, reply) => {
        reply.code(200).send({ message: 'Welcome to the Fastify MongoDB CRUD service' });
    });
    fastify.post('/locations', locationController.createLocation);
    fastify.get('/locations/:id', locationController.getLocationById);
    fastify.put('/locations/:id', locationController.updateLocation);
    fastify.delete('/locations/:id', locationController.deleteLocation);
}

module.exports = routes;
