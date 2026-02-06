# ContentOS – System Design Document

## 1. Design Overview

This document outlines the technical architecture, component design, data flows, and implementation strategy for ContentOS—an AI-driven content intelligence platform.

**Design Principles:**
- **Modularity**: Independent services that can scale and evolve separately
- **User-Centric**: Every technical decision optimizes for user experience
- **AI-First**: LLM integration at the core, not bolted on
- **Performance**: Sub-second response times for interactive features
- **Reliability**: Graceful degradation when services are unavailable

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web App    │  │  Mobile Web  │  │   API Client │      │
│  │  (Next.js)   │  │  (Responsive)│  │   (Future)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   API Gateway   │
                    │  (Rate Limit,   │
                    │   Auth, Route)  │
                    └───────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│  Content API   │  │  User API   │  │  Analytics API  │
│   Service      │  │   Service   │  │    Service      │
└───────┬────────┘  └──────┬──────┘  └────────┬────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▬────────┐
│   AI Engine    │  │  PostgreSQL │  │     Redis       │
│  (LLM, ML)     │  │  (Primary)  │  │  (Cache/Queue)  │
└────────────────┘  └─────────────┘  └─────────────────┘
        │
┌───────▼────────┐  ┌──────────────┐  ┌────────────────┐
│  Vector DB     │  │  S3 Storage  │  │  Social APIs   │
│ (Pinecone)     │  │  (Files)     │  │  (LinkedIn,X)  │
└────────────────┘  └──────────────┘  └────────────────┘
```


### 2.2 Component Breakdown

**Frontend (Next.js 14+)**
- Server-side rendering for SEO and performance
- Client-side state management (Zustand)
- Real-time updates via WebSocket
- Rich text editor with AI integration

**API Gateway**
- Request routing and load balancing
- JWT authentication validation
- Rate limiting (100 req/min per user)
- Request/response logging

**Microservices**
- Content Service: Content CRUD, generation orchestration
- User Service: Auth, profiles, workspaces, subscriptions
- Analytics Service: Metrics collection, insights generation
- Publishing Service: Social media integrations, scheduling

**AI Engine**
- LLM Gateway: Manages OpenAI/Anthropic API calls
- Prompt Manager: Version-controlled templates
- Embedding Service: Vector generation for personalization
- ML Predictor: Engagement scoring model

**Data Layer**
- PostgreSQL: Relational data (users, content, analytics)
- Redis: Session cache, job queue, rate limiting
- Pinecone: Vector embeddings for semantic search
- S3: File uploads (documents, images)

---

## 3. Database Design

### 3.1 PostgreSQL Schema

**users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  oauth_provider VARCHAR(50),
  oauth_id VARCHAR(255),
  subscription_tier VARCHAR(20) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**workspaces**
```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  brand_voice JSONB, -- tone, style, keywords
  created_at TIMESTAMP DEFAULT NOW()
);
```

**workspace_members**
```sql
CREATE TABLE workspace_members (
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- owner, admin, member
  PRIMARY KEY (workspace_id, user_id)
);
```


**content**
```sql
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  title VARCHAR(500),
  original_input TEXT,
  content_type VARCHAR(50), -- blog, social, email
  format VARCHAR(50), -- markdown, html, plain
  metadata JSONB, -- tone, keywords, audience_segment
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, scheduled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_content_workspace ON content(workspace_id);
CREATE INDEX idx_content_status ON content(status);
```

**content_variations**
```sql
CREATE TABLE content_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  platform VARCHAR(50), -- twitter, linkedin, instagram
  body TEXT NOT NULL,
  metadata JSONB, -- hashtags, mentions, media_urls
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_variations_content ON content_variations(content_id);
```

**audience_segments**
```sql
CREATE TABLE audience_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  attributes JSONB, -- industry, experience_level, interests
  embedding_id VARCHAR(255), -- reference to vector DB
  created_at TIMESTAMP DEFAULT NOW()
);
```

**scheduled_posts**
```sql
CREATE TABLE scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_variation_id UUID REFERENCES content_variations(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  scheduled_time TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, published, failed
  platform_post_id VARCHAR(255), -- ID from social platform
  error_message TEXT,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_scheduled_time ON scheduled_posts(scheduled_time);
CREATE INDEX idx_scheduled_status ON scheduled_posts(status);
```


**analytics**
```sql
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_post_id UUID REFERENCES scheduled_posts(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  impressions INT DEFAULT 0,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  clicks INT DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  predicted_score INT, -- 0-100 prediction before publish
  fetched_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_post ON analytics(scheduled_post_id);
```

**social_accounts**
```sql
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  account_name VARCHAR(255),
  access_token TEXT NOT NULL, -- encrypted
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  connected_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(workspace_id, platform, account_name)
);
```

### 3.2 Vector Database (Pinecone)

**Namespace: audience_embeddings**
- Stores vector representations of audience segments
- Used for semantic matching and personalization
- Metadata: segment_id, workspace_id, attributes

**Namespace: content_embeddings**
- Stores embeddings of generated content
- Used for similarity search and duplicate detection
- Metadata: content_id, platform, performance_score

---

## 4. API Design

### 4.1 Authentication Flow

```
1. User submits email/password or OAuth
2. Backend validates credentials
3. Generate JWT with payload: { userId, workspaceIds, tier }
4. Return JWT + refresh token
5. Client stores JWT in httpOnly cookie
6. All subsequent requests include JWT in Authorization header
```

**JWT Payload:**
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "tier": "pro",
  "workspaces": ["workspace-uuid-1", "workspace-uuid-2"],
  "iat": 1234567890,
  "exp": 1234571490
}
```


### 4.2 Core API Endpoints

**Content Generation**

```http
POST /api/v1/content/generate
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "workspaceId": "uuid",
  "input": "Write about AI in healthcare",
  "contentType": "blog",
  "tone": "professional",
  "length": "medium",
  "variations": 3
}

Response 200:
{
  "contentId": "uuid",
  "variations": [
    {
      "id": "uuid",
      "body": "AI is transforming healthcare...",
      "metadata": { "wordCount": 850, "readingTime": "4 min" }
    }
  ],
  "generatedAt": "2026-02-06T10:30:00Z"
}
```

**Content Transformation**

```http
POST /api/v1/content/transform
Authorization: Bearer <jwt>

{
  "contentId": "uuid",
  "targetPlatforms": ["twitter", "linkedin"],
  "preserveKeyMessages": true
}

Response 200:
{
  "variations": [
    {
      "platform": "twitter",
      "body": "🧵 AI in Healthcare: A Thread\n\n1/ AI is revolutionizing...",
      "metadata": { "threadLength": 5, "estimatedEngagement": 78 }
    },
    {
      "platform": "linkedin",
      "body": "The healthcare industry is experiencing...",
      "metadata": { "estimatedEngagement": 82 }
    }
  ]
}
```

**Personalization**

```http
POST /api/v1/content/personalize
Authorization: Bearer <jwt>

{
  "contentId": "uuid",
  "audienceSegments": ["developers", "executives"]
}

Response 200:
{
  "personalizedVersions": [
    {
      "segmentId": "uuid",
      "segmentName": "developers",
      "body": "AI models like transformers enable...",
      "changes": ["Added technical details", "Included code examples"]
    }
  ]
}
```


**Publishing & Scheduling**

```http
POST /api/v1/publish/schedule
Authorization: Bearer <jwt>

{
  "variationId": "uuid",
  "platform": "linkedin",
  "scheduledTime": "2026-02-07T14:00:00Z"
}

Response 201:
{
  "scheduledPostId": "uuid",
  "status": "pending",
  "scheduledTime": "2026-02-07T14:00:00Z"
}
```

```http
POST /api/v1/publish/now
Authorization: Bearer <jwt>

{
  "variationId": "uuid",
  "platforms": ["twitter", "linkedin"]
}

Response 200:
{
  "results": [
    {
      "platform": "twitter",
      "status": "published",
      "platformPostId": "1234567890",
      "url": "https://twitter.com/user/status/1234567890"
    }
  ]
}
```

**Analytics**

```http
GET /api/v1/analytics/performance?workspaceId=uuid&days=30
Authorization: Bearer <jwt>

Response 200:
{
  "summary": {
    "totalPosts": 45,
    "avgEngagementRate": 4.2,
    "topPlatform": "linkedin",
    "totalImpressions": 125000
  },
  "topPerformers": [
    {
      "contentId": "uuid",
      "title": "AI in Healthcare",
      "engagementRate": 8.5,
      "platform": "linkedin"
    }
  ],
  "insights": [
    "Your audience engages 3x more with how-to content",
    "Tuesday 10 AM is your best posting time"
  ]
}
```

---

## 5. AI Engine Design

### 5.1 Content Generation Pipeline

```
User Input → Prompt Builder → LLM API → Post-Processor → Response
     ↓            ↓              ↓            ↓             ↓
  Metadata   Brand Voice    GPT-4/Claude   Format      Variations
  Context    Templates      Streaming      Validate    Store
```


**Prompt Template Structure:**

```javascript
const generateBlogPrompt = (input, metadata) => `
You are a professional content writer helping create ${metadata.tone} content.

Brand Voice Guidelines:
${metadata.brandVoice}

Task: Write a ${metadata.length} blog post about: ${input}

Requirements:
- Tone: ${metadata.tone}
- Target audience: ${metadata.audience}
- Include actionable insights
- Use clear structure with headings
- Optimize for readability

Output format: Markdown
`;
```

### 5.2 LLM Integration Strategy

**Primary LLM: OpenAI GPT-4**
- Use for long-form content generation
- Streaming responses for better UX
- Temperature: 0.7 for creative content
- Max tokens: 2000 for blog posts, 500 for social

**Fallback: Anthropic Claude**
- Activate if OpenAI rate limits hit
- Use for complex reasoning tasks
- Better for longer context windows

**Cost Optimization:**
- Cache common prompts (brand voice, templates)
- Use GPT-3.5-turbo for simple transformations
- Batch similar requests
- Implement request deduplication

### 5.3 Engagement Prediction Model

**Approach: Lightweight ML Classifier**

**Features:**
- Content length (word count)
- Sentiment score (positive/negative/neutral)
- Readability score (Flesch-Kincaid)
- Time of day, day of week
- Platform type
- Historical performance of similar content
- Presence of questions, CTAs, hashtags
- Media attachments (images, videos)

**Model: XGBoost Classifier**
- Training data: Historical posts + engagement metrics
- Output: Engagement score (0-100)
- Retrain weekly with new data

**Implementation:**
```python
def predict_engagement(content, metadata):
    features = extract_features(content, metadata)
    score = model.predict_proba(features)[0][1] * 100
    confidence = calculate_confidence(features)
    
    return {
        "score": round(score),
        "confidence": confidence,
        "factors": get_top_factors(features)
    }
```


### 5.4 Personalization Engine

**Vector-Based Approach:**

1. **Create Audience Embeddings**
   - Convert segment attributes to text description
   - Generate embedding using OpenAI text-embedding-3
   - Store in Pinecone with metadata

2. **Content Adaptation**
   - Retrieve segment embedding
   - Inject segment context into prompt
   - Generate personalized version
   - Validate brand voice consistency

**Example:**
```javascript
async function personalizeContent(content, segment) {
  const segmentContext = await getSegmentEmbedding(segment.id);
  
  const prompt = `
  Rewrite this content for: ${segment.name}
  
  Audience characteristics:
  - Industry: ${segment.attributes.industry}
  - Experience: ${segment.attributes.experienceLevel}
  - Interests: ${segment.attributes.interests.join(', ')}
  
  Original content:
  ${content.body}
  
  Maintain the core message but adapt tone and examples.
  `;
  
  return await llm.generate(prompt);
}
```

---

## 6. Frontend Design

### 6.1 Component Architecture

```
App (Next.js)
├── Layout
│   ├── Navbar
│   ├── Sidebar
│   └── Footer
├── Pages
│   ├── Dashboard
│   │   ├── ContentList
│   │   ├── QuickActions
│   │   └── AnalyticsSummary
│   ├── Editor
│   │   ├── RichTextEditor
│   │   ├── AIAssistant (sidebar)
│   │   ├── VariationPanel
│   │   └── PublishModal
│   ├── Calendar
│   │   ├── MonthView
│   │   ├── ContentCard
│   │   └── ScheduleModal
│   └── Analytics
│       ├── PerformanceChart
│       ├── InsightsPanel
│       └── TopContent
└── Shared Components
    ├── Button, Input, Modal
    ├── LoadingSpinner
    └── Toast Notifications
```


### 6.2 Smart Editor Design

**Features:**
- Real-time AI suggestions (like Grammarly)
- Inline tone adjustment
- Quick transformation buttons
- Variation comparison view
- Auto-save every 30 seconds

**Tech Stack:**
- Editor: Tiptap (ProseMirror-based)
- Styling: Tailwind CSS
- State: Zustand for editor state
- WebSocket: Real-time collaboration (future)

**User Flow:**
```
1. User types or pastes content
2. AI analyzes in background (debounced 2s)
3. Suggestions appear in sidebar
4. User clicks "Transform to Twitter"
5. Loading state (2-5s)
6. Variations appear in split view
7. User selects preferred version
8. Click "Schedule" or "Publish Now"
```

### 6.3 State Management

**Zustand Store Structure:**

```javascript
// stores/contentStore.js
export const useContentStore = create((set) => ({
  currentContent: null,
  variations: [],
  isGenerating: false,
  
  generateContent: async (input, options) => {
    set({ isGenerating: true });
    const result = await api.generateContent(input, options);
    set({ currentContent: result, isGenerating: false });
  },
  
  addVariation: (variation) => 
    set((state) => ({ 
      variations: [...state.variations, variation] 
    })),
}));

// stores/workspaceStore.js
export const useWorkspaceStore = create((set) => ({
  currentWorkspace: null,
  workspaces: [],
  brandVoice: null,
  
  setWorkspace: (workspace) => 
    set({ currentWorkspace: workspace }),
}));
```

---

## 7. Publishing System Design

### 7.1 Social Media Integration

**OAuth Flow:**
```
1. User clicks "Connect LinkedIn"
2. Redirect to LinkedIn OAuth
3. User authorizes app
4. LinkedIn redirects with auth code
5. Backend exchanges code for access token
6. Store encrypted token in database
7. Fetch user profile for display
```


**Platform-Specific Adapters:**

```javascript
// services/publishers/LinkedInPublisher.js
class LinkedInPublisher {
  async publish(content, accessToken) {
    const payload = {
      author: `urn:li:person:${userId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: content.body },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
    };
    
    return await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  }
  
  async getAnalytics(postId, accessToken) {
    // Fetch engagement metrics
  }
}

// services/publishers/TwitterPublisher.js
class TwitterPublisher {
  async publish(content, accessToken) {
    // Handle thread creation if content is long
    if (content.metadata.isThread) {
      return await this.publishThread(content, accessToken);
    }
    
    return await twitterClient.v2.tweet(content.body);
  }
  
  async publishThread(content, accessToken) {
    const tweets = content.metadata.threadParts;
    let previousTweetId = null;
    
    for (const tweet of tweets) {
      const result = await twitterClient.v2.tweet({
        text: tweet,
        reply: previousTweetId ? { in_reply_to_tweet_id: previousTweetId } : undefined
      });
      previousTweetId = result.data.id;
    }
    
    return previousTweetId;
  }
}
```

### 7.2 Scheduling System

**Architecture:**
- Bull queue (Redis-based) for job scheduling
- Cron job checks every minute for pending posts
- Worker processes publish jobs
- Retry logic for failed posts (3 attempts)

**Implementation:**

```javascript
// workers/publishWorker.js
const publishQueue = new Bull('publish-queue', {
  redis: { host: 'localhost', port: 6379 }
});

publishQueue.process(async (job) => {
  const { postId, platform, content, accessToken } = job.data;
  
  try {
    const publisher = getPublisher(platform);
    const result = await publisher.publish(content, accessToken);
    
    await db.scheduledPosts.update(postId, {
      status: 'published',
      platformPostId: result.id,
      publishedAt: new Date()
    });
    
    return { success: true, postId: result.id };
  } catch (error) {
    if (job.attemptsMade < 3) {
      throw error; // Retry
    }
    
    await db.scheduledPosts.update(postId, {
      status: 'failed',
      errorMessage: error.message
    });
  }
});

// Schedule posts
async function schedulePost(post) {
  const delay = post.scheduledTime - Date.now();
  
  await publishQueue.add(
    {
      postId: post.id,
      platform: post.platform,
      content: post.content,
      accessToken: await getAccessToken(post.accountId)
    },
    { delay, attempts: 3, backoff: { type: 'exponential', delay: 60000 } }
  );
}
```


---

## 8. Analytics System Design

### 8.1 Data Collection

**Webhook Approach:**
- Register webhooks with social platforms
- Receive real-time engagement updates
- Store in analytics table

**Polling Approach (Fallback):**
- Cron job runs every 6 hours
- Fetch metrics for recent posts
- Update analytics table

**Implementation:**

```javascript
// services/analyticsCollector.js
class AnalyticsCollector {
  async collectMetrics(scheduledPost) {
    const account = await db.socialAccounts.findById(scheduledPost.accountId);
    const publisher = getPublisher(scheduledPost.platform);
    
    const metrics = await publisher.getAnalytics(
      scheduledPost.platformPostId,
      account.accessToken
    );
    
    await db.analytics.upsert({
      scheduledPostId: scheduledPost.id,
      platform: scheduledPost.platform,
      impressions: metrics.impressions,
      likes: metrics.likes,
      comments: metrics.comments,
      shares: metrics.shares,
      clicks: metrics.clicks,
      engagementRate: calculateEngagementRate(metrics),
      fetchedAt: new Date()
    });
  }
  
  calculateEngagementRate(metrics) {
    const totalEngagements = metrics.likes + metrics.comments + metrics.shares;
    return (totalEngagements / metrics.impressions) * 100;
  }
}
```

### 8.2 Insights Generation

**AI-Powered Insights:**

```javascript
async function generateInsights(workspaceId, timeRange) {
  const posts = await db.analytics.getByWorkspace(workspaceId, timeRange);
  
  // Analyze patterns
  const topPerformers = posts.sort((a, b) => 
    b.engagementRate - a.engagementRate
  ).slice(0, 5);
  
  const platformPerformance = groupBy(posts, 'platform');
  const timeAnalysis = analyzePostingTimes(posts);
  const contentThemes = await extractThemes(posts);
  
  // Generate natural language insights
  const insights = await llm.generate(`
    Analyze this content performance data and provide 3-5 actionable insights:
    
    Top performers: ${JSON.stringify(topPerformers)}
    Platform breakdown: ${JSON.stringify(platformPerformance)}
    Best posting times: ${JSON.stringify(timeAnalysis)}
    
    Format: Short, actionable bullet points
  `);
  
  return {
    summary: calculateSummaryStats(posts),
    topPerformers,
    insights: insights.split('\n'),
    recommendations: generateRecommendations(posts)
  };
}
```


---

## 9. Security Design

### 9.1 Authentication & Authorization

**JWT Strategy:**
- Access token: 15 minutes expiry
- Refresh token: 7 days expiry
- Stored in httpOnly cookies (XSS protection)
- CSRF token for state-changing requests

**Role-Based Access Control:**

```javascript
const permissions = {
  owner: ['read', 'write', 'delete', 'manage_members', 'billing'],
  admin: ['read', 'write', 'delete', 'manage_members'],
  member: ['read', 'write'],
  viewer: ['read']
};

function checkPermission(user, workspace, action) {
  const membership = workspace.members.find(m => m.userId === user.id);
  return permissions[membership.role].includes(action);
}
```

### 9.2 Data Protection

**Encryption:**
- TLS 1.3 for all API communication
- AES-256 encryption for access tokens at rest
- Bcrypt (cost factor 12) for password hashing

**Secrets Management:**
```javascript
// Use environment variables + secret manager
const secrets = {
  jwtSecret: process.env.JWT_SECRET,
  openaiKey: await secretManager.get('OPENAI_API_KEY'),
  dbPassword: await secretManager.get('DB_PASSWORD')
};
```

**Rate Limiting:**
```javascript
const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  keyGenerator: (req) => req.user.id,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: 60
    });
  }
});
```

### 9.3 Input Validation

**Request Validation:**
```javascript
const contentGenerationSchema = z.object({
  workspaceId: z.string().uuid(),
  input: z.string().min(10).max(5000),
  contentType: z.enum(['blog', 'social', 'email']),
  tone: z.enum(['professional', 'casual', 'technical', 'witty']),
  length: z.enum(['short', 'medium', 'long']),
  variations: z.number().min(1).max(5)
});

app.post('/api/content/generate', async (req, res) => {
  try {
    const validated = contentGenerationSchema.parse(req.body);
    // Process request
  } catch (error) {
    return res.status(400).json({ error: error.errors });
  }
});
```


---

## 10. Performance Optimization

### 10.1 Caching Strategy

**Redis Cache Layers:**

```javascript
// 1. User session cache (TTL: 15 min)
await redis.setex(`session:${userId}`, 900, JSON.stringify(session));

// 2. Workspace data cache (TTL: 5 min)
await redis.setex(`workspace:${workspaceId}`, 300, JSON.stringify(workspace));

// 3. Brand voice cache (TTL: 1 hour)
await redis.setex(`brand:${workspaceId}`, 3600, brandVoice);

// 4. Analytics cache (TTL: 10 min)
await redis.setex(`analytics:${workspaceId}:${range}`, 600, analytics);

// Cache invalidation on updates
async function updateWorkspace(workspaceId, data) {
  await db.workspaces.update(workspaceId, data);
  await redis.del(`workspace:${workspaceId}`);
}
```

### 10.2 Database Optimization

**Indexing Strategy:**
```sql
-- Frequently queried columns
CREATE INDEX idx_content_workspace_status ON content(workspace_id, status);
CREATE INDEX idx_scheduled_posts_time ON scheduled_posts(scheduled_time) 
  WHERE status = 'pending';
CREATE INDEX idx_analytics_post_platform ON analytics(scheduled_post_id, platform);

-- Full-text search
CREATE INDEX idx_content_search ON content USING GIN(to_tsvector('english', title || ' ' || original_input));
```

**Query Optimization:**
```javascript
// Use pagination for large datasets
async function getWorkspaceContent(workspaceId, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  
  return await db.content.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      variations: true,
      creator: { select: { id: true, email: true } }
    }
  });
}
```

### 10.3 API Response Optimization

**Compression:**
```javascript
app.use(compression()); // Gzip responses
```

**Streaming for Large Responses:**
```javascript
app.get('/api/content/:id/export', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Transfer-Encoding', 'chunked');
  
  const stream = db.content.streamById(req.params.id);
  stream.pipe(res);
});
```

**Lazy Loading:**
```javascript
// Frontend: Load variations on demand
const [variations, setVariations] = useState([]);
const [loading, setLoading] = useState(false);

const loadVariations = async () => {
  setLoading(true);
  const data = await api.getVariations(contentId);
  setVariations(data);
  setLoading(false);
};
```


---

## 11. Monitoring & Observability

### 11.1 Logging Strategy

**Structured Logging:**
```javascript
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log with context
logger.info('Content generated', {
  userId: user.id,
  workspaceId: workspace.id,
  contentType: 'blog',
  duration: 3200,
  tokensUsed: 1500
});
```

### 11.2 Metrics Collection

**Prometheus Metrics:**
```javascript
const promClient = require('prom-client');

// Custom metrics
const contentGenerationDuration = new promClient.Histogram({
  name: 'content_generation_duration_seconds',
  help: 'Duration of content generation',
  labelNames: ['content_type', 'status']
});

const apiRequestCounter = new promClient.Counter({
  name: 'api_requests_total',
  help: 'Total API requests',
  labelNames: ['method', 'endpoint', 'status']
});

// Middleware to track requests
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    apiRequestCounter.inc({
      method: req.method,
      endpoint: req.route?.path || 'unknown',
      status: res.statusCode
    });
  });
  
  next();
});
```

### 11.3 Error Tracking

**Sentry Integration:**
```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});

// Error handler
app.use((err, req, res, next) => {
  Sentry.captureException(err, {
    user: { id: req.user?.id },
    tags: { endpoint: req.path }
  });
  
  logger.error('Request failed', {
    error: err.message,
    stack: err.stack,
    userId: req.user?.id
  });
  
  res.status(500).json({ error: 'Internal server error' });
});
```

### 11.4 Health Checks

```javascript
app.get('/health', async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    openai: await checkOpenAI(),
    vectorDb: await checkPinecone()
  };
  
  const healthy = Object.values(checks).every(c => c.status === 'ok');
  
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString()
  });
});
```


---

## 12. Deployment Architecture

### 12.1 Infrastructure

**Production Setup:**
```
┌─────────────────────────────────────────────────────────┐
│                     Cloudflare CDN                       │
│                  (SSL, DDoS Protection)                  │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  Load Balancer (AWS ALB)                 │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼──────┐ ┌───▼──────┐ ┌───▼──────┐
│  API Server  │ │  API     │ │  API     │
│  (ECS/K8s)   │ │  Server  │ │  Server  │
└───────┬──────┘ └───┬──────┘ └───┬──────┘
        │            │            │
        └────────────┼────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼────────┐ ┌─▼──────────┐
│  PostgreSQL  │ │   Redis   │ │  Pinecone  │
│  (RDS)       │ │ (Elastic) │ │  (Cloud)   │
└──────────────┘ └───────────┘ └────────────┘
```

**Environment Configuration:**
```yaml
# docker-compose.yml (Development)
version: '3.8'
services:
  api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:pass@db:5432/contentos
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: contentos
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  frontend:
    build: ./frontend
    ports:
      - "3001:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3000

volumes:
  postgres_data:
```


### 12.2 CI/CD Pipeline

**GitHub Actions Workflow:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run lint
  
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t contentos-api:${{ github.sha }} .
      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY
          docker push contentos-api:${{ github.sha }}
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster contentos-prod \
            --service api \
            --force-new-deployment
```

### 12.3 Scaling Strategy

**Horizontal Scaling:**
- API servers: Auto-scale based on CPU (target 70%)
- Worker processes: Scale based on queue depth
- Database: Read replicas for analytics queries

**Vertical Scaling:**
- Upgrade instance types during low-traffic periods
- Use reserved instances for baseline capacity

**Cost Optimization:**
```javascript
// Use cheaper models for simple tasks
function selectModel(task) {
  if (task.complexity === 'low') {
    return 'gpt-3.5-turbo'; // $0.0015/1K tokens
  }
  return 'gpt-4'; // $0.03/1K tokens
}

// Batch requests to reduce API calls
async function batchGenerate(requests) {
  const batches = chunk(requests, 10);
  return await Promise.all(
    batches.map(batch => llm.generateBatch(batch))
  );
}
```

---

## 13. Testing Strategy

### 13.1 Unit Tests

```javascript
// tests/services/contentGenerator.test.js
describe('ContentGenerator', () => {
  it('should generate blog post with correct tone', async () => {
    const generator = new ContentGenerator();
    const result = await generator.generate({
      input: 'AI in healthcare',
      contentType: 'blog',
      tone: 'professional'
    });
    
    expect(result.body).toBeDefined();
    expect(result.metadata.tone).toBe('professional');
    expect(result.metadata.wordCount).toBeGreaterThan(500);
  });
  
  it('should handle API failures gracefully', async () => {
    mockLLM.generate.mockRejectedValue(new Error('API Error'));
    
    await expect(generator.generate(input))
      .rejects.toThrow('Content generation failed');
  });
});
```


### 13.2 Integration Tests

```javascript
// tests/integration/api.test.js
describe('Content API', () => {
  let authToken;
  
  beforeAll(async () => {
    // Setup test database
    await db.migrate.latest();
    await db.seed.run();
    
    // Get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    authToken = response.body.token;
  });
  
  it('should create and retrieve content', async () => {
    const createResponse = await request(app)
      .post('/api/v1/content/generate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        workspaceId: testWorkspaceId,
        input: 'Test content',
        contentType: 'blog'
      });
    
    expect(createResponse.status).toBe(200);
    expect(createResponse.body.contentId).toBeDefined();
    
    const getResponse = await request(app)
      .get(`/api/v1/content/${createResponse.body.contentId}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.originalInput).toBe('Test content');
  });
});
```

### 13.3 E2E Tests

```javascript
// tests/e2e/contentCreation.spec.js
import { test, expect } from '@playwright/test';

test('complete content creation flow', async ({ page }) => {
  // Login
  await page.goto('http://localhost:3001/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Navigate to editor
  await page.click('text=New Content');
  
  // Generate content
  await page.fill('[data-testid="content-input"]', 'AI in healthcare');
  await page.selectOption('[data-testid="tone-select"]', 'professional');
  await page.click('text=Generate');
  
  // Wait for generation
  await page.waitForSelector('[data-testid="generated-content"]');
  
  // Transform to Twitter
  await page.click('text=Transform to Twitter');
  await page.waitForSelector('[data-testid="twitter-variation"]');
  
  // Verify content exists
  const twitterContent = await page.textContent('[data-testid="twitter-variation"]');
  expect(twitterContent).toContain('AI');
  
  // Schedule post
  await page.click('text=Schedule');
  await page.fill('[data-testid="schedule-time"]', '2026-02-07T14:00');
  await page.click('text=Confirm');
  
  // Verify success message
  await expect(page.locator('text=Scheduled successfully')).toBeVisible();
});
```

---

## 14. Migration & Rollout Plan

### 14.1 Phase 1: MVP (Weeks 1-8)

**Week 1-2: Foundation**
- Setup infrastructure (AWS, databases)
- Implement authentication system
- Create basic API structure

**Week 3-4: Core Features**
- Content generation engine
- Basic editor UI
- Database schema implementation

**Week 5-6: Integrations**
- LinkedIn OAuth & publishing
- Twitter OAuth & publishing
- Basic analytics collection

**Week 7-8: Polish & Testing**
- UI/UX refinements
- Integration testing
- Performance optimization
- Beta user testing


### 14.2 Phase 2: Enhancement (Weeks 9-16)

**Week 9-10: Personalization**
- Audience segment management
- Vector database integration
- Personalization engine

**Week 11-12: Predictions**
- Engagement prediction model
- Training pipeline
- Insights generation

**Week 13-14: Calendar & Scheduling**
- Content calendar UI
- Advanced scheduling features
- Bulk operations

**Week 15-16: Analytics Dashboard**
- Performance charts
- Insights panel
- Export functionality

### 14.3 Data Migration Strategy

**For Existing Users (if applicable):**
```javascript
// Migration script
async function migrateUserData(oldUserId, newUserId) {
  const transaction = await db.transaction();
  
  try {
    // Migrate user profile
    await transaction.users.update(newUserId, {
      preferences: oldUserData.preferences
    });
    
    // Migrate content
    const oldContent = await oldDb.content.findByUser(oldUserId);
    for (const content of oldContent) {
      await transaction.content.create({
        ...content,
        userId: newUserId,
        workspaceId: defaultWorkspaceId
      });
    }
    
    // Migrate social connections
    const connections = await oldDb.socialAccounts.findByUser(oldUserId);
    for (const conn of connections) {
      await transaction.socialAccounts.create({
        ...conn,
        workspaceId: defaultWorkspaceId
      });
    }
    
    await transaction.commit();
    logger.info('Migration completed', { oldUserId, newUserId });
  } catch (error) {
    await transaction.rollback();
    logger.error('Migration failed', { error, oldUserId });
    throw error;
  }
}
```

---

## 15. Risk Mitigation

### 15.1 Technical Risks

**Risk: LLM API Downtime**
- Mitigation: Implement fallback to alternative provider (Claude)
- Cache common generations
- Queue requests during outages

**Risk: Social Platform API Changes**
- Mitigation: Abstract platform logic into adapters
- Monitor API deprecation notices
- Maintain backward compatibility layer

**Risk: Database Performance Degradation**
- Mitigation: Implement read replicas
- Aggressive caching strategy
- Regular query optimization audits

**Risk: Cost Overruns (LLM Usage)**
- Mitigation: Per-user rate limiting
- Implement usage quotas by tier
- Monitor token consumption metrics
- Use cheaper models for simple tasks


### 15.2 Business Risks

**Risk: Low User Adoption**
- Mitigation: Generous free tier
- Focus on UX simplicity
- Content marketing & SEO
- Referral program

**Risk: High Churn Rate**
- Mitigation: Onboarding tutorial
- Email engagement campaigns
- Usage analytics to identify at-risk users
- Feature requests feedback loop

**Risk: Competition**
- Mitigation: Focus on unique value (personalization + predictions)
- Fast iteration cycle
- Build community around product
- API access for power users

---

## 16. Future Architecture Considerations

### 16.1 Multi-Region Deployment

**Global Expansion:**
```
US-East (Primary)
├── API Servers
├── PostgreSQL (Primary)
└── Redis

EU-West (Secondary)
├── API Servers
├── PostgreSQL (Read Replica)
└── Redis

Asia-Pacific (Future)
├── API Servers
├── PostgreSQL (Read Replica)
└── Redis
```

**Data Residency:**
- Store EU user data in EU region (GDPR)
- Replicate only necessary data across regions
- Use geo-routing for API requests

### 16.2 Microservices Evolution

**Current Monolith → Future Microservices:**
```
Monolithic API
    ↓
Split into:
├── Auth Service
├── Content Service
├── Publishing Service
├── Analytics Service
└── AI Gateway Service
```

**Benefits:**
- Independent scaling
- Technology flexibility
- Isolated failures
- Team autonomy

**Challenges:**
- Increased complexity
- Distributed transactions
- Service discovery
- Monitoring overhead

### 16.3 Event-Driven Architecture

**Future State:**
```
Event Bus (Kafka/RabbitMQ)
    ↓
├── Content Created Event → [Analytics Service, Notification Service]
├── Post Published Event → [Analytics Collector, User Stats]
└── Engagement Updated Event → [ML Model Trainer, Dashboard]
```

**Benefits:**
- Loose coupling
- Async processing
- Event replay capability
- Better scalability

---

## 17. Conclusion

This design document outlines a scalable, maintainable architecture for ContentOS that prioritizes:

1. **User Experience**: Fast, intuitive interface with real-time AI assistance
2. **Reliability**: Graceful degradation, retry logic, comprehensive monitoring
3. **Performance**: Caching, optimization, efficient database queries
4. **Security**: Encryption, authentication, input validation, rate limiting
5. **Scalability**: Horizontal scaling, microservices-ready, cloud-native

**Key Technical Decisions:**
- Next.js for frontend (SSR, performance)
- Node.js/Express for API (JavaScript ecosystem)
- PostgreSQL for relational data (ACID compliance)
- Redis for caching and queues (speed)
- Pinecone for vector search (AI personalization)
- OpenAI GPT-4 for content generation (quality)

**Success Metrics:**
- API response time < 2s (p95)
- Content generation < 15s
- 99.5% uptime
- Support 10,000+ concurrent users
- < $0.10 per content generation (cost)

The architecture is designed to start simple (MVP) and evolve into a distributed system as the product scales.
