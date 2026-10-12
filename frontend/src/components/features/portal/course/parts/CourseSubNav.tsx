"use client";

import { useState } from "react";

import { COURSE_PAGE as C } from "@/src/constants/portal/course-page";

import styles from "../CourseDetail.module.scss";

/* 2. SUB-NAVBAR CHỈ MỤC (STICKY SUB-HEADER) */
export default function CourseSubNav() {
  // Thêm state để switch tab giống Coursera
  const [activeTab, setActiveTab] = useState<string>("about");

  return (
    <div className={styles.sticky}>
      <div className={styles.container4}>
        {C.tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              document
                .getElementById(tab.id)
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            className={`${styles.button12} ${
              activeTab === tab.id ? styles.button4 : styles.button5
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
