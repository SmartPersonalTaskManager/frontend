import { useContext } from "react";
import { GoogleCalendarContext } from "../context/GoogleCalendarContext";

export function useGoogleCalendar() {
  const context = useContext(GoogleCalendarContext);
  if (!context) {
    throw new Error(
      "useGoogleCalendar must be used within GoogleCalendarProvider"
    );
  }
  return context;
}
