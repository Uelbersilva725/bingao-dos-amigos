const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY?.trim();
const accessToken = import.meta.env.VITE_MP_ACCESS_TOKEN?.trim();

if (!publicKey || !accessToken) {
  console.error('Mercado Pago credentials are not properly configured in .env file');
}

if (accessToken && !accessToken.startsWith('APP_USR-')) {
  console.error('Invalid Mercado Pago access token format. It should start with APP_USR-');
}

if (publicKey && !publicKey.startsWith('APP_USR-')) {
  console.error('Invalid Mercado Pago public key format. It should start with APP_USR-');
}

export const mercadoPagoConfig = {
  publicKey: publicKey || '',
  accessToken: accessToken || '',
};