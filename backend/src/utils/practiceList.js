// Ghep danh sach bai luyen tap cho trang /practice.
//
// Tach ra ham thuan de test khong can CSDL: controller lo truy van, ham nay chi
// nhan ket qua da lay ve va nan lai hinh dang tra cho giao dien.
//
// Chi tra THONG TIN TOM TAT (tieu de, so cau, so luot lam, khoa hoc). Tuyet doi
// khong tra `questions`: day la duong cong khai, khong dang nhap cung goi duoc,
// ma trong questions co ca dap an dung (options.isCorrect, correctAnswer).

/**
 * @param {Array<{_id, title, description?, questions?: Array, course?: {_id, title, slug}}>} quizzes
 * @param {Map<string, number>} soLuotTheoQuiz  id quiz -> so luot da nop bai
 * @returns {Array<{_id: string, title: string, description: string, soCau: number, soLuotLam: number, khoa: {_id: string, title: string, slug: string}}>}
 */
function ghepBaiLuyenTap(quizzes, soLuotTheoQuiz) {
    return quizzes
        // Quiz ma khoa hoc da bi xoa / chua xuat ban thi populate tra ve null:
        // khong co khoa de dan toi thi khong liet ke.
        .filter((q) => q && q.course && q.course.slug)
        .map((q) => ({
            _id: String(q._id),
            title: q.title,
            description: q.description || '',
            soCau: Array.isArray(q.questions) ? q.questions.length : 0,
            soLuotLam: soLuotTheoQuiz.get(String(q._id)) || 0,
            khoa: {
                _id: String(q.course._id),
                title: q.course.title,
                slug: q.course.slug
            }
        }))
        // Quiz khong co cau nao thi khong co gi de luyen
        .filter((b) => b.soCau > 0)
        // Nhieu nguoi lam nhat len dau; bang luot thi theo ten cho on dinh
        .sort((a, b) => b.soLuotLam - a.soLuotLam || a.title.localeCompare(b.title, 'vi'));
}

module.exports = { ghepBaiLuyenTap };
