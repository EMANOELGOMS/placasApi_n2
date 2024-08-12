import { MongoClient, Db } from "mongodb";

let db: Db | null = null;
export async function connectToDatabase(): Promise<Db> {
  if (!db) {
    let uri: string;
    uri = process.env.API_DATABASE_NAME as string;

    const client = new MongoClient(uri);
    await client.connect();
    db = client.db("Cluster0"); // nome do seu banco de dados
    console.log("Connected successfully to MongoDB");
  }
  return db;
}
