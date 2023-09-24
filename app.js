const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const startServerAndDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server started at http://localhost:3000/");
    });
  } catch (e) {
    console.log("DB Error");
    process.exit(1);
  }
};

startServerAndDB();

// GET LIST OF MOVIE NAMES API

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT *
    FROM movie
    ORDER BY movie_id;`;

  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => {
      return { movieName: eachMovie.movie_name };
    })
  );
});
exports.module = app;

// CREATE A NEW MOVIE API

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieQuery = `
    INSERT INTO movie(director_id, movie_name, lead_actor)
    VALUES (
        ${directorId},
        '${movieName}',
        '${leadActor}'
    );`;

  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});
module.exports = app;

// GET MOVIE NAME API

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT * 
    FROM movie 
    WHERE movie_id = ${movieId};`;

  const movieDetails = await db.get(getMovieQuery);
  const respDb = {
    movieId: movieDetails.movie_id,
    directorId: movieDetails.director_id,
    movieName: movieDetails.movie_name,
    leadActor: movieDetails.lead_actor,
  };
  response.send(respDb);
});
module.exports = app;

// UPDATE MOVIE DETAILS API

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  console.log(directorId);

  const updateMovieQuery = `
  UPDATE 
    movie
  SET
     director_id = ${directorId}, 
     movie_name = '${movieName}', 
     lead_actor = '${leadActor}'
  WHERE 
    movie_id = ${movieId};`;

  const updateMovie = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});
module.exports = app;

//DELETE MOVIE DETAILS API

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM 
        movie
    WHERE 
        movie_id = ${movieId};
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});
module.exports = app;

// GET DIRECTORS LIST API

app.get("/directors/", async (request, response) => {
  const getDirectorsList = `
    SELECT
        *
    FROM 
        director
    ORDER BY
        director_id;`;
  const directorsList = await db.all(getDirectorsList);
  response.send(
    directorsList.map((each) => {
      return {
        directorId: each.director_id,
        directorName: each.director_name,
      };
    })
  );
});
module.exports = app;

// SPECIFIC DIRECTOR MOVIES API

app.get("/directors/:directorId/movies", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovies = `
  SELECT 
    movie_name
  FROM 
    movie
  WHERE
    director_id = ${directorId};
  `;
  const directorMovies = await db.all(getDirectorMovies);
  response.send(
    directorMovies.map((each) => {
      return { movieName: each.movie_name };
    })
  );
});
module.exports = app;
