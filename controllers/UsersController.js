/* eslint-disable import/no-named-as-default */
import sha1 from 'sha1';
import dbClient from '../utils/db';

export default class UsersController {
  static async postNew(req, res) {
    const email = req.body ? req.body.email : null;
    const password = req.body ? req.body.password : null;
    const result = await dbClient.findUser(email);
    if (!email) {
      res.status(400);
      res.send({ error: 'Missing email' });
    } else if (!password) {
      res.status(400);
      res.send({ error: 'Missing password' });
    } else if (result) {
      res.status(400);
      res.send({ error: 'Already exist' });
    } else {
      res.status(201);
      console.log('creating user');
      const result = await (await dbClient.addUser(email, sha1(password)));
      return res.status(201).json({ id: result._id, email: result.email });
    }
  }
}
