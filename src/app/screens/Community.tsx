import { useNavigate } from "react-router";
import { MessageCircle, Heart, Share2, Plus } from "lucide-react";
import { motion } from "motion/react";

const POSTS = [
  { id: 1, user: "Marie D.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marie", location: "Bali, Indonésie", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&q=80", caption: "Lever de soleil magique sur les rizières en terrasses de Tegallalang 🌅 Un moment inoubliable !", likes: 247, comments: 18, time: "2h" },
  { id: 2, user: "Thomas R.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=thomas", location: "Kyoto, Japon", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=500&q=80", caption: "La saison des cerisiers à Kyoto, c'est tout simplement parfait 🌸 #Japon #Sakura", likes: 512, comments: 34, time: "5h" },
];

export function Community() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="px-5 pt-14 pb-3 flex items-center justify-between sticky top-0 bg-[#f8fafc] z-10">
        <h1 className="text-2xl font-black text-slate-900">Communauté</h1>
        <button onClick={() => navigate("/my-posts")} className="w-11 h-11 rounded-2xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,#0F4C81,#06B6D4)" }}>
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <div className="flex flex-col gap-4 px-4 pb-32">
        {POSTS.map((post, i) => (
          <motion.div key={post.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-3xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 px-4 py-3">
              <img src={post.avatar} alt={post.user} className="w-10 h-10 rounded-2xl" />
              <div className="flex-1">
                <p className="font-bold text-sm text-slate-900">{post.user}</p>
                <p className="text-xs text-slate-400">{post.location} · {post.time}</p>
              </div>
            </div>
            <img src={post.image} alt="" className="w-full h-56 object-cover" />
            <div className="px-4 py-3">
              <p className="text-sm text-slate-700 mb-3">{post.caption}</p>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                  <Heart className="w-4 h-4" /> {post.likes}
                </button>
                <button className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                  <MessageCircle className="w-4 h-4" /> {post.comments}
                </button>
                <button className="flex items-center gap-1.5 text-slate-500 text-xs font-medium ml-auto">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
