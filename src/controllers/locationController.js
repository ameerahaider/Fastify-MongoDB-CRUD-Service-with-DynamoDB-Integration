const Location = require('../models/location');

exports.createLocation = async (req, reply) => {
    try {
        const location = new Location(req.body);
        await location.save();
        reply.code(201).send(location);
    } catch (err) {
        reply.code(500).send(err);
    }
};

exports.getLocationById = async (req, reply) => {
    try {
        const location = await Location.findById(req.params.id);
        if (!location) {
            return reply.code(404).send({ message: 'Location not found' });
        }
        reply.send(location);
    } catch (err) {
        reply.code(500).send(err);
    }
};

exports.updateLocation = async (req, reply) => {
    try {
        const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!location) {
            return reply.code(404).send({ message: 'Location not found' });
        }
        reply.send(location);
    } catch (err) {
        reply.code(500).send(err);
    }
};

exports.deleteLocation = async (req, reply) => {
    try {
        const location = await Location.findByIdAndDelete(req.params.id);
        if (!location) {
            return reply.code(404).send({ message: 'Location not found' });
        }
        reply.send({ message: 'Location deleted successfully' });
    } catch (err) {
        reply.code(500).send(err);
    }
};
