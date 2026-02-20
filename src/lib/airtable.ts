/**
 * Airtable API Client + Content Layer
 *
 * Fetches from Airtable when env vars are set, falls back to mock data for local dev.
 */

import type { Article, Resource, Category } from '../data/mock';
import {
  articles as mockArticles,
  resources as mockResources,
  categories as mockCategories,
} from '../data/mock';

const AIRTABLE_API_KEY = import.meta.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = import.meta.env.AIRTABLE_BASE_ID;
const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

const isConfigured = !!(AIRTABLE_API_KEY && AIRTABLE_BASE_ID);

interface AirtableRecord<T> {
  id: string;
  fields: T;
  createdTime: string;
}

interface AirtableResponse<T> {
  records: AirtableRecord<T>[];
  offset?: string;
}

async function fetchTable<T>(
  tableName: string,
  filterFormula?: string,
  sort?: { field: string; direction: 'asc' | 'desc' }[]
): Promise<AirtableRecord<T>[]> {
  if (!isConfigured) return [];

  const params = new URLSearchParams();
  if (filterFormula) params.set('filterByFormula', filterFormula);
  if (sort) {
    sort.forEach((s, i) => {
      params.set(`sort[${i}][field]`, s.field);
      params.set(`sort[${i}][direction]`, s.direction);
    });
  }

  const url = `${BASE_URL}/${encodeURIComponent(tableName)}?${params}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
  });

  if (!res.ok) {
    console.error(`Airtable error: ${res.status} ${res.statusText}`);
    return [];
  }

  const data: AirtableResponse<T> = await res.json();
  return data.records;
}

// --- Transform Airtable records to app types ---

function transformArticle(record: AirtableRecord<any>): Article {
  const f = record.fields;
  const featuredImage = f['Featured Image']
    ? f['Featured Image'][0]?.url
    : '';
  let faq: { question: string; answer: string }[] | undefined;
  if (f['FAQ Section']) {
    try { faq = JSON.parse(f['FAQ Section']); } catch { faq = undefined; }
  }
  let tags: string[] = [];
  if (f['Tags']) {
    tags = Array.isArray(f['Tags']) ? f['Tags'] : [];
  }
  const category = f['Category'] || '';
  return {
    title: f['Title'] || '',
    slug: f['Slug'] || '',
    content: f['Content'] || '',
    excerpt: f['Excerpt'] || '',
    category,
    categorySlug: category.toLowerCase().replace(/\s+/g, '-'),
    featuredImage,
    metaDescription: f['Meta Description'] || '',
    publishDate: f['Publish Date'] || '',
    author: f['Author'] || 'SourcingTomorrow',
    featured: f['Featured'] || false,
    tags,
    readTime: f['Read Time'] || Math.ceil((f['Content'] || '').length / 1500),
    faq,
  };
}

function transformResource(record: AirtableRecord<any>): Resource {
  const f = record.fields;
  const coverImage = f['Cover Image']
    ? f['Cover Image'][0]?.url
    : '';
  const downloadUrl = f['File']
    ? f['File'][0]?.url
    : '#';
  return {
    title: f['Title'] || '',
    slug: f['Slug'] || '',
    description: f['Description'] || '',
    category: f['Category'] || '',
    coverImage,
    downloadUrl,
    publishDate: f['Publish Date'] || '',
  };
}

// --- Public API ---

export async function getArticles(): Promise<Article[]> {
  if (!isConfigured) return mockArticles;
  const records = await fetchTable('Articles', '{Status} = "Published"', [
    { field: 'Publish Date', direction: 'desc' },
  ]);
  return records.length > 0 ? records.map(transformArticle) : mockArticles;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!isConfigured) return mockArticles.find(a => a.slug === slug) || null;
  const records = await fetchTable('Articles', `{Slug} = "${slug}"`);
  return records.length > 0 ? transformArticle(records[0]) : null;
}

export async function getArticlesByCategory(categorySlug: string): Promise<Article[]> {
  const allArticles = await getArticles();
  return allArticles.filter(a => a.categorySlug === categorySlug);
}

export async function getFeaturedArticle(): Promise<Article | null> {
  const allArticles = await getArticles();
  return allArticles.find(a => a.featured) || allArticles[0] || null;
}

export async function getResources(): Promise<Resource[]> {
  if (!isConfigured) return mockResources;
  const records = await fetchTable('Resources', '{Status} = "Published"', [
    { field: 'Publish Date', direction: 'desc' },
  ]);
  return records.length > 0 ? records.map(transformResource) : mockResources;
}

export function getCategories(): Category[] {
  return mockCategories;
}
