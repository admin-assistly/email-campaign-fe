"use client";
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
  BarChart3,
  ChevronRight,
  Mail,
  MessageSquare,
  Plus,
  Users,
  MoreHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { fetchCampaigns, deleteCampaign } from "@/services/api";
import { useMetrics } from "@/hooks/useMetrics";
import { AppShell } from "@/components/layout/AppShell";

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { metrics } = useMetrics();

  // Add authentication check function
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        // Redirect to login if not authenticated
        window.location.href = '/login';
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      window.location.href = '/login';
      return false;
    }
  };

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        // Check authentication first
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
          return;
        }

        const campaignsData = await fetchCampaigns();
        setCampaigns(campaignsData);
      } catch (error) {
        console.error('Failed to load campaigns:', error);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Email Campaigns
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and track your email campaigns
            </p>
          </div>
          <Button className="bg-blue-600 text-white hover:bg-blue-700" asChild>
            <Link href="/campaigns/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Link>
          </Button>
        </div>

        <Card className="rounded-2xl shadow-sm border border-gray-200 bg-white">
          <CardHeader className="px-6 py-4">
            <CardTitle className="text-gray-900">All Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent Date</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Positive Responses</TableHead>
                  <TableHead>Negative Responses</TableHead>
                  <TableHead>Deferred Responses</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8}>Loading...</TableCell>
                  </TableRow>
                ) : campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8}>No campaigns found.</TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium cursor-pointer text-blue-600 hover:underline" onClick={() => router.push(`/responses?campaignId=${campaign.id}`)}>
                        {campaign.name}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          campaign.recipients > 0 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {campaign.recipients > 0 ? "Sent" : "Draft"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {campaign.created_at ? new Date(campaign.created_at).toLocaleString() : "-"}
                      </TableCell>
                      <TableCell>{campaign.recipients?.toLocaleString?.() || "-"}</TableCell>
                      <TableCell>
                        {(() => {
                          const campaignMetrics = metrics?.campaigns?.find((c: any) => c.id === campaign.id);
                          return campaignMetrics?.interested || 0;
                        })()}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const campaignMetrics = metrics?.campaigns?.find((c: any) => c.id === campaign.id);
                          return campaignMetrics?.not_interested || 0;
                        })()}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const campaignMetrics = metrics?.campaigns?.find((c: any) => c.id === campaign.id);
                          return campaignMetrics?.interested_later || 0;
                        })()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/responses?campaignId=${campaign.id}`)}>
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                const campaignData = {
                                  id: campaign.id,
                                  name: campaign.name,
                                  subject: campaign.subject,
                                  description: campaign.description,
                                  file_id: campaign.file_id,
                                  filename: campaign.filename
                                };
                                router.push(`/campaigns/new?edit=${campaign.id}&data=${encodeURIComponent(JSON.stringify(campaignData))}`);
                              }}
                              disabled={campaign.recipients > 0}
                              className={campaign.recipients > 0 ? "text-gray-400 cursor-not-allowed" : ""}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={async () => {
                                if (!window.confirm("Are you sure you want to delete this campaign?")) return;
                                try {
                                  await deleteCampaign(campaign.id);
                                  setCampaigns((prev) => prev.filter((c) => c.id !== campaign.id));
                                } catch (err) {
                                  alert("Failed to delete campaign");
                                }
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
