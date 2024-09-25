import { Request, Response } from "express";
import fs from "fs";
import axios from "axios";
import { connectToDatabase } from "../database/databaseConfig";
import { placas } from "../interface/interface_placa";
import { validarPlaca } from "../middlewares/validation_placas";

import { Users } from "../interface/interface_user";
import bcrypt from "bcrypt";
const jwt = require("jsonwebtoken");

export const cadastrar_placa = async (req: Request, res: Response) => {
  try {
    const db = await connectToDatabase();
    const { cidade } = req.body;

    // Verificar se o arquivo foi enviado
    if (!req.file) {
      return res.status(400).json({ message: "Nenhuma foto foi enviada." });
    }

    // Converter a imagem para base64
    const imagePath = req.file.path;
    const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });

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
  } catch (error) {
    res.status(500).json({ message: "Erro ao cadastrar placa: ${err}`" });
  }
};

export const getPlacas = async (req: Request, res: Response) => {
  const placaFilter = req.params.placa;
  try {
    const db = await connectToDatabase();

    const filtrandoPlaca = { num_placa: placaFilter };

    const placa = await db.collection("placas").findOne(filtrandoPlaca);

    if (placa) {
      return res.json(placa);
    } else {
      return res.status(404).send({ message: "Placa não encontrada" });
    }
  } catch (err) {
    console.error("Erro ao consultar placa:", err);
    res.status(500).json({ message: `Erro ao consultar placa: ${err}` });
  }
};

export const getCidades = async (req: Request, res: Response) => {
  const cidadeFiltrada = req.params.cidade;

  var PDFDocument = require("pdfkit");

  try {
    const db = await connectToDatabase();

    const placaData = await db
      .collection("placas")
      .findOne({ cidade: cidadeFiltrada });
    console.log("findOne", placaData);

    if (!placaData) {
      console.log("estouuuu 404");
      return res.status(404).send({ message: "Nenhum registro encontrado" });
    } else {
    }
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
  } catch (err) {
    res.status(500).json({ message: `Erro ao consultar relatório: ${err}` });
  }
};

export const cadastroUsuarios = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log("corpo da requisição", req.body);

  try {
    const db = await connectToDatabase();
    //busca usuario já cadastrado
    const user = await db.collection("usuarios").findOne({ email });
<<<<<<< HEAD
    console.log("email buscado", email);
    console.log("email do banco", user);
=======
>>>>>>> 2f0de5d5be72c366633f0d0b4f1e7faa0175201a

    if (user) {
      console.log("Email já cadastrado");

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
      return res
        .status(201)
        .send({ message: "Usuario cadastrado com sucesso", result });
    } else {
      return res.status(500).send({ message: "Erro ao cadastrar usuario" });
    }
  } catch (error) {
<<<<<<< HEAD
    console.log(error);
    console.log("Erro ao cadastrar usuario");

    return res.status(500).json({ message: "Erro ao cadastrar usuario" });
=======
    return res
      .status(500)
      .json({ message: "Erro ao cadastrar usuario", error });
>>>>>>> 2f0de5d5be72c366633f0d0b4f1e7faa0175201a
  }
};

export const loginUsuario = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const db = await connectToDatabase();
    const user = await db.collection("usuarios").findOne({ email });
    console.log("usuario_email1: ", user);

    if (!user) {
      console.log("Email não encontrado");

      return res.status(400).send({ message: "Email não encontrado" });
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      console.log("Senha incorreta");

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
    console.log("usuario update", userUpdate);
    if (userUpdate.modifiedCount === 1) {
      console.log("token:hg", token);

      return res.status(200).send({ token });
    } else {
      console.log("Erro ao gerar token");

      return res.status(500).send({ message: "Erro ao gerar token" });
    }
  } catch (error) {
<<<<<<< HEAD
    console.log("Erro ao fazer login", error);
    return res.status(500).json({ message: "Erro ao fazer login" });
=======
    return res.status(500).json({ message: "Erro ao fazer login", error });
>>>>>>> 2f0de5d5be72c366633f0d0b4f1e7faa0175201a
  }
};

// Função para criar o vídeo
const createVideo = async (
  title: string,
  description: string,
  url: string,
  user_id: string
) => {
  try {
    const db = await connectToDatabase();
    const videoCollection = db.collection("videos");
    const result = await videoCollection.insertOne({
      title,
      description,
      url,
      user_id,
      created_at: new Date(),
    });

    // Retorna o vídeo inserido usando o insertedId
    return await videoCollection.findOne({ _id: result.insertedId });
  } catch (error) {
    throw new Error("Falha na criação do video");
  }
};

// Rota para o vídeo tutorial
export const videoTutorial = async (req: Request, res: Response) => {
  const { title, description, url, user_id } = req.body;

  if (!title || !description || !url || !user_id) {
    return res.status(400).json({ error: "Coloque os parametros de entrada" });
  }

  try {
    const video = await createVideo(title, description, url, user_id);
    if (!video) {
      return res.status(500).json({ error: "Falha na criação do video" });
    }
    return res.status(201).json(video);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erro na construção do video", error });
  }
};
<<<<<<< HEAD
=======
//link do video https://drive.google.com/file/d/1C-1tf1WzOvwEPZ6JnU42kwcYIg6ObbhX/view?usp=drive_link
>>>>>>> 2f0de5d5be72c366633f0d0b4f1e7faa0175201a
