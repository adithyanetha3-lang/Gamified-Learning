# Subject Management Card Layout Plan

## What User Wants
Convert Subject Management page from sidebar layout to card-based layout similar to Question Bank:
- Show subjects as cards in a grid
- Click subject → show topics as cards in a grid  
- Breadcrumb navigation to go back

## Current Status
- Question Bank already has card layout working ✅
- Subject Management still uses sidebar layout
- Both lesson generation improvements deployed ✅
- Faster signin deployed ✅

## Next Steps
1. Copy the card layout pattern from QuestionBankPage.jsx
2. Replace the sidebar + right panel layout with:
   - View state ('subjects' or 'topics')
   - Breadcrumb navigation
   - Subject cards grid
   - Topic cards grid
3. Keep all existing functionality (create, delete, publish, view lesson)

## Files to Modify
-  `src/pages/SubjectManagementPage.jsx` - Main file to update

## Pattern to Follow
```javascript
const [view, setView] = useState('subjects'); // or 'topics'

// Don't auto-select subject
// When subject clicked → setSelectedSubject() and setView('topics')
// Show breadcrumb with back button
// Render subjects grid when view === 'subjects'
// Render topics grid when view === 'topics'
```

This is ready to implement in next session.
