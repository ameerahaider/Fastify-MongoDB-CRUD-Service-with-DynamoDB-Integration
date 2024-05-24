const fastify = require('fastify')();
const mongoose = require('mongoose');
const Location = require('../src/routes/locations');
const { dynamoDB, documentClient } = require('../src/dynamodbClient');

fastify.register(Location);

const TEST_TIMEOUT = 30000; // 30 seconds timeout for each hook/test

beforeAll(async () => {
    // Connect to MongoDB
    try {
        await mongoose.connect('mongodb://localhost:27017/test');
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }

    // Create DynamoDB table
    const tableParams = {
        TableName: 'Locations',
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' } // Partition key
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };

    try {
        await dynamoDB.describeTable({ TableName: 'Locations' }).promise();
        console.log("DynamoDB table already exists");
    } catch (error) {
        if (error.code === 'ResourceNotFoundException') {
            try {
                await dynamoDB.createTable(tableParams).promise();
                console.log("DynamoDB table created successfully");

                // Wait for the table to become active
                await dynamoDB.waitFor('tableExists', { TableName: 'Locations' }).promise();
                console.log("DynamoDB table is now active");
            } catch (createError) {
                console.error("Error creating DynamoDB table:", createError);
            }
        } else {
            console.error("Error describing DynamoDB table:", error);
        }
    }
}, TEST_TIMEOUT);

afterAll(async () => {
    // Drop MongoDB database
    try {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
        console.log("MongoDB connection closed successfully");
    } catch (error) {
        console.error("Error closing MongoDB connection:", error);
    }

    // Delete DynamoDB table
    const deleteTableParams = {
        TableName: 'Locations'
    };

    try {
        await dynamoDB.deleteTable(deleteTableParams).promise();
        console.log("DynamoDB table deleted successfully");

        // Wait for the table to be deleted
        await dynamoDB.waitFor('tableNotExists', { TableName: 'Locations' }).promise();
        console.log("DynamoDB table is now deleted");
    } catch (error) {
        console.error("Error deleting DynamoDB table:", error);
    }
}, TEST_TIMEOUT);

describe('CRUD operations for locations', () => {
    let locationId;

    test('Create a new location', async () => {
        const response = await fastify.inject({
            method: 'POST',
            url: '/locations',
            payload: {
                name: 'Test Location',
                coordinates: { latitude: 0, longitude: 0 }
            }
        });

        console.log("Response from creating location:", response.payload);

        expect(response.statusCode).toBe(201);
        const data = JSON.parse(response.payload);
        locationId = data._id;
        expect(data.name).toBe('Test Location');

        // Insert into DynamoDB
        const dynamoResponse = await documentClient.put({
            TableName: 'Locations',
            Item: {
                id: locationId,
                name: data.name,
                coordinates: data.coordinates
            }
        }).promise();

        console.log("Response from DynamoDB:", dynamoResponse);
    }, TEST_TIMEOUT);

    test('Get location by ID', async () => {
        const response = await fastify.inject({
            method: 'GET',
            url: `/locations/${locationId}`
        });

        console.log("Response from getting location:", response.payload);

        expect(response.statusCode).toBe(200);
        const data = JSON.parse(response.payload);
        expect(data._id).toBe(locationId);
        expect(data.name).toBe('Test Location');

        // Get from DynamoDB
        const dynamoResponse = await documentClient.get({
            TableName: 'Locations',
            Key: { id: locationId }
        }).promise();

        console.log("Response from DynamoDB:", dynamoResponse);
        expect(dynamoResponse.Item.id).toBe(locationId);
        expect(dynamoResponse.Item.name).toBe('Test Location');
    }, TEST_TIMEOUT);

    test('Update location', async () => {
        const response = await fastify.inject({
            method: 'PUT',
            url: `/locations/${locationId}`,
            payload: {
                name: 'Updated Location',
                coordinates: { latitude: 10, longitude: 10 }
            }
        });

        console.log("Response from updating location:", response.payload);

        expect(response.statusCode).toBe(200);
        const data = JSON.parse(response.payload);
        expect(data._id).toBe(locationId);
        expect(data.name).toBe('Updated Location');

        // Update in DynamoDB
        const dynamoResponse = await documentClient.update({
            TableName: 'Locations',
            Key: { id: locationId },
            UpdateExpression: 'set #name = :name, coordinates = :coordinates',
            ExpressionAttributeNames: { '#name': 'name' },
            ExpressionAttributeValues: {
                ':name': data.name,
                ':coordinates': data.coordinates
            }
        }).promise();

        console.log("Response from DynamoDB:", dynamoResponse);
    }, TEST_TIMEOUT);

    test('Delete location', async () => {
        const response = await fastify.inject({
            method: 'DELETE',
            url: `/locations/${locationId}`
        });

        console.log("Response from deleting location:", response.payload);

        expect(response.statusCode).toBe(200);
        const data = JSON.parse(response.payload);
        expect(data.message).toBe('Location deleted successfully');

        // Delete from DynamoDB
        const dynamoResponse = await documentClient.delete({
            TableName: 'Locations',
            Key: { id: locationId }
        }).promise();

        console.log("Response from DynamoDB:", dynamoResponse);

        // Verify the location no longer exists in MongoDB
        const verifyResponse = await fastify.inject({
            method: 'GET',
            url: `/locations/${locationId}`
        });

        console.log("Response from verifying deletion:", verifyResponse.payload);

        expect(verifyResponse.statusCode).toBe(404);

        // Verify the location no longer exists in DynamoDB
        const verifyDynamoResponse = await documentClient.get({
            TableName: 'Locations',
            Key: { id: locationId }
        }).promise();

        console.log("Response from verifying deletion in DynamoDB:", verifyDynamoResponse);
        expect(verifyDynamoResponse.Item).toBeUndefined();
    }, TEST_TIMEOUT);
});
