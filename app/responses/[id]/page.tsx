"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  RefreshCw,
  Send,
  Wand2,
} from "lucide-react";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { AppShell } from "@/components/layout/AppShell";
import { fetchResponseById, createResponse, fetchEmailById, getCurrentUser } from "@/services/api";

// Define a Response type for clarity

interface Response {
  id: number;
  email_id: number;
  parent_response_id: number | null;
  responder_email: string;
  body: string;
  created_at: string;
  children: Response[];  
  message_id?: string;
  in_reply_to?: string | null;
}

function ResponseThread({ response, onReply, replyTo, onSubmit, onCancel, loading }: { 
  response: Response; 
  onReply: (r: Response) => void;
  replyTo: Response | null;
  onSubmit: (body: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const isReplying = replyTo?.id === response.id;
  
  return (
    <div style={{ marginLeft: response.parent_response_id ? 20 : 0, borderLeft: response.parent_response_id ? '2px solid #eee' : 'none', paddingLeft: 10, marginBottom: 12 }}>
      <div>
        <strong style={{ color: response.responder_email?.endsWith('@charterglobal.com') ? 'blue' : 'black' }}>
          {response.responder_email?.endsWith('@charterglobal.com') ? 'Admin' : response.responder_email}
        </strong>
        <span style={{ color: '#888', marginLeft: 8 }}>{response.created_at ? new Date(response.created_at).toLocaleString() : ''}</span>
      </div>
      <div style={{ marginBottom: 8 }} dangerouslySetInnerHTML={{ __html: response.body }} />
      
      {!isReplying && (
        <Button size="sm" variant="outline" onClick={() => onReply(response)}>
          Reply
        </Button>
      )}
      
      {isReplying && (
        <ReplyForm
          parentResponse={response}
          onSubmit={onSubmit}
          onCancel={onCancel}
          loading={loading}
        />
      )}
      
      {response.children && response.children.length > 0 && (
        <div>
          {response.children.map((child: Response) => (
            <ResponseThread 
              key={child.id} 
              response={child} 
              onReply={onReply}
              replyTo={replyTo}
              onSubmit={onSubmit}
              onCancel={onCancel}
              loading={loading}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReplyForm({ parentResponse, onSubmit, onCancel, loading }: {
  parentResponse: Response;
  onSubmit: (body: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [body, setBody] = useState("");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);

  const generateAIReply = async () => {
    // No validation needed since context is optional for threaded replies

    setAiGenerating(true);
    try {
      // Use the threaded reply API from your backend
      const response = await fetch('/api/ai/generate-threaded-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_id: parentResponse.email_id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate reply');
      }

      const data = await response.json();
      if (data.generated_email) {
        setBody(data.generated_email);
      } else {
        throw new Error('No reply content received');
      }
    } catch (error) {
      console.error("Error generating AI response:", error);
      alert("Failed to generate AI response. Please try again.");
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-muted/30">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Switch
            id="ai-toggle"
            checked={aiEnabled}
            onCheckedChange={(checked) => {
              setAiEnabled(checked);
              if (!checked) setAiDescription("");
            }}
          />
          <Label htmlFor="ai-toggle" className="text-sm font-medium cursor-pointer">
            Use AI Assistance
          </Label>
        </div>

        {aiEnabled && (
          <div className="space-y-2 animate-in fade-in duration-200">
            <Label htmlFor="ai-prompt" className="text-sm font-medium">
              Additional Context (Optional)
            </Label>
            <Textarea
              id="ai-prompt"
              value={aiDescription}
              onChange={e => setAiDescription(e.target.value)}
              placeholder="Add any additional context or specific instructions for the AI (optional)..."
              className="min-h-[80px]"
            />
            <Button
              type="button"
              size="sm"
              onClick={generateAIReply}
              disabled={aiGenerating}
              className="self-start"
            >
              {aiGenerating ? "Generating..." : "Generate with AI"}
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="reply-body" className="text-sm font-medium">
            Your Reply
          </Label>
          <Textarea
            id="reply-body"
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={4}
            placeholder="Write your reply here..."
            className="min-h-[120px]"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => onSubmit(body)} 
            disabled={loading || !body.trim()}
            size="sm"
          >
            {loading ? "Sending..." : "Send Reply"}
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel} 
            disabled={loading}
            size="sm"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ResponseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const responseId = params.id as string;
  const [thread, setThread] = useState<Response | null>(null);
  const [replyTo, setReplyTo] = useState<Response | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [replyLoading, setReplyLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load current user
        const user = await getCurrentUser();
        setCurrentUser(user);
        
        // Load response thread
        const data = await fetchResponseById(responseId);
        setThread(data);
      } catch (err) {
        setError("Failed to load thread");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [responseId]);
console.log("responseId", responseId);
  console.log("thread", thread);

  const handleReply = (response: Response) => setReplyTo(response);

  const handleSendReply = async (body: string) => {
    setReplyLoading(true);
    setError("");
    try {
      // Get the original email details for sending the reply
      const originalEmail = thread?.email_id ? await fetchEmailById(thread.email_id).catch(() => null) : null;
      
              if (!currentUser) {
          throw new Error("User not authenticated. Please log in again.");
        }
        
        await createResponse({
          email_id: replyTo?.email_id || 0,
          parent_response_id: replyTo?.id,
          responder_email: currentUser,
        body,
        subject: originalEmail?.subject ? `Re: ${originalEmail.subject}` : 'Re: Campaign Response',
        recipient_email: originalEmail?.recipient_email || undefined,
        message_id: `<web-reply-${Date.now()}@charterglobal.com>`,
        in_reply_to: replyTo?.message_id || undefined
      });
      
      setReplyTo(null);
      // Refresh the thread data
      const updatedThread = await fetchResponseById(responseId);
      setThread(updatedThread);
    } catch (e) {
      setError('Failed to send reply. Please try again.');
    }
    setReplyLoading(false);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/responses">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Response Thread
            </h1>
            <p className="text-gray-600 mt-2">
              View and respond to campaign responses
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-gray-600">Loading...</div>
        ) : error ? (
          <div className="text-red-600 bg-red-50 border border-red-200 p-4 rounded-lg">{error}</div>
        ) : thread ? (
          <Card className="rounded-2xl shadow-sm border border-gray-200 bg-white">
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-gray-900">Conversation</CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <ResponseThread 
                response={thread} 
                onReply={handleReply}
                replyTo={replyTo}
                onSubmit={handleSendReply}
                onCancel={() => setReplyTo(null)}
                loading={replyLoading}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="text-gray-600 bg-gray-50 border border-gray-200 p-4 rounded-lg">No thread found.</div>
        )}
      </div>
    </AppShell>
  );
}
