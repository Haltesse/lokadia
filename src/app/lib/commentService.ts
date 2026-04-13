export interface Comment {
  id: string;
  postId: string;
  postTitle: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
  destination?: string;
  category?: string;
}

const COMMENTS_STORAGE_KEY = 'lokadia_comments';

// Récupérer tous les commentaires
export async function getAllComments(): Promise<Comment[]> {
  const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// Récupérer les commentaires d'un utilisateur spécifique
export async function getUserComments(userId: string): Promise<Comment[]> {
  const allComments = await getAllComments();
  return allComments
    .filter(comment => comment.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Récupérer les commentaires pour un post
export async function getPostComments(postId: string): Promise<Comment[]> {
  const allComments = await getAllComments();
  return allComments
    .filter(comment => comment.postId === postId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Créer un commentaire
export async function createComment(
  userId: string,
  userName: string,
  userAvatar: string | undefined,
  data: {
    postId: string;
    postTitle: string;
    content: string;
    destination?: string;
    category?: string;
  }
): Promise<Comment> {
  const comment: Comment = {
    id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    postId: data.postId,
    postTitle: data.postTitle,
    userId: userId,
    userName: userName,
    userAvatar: userAvatar,
    content: data.content,
    createdAt: new Date().toISOString(),
    likes: 0,
    likedBy: [],
    destination: data.destination,
    category: data.category,
  };

  const allComments = await getAllComments();
  allComments.push(comment);
  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));

  return comment;
}

// Supprimer un commentaire
export async function deleteComment(userId: string, commentId: string): Promise<void> {
  const allComments = await getAllComments();
  const comment = allComments.find(c => c.id === commentId);

  if (!comment) {
    throw new Error('Commentaire introuvable');
  }

  if (comment.userId !== userId) {
    throw new Error('Non autorisé à supprimer ce commentaire');
  }

  const updatedComments = allComments.filter(c => c.id !== commentId);
  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(updatedComments));
}

// Liker/Unliker un commentaire
export async function toggleCommentLike(userId: string, commentId: string): Promise<Comment> {
  const allComments = await getAllComments();
  const commentIndex = allComments.findIndex(c => c.id === commentId);

  if (commentIndex === -1) {
    throw new Error('Commentaire introuvable');
  }

  const comment = allComments[commentIndex];
  const hasLiked = comment.likedBy.includes(userId);

  if (hasLiked) {
    // Unliker
    comment.likedBy = comment.likedBy.filter(id => id !== userId);
    comment.likes = Math.max(0, comment.likes - 1);
  } else {
    // Liker
    comment.likedBy.push(userId);
    comment.likes += 1;
  }

  allComments[commentIndex] = comment;
  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));

  return comment;
}

// Modifier un commentaire
export async function updateComment(userId: string, commentId: string, content: string): Promise<Comment> {
  const allComments = await getAllComments();
  const commentIndex = allComments.findIndex(c => c.id === commentId);

  if (commentIndex === -1) {
    throw new Error('Commentaire introuvable');
  }

  const comment = allComments[commentIndex];

  if (comment.userId !== userId) {
    throw new Error('Non autorisé à modifier ce commentaire');
  }

  comment.content = content;
  allComments[commentIndex] = comment;
  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));

  return comment;
}

// Obtenir les statistiques de commentaires pour un utilisateur
export async function getUserCommentStats(userId: string): Promise<{
  totalComments: number;
  totalLikes: number;
  recentComments: Comment[];
}> {
  const userComments = await getUserComments(userId);

  return {
    totalComments: userComments.length,
    totalLikes: userComments.reduce((sum, comment) => sum + comment.likes, 0),
    recentComments: userComments.slice(0, 5),
  };
}
