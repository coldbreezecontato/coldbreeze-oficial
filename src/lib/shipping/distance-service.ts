// lib/shipping/distance-service.ts

export class DistanceService {
  static async calculate(city: string, state: string): Promise<number> {
    const cidade = city.trim().toLowerCase();
    const uf = state.trim().toUpperCase();

    const tabelaFrete: Record<string, number> = {
      "são paulo": 14.9,
      osasco: 12.9,
      guarulhos: 15.9,
      campinas: 16.9,
      "rio de janeiro": 24.9,
      niteroi: 23.9,
      santos: 18.9,
      curitiba: 25.9,
      florianopolis: 27.9,
      portoalegre: 29.9,
      salvador: 29.9,
      recife: 31.9,
      fortaleza: 33.9,
      natal: 32.9,
      manaus: 39.9,
      belem: 35.9,
      brasilia: 27.9,
      goiania: 28.9,
      cuiaba: 30.9,
      campo_grande: 29.9,
    };

    const valor = tabelaFrete[cidade] ?? 39.9;

    // Simula latência real de API
    await new Promise(res => setTimeout(res, 200));

    return valor;
  }
}
