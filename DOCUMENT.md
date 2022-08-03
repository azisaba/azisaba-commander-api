# API Document

## Authentication

The Commander API uses username, password and 2fa to authenticate requests.
You need to register account and must be authorized.

## Errors

The Commander API uses conventional HTTP response codes to indicate the success or failure of an API request.
In general: Codes in the 2xx range indicate success.
Codes in the 4xx range indicate an error that failed given the information provided (e.g., a required parameter was
omitted, a charge failed, etc.).
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
    - [Get container logs]()

- [Logs]()
    - [Get operation logs]()

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
  "message": "logged-in",
  "wait_2fa": true
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
  "recoveryCodes": [
    "<RECOVERY_1>",
    "<RECOVERY_2>",
    "..."
  ]
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

**The User api enable to access user components**

***

### Get a list of user

Get all users. it also includes uncompleted user.

#### Endpoint

```http request
GET https://api.commander.net/users
```

#### Response

Status: 200

```json
{
  "message": "ok",
  "users": [
    {
      "id": 0,
      "username": "hogehoge",
      "group": "user"
    },
    {
      "id": 1,
      "username": "fuge_administer",
      "group": "admin"
    },
    ...
  ]
}
```

| name     | type   | description |
|----------|--------|-------------|
| id       | number | user id     |
| username | string | user name   |
| group    | string | user group  |

***

### Get a user profile

Get a user profile that matches id

#### Endpoint

```http request
GET https://api.commander.net/users/{id}
```

#### Parameters

| name | type   | description |
|------|--------|-------------|
| id   | number | user id     |

#### Response

Status: 200

```json
{
  "id": 12134,
  "username": "Dr_Strange",
  "group": "under_review"
}
```

***

### Delete a user

To delete a user needs admin permission.

#### Endpoint

```http request
DELETE https://api.commander.net/users/{id}
```

#### Parameters

| name | type   | description |
|------|--------|-------------|
| id   | number | user id     |

#### Response

Status: 200

```json
{
  "message": "ok"
}
```

***

### Get a list of permission(user has)

Get all permissions that user has. it requires admin permission.

#### Endpoint

```http request
GET https://api.commander.net/users/{id}/permissions
```

#### Parameters

| name | type   | description |
|------|--------|-------------|
| id   | number | user id     |

#### Response

Status: 200

```json
{
  "message": "ok",
  "userId": 1234,
  "permissions": [
    {
      "id": 0,
      "name": "server-1-container",
      "content": [
        {
          "project": "section01",
          "service": "app"
        },
        {
          "project": "section01",
          "service": "database"
        },
        ...
      ]
    },
    ...
  ]
}
```  

Permission component

| name    | type              | description        |
|---------|-------------------|--------------------|
| id      | number            | permission id      |
| name    | string            | permission name    |
| content | PermissionContent | permission content |

PermissionContent component

| name    | type   | description         |
|---------|--------|---------------------|
| project | string | docker project name |
| service | string | docker service name |

***

### Add a permission

Add permission to user. it requires admin permission.

#### Endpoint

```http request
POST https://api.commander.net/users/{id}/permissions/{permission_id}
```

#### Parameters

| name          | type    | description   |
|---------------|---------|---------------|
| id            | number  | user id       |
| permission_id | number  | permission id |

#### Response

Status: 200

```json
{
  "message": "ok"
}
```

***

### Remove a permission

Remove permission from user. it requires admin permission.

#### Endpoint

```http request
DELETE https://api.commander.net/users/{id}/permissions/{permission_id}
```

#### Parameters

| name          | type    | description   |
|---------------|---------|---------------|
| id            | number  | user id       |
| permission_id | number  | permission id |

#### Response

Status: 200

```json
{
  "message": "ok"
}
```

***

### Get a group

Get a group name that user belong to. it requires admin permission.

#### Endpoint

```http request
GET https://api.commander.net/users/{id}/group
```

#### Parameters

| name          | type    | description   |
|---------------|---------|---------------|
| id            | number  | user id       |

#### Response

Status: 200

```json
{
  "group": "admin/user/under_review"
}
```

| name  | type   | description |
|-------|--------|-------------|
| group | string | group name  |

***

### Set a group

Set a user group. it requires admin permission

#### Endpoint

```http request
POST https://api.commander.net/users/{id}/group
```

#### Parameters

| name | type   | description |
|------|--------|-------------|
| id   | number | user id     |

#### Body

| name  | type   | description |
|-------|--------|-------------|
| group | string | group name  |

#### Response

Status: 200

```json
{
  "message": "ok"
}
```

***

## Permissions

**The Permission api enable to access Permission components**

***

### Get list of permissions

#### Endpoint

```http request
GET https://api.commander.net/permissions
```

#### Response

Status: 200

```json
{
  "message": "ok",
  "permissions": [
    {
      "id": "0",
      "name": "standard_permission",
      "content": [
        {
          "project": "commander",
          "service": "backend"
        }
      ]
    }
  ]
}
```

***

### Get a permission

#### Endpoint

```http request
GET https://api.commander.net/permissions/{id}
```

#### Parameters

| name | type   | description   |
|------|--------|---------------|
| id   | number | permission id |

#### Response

Status: 200

```json
{
  "message": "ok",
  "permissions": [
    {
      "id": "0",
      "name": "standard_permission",
      "content": [
        {
          "project": "commander",
          "service": "backend"
        }
      ]
    }
  ]
}
```

***

### Create a permission

#### Endpoint

```http request
POST https://api.commander.net/permissions
```

#### Body

| name    | type   | description     |
|---------|--------|-----------------|
| name    | string | permission name |
| content | object | content object  |

```json
{
  "name": "standard_commander_permission",
  "content": [
    {
      "project": "commander",
      "service": "frontend"
    }
  ]
}
```

#### Response

Status: 200

```json
{
  "message": "ok",
  "id": "1"
}
```

***

### Delete a permission

#### Endpoint

```http request
DELETE https://api.commander.net/permissions/{id}
```

#### Parameters

| name | type   | description   |
|------|--------|---------------|
| id   | number | permission id |

#### Response

Status: 200

```json
{
  "message": "ok"
}
```

***

### Update a permission

#### Endpoint

```http request
PATCH https://api.commander.net/permissions
```

#### Body

| name    | type   | description     |
|---------|--------|-----------------|
| id      | number | permission id   |
| name    | string | permission name |
| content | object | content object  |

```json
{
  "id": "1",
  "name": "standard_commander_permission",
  "content": [
    {
      "project": "commander",
      "service": "frontend_v2"
    }
  ]
}
```

#### Response

Status: 200

```json
{
  "message": "ok",
  "permission": {
    "id": "1",
    "name": "standard_commander_permission",
    "content": [
      {
        "project": "commander",
        "service": "frontend_v2"
      }
    ]
  }
}
```

***

## Docker Containers

***

### Get a list of container

#### Endpoint

```http request
GET https://api.commander.net/containers
```

#### Response

Status: 200

```json
{
  "containers": [
    {
      "id": "8847f22a802d961045b9961412073c82d995fbd2061e3776881d7f4c977ff7f1",
      "docker_id": "UYH5:G36X:NIOL:OUQZ:GOG5:O2D3:UOQI:5P62:I32B:I575:WWDK:EWNE",
      "name": "docker-1",
      "created_at": "2022-05-09T09:22:59.9542074Z",
      "project_name": "mariadb",
      "service_name": "mariadb",
      "status": {
        "read_at": "2022-08-03T00:38:42.5796804Z",
        "state": {
          "status": "running",
          "started_at": "2022-08-02T15:25:58.147306131Z",
          "finished_at": "2022-08-02T15:25:57.118630367Z"
        },
        "network_stats": {
          "tx_total_byte": 0,
          "tx_byte_per_sec": 0,
          "tx_total_packet": 0,
          "tx_packet_per_sec": 0,
          "rx_total_byte": 1672,
          "rx_byte_per_sec": 0,
          "rx_total_packet": 20,
          "rx_packet_per_sec": 0
        },
        "memory_stats": {
          "usage": 98373632,
          "limit": 10448392192,
          "percent": 0.9415193284505682
        },
        "cpu_stats": {
          "percent": 0.012105263157894737
        }
      }
    },
    {
      "id": "ae95cbf5ae952ac05255c53446c72773da346431ec673553c05ffd54354454d2",
      "docker_id": "UYH5:G36X:NIOL:OUQZ:GOG5:O2D3:UOQI:5P62:I32B:I575:WWDK:EWNE",
      "name": "docker-1",
      "created_at": "2022-03-11T07:13:30.6229247Z",
      "project_name": "mysql",
      "service_name": "db",
      "status": {
        "read_at": "2022-08-03T00:38:39.5867556Z",
        "state": {
          "status": "running",
          "started_at": "2022-08-02T15:25:58.182272853Z",
          "finished_at": "2022-08-02T15:25:57.118654237Z"
        },
        "network_stats": {
          "tx_total_byte": 95523,
          "tx_byte_per_sec": 0,
          "tx_total_packet": 603,
          "tx_packet_per_sec": 0,
          "rx_total_byte": 94379,
          "rx_byte_per_sec": 0,
          "rx_total_packet": 967,
          "rx_packet_per_sec": 0
        },
        "memory_stats": {
          "usage": 246095872,
          "limit": 10448392192,
          "percent": 2.3553468081761686
        },
        "cpu_stats": {
          "percent": 0.058142493638676844
        }
      }
    }
  ]
}
```


***
### Get a container information

#### Endpoint

```http request
GET https://api.commander.net/containers/{nodeId}/{containerId}
```

#### Parameters

| name        | type   | description  |
|-------------|--------|--------------|
| nodeId      | number | node id      |
| containerId | number | container id |

#### Response

Status: 200

```json
{
  "id": "8847f22a802d961045b9961412073c82d995fbd2061e3776881d7f4c977ff7f1",
  "docker_id": "UYH5:G36X:NIOL:OUQZ:GOG5:O2D3:UOQI:5P62:I32B:I575:WWDK:EWNE",
  "name": "docker-1",
  "created_at": "2022-05-09T09:22:59.9542074Z",
  "project_name": "mariadb",
  "service_name": "mariadb",
  "status": {
    "read_at": "2022-08-03T00:38:42.5796804Z",
    "state": {
      "status": "running",
      "started_at": "2022-08-02T15:25:58.147306131Z",
      "finished_at": "2022-08-02T15:25:57.118630367Z"
    },
    "network_stats": {
      "tx_total_byte": 0,
      "tx_byte_per_sec": 0,
      "tx_total_packet": 0,
      "tx_packet_per_sec": 0,
      "rx_total_byte": 1672,
      "rx_byte_per_sec": 0,
      "rx_total_packet": 20,
      "rx_packet_per_sec": 0
    },
    "memory_stats": {
      "usage": 98373632,
      "limit": 10448392192,
      "percent": 0.9415193284505682
    },
    "cpu_stats": {
      "percent": 0.012105263157894737
    }
  }
}
```

***
### Start a container

#### Endpoint

```http request
POST https://api.commander.net/containers/{nodeId}/{containerId}/start
```

#### Parameters

| name        | type   | description  |
|-------------|--------|--------------|
| nodeId      | number | node id      |
| containerId | number | container id |

#### Response

Status: 200

```json
{
  "message": "started"
}
```

***

### Stop a container

#### Endpoint

```http request
POST https://api.commander.net/containers/{nodeId}/{containerId}/stop
```

#### Parameters

| name        | type   | description  |
|-------------|--------|--------------|
| nodeId      | number | node id      |
| containerId | number | container id |

#### Response

Status: 200

```json
{
  "message": "stopped"
}
```


***

### Restart a container

#### Endpoint

```http request
POST https://api.commander.net/containers/{nodeId}/{containerId}/restart
```

#### Parameters

| name        | type   | description  |
|-------------|--------|--------------|
| nodeId      | number | node id      |
| containerId | number | container id |

#### Response

Status: 200

```json
{
  "message": "restarted"
}
```

***

### Get container logs
#### Endpoint

```http request
GET https://api.commander.net/containers/{nodeId}/{containerId}/logs
```

#### Parameters

| name        | type   | description  |
|-------------|--------|--------------|
| nodeId      | number | node id      |
| containerId | number | container id |

#### Query

| name        | type   | description |
|-------------|--------|-------------|
| since       | number | timestamp   |

#### Response

Status: 200

```json
{
  "read_at": "2",
  "logs": "~~~~"
}
```

***

## Logs

### Get operation logs

#### Endpoint

```http request
GET https://api.commander.net/logs
```

#### Query

| name   | type   | description |
|--------|--------|-------------|
| userId | number | user id     |
| limit  | number | log limit   |

#### Response

Status: 200

```json
{
    "logs": [
        {
            "userId": 3,
            "message": "testuser has been verified.",
            "date": "2022-08-02T09:12:05.000Z"
        },
        {
            "userId": 3,
            "message": "New user requested review. user:testuser url:http://app.commander.net/register?state=ac7434f0f6f39c8f515892cf34ef536368fa3de9ec89dc01fb7a3e9966f8796dfc5276896435f215e580e15e55ddbe1b5772",
            "date": "2022-08-02T09:11:46.000Z"
        },
        {
            "userId": 1,
            "message": "delete 2's profile",
            "date": "2022-08-02T09:11:26.000Z"
        },
        {
            "userId": 2,
            "message": "Restart a container. mariadb:mariadb",
            "date": "2022-08-02T09:05:00.000Z"
        },
        {
            "userId": 2,
            "message": "Start a container. mariadb:mariadb",
            "date": "2022-08-02T09:04:55.000Z"
        }
    ]
}
```