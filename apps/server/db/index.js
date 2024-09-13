import { Database } from 'sqlite3'
import { config } from '../config';
import { createUser, getUserByEmail } from './user';

const db = new Database(config.db);

// database init
db.exec(`
  CREATE TABLE IF NOT EXISTS Spaces (
    name TEXT PRIMARY KEY
  );

  CREATE TABLE IF NOT EXISTS EnvVars (
    envKey TEXT PRIMARY KEY,
    envValue TEXT NOT NULL,
    spaceName TEXT NOT NULL,
    FOREIGN KEY (spaceName) REFERENCES Spaces(name)
  );

  CREATE TABLE IF NOT EXISTS Roles (
    name TEXT PRIMARY KEY
  );

  CREATE TABLE IF NOT EXISTS SpaceAccess (
    spaceName TEXT NOT NULL,
    roleName TEXT NOT NULL,
    write INTEGER NOT NULL,
    PRIMARY KEY (spaceName, roleName),
    FOREIGN KEY (spaceName) REFERENCES Spaces(name),
    FOREIGN KEY (roleName) REFERENCES Roles(name)
  );

  CREATE TABLE IF NOT EXISTS Users (
    email TEXT PRIMARY KEY,
    password TEXT NOT NULL,
  );

  CREATE TABLE IF NOT EXISTS UserRoles (
    email TEXT NOT NULL,
    roleName TEXT NOT NULL,
    PRIMARY KEY (email, roleName),
    FOREIGN KEY (email) REFERENCES Users(email),
    FOREIGN KEY (roleName) REFERENCES Roles(name),
  );
`)

// superuser initialization
function initSuper() {
  getUserByEmail(db, config.superuser.email).then((result) => {
    if (result !== null) return;
    createUser(db, { email: config.superuser.email, password: config.superuser.pass });
  })
}
initSuper();

export default db;
