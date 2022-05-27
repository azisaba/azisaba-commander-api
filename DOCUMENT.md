# API Document

## Routes

- [/login]()
- [/logout]()
- [/register]()
  - [/:id]()
- [/me]()
- [/2fa]()
- [/users]()
  - [/:id]()
  - [/:id/permissions]()
    - [/:id]()
  - [/:id/group]()
- [/permissions]()
  - [/:id]()
- [/containers]()
  - [/:id]()
  - [/:id/start]()
  - [/:id/stop]()
  - [/:id/restart]()

## Authentication

The Commander API uses username, password and 2fa to authenticate requests.
You need to register account and must be authorized.

## Errors

The Commander API uses conventional HTTP response codes to indicate the success or failure of an API request.
In general: Codes in the 2xx range indicate success. 
Codes in the 4xx range indicate an error that failed given the information provided (e.g., a required parameter was omitted, a charge failed, etc.). 
Codes in the 5xx range indicate an error with Commander's servers.

#### Attributes

***
**message** string  
A human-readable message providing more details about the error.

#### HTTP STATUS SUMMARY

| Code                   | Description                                                                               |
|------------------------|-------------------------------------------------------------------------------------------|
| 200 - OK               | Everything worked as expected.                                                            |
| 400 - Bad Request      | The request was unacceptable, often due to missing a required parameter.                  |
| 401 - Unauthorized     | The session was not authorized.                                                           |
| 402 - Request Failed   | The parameters was valid but the request failed.                                          |
| 403 - Forbidden        | The session was authorized but the request was unacceptable, due to missing a permission. |
| 404 - Not Found        | The request resource does not exist.                                                      |
| 429 - To Many Requests | Too many requests hit the API too quickly.                                                |


## Versioning

The Commander API manage versions to avoid having harmful effect caused by updating. 
You need to specify a version in url.
```http request
GET https://api.commander.net/v1/me
```

## API Overview

- [Account]()
  - [Login]()
  - [Logout]()
  - [Register a user]()
  - [Get own profile]()
  - [Verify two-factor]()
  - [Enable two-factor]()
  - [Disable two-factor]()

- [Users]()
  - [Get a list of user]()
  - [Get a user profile]()
  - [Delete a user]()
  - [Get a list of permission(user has)]()
  - [Get a permission information]()
  - [Add a permission]()
  - [Remove a permission]()
  - [Get a group]()
  - [Set a group]()

- [Permissions]()
  - [Get a list of permission]()
  - [Get a permission information]()
  - [Create a permission]()
  - [Delete a permission]()
  - [Update a permission]()

- [Docker Containers]()
  - [Get a list of container]()
  - [Get a container information]()
  - [Start a container]()
  - [Stop a container]()
  - [Restart a container]()

- [Logs]()
  - [Get container operation logs]()
  - [Get user profile log]()

## Account
**The Account API enables to login, logout, signup, 2fa, get profile.**
### Login

### User
### Permission
### Docker Container
### Logging