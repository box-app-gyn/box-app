export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  value: any;
}

export interface FormValidationRules {
  [fieldName: string]: ValidationRule;
}

export class Validator {
  private rules: FormValidationRules;

  constructor(rules: FormValidationRules) {
    this.rules = rules;
  }

  validate(data: Record<string, any>): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};

    for (const [fieldName, rule] of Object.entries(this.rules)) {
      const value = data[fieldName];
      results[fieldName] = this.validateField(value, rule, fieldName);
    }

    return results;
  }

  private validateField(value: any, rule: ValidationRule, fieldName: string): ValidationResult {
    const errors: string[] = [];

    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors.push(rule.message || `${fieldName} é obrigatório`);
      return { isValid: false, errors, value };
    }

    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'string') {
        const trimmedValue = value.trim();
        
        if (rule.minLength && trimmedValue.length < rule.minLength) {
          errors.push(rule.message || `${fieldName} deve ter pelo menos ${rule.minLength} caracteres`);
        }

        if (rule.maxLength && trimmedValue.length > rule.maxLength) {
          errors.push(rule.message || `${fieldName} deve ter no máximo ${rule.maxLength} caracteres`);
        }

        if (rule.pattern && !rule.pattern.test(trimmedValue)) {
          errors.push(rule.message || `${fieldName} tem formato inválido`);
        }

        if (rule.custom) {
          const customResult = rule.custom(trimmedValue);
          if (typeof customResult === 'string') {
            errors.push(customResult);
          } else if (!customResult) {
            errors.push(rule.message || `${fieldName} é inválido`);
          }
        }
      } else if (rule.custom) {
        const customResult = rule.custom(value);
        if (typeof customResult === 'string') {
          errors.push(customResult);
        } else if (!customResult) {
          errors.push(rule.message || `${fieldName} é inválido`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      value: typeof value === 'string' ? value.trim() : value
    };
  }
}

export const commonValidators = {
  email: (value: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value);
  },

  phone: (value: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
  },

  cpf: (value: string): boolean => {
    const cleanCpf = value.replace(/[\s\-\.]/g, '');
    if (cleanCpf.length !== 11 || /^(\d)\1{10}$/.test(cleanCpf)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf[10])) return false;

    return true;
  },

  cnpj: (value: string): boolean => {
    const cleanCnpj = value.replace(/[\s\-\.\/]/g, '');
    if (cleanCnpj.length !== 14 || /^(\d)\1{13}$/.test(cleanCnpj)) {
      return false;
    }

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanCnpj[i]) * weights1[i];
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;
    if (digit1 !== parseInt(cleanCnpj[12])) return false;

    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleanCnpj[i]) * weights2[i];
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;
    if (digit2 !== parseInt(cleanCnpj[13])) return false;

    return true;
  },

  url: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  numeric: (value: string): boolean => {
    return /^\d+$/.test(value);
  },

  decimal: (value: string): boolean => {
    return /^\d+(\.\d+)?$/.test(value);
  },

  date: (value: string): boolean => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  },

  futureDate: (value: string): boolean => {
    const date = new Date(value);
    const now = new Date();
    return !isNaN(date.getTime()) && date > now;
  },

  pastDate: (value: string): boolean => {
    const date = new Date(value);
    const now = new Date();
    return !isNaN(date.getTime()) && date < now;
  },

  minValue: (min: number) => (value: number): boolean => {
    return typeof value === 'number' && value >= min;
  },

  maxValue: (max: number) => (value: number): boolean => {
    return typeof value === 'number' && value <= max;
  },

  range: (min: number, max: number) => (value: number): boolean => {
    return typeof value === 'number' && value >= min && value <= max;
  }
};

export const formValidationSchemas = {
  userRegistration: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
      message: 'Nome deve conter apenas letras e espaços'
    },
    email: {
      required: true,
      custom: commonValidators.email,
      message: 'Email inválido'
    },
    phone: {
      required: true,
      custom: commonValidators.phone,
      message: 'Telefone inválido'
    },
    cpf: {
      required: true,
      custom: commonValidators.cpf,
      message: 'CPF inválido'
    }
  },

  teamRegistration: {
    teamName: {
      required: true,
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-ZÀ-ÿ0-9\s\-_]+$/,
      message: 'Nome do time deve conter apenas letras, números, espaços, hífens e underscores'
    },
    captainName: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
      message: 'Nome do capitão deve conter apenas letras e espaços'
    },
    captainEmail: {
      required: true,
      custom: commonValidators.email,
      message: 'Email do capitão inválido'
    },
    captainPhone: {
      required: true,
      custom: commonValidators.phone,
      message: 'Telefone do capitão inválido'
    },
    captainCpf: {
      required: true,
      custom: commonValidators.cpf,
      message: 'CPF do capitão inválido'
    }
  },

  payment: {
    amount: {
      required: true,
      custom: (value: any) => {
        const num = parseFloat(value);
        return !isNaN(num) && num > 0 && num <= 10000;
      },
      message: 'Valor deve ser um número positivo até R$ 10.000'
    },
    description: {
      required: true,
      minLength: 5,
      maxLength: 200,
      message: 'Descrição deve ter entre 5 e 200 caracteres'
    }
  }
};

export function validateForm(data: Record<string, any>, schema: FormValidationRules): {
  isValid: boolean;
  errors: Record<string, string[]>;
  values: Record<string, any>;
} {
  const validator = new Validator(schema);
  const results = validator.validate(data);
  
  const errors: Record<string, string[]> = {};
  const values: Record<string, any> = {};
  let isValid = true;

  for (const [fieldName, result] of Object.entries(results)) {
    if (!result.isValid) {
      isValid = false;
      errors[fieldName] = result.errors;
    }
    values[fieldName] = result.value;
  }

  return { isValid, errors, values };
}

export function getFieldError(errors: Record<string, string[]>, fieldName: string): string | null {
  return errors[fieldName]?.[0] || null;
}

export function hasFieldError(errors: Record<string, string[]>, fieldName: string): boolean {
  return !!errors[fieldName]?.length;
}