/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import getUserFromXToken from '../utils/auth';

const xTokenAuthenticate = async (req, res, next) => {
  const user = await getUserFromXToken(req);

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.user = user;
  next();
};

module.exports = xTokenAuthenticate;
