/**
 * @typedef {import('sqlite3').Database} Database
 */
/**
 * @typedef {{ name: string; }} Role
 */

/**
 * Find role by name, and return data of the role.
 * If no role found, return null.
 *
 * @param {Database} db - sqlite3 Database instance
 * @param {string} name - name of the role
 * @returns {Promise<Role | null>}
 */
export function getRoleByName(db, name) {
  return new Promise((resolve) => {
    db.get(`SELECT * FROM Roles WHERE name = ?`, [name], function (_, row) {
      if (!row) resolve(null);
      resolve(row);
    });
  });
}

/**
 * Create new role with data.
 * If name is already exists, it will do nothing.
 *
 * @param {Database} db - sqlite3 Database instance
 * @param {Role} data - data that will be inserted into
 * @returns {Promise<void>}
 */
export function createRole(db, data) {
  return new Promise((resolve) => {
    db.run(`INSERT INTO Roles VALUES (?)`, [data.name], resolve);
  });
}

/**
 * Update role data with new data.
 * If name is already exists, it will do nothing.
 *
 * @param {Database} db - sqlite3 Database instance
 * @param {string} name - name of the role
 * @param {Role} data - data that will be updated to
 * @returns {Promise<void>}
 */
export function updateRole(db, name, data) {
  return new Promise((resolve) => {
    const ud = Object.entries(data);
    if (ud.length === 0) resolve();

    db.run(`UPDATE Roles SET ${ud.map(([k]) => k + '= $' + k).join(', ')} WHERE name = $qname`, {
      $qname: name,
      ...Object.fromEntries(ud.map(([k, v]) => ['$' + k, v])),
    }, resolve);
  })
}

/**
 * Delete role found with name.
 * It will do nothing when there's no role found.
 *
 * @param {Database} db - sqlite3 Database instance
 * @param {string} name - name of the role that will be deleted
 * @returns {Promise<void>}
 */
export function deleteRole(db, name) {
  return new Promise((resolve) => {
    db.run(`DELETE FROM Roles WHERE name = ?`, [name], resolve);
  })
}
