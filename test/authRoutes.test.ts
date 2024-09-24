import request from "supertest";
import express from "express";
import rotas_placas from "../placasVeiculos/placas_veiculos";
import { connectToDatabase } from "../database/databaseConfig";
//import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const bcrypt = require("bcrypt");

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mocked_token"),
}));

// Mockando a função de conexão ao banco de dados
jest.mock("../database/databaseConfig", () => ({
  connectToDatabase: jest.fn(),
}));

// Mockando jwt
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  compare: jest.fn((password, hashedPassword) => {
    return Promise.resolve(password === "123456789"); // Senha mockada
  }),
}));

const app = express();
app.use(express.json());
app.use("/", rotas_placas);

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZWI2MzFlNTBmYTliNDc2ZWE1YjIyMCIsImlhdCI6MTcyNzEzODEwMSwiZXhwIjoxNzI3MTQxNzAxfQ.9FyeH8e3BUqzSO8BObpN2K8C35_v2rWGI2S_IDVhLsw";

describe("POST /login", () => {
  beforeAll(() => {
    const mockDb = {
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue({
          email: "emanoelteste@teste.com",
          password: "123456789",
        }),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      }),
    };

    (connectToDatabase as jest.Mock).mockResolvedValue(mockDb);
  });

  it("deve retornar um token quando o login for bem-sucedido", async () => {
    const mockUser = {
      email: "emanoelteste@teste.com",
      password: "123456789",
    };

    // Mockando a busca de usuário e comparação de senha
    (connectToDatabase as jest.Mock).mockResolvedValueOnce({
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockUser),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      }),
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue(token);

    const res = await request(app)
      .post("/login")
      .send({ email: "emanoelteste@teste.com", password: "123456789" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBe(token);
  });

  it("deve retornar 400 se o email não for encontrado", async () => {
    (connectToDatabase as jest.Mock).mockResolvedValueOnce({
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue(null),
        updateOne: jest.fn(),
      }),
    });

    const res = await request(app)
      .post("/login")
      .send({ email: "naoexistente@example.com", password: "senhaQualquer" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email não encontrado");
  });
});

describe("Testes das Rotas cadastro de usuarios ", () => {
  // Teste para o cadastro de usuário
  it("POST /cadastro - usuario existente", async () => {
    const response = await request(app).post("/cadastro").send({
      email: "emanoelteste@teste.com",
      password: "senhaSegura123",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message", "Email já cadastrado");
  });
});
