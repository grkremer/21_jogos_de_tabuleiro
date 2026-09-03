/**
 * Generic Minimax AI with Alpha-Beta pruning.
 * Works with any GameBase implementation.
 */
export class MinimaxAI {
  /**
   * @param {GameBase} game - the game instance
   * @param {number} maxDepth - search depth (difficulty)
   * @param {boolean} randomize - shuffle moves before evaluating (adds variety at shallow depths)
   * @param {boolean} fastWin - discount decisive results by depth (see _leafScore)
   */
  constructor(game, maxDepth, randomize = true, fastWin = true) {
    this.game = game;
    this.maxDepth = maxDepth;
    this.randomize = randomize;
    this.fastWin = fastWin;
  }

  /**
   * Returns the best move for the current player in the given state.
   * @param {object} state
   * @returns {any} best move
   */
  getBestMove(state) {
    const player = state.currentPlayer;
    const maximizing = player === 1;

    let bestMove = null;
    let bestScore = maximizing ? -Infinity : Infinity;

    let moves = this.game.getValidMoves(state);
    if (moves.length === 0) return null;

    // Shuffle for variety (avoids always playing the same game at low depths)
    if (this.randomize) moves = this._shuffle(moves);

    for (const move of moves) {
      const next = this.game.applyMove(this.game.cloneState(state), move);
      const score = this._minimax(next, this.maxDepth - 1, -Infinity, Infinity, !maximizing);

      if (maximizing ? score > bestScore : score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  _minimax(state, depth, alpha, beta, maximizing) {
    const result = this.game.checkResult(state);
    if (result.over || depth === 0) {
      return this._leafScore(state, result, depth);
    }

    const moves = this.game.getValidMoves(state);

    if (maximizing) {
      let best = -Infinity;
      for (const move of moves) {
        const next = this.game.applyMove(this.game.cloneState(state), move);
        best = Math.max(best, this._minimax(next, depth - 1, alpha, beta, false));
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break; // beta cut-off
      }
      return best;
    } else {
      let best = Infinity;
      for (const move of moves) {
        const next = this.game.applyMove(this.game.cloneState(state), move);
        best = Math.min(best, this._minimax(next, depth - 1, alpha, beta, true));
        beta = Math.min(beta, best);
        if (beta <= alpha) break; // alpha cut-off
      }
      return best;
    }
  }

  /**
   * Score of a leaf node.
   *
   * With fastWin off this is just evaluate(). With it on, a decisive result is
   * pulled toward zero by the number of plies it took to reach, so among equally
   * winning lines the AI plays the quickest mate, and among lost ones it plays
   * the line that survives longest. Without this, every win is worth exactly
   * ±1000 and the AI happily postpones a mate it already has — which, in the
   * movement games, can run out the 120 half-move limit and draw.
   *
   * The discount is at most maxDepth (9), far below the ±1000 of a decisive
   * result, so it never makes a win look worse than a heuristic score.
   */
  _leafScore(state, result, depth) {
    const score = this.game.evaluate(state);
    if (!this.fastWin || !result.over || score === 0) return score;
    const plies = this.maxDepth - depth; // half-moves from the root to here
    return score > 0 ? score - plies : score + plies;
  }

  _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

/** Difficulty presets */
export const DIFFICULTY = {
  easy:   { depth: 1, label: 'Fácil',  icon: '🌱', randomize: true  },
  medium: { depth: 3, label: 'Médio',  icon: '⚡', randomize: true  },
  hard:   { depth: 9, label: 'Difícil', icon: '💀', randomize: false },
};
