import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as commentService from '../lib/commentService';
import { initializeDemoComments } from '../lib/initializeDemoData';
import type { Comment } from '../lib/commentService';

export function useComments() {
  const { user } = useAuth();
  const [userComments, setUserComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState({
    totalComments: 0,
    totalLikes: 0,
  });
  const [loading, setLoading] = useState(true);

  // Charger les commentaires de l'utilisateur
  const loadUserComments = async () => {
    if (!user) {
      setUserComments([]);
      setStats({ totalComments: 0, totalLikes: 0 });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Initialiser les commentaires de démo si c'est la première fois
      await initializeDemoComments(user.id, user.name, user.photo);
      
      const comments = await commentService.getUserComments(user.id);
      const commentStats = await commentService.getUserCommentStats(user.id);
      
      setUserComments(comments);
      setStats({
        totalComments: commentStats.totalComments,
        totalLikes: commentStats.totalLikes,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
    } finally {
      setLoading(false);
    }
  };

  // Créer un commentaire
  const createComment = async (data: {
    postId: string;
    postTitle: string;
    content: string;
    destination?: string;
    category?: string;
  }) => {
    if (!user) {
      throw new Error('Non authentifié');
    }

    try {
      const newComment = await commentService.createComment(
        user.id,
        user.name,
        user.photo,
        data
      );
      await loadUserComments(); // Recharger
      return newComment;
    } catch (error) {
      console.error('Erreur lors de la création du commentaire:', error);
      throw error;
    }
  };

  // Supprimer un commentaire
  const deleteComment = async (commentId: string) => {
    if (!user) {
      throw new Error('Non authentifié');
    }

    try {
      await commentService.deleteComment(user.id, commentId);
      await loadUserComments(); // Recharger
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
      throw error;
    }
  };

  // Liker/Unliker un commentaire
  const toggleLike = async (commentId: string) => {
    if (!user) {
      throw new Error('Non authentifié');
    }

    try {
      await commentService.toggleCommentLike(user.id, commentId);
      await loadUserComments(); // Recharger
    } catch (error) {
      console.error('Erreur lors du like:', error);
      throw error;
    }
  };

  // Modifier un commentaire
  const updateComment = async (commentId: string, content: string) => {
    if (!user) {
      throw new Error('Non authentifié');
    }

    try {
      await commentService.updateComment(user.id, commentId, content);
      await loadUserComments(); // Recharger
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      throw error;
    }
  };

  // Charger au montage et quand l'utilisateur change
  useEffect(() => {
    loadUserComments();
  }, [user?.id]);

  return {
    userComments,
    stats,
    loading,
    createComment,
    deleteComment,
    toggleLike,
    updateComment,
    reload: loadUserComments,
  };
}
