import { ArrowLeft, MessageSquare, Heart, Eye, MapPin, Calendar } from "lucide-react";
import { useNavigate } from "react-router";
import { useLanguageSafe } from "../context/LanguageContext";

export function MyPostsScreen() {
  const navigate = useNavigate();
  const context = useLanguageSafe();
  const t = context?.t || { profile: {} };

  // Pour l'instant, posts vides - à connecter plus tard si besoin
  const userPosts: any[] = [];
  const stats = {
    totalPosts: 0,
    totalLikes: 0,
    totalViews: 0,
  };

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
          <MessageSquare className="h-8 w-8 text-white" />
          <h1 className="text-2xl font-bold text-white">Mes posts</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3">
            <div className="flex items-center gap-1 mb-1">
              <MessageSquare className="h-3 w-3 text-white/80" />
            </div>
            <p className="text-xl font-bold text-white">{stats.totalPosts}</p>
            <span className="text-[10px] text-white/80">Posts</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3">
            <div className="flex items-center gap-1 mb-1">
              <Heart className="h-3 w-3 text-white/80" />
            </div>
            <p className="text-xl font-bold text-white">{stats.totalLikes}</p>
            <span className="text-[10px] text-white/80">Likes</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3">
            <div className="flex items-center gap-1 mb-1">
              <Eye className="h-3 w-3 text-white/80" />
            </div>
            <p className="text-xl font-bold text-white">{stats.totalViews}</p>
            <span className="text-[10px] text-white/80">Vues</span>
          </div>
        </div>
      </div>

      {/* Liste des posts */}
      <div className="px-6 pt-6">
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <MessageSquare className="h-12 w-12 mx-auto mb-3" style={{ color: "var(--lokadia-text-light)" }} />
          <h3 className="font-semibold mb-2" style={{ color: "var(--lokadia-text-dark)" }}>
            Aucun post
          </h3>
          <p className="text-sm mb-4" style={{ color: "var(--lokadia-text-light)" }}>
            Vous n'avez pas encore créé de post.
          </p>
          <button
            onClick={() => navigate("/community")}
            className="px-6 py-2 rounded-xl font-medium text-white"
            style={{ backgroundColor: "var(--lokadia-deep-blue)" }}
          >
            Explorer la communauté
          </button>
        </div>
      </div>
    </div>
  );
}