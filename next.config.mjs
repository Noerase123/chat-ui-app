/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        APP_ID: process.env.APP_ID,
        USER_ID: process.env.USER_ID,
        API_TOKEN: process.env.API_TOKEN,
    }
};

export default nextConfig;
