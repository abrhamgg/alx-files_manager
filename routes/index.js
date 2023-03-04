import express from 'express';
import Appcontroller from '../controllers/AppController';

const routes = express.Router();

routes.get('/status', Appcontroller.getStatus);
routes.get('/stats', Appcontroller.getStats);

export default routes;