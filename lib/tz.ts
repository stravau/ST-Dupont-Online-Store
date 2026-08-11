// Conversões de fuso para a operação (Europe/Lisbon).
//
// O servidor corre em UTC. As folhas do ECI trazem hora de PAREDE de Lisboa
// ("15:30" = 15:30 na loja), e o que estava a acontecer era gravar-se isso
// como 15:30 UTC. No verão (Lisboa = UTC+1) o ecrã mostrava 16:30 — uma hora
// à frente. No inverno (UTC+0) coincidia, por isso o erro passava despercebido
// metade do ano.

const LISBON = "Europe/Lisbon";

// Desvio de Lisboa face a UTC, em milissegundos, no instante dado.
// (+3600000 no verão, 0 no inverno.)
export function lisbonOffsetMs(at: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: LISBON,
    hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const p: Record<string, string> = {};
  for (const part of dtf.formatToParts(at)) if (part.type !== "literal") p[part.type] = part.value;
  const comoUtc = Date.UTC(
    Number(p.year), Number(p.month) - 1, Number(p.day),
    Number(p.hour) % 24, Number(p.minute), Number(p.second),
  );
  return comoUtc - at.getTime();
}

// Hora de parede de Lisboa → instante UTC correcto.
//   lisbonToUtc(2026, 7, 10, 15, 30)  // 10/ago 15:30 em Lisboa
//     → 2026-08-10T14:30:00Z  (verão, UTC+1)
// O segundo cálculo do desvio cobre os dias de mudança de hora, em que o
// desvio no instante ingénuo difere do desvio no instante real.
export function lisbonToUtc(
  ano: number, mes0: number, dia: number,
  horas = 0, minutos = 0, segundos = 0,
): Date {
  const ingenuo = Date.UTC(ano, mes0, dia, horas, minutos, segundos);
  const off1 = lisbonOffsetMs(new Date(ingenuo));
  let ts = ingenuo - off1;
  const off2 = lisbonOffsetMs(new Date(ts));
  if (off2 !== off1) ts = ingenuo - off2;
  return new Date(ts);
}

// Igual, a partir de um Date que representa o DIA (em UTC) + segundos desde
// a meia-noite — a forma como os importadores do ECI leem as folhas.
export function lisbonDayPlusSeconds(diaUtc: Date, segundos: number): Date {
  return lisbonToUtc(
    diaUtc.getUTCFullYear(), diaUtc.getUTCMonth(), diaUtc.getUTCDate(),
    0, 0, segundos,
  );
}

// "HH:MM" de um instante, na hora de Lisboa. Estava duplicado em três sítios.
export function lisbonHhmm(d: Date): string {
  return d.toLocaleTimeString("pt-PT", { timeZone: LISBON, hour: "2-digit", minute: "2-digit" });
}
