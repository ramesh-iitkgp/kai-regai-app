# P7 — Branching Logic & Stale Answer Pruning

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** *The Story Written in Your Hands.*  
**Phase:** P7 — Palm Reading Questionnaire Engine  

---

## 1. Declarative Dependency Model

Conditional rules are expressed declaratively in JSON without embedded UI scripts:

```javascript
{
  id: "life_line_continuity",
  category: "LIFE_LINE",
  question: "How continuous does your Life Line appear?",
  showWhen: {
    questionId: "life_line_visibility",
    in: ["CLEAR", "PARTIAL"]
  }
}
```

Supported evaluation operations:
- `in: string[]`: Evaluates to `true` if `parentAnswer` is contained within the list.
- `equals: string`: Evaluates to `true` if `parentAnswer === value`.

---

## 2. Adaptive Branching Examples

### 2.1 Major Line Gating
If a user indicates that a crease is `NOT_VISIBLE` or `NOT_SURE`:
- **Life Line**: Skips continuity and curvature inquiries.
- **Head Line**: Skips slope and clarity inquiries.
- **Heart Line**: Skips curvature/termination inquiries.
- **Fate Line**: Skips starting origin inquiry.
- **Sun Line**: Skips prominence inquiry.

### 2.2 Dynamic Step Recalculation
- **Max Path**: 18 questions (when all 5 major lines are visible and answered).
- **Min Path**: 11 questions (when all major lines are reported as not clearly visible).
- **Progress Calculation**: `Math.round(((activeQuestionIndex + 1) / totalActiveQuestions) * 100)`.
Progress smoothly adapts without jumps or artificial delays.

---

## 3. Stale Answer Pruning Algorithm

When a user navigates backwards and alters an ancestral answer:
1. `setAnswer(questionId, value)` updates the answer map.
2. `pruneStaleAnswers()` loops through all questions in schema order.
3. If `!isQuestionActive(question)` and `answers[question.id] !== undefined`:
   - `delete answers[question.id]` immediately purges the defunct key.
4. Active question index is clamped to `Math.max(0, getActiveQuestions().length - 1)` if the user was on a question that ceased to exist.

This guarantees that stale answers can never silently pollute the canonical `PalmFeatureModel` or downstream reading dossier.
