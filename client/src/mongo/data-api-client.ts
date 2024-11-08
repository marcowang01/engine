import { WithId } from "mongodb"

// https://www.mongodb.com/docs/atlas/app-services/data-api/#when-to-use-the-data-api

async function callMongoDataApi(action: string, body: object) {
  const config = {
    dataSource: process.env.ATLAS_CLUSTER_NAME,
    database: process.env.ATLAS_DB_NAME,
  }

  const fullBody = { ...config, ...body }

  const response = await fetch(
    `${process.env.ATLAS_DATA_API_ENDPOINT}/action/${action}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        apiKey:
          process.env.ATLAS_DATA_API_KEY || "atlas data api key not defined",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fullBody),
    }
  )

  if (!response.ok) {
    throw new Error(`MongoDB API request failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data
}

export async function insertOne<T>(collection: string, document: WithId<T>) {
  return callMongoDataApi("insertOne", {
    collection,
    document,
  })
}

export async function updateOne(
  collection: string,
  filter: object,
  update: object
) {
  return callMongoDataApi("updateOne", {
    collection,
    filter,
    update,
  })
}

export async function upsertOne(
  collection: string,
  filter: object,
  update: object
) {
  return callMongoDataApi("updateOne", {
    collection,
    filter,
    update,
    upsert: true,
  })
}

export async function createIfNotExist<T>(
  collection: string,
  filter: object,
  document: WithId<T>
) {
  const existingDocument = await findOne(collection, filter)
  if (!existingDocument) {
    return insertOne(collection, document)
  }
  return existingDocument
}

export async function findOne(collection: string, filter: object) {
  const result = await callMongoDataApi("findOne", {
    collection,
    filter,
  })
  return result.document
}

export async function deleteOne(collection: string, filter: object) {
  return callMongoDataApi("deleteOne", {
    collection,
    filter,
  })
}
