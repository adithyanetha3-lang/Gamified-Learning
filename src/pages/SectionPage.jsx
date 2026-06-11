import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import AppIcon from "../components/AppIcon";
import InfoPanel from "../components/InfoPanel";
import MainSection from "../components/MainSection";
import PageHeader from "../components/PageHeader";
import QuickActionPanel from "../components/QuickActionPanel";
import SummaryBar from "../components/SummaryBar";
import { DASHBOARD_CONFIG, SECTION_CONTENT } from "../data/dashboardConfig";
import { useAuthSession } from "../hooks/useAuthSession";

function buildSectionActions(role, key) {
  const homeRoute = "/home";
  const defaults = role === "teacher"
    ? [
        { label: "Back Home", to: homeRoute, primary: true },
        { label: "Open Tool", to: `/app/${key}` },
        { label: "Next Task", to: "/app/manage" }
      ]
    : [
        { label: "Back Home", to: homeRoute, primary: true },
        { label: "Keep Going", to: `/app/${key}` },
        { label: "Open Progress", to: "/app/progress" }
      ];

  return defaults;
}

function SectionPage() {
  const navigate = useNavigate();
  const { sectionKey } = useParams();
  const { profile } = useAuthSession();

  const content = useMemo(() => {
    if (!profile?.role) return null;
    return SECTION_CONTENT[profile.role]?.[sectionKey] || null;
  }, [profile?.role, sectionKey]);

  useEffect(() => {
    if (profile && !content) {
      navigate("/home", { replace: true });
    }
  }, [content, navigate, profile]);

  if (!profile) {
    return null;
  }

  if (!content) {
    return null;
  }

  const relatedOptions = (DASHBOARD_CONFIG[profile.role]?.options || []).filter((item) => item.key !== sectionKey).slice(0, 3);

  return (
    <AppShell profile={profile}>
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <PageHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.subtitle} />

        <SummaryBar items={content.stats.map((item, index) => ({ ...item, tone: index === 0 ? "accent" : "default" }))} />

        <MainSection title="Overview" meta="Live">
          <InfoPanel items={content.panels.primary} />
        </MainSection>

        <MainSection title="Quick Actions" meta="Next Step">
          <QuickActionPanel actions={buildSectionActions(profile.role, sectionKey)} />
        </MainSection>

        <section className="info-grid">
          <MainSection title="Focus" meta="Today">
            <InfoPanel items={content.panels.secondary} />
          </MainSection>
          <MainSection title="More" meta="Explore">
            <div className="mini-option-list">
              {relatedOptions.map((item) => (
                <Link className="mini-option" to={item.to} key={item.key}>
                  <span><AppIcon name={item.icon} /></span>
                  <strong>{item.title}</strong>
                </Link>
              ))}
            </div>
          </MainSection>
        </section>

        <section className="info-grid">
          <MainSection title="Topics" meta="Included">
            <div className="topic-grid">
              {content.topics.map((topic) => (
                <article className="topic-card" key={topic.title}>
                  <h3>{topic.title}</h3>
                  <p>{topic.info}</p>
                </article>
              ))}
            </div>
          </MainSection>
          <MainSection title="Related Topics" meta="Connected">
            <InfoPanel items={content.related} />
          </MainSection>
        </section>
      </motion.div>
    </AppShell>
  );
}

export default SectionPage;
