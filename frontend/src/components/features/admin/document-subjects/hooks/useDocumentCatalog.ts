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
  const [newIcon, setNewIcon] = useState<FieldIcon>("sach");
  const [addingGroup, setAddingGroup] = useState(false);
  const [editGroup, setEditGroup] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState("");

  // Truong dai hoc
  const [schoolList, setSchoolList] = useState<DocumentUniversity[]>([]);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [editSchool, setEditSchool] = useState<string | null>(null);
  const [editSchoolName, setEditSchoolName] = useState("");
  const [editLogo, setEditLogo] = useState("");

  const download = useCallback(async () => {
    try {
      setLoading(true);
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
    void Promise.resolve().then(download);
  }, [download]);

  // ------------------------------------------------------------- linh vuc

  const addGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    try {
      setAddingGroup(true);
      setErrorMessage(null);
      const n = await documentService.createCategory({
        ten: newGroupName,
        bieuTuong: newIcon,
      });
      setGroupList((old) => [...old, n]);
      setNewGroupName("");
      setOk(M.categoryAdded(n.ten));
    } catch (err) {
      setErrorMessage(getErrorMessage(err, M.categoryAddFailed));
    } finally {
      setAddingGroup(false);
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
      const t = await documentService.createUniversity(newSchoolName);
      setSchoolList((old) => [...old, t]);
      setNewSchoolName("");
      setOk(M.universityAdded(t.ten));
    } catch (err) {
      setErrorMessage(getErrorMessage(err, M.universityAddFailed));
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
    newIcon,
    setNewIcon,
    addingGroup,
    editGroup,
    setEditGroup,
    editGroupName,
    setEditGroupName,
    addGroup,
    updateGroup,
    startEditGroup,
    deleteGroup,
    // truong
    schoolList,
    newSchoolName,
    setNewSchoolName,
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
