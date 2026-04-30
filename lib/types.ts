export type Privacy = "private" | "unlisted" | "public" | "draft";

export type DayRecord = {
  day: number;
  date: string;
  title: string;
  body: string;
  photos: string[];
};

export type ShareSettings = {
  shareUrl: string;
  password: string;
  allowComments: boolean;
  allowDownload: boolean;
  expiresAt: string | null;
};

export type NoteAuthor = {
  name: string;
  avatar: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email?: string;
  avatar: string;
};

export type AccountProfile = AuthUser & {
  handle: string;
  bio: string;
};

export type FollowedAuthor = {
  id: string;
  name: string;
  avatar: string;
};

export type CommentItem = {
  id: string;
  name: string;
  avatar: string;
  body: string;
  createdAt: string;
};

export type Note = {
  id: string;
  title: string;
  slug: string;
  userId?: string | null;
  area: string;
  prefecture: string;
  startDate: string;
  endDate: string;
  dateRange: string;
  duration: string;
  style: string[];
  companions: string;
  theme: string[];
  summary: string;
  coverImage: string;
  status: Privacy;
  likes: number;
  comments: number;
  saves: number;
  author: NoteAuthor;
  days: DayRecord[];
  commentItems?: CommentItem[];
  spots: string[];
  tags: string[];
  share: ShareSettings;
  createdAt: string;
  updatedAt: string;
};

export type NotePayload = {
  title: string;
  area: string;
  prefecture: string;
  startDate: string;
  endDate: string;
  style: string[];
  companions: string;
  theme: string[];
  summary: string;
  coverImage: string;
  status: Privacy;
  days: DayRecord[];
  spots: string[];
};

export type SortOption = "newest" | "oldest" | "popular" | "saved";

export type ExpenseCategory = "カフェ" | "旅行" | "その他";

export type ExpenseItem = {
  id: string;
  userId: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  spentAt: string;
  noteId?: string | null;
  createdAt: string;
};
