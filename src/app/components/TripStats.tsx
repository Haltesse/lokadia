import { useEffect, useState } from "react";
import { Plane, CheckCircle } from "lucide-react";
import { getCompletedTripsCount } from "../lib/tripService";
import { useAuth } from "../context/AuthContext";

interface TripStatsProps {
  className?: string;
}

export function TripStats({ className = "" }: TripStatsProps) {
  const { user } = useAuth();
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const count = await getCompletedTripsCount(user.id);
      setCompletedCount(count);
    } catch (error) {
      console.error("Erreur lors du chargement des stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className={`bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 text-white shadow-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm mb-1">Voyages complétés</p>
          <p className="text-3xl font-bold">{completedCount}</p>
        </div>
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
          <Plane className="w-8 h-8" />
        </div>
      </div>
      {completedCount > 0 && (
        <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Continuez à explorer le monde !</span>
        </div>
      )}
      {completedCount === 0 && (
        <div className="mt-3 pt-3 border-t border-white/20 text-sm text-white/80">
          Enregistrez votre premier voyage pour commencer votre collection
        </div>
      )}
    </div>
  );
}
