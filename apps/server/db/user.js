/**
 * @typedef {import('sqlite3').Database} Database
 */
/**
 * @typedef {{ email: string; password: string;  }} IUser
 */
/**
 * @typedef {IUser & { roles: (import('./role').IRole)[] }} IUserRl
 *
 * IUser with relationship
 */

export default class User {
  /**
   * @type {Database}
   */
  db;
  /**
   * @type {IUserRl}
   */
  data;

  /**
  * @param {Database} db
  * @param {IUserRl} data
  */
  constructor(db, data) {
    this.db = db;
    this.data = data;
  }

  /**
  * Find user, and return instance of User.
  * If no user was found, return null.
  *
  * @param {Database} db
  * @param {string} email
  * @returns {Promise<User | null>}
  */
  static findByEmail(db, email) {
    return new Promise((resolve) => {
      db.get(`
        SELECT
          Users.email,
          Users.password,
          json_group_array(
            json_object(
              'name', Roles.name
            )
          ) as roles
        FROM Users
        LEFT JOIN UserRoles ON Users.email = UserRoles.email
        LEFT JOIN Roles ON UserRoles.roleName = Roles.name
        WHERE email = ?
        GROUP BY Users.email
        `, [email], function (_, r) {
        if (!r) resolve(null);
        resolve(
          new User(
            db,
            {
              ...r,
              roles: JSON.parse(row.roles).filter(role => role.name !== null)
            })
        );
      });
    });
  }

  /**
   * Insert new User with given data.
   *
   * Password should be initialized before creation.
   * This function will not hash password.
   *
   * Email should be unique. this function will not check for unique, and do nothing instead.
   * You should check them manually via `User.findByEmail`.
   *
   * @param {Database} db - sqlite3 Database instance
   * @param {IUser} user - new user data
   *
   * @returns {Promise<User | null>}
   */
  static create(db, user) {
    return new Promise((resolve) => {
      db.run(`
        INSERT INTO Users (email, password) VALUES (?, ?)
      `, [user.email, user.password], function (err) {
        if (err) resolve(null)
        resolve(new User(db, { ...user, roles: [] }));
      });
    });
  }

  /**
   * Updates data of user.
   *
   * Careful when updating email. You should check them unique by 'User.findByEmail'.
   *
   * @param {Partial<IUser>} data - will be applied to user
   * @returns {Promise<void>}
   */
  update(data) {
    return new Promise((resolve) => {
      const ud = Object.entries(data);
      if (ud.length === 0) resolve();

      this.db.run(`UPDATE Users SET ${ud.map(([k]) => k + ' = $' + k).join(', ')} WHERE email = $eq`, {
        $eq: this.data.email,
        ...Object.fromEntries(ud.map(([k, v]) => ['$' + k, v]))
      }, (err) => {
        if (!err) for (const [k, v] of ud) this.data[k] = v;
        resolve();
      })
    })
  }

  /**
   * Deletes user.
   *
   * @returns {Promise<void>}
   */
  delete() {
    return new Promise((resolve) => {
      this.db.run(`DELETE FROM Users WHERE email = ?`, [this.data.email], resolve);
    })
  }

  /**
   * Add role to user.
   *
   * @param {string} roleName
   * @returns {Promise<void>}
   */
  addRole(roleName) {
    return new Promise((resolve) => {
      this.db.run(`INSERT INTO UserRoles VALUES (?, ?)`, [this.data.email, roleName], (e) => {
        if (!e) this.data.roles.push({ name: roleName });
        resolve();
      })
    })
  }

  /**
   * Remove role from user.
   *
   * @param {string} roleName
   * @returns {Promise<void>}
   */
  removeRole(roleName) {
    return new Promise((resolve) => {
      this.db.run(`DELETE FROM UserRoles WHERE email = ? AND roleName = ?`, [this.data.email, roleName], (e) => {
        if (!e) this.data.roles = this.data.roles.filter(({ name }) => name !== roleName)
        resolve();
      })
    })
  }
}
