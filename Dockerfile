# ---------------------------------------------------------------------------
# Giai doan 1: bien dich
# ---------------------------------------------------------------------------
# Node 18 het han ho tro tu thang 4/2025, va Next 16 cung khong con chay tren no.
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

# O day KHONG dung --omit=dev: `next build` can typescript, eslint va tailwind,
# deu nam trong devDependencies. Giai doan chay ben duoi moi la cho tinh gon.
RUN npm ci

COPY . .

# Next nhet cac bien NEXT_PUBLIC_* thang vao ma JavaScript luc BUILD chu khong
# doc luc chay. Nghia la dia chi API phai co mat ngay tu day, va doi dia chi thi
# phai build lai anh chu khong sua bien moi truong duoc:
#   docker build --build-arg NEXT_PUBLIC_API_URL=https://api.vidu.com/api .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ---------------------------------------------------------------------------
# Giai doan 2: chay
# ---------------------------------------------------------------------------
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Chi bung sang day nhung thu can de chay: bo lai toan bo ma nguon .tsx cung cac
# file cau hinh cua cong cu, nen anh cuoi cung khong mang theo ma nguon.
#
# node_modules bung nguyen ca phan dev thay vi cai lai bang --omit=dev, vi
# next.config.ts la TypeScript va phai doc duoc luc khoi dong. Muon nho hon nua
# thi dat output: 'standalone' trong next.config.ts roi chi copy .next/standalone,
# nhung dieu do doi lich deploy tren Vercel nen de lai cho luc chuyen han sang Docker.
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/image-hosts.ts ./image-hosts.ts

USER node

EXPOSE 3000

# Truoc day la `npm run dev`: chay ban danh cho luc viet ma, bien dich lai tung
# trang moi luot vao, khong dung ban da toi uu nao ca.
CMD ["npm", "start"]
