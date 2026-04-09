import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

import styles from "./index.module.css";

const roleGuides = [
  {
    title: "スタッフ向け",
    description:
      "日々の打刻、勤怠確認、修正申請、日報提出など、現場で必要な操作をすぐ探せます。",
    to: "/docs/staff/overview",
    primaryAction: "スタッフ向けガイドへ",
    firstStep: "最初に読む: 基本操作",
    firstStepTo: "/docs/staff/basic-operations",
  },
  {
    title: "管理者向け",
    description:
      "申請承認、勤怠確認、日次・月次対応、設定管理まで、運用担当者の入口をまとめています。",
    to: "/docs/admin/overview",
    primaryAction: "管理者向けガイドへ",
    firstStep: "最初に読む: ダッシュボードと運用フロー",
    firstStepTo: "/docs/admin/overview",
  },
  {
    title: "開発者向け",
    description:
      "セットアップ、開発フロー、アーキテクチャ、主要仕様の確認先を開発観点で整理しています。",
    to: "/docs/developer/overview",
    primaryAction: "開発者向けガイドへ",
    firstStep: "最初に読む: 開発フロー",
    firstStepTo: "/docs/developer/getting-started/development-flow",
  },
] as const;

const utilityLinks = [
  {
    title: "業務フロー全体像",
    description: "最初に共通の全体像をつかみたいときの入口です。",
    to: "/docs/attendance-workflow-overview",
  },
  {
    title: "用語集",
    description: "勤怠管理で使う用語や意味をまとめています。",
    to: "/docs/terminology",
  },
  {
    title: "勤務ステータスの見方",
    description: "現在の勤務状態と勤怠判定ステータスの違いを確認できます。",
    to: "/docs/work-status-overview",
  },
  {
    title: "勤務形態の見方",
    description: "平日勤務とシフト勤務の違い、画面への影響を確認できます。",
    to: "/docs/work-type-overview",
  },
  {
    title: "画面一覧",
    description: "画面名や URL から関連ガイドを逆引きしたいときに使います。",
    to: "/docs/screen-list",
  },
] as const;

export default function Home(): ReactNode {
  return (
    <Layout
      title="開発ドキュメント"
      description="本プロジェクトの開発ドキュメント"
    >
      <main className={styles.homepage}>
        <section className={styles.heroSection}>
          <div className={styles.heroBackdrop} aria-hidden="true" />
          <div className={styles.heroContent}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Cloud Attendance Docs</p>
              <Heading as="h1" className={styles.heroTitle}>
                クラウド勤怠の情報を、
                <br />
                役割ごとの入口から迷わず探せるようにする
              </Heading>
              <p className={styles.heroLead}>
                まず自分の役割に近いガイドを選び、必要に応じて共通ガイドや画面索引へ進める入口です。
              </p>
              <div className={styles.heroActions}>
                <a className={styles.primaryAction} href="#role-guides">
                  ロール別ガイドを見る
                </a>
                <Link
                  className={styles.secondaryAction}
                  to="/docs/attendance-workflow-overview"
                >
                  共通ガイドを見る
                </Link>
              </div>
            </div>

            <div className={styles.heroPanel}>
              <p className={styles.panelLabel}>このトップページの役割</p>
              <ul className={styles.panelList}>
                <li>スタッフ・管理者・開発者の入口を選ぶ</li>
                <li>共通ガイドへ最短で入る</li>
                <li>画面一覧から逆引きする</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.rolesSection} id="role-guides">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Role-based entry points</p>
            <Heading as="h2" className={styles.sectionTitle}>
              まずは自分の役割に近い入口を選ぶ
            </Heading>
            <p className={styles.sectionLead}>
              詳しいサイト構造を見たい場合は、別途{" "}
              <Link to="/docs/intro">はじめに</Link> で全体マップを確認できます。
            </p>
          </div>

          <div className={styles.roleGrid}>
            {roleGuides.map((guide) => (
              <article key={guide.title} className={styles.roleCard}>
                <div className={styles.roleCardBody}>
                  <p className={styles.roleCardLabel}>Guide</p>
                  <Heading as="h3" className={styles.roleCardTitle}>
                    {guide.title}
                  </Heading>
                  <p className={styles.roleCardDescription}>{guide.description}</p>
                </div>

                <div className={styles.roleCardFooter}>
                  <Link className={styles.roleCardAction} to={guide.to}>
                    {guide.primaryAction}
                  </Link>
                  <Link className={styles.roleCardSubLink} to={guide.firstStepTo}>
                    {guide.firstStep}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.utilitySection}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Common references</p>
            <Heading as="h2" className={styles.sectionTitle}>
              共通ガイドと索引への入口
            </Heading>
            <p className={styles.sectionLead}>
              ロールをまたいで共通の前提を確認したいときや、画面名から逆引きしたいときに使います。
            </p>
          </div>

          <div className={styles.utilityGrid}>
            {utilityLinks.map((link) => (
              <Link key={link.title} className={styles.utilityCard} to={link.to}>
                <span className={styles.utilityTitle}>{link.title}</span>
                <span className={styles.utilityDescription}>{link.description}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
