import React from 'react';
import { Construction } from 'lucide-react';

function ComingSoon({ name }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 bg-fog-dark rounded-2xl flex items-center justify-center mb-5">
        <Construction size={32} className="text-ink/30" />
      </div>
      <h2 className="font-display text-xl font-bold text-ink mb-2">{name}</h2>
      <p className="text-sm text-ink/50 max-w-xs">
        This screen is being built in the next sprint. The mock data layer is wired and ready.
      </p>
    </div>
  );
}

export function MyTripsPage()          { return <ComingSoon name="My Trips" />; }
export function CreateTripPage()       { return <ComingSoon name="Create Trip" />; }
export function ItineraryBuilderPage() { return <ComingSoon name="Itinerary Builder" />; }
export function ItineraryViewPage()    { return <ComingSoon name="Itinerary View" />; }
export function CitySearchPage()       { return <ComingSoon name="City Search" />; }
export function ActivitySearchPage()   { return <ComingSoon name="Activity Search" />; }
export function BudgetPage()           { return <ComingSoon name="Budget & Cost Breakdown" />; }
export function CalendarPage()         { return <ComingSoon name="Trip Calendar" />; }
export function ProfilePage()          { return <ComingSoon name="Profile & Settings" />; }
export function AdminPage()            { return <ComingSoon name="Admin Analytics" />; }
export function PublicSharePage()      { return <ComingSoon name="Public Share View" />; }
