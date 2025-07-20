import serverlessExpress from '@vendia/serverless-express';
import app from '../server.js'; // adjust path to your Express app export

export default serverlessExpress({ app });
