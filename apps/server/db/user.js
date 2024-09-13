/**
 * @typedef {import('sqlite3').Database} Database
 */
/**
 * @typedef {{ email: string; password: string; }} User
 */

import {sha256} from '../utils/hasher'

/**
 * Find user, and return value of user email.
 * If no user was found, return null.
 *
 * @param {Database} db - sqlite3 Database instance
 * @param {string} email - email of user
 *
 * @returns {Promise<Omit<User, 'password'> | null>}
 */
export function getUserByEmail(db, email) {
  return new Promise((resolve) => {
    db.get('SELECT email FROM Users WHERE email = ?', [email], function (_, r) {
      if (!r) resolve(null);
      delete r.password;
      resolve(r);
    })
  })
}

/**
 * Insert new User with given data.
 *
 * Email should be unique. this function will not check for unique, and do nothing instead.
 * You should check them manually via `getUserByEmail`.
 *
 * @param {Database} db - sqlite3 Database instance
 * @param {User} user - new user data
 *
 * @returns {Promise<void>}
 */
export function createUser(db, user) {
  return new Promise(async (resolve) => {
    db.run(`
      INSERT INTO Users (email, password) VALUES (?, ?)
    `, [user.email, await sha256(user.password)], resolve);
  })
}

/**
 * Updates data of user found by email.
 * If email does not exists, it will do nothing.
 *
 * Also, careful when updating email. You should check them unique by 'getUserByEmail'.
 *
 * @param {Database} db - sqlite3 Database instance
 * @param {string} email - email of user that will be updated
 * @param {Partial<User>} user - will be applied to user
 * @returns {Promise<void>}
 */
export function updateUser(db, email, user) {
  return new Promise(async (resolve) => {
    const ud = Object.entries(user);
    if (ud.length === 0) resolve();

    db.run(`UPDATE Users SET ${ud.map(([k]) => k + ' = ' + '$' + k).join(', ')} WHERE email = $eq`, {
      $eq: email,
      $email: user.email,
      $password: user.password ? await sha256(user.password) : undefined,
    }, resolve)
  })
}

/**
 * Deletes user found by email.
 * If email does not exists, it will do nothing.
 *
 * @param {Database} db - sqlite3 Database instance
 * @param {string} email - email of user that will be deleted
 * @returns {Promise<void>}
 */
export function deleteUser(db, email) {
  return new Promise((resolve) => {
    db.run(`DELETE FROM Users WHERE email = ?`, [email], resolve);
  })
}
