import React, { createContext, useState, useCallback, useEffect } from "react";

export const GoogleCalendarContext = createContext();

export function GoogleCalendarProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize Google API
  useEffect(() => {
    const initializeGoogle = () => {
      if (window.gapi) {
        window.gapi.load("calendar", () => {
          window.gapi.client.init({
            apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
            clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            scope: "https://www.googleapis.com/auth/calendar",
            discoveryDocs: [
              "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
            ],
          }).then(() => {
            // Restore token if available
            const accessToken = localStorage.getItem("googleAccessToken");
            if (accessToken) {
              window.gapi.client.setToken({ access_token: accessToken });
              setIsAuthenticated(true); // Optimistically set auth
            }
          });
        });
      }
    };

    // Load gapi script
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Restore user data from localStorage on mount (CRITICAL for session persistence)
  useEffect(() => {
    const storedUserData = localStorage.getItem("sptm_user_data");
    const userId = localStorage.getItem("sptm_userId");

    // If we have stored user data, restore the session
    if (storedUserData && userId) {
      try {
        const userData = JSON.parse(storedUserData);
        console.log("Restoring user session:", userData);
        setGoogleUser(userData);
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Failed to restore user data:", e);
        // Clear invalid data
        localStorage.removeItem("sptm_user_data");
        localStorage.removeItem("sptm_userId");
      }
    }
  }, []);

  // Handle successful login (Legacy/Standard GoogleLogin Component)
  const handleLoginSuccess = useCallback((credentialResponse) => {
    try {
      console.log("Login successful:", credentialResponse);

      // JWT token'ı decode et (header.payload.signature)
      const token = credentialResponse.credential;
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      const decoded = JSON.parse(jsonPayload);
      console.log("Decoded JWT:", decoded);

      // User bilgilerini ayarla
      setGoogleUser({
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        credential: token,
      });

      setIsAuthenticated(true);
      setError(null);
      localStorage.setItem("googleCalendarToken", token);
      // Note: Decoding Google credential doesn't give our Backend User ID.
      // This handleLoginSuccess is for Google legacy flow.
      // We rely on loginUser() for our custom backend flow.
    } catch (err) {
      setError("Failed to authenticate with Google");
      console.error("Login error:", err);
    }
  }, []);

  // Handle successful login with Access Token (Implicit Flow)
  const handleImplicitLoginSuccess = useCallback(async (tokenResponse) => {
    try {
      console.log("Implicit Login successful:", tokenResponse);
      const accessToken = tokenResponse.access_token;

      // Set token for GAPI
      if (window.gapi) {
        window.gapi.client.setToken({ access_token: accessToken });
      }

      localStorage.setItem("googleAccessToken", accessToken);

      // Fetch user profile using the access token
      const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userInfoResponse.ok) {
        throw new Error("Failed to fetch user info");
      }

      const userInfo = await userInfoResponse.json();

      setGoogleUser({
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
        accessToken: accessToken,
      });

      setIsAuthenticated(true);
      setError(null);

    } catch (err) {
      setError("Failed to authenticate with Google");
      console.error("Login error:", err);
    }
  }, []);

  // Manual Login (for custom hooks like useGoogleLogin or LoginModal)
  const loginUser = useCallback((user) => {
    setGoogleUser(user);
    setIsAuthenticated(true);
    setError(null);

    // Persist user data for session restoration
    localStorage.setItem("sptm_user_data", JSON.stringify(user));

    // Normalize token from user object
    const token = user.accessToken || user.credential;

    if (token) {
      // Set token for GAPI client immediately
      if (window.gapi && window.gapi.client) {
        window.gapi.client.setToken({ access_token: token });
      }

      // Persist
      localStorage.setItem("googleAccessToken", token);
      // Remove legacy key
      localStorage.removeItem("googleCalendarToken");
    }

    // If backend provided an ID, save it
    if (user.id) {
      localStorage.setItem("sptm_userId", user.id);
    }
  }, []);

  // Handle login failure
  const handleLoginFailure = useCallback(() => {
    setError("Failed to authenticate with Google");
    setIsAuthenticated(false);
  }, []);

  // Fetch events from Google Calendar
  const fetchCalendarEvents = useCallback(
    async (timeMin, timeMax) => {
      if (!isAuthenticated) {
        setError("Not authenticated with Google Calendar");
        return;
      }

      setIsLoading(true);
      try {
        console.log("Fetching calendar events...");
        // GAPI client initialized?
        if (!window.gapi.client.calendar) {
          throw new Error("Google Calendar API not loaded yet.");
        }

        const request = {
          calendarId: "primary",
          timeMin: timeMin || new Date().toISOString(),
          timeMax:
            timeMax ||
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          showDeleted: false,
          singleEvents: true,
          orderBy: "startTime",
        };

        console.log("Calendar Request:", request);

        const response = await window.gapi.client.calendar.events.list(request);
        console.log("Calendar Response:", response);

        const events = response.result.items || [];
        console.log(`Found ${events.length} events.`);

        setCalendarEvents(events);
        setError(null);
        return events;
      } catch (err) {
        setError(`Failed to fetch calendar events: ${err.message}`);
        console.error("Fetch events error:", err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Create event on Google Calendar
  const createCalendarEvent = useCallback(
    async (event) => {
      if (!isAuthenticated) {
        setError("Not authenticated with Google Calendar");
        return null;
      }

      setIsLoading(true);
      try {
        const response = await window.gapi.client.calendar.events.insert({
          calendarId: "primary",
          resource: {
            summary: event.title,
            description: event.description || "",
            start: {
              dateTime: event.startTime || new Date().toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
              dateTime:
                event.endTime ||
                new Date(Date.now() + 60 * 60 * 1000).toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            location: event.location || "",
            extendedProperties: {
              private: {
                missionId: event.missionId || "",
                taskId: event.taskId || "",
                context: event.context || "",
              },
            },
          },
        });

        setError(null);
        // Refresh events after creating
        await fetchCalendarEvents();
        return response.result;
      } catch (err) {
        setError(`Failed to create calendar event: ${err.message}`);
        console.error("Create event error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, fetchCalendarEvents]
  );

  // Update event on Google Calendar
  const updateCalendarEvent = useCallback(
    async (eventId, event) => {
      if (!isAuthenticated) {
        setError("Not authenticated with Google Calendar");
        return null;
      }

      setIsLoading(true);
      try {
        const response = await window.gapi.client.calendar.events.update({
          calendarId: "primary",
          eventId: eventId,
          resource: {
            summary: event.title,
            description: event.description || "",
            start: {
              dateTime: event.startTime,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
              dateTime: event.endTime,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            location: event.location || "",
          },
        });

        setError(null);
        await fetchCalendarEvents();
        return response.result;
      } catch (err) {
        setError(`Failed to update calendar event: ${err.message}`);
        console.error("Update event error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, fetchCalendarEvents]
  );

  // Delete event from Google Calendar
  const deleteCalendarEvent = useCallback(
    async (eventId) => {
      if (!isAuthenticated) {
        setError("Not authenticated with Google Calendar");
        return false;
      }

      setIsLoading(true);
      try {
        await window.gapi.client.calendar.events.delete({
          calendarId: "primary",
          eventId: eventId,
        });

        setError(null);
        await fetchCalendarEvents();
        return true;
      } catch (err) {
        setError(`Failed to delete calendar event: ${err.message}`);
        console.error("Delete event error:", err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, fetchCalendarEvents]
  );

  // Logout from Google
  const logout = useCallback(() => {
    if (window.gapi?.auth2) {
      const auth2 = window.gapi.auth2.getAuthInstance();
      if (auth2) {
        auth2.signOut();
      }
    }
    // Also revoke token manually if needed, but simple clearing state is enough for UI
    setIsAuthenticated(false);
    setGoogleUser(null);
    setCalendarEvents([]);
    localStorage.removeItem("googleCalendarToken");
    localStorage.removeItem("googleAccessToken"); // Fix: Clear this too
    localStorage.removeItem("sptm_userId");
    localStorage.removeItem("sptm_user_data"); // Clear persisted user data
    localStorage.removeItem("sptm_demo_prompt_shown"); // Optional: Reset prompts
  }, []);

  const value = {
    isAuthenticated,
    googleUser,
    calendarEvents,
    isLoading,
    error,
    handleLoginSuccess,
    handleImplicitLoginSuccess,
    handleLoginFailure,
    loginUser, // Exposed for custom login
    fetchCalendarEvents,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    logout,
  };

  return (
    <GoogleCalendarContext.Provider value={value}>
      {children}
    </GoogleCalendarContext.Provider>
  );
}
