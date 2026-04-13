// Shared stub screen factory — import and re-export with specific names below
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

interface StubProps {
  title: string;
  emoji: string;
  description?: string;
}

export function StubScreen({ title, emoji, description }: StubProps) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-14 pb-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-xl font-black text-slate-900">{title}</h1>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 pb-32">
        <span className="text-7xl">{emoji}</span>
        <p className="text-slate-500 text-sm text-center">{description || "Cette section arrive bientôt."}</p>
      </div>
    </div>
  );
}
