import { supabaseAdmin } from './database.js';

export async function publishRevision(revisionId, actorId, action = 'published', isScheduler = false) {
  const client = supabaseAdmin();
  const { data: target, error: targetError } = await client.from('blog_revisions').select('*').eq('id', revisionId).in('status', ['approved', 'scheduled']).maybeSingle();
  if (targetError) throw targetError;
  if (!target) return null;
  const { error: archiveError } = await client.from('blog_revisions').update({ status: 'archived' }).eq('post_id', target.post_id).eq('status', 'published').neq('id', target.id);
  if (archiveError) throw archiveError;
  const { data: revision, error: publishError } = await client.from('blog_revisions').update({ status: 'published', published_at: target.published_at || new Date().toISOString(), scheduled_for: null }).eq('id', target.id).select('id, post_id, published_at').single();
  if (publishError) throw publishError;
  const { error: postError } = await client.from('blog_posts').update({ published_revision_id: revision.id, first_published_at: target.published_at || new Date().toISOString() }).eq('id', revision.post_id);
  if (postError) throw postError;
  await client.from('blog_audit_events').insert({ post_id: revision.post_id, revision_id: revision.id, actor_id: actorId, action });
  return { revisionId: revision.id, postId: revision.post_id, publishedAt: revision.published_at };
}