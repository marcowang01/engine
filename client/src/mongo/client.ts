import "server-only"

import {
  Collection,
  DeleteOptions,
  Document,
  Filter,
  FindOptions,
  MongoClient,
  MongoClientOptions,
  ServerApiVersion,
  UpdateOptions,
  WithId,
} from "mongodb"

const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URL}`
const dbName = process.env.ATLAS_DB_NAME || ""

// TODO: find a way to do type checking but maybe fine for now?
// TODO: add more logging

export const defaultMongoOptions: MongoClientOptions = {
  ssl: true,
  serverApi: {
    version: ServerApiVersion.v1,
    deprecationErrors: true,
  },
}

export async function withMongoClient(
  callback: (client: MongoClient) => Promise<void>,
  options?: MongoClientOptions
) {
  const client = new MongoClient(uri, options || defaultMongoOptions)

  try {
    await client.connect()
    await callback(client)
  } catch (e) {
    console.error("Mongo client error: ", e)
  } finally {
    await client.close()
  }
}

export async function withMongoCollection<T extends Document>(
  collectionName: string,
  callback: (collection: Collection<T>) => Promise<void>
) {
  await withMongoClient(async (client) => {
    const db = client.db(dbName)
    const collection = db.collection<T>(collectionName)
    await callback(collection)
  })
}

export async function insertOne<T>(collectionName: string, document: WithId<T>) {
  await withMongoCollection(collectionName, async (collection) => {
    await collection.insertOne(document)
  })
}

export async function findOne<T>(
  collectionName: string,
  filter: Filter<Document>,
  options?: FindOptions
): Promise<T | null> {
  let result: Document | null = null

  await withMongoCollection(collectionName, async (collection) => {
    result = await collection.findOne(filter, options)
  })

  return result
}

export async function findManyAsArray(
  collectionName: string,
  filter: Filter<Document>,
  options?: FindOptions
): Promise<Document[]> {
  let results: Document[] = []

  await withMongoCollection(collectionName, async (collection) => {
    results = await collection.find(filter, options).toArray()
  })

  return results
}

export async function updateOne(
  collectionName: string,
  filter: Filter<Document>,
  update: Document,
  options?: UpdateOptions
) {
  await withMongoCollection(collectionName, async (collection) => {
    const res = await collection.updateOne(filter, update, options)
    console.log(res)
  })
}

export async function deleteMany(
  collectionName: string,
  filter: Filter<Document>,
  options?: DeleteOptions
) {
  await withMongoCollection(collectionName, async (collection) => {
    const res = await collection.deleteMany(filter, options)
    console.log("Deleted " + res.deletedCount + " documents")
  })
}

export async function ping() {
  const pingCb = async (client: MongoClient) => {
    await client.db("admin").command({ ping: 1 })
    console.log("Pinged your deployment. You successfully connected to MongoDB!")
  }

  await withMongoClient(pingCb)
}
