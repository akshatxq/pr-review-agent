import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── REPOS ──────────────────────────────────────────────

export const upsertRepo = async (repoData) => {
  const { data, error } = await supabase
    .from('repos')
    .upsert(
      {
        github_repo_id: repoData.github_repo_id,
        repo_full_name: repoData.repo_full_name,
        owner: repoData.owner,
      },
      { onConflict: 'github_repo_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getAllRepos = async () => {
  const { data, error } = await supabase
    .from('repos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// ── PR REVIEWS ─────────────────────────────────────────

export const createReview = async (reviewData) => {
  const { data, error } = await supabase
    .from('pr_reviews')
    .insert({
      repo_id: reviewData.repo_id,
      pr_number: reviewData.pr_number,
      pr_title: reviewData.pr_title,
      pr_author: reviewData.pr_author,
      pr_url: reviewData.pr_url,
      status: 'pending',
      comment_posted: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateReview = async (reviewId, updates) => {
  const { data, error } = await supabase
    .from('pr_reviews')
    .update(updates)
    .eq('id', reviewId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getAllReviews = async () => {
  const { data, error } = await supabase
    .from('pr_reviews')
    .select(`
      *,
      repos (repo_full_name, owner)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getReviewById = async (id) => {
  const { data, error } = await supabase
    .from('pr_reviews')
    .select(`
      *,
      repos (repo_full_name, owner),
      agent_runs (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// ── AGENT RUNS ─────────────────────────────────────────

export const createAgentRun = async (runData) => {
  const { data, error } = await supabase
    .from('agent_runs')
    .insert({
      review_id: runData.review_id,
      agent_name: runData.agent_name,
      input_tokens: runData.input_tokens ?? null,
      output_tokens: runData.output_tokens ?? null,
      execution_time_ms: runData.execution_time_ms ?? null,
      output: runData.output,
      status: runData.status,
      error_message: runData.error_message ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};