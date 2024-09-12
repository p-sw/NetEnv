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

* Permissions
  * WriteRole - Add/Grant/Revoke/Delete Role, AddUser/RemoveUser (Still can't grant permissions & spaces not granted to them)
  * WriteSpace - Create/Rename/Delete Space (EnvVar Read/Write NOT INCLUDED)
  * WriteUser - Create/Update/Delete User, SetPass for other user

* Role
  * Add
    * RoleName
  * Grant
    * RoleName "Permission" WriteRole/WriteSpace/WriteUser
    * RoleName "Space" SpaceName Read/Write
  * Revoke
    * RoleName "Permission" WriteRole/WriteSpace/WriteUser
    * RoleName "Space" SpaceName Read/Write
  * Delete
    * RoleName
  * AddUser
    * RoleName UserName
  * RemoveUser
    * RoleName UserName

* User
  * Create
    * UserName
  * Rename
    * UserName UserName
  * SetPass (Only for WriteUser granted user)
    * UserName Password
  * SetPass (LoggedIn)
    * Password
  * Delete
    * UserName

# Database Structure

| Table Name  | Description                                 |
|:------------|:--------------------------------------------|
| Spaces      | Stores information about spaces             |
| EnvVars     | Stores environment variables for each space |
| Roles       | Stores information about roles              |
| Permissions | Stores permissions assigned to roles        |
| SpaceAccess | Stores space access permissions for roles   |
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

| Key | Type |
|:--:|:--:|
