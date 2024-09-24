import request from "supertest";
import express from "express";
import rotas_placas from "../placasVeiculos/placas_veiculos";
import { connectToDatabase } from "../database/databaseConfig";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
app.use("/", rotas_placas);

jest.mock("../database/databaseConfig.ts", () => ({
  connectToDatabase: jest.fn(),
}));

const mockDb2 = {
  collection: jest.fn().mockReturnThis(),
  findOne: jest.fn().mockResolvedValueOnce(null), // Simulando que o usuário não existe no banco
  insertOne: jest
    .fn()
    .mockResolvedValueOnce({ acknowledged: true, insertedId: "mockId" }),
};

// Simular a função connectToDatabase para retornar o mock do banco
(connectToDatabase as jest.Mock).mockResolvedValue(mockDb2); // Mockando o retorno da função `connectToDatabase`

jest.mock("bcrypt", () => ({
  hash: jest.fn((password) => {
    return `$2b$10$mockedHashForPassword`; // Use um hash fixo aqui
  }),
  // Você pode adicionar outros métodos do bcrypt se necessário
}));

describe("POST /cadastro", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Limpa os mocks após cada teste
  });

  it("deve cadastrar um novo usuário com sucesso", async () => {
    // Mock para quando o usuário ainda não existe no banco de dados
    mockDb2.findOne.mockResolvedValue(null);
    // Mock para o insertOne
    mockDb2.insertOne.mockResolvedValue({
      acknowledged: true,
      insertedId: "123",
    });

    const mockEmail = "joao178@teste.com";
    const mockPassword = "123456789";
    const hashPassword = await bcrypt.hash(mockPassword, 10);

    const res = await request(app)
      .post("/cadastro")
      .send({ email: mockEmail, password: mockPassword });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Usuario cadastrado com sucesso");
    expect(mockDb2.insertOne).toHaveBeenCalledWith({
      email: mockEmail,
      password: hashPassword,
    });
  });
});
