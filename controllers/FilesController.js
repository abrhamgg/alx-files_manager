import mongodb from 'mongodb';
import mongoDBCore from 'mongodb/lib/core';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { tmpdir } from 'os';
import { join as joinPath } from 'path';
import {
  mkdir, writeFile,
} from 'fs';
import { redisClient } from '../utils/redis';
import dbClient from '../utils/db';

const ROOT_FOLDER = 0;
const mkDirAsync = promisify(mkdir);
const writeFileAsync = promisify(writeFile);
const DEFAULT_ROOT_FOLDER = 'files_manager';
const VALID_FILE_TYPES = {
  folder: 'folder',
  file: 'file',
  image: 'image',
};

export default class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    const user = await dbClient.client.db('files_manager').collection('users').findOne({ _id: new mongodb.ObjectId(userId) });
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const name = req.body.name ? req.body.name : null;
    const type = req.body.type ? req.body.type : null;
    const parentId = req.body.parentId ? req.body.parentId : ROOT_FOLDER;
    const isPublic = req.body.isPublic ? req.body.isPublic : false;
    const data = req.body.data ? req.body.data : null;

    if (!name) {
      res.status(400).json({ error: 'Missing name' });
      return;
    }
    if (!type || !Object.values(VALID_FILE_TYPES).includes(type)) {
      res.status(400).json({ error: 'Missing data' });
      return;
    }
    if (!req.body.data && type !== VALID_FILE_TYPES.folder) {
      res.status(400).json({ error: 'Missing data' });
      return;
    }
    if ((parentId !== ROOT_FOLDER) && (parentId !== ROOT_FOLDER.toString())) {
      const file = await dbClient.db('files_manager').collection('files').findOne({
        _id: new mongodb.ObjectId(parentId),
      });
      if (!file) {
        res.status(400).json({ error: 'Parent not found' });
        return;
      }
      if (file.type !== VALID_FILE_TYPES.folder) {
        res.status(400).json({ error: 'Parent is not a folder' });
        return;
      }
    }
    const ownerId = user._id.toString();
    const baseDir = `${process.env.FOLDER_PATH || ''}`.trim().length > 0
      ? process.env.FOLDER_PATH.trim()
      : joinPath(tmpdir(), DEFAULT_ROOT_FOLDER);
    console.log(baseDir);
    console.log(ownerId);
    const newFile = {
      ownerId: new mongoDBCore.BSON.ObjectId(ownerId),
      name,
      type,
      isPublic,
      parentId: (parentId === ROOT_FOLDER) || (parentId === ROOT_FOLDER.toString())
        ? '0'
        : new mongoDBCore.BSON.ObjectId(parentId),
    };
    await mkDirAsync(baseDir, { recursive: true });
    if (type !== VALID_FILE_TYPES.folder) {
      const localPath = joinPath(baseDir, uuidv4());
      await writeFileAsync(localPath, Buffer.from(data, 'base64'));
      newFile.localPath = localPath;
    }
    const insertionInfo = await dbClient.client.db('files_manager').collection('files').insertOne(newFile);
    const fileId = insertionInfo.insertedId.toString();
    res.status(201).json({
      id: fileId,
      ownerId,
      name,
      type,
      isPublic,
      parentId: (parentId === ROOT_FOLDER) || (parentId === ROOT_FOLDER.toString())
        ? 0
        : parentId,
    });
  }
}
