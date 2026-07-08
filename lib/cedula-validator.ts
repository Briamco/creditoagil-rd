// =============================================================================
// CréditoÁgil RD — Validación de Cédula Dominicana
// =============================================================================
// Implementa el algoritmo de dígito verificador utilizado por la
// Junta Central Electoral (JCE) de la República Dominicana.
// Formato: 000-0000000-0 (3 dígitos - 7 dígitos - 1 dígito verificador)
// =============================================================================

/** Expresión regular para el formato de cédula: 000-0000000-0 */
const CEDULA_FORMAT_REGEX = /^\d{3}-\d{7}-\d{1}$/;

/** Expresión regular para cédula sin guiones: 11 dígitos */
const CEDULA_RAW_REGEX = /^\d{11}$/;

/**
 * Valida que una cédula tenga el formato correcto: 000-0000000-0
 * @param cedula - Cédula a validar
 * @returns true si el formato es válido
 */
export function validateCedulaFormat(cedula: string): boolean {
  return CEDULA_FORMAT_REGEX.test(cedula);
}

/**
 * Formatea una cadena de dígitos al formato de cédula: 000-0000000-0
 * Acepta entradas parciales para permitir formatear mientras el usuario escribe.
 * @param rawDigits - Cadena de dígitos sin guiones
 * @returns Cédula formateada
 */
export function formatCedula(rawDigits: string): string {
  // Remover cualquier espacio, guión o no-dígito
  const cleaned = rawDigits.replace(/[^0-9]/g, '').slice(0, 11);

  if (cleaned.length <= 3) {
    return cleaned;
  }
  if (cleaned.length <= 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 10)}-${cleaned.slice(10)}`;
}

/**
 * Calcula el dígito verificador de una cédula dominicana usando el
 * algoritmo de Luhn modificado de la JCE.
 *
 * Algoritmo:
 * 1. Se toman los primeros 10 dígitos de la cédula
 * 2. Se multiplica cada dígito por el peso correspondiente (1,2,1,2,1,2,1,2,1,2)
 * 3. Si el producto es >= 10, se suman los dígitos del producto
 * 4. Se suman todos los resultados
 * 5. El dígito verificador es (10 - (suma % 10)) % 10
 *
 * @param digits - Los primeros 10 dígitos de la cédula (sin guiones)
 * @returns El dígito verificador calculado
 */
function calculateCheckDigit(digits: string): number {
  const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;

  for (let i = 0; i < 10; i++) {
    let product = parseInt(digits[i], 10) * weights[i];

    // Si el producto es >= 10, sumar sus dígitos individuales
    if (product >= 10) {
      product = Math.floor(product / 10) + (product % 10);
    }

    sum += product;
  }

  return (10 - (sum % 10)) % 10;
}

/**
 * Valida una cédula dominicana completa, verificando:
 * 1. Que tenga el formato correcto (000-0000000-0)
 * 2. Que el dígito verificador sea correcto según el algoritmo de la JCE
 *
 * @param cedula - Cédula a validar (con o sin guiones)
 * @returns true si la cédula es válida
 */
export function isValidCedula(cedula: string): boolean {
  // Limpiar la cédula de guiones y espacios
  const cleaned = cedula.replace(/[-\s]/g, '');

  // Verificar que tenga 11 dígitos
  if (!CEDULA_RAW_REGEX.test(cleaned)) {
    return false;
  }

  // Los primeros 10 dígitos
  const first10 = cleaned.slice(0, 10);

  // El dígito verificador proporcionado
  const providedCheck = parseInt(cleaned[10], 10);

  // Calcular el dígito verificador esperado
  const expectedCheck = calculateCheckDigit(first10);

  return providedCheck === expectedCheck;
}
