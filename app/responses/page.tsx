"use client";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchResponses, fetchCampaigns } from "@/services/api";
import { AppShell } from "@/components/layout/AppShell";

// Updated interface for conversation threads
interface ConversationThread {
  email_id: number;
  campaign_id: number;
  campaign_name: string;
  subject: string;
  recipient_email: string;
  total_responses: number;
  latest_response_time: string;
  root_response_id: number;
  latest_response_id: number;
  conversation: Response[];
}

interface Response {
  id: number;
  parent_response_id: number | null;
  created_at: string;
  responder_email: string;
  body: string;
  message_id: string;
  in_reply_to: string | null;
  status: string;
  children: number[];
}

function ResponsesPageContent() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchResponses(),
      fetchCampaigns(),
    ])
      .then(([threadsData, campaignsData]) => {
        setThreads(threadsData);
        setCampaigns(campaignsData);
      })
      .catch(() => {
        setThreads([]);
        setCampaigns([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter threads by campaignId if present
  const filteredThreads = campaignId
    ? threads.filter((t) => String(t.campaign_id) === String(campaignId))
    : threads;

  // Get the latest response for display in the table
  const getLatestResponse = (thread: ConversationThread) => {
    if (!thread.conversation || thread.conversation.length === 0) return null;
    return thread.conversation[thread.conversation.length - 1];
  };

  // Get preview of conversation
  const getConversationPreview = (thread: ConversationThread) => {
    if (!thread.conversation || thread.conversation.length === 0) return "No responses";
    
    const latest = thread.conversation[thread.conversation.length - 1];
    const preview = latest.body.replace(/<[^>]*>/g, '').substring(0, 100);
    return preview + (preview.length === 100 ? '...' : '');
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
            Campaign Responses
          </h1>
          <p className="text-gray-600 mt-2">
            View and manage responses to your email campaigns
          </p>
        </div>

        <Card className="rounded-2xl shadow-sm border border-gray-200 bg-white">
          <CardHeader className="px-6 py-4">
            <CardTitle className="text-gray-900">All Responses</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Conversation</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7}>Loading...</TableCell>
                  </TableRow>
                ) : filteredThreads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>No responses found.</TableCell>
                  </TableRow>
                ) : (
                  filteredThreads.map((thread) => {
                    const latestResponse = getLatestResponse(thread);
                    if (!latestResponse) return null;
                    
                    return (
                      <TableRow key={thread.email_id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{thread.recipient_email || "-"}</p>
                            <p className="text-sm text-gray-600">
                              {latestResponse.responder_email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900">{thread.campaign_name || "-"}</TableCell>
                        <TableCell className="max-w-[300px] truncate text-gray-900">
                          {thread.subject || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-gray-900">
                              {thread.total_responses} response{thread.total_responses !== 1 ? 's' : ''}
                            </span>
                            <div className="text-xs text-gray-600 max-w-[200px] truncate">
                              {getConversationPreview(thread)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900">
                          {latestResponse.created_at ? 
                            new Date(latestResponse.created_at).toLocaleString() : "-"
                          }
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                            {latestResponse.status || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/responses/${thread.root_response_id}`}>
                              <ChevronRight className="h-4 w-4" />
                              <span className="sr-only">View conversation</span>
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

export default function ResponsesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResponsesPageContent />
    </Suspense>
  );
}