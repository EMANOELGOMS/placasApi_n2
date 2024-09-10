import express, { Request, response, Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import axios from "axios";
import { connectToDatabase } from "../database/databaseConfig";
import { placas } from "../interface/interface_placa";
import { Users } from "../interface/interface_user";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const rotas_placas = express.Router();

const upload = multer({ dest: "uploads/" });

// POST /cadastroPlaca - Adicionar uma nova placa com OCR
rotas_placas.post(
  "/cadastroPlaca",
  ValidationToken,
  upload.single("foto"),
  async (req: Request, res: Response) => {
    try {
      const db = await connectToDatabase();
      const { cidade } = req.body;

      console.log(cidade);

      // Verificar se o arquivo foi enviado
      if (!req.file) {
        return res.status(400).json({ message: "Nenhuma foto foi enviada." });
      }

      // Converter a imagem para base64
      const imagePath = req.file.path;
      const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });

      console.log(imageBase64);

      // Chamar a API externa de OCR
      const ocrResponse = await axios.post(
        "https://api.ocr.space/parse/image",
        {
          base64Image: "data:image/jpeg;base64," + imageBase64,
          language: "eng",
          isOverlayRequired: "false",
          iscreatesearchablepdf: "false",
          issearchablepdfhidetextlayer: "false",
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
            apiKey: "helloworld",
          },
        }
      );

      const placaNaoTratada = ocrResponse.data.ParsedResults[0].ParsedText;

      const num_placa = validarPlaca(placaNaoTratada);

      //res.status(200).json(ocrResponse.data);
      // // Supondo que a resposta da API contenha o número da placa
      // const num_placa = ocrResponse.data.plateNumber.trim();

      // console.log(num_placa);
      const placaTratada = validarPlaca(placaNaoTratada);

      if (!placaNaoTratada) {
        return res.status(400).json({ message: "placa inválida" });
      }

      const agora = new Date();

      const newPlaca: placas = {
        num_placa: placaTratada as unknown as string,
        cidade,
        foto: req.file.path,
        horario_registro: agora.toLocaleTimeString("pt-BR"), // Horário do registro
        data_registro: agora.toLocaleDateString("pt-BR"), // Data do registro
      };

      await db.collection("placas").insertOne(newPlaca);
      const placaNova = await db.collection("placas").find({}).toArray();
      return res.json(placaNova);
    } catch (err) {
      res.status(500).json({ message: `Erro ao cadastrar placa: ${err}` });
    }
  }
);

function validarPlaca(responseOCR: string) {
  // Expressão regular para encontrar a placa Mercosul
  const placaPattern = /[A-Z]{3}[0-9][A-Z][0-9]{2}/;

  // Encontrando a placa na string

  const placa = responseOCR.match(placaPattern);

  // Exibindo o resultado
  if (placa) {
    console.log(`Placa encontrada: ${placa[0]}`);
    return placa[0];
  } else {
    return;
  }
}

//exibe a placa passada na rota
rotas_placas.get(
  "/consulta/:placa",
  ValidationToken,
  async (req: Request, res: Response) => {
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
  }
);

rotas_placas.get(
  "/relatorio/cidade/:cidade",
  ValidationToken,
  async (req: Request, res: Response) => {
    const cidadeFiltrada = req.params.cidade;

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
        doc.fontSize(25).text("Relatório da Placa", { align: "center" });
        doc.moveDown();
        doc.fontSize(16).text(`Cidade: ${cidadeFiltrada}`);
        doc.moveDown();

        // Adiciona informações da placa ao PDF
        doc.fontSize(14).text(`Placa: ${placaData.num_placa}`);
        doc.text(`Data do registro: ${placaData.data_registro}`);
        doc.text(`Horario do registro: ${placaData.horario_registro}`);
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

//rota de cadastro do ususuario no banco
rotas_placas.post("/cadastro", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const db = await connectToDatabase();
    //busca usuario já cadastrado
    const user = await db.collection("usuarios").findOne({ email });
    console.log(email);

    if (user) {
      return res.status(400).send({ message: "Email já cadastrado" });
    }

    const criptPassword = await bcrypt.hash(password, 10);
    //pega o novo usuaroi
    const novoUsuario: Users = {
      email,
      password: criptPassword,
    };
    //insere o novo usuario no banco
    const result = await db.collection("usuarios").insertOne(novoUsuario);
    // quando é apenas um dado result.acknowledged para verificar no BD
    if (result.acknowledged) {
      console.log(result.insertedId);
      return res
        .status(201)
        .send({ message: "Usuario cadastrado com sucesso", result });
    } else {
      return res.status(500).send({ message: "Erro ao cadastrar usuario" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erro ao cadastrar usuario" });
  }
});

async function ValidationToken(req: Request, res: Response, next: any) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token não encontrado" });
  }
  const db = await connectToDatabase();

  const usersCollectionToken = db.collection("usuarios");
  const user = await usersCollectionToken.findOne({ token });
  console.log(token);

  if (!user) {
    return res.status(401).json({ message: "Token inválido" });
  }
  next();
}

// rota do login do user
// essa rota ira receber o email e senha e devolve um token
rotas_placas.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const db = await connectToDatabase();
    const user = await db.collection("usuarios").findOne({ email });
    if (!user) {
      return res.status(400).send({ message: "Email não encontrado" });
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      return res.status(400).send({ message: "Senha incorreta" });
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    const usersCollection = db.collection("usuarios");
    const userUpdate = await usersCollection.updateOne(
      { _id: user._id },
      { $set: { token } }
    );
    if (userUpdate.modifiedCount === 1) {
      return res.status(200).send({ token });
    } else {
      return res.status(500).send({ message: "Erro ao gerar token" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erro ao fazer login" });
  }
});

// rota do video
rotas_placas.post("/videoTutorial", () => {});

export default rotas_placas;
