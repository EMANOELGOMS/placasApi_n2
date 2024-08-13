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

    const filtrandoPlaca = { num_placa: placaFilter };

    const placa = await db.collection("placas").findOne(filtrandoPlaca);

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

rotas_placas.get(
  "/relatorio/cidade/:cidade",
  async (req: Request, res: Response) => {
    const cidadeFiltrada = req.params.cidade;

    const fs = require("fs");
    var PDFDocument = require("pdfkit");

    try {
      const db = await connectToDatabase();
      console.log("Cidade filtrada", cidadeFiltrada);

      const placaData = await db
        .collection("placas")
        .findOne({ cidade: cidadeFiltrada });

      if (placaData) {
        const doc = new PDFDocument();

        // Configura o cabeçalho da resposta HTTP para enviar um PDF
        res.setHeader(
          "Content-disposition",
          `attachment; filename=relatorio_${cidadeFiltrada}.pdf`
        );
        res.setHeader("Content-type", "application/pdf");

        // Criar o conteúdo do PDF
        doc.fontSize(25).text("Relatório de Placas", { align: "center" });
        doc.moveDown();
        doc.fontSize(16).text(`Cidade: ${cidadeFiltrada}`);
        doc.moveDown();

        // Adiciona informações da placa ao PDF
        doc.fontSize(14).text(`Número da Placa: ${placaData.num_placa}`);
        doc.text(`Data: ${placaData.data_registro}`);
        doc.text(`Hora: ${placaData.horario_registro}`);
        doc.text(`Foto: ${placaData.foto}`);

        doc.pipe(res);
        doc.end();
      } else {
        return res.status(404).send({ message: "Nenhum registro encontrado" });
      }
    } catch (err) {
      res.status(500).json({ message: `Erro ao consultar relatório: ${err}` });
    }
  }
);

export default rotas_placas;
