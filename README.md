# Notification Settings API

## Setup

1. Twilio/Sendgrid keys
   We need to keep secure keys secure, so we're loading from a .env file containing the keys.
   Please copy the `.example.env` and then pre-populate it with all required info.

2. Yarn install
   We have some dependencies that need to be installed. This project uses yarn for package management.
   Yarn can be found here: https://classic.yarnpkg.com/en/docs/install/

   After installing yarn, packages can be installed with `yarn` or `yarn install`

3. You need postgres running. Reccomended technique is using Docker and postgres's alpine image.
   `docker-compose up docker/docker-compose.yml`

4. Once Postgres is running, we'll need to migrate our DB. This can be done by running `yarn typeorm migration:run`

## Running

You can use the prebuilt script to start the app.
` yarn start`

## Authentication

For authentication we're using JWT bearer tokens stored in the 'Authorization' header.
The tokens follow the following structure: `{ sub: <userId> }`

Vaid tokens are needed for all these endpoints, and they can be generated using the secret set in the JWT_SECRET env variable.

## API

The api currently consists of two endpoints:

- /notifications/settings
- /notifications/notify/user

The Notifications Settings endpoint supports `GET` and `PUT`. Both use the JWT encoded userId.
The expected payload for PUT can be found at `src/types/notificationSettings.type.ts`

The Notify User endpoint supports POST, and requires the following parameters: - userID - The ID of the user to be notified.

The expected payload for POST can be found at `src/types/notification.type.ts`

## Testing

We have a full suite of integraiton tests. They can be run through jest.
`yarn test`
