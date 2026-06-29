# API Reference

> All server-side API routes in Semua.

**→ [Home](Home) · [AI Assistant](AI-Assistant) · [Architecture](Architecture)**

---

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [POST /api/assistant](#post-apiassistant)
- [POST /api/assistant/execute](#post-apiassistantexecute)
- [Supabase Direct Operations](#supabase-direct-operations)
- [Error Codes](#error-codes)

---

## Overview

Semua has two custom API routes. All other data operations go directly from the client to Supabase using the anon key (protected by RLS).

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/assistant` | POST | Send a message to Gemini, get structured actions back |
| `/api/assistant/execute` | POST | Execute confirmed actions against the database |

---

## Authentication

Both API routes verify the user session server-side:

```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

Requests without a valid Supabase session cookie return `401 Unauthorized`.

---

## POST /api/assistant

Sends a user message to Gemini 2.5 Flash and returns a parsed action response.

### Request

```http
POST /api/assistant
Content-Type: application/json
Cookie: sb-<project>-auth-token=<session>
```

```json
{
  "message": "Add lunch expense RM15 today",
  "history": [
    {
      "role": "user",
      "parts": [{ "text": "Hello" }]
    },
    {
      "role": "model",
      "parts": [{ "text": "{\"type\":\"message\",\"message\":\"Hi! How can I help?\"}" }]
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | `string` | Yes | The user's natural language input |
| `history` | `HistoryItem[]` | No | Prior conversation turns (default `[]`) |

### Response — Actions

```json
{
  "response": {
    "type": "actions",
    "actions": [
      {
        "type": "create_expense",
        "data": {
          "title": "Lunch",
          "amount": 15,
          "category": "Food",
          "date": "2025-06-30"
        }
      }
    ]
  }
}
```

### Response — Question

```json
{
  "response": {
    "type": "question",
    "question": "What category should I use for this expense?"
  }
}
```

### Response — Message

```json
{
  "response": {
    "type": "message",
    "message": "You have 3 tasks due today."
  }
}
```

### Response — Error

```json
{
  "response": {
    "type": "error",
    "error": "Could not understand AI response. Please try again."
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success — response contains parsed Gemini output |
| `400` | Bad request — `message` is empty or missing |
| `401` | Unauthorized — no valid session |
| `500` | Server error — Gemini call failed or unexpected error |

### Error Response Body

```json
{
  "error": "Failed to process request"
}
```

---

## POST /api/assistant/execute

Executes a list of confirmed `ParsedAction` objects against the database.

### Request

```http
POST /api/assistant/execute
Content-Type: application/json
Cookie: sb-<project>-auth-token=<session>
```

```json
{
  "actions": [
    {
      "type": "create_expense",
      "data": {
        "title": "Lunch",
        "amount": 15,
        "category": "Food",
        "date": "2025-06-30"
      }
    },
    {
      "type": "complete_habit",
      "data": {
        "name": "gym"
      }
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `actions` | `ParsedAction[]` | Yes | Array of actions to execute |

### Response

```json
{
  "results": [
    {
      "action": {
        "type": "create_expense",
        "data": { "title": "Lunch", "amount": 15, "category": "Food", "date": "2025-06-30" }
      },
      "success": true,
      "message": "Expense recorded: RM15.00 for Lunch"
    },
    {
      "action": {
        "type": "complete_habit",
        "data": { "name": "gym" }
      },
      "success": false,
      "message": "Habit \"gym\" not found"
    }
  ]
}
```

Each result corresponds to one action in the request array, in order.

| Field | Type | Description |
|-------|------|-------------|
| `action` | `ParsedAction` | The original action |
| `success` | `boolean` | Whether the action succeeded |
| `message` | `string` | Human-readable result or error message |

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Execution completed (check individual `success` fields) |
| `400` | Bad request — `actions` array is empty or missing |
| `401` | Unauthorized — no valid session |
| `500` | Server error — unexpected failure |

> Note: A `200` response does not mean all actions succeeded. Each action in `results` has its own `success` field. Partial success is possible.

---

## Supabase Direct Operations

The following tables are accessed directly from the client via the Supabase browser client. RLS enforces user isolation.

### Tasks

| Operation | Query |
|-----------|-------|
| List all | `supabase.from('tasks').select('*').eq('user_id', id).order('created_at', { ascending: false })` |
| Create | `supabase.from('tasks').insert({ user_id, title, priority, status: 'todo', ... })` |
| Update | `supabase.from('tasks').update({ status }).eq('id', taskId)` |
| Delete | `supabase.from('tasks').delete().eq('id', taskId)` |

### Finance Transactions

| Operation | Query |
|-----------|-------|
| List (with date range) | `supabase.from('finance_transactions').select('*').eq('user_id', id).gte('date', start).lte('date', end)` |
| Create | `supabase.from('finance_transactions').insert({ user_id, title, amount, type, category, date })` |
| Update | `supabase.from('finance_transactions').update(fields).eq('id', txId)` |
| Delete | `supabase.from('finance_transactions').delete().eq('id', txId)` |

### Habits

| Operation | Query |
|-----------|-------|
| List | `supabase.from('habits').select('*').eq('user_id', id)` |
| Create | `supabase.from('habits').insert({ user_id, name, emoji, frequency, current_streak: 0, longest_streak: 0 })` |
| Log completion | `supabase.from('habit_logs').insert({ habit_id, user_id, date, completed_at })` |
| Update streak | `supabase.rpc('update_habit_streak', { p_habit_id: id })` |

### Goals

| Operation | Query |
|-----------|-------|
| List active | `supabase.from('goals').select('*').eq('user_id', id).eq('status', 'active')` |
| Create | `supabase.from('goals').insert({ user_id, title, target, current_progress: 0, status: 'active' })` |
| Update progress | `supabase.from('goals').update({ current_progress }).eq('id', goalId)` |

---

## Error Codes

| HTTP Status | Cause | Resolution |
|-------------|-------|-----------|
| `400` | Missing required field | Check request body |
| `401` | No session cookie | Re-login |
| `404` | Resource not found (fuzzy name match failed) | Use a more specific name |
| `500` | Gemini API failure / DB error | Retry; check `GEMINI_API_KEY` |

---

*See also: [AI Assistant](AI-Assistant) · [Architecture](Architecture) · [Security](Security)*
