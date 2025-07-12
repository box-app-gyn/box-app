export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatPixKey = (pixKey: string): string => {
  if (!pixKey) return '';
  
  if (pixKey.includes('@')) {
    return pixKey;
  }
  
  if (pixKey.length === 11) {
    return pixKey.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  if (pixKey.length === 14) {
    return pixKey.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return pixKey;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Erro ao copiar para clipboard:', error);
    return false;
  }
};

export const generatePixCopyPaste = (pixData: {
  pixKey: string;
  value: number;
  description?: string;
}): string => {
  const { pixKey, value, description } = pixData;
  
  const lines = [
    '00020126',
    '0014br.gov.bcb.pix',
    `01${pixKey.length.toString().padStart(2, '0')}${pixKey}`,
    '520400005303986',
    `54${value.toFixed(2).length.toString().padStart(2, '0')}${value.toFixed(2)}`,
    description ? `80${description.length.toString().padStart(2, '0')}${description}` : '',
    '6304'
  ];
  
  const payload = lines.join('');
  const crc = calculateCRC16(payload);
  
  return payload + crc;
};

const calculateCRC16 = (str: string): string => {
  let crc = 0xFFFF;
  let j, i;
  
  for (i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
  }
  
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}; 