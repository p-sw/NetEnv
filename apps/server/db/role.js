/**
 * @typedef {import('sqlite3').Database} Database
 */
/**
 * @typedef {{ name: string; }} IRole
 */

/* ======== Role CRUD ======== */

class Role {
  /**
   * @type {Database}
   */
  db;
  /**
   * @type {IRole}
   */
  data;

  /**
   * @param {Database} db
   * @param {IRole} data
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
      db.get(`SELECT * FROM Roles WHERE name = ?`, [name], function (_, row) {
        if (!row) resolve(null);
        resolve(new Role(db, row));
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

         resolve(new Role(db, data));
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
        $qname: this.name,
        ...Object.fromEntries(ud.map(([k, v]) => ['$' + k, v])),
      }, function(err) {
        if (!err) for (const [k,v] of Object.entries(data)) this.data[k] = v;
        resolve();
      });
    })
  }

  /**
   * Delete role.
   */
   delete() {
     return new Promise((resolve) => {
       this.db.run(`DELETE FROM Roles WHERE name = ?`, [this.data.name], resolve)
     })
   }
}
