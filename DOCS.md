# Basic Program Structure

* Config
  * Database Location
  * SuperUser ID
  * SuperUser Pass
    * Once superuser is initialized, config will not be referenced
  * Binding Host / Port

* Space
  * Create
    * SpaceName
  * Rename
    * SpaceName SpaceName
  * Delete
    * SpaceName

* EnvVar
  * Add
    * SpaceName KEY VALUE
  * Remove
    * SpaceName KEY
  * Update
    * SpaceName KEY VALUE

* Role
  * Add
    * RoleName
  * Grant
    * RoleName "Space" SpaceName Read/Write
  * Revoke
    * RoleName "Space" SpaceName Read/Write
  * Delete
    * RoleName

* User
  * Create
    * UserName
  * Rename
    * UserName UserName
  * SetPass (SuperUser)
    * UserName Password
  * SetPass (LoggedIn)
    * Password
  * Delete
    * UserName
  * GrantRole
    * UserName RoleName
  * RevokeRole
    * UserName RoleName

# Database Structure

| Table Name  | Description                                 |
|:------------|:--------------------------------------------|
| Spaces      | Stores information about spaces             |
| EnvVars     | Stores environment variables for each space |
| Roles       | Stores information about roles              |
| SpaceAccess | Stores information about space granted role |
| Users       | Stores user information                     |
| UserRoles   | Stores role assignments for users           |

## Spaces

| Key  |  Type  |
|:----:|:------:|
| name | string |

## EnvVars

| Key       |  Type  |
|:---------:|:------:|
| envKey    | string |
| envValue  | string |
| spaceName | string |

## Roles

| Key      | Type   |
|:--------:|:------:|
| RoleName | string |

## SpaceAccess

> row exists = read granted

|    Key    |   Type  |
|:---------:|:-------:|
| spaceName | string  |
| roleName  | string  |
| write     | boolean |

## Users

|    Key   |  Type  |
|:--------:|:------:|
| email    | string |
| password | string |

## UserRoles

| Key      | Type   |
|:--------:|:------:|
| email    | string |
| roleName | string |
