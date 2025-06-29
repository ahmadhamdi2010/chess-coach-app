import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log the puzzle data (you can replace this with your actual webhook logic)
    console.log('Puzzle webhook data received:', {
      puzzleId: body.puzzleId,
      fen: body.fen,
      moveHistory: body.moveHistory,
      userId: body.userId,
      timestamp: body.timestamp
    })
    
    // Here you can:
    // 1. Send data to your external webhook
    // 2. Store data in your database
    // 3. Trigger AI analysis
    // 4. Send notifications
    
    // Example: Send to external webhook
    // const response = await fetch('YOUR_WEBHOOK_URL', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(body)
    // })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Puzzle data received successfully' 
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process webhook' },
      { status: 500 }
    )
  }
} 