const MiniCssExtractPlugin = require('mini-css-extract-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = { plugins: [new MiniCssExtractPlugin()] }

module.exports = nextConfig
