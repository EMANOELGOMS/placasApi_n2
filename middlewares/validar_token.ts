import { Request, Response } from "express";
import { connectToDatabase } from "../database/databaseConfig";

export async function ValidationToken(req: Request, res: Response, next: any) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token não encontrado" });
  }
  const db = await connectToDatabase();

  const usersCollectionToken = db.collection("usuarios");
  const user = await usersCollectionToken.findOne({ token });
  console.log(token);

  if (!user) {
    console.log("Token inválido");
    return res.status(401).json({ message: "Token inválido" });
  }
  next();
}
