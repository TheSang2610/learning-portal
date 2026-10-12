/**
 * Mot doan chu co the co vai cum in dam, viet duoi dang du lieu de dat duoc
 * trong constants: ["Ban ", { strong: "không được" }, " sao chép..."].
 */
export type RichText = readonly (string | { readonly strong: string })[];
