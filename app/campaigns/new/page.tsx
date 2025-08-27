"use client";

import type React from "react";
import { Suspense } from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { createCampaign, sendCampaign, linkFileToCampaign, fetchFiles, updateCampaign, getCurrentUser } from "@/services/api";
import { Switch } from "@/components/ui/switch";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";


function NewCampaignPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editCampaignId = searchParams.get("edit");
  const campaignDataParam = searchParams.get("data");
  const isEditMode = !!editCampaignId;
  
  // Parse campaign data from URL if in edit mode
  const initialCampaign = isEditMode && campaignDataParam ? 
    JSON.parse(decodeURIComponent(campaignDataParam)) : null;
  
  const [activeTab, setActiveTab] = useState("compose");
  const [selectedAudience, setSelectedAudience] = useState<string>(initialCampaign?.file_id?.toString() || "");
  const [campaignId, setCampaignId] = useState<number | null>(editCampaignId ? Number(editCampaignId) : null);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [savePopup, setSavePopup] = useState(false);
  const [sendPopup, setSendPopup] = useState<{ sent: number; failed: number } | null>(null);
  const [audienceFiles, setAudienceFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [campaign, setCampaign] = useState<any>(initialCampaign);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Add authentication check function
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.log('❌ [AUTH-CHECK] Auth check failed');
        return false;
      }
      
      const data = await response.json();
      console.log('🔍 [AUTH-CHECK] Auth check result:', data);
      
      if (!data.isLoggedIn) {
        console.log('❌ [AUTH-CHECK] User not logged in');
        return false;
      }
      
      console.log('✅ [AUTH-CHECK] User is authenticated');
      return true;
    } catch (error) {
      console.error('❌ [AUTH-CHECK] Auth check error:', error);
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check authentication first
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
          return;
        }

        // Load current user
        const user = await getCurrentUser();
        setCurrentUser(user);
        
        // Load files
        const files = await fetchFiles();
        setAudienceFiles(files);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoadingFiles(false);
      }
    };
    
    loadData();
  }, []);

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavePopup(false);  
    
    // Check authentication first
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      setSaving(false);
      return;
    }
    
    // Get form values
    const name = (document.getElementById("name") as HTMLInputElement)?.value;
    const subject = (document.getElementById("subject") as HTMLInputElement)?.value;
    const content = (document.getElementById("content") as HTMLTextAreaElement)?.value;

    if (!name || !subject || !content) {
      alert("Please fill in all required fields");
      setSaving(false);
      return;
    }

    try {
      if (isEditMode && campaignId) {
        // Update existing campaign
        await updateCampaign(campaignId, {
          name,
          subject,
          description: content,
        });
      } else {
        // Create new campaign
        if (!currentUser) {
          throw new Error("User not authenticated. Please log in again.");
        }
        
        const newCampaign = await createCampaign({
          name,
          subject,
          description: content,
          created_by: currentUser, // Use actual logged-in user
        });
        
        // Set the new campaign ID immediately
        const newCampaignId = newCampaign.id;
        setCampaignId(newCampaignId);
        
        // Link file to the newly created campaign
        if (selectedAudience) {
          await linkFileToCampaign(Number(selectedAudience), newCampaignId);
        }
      }

      // Link file to campaign if selected (for edit mode)
      if (selectedAudience && isEditMode && campaignId) {
        await linkFileToCampaign(Number(selectedAudience), campaignId);
      }

      setSavePopup(true);
      setHasUnsavedChanges(false);
      setTimeout(() => setSavePopup(false), 3000);
    } catch (error: any) {
      console.error("Failed to save campaign:", error);
      
      // Provide more specific error messages
      if (error.message?.includes('401') || error.message?.includes('Authentication')) {
        console.log("🔍 [CAMPAIGN-SAVE] Authentication error detected");
        alert("Authentication failed. Please log in again. The backend session check works but protected endpoints are not recognizing the session.");
      } else if (error.message?.includes('403')) {
        alert("Access denied. You don't have permission to create campaigns.");
      } else if (error.message?.includes('500')) {
        alert("Server error. Please try again later.");
      } else {
        alert(`Failed to save campaign: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!campaignId) {
      alert("Please save the campaign first");
      return;
    }

    if (!selectedAudience) {
      alert("Please select an audience before sending the campaign");
      return;
    }

    // Check authentication first
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      return;
    }

    setSending(true);
    try {
      // Link file to campaign before sending (only if not already linked)
      try {
        await linkFileToCampaign(Number(selectedAudience), campaignId);
      } catch (linkError) {
        // If linking fails, it might already be linked, continue with sending
        console.log("File linking failed, might already be linked:", linkError);
      }
      
      const result = await sendCampaign(campaignId);
      setSendPopup(result);
      setRedirectCountdown(3);
      
      // Start countdown and redirect after 3 seconds
      const countdownInterval = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setSendPopup(null);
            router.push("/campaigns");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      console.error("Failed to send campaign:", error);
      
      // Show specific error message based on the error
      if (error.message?.includes('verification_required')) {
        alert("Your email address is not verified for sending. Please verify your email address first.");
      } else if (error.message?.includes('No file associated')) {
        alert("No file is associated with this campaign. Please select an audience first.");
      } else if (error.message?.includes('No subscribers found')) {
        alert("No subscribers found in the CSV file. Please check your file format.");
      } else {
        alert(`Failed to send campaign: ${error.message || 'Please try again.'}`);
      }
    } finally {
      setSending(false);
    }
  };

  const handleAIGeneration = async () => {
    if (!aiDescription.trim()) {
      alert("Please describe what kind of email you want to create");
      return;
    }

    setAiGenerating(true);
    try {
      const nameInput = document.getElementById("name") as HTMLInputElement;
      const subjectInput = document.getElementById("subject") as HTMLInputElement;
      const contentTextarea = document.getElementById("content") as HTMLTextAreaElement;
      
      if (!nameInput || !subjectInput || !contentTextarea) {
        throw new Error("Form elements not found");
      }

      const response = await fetch(`/api/ai/generate-intro-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_name: nameInput.value || "New Campaign",
          campaign_description: aiDescription
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate email');
      }

      const data = await response.json();
      if (data.generated_email) {
        contentTextarea.value = data.generated_email;
        setHasUnsavedChanges(true);
        // Trigger change event to update React state
        contentTextarea.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        throw new Error('No email content received');
      }
    } catch (error) {
      console.error('Error generating AI email:', error);
      alert('Failed to generate AI email. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/campaigns">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                {isEditMode ? "Edit Campaign" : "Create New Campaign"}
              </h1>
              <p className="text-gray-600 mt-2">
                {isEditMode ? "Edit your email campaign before sending" : "Create a new email campaign to send to your subscribers"}
              </p>
            </div>
          </div>
        </div>

        {/* Campaign Form */}
        <Card className="rounded-2xl shadow-sm border border-gray-200 bg-white">
          <CardHeader className="px-6 py-4">
            <CardTitle className="text-gray-900 text-lg">Campaign Details</CardTitle>
            <CardDescription className="text-gray-600 text-sm">
              {isEditMode ? "Edit your email campaign before sending" : "Create a new email campaign to send to your subscribers"}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-4">
            <form onSubmit={handleSave}>
              <div className="space-y-4">
                {/* Campaign Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-900">Campaign Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter campaign name" 
                    defaultValue={campaign?.name || ""}
                    onChange={() => setHasUnsavedChanges(true)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10"
                  />
                </div>

                {/* Email Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium text-gray-900">Email Subject</Label>
                  <Input 
                    id="subject" 
                    placeholder="Enter email subject" 
                    defaultValue={campaign?.subject || ""}
                    onChange={() => setHasUnsavedChanges(true)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10"
                  />
                </div>

                {/* Select Audience */}
                <div className="space-y-2">
                  <Label htmlFor="audience" className="text-sm font-medium text-gray-900">Select Audience</Label>
                  {loadingFiles && (
                    <div className="text-gray-600 text-sm">Loading files...</div>
                  )}
                  {!loadingFiles && audienceFiles.length === 0 && (
                    <div className="text-gray-600 text-sm">No files found. Please upload a subscriber file first.</div>
                  )}
                                      <Select
                      value={selectedAudience}
                      onValueChange={async (value) => {
                        if (value === "add-new") {
                          router.push("/subscribers");
                        } else {
                          setSelectedAudience(value);
                          setHasUnsavedChanges(true);
                          
                          // Only link file if campaign already exists (edit mode)
                          if (campaignId && value && isEditMode) {
                            try {
                              await linkFileToCampaign(Number(value), campaignId);
                            } catch (error) {
                              console.error("Failed to link file:", error);
                              // Don't show error to user as this is background operation
                            }
                          }
                        }
                      }}
                    >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10">
                      <SelectValue placeholder="Select an uploaded CSV file" />
                    </SelectTrigger>
                    <SelectContent>
                      {audienceFiles.map((file) => (
                        <SelectItem key={file.id} value={file.id.toString()}>
                          {file.filename}
                        </SelectItem>
                      ))}
                      <Separator className="my-1" />
                      <SelectItem value="add-new" className="font-semibold">
                        + Add new subscribers
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Email Content Tabs */}
                <div className="space-y-4">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
                      <TabsTrigger 
                        value="compose" 
                        className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                      >
                        Compose
                      </TabsTrigger>
                      <TabsTrigger 
                        value="preview"
                        className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                      >
                        Preview
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="compose" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="content" className="text-sm font-medium text-gray-900">Email Content</Label>
                        <Textarea
                          id="content"
                          placeholder="Compose your email content here..."
                          className="min-h-[200px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none w-full text-sm leading-relaxed"
                          defaultValue={campaign?.description || `Hello {{first_name}},\n\nWe're excited to share our latest updates with you.\n\nBest regards,\nThe Team`}
                          onChange={() => setHasUnsavedChanges(true)}
                        />
                      </div>
                      
                      {/* AI Assistance */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            id="ai-toggle"
                            checked={aiEnabled}
                            onCheckedChange={(checked) => {
                              setAiEnabled(checked);
                              if (!checked) setAiDescription("");
                            }}
                          />
                          <Label htmlFor="ai-toggle" className="text-sm font-medium text-gray-900 cursor-pointer">
                            Use AI Assistance
                          </Label>
                        </div>
                        
                        {aiEnabled && (
                          <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <Label htmlFor="ai-prompt" className="text-sm font-medium text-gray-900">
                              Describe the campaign for AI
                            </Label>
                            <Textarea
                              id="ai-prompt"
                              value={aiDescription}
                              onChange={e => setAiDescription(e.target.value)}
                              placeholder="Describe what kind of email you want to create..."
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[80px]"
                            />
                            <Button
                              type="button"
                              onClick={handleAIGeneration}
                              disabled={aiGenerating}
                              className="bg-blue-600 text-white hover:bg-blue-700 h-8 px-3 text-sm disabled:opacity-50"
                            >
                              {aiGenerating ? "Generating..." : "Generate with AI"}
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                        <p className="font-medium mb-1">Personalization Tips:</p>
                        <p>Use {"{{ first_name }}"}, {"{{ last_name }}"}, etc. for personalization.</p>
                        {aiEnabled && (
                          <p className="text-xs mt-1">
                            You can generate a Jinja-templatized intro email using AI above.
                          </p>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="preview" className="space-y-4">
                      <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="mb-4 border-b border-gray-200 pb-3">
                          <p className="text-sm text-gray-600">
                            To: john.doe@example.com
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            Subject: [Your Email Subject]
                          </p>
                        </div>
                        <div className="prose max-w-none text-gray-900">
                          <p>Hello John,</p>
                          <p>
                            We're excited to share our latest updates with you.
                          </p>
                          <p>
                            Best regards,<br />
                            The Team
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 mt-4">
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 order-3 sm:order-1 h-10 px-4"
                    asChild
                  >
                    <Link href="/campaigns">Cancel</Link>
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 order-1 sm:order-2 h-10 px-4"
                  >
                    {saving ? "Saving..." : isEditMode ? (hasUnsavedChanges ? "Save Changes*" : "Saved") : "Save Campaign"}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSend}
                    disabled={!campaignId || sending}
                    className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 order-2 sm:order-3 h-10 px-4"
                  >
                    {sending ? "Sending emails..." : "Send Campaign"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Success/Error Popups */}
        {savePopup && (
          <div className="fixed top-8 right-8 bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
            <CheckCircle className="h-5 w-5" />
            {isEditMode ? "Campaign updated successfully" : "Campaign saved successfully"}
            <button className="ml-2 text-green-800 hover:text-green-900" onClick={() => setSavePopup(false)}>&times;</button>
          </div>
        )}
        
        {sendPopup && (
          <div className="fixed top-20 right-8 bg-white border border-gray-200 px-4 py-3 rounded-lg shadow-lg flex flex-col gap-2 z-50 min-w-64">
            <div className="flex items-center justify-between">
              <span className="text-green-700 font-medium">Campaign Sent Successfully!</span>
              <button className="text-gray-700 hover:text-gray-900" onClick={() => setSendPopup(null)}>&times;</button>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-green-700">
                <CheckCircle className="h-4 w-4" />
                {sendPopup.sent} sent
              </span>
              {sendPopup.failed > 0 && (
                <span className="flex items-center gap-1 text-red-700">
                  <XCircle className="h-4 w-4" />
                  {sendPopup.failed} failed
                </span>
              )}
            </div>
            <div className="text-xs text-gray-600">
              Redirecting to campaigns page in {redirectCountdown} seconds...
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function NewCampaignPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewCampaignPageContent />
    </Suspense>
  );
}
