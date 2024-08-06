export interface placas {
  num_placa: string;
  cidade: string;
  foto: string;
}

// get com os  para consultar placas
// rotas_placas.get("/consulta/:placa", (req: Request, res: Response) => {
//   const num_placa = req.params.placa;
//   console.log(num_placa);

//   const placa_pesquisada = placas_array.find((placa) => {
//     return placa.num_placa === num_placa;
//   });
//   res.status(200).json(placa_pesquisada);
// });

// const addPlaca = req.body;
// console.log(addPlaca);

// placas_array.push(addPlaca);
// res.status(200).json(placas_array);
