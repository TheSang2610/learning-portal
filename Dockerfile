# Node 18 het han ho tro tu thang 4/2025 - khong con ban va loi bao mat nao nua.
FROM node:24-alpine

# Dat truoc khi cai thu vien de npm biet la ban chay that.
# Cung la thu quyet dinh may chu co tra stack trace ra cho khach hay khong,
# xem middleware xu ly loi cuoi index.js.
ENV NODE_ENV=production

WORKDIR /app

# Copy rieng package*.json truoc phan ma nguon.
# Docker chi cai lai thu vien khi hai file nay doi; sua ma nguon thi tang cache
# van con, nen dung lai chi mat vai giay.
COPY package*.json ./

# npm ci cai dung phien ban ghi trong package-lock, khong tu nang len nhu
# npm install - anh dung hom nay va anh dung thang sau giong het nhau.
# --omit=dev bo nodemon va cac thu chi can luc dev.
RUN npm ci --omit=dev

COPY . .

# Khong chay bang root. Anh node:alpine co san user "node" khong dac quyen,
# lo co lo hong thuc thi ma tu xa thi ke tan cong cung khong lam duoc gi nhieu.
USER node

EXPOSE 5000

# Truoc day la `npm run dev`, tuc la chay nodemon - ban danh cho luc viet ma -
# trong container that: no theo doi file de khoi dong lai, ton bo nho, va nuot
# mat ma thoat khi may chu chet nen Docker khong biet duong dung day.
CMD ["node", "index.js"]
