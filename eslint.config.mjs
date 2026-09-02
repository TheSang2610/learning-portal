import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// ---------------------------------------------------------------------------
// Phan loai rule theo "sua duoc ngay" va "no ky thuat".
//
// Truoc PR nay: 211 loi + 78 canh bao -> `npm run lint` luon do, nen khong ai
// chay. Lint do thuong xuyen con te hon khong co lint, vi lo?i mo?i lan trong
// dam lo?i cu.
//
// Cach lam: nhung rule sua duoc ngay thi sua het va giu muc "error" (phai luon
// bang 0). Nhung rule vuong khap ma sua het se thanh mot PR khong the review
// thi ha xuong "warn" KEM MOT TRAN trong script lint (--max-warnings), de so
// luong chi duoc phep giam. Moi PR keo tran xuong mot chut.
// ---------------------------------------------------------------------------
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    rules: {
      // --- NO KY THUAT: warn + tran, giam dan qua tung PR --------------------
      // 173 cho -> can khai type that trong src/types/. Xem README muc "No ky thuat".
      "@typescript-eslint/no-explicit-any": "warn",
      // 22 the <img> -> can chuyen sang next/image (phai biet width/height).
      "@next/next/no-img-element": "warn",
      // 26 cho -> LOI THAT, khong phai style: set state trong effect gay render
      // thua va co the thanh vong lap. Ha xuong warn CHI de PR nay review duoc,
      // phai sua trong PR rieng, tung file mot.
      "react-hooks/set-state-in-effect": "warn",
      // 7 cho -> phai doc tung truong hop, co cho co y bo dependency.
      "react-hooks/exhaustive-deps": "warn",

      // --- PHAI LUON BANG 0 -------------------------------------------------
      // Da sua het trong PR nay.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          // Cho phep `const { token, ...rest } = data` — token co y bi loai bo,
          // khong phai bien thua. Doi ten no thanh _token se lam token lot
          // vao rest va bi luu xuong localStorage.
          ignoreRestSiblings: true,
        },
      ],
      "react/no-unescaped-entities": "error",
      "react-hooks/immutability": "error",
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
