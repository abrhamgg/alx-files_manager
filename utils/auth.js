/* eslint-disable import/no-named-as-default */
/* eslint-disable no-unused-vars */
import sha1 from 'sha1';
import mongodb from 'mongodb';
import { Request } from 'express';
import mongoDBCore from 'mongodb/lib/core';
import dbClient from './db';
import redisClient from './redis';

const getUserFromXToken = async (req) => {
  const token = req.headers['x-token'];

  if (!token) {
    return null;
  }
  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) {
    return null;
  }
  const user = await dbClient.client.db('files_manager').collection('users').findOne({ _id: new mongodb.ObjectId(userId) });
  return user || null;
};

module.exports = getUserFromXToken;
