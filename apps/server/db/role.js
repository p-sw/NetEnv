/**
 * @typedef {import('sqlite3').Database} Database
 * @typedef {{ name: string; }} IRole
 * @typedef {IRole & { users: import('./user').IUser[] }} IRoleRl
 */

/* ======== Role CRUD ======== */

export default class Role {
  /** @type {Database} */
  db;
  /** @type {IRoleRl} */
  data;

  /**
   * @param {Database} db
   * @param {IRoleRl} data
   */
  constructor(db, data) {
    this.db = db;
    this.data = data;
  }

  /**
   * Find role by name, and return instance of the Role.
   * If no role found, return null.
   *
   * @param {Database} db - sqlite3 Database instance
   * @param {string} name - name of the role
   * @returns {Promise<Role | null>}
   */
  static findByName(db, name) {
    return new Promise((resolve) => {
      db.get(`
        SELECT
          Roles.name,
          json_group_array(
            json_object(
              'email', Users.email,
              'password', Users.password,
            )
          ) as users
        FROM Roles
        LEFT JOIN UserRoles ON Roles.name = UserRoles.roleName
        LEFT JOIN Users ON UserRoles.email = Users.email
        WHERE name = ?
        GROUP BY Roles.name
        `, [name], function (_, row) {
        if (!row) resolve(null);
        resolve(
          new Role(
            db,
            { ...row, roles: JSON.parse(row.users).filter(user => user.email !== null) }
          )
        );
      });
    });
  }

  /**
   * Create new role with data.
   * If name is already exists, it will do nothing.
   * After creation, it will return instance of the Role, or null on error.
   *
   * @param {Database} db - sqlite3 Database instance
   * @param {IRole} data - data that will be inserted into
   * @returns {Promise<Role | null>}
   */
  static create(db, data) {
    return new Promise((resolve) => {
      db.run(`INSERT INTO Roles VALUES (?)`, [data.name], function(err) {
        if (err) resolve(null);

        resolve(new Role(db, { ...data, users: [] }));
      });
    });
  }

   /**
    * Update role data with new data.
    * After successful update, it will update role data.
    *
    * @param {Partial<IRole>} data - data that will be updated to
    * @returns {Promise<void>}
    */
  update(data) {
    return new Promise((resolve) => {
      const ud = Object.entries(data);
      if (ud.length === 0) resolve();

      this.db.run(`UPDATE Roles SET ${ud.map(([k]) => k + '= $' + k).join(', ')} WHERE name = $qname`, {
        $qname: this.data.name,
        ...Object.fromEntries(ud.map(([k, v]) => ['$' + k, v])),
      }, (err) => {
        if (!err) for (const [k,v] of Object.entries(data)) this.data[k] = v;
        resolve();
      });
    })
  }

  /**
   * Delete role.
   *
   * @returns {Promise<void>}
   */
  delete() {
    return new Promise((resolve) => {
      this.db.run(`DELETE FROM Roles WHERE name = ?`, [this.data.name], resolve)
    })
  }

  /**
   * Add user to role.
   *
   * @param {import('./user').default} user
   * @returns {Promise<void>}
   */
  addUser(user) {
    return new Promise((resolve) => {
      this.db.run(`INSERT INTO UserRoles VALUES (?, ?)`, [user.data.email, this.data.name], (err) => {
        if (!err) {
          this.data.users.push(user.data);
          user.data.roles.push(this.data);
        }
        resolve();
      });
    })
  }

  /**
   * Remove user from role.
   *
   * @param {import('./user').default} user
   * @returns {Promise<void>}
   */
  removeUser(user) {
    return new Promise((resolve) => {
      this.db.run(`DELETE FROM UserRoles WHERE email = ? AND roleName = ?`, [user.data.email, this.data.name], (err) => {
        if (!err) {
          this.data.users = this.data.users.filter(({ email }) => email !== user.data.email);
          user.data.roles = user.data.roles.filter(({ name }) => name !== this.data.name);
        }
        resolve()
      })
    })
  }
}
