export function validarPlaca(responseOCR: string) {
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
