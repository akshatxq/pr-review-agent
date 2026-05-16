import express from 'express';
import { validateWebhook } from '../middleware/validateWebhook.js';
import { getPRFiles, formatDiffForAgents, postPRComment } from '../services/githubService.js';
import { upsertRepo, createReview, updateReview, createAgentRun } from '../services/supabaseService.js';
import buildReviewGraph from '../graph/reviewGraph.js';
import formatComment from '../utils/formatComment.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.post('/github', validateWebhook, async (req, res) => {
  const event = req.headers['x-github-event'];

  // only handle pull_request events with action opened or synchronize
  if (event !== 'pull_request') {
    return res.status(200).json({ message: 'Event ignored' });
  }

  const { action, pull_request, repository } = req.body;

  if (!['opened', 'synchronize'].includes(action)) {
    return res.status(200).json({ message: 'Action ignored' });
  }

  // respond to GitHub immediately — webhook must get 200 fast
  // long-running agent work happens after response is sent
  res.status(200).json({ message: 'Webhook received' });

  // everything below runs async after responding to GitHub
  try {
    logger.info(`PR #${pull_request.number} received from ${repository.full_name}`);

    // 1. upsert repo
    const repo = await upsertRepo({
      github_repo_id: repository.id,
      repo_full_name: repository.full_name,
      owner: repository.owner.login,
    });

    // 2. create review record
    const review = await createReview({
      repo_id: repo.id,
      pr_number: pull_request.number,
      pr_title: pull_request.title,
      pr_author: pull_request.user.login,
      pr_url: pull_request.html_url,
    });

    // 3. fetch PR diff
    const files = await getPRFiles(
      repository.owner.login,
      repository.name,
      pull_request.number
    );
    const diff = formatDiffForAgents(files);

    // 4. run langgraph
    const graph = buildReviewGraph();
    const result = await graph.invoke({ diff });

    // 5. save all agent runs to DB
    for (const agentResult of result.agentResults) {
      await createAgentRun({
        review_id: review.id,
        ...agentResult,
      });
    }

    // 6. post comment to GitHub
    const comment = formatComment(result.summaryOutput, {
      pr_title: pull_request.title,
      pr_author: pull_request.user.login,
    });

    const commentId = await postPRComment(
      repository.owner.login,
      repository.name,
      pull_request.number,
      comment
    );

    // 7. update review as completed
    await updateReview(review.id, {
      status: 'completed',
      comment_posted: true,
      github_comment_id: commentId,
      completed_at: new Date().toISOString(),
    });

    logger.info(`Review completed for PR #${pull_request.number}`);

  } catch (error) {
    logger.error('Review pipeline failed', error.message);
  }
});

export default router;