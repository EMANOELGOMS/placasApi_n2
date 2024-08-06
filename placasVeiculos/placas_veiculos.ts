import { connectToDatabase } from "../database/databaseConfig";
import { Request, Response } from "express";
import express from "express";
import { placas } from "../interface/interface_placa";

const rotas_placas = express.Router();

//adicionar uma nova placa
rotas_placas.post("/cadastroPlaca", async (req: Request, res: Response) => {
  try {
    const db = await connectToDatabase();
    const newPlaca: placas = req.body;

    await db.collection("placas").insertOne(newPlaca);
    const placaNova = await db.collection("placas").find({}).toArray();
    return res.json(placaNova);
  } catch (err) {
    res.status(500).json({ message: `Erro ao cadastrar placa ${err}` });
  }
});

//exibe a placa passada na rota
rotas_placas.get("/consulta/:placa", async (req: Request, res: Response) => {
  const placaFilter = req.params.placa;
  try {
    const db = await connectToDatabase();
    console.log("Placa filtrada:", placaFilter);

    const placa = await db.collection("placas").findOne({ placa: placaFilter });
    console.log("Placa encontrada:", placa);

    if (placa) {
      return res.json(placa);
    } else {
      return res.status(404).send({ message: "Placa não encontrada" });
    }
  } catch (err) {
    console.error("Erro ao consultar placa:", err);
    res.status(500).json({ message: `Erro ao consultar placa: ${err}` });
  }
});

// get com os relatorios
rotas_placas.get("/relatorio/cidade/:cidade", (req: Request, res: Response) => {
  // informações de número da placa, cidade, data e hora dos registros com uma determinada cidade passada no parâmetro
});

export default rotas_placas;
