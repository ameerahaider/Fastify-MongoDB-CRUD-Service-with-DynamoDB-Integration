const fastify = require('fastify')({ logger: true });
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => {
    fastify.log.info('MongoDB connected');
}).catch(err => {
    fastify.log.error(err);
    process.exit(1);
});

// Register routes
fastify.register(require('./routes/locations'));

// Start the server
const start = async () => {
    try {
        await fastify.listen(3000);
        fastify.log.info(`Server is running at http://localhost:3000`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
