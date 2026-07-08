// =============================================================================
// CréditoÁgil RD — Calendario de Días Feriados de la República Dominicana
// =============================================================================
// Implementa las reglas de la Ley 139-97 que establece los días no laborables
// y el movimiento de ciertos feriados al lunes más cercano.
// =============================================================================

/**
 * Feriado dominicano con información de si es movible al lunes.
 */
interface DominicanHoliday {
  /** Nombre del feriado */
  name: string;
  /** Mes (1-12) */
  month: number;
  /** Día del mes */
  day: number;
  /** Si el feriado se mueve al lunes según la Ley 139-97 */
  movesToMonday: boolean;
}

/**
 * Feriados fijos de la República Dominicana.
 * Los feriados marcados como movesToMonday se trasladan al lunes más cercano
 * según la Ley 139-97 (excepto cuando caen en domingo, se mueven al lunes siguiente).
 */
const FIXED_HOLIDAYS: DominicanHoliday[] = [
  { name: 'Año Nuevo', month: 1, day: 1, movesToMonday: false },
  { name: 'Día de Duarte', month: 1, day: 26, movesToMonday: true },
  { name: 'Día de la Independencia', month: 2, day: 27, movesToMonday: false },
  { name: 'Día del Trabajo', month: 5, day: 1, movesToMonday: true },
  { name: 'Día de la Restauración', month: 8, day: 16, movesToMonday: false },
  { name: 'Día de las Mercedes', month: 9, day: 24, movesToMonday: true },
  { name: 'Día de la Constitución', month: 11, day: 6, movesToMonday: true },
  { name: 'Navidad', month: 12, day: 25, movesToMonday: false },
];

/**
 * Calcula la fecha de Pascua (Easter Sunday) usando el algoritmo de Gauss/Meeus.
 * Necesario para calcular Viernes Santo y Corpus Christi.
 */
function calculateEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

/**
 * Calcula Viernes Santo para un año dado.
 * Es 2 días antes del Domingo de Pascua.
 */
function calculateGoodFriday(year: number): Date {
  const easter = calculateEasterSunday(year);
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  return goodFriday;
}

/**
 * Calcula Corpus Christi para un año dado.
 * Es 60 días después del Domingo de Pascua (jueves).
 * En RD se mueve al lunes más cercano según la Ley 139-97.
 */
function calculateCorpusChristi(year: number): Date {
  const easter = calculateEasterSunday(year);
  const corpus = new Date(easter);
  corpus.setDate(easter.getDate() + 60);
  return moveToMonday(corpus);
}

/**
 * Mueve una fecha al lunes más cercano según la Ley 139-97:
 * - Si cae lunes: se queda
 * - Si cae martes, miércoles: se mueve al lunes anterior
 * - Si cae jueves, viernes, sábado, domingo: se mueve al lunes siguiente
 */
function moveToMonday(date: Date): Date {
  const result = new Date(date);
  const dayOfWeek = result.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab

  if (dayOfWeek === 1) {
    // Ya es lunes
    return result;
  } else if (dayOfWeek === 2) {
    // Martes → lunes anterior (-1)
    result.setDate(result.getDate() - 1);
  } else if (dayOfWeek === 3) {
    // Miércoles → lunes anterior (-2)
    result.setDate(result.getDate() - 2);
  } else if (dayOfWeek === 4) {
    // Jueves → lunes siguiente (+4)
    result.setDate(result.getDate() + 4);
  } else if (dayOfWeek === 5) {
    // Viernes → lunes siguiente (+3)
    result.setDate(result.getDate() + 3);
  } else if (dayOfWeek === 6) {
    // Sábado → lunes siguiente (+2)
    result.setDate(result.getDate() + 2);
  } else {
    // Domingo → lunes siguiente (+1)
    result.setDate(result.getDate() + 1);
  }

  return result;
}

/**
 * Obtiene la fecha efectiva de un feriado fijo para un año dado,
 * aplicando la regla de movimiento al lunes si corresponde.
 */
function getEffectiveHolidayDate(holiday: DominicanHoliday, year: number): Date {
  const date = new Date(year, holiday.month - 1, holiday.day);

  if (holiday.movesToMonday) {
    return moveToMonday(date);
  }

  return date;
}

/**
 * Obtiene todos los feriados efectivos para un año dado,
 * incluyendo feriados fijos (con movimiento a lunes) y movibles
 * (Viernes Santo y Corpus Christi).
 */
function getHolidaysForYear(year: number): Date[] {
  const holidays: Date[] = [];

  // Feriados fijos (con posible movimiento al lunes)
  for (const holiday of FIXED_HOLIDAYS) {
    holidays.push(getEffectiveHolidayDate(holiday, year));
  }

  // Feriados movibles
  holidays.push(calculateGoodFriday(year));
  holidays.push(calculateCorpusChristi(year));

  return holidays;
}

/**
 * Compara dos fechas ignorando la hora (solo año, mes, día).
 */
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// =============================================================================
// Funciones Públicas
// =============================================================================

/**
 * Verifica si una fecha es un feriado dominicano.
 * @param date - Fecha a verificar
 * @returns true si es feriado
 */
export function isHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const holidays = getHolidaysForYear(year);
  return holidays.some((holiday) => isSameDay(date, holiday));
}

/**
 * Verifica si una fecha es un día laborable en República Dominicana.
 * Un día laborable es de lunes a viernes y no es feriado.
 * @param date - Fecha a verificar
 * @returns true si es día laborable
 */
export function isBusinessDay(date: Date): boolean {
  const dayOfWeek = date.getDay();

  // Sábado (6) o Domingo (0) no son laborables
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }

  // Verificar si es feriado
  if (isHoliday(date)) {
    return false;
  }

  return true;
}

/**
 * Obtiene el siguiente día laborable a partir de una fecha.
 * Si la fecha dada ya es día laborable, retorna la misma fecha.
 * @param date - Fecha de inicio
 * @returns Siguiente día laborable
 */
export function nextBusinessDay(date: Date): Date {
  const result = new Date(date);

  while (!isBusinessDay(result)) {
    result.setDate(result.getDate() + 1);
  }

  return result;
}

/**
 * Suma una cantidad de días laborables a una fecha.
 * @param startDate - Fecha de inicio
 * @param days - Cantidad de días laborables a agregar
 * @returns Fecha resultante (siempre un día laborable)
 */
export function addBusinessDays(startDate: Date, days: number): Date {
  const result = new Date(startDate);
  let added = 0;

  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (isBusinessDay(result)) {
      added++;
    }
  }

  return result;
}
