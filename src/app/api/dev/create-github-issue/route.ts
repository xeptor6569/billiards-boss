import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { BUILD_INFO } from "@/lib/build-info";

export async function POST(request: NextRequest) {
  // Only allow in development environment
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Check for GitHub token
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    return NextResponse.json(
      { error: "GitHub token not configured. Please set GITHUB_TOKEN environment variable." },
      { status: 500 }
    );
  }

  // Get repo info from environment or use defaults
  const repoOwner = process.env.GITHUB_REPO_OWNER || "cmarotto";
  const repoName = process.env.GITHUB_REPO_NAME || "billiards-boss";

  try {
    const body = await request.json();
    const { title, body: issueBody } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Create issue via GitHub API
    const response = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/issues`,
      {
        method: "POST",
        headers: {
          "Authorization": `token ${githubToken}`,
          "Accept": "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          body: issueBody || "",
          labels: ["dev-deployment", "bug"],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("GitHub API error:", errorData);
      return NextResponse.json(
        { 
          error: "Failed to create GitHub issue",
          details: errorData.message || `GitHub API returned ${response.status}`
        },
        { status: response.status }
      );
    }

    const issueData = await response.json();

    return NextResponse.json({
      message: "Issue created successfully",
      html_url: issueData.html_url,
      number: issueData.number,
      ...issueData,
    });
  } catch (error) {
    console.error("Error creating GitHub issue:", error);
    return NextResponse.json(
      { 
        error: "Failed to create GitHub issue",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

