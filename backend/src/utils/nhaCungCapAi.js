/**
 * Mot cua duy nhat de goi mo hinh ngon ngu, doi nha cung cap bang bien moi truong.
 *
 * VI SAO KHONG GAN CHET MOT HANG:
 * Yeu cau ban dau la "noi vao ChatGPT ban mien phi". Khong lam duoc: tai khoan
 * ChatGPT mien phi tren chat.openai.com khong cap khoa API, no chi la giao dien
 * web. Moi thu goi tu may chu khac deu can khoa tra phi.
 *
 * Nen cho nay lam theo huong khac: viet mot lop bao mong, ai co khoa gi thi cam
 * khoa do. Doi hang chi la sua .env, khong dong vao ma nguon:
 *
 *   AI_NHA_CUNG_CAP=gemini   Google AI Studio - co goi MIEN PHI that
 *   AI_NHA_CUNG_CAP=groq     Groq - cung co goi mien phi, chay nhanh
 *   AI_NHA_CUNG_CAP=openai   tra phi theo luot dung
 *   AI_NHA_CUNG_CAP=claude   tra phi, chat luong cao nhat trong bon
 *
 * Khong dat AI_API_KEY thi chuc nang tu tat va bao 503 - khong lam sap duong
 * nao khac.
 *
 * KHONG BAO GIO in AI_API_KEY ra log. Ca file nay chi doc no mot lan de dat vao
 * header, va moi thong bao loi tra ve deu la chu do minh viet, khong phai than
 * phan hoi tho cua nha cung cap (than do co the vong lai chinh cai khoa).
 */

// Tat ca deu dung fetch san co cua Node 18+. Co y khong them thu vien SDK nao:
// bon SDK cho bon hang la bon lan phu thuoc, trong khi phan minh dung chi la
// mot loi goi POST.

// Ten mo hinh mac dinh cho tung hang. Dat AI_MO_HINH de de len.
//
// Google ngung cap gemini-2.5-flash cho khoa API moi (goi thu 13/09/2026 tra ve
// 404 kem loi "no longer available to new users"). Bai hoc: ten mo hinh la thu
// HET HAN. Khi tro ly bao "Dich vu AI tam thoi khong tra loi duoc", viec dau
// tien nen lam la goi ListModels de xem ten nay con song khong:
//
//   curl -H "x-goog-api-key: $AI_API_KEY" \
//     https://generativelanguage.googleapis.com/v1beta/models
// Chon gemini-3.6-flash chu KHONG phai ban moi nhat. Do thuc te 13/09/2026,
// moi model 3 luot goi cung mot cau hoi:
//
//   gemini-3.8-flash       503 "high demand" ngay 2 lan dau  <- moi nhat, chua on
//   gemini-3.6-flash       3/3 thanh cong,  5.4s,  1373 token
//   gemini-3.5-flash       3/3 thanh cong, 10.7s,  1359 token
//   gemini-3.5-flash-lite  3/3 thanh cong, 17.3s,   764 token, 0 token "suy nghi"
//
// flash-lite re nhat ve token nhung cham gap ba - nguoi dung cho 17 giay truoc
// mot o chat thi ho dong tab. Ban moi nhat thi dang qua tai. 3.6-flash la cho
// can bang: nhanh nhat va khong hong lan nao.
const MAC_DINH = {
    gemini: 'gemini-3.6-flash',
    groq: 'llama-3.3-70b-versatile',
    openai: 'gpt-4o-mini',
    claude: 'claude-sonnet-5',
};

// Cat tran phan hoi. Tro giang tra loi dai hon chung nay thi hoc vien khong doc
// nua, ma tien thi van tinh du.
const TOKEN_TRA_LOI_TOI_DA = 800;

// Qua nguong nay coi nhu hong. Vercel cat ham serverless o 60 giay o goi mien
// phi, nen phai dung truoc no de con kip tra ve mot thong bao tu te.
const HAN_CHO_MS = 30000;

const doiVaiTro = {
    gemini: { nguoiDung: 'user', troLy: 'model' },
    khac: { nguoiDung: 'user', troLy: 'assistant' },
};

/**
 * Dung request cho tung hang. Tra ve { url, headers, than, doc }.
 * `doc` la ham boc lay chu tu JSON phan hoi.
 */
const dungRequest = (hang, moHinh, heThong, tinNhan) => {
    if (hang === 'gemini') {
        const v = doiVaiTro.gemini;
        return {
            url: `https://generativelanguage.googleapis.com/v1beta/models/${moHinh}:generateContent`,
            headers: (khoa) => ({ 'Content-Type': 'application/json', 'x-goog-api-key': khoa }),
            than: {
                system_instruction: { parts: [{ text: heThong }] },
                contents: tinNhan.map((m) => ({
                    role: v[m.vaiTro],
                    parts: [{ text: m.noiDung }],
                })),
                generationConfig: { maxOutputTokens: TOKEN_TRA_LOI_TOI_DA },
            },
            doc: (j) =>
                j?.candidates?.[0]?.content?.parts
                    ?.map((p) => p?.text || '')
                    .join('')
                    .trim(),
        };
    }

    if (hang === 'claude') {
        const v = doiVaiTro.khac;
        return {
            url: 'https://api.anthropic.com/v1/messages',
            headers: (khoa) => ({
                'Content-Type': 'application/json',
                'x-api-key': khoa,
                'anthropic-version': '2023-06-01',
            }),
            than: {
                model: moHinh,
                system: heThong,
                max_tokens: TOKEN_TRA_LOI_TOI_DA,
                messages: tinNhan.map((m) => ({ role: v[m.vaiTro], content: m.noiDung })),
            },
            doc: (j) =>
                j?.content
                    ?.filter((c) => c?.type === 'text')
                    .map((c) => c.text)
                    .join('')
                    .trim(),
        };
    }

    // groq va openai dung chung dang Chat Completions, chi khac dia chi.
    const v = doiVaiTro.khac;
    const url =
        hang === 'groq'
            ? 'https://api.groq.com/openai/v1/chat/completions'
            : 'https://api.openai.com/v1/chat/completions';

    return {
        url,
        headers: (khoa) => ({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${khoa}`,
        }),
        than: {
            model: moHinh,
            max_tokens: TOKEN_TRA_LOI_TOI_DA,
            messages: [
                { role: 'system', content: heThong },
                ...tinNhan.map((m) => ({ role: v[m.vaiTro], content: m.noiDung })),
            ],
        },
        doc: (j) => j?.choices?.[0]?.message?.content?.trim(),
    };
};

/** Chuc nang co dang bat khong - dung de controller tra 503 som. */
const daCauHinh = () =>
    Boolean(process.env.AI_API_KEY && MAC_DINH[process.env.AI_NHA_CUNG_CAP]);

/**
 * Goi mo hinh. Nem Error co `.maHttp` de controller doi thang sang ma tra ve.
 *
 * @param {string} heThong  loi nhac he thong (tu nhacTroLy.dungNhacHeThong)
 * @param {Array<{vaiTro:'nguoiDung'|'troLy', noiDung:string}>} tinNhan
 */
const goiAi = async (heThong, tinNhan) => {
    const hang = process.env.AI_NHA_CUNG_CAP;
    const khoa = process.env.AI_API_KEY;

    if (!MAC_DINH[hang] || !khoa) {
        const loi = new Error('Tro ly AI chua duoc cau hinh tren may chu.');
        loi.maHttp = 503;
        throw loi;
    }

    const moHinh = process.env.AI_MO_HINH || MAC_DINH[hang];
    const { url, headers, than, doc } = dungRequest(hang, moHinh, heThong, tinNhan);

    // Thu lai MOT lan khi gap loi thoang qua.
    //
    // Goi mien phi cua Gemini co han muc theo PHUT, khong chi theo ngay. Do
    // duoc hom 13/09/2026: ba cau hoi lien tiep trong vai giay thi cau thu ba
    // tra ve loi, doi mot chut goi lai thi binh thuong. Khong co lop nay thi
    // hai hoc vien bam cung luc la mot nguoi nhan thong bao hong.
    //
    // Chi thu lai MOT lan, va chi voi cac ma "loi cua may chu ben kia". Loi
    // 400/401/404 la sai cau hinh cua minh - goi lai bao nhieu lan cung the.
    const MA_THU_LAI = new Set([429, 500, 502, 503, 504]);
    const CHO_THU_LAI_MS = 1200;

    const goiMot = async () => {
        // AbortController thay vi de fetch treo: mot request treo tren Vercel
        // van tinh tien va van giu ket noi cua nguoi dung.
        const bo = new AbortController();
        const hen = setTimeout(() => bo.abort(), HAN_CHO_MS);

        try {
            return await fetch(url, {
                method: 'POST',
                headers: headers(khoa),
                body: JSON.stringify(than),
                signal: bo.signal,
            });
        } finally {
            clearTimeout(hen);
        }
    };

    let res;
    try {
        res = await goiMot();

        if (MA_THU_LAI.has(res.status)) {
            console.error(`[tro-ly] ${hang} tra ve HTTP ${res.status}, thu lai mot lan`);
            await new Promise((xong) => setTimeout(xong, CHO_THU_LAI_MS));
            res = await goiMot();
        }
    } catch (e) {
        const loi = new Error(
            e.name === 'AbortError'
                ? 'Tro ly tra loi qua lau, ban thu lai giup.'
                : 'Khong ket noi duoc toi dich vu AI.',
        );
        loi.maHttp = 504;
        throw loi;
    }

    if (!res.ok) {
        // CO Y khong dua than loi cua nha cung cap ra ngoai. Than do doi khi
        // chep lai chinh request - ke ca header - va do la cho khoa API nam.
        // Chi ghi ma trang thai vao log de con go loi duoc.
        console.error(`[tro-ly] ${hang} tra ve HTTP ${res.status}`);

        const loi = new Error(
            res.status === 429
                ? 'Dich vu AI dang qua tai hoac het han muc mien phi. Thu lai sau.'
                : 'Dich vu AI tam thoi khong tra loi duoc.',
        );
        loi.maHttp = res.status === 429 ? 429 : 502;
        throw loi;
    }

    const json = await res.json();
    const chu = doc(json);

    if (!chu) {
        // Hay gap nhat khi bo loc an toan cua chinh nha cung cap chan phan hoi.
        const loi = new Error('Tro ly khong tra loi duoc cau nay. Ban thu hoi cach khac.');
        loi.maHttp = 502;
        throw loi;
    }

    return chu;
};

module.exports = { goiAi, daCauHinh, MAC_DINH, TOKEN_TRA_LOI_TOI_DA, HAN_CHO_MS };
