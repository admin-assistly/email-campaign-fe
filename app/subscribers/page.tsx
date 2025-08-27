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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MoreHorizontal,
  PlusCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRef, useState, useEffect } from "react";
import { fetchFiles, uploadFile, fetchCampaignFiles, fetchCampaigns, fetchPresignedUrl } from "@/services/api";
import { AppShell } from "@/components/layout/AppShell";

function SubscribersPageContent() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [campaignMap, setCampaignMap] = useState<{ [fileId: number]: { id: number, name: string }[] }>({});
  const [rowCounts, setRowCounts] = useState<{ [fileId: number]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [filesData, campaignFiles, campaigns] = await Promise.all([
          fetchFiles(),
          fetchCampaignFiles(),
          fetchCampaigns(),
        ]);
        console.log('Fetched files:', filesData);
        setFiles(filesData);
        // Map campaign_id to campaign name
        const campaignIdToName: { [id: number]: string } = {};
        campaigns.forEach((c: any) => {
          campaignIdToName[c.id] = c.name;
        });
        // Map file_id to campaigns
        const fileIdToCampaigns: { [fileId: number]: { id: number, name: string }[] } = {};
        campaignFiles.forEach((cf: any) => {
          if (!fileIdToCampaigns[cf.file_id]) fileIdToCampaigns[cf.file_id] = [];
          if (campaignIdToName[cf.campaign_id]) {
            fileIdToCampaigns[cf.file_id].push({ id: cf.campaign_id, name: campaignIdToName[cf.campaign_id] });
          }
        });
        setCampaignMap(fileIdToCampaigns);
        // Count rows in each CSV file
        const rowCountsObj: { [fileId: number]: number } = {};
        await Promise.all(filesData.map(async (file: any) => {
          try {
            const { presigned_url } = await fetchPresignedUrl(file.id);
            console.log('Presigned URL for file', file.filename, presigned_url);
            const res = await fetch(presigned_url);
            console.log('Fetch status for', file.filename, res.status);
            if (!res.ok) return;
            const text = await res.text();
            console.log('Fetched text for', file.filename, text);
            const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
            if (lines.length === 0) {
              rowCountsObj[file.id] = 0;
            } else {
              const hasHeader = lines[0].toLowerCase().includes("email");
              rowCountsObj[file.id] = hasHeader ? lines.length - 1 : lines.length;
            }
          } catch (err) {
            console.error('Error processing file', file.filename, err);
            rowCountsObj[file.id] = 0;
          }
        }));
        setRowCounts(rowCountsObj);
      } catch {
        setFiles([]);
        setCampaignMap({});
        setRowCounts({});
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadFile(file);
      // Refresh the file list
      const updatedFiles = await fetchFiles();
      setFiles(updatedFiles);
    } catch (err) {
      alert("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Subscribers
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your uploaded subscriber lists
            </p>
          </div>
          <div>
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={uploading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Import Subscribers"}
            </Button>
          </div>
        </div>

        <Card className="rounded-2xl shadow-sm border border-gray-200 bg-white">
          <CardHeader className="px-6 py-4">
            <CardTitle className="text-gray-900">Uploaded Files</CardTitle>
            <CardDescription className="text-gray-600">
              Manage your uploaded subscriber lists.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 max-h-96 overflow-auto table-scrollbar">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead className="bg-white">File Name</TableHead>
                  <TableHead className="bg-white">Date Uploaded</TableHead>
                  <TableHead className="bg-white">Campaigns Used In</TableHead>
                  <TableHead className="bg-white">Row Count</TableHead>
                  <TableHead className="bg-white">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5}>Loading...</TableCell>
                  </TableRow>
                ) : files.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>No files found.</TableCell>
                  </TableRow>
                ) : (
                  files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium text-gray-900">
                        {file.filename}
                      </TableCell>
                      <TableCell className="text-gray-600">{file.uploaded_at || "-"}</TableCell>
                      <TableCell>
                        {campaignMap[file.id] && campaignMap[file.id].length > 0 ? (
                          campaignMap[file.id].map((c, idx) => (
                            <span key={c.id}>
                              <Link href={`/responses?campaignId=${c.id}`} className="text-blue-600 underline hover:text-blue-800">{c.name}</Link>
                              {idx < campaignMap[file.id].length - 1 ? ', ' : ''}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600">{rowCounts[file.id] ?? "-"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Campaigns</DropdownMenuItem>
                            <DropdownMenuItem>Download</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
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

export default function SubscribersPage() {
  return <SubscribersPageContent />;
}
