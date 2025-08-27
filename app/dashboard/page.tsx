"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  BarChart3,
  Mail,
  MessageSquare,
  Plus,
  Users,
  TrendingUp,
  TrendingDown,
  Reply,
} from "lucide-react";
import { useEffect, useState } from "react";
import { fetchCampaigns, fetchResponses } from "@/services/api";
import { useMetrics } from "@/hooks/useMetrics";
import { AppShell } from "@/components/layout/AppShell";
import EmailConnection from "@/components/EmailConnection";

export default function Dashboard() {
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);
  const [recentResponses, setRecentResponses] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingResponses, setLoadingResponses] = useState(true);
  const [emailStatus, setEmailStatus] = useState<any>(null);
  const { metrics, loading: metricsLoading } = useMetrics();

  useEffect(() => {
    // Check email status
    const checkEmailStatus = async () => {
      try {
        const response = await fetch('/api/email-accounts/status', {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
          setEmailStatus(data.data);
        }
      } catch (error) {
        console.error('Error checking email status:', error);
      }
    };

    checkEmailStatus();
    
    fetchCampaigns()
      .then((data) => {
        setCampaigns(data);
        setRecentCampaigns(data.slice(0, 3));
      })
      .catch(() => {
        setCampaigns([]);
        setRecentCampaigns([]);
      })
      .finally(() => setLoading(false));
    fetchResponses()
      .then((data) => setRecentResponses(data.slice(0, 3)))
      .catch(() => setRecentResponses([]))
      .finally(() => setLoadingResponses(false));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Overview of your email campaigns and responses
            </p>
          </div>
          <Button className="bg-blue-600 text-white hover:bg-blue-700" asChild>
            <Link href="/campaigns/new">
              <Plus className="mr-2 h-4 w-4" />
              Create New Campaign
            </Link>
          </Button>
        </div>

        {/* Email Connection Status */}
        <EmailConnection />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl shadow-sm border border-gray-200 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">
                Total Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{loading ? "-" : campaigns.length}</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm border border-gray-200 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-900">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Interested Responses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {metricsLoading ? "-" : metrics?.classifications?.interested || 0}
              </div>
              <p className="text-xs text-gray-600">
                AI classified positive responses
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm border border-gray-200 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-900">
                <TrendingDown className="h-4 w-4 text-blue-600" />
                Not Interested
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {metricsLoading ? "-" : metrics?.classifications?.not_interested || 0}
              </div>
              <p className="text-xs text-gray-600">
                AI classified negative responses
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm border border-gray-200 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-900">
                <Reply className="h-4 w-4 text-blue-600" />
                Interested Later
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {metricsLoading ? "-" : metrics?.classifications?.interested_later || 0}
              </div>
              <p className="text-xs text-gray-600">
                AI classified deferred responses
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card className="rounded-2xl shadow-sm border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Recent Campaigns</CardTitle>
              <CardDescription className="text-gray-600">
                Your most recent email campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-gray-600">Loading...</div>
                ) : recentCampaigns.length === 0 ? (
                  <div className="text-gray-600">No campaigns found.</div>
                ) : (
                  recentCampaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{campaign.name}</p>
                        <p className="text-sm text-gray-600">
                          {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : ""}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">
                        &nbsp;
                      </p>
                    </div>
                  ))
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 w-full text-gray-600 hover:text-gray-900"
                asChild
              >
                <Link href="/campaigns">
                  View all campaigns
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Recent Responses</CardTitle>
              <CardDescription className="text-gray-600">
                Latest responses to your campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loadingResponses ? (
                  <div className="text-gray-600">Loading...</div>
                ) : recentResponses.length === 0 ? (
                  <div className="text-gray-600">No responses found.</div>
                ) : (
                  recentResponses.map((response) => (
                    <div
                      key={response.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{response.name || response.recipient_email}</p>
                        <p className="text-sm text-gray-600">
                          Re: {response.subject || response.campaign_id || "-"}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">
                        {response.created_at ? new Date(response.created_at).toLocaleString() : "-"}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 w-full text-gray-600 hover:text-gray-900"
                asChild
              >
                <Link href="/responses">
                  View all responses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
      </AppShell>
  );
} 