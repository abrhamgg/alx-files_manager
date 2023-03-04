import express from 'express';
import Appcontroller from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

const routes = express.Router();

routes.get('/status', Appcontroller.getStatus);
routes.get('/stats', Appcontroller.getStats);
routes.post('/users', UsersController.postNew);

export default routes;
