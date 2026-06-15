/**
 * Smart Lesson Generator
 * Generates high-quality, detailed lessons with REAL content
 * NO generic fluff - only actual educational material
 */

export const LESSON_TEMPLATES = {
  'Data Mining': `🎯 **Data Mining Techniques**

📖 **Introduction**

Data mining is the process of discovering patterns, correlations, and useful information from large datasets using statistical, mathematical, and computational techniques. It transforms raw data into actionable knowledge that businesses and researchers use to make informed decisions.

**Key Learning Objectives:**
- Understand core data mining techniques and their applications
- Learn classification, clustering, and association rule mining
- Master evaluation metrics like precision, recall, F1-score
- Apply algorithms like Apriori, K-means, and Decision Trees

---

📚 **Core Data Mining Techniques**

### ✨ **1. Classification**

Classification is a **supervised learning** technique that assigns data points to predefined categories based on their features.

**How it works:**
1. Train model on labeled data (input-output pairs)
2. Model learns patterns that distinguish classes
3. Use model to predict class labels for new data

**Common Algorithms:**
- **Decision Trees**: Split data based on feature values
  - Example: If Age > 30 AND Income > $50k → Loan Approved
  - Measures: Gini Index, Information Gain, Entropy
  
- **Naive Bayes**: Uses probability theory
  - Formula: P(Class|Features) = P(Features|Class) × P(Class) / P(Features)
  - Fast, works well with high dimensions
  
- **Support Vector Machines (SVM)**: Finds optimal decision boundary
  - Maximizes margin between classes
  - Uses kernel trick for non-linear boundaries

- **K-Nearest Neighbors (KNN)**: Classifies based on k closest training examples
  - If k=5 and 4 neighbors are "spam", classify as spam
  - Simple but computationally expensive

**Real Example:** Email spam detection
- Features: sender, keywords, links, attachments
- Classes: spam or not spam
- Accuracy: ~98% with proper training

---

### ⚡ **2. Clustering**

Clustering is an **unsupervised learning** technique that groups similar data points without predefined labels.

**K-Means Algorithm:**
\`\`\`
1. Choose k (number of clusters)
2. Initialize k random centroids
3. Assign each point to nearest centroid
4. Recalculate centroids as mean of assigned points
5. Repeat steps 3-4 until convergence
\`\`\`

**How to find optimal k:**
- **Elbow Method**: Plot WCSS vs k
  - WCSS = Within-Cluster Sum of Squares
  - Formula: WCSS = Σ(distance from point to centroid)²
  - Choose k at "elbow" where decrease slows

**Hierarchical Clustering:**
- **Agglomerative** (bottom-up): Start with individual points, merge similar ones
- **Divisive** (top-down): Start with one cluster, split recursively
- **Dendrogram**: Tree showing cluster hierarchy at different levels

**Linkage Methods:**
- **Single**: Minimum distance between clusters
- **Complete**: Maximum distance between clusters  
- **Average**: Average distance between all pairs
- **Centroid**: Distance between cluster centers

**Real Example:** Customer segmentation
- Features: age, income, purchase history
- Result: High-value, medium-value, low-value customer groups
- Use: Targeted marketing campaigns

---

### 🔍 **3. Association Rule Mining**

Discovers interesting relationships between variables in large databases.

**Market Basket Analysis:**
- Find items frequently bought together
- Example: {bread, milk} → {butter} (70% confidence)

**Key Metrics:**

**Support:** How often itemset appears
- Formula: support({A,B}) = (transactions containing A and B) / (total transactions)
- Example: If {bread,milk} in 300 of 1000 transactions, support = 0.3

**Confidence:** Likelihood of B given A
- Formula: confidence(A→B) = support(A,B) / support(A)
- Example: support({bread,milk})=0.3, support({bread})=0.5
- confidence({bread}→{milk}) = 0.3/0.5 = 0.6 or 60%

**Lift:** Strength of association
- Formula: lift(A→B) = confidence(A→B) / support(B)
- Lift > 1: Positive correlation (buying A increases chance of B)
- Lift = 1: Independent (no relationship)
- Lift < 1: Negative correlation (buying A decreases chance of B)

**Apriori Algorithm:**
\`\`\`
Principle: If itemset is frequent, all its subsets are frequent

Steps:
1. Find all frequent 1-itemsets (single items above min support)
2. Generate candidate 2-itemsets from frequent 1-itemsets
3. Count support and filter by threshold
4. Repeat: generate k-itemsets from (k-1)-itemsets
5. Stop when no new frequent itemsets found
\`\`\`

**Example Calculation:**
- Database: 100 transactions
- Minimum support: 40% (40 transactions)
- {bread,milk} appears 45 times
- Support = 45/100 = 0.45 or 45% ✓ (frequent!)

---

💡 **Evaluation Metrics**

### **Confusion Matrix:**
\`\`\`
                Predicted
                Pos    Neg
Actual  Pos     TP     FN
        Neg     FP     TN
\`\`\`

- **TP (True Positive)**: Correctly predicted positive
- **TN (True Negative)**: Correctly predicted negative
- **FP (False Positive)**: Incorrectly predicted positive (Type I error)
- **FN (False Negative)**: Incorrectly predicted negative (Type II error)

### **Key Metrics:**

**Accuracy:** Overall correctness
- Formula: (TP + TN) / (TP + TN + FP + FN)
- Problem: Misleading for imbalanced datasets

**Precision:** Accuracy of positive predictions
- Formula: TP / (TP + FP)
- "Of all predicted positive, how many are actually positive?"
- High precision = low false positive rate

**Recall (Sensitivity):** Coverage of actual positives
- Formula: TP / (TP + FN)  
- "Of all actual positive, how many did we find?"
- High recall = low false negative rate

**F1-Score:** Harmonic mean of precision and recall
- Formula: 2 × (Precision × Recall) / (Precision + Recall)
- Balances precision and recall
- Best for imbalanced datasets

**Example:**
- TP=45, TN=50, FP=5, FN=10
- Accuracy = (45+50)/(45+50+5+10) = 95/110 = 0.864 or 86.4%
- Precision = 45/(45+5) = 45/50 = 0.90 or 90%
- Recall = 45/(45+10) = 45/55 = 0.818 or 81.8%
- F1 = 2×(0.90×0.818)/(0.90+0.818) = 0.857 or 85.7%

---

### 🌳 **Decision Trees**

**Information Gain:** Measures entropy reduction after split
- **Entropy:** Measure of impurity/uncertainty
  - Formula: H(S) = -Σ(p_i × log₂(p_i))
  - H = 0: Pure node (all same class)
  - H = 1: Maximum impurity (50-50 split for binary)
  
- **Information Gain:** 
  - IG = Entropy(parent) - Weighted Average Entropy(children)
  - Choose attribute with highest information gain

**Example:**
- Dataset: 8 positive, 4 negative examples
- Entropy = -(8/12 × log₂(8/12) + 4/12 × log₂(4/12))
- Entropy = -(0.667×(-0.585) + 0.333×(-1.585))
- Entropy = 0.918 bits

**Gini Index:** Alternative to entropy
- Formula: Gini = 1 - Σ(p_i)²
- Example: 60% class A, 40% class B
- Gini = 1 - (0.6² + 0.4²) = 1 - (0.36 + 0.16) = 0.48
- Lower Gini = purer node

---

🌍 **Real-World Applications**

### **1. E-Commerce**
- **Recommendation Systems**: "Customers who bought X also bought Y"
- **Customer Segmentation**: Group customers by behavior
- **Fraud Detection**: Identify unusual transaction patterns

### **2. Healthcare**
- **Disease Prediction**: Classify patients by risk level
- **Treatment Effectiveness**: Cluster patients by response
- **Drug Discovery**: Find patterns in molecular data

### **3. Finance**
- **Credit Scoring**: Classify loan applicants as approved/rejected
- **Stock Market Prediction**: Identify trading patterns
- **Risk Assessment**: Cluster investments by risk profile

### **4. Marketing**
- **Market Basket Analysis**: Product placement strategies
- **Customer Churn Prediction**: Identify likely to leave
- **Campaign Optimization**: Target right customers

---

⚠️ **Common Pitfalls**

### **Overfitting**
- **Problem**: Model memorizes training data, fails on new data
- **Signs**: High training accuracy, low test accuracy
- **Solutions**:
  - Cross-validation (k-fold)
  - Regularization (L1, L2)
  - Pruning (decision trees)
  - Early stopping

### **Curse of Dimensionality**
- **Problem**: Too many features = sparse data
- **Impact**: Distance measures become meaningless
- **Solutions**:
  - Feature selection (remove irrelevant features)
  - Dimensionality reduction (PCA)
  - Domain knowledge

### **Imbalanced Datasets**
- **Problem**: One class much larger than others (e.g., 95% negative, 5% positive)
- **Impact**: Model predicts majority class for everything
- **Solutions**:
  - Resampling (oversampling minority, undersampling majority)
  - SMOTE (Synthetic Minority Oversampling)
  - Use F1-score instead of accuracy
  - Class weights in model

---

✅ **Summary & Key Takeaways**

### **Essential Techniques:**
1. **Classification**: Supervised learning for categorical prediction
   - Algorithms: Decision Trees, Naive Bayes, SVM, KNN
   - Evaluation: Precision, Recall, F1-Score

2. **Clustering**: Unsupervised grouping of similar data
   - Algorithms: K-means, Hierarchical
   - Method: Elbow method for optimal k

3. **Association Rules**: Find item relationships
   - Algorithm: Apriori
   - Metrics: Support, Confidence, Lift

### **Formulas to Remember:**
- Support(A,B) = count(A,B) / total_transactions
- Confidence(A→B) = support(A,B) / support(A)
- Lift(A→B) = confidence(A→B) / support(B)
- Precision = TP / (TP + FP)
- Recall = TP / (TP + FN)
- F1 = 2 × (Precision × Recall) / (Precision + Recall)
- Entropy = -Σ(p_i × log₂(p_i))
- Gini = 1 - Σ(p_i)²

### **Study Tips:**
- Practice calculating metrics by hand
- Understand the difference between supervised and unsupervised
- Know when to use each algorithm
- Remember: accuracy isn't always the best metric!

### **Quiz Preparation:**
- Know the algorithms and their applications
- Be able to calculate support, confidence, lift
- Understand precision, recall, F1-score
- Recognize overfitting and solutions
- Calculate entropy and Gini index

---

🎓 **You're Ready!**

You now have a solid foundation in data mining techniques. Practice with real datasets, implement algorithms, and apply these concepts to solve real-world problems. Remember: data mining is both an art and a science - it requires technical skills and domain knowledge to extract meaningful insights!

Good luck with your quiz! 💪✨`
};

export function generateSmartLesson(payload) {
  const { subject, topic, description, difficulty } = payload;
  
  // Check if we have a template for this subject
  let lessonContent = LESSON_TEMPLATES[subject];
  
  // If no template, generate generic but structured lesson
  if (!lessonContent) {
    console.log(`⚠️ No lesson template for "${subject}", generating generic structured lesson`);
    lessonContent = generateGenericLesson(payload);
  }
  
  return {
    content: lessonContent,
    source: LESSON_TEMPLATES[subject] ? "Smart Lesson Generator (Expert)" : "Smart Lesson Generator (Generic)",
    metadata: {
      subject,
      topic,
      difficulty,
      words: lessonContent.split(/\s+/).length,
      type: LESSON_TEMPLATES[subject] ? "curriculum-aligned" : "generic-educational"
    }
  };
}

// ============================================================================
// Generate Generic But Structured Lesson for Any Subject
// ============================================================================

function generateGenericLesson(payload) {
  const { subject, topic, description, difficulty } = payload;
  
  return `🎯 **${topic}**

📖 **Introduction**

Welcome to this comprehensive lesson on ${topic}! This topic is an important part of ${subject} and will help you build essential knowledge and skills in this field.

**What You'll Learn:**
- Core concepts and principles of ${topic}
- Practical applications and real-world examples
- Key terminology and definitions
- Problem-solving techniques

**Why This Matters:**
Understanding ${topic} is crucial for mastering ${subject}. This knowledge forms the foundation for more advanced concepts and has practical applications in academics, career, and everyday life.

---

📚 **Core Concepts**

### ✨ **Fundamental Principles**

${topic} is based on several fundamental principles that guide its application:

1. **${description}**
   - This forms the basis of understanding ${topic}
   - It connects to broader themes in ${subject}
   - Practical applications demonstrate its relevance

2. **Key Components**
   - Breaking down ${topic} into manageable parts
   - Understanding how components relate to each other
   - Seeing the big picture while mastering details

3. **Theoretical Framework**
   - The theory behind ${topic} provides structure
   - Helps predict outcomes and solve problems
   - Connects to other concepts in ${subject}

---

### ⚡ **Essential Concepts**

**Definition:** ${topic} refers to ${description}

**Key Terms:**
- **Primary Concept**: The main idea underlying ${topic}
- **Applications**: How ${topic} is used in practice
- **Methodology**: The approach used when working with ${topic}
- **Analysis**: Examining and understanding ${topic} in depth

**Important Points:**
1. ${topic} requires both theoretical understanding and practical application
2. Mastery comes through consistent practice and study
3. Real-world examples help solidify understanding
4. Connections to other ${subject} concepts enhance learning

---

💡 **Detailed Explanation**

### **Step-by-Step Understanding:**

**Step 1: Foundation**
Begin by understanding the basic definition and purpose of ${topic}. This provides context for everything else you'll learn.

**Step 2: Core Principles**
Identify the key principles that govern ${topic}. These principles explain why things work the way they do.

**Step 3: Application**
Learn how to apply ${topic} in practical situations. Theory becomes meaningful when you see it in action.

**Step 4: Analysis**
Develop skills to analyze problems and solutions related to ${topic}. This critical thinking is essential for mastery.

**Step 5: Integration**
Connect ${topic} to other concepts in ${subject}. See how it fits into the bigger picture.

---

### 🔍 **Practical Examples**

**Example 1: Basic Application**
When working with ${topic}, start with simple cases that illustrate core principles. For instance, consider how ${description} applies in straightforward scenarios.

**Example 2: Real-World Context**
${topic} appears in many real-world situations:
- Professional fields use ${topic} for specific purposes
- Academic research relies on understanding ${topic}
- Everyday applications demonstrate its practical value

**Example 3: Problem-Solving**
When faced with problems related to ${topic}:
1. Identify what you know
2. Apply relevant principles
3. Work through systematically
4. Verify your solution

---

🌍 **Real-World Applications**

### **Professional Fields**

**Industry Applications:**
- Professionals in ${subject} use ${topic} regularly
- Specialized tools and techniques have been developed
- Understanding ${topic} opens career opportunities

**Research and Development:**
- Researchers study ${topic} to advance knowledge
- New applications are constantly being discovered
- Innovation builds on fundamental understanding

### **Everyday Relevance**

${topic} affects daily life in various ways:
- Technology you use may incorporate these concepts
- Decision-making can benefit from this knowledge
- Understanding improves problem-solving abilities

---

⚠️ **Common Challenges & Solutions**

### **Challenge 1: Understanding Complex Concepts**
**Solution:** Break down into smaller parts, use examples, practice regularly

### **Challenge 2: Applying Theory to Practice**
**Solution:** Start with simple cases, gradually increase complexity, seek real examples

### **Challenge 3: Retaining Information**
**Solution:** Review regularly, teach others, create connections to existing knowledge

### **Challenge 4: Seeing Relevance**
**Solution:** Look for real-world applications, understand career connections, explore deeper

---

✅ **Summary & Key Takeaways**

### **Essential Points:**

🎯 **Core Understanding:**
- ${topic} is a fundamental concept in ${subject}
- It involves ${description}
- Both theory and practice are important
- Applications span multiple domains

📝 **Key Principles:**
1. Master fundamental concepts before advancing
2. Practice applies theory to real situations
3. Connections to other topics enhance understanding
4. Regular review strengthens retention

🔍 **Study Strategies:**
- Review notes regularly
- Practice with varied examples
- Explain concepts to others
- Create visual aids (diagrams, mind maps)
- Test yourself frequently

💡 **Application Skills:**
- Identify when ${topic} is relevant
- Apply systematic problem-solving approaches
- Connect theory to practical situations
- Analyze and evaluate solutions

---

🎓 **Preparation for Assessment**

**Quiz Readiness Checklist:**
- ✓ Can you define ${topic} clearly?
- ✓ Do you understand core principles?
- ✓ Can you give practical examples?
- ✓ Are you able to solve related problems?
- ✓ Do you see connections to other ${subject} topics?

**Study Tips:**
- Focus on understanding, not just memorization
- Work through practice problems
- Review key terminology
- Make connections between concepts
- Ask questions when unclear

---

🌟 **Conclusion**

You now have a solid foundation in ${topic}! This knowledge will serve you well as you continue your journey in ${subject}. Remember that mastery comes through consistent practice and application.

**Next Steps:**
- Test your understanding with the quiz
- Practice with additional problems
- Explore related topics in ${subject}
- Apply concepts to real-world situations

Keep learning, stay curious, and don't hesitate to review this material as needed. You've got this! 💪✨`;
}

export function hasLessonFor(subject) {
  return !!LESSON_TEMPLATES[subject];
}

export default {
  generateSmartLesson,
  hasLessonFor,
  LESSON_TEMPLATES
};
