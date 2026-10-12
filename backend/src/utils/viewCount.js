// Dem luot xem khoa hoc cho ba muc trang chu.
//
// Hai bo dem tren moi khoa:
//  - luotXem: tong tu truoc toi nay, KHONG bao gio reset -> muc "Pho bien nhat".
//  - luotXemThang + thangLuotXem: luot xem cua MOT thang -> muc "Dang thinh hanh".
//    Sang thang moi thi luot xem dau tien dat lai ve 1, khong can cron job nao
//    chay dem ngay mung 1: khoa nao khong ai xem trong thang thi thangLuotXem
//    van la thang cu, va moi cho doc deu so voi thang hien tai nen tu dong bi
//    tinh la 0.

const VIETNAM_OFFSET = 7 * 60 * 60 * 1000;

// Thang tinh theo gio Viet Nam. Dung thang UTC thi 0h-7h sang mung 1 van bi
// tinh vao thang truoc.
function monthKey(day = new Date()) {
    return new Date(day.getTime() + VIETNAM_OFFSET).toISOString().slice(0, 7);
}

// Update pipeline thay vi doc-roi-ghi: hai nguoi mo cung luc ma doc so cu roi
// cung ghi so+1 thi mat mot luot. Trong mot $set, moi bieu thuc deu doc gia tri
// CU cua tai lieu, nen $cond so sanh voi thangLuotXem truoc khi no bi ghi de.
function incrementViewCount(month) {
    return [{
        $set: {
            luotXem: { $add: [{ $ifNull: ['$luotXem', 0] }, 1] },
            luotXemThang: {
                $cond: [
                    { $eq: ['$thangLuotXem', month] },
                    { $add: [{ $ifNull: ['$luotXemThang', 0] }, 1] },
                    1,
                ],
            },
            thangLuotXem: month,
        },
    }];
}

// Luot xem trong thang dang xet. So luu tren khoa la cua thangLuotXem, co the
// la mot thang da qua.
function viewsThisMonth(course, month) {
    return course && course.thangLuotXem === month ? course.luotXemThang || 0 : 0;
}

// Thu tu "Dang thinh hanh": luot xem thang nay, hoa thi xet tong luot xem.
function compareTrending(month) {
    return (a, b) =>
        viewsThisMonth(b, month) - viewsThisMonth(a, month) ||
        (b.luotXem || 0) - (a.luotXem || 0) ||
        (b.studentsCount || 0) - (a.studentsCount || 0) ||
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
}

// Dau thang chua ai xem gi thi muc xu huong rong trang. Bu cho du so cho bang
// cac khoa pho bien nhat - cung thu tu ma compareTrending cho ra voi khoa 0 luot
// thang nay, nen trang quan tri va trang chu xep giong nhau.
function fillTrending(hotThisMonth, popular, count) {
    const result = hotThisMonth.slice(0, count);
    const existing = new Set(result.map((k) => String(k._id)));
    for (const course of popular) {
        if (result.length >= count) break;
        if (!existing.has(String(course._id))) {
            result.push(course);
            existing.add(String(course._id));
        }
    }
    return result;
}

module.exports = { monthKey, incrementViewCount, viewsThisMonth, compareTrending, fillTrending };
