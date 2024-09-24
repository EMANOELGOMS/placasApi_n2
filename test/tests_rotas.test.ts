import request from "supertest";
import express from "express";
import rotas_placas from "../placasVeiculos/placas_veiculos";
import { connectToDatabase } from "../database/databaseConfig";

// Mockando a conexão com o banco de dados
jest.mock("../database/databaseConfig", () => ({
  connectToDatabase: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use("/", rotas_placas);

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZTA4YmMwMGJjOWJmNmE3ZjRlZWZiZSIsImlhdCI6MTcyNjc0NTg4NiwiZXhwIjoxNzI2NzQ5NDg2fQ.-eOM_GcolkdtVQodZF3mf4jI6Xthoxo1lMfm6RdFUNE";
describe("GET /consulta/:placa", () => {
  beforeAll(() => {
    const mockDb = {
      collection: jest.fn().mockReturnValue({
        findOne: jest
          .fn()
          .mockResolvedValue({ num_placa: "ABC1234", cidade: "Fortaleza" }), // Simulando retorno
      }),
    };

    // Simulando o comportamento da função connectToDatabase
    (connectToDatabase as jest.Mock).mockResolvedValue(mockDb);
  });

  it("deve retornar os dados da placa quando encontrada", async () => {
    const res = await request(app)
      .get("/consulta/ABC1234") // Rota de consulta
      .set("Authorization", `Bearer ${token}`); // Enviar o token no header

    expect(res.status).toBe(200);
    expect(res.body.num_placa).toBe("ABC1234");
    expect(res.body.cidade).toBe("Fortaleza");
    console.log(
      "esse testes deu certo: deve retornar os dados da placa quando encontrada"
    );
  });

  // it("deve retornar 404 quando a placa não for encontrada", async () => {
  //   const mockDb = {
  //     collection: jest.fn().mockReturnValue({
  //       findOne: jest.fn().mockResolvedValue(null), // Simulando que a placa não foi encontrada
  //     }),
  //   };

  //   // Atualizando o mock para esse teste específico
  //   (connectToDatabase as jest.Mock).mockResolvedValue(mockDb);

  //   const res = await request(app)
  //     .get("/consulta/XYZ9999") // Rota de consulta com placa inexistente
  //     .set("Authorization", `Bearer ${token}`);
  //   console.log("Rota Placa Não", token);

  //   expect(res.status).toBe(404);
  //   expect(res.body.message).toBe("Placa não encontrada");
  // });
});

// describe("GET /relatorio/cidade/:cidade", () => {
//   const mockDb2 = {
//     collection: jest.fn().mockReturnValue({
//       findOne: jest.fn().mockResolvedValueOnce(null), // Simulando que o usuário não existe
//       insertOne: jest
//         .fn()
//         .mockResolvedValueOnce({ acknowledged: true, insertedId: "mockDb2" }),
//     }),
//   };

//   jest.mock("../database/databaseConfig", () => ({
//     connectToDatabase: jest.fn().mockResolvedValue(mockDb2),
//   }));

//   // it("deve retornar um PDF com as informações da placa quando a cidade é encontrada", async () => {
//   //   const mockData = {
//   //     num_placa: "ABC1234",
//   //     data_registro: "2023-09-01",
//   //     horario_registro: "14:00",
//   //   };
//   //   console.log("sacas dados entrada", mockData);

//   //   // Mockando o retorno do banco de dados
//   //   mockDb.findOne.mockResolvedValue(mockData);

//   //   const cidade = "Fortaleza";

//   //   const res = await request(app)
//   //     .get(`/relatorio/cidade/${cidade}`)
//   //     .set("Authorization", token); // Se necessário, adicione um token válido para o middleware de validação
//   //   console.log("estou aqui:", token);

//   //   expect(res.statusCode).toBe(200);
//   //   expect(res.headers["content-type"]).toBe("application/pdf");
//   //   expect(res.headers["content-disposition"]).toContain(
//   //     `relatorio_${cidade}.pdf`
//   //   );

//   //   // Se necessário, aqui você pode adicionar verificações adicionais sobre o conteúdo do PDF.
//   // });
//   it("deve retornar 404 quando a cidade não for encontrada no banco de dados", async () => {
//     // Mock do retorno do banco
//     mockDb2.collection.mockReturnValueOnce({
//       findOne: jest.fn().mockResolvedValueOnce(null), // Cidade não encontrada
//     });

//     const res = await request(app)
//       .get("/relatorio/cidade/cidadeInexistente")
//       .set("Authorization", `Bearer ${token}`);

//     expect(res.statusCode).toBe(404);
//     expect(res.body.message).toBe("Nenhum registro encontrado");
//   });
// });

// describe("GET /relatorio/cidade/:cidade", () => {
//   const mockDb2 = {
//     collection: jest.fn().mockReturnValue({
//       findOne: jest.fn().mockResolvedValueOnce(null), // Simulando que o usuário não existe
//       insertOne: jest
//         .fn()
//         .mockResolvedValueOnce({ acknowledged: true, insertedId: "mockDb2" }),
//     }),
//   };

//   jest.mock("../database/databaseConfig", () => ({
//     connectToDatabase: jest.fn().mockResolvedValue(mockDb2),
//   }));
//   it("deve retornar 404 quando a cidade não for encontrada no banco de dados", async () => {
//     mockDb2.collection.mockReturnValueOnce({
//       findOne: jest.fn().mockResolvedValueOnce(null), // Cidade não encontrada
//     });

//     const res = await request(app)
//       .get("/relatorio/cidade/joaoPessoa")
//       .set("Authorization", `Bearer ${token}`);

//     expect(res.statusCode).toBe(404);
//     expect(res.body.message).toBe("Nenhum registro encontrado");
//   });
// });
