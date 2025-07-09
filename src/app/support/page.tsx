import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SupportPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>Support</CardTitle>
          <CardDescription>
            How can we help you?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">If you have any questions, feedback, or need assistance, please contact us at <a href="mailto:support@chesscoach.com" className="text-blue-600 underline">support@chesscoach.com</a>.</p>
          <p>We&apos;re here to help you get the most out of ChessCoach!</p>
        </CardContent>
      </Card>
    </div>
  );
} 