import { HealthResponse, HomePageConfigData, MainCategory, SubCategory, Product, SuccessStory, BlogPost, Order, OrderStatusType, OrderStats, User, Coupon, CouponValidationResult } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const getAuthToken = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('accessToken') || '';
};

export interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number;
  token?: string;
}

/**
 * Industry-standard resilient fetch wrapper with automatic auth, timeouts, and error handling
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
  const { timeoutMs = 15000, token, headers, ...restOptions } = options;
  const authToken = token || getAuthToken();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const reqHeaders: Record<string, string> = {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...((headers as Record<string, string>) || {}),
    };

    if (restOptions.body && !(restOptions.body instanceof FormData) && !reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, {
      ...restOptions,
      headers: reqHeaders,
      signal: controller.signal,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || `Request failed with status ${res.status}`,
      };
    }

    return data || { success: true };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { success: false, message: 'Request timed out. Please check your connection.' };
    }
    return { success: false, message: err.message || 'Network request failed' };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function checkBackendHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Server returned status code: ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to connect to backend server');
  }
}

/**
 * Fetch Home Page Configuration (Hero Line / Announcement Bar & Hero Section)
 */
export async function getHomePageConfig(): Promise<HomePageConfigData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/v1/homepage-config`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.success ? data.data : null;
  } catch (e) {
    return null;
  }
}

/**
 * Update Home Page Configuration (Admin only)
 */
export async function updateHomePageConfig(
  config: Partial<HomePageConfigData>,
  token?: string
): Promise<{ success: boolean; message: string; data?: HomePageConfigData }> {
  try {
    const authToken = token || getAuthToken();

    const res = await fetch(`${API_BASE_URL}/v1/homepage-config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(config),
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update homepage configuration',
    };
  }
}

/**
 * Fetch active Main Categories for public Shop page
 */
export async function getCategories(): Promise<MainCategory[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/v1/categories`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.success ? data.data : [];
  } catch (e) {
    return [];
  }
}

/**
 * Fetch all categories with statistics for Admin panel
 */
export async function getAdminCategories(params?: {
  search?: string;
  status?: string;
}): Promise<{
  success: boolean;
  data: MainCategory[];
  stats: {
    totalCategories: number;
    activeCategories: number;
    inactiveCategories: number;
    totalSubCategories: number;
  };
  message?: string;
}> {
  try {
    const token = getAuthToken();
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);

    const res = await fetch(`${API_BASE_URL}/v1/categories/admin/list?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      cache: 'no-store',
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      data: [],
      stats: { totalCategories: 0, activeCategories: 0, inactiveCategories: 0, totalSubCategories: 0 },
      message: error.message || 'Failed to fetch categories',
    };
  }
}

/**
 * Create a new Main Category (Admin only)
 */
export async function createCategory(
  categoryData: Partial<MainCategory>
): Promise<{ success: boolean; message: string; data?: MainCategory }> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(categoryData),
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to create category',
    };
  }
}

/**
 * Update an existing Main Category (Admin only)
 */
export async function updateCategory(
  id: string,
  categoryData: Partial<MainCategory>
): Promise<{ success: boolean; message: string; data?: MainCategory }> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(categoryData),
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update category',
    };
  }
}

/**
 * Toggle active/inactive status of a Category (Admin only)
 */
export async function toggleCategoryStatus(
  id: string
): Promise<{ success: boolean; message: string; data?: MainCategory }> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/categories/${id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to toggle category status',
    };
  }
}

/**
 * Delete a Category (Admin only)
 */
export async function deleteCategory(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/categories/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to delete category',
    };
  }
}

/**
 * Fetch all sub-categories with their parent category details
 */
export async function getAllSubCategories(): Promise<{
  success: boolean;
  data: any[];
  totalCount: number;
  message?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/v1/categories/subcategories/all`, {
      cache: 'no-store',
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      data: [],
      totalCount: 0,
      message: error.message || 'Failed to fetch sub-categories',
    };
  }
}

/**
 * Create a new Sub-Category under a Main Category
 */
export async function createSubCategory(
  mainCategoryId: string,
  subData: Partial<SubCategory>
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/categories/${mainCategoryId}/subcategories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(subData),
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to create sub-category',
    };
  }
}

/**
 * Update a Sub-Category
 */
export async function updateSubCategory(
  mainCategoryId: string,
  subCategoryId: string,
  subData: Partial<SubCategory> & { newParentCategoryId?: string }
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const token = getAuthToken();
    const res = await fetch(
      `${API_BASE_URL}/v1/categories/${mainCategoryId}/subcategories/${subCategoryId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(subData),
      }
    );
    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update sub-category',
    };
  }
}

/**
 * Delete a Sub-Category
 */
export async function deleteSubCategory(
  mainCategoryId: string,
  subCategoryId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getAuthToken();
    const res = await fetch(
      `${API_BASE_URL}/v1/categories/${mainCategoryId}/subcategories/${subCategoryId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      }
    );
    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to delete sub-category',
    };
  }
}

/**
 * Upload an image file from local folder / device
 */
export async function uploadImageFile(
  file: File
): Promise<{ success: boolean; url?: string; filename?: string; message?: string }> {
  try {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/v1/upload/image`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: formData,
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Image upload failed',
    };
  }
}

/**
 * Upload a video file from local folder / device (for Hero Video)
 */
export async function uploadVideoFile(
  file: File
): Promise<{ success: boolean; url?: string; filename?: string; message?: string }> {
  try {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/v1/upload/video`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: formData,
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Video upload failed',
    };
  }
}

/**
 * Get all images from server upload media library
 */
export async function getMediaLibrary(): Promise<{
  success: boolean;
  files: Array<{ filename: string; url: string; size: number; updatedAt: string; type?: string }>;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/v1/upload/media-library`, {
      cache: 'no-store',
    });
    const data = await res.json();
    return data.success ? data : { success: false, files: [] };
  } catch (e) {
    return { success: false, files: [] };
  }
}

/**
 * Fetch products from database with optional filters
 */
export async function getProducts(params?: {
  category?: string;
  subCategory?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  data: Product[];
  pagination?: {
    totalProducts: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}> {
  try {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.subCategory) query.set('subCategory', params.subCategory);
    if (params?.search) query.set('search', params.search);
    if (params?.sort) query.set('sort', params.sort);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const res = await fetch(`${API_BASE_URL}/v1/products?${query.toString()}`, {
      cache: 'no-store',
    });

    const data = await res.json();
    return data.success ? data : { success: false, data: [] };
  } catch (e) {
    return { success: false, data: [] };
  }
}

/**
 * Fetch a single product by slug or id
 */
export async function getProductById(
  idOrSlug: string
): Promise<{ success: boolean; data?: Product; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/v1/products/${idOrSlug}`, {
      cache: 'no-store',
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to fetch product' };
  }
}

/**
 * Create a new product (Admin)
 */
export async function createProduct(
  productData: any
): Promise<{ success: boolean; data?: Product; message?: string }> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to create product' };
  }
}

/**
 * Update an existing product (Admin)
 */
export async function updateProduct(
  id: string,
  productData: any
): Promise<{ success: boolean; data?: Product; message?: string }> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update product' };
  }
}

/**
 * Delete a product (Admin)
 */
export async function deleteProduct(
  id: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/products/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to delete product' };
  }
}

/**
 * Toggle whether a product is featured on the Home Page Showcase section
 */
export async function toggleProductFeatured(
  id: string
): Promise<{ success: boolean; data?: Product; message?: string }> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/products/${id}/featured`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to toggle product showcase status' };
  }
}

export interface StoryFilterOptions {
  type?: 'photo' | 'video';
  mainCategory?: string;
  category?: string;
  subCategory?: string;
}

/**
 * Fetch all active success stories for storefront
 */
export async function getSuccessStories(
  filterOrType?: 'photo' | 'video' | StoryFilterOptions
): Promise<{
  success: boolean;
  data: SuccessStory[];
  count?: number;
}> {
  try {
    const params = new URLSearchParams();
    if (typeof filterOrType === 'string') {
      params.set('type', filterOrType);
    } else if (filterOrType) {
      if (filterOrType.type) params.set('type', filterOrType.type);
      const cat = filterOrType.mainCategory || filterOrType.category;
      if (cat && cat !== 'all') params.set('mainCategory', cat);
      if (filterOrType.subCategory && filterOrType.subCategory !== 'all') {
        params.set('subCategory', filterOrType.subCategory);
      }
    }
    const query = params.toString();
    const url = query
      ? `${API_BASE_URL}/v1/stories?${query}`
      : `${API_BASE_URL}/v1/stories`;
    const res = await fetch(url, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return { success: false, data: [] };
    }
    const data = await res.json();
    return { success: data.success, data: data.data || [], count: data.count };
  } catch (error) {
    return { success: false, data: [] };
  }
}

/**
 * Fetch all success stories for Admin Dashboard (includes stats & inactive)
 */
export async function getAdminSuccessStories(
  filterOrType?: 'photo' | 'video' | StoryFilterOptions
): Promise<{
  success: boolean;
  data: SuccessStory[];
  stats?: {
    totalStories: number;
    activeStories: number;
    inactiveStories: number;
    photoStories: number;
    featuredStories: number;
    videoStories: number;
  };
  message?: string;
}> {
  try {
    const token = getAuthToken();
    const params = new URLSearchParams();
    if (typeof filterOrType === 'string') {
      params.set('type', filterOrType);
    } else if (filterOrType) {
      if (filterOrType.type) params.set('type', filterOrType.type);
      const cat = filterOrType.mainCategory || filterOrType.category;
      if (cat && cat !== 'all') params.set('mainCategory', cat);
      if (filterOrType.subCategory && filterOrType.subCategory !== 'all') {
        params.set('subCategory', filterOrType.subCategory);
      }
    }
    const query = params.toString();
    const url = query
      ? `${API_BASE_URL}/v1/stories/admin/all?${query}`
      : `${API_BASE_URL}/v1/stories/admin/all`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      cache: 'no-store',
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to fetch admin success stories',
    };
  }
}

/**
 * Create a new success story (Admin)
 */
export async function createSuccessStory(
  storyData: any
): Promise<{ success: boolean; data?: SuccessStory; message?: string }> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/stories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(storyData),
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to create success story' };
  }
}

/**
 * Update an existing success story (Admin)
 */
export async function updateSuccessStory(
  id: string,
  storyData: any
): Promise<{ success: boolean; data?: SuccessStory; message?: string }> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/stories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(storyData),
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update success story' };
  }
}

/**
 * Toggle status of a success story (Admin)
 */
export async function toggleStoryStatus(
  id: string
): Promise<{ success: boolean; data?: SuccessStory; message?: string }> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/stories/${id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to toggle story status' };
  }
}

/**
 * Delete a success story (Admin)
 */
export async function deleteSuccessStory(
  id: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/stories/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to delete success story' };
  }
}

/**
 * ============================================================================
 * BLOG / JOURNAL MANAGEMENT API
 * ============================================================================
 */

/**
 * Fetch all published blog articles for storefront
 */
export async function getBlogPosts(
  category?: string,
  search?: string
): Promise<{
  success: boolean;
  data: BlogPost[];
  count?: number;
}> {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search && search.trim()) params.append('search', search.trim());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/v1/blogs${queryString}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return { success: false, data: [] };
    }
    const data = await res.json();
    return { success: data.success, data: data.data || [], count: data.count };
  } catch (error) {
    return { success: false, data: [] };
  }
}

/**
 * Fetch single blog article by id or slug
 */
export async function getBlogPostById(
  id: string
): Promise<{ success: boolean; data?: BlogPost; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/v1/blogs/${id}`, {
      cache: 'no-store',
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to fetch article' };
  }
}

/**
 * Fetch all blogs for Admin Dashboard (includes drafts and stats)
 */
export async function getAdminBlogPosts(): Promise<{
  success: boolean;
  data: BlogPost[];
  stats?: {
    totalBlogs: number;
    publishedBlogs: number;
    draftBlogs: number;
    featuredBlogs: number;
    categoriesCount: number;
  };
  message?: string;
}> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/blogs/admin/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      cache: 'no-store',
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to fetch admin blog posts',
    };
  }
}

/**
 * Create a new blog article (Admin)
 */
export async function createBlogPost(
  blogData: any
): Promise<{ success: boolean; data?: BlogPost; message?: string }> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(blogData),
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to create blog article' };
  }
}

/**
 * Update a blog article (Admin)
 */
export async function updateBlogPost(
  id: string,
  blogData: any
): Promise<{ success: boolean; data?: BlogPost; message?: string }> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/blogs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(blogData),
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update blog article' };
  }
}

/**
 * Toggle blog status (published / draft) (Admin)
 */
export async function toggleBlogStatus(
  id: string
): Promise<{ success: boolean; data?: BlogPost; message?: string }> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/blogs/${id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to toggle blog status' };
  }
}

/**
 * Toggle whether a blog article is shown on the Homepage section
 */
export async function toggleBlogHomeStatus(
  id: string
): Promise<{ success: boolean; data?: BlogPost; message?: string }> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/blogs/${id}/home`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to toggle blog homepage status' };
  }
}

/**
 * Delete a blog article (Admin)
 */
export async function deleteBlogPost(
  id: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/blogs/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to delete blog article' };
  }
}

/**
 * ============================================================================
 * ORDERS & CHECKOUT API
 * ============================================================================
 */

/**
 * Place a new Customer Order (Public / Guest / User)
 */
export async function createOrder(orderPayload: {
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    fullName?: string;
    phone?: string;
    address: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: Array<{
    product: {
      id: string;
      name: string;
      price: number;
      image: string;
      category?: string;
    };
    quantity: number;
  }>;
  paymentMethod: 'cod' | 'online';
  couponCode?: string;
  notes?: string;
}): Promise<{ success: boolean; message: string; data?: Order }> {
  try {
    const res = await fetch(`${API_BASE_URL}/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to place order. Please try again.' };
  }
}

/**
 * Get Order Details by Order Number or ID
 */
export async function getOrderById(
  id: string
): Promise<{ success: boolean; data?: Order; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/v1/orders/${id}`, {
      cache: 'no-store',
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to fetch order details' };
  }
}

/**
 * Get All Orders (Admin only)
 */
export async function getAdminOrders(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  data: Order[];
  stats?: OrderStats;
  pagination?: {
    totalOrders: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
  message?: string;
}> {
  try {
    const token = getAuthToken();
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const res = await fetch(`${API_BASE_URL}/v1/orders?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to fetch orders list',
    };
  }
}

/**
 * Update Order Status, Delivery Courier & Tracking Info (Admin only)
 */
export async function updateOrderStatus(
  id: string,
  payload: {
    status?: OrderStatusType;
    paymentStatus?: 'pending' | 'completed' | 'failed';
    deliveryName?: string;
    deliveryTrackId?: string;
  }
): Promise<{ success: boolean; message: string; data?: Order }> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update order status' };
  }
}

/**
 * Public Track Order by Order ID (for customer tracking portal)
 */
export async function trackOrderByOrderId(orderId: string): Promise<{
  success: boolean;
  data?: Order;
  message?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/v1/orders/track/${encodeURIComponent(orderId.trim())}`, {
      cache: 'no-store',
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to track order' };
  }
}

/**
 * ============================================================================
 * RAZORPAY PAYMENT GATEWAY API
 * ============================================================================
 */

/**
 * Fetch Public Razorpay Key ID
 */
export async function getRazorpayKeyId(): Promise<{
  success: boolean;
  keyId?: string;
  isConfigured?: boolean;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/v1/payment/razorpay/key`, {
      cache: 'no-store',
    });
    return await res.json();
  } catch (error: any) {
    return {
      success: false,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
    };
  }
}

/**
 * Create Razorpay Order
 */
export async function createRazorpayOrder(payload: {
  amount: number;
  currency?: string;
  orderId?: string;
  receipt?: string;
}): Promise<{
  success: boolean;
  data?: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    keyId: string;
  };
  message?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/v1/payment/razorpay/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to initiate Razorpay order',
    };
  }
}

/**
 * Verify Razorpay Payment Signature
 */
export async function verifyRazorpayPayment(payload: {
  orderId?: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<{
  success: boolean;
  message?: string;
  data?: Order;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/v1/payment/razorpay/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Payment signature verification failed',
    };
  }
}

/**
 * Get Current Logged-in User Profile
 */
export async function getCurrentUserProfile(): Promise<{
  success: boolean;
  data?: { user: User };
  message?: string;
}> {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, message: 'Please sign in to view your profile' };
    }

    const res = await fetch(`${API_BASE_URL}/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to fetch user profile' };
  }
}

/**
 * Update Current Logged-in User Profile
 */
export async function updateUserProfile(payload: {
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}): Promise<{
  success: boolean;
  data?: { user: User };
  message?: string;
}> {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, message: 'Please sign in to update your profile' };
    }

    const res = await fetch(`${API_BASE_URL}/v1/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update profile' };
  }
}

/**
 * Change Current Logged-in User Password
 */
export async function changeUserPassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, message: 'Please sign in to change password' };
    }

    const res = await fetch(`${API_BASE_URL}/v1/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update password' };
  }
}

/**
 * Get Orders Placed by the Logged-in Customer
 */
export async function getMyOrders(): Promise<{
  success: boolean;
  data: Order[];
  message?: string;
}> {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, data: [], message: 'Please sign in to view your orders' };
    }

    const res = await fetch(`${API_BASE_URL}/v1/orders/my-orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, data: [], message: error.message || 'Failed to fetch your orders' };
  }
}

/**
 * Get all coupons (with optional status & search filter)
 */
export async function getCoupons(params?: {
  status?: string;
  search?: string;
  showOnlyPublic?: boolean;
}): Promise<{
  success: boolean;
  count: number;
  data: Coupon[];
  message?: string;
}> {
  try {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.showOnlyPublic) query.append('showOnlyPublic', 'true');

    const res = await fetch(`${API_BASE_URL}/v1/coupons?${query.toString()}`, {
      cache: 'no-store',
    });
    return await res.json();
  } catch (error: any) {
    return { success: false, count: 0, data: [], message: error.message };
  }
}

/**
 * Get single coupon by ID
 */
export async function getCouponById(id: string): Promise<{
  success: boolean;
  data?: Coupon;
  message?: string;
}> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/coupons/${id}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    });
    return await res.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Create a new coupon
 */
export async function createCoupon(couponData: Partial<Coupon>): Promise<{
  success: boolean;
  data?: Coupon;
  message?: string;
}> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(couponData),
    });
    return await res.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Update an existing coupon
 */
export async function updateCoupon(id: string, couponData: Partial<Coupon>): Promise<{
  success: boolean;
  data?: Coupon;
  message?: string;
}> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/coupons/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(couponData),
    });
    return await res.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Toggle coupon active/inactive status
 */
export async function toggleCouponStatus(id: string): Promise<{
  success: boolean;
  data?: Coupon;
  message?: string;
}> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/coupons/${id}/status`, {
      method: 'PATCH',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return await res.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Delete a coupon
 */
export async function deleteCoupon(id: string): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/coupons/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return await res.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Validate coupon code during checkout
 */
export async function validateCoupon(body: {
  code: string;
  subtotal: number;
  itemsCount?: number;
  paymentMethod?: string;
  userId?: string;
}): Promise<{
  success: boolean;
  valid?: boolean;
  data?: CouponValidationResult;
  message?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/v1/coupons/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (error: any) {
    return { success: false, message: error.message || 'Validation request failed' };
  }
}
/**
 * Request password reset verification OTP
 */
export async function forgotPassword(email: string): Promise<{
  success: boolean;
  message?: string;
  devOtp?: string;
}> {
  return await apiRequest('/v1/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * Reset password using verified 6-digit OTP
 */
export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string
): Promise<{
  success: boolean;
  message?: string;
  data?: {
    user: any;
    accessToken: string;
  };
}> {
  return await apiRequest('/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, otp, newPassword }),
  });
}

/**
 * Public: Subscribe to newsletter & WhatsApp wellness updates
 */
export async function subscribeToNewsletter(payload: {
  name: string;
  email: string;
  phone: string;
  source?: string;
}): Promise<{
  success: boolean;
  message?: string;
  couponCode?: string;
  whatsappMessage?: string;
  customerWhatsappUrl?: string;
  directChatWithAdminUrl?: string;
  data?: any;
}> {
  return await apiRequest('/v1/subscribers/subscribe', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Admin: Fetch all captured subscribers with pagination & search
 */
export async function getSubscribersList(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{
  success: boolean;
  data?: any[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    totalActive: number;
    totalUnsubscribed: number;
  };
  message?: string;
}> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  return await apiRequest(`/v1/subscribers?${query.toString()}`, {
    method: 'GET',
  });
}

/**
 * Admin: Get newsletter auto-responder & company message settings
 */
export async function getNewsletterSettings(): Promise<{
  success: boolean;
  data?: any;
  companyProfile?: {
    adminEmail: string;
    adminPhone: string;
    whatsappNumber: string;
  };
  message?: string;
}> {
  return await apiRequest('/v1/subscribers/settings', {
    method: 'GET',
  });
}

/**
 * Admin: Update newsletter message templates & company settings
 */
export async function updateNewsletterSettings(settings: any): Promise<{
  success: boolean;
  data?: any;
  message?: string;
}> {
  return await apiRequest('/v1/subscribers/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

/**
 * Admin: Delete a subscriber lead
 */
export async function deleteSubscriber(id: string): Promise<{
  success: boolean;
  message?: string;
}> {
  return await apiRequest(`/v1/subscribers/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Admin: Re-dispatch / refresh welcome message for a subscriber
 */
export async function resendSubscriberMessage(id: string): Promise<{
  success: boolean;
  message?: string;
  whatsappUrl?: string;
  whatsappMessage?: string;
}> {
  return await apiRequest(`/v1/subscribers/${id}/resend`, {
    method: 'POST',
  });
}

/**
 * Admin: Helper to get CSV download URL with auth token
 */
export function getExportSubscribersUrl(): string {
  const token = getAuthToken();
  return `${API_BASE_URL}/v1/subscribers/export?token=${token}`;
}

/**
 * Admin: Send a test email to verify SMTP configuration
 */
export async function testEmailSettings(toEmail: string, smtpConfig: any): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  return await apiRequest('/v1/subscribers/settings/test-email', {
    method: 'POST',
    body: JSON.stringify({ toEmail, smtpConfig }),
  });
}

/**
 * Admin: Send a test WhatsApp message to verify WhatsApp Gateway
 */
export async function testWhatsAppGateway(testPhone: string, message: string, gatewayConfig: any): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  return await apiRequest('/v1/subscribers/settings/test-whatsapp', {
    method: 'POST',
    body: JSON.stringify({ testPhone, message, gatewayConfig }),
  });
}

