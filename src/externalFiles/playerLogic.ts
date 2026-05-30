import { useEffect, useState } from "react";
export type  PlayerData = {
    highscore: number
}
 
export default function usePlayerData() {  
    // playerData will represent the localStorage
    const [playerData, setPlayerData] = useState<PlayerData>(() => {
        const saved = localStorage.getItem("playerData");

        return saved
            ? JSON.parse(saved)
            : { highscore: 0 };
    });
      // saving user changes to storage
      useEffect(() => {
        localStorage.setItem('playerData', JSON.stringify(playerData))
      }, [playerData]);

      return {playerData, setPlayerData}
}