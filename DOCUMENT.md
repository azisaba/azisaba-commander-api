# API Document

## Routes

- [/login]()
- [/logout]()
- [/register]()
  - [/:id]()
- [/me]()
- [/2fa]()
  - [/register]()
  - [/unregister]()
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

## API Overview

### Identification

- [Login]()
- [Logout]()
- [Register a user]()
- [Get own profile]()
- [Verify two-factor]()
- [Enable two-factor]()
- [Disable two-factor]()

### User Component

- [Get a list of user]()
- [Get a user profile]()
- [Delete a user]()
- [Get a list of permission(user has)]()
- [Get a permission information]()
- [Add a permission]()
- [Remove a permission]()
- [Get a group]()
- [Set a group]()

### Permission Component

- [Get a list of permission]()
- [Get a permission information]()
- [Create a permission]()
- [Delete a permission]()
- [Update a permission]()

### Docker Container Component

- [Get a list of container]()
- [Get a container information]()
- [Start a container]()
- [Stop a container]()
- [Restart a container]()
