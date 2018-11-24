const { calculate } = require("./functions");
const { findGameById, clearPlayersGame, updateGame } = require("./queries");

module.exports = function(io, socket, connections) {
  socket.on("subscribe", game => {
    socket.join(game._id);

    io.in(game._id).clients((error, clients) => {
      if (error) throw error;
      console.log("clients in room", clients);
    });

    if (!game.isStarted) {
      const initialProps = {
        isStarted: true,
        nextPlayer: game.player1.id,
        boardState: game.boardState.concat(
          "?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????"
        ),
        "player1.symbol": "X",
        "player2.symbol": "O"
      };

      updateGame(game._id, initialProps)
        .then(updatedGame => socket.emit("serve game", updatedGame))
        .catch(err => console.log(err));
    } else {
      findGameById(game._id)
        .then(game => socket.emit("serve game", game))
        .catch(err => console.log(err));
    }
  });

  socket.on("move", game => {
    const updatedGame = calculate(game);

    updateGame(game._id, updatedGame)
      .then(updatedGame => {
        io.to(game._id).emit("serve game", updatedGame);

        if (updatedGame.isEnded)
          clearPlayersGame(updatedGame)
            .then(() => io.to(game._id).emit("game ended"))
            .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  });

  socket.on("surrender", game => {
    updateGame(game._id, { isEnded: true, nextPlayer: null })
      .then(endedGame => {
        clearPlayersGame(endedGame)
          .then(() => io.to(endedGame._id).emit("serve game", endedGame))
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  });
};
