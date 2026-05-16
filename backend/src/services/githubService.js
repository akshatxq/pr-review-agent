import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// ── FETCH PR FILES (diff) ──────────────────────────────

export const getPRFiles = async (owner, repo, pull_number) => {
  const { data } = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number,
    per_page: 30,
  });

  // each file has: filename, status, additions, deletions, patch
  // patch is the actual diff — this is what we send to agents
  return data.map((file) => ({
    filename: file.filename,
    status: file.status,       // added / modified / removed
    additions: file.additions,
    deletions: file.deletions,
    patch: file.patch ?? '',   // patch can be undefined for binary files
  }));
};

// ── FORMAT DIFF FOR AGENTS ─────────────────────────────

export const formatDiffForAgents = (files) => {
  // combine all file diffs into one string
  // truncate to avoid hitting Groq token limits
  const MAX_CHARS_PER_FILE = 1500;

  const formatted = files
    .filter((f) => f.patch)
    .map((f) => {
      const patch = f.patch.length > MAX_CHARS_PER_FILE
        ? f.patch.slice(0, MAX_CHARS_PER_FILE) + '\n... [truncated]'
        : f.patch;

      return `### File: ${f.filename} (${f.status})\n${patch}`;
    })
    .join('\n\n');

  return formatted || 'No diff available';
};

// ── POST COMMENT ON PR ─────────────────────────────────

export const postPRComment = async (owner, repo, pull_number, body) => {
  const { data } = await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: pull_number,  // GitHub treats PRs as issues for comments
    body,
  });

  return data.id;  // github comment id — save this to DB
};