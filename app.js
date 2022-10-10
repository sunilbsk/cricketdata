const express = require("express");
const app = express();

const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server running at http://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//API GET Players

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
    SELECT
    *
    FROM
    cricket_team`;
  let dbObject = await db.all(getPlayerQuery);

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };
  response.send(convertDbObjectToResponseObject);
});

// API POST player

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayer = `
            INSERT 
            INTO 
            cricket_team(playerName,jerseyNumber,role),
            VALUES
            (
                "${playerName}",
                "${jerseyNumber}",
                "${role}"
            );`;
  const dbResponse = await db.run(addPlayer);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

// API 3 GET PlayerId:

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  getPlayerQuery = `
    SELECT 
    *
    FROM 
    cricket_team
    WHERE
    player_id = ${playerId};`;

  const player = await db.get(getPlayerQuery);
  response.send(player);
});
//API 4 PUT  playerDetails:

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerDetails = `
     UPDATE
     players
      SET 
        player_name = "${playerName}",
        jersey_number = "${jerseyNumber}",
        role = "${role}"
        WHERE 
        player_id= ${playerId};`;
  const playerResponse = await db.run(updatePlayerDetails);
  response.send("Players Details Updated");
});

//API DELETE table

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
    DELETE 
    FROM
    cricket_team
    WHERE player_id = "${playerId}";`;
  await db.run(deletePlayer);
  response.send("Player Removed");
});
module.exports = app;
