"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getOutline, parseContent } from "@/src/lib/article-outline";
import { laHtml, anchorizeHeadings } from "@/src/lib/post-html";
import { ADMIN_POST_CREATE as C } from "@/src/constants/admin/post-create-page";
import { getErrorMessage } from "@/src/services/apiHelper";
import { postService, type Topic } from "@/src/services/post";

/** Viet bai moi hoac sua bai (?id=...), xem truoc muc luc, luu / dang. */
export function usePostEditor() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");
  const isEdit = Boolean(id);

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingPost, setLoadingPost] = useState(isEdit);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState<string>(C.defaultTopic);
  const [tags, setTags] = useState("");
  const [image, setImage] = useState("");
  const [published, setPublished] = useState(true);
  const [slug, setSlug] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    postService
      .getTopics()
      .then(setTopics)
      .catch(() => setTopics([]));
  }, []);

  // Lay bai cu khi sua. Dung /admin/:id chu khong phai /:slug vi ham cong khai
  // co dinh loc isPublished: true - ban nhap se ra 404.
  useEffect(() => {
    if (!id) return;
    let cancel = false;
    postService
      .getAdminPost(id)
      .then((p) => {
        if (cancel) return;
        setTitle(p.title);
        setDescription(p.excerpt);
        setContent(p.content ?? "");
        setTopic(p.topic);
        setTags(p.tags.join(", "));
        setImage(p.thumbnail ?? "");
        setPublished(p.isPublished !== false);
        setSlug(p.slug);
      })
      .catch((err) => {
        if (!cancel) setErrorMessage(getErrorMessage(err, C.messages.loadFailed));
      })
      .finally(() => {
        if (!cancel) setLoadingPost(false);
      });
    return () => {
      cancel = true;
    };
  }, [id]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(""), 4000);
    return () => clearTimeout(t);
  }, [success]);

  // Muc luc o trang doc duoc dung tu chinh nhung dong nay. Hien ra day de
  // nguoi viet biet ngay dong nao da thanh de muc, thay vi dang xong moi phat
  // hien menu ben trai bai trong khong.
  const outline = useMemo(
    () =>
      laHtml(content)
        ? anchorizeHeadings(content).outline
        : getOutline(parseContent(content)),
    [content],
  );

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccess("");

    if (!title.trim() || !description.trim() || !content.trim()) {
      setErrorMessage(C.messages.required);
      return;
    }

    const dl = {
      title: title.trim(),
      excerpt: description.trim(),
      content: content.trim(),
      topic: topic,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, C.maxTags),
      thumbnail: image.trim(),
      isPublished: published,
    };

    setSaving(true);
    try {
      if (id) {
        const p = await postService.updatePost(id, dl);
        setSlug(p.slug);
        setSuccess(C.messages.saved);
      } else {
        const p = await postService.createPost(dl);
        setSuccess(published ? C.messages.published : C.messages.drafted);
        // Chuyen sang che do sua, neu khong bam luu lan nua se tao bai thu hai.
        router.replace(C.editHref(p._id));
      }
    } catch (err) {
      // Bai bi bo loc noi dung chan cung ve day - thong bao tu may chu noi ro
      // truong nao vi pham.
      setErrorMessage(getErrorMessage(err, C.messages.saveFailed));
    } finally {
      setSaving(false);
    }
  };

  return {
    isEdit,
    topics,
    loadingPost,
    tieuDe: title,
    setTitle,
    moTa: description,
    setDescription,
    noiDung: content,
    setContent,
    topic,
    setTopic,
    tags,
    setTags,
    anh: image,
    setImage,
    published,
    setPublished,
    slug,
    saving,
    loi: errorMessage,
    success,
    outline,
    luu: save,
  };
}

export type PostEditorState = ReturnType<typeof usePostEditor>;
