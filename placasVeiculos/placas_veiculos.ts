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

// rotas_placas.get(
//   "/relatorio/cidade/:cidade",
//   async (req: Request, res: Response) => {
//     const doc = require("fs");
//     let Document_PDF = "pdfkit";

//     // informações de número da placa, cidade, data e hora dos registros com uma determinada cidade passada no parâmetro
//     const cidadeFiltrada = req.params.cidade;

//     try {
//       const db = await connectToDatabase();
//       console.log("Cidade filtrada", cidadeFiltrada);

//       const placaData = await db
//         .collection("placas")
//         .findOne({ cidade: cidadeFiltrada });

//       if (placaData) {
//         return res.json(placaData);
//       } else {
//         return res.status(404).send({ message: "Placa não encontrada" });
//       }
//     } catch (err) {
//       res.status(500).json({ message: `Erro ao consultar relatório: ${err}` });
//     }
//   }
// );

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
        // Continue adicionando mais informações conforme necessário

        // Finaliza o documento e envia como resposta
        doc.pipe(res);
        doc.end();
      } else {
        return res.status(404).send({ message: "Placa não encontrada" });
      }
    } catch (err) {
      res.status(500).json({ message: `Erro ao consultar relatório: ${err}` });
    }
  }
);

export default rotas_placas;

// const fs = require("fs");
// let relatorio_PDF = require("pdfkit");

// let doc = new relatorio_PDF();
// doc.fontSize(20).text('Relatório de Placa', 100, 100);
// doc.fontSize(15).text('Placa: ' + placaFilter, 100,120);
// doc.save('relatorio.pdf');

// fs.readFile('relatorio.pdf', (err, data) => {
//   if (err) {
//     res.status(500).json({ message: `Erro ao gerar relatório ${err}`
//     });
//   } else {
//     res.download('relatorio.pdf', 'relatorio.pdf');
//   }
// });
