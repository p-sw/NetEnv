/**
 * @typedef {{ db: string; superuser: { email: string; pass: string; }; server: { host: string; port: number; }; }} IConfig
 */

/**
 * @type IConfig
 */
export const config = {
  db: "./database.sqlite",
  superuser: {
    email: "super@example.com",
    pass: "superuser",
  },
  server: {
    host: "0.0.0.0",
    port: 5666,
  },
};
