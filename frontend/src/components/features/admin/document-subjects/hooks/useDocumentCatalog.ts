"use client";

import { useCallback, useEffect, useState } from "react";

import { ADMIN_DOCUMENT_SUBJECTS as C } from "@/src/constants/admin/document-subjects-page";
import { getErrorMessage } from "@/src/services/apiHelper";
import {
  documentService,
  type FieldIcon,
  type DocumentCategory,
  type DocumentSubject,
  type DocumentUniversity,
} from "@/src/services/document";

const M = C.messages;
const byName = (a: DocumentSubject, b: DocumentSubject) =>
  a.ten.localeCompare(b.ten, "vi");

/** So khop ten nganh khong phan biet dau / hoa thuong ("Luật" = "luat"). */
export const normName = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

// Trang quan tri khong con o chon bieu tuong (chu du an bo di cho gon), nhung
// trang Chia se tai lieu van ve bieu tuong cho moi linh vuc - nen doan theo ten.
// Khong khop tu nao thi la quyen sach. Linh vuc da co giu nguyen bieu tuong cu.
const ICON_BY_NAME: [RegExp, FieldIcon][] = [
  [/luat|phap/, "luat"],
  [/kinh doanh|quan tri|marketing|thuong mai/, "kinh-doanh"],
  [/kinh te|tai chinh|ke toan|ngan hang/, "kinh-te"],
  [/he thong|mang may|du lieu/, "he-thong"],
  [/lap trinh|cong nghe thong tin|phan mem|tin hoc/, "lap-trinh"],
  [/toan|thong ke/, "toan"],
  [/y |y$|duoc|suc khoe|dieu duong/, "y-te"],
  [/ngoai ngu|tieng|ngon ngu/, "ngoai-ngu"],
  [/chinh tri|ly luan|triet/, "chinh-tri"],
  [/ky thuat|co khi|dien|xay dung/, "ky-thuat"],
  [/thiet ke|my thuat|kien truc|do hoa/, "thiet-ke"],
  [/giao duc|su pham/, "giao-duc"],
  [/khoa hoc|vat ly|hoa hoc|sinh hoc/, "khoa-hoc"],
];

const guessIcon = (name: string): FieldIcon => {
  const n = normName(name);
  return ICON_BY_NAME.find(([re]) => re.test(n))?.[1] ?? "sach";
};

/**
 * Mon hoc va LINH VUC (va truong) cua kho tai lieu chia se.
 *
 * - Linh vuc: nhom lon (Luat, Kinh doanh...) - hien thanh cac o o trang
 *   /share-document.
 * - Mon: nguoi dang tai lieu chi CHON trong danh sach nay. Moi mon xep vao toi
 *   da mot linh vuc.
 *
 * Rieng cho kho tai lieu, khong dinh vao danh muc cua khoa hoc.
 */
export function useDocumentCatalog() {
  const [items, setDs] = useState<DocumentSubject[]>([]);
  const [groupList, setGroupList] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Linh vuc
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupSubjects, setNewGroupSubjects] = useState<string[]>([]);
  const [addingGroup, setAddingGroup] = useState(false);
  const [editGroup, setEditGroup] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  // Ban nhap danh sach nganh khi sua: ten nganh, luu moi ap vao CSDL.
  const [editGroupSubjects, setEditGroupSubjects] = useState<string[]>([]);
  const [savingGroup, setSavingGroup] = useState(false);

  // Truong dai hoc
  const [schoolList, setSchoolList] = useState<DocumentUniversity[]>([]);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newSchoolLogo, setNewSchoolLogo] = useState("");
  // "new" = o them truong, con lai la _id truong dang sua.
  const [uploadingLogo, setUploadingLogo] = useState<string | null>(null);
  const [editSchool, setEditSchool] = useState<string | null>(null);
  const [editSchoolName, setEditSchoolName] = useState("");
  const [editLogo, setEditLogo] = useState("");

  // `silent`: nap lai sau khi luu ma khong an danh sach di (khong nhap nhay).
  const download = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setErrorMessage(null);
      const [subjectItem, group, school] = await Promise.all([
        documentService.getSubjects(),
        documentService.getCategories(),
        documentService.getUniversities(),
      ]);
      setDs(subjectItem);
      setGroupList(group);
      setSchoolList(school);
    } catch (err) {
      setErrorMessage(getErrorMessage(err, M.loadFailed));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Hoan mot vong microtask, tranh setState dong bo trong than effect
    // (react-hooks/set-state-in-effect).
    void Promise.resolve().then(() => download());
  }, [download]);

  // ------------------------------------------------------------- linh vuc

  const subjectsOf = (groupId: string) =>
    items.filter((m) => m.nhom === groupId).sort(byName);

  /**
   * Gan cac nganh (theo ten) vao mot linh vuc. Nganh da co (trung ten, ke ca
   * khac dau) thi chuyen sang, chua co thi tao moi - khong tao ban trung.
   */
  const attachSubjects = async (names: string[], groupId: string) => {
    for (const name of names) {
      const hit = items.find((m) => normName(m.ten) === normName(name));
      const subject = hit ?? (await documentService.createSubject(name));
      if (subject.nhom !== groupId) {
        await documentService.setSubjectCategory(subject._id, groupId);
      }
    }
  };

  const addGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    try {
      setAddingGroup(true);
      setErrorMessage(null);
      const n = await documentService.createCategory({
        ten: newGroupName,
        bieuTuong: guessIcon(newGroupName),
      });
      setGroupList((old) => [...old, n]);
      setNewGroupName("");
      setOk(M.categoryAdded(n.ten));
      if (newGroupSubjects.length) {
        await attachSubjects(newGroupSubjects, n._id);
        setNewGroupSubjects([]);
        setOk(M.categorySaved(n.ten, newGroupSubjects.length, 0));
      }
    } catch (err) {
      setErrorMessage(getErrorMessage(err, M.categoryAddFailed));
    } finally {
      // So mon / danh sach nganh lay lai tu may chu cho chac, ke ca khi loi giua chung.
      await download(true);
      setAddingGroup(false);
    }
  };

  /** Luu doi ten + danh sach nganh. Bo nganh = go khoi linh vuc, KHONG xoa mon. */
  const saveGroup = async (n: DocumentCategory) => {
    const name = editGroupName.trim();
    if (!name) return;
    const current = subjectsOf(n._id);
    const keep = new Set(editGroupSubjects.map(normName));
    const removed = current.filter((m) => !keep.has(normName(m.ten)));
    const had = new Set(current.map((m) => normName(m.ten)));
    const added = editGroupSubjects.filter((x) => !had.has(normName(x)));
    try {
      setSavingGroup(true);
      setErrorMessage(null);
      if (name !== n.ten) await documentService.updateCategory(n._id, { ten: name });
      for (const m of removed) await documentService.setSubjectCategory(m._id, null);
      await attachSubjects(added, n._id);
      setEditGroup(null);
      setOk(M.categorySaved(name, added.length, removed.length));
    } catch (err) {
      setErrorMessage(getErrorMessage(err, M.categoryUpdateFailed));
    } finally {
      await download(true);
      setSavingGroup(false);
    }
  };

  const updateGroup = async (
    n: DocumentCategory,
    data: { ten?: string; bieuTuong?: FieldIcon },
  ) => {
    try {
      setErrorMessage(null);
      const recent = await documentService.updateCategory(n._id, data);
      setGroupList((old) =>
        old.map((x) =>
          x._id === n._id
            ? { ...x, ten: recent.ten, key: recent.key, bieuTuong: recent.bieuTuong }
            : x,
        ),
      );
      setEditGroup(null);
      setOk(M.categoryUpdated(recent.ten));
    } catch (err) {
      setErrorMessage(getErrorMessage(err, M.categoryUpdateFailed));
    }
  };

  const startEditGroup = (n: DocumentCategory) => {
    setEditGroup(n._id);
    setEditGroupName(n.ten);
    setEditGroupSubjects(subjectsOf(n._id).map((m) => m.ten));
  };

  const deleteGroup = async (n: DocumentCategory) => {
    if (!confirm(M.confirmDeleteCategory(n.ten, n.soMon))) return;
    try {
      setErrorMessage(null);
      await documentService.deleteCategory(n._id);
      setGroupList((old) => old.filter((x) => x._id !== n._id));
      setDs((old) => old.map((m) => (m.nhom === n._id ? { ...m, nhom: null } : m)));
      setOk(M.categoryDeleted(n.ten));
    } catch (err) {
      setErrorMessage(getErrorMessage(err, M.categoryDeleteFailed));
    }
  };

  const sortSubjects = async (m: DocumentSubject, group: string) => {
    try {
      setErrorMessage(null);
      await documentService.setSubjectCategory(m._id, group || null);
      setDs((old) =>
        old.map((x) => (x._id === m._id ? { ...x, nhom: group || null } : x)),
      );
      // So mon cua moi linh vuc tren man hinh doi theo ngay.
      setGroupList((old) =>
        old.map((n) => ({
          ...n,
          soMon: n.soMon + (n._id === group ? 1 : 0) - (n._id === m.nhom ? 1 : 0),
        })),
      );
      const name = groupList.find((n) => n._id === group)?.ten;
      setOk(name ? M.subjectPlaced(m.ten, name) : M.subjectUnplaced(m.ten));
    } catch (err) {
      setErrorMessage(getErrorMessage(err, M.subjectPlaceFailed));
    }
  };

  // ------------------------------------------------------------- truong

  const addSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;
    try {
      setErrorMessage(null);
      const t = await documentService.createUniversity(newSchoolName, newSchoolLogo);
      setSchoolList((old) => [...old, t]);
      setNewSchoolName("");
      setNewSchoolLogo("");
      setOk(M.universityAdded(t.ten));
    } catch (err) {
      setErrorMessage(getErrorMessage(err, M.universityAddFailed));
    }
  };

  /**
   * Chon logo tu may: tai len ngay de xem truoc, roi gan URL vao o them truong
   * ("new") hoac truong dang sua. Luu truong moi ghi vao CSDL.
   */
  const pickLogo = async (file: File | undefined, target: string) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setErrorMessage(M.logoNotImage);
    if (file.size > 5 * 1024 * 1024) return setErrorMessage(M.logoTooBig);
    try {
      setUploadingLogo(target);
      setErrorMessage(null);
      const { url } = await documentService.uploadUniversityLogo(file);
      if (target === "new") setNewSchoolLogo(url);
      else setEditLogo(url);
    } catch (err) {
      setErrorMessage(getErrorMessage(err, M.logoUploadFailed));
    } finally {
      setUploadingLogo(null);
    }
  };

  const startEditSchool = (t: DocumentUniversity) => {
    setEditSchool(t._id);
    setEditSchoolName(t.ten);
    setEditLogo(t.logo ?? "");
  };

  const renameSchool = async (t: DocumentUniversity) => {
    try {
      setErrorMessage(null);
      // Logo doi thi luu logo truoc (kiem o may chu: /images/institution/... hoac https).
      if (editLogo.trim() !== (t.logo ?? "")) {
        const hasLogo = await documentService.setUniversityLogo(t._id, editLogo.trim());
        setSchoolList((old) =>
          old.map((x) => (x._id === t._id ? { ...x, logo: hasLogo.logo } : x)),
        );
      }
      if (!editSchoolName.trim() || editSchoolName.trim() === t.ten) {
        setEditSchool(null);
        setOk(M.universityUpdated(t.ten));
        return;
      }
      const recent = await documentService.renameUniversity(t._id, editSchoolName);
      setSchoolList((old) =>
        old.map((x) =>
          x._id === t._id ? { ...x, ten: recent.ten, key: recent.key } : x,
        ),
      );
      setEditSchool(null);
      setOk(
        recent.soTaiLieuDaCapNhat > 0
          ? M.renamedWithDocs(recent.ten, recent.soTaiLieuDaCapNhat)
          : M.renamed(recent.ten),
      );
    } catch (err) {
      setErrorMessage(getErrorMessage(err, M.universityRenameFailed));
    }
  };

  const deleteSchool = async (t: DocumentUniversity) => {
    if (!confirm(M.confirmDeleteUniversity(t.ten, t.soTaiLieu))) return;
    try {
      setErrorMessage(null);
      await documentService.deleteUniversity(t._id);
      setSchoolList((old) => old.filter((x) => x._id !== t._id));
      setOk(M.universityDeleted(t.ten));
    } catch (err) {
      setErrorMessage(getErrorMessage(err, M.universityDeleteFailed));
    }
  };

  // ------------------------------------------------------------- mon hoc

  const them = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      setAdding(true);
      setErrorMessage(null);
      const subjectItem = await documentService.createSubject(newName);
      setDs((old) => [...old, subjectItem].sort(byName));
      setNewName("");
      setOk(M.subjectAdded(subjectItem.ten));
    } catch (err) {
      // 409 = trung mon da co (ke ca khac dau/hoa thuong) - may chu noi ro.
      setErrorMessage(getErrorMessage(err, M.subjectAddFailed));
    } finally {
      setAdding(false);
    }
  };

  const startEditSubject = (m: DocumentSubject) => {
    setEditing(m._id);
    setEditName(m.ten);
  };

  const saveName = async (m: DocumentSubject) => {
    if (!editName.trim() || editName.trim() === m.ten) return setEditing(null);
    try {
      setSaving(true);
      setErrorMessage(null);
      const recent = await documentService.renameSubject(m._id, editName);
      setDs((old) =>
        old
          .map((x) => (x._id === m._id ? { ...x, ten: recent.ten, key: recent.key } : x))
          .sort(byName),
      );
      setEditing(null);
      // Noi ro ca tai lieu cung doi theo: admin can biet doi ten mon khong chi
      // la sua mot dong trong danh sach nay.
      setOk(
        recent.soTaiLieuDaCapNhat > 0
          ? M.subjectRenamedWithDocs(recent.ten, recent.soTaiLieuDaCapNhat)
          : M.renamed(recent.ten),
      );
    } catch (err) {
      setErrorMessage(getErrorMessage(err, M.subjectRenameFailed));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (m: DocumentSubject) => {
    if (!confirm(M.confirmDeleteSubject(m.ten))) return;
    try {
      setDeleting(m._id);
      setErrorMessage(null);
      await documentService.deleteSubject(m._id);
      setDs((old) => old.filter((x) => x._id !== m._id));
      setOk(M.subjectDeleted(m.ten));
    } catch (err) {
      // 409 = con tai lieu dung mon nay - may chu noi ro so luong va cach xu ly.
      setErrorMessage(getErrorMessage(err, M.subjectDeleteFailed));
    } finally {
      setDeleting(null);
    }
  };

  return {
    loading,
    loi: errorMessage,
    setErr: setErrorMessage,
    ok,
    setOk,
    // linh vuc
    groupList,
    newGroupName,
    setNewGroupName,
    newGroupSubjects,
    setNewGroupSubjects,
    addingGroup,
    editGroup,
    setEditGroup,
    editGroupName,
    setEditGroupName,
    editGroupSubjects,
    setEditGroupSubjects,
    savingGroup,
    subjectsOf,
    allSubjectNames: items.map((m) => m.ten),
    addGroup,
    saveGroup,
    updateGroup,
    startEditGroup,
    deleteGroup,
    // truong
    schoolList,
    newSchoolName,
    setNewSchoolName,
    newSchoolLogo,
    setNewSchoolLogo,
    uploadingLogo,
    pickLogo,
    suaTruong: editSchool,
    setEditSchool,
    editSchoolName,
    setEditSchoolName,
    editLogo,
    setEditLogo,
    themTruong: addSchool,
    startEditSchool,
    renameSchool,
    xoaTruong: deleteSchool,
    // mon
    ds: items,
    newName,
    setNewName,
    adding,
    editing,
    setEditing,
    editName,
    setEditName,
    saving,
    deleting,
    them,
    startEditSubject,
    saveName,
    sortSubjects,
    xoa: remove,
  };
}

export type DocumentCatalogState = ReturnType<typeof useDocumentCatalog>;
