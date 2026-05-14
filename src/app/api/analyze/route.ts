import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Check for required environment variables
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      return NextResponse.json(
        { error: "Missing Cloudflare credentials" },
        { status: 500 }
      );
    }

    // Parse the FormData
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 }
      );
    }

    // Read the image into an ArrayBuffer
    const arrayBuffer = await imageFile.arrayBuffer();

    // Convert to uint8 array
    const uint8Array = [...new Uint8Array(arrayBuffer)];

    // Prepare the request to Cloudflare
    const cloudflareUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/llava-hf/llava-1.5-7b-hf`;

    const payload = {
      image: uint8Array,
      prompt:
        "You are an expert AI art prompt engineer. Analyze this image and write a detailed generation prompt that could recreate it in Midjourney, Stable Diffusion, or DALL-E. Include: subject description, art style, color palette, mood, lighting, composition, level of detail, and relevant quality tags. Return ONLY the prompt, no intro, no explanation.",
      max_tokens: 512,
    };

    // Make the POST request to Cloudflare
    const cloudflareResponse = await fetch(cloudflareUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await cloudflareResponse.json();

    // Check if Cloudflare returned success: false
    if (!responseData.success) {
      return NextResponse.json(
        { error: responseData.errors || "Cloudflare API error" },
        { status: 502 }
      );
    }

    // Extract the description from the response
    const description = responseData.result?.description;

    // Return the generated prompt
    return NextResponse.json({ prompt: description });
  } catch (error) {
    console.error("Error analyzing image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
