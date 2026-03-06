const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({ region: "us-east-1" });

const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const crypto = require("crypto");

const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });
const dynamo = new DynamoDBClient({ region: "us-east-1" });
const { ScanCommand } = require("@aws-sdk/client-dynamodb");

module.exports.generate = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const campaignGoal = body.campaignGoal;

    const prompt = `
You are a campaign strategist AI.

Generate:
1 LinkedIn post
1 Twitter thread (3 tweets)
Provide engagement score from 1-10.

Return ONLY valid JSON in this exact format:

{
  "linkedin_post": "...",
  "twitter_thread": ["...", "...", "..."],
  "engagement_score": number
}

Do not include explanations.
Keep total response under 400 tokens.

Campaign Goal:
${campaignGoal}
`;

    const imagePrompt = `
Create a professional marketing banner for:
${campaignGoal}

Style:
Modern, AI-focused, clean, tech branding.
Social media ready.
`;

    const command = new InvokeModelCommand({
      modelId: "arn:aws:bedrock:us-east-1:055129270743:application-inference-profile/h5noq1c7u7ri",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        prompt: prompt,
        temperature: 0.7,
        top_p: 0.9
      })
    });

    // Titan Image request
    const imageCommand = new InvokeModelCommand({
      modelId: "amazon.titan-image-generator-v2:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        taskType: "TEXT_IMAGE",
        textToImageParams: {
          text: imagePrompt
        },
        imageGenerationConfig: {
          numberOfImages: 1,
          height: 512,
          width: 512,
          cfgScale: 8.0
        }
      })
    });

    const [textResponse, imageResponse] = await Promise.all([
      bedrock.send(command), bedrock.send(imageCommand)
    ]);

    const imageRaw = JSON.parse(
      new TextDecoder().decode(imageResponse.body)
    );
    const base64Image = imageRaw.images[0];

    const resultRaw = JSON.parse(new TextDecoder().decode(textResponse.body));
    const textOutput = resultRaw.generation;
    // Function to extract valid JSON blocks by tracking braces
    function extractJSONBlocks(text) {
      const blocks = [];
      let braceCount = 0;
      let startIndex = null;

      for (let i = 0; i < text.length; i++) {
        if (text[i] === "{") {
          if (braceCount === 0) {
            startIndex = i;
          }
          braceCount++;
        }

        if (text[i] === "}") {
          braceCount--;
          if (braceCount === 0 && startIndex !== null) {
            blocks.push(text.slice(startIndex, i + 1));
            startIndex = null;
          }
        }
      }

      return blocks;
    }

    const jsonBlocks = extractJSONBlocks(textOutput);

    if (!jsonBlocks.length) {
      console.error("Model output:", textOutput);
      throw new Error("No JSON blocks found");
    }

    let parsedResult = null;

    for (let i = jsonBlocks.length - 1; i >= 0; i--) {
      try {
        const candidate = JSON.parse(jsonBlocks[i]);

        // Ensure it matches expected schema
        if (
          candidate.linkedin_post &&
          candidate.twitter_thread &&
          candidate.engagement_score !== undefined
        ) {
          parsedResult = candidate;
          break;
        }
      } catch (err) {
        continue;
      }
    }

    if (!parsedResult) {
      console.error("All JSON blocks:", jsonBlocks);
      throw new Error("Could not parse valid campaign JSON");
    }

    const campaignId = crypto.randomUUID();

    const createdAt = new Date().toISOString();

    // Image Upload
    const imageKey = `campaign-images/${campaignId}.png`;

    await s3.send(new PutObjectCommand({
      Bucket: "contentos-assets",
      Key: imageKey,
      Body: Buffer.from(base64Image, "base64"),
      ContentType: "image/png"
    }));

    const imageUrlResponse = `https://contentos-assets.s3.amazonaws.com/${imageKey}`;

    await dynamo.send(new PutItemCommand({
      TableName: "ContentOS_Campaigns",
      Item: {
        campaignId: { S: campaignId },
        campaignGoal: { S: campaignGoal },
        generatedContent: { S: JSON.stringify(parsedResult) },
        imageUrl: { S: imageUrlResponse },
        createdAt: { S: createdAt }
      }
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*"
      },
      body: JSON.stringify({
        campaignId,
        result: parsedResult,
        imageUrl: imageUrlResponse,
        campaignGoal,
        createdAt
      })
    };

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Generation failed",
        error: error.message
      })
    };
  }
};

module.exports.getCampaigns = async () => {
  try {
    const data = await dynamo.send(new ScanCommand({
      TableName: "ContentOS_Campaigns"
    }));

    const campaigns = data.Items.map(item => ({
      campaignId: item.campaignId.S,
      campaignGoal: item.campaignGoal.S,
      generatedContent: JSON.parse(item.generatedContent.S),
      imageUrl: item.imageUrl?.S,
      createdAt: item.createdAt.S
    }));

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
      body: JSON.stringify({
        message: "Failed to fetch campaigns",
        error: error.message
      })
    };
  }
};