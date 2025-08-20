// CPF and CNPJ validation and formatting utilities

/**
 * Remove all non-numeric characters from a string
 */
export function removeNonNumeric(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Format CPF with mask (000.000.000-00)
 */
export function formatCPF(value: string): string {
  const numbers = removeNonNumeric(value);
  
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
}

/**
 * Format CNPJ with mask (00.000.000/0000-00)
 */
export function formatCNPJ(value: string): string {
  const numbers = removeNonNumeric(value);
  
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
}

/**
 * Auto-format CPF or CNPJ based on length
 */
export function formatCpfCnpj(value: string): string {
  const numbers = removeNonNumeric(value);
  
  if (numbers.length <= 11) {
    return formatCPF(value);
  } else {
    return formatCNPJ(value);
  }
}

/**
 * Validate CPF using algorithm
 */
export function validateCPF(cpf: string): boolean {
  const numbers = removeNonNumeric(cpf);
  
  if (numbers.length !== 11) return false;
  
  // Check for known invalid patterns
  if (/^(\d)\1{10}$/.test(numbers)) return false;
  
  // Validate first digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(numbers[9]) !== digit1) return false;
  
  // Validate second digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(numbers[10]) === digit2;
}

/**
 * Validate CNPJ using algorithm
 */
export function validateCNPJ(cnpj: string): boolean {
  const numbers = removeNonNumeric(cnpj);
  
  if (numbers.length !== 14) return false;
  
  // Check for known invalid patterns
  if (/^(\d)\1{13}$/.test(numbers)) return false;
  
  // Validate first digit
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers[i]) * weights1[i];
  }
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(numbers[12]) !== digit1) return false;
  
  // Validate second digit
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers[i]) * weights2[i];
  }
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(numbers[13]) === digit2;
}

/**
 * Validate CPF or CNPJ based on length
 */
export function validateCpfCnpj(value: string): { isValid: boolean; type: 'CPF' | 'CNPJ' | null } {
  const numbers = removeNonNumeric(value);
  
  if (numbers.length === 11) {
    return {
      isValid: validateCPF(value),
      type: 'CPF'
    };
  } else if (numbers.length === 14) {
    return {
      isValid: validateCNPJ(value),
      type: 'CNPJ'
    };
  }
  
  return {
    isValid: false,
    type: null
  };
}

/**
 * Get person type based on document length
 */
export function getPersonType(value: string): 'F' | 'J' | null {
  const numbers = removeNonNumeric(value);

  // Exact matches
  if (numbers.length === 11) return 'F'; // CPF = Pessoa Física
  if (numbers.length === 14) return 'J'; // CNPJ = Pessoa Jurídica

  // Partial detection for better UX
  if (numbers.length > 11 && numbers.length <= 14) return 'J'; // Likely CNPJ
  if (numbers.length > 0 && numbers.length <= 11) return 'F'; // Likely CPF

  return null;
}
