# Card Layout Conversion - Step by Step

## What Needs to Change

The SubjectManagementPage currently uses a sidebar (left) + content (right) layout.
We need to convert it to card-based navigation like QuestionBankPage.

## Changes Needed

### 1. Add View State
```javascript
const [view, setView] = useState('subjects'); // 'subjects' or 'topics'
```

### 2. Update Load Subjects (Remove Auto-Select)
```javascript
async function loadSubjects() {
  // Remove this line:
  // if (data.length > 0 && !selectedSubject) { setSelectedSubject(data[0].id); }
  // Just load subjects, don't auto-select
}
```

### 3. Update useEffect for Selected Subject
```javascript
useEffect(() => {
  if (selectedSubject) {
    loadTopics(selectedSubject);
    setView('topics'); // Add this
  } else {
    setView('subjects'); // Add this
  }
}, [selectedSubject]);
```

### 4. Replace Layout JSX
Replace this:
```javascript
<div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "2rem", marginTop: "2rem" }}>
  {/* Subjects Sidebar */}
  {/* Topics Panel */}
</div>
```

With:
```javascript
{/* Breadcrumb */}
{selected Subject && <Breadcrumb />}

{/* Subjects View */}
{view === 'subjects' && <SubjectCards />}

{/* Topics View */}
{view === 'topics' && <TopicCards />}
```

## Implementation

The actual implementation requires replacing ~300 lines of sidebar code with card grid code.
Due to file size, this is best done manually or with a complete file rewrite.

## Test After Changes
1. npm run build
2. Check subjects show as cards
3. Click subject → see topics as cards
4. Breadcrumb works to go back
