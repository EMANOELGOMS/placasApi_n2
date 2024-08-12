// const hoje = new Date();
// const ano = hoje.getFullYear();
// const mes = hoje.getMonth();
// const dia = hoje.getDate();
// const data = `${ano}-${mes}-${dia}`;

// const dataFormatada = new Date(data)
//   .toISOString()
//   .replace("T", " ")
//   .replace("Z", "");

export interface placas {
  num_placa: string;
  cidade: string;
  foto: string;
  // horatio do registro
  horario_registro: string;
  // horario da data
  data_registro: string;
}
