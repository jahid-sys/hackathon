import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema/schema.js';
import type { App } from '../index.js';

interface CreateHackathonBody {
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  prize: string;
  participants?: number;
  imageUrl?: string;
}

export function register(app: App, fastify: FastifyInstance) {
  fastify.get('/api/hackathons', {
    schema: {
      description: 'Get all hackathons',
      tags: ['hackathons'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              description: { type: 'string' },
              location: { type: 'string' },
              startDate: { type: 'string', format: 'date-time' },
              endDate: { type: 'string', format: 'date-time' },
              prize: { type: 'string' },
              participants: { type: 'integer' },
              imageUrl: { type: ['string', 'null'] },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    app.logger.info({}, 'Fetching all hackathons');
    try {
      const hackathons = await app.db.select().from(schema.hackathons);
      app.logger.info({ count: hackathons.length }, 'Hackathons fetched successfully');
      return hackathons;
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch hackathons');
      throw error;
    }
  });

  fastify.get('/api/hackathons/:id', {
    schema: {
      description: 'Get a specific hackathon by ID',
      tags: ['hackathons'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid', description: 'Hackathon ID' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            location: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            prize: { type: 'string' },
            participants: { type: 'integer' },
            imageUrl: { type: ['string', 'null'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;
    app.logger.info({ hackathonId: id }, 'Fetching hackathon');
    try {
      const hackathon = await app.db.query.hackathons.findFirst({
        where: eq(schema.hackathons.id, id),
      });
      if (!hackathon) {
        app.logger.warn({ hackathonId: id }, 'Hackathon not found');
        return reply.status(404).send({ error: 'Hackathon not found' });
      }
      app.logger.info({ hackathonId: id }, 'Hackathon fetched successfully');
      return hackathon;
    } catch (error) {
      app.logger.error({ err: error, hackathonId: id }, 'Failed to fetch hackathon');
      throw error;
    }
  });

  fastify.post('/api/hackathons', {
    schema: {
      description: 'Create a new hackathon',
      tags: ['hackathons'],
      body: {
        type: 'object',
        required: ['name', 'description', 'location', 'startDate', 'endDate', 'prize'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          location: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          prize: { type: 'string' },
          participants: { type: 'integer', default: 0 },
          imageUrl: { type: 'string' },
        },
      },
      response: {
        201: {
          description: 'Hackathon created successfully',
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            location: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            prize: { type: 'string' },
            participants: { type: 'integer' },
            imageUrl: { type: ['string', 'null'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (
    request: FastifyRequest<{ Body: CreateHackathonBody }>,
    reply: FastifyReply
  ) => {
    const { name, description, location, startDate, endDate, prize, participants = 0, imageUrl } = request.body;
    app.logger.info({ name, location }, 'Creating hackathon');
    try {
      const hackathon = await app.db
        .insert(schema.hackathons)
        .values({
          name,
          description,
          location,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          prize,
          participants,
          imageUrl: imageUrl || null,
        })
        .returning();
      app.logger.info({ hackathonId: hackathon[0].id, name }, 'Hackathon created successfully');
      return reply.status(201).send(hackathon[0]);
    } catch (error) {
      app.logger.error({ err: error, name, location }, 'Failed to create hackathon');
      throw error;
    }
  });
}
