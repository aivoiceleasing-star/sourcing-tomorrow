/**
 * Database query functions.
 * Returns data in the same shape as mock.ts types.
 */

import { getDb } from './db';
import type { Article, Resource, Category } from '../data/mock';

function rowToArticle(r: any): Article {
  let faq: { question: string; answer: string }[] | undefined;
  if (r.faq && Array.isArray(r.faq) && r.faq.length > 0) faq = r.faq;
  return {
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt || '',
    content: r.content || '',
    category: r.category || '',
    categorySlug: r.category_slug || '',
    featuredImage: r.featured_image || '',
    metaDescription: r.meta_description || '',
    publishDate: r.publish_date ? new Date(r.publish_date).toISOString().split('T')[0] : '',
    author: r.author || 'SourcingTomorrow',
    featured: r.featured || false,
    tags: r.tags || [],
    readTime: r.read_time || 5,
    faq,
  };
}

function rowToResource(r: any): Resource {
  return {
    title: r.title,
    slug: r.slug,
    description: r.description || '',
    category: r.category || '',
    coverImage: r.cover_image || '',
    downloadUrl: r.download_url || '#',
    publishDate: r.publish_date ? new Date(r.publish_date).toISOString().split('T')[0] : '',
  };
}

function rowToCategory(r: any): Category {
  return {
    name: r.name,
    slug: r.slug,
    description: r.description || '',
  };
}

export async function dbGetArticles(): Promise<Article[]> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM articles WHERE status = 'published' AND title != '' ORDER BY publish_date DESC`;
  return rows.map(rowToArticle);
}

export async function dbGetArticleBySlug(slug: string): Promise<Article | null> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM articles WHERE slug = ${slug} LIMIT 1`;
  return rows.length > 0 ? rowToArticle(rows[0]) : null;
}

export async function dbGetArticlesByCategory(categorySlug: string): Promise<Article[]> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM articles WHERE status = 'published' AND category_slug = ${categorySlug} ORDER BY publish_date DESC`;
  return rows.map(rowToArticle);
}

export async function dbGetFeaturedArticle(): Promise<Article | null> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM articles WHERE status = 'published' AND featured = true ORDER BY publish_date DESC LIMIT 1`;
  if (rows.length > 0) return rowToArticle(rows[0]);
  const fallback = await sql`SELECT * FROM articles WHERE status = 'published' ORDER BY publish_date DESC LIMIT 1`;
  return fallback.length > 0 ? rowToArticle(fallback[0]) : null;
}

export async function dbGetResources(): Promise<Resource[]> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM resources WHERE status = 'published' ORDER BY publish_date DESC`;
  return rows.map(rowToResource);
}

export async function dbGetCategories(): Promise<Category[]> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM categories ORDER BY name`;
  return rows.map(rowToCategory);
}
