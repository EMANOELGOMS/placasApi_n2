import { connectToDatabase } from "../database/databaseConfig";
import { Request, Response } from "express";
import express from "express";
import { placas } from "../interface/interface_placa";

const rotas_placas = express.Router();

//adicionar placas
rotas_placas.post("/cadastroPlaca", async (req: Request, res: Response) => {
  try {
    const db = await connectToDatabase();
    const newPlaca: placas = req.body;
    console.log(newPlaca);

    await db.collection("placas").insertOne(newPlaca);
    const placaNova = await db.collection("placas").find({}).toArray();
    return res.json(placaNova);
  } catch (err) {
    res.status(500).json({ message: `Erro ao cadastrar placa ${err}` });
  }
});

rotas_placas.get("/consulta/:placa", async (req: Request, res: Response) => {
  try {
    const db = await connectToDatabase(); //conexão com o banco
    const placa_filter = req.params.placa;
    console.log(placa_filter);

    const placa = await db.collection("placas").find({}).toArray();
    console.log(placa);

    if (placa) {
      return res.json(placa);
    } else {
      return res.send({ message: "Placa não encotrada" });
    }
  } catch (error) {
    res.status(500).json({ message: `Erro ao consultar placa ${error}` });
  }
});

// get com os relatorios
rotas_placas.get("/relatorio/cidade/:cidade", (req: Request, res: Response) => {
  // informações de número da placa, cidade, data e hora dos registros com uma determinada cidade passada no parâmetro
});

export default rotas_placas;
