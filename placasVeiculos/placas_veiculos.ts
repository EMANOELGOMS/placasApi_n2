import express, { Request, Response } from "express";
import multer from "multer";
import { ValidationToken } from "../middlewares/validar_token";
import {
  cadastrar_placa,
  cadastroUsuarios,
  getCidades,
  getPlacas,
  loginUsuario,
} from "../src/authRoutes";

const rotas_placas = express.Router();

const upload = multer({ dest: "uploads/" });

//exibe a placa passada na rota
rotas_placas.get("/consulta/:placa", ValidationToken, getPlacas);

rotas_placas.get("/relatorio/cidade/:cidade", ValidationToken, getCidades);

// POST /cadastroPlaca - Adicionar uma nova placa com OCR
rotas_placas.post(
  "/cadastroPlaca",
  ValidationToken,
  upload.single("foto"),
  cadastrar_placa
);
//rota de cadastro do ususuario no banco
rotas_placas.post("/cadastro", cadastroUsuarios);

// rota do login do user
// essa rota ira receber o email e senha e devolve um token
rotas_placas.post("/login", loginUsuario);

// rota do video
rotas_placas.post(
  "/videoTutorial",
  ValidationToken,
  async (req: Request, res: Response) => {
    const { title, description, url, user_id } = req.body;
  }
);

export default rotas_placas;
