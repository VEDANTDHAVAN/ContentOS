# ContentOS – MVP System Design Document

---

## 1. Design Overview

This document outlines the MVP architecture for **ContentOS**, an AI-powered campaign intelligence platform built entirely on AWS serverless infrastructure.

### MVP Goals

* Accept campaign goal input
* Generate multi-platform content (LinkedIn + Twitter)
* Return engagement score
* Store generated data
* Display results on frontend dashboard

### MVP Design Principles

* **Serverless First** – No always-on servers
* **Low Cost** – Optimized for AWS free tier
* **Simple & Scalable** – Minimal components
* **AI-Centric** – Bedrock at core
* **Fast Iteration** – Hackathon-ready deployment

---

## 2. MVP System Architecture

### 2.1 High-Level Architecture

```
┌───────────────────────────────┐
│        Frontend (React)       │
│        Vite Application       │
└───────────────┬───────────────┘
                │ HTTP Request
        ┌───────▼────────┐
        │  API Gateway   │
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │  AWS Lambda    │
        │ (Orchestration)│
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │ Amazon Bedrock │
        │ Claude 3 Haiku │
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │  DynamoDB      │
        │ Campaign Store │
        └────────────────┘
```

Optional:

* S3 for report exports

---

## 3. Component Breakdown (MVP)

### 3.1 Frontend (React + Vite)

Responsibilities:

* Campaign goal input form
* API call to backend
* Display generated content
* Show engagement score
* Basic loading & error handling

Tech:

* React
* Axios
* Minimal CSS styling

No:

* Auth
* Calendar
* Scheduling
* Multi-workspace

---

### 3.2 API Gateway

Responsibilities:

* Public endpoint for frontend
* Routes `/generate`
* CORS enabled
* Rate limiting (basic)

---

### 3.3 AWS Lambda (Core Logic)

Responsibilities:

* Receive campaign goal
* Build structured prompt
* Call Bedrock (Claude 3 Haiku)
* Parse JSON response
* Store campaign data in DynamoDB
* Return structured result

This is the single backend service in MVP.

---

### 3.4 Amazon Bedrock (Claude 3 Haiku)

Model Used:

* `anthropic.claude-3-haiku`

Purpose:

* Generate:

  * LinkedIn post
  * Twitter thread (3 tweets)
  * Engagement score (1–10)

Prompt returns structured JSON.

No:

* GPT-4
* Sonnet
* Multi-model fallback
* Streaming

---

### 3.5 DynamoDB

Table: `ContentOS_Campaigns`

Schema:

| Field            | Type               |
| ---------------- | ------------------ |
| campaignId       | String (PK)        |
| campaignGoal     | String             |
| generatedContent | JSON (Stringified) |
| createdAt        | ISO Timestamp      |

No:

* Users
* Workspaces
* Variations table
* Scheduling table

---

### 3.6 S3 (Optional in MVP)

Used only for:

* Exported JSON reports (future extension)

Not required for MVP demo.

---

## 4. API Design (MVP)

### Endpoint

```
POST /generate
```

### Request

```json
{
  "campaignGoal": "Launch a productivity app for college students"
}
```

### Response

```json
{
  "campaignId": "uuid",
  "result": {
    "linkedin_post": "...",
    "twitter_thread": [
      "Tweet 1",
      "Tweet 2",
      "Tweet 3"
    ],
    "engagement_score": 8
  }
}
```

Simple. No auth required for MVP.

---

## 5. AI Engine (MVP Design)

### 5.1 Prompt Strategy

We use a single structured prompt:

* Campaign goal
* Instruction for:

  * LinkedIn post
  * Twitter thread
  * Engagement score
* Return JSON format

Example:

```
You are a campaign strategist AI.

Generate:
1 LinkedIn post.
1 Twitter thread (3 tweets).
Provide engagement score (1-10).

Campaign Goal: {input}

Return structured JSON.
```

---

### 5.2 Engagement Scoring (MVP)

Engagement score is:

* Prompt-based scoring via Claude Haiku
* No ML training
* No SageMaker

Future: Replace with SageMaker model.

---

## 6. Frontend Architecture (MVP)

### Component Structure

```
App
├── CampaignForm
├── EngagementCard
└── ResultDisplay
```

Flow:

1. User enters campaign goal
2. Clicks Generate
3. API call made
4. Loading state
5. Content rendered
6. Engagement score displayed

---

## 7. Data Flow (MVP)

```
User Input
    ↓
React Frontend
    ↓
API Gateway
    ↓
Lambda
    ↓
Bedrock
    ↓
Lambda
    ↓
DynamoDB (Store)
    ↓
Return JSON
    ↓
Frontend Display
```

---

## 8. Security (MVP Level)

* HTTPS via API Gateway
* IAM role-based Lambda permissions
* No public AWS credentials
* CORS restricted to frontend domain
* No authentication layer yet

Future:

* JWT Auth
* Cognito integration

---

## 9. Performance Targets (MVP)

* API Response Time: < 8 seconds
* Bedrock Generation: < 6 seconds
* DynamoDB write: < 50ms
* Fully serverless autoscaling

---

## 10. Deployment Architecture (MVP)

```
Frontend → Vercel / Netlify
Backend → AWS Lambda
API → API Gateway
AI → Amazon Bedrock
DB → DynamoDB
```

No:

* ECS
* Docker
* Kubernetes
* Redis
* RDS

---

## 11. Cost Strategy (MVP)

* Use Claude 3 Haiku (cheapest Bedrock option)
* Stay within Lambda free tier
* Use DynamoDB free tier
* Avoid SageMaker
* Avoid always-on infrastructure

Estimated Monthly Cost:
$10 – $35

---

## 12. Future Evolution (Post-MVP)

After MVP validation:

Phase 2:

* Authentication
* Audience personalization (Titan Embeddings)
* Engagement ML model (SageMaker)
* Campaign calendar
* Social publishing

Phase 3:

* Multi-tenant architecture
* Microservices split
* Event-driven system
* Advanced analytics

---

## 13. Conclusion

The MVP architecture of ContentOS is:

* Fully serverless
* AWS-native
* Low-cost
* AI-driven
* Minimal but scalable

It focuses on validating the core idea:

> AI-powered campaign generation + predictive engagement scoring

Everything else can evolve incrementally.