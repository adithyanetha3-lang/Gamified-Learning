/**
 * Enhanced Prompt Templates for Educational Content Generation
 * Optimized for different difficulty levels and content types
 */

// ============================================================================
// Main Prompt Templates by Difficulty
// ============================================================================

const DIFFICULTY_TEMPLATES = {
  easy: `
## Difficulty: EASY (Foundational Knowledge)

Generate questions that test basic recall and understanding:
- Focus on definitions, facts, and simple concepts
- Use direct, clear language
- Avoid complex vocabulary
- Questions should test if students recognize key terms and ideas
- Bloom's Taxonomy: Remember, Understand

Example question types:
- "What is...?"
- "Which of the following defines...?"
- "True or False: ..."
- "Identify the correct..."

Quality checklist:
✓ Simple, clear wording
✓ One concept per question
✓ No trick questions
✓ Options clearly distinct
  `,

  medium: `
## Difficulty: MEDIUM (Application & Analysis)

Generate questions that test deeper understanding and application:
- Require students to apply concepts to new situations
- Include some analysis or comparison
- Use age-appropriate but more precise vocabulary
- Questions should test understanding, not just memorization
- Bloom's Taxonomy: Apply, Analyze

Example question types:
- "If X happens, what would Y be?"
- "Compare A and B..."
- "Which strategy would work best for...?"
- "Why does X lead to Y?"

Quality checklist:
✓ Requires thinking beyond memorization
✓ Realistic scenarios
✓ Multiple steps to solve
✓ Plausible distractors
  `,

  hard: `
## Difficulty: HARD (Synthesis & Evaluation)

Generate questions that test critical thinking and problem-solving:
- Require synthesis of multiple concepts
- Include evaluation or creation
- Present complex scenarios
- Questions should challenge advanced understanding
- Bloom's Taxonomy: Evaluate, Create

Example question types:
- "What would be the best approach to...?"
- "Evaluate the effectiveness of..."
- "Design a solution for..."
- "Analyze the relationship between..."

Quality checklist:
✓ Multi-step reasoning required
✓ Integration of concepts
✓ Critical thinking needed
✓ Real-world application
  `,
};

// ============================================================================
// Content Type Templates
// ============================================================================

const CONTENT_TYPE_TEMPLATES = {
  quiz: `
## Content Type: QUIZ QUESTIONS

Focus on creating assessable questions that:
- Have one clearly correct answer
- Include plausible distractors
- Test specific learning objectives
- Are fair and unbiased
- Can be answered in 30-60 seconds
  `,

  practice: `
## Content Type: PRACTICE EXERCISES

Focus on creating practice questions that:
- Help reinforce learning
- Provide immediate feedback
- Build confidence gradually
- Include helpful explanations
- Allow for self-paced learning
  `,

  assessment: `
## Content Type: ASSESSMENT

Focus on creating rigorous questions that:
- Comprehensively test understanding
- Align with curriculum standards
- Discriminate between levels of mastery
- Are valid and reliable
- Support fair grading
  `,

  review: `
## Content Type: REVIEW QUESTIONS

Focus on creating review questions that:
- Cover key concepts
- Help identify knowledge gaps
- Prepare for assessments
- Reinforce prior learning
- Build connections between topics
  `,
};

// ============================================================================
// Subject-Specific Guidelines
// ============================================================================

const SUBJECT_GUIDELINES = {
  mathematics: `
### Mathematics-Specific Guidelines:
- Use precise mathematical language
- Include numerical values and units
- Show clear problem-solving steps
- Use diagrams when helpful (describe them)
- Avoid overly abstract concepts for lower grades
- Test both calculation and conceptual understanding
  `,

  science: `
### Science-Specific Guidelines:
- Base questions on scientific method
- Include real-world applications
- Use accurate scientific terminology
- Reference observable phenomena
- Connect theory to practical examples
- Encourage scientific thinking
  `,

  language: `
### Language Arts Guidelines:
- Test grammar, vocabulary, comprehension
- Use age-appropriate passages
- Include context clues
- Test both rules and application
- Encourage clear communication
- Build language skills progressively
  `,

  social_studies: `
### Social Studies Guidelines:
- Focus on understanding over memorization
- Include cultural sensitivity
- Use diverse examples
- Connect past to present
- Encourage critical thinking
- Present balanced perspectives
  `,

  general: `
### General Guidelines:
- Align with curriculum standards
- Use clear, concise language
- Provide sufficient context
- Test understanding, not tricks
- Be culturally appropriate
- Support learning goals
  `,
};

// ============================================================================
// Rural Education Adaptations
// ============================================================================

const RURAL_EDUCATION_GUIDELINES = `
## Special Considerations for Rural Education

### Context Adaptation:
- Use examples from rural/agricultural contexts when relevant
- Avoid assumptions about urban experiences
- Include diverse cultural references
- Consider limited access to resources
- Use universally understood examples

### Language Considerations:
- Avoid overly complex vocabulary
- Define technical terms when used
- Use simple sentence structures
- Be mindful of second-language learners
- Include context clues

### Device Constraints:
- Keep questions concise (readable on small screens)
- Avoid requiring images/diagrams
- Use text-based questions
- Ensure clarity without formatting
- Test knowledge, not device capability

### Connectivity Awareness:
- Questions should be self-contained
- Don't reference external resources
- Include all necessary information
- Work offline when accessed
- No streaming or rich media requirements
`;

// ============================================================================
// Quality Assurance Criteria
// ============================================================================

const QUALITY_CRITERIA = `
## Quality Assurance Checklist

### Question Quality:
✓ Clear and unambiguous wording
✓ Tests specific learning objective
✓ Age-appropriate difficulty
✓ Grammatically correct
✓ Free from bias or stereotypes
✓ Culturally sensitive
✓ Curriculum-aligned
✓ Fair and balanced

### Answer Options:
✓ Exactly 4 options (A, B, C, D)
✓ One clearly correct answer
✓ Plausible distractors
✓ Similar length and complexity
✓ Grammatically parallel
✓ No "all of the above" or "none"
✓ Options don't give away answer
✓ No obvious patterns

### Explanation Quality:
✓ Explains why answer is correct
✓ Addresses common misconceptions
✓ Reinforces learning objective
✓ Concise and clear
✓ Educational, not just confirmatory

### Bloom's Taxonomy Alignment:
✓ Appropriate cognitive level
✓ Matches stated difficulty
✓ Supports learning progression
✓ Tests understanding, not just recall
`;

// ============================================================================
// Main Template Builder
// ============================================================================

export function getEnhancedPromptTemplate(difficulty = "medium", contentType = "quiz") {
  const difficultyTemplate = DIFFICULTY_TEMPLATES[difficulty] || DIFFICULTY_TEMPLATES.medium;
  const contentTypeTemplate = CONTENT_TYPE_TEMPLATES[contentType] || CONTENT_TYPE_TEMPLATES.quiz;

  return `
${difficultyTemplate}

${contentTypeTemplate}

${RURAL_EDUCATION_GUIDELINES}

${QUALITY_CRITERIA}

Remember: Generate curriculum-friendly questions that help students learn effectively!
  `.trim();
}

// ============================================================================
// Subject-Specific Template Builder
// ============================================================================

export function getSubjectSpecificGuidelines(subject) {
  const subjectKey = subject?.toLowerCase().includes("math") ? "mathematics"
    : subject?.toLowerCase().includes("science") ? "science"
    : subject?.toLowerCase().includes("english") || subject?.toLowerCase().includes("language") ? "language"
    : subject?.toLowerCase().includes("social") || subject?.toLowerCase().includes("history") ? "social_studies"
    : "general";

  return SUBJECT_GUIDELINES[subjectKey] || SUBJECT_GUIDELINES.general;
}

// ============================================================================
// Complete Prompt Builder with All Enhancements
// ============================================================================

export function buildCompletePrompt(payload) {
  const difficulty = payload.difficulty || "medium";
  const contentType = payload.contentType || "quiz";
  const subject = payload.subject || "General";

  return `
${getEnhancedPromptTemplate(difficulty, contentType)}

${getSubjectSpecificGuidelines(subject)}

## Additional Requirements for this Request:

**Subject**: ${subject}
**Topic**: ${payload.topic || "General"}
**Grade Level**: Class ${payload.classLevel}
**Question Count**: ${payload.count}
**Language**: ${payload.language || "English"}

${payload.lessonText ? `
**Lesson Context**:
${payload.lessonText}

Base your questions on the above lesson content while following all guidelines.
` : ""}

Generate exactly ${payload.count} high-quality, curriculum-aligned questions following all guidelines above.
  `.trim();
}

// ============================================================================
// Lesson Generation Templates
// ============================================================================

export function getLessonGenerationPrompt(payload) {
  return `
# Lesson Content Generation Request

Generate a structured lesson for:
- **Subject**: ${payload.subject}
- **Topic**: ${payload.topic}
- **Grade Level**: Class ${payload.classLevel}
- **Duration**: ${payload.duration || "30 minutes"}

## Lesson Structure:

1. **Introduction** (5 mins)
   - Hook to engage students
   - Learning objectives (3-5 clear goals)
   - Connection to prior knowledge

2. **Main Content** (15-20 mins)
   - Key concepts explained clearly
   - Examples from rural/relatable contexts
   - Step-by-step progression
   - Visual descriptions (no actual images)
   - Practice problems/activities

3. **Application** (5-7 mins)
   - Real-world applications
   - Practice exercises
   - Discussion prompts
   - Interactive elements

4. **Summary** (3-5 mins)
   - Key takeaways
   - Review questions
   - Connection to next lesson

## Guidelines:
- Simple, clear language
- Age-appropriate examples
- Rural education context
- Self-contained (works offline)
- Culturally sensitive
- Engaging and interactive

Return as structured JSON with sections as properties.
  `.trim();
}

// ============================================================================
// Explanation Generator
// ============================================================================

export function getExplanationPrompt(question, answer) {
  return `
Provide a clear, concise explanation for why this answer is correct:

**Question**: ${question}
**Correct Answer**: ${answer}

The explanation should:
- Be 2-3 sentences maximum
- Explain the reasoning
- Address common misconceptions
- Reinforce the learning objective
- Use simple language

Return only the explanation text.
  `.trim();
}

// ============================================================================
// Export All Templates
// ============================================================================

export default {
  getEnhancedPromptTemplate,
  getSubjectSpecificGuidelines,
  buildCompletePrompt,
  getLessonGenerationPrompt,
  getExplanationPrompt,
  DIFFICULTY_TEMPLATES,
  CONTENT_TYPE_TEMPLATES,
  SUBJECT_GUIDELINES,
};
