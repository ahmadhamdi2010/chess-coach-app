'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  RotateCcw, 
  SkipForward, 
  ChevronLeft, 
  ChevronRight, 
  History,
  Target,
  CheckCircle,
  XCircle
} from 'lucide-react'

type Square =
  | 'a1' | 'a2' | 'a3' | 'a4' | 'a5' | 'a6' | 'a7' | 'a8'
  | 'b1' | 'b2' | 'b3' | 'b4' | 'b5' | 'b6' | 'b7' | 'b8'
  | 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6' | 'c7' | 'c8'
  | 'd1' | 'd2' | 'd3' | 'd4' | 'd5' | 'd6' | 'd7' | 'd8'
  | 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6' | 'e7' | 'e8'
  | 'f1' | 'f2' | 'f3' | 'f4' | 'f5' | 'f6' | 'f7' | 'f8'
  | 'g1' | 'g2' | 'g3' | 'g4' | 'g5' | 'g6' | 'g7' | 'g8'
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7' | 'h8';

interface Puzzle {
  id: string
  fen: string
  moves: string[]
  rating: number
  category: string
  side: 'white' | 'black'
  pgn?: string
  initialPly?: number
}

interface ChessPuzzleProps {
  onMoveComplete?: (puzzleId: string, fen: string, moveHistory: string[]) => void
  onPuzzleComplete?: (puzzleId: string, success: boolean) => void
}

export default function ChessPuzzle({ onMoveComplete, onPuzzleComplete }: ChessPuzzleProps) {
  const [game, setGame] = useState<Chess>(new Chess())
  const [puzzles, setPuzzles] = useState<Puzzle[]>([])
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0)
  const [solutionIndex, setSolutionIndex] = useState(0)
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [wrongMoves, setWrongMoves] = useState<string[]>([])
  const [isPuzzleComplete, setIsPuzzleComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attemptedPuzzleIds, setAttemptedPuzzleIds] = useState<Set<string>>(new Set())
  const [inferredUserSide, setInferredUserSide] = useState<'white' | 'black'>('white')
  const [lastMoveSquares, setLastMoveSquares] = useState<{ from: string, to: string } | null>(null)
  const [checkedKingSquare, setCheckedKingSquare] = useState<string | null>(null)

  // Fetch a random puzzle from Lichess API
  const fetchRandomPuzzle = useCallback(async (retryCount = 0) => {
    try {
      // Prevent infinite recursion
      if (retryCount > 5) {
        console.warn('Max retries reached for puzzle fetch')
        return null
      }

      const response = await fetch('https://lichess.org/api/puzzle/next')
      if (!response.ok) {
        throw new Error('Failed to fetch puzzle')
      }
      
      const puzzleData = await response.json()
      
      // Check if we've already attempted this puzzle
      const currentAttemptedIds = Array.from(attemptedPuzzleIds)
      if (currentAttemptedIds.includes(puzzleData.puzzle.id)) {
        // Try again to get a different puzzle
        return await fetchRandomPuzzle(retryCount + 1)
      }
      
      // Check if the response has the expected structure
      if (puzzleData?.puzzle?.solution && puzzleData?.game?.pgn) {
        // Parse the PGN to get the FEN position before the puzzle starts
        const pgn = puzzleData.game.pgn
        const moves = pgn.split(' ')
        
        // Create a chess instance to get the position before the puzzle
        const chess = new Chess()
        const puzzleStartPly = puzzleData.puzzle.initialPly || 0
        
        // Play moves up to and including puzzleStartPly - 1 to get to the puzzle starting position
        // puzzleStartPly represents the ply number of the first solution move, so we want the position after puzzleStartPly - 1 moves
        for (let i = 0; i < puzzleStartPly; i++) {
          if (moves[i] && moves[i] !== '') {
            chess.move(moves[i])
          }
        }
        
        const lichessPuzzle: Puzzle = {
          id: puzzleData.puzzle.id,
          fen: chess.fen(),
          moves: puzzleData.puzzle.solution,
          rating: puzzleData.puzzle.rating || 1500,
          category: puzzleData.puzzle.themes?.[0] || 'Tactics',
          side: puzzleStartPly % 2 === 0 ? 'white' : 'black',
          pgn: puzzleData.game.pgn, // Store the original PGN
          initialPly: puzzleData.puzzle.initialPly
        }
        
        console.log('Puzzle data:', {
          id: puzzleData.puzzle.id,
          initialPly: puzzleData.puzzle.initialPly,
          side: lichessPuzzle.side,
          solution: puzzleData.puzzle.solution,
          fen: lichessPuzzle.fen
        })
        
        // Additional debugging: verify the calculated FEN matches the PGN
        console.log('Verifying FEN calculation:')
        console.log('- PGN:', pgn)
        console.log('- Moves played:', moves.slice(0, puzzleStartPly))
        console.log('- Calculated FEN:', chess.fen())
        console.log('- Expected FEN from Lichess:', lichessPuzzle.fen)
        
        return lichessPuzzle
      }
      
      throw new Error('Invalid puzzle data structure')
    } catch (err) {
      console.warn('Failed to fetch random puzzle:', err)
      return null
    }
  }, [])

  // Fetch initial puzzles
  const fetchPuzzles = useCallback(async () => {
    try {
      console.log('Starting to fetch puzzles...')
      setIsLoading(true)
      setError(null)
      
      // Demo puzzles as fallback
      const demoPuzzles: Puzzle[] = [
        {
          id: 'demo-1',
          fen: 'r1bqkb1r/pp2pppp/2np1n2/6B1/3NP3/2N5/PPP2PPP/R2QKB1R b KQkq - 1 6',
          moves: ['d6d5', 'e4d5', 'f6d5'],
          rating: 1500,
          category: 'Fork',
          side: 'black',
          pgn: 'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 d6 O-O Be7 Nc3 O-O Be3 Be6 Qd2 Qd7 Ng5 Bg4 f3 Bh5 g4 Bg6 h4 h6 Nf3 d5 exd5 Nxd5 Nxd5 Qxd5',
          initialPly: 6
        },
        {
          id: 'demo-2',
          fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 4 4',
          moves: ['d2d4', 'e5d4', 'c4f7'],
          rating: 1200,
          category: 'Pin',
          side: 'white',
          pgn: 'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 d6 O-O Be7 Nc3 O-O Be3 Be6 Qd2 Qd7 Ng5 Bg4 f3 Bh5 g4 Bg6 h4 h6 Nf3 d5 exd5 Nxd5 Nxd5 Qxd5',
          initialPly: 4
        },
        {
          id: 'demo-3',
          fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
          moves: ['d2d4', 'e5d4', 'c2c3'],
          rating: 1300,
          category: 'Tactics',
          side: 'white',
          pgn: 'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 d6 O-O Be7 Nc3 O-O Be3 Be6 Qd2 Qd7 Ng5 Bg4 f3 Bh5 g4 Bg6 h4 h6 Nf3 d5 exd5 Nxd5 Nxd5 Qxd5',
          initialPly: 2
        }
      ]
      
      console.log('Attempting to fetch Lichess puzzle...')
      // Try to fetch just one puzzle from Lichess API first
      const lichessPuzzle = await fetchRandomPuzzle()
      
      if (lichessPuzzle) {
        console.log('Successfully fetched Lichess puzzle:', lichessPuzzle.id)
        setPuzzles([lichessPuzzle])
        setAttemptedPuzzleIds(new Set([lichessPuzzle.id]))
      } else {
        console.log('Falling back to demo puzzles')
        // Fallback to demo puzzles
        setPuzzles(demoPuzzles)
      }
    } catch (err) {
      console.error('Error in fetchPuzzles:', err)
      setError(err instanceof Error ? err.message : 'Failed to load puzzles')
    } finally {
      console.log('Setting loading to false')
      setIsLoading(false)
    }
  }, [fetchRandomPuzzle])

  // Get full PGN of the puzzle
  const getPuzzlePgn = useCallback(() => {
    if (!puzzles[currentPuzzleIndex]) return ''
    
    try {
      const chess = new Chess(puzzles[currentPuzzleIndex].fen)
      const moves = puzzles[currentPuzzleIndex].moves
      
      // Play all the solution moves
      for (const moveString of moves) {
        const from = moveString.slice(0, 2)
        const to = moveString.slice(2, 4)
        chess.move({ from, to, promotion: 'q' })
      }
      
      return chess.pgn()
    } catch (err) {
      console.warn('Failed to generate puzzle PGN:', err)
      return ''
    }
  }, [puzzles, currentPuzzleIndex])

  // Convert move string to PGN notation
  const moveToPgn = useCallback((moveString: string, gameInstance: Chess) => {
    try {
      // Parse the move string (e.g., "e2e4" -> from: "e2", to: "e4")
      const from = moveString.slice(0, 2)
      const to = moveString.slice(2, 4)
      
      // Create a temporary game to make the move and get PGN
      const tempGame = new Chess(gameInstance.fen())
      const move = tempGame.move({ from, to, promotion: 'q' })
      
      if (move) {
        return move.san // Standard Algebraic Notation (PGN format)
      }
      return moveString
    } catch (err) {
      console.warn('Failed to convert move to PGN:', err)
      return moveString
    }
  }, [])

  // Load a specific puzzle
  const loadPuzzle = useCallback((index: number, puzzleList?: Puzzle[]) => {
    const puzzleArray = puzzleList || puzzles
    if (index >= 0 && index < puzzleArray.length) {
      const puzzle = puzzleArray[index]
      // 1. Set up the board using PGN and initialPly
      const newGame = new Chess()
      let lastMove = null
      if (puzzle.pgn && puzzle.initialPly !== undefined) {
        newGame.loadPgn(puzzle.pgn)
        const allMoves = newGame.history()
        console.log('PGN moves:', allMoves)
        console.log('initialPly:', puzzle.initialPly)
        newGame.reset()
        let lastMoveIndex = -1;
        // Play moves up to and including initialPly (one more move)
        for (let i = 0; i <= puzzle.initialPly && i < allMoves.length; i++) {
          lastMove = allMoves[i]
          const moveResult = newGame.move(allMoves[i])
          lastMoveIndex = i;
          console.log(`Move ${i + 1}: ${allMoves[i]}, FEN: ${newGame.fen()}`)
        }
        // Highlight the last move played (at initialPly)
        if (lastMove && lastMoveIndex >= 0) {
          const tempGame = new Chess()
          tempGame.loadPgn(puzzle.pgn)
          const moveObj = tempGame.history({ verbose: true })[lastMoveIndex]
          if (moveObj) {
            setLastMoveSquares({ from: moveObj.from, to: moveObj.to })
          } else {
            setLastMoveSquares(null)
          }
        } else {
          setLastMoveSquares(null)
        }
        console.log('FEN after setup:', newGame.fen())
        console.log('Expected FEN from Lichess:', puzzle.fen)
        
        // Additional debugging: verify the calculated FEN matches the PGN
        console.log('Verifying FEN calculation in loadPuzzle:')
        console.log('- PGN:', puzzle.pgn)
        console.log('- Moves played:', allMoves.slice(0, puzzle.initialPly))
        console.log('- Calculated FEN:', newGame.fen())
        console.log('- Expected FEN from puzzle:', puzzle.fen)
      }
      // 2. Validate FEN (for debugging)
      if (puzzle.fen && newGame.fen() !== puzzle.fen) {
        console.warn('FEN mismatch after setup! Calculated:', newGame.fen(), 'Expected:', puzzle.fen)
      }
      // 3. Infer user side from the first solution move
      let userSide = 'white'
      if (puzzle.moves && puzzle.moves.length > 0) {
        const firstSolutionMove = puzzle.moves[0]
        const from = firstSolutionMove.slice(0, 2) as Square
        const piece = newGame.get(from)
        if (piece) {
          userSide = piece.color === 'w' ? 'white' : 'black'
        }
      }
      setGame(new Chess(newGame.fen()))
      setCurrentPuzzleIndex(index)
      setSolutionIndex(0)
      setMoveHistory([])
      setWrongMoves([])
      setIsPuzzleComplete(false)
      // Store userSide in a ref or state for use in UI and move validation
      setInferredUserSide(userSide as 'white' | 'black')
    }
  }, [puzzles])

  // Helper to find the king's square if in check
  const getCheckedKingSquare = (gameInstance: Chess) => {
    if (!gameInstance.inCheck()) return null;
    const board = gameInstance.board();
    const turn = gameInstance.turn(); // 'w' or 'b' (the side to move is in check)
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece && piece.type === 'k' && piece.color === turn) {
          // Convert to algebraic square
          const fileChar = String.fromCharCode('a'.charCodeAt(0) + file);
          const rankChar = (8 - rank).toString();
          return fileChar + rankChar;
        }
      }
    }
    return null;
  };

  // Update lastMoveSquares and checkedKingSquare after every move in onDrop
  const onDrop = useCallback((sourceSquare: string, targetSquare: string) => {
    if (isPuzzleComplete) return false
    const currentPuzzle = puzzles[currentPuzzleIndex]
    if (!currentPuzzle) return false
    if (game.turn() !== (inferredUserSide === 'white' ? 'w' : 'b')) return false
    const moveString = sourceSquare + targetSquare
    const expectedMove = currentPuzzle.moves[solutionIndex]
    if (moveString === expectedMove) {
      // Correct move
      const move = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
      setLastMoveSquares({ from: sourceSquare, to: targetSquare }) // highlight user move
      setCheckedKingSquare(getCheckedKingSquare(game));
      setMoveHistory(prev => [...prev, moveString])
      let newSolutionIdx = solutionIndex + 1
      // Auto-play opponent's move if exists
      if (newSolutionIdx < currentPuzzle.moves.length) {
        const opponentMove = currentPuzzle.moves[newSolutionIdx]
        const from = opponentMove.slice(0, 2)
        const to = opponentMove.slice(2, 4)
        try {
          game.move({ from, to, promotion: 'q' })
          setLastMoveSquares({ from, to }) // highlight opponent move
          setCheckedKingSquare(getCheckedKingSquare(game));
          newSolutionIdx++
        } catch (error) {
          console.error('Error auto-playing opponent move:', opponentMove, error)
        }
      }
      setSolutionIndex(newSolutionIdx)
      setGame(new Chess(game.fen()))
      if (newSolutionIdx >= currentPuzzle.moves.length) {
        setIsPuzzleComplete(true)
        onPuzzleComplete?.(currentPuzzle.id, true)
      }
      onMoveComplete?.(currentPuzzle.id, game.fen(), [...moveHistory, moveString])
      return true
    } else {
      // Wrong move
      setWrongMoves(prev => [...prev, moveString])
      setGame(new Chess(game.fen()))
      setCheckedKingSquare(getCheckedKingSquare(game));
      return false
    }
  }, [game, puzzles, currentPuzzleIndex, solutionIndex, moveHistory, isPuzzleComplete, onMoveComplete, onPuzzleComplete, inferredUserSide])

  // Also set checkedKingSquare on puzzle load
  useEffect(() => {
    setCheckedKingSquare(getCheckedKingSquare(game));
  }, [game])

  // Navigation functions
  const nextPuzzle = async () => {
    if (currentPuzzleIndex < puzzles.length - 1) {
      loadPuzzle(currentPuzzleIndex + 1)
    } else {
      // Fetch a new random puzzle
      setIsLoading(true)
      const newPuzzle = await fetchRandomPuzzle()
      if (newPuzzle) {
        const updatedPuzzles = [...puzzles, newPuzzle]
        setPuzzles(updatedPuzzles)
        setAttemptedPuzzleIds(prev => new Set([...prev, newPuzzle.id]))
        loadPuzzle(updatedPuzzles.length - 1, updatedPuzzles)
      }
      setIsLoading(false)
    }
  }

  const previousPuzzle = () => {
    if (currentPuzzleIndex > 0) {
      loadPuzzle(currentPuzzleIndex - 1)
    }
  }

  const resetPuzzle = () => {
    loadPuzzle(currentPuzzleIndex)
  }

  // Initialize puzzles on component mount - only run once
  useEffect(() => {
    console.log('ChessPuzzle component mounted, fetching puzzles...')
    fetchPuzzles()
  }, []) // Empty dependency array to run only once

  // Load first puzzle when puzzles are set
  useEffect(() => {
    console.log('useEffect triggered - puzzles.length:', puzzles.length, 'currentPuzzleIndex:', currentPuzzleIndex)
    if (puzzles.length > 0 && currentPuzzleIndex === 0) {
      console.log('Loading first puzzle:', puzzles[0].id)
      loadPuzzle(0)
    }
  }, [puzzles, currentPuzzleIndex, loadPuzzle])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Target className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading puzzles...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchPuzzles} className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const currentPuzzle = puzzles[currentPuzzleIndex]
  if (!currentPuzzle) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>No puzzles available</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Puzzle Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Puzzle #{currentPuzzle.id} ({currentPuzzle.rating})
            </h1>
            <p className="text-gray-600">
              You play as <span className="font-semibold">{inferredUserSide === 'white' ? 'White' : 'Black'}</span> - {currentPuzzle.category}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Current turn: {game.turn() === 'w' ? 'White' : 'Black'} | 
              Solution moves: {currentPuzzle.moves.length} | 
              Progress: {solutionIndex}/{currentPuzzle.moves.length}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetPuzzle}
              disabled={isPuzzleComplete}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={nextPuzzle}
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Skip
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6">
        {/* Side Panel - Left Side */}
        <div className="w-80 space-y-4">
          {/* Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={previousPuzzle}
                  disabled={currentPuzzleIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={nextPuzzle}
                  disabled={currentPuzzleIndex === puzzles.length - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {currentPuzzleIndex + 1} of {puzzles.length} puzzles
              </p>
            </CardContent>
          </Card>

          {/* Move History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Move History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Moves */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Your Moves:</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {moveHistory.length === 0 && wrongMoves.length === 0 ? (
                      <p className="text-gray-500 text-sm">No moves yet</p>
                    ) : (
                      <>
                        {/* Correct moves */}
                        {moveHistory.map((move, index) => (
                          <div key={`correct-${index}`} className="flex justify-between items-center p-2 bg-green-50 rounded">
                            <span className="text-sm font-medium">Move {index + 1}</span>
                            <span className="text-sm text-green-600 font-mono">{moveToPgn(move, game)}</span>
                          </div>
                        ))}
                        {/* Wrong moves */}
                        {wrongMoves.map((move, index) => (
                          <div key={`wrong-${index}`} className="flex justify-between items-center p-2 bg-red-50 rounded">
                            <span className="text-sm font-medium">Wrong</span>
                            <span className="text-sm text-red-600 font-mono">{moveToPgn(move, game)}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
                
                {/* Full Puzzle PGN */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Puzzle PGN:</h4>
                  <div className="bg-gray-50 p-3 rounded text-xs font-mono text-gray-600 max-h-24 overflow-y-auto">
                    {currentPuzzle.pgn || 'Loading...'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Puzzle Info */}
          <Card>
            <CardHeader>
              <CardTitle>Puzzle Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Rating:</span>
                  <span className="text-sm font-medium">{currentPuzzle.rating}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Category:</span>
                  <span className="text-sm font-medium">{currentPuzzle.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Side:</span>
                  <span className="text-sm font-medium capitalize">{inferredUserSide === 'white' ? 'White' : 'Black'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Progress:</span>
                  <span className="text-sm font-medium">
                    {solutionIndex}/{currentPuzzle.moves.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chess Board - Center */}
        <div className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Chess Board
              </CardTitle>
              <CardDescription>
                {isPuzzleComplete ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Puzzle Complete!
                  </span>
                ) : (
                  `Move ${solutionIndex + 1} of ${currentPuzzle.moves.length}`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-full flex items-center justify-center">
              <div className="w-full max-w-md">
                <Chessboard
                  position={game.fen()}
                  onPieceDrop={onDrop}
                  boardWidth={400}
                  boardOrientation={inferredUserSide}
                  customSquareStyles={{
                    ...(lastMoveSquares
                      ? {
                          [lastMoveSquares.from]: { background: 'rgba(255, 255, 0, 0.4)' },
                          [lastMoveSquares.to]: { background: 'rgba(255, 255, 0, 0.7)' }
                        }
                      : {}),
                    ...(checkedKingSquare
                      ? {
                          [checkedKingSquare]: { boxShadow: '0 0 20px 5px red inset', background: 'rgba(255,0,0,0.2)' }
                        }
                      : {})
                  }}
                />
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Debug: User plays {inferredUserSide === 'white' ? 'White' : 'Black'}, Board orientation: {inferredUserSide}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 