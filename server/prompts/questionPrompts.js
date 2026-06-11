export function getPromptTemplateText(type = "basic") {
  const templates = {
    basic: `Create simple MCQs using short and clear language. Keep questions suitable for rural school students and avoid difficult vocabulary.`,
    medium: `Create medium-difficulty MCQs that require understanding of the lesson, not just memorization.`,
    revision: `Create revision MCQs that help students quickly review major lesson points before class tests.`,
    "daily-practice": `Create daily practice MCQs with direct language, practical examples, and confidence-building difficulty.`
  };
  return templates[type] || templates.basic;
}
