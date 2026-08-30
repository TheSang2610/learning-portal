# Sử dụng môi trường Node.js
FROM node:18-alpine

# Khai báo thư mục làm việc
WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy mã nguồn Frontend
COPY . .

# Mở cổng 3000
EXPOSE 3000

# Chạy ứng dụng Next.js
CMD ["npm", "run", "dev"]