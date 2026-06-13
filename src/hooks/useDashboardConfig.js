import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export function useDashboardConfig() {
  const { t } = useTranslation();

  return useMemo(() => ({
    student: {
      header: {
        eyebrow: t('dashboard.welcome'),
        subtitle: "Pick a path and keep moving."
      },
      options: [
        { key: "learn", icon: "learn", title: t('navigation.learn'), label: "Academy", to: "/learn" },
        { key: "courses", icon: "courses", title: "Courses", label: t('navigation.subjects'), to: "/courses" },
        { key: "quiz", icon: "quiz", title: t('navigation.quiz'), label: "Practice", to: "/quiz" },
        { key: "rewards", icon: "rewards", title: t('navigation.rewards'), label: "Badges", to: "/rewards" },
        { key: "leaderboard", icon: "leaderboard", title: "Rank", label: t('navigation.leaderboard'), to: "/leaderboard" },
        { key: "progress", icon: "progress", title: t('navigation.progress'), label: "Progress", to: "/progress" }
      ],
      actions: [
        { label: "Continue Learning", to: "/learn", primary: true },
        { label: t('progress.recentActivity'), to: "/rewards" },
        { label: "Practice Quiz", to: "/quiz" }
      ],
      navItems: [
        { label: t('navigation.home'), to: "/home", icon: "home" },
        { label: t('navigation.learn'), to: "/learn", icon: "learn" },
        { label: t('navigation.quiz'), to: "/quiz", icon: "quiz" },
        { label: t('navigation.rewards'), to: "/rewards", icon: "rewards" },
        { label: t('navigation.progress'), to: "/progress", icon: "progress" }
      ]
    },
    teacher: {
      header: {
        eyebrow: "Teaching Hub",
        subtitle: "Review, publish, and track class activity."
      },
      options: [
        { key: "subjects", icon: "students", title: t('navigation.subjects'), label: "Manage", to: "/subjects" },
        { key: "generator", icon: "questions", title: t('navigation.generate'), label: "AI Questions", to: "/generator" },
        { key: "bank", icon: "bank", title: t('navigation.bank'), label: "Questions", to: "/question-bank" },
        { key: "analytics", icon: "analytics", title: t('navigation.analytics'), label: "Reports", to: "/analytics" },
        { key: "teacher", icon: "manage", title: "Dashboard", label: "Overview", to: "/teacher" }
      ],
      actions: [
        { label: t('generator.generate') + " Questions", to: "/generator", primary: true },
        { label: "Question Bank", to: "/question-bank" },
        { label: "View " + t('navigation.analytics'), to: "/analytics" }
      ],
      navItems: [
        { label: t('navigation.home'), to: "/home", icon: "home" },
        { label: t('navigation.subjects'), to: "/subjects", icon: "students" },
        { label: t('navigation.generate'), to: "/generator", icon: "questions" },
        { label: t('navigation.bank'), to: "/question-bank", icon: "bank" },
        { label: t('navigation.analytics'), to: "/analytics", icon: "analytics" }
      ]
    }
  }), [t]);
}
