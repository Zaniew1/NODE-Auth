

# Title
NODE-AUTH

# Description
The goal of this project is to provide a microservice that will be able to provide full authentication and authorization using JWT and User Sessions. 
Application uses both access token and refresh token for better security. User sessions are additional security precaution. User is not fully verified if he does not verify his account via email with verification code.
All data are being cached by Redis, and whole project is containerized with Docker.

# Features
  - Authorization
  - Authentication
  - User sessions
  - JWT access token and refresh token
  - Email sending via Sendgrid

# Tech
  - Node
  - Express
  - Typescript
  - Zod
  - Jest && SuperTest
  - MongoDB && Mongoose
  - Redis
  - Docker
  - JWT
  - Sendgrid

# Environment variables
This project contains many environment variables. This allows you to easily set all the options of this project .  The key is to configure them correctly.
Below are examples of all the necessary variables:

| Variable                 | Example    |
|--------------------------|------------|
| NODE_ENV                 | dev        |
| PORT                     | 5000       |
| JWT_SECRET               | asdasdasda |
| JWT_REFRESH_SECRET       | asdasdasda |
| JWT_EXPIRES_IN           | 24h        |
| APP_VERSION              | v1.1.1     |
| APP_ORIGIN               | http://localhost |
| MONGO_DB_PASS            | mongodb+srv:/<username>:<Password>@some-cluster.jofwtlr.mongodb.net |
| REDIS_HOST               | redis-182625.c278.us-east-1-1.ec2.redns.redis-cloud.com |
| REDIS_PORT               | 18265      |
| REDIS_PASS               | adasdasasd |

# Setup 
# Tests
  
