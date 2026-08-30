# Sử dụng môi trường Node.js bản nhẹ Alpine
FROM node:18-alpine

# Khai báo thư mục làm việc bên trong Container
WORKDIR /app

# Copy file package.json và cài đặt thư viện
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn Backend vào Container
COPY . .

# Mở cổng 5000
EXPOSE 5000

# Lệnh khởi chạy server dev
CMD ["npm", "run", "dev"]