import mongodb from 'mongodb';

class DBClinet {
  constructor() {
    this.host = process.env.DB_HOST ? process.env.DB_HOST : 'localhost';
    this.port = process.env.DB_PORT ? process.env.DB_PORT : 27017;
    this.database = process.env.DB_DATABASE ? process.env.DB_DATABASE : 'files_manager';
    const dbURL = `mongodb://${this.host}:${this.port}/${this.database}`;
    this.client = new mongodb.MongoClient(dbURL, { useUnifiedTopology: true });
    this.client.connect();
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return this.client.db().collection('users').countDocuments();
  }

  async nbFiles() {
    return this.client.db().collection('files').countDocuments();
  }
}

const dbClinet = new DBClinet();
module.exports = dbClinet;
