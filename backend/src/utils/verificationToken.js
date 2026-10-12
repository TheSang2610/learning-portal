// Token xac minh email.
//
// VI SAO CHI LUU BAN BAM, khong luu token goc:
//
// Ban ghi User la thu de bi doc nham nhat trong ca he thong - mot cai
// `.find({})` cua duong quan tri, mot ban sao luu quen dat mat khau, mot lan lo
// chuoi ket noi. Neu token nam nguyen trong do thi ai doc duoc CSDL la kich
// hoat duoc moi tai khoan dang cho, tuc la chiem duoc tai khoan cua nguoi khac
// truoc ca khi ho kip bam vao thu.
//
// Luu ban bam SHA-256 thi ban ghi khong con dung lai duoc: muon xac minh phai
// co chuoi goc, ma chuoi goc chi ton tai trong dung mot cai email.
//
// KHONG dung bcrypt o day du no manh hon. Bcrypt cham CO CHU DICH de chong do
// mat khau - thu nguoi ta doan duoc. Token la 32 byte ngau nhien tu
// crypto.randomBytes: khong ai do duoc, nen cai gia phai tra cho moi lan tra
// cuu la vo ich. Va quan trong hon: bcrypt sinh muoi ngau nhien moi lan bam
// nen KHONG tra cuu theo khoa duoc, con SHA-256 thi bam ra la tim thang trong
// CSDL bang mot chi muc.

const crypto = require('crypto');

// 24 gio. Du dai cho nguoi mo thu vao hom sau, du ngan de mot lien ket bi bo
// quen trong hom thu khong con song mai.
const TTL_MS = 24 * 60 * 60 * 1000;

// 32 byte = 256 bit ngau nhien. Khong the do duoc trong bat ky khoang thoi
// gian nao co nghia, nen duong dung no khong can chong do kieu mat khau.
const BYTE_COUNT = 32;

const hashToken = (token) =>
    crypto.createHash('sha256').update(String(token ?? '')).digest('hex');

/**
 * Sinh mot token moi.
 * @returns {{ token: string, bam: string, hetHan: Date }}
 *   `token` di vao email, `bam` di vao CSDL. Khong bao gio nguoc lai.
 */
const createToken = (now = Date.now()) => {
    const token = crypto.randomBytes(BYTE_COUNT).toString('hex');
    return { token, hash: hashToken(token), hetHan: new Date(now + TTL_MS) };
};

module.exports = { createToken, hashToken, TTL_MS, BYTE_COUNT };
