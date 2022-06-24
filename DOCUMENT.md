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

| name    | type   | description                                                      |
|---------|--------|------------------------------------------------------------------|
| message | string | A human-readable message providing more details about the error. |

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
You need to specify a version in url. For instance, if you use version 1.x api, hit an API as following.
```http request
GET https://api.commander.net/v1/me
```

## API Overview

- [Account]()
  - [Login]()
  - [Logout]()
  - [Register a user]()
  - [Verify an account]()
  - [Get own profile]()
  - [Verify two-factor]()
  - [Enable two-factor]()
  - [Disable two-factor]()
  - [Change password]()

- [Users]()
  - [Get a list of user]()
  - [Get a user profile]()
  - [Delete a user]()
  - [Get a list of permission(user has)]()
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

***
### Login

Login to account.

#### Endpoint

```http request
POST https://api.commander.net/v1/login
```

#### Body

| name     | type   | description                                               |
|----------|--------|-----------------------------------------------------------|
| username | string | API supports only ASCII                                   |
| password | string | its length must be longer than 7. and supports only ASCII |

#### Response

Status: 200
```json
{
  "state": "<SESSION_STATE>",
  "message": "logged-in"
}
```

***
### Logout

Logout from account

#### Endpoint

```http request
POST https://api.commander.net/logout
```

#### Response

Status: 200  
```json
{
  "message": "logged-out"
}
```

***
### Register a user

Register a user

#### Endpoint

```http request
POST https://api.command.net/register
```

#### Body

| name     | type   | description                                               |
|----------|--------|-----------------------------------------------------------|
| username | string | API supports only ASCII                                   |
| password | string | its length must be longer than 7. and supports only ASCII |

#### Response

Status: 200
```json
{
  "message": "ok"
}
```  
Status: 400
```json
{
  "message": "invalid_params"
}
```
```json
{
  "message": "invalid_username_or_password"
}
```
```json
{
  "message": "dupe_user"
}
```  
Status: 408
```json
{
  "message": "timed_out"
}
```

***
### Verify an account

By verifying, the account will be activated.

#### Endpoint

```http request
POST https://api.command.net/register/{state}
```

#### Parameters

| name  | type   | description |
|-------|--------|-------------|
| state | string | session id  |

#### Response

***
### Get own profile

Get user profile including id, group, etc.

#### Endpoint

```http request
GET https://api.commander.net/me
```

#### Response

Status: 200
```json
{
  "state": "<SESSION_STATE>" 
}
```
Status: 400
```json
{
  "error": "dupe_user" 
}
```
Status: 404
```json
{
  "error": "not_found" 
}
```

***
### Verify two-factor

Verifying two-factor for login, disable two-factor, etc.

#### Endpoint

```http request
GET https://api.commander.net/2fa
```

#### Parameters

| name | type   | description |
|------|--------|-------------|
| code | number | 2FA code    |

#### Response

Status: 200
```json
{
  "message": "authorized",
  "state": "<SESSION_STATE>"
}
```
Status: 400
```json
{
  "error": "invalid_2fa_code"
}
```

***
### Enable two-factor

Set up two-factor authorization. Return oauth url and recovery codes. 
We recommend to convert url into QR-code.   

#### Endpoint

```http request
POST https://api.commander.net/2fa
```

#### Response

Status: 200
```json
{
  "url": "<OAUTH_URL>",
  "recoveryCodes": ["<RECOVERY_1>","<RECOVERY_2>","..."]
}
```

***
### Disable two-factor

Disabling two-factor need to authorize by two-factor code or recovery code.

#### Endpoint

```http request
DELETE https://api.commander.net/2fa
```

#### Parameters

| name | type   | description |
|------|--------|-------------|
| code | number | 2FA code    |

#### Response

Status: 200
```json
{
  "message": "success"
}
```
Status: 400

```json
{
  "error": "invalid_2fa_code"
}
```

***
### Change password

Change login password.

#### Endpoint

```http request
POST https://api.commander.net/changepassword
```

#### Parameters

| name | type   | description      |
|------|--------|------------------|
| old  | string | old password     |
| new  | string | new password     |
| code | number | 2FA code(option) |

#### Response

Status: 200
```json
{
  "message": "success"
}
```
Status: 400

```json
{
  "error": "invalid_2fa_code_or_password"
}
```

***
## Users

***
## Permissions

**Permission api**

***
### Get list of permissions


***
## Docker Containers

***
## Logs