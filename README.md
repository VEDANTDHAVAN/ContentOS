ContentOS

ContentOS is an AI-powered content intelligence platform that generates multi-platform marketing campaigns, predicts engagement, and creates optimized content workflows — all from a single campaign goal.

Designed as a hackathon-ready AI SaaS, ContentOS demonstrates how LLMs, generative media, and automation tools can power the entire content lifecycle.


---

Demo

Live Demo
https://content-os-gilt.vercel.app


---

Overview

ContentOS transforms a simple prompt into a complete campaign package including:

LinkedIn post

Twitter/X thread

AI-generated marketing banner

Engagement prediction

Content calendar

Campaign history

Creative asset gallery

AI agent interface


The platform also enables direct publishing to social media.


---

Key Features

AI Campaign Generator

Users describe a campaign goal and ContentOS generates:

LinkedIn post

Twitter thread

Engagement score prediction

Marketing creative image


Example prompt:

Launch an AI SaaS platform for startup founders

Generated output:

LinkedIn Post
Twitter Thread
Engagement Score
AI Generated Banner


---

AI Agent Studio

An interactive AI agent capable of generating campaigns conversationally.

Features:

Natural language campaign generation

AI marketing strategist

Chat-style interface

Image generation

Engagement analysis



---

Engagement Prediction

ContentOS predicts potential engagement using AI and heuristics before publishing.

Engagement Score: 8/10

This helps marketers optimize content before posting.


---

AI Creative Asset Generation

Each campaign generates a professional marketing banner using Amazon Titan Image Generator.

Assets are stored in AWS S3 and accessible through the Assets Gallery.


---

Campaign History

Users can view previously generated campaigns including:

Generated content

Engagement score

Generated visuals

Creation date



---

Social Media Publishing

Generated content can be published directly to:

LinkedIn

Twitter/X


Production flow uses OAuth integrations to connect user accounts securely.


---

Tech Stack

Frontend

React (Vite)

TypeScript

TailwindCSS

ShadCN UI

Framer Motion

Clerk Authentication



---

Backend

Serverless architecture on AWS.

Node.js

Serverless Framework

AWS Lambda

AWS API Gateway



---

AI & Cloud Services

Amazon Bedrock (LLM)

Amazon Titan Image Generator

AWS DynamoDB

AWS S3



---

Authentication

Clerk


Used for:

User authentication

Secure session management

User ID integration for data isolation



---

System Architecture

Frontend (React + Vite)
        |
        v
API Gateway
        |
        v
AWS Lambda (Serverless)
        |
        +---- Amazon Bedrock (LLM)
        |
        +---- Titan Image Generator
        |
        +---- DynamoDB (campaign storage)
        |
        +---- S3 (generated assets)


---

Project Structure

contentos
│
├── frontend
│   ├── components
│   ├── hooks
│   ├── layouts
│   ├── pages
│   ├── services
│   └── types
│
├── backend
│   ├── handler.js
│   ├── services
│   │   ├── linkedin.js
│   │   └── twitter.js
│   └── serverless.yml
│
└── README.md


---

Environment Variables

Frontend .env

VITE_API_BASE_URL=https://your-api-url
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key


---

Backend .env

AWS_REGION_NAME=us-east-1
LLM_MODEL_ID=<bedrock-model-id>
IMAGE_MODEL_ID=amazon.titan-image-generator-v2:0
S3_BUCKET_NAME=contentos-assets
DYNAMODB_TABLE_NAME=ContentOS_Campaigns


---

Local Development

1. Clone the Repository

git clone https://github.com/yourusername/contentos.git
cd contentos


---

2. Start Frontend

cd frontend
npm install
npm run dev

Frontend runs on:

http://localhost:5173


---

3. Start Backend

cd backend
npm install
serverless deploy


---

AWS Resources

ContentOS uses the following AWS services:

Lambda

API Gateway

DynamoDB

S3

Bedrock



---

DynamoDB Tables

Campaign Table

ContentOS_Campaigns

Fields:

campaignId
userId
campaignGoal
generatedContent
imageUrl
createdAt


---

Conversation History (optional)

ContentOS_Conversations

Fields:

userId
timestamp
role
content


---

Example API Response

{
  "campaignId": "123",
  "campaignGoal": "Launch AI SaaS",
  "result": {
    "linkedin_post": "...",
    "twitter_thread": ["...", "...", "..."],
    "engagement_score": 8
  },
  "imageUrl": "...",
  "createdAt": "..."
}


---

Future Improvements

Potential roadmap for ContentOS:

Multi-platform campaign generation (Instagram, TikTok, YouTube)

AI content calendar automation

Auto-post scheduling

Performance analytics

Multi-agent marketing system

Brand voice customization



---

Why ContentOS?

ContentOS demonstrates how AI can power end-to-end marketing workflows, not just content generation.

Instead of generating text only, it orchestrates the entire pipeline:

Idea → Content → Creative → Prediction → Publishing


---

Author

Vedant Dhavan
