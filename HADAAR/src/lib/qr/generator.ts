// ====================================================================
// HADAR SaaS Platform — Secure QR Code Generator & Token Formatter
// Developed by MADAAR Technologies
// ====================================================================

import QRCode from 'qrcode';

export interface StudentQRMetadata {
  token: string;
  studentCode: string;
  studentName: string;
  centerName: string;
  grade: string;
}

/**
 * Generates an SVG or PNG Data URL for a secure student token
 */
export async function generateQrDataUrl(token: string): Promise<string> {
  try {
    return await QRCode.toDataURL(token, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 256,
      color: {
        dark: '#111D2D', // Midnight Navy
        light: '#FFFFFF'
      }
    });
  } catch (err) {
    console.error('Failed to generate QR data URL:', err);
    throw err;
  }
}

