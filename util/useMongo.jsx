import {MongoClient} from 'mongodb';

/**
 * @type {MongoClient}
 * @description global mongo client
 */
global.mongo = global.mongo || {};

/**
 * @async
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @function useDatabase
 * @returns {Promise<import('mongodb').Db>} default database specified in the MONGO_URI
 */
export default async function useDatabase() {
  if (!global.mongo.client) {
    global.mongo.client = new MongoClient(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
  await global.mongo.client.connect();
  return global.mongo.client.db();
}
