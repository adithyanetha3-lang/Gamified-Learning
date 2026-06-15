/**
 * Smart Question Generator
 * Generates high-quality, subject-specific questions using templates and rules
 * Much faster and more accurate than relying solely on LLM
 */

// ============================================================================
// Subject-Specific Question Templates
// ============================================================================

const QUESTION_TEMPLATES = {
  'Data Mining': {
    easy: [
      {
        question: "What is the primary goal of data mining?",
        options: ["Data storage", "Pattern discovery and knowledge extraction", "Data visualization", "Data deletion"],
        correct: 1,
        explanation: "Data mining focuses on discovering patterns, trends, and knowledge from large datasets using various algorithms and techniques."
      },
      {
        question: "Which of the following is a data mining task?",
        options: ["Database backup", "Classification", "File compression", "Network routing"],
        correct: 1,
        explanation: "Classification is a fundamental data mining task that assigns data points to predefined categories based on their features."
      },
      {
        question: "What does KDD stand for in data mining?",
        options: ["Key Data Discovery", "Knowledge Discovery in Databases", "Known Data Distribution", "Kernel Data Design"],
        correct: 1,
        explanation: "KDD (Knowledge Discovery in Databases) is the complete process of discovering useful knowledge from data, which includes data mining as a key step."
      },
      {
        question: "What is clustering in data mining?",
        options: ["Sorting data alphabetically", "Grouping similar data points together without predefined labels", "Deleting duplicate data", "Encrypting sensitive data"],
        correct: 1,
        explanation: "Clustering is an unsupervised learning technique that groups similar data points based on their characteristics without predefined labels. Example: K-means clustering."
      },
      {
        question: "Which data mining technique predicts categorical values?",
        options: ["Regression", "Classification", "Association Rule Mining", "Dimension Reduction"],
        correct: 1,
        explanation: "Classification predicts categorical class labels (e.g., spam/not spam, approved/rejected). Regression predicts continuous numerical values."
      },
      {
        question: "What is association rule mining used for?",
        options: ["Predicting stock prices", "Finding relationships between items in transactions", "Image recognition", "Text translation"],
        correct: 1,
        explanation: "Association rule mining discovers interesting relationships between variables in large databases, commonly used for market basket analysis (e.g., 'customers who buy bread often buy milk')."
      },
      {
        question: "What does CRISP-DM stand for?",
        options: ["Cross-Industry Standard Process for Data Mining", "Central Repository for Industry Standard Process", "Centralized Resource for Information Systems", "Cross-Reference Index System"],
        correct: 0,
        explanation: "CRISP-DM (Cross-Industry Standard Process for Data Mining) is a widely-used framework with 6 phases: Business Understanding, Data Understanding, Data Preparation, Modeling, Evaluation, Deployment."
      },
      {
        question: "What is the difference between supervised and unsupervised learning?",
        options: ["Supervised uses labeled data, unsupervised does not", "Supervised is faster", "Unsupervised is more accurate", "They are the same"],
        correct: 0,
        explanation: "Supervised learning uses labeled training data (input-output pairs) like classification/regression. Unsupervised learning finds patterns in unlabeled data like clustering/association rules."
      }
    ],
    medium: [
      {
        question: "Which algorithm is used for finding frequent itemsets in transaction data?",
        options: ["Decision Trees", "Apriori Algorithm", "Linear Regression", "K-Nearest Neighbors"],
        correct: 1,
        explanation: "The Apriori algorithm efficiently discovers frequent itemsets in transactional databases using the principle: if an itemset is frequent, all its subsets must also be frequent."
      },
      {
        question: "In the context of classification, what is overfitting?",
        options: ["Model performs well on all data", "Model memorizes training data but fails on new data", "Model is too simple", "Model trains too quickly"],
        correct: 1,
        explanation: "Overfitting occurs when a model learns training data too well, including noise, leading to poor generalization on unseen data. Solutions: cross-validation, regularization, pruning."
      },
      {
        question: "What is the support of an itemset {bread, milk} if it appears in 300 out of 1000 transactions?",
        options: ["0.3 or 30%", "0.5 or 50%", "300", "1000"],
        correct: 0,
        explanation: "Support = (transactions containing itemset) / (total transactions) = 300/1000 = 0.3 or 30%. Support measures how frequently an itemset appears."
      },
      {
        question: "Which evaluation metric is best for imbalanced classification datasets?",
        options: ["Accuracy", "F1-Score", "Mean", "Variance"],
        correct: 1,
        explanation: "F1-Score = 2 × (Precision × Recall)/(Precision + Recall) is ideal for imbalanced datasets where accuracy can be misleading (e.g., 95% negative class, 5% positive class)."
      },
      {
        question: "What is the elbow method used for in K-means clustering?",
        options: ["Determining optimal k (number of clusters)", "Calculating cluster centroids", "Removing outliers", "Normalizing data"],
        correct: 0,
        explanation: "The elbow method plots Within-Cluster Sum of Squares (WCSS) vs k. The 'elbow' point (where WCSS decrease slows) suggests optimal k where adding clusters yields diminishing returns."
      },
      {
        question: "In decision trees, what does information gain measure?",
        options: ["Tree height", "Reduction in entropy after a split", "Number of leaf nodes", "Training time"],
        correct: 1,
        explanation: "Information Gain = Entropy(parent) - Weighted Average Entropy(children). It measures how much uncertainty is reduced by splitting on a particular attribute. Higher gain = better split."
      },
      {
        question: "What is the confidence of association rule A→B if support(A,B)=0.2 and support(A)=0.5?",
        options: ["0.2", "0.4", "0.5", "0.7"],
        correct: 1,
        explanation: "Confidence(A→B) = support(A,B) / support(A) = 0.2 / 0.5 = 0.4 or 40%. It measures the likelihood of B given A (how often B occurs when A occurs)."
      },
      {
        question: "What is the curse of dimensionality?",
        options: ["Too much training data", "Performance degrades with too many features", "Insufficient memory", "Slow training speed"],
        correct: 1,
        explanation: "As dimensions (features) increase, data becomes sparse in high-dimensional space. Distance measures become less meaningful, requiring exponentially more data. Solution: dimensionality reduction (PCA, feature selection)."
      }
    ],
    hard: [
      {
        question: "Given support threshold=40% and 100 transactions, what is minimum support count for Apriori?",
        options: ["4", "40", "400", "0.4"],
        correct: 1,
        explanation: "Minimum support count = support threshold × total transactions = 0.40 × 100 = 40 transactions. An itemset must appear in ≥40 transactions to be frequent."
      },
      {
        question: "Calculate precision: TP=45, TN=50, FP=5, FN=10",
        options: ["0.75", "0.90", "0.82", "0.85"],
        correct: 1,
        explanation: "Precision = TP/(TP+FP) = 45/(45+5) = 45/50 = 0.90 or 90%. Precision measures accuracy of positive predictions. Recall = TP/(TP+FN) = 45/55 = 0.82."
      },
      {
        question: "What is Gini impurity for node with 60% class A and 40% class B?",
        options: ["0.24", "0.48", "0.60", "1.00"],
        correct: 1,
        explanation: "Gini = 1 - Σ(p_i)² = 1 - (0.6² + 0.4²) = 1 - (0.36 + 0.16) = 1 - 0.52 = 0.48. Lower Gini = purer node. Gini=0 means pure node (one class)."
      },
      {
        question: "In hierarchical clustering, what linkage method uses maximum distance between cluster points?",
        options: ["Single linkage", "Complete linkage", "Average linkage", "Centroid linkage"],
        correct: 1,
        explanation: "Complete linkage (MAX) uses maximum distance between any two points in different clusters. Single linkage uses MIN distance. Complete linkage produces compact clusters, less sensitive to outliers."
      },
      {
        question: "Calculate lift for rule A→B: support(A,B)=0.2, support(A)=0.5, support(B)=0.4",
        options: ["0.4", "1.0", "1.5", "2.0"],
        correct: 1,
        explanation: "Lift = confidence(A→B)/support(B) = [support(A,B)/support(A)]/support(B) = [0.2/0.5]/0.4 = 0.4/0.4 = 1.0. Lift=1 means A and B are independent (no association)."
      },
      {
        question: "What does PCA (Principal Component Analysis) maximize when reducing dimensions?",
        options: ["Number of features", "Variance captured", "Training speed", "Accuracy"],
        correct: 1,
        explanation: "PCA finds orthogonal axes (principal components) that capture maximum variance in data. First PC has highest variance, second has next highest (orthogonal to first), etc. Reduces dimensions while retaining information."
      },
      {
        question: "In K-means, if WCSS (within-cluster sum of squares) is high, what does it indicate?",
        options: ["Perfect clustering", "Poor clustering (high variance within clusters)", "Too many clusters", "Optimal k found"],
        correct: 1,
        explanation: "WCSS = Σ(distance from point to its cluster centroid)². High WCSS means points are far from centroids (spread out, poor cohesion). Lower WCSS = better clustering."
      },
      {
        question: "Calculate entropy for dataset with 8 positive and 4 negative examples (use log₂)",
        options: ["0.81 bits", "0.92 bits", "1.00 bits", "1.50 bits"],
        correct: 1,
        explanation: "Entropy = -Σ(p_i × log₂(p_i)) = -(8/12 × log₂(8/12) + 4/12 × log₂(4/12)) = -(0.667×(-0.585) + 0.333×(-1.585)) = 0.390 + 0.528 = 0.918 ≈ 0.92 bits. Max entropy=1.0 (50-50 split)."
      }
    ]
  },

  'Mathematics': {
    easy: [
      {
        question: "Solve for x: x + 5 = 12",
        options: ["x = 5", "x = 7", "x = 12", "x = 17"],
        correct: 1,
        explanation: "Subtract 5 from both sides: x = 12 - 5 = 7. Check: 7 + 5 = 12 ✓"
      },
      {
        question: "What is 20% of 150?",
        options: ["20", "25", "30", "35"],
        correct: 2,
        explanation: "20% of 150 = (20/100) × 150 = 0.20 × 150 = 30"
      },
      {
        question: "What is the area of a rectangle with length 8 cm and width 5 cm?",
        options: ["13 cm²", "26 cm²", "40 cm²", "80 cm²"],
        correct: 2,
        explanation: "Area of rectangle = length × width = 8 × 5 = 40 cm²"
      },
      {
        question: "What is 7 × 9?",
        options: ["56", "63", "72", "81"],
        correct: 1,
        explanation: "7 × 9 = 63. This is a basic multiplication fact."
      },
      {
        question: "What is the sum of angles in a triangle?",
        options: ["90°", "180°", "270°", "360°"],
        correct: 1,
        explanation: "The sum of all three interior angles of any triangle always equals 180°."
      }
    ],
    medium: [
      {
        question: "Solve for x: 3x - 7 = 20",
        options: ["x = 7", "x = 9", "x = 11", "x = 13"],
        correct: 1,
        explanation: "Add 7 to both sides: 3x = 27. Divide by 3: x = 9. Check: 3(9) - 7 = 27 - 7 = 20 ✓"
      },
      {
        question: "If a circle has a radius of 7 cm, what is its area? (Use π ≈ 22/7)",
        options: ["44 cm²", "88 cm²", "154 cm²", "308 cm²"],
        correct: 2,
        explanation: "Area = πr² = (22/7) × 7² = (22/7) × 49 = 22 × 7 = 154 cm²"
      },
      {
        question: "What is the slope of the line passing through points (2, 3) and (6, 11)?",
        options: ["1", "2", "3", "4"],
        correct: 1,
        explanation: "Slope = (y₂ - y₁)/(x₂ - x₁) = (11 - 3)/(6 - 2) = 8/4 = 2"
      },
      {
        question: "Simplify: (x² × x³)",
        options: ["x⁵", "x⁶", "x⁸", "2x⁵"],
        correct: 0,
        explanation: "When multiplying same bases, add exponents: x² × x³ = x^(2+3) = x⁵"
      },
      {
        question: "If 3x + 2y = 13 and x = 3, what is y?",
        options: ["y = 1", "y = 2", "y = 3", "y = 4"],
        correct: 1,
        explanation: "Substitute x = 3: 3(3) + 2y = 13 → 9 + 2y = 13 → 2y = 4 → y = 2"
      }
    ],
    hard: [
      {
        question: "Solve the quadratic equation: x² - 5x + 6 = 0",
        options: ["x = 1 or x = 6", "x = 2 or x = 3", "x = -2 or x = -3", "x = 0 or x = 5"],
        correct: 1,
        explanation: "Factor: (x - 2)(x - 3) = 0. Therefore x = 2 or x = 3. Check: 2² - 5(2) + 6 = 4 - 10 + 6 = 0 ✓"
      },
      {
        question: "Find the derivative of f(x) = 3x² + 2x - 5",
        options: ["f'(x) = 3x + 2", "f'(x) = 6x + 2", "f'(x) = 6x² + 2x", "f'(x) = x² + x"],
        correct: 1,
        explanation: "Using power rule: d/dx(3x²) = 6x, d/dx(2x) = 2, d/dx(-5) = 0. Therefore f'(x) = 6x + 2"
      },
      {
        question: "What is log₂(32)?",
        options: ["4", "5", "6", "16"],
        correct: 1,
        explanation: "log₂(32) asks '2 to what power equals 32?' Since 2⁵ = 32, log₂(32) = 5"
      },
      {
        question: "If sin(θ) = 3/5 and θ is in the first quadrant, what is cos(θ)?",
        options: ["3/5", "4/5", "5/3", "5/4"],
        correct: 1,
        explanation: "Using Pythagorean identity: sin²(θ) + cos²(θ) = 1 → (3/5)² + cos²(θ) = 1 → cos²(θ) = 16/25 → cos(θ) = 4/5"
      },
      {
        question: "What is the sum of the arithmetic sequence: 5, 8, 11, ..., 50?",
        options: ["415", "425", "435", "445"],
        correct: 0,
        explanation: "n = 16 terms (last term: 5 + (n-1)×3 = 50). Sum = n/2 × (first + last) = 16/2 × (5 + 50) = 8 × 55 = 440"
      }
    ]
  },

  'Science': {
    easy: [
      {
        question: "What is the chemical formula for water?",
        options: ["H₂O", "CO₂", "O₂", "H₂O₂"],
        correct: 0,
        explanation: "Water consists of 2 hydrogen atoms and 1 oxygen atom, hence H₂O."
      },
      {
        question: "What process do plants use to make food from sunlight?",
        options: ["Respiration", "Photosynthesis", "Digestion", "Fermentation"],
        correct: 1,
        explanation: "Photosynthesis: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂"
      },
      {
        question: "What is the center of an atom called?",
        options: ["Electron", "Proton", "Nucleus", "Neutron"],
        correct: 2,
        explanation: "The nucleus contains protons and neutrons, while electrons orbit around it."
      },
      {
        question: "Which planet is closest to the Sun?",
        options: ["Venus", "Earth", "Mercury", "Mars"],
        correct: 2,
        explanation: "Mercury is the closest planet to the Sun at an average distance of 57.9 million km."
      },
      {
        question: "What gas do plants release during photosynthesis?",
        options: ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"],
        correct: 1,
        explanation: "Plants take in CO₂ and release O₂ as a byproduct of photosynthesis."
      }
    ],
    medium: [
      {
        question: "What is Newton's Second Law of Motion?",
        options: ["Objects at rest stay at rest", "F = ma", "Every action has equal reaction", "Energy is conserved"],
        correct: 1,
        explanation: "Newton's Second Law: Force = mass × acceleration (F = ma). Greater force or less mass means greater acceleration."
      },
      {
        question: "What is the pH of a neutral solution?",
        options: ["0", "7", "10", "14"],
        correct: 1,
        explanation: "pH scale: 0-6 (acidic), 7 (neutral), 8-14 (basic). Pure water has pH 7."
      },
      {
        question: "What type of bond shares electrons between atoms?",
        options: ["Ionic", "Covalent", "Metallic", "Hydrogen"],
        correct: 1,
        explanation: "Covalent bonds form when atoms share electron pairs. Example: H₂O has covalent bonds between H and O."
      },
      {
        question: "What is the powerhouse of the cell?",
        options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
        correct: 1,
        explanation: "Mitochondria produce ATP (energy) through cellular respiration, earning the nickname 'powerhouse of the cell'."
      },
      {
        question: "What is the most abundant gas in Earth's atmosphere?",
        options: ["Oxygen (O₂)", "Carbon dioxide (CO₂)", "Nitrogen (N₂)", "Argon (Ar)"],
        correct: 2,
        explanation: "Earth's atmosphere: 78% Nitrogen, 21% Oxygen, 1% other gases (Argon, CO₂, etc.)"
      }
    ],
    hard: [
      {
        question: "Calculate the molarity of a solution containing 58.5g NaCl in 500mL water (NaCl = 58.5 g/mol)",
        options: ["1M", "2M", "3M", "4M"],
        correct: 1,
        explanation: "Moles = 58.5g / 58.5g/mol = 1 mol. Molarity = moles/L = 1 mol / 0.5 L = 2M"
      },
      {
        question: "What is the first law of thermodynamics?",
        options: ["Entropy increases", "Energy cannot be created or destroyed", "Heat flows from hot to cold", "Absolute zero is unreachable"],
        correct: 1,
        explanation: "First Law: ΔU = Q - W. Energy can only be converted between forms, not created/destroyed. Total energy in isolated system remains constant."
      },
      {
        question: "In which phase of mitosis do chromosomes align at the cell's center?",
        options: ["Prophase", "Metaphase", "Anaphase", "Telophase"],
        correct: 1,
        explanation: "Metaphase: chromosomes align at metaphase plate. Order: Prophase → Metaphase → Anaphase → Telophase → Cytokinesis"
      },
      {
        question: "What is the half-life of a radioactive isotope if 25% remains after 30 years?",
        options: ["10 years", "15 years", "20 years", "30 years"],
        correct: 1,
        explanation: "25% = (1/2)² means 2 half-lives occurred. 30 years / 2 = 15 years per half-life."
      },
      {
        question: "Calculate kinetic energy of 2kg mass moving at 10 m/s (KE = ½mv²)",
        options: ["50 J", "100 J", "150 J", "200 J"],
        correct: 1,
        explanation: "KE = ½ × 2kg × (10 m/s)² = ½ × 2 × 100 = 100 Joules"
      }
    ]
  }
};

// ============================================================================
// Generate Questions Based on Subject and Difficulty
// ============================================================================

export function generateSmartQuestions(payload) {
  const { subject, topic, difficulty, count, classLevel } = payload;
  const difficultyLevel = (difficulty || 'medium').toLowerCase();
  const questionCount = Math.min(parseInt(count) || 5, 10);

  // Get subject templates
  let subjectTemplates = QUESTION_TEMPLATES[subject];
  
  // If subject not found, try partial match
  if (!subjectTemplates) {
    const subjectKey = Object.keys(QUESTION_TEMPLATES).find(key => 
      subject.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(subject.toLowerCase())
    );
    subjectTemplates = subjectKey ? QUESTION_TEMPLATES[subjectKey] : null;
  }

  // If still no templates, generate generic but educational questions
  if (!subjectTemplates) {
    console.log(`⚠️ No templates for "${subject}", generating generic educational questions`);
    return generateGenericQuestions(payload);
  }

  // Get questions for the difficulty level
  const questions = subjectTemplates[difficultyLevel] || subjectTemplates['medium'] || [];

  // Select questions (cycle if needed)
  const selectedQuestions = [];
  for (let i = 0; i < questionCount; i++) {
    const template = questions[i % questions.length];
    selectedQuestions.push({
      id: `smart-${Date.now()}-${i}`,
      subject: subject,
      topic: topic || subject,
      classLevel: classLevel || 'Grade 10',
      difficulty: difficultyLevel,
      question: template.question,
      options: template.options,
      correctAnswer: template.correct,
      explanation: template.explanation,
      bloomsLevel: difficultyLevel === 'easy' ? 'remember' : difficultyLevel === 'hard' ? 'apply' : 'understand',
      approved: true,
      status: "published",
      aiGenerated: false,
      source: "smart-generator",
      createdAt: new Date().toISOString(),
    });
  }

  return selectedQuestions;
}

// ============================================================================
// Generate Generic But Educational Questions for Any Subject
// ============================================================================

function generateGenericQuestions(payload) {
  const { subject, topic, difficulty, count, classLevel } = payload;
  const topicName = topic || subject;
  const questionCount = Math.min(parseInt(count) || 5, 10);
  
  const questions = [];
  
  const templates = [
    {
      type: "definition",
      question: `What is the primary concept of ${topicName}?`,
      options: [
        `The study and application of ${topicName} principles`,
        `A method unrelated to ${subject}`,
        `A historical approach to ${subject}`,
        `An outdated technique`
      ],
      correct: 0,
      explanation: `${topicName} is a fundamental concept in ${subject} that involves understanding and applying specific principles and techniques in this field.`
    },
    {
      type: "application",
      question: `How is ${topicName} typically applied in ${subject}?`,
      options: [
        `By following systematic procedures and methodologies`,
        `Through random trial and error`,
        `Without any structured approach`,
        `Only in theoretical contexts`
      ],
      correct: 0,
      explanation: `${topicName} is applied using systematic procedures and methodologies that have been proven effective in ${subject} practice and research.`
    },
    {
      type: "importance",
      question: `Why is understanding ${topicName} important in ${subject}?`,
      options: [
        `It forms a foundational concept for advanced topics`,
        `It is only for beginners`,
        `It has no practical applications`,
        `It is optional knowledge`
      ],
      correct: 0,
      explanation: `Understanding ${topicName} is crucial because it forms a foundational concept that supports learning advanced topics and practical applications in ${subject}.`
    },
    {
      type: "comparison",
      question: `What distinguishes ${topicName} from other concepts in ${subject}?`,
      options: [
        `Its specific approach and methodology`,
        `It is identical to all other concepts`,
        `It has no unique characteristics`,
        `It is the simplest concept`
      ],
      correct: 0,
      explanation: `${topicName} is distinguished by its specific approach, methodology, and application within the broader field of ${subject}.`
    },
    {
      type: "skill",
      question: `What skill is most essential when working with ${topicName}?`,
      options: [
        `Analytical thinking and problem-solving`,
        `Memorization only`,
        `Guessing techniques`,
        `Avoiding practice`
      ],
      correct: 0,
      explanation: `Analytical thinking and problem-solving are essential skills when working with ${topicName}, as they allow you to apply concepts effectively to real-world situations.`
    }
  ];
  
  for (let i = 0; i < questionCount; i++) {
    const template = templates[i % templates.length];
    questions.push({
      id: `generic-${Date.now()}-${i}`,
      subject: subject,
      topic: topicName,
      classLevel: classLevel || 'Grade 10',
      difficulty: difficulty || 'medium',
      question: template.question,
      options: template.options,
      correctAnswer: template.correct,
      explanation: template.explanation,
      bloomsLevel: 'understand',
      approved: true,
      status: "published",
      aiGenerated: false,
      source: "generic-generator",
      createdAt: new Date().toISOString(),
    });
  }
  
  return questions;
}

// ============================================================================
// Check if we have templates for a subject
// ============================================================================

export function hasTemplatesFor(subject) {
  return !!QUESTION_TEMPLATES[subject] || 
    Object.keys(QUESTION_TEMPLATES).some(key => 
      subject.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(subject.toLowerCase())
    );
}

export default {
  generateSmartQuestions,
  hasTemplatesFor,
};
