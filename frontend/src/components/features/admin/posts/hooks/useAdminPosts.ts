"use client";

import { useEffect, useState } from "react";

import {
  ADMIN_POSTS as C,
  type PostStatusFilter,
} from "@/src/constants/admin/posts-page";
import { getErrorMessage } from "@/src/services/apiHelper";
import { postService, type BlogPost, type Topic } from "@/src/services/post";

/** Danh sach bai viet cam nang: loc trang thai / chu de, tim, phan trang, xoa. */
export function useAdminPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [status, setStatus] = useState<PostStatusFilter>("");
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [activeKeyword, setActiveKeyword] = useState("");

  const download = async (
    p: number,
    transfer: PostStatusFilter,
    cd: string,
    q: string,
  ) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await postService.getAdminPosts({
        page: p,
        limit: C.pageSize,
        status: transfer || undefined,
        topic: cd || undefined,
        q,
      });
      setPosts(res.posts);
      setTotal(res.total);
      setPage(res.page);
      setTotalPages(res.totalPages);
    } catch (err) {
      setErrorMessage(getErrorMessage(err, C.messages.loadFailed));
    } finally {
      setLoading(false);
    }
  };

  // Lan tai dau tien. Khong goi tai() o day vi ham do dat setLoading(true)
  // ngay lap tuc - dat state thang trong than effect gay them mot vong ve lai.
  // loading da la true san tu dau nen chi can dat lai state trong callback.
  useEffect(() => {
    let cancel = false;

    postService
      .getTopics()
      .then((t) => {
        if (!cancel) setTopics(t);
      })
      .catch(() => {
        if (!cancel) setTopics([]);
      });

    postService
      .getAdminPosts({ page: 1, limit: C.pageSize })
      .then((res) => {
        if (cancel) return;
        setPosts(res.posts);
        setTotal(res.total);
        setPage(res.page);
        setTotalPages(res.totalPages);
      })
      .catch((err) => {
        if (!cancel) setErrorMessage(getErrorMessage(err, C.messages.loadFailed));
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });

    return () => {
      cancel = true;
    };
  }, []);

  // Doi bo loc thi luon ve trang 1: giu nguyen trang 3 khi bo loc chi con mot
  // trang se ra danh sach rong ma khong ro tai sao.
  const changeStatus = (v: PostStatusFilter) => {
    setStatus(v);
    download(1, v, topic, activeKeyword);
  };

  const changeTopic = (v: string) => {
    setTopic(v);
    download(1, status, v, activeKeyword);
  };

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveKeyword(keyword);
    download(1, status, topic, keyword);
  };

  const goToPage = (p: number) => download(p, status, topic, activeKeyword);

  const remove = async (p: BlogPost) => {
    if (!window.confirm(C.messages.confirmDelete(p.title))) return;
    try {
      await postService.deletePost(p._id);
      // Xoa bai cuoi cung cua trang -> lui ve trang truoc, khong de trang rong.
      const remaining = posts.length - 1;
      goToPage(remaining === 0 && page > 1 ? page - 1 : page);
    } catch (err) {
      alert(getErrorMessage(err, C.messages.deleteFailed));
    }
  };

  const topicName = (slug: string) => topics.find((t) => t.slug === slug)?.name ?? slug;

  return {
    posts,
    tong: total,
    trang: page,
    totalPages,
    topics,
    loading,
    loi: errorMessage,
    status,
    topic,
    tuKhoa: keyword,
    setKeyword,
    activeKeyword,
    changeStatus,
    changeTopic,
    search,
    goToPage,
    xoa: remove,
    topicName,
  };
}

export type AdminPostsState = ReturnType<typeof useAdminPosts>;
