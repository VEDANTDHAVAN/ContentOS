const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { DynamoDBClient, PutItemCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");

const crypto = require("crypto");

const REGION = process.env.AWS_REGION_NAME || "us-east-1";
const s3 = new S3Client({ region: REGION });
const bedrock = new BedrockRuntimeClient({ region: REGION });
const dynamo = new DynamoDBClient({ region: REGION });

/* ------------------------------
   Utility: JSON extractor
------------------------------ */

function extractCampaignJSON(textOutput) {

  const matches = textOutput.match(/\{[\s\S]*?\}/g);

  if (!matches) return null;

  for (const block of matches.reverse()) {
    try {
      const parsed = JSON.parse(block);

      if (
        parsed.linkedin_post &&
        parsed.twitter_thread &&
        parsed.engagement_score !== undefined
      ) {
        return parsed;
      }

    } catch (err) { }
  }

  return null;
}

/* ------------------------------
   Tool: Engagement prediction
------------------------------ */

function predictEngagement(campaign) {

  const score =
    Math.min(
      10,
      Math.floor(
        campaign.linkedin_post.length / 50 +
        campaign.twitter_thread.length * 2
      )
    );

  return score;

}

/* ------------------------------
   Tool: Content calendar
------------------------------ */

function buildCalendar(goal) {

  return [
    { day: "Monday", platform: "LinkedIn", content: "Launch announcement" },
    { day: "Tuesday", platform: "Twitter", content: "Thread about product value" },
    { day: "Wednesday", platform: "Instagram", content: "Visual asset post" },
    { day: "Thursday", platform: "LinkedIn", content: "Founder story" },
    { day: "Friday", platform: "Twitter", content: "Community engagement post" }
  ];

}

/* ------------------------------
   Agent Endpoint
------------------------------ */

module.exports.agent = async (event) => {

  try {

    const body = JSON.parse(event.body);

    let campaignGoal = body.campaignGoal;
    const messages = body.messages || [];
    const userId = body.userId || "anonymous";

    if (messages.length) {
      campaignGoal = messages
        .map(m => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n");
    }

    /* ------------------------------
       Campaign generation prompt
    ------------------------------ */

    const prompt = `
You are ContentOS AI, a marketing campaign strategist.

Return ONLY JSON in this format:

{
 "linkedin_post": "...",
 "twitter_thread": ["...", "...", "..."],
 "engagement_score": number
}

Rules:
- JSON only
- no explanation
- no markdown

Campaign goal:
${campaignGoal}
`;

    const command = new InvokeModelCommand({
      modelId: process.env.LLM_MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        prompt,
        temperature: 0.6,
        top_p: 0.9,
        max_gen_len: 300
      })
    });

    const textResponse = await bedrock.send(command);

    const resultRaw = JSON.parse(new TextDecoder().decode(textResponse.body));
    const textOutput = resultRaw.generation;

    const parsedResult = extractCampaignJSON(textOutput);

    if (!parsedResult) {
      console.error("MODEL OUTPUT:", textOutput);
      throw new Error("Could not parse valid campaign JSON");
    }

    /* ------------------------------
       Generate image
    ------------------------------ */

    const imagePrompt = `
Create a professional marketing banner for:

${campaignGoal}

Style: modern AI startup branding
`;

    const imageCommand = new InvokeModelCommand({
      modelId: process.env.IMAGE_MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        taskType: "TEXT_IMAGE",
        textToImageParams: { text: imagePrompt },
        imageGenerationConfig: {
          numberOfImages: 1,
          height: 512,
          width: 512,
          cfgScale: 8.0
        }
      })
    });

    const imageResponse = await bedrock.send(imageCommand);

    const imageRaw = JSON.parse(new TextDecoder().decode(imageResponse.body));

    const base64Image = imageRaw.images[0];

    const campaignId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    /* ------------------------------
       Upload image
    ------------------------------ */

    const imageKey = `campaign-images/${campaignId}.png`;

    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: imageKey,
      Body: Buffer.from(base64Image, "base64"),
      ContentType: "image/png"
    }));

    const imageUrl =
      `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${imageKey}`;

    /* ------------------------------
       Agent tools
    ------------------------------ */

    const predictedEngagement =
      predictEngagement(parsedResult);

    const calendar =
      buildCalendar(campaignGoal);

    /* ------------------------------
       Save to DynamoDB
    ------------------------------ */

    await dynamo.send(new PutItemCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: {
        campaignId: { S: campaignId },
        userId: { S: userId },
        campaignGoal: { S: campaignGoal },
        generatedContent: { S: JSON.stringify(parsedResult) },
        imageUrl: { S: imageUrl },
        engagementScore: { N: predictedEngagement.toString() },
        createdAt: { S: createdAt }
      }
    }));

    /* ------------------------------
       Response
    ------------------------------ */

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*"
      },
      body: JSON.stringify({
        campaignId,
        campaign: parsedResult,
        imageUrl,
        predictedEngagement,
        contentCalendar: calendar,
        campaignGoal,
        createdAt
      })
    };

  } catch (error) {

    console.error(error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*"
      },
      body: JSON.stringify({
        message: "Agent execution failed",
        error: error.message
      })
    };

  }

};

/* ------------------------------
   Campaign history
------------------------------ */

module.exports.getCampaigns = async (event) => {

  try {

    const userId = event.queryStringParameters?.userId;

    if (!userId) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "*"
        },
        body: JSON.stringify({
          message: "UserId is required"
        })
      };
    }

    const data = await dynamo.send(new ScanCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME
    }));

    const campaigns =
      data.Items
        .map(item => ({
          campaignId: item.campaignId.S,
          campaignGoal: item.campaignGoal.S,
          generatedContent: JSON.parse(item.generatedContent.S),
          imageUrl: item.imageUrl?.S,
          createdAt: item.createdAt.S,
          userId: item.userId?.S
        }))
        .filter(c => c.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*"
      },
      body: JSON.stringify(campaigns)
    };

  } catch (error) {

    console.error(error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*"
      },
      body: JSON.stringify({
        message: "Failed to fetch campaigns",
        error: error.message
      })
    };

  }

};