import PropTypes from "prop-types";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [specialist, setSpecialist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const stored = localStorage.getItem("sahtech_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          // load profile on app start
          if (parsed.accessToken) {
            loadProfile(parsed.accessToken);
          }
        }
      } catch {}
      setLoading(false);
    };
    init();
  }, []);

  const loadProfile = useCallback(async (token) => {
    try {
      const { data } = await axios.get("http://localhost:3000/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // map API response to specialist format the dashboard expects
      setSpecialist({
        id: data.userId,
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        imageUrl: data.imageUrl,
        // doctor specific
        specialty: data.specialist?.speciality ?? "",
        clinic: data.specialist?.clinic ?? "",
        bio: data.specialist?.bio ?? "",
        licenseNumber: data.specialist?.licenseNumber ?? "",
        isValidated: data.specialist?.isValidated ?? false,
        location: data.specialist?.location ?? "",
        rating: data.specialist?.rating ?? 0,
        reviewsCount: data.specialist?.reviewsCount ?? 0,
        latitude: data.specialist?.latitude ?? null,
        longitude: data.specialist?.longitude ?? null,
        // admin specific
        canModerate: data.admin?.canModerate ?? false,
      });
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await axios.post("http://localhost:3000/users/signin", {
      email,
      password,
    });
    return data;
  }, []);

  const verifyOtp = useCallback(
    async (userId, code) => {
      const { data } = await axios.post(
        "http://localhost:3000/users/signin/verify",
        {
          userId,
          code,
        },
      );
      localStorage.setItem("sahtech_user", JSON.stringify(data));
      setUser(data);
      // load profile after login
      await loadProfile(data.accessToken);
      return data;
    },
    [loadProfile],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("sahtech_user");
    setUser(null);
    setSpecialist(null);
  }, []);

  const updateSpecialist = useCallback((updates) => {
    setSpecialist((prev) => ({ ...prev, ...updates }));
  }, []);

  const value = useMemo(
    () => ({
      user,
      specialist,
      loading,
      login,
      verifyOtp,
      logout,
      updateSpecialist,
      loadProfile,
    }),
    [
      user,
      specialist,
      loading,
      login,
      verifyOtp,
      logout,
      updateSpecialist,
      loadProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
