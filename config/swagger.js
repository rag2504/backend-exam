const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Support Ticket Management API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3000', description: 'Development' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/auth/login': {
        post: {
          summary: 'Login',
          tags: ['Auth'],
          security: [],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string' }, password: { type: 'string' } } } } }
          },
          responses: { 200: { description: 'Returns JWT and user' }, 401: { description: 'Invalid credentials' } }
        }
      },
      '/users': {
        get: {
          summary: 'List users',
          tags: ['Users'],
          responses: { 200: { description: 'List of users' }, 403: { description: 'MANAGER only' } }
        },
        post: {
          summary: 'Create user',
          tags: ['Users'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['name', 'email', 'password', 'role'], properties: { name: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' }, role: { type: 'string', enum: ['MANAGER', 'SUPPORT', 'USER'] } } } } }
          },
          responses: { 201: { description: 'User created' }, 400: { description: 'Validation error' }, 403: { description: 'MANAGER only' } }
        }
      },
      '/tickets': {
        get: {
          summary: 'List tickets (filtered by role)',
          tags: ['Tickets'],
          responses: { 200: { description: 'List of tickets' } }
        },
        post: {
          summary: 'Create ticket',
          tags: ['Tickets'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['title', 'description'], properties: { title: { type: 'string', minLength: 5 }, description: { type: 'string', minLength: 10 }, priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] } } } } }
          },
          responses: { 201: { description: 'Ticket created' }, 400: { description: 'Validation error' }, 403: { description: 'USER or MANAGER only' } }
        }
      },
      '/tickets/{id}': {
        get: {
          summary: 'Get ticket by ID',
          tags: ['Tickets'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Ticket' }, 404: { description: 'Not found' } }
        },
        delete: {
          summary: 'Delete ticket',
          tags: ['Tickets'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 204: { description: 'Deleted' }, 403: { description: 'MANAGER only' }, 404: { description: 'Not found' } }
        }
      },
      '/tickets/{id}/assign': {
        patch: {
          summary: 'Assign ticket to user',
          tags: ['Tickets'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['assignedTo'],
                  properties: { assignedTo: { type: 'string' } }
                },
                example: { assignedTo: '60f7c2e5b5d3c72f88f1a123' }
              }
            }
          },
          responses: { 200: { description: 'Ticket updated' }, 400: { description: 'Cannot assign to USER' }, 403: { description: 'MANAGER or SUPPORT only' }, 404: { description: 'Not found' } }
        }
      },
      '/tickets/{id}/status': {
        patch: {
          summary: 'Update ticket status (forward only: OPEN→IN_PROGRESS→RESOLVED→CLOSED)',
          tags: ['Tickets'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] } } } } } },
          responses: { 200: { description: 'Ticket updated' }, 400: { description: 'Invalid transition' }, 403: { description: 'MANAGER or SUPPORT only' }, 404: { description: 'Not found' } }
        }
      },
      '/tickets/{id}/comments': {
        get: {
          summary: 'List comments for ticket',
          tags: ['Tickets'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'List of comments' }, 403: { description: 'Access denied' }, 404: { description: 'Ticket not found' } }
        },
        post: {
          summary: 'Add comment to ticket',
          tags: ['Tickets'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['comment'], properties: { comment: { type: 'string' } } } } } },
          responses: { 201: { description: 'Comment created' }, 403: { description: 'Access denied' }, 404: { description: 'Ticket not found' } }
        }
      },
      '/comments/{id}': {
        patch: {
          summary: 'Update comment',
          tags: ['Comments'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['comment'], properties: { comment: { type: 'string' } } } } } },
          responses: { 200: { description: 'Comment updated' }, 403: { description: 'MANAGER or author only' }, 404: { description: 'Not found' } }
        },
        delete: {
          summary: 'Delete comment',
          tags: ['Comments'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 204: { description: 'Deleted' }, 403: { description: 'MANAGER or author only' }, 404: { description: 'Not found' } }
        }
      }
    }
  },
  apis: []
};

module.exports = swaggerJsdoc(options);
