/**
* @typedef {import('sqlite3').Database} Database
* @typedef {{ name: string }} ISpace
* @typedef {{ envKey: string; envValue: string; spaceName: string; }} IEnv
* @typedef {{ spaceName: string; roleName: string; write: boolean }} ISAccess
* @typedef {ISpace & { envs: IVar[]; access: ISAccess[] }} ISpaceRl
*/

import { relational } from './utils';

export default class Space {
  /** @type {Database} */
  db;
  /** @type {ISpaceRl} */
  data;

  /**
  * @param {Database} db
  * @param {ISpaceRl} data
  */
  constructor(db, data) {
    this.db = db;
    this.data = data;
  }

  /**
  * Find space, and returns the instance of Space.
  * It will return null if space was not found.
  *
  * @param {Database} db
  * @param {string} name
  * @returns {Promise<Space | null>}
  */
  static findSpaceByName(db, name) {
    return new Promise((resolve) => {
      db.get(`
        SELECT
          Spaces.name,
          json_group_array(
            json_object(
              'envKey', EnvVars.envKey,
              'envValue', EnvVars.envValue,
              'spaceName', EnvVars.spaceName
            )
          ) as vars,
          json_group_array(
            json_object(
              'spaceName', SpaceAccess.spaceName,
              'roleName', SpaceAccess.roleName,
              'write', SpaceAccess.write,
            )
          ) as access
        FROM Spaces
        LEFT JOIN EnvVars ON Spaces.name = EnvVars.spaceName
        LEFT JOIN SpaceAccess ON Spaces.name = SpaceAccess.spaceName
        WHERE Spaces.name = ?
        GROUP BY Spaces.name
      `, [name], (_, row) => {
        if (!row) resolve(null);
        resolve(
          new Space(
            db,
            {
              ...row,
              envs: relational(row.envs, 'envKey'),
              access: relational(row.access, 'spaceName'),
            }
          )
        );
      });
    });
  }

  /**
  * Creates a space.
  *
  * @param {Database} db
  * @param {string} name
  * @returns {Promise<Space | null>}
  */
  static create(db, name) {
    return new Promise((resolve) => {
      db.run(`INSERT INTO Spaces VALUES (?)`, [name], (err) => {
        if (err) resolve(null);
        resolve(new Space(db, { name, envs: [], access: [] }));
      });
    });
  }

  /**
  * Updates space.
  *
  * @param {Partial<ISpace>} data
  * @returns {Promise<void>}
  */
  update(data) {
    return new Promise((resolve) => {
      const ud = Object.entries(data);
      if (ud.length === 0) resolve();

      this.db.run(`
        UPDATE Spaces
        SET
          ${ud.map(([k, v]) => k + ' = $' + v).join(', ')}
        WHERE name = $qname
      `, {
        $qname: this.data.name,
        ...Object.fromEntries(ud.map(([k, v]) => ['$' + k, v]))
      }, (err) => {
        if (!err) for (const [k, v] of ud) this.data[k] = v;
        resolve();
      });
    });
  }

  /**
  * Deletes space.
  *
  * @returns {Promise<void>}
  */
  delete() {
    return new Promise((resolve) => {
      this.db.run(`DELETE FROM Spaces WHERE name = ?`, [this.data.name], resolve);
    });
  }
}
