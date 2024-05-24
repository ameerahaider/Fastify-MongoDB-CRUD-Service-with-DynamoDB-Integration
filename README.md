# Fastify MongoDB CRUD Service

This project implements a Fastify server with CRUD (Create, Read, Update, Delete) operations for user locations using MongoDB and DynamoDB. The service runs locally for development and testing purposes and is intended to be deployed on AWS.

## Table of Contents

- [Fastify MongoDB CRUD Service](#fastify-mongodb-crud-service)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
    - [API Endpoints](#api-endpoints)
  - [Testing](#testing)
    - [Test Timeout](#test-timeout)
  - [Project Structure](#project-structure)
  - [Environment Variables](#environment-variables)
  - [Additional Information](#additional-information)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/ameerahaider/Fastify-MongoDB-CRUD-Service-with-DynamoDB-Integration.git
cd Fastify-MongoDB-CRUD-Service-with-DynamoDB-Integration
```

2. Install dependencies:

```bash
npm install
```

3. Set up the environment variables:

Create a `.env` file in the root directory and add the following variables:

```env
MONGODB_URI=mongodb://localhost:27017/locations
AWS_REGION=your-aws-region
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
```

4. Start the server:

```bash
npm start
```

The server will be running at `http://localhost:3000`.

## Usage

### API Endpoints

- **POST /locations**: Create a new user location.
- **GET /locations/:id**: Retrieve a user location by ID.
- **PUT /locations/:id**: Update a user location by ID.
- **DELETE /locations/:id**: Delete a user location by ID.

## Testing

This project uses Jest for testing. The tests cover both MongoDB (locally) and DynamoDB (AWS).

1. Start MongoDB locally:

Ensure MongoDB is running locally. You can start it using the following command:

```bash
mongod --dbpath /path/to/your/db
```

2. Run the tests:

```bash
npm test
```

### Test Timeout

Each test has a timeout of 30 seconds. You can adjust this by modifying the `TEST_TIMEOUT` variable in the test files.

## Project Structure

```
fastify-mongodb-crud/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── dynamodbClient.js
│   └── server.js
├── tests/
│   └── locations.test.js
├── .env
├── jest.config.js
├── package.json
└── README.md
```

- **src/controllers**: Contains the controller functions for handling API requests.
- **src/models**: Contains the Mongoose models for MongoDB.
- **src/routes**: Contains the route definitions for the Fastify server.
- **src/dynamodbClient.js**: Configures and exports the AWS DynamoDB client.
- **src/server.js**: Initializes and starts the Fastify server.
- **tests**: Contains Jest test files.

## Additional Information

- MongoDB is used for primary data storage.
- DynamoDB is integrated for secondary storage and testing.
- Jest is used for unit and integration tests.
- Fastify is used as the web framework for building the RESTful API.
