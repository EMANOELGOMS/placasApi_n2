import express from "express";
import rotas_placas from "./placasVeiculos/placas_veiculos";
import { connectToDatabase } from "./database/databaseConfig";
import dotenv from "dotenv"; // Carregar variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectToDatabase()
  .then(() => {
    app.use(rotas_placas);
    // https:localhost:3003
    app.listen(process.env.PORT || 3003, () => {
      console.log("O servidor esta rodando");
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database", err);
    process.exit(1);
  });
