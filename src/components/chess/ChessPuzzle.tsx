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

interface Puzzle {
  id: string
  fen: string
  moves: string[]
  rating: number
  category: string
  side: 'white' | 'black'
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
  const [isPuzzleComplete, setIsPuzzleComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attemptedPuzzleIds, setAttemptedPuzzleIds] = useState<Set<string>>(new Set())

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
      
      // Check if we've already attempted this puzzle - use current state
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
        
        // Play moves up to the puzzle start position
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
          side: puzzleStartPly % 2 === 0 ? 'white' : 'black'
        }
        
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
          side: 'black'
        },
        {
          id: 'demo-2',
          fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 4 4',
          moves: ['d2d4', 'e5d4', 'c4f7'],
          rating: 1200,
          category: 'Pin',
          side: 'white'
        },
        {
          id: 'demo-3',
          fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
          moves: ['d2d4', 'e5d4', 'c2c3'],
          rating: 1300,
          category: 'Tactics',
          side: 'white'
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

  // Load a specific puzzle
  const loadPuzzle = useCallback((index: number, puzzleList?: Puzzle[]) => {
    const puzzleArray = puzzleList || puzzles
    if (index >= 0 && index < puzzleArray.length) {
      const puzzle = puzzleArray[index]
      console.log('Loading puzzle:', puzzle.id, 'with FEN:', puzzle.fen)
      const newGame = new Chess(puzzle.fen)
      console.log('New game FEN:', newGame.fen())
      setGame(newGame)
      setCurrentPuzzleIndex(index)
      setSolutionIndex(0)
      setMoveHistory([])
      setIsPuzzleComplete(false)
    }
  }, [puzzles])

  // Handle piece movement
  const onDrop = useCallback((sourceSquare: string, targetSquare: string) => {
    if (isPuzzleComplete) return false

    const currentPuzzle = puzzles[currentPuzzleIndex]
    if (!currentPuzzle) return false

    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // Always promote to queen for simplicity
    })

    if (move === null) return false

    setGame(new Chess(game.fen()))
    
    const moveString = sourceSquare + targetSquare
    const expectedMove = currentPuzzle.moves[solutionIndex]
    
    if (moveString === expectedMove) {
      // Correct move
      setMoveHistory(prev => [...prev, moveString])
      setSolutionIndex(prev => prev + 1)
      
      // Check if puzzle is complete
      if (solutionIndex + 1 >= currentPuzzle.moves.length) {
        setIsPuzzleComplete(true)
        onPuzzleComplete?.(currentPuzzle.id, true)
      }
      
      onMoveComplete?.(currentPuzzle.id, game.fen(), [...moveHistory, moveString])
      return true
    } else {
      // Incorrect move - reset the piece
      setGame(new Chess(game.fen()))
      return false
    }
  }, [game, puzzles, currentPuzzleIndex, solutionIndex, moveHistory, isPuzzleComplete, onMoveComplete, onPuzzleComplete])

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
              {currentPuzzle.side === 'white' ? 'White' : 'Black'} to move - {currentPuzzle.category}
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
        {/* Chess Board */}
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
                  customBoardStyle={{
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
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
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {moveHistory.length === 0 ? (
                  <p className="text-gray-500 text-sm">No moves yet</p>
                ) : (
                  moveHistory.map((move, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span className="text-sm font-medium">Move {index + 1}</span>
                      <span className="text-sm text-green-600">{move}</span>
                    </div>
                  ))
                )}
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
                  <span className="text-sm font-medium capitalize">{currentPuzzle.side}</span>
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
      </div>
    </div>
  )
} 