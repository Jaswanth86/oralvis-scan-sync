import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { ScanUpload } from '@/components/ScanUpload';
import { ScanList } from '@/components/ScanList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadIcon, FileText } from 'lucide-react';

export default function Dashboard() {
  const { hasRole } = useAuth();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {hasRole('dentist') 
              ? 'Review and manage oral health scans'
              : 'Upload and track your oral health scans'
            }
          </p>
        </div>

        <Tabs defaultValue={hasRole('technician') ? 'upload' : 'scans'} className="w-full">
          <TabsList>
            {hasRole('technician') && (
              <TabsTrigger value="upload" className="flex items-center space-x-2">
                <UploadIcon className="h-4 w-4" />
                <span>Upload Scan</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="scans" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>{hasRole('dentist') ? 'All Scans' : 'My Scans'}</span>
            </TabsTrigger>
          </TabsList>
          
          {hasRole('technician') && (
            <TabsContent value="upload">
              <ScanUpload />
            </TabsContent>
          )}
          
          <TabsContent value="scans">
            <ScanList />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}