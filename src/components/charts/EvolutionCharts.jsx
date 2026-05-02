import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "react-toastify";
import api from "../../services/api";

export default function EvolutionCharts({ patientId }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchEvolutionData();
  }, [patientId]);

  const fetchEvolutionData = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/doctors/patients/${patientId}/evolution`,
      );
      setData(response.data);
    } catch (err) {
      console.error("Failed to load evolution data:", err);
      toast.error("Erreur lors du chargement de l'évolution");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || !data.sessions || data.sessions.length < 2) {
    return (
      <div className="card">
        <div className="text-center py-8 text-gray-400">
          <svg
            className="w-12 h-12 mx-auto mb-3 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Pas encore assez de données pour afficher l'évolution
        </div>
      </div>
    );
  }

  // Format data for charts
  const chartData = data.sessions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((session) => ({
      date: new Date(session.date).toLocaleDateString("fr-FR", {
        month: "short",
        day: "numeric",
      }),
      eva: session.physiotherapie?.bilan?.evaInitiale || 0,
      constantScore:
        session.physiotherapie?.bilan?.constantScore?.douleur +
          session.physiotherapie?.bilan?.constantScore?.activites +
          session.physiotherapie?.bilan?.constantScore?.mobilite +
          session.physiotherapie?.bilan?.constantScore?.force || 0,
      antepulsion:
        session.physiotherapie?.bilan?.mobiliteArticulaire
          ?.antepulsion_active || 0,
      abduction:
        session.physiotherapie?.bilan?.mobiliteArticulaire?.abduction_active ||
        0,
    }));

  return (
    <div className="space-y-6">
      {/* EVA Chart */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4">
          Évolution de la douleur (EVA)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 10]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="eva"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: "#3B82F6", r: 4 }}
              name="EVA (0-10)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Constant Score Chart */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4">
          Évolution du Constant Score
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="constantScore"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: "#10B981", r: 4 }}
              name="Constant Score (0-100)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Amplitude Chart */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4">
          Évolution des amplitudes articulaires
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="antepulsion"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: "#3B82F6", r: 4 }}
              name="Antépulsion (°)"
            />
            <Line
              type="monotone"
              dataKey="abduction"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ fill: "#F59E0B", r: 4 }}
              name="Abduction (°)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
