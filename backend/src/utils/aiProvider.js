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
 *   AI_PROVIDER=gemini   Google AI Studio - co goi MIEN PHI that
 *   AI_PROVIDER=groq     Groq - cung co goi mien phi, chay nhanh
 *   AI_PROVIDER=openai   tra phi theo luot dung
 *   AI_PROVIDER=claude   tra phi, chat luong cao nhat trong bon
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

// Ten mo hinh mac dinh cho tung hang. Dat AI_MODEL de de len.
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
const DEFAULTS = {
    gemini: 'gemini-3.6-flash',
    groq: 'llama-3.3-70b-versatile',
    openai: 'gpt-4o-mini',
    claude: 'claude-sonnet-5',
};

// Cat tran phan hoi. Tro giang tra loi dai hon chung nay thi hoc vien khong doc
// nua, ma tien thi van tinh du.
const MAX_ANSWER_TOKENS = 800;

// Qua nguong nay coi nhu hong. Vercel cat ham serverless o 60 giay o goi mien
// phi, nen phai dung truoc no de con kip tra ve mot thong bao tu te.
const WAIT_TIMEOUT_MS = 30000;

const mapRole = {
    gemini: { nguoiDung: 'user', troLy: 'model' },
    khac: { nguoiDung: 'user', troLy: 'assistant' },
};

/**
 * Dung request cho tung hang. Tra ve { url, headers, than, doc }.
 * `doc` la ham boc lay chu tu JSON phan hoi.
 */
const buildRequest = (row, model, system, message) => {
    if (row === 'gemini') {
        const v = mapRole.gemini;
        return {
            url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
            headers: (course) => ({ 'Content-Type': 'application/json', 'x-goog-api-key': course }),
            than: {
                system_instruction: { parts: [{ text: system }] },
                contents: message.map((m) => ({
                    role: v[m.vaiTro],
                    parts: [{ text: m.noiDung }],
                })),
                generationConfig: { maxOutputTokens: MAX_ANSWER_TOKENS },
            },
            doc: (j) =>
                j?.candidates?.[0]?.content?.parts
                    ?.map((p) => p?.text || '')
                    .join('')
                    .trim(),
        };
    }

    if (row === 'claude') {
        const v = mapRole.khac;
        return {
            url: 'https://api.anthropic.com/v1/messages',
            headers: (course) => ({
                'Content-Type': 'application/json',
                'x-api-key': course,
                'anthropic-version': '2023-06-01',
            }),
            than: {
                model: model,
                system: system,
                max_tokens: MAX_ANSWER_TOKENS,
                messages: message.map((m) => ({ role: v[m.vaiTro], content: m.noiDung })),
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
    const v = mapRole.khac;
    const url =
        row === 'groq'
            ? 'https://api.groq.com/openai/v1/chat/completions'
            : 'https://api.openai.com/v1/chat/completions';

    return {
        url,
        headers: (course) => ({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${course}`,
        }),
        than: {
            model: model,
            max_tokens: MAX_ANSWER_TOKENS,
            messages: [
                { role: 'system', content: system },
                ...message.map((m) => ({ role: v[m.vaiTro], content: m.noiDung })),
            ],
        },
        doc: (j) => j?.choices?.[0]?.message?.content?.trim(),
    };
};

/** Chuc nang co dang bat khong - dung de controller tra 503 som. */
const isConfigured = () =>
    Boolean(process.env.AI_API_KEY && DEFAULTS[process.env.AI_NHA_CUNG_CAP]);

/**
 * Goi mo hinh. Nem Error co `.httpStatus` de controller doi thang sang ma tra ve.
 *
 * @param {string} system  loi nhac he thong (tu nhacTroLy.buildSystemPrompt)
 * @param {Array<{vaiTro:'nguoiDung'|'troLy', noiDung:string}>} tinNhan
 */
const callAi = async (system, message) => {
    const row = process.env.AI_NHA_CUNG_CAP;
    const course = process.env.AI_API_KEY;

    if (!DEFAULTS[row] || !course) {
        const err = new Error('Tro ly AI chua duoc cau hinh tren may chu.');
        err.httpStatus = 503;
        throw err;
    }

    const model = process.env.AI_MO_HINH || DEFAULTS[row];
    const { url, headers, than: body, doc } = buildRequest(row, model, system, message);

    // Thu lai MOT lan khi gap loi thoang qua.
    //
    // Goi mien phi cua Gemini co han muc theo PHUT, khong chi theo ngay. Do
    // duoc hom 13/09/2026: ba cau hoi lien tiep trong vai giay thi cau thu ba
    // tra ve loi, doi mot chut goi lai thi binh thuong. Khong co lop nay thi
    // hai hoc vien bam cung luc la mot nguoi nhan thong bao hong.
    //
    // Chi thu lai MOT lan, va chi voi cac ma "loi cua may chu ben kia". Loi
    // 400/401/404 la sai cau hinh cua minh - goi lai bao nhieu lan cung the.
    const RETRYABLE_CODES = new Set([429, 500, 502, 503, 504]);
    const RETRY_DELAY_MS = 1200;

    const callOnce = async () => {
        // AbortController thay vi de fetch treo: mot request treo tren Vercel
        // van tinh tien va van giu ket noi cua nguoi dung.
        const remove = new AbortController();
        const hen = setTimeout(() => remove.abort(), WAIT_TIMEOUT_MS);

        try {
            return await fetch(url, {
                method: 'POST',
                headers: headers(course),
                body: JSON.stringify(body),
                signal: remove.signal,
            });
        } finally {
            clearTimeout(hen);
        }
    };

    let res;
    try {
        res = await callOnce();

        if (RETRYABLE_CODES.has(res.status)) {
            console.error(`[tro-ly] ${row} tra ve HTTP ${res.status}, thu lai mot lan`);
            await new Promise((done) => setTimeout(done, RETRY_DELAY_MS));
            res = await callOnce();
        }
    } catch (e) {
        const err = new Error(
            e.name === 'AbortError'
                ? 'Tro ly tra loi qua lau, ban thu lai giup.'
                : 'Khong ket noi duoc toi dich vu AI.',
        );
        err.httpStatus = 504;
        throw err;
    }

    if (!res.ok) {
        // CO Y khong dua than loi cua nha cung cap ra ngoai. Than do doi khi
        // chep lai chinh request - ke ca header - va do la cho khoa API nam.
        // Chi ghi ma trang thai vao log de con go loi duoc.
        console.error(`[tro-ly] ${row} tra ve HTTP ${res.status}`);

        const err = new Error(
            res.status === 429
                ? 'Dich vu AI dang qua tai hoac het han muc mien phi. Thu lai sau.'
                : 'Dich vu AI tam thoi khong tra loi duoc.',
        );
        err.httpStatus = res.status === 429 ? 429 : 502;
        throw err;
    }

    const json = await res.json();
    const text = doc(json);

    if (!text) {
        // Hay gap nhat khi bo loc an toan cua chinh nha cung cap chan phan hoi.
        const err = new Error('Tro ly khong tra loi duoc cau nay. Ban thu hoi cach khac.');
        err.httpStatus = 502;
        throw err;
    }

    return text;
};

module.exports = { callAi, daCauHinh: isConfigured, DEFAULTS, MAX_ANSWER_TOKENS, WAIT_TIMEOUT_MS };
