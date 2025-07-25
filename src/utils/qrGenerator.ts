import QRCode from 'qrcode';

export const generateQRCode = async (petProfileId: string): Promise<string> => {
  try {
    // Use the current domain for the QR code URL
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/pet-profile/${petProfileId}`;

    console.log('Generating QR code for URL:', url);
    console.log('Pet Profile ID:', petProfileId);

    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });

    console.log('QR code generated successfully');
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

export const downloadQRCode = (dataUrl: string, petName: string) => {
  try {
    const link = document.createElement('a');
    link.download = `${petName.replace(/[^a-zA-Z0-9]/g, '_')}-qr-code.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('QR code downloaded successfully');
  } catch (error) {
    console.error('Error downloading QR code:', error);
  }
};