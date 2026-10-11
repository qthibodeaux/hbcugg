import React from "react";
import { GameInfoPassport } from "../../game/page/summary/GameInfoPassport";

const mockMeta = {
  game_id: "PVAMUTSU30082025",
  date: "08/30/2025",
  site: "Houston, Texas (Shell Energy Stadium)",
  attendance: 19638,
  kickoff_time: "08:25 PM",
  weather: "Partly Cloudy",
  temperature: 84,
  season: 2025,
  week: 1,
  duration: "3:24"
};

// eslint-disable-next-line no-unused-vars
const mockMetaMissing = {
  date: "12/06/2025",
  site: "Jackson, Mississippi", // No stadium parens
  season: 2025,
  attendance: 32187,
};

export const GameInfoPassportLab = () => {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", padding: "20px", background: "#0B0B0D", minHeight: "100vh" }}>
      <div>
        <h3 style={{ color: "white", marginBottom: "10px", fontSize: "12px", textTransform: "uppercase", opacity: 0.5 }}>Standard Game Info</h3>
        <div style={{ width: "350px", height: "400px" }}>
          <GameInfoPassport meta={mockMeta} homeId="swactsu" />
        </div>
      </div>

      <div>
        <h3 style={{ color: "white", marginBottom: "10px", fontSize: "12px", textTransform: "uppercase", opacity: 0.5 }}>Compact View (Squeezed)</h3>
        <div style={{ width: "180px", height: "300px" }}>
          <GameInfoPassport meta={mockMeta} homeId="swactsu" variant="compact" />
        </div>
      </div>

      <div>
        <h3 style={{ color: "white", marginBottom: "10px", fontSize: "12px", textTransform: "uppercase", opacity: 0.5 }}>Missing Data (No Venue/Duration)</h3>
        <div style={{ width: "280px", height: "350px" }}>
          <GameInfoPassport 
            meta={{ date: "12/06/2025", kickoff_time: "01:11 PM", attendance: 32187 }} 
            homeId="swacjsu" 
          />
        </div>
      </div>
    </div>
  );
};
