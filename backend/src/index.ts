import { createApplication } from "@specific-dev/framework";
import * as schema from './db/schema/schema.js';
import * as hackathonsRoutes from './routes/hackathons.js';

// Create application with schema for full database type support
export const app = await createApplication(schema);

// Export App type for use in route files
export type App = typeof app;

// Register routes
hackathonsRoutes.register(app, app.fastify);

await app.run();
app.logger.info('Application running');
