import { ArrowLeft, MessageCircle, Heart, Trash2, MapPin, Calendar } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { useComments } from "../hooks/useComments";
import { useLanguageSafe } from "../context/LanguageContext";
import { Modal } from "../components/Modal";

export function MyCommentsScreen() {
  const navigate = useNavigate();
  const context = useLanguageSafe();
  const t = context?.t || { profile: {} };
  const { userComments, stats, loading, deleteComment } = useComments();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!commentToDelete) return;

    try {
      await deleteComment(commentToDelete);
      setShowDeleteModal(false);
      setCommentToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `il y a ${diffMins} min`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--lokadia-soft-white)" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" 
               style={{ borderColor: "var(--lokadia-deep-blue)" }}></div>
          <p style={{ color: "var(--lokadia-text-light)" }}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-6" style={{ backgroundColor: "var(--lokadia-soft-white)" }}>
      {/* Header */}
      <div
        className="px-6 pt-12 pb-6"
        style={{
          background: "linear-gradient(135deg, var(--lokadia-deep-blue) 0%, var(--lokadia-blue) 100%)",
        }}
      >
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            navigate("/profile");
          }}
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transition-transform active:scale-95 mb-4"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <MessageCircle className="h-8 w-8 text-white" />
          <h1 className="text-2xl font-bold text-white">Mes commentaires</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="h-4 w-4 text-white/80" />
              <span className="text-xs text-white/80">Commentaires</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalComments}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="h-4 w-4 text-white/80" />
              <span className="text-xs text-white/80">Likes reçus</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalLikes}</p>
          </div>
        </div>
      </div>

      {/* Liste des commentaires */}
      <div className="px-6 pt-6">
        {userComments.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <MessageCircle className="h-12 w-12 mx-auto mb-3" style={{ color: "var(--lokadia-text-light)" }} />
            <h3 className="font-semibold mb-2" style={{ color: "var(--lokadia-text-dark)" }}>
              Aucun commentaire
            </h3>
            <p className="text-sm mb-4" style={{ color: "var(--lokadia-text-light)" }}>
              Vous n'avez pas encore laissé de commentaire.
            </p>
            <button
              onClick={() => navigate("/community")}
              className="px-6 py-2 rounded-xl font-medium text-white"
              style={{ backgroundColor: "var(--lokadia-deep-blue)" }}
            >
              Explorer la communauté
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {userComments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white rounded-xl p-4 shadow-sm"
              >
                {/* Info du post */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" 
                            style={{ 
                              backgroundColor: "rgba(59, 130, 246, 0.1)",
                              color: "var(--lokadia-deep-blue)"
                            }}>
                        Commentaire sur
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm mb-1" style={{ color: "var(--lokadia-text-dark)" }}>
                      {comment.postTitle}
                    </h4>
                    {comment.destination && (
                      <div className="flex items-center gap-1 text-xs" style={{ color: "var(--lokadia-text-light)" }}>
                        <MapPin className="h-3 w-3" />
                        <span>{comment.destination}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setCommentToDelete(comment.id);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>

                {/* Contenu du commentaire */}
                <p className="text-sm mb-3" style={{ color: "var(--lokadia-text-dark)" }}>
                  {comment.content}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--lokadia-gray-300)" }}>
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--lokadia-text-light)" }}>
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(comment.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" style={{ color: comment.likes > 0 ? "#ef4444" : "var(--lokadia-text-light)" }} />
                    <span className="text-sm font-medium" style={{ color: "var(--lokadia-text-dark)" }}>
                      {comment.likes}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCommentToDelete(null);
        }}
        title="Supprimer le commentaire ?"
      >
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>
            Cette action est irréversible. Le commentaire sera définitivement supprimé.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setCommentToDelete(null);
              }}
              className="flex-1 py-3 rounded-xl font-medium"
              style={{
                backgroundColor: "var(--lokadia-gray-200)",
                color: "var(--lokadia-text-dark)",
              }}
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-3 rounded-xl font-medium text-white"
              style={{ backgroundColor: "#ef4444" }}
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}