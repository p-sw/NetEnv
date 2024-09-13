import Fastify from 'fastify'
import { db } from './db';
import { config } from './config';

const fastify = Fastify({
  logger: true,
});

fastify.listen({ host: config.server.host, port: config.server.port })
